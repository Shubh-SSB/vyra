import { create } from "zustand";

interface AuthState {
    accessToken: string | null;
    isAuthenticated: boolean;
    isInitializing: boolean;

    setAccessToken: (token: string | null) => void;
    setAuthenticated: (value: boolean) => void;
    setInitializing: (value: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    isAuthenticated: false,
    isInitializing: true,

    setAccessToken: (token) =>
        set({
            accessToken: token,
        }),

    setAuthenticated: (value) =>
        set({
            isAuthenticated: value,
        }),

    setInitializing: (value) =>
        set({
            isInitializing: value,
        }),

    logout: () =>
        set({
            accessToken: null,
            isAuthenticated: false,
            isInitializing: false,
        }),
}));