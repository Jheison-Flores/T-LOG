import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Coins,
  FileSpreadsheet,
  PackageSearch,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  useDownloadMaterialDispatchExcel,
  useMaterialDispatchFilterOptions,
  useMaterialDispatchReport,
} from "../hooks/useReports";

import type {
  CostCurrency,
  MaterialDispatchFilters,
  MaterialReportItem,
} from "../types/report.types";

// ============================================================
// COLORES PARA CATEGORÍAS
// ============================================================

const CATEGORY_COLORS = [
  "#f97316",
  "#3b82f6",
  "#22c55e",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#eab308",
  "#6366f1",
];

// ============================================================
// FORMATO MONETARIO
// ============================================================

function formatMoney(
  value: number | null | undefined,
  currency: CostCurrency | null,
) {
  if (
    value === null ||
    value === undefined ||
    currency === null
  ) {
    return "Sin precio";
  }

  const formatted =
    new Intl.NumberFormat("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value));

  return currency === "USD"
    ? `US$ ${formatted}`
    : `S/ ${formatted}`;
}

// ============================================================
// FORMATO CANTIDAD
// ============================================================

function formatQuantity(
  value: number,
) {
  return new Intl.NumberFormat(
    "es-PE",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(Number(value));
}

// ============================================================
// KPI MONETARIO
// ============================================================

interface TotalCardProps {
  title: string;
  value: number;
  currency: CostCurrency;
}

function TotalCard({
  title,
  value,
  currency,
}: TotalCardProps) {
  const isPen =
    currency === "PEN";

  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-3xl
        border
        p-6
        shadow-sm
        ${
          isPen
            ? `
              border-orange-100
              bg-gradient-to-br
              from-orange-50
              via-orange-50
              to-orange-100
            `
            : `
              border-blue-100
              bg-gradient-to-br
              from-blue-50
              via-blue-50
              to-blue-100
            `
        }
      `}
    >
      <div
        className={`
          absolute
          -bottom-12
          -right-12
          h-44
          w-44
          rounded-full
          opacity-40
          ${
            isPen
              ? "bg-orange-200"
              : "bg-blue-200"
          }
        `}
      />

      <div
        className="
          relative
          z-10
          flex
          items-center
          gap-5
        "
      >
        <div
          className={`
            flex
            h-16
            w-16
            shrink-0
            items-center
            justify-center
            rounded-2xl
            shadow-sm
            ${
              isPen
                ? `
                  bg-gradient-to-br
                  from-orange-400
                  to-orange-600
                  text-white
                `
                : `
                  bg-gradient-to-br
                  from-blue-400
                  to-blue-600
                  text-white
                `
            }
          `}
        >
          {isPen ? (
            <Coins size={30} />
          ) : (
            <CircleDollarSign size={31} />
          )}
        </div>

        <div>
          <p
            className={`
              text-sm
              font-bold
              ${
                isPen
                  ? "text-orange-800"
                  : "text-blue-800"
              }
            `}
          >
            {title}
          </p>

          <p
            className={`
              mt-1
              text-3xl
              font-extrabold
              tracking-tight
              md:text-4xl
              ${
                isPen
                  ? "text-orange-700"
                  : "text-blue-700"
              }
            `}
          >
            {formatMoney(
              value,
              currency,
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// KPI GUÍAS
// ============================================================

function GuideCountCard({
  value,
}: {
  value: number;
}) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-violet-100
        bg-gradient-to-br
        from-violet-50
        via-purple-50
        to-fuchsia-50
        p-6
        shadow-sm
      "
    >
      <div
        className="
          absolute
          -bottom-12
          -right-12
          h-44
          w-44
          rounded-full
          bg-violet-200
          opacity-40
        "
      />

      <div
        className="
          relative
          z-10
          flex
          items-center
          gap-5
        "
      >
        <div
          className="
            flex
            h-16
            w-16
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-violet-500
            to-purple-700
            text-white
            shadow-sm
          "
        >
          <ClipboardList
            size={30}
          />
        </div>

        <div>
          <p
            className="
              text-sm
              font-bold
              text-violet-800
            "
          >
            Total de Guías
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-extrabold
              tracking-tight
              text-violet-700
              md:text-4xl
            "
          >
            {value.toLocaleString(
              "es-PE",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================

export function ReportsPage() {
  const [
    draftFilters,
    setDraftFilters,
  ] =
    useState<MaterialDispatchFilters>({
      groupBy: "month",
    });

  const [
    appliedFilters,
    setAppliedFilters,
  ] =
    useState<MaterialDispatchFilters>({
      groupBy: "month",
    });

  const [
    chartCurrency,
    setChartCurrency,
  ] =
    useState<CostCurrency>(
      "PEN",
    );

  const {
    data:
      filterOptions,
    isLoading:
      loadingFilters,
  } =
    useMaterialDispatchFilterOptions();

  const {
    data:
      report,
    isLoading:
      loadingReport,
    isFetching,
    refetch,
    error,
  } =
    useMaterialDispatchReport(
      appliedFilters,
    );

  const materials =
    useMemo(
      () =>
        report?.materials ??
        [],
      [report],
    );

  const categories =
    useMemo(
      () =>
        report?.byCategory ??
        [],
      [report],
    );

  const chartData =
    useMemo(
      () => {
        return categories
          .map(
            (
              category,
              index,
            ) => {
              const value =
                chartCurrency ===
                "PEN"
                  ? Number(
                      category.totalPEN ??
                        0,
                    )
                  : Number(
                      category.totalUSD ??
                        0,
                    );

              return {
                ...category,
                value,
                color:
                  CATEGORY_COLORS[
                    index %
                      CATEGORY_COLORS.length
                  ],
              };
            },
          )
          .filter(
            (
              category,
            ) =>
              category.value >
              0,
          )
          .sort(
            (
              a,
              b,
            ) =>
              b.value -
              a.value,
          );
      },
      [
        categories,
        chartCurrency,
      ],
    );

  const chartTotal =
    useMemo(
      () =>
        chartData.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.value,
          0,
        ),
      [chartData],
    );

  const donutGradient =
    useMemo(
      () => {
        if (
          !chartData.length ||
          chartTotal <= 0
        ) {
          return "#e2e8f0";
        }

        let current =
          0;

        const segments =
          chartData.map(
            (
              item,
            ) => {
              const percentage =
                (item.value /
                  chartTotal) *
                100;

              const start =
                current;

              const end =
                current +
                percentage;

              current =
                end;

              return `${item.color} ${start}% ${end}%`;
            },
          );

        return `conic-gradient(${segments.join(
          ", ",
        )})`;
      },
      [
        chartData,
        chartTotal,
      ],
    );

  const updateFilter = <
    K extends keyof MaterialDispatchFilters,
  >(
    key: K,
    value:
      MaterialDispatchFilters[K],
  ) => {
    setDraftFilters(
      (
        current,
      ) => ({
        ...current,
        [key]: value,
      }),
    );
  };

  const applyFilters =
    () => {
      setAppliedFilters({
        ...draftFilters,
        groupBy:
          "month",
      });
    };

  const clearFilters =
    () => {
      const clean:
        MaterialDispatchFilters =
        {
          groupBy:
            "month",
        };

      setDraftFilters(
        clean,
      );

      setAppliedFilters(
        clean,
      );
    };

  const {
    download: downloadExcel,
    isDownloading: isDownloadingExcel,
  } = useDownloadMaterialDispatchExcel();

  const handleDownloadExcel = async () => {
    try {
      await downloadExcel(appliedFilters);
    } catch {
      alert("Ocurrió un error al descargar el reporte de valorización en Excel.");
    }
  };

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1600px]
        space-y-5
        pb-10
      "
    >
      {/* =======================================================
          TÍTULO
      ======================================================= */}

      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                h-2
                w-12
                rounded-full
                bg-orange-500
              "
            />

            <h1
              className="
                text-2xl
                font-extrabold
                tracking-tight
                text-slate-900
                md:text-3xl
              "
            >
              Reportes de
              Valorización
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={isDownloadingExcel || loadingReport}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-emerald-600
              bg-emerald-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-emerald-700
              hover:border-emerald-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
            title="Descargar reporte en formato Excel"
          >
            <FileSpreadsheet
              size={16}
              className={isDownloadingExcel ? "animate-pulse" : ""}
            />
            {isDownloadingExcel ? "Descargando..." : "Descargar Excel"}
          </button>

          <button
            type="button"
            onClick={() =>
              refetch()
            }
            disabled={
              isFetching
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition
              hover:border-orange-200
              hover:bg-orange-50
              hover:text-orange-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw
              size={16}
              className={
                isFetching
                  ? "animate-spin"
                  : ""
              }
            />

            Actualizar
          </button>
        </div>
      </div>

      {/* =======================================================
          FILTROS
      ======================================================= */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
        "
      >
        <div
          className="
            grid
            gap-3
            md:grid-cols-2
            xl:grid-cols-[1fr_1fr_1.2fr_1.2fr_1.4fr_auto]
            xl:items-end
          "
        >
          <label className="space-y-1.5">
            <span
              className="
                text-xs
                font-bold
                text-slate-600
              "
            >
              Desde
            </span>

            <div className="relative">
              <CalendarDays
                size={16}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="date"
                value={
                  draftFilters.from ??
                  ""
                }
                onChange={(
                  event,
                ) =>
                  updateFilter(
                    "from",
                    event.target
                      .value ||
                      undefined,
                  )
                }
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-9
                  pr-3
                  text-sm
                  text-slate-700
                  outline-none
                  transition
                  focus:border-orange-300
                  focus:bg-white
                  focus:ring-2
                  focus:ring-orange-100
                "
              />
            </div>
          </label>

          <label className="space-y-1.5">
            <span
              className="
                text-xs
                font-bold
                text-slate-600
              "
            >
              Hasta
            </span>

            <div className="relative">
              <CalendarDays
                size={16}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="date"
                value={
                  draftFilters.to ??
                  ""
                }
                onChange={(
                  event,
                ) =>
                  updateFilter(
                    "to",
                    event.target
                      .value ||
                      undefined,
                  )
                }
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-9
                  pr-3
                  text-sm
                  text-slate-700
                  outline-none
                  transition
                  focus:border-orange-300
                  focus:bg-white
                  focus:ring-2
                  focus:ring-orange-100
                "
              />
            </div>
          </label>

          <label className="space-y-1.5">
            <span
              className="
                text-xs
                font-bold
                text-slate-600
              "
            >
              Mina / Almacén
            </span>

            <select
              value={
                draftFilters.warehouseId ??
                ""
              }
              disabled={
                loadingFilters
              }
              onChange={(
                event,
              ) =>
                updateFilter(
                  "warehouseId",
                  event.target
                    .value
                    ? Number(
                        event
                          .target
                          .value,
                      )
                    : undefined,
                )
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                text-slate-700
                outline-none
                transition
                focus:border-orange-300
                focus:bg-white
                focus:ring-2
                focus:ring-orange-100
              "
            >
              <option value="">
                Todas
              </option>

              {filterOptions?.warehouses.map(
                (
                  item,
                ) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {item.name}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="space-y-1.5">
            <span
              className="
                text-xs
                font-bold
                text-slate-600
              "
            >
              Categoría
            </span>

            <select
              value={
                draftFilters.categoryId ??
                ""
              }
              disabled={
                loadingFilters
              }
              onChange={(
                event,
              ) =>
                updateFilter(
                  "categoryId",
                  event.target
                    .value
                    ? Number(
                        event
                          .target
                          .value,
                      )
                    : undefined,
                )
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                text-slate-700
                outline-none
                transition
                focus:border-orange-300
                focus:bg-white
                focus:ring-2
                focus:ring-orange-100
              "
            >
              <option value="">
                Todas
              </option>

              {filterOptions?.categories.map(
                (
                  item,
                ) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {item.name}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="space-y-1.5">
            <span
              className="
                text-xs
                font-bold
                text-slate-600
              "
            >
              Material
            </span>

            <select
              value={
                draftFilters.productId ??
                ""
              }
              disabled={
                loadingFilters
              }
              onChange={(
                event,
              ) =>
                updateFilter(
                  "productId",
                  event.target
                    .value
                    ? Number(
                        event
                          .target
                          .value,
                      )
                    : undefined,
                )
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                text-slate-700
                outline-none
                transition
                focus:border-orange-300
                focus:bg-white
                focus:ring-2
                focus:ring-orange-100
              "
            >
              <option value="">
                Todos
              </option>

              {filterOptions?.products.map(
                (
                  item,
                ) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {item.name}
                  </option>
                ),
              )}
            </select>
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={
                applyFilters
              }
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-orange-500
                px-5
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-orange-600
              "
            >
              <Search
                size={16}
              />

              Aplicar
            </button>

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="
                h-11
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-semibold
                text-slate-600
                transition
                hover:bg-slate-50
              "
            >
              Limpiar
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >
          No se pudo cargar el
          reporte.
        </div>
      )}

      {loadingReport ? (
        <div
          className="
            flex
            min-h-[300px]
            items-center
            justify-center
            rounded-3xl
            border
            border-slate-200
            bg-white
          "
        >
          <div className="text-center">
            <RefreshCw
              size={26}
              className="
                mx-auto
                animate-spin
                text-orange-500
              "
            />

            <p
              className="
                mt-3
                text-sm
                font-medium
                text-slate-500
              "
            >
              Cargando reporte...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ===================================================
              KPIs
          =================================================== */}

          <div
            className="
              grid
              gap-4
              xl:grid-cols-3
            "
          >
            <TotalCard
              title="Total en Soles"
              value={
                report?.summary
                  .totalPEN ??
                0
              }
              currency="PEN"
            />

            <TotalCard
              title="Total en Dólares"
              value={
                report?.summary
                  .totalUSD ??
                0
              }
              currency="USD"
            />

            <GuideCountCard
              value={
                report?.summary
                  .guideCount ??
                0
              }
            />
          </div>

          {/* ===================================================
              CATEGORÍAS
          =================================================== */}

          <section
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              md:p-6
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <h2
                  className="
                    text-lg
                    font-extrabold
                    text-slate-900
                  "
                >
                  Total por categoría
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Distribución del valor
                  de materiales enviados.
                </p>
              </div>

              <div
                className="
                  inline-flex
                  self-start
                  rounded-xl
                  bg-slate-100
                  p-1
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setChartCurrency(
                      "PEN",
                    )
                  }
                  className={`
                    rounded-lg
                    px-4
                    py-2
                    text-xs
                    font-bold
                    transition
                    ${
                      chartCurrency ===
                      "PEN"
                        ? `
                          bg-orange-500
                          text-white
                          shadow-sm
                        `
                        : `
                          text-slate-500
                          hover:text-slate-800
                        `
                    }
                  `}
                >
                  Soles
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setChartCurrency(
                      "USD",
                    )
                  }
                  className={`
                    rounded-lg
                    px-4
                    py-2
                    text-xs
                    font-bold
                    transition
                    ${
                      chartCurrency ===
                      "USD"
                        ? `
                          bg-blue-500
                          text-white
                          shadow-sm
                        `
                        : `
                          text-slate-500
                          hover:text-slate-800
                        `
                    }
                  `}
                >
                  Dólares
                </button>
              </div>
            </div>

            {chartData.length ? (
              <div
                className="
                  mt-6
                  grid
                  gap-8
                  lg:grid-cols-[420px_1fr]
                  lg:items-center
                "
              >
                <div
                  className="
                    flex
                    justify-center
                  "
                >
                  <div
                    className="
                      relative
                      flex
                      h-64
                      w-64
                      items-center
                      justify-center
                      rounded-full
                    "
                    style={{
                      background:
                        donutGradient,
                    }}
                  >
                    <div
                      className="
                        flex
                        h-36
                        w-36
                        flex-col
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        shadow-inner
                      "
                    >
                      <span
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-slate-400
                        "
                      >
                        Total
                      </span>

                      <span
                        className="
                          mt-1
                          text-lg
                          font-extrabold
                          text-slate-900
                        "
                      >
                        {formatMoney(
                          chartTotal,
                          chartCurrency,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {chartData.map(
                    (
                      item,
                    ) => {
                      const percentage =
                        chartTotal >
                        0
                          ? (item.value /
                              chartTotal) *
                            100
                          : 0;

                      return (
                        <div
                          key={
                            item.categoryId ??
                            item.categoryName
                          }
                          className="
                            flex
                            items-center
                            gap-4
                            rounded-2xl
                            border
                            border-slate-100
                            bg-slate-50/60
                            px-4
                            py-3
                          "
                        >
                          <div
                            className="
                              h-3
                              w-3
                              shrink-0
                              rounded-full
                            "
                            style={{
                              backgroundColor:
                                item.color,
                            }}
                          />

                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                justify-between
                                gap-3
                              "
                            >
                              <span
                                className="
                                  truncate
                                  text-sm
                                  font-bold
                                  text-slate-800
                                "
                              >
                                {
                                  item.categoryName
                                }
                              </span>

                              <span
                                className="
                                  whitespace-nowrap
                                  text-sm
                                  font-extrabold
                                  text-slate-900
                                "
                              >
                                {formatMoney(
                                  item.value,
                                  chartCurrency,
                                )}
                              </span>
                            </div>

                            <div
                              className="
                                mt-2
                                flex
                                items-center
                                gap-3
                              "
                            >
                              <div
                                className="
                                  h-1.5
                                  flex-1
                                  overflow-hidden
                                  rounded-full
                                  bg-slate-200
                                "
                              >
                                <div
                                  className="
                                    h-full
                                    rounded-full
                                  "
                                  style={{
                                    backgroundColor:
                                      item.color,
                                    width: `${percentage}%`,
                                  }}
                                />
                              </div>

                              <span
                                className="
                                  w-12
                                  text-right
                                  text-xs
                                  font-bold
                                  text-slate-500
                                "
                              >
                                {percentage.toFixed(
                                  1,
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            ) : (
              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-dashed
                  border-slate-200
                  py-12
                  text-center
                "
              >
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-500
                  "
                >
                  No existen categorías
                  valorizadas en{" "}
                  {chartCurrency ===
                  "PEN"
                    ? "soles"
                    : "dólares"}
                  .
                </p>
              </div>
            )}
          </section>

          {/* ===================================================
              TABLA
          =================================================== */}

          <section
            className="
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              bg-white
              shadow-sm
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                px-5
                py-5
                md:px-6
              "
            >
              <div>
                <h2
                  className="
                    text-lg
                    font-extrabold
                    text-slate-900
                  "
                >
                  Detalle de materiales
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Listado de materiales
                  enviados y su
                  valorización.
                </p>
              </div>

              <div
                className="
                  rounded-full
                  bg-orange-50
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-orange-700
                "
              >
                {materials.length}{" "}
                registro
                {materials.length ===
                1
                  ? ""
                  : "s"}
              </div>
            </div>

            <div
              className="
                overflow-x-auto
              "
            >
              <table
                className="
                  w-full
                  min-w-[900px]
                  text-sm
                "
              >
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      className="
                        px-6
                        py-3
                        text-left
                        text-xs
                        font-bold
                        uppercase
                        tracking-wide
                        text-slate-500
                      "
                    >
                      Material
                    </th>

                    <th
                      className="
                        px-5
                        py-3
                        text-left
                        text-xs
                        font-bold
                        uppercase
                        tracking-wide
                        text-slate-500
                      "
                    >
                      Categoría
                    </th>

                    <th
                      className="
                        px-5
                        py-3
                        text-right
                        text-xs
                        font-bold
                        uppercase
                        tracking-wide
                        text-slate-500
                      "
                    >
                      Cantidad
                    </th>

                    <th
                      className="
                        px-5
                        py-3
                        text-right
                        text-xs
                        font-bold
                        uppercase
                        tracking-wide
                        text-slate-500
                      "
                    >
                      Precio unitario
                    </th>

                    <th
                      className="
                        px-6
                        py-3
                        text-right
                        text-xs
                        font-bold
                        uppercase
                        tracking-wide
                        text-slate-500
                      "
                    >
                      Precio total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {materials.length ? (
                    materials.map(
                      (
                        item:
                          MaterialReportItem,
                        index,
                      ) => {
                        const color =
                          CATEGORY_COLORS[
                            index %
                              CATEGORY_COLORS.length
                          ];

                        return (
                          <tr
                            key={
                              item.detailId
                            }
                            className="
                              border-t
                              border-slate-100
                              transition
                              hover:bg-slate-50
                            "
                          >
                            <td
                              className="
                                px-6
                                py-3.5
                              "
                            >
                              <div
                                className="
                                  flex
                                  items-center
                                  gap-3
                                "
                              >
                                <div
                                  className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-slate-100
                                    text-slate-500
                                  "
                                >
                                  <PackageSearch
                                    size={17}
                                  />
                                </div>

                                <div>
                                  <p
                                    className="
                                      font-bold
                                      text-slate-800
                                    "
                                  >
                                    {
                                      item.productName
                                    }
                                  </p>

                                  {(item.internalCode ||
                                    item.sku) && (
                                    <p
                                      className="
                                        mt-0.5
                                        text-xs
                                        text-slate-400
                                      "
                                    >
                                      {item.internalCode ||
                                        item.sku}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td
                              className="
                                px-5
                                py-3.5
                              "
                            >
                              <span
                                className="
                                  inline-flex
                                  rounded-full
                                  px-3
                                  py-1
                                  text-xs
                                  font-bold
                                "
                                style={{
                                  color,
                                  backgroundColor:
                                    `${color}18`,
                                }}
                              >
                                {
                                  item.categoryName
                                }
                              </span>
                            </td>

                            <td
                              className="
                                px-5
                                py-3.5
                                text-right
                                font-semibold
                                text-slate-700
                              "
                            >
                              {formatQuantity(
                                item.quantity,
                              )}

                              {item.unit
                                ? ` ${item.unit}`
                                : ""}
                            </td>

                            <td
                              className="
                                px-5
                                py-3.5
                                text-right
                                font-semibold
                                text-slate-700
                              "
                            >
                              {formatMoney(
                                item.unitCost,
                                item.currency,
                              )}
                            </td>

                            <td
                              className="
                                px-6
                                py-3.5
                                text-right
                                font-extrabold
                                text-slate-900
                              "
                            >
                              {formatMoney(
                                item.totalAmount,
                                item.currency,
                              )}
                            </td>
                          </tr>
                        );
                      },
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={
                          5
                        }
                        className="
                          px-6
                          py-12
                          text-center
                        "
                      >
                        <PackageSearch
                          size={30}
                          className="
                            mx-auto
                            text-slate-300
                          "
                        />

                        <p
                          className="
                            mt-3
                            text-sm
                            font-semibold
                            text-slate-500
                          "
                        >
                          No hay materiales
                          para los filtros
                          seleccionados.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {Boolean(
            report?.summary
              .unpricedItemCount,
          ) && (
            <div
              className="
                rounded-2xl
                border
                border-amber-200
                bg-amber-50
                px-4
                py-3
                text-sm
                text-amber-800
              "
            >
              <strong>
                {
                  report!
                    .summary
                    .unpricedItemCount
                }
              </strong>{" "}
              material(es) todavía no
              tienen precio o moneda
              definida y no se incluyen
              en los totales.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ReportsPage;
