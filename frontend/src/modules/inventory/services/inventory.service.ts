import { api } from "@/services/api";

import type {
  Inventory,
  InventorySearchParams,
} from "../types/inventory.types";

class InventoryService {
  async getAll(
    params?: InventorySearchParams,
  ): Promise<Inventory[]> {
    const response = await api.get<Inventory[]>(
      "/inventory",
      {
        params,
      },
    );

    return response.data;
  }

  async getOne(
    id: number,
  ): Promise<Inventory> {
    const response = await api.get<Inventory>(
      `/inventory/${id}`,
    );

    return response.data;
  }

  async downloadExcel(params: InventorySearchParams): Promise<void> {
    const response = await api.get<Blob>('/inventory/export', {
      params,
      responseType: 'blob',
    });
    const url = URL.createObjectURL(new Blob([response.data]));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'INVENTARIO.xlsx';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }
}

export const inventoryService =
  new InventoryService();
