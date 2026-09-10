import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Trash2,
} from "lucide-react";

import {
  Modal,
} from "@/components/ui/Modal";

import {
  Button,
  Input,
} from "@/components/ui";

import {
  useCreateBatchStockMovement,
} from "../hooks/useStockMovements";

import type {
  CreateBatchStockMovementDto,
  MovementType,
} from "../types/stock-movement.types";

import {
  useProducts,
} from "@/modules/products/hooks/useProducts";

import {
  useInventory,
} from "@/modules/inventory/hooks/UseInventory";

import {
  useWarehouses,
} from "@/modules/warehouses/hooks/useWarehouses";

interface Props {
  open:
    boolean;

  onClose:
    () => void;
}

interface MovementLine {
  id: number;
  productId: number;
  quantity: number;
  unitCost?: number;
  currency?: "PEN" | "USD";
}

let lineSequence =
  1;

function createEmptyLine(): MovementLine {
  lineSequence +=
    1;

  return {
    id:
      lineSequence,

    productId:
      0,

    quantity:
      1,

    unitCost:
      undefined,

    currency:
      undefined,
  };
}

const initialMovementType:
  MovementType =
    "ENTRY";

export function StockMovementModal({
  open,
  onClose,
}: Props) {
  const createBatchMovement =
    useCreateBatchStockMovement();

  // ============================================================
  // DATA
  // ============================================================

  const {
    data:
      products = [],
    isLoading:
      productsLoading,
  } =
    useProducts();

  const {
    data:
      inventory = [],
    isLoading:
      inventoryLoading,
  } =
    useInventory();

  const {
    data:
      warehouses = [],
    isLoading:
      warehousesLoading,
  } =
    useWarehouses();

  // ============================================================
  // FORMULARIO
  // ============================================================

  const [
    movementType,
    setMovementType,
  ] =
    useState<MovementType>(
      initialMovementType,
    );

  const [
    warehouseId,
    setWarehouseId,
  ] =
    useState<number | undefined>(
      undefined,
    );

  const [
    sourceWarehouseId,
    setSourceWarehouseId,
  ] =
    useState<number | undefined>(
      undefined,
    );

  const [
    destinationWarehouseId,
    setDestinationWarehouseId,
  ] =
    useState<number | undefined>(
      undefined,
    );

  const [
    reason,
    setReason,
  ] =
    useState("");

  const [
    reference,
    setReference,
  ] =
    useState("");

  const [
    lines,
    setLines,
  ] =
    useState<MovementLine[]>([
      {
        id:
          1,

        productId:
          0,

        quantity:
          1,

        unitCost:
          undefined,

        currency:
          undefined,
      },
    ]);

  const [
    error,
    setError,
  ] =
    useState("");

  // ============================================================
  // ABRIR / REINICIAR
  // ============================================================

  useEffect(
    () => {
      if (
        !open
      ) {
        return;
      }

      setMovementType(
        initialMovementType,
      );

      setWarehouseId(
        undefined,
      );

      setSourceWarehouseId(
        undefined,
      );

      setDestinationWarehouseId(
        undefined,
      );

      setReason(
        "",
      );

      setReference(
        "",
      );

      setLines([
        {
          id:
            1,

          productId:
            0,

          quantity:
            1,

          unitCost:
            undefined,

          currency:
            undefined,
        },
      ]);

      setError(
        "",
      );
    },
    [
      open,
    ],
  );

  // ============================================================
  // ALMACENES ACTIVOS
  // ============================================================

  const activeWarehouses =
    useMemo(
      () =>
        warehouses.filter(
          (
            warehouse,
          ) =>
            warehouse.isActive !==
            false,
        ),
      [
        warehouses,
      ],
    );

  // ============================================================
  // PRODUCTOS ACTIVOS
  // ============================================================

  const activeProducts =
    useMemo(
      () =>
        products.filter(
          (
            product,
          ) =>
            product.isActive !==
            false,
        ),
      [
        products,
      ],
    );

  // ============================================================
  // PRODUCTOS SELECCIONADOS
  // ============================================================

  const selectedProductIds =
    useMemo(
      () =>
        lines
          .map(
            (
              line,
            ) =>
              line.productId,
          )
          .filter(
            (
              productId,
            ) =>
              productId >
              0,
          ),
      [
        lines,
      ],
    );

  // ============================================================
  // STOCK DISPONIBLE
  // ============================================================

  const getStock = (
    productId:
      number,
    targetWarehouseId?:
      number,
  ) => {
    if (
      !productId ||
      !targetWarehouseId
    ) {
      return 0;
    }

    const item =
      inventory.find(
        (
          inventoryItem,
        ) =>
          inventoryItem.product?.id ===
            productId &&
          inventoryItem.warehouse?.id ===
            targetWarehouseId,
      );

    return Number(
      item?.quantity ??
        0,
    );
  };

  const getRelevantWarehouseId =
    () => {
      if (
        movementType ===
        "TRANSFER"
      ) {
        return sourceWarehouseId;
      }

      return warehouseId;
    };

  const requiresAvailableStock =
    movementType ===
      "OUTPUT" ||
    movementType ===
      "TRANSFER" ||
    movementType ===
      "ADJUSTMENT_OUT";

  const allowsUnitCost =
    movementType ===
      "ENTRY" ||
    movementType ===
      "ADJUSTMENT_IN";

  // ============================================================
  // CAMBIO DE TIPO
  // ============================================================

  const handleMovementTypeChange =
    (
      value:
        MovementType,
    ) => {
      setMovementType(
        value,
      );

      setWarehouseId(
        undefined,
      );

      setSourceWarehouseId(
        undefined,
      );

      setDestinationWarehouseId(
        undefined,
      );

      const nextAllowsUnitCost =
        value === "ENTRY" ||
        value === "ADJUSTMENT_IN";

      if (!nextAllowsUnitCost) {
        setLines((current) =>
          current.map((line) => ({
            ...line,
            unitCost: undefined,
            currency: undefined,
          })),
        );
      }

      setError(
        "",
      );
    };

  // ============================================================
  // LÍNEAS
  // ============================================================

  const addLine =
    () => {
      setLines(
        (
          current,
        ) => [
          ...current,
          createEmptyLine(),
        ],
      );

      setError(
        "",
      );
    };

  const removeLine =
    (
      lineId:
        number,
    ) => {
      setLines(
        (
          current,
        ) => {
          if (
            current.length ===
            1
          ) {
            return current;
          }

          return current.filter(
            (
              line,
            ) =>
              line.id !==
              lineId,
          );
        },
      );

      setError(
        "",
      );
    };

  const updateProduct =
    (
      lineId:
        number,
      productId:
        number,
    ) => {
      setLines(
        (
          current,
        ) =>
          current.map(
            (
              line,
            ) =>
              line.id ===
              lineId
                ? {
                    ...line,
                    productId,
                  }
                : line,
          ),
      );

      setError(
        "",
      );
    };

  const updateQuantity =
    (
      lineId:
        number,
      quantity:
        number,
    ) => {
      setLines(
        (
          current,
        ) =>
          current.map(
            (
              line,
            ) =>
              line.id ===
              lineId
                ? {
                    ...line,
                    quantity,
                  }
                : line,
          ),
      );

      setError(
        "",
      );
    };

  const updateUnitCost =
    (
      lineId: number,
      value: string,
    ) => {
      setLines((current) =>
        current.map((line) => {
          if (line.id !== lineId) {
            return line;
          }

          if (value === "") {
            return {
              ...line,
              unitCost: undefined,
              currency: undefined,
            };
          }

          return {
            ...line,
            unitCost: Number(value),
            currency: line.currency ?? "PEN",
          };
        }),
      );

      setError("");
    };

  const updateCurrency =
    (
      lineId: number,
      currency: "PEN" | "USD",
    ) => {
      setLines((current) =>
        current.map((line) =>
          line.id === lineId
            ? {
                ...line,
                currency,
              }
            : line,
        ),
      );

      setError("");
    };

  // ============================================================
  // VALIDACIÓN
  // ============================================================

  const validateForm =
    (): string | null => {
      if (
        lines.length ===
        0
      ) {
        return "Debes agregar al menos un producto.";
      }

      const invalidProduct =
        lines.some(
          (
            line,
          ) =>
            !line.productId,
        );

      if (
        invalidProduct
      ) {
        return "Todos los productos deben estar seleccionados.";
      }

      const productIds =
        lines.map(
          (
            line,
          ) =>
            line.productId,
        );

      if (
        new Set(
          productIds,
        ).size !==
        productIds.length
      ) {
        return "No puedes repetir el mismo producto en la operación.";
      }

      const invalidQuantity =
        lines.some(
          (
            line,
          ) =>
            !Number.isFinite(
              line.quantity,
            ) ||
            line.quantity <=
              0,
        );

      if (
        invalidQuantity
      ) {
        return "Todas las cantidades deben ser mayores que cero.";
      }

      if (allowsUnitCost) {
        for (const line of lines) {
          if (line.unitCost === undefined) {
            continue;
          }

          if (
            !Number.isFinite(line.unitCost) ||
            line.unitCost < 0
          ) {
            return "El precio unitario debe ser mayor o igual a cero.";
          }

          if (!line.currency) {
            return "Selecciona la moneda de todos los productos que tengan precio.";
          }
        }
      }

      if (
        movementType ===
        "TRANSFER"
      ) {
        if (
          !sourceWarehouseId ||
          !destinationWarehouseId
        ) {
          return "Debes seleccionar almacén de origen y destino.";
        }

        if (
          sourceWarehouseId ===
          destinationWarehouseId
        ) {
          return "El almacén de origen y destino no pueden ser iguales.";
        }
      } else {
        if (
          !warehouseId
        ) {
          return movementType ===
            "ENTRY"
            ? "Debes seleccionar el almacén de destino."
            : "Debes seleccionar el almacén.";
        }
      }

      if (
        requiresAvailableStock
      ) {
        const stockWarehouseId =
          getRelevantWarehouseId();

        for (
          const line of
          lines
        ) {
          const stock =
            getStock(
              line.productId,
              stockWarehouseId,
            );

          if (
            stock <
            line.quantity
          ) {
            const product =
              products.find(
                (
                  item,
                ) =>
                  item.id ===
                  line.productId,
              );

            return `Stock insuficiente para "${
              product?.name ??
              "Producto"
            }". Disponible: ${stock}.`;
          }
        }
      }

      return null;
    };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit =
    async (
      event:
        React.FormEvent,
    ) => {
      event.preventDefault();

      setError(
        "",
      );

      const validationError =
        validateForm();

      if (
        validationError
      ) {
        setError(
          validationError,
        );

        return;
      }

      const dto:
        CreateBatchStockMovementDto =
        {
          movementType,

          details:
            lines.map(
              (
                line,
              ) => ({
                productId:
                  line.productId,

                quantity:
                  Number(
                    line.quantity,
                  ),

                unitCost:
                  allowsUnitCost
                    ? line.unitCost
                    : undefined,

                currency:
                  allowsUnitCost &&
                  line.unitCost !== undefined
                    ? line.currency
                    : undefined,
              }),
            ),

          warehouseId:
            movementType ===
            "TRANSFER"
              ? undefined
              : warehouseId,

          sourceWarehouseId:
            movementType ===
            "TRANSFER"
              ? sourceWarehouseId
              : undefined,

          destinationWarehouseId:
            movementType ===
            "TRANSFER"
              ? destinationWarehouseId
              : undefined,

          reason:
            reason.trim() ||
            undefined,

          reference:
            reference.trim() ||
            undefined,
        };

      try {
        await createBatchMovement.mutateAsync(
          dto,
        );

        onClose();
      } catch (
        caughtError:
          any
      ) {
        console.error(
          "Error registrando movimientos:",
          caughtError,
        );

        const message =
          caughtError?.response?.data
            ?.message;

        setError(
          Array.isArray(
            message,
          )
            ? message.join(
                ", ",
              )
            : message ||
                "No se pudo registrar la operación de movimientos.",
        );
      }
    };

  // ============================================================
  // LOADING
  // ============================================================

  const loading =
    productsLoading ||
    inventoryLoading ||
    warehousesLoading ||
    createBatchMovement.isPending;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Modal
      open={
        open
      }
      title="Nuevo movimiento"
      onClose={() => {
        if (
          !createBatchMovement.isPending
        ) {
          onClose();
        }
      }}
      size="2xl"
    >
      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-5"
      >
        {/* =====================================================
            TIPO
        ===================================================== */}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tipo de movimiento *
          </label>

          <select
            value={
              movementType
            }
            onChange={(
              event,
            ) =>
              handleMovementTypeChange(
                event.target
                  .value as MovementType,
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:ring-2 focus:ring-orange-500"
            disabled={
              loading
            }
          >
            <option value="ENTRY">
              Entrada
            </option>

            <option value="OUTPUT">
              Salida
            </option>

            <option value="TRANSFER">
              Transferencia
            </option>

            <option value="ADJUSTMENT_IN">
              Ajuste de entrada
            </option>

            <option value="ADJUSTMENT_OUT">
              Ajuste de salida
            </option>
          </select>
        </div>

        {/* =====================================================
            ALMACÉN
        ===================================================== */}

        {movementType !==
        "TRANSFER" ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {
                movementType ===
                "ENTRY"
                  ? "Almacén de destino *"
                  : movementType ===
                      "OUTPUT"
                    ? "Almacén de origen *"
                    : "Almacén *"
              }
            </label>

            <select
              value={
                warehouseId ??
                ""
              }
              onChange={(
                event,
              ) => {
                setWarehouseId(
                  Number(
                    event.target
                      .value,
                  ) ||
                    undefined,
                );

                setError(
                  "",
                );
              }}
              disabled={
                loading
              }
              className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">
                {
                  warehousesLoading
                    ? "Cargando almacenes..."
                    : "Seleccione almacén"
                }
              </option>

              {activeWarehouses.map(
                (
                  warehouse,
                ) => (
                  <option
                    key={
                      warehouse.id
                    }
                    value={
                      warehouse.id
                    }
                  >
                    {
                      warehouse.name
                    }

                    {
                      warehouse.code
                        ? ` (${warehouse.code})`
                        : ""
                    }
                  </option>
                ),
              )}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Almacén origen *
              </label>

              <select
                value={
                  sourceWarehouseId ??
                  ""
                }
                onChange={(
                  event,
                ) => {
                  const value =
                    Number(
                      event.target
                        .value,
                    ) ||
                    undefined;

                  setSourceWarehouseId(
                    value,
                  );

                  if (
                    value &&
                    value ===
                      destinationWarehouseId
                  ) {
                    setDestinationWarehouseId(
                      undefined,
                    );
                  }

                  setError(
                    "",
                  );
                }}
                disabled={
                  loading
                }
                className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">
                  Seleccione origen
                </option>

                {activeWarehouses.map(
                  (
                    warehouse,
                  ) => (
                    <option
                      key={
                        warehouse.id
                      }
                      value={
                        warehouse.id
                      }
                    >
                      {
                        warehouse.name
                      }

                      {
                        warehouse.code
                          ? ` (${warehouse.code})`
                          : ""
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Almacén destino *
              </label>

              <select
                value={
                  destinationWarehouseId ??
                  ""
                }
                onChange={(
                  event,
                ) => {
                  setDestinationWarehouseId(
                    Number(
                      event.target
                        .value,
                    ) ||
                      undefined,
                  );

                  setError(
                    "",
                  );
                }}
                disabled={
                  loading
                }
                className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">
                  Seleccione destino
                </option>

                {activeWarehouses
                  .filter(
                    (
                      warehouse,
                    ) =>
                      warehouse.id !==
                      sourceWarehouseId,
                  )
                  .map(
                    (
                      warehouse,
                    ) => (
                      <option
                        key={
                          warehouse.id
                        }
                        value={
                          warehouse.id
                        }
                      >
                        {
                          warehouse.name
                        }

                        {
                          warehouse.code
                            ? ` (${warehouse.code})`
                            : ""
                        }
                      </option>
                    ),
                  )}
              </select>
            </div>
          </div>
        )}

        {/* =====================================================
            PRODUCTOS
        ===================================================== */}

        <div className="overflow-visible rounded-xl border border-gray-200">
          <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-gray-800">
                Productos / materiales
              </p>

              <p className="mt-0.5 text-xs text-gray-500">
                Todos los productos se registrarán dentro de la misma operación.
              </p>
            </div>

            <Button
              type="button"
              onClick={
                addLine
              }
              disabled={
                loading
              }
              className="flex items-center gap-2"
            >
              <Plus
                size={
                  16
                }
              />

              Agregar producto
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full text-sm">
              <thead className="border-b border-gray-200 bg-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Producto
                  </th>

                  <th className="w-32 px-4 py-3 text-center font-semibold text-gray-600">
                    Stock
                  </th>

                  <th className="w-40 px-4 py-3 text-center font-semibold text-gray-600">
                    Cantidad
                  </th>

                  {allowsUnitCost && (
                    <>
                      <th className="w-44 px-4 py-3 text-center font-semibold text-gray-600">
                        Precio unitario
                      </th>

                      <th className="w-40 px-4 py-3 text-center font-semibold text-gray-600">
                        Moneda
                      </th>

                      <th className="w-44 px-4 py-3 text-right font-semibold text-gray-600">
                        Total
                      </th>
                    </>
                  )}

                  <th className="w-20 px-4 py-3 text-center font-semibold text-gray-600">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {lines.map(
                  (
                    line,
                  ) => {
                    const product =
                      products.find(
                        (
                          item,
                        ) =>
                          item.id ===
                          line.productId,
                      ) ??
                      null;

                    const stock =
                      getStock(
                        line.productId,
                        getRelevantWarehouseId(),
                      );

                    const duplicated =
                      line.productId >
                        0 &&
                      selectedProductIds.filter(
                        (
                          productId,
                        ) =>
                          productId ===
                          line.productId,
                      ).length >
                        1;

                    const insufficient =
                      requiresAvailableStock &&
                      line.productId >
                        0 &&
                      line.quantity >
                        stock;

                    return (
                      <tr
                        key={
                          line.id
                        }
                        className="align-top"
                      >
                        <td className="px-4 py-3">
                          <select
                            value={
                              line.productId ||
                              ""
                            }
                            onChange={(
                              event,
                            ) =>
                              updateProduct(
                                line.id,
                                Number(
                                  event.target
                                    .value,
                                ),
                              )
                            }
                            disabled={
                              loading
                            }
                            className={`
                              w-full
                              rounded-lg
                              border
                              bg-white
                              p-2.5
                              outline-none
                              focus:ring-2
                              focus:ring-orange-500
                              ${
                                duplicated
                                  ? "border-red-400"
                                  : "border-gray-300"
                              }
                            `}
                          >
                            <option value="">
                              Seleccione producto
                            </option>

                            {activeProducts.map(
                              (
                                item,
                              ) => {
                                const usedElsewhere =
                                  selectedProductIds.includes(
                                    item.id,
                                  ) &&
                                  item.id !==
                                    line.productId;

                                return (
                                  <option
                                    key={
                                      item.id
                                    }
                                    value={
                                      item.id
                                    }
                                    disabled={
                                      usedElsewhere
                                    }
                                  >
                                    {
                                      item.name
                                    }

                                    {
                                      item.sku
                                        ? ` — ${item.sku}`
                                        : ""
                                    }
                                  </option>
                                );
                              },
                            )}
                          </select>

                          {product && (
                            <p className="mt-1 text-xs text-gray-400">
                              {
                                product.internalCode
                                  ? `Código: ${product.internalCode}`
                                  : product.sku
                                    ? `SKU: ${product.sku}`
                                    : ""
                              }
                            </p>
                          )}

                          {duplicated && (
                            <p className="mt-1 text-xs font-medium text-red-600">
                              Producto repetido.
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {line.productId >
                          0 ? (
                            <div>
                              <span
                                className={`
                                  font-semibold
                                  ${
                                    insufficient
                                      ? "text-red-600"
                                      : "text-gray-800"
                                  }
                                `}
                              >
                                {
                                  stock
                                }
                              </span>

                              {product?.unit && (
                                <span className="ml-1 text-xs text-gray-400">
                                  {
                                    product.unit
                                  }
                                </span>
                              )}

                              {!getRelevantWarehouseId() && (
                                <p className="mt-1 text-xs text-gray-400">
                                  Selecciona almacén
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min={
                              1
                            }
                            value={
                              line.quantity
                            }
                            onChange={(
                              event,
                            ) =>
                              updateQuantity(
                                line.id,
                                Number(
                                  event.target
                                    .value,
                                ),
                              )
                            }
                            disabled={
                              loading
                            }
                          />

                          {insufficient && (
                            <p className="mt-1 text-xs font-medium text-red-600">
                              Stock insuficiente.
                            </p>
                          )}
                        </td>

                        {allowsUnitCost && (
                          <>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                min={0}
                                step="0.0001"
                                placeholder="Opcional"
                                value={
                                  line.unitCost ??
                                  ""
                                }
                                onChange={(event) =>
                                  updateUnitCost(
                                    line.id,
                                    event.target.value,
                                  )
                                }
                                disabled={loading}
                              />
                            </td>

                            <td className="px-4 py-3">
                              <select
                                value={
                                  line.unitCost !== undefined
                                    ? line.currency ?? "PEN"
                                    : ""
                                }
                                onChange={(event) =>
                                  updateCurrency(
                                    line.id,
                                    event.target.value as "PEN" | "USD",
                                  )
                                }
                                disabled={
                                  loading ||
                                  line.unitCost === undefined
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-400"
                              >
                                <option value="">—</option>
                                <option value="PEN">
                                  PEN - Soles (S/)
                                </option>
                                <option value="USD">
                                  USD - Dólares (US$)
                                </option>
                              </select>
                            </td>

                            <td className="px-4 py-3 text-right">
                              {line.unitCost !== undefined ? (
                                <div className="pt-2 font-semibold text-gray-800">
                                  {line.currency === "USD"
                                    ? "US$"
                                    : "S/"}{" "}
                                  {Number(
                                    line.quantity * line.unitCost,
                                  ).toLocaleString("es-PE", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </div>
                              ) : (
                                <div className="pt-2 text-gray-300">
                                  —
                                </div>
                              )}
                            </td>
                          </>
                        )}

                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            title="Eliminar producto"
                            onClick={() =>
                              removeLine(
                                line.id,
                              )
                            }
                            disabled={
                              loading ||
                              lines.length ===
                                1
                            }
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Trash2
                              size={
                                17
                              }
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =====================================================
            REFERENCIA Y MOTIVO
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Referencia
            </label>

            <Input
              type="text"
              value={
                reference
              }
              onChange={(
                event,
              ) =>
                setReference(
                  event.target
                    .value,
                )
              }
              placeholder="Ej. VALE-024, ACTA-015..."
              disabled={
                loading
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Resumen
            </label>

            <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600">
              {
                lines.length
              }{" "}
              producto
              {
                lines.length ===
                1
                  ? ""
                  : "s"
              }{" "}
              en esta operación
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Motivo / observación
          </label>

          <textarea
            value={
              reason
            }
            onChange={(
              event,
            ) =>
              setReason(
                event.target
                  .value,
              )
            }
            placeholder="Ej. Consumo interno, materiales para mantenimiento, ajuste por conteo físico..."
            disabled={
              loading
            }
            className="min-h-[90px] w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* =====================================================
            INFORMACIÓN
        ===================================================== */}

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          La operación es atómica: si uno de los productos no puede registrarse, no se aplicará ningún movimiento de esta operación.
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {
              error
            }
          </div>
        )}

        {/* =====================================================
            BOTONES
        ===================================================== */}

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={
              onClose
            }
            disabled={
              loading
            }
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={
              loading
            }
          >
            {
              createBatchMovement.isPending
                ? "Registrando..."
                : lines.length ===
                    1
                  ? "Registrar movimiento"
                  : `Registrar ${lines.length} movimientos`
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
}