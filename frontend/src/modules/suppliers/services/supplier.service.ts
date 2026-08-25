import { api } from "@/services/api";

import type {
  CreateSupplierDto,
  Supplier,
  UpdateSupplierDto,
} from "../types/supplier.types";

class SupplierService {
  // ============================================================
  // LISTAR
  // ============================================================

  async getAll(): Promise<Supplier[]> {
    const response =
      await api.get<Supplier[]>(
        "/suppliers",
      );

    return response.data;
  }

  // ============================================================
  // OBTENER UNO
  // ============================================================

  async getById(
    id: number,
  ): Promise<Supplier> {
    const response =
      await api.get<Supplier>(
        `/suppliers/${id}`,
      );

    return response.data;
  }

  // ============================================================
  // CREAR
  // ============================================================

  async create(
    data: CreateSupplierDto,
  ): Promise<Supplier> {
    const response =
      await api.post<Supplier>(
        "/suppliers",
        data,
      );

    return response.data;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(
    id: number,
    data: UpdateSupplierDto,
  ): Promise<Supplier> {
    const response =
      await api.patch<Supplier>(
        `/suppliers/${id}`,
        data,
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
      `/suppliers/${id}`,
    );
  }
}

export const supplierService =
  new SupplierService();