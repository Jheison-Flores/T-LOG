import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  requestService,
} from "../services/request.service";

import type {
  ApproveRequestDto,
  CreateRequestDto,
  RejectRequestDto,
  Request,
} from "../types/request.types";

const REQUESTS_KEY = [
  "requests",
];

// ============================================================
// LISTAR
// ============================================================

export function useRequests() {
  return useQuery({
    queryKey:
      REQUESTS_KEY,

    queryFn: () =>
      requestService.getAll(),
  });
}

// ============================================================
// OBTENER UNO
// ============================================================

export function useRequest(
  id: number,
) {
  return useQuery({
    queryKey: [
      ...REQUESTS_KEY,
      id,
    ],

    queryFn: () =>
      requestService.getById(
        id,
      ),

    enabled:
      Boolean(
        id,
      ),
  });
}

// ============================================================
// CREAR
// ============================================================

export function useCreateRequest() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data:
        CreateRequestDto,
    ) =>
      requestService.create(
        data,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          REQUESTS_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
        ],
      });
    },
  });
}

// ============================================================
// APROBAR
// ============================================================

export function useApproveRequest() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;

      data:
        ApproveRequestDto;
    }) =>
      requestService.approve(
        id,
        data,
      ),

    onSuccess: (
      updatedRequest,
    ) => {
      queryClient.invalidateQueries({
        queryKey:
          REQUESTS_KEY,
      });

      queryClient.setQueryData(
        [
          ...REQUESTS_KEY,
          updatedRequest.id,
        ],
        updatedRequest,
      );

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
        ],
      });
    },
  });
}

// ============================================================
// RECHAZAR
// ============================================================

export function useRejectRequest() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;

      data:
        RejectRequestDto;
    }) =>
      requestService.reject(
        id,
        data,
      ),

    onSuccess: (
      updatedRequest,
    ) => {
      queryClient.invalidateQueries({
        queryKey:
          REQUESTS_KEY,
      });

      queryClient.setQueryData(
        [
          ...REQUESTS_KEY,
          updatedRequest.id,
        ],
        updatedRequest,
      );

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
        ],
      });
    },
  });
}

// ============================================================
// PDF
// ============================================================

export function useDownloadRequestPdf() {
  return useMutation({
    mutationFn: (
      request:
        Request,
    ) =>
      requestService.downloadPdf(
        request,
      ),
  });
}

// ============================================================
// EXCEL
// ============================================================

export function useDownloadRequestExcel() {
  return useMutation({
    mutationFn: (
      request:
        Request,
    ) =>
      requestService.downloadExcel(
        request,
      ),
  });
}