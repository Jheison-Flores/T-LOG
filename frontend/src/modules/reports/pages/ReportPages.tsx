import {
  useMemo,
  useState,
} from "react";

import {
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react";

import {
  useMaterialDispatchFilterOptions,
  useMaterialDispatchReport,
} from "../hooks/useReports";

import type {
  CostCurrency,
  MaterialDispatchFilters,
  MaterialReportItem,
} from "../types/report.types";

// ============================================================
// FORMATO
// ============================================================

function formatMoney(
  value:
    | number
    | null
    | undefined,
  currency:
    | CostCurrency
    | null,
) {
  if (
    value === null ||
    value === undefined ||
    currency === null
  ) {
    return "Sin precio";
  }

  const formatted =
    new Intl.NumberFormat(
      "es-PE",
      {
        minimumFractionDigits:
          2,
        maximumFractionDigits:
          2,
      },
    ).format(
      Number(
        value,
      ),
    );

  return currency ===
    "USD"
    ? `US$ ${formatted}`
    : `S/ ${formatted}`;
}

function formatQuantity(
  value: number,
) {
  return new Intl.NumberFormat(
    "es-PE",
    {
      minimumFractionDigits:
        0,

      maximumFractionDigits:
        2,
    },
  ).format(
    Number(
      value,
    ),
  );
}

// ============================================================
// TARJETA TOTAL
// ============================================================

function TotalCard({
  title,
  value,
  currency,
}: {
  title: string;
  value: number;
  currency: CostCurrency;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-sm
              font-medium
              text-slate-500
            "
          >
            {title}
          </p>

          <p
            className="
              mt-2
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            {formatMoney(
              value,
              currency,
            )}
          </p>
        </div>

        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-slate-100
            text-slate-700
          "
        >
          <WalletCards
            size={21}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PÁGINA
// ============================================================

export function ReportsPage() {
  const [
    draftFilters,
    setDraftFilters,
  ] =
    useState<MaterialDispatchFilters>(
      {
        groupBy:
          "month",
      },
    );

  const [
    appliedFilters,
    setAppliedFilters,
  ] =
    useState<MaterialDispatchFilters>(
      {
        groupBy:
          "month",
      },
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
      [
        report,
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
        [key]:
          value,
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
      const clean: MaterialDispatchFilters =
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

  return (
    <div
      className="
        space-y-6
        pb-8
      "
    >
      {/* =======================================================
          CABECERA
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
          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            Reporte de materiales
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Valorización de
            materiales enviados
            según las Guías de
            Remisión.
          </p>
        </div>

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
            hover:bg-slate-50
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

      {/* =======================================================
          FILTROS
      ======================================================= */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
        "
      >
        <div
          className="
            mb-4
            flex
            items-center
            gap-2
          "
        >
          <Search
            size={18}
            className="
              text-slate-500
            "
          />

          <h2
            className="
              font-semibold
              text-slate-800
            "
          >
            Filtros
          </h2>
        </div>

        <div
          className="
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-5
          "
        >
          <label
            className="
              space-y-1.5
            "
          >
            <span
              className="
                text-xs
                font-semibold
                text-slate-600
              "
            >
              Desde
            </span>

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
                h-10
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                outline-none
                transition
                focus:border-slate-400
              "
            />
          </label>

          <label
            className="
              space-y-1.5
            "
          >
            <span
              className="
                text-xs
                font-semibold
                text-slate-600
              "
            >
              Hasta
            </span>

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
                h-10
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                outline-none
                transition
                focus:border-slate-400
              "
            />
          </label>

          <label
            className="
              space-y-1.5
            "
          >
            <span
              className="
                text-xs
                font-semibold
                text-slate-600
              "
            >
              Mina / almacén
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
                h-10
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                outline-none
                transition
                focus:border-slate-400
              "
            >
              <option
                value=""
              >
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

          <label
            className="
              space-y-1.5
            "
          >
            <span
              className="
                text-xs
                font-semibold
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
                h-10
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                outline-none
                transition
                focus:border-slate-400
              "
            >
              <option
                value=""
              >
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

          <label
            className="
              space-y-1.5
            "
          >
            <span
              className="
                text-xs
                font-semibold
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
                h-10
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                outline-none
                transition
                focus:border-slate-400
              "
            >
              <option
                value=""
              >
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
        </div>

        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          <button
            type="button"
            onClick={
              applyFilters
            }
            className="
              rounded-xl
              bg-slate-900
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-slate-800
            "
          >
            Aplicar filtros
          </button>

          <button
            type="button"
            onClick={
              clearFilters
            }
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
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
      </section>

      {/* =======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >
          No se pudo cargar
          el reporte.
        </div>
      )}

      {/* =======================================================
          CARGA
      ======================================================= */}

      {loadingReport ? (
        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-8
            text-center
            text-sm
            text-slate-500
          "
        >
          Cargando
          valorización...
        </div>
      ) : (
        <>
          {/* ===================================================
              TOTALES
          =================================================== */}

          <div
            className="
              grid
              gap-4
              md:grid-cols-2
            "
          >
            <TotalCard
              title="Total en soles"
              value={
                report?.summary
                  .totalPEN ??
                0
              }
              currency="PEN"
            />

            <TotalCard
              title="Total en dólares"
              value={
                report?.summary
                  .totalUSD ??
                0
              }
              currency="USD"
            />
          </div>

          {Boolean(
            report?.summary
              .unpricedItemCount,
          ) && (
            <div
              className="
                rounded-xl
                border
                border-amber-200
                bg-amber-50
                px-4
                py-3
                text-sm
                text-amber-800
              "
            >
              Hay{" "}
              <strong>
                {
                  report!
                    .summary
                    .unpricedItemCount
                }
              </strong>{" "}
              material(es)
              enviados sin precio
              o sin moneda
              definida. No se
              incluyen en los
              totales valorizados.
            </div>
          )}

          {/* ===================================================
              CATEGORÍAS
          =================================================== */}

          <section
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
            "
          >
            <div
              className="
                border-b
                border-slate-100
                px-5
                py-4
              "
            >
              <h2
                className="
                  font-semibold
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
                Los valores en
                soles y dólares
                se mantienen
                separados.
              </p>
            </div>

            <div
              className="
                overflow-x-auto
              "
            >
              <table
                className="
                  w-full
                  min-w-[620px]
                  text-sm
                "
              >
                <thead
                  className="
                    bg-slate-50
                    text-xs
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                >
                  <tr>
                    <th
                      className="
                        px-5
                        py-3
                        text-left
                        font-semibold
                      "
                    >
                      Categoría
                    </th>

                    <th
                      className="
                        px-5
                        py-3
                        text-right
                        font-semibold
                      "
                    >
                      Total S/
                    </th>

                    <th
                      className="
                        px-5
                        py-3
                        text-right
                        font-semibold
                      "
                    >
                      Total US$
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {report?.byCategory
                    .length ? (
                    report.byCategory.map(
                      (
                        item,
                      ) => (
                        <tr
                          key={
                            item.categoryId ??
                            item.categoryName
                          }
                          className="
                            border-t
                            border-slate-100
                          "
                        >
                          <td
                            className="
                              px-5
                              py-3
                              font-medium
                              text-slate-800
                            "
                          >
                            {
                              item.categoryName
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-3
                              text-right
                              font-semibold
                              text-slate-700
                            "
                          >
                            {formatMoney(
                              item.totalPEN,
                              "PEN",
                            )}
                          </td>

                          <td
                            className="
                              px-5
                              py-3
                              text-right
                              font-semibold
                              text-slate-700
                            "
                          >
                            {formatMoney(
                              item.totalUSD,
                              "USD",
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={
                          3
                        }
                        className="
                          px-5
                          py-8
                          text-center
                          text-slate-500
                        "
                      >
                        No hay
                        categorías
                        con datos
                        para los
                        filtros
                        seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ===================================================
              DETALLE DE MATERIALES
          =================================================== */}

          <section
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
            "
          >
            <div
              className="
                border-b
                border-slate-100
                px-5
                py-4
              "
            >
              <h2
                className="
                  font-semibold
                  text-slate-900
                "
              >
                Detalle de
                materiales
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Cantidad y
                valorización
                histórica del
                material enviado.
              </p>
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
                <thead
                  className="
                    bg-slate-50
                    text-xs
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                >
                  <tr>
                    <th
                      className="
                        px-5
                        py-3
                        text-left
                        font-semibold
                      "
                    >
                      Material
                    </th>

                    <th
                      className="
                        px-5
                        py-3
                        text-left
                        font-semibold
                      "
                    >
                      Categoría
                    </th>

                    <th
                      className="
                        px-5
                        py-3
                        text-right
                        font-semibold
                      "
                    >
                      Cantidad
                    </th>

                    <th
                      className="
                        px-5
                        py-3
                        text-right
                        font-semibold
                      "
                    >
                      P. unitario
                    </th>

                    <th
                      className="
                        px-5
                        py-3
                        text-right
                        font-semibold
                      "
                    >
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {materials.length ? (
                    materials.map(
                      (
                        item:
                          MaterialReportItem,
                      ) => (
                        <tr
                          key={
                            item.detailId
                          }
                          className="
                            border-t
                            border-slate-100
                            transition
                            hover:bg-slate-50/70
                          "
                        >
                          <td
                            className="
                              px-5
                              py-3
                            "
                          >
                            <p
                              className="
                                font-semibold
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
                          </td>

                          <td
                            className="
                              px-5
                              py-3
                              text-slate-600
                            "
                          >
                            {
                              item.categoryName
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-3
                              text-right
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
                              py-3
                              text-right
                              font-medium
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
                              px-5
                              py-3
                              text-right
                              font-semibold
                              text-slate-900
                            "
                          >
                            {formatMoney(
                              item.totalAmount,
                              item.currency,
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={
                          5
                        }
                        className="
                          px-5
                          py-10
                          text-center
                          text-slate-500
                        "
                      >
                        No hay
                        materiales
                        para los
                        filtros
                        seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default ReportsPage;
