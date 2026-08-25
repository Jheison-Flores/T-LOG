import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { settingsService } from "../services/settings.services";

import type { UpdateSettingsDto } from "../types/setttings.types";
// ============================================================
// OBTENER
// ============================================================

export function useSettings() {
  return useQuery({
    queryKey: [
      "settings",
    ],

    queryFn: () =>
      settingsService.getSettings(),
  });
}

// ============================================================
// ACTUALIZAR
// ============================================================

export function useUpdateSettings() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data:
        UpdateSettingsDto,
    ) =>
      settingsService.updateSettings(
        data,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "settings",
        ],
      });
    },
  });
}