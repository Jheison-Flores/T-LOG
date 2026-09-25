import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  positionService,
} from "../services/position.service";

import type {
  CreatePositionDto,
  UpdatePositionDto,
} from "../types/position.types";

export function usePositions() {
  return useQuery({
    queryKey: [
      "positions",
    ],

    queryFn: () =>
      positionService.getAll(),

    staleTime:
      30_000,
  });
}

export function useCreatePosition() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data:
        CreatePositionDto,
    ) =>
      positionService.create(
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "positions",
          ],
        });
      },
  });
}

export function useUpdatePosition() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;

      data:
        UpdatePositionDto;
    }) =>
      positionService.update(
        id,
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "positions",
          ],
        });
      },
  });
}

export function useActivatePosition() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      positionService.activate(
        id,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "positions",
          ],
        });
      },
  });
}

export function useDeactivatePosition() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      positionService.deactivate(
        id,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "positions",
          ],
        });
      },
  });
}