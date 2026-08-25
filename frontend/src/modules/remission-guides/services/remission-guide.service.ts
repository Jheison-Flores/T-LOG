import {
  api,
} from "@/services/api";

import type {
  CreateRemissionGuideDto,
  RemissionGuide,
} from "../types/remission-guide.types";

class RemissionGuideService {
  // ============================================================
  // LISTAR
  // ============================================================

  async getAll():
    Promise<RemissionGuide[]> {
    const response =
      await api.get<
        RemissionGuide[]
      >(
        "/remission-guides",
      );

    return response.data;
  }

  // ============================================================
  // OBTENER UNA
  // ============================================================

  async getById(
    id:
      number,
  ): Promise<RemissionGuide> {
    const response =
      await api.get<
        RemissionGuide
      >(
        `/remission-guides/${id}`,
      );

    return response.data;
  }

  // ============================================================
  // CREAR
  // ============================================================

  async create(
    data:
      CreateRemissionGuideDto,
  ): Promise<RemissionGuide> {
    const response =
      await api.post<
        RemissionGuide
      >(
        "/remission-guides",
        data,
      );

    return response.data;
  }

  // ============================================================
  // DESCARGAR PDF
  // ============================================================

  async downloadPdf(
    guide:
      RemissionGuide,
  ): Promise<void> {
    const response =
      await api.get(
        `/remission-guides/${guide.id}/export/pdf`,
        {
          responseType:
            "blob",
        },
      );

    this.downloadFile(
      response.data,
      `GR-${guide.fullNumber}.pdf`,
    );
  }

  // ============================================================
  // DESCARGAR EXCEL
  // ============================================================

  async downloadExcel(
    guide:
      RemissionGuide,
  ): Promise<void> {
    const response =
      await api.get(
        `/remission-guides/${guide.id}/export/excel`,
        {
          responseType:
            "blob",
        },
      );

    this.downloadFile(
      response.data,
      `GR-${guide.fullNumber}.xlsx`,
    );
  }

  // ============================================================
  // DESCARGAR ARCHIVO
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

export const remissionGuideService =
  new RemissionGuideService();