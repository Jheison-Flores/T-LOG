import { api } from "@/services/api";

import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../types/category.types";

class CategoryService {
  // ============================================================
  // LISTAR
  // ============================================================

  async getAll(): Promise<Category[]> {
    const response =
      await api.get<Category[]>(
        "/categories",
      );

    return response.data;
  }

  // ============================================================
  // OBTENER UNO
  // ============================================================

  async getOne(
    id: number,
  ): Promise<Category> {
    const response =
      await api.get<Category>(
        `/categories/${id}`,
      );

    return response.data;
  }

  // ============================================================
  // CREAR
  // ============================================================

  async create(
    data: CreateCategoryDto,
  ): Promise<Category> {
    const response =
      await api.post<Category>(
        "/categories",
        data,
      );

    return response.data;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(
    id: number,
    data: UpdateCategoryDto,
  ): Promise<Category> {
    const response =
      await api.patch<Category>(
        `/categories/${id}`,
        data,
      );

    return response.data;
  }

  // ============================================================
  // ACTIVAR
  // ============================================================

  async activate(
    id: number,
  ): Promise<Category> {
    const response =
      await api.patch<Category>(
        `/categories/${id}/activate`,
      );

    return response.data;
  }

  // ============================================================
  // DESACTIVAR
  // ============================================================

  async deactivate(
    id: number,
  ): Promise<Category> {
    const response =
      await api.patch<Category>(
        `/categories/${id}/deactivate`,
      );

    return response.data;
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  async remove(
    id: number,
  ): Promise<void> {
    await api.delete(
      `/categories/${id}`,
    );
  }
}

export const categoryService =
  new CategoryService();