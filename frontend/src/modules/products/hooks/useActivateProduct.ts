import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { productService } from "../services/product.service";

export function useActivateProduct() {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: (id: number) =>
      productService.activate(id),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

    },

  });

}