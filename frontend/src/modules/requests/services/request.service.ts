import {
  api,
} from "@/services/api";

import type {
  ApproveRequestDto,
  CreateRequestDto,
  RejectRequestDto,
  Request,
} from "../types/request.types";

class RequestService {
  // ============================================================
  // LISTAR
  // ============================================================

  async getAll():
    Promise<Request[]> {
    const response =
      await api.get<Request[]>(
        "/requests",
      );

    return response.data;
  }

  // ============================================================
  // OBTENER UNO
  // ============================================================

  async getById(
    id: number,
  ): Promise<Request> {
    const response =
      await api.get<Request>(
        `/requests/${id}`,
      );

    return response.data;
  }

  // ============================================================
  // CREAR
  // ============================================================

  async create(
    data:
      CreateRequestDto,
  ): Promise<Request> {
    const response =
      await api.post<Request>(
        "/requests",
        data,
      );

    return response.data;
  }

  // ============================================================
  // APROBAR
  // ============================================================

  async approve(
    id: number,

    data:
      ApproveRequestDto,
  ): Promise<Request> {
    const response =
      await api.patch<Request>(
        `/requests/${id}/approve`,
        data,
      );

    return response.data;
  }

  // ============================================================
  // RECHAZAR
  // ============================================================

  async reject(
    id: number,

    data:
      RejectRequestDto,
  ): Promise<Request> {
    const response =
      await api.patch<Request>(
        `/requests/${id}/reject`,
        data,
      );

    return response.data;
  }

  // ============================================================
  // PDF
  // ============================================================

  async downloadPdf(
    request:
      Request,
  ): Promise<void> {
    const response =
      await api.get(
        `/requests/${request.id}/export/pdf`,
        {
          responseType:
            "blob",
        },
      );

    this.downloadFile(
      response.data,
      `${request.requestNumber}.pdf`,
    );
  }

  // ============================================================
  // EXCEL
  // ============================================================

  async downloadExcel(
    request:
      Request,
  ): Promise<void> {
    const response =
      await api.get(
        `/requests/${request.id}/export/excel`,
        {
          responseType:
            "blob",
        },
      );

    this.downloadFile(
      response.data,
      `${request.requestNumber}.xlsx`,
    );
  }

  // ============================================================
  // DESCARGAR
  // ============================================================

  private downloadFile(
    blob:
      BlobPart,

    filename:
      string,
  ) {
    const blobFile =
      new Blob([
        blob,
      ]);

    const url =
      window.URL.createObjectURL(
        blobFile,
      );

    const link =
      document.createElement(
        "a",
      );

    link.href =
      url;

    link.download =
      filename;

    document.body.appendChild(
      link,
    );

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
      url,
    );
  }
}

export const requestService =
  new RequestService();