import {
  api,
} from "@/services/api";

import type {
  HrConsolidationParams,
  HrMonthlyConsolidation,
} from "../types/hr-consolidation.types";

class HrConsolidationService {
  async getMonthly(
    params:
      HrConsolidationParams,
  ): Promise<HrMonthlyConsolidation> {
    const response =
      await api.get<HrMonthlyConsolidation>(
        "/hr-consolidation/monthly",
        {
          params: {
            year:
              params.year,

            month:
              params.month,

            warehouseId:
              params.warehouseId,

            companyId:
              params.companyId,
          },
        },
      );

    return response.data;
  }
}

export const hrConsolidationService =
  new HrConsolidationService();