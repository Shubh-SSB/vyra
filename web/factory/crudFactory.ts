/** @format */

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { BASE_URL } from "@/constants/constant";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/token";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: unknown;
}

interface RequestOptions {
  ajaxOptions?: AxiosRequestConfig;
  /** Set to false to suppress all notifications for this call */
  notify?: boolean;
  /** AbortSignal for cancellable requests (e.g. React Query cleanup) */
  signal?: AbortSignal;
}

interface SendOptions extends RequestOptions {
  method: string;
  url: string;
  data?: unknown;
}

// ─── Refresh token queue ──────────────────────────────────────────────────────
// When multiple requests get 401 at the same time, only one refresh call is
// made. All others wait in the queue and get the new token when it resolves.

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function onRefreshDone(newToken: string) {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
}

// ─── CrudFactory ──────────────────────────────────────────────────────────────

export class CrudFactory {
  readonly BASE_URL: string = BASE_URL;

  private buildUrl(base: string, path: string): string {
    // Avoid double slashes if base already ends with /
    return base.endsWith("/") ? `${base}${path}` : `${base}/${path}`;
  }

  private notify(message: string, type: "success" | "error"): void {
    // Swap console.log for your toast library (sonner, notistack, etc.) here
    if (!message) return;
    console[type === "error" ? "error" : "log"](`[${type.toUpperCase()}] ${message}`);
  }

  // ─── Public HTTP methods ──────────────────────────────────────────────────

  async get<T = unknown>(
    url: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    return this.send<T>({ method: "GET", url: this.buildUrl(this.BASE_URL, url), ...options });
  }

  async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    return this.send<T>({ method: "POST", url: this.buildUrl(this.BASE_URL, url), data, ...options });
  }

  async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    return this.send<T>({ method: "PUT", url: this.buildUrl(this.BASE_URL, url), data, ...options });
  }

  async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    return this.send<T>({ method: "PATCH", url: this.buildUrl(this.BASE_URL, url), data, ...options });
  }

  async delete<T = unknown>(
    url: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    return this.send<T>({ method: "DELETE", url: this.buildUrl(this.BASE_URL, url), ...options });
  }

  // ─── Core send ────────────────────────────────────────────────────────────

  async send<T = unknown>(
    sendOptions: SendOptions,
    _isRetry = false,
  ): Promise<ApiResponse<T>> {
    const { url, data, method, notify = true, signal, ajaxOptions } = sendOptions;

    const token = getAccessToken();

    const config: AxiosRequestConfig = {
      ...ajaxOptions,
      method,
      url,
      data,
      signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
        ...ajaxOptions?.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // Let all status codes through — we handle them ourselves
      validateStatus: () => true,
    };

    let response: AxiosResponse<ApiResponse<T>>;

    try {
      response = await axios(config);
    } catch (networkError) {
      // Network failure or request aborted
      if (notify) this.notify("Network error. Please check your connection.", "error");
      throw networkError;
    }

    const { status } = response;

    // ── 401: attempt token refresh, then retry once ───────────────────────
    if (status === 401) {
      if (_isRetry) {
        // Refresh itself returned 401 — session is truly dead
        clearTokens();
        if (notify) this.notify("Session expired. Please log in again.", "error");
        if (typeof window !== "undefined") window.location.href = "/login";
        throw response.data;
      }

      try {
        await this.refreshAccessToken();
        return this.send<T>(sendOptions, true);
      } catch {
        clearTokens();
        if (typeof window !== "undefined") window.location.href = "/login";
        throw response.data;
      }
    }

    // ── 2xx Success ───────────────────────────────────────────────────────
    if (status === 200 || status === 201) {
      const res = response.data;

      // Backend returned 2xx but flagged success: false (edge case)
      if (!res.success) {
        if (notify) this.notify(res.message || "Request failed.", "error");
        throw res;
      }

      if (method !== "GET" && notify) {
        this.notify(res.message, "success");
      }

      return res;
    }

    // ── 4xx Client errors ─────────────────────────────────────────────────
    if (status === 400 || status === 403 || status === 404 || status === 422) {
      const res = response.data;
      if (notify) this.notify(res?.message || `Error ${status}.`, "error");
      throw res;
    }

    // ── 5xx Server errors ─────────────────────────────────────────────────
    if (status >= 500) {
      if (notify) this.notify("Something went wrong on the server.", "error");
      throw response.data;
    }

    // ── Unhandled status ──────────────────────────────────────────────────
    throw new Error(`Unhandled response status: ${status}`);
  }

  // ─── Refresh with concurrent-request queue ────────────────────────────────

  private async refreshAccessToken(): Promise<string> {
    if (isRefreshing) {
      // Another request is already refreshing — join the queue
      return new Promise<string>((resolve) => {
        refreshQueue.push(resolve);
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
        this.buildUrl(this.BASE_URL, "auth/refresh-token"),
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          validateStatus: () => true,
        },
      );

      if (!response.data?.success) throw new Error("Token refresh failed");

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      setTokens(accessToken, newRefreshToken);
      onRefreshDone(accessToken);

      return accessToken;
    } finally {
      isRefreshing = false;
    }
  }
}

export const $crud = new CrudFactory();
