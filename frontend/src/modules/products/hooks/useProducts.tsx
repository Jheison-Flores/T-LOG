import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { productService } from "../services/product.service";

import type {
  CreateProductDto,
  UpdateProductDto,
} from "../types/product.types";

/**
 * Obtener productos
 */
export function useProducts() {

  return useQuery({
    queryKey: ["products"],

    queryFn: () =>
      productService.getAll(),
  });

}


/**
 * Crear producto
 */
export function useCreateProduct() {

  const queryClient =
    useQueryClient();

  return useMutation({

    mutationFn: (
      data: CreateProductDto
    ) =>
      productService.create(data),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

    },

  });

}


/**
 * Actualizar producto
 */
export function useUpdateProduct() {

  const queryClient =
    useQueryClient();

  return useMutation({

    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateProductDto;
    }) =>
      productService.update(
        id,
        data
      ),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

    },

  });

}


/**
 * Activar producto
 */
export function useActivateProduct() {

  const queryClient =
    useQueryClient();

  return useMutation({

    mutationFn: (
      id: number
    ) =>
      productService.activate(id),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

    },

  });

}


/**
 * Desactivar producto
 */
export function useDeactivateProduct() {

  const queryClient =
    useQueryClient();

  return useMutation({

    mutationFn: (
      id: number
    ) =>
      productService.deactivate(id),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

    },

  });

}