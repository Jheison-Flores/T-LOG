import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  attendanceService,
} from "../services/attendance.service";

import type {
  AttendanceMonthParams,
  BulkUpsertAttendanceDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from "../types/attendance.types";

export function useAttendanceMonth(
  params:
    AttendanceMonthParams,
  enabled = true,
) {
  return useQuery({
    queryKey: [
      "attendance",
      "month",
      params.year,
      params.month,
      params.warehouseId,
    ],

    queryFn: () =>
      attendanceService.getByMonth(
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

export function useCreateAttendance() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data:
        CreateAttendanceDto,
    ) =>
      attendanceService.create(
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "attendance",
          ],
        });
      },
  });
}

export function useUpdateAttendance() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;

      data:
        UpdateAttendanceDto;
    }) =>
      attendanceService.update(
        id,
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "attendance",
          ],
        });
      },
  });
}

export function useBulkUpsertAttendance() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data:
        BulkUpsertAttendanceDto,
    ) =>
      attendanceService.bulkUpsert(
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "attendance",
          ],
        });
      },
  });
}

export function useDeleteAttendance() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      attendanceService.remove(
        id,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "attendance",
          ],
        });
      },
  });
}

export function useExportAttendanceToCsv() {
  return useMutation({
    mutationFn: (
      params: {
        year?: number;
        month?: number;
        warehouseId?: number;
      },
    ) =>
      attendanceService.exportToCsv(
        params.year,
        params.month,
        params.warehouseId,
      ),
  });
}