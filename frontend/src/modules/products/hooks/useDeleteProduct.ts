import {

useMutation,

useQueryClient,

} from "@tanstack/react-query";

import { productService } from "../services/product.service";

export function useDeleteProduct(){

const queryClient=
useQueryClient();

return useMutation({

mutationFn:productService.deactivate,

onSuccess:()=>{

queryClient.invalidateQueries({

queryKey:["products"]

});

}

});

}