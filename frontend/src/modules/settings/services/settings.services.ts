import {
  api,
} from "@/services/api";

import type { SystemSettings, UpdateSettingsDto } from "../types/setttings.types";

class SettingsService {
  // ============================================================
  // OBTENER
  // ============================================================

  async getSettings():
    Promise<SystemSettings> {

    const response =
      await api.get<SystemSettings>(
        "/settings",
      );

    return response.data;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async updateSettings(
    data:
      UpdateSettingsDto,
  ): Promise<SystemSettings> {

    const response =
      await api.patch<SystemSettings>(
        "/settings",
        data,
      );

    return response.data;
  }
}

export const settingsService =
  new SettingsService();