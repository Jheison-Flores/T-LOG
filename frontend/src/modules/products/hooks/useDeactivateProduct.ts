import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { productService } from "../services/product.service";

export function useDeactivateProduct() {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: (id: number) =>
      productService.deactivate(id),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

    },

  });

}