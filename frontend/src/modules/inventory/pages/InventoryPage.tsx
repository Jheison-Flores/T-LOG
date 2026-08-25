import {
  useState,
} from "react";

import {
  RefreshCw,
  Search,
} from "lucide-react";

import {
  useInventory,
} from "../hooks/UseInventory";

import {
  useWarehouses,
} from "@/modules/warehouses/hooks/useWarehouses";

import {
  InventoryStats,
} from "../components/InventoryStats";

import {
  InventoryTable,
} from "../components/InventoryTable";

import type {
  StockStatus,
} from "../types/inventory.types";

export function InventoryPage() {

  const [search, setSearch] =
    useState("");

  const [warehouseId, setWarehouseId] =
    useState<number | undefined>(
      undefined,
    );

  const [stockStatus, setStockStatus] =
    useState<StockStatus>("ALL");

  // ============================================================
  // INVENTARIO
  // ============================================================

  const {
    data: inventory = [],

    isLoading,

    isError,

    error,

    refetch,

    isFetching,

  } = useInventory({

    search:
      search.trim() || undefined,

    warehouseId,

    stockStatus,

  });

  // ============================================================
  // ALMACENES
  // ============================================================

  const {
    data: warehouses = [],

    isLoading: warehousesLoading,

    isError: warehousesError,

  } = useWarehouses();

  // ============================================================
  // CAMBIAR ALMACÉN
  // ============================================================

  const handleWarehouseChange = (
    value: string,
  ) => {

    if (!value) {

      setWarehouseId(
        undefined,
      );

      return;
    }

    setWarehouseId(
      Number(value),
    );
  };

  // ============================================================
  // CAMBIAR ESTADO
  // ============================================================

  const handleStockStatusChange = (
    value: StockStatus,
  ) => {

    setStockStatus(
      value,
    );
  };

  // ============================================================
  // LIMPIAR FILTROS
  // ============================================================

  const handleClearFilters = () => {

    setSearch("");

    setWarehouseId(
      undefined,
    );

    setStockStatus(
      "ALL",
    );
  };

  return (

    <div className="space-y-6">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div>

        <h1 className="text-3xl font-bold text-gray-900">
          Inventario
        </h1>

        <p className="text-gray-500 mt-1">
          Control de existencias por producto y almacén
        </p>

      </div>


      {/* ================================================== */}
      {/* ESTADÍSTICAS */}
      {/* ================================================== */}

      {!isLoading &&
        !isError && (

          <InventoryStats
            inventory={inventory}
          />

        )}


      {/* ================================================== */}
      {/* FILTROS */}
      {/* ================================================== */}

      <div className="bg-white rounded-xl border border-gray-200 p-4">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">


          {/* ================================================== */}
          {/* BUSCAR */}
          {/* ================================================== */}

          <div className="relative xl:col-span-2">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"

              value={search}

              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }

              placeholder="Buscar producto, SKU o código interno..."

              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />

          </div>


          {/* ================================================== */}
          {/* ALMACÉN */}
          {/* ================================================== */}

          <select

            value={
              warehouseId !== undefined
                ? String(warehouseId)
                : ""
            }

            onChange={(event) =>
              handleWarehouseChange(
                event.target.value,
              )
            }

            disabled={
              warehousesLoading
            }

            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:text-gray-400"
          >

            <option value="">
              {warehousesLoading
                ? "Cargando almacenes..."
                : "Todos los almacenes"}
            </option>

            {warehouses
              .filter(
                (warehouse) =>
                  warehouse.isActive,
              )
              .map(
                (warehouse) => (

                  <option
                    key={warehouse.id}
                    value={warehouse.id}
                  >
                    {warehouse.name}
                  </option>

                ),
              )}

          </select>


          {/* ================================================== */}
          {/* ESTADO */}
          {/* ================================================== */}

          <select

            value={stockStatus}

            onChange={(event) =>
              handleStockStatusChange(
                event.target
                  .value as StockStatus,
              )
            }

            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >

            <option value="ALL">
              Todos los estados
            </option>

            <option value="NORMAL">
              Normal
            </option>

            <option value="LOW">
              Stock bajo
            </option>

            <option value="OUT">
              Agotado
            </option>

          </select>

        </div>


        {/* ================================================== */}
        {/* ERROR ALMACENES */}
        {/* ================================================== */}

        {warehousesError && (

          <div className="mt-3 text-sm text-red-600">

            No se pudieron cargar los almacenes.

          </div>

        )}


        {/* ================================================== */}
        {/* BOTONES */}
        {/* ================================================== */}

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">

          <button
            type="button"

            onClick={
              handleClearFilters
            }

            className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Limpiar filtros
          </button>


          <button
            type="button"

            onClick={() =>
              refetch()
            }

            disabled={
              isFetching
            }

            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >

            <RefreshCw
              size={17}

              className={
                isFetching
                  ? "animate-spin"
                  : ""
              }
            />

            {isFetching
              ? "Actualizando..."
              : "Actualizar"}

          </button>

        </div>

      </div>


      {/* ================================================== */}
      {/* ERROR INVENTARIO */}
      {/* ================================================== */}

      {isError && (

        <div className="bg-red-50 border border-red-200 rounded-xl p-5">

          <p className="font-semibold text-red-700">
            No se pudo cargar el inventario.
          </p>

          <p className="text-sm text-red-600 mt-1">
            Verifica la conexión con el servidor.
          </p>

          {error instanceof Error && (

            <p className="text-xs text-red-500 mt-2">
              {error.message}
            </p>

          )}

          <button
            type="button"

            onClick={() =>
              refetch()
            }

            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
          >
            Intentar nuevamente
          </button>

        </div>

      )}


      {/* ================================================== */}
      {/* LOADING */}
      {/* ================================================== */}

      {isLoading && (

        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">

          <div className="animate-pulse text-gray-500">
            Cargando inventario...
          </div>

        </div>

      )}


      {/* ================================================== */}
      {/* TABLA */}
      {/* ================================================== */}

      {!isLoading &&
        !isError && (

          <InventoryTable
            inventory={inventory}
          />

        )}

    </div>

  );
}