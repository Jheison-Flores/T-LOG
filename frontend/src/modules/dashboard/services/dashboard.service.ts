import { api } from "@/services/api";

import type {
  DashboardResponse,
} from "../types/dashboard.types";

class DashboardService {
  async getDashboard(): Promise<DashboardResponse> {
    const response =
      await api.get<DashboardResponse>(
        "/dashboard",
      );

    return response.data;
  }
}

export const dashboardService =
  new DashboardService();