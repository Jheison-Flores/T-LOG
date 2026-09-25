import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  employeeAssignmentService,
} from "../services/employee-assignment.service";

import type {
  CreateEmployeeAssignmentDto,
  FinishEmployeeAssignmentDto,
  UpdateEmployeeAssignmentDto,
} from "../types/employee-assignment.types";

export function useEmployeeAssignments() {
  return useQuery({
    queryKey: [
      "employee-assignments",
    ],

    queryFn: () =>
      employeeAssignmentService.getAll(),

    staleTime:
      30_000,
  });
}

export function useEmployeeAssignmentsByEmployee(
  employeeId?: number,
) {
  return useQuery({
    queryKey: [
      "employee-assignments",
      "employee",
      employeeId,
    ],

    queryFn: () =>
      employeeAssignmentService.getByEmployee(
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

export function useCreateEmployeeAssignment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data:
        CreateEmployeeAssignmentDto,
    ) =>
      employeeAssignmentService.create(
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "employee-assignments",
          ],
        });
      },
  });
}

export function useUpdateEmployeeAssignment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;

      data:
        UpdateEmployeeAssignmentDto;
    }) =>
      employeeAssignmentService.update(
        id,
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "employee-assignments",
          ],
        });
      },
  });
}

export function useFinishEmployeeAssignment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;

      data:
        FinishEmployeeAssignmentDto;
    }) =>
      employeeAssignmentService.finish(
        id,
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "employee-assignments",
          ],
        });
      },
  });
}