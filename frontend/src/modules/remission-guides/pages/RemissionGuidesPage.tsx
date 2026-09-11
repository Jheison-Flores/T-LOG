import { useMemo, useState } from "react";

import { FileCheck2, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/Input";

import { useAuth } from "@/modules/auth/contexts/AuthContexts";

import { useRequests } from "@/modules/requests/hooks/useRequests";

import { useProducts } from "@/modules/products/hooks/useProducts";

import { useWarehouses } from "@/modules/warehouses/hooks/useWarehouses";

import { RemissionGuideDetailModal } from "../components/RemissionGuideDetailModal";

import { RemissionGuideModal } from "../components/RemissionGuideModal";

import { RemissionGuideStats } from "../components/RemissionGuideStats";

import { RemissionGuideTable } from "../components/RemissionGuideTable";

import {
  useCreateRemissionGuide,
  useDownloadRemissionGuideExcel,
  useDownloadRemissionGuidePdf,
  useRemissionGuides,
} from "../hooks/useRemissionGuides";

import type {
  CreateRemissionGuideDto,
  RemissionGuide,
  RemissionGuideType,
} from "../types/remission-guide.types";

export function RemissionGuidesPage() {
  // ============================================================
  // AUTH
  // ============================================================

  const { user } = useAuth();

  const roleCode = user?.role?.code;

  const isAdmin = roleCode === "ADMIN";

  const isLogistics = roleCode === "LOGISTICS";

  // ============================================================
  // NUEVA POLÍTICA
  //
  // ADMIN + cualquier LOGISTICS pueden generar guía.
  //
  // La validación real del alcance se hace en backend.
  // ============================================================

  const canCreate = isAdmin || isLogistics;

  // ============================================================
  // DATA
  // ============================================================

  const {
    data: guides = [],

    isLoading,

    isError,
  } = useRemissionGuides();

  const { data: requests = [] } = useRequests();

  const { data: products = [] } = useProducts();

  const { data: warehouses = [] } = useWarehouses();

  // ============================================================
  // MUTATIONS
  // ============================================================

  const createGuide = useCreateRemissionGuide();

  const downloadPdf = useDownloadRemissionGuidePdf();

  const downloadExcel = useDownloadRemissionGuideExcel();

  // ============================================================
  // STATE
  // ============================================================

  const [search, setSearch] = useState("");

  const [guideTypeFilter, setGuideTypeFilter] = useState<
    RemissionGuideType | ""
  >("");

  const [sourceWarehouseFilter, setSourceWarehouseFilter] = useState("");

  const [destinationWarehouseFilter, setDestinationWarehouseFilter] =
    useState("");

  const [dateFrom, setDateFrom] = useState("");

  const [dateTo, setDateTo] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [detailGuide, setDetailGuide] = useState<RemissionGuide | null>(null);

  const [actionError, setActionError] = useState("");

  const [downloadingPdfId, setDownloadingPdfId] = useState<number | null>(null);

  const [downloadingExcelId, setDownloadingExcelId] = useState<number | null>(
    null,
  );

  // ============================================================
  // FILTRADO
  // ============================================================

  const filteredGuides = useMemo(() => {
    const term = search.trim().toLowerCase();

    return guides.filter((guide) => {
      // ==================================================
      // BÚSQUEDA GENERAL
      // ==================================================

      const fullNumber = guide.fullNumber?.toLowerCase() ?? "";

      const requestNumber = guide.request?.requestNumber?.toLowerCase() ?? "";

      const source = guide.sourceWarehouse?.name?.toLowerCase() ?? "";

      const destination = guide.destinationWarehouse?.name?.toLowerCase() ?? "";

      const plate = guide.vehiclePlate?.toLowerCase() ?? "";

      const company = guide.transportCompanyName?.toLowerCase() ?? "";

      const recipient = guide.recipientName?.toLowerCase() ?? "";

      const arrival = guide.arrivalPoint?.toLowerCase() ?? "";

      const productMatch =
        guide.details?.some((detail) => {
          const name =
            detail.product?.name?.toLowerCase() ??
            detail.description?.toLowerCase() ??
            "";

          const code = detail.product?.internalCode?.toLowerCase() ?? "";

          const sku = detail.product?.sku?.toLowerCase() ?? "";

          return (
            name.includes(term) || code.includes(term) || sku.includes(term)
          );
        }) ?? false;

      const matchesSearch =
        !term ||
        fullNumber.includes(term) ||
        requestNumber.includes(term) ||
        source.includes(term) ||
        destination.includes(term) ||
        plate.includes(term) ||
        company.includes(term) ||
        recipient.includes(term) ||
        arrival.includes(term) ||
        productMatch;

      // ==================================================
      // TIPO DE GUÍA
      // ==================================================

      const matchesType =
        !guideTypeFilter || guide.guideType === guideTypeFilter;

      // ==================================================
      // ORIGEN
      // ==================================================

      const matchesSource =
        !sourceWarehouseFilter ||
        String(guide.sourceWarehouse?.id ?? "") === sourceWarehouseFilter;

      // ==================================================
      // DESTINO
      // ==================================================

      const matchesDestination =
        !destinationWarehouseFilter ||
        String(guide.destinationWarehouse?.id ?? "") ===
          destinationWarehouseFilter;

      // ==================================================
      // RANGO DE FECHAS
      //
      // Usamos transferStartDate porque representa la fecha
      // efectiva de inicio del traslado.
      // ==================================================

      const guideDate = (
        guide.transferStartDate ??
        guide.issueDate ??
        ""
      ).slice(0, 10);

      const matchesFrom = !dateFrom || (guideDate && guideDate >= dateFrom);

      const matchesTo = !dateTo || (guideDate && guideDate <= dateTo);

      return (
        matchesSearch &&
        matchesType &&
        matchesSource &&
        matchesDestination &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [
    guides,
    search,
    guideTypeFilter,
    sourceWarehouseFilter,
    destinationWarehouseFilter,
    dateFrom,
    dateTo,
  ]);

  const hasActiveFilters = Boolean(
    search.trim() ||
    guideTypeFilter ||
    sourceWarehouseFilter ||
    destinationWarehouseFilter ||
    dateFrom ||
    dateTo,
  );

  const clearFilters = () => {
    setSearch("");
    setGuideTypeFilter("");
    setSourceWarehouseFilter("");
    setDestinationWarehouseFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const getGuideTypeLabel = (type: RemissionGuideType) => {
    switch (type) {
      case "REQUEST":
        return "Por requerimiento";

      case "MANUAL_WAREHOUSE":
        return "Envío manual a mina";

      case "EXTERNAL_SERVICE":
        return "Servicio externo";

      default:
        return type;
    }
  };

  // ============================================================
  // CREAR
  // ============================================================

  const handleSubmit = async (data: CreateRemissionGuideDto) => {
    setActionError("");

    try {
      await createGuide.mutateAsync(data);

      setModalOpen(false);
    } catch (error: any) {
      console.error("Error generando Guía de Remisión:", error);

      setActionError(
        error?.response?.data?.message ??
          "No se pudo generar la Guía de Remisión.",
      );
    }
  };

  // ============================================================
  // PDF
  // ============================================================

  const handleDownloadPdf = async (guide: RemissionGuide) => {
    setActionError("");

    setDownloadingPdfId(guide.id);

    try {
      await downloadPdf.mutateAsync(guide);
    } catch (error) {
      console.error("Error descargando PDF:", error);

      setActionError("No se pudo descargar el PDF de la Guía de Remisión.");
    } finally {
      setDownloadingPdfId(null);
    }
  };

  // ============================================================
  // EXCEL
  // ============================================================

  const handleDownloadExcel = async (guide: RemissionGuide) => {
    setActionError("");

    setDownloadingExcelId(guide.id);

    try {
      await downloadExcel.mutateAsync(guide);
    } catch (error) {
      console.error("Error descargando Excel:", error);

      setActionError("No se pudo descargar el Excel de la Guía de Remisión.");
    } finally {
      setDownloadingExcelId(null);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Guías de Remisión</h1>

        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
          Cargando Guías de Remisión...
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Guías de Remisión</h1>

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
          Gestión de traslados por requerimiento, envíos manuales a mina y
          servicios externos
        </p>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <RemissionGuideStats guides={filteredGuides} />

      {/* =====================================================
          ERROR
      ===================================================== */}

      {actionError && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{actionError}</p>

          <button
            type="button"
            onClick={() => setActionError("")}
            className="text-sm font-semibold text-red-600"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {/* ===================================================
            FILA 1: BÚSQUEDA + NUEVA GUÍA
        =================================================== */}

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-[620px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <Input
              className="pl-10"
              placeholder="Buscar guía, requerimiento, mina, destinatario, placa o producto..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="
                  rounded-lg
                  border
                  border-gray-200
                  bg-white
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-gray-600
                  transition
                  hover:bg-gray-50
                "
              >
                Limpiar filtros
              </button>
            )}

            {canCreate && (
              <Button
                type="button"
                className="flex items-center gap-2"
                onClick={() => {
                  setActionError("");

                  setModalOpen(true);
                }}
              >
                <Plus size={18} />
                Nueva Guía de Remisión
              </Button>
            )}
          </div>
        </div>

        {/* ===================================================
            FILA 2: FILTROS
        =================================================== */}

        <div
          className="
            mt-4
            grid
            gap-3
            border-t
            border-gray-100
            pt-4
            sm:grid-cols-2
            xl:grid-cols-5
          "
        >
          {/* TIPO */}

          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500">
              Tipo de guía
            </span>

            <select
              value={guideTypeFilter}
              onChange={(event) =>
                setGuideTypeFilter(
                  event.target.value as RemissionGuideType | "",
                )
              }
              className="
                h-10
                w-full
                rounded-lg
                border
                border-gray-200
                bg-white
                px-3
                text-sm
                text-gray-700
                outline-none
                transition
                focus:border-orange-400
                focus:ring-2
                focus:ring-orange-100
              "
            >
              <option value="">Todos los tipos</option>

              {(
                [
                  "REQUEST",
                  "MANUAL_WAREHOUSE",
                  "EXTERNAL_SERVICE",
                ] as RemissionGuideType[]
              ).map((type) => (
                <option key={type} value={type}>
                  {getGuideTypeLabel(type)}
                </option>
              ))}
            </select>
          </label>

          {/* ORIGEN */}

          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500">Origen</span>

            <select
              value={sourceWarehouseFilter}
              onChange={(event) => setSourceWarehouseFilter(event.target.value)}
              className="
                h-10
                w-full
                rounded-lg
                border
                border-gray-200
                bg-white
                px-3
                text-sm
                text-gray-700
                outline-none
                transition
                focus:border-orange-400
                focus:ring-2
                focus:ring-orange-100
              "
            >
              <option value="">Todos los orígenes</option>

              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </label>

          {/* DESTINO */}

          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500">Destino</span>

            <select
              value={destinationWarehouseFilter}
              onChange={(event) =>
                setDestinationWarehouseFilter(event.target.value)
              }
              className="
                h-10
                w-full
                rounded-lg
                border
                border-gray-200
                bg-white
                px-3
                text-sm
                text-gray-700
                outline-none
                transition
                focus:border-orange-400
                focus:ring-2
                focus:ring-orange-100
              "
            >
              <option value="">Todos los destinos</option>

              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </label>

          {/* DESDE */}

          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500">Desde</span>

            <Input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </label>

          {/* HASTA */}

          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500">Hasta</span>

            <Input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </label>
        </div>

        {/* ===================================================
            RESULTADOS
        =================================================== */}

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Mostrando{" "}
            <span className="font-semibold text-gray-700">
              {filteredGuides.length}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-gray-700">{guides.length}</span>{" "}
            guías
          </p>

          {dateFrom && dateTo && dateFrom > dateTo && (
            <p className="text-xs font-semibold text-red-600">
              La fecha inicial no puede ser posterior a la fecha final.
            </p>
          )}
        </div>
      </div>

      {/* =====================================================
          TABLA
      ===================================================== */}

      <RemissionGuideTable
        guides={filteredGuides}
        onView={setDetailGuide}
        onDownloadPdf={handleDownloadPdf}
        onDownloadExcel={handleDownloadExcel}
        downloadingPdfId={downloadingPdfId}
        downloadingExcelId={downloadingExcelId}
      />

      {/* =====================================================
          MODAL
      ===================================================== */}

      <RemissionGuideModal
        open={modalOpen}
        requests={requests}
        products={products}
        warehouses={warehouses}
        loading={createGuide.isPending}
        onClose={() => {
          if (createGuide.isPending) {
            return;
          }

          setModalOpen(false);
        }}
        onSubmit={handleSubmit}
      />

      {/* =====================================================
          DETALLE
      ===================================================== */}

      <RemissionGuideDetailModal
        open={detailGuide !== null}
        guide={detailGuide}
        onClose={() => setDetailGuide(null)}
      />
    </div>
  );
}
