import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  purchaseService,
} from "../services/purchase.service";

import type {
  CreatePurchaseDto,
  Purchase,
  ReceivePurchaseDto,
  UpdatePurchaseDto,
} from "../types/purchase.types";

const PURCHASES_KEY = [
  "purchases",
];

const WAREHOUSES_KEY = [
  "warehouses",
];

// ============================================================
// LISTAR ÓRDENES DE COMPRA
// ============================================================

export function usePurchases() {
  return useQuery({
    queryKey:
      PURCHASES_KEY,

    queryFn: () =>
      purchaseService.getAll(),
  });
}

// ============================================================
// OBTENER UNA ORDEN
// ============================================================

export function usePurchase(
  id: number,
) {
  return useQuery({
    queryKey: [
      ...PURCHASES_KEY,
      id,
    ],

    queryFn: () =>
      purchaseService.getById(
        id,
      ),

    enabled:
      Boolean(
        id,
      ),
  });
}

// ============================================================
// CREAR ORDEN
// ============================================================

export function useCreatePurchase() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data:
        CreatePurchaseDto,
    ) =>
      purchaseService.create(
        data,
      ),

    onSuccess: (
      createdPurchase,
    ) => {
      // ========================================================
      // LISTADO
      // ========================================================

      queryClient.invalidateQueries({
        queryKey:
          PURCHASES_KEY,
      });

      // ========================================================
      // DETALLE
      // ========================================================

      queryClient.setQueryData(
        [
          ...PURCHASES_KEY,
          createdPurchase.id,
        ],
        createdPurchase,
      );

      // ========================================================
      // DASHBOARD
      // ========================================================

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
        ],
      });
    },
  });
}

// ============================================================
// ACTUALIZAR ORDEN
// ============================================================

export function useUpdatePurchase() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;

      data:
        UpdatePurchaseDto;
    }) =>
      purchaseService.update(
        id,
        data,
      ),

    onSuccess: (
      updatedPurchase,
    ) => {
      // ========================================================
      // LISTADO
      // ========================================================

      queryClient.invalidateQueries({
        queryKey:
          PURCHASES_KEY,
      });

      // ========================================================
      // DETALLE
      // ========================================================

      queryClient.setQueryData(
        [
          ...PURCHASES_KEY,
          updatedPurchase.id,
        ],
        updatedPurchase,
      );

      // ========================================================
      // DASHBOARD
      // ========================================================

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
        ],
      });
    },
  });
}

// ============================================================
// RECIBIR ORDEN DE COMPRA
// ============================================================

export function useReceivePurchase() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;

      data:
        ReceivePurchaseDto;
    }) =>
      purchaseService.receive(
        id,
        data,
      ),

    onSuccess: (
      updatedPurchase,
    ) => {
      // ========================================================
      // COMPRAS
      // ========================================================

      queryClient.invalidateQueries({
        queryKey:
          PURCHASES_KEY,
      });

      queryClient.setQueryData(
        [
          ...PURCHASES_KEY,
          updatedPurchase.id,
        ],
        updatedPurchase,
      );

      // ========================================================
      // INVENTARIO
      //
      // La recepción genera ENTRY.
      // ========================================================

      queryClient.invalidateQueries({
        queryKey: [
          "inventory",
        ],
      });

      // ========================================================
      // MOVIMIENTOS
      // ========================================================

      queryClient.invalidateQueries({
        queryKey: [
          "stock-movements",
        ],
      });

      // ========================================================
      // DASHBOARD
      // ========================================================

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
        ],
      });
    },
  });
}

// ============================================================
// ELIMINAR ORDEN
// ============================================================

export function useDeletePurchase() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      purchaseService.remove(
        id,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          PURCHASES_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
        ],
      });
    },
  });
}

// ============================================================
// ALMACENES
// ============================================================

export function usePurchaseWarehouses() {
  return useQuery({
    queryKey:
      WAREHOUSES_KEY,

    queryFn: () =>
      purchaseService.getWarehouses(),
  });
}

// ============================================================
// DESCARGAR PDF
// ============================================================

export function useDownloadPurchasePdf() {
  return useMutation({
    mutationFn: (
      purchase:
        Purchase,
    ) =>
      purchaseService.downloadPdf(
        purchase,
      ),
  });
}

// ============================================================
// DESCARGAR EXCEL
// ============================================================

export function useDownloadPurchaseExcel() {
  return useMutation({
    mutationFn: (
      purchase:
        Purchase,
    ) =>
      purchaseService.downloadExcel(
        purchase,
      ),
  });
}