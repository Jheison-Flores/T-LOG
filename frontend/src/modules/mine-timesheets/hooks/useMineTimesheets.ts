import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  mineTimesheetService,
} from "../services/mine-timesheet.service";

import type {
  BulkUpsertMineTimesheetDto,
  CreateMineTimesheetDto,
  MineTimesheetMonthParams,
  UpdateMineTimesheetDto,
} from "../types/mine-timesheet.types";

export function useMineTimesheetMonth(
  params:
    MineTimesheetMonthParams,

  enabled = true,
) {
  return useQuery({
    queryKey: [
      "mine-timesheets",
      "month",
      params.year,
      params.month,
      params.warehouseId,
    ],

    queryFn: () =>
      mineTimesheetService.getByMonth(
        params,
      ),

    enabled:
      enabled &&
      Boolean(
        params.year &&
          params.month &&
          params.warehouseId,
      ),

    staleTime:
      15_000,
  });
}

export function useMineTimesheetsByEmployee(
  employeeId?: number,
) {
  return useQuery({
    queryKey: [
      "mine-timesheets",
      "employee",
      employeeId,
    ],

    queryFn: () =>
      mineTimesheetService.getByEmployee(
        employeeId!,
      ),

    enabled:
      Boolean(
        employeeId,
      ),

    staleTime:
      30_000,
  });
}

export function useCreateMineTimesheet() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data:
        CreateMineTimesheetDto,
    ) =>
      mineTimesheetService.create(
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "mine-timesheets",
          ],
        });
      },
  });
}

export function useUpdateMineTimesheet() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;

      data:
        UpdateMineTimesheetDto;
    }) =>
      mineTimesheetService.update(
        id,
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "mine-timesheets",
          ],
        });
      },
  });
}

export function useBulkUpsertMineTimesheets() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data:
        BulkUpsertMineTimesheetDto,
    ) =>
      mineTimesheetService.bulkUpsert(
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "mine-timesheets",
          ],
        });
      },
  });
}

export function useDeleteMineTimesheet() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      mineTimesheetService.remove(
        id,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "mine-timesheets",
          ],
        });
      },
  });
}