import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { stockMovementService } from "../services/stock-movement.service";

import type {
  CreateBatchStockMovementDto,
  CreateStockMovementDto,
} from "../types/stock-movement.types";

// ============================================================
// OBTENER MOVIMIENTOS
// ============================================================

export function useStockMovements() {
  return useQuery({
    queryKey: ["stock-movements"],

    queryFn: () => stockMovementService.getAll(),
  });
}

// ============================================================
// OBTENER UN MOVIMIENTO
// ============================================================

export function useStockMovement(id: number) {
  return useQuery({
    queryKey: ["stock-movement", id],

    queryFn: () => stockMovementService.getOne(id),

    enabled: id > 0,
  });
}

// ============================================================
// INVALIDAR DATOS RELACIONADOS
// ============================================================

function invalidateStockData(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({
    queryKey: ["stock-movements"],
  });

  queryClient.invalidateQueries({
    queryKey: ["inventory"],
  });

  queryClient.invalidateQueries({
    queryKey: ["dashboard"],
  });
}

// ============================================================
// CREAR MOVIMIENTO INDIVIDUAL
// ============================================================

export function useCreateStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockMovementDto) =>
      stockMovementService.create(data),

    onSuccess: () => {
      invalidateStockData(queryClient);
    },
  });
}

// ============================================================
// CREAR MOVIMIENTO MÚLTIPLE
// ============================================================

export function useCreateBatchStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBatchStockMovementDto) =>
      stockMovementService.createBatch(data),

    onSuccess: () => {
      invalidateStockData(queryClient);
    },
  });
}
