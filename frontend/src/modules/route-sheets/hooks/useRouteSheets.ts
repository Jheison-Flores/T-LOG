import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  routeSheetService,
} from "../services/route-sheet.service";

import type {
  CreateRouteSheetDto,
  RouteSheet,
} from "../types/route-sheet.types";

const ROUTE_SHEETS_KEY = [
  "route-sheets",
];

// ============================================================
// LISTAR
// ============================================================

export function useRouteSheets() {
  return useQuery({
    queryKey:
      ROUTE_SHEETS_KEY,

    queryFn: () =>
      routeSheetService.getAll(),
  });
}

// ============================================================
// OBTENER
// ============================================================

export function useRouteSheet(
  id:
    number,
) {
  return useQuery({
    queryKey: [
      ...ROUTE_SHEETS_KEY,
      id,
    ],

    queryFn: () =>
      routeSheetService.getById(
        id,
      ),

    enabled:
      Boolean(id),
  });
}

// ============================================================
// CREAR
// ============================================================

export function useCreateRouteSheet() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data:
        CreateRouteSheetDto,
    ) =>
      routeSheetService.create(
        data,
      ),

    onSuccess: (
      routeSheet,
    ) => {
      queryClient.invalidateQueries({
        queryKey:
          ROUTE_SHEETS_KEY,
      });

      queryClient.setQueryData(
        [
          ...ROUTE_SHEETS_KEY,
          routeSheet.id,
        ],
        routeSheet,
      );

      queryClient.invalidateQueries({
        queryKey: [
          "requests",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "remission-guides",
        ],
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
// PDF
// ============================================================

export function useDownloadRouteSheetPdf() {
  return useMutation({
    mutationFn: (
      routeSheet:
        RouteSheet,
    ) =>
      routeSheetService.downloadPdf(
        routeSheet,
      ),
  });
}

// ============================================================
// EXCEL
// ============================================================

export function useDownloadRouteSheetExcel() {
  return useMutation({
    mutationFn: (
      routeSheet:
        RouteSheet,
    ) =>
      routeSheetService.downloadExcel(
        routeSheet,
      ),
  });
}