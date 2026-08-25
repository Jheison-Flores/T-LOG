import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { productService } from "../services/product.service";

import type {
  UpdateProductDto,
} from "../types/product.types";

interface UpdateProductParams {

  id: number;

  data: UpdateProductDto;

}

export function useUpdateProduct() {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: ({
      id,
      data,
    }: UpdateProductParams) =>

      productService.update(id, data),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

    },

  });

}