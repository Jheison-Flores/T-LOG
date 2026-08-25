import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  remissionGuideService,
} from "../services/remission-guide.service";

import type {
  CreateRemissionGuideDto,
  RemissionGuide,
} from "../types/remission-guide.types";

const REMISSION_GUIDES_KEY = [
  "remission-guides",
];

// ============================================================
// LISTAR
// ============================================================

export function useRemissionGuides() {
  return useQuery({
    queryKey:
      REMISSION_GUIDES_KEY,

    queryFn: () =>
      remissionGuideService.getAll(),
  });
}

// ============================================================
// OBTENER UNA
// ============================================================

export function useRemissionGuide(
  id:
    number,
) {
  return useQuery({
    queryKey: [
      ...REMISSION_GUIDES_KEY,
      id,
    ],

    queryFn: () =>
      remissionGuideService.getById(
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

export function useCreateRemissionGuide() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data:
        CreateRemissionGuideDto,
    ) =>
      remissionGuideService.create(
        data,
      ),

    onSuccess: (
      guide,
    ) => {
      queryClient.invalidateQueries({
        queryKey:
          REMISSION_GUIDES_KEY,
      });

      queryClient.setQueryData(
        [
          ...REMISSION_GUIDES_KEY,
          guide.id,
        ],
        guide,
      );

      // ========================================================
      // ACTUALIZAR MÓDULOS RELACIONADOS
      // ========================================================

      queryClient.invalidateQueries({
        queryKey: [
          "requests",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "inventory",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "stock-movements",
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
// DESCARGAR PDF
// ============================================================

export function useDownloadRemissionGuidePdf() {
  return useMutation({
    mutationFn: (
      guide:
        RemissionGuide,
    ) =>
      remissionGuideService.downloadPdf(
        guide,
      ),
  });
}

// ============================================================
// DESCARGAR EXCEL
// ============================================================

export function useDownloadRemissionGuideExcel() {
  return useMutation({
    mutationFn: (
      guide:
        RemissionGuide,
    ) =>
      remissionGuideService.downloadExcel(
        guide,
      ),
  });
}