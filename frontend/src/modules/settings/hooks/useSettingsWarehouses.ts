import {
  useQuery,
} from "@tanstack/react-query";

import {
  settingsWarehousesService,
} from "../services/settings-warehouses.service";

export function useSettingsWarehouses() {
  return useQuery({
    queryKey: [
      "settings",
      "warehouses",
    ],

    queryFn: () =>
      settingsWarehousesService.getAll(),
  });
}