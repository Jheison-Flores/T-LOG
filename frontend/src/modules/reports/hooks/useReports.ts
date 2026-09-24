import { useState } from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  reportService,
} from "../services/report.service";

import type {
  MaterialDispatchFilters,
} from "../types/report.types";

export function useMaterialDispatchReport(
  filters: MaterialDispatchFilters,
) {
  return useQuery({
    queryKey: [
      "reports",
      "material-dispatch",
      filters,
    ],

    queryFn: () =>
      reportService.getMaterialDispatch(
        filters,
      ),
  });
}

export function useMaterialDispatchFilterOptions() {
  return useQuery({
    queryKey: [
      "reports",
      "material-dispatch",
      "filters",
    ],

    queryFn: () =>
      reportService.getMaterialDispatchFilterOptions(),
  });
}

export function useDownloadMaterialDispatchExcel() {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = async (filters: MaterialDispatchFilters) => {
    try {
      setIsDownloading(true);
      await reportService.downloadMaterialDispatchExcel(filters);
    } catch (error) {
      console.error("Error al descargar reporte de valorización en Excel:", error);
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    download,
    isDownloading,
  };
}
