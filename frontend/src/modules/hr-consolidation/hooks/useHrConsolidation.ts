import {
  useQuery,
} from "@tanstack/react-query";

import {
  hrConsolidationService,
} from "../services/hr-consolidation.service";

import type {
  HrConsolidationParams,
} from "../types/hr-consolidation.types";

export function useHrConsolidation(
  params:
    HrConsolidationParams,
) {
  return useQuery({
    queryKey: [
      "hr-consolidation",
      params.year,
      params.month,
      params.warehouseId,
      params.companyId,
    ],

    queryFn: () =>
      hrConsolidationService.getMonthly(
        params,
      ),

    staleTime:
      15_000,
  });
}