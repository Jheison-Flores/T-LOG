import {
  api,
} from "@/services/api";

import type { SettingsWarehouse } from "../types/setttings.types";
class SettingsWarehousesService {
  async getAll():
    Promise<SettingsWarehouse[]> {

    const response =
      await api.get<SettingsWarehouse[]>(
        "/warehouses",
      );

    return response.data;
  }
}

export const settingsWarehousesService =
  new SettingsWarehousesService();