import {
  useQuery,
} from "@tanstack/react-query";

import {
  inventoryService,
} from "../services/inventory.service";

import type {
  InventorySearchParams,
} from "../types/inventory.types";

export function useInventory(
  params?: InventorySearchParams,
) {
  return useQuery({
    queryKey: [
      "inventory",
      params,
    ],

    queryFn: () =>
      inventoryService.getAll(
        params,
      ),
  });
}