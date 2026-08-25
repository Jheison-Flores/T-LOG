import {
  useMemo,
  useState,
} from "react";

import {
  ClipboardCheck,
  Plus,
  Search,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/Button";

import {
  Input,
} from "@/components/ui/Input";

import {
  useAuth,
} from "@/modules/auth/contexts/AuthContexts";

import {
  useRemissionGuides,
} from "@/modules/remission-guides/hooks/useRemissionGuides";

import { RouteSheetDetailModal } from "../components/RouteSheetDetailModal";

import { RouteSheetModal } from "../components/RouteSheetModal";

import {
  RouteSheetStats,
} from "../components/RouteSheetStats";

import { RouteSheetTable } from "../components/RouteSheetTables";

import {
  useCreateRouteSheet,
  useDownloadRouteSheetExcel,
  useDownloadRouteSheetPdf,
  useRouteSheets,
} from "../hooks/useRouteSheets";

import type {
  CreateRouteSheetDto,
  RouteSheet,
} from "../types/route-sheet.types";

export function RouteSheetsPage() {
  const {
    user,
  } =
    useAuth();

  const roleCode =
    user?.role?.code;

  const isAdmin =
    roleCode ===
    "ADMIN";

  const isLogistics =
    roleCode ===
    "LOGISTICS";

  const warehouseType =
    String(
      user?.warehouse?.type ??
        "",
    ).toUpperCase();

  const isCentralLogistics =
    isLogistics &&
    (
      warehouseType ===
        "MAIN" ||
      warehouseType ===
        "CENTRAL"
    );

  const canCreate =
    isAdmin ||
    (
      isLogistics &&
      !isCentralLogistics
    );

  const {
    data:
      routeSheets = [],

    isLoading,

    isError,
  } =
    useRouteSheets();

  const {
    data:
      guides = [],
  } =
    useRemissionGuides();

  const createRouteSheet =
    useCreateRouteSheet();

  const downloadPdf =
    useDownloadRouteSheetPdf();

  const downloadExcel =
    useDownloadRouteSheetExcel();

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(false);

  const [
    detailRouteSheet,
    setDetailRouteSheet,
  ] =
    useState<RouteSheet | null>(
      null,
    );

  const [
    actionError,
    setActionError,
  ] =
    useState("");

  const [
    downloadingPdfId,
    setDownloadingPdfId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    downloadingExcelId,
    setDownloadingExcelId,
  ] =
    useState<number | null>(
      null,
    );

  // ============================================================
  // GUÍAS DISPONIBLES PARA REGISTRAR RECEPCIÓN
  //
  // Solo las guías que llegan a una mina/unidad pueden generar
  // Hoja de Recorrido:
  //
  // REQUEST
  // MANUAL_WAREHOUSE
  //
  // EXTERNAL_SERVICE queda excluida completamente porque:
  // - no afecta inventario;
  // - no tiene recepción en mina;
  // - no genera Hoja de Recorrido.
  //
  // También excluimos cualquier guía que, por datos históricos
  // inconsistentes, no tenga destinationWarehouse.
  // ============================================================

  const receivableGuides =
    useMemo(
      () =>
        guides.filter(
          (
            guide,
          ) =>
            (
              guide.guideType ===
                "REQUEST" ||
              guide.guideType ===
                "MANUAL_WAREHOUSE"
            ) &&
            Boolean(
              guide.destinationWarehouse,
            ),
        ),
      [
        guides,
      ],
    );

  // ============================================================
  // FILTRAR
  // ============================================================

  const filteredRouteSheets =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        if (!term) {
          return routeSheets;
        }

        return routeSheets.filter(
          (
            routeSheet,
          ) => {
            const productMatch =
              routeSheet.details.some(
                (
                  detail,
                ) =>
                  (
                    detail.product?.name ??
                    ""
                  )
                    .toLowerCase()
                    .includes(
                      term,
                    ),
              );

            const routeSheetNumber =
              routeSheet.routeSheetNumber
                ?.toLowerCase() ??
              "";

            const guideNumber =
              routeSheet.remissionGuide
                ?.fullNumber
                ?.toLowerCase() ??
              "";

            const requestNumber =
              routeSheet.request
                ?.requestNumber
                ?.toLowerCase() ??
              "";

            const warehouseName =
              routeSheet.warehouse
                ?.name
                ?.toLowerCase() ??
              "";

            const responsibleName =
              routeSheet.responsibleName
                ?.toLowerCase() ??
              "";

            return (
              routeSheetNumber.includes(
                term,
              ) ||
              guideNumber.includes(
                term,
              ) ||
              requestNumber.includes(
                term,
              ) ||
              warehouseName.includes(
                term,
              ) ||
              responsibleName.includes(
                term,
              ) ||
              productMatch
            );
          },
        );
      },
      [
        routeSheets,
        search,
      ],
    );

  // ============================================================
  // CREAR
  // ============================================================

  const handleCreate =
    async (
      data:
        CreateRouteSheetDto,
    ) => {
      setActionError("");

      try {
        await createRouteSheet.mutateAsync(
          data,
        );

        setCreateOpen(false);
      } catch (
        error:
          any
      ) {
        console.error(
          "Error registrando Hoja de Recorrido:",
          error,
        );

        setActionError(
          error?.response?.data?.message ??
            "No se pudo registrar la Hoja de Recorrido.",
        );
      }
    };

  // ============================================================
  // PDF
  // ============================================================

  const handleDownloadPdf =
    async (
      routeSheet:
        RouteSheet,
    ) => {
      setActionError("");

      setDownloadingPdfId(
        routeSheet.id,
      );

      try {
        await downloadPdf.mutateAsync(
          routeSheet,
        );
      } catch (
        error
      ) {
        console.error(
          "Error descargando PDF:",
          error,
        );

        setActionError(
          "No se pudo descargar el PDF de la Hoja de Recorrido.",
        );
      } finally {
        setDownloadingPdfId(
          null,
        );
      }
    };

  // ============================================================
  // EXCEL
  // ============================================================

  const handleDownloadExcel =
    async (
      routeSheet:
        RouteSheet,
    ) => {
      setActionError("");

      setDownloadingExcelId(
        routeSheet.id,
      );

      try {
        await downloadExcel.mutateAsync(
          routeSheet,
        );
      } catch (
        error
      ) {
        console.error(
          "Error descargando Excel:",
          error,
        );

        setActionError(
          "No se pudo descargar el Excel de la Hoja de Recorrido.",
        );
      } finally {
        setDownloadingExcelId(
          null,
        );
      }
    };

  if (
    isLoading
  ) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Hojas de Recorrido
        </h1>

        <div className="rounded-xl border bg-white p-12 text-center text-gray-500">
          Cargando hojas de recorrido...
        </div>
      </div>
    );
  }

  if (
    isError
  ) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Hojas de Recorrido
        </h1>

        <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-red-600">
          No se pudieron cargar las Hojas de Recorrido.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <ClipboardCheck
            className="text-orange-500"
          />

          Hojas de Recorrido
        </h1>

        <p className="mt-1 text-gray-500">
          Confirmación de recepción y conformidad de materiales enviados a las unidades mineras
        </p>
      </div>

      {/* STATS */}

      <RouteSheetStats
        routeSheets={
          routeSheets
        }
      />

      {/* ERROR */}

      {actionError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            {
              actionError
            }
          </p>

          <button
            type="button"
            onClick={() =>
              setActionError("")
            }
            className="text-sm font-semibold text-red-600"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* TOOLBAR */}

      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-[480px]">
          <Search
            size={
              18
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <Input
            className="pl-10"
            value={
              search
            }
            placeholder="Buscar hoja, guía, requerimiento, unidad o responsable..."
            onChange={(
              event,
            ) =>
              setSearch(
                event.target.value,
              )
            }
          />
        </div>

        {canCreate && (
          <Button
            type="button"
            className="flex items-center gap-2"
            onClick={() => {
              setActionError("");

              setCreateOpen(true);
            }}
          >
            <Plus
              size={
                18
              }
            />

            Registrar recepción
          </Button>
        )}
      </div>

      {/* TABLA */}

      <RouteSheetTable
        routeSheets={
          filteredRouteSheets
        }

        onView={
          setDetailRouteSheet
        }

        onDownloadPdf={
          handleDownloadPdf
        }

        onDownloadExcel={
          handleDownloadExcel
        }

        downloadingPdfId={
          downloadingPdfId
        }

        downloadingExcelId={
          downloadingExcelId
        }
      />

      {/* CREAR */}

      <RouteSheetModal
        open={
          createOpen
        }

        guides={
          receivableGuides
        }

        routeSheets={
          routeSheets
        }

        loading={
          createRouteSheet.isPending
        }

        onClose={() => {
          if (
            createRouteSheet.isPending
          ) {
            return;
          }

          setCreateOpen(false);
        }}

        onSubmit={
          handleCreate
        }
      />

      {/* DETALLE */}

      <RouteSheetDetailModal
        open={
          detailRouteSheet !==
          null
        }

        routeSheet={
          detailRouteSheet
        }

        onClose={() =>
          setDetailRouteSheet(
            null,
          )
        }
      />
    </div>
  );
}