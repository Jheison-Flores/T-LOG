import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  userService,
} from "../services/user.service";

import type {
  ChangePasswordDto,
  CreateUserDto,
  UpdateProfileDto,
  UpdateUserDto,
} from "../types/user.types";

const USERS_KEY = [
  "users",
];

// ============================================================
// LISTAR
// ============================================================

export function useUsers() {
  return useQuery({
    queryKey:
      USERS_KEY,

    queryFn: () =>
      userService.getAll(),
  });
}

// ============================================================
// CREAR
// ============================================================

export function useCreateUser() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateUserDto,
    ) =>
      userService.create(
        data,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          USERS_KEY,
      });
    },
  });
}

// ============================================================
// ACTUALIZAR
// ============================================================

export function useUpdateUser() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateUserDto;
    }) =>
      userService.update(
        id,
        data,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          USERS_KEY,
      });
    },
  });
}

// ============================================================
// CAMBIAR MI CONTRASEÑA
// ============================================================

export function useChangeOwnPassword() {
  return useMutation({
    mutationFn: (
      data: ChangePasswordDto,
    ) =>
      userService.changeOwnPassword(
        data,
      ),
  });
}

// ============================================================
// ACTUALIZAR MI PERFIL
// ============================================================

export function useUpdateOwnProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => userService.updateOwnProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users", "profile"],
      });
      queryClient.invalidateQueries({
        queryKey: USERS_KEY,
      });
    },
  });
}

// ============================================================
// OBTENER MI PERFIL
// ============================================================

export function useOwnProfile() {
  return useQuery({
    queryKey: ["users", "profile"],
    queryFn: () => userService.getOwnProfile(),
  });
}

// ============================================================
// ACTIVAR
// ============================================================

export function useActivateUser() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      userService.activate(
        id,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          USERS_KEY,
      });
    },
  });
}

// ============================================================
// DESACTIVAR
// ============================================================

export function useDeactivateUser() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      userService.deactivate(
        id,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          USERS_KEY,
      });
    },
  });
}