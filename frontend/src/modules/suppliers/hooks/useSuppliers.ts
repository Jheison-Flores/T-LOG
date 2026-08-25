import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  supplierService,
} from "../services/supplier.service";

import type {
  CreateSupplierDto,
  UpdateSupplierDto,
} from "../types/supplier.types";

// ============================================================
// QUERY KEY
// ============================================================

export const SUPPLIERS_QUERY_KEY = [
  "suppliers",
] as const;

// ============================================================
// LISTAR
// ============================================================

export function useSuppliers() {
  return useQuery({
    queryKey:
      SUPPLIERS_QUERY_KEY,

    queryFn: () =>
      supplierService.getAll(),
  });
}

// ============================================================
// OBTENER UNO
// ============================================================

export function useSupplier(
  id: number,
) {
  return useQuery({
    queryKey: [
      ...SUPPLIERS_QUERY_KEY,
      id,
    ],

    queryFn: () =>
      supplierService.getById(
        id,
      ),

    enabled:
      Number.isFinite(id) &&
      id > 0,
  });
}

// ============================================================
// CREAR
// ============================================================

export function useCreateSupplier() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateSupplierDto,
    ) =>
      supplierService.create(
        data,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          SUPPLIERS_QUERY_KEY,
      });
    },
  });
}

// ============================================================
// ACTUALIZAR
// ============================================================

export function useUpdateSupplier() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;

      data: UpdateSupplierDto;
    }) =>
      supplierService.update(
        id,
        data,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          SUPPLIERS_QUERY_KEY,
      });
    },
  });
}

// ============================================================
// ELIMINAR
// ============================================================

export function useDeleteSupplier() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      supplierService.remove(
        id,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          SUPPLIERS_QUERY_KEY,
      });
    },
  });
}