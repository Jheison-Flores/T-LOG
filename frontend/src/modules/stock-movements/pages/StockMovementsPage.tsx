import { useMemo, useState } from "react";
import { Eye, Plus } from "lucide-react";
import { StockMovementModal } from "../components/StockMovementModal";
import { Button } from "@/components/ui";
import { Card } from "@/components/ui/Card";

import {
  useStockMovements,
} from "../hooks/useStockMovements";

import type {
  MovementType,
  StockMovement,
} from "../types/stock-movement.types";

const movementLabels: Record<
  MovementType,
  string
> = {
  ENTRY: "Entrada",
  OUTPUT: "Salida",
  TRANSFER: "Transferencia",
  ADJUSTMENT_IN: "Ajuste de entrada",
  ADJUSTMENT_OUT: "Ajuste de salida",
};

const movementStyles: Record<
  MovementType,
  string
> = {
  ENTRY:
    "bg-green-100 text-green-700",

  OUTPUT:
    "bg-red-100 text-red-700",

  TRANSFER:
    "bg-blue-100 text-blue-700",

  ADJUSTMENT_IN:
    "bg-emerald-100 text-emerald-700",

  ADJUSTMENT_OUT:
    "bg-orange-100 text-orange-700",
};

export function StockMovementsPage() {
  const {
    data: movements = [],
    isLoading,
    isError,
  } = useStockMovements();

  const [search, setSearch] =
    useState("");
  
    const [movementModalOpen, setMovementModalOpen] =
  useState(false);

  const [
    selectedMovement,
    setSelectedMovement,
  ] = useState<StockMovement | null>(null);

  const filteredMovements =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      if (!term) {
        return movements;
      }

      return movements.filter(
        (movement) => {
          const product =
            movement.sourceInventory
              ?.product?.name ??
            movement.destinationInventory
              ?.product?.name ??
            "";

          const sourceWarehouse =
            movement.sourceInventory
              ?.warehouse?.name ??
            "";

          const destinationWarehouse =
            movement.destinationInventory
              ?.warehouse?.name ??
            "";

          const user =
            [
              movement.user?.firstName,
              movement.user?.lastName,
              movement.user?.username,
            ]
              .filter(Boolean)
              .join(" ");

          const type =
            movementLabels[
              movement.movementType
            ];

          return (
            product
              .toLowerCase()
              .includes(term) ||
            sourceWarehouse
              .toLowerCase()
              .includes(term) ||
            destinationWarehouse
              .toLowerCase()
              .includes(term) ||
            user
              .toLowerCase()
              .includes(term) ||
            type
              .toLowerCase()
              .includes(term) ||
            String(movement.id).includes(
              term,
            )
          );
        },
      );
    }, [movements, search]);

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Movimientos
          </h1>

          <p className="text-gray-500 mt-1">
            Historial de movimientos de inventario
          </p>
        </div>

        <Card>
          <div className="p-12 text-center text-gray-500">
            Cargando movimientos...
          </div>
        </Card>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Movimientos
          </h1>

          <p className="text-gray-500 mt-1">
            Historial de movimientos de inventario
          </p>
        </div>

        <Card>
          <div className="p-12 text-center">
            <p className="text-red-600 font-medium">
              No se pudieron cargar los movimientos.
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Verifica la conexión con el servidor.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Movimientos
          </h1>

          <p className="text-gray-500 mt-1">
            Historial de movimientos de inventario
          </p>
        </div>

        <Button
          type="button"
          onClick={() =>
            setMovementModalOpen(true)
          }
        >
          <Plus size={18} />
          Nuevo movimiento
        </Button>

      </div>

      {/* ======================================================
          FILTROS
      ====================================================== */}

      <Card>

        <div className="p-5">

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar movimiento
          </label>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Producto, almacén, usuario, tipo o ID..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />

        </div>

      </Card>

      {/* ======================================================
          RESUMEN
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Card>
          <div className="p-5">

            <p className="text-sm text-gray-500">
              Total movimientos
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-1">
              {movements.length}
            </p>

          </div>
        </Card>

        <Card>
          <div className="p-5">

            <p className="text-sm text-gray-500">
              Movimientos encontrados
            </p>

            <p className="text-2xl font-bold text-gray-900 mt-1">
              {filteredMovements.length}
            </p>

          </div>
        </Card>

        <Card>
          <div className="p-5">

            <p className="text-sm text-gray-500">
              Último movimiento
            </p>

            <p className="text-sm font-semibold text-gray-900 mt-2">
              {movements.length > 0
                ? new Date(
                    movements[0].createdAt,
                  ).toLocaleString("es-PE")
                : "Sin movimientos"}
            </p>

          </div>
        </Card>

      </div>

      {/* ======================================================
          TABLA
      ====================================================== */}

      <Card>

        {filteredMovements.length === 0 ? (

          <div className="p-12 text-center">

            <p className="text-gray-500">
              No se encontraron movimientos.
            </p>

            {search && (
              <p className="text-sm text-gray-400 mt-2">
                Intenta cambiar el término de búsqueda.
              </p>
            )}

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b border-gray-200">

                <tr>

                  <th className="text-left px-5 py-4 font-semibold text-gray-600">
                    ID
                  </th>

                  <th className="text-left px-5 py-4 font-semibold text-gray-600">
                    Tipo
                  </th>

                  <th className="text-left px-5 py-4 font-semibold text-gray-600">
                    Producto
                  </th>

                  <th className="text-left px-5 py-4 font-semibold text-gray-600">
                    Origen
                  </th>

                  <th className="text-left px-5 py-4 font-semibold text-gray-600">
                    Destino
                  </th>

                  <th className="text-center px-5 py-4 font-semibold text-gray-600">
                    Cantidad
                  </th>

                  <th className="text-left px-5 py-4 font-semibold text-gray-600">
                    Usuario
                  </th>

                  <th className="text-left px-5 py-4 font-semibold text-gray-600">
                    Fecha
                  </th>

                  <th className="text-right px-5 py-4 font-semibold text-gray-600">
                    Acción
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredMovements.map(
                  (movement) => {

                    const product =
                      movement
                        .sourceInventory
                        ?.product ??
                      movement
                        .destinationInventory
                        ?.product;

                    const sourceWarehouse =
                      movement
                        .sourceInventory
                        ?.warehouse
                        ?.name;

                    const destinationWarehouse =
                      movement
                        .destinationInventory
                        ?.warehouse
                        ?.name;

                    const userName =
                      [
                        movement.user?.firstName,
                        movement.user?.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") ||
                      movement.user?.username ||
                      "Usuario";

                    return (
                      <tr
                        key={movement.id}
                        className="hover:bg-gray-50 transition"
                      >

                        {/* ID */}

                        <td className="px-5 py-4">

                          <span className="font-mono text-xs text-gray-500">
                            #{movement.id}
                          </span>

                        </td>

                        {/* TIPO */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              movementStyles[
                                movement.movementType
                              ]
                            }`}
                          >
                            {
                              movementLabels[
                                movement.movementType
                              ]
                            }
                          </span>

                        </td>

                        {/* PRODUCTO */}

                        <td className="px-5 py-4">

                          <div>

                            <p className="font-semibold text-gray-800">
                              {product?.name ??
                                "Producto no disponible"}
                            </p>

                            {product?.sku && (
                              <p className="text-xs text-gray-400 mt-1">
                                SKU: {product.sku}
                              </p>
                            )}

                          </div>

                        </td>

                        {/* ORIGEN */}

                        <td className="px-5 py-4 text-gray-600">

                          {sourceWarehouse ??
                            "—"}

                        </td>

                        {/* DESTINO */}

                        <td className="px-5 py-4 text-gray-600">

                          {destinationWarehouse ??
                            "—"}

                        </td>

                        {/* CANTIDAD */}

                        <td className="px-5 py-4 text-center">

                          <span className="font-bold text-gray-800">
                            {movement.quantity}
                          </span>

                          {product?.unit && (
                            <span className="text-xs text-gray-400 ml-1">
                              {product.unit}
                            </span>
                          )}

                        </td>

                        {/* USUARIO */}

                        <td className="px-5 py-4 text-gray-600">

                          {userName}

                        </td>

                        {/* FECHA */}

                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap">

                          {new Date(
                            movement.createdAt,
                          ).toLocaleString(
                            "es-PE",
                          )}

                        </td>

                        {/* ACCIÓN */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end">

                            <button
                              type="button"
                              title="Ver detalle"
                              onClick={() =>
                                setSelectedMovement(
                                  movement,
                                )
                              }
                              className="p-2 rounded-lg text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition"
                            >
                              <Eye size={17} />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  },
                )}

              </tbody>

            </table>

          </div>

        )}

      </Card>

      {/* ======================================================
          DETALLE
      ====================================================== */}

      {selectedMovement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">

            <div className="border-b px-6 py-4 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Detalle del movimiento
                </h2>

                <p className="text-sm text-gray-500">
                  Movimiento #{selectedMovement.id}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMovement(null)
                }
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ×
              </button>

            </div>

            <div className="p-6 space-y-5">

              <div>

                <p className="text-xs text-gray-500">
                  Tipo de movimiento
                </p>

                <span
                  className={`inline-flex mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    movementStyles[
                      selectedMovement
                        .movementType
                    ]
                  }`}
                >
                  {
                    movementLabels[
                      selectedMovement
                        .movementType
                    ]
                  }
                </span>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <p className="text-xs text-gray-500">
                    Producto
                  </p>

                  <p className="font-semibold mt-1">
                    {
                      selectedMovement
                        .sourceInventory
                        ?.product?.name ??
                      selectedMovement
                        .destinationInventory
                        ?.product?.name ??
                      "-"
                    }
                  </p>

                </div>

                <div>

                  <p className="text-xs text-gray-500">
                    Cantidad
                  </p>

                  <p className="font-semibold mt-1">
                    {selectedMovement.quantity}
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <p className="text-xs text-gray-500">
                    Origen
                  </p>

                  <p className="font-medium mt-1">
                    {
                      selectedMovement
                        .sourceInventory
                        ?.warehouse
                        ?.name ??
                      "-"
                    }
                  </p>

                </div>

                <div>

                  <p className="text-xs text-gray-500">
                    Destino
                  </p>

                  <p className="font-medium mt-1">
                    {
                      selectedMovement
                        .destinationInventory
                        ?.warehouse
                        ?.name ??
                      "-"
                    }
                  </p>

                </div>

              </div>

              <div>

                <p className="text-xs text-gray-500">
                  Usuario
                </p>

                <p className="font-medium mt-1">
                  {[
                    selectedMovement.user
                      ?.firstName,
                    selectedMovement.user
                      ?.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                    selectedMovement.user
                      ?.username ||
                    "-"}
                </p>

              </div>

              <div>

                <p className="text-xs text-gray-500">
                  Fecha
                </p>

                <p className="font-medium mt-1">
                  {new Date(
                    selectedMovement.createdAt,
                  ).toLocaleString(
                    "es-PE",
                  )}
                </p>

              </div>

              {selectedMovement.reason && (
                <div>

                  <p className="text-xs text-gray-500">
                    Motivo / observación
                  </p>

                  <p className="text-sm text-gray-700 mt-1 bg-gray-50 rounded-lg p-3">
                    {
                      selectedMovement.reason
                    }
                  </p>

                </div>
              )}

            </div>

            <div className="border-t px-6 py-4 flex justify-end">

              <Button
                type="button"
                onClick={() =>
                  setSelectedMovement(null)
                }
              >
                Cerrar
              </Button>

            </div>

          </div>

        </div>
      )}
    <StockMovementModal
        open={movementModalOpen}
        onClose={() =>
          setMovementModalOpen(false)
        }
      />
    </div>
  );
}