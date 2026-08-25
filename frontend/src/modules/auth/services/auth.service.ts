import { api } from "@/services/api";

import type {
  LoginDto,
  LoginResponse,
} from "../types/auth-types";

class AuthService {

  async login(
    data: LoginDto
  ): Promise<LoginResponse> {

    const response =
      await api.post<LoginResponse>(
        "/auth/login",
        data
      );

    return response.data;
  }

  logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

  }

}

export const authService =
  new AuthService();