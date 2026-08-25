import {
  useState,
} from "react";

import {
  BarChart3,
  RefreshCw,
} from "lucide-react";

import {
  ReportFilters,
} from "../components/ReportFilters";

import {
  ReportSummaryCards,
} from "../components/ReportSummaryCards";

import {
  WarehouseCostChart,
} from "../components/WarehouseCostChart";

import {
  TrendChart,
} from "../components/TrendChart";

import {
  CategoryRanking,
} from "../components/CategoryRanking";

import {
  ProductRanking,
} from "../components/ProductRanking";

import {
  ReportGuidesTable,
} from "../components/ReportGuidesTable";

import {
  useMaterialDispatchFilterOptions,
  useMaterialDispatchReport,
} from "../hooks/useReports";

import type {
  MaterialDispatchFilters,
} from "../types/report.types";

const DEFAULT_FILTERS: MaterialDispatchFilters = {
  groupBy: "month",
};

export function ReportsPage() {
  const [
    filters,
    setFilters,
  ] = useState<MaterialDispatchFilters>(
    DEFAULT_FILTERS,
  );

  const {
    data: options = {
      warehouses: [],
      categories: [],
      products: [],
    },
    isLoading: filtersLoading,
    isError: filtersError,
  } = useMaterialDispatchFilterOptions();

  const {
    data: report,
    isLoading: reportLoading,
    isFetching,
    isError: reportError,
    refetch,
  } = useMaterialDispatchReport(filters);

  const loading =
    filtersLoading ||
    reportLoading;

  const hasError =
    filtersError ||
    reportError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <BarChart3 size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reportes Gerenciales
            </h1>
            <p className="mt-1 text-gray-500">
              Valorización de materiales enviados mediante Guías de Remisión.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isFetching}
          onClick={() => refetch()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1B1B1B] px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={isFetching ? "animate-spin" : ""}
          />
          Actualizar
        </button>
      </div>

      <ReportFilters
        filters={filters}
        options={options}
        disabled={filtersLoading}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            ...DEFAULT_FILTERS,
          })
        }
      />

      {hasError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-700">
            No se pudo cargar el reporte.
          </p>
          <p className="mt-1 text-sm text-red-600">
            Verifica la conexión con el backend y vuelve a intentarlo.
          </p>
        </div>
      )}

      {loading && !report ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-white"
            />
          ))}
        </div>
      ) : (
        report && (
          <>
            <ReportSummaryCards
              summary={report.summary}
            />

            {report.summary.unpricedItemCount > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="font-semibold text-amber-800">
                  Existen materiales sin costo histórico.
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  El valor total mostrado solo incluye líneas valorizadas.{" "}
                  {report.summary.unpricedItemCount} línea(s) no tienen costo registrado.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
              <WarehouseCostChart
                data={report.byWarehouse}
              />
              <TrendChart
                data={report.trend}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[0.85fr_1.15fr]">
              <CategoryRanking
                data={report.byCategory}
              />
              <ProductRanking
                data={report.byProduct}
              />
            </div>

            <ReportGuidesTable
              data={report.guides}
            />
          </>
        )
      )}
    </div>
  );
}