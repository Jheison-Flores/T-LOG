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

  // ============================================================
  // DESCARGAR EXCEL DE MATERIALES ENVIADOS
  // ============================================================

  async downloadMaterialDispatchExcel(
    filters: MaterialDispatchFilters = {},
  ): Promise<void> {
    const response = await api.get(
      "/reports/material-dispatch/export/excel",
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
        responseType: "blob",
      },
    );

    let filename = "Reporte_Envio_Materiales.xlsx";
    const disposition =
      response.headers?.["content-disposition"];
    if (disposition) {
      const match =
        disposition.match(
          /filename=["']?([^"']+)["']?/,
        );
      if (match && match[1]) {
        filename = match[1];
      }
    }

    this.downloadFile(
      response.data,
      filename,
    );
  }

  // ============================================================
  // DESCARGAR ARCHIVO
  // ============================================================

  private downloadFile(
    data: BlobPart,
    filename: string,
  ): void {
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url =
      window.URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(url);
  }
}

export const reportService =
  new ReportService();
