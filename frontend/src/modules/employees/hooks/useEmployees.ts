import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  employeeService,
} from "../services/employee.service";

import type {
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "../types/employee.types";

export function useEmployees() {
  return useQuery({
    queryKey: [
      "employees",
    ],

    queryFn: () =>
      employeeService.getAll(),

    staleTime:
      30_000,
  });
}

export function useCreateEmployee() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data:
        CreateEmployeeDto,
    ) =>
      employeeService.create(
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "employees",
          ],
        });
      },
  });
}

export function useUpdateEmployee() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;

      data:
        UpdateEmployeeDto;
    }) =>
      employeeService.update(
        id,
        data,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "employees",
          ],
        });
      },
  });
}

export function useActivateEmployee() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      employeeService.activate(
        id,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "employees",
          ],
        });
      },
  });
}

export function useDeactivateEmployee() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) =>
      employeeService.deactivate(
        id,
      ),

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "employees",
          ],
        });
      },
  });
}