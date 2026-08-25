import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { productService } from "../services/product.service";

export function useCreateProduct() {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: productService.create.bind(productService),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

    },

  });

}