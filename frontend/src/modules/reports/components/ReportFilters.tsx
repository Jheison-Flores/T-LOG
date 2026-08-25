import {
  RotateCcw,
  Search,
} from "lucide-react";

import {
  ProductSearchSelect,
} from "@/components/selectors/ProductSearchSelect";

import type {
  MaterialDispatchFilterOptions,
  MaterialDispatchFilters,
  ReportGroupBy,
} from "../types/report.types";

interface Props {
  filters: MaterialDispatchFilters;
  options: MaterialDispatchFilterOptions;
  disabled?: boolean;
  onChange: (filters: MaterialDispatchFilters) => void;
  onReset: () => void;
}

export function ReportFilters({
  filters,
  options,
  disabled = false,
  onChange,
  onReset,
}: Props) {
  const setFilter = <K extends keyof MaterialDispatchFilters>(
    key: K,
    value: MaterialDispatchFilters[K],
  ) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Filtros del reporte
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            El periodo se calcula con la fecha de inicio de traslado de la guía.
          </p>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={onReset}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw size={16} />
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-6">
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-gray-700">Desde</span>
          <input
            type="date"
            value={filters.from ?? ""}
            disabled={disabled}
            onChange={(event) =>
              setFilter("from", event.target.value || undefined)
            }
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-gray-700">Hasta</span>
          <input
            type="date"
            value={filters.to ?? ""}
            disabled={disabled}
            onChange={(event) =>
              setFilter("to", event.target.value || undefined)
            }
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-gray-700">
            Mina / unidad
          </span>
          <select
            value={filters.warehouseId ?? ""}
            disabled={disabled}
            onChange={(event) =>
              setFilter(
                "warehouseId",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          >
            <option value="">Todas</option>
            {options.warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
                {warehouse.code ? ` (${warehouse.code})` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-gray-700">Categoría</span>
          <select
            value={filters.categoryId ?? ""}
            disabled={disabled}
            onChange={(event) =>
              setFilter(
                "categoryId",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          >
            <option value="">Todas</option>
            {options.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <Search size={14} />
            Producto
          </span>

          <ProductSearchSelect
            products={options.products.map((product) => ({
              id: product.id,
              name: product.name,
            }))}
            value={filters.productId ?? null}
            placeholder="Buscar producto..."
            disabled={disabled}
            onChange={(productId) =>
              setFilter("productId", productId ?? undefined)
            }
          />
        </div>

        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-gray-700">
            Agrupar tendencia
          </span>
          <select
            value={filters.groupBy ?? "month"}
            disabled={disabled}
            onChange={(event) =>
              setFilter(
                "groupBy",
                event.target.value as ReportGroupBy,
              )
            }
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          >
            <option value="day">Diario</option>
            <option value="fortnight">Quincenal</option>
            <option value="month">Mensual</option>
          </select>
        </label>
      </div>
    </div>
  );
}