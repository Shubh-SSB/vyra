import { $crud } from "@/factory/crudFactory";
import { getRefreshToken, setTokens } from "@/lib/token";
import { LoginPayload, LoginResponse, RegisterPayload } from "@/types/auth";

class AuthService {
  async login(data: LoginPayload) {
    const response = await $crud.post<LoginResponse>("auth/login", data);
    const { accessToken, refreshToken } = response.data;
    setTokens(accessToken, refreshToken);
    return response;
  }

  async register(data: RegisterPayload) {
    return $crud.post("auth/register", data);
  }

  async me() {
    return $crud.get("auth/me");
  }

  async logout() {
    const refreshToken = getRefreshToken();
    return $crud.post("auth/logout", { refreshToken });
  }

  async logoutAll() {
    return $crud.post("auth/logout-all");
  }
}

export const authService = new AuthService();
