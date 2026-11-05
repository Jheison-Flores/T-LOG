import {
  useMemo,
  useState,
} from "react";

import {
  Download,
  LoaderCircle,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  useInventory,
} from "../hooks/UseInventory";

import {
  useWarehouses,
} from "@/modules/warehouses/hooks/useWarehouses";
import { useAuth } from "@/modules/auth/contexts/AuthContexts";
import { useCategories } from "@/modules/categories/hooks/useCategories";

import {
  InventoryStats,
} from "../components/InventoryStats";

import {
  InventoryTable,
} from "../components/InventoryTable";
import { inventoryService } from "../services/inventory.service";

import type {
  StockStatus,
} from "../types/inventory.types";

export function InventoryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role.code === "ADMIN";
  const sessionWarehouse = user?.warehouse;
  const isCentralWarehouse =
    sessionWarehouse?.code?.trim().toUpperCase() === "LIMA" ||
    sessionWarehouse?.city?.trim().toUpperCase().includes("LIMA") === true ||
    sessionWarehouse?.name?.trim().toUpperCase().includes("LIMA") === true;
  const canChooseWarehouse =
    isAdmin ||
    (user?.role.code === "LOGISTICS" && isCentralWarehouse);

  const [search, setSearch] =
    useState("");

  const [warehouseId, setWarehouseId] =
    useState<number | undefined>(
      undefined,
    );

  const selectedWarehouseId = canChooseWarehouse
    ? warehouseId
    : user?.warehouse?.id;

  const [categoryId, setCategoryId] =
    useState<number | undefined>(undefined);

  const [stockStatus, setStockStatus] =
    useState<StockStatus>("ALL");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

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

    warehouseId: selectedWarehouseId,

    categoryId,

    stockStatus,

  });

  // Mantiene la tabla y sus indicadores sincronizados inmediatamente con
  // todos los filtros activos, aunque la respuesta de la API esté en caché.
  const visibleInventory = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return inventory.filter((item) => {
      const quantity = Number(item.quantity ?? 0);
      const minimumStock = Number(item.product?.minimumStock ?? 0);

      if (selectedWarehouseId && item.warehouse?.id !== selectedWarehouseId) {
        return false;
      }

      if (categoryId && item.product?.category?.id !== categoryId) {
        return false;
      }

      if (stockStatus === "OUT" && quantity !== 0) return false;
      if (stockStatus === "LOW" && !(quantity > 0 && quantity <= minimumStock)) return false;
      if (stockStatus === "NORMAL" && !(quantity > minimumStock)) return false;

      if (normalizedSearch) {
        const searchableValues = [
          item.product?.name,
          item.product?.sku,
          item.product?.internalCode,
        ];
        const matchesSearch = searchableValues.some((value) =>
          value?.toLocaleLowerCase().includes(normalizedSearch),
        );

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [inventory, search, selectedWarehouseId, categoryId, stockStatus]);

  // ============================================================
  // ALMACENES
  // ============================================================

  const {
    data: warehouses = [],

    isLoading: warehousesLoading,

    isError: warehousesError,

  } = useWarehouses();

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

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

  const handleDownloadExcel = async () => {
    setIsExporting(true);
    setExportError("");
    try {
      await inventoryService.downloadExcel({
        search: search.trim() || undefined,
        warehouseId: selectedWarehouseId,
        categoryId,
        stockStatus,
      });
    } catch (downloadError) {
      console.error("Error descargando inventario:", downloadError);
      setExportError("No se pudo descargar el inventario con los filtros seleccionados.");
    } finally {
      setIsExporting(false);
    }
  };

  // ============================================================
  // LIMPIAR FILTROS
  // ============================================================

  const handleClearFilters = () => {

    setSearch("");

    setWarehouseId(
      undefined,
    );

    setCategoryId(undefined);

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
            inventory={visibleInventory}
          />

        )}


      {/* ================================================== */}
      {/* FILTROS */}
      {/* ================================================== */}

      <div className="bg-white rounded-xl border border-gray-200 p-4">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">


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

          {canChooseWarehouse ? <select

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

          </select> : (
            <div className="flex min-h-12 items-center rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700">
              {user?.warehouse?.name ?? "Cargando almacén de la sesión..."}
            </div>
          )}

          <select
            value={categoryId !== undefined ? String(categoryId) : ""}
            onChange={(event) => setCategoryId(Number(event.target.value) || undefined)}
            disabled={categoriesLoading}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">Todas las categorías</option>
            {categories.filter((category) => category.isActive).map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
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

        <div className="flex flex-wrap justify-end gap-3 mt-4 pt-4 border-t border-gray-100">

          <button
            type="button"
            onClick={() => void handleDownloadExcel()}
            disabled={isLoading || isFetching || isExporting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-700 text-white font-medium hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? <LoaderCircle size={17} className="animate-spin" /> : <Download size={17} />}
            {isExporting ? "Preparando Excel..." : "Descargar Excel"}
          </button>

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

        {exportError && <p className="mt-3 text-sm text-red-600">{exportError}</p>}

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
            inventory={visibleInventory}
          />

        )}

    </div>

  );
}
