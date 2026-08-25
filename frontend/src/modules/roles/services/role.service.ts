import { api } from "@/services/api";

import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
} from "../types/role.types";

class RoleService {

  // ============================================================
  // LISTAR
  // ============================================================

  async getAll(): Promise<Role[]> {
    const response =
      await api.get<Role[]>(
        "/roles",
      );

    return response.data;
  }

  // ============================================================
  // OBTENER UNO
  // ============================================================

  async getOne(
    id: number,
  ): Promise<Role> {
    const response =
      await api.get<Role>(
        `/roles/${id}`,
      );

    return response.data;
  }

  // ============================================================
  // CREAR
  //
  // Se conserva porque el backend lo soporta,
  // aunque actualmente ADMIN y LOGISTICS
  // ya deberían estar creados.
  // ============================================================

  async create(
    data: CreateRoleDto,
  ): Promise<Role> {
    const response =
      await api.post<Role>(
        "/roles",
        data,
      );

    return response.data;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(
    id: number,
    data: UpdateRoleDto,
  ): Promise<Role> {
    const response =
      await api.patch<Role>(
        `/roles/${id}`,
        data,
      );

    return response.data;
  }

  // ============================================================
  // DESACTIVAR
  // ============================================================

  async disable(
    id: number,
  ): Promise<Role> {
    const response =
      await api.patch<Role>(
        `/roles/${id}/disable`,
      );

    return response.data;
  }

  // ============================================================
  // ACTIVAR
  // ============================================================

  async enable(
    id: number,
  ): Promise<Role> {
    const response =
      await api.patch<Role>(
        `/roles/${id}/enable`,
      );

    return response.data;
  }
}

export const roleService =
  new RoleService();