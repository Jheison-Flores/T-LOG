import { api } from "@/services/api";

import type {
  Warehouse,
} from "../types/warehouse.types";

class WarehouseService {

  // ============================================================
  // OBTENER TODOS LOS ALMACENES
  // ============================================================

  async getAll(): Promise<Warehouse[]> {

    const response =
      await api.get<Warehouse[]>(
        "/warehouses",
      );

    return response.data;
  }

  // ============================================================
  // OBTENER UN ALMACÉN
  // ============================================================

  async getOne(
    id: number,
  ): Promise<Warehouse> {

    const response =
      await api.get<Warehouse>(
        `/warehouses/${id}`,
      );

    return response.data;
  }
}

export const warehouseService =
  new WarehouseService();