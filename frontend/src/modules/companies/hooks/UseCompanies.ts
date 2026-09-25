import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  companyService,
} from "../services/company.service";

import type {
  CreateCompanyDto,
  UpdateCompanyDto,
} from "../types/company.types";

// ============================================================
// LISTAR
// ============================================================

export function useCompanies() {
  return useQuery({
    queryKey: [
      "companies",
    ],

    queryFn: () =>
      companyService.getAll(),

    staleTime:
      30_000,
  });
}

// ============================================================
// CREAR
// ============================================================

export function useCreateCompany() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data:
        CreateCompanyDto,
    ) =>
      companyService.create(
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "companies",
          ],
        });
      },
  });
}

// ============================================================
// ACTUALIZAR
// ============================================================

export function useUpdateCompany() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;

      data:
        UpdateCompanyDto;
    }) =>
      companyService.update(
        id,
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "companies",
          ],
        });
      },
  });
}

// ============================================================
// ACTIVAR
// ============================================================

export function useActivateCompany() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      companyService.activate(
        id,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "companies",
          ],
        });
      },
  });
}

// ============================================================
// DESACTIVAR
// ============================================================

export function useDeactivateCompany() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      companyService.deactivate(
        id,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "companies",
          ],
        });
      },
  });
}