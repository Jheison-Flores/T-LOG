import { useQuery } from "@tanstack/react-query";

import { reportService } from "../services/report.service";

import type {
  MaterialDispatchFilters,
} from "../types/report.types";

const REPORTS_KEY = ["reports"];

export function useMaterialDispatchReport(
  filters: MaterialDispatchFilters,
) {
  return useQuery({
    queryKey: [
      ...REPORTS_KEY,
      "material-dispatch",
      filters,
    ],
    queryFn: () =>
      reportService.getMaterialDispatch(filters),
  });
}

export function useMaterialDispatchFilterOptions() {
  return useQuery({
    queryKey: [
      ...REPORTS_KEY,
      "material-dispatch",
      "filters",
    ],
    queryFn: () =>
      reportService.getMaterialDispatchFilterOptions(),
  });
}