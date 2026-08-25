import {
  api,
} from "@/services/api";

import type {
  CreateRouteSheetDto,
  RouteSheet,
} from "../types/route-sheet.types";

class RouteSheetService {
  // ============================================================
  // LISTAR
  // ============================================================

  async getAll():
    Promise<RouteSheet[]> {
    const response =
      await api.get<
        RouteSheet[]
      >(
        "/route-sheets",
      );

    return response.data;
  }

  // ============================================================
  // OBTENER
  // ============================================================

  async getById(
    id:
      number,
  ): Promise<RouteSheet> {
    const response =
      await api.get<
        RouteSheet
      >(
        `/route-sheets/${id}`,
      );

    return response.data;
  }

  // ============================================================
  // CREAR
  // ============================================================

  async create(
    data:
      CreateRouteSheetDto,
  ): Promise<RouteSheet> {
    const response =
      await api.post<
        RouteSheet
      >(
        "/route-sheets",
        data,
      );

    return response.data;
  }

  // ============================================================
  // PDF
  // ============================================================

  async downloadPdf(
    routeSheet:
      RouteSheet,
  ): Promise<void> {
    const response =
      await api.get(
        `/route-sheets/${routeSheet.id}/export/pdf`,
        {
          responseType:
            "blob",
        },
      );

    this.downloadFile(
      response.data,
      `${routeSheet.routeSheetNumber}.pdf`,
    );
  }

  // ============================================================
  // EXCEL
  // ============================================================

  async downloadExcel(
    routeSheet:
      RouteSheet,
  ): Promise<void> {
    const response =
      await api.get(
        `/route-sheets/${routeSheet.id}/export/excel`,
        {
          responseType:
            "blob",
        },
      );

    this.downloadFile(
      response.data,
      `${routeSheet.routeSheetNumber}.xlsx`,
    );
  }

  // ============================================================
  // DESCARGA
  // ============================================================

  private downloadFile(
    data:
      BlobPart,

    filename:
      string,
  ): void {
    const blob =
      new Blob([
        data,
      ]);

    const url =
      window.URL.createObjectURL(
        blob,
      );

    const anchor =
      document.createElement(
        "a",
      );

    anchor.href =
      url;

    anchor.download =
      filename;

    document.body.appendChild(
      anchor,
    );

    anchor.click();

    anchor.remove();

    window.URL.revokeObjectURL(
      url,
    );
  }
}

export const routeSheetService =
  new RouteSheetService();