import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  categoryService,
} from "../services/category.service";

import type {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../types/category.types";

const CATEGORY_KEY = [
  "categories",
];

// ============================================================
// LISTAR
// ============================================================

export function useCategories() {
  return useQuery({
    queryKey:
      CATEGORY_KEY,

    queryFn: () =>
      categoryService.getAll(),
  });
}

// ============================================================
// CREAR
// ============================================================

export function useCreateCategory() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateCategoryDto,
    ) =>
      categoryService.create(
        data,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          CATEGORY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey:
          ["products"],
      });
    },
  });
}

// ============================================================
// ACTUALIZAR
// ============================================================

export function useUpdateCategory() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCategoryDto;
    }) =>
      categoryService.update(
        id,
        data,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          CATEGORY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey:
          ["products"],
      });
    },
  });
}

// ============================================================
// ACTIVAR
// ============================================================

export function useActivateCategory() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      categoryService.activate(
        id,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          CATEGORY_KEY,
      });
    },
  });
}

// ============================================================
// DESACTIVAR
// ============================================================

export function useDeactivateCategory() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      categoryService.deactivate(
        id,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          CATEGORY_KEY,
      });
    },
  });
}

// ============================================================
// ELIMINAR
// ============================================================

export function useDeleteCategory() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      categoryService.remove(
        id,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          CATEGORY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey:
          ["products"],
      });
    },
  });
}