import {
  api,
} from "@/services/api";

import type {
  CreatePurchaseDto,
  Purchase,
  PurchaseWarehouse,
  ReceivePurchaseDto,
  UpdatePurchaseDto,
} from "../types/purchase.types";

class PurchaseService {
  async getAll():
    Promise<Purchase[]> {
    const response =
      await api.get<Purchase[]>(
        "/purchases",
      );

    return response.data;
  }

  async getById(
    id:
      number,
  ): Promise<Purchase> {
    const response =
      await api.get<Purchase>(
        `/purchases/${id}`,
      );

    return response.data;
  }

  async create(
    data:
      CreatePurchaseDto,
  ): Promise<Purchase> {
    const response =
      await api.post<Purchase>(
        "/purchases",
        data,
      );

    return response.data;
  }

  async update(
    id:
      number,

    data:
      UpdatePurchaseDto,
  ): Promise<Purchase> {
    const response =
      await api.patch<Purchase>(
        `/purchases/${id}`,
        data,
      );

    return response.data;
  }

  async receive(
    id:
      number,

    data:
      ReceivePurchaseDto,
  ): Promise<Purchase> {
    const response =
      await api.post<Purchase>(
        `/purchases/${id}/receive`,
        data,
      );

    return response.data;
  }

  async remove(
    id:
      number,
  ): Promise<void> {
    await api.delete(
      `/purchases/${id}`,
    );
  }

  // ============================================================
  // PDF
  // ============================================================

  async downloadPdf(
    purchase:
      Purchase,
  ): Promise<void> {
    const response =
      await api.get(
        `/purchases/${purchase.id}/export/pdf`,
        {
          responseType:
            "blob",
        },
      );

    this.downloadFile(
      response.data,
      `OC-${purchase.purchaseOrderNumber}.pdf`,
    );
  }

  // ============================================================
  // EXCEL
  // ============================================================

  async downloadExcel(
    purchase:
      Purchase,
  ): Promise<void> {
    const response =
      await api.get(
        `/purchases/${purchase.id}/export/excel`,
        {
          responseType:
            "blob",
        },
      );

    this.downloadFile(
      response.data,
      `OC-${purchase.purchaseOrderNumber}.xlsx`,
    );
  }

  // ============================================================
  // DESCARGAR
  // ============================================================

  private downloadFile(
    data:
      BlobPart,

    filename:
      string,
  ) {
    const blob =
      new Blob([
        data,
      ]);

    const url =
      window.URL.createObjectURL(
        blob,
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

  async getWarehouses():
    Promise<
      PurchaseWarehouse[]
    > {
    const response =
      await api.get<
        PurchaseWarehouse[]
      >(
        "/warehouses",
      );

    return response.data;
  }
}

export const purchaseService =
  new PurchaseService();