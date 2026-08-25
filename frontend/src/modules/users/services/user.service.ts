import {
  api,
} from "@/services/api";

import type {
  CreateUserDto,
  UpdateUserDto,
  User,
} from "../types/user.types";

class UserService {
  // ============================================================
  // LISTAR
  // ============================================================

  async getAll():
    Promise<User[]> {

    const response =
      await api.get<User[]>(
        "/users",
      );

    return response.data;
  }

  // ============================================================
  // OBTENER UNO
  // ============================================================

  async getOne(
    id: number,
  ): Promise<User> {

    const response =
      await api.get<User>(
        `/users/${id}`,
      );

    return response.data;
  }

  // ============================================================
  // CREAR
  // ============================================================

  async create(
    data: CreateUserDto,
  ): Promise<User> {

    const response =
      await api.post<User>(
        "/users",
        data,
      );

    return response.data;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(
    id: number,
    data: UpdateUserDto,
  ): Promise<User> {

    const response =
      await api.patch<User>(
        `/users/${id}`,
        data,
      );

    return response.data;
  }

  // ============================================================
  // ACTIVAR
  // ============================================================

  async activate(
    id: number,
  ): Promise<User> {

    const response =
      await api.patch<User>(
        `/users/${id}/activate`,
      );

    return response.data;
  }

  // ============================================================
  // DESACTIVAR
  // ============================================================

  async deactivate(
    id: number,
  ): Promise<User> {

    const response =
      await api.patch<User>(
        `/users/${id}/deactivate`,
      );

    return response.data;
  }
}

export const userService =
  new UserService();