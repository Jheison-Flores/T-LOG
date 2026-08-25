import { api } from "@/services/api";

import type {
  CreateBatchStockMovementDto,
  CreateStockMovementDto,
  StockMovement,
} from "../types/stock-movement.types";

class StockMovementService {
  // ============================================================
  // OBTENER TODOS LOS MOVIMIENTOS
  // ============================================================

  async getAll(): Promise<StockMovement[]> {
    const response =
      await api.get<StockMovement[]>(
        "/stock-movements",
      );

    return response.data;
  }

  // ============================================================
  // OBTENER UN MOVIMIENTO
  // ============================================================

  async getOne(
    id: number,
  ): Promise<StockMovement> {
    const response =
      await api.get<StockMovement>(
        `/stock-movements/${id}`,
      );

    return response.data;
  }

  // ============================================================
  // REGISTRAR MOVIMIENTO INDIVIDUAL
  //
  // Se conserva para compatibilidad con cualquier pantalla o
  // proceso que todavía necesite registrar un único producto.
  // ============================================================

  async create(
    data: CreateStockMovementDto,
  ): Promise<StockMovement> {
    const response =
      await api.post<StockMovement>(
        "/stock-movements",
        data,
      );

    return response.data;
  }

  // ============================================================
  // REGISTRAR MOVIMIENTO MÚLTIPLE
  // ============================================================

  async createBatch(
    data: CreateBatchStockMovementDto,
  ): Promise<StockMovement[]> {
    const response =
      await api.post<StockMovement[]>(
        "/stock-movements/batch",
        data,
      );

    return response.data;
  }
}

export const stockMovementService =
  new StockMovementService();