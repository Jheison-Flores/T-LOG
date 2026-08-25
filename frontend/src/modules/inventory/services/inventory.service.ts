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
}

export const inventoryService =
  new InventoryService();