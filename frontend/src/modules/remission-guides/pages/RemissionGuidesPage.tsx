import {
  useMemo,
  useState,
} from "react";

import {
  FileCheck2,
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
  useRequests,
} from "@/modules/requests/hooks/useRequests";

import {
  useProducts,
} from "@/modules/products/hooks/useProducts";

import {
  useWarehouses,
} from "@/modules/warehouses/hooks/useWarehouses";

import {
  RemissionGuideDetailModal,
} from "../components/RemissionGuideDetailModal";

import {
  RemissionGuideModal,
} from "../components/RemissionGuideModal";

import {
  RemissionGuideStats,
} from "../components/RemissionGuideStats";

import {
  RemissionGuideTable,
} from "../components/RemissionGuideTable";

import {
  useCreateRemissionGuide,
  useDownloadRemissionGuideExcel,
  useDownloadRemissionGuidePdf,
  useRemissionGuides,
} from "../hooks/useRemissionGuides";

import type {
  CreateRemissionGuideDto,
  RemissionGuide,
} from "../types/remission-guide.types";

export function RemissionGuidesPage() {
  // ============================================================
  // AUTH
  // ============================================================

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

  // ============================================================
  // NUEVA POLÍTICA
  //
  // ADMIN + cualquier LOGISTICS pueden generar guía.
  //
  // La validación real del alcance se hace en backend.
  // ============================================================

  const canCreate =
    isAdmin ||
    isLogistics;

  // ============================================================
  // DATA
  // ============================================================

  const {
    data:
      guides = [],

    isLoading,

    isError,
  } =
    useRemissionGuides();

  const {
    data:
      requests = [],
  } =
    useRequests();

  const {
    data:
      products = [],
  } =
    useProducts();

  const {
    data:
      warehouses = [],
  } =
    useWarehouses();

  // ============================================================
  // MUTATIONS
  // ============================================================

  const createGuide =
    useCreateRemissionGuide();

  const downloadPdf =
    useDownloadRemissionGuidePdf();

  const downloadExcel =
    useDownloadRemissionGuideExcel();

  // ============================================================
  // STATE
  // ============================================================

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);

  const [
    detailGuide,
    setDetailGuide,
  ] =
    useState<RemissionGuide | null>(
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
  // FILTRADO
  // ============================================================

  const filteredGuides =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        if (!term) {
          return guides;
        }

        return guides.filter(
          (
            guide,
          ) => {
            const fullNumber =
              guide.fullNumber
                ?.toLowerCase() ??
              "";

            const requestNumber =
              guide.request?.requestNumber
                ?.toLowerCase() ??
              "";

            const source =
              guide.sourceWarehouse?.name
                ?.toLowerCase() ??
              "";

            const destination =
              guide.destinationWarehouse?.name
                ?.toLowerCase() ??
              "";

            const plate =
              guide.vehiclePlate
                ?.toLowerCase() ??
              "";

            const company =
              guide.transportCompanyName
                ?.toLowerCase() ??
              "";

            const recipient =
              guide.recipientName
                ?.toLowerCase() ??
              "";

            const arrival =
              guide.arrivalPoint
                ?.toLowerCase() ??
              "";

            const productMatch =
              guide.details?.some(
                (
                  detail,
                ) => {
                  const name =
                    detail.product?.name
                      ?.toLowerCase() ??
                    detail.description
                      ?.toLowerCase() ??
                    "";

                  const code =
                    detail.product?.internalCode
                      ?.toLowerCase() ??
                    "";

                  const sku =
                    detail.product?.sku
                      ?.toLowerCase() ??
                    "";

                  return (
                    name.includes(
                      term,
                    ) ||
                    code.includes(
                      term,
                    ) ||
                    sku.includes(
                      term,
                    )
                  );
                },
              ) ??
              false;

            return (
              fullNumber.includes(
                term,
              ) ||
              requestNumber.includes(
                term,
              ) ||
              source.includes(
                term,
              ) ||
              destination.includes(
                term,
              ) ||
              plate.includes(
                term,
              ) ||
              company.includes(
                term,
              ) ||
              recipient.includes(
                term,
              ) ||
              arrival.includes(
                term,
              ) ||
              productMatch
            );
          },
        );
      },
      [
        guides,
        search,
      ],
    );

  // ============================================================
  // CREAR
  // ============================================================

  const handleSubmit =
    async (
      data:
        CreateRemissionGuideDto,
    ) => {
      setActionError("");

      try {
        await createGuide.mutateAsync(
          data,
        );

        setModalOpen(
          false,
        );
      } catch (
        error:
          any
      ) {
        console.error(
          "Error generando Guía de Remisión:",
          error,
        );

        setActionError(
          error?.response?.data?.message ??
            "No se pudo generar la Guía de Remisión.",
        );
      }
    };

  // ============================================================
  // PDF
  // ============================================================

  const handleDownloadPdf =
    async (
      guide:
        RemissionGuide,
    ) => {
      setActionError("");

      setDownloadingPdfId(
        guide.id,
      );

      try {
        await downloadPdf.mutateAsync(
          guide,
        );
      } catch (
        error
      ) {
        console.error(
          "Error descargando PDF:",
          error,
        );

        setActionError(
          "No se pudo descargar el PDF de la Guía de Remisión.",
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
      guide:
        RemissionGuide,
    ) => {
      setActionError("");

      setDownloadingExcelId(
        guide.id,
      );

      try {
        await downloadExcel.mutateAsync(
          guide,
        );
      } catch (
        error
      ) {
        console.error(
          "Error descargando Excel:",
          error,
        );

        setActionError(
          "No se pudo descargar el Excel de la Guía de Remisión.",
        );
      } finally {
        setDownloadingExcelId(
          null,
        );
      }
    };

  // ============================================================
  // LOADING
  // ============================================================

  if (
    isLoading
  ) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Guías de Remisión
        </h1>

        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
          Cargando Guías de Remisión...
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (
    isError
  ) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Guías de Remisión
        </h1>

        <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-red-600">
          No se pudieron cargar las Guías de Remisión.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <FileCheck2 className="text-orange-500" />

          Guías de Remisión
        </h1>

        <p className="mt-1 text-gray-500">
          Gestión de traslados por requerimiento, envíos manuales a mina y servicios externos
        </p>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <RemissionGuideStats
        guides={
          guides
        }
      />

      {/* =====================================================
          ERROR
      ===================================================== */}

      {actionError && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
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

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-[500px]">
          <Search
            size={
              18
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <Input
            className="pl-10"
            placeholder="Buscar guía, requerimiento, mina, destinatario, placa o producto..."
            value={
              search
            }
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

              setModalOpen(
                true,
              );
            }}
          >
            <Plus
              size={
                18
              }
            />

            Nueva Guía de Remisión
          </Button>
        )}
      </div>

      {/* =====================================================
          TABLA
      ===================================================== */}

      <RemissionGuideTable
        guides={
          filteredGuides
        }

        onView={
          setDetailGuide
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

      {/* =====================================================
          MODAL
      ===================================================== */}

      <RemissionGuideModal
        open={
          modalOpen
        }

        requests={
          requests
        }

        products={
          products
        }

        warehouses={
          warehouses
        }

        loading={
          createGuide.isPending
        }

        onClose={() => {
          if (
            createGuide.isPending
          ) {
            return;
          }

          setModalOpen(
            false,
          );
        }}

        onSubmit={
          handleSubmit
        }
      />

      {/* =====================================================
          DETALLE
      ===================================================== */}

      <RemissionGuideDetailModal
        open={
          detailGuide !==
          null
        }

        guide={
          detailGuide
        }

        onClose={() =>
          setDetailGuide(
            null,
          )
        }
      />
    </div>
  );
}