import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  roleService,
} from "../services/role.service";

import type {
  UpdateRoleDto,
} from "../types/role.types";

// ============================================================
// LISTAR
// ============================================================

export function useRoles() {
  return useQuery({
    queryKey: [
      "roles",
    ],

    queryFn: () =>
      roleService.getAll(),
  });
}

// ============================================================
// ACTUALIZAR
// ============================================================

export function useUpdateRole() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateRoleDto;
    }) =>
      roleService.update(
        id,
        data,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "roles",
        ],
      });
    },
  });
}

// ============================================================
// ACTIVAR
// ============================================================

export function useEnableRole() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      roleService.enable(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "roles",
        ],
      });
    },
  });
}

// ============================================================
// DESACTIVAR
// ============================================================

export function useDisableRole() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      roleService.disable(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "roles",
        ],
      });
    },
  });
}