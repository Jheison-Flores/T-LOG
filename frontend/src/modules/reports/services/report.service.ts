import { api } from "@/services/api";

import type {
  MaterialDispatchFilterOptions,
  MaterialDispatchFilters,
  MaterialDispatchReport,
} from "../types/report.types";

class ReportService {
  async getMaterialDispatch(
    filters: MaterialDispatchFilters = {},
  ): Promise<MaterialDispatchReport> {
    const response =
      await api.get<MaterialDispatchReport>(
        "/reports/material-dispatch",
        {
          params: {
            from:
              filters.from ||
              undefined,

            to:
              filters.to ||
              undefined,

            warehouseId:
              filters.warehouseId ||
              undefined,

            categoryId:
              filters.categoryId ||
              undefined,

            productId:
              filters.productId ||
              undefined,

            groupBy:
              filters.groupBy ||
              "month",
          },
        },
      );

    return response.data;
  }

  async getMaterialDispatchFilterOptions(): Promise<MaterialDispatchFilterOptions> {
    const response =
      await api.get<MaterialDispatchFilterOptions>(
        "/reports/material-dispatch/filters",
      );

    return response.data;
  }
}

export const reportService =
  new ReportService();
