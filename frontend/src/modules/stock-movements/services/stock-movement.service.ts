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

  async downloadPdf(movement: StockMovement): Promise<void> {
    const response = await api.get(
      `/stock-movements/${movement.id}/export/pdf`,
      { responseType: "blob" },
    );

    const code = movement.voucherPrefix
      ? `${movement.voucherPrefix}${movement.voucherSeries ? `-${movement.voucherSeries}` : ""}-${String(movement.voucherNumber ?? "").padStart(6, "0")}`
      : `MOV-${movement.id}`;
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${code}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }

  async downloadVouchers(
    fromDate: string,
    toDate: string,
    warehouseId: number | undefined,
    movementType: string | undefined,
    format: "pdf" | "xlsx",
  ): Promise<void> {
    const params = new URLSearchParams({ from: fromDate, to: toDate });
    if (warehouseId) params.set("warehouseId", String(warehouseId));
    if (movementType) params.set("movementType", movementType);
    params.set("format", format);
    const response = await api.get(
      `/stock-movements/export/vouchers?${params.toString()}`,
      { responseType: "blob" },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `VALES-${fromDate}-a-${toDate}${warehouseId ? `-ALMACEN-${warehouseId}` : ""}${movementType ? `-${movementType}` : ""}.${format}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }
}

export const stockMovementService =
  new StockMovementService();
