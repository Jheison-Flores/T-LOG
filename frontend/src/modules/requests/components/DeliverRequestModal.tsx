import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  PackageCheck,
  Truck,
} from "lucide-react";

import {
  Modal,
} from "@/components/ui/Modal";

import {
  Button,
} from "@/components/ui/Button";

import {
  Input,
} from "@/components/ui/Input";

import type {
  Warehouse,
} from "@/modules/warehouses/types/warehouse.types";

import type {
  DeliverRequestDto,
  Request,
} from "../types/request.types";

interface DispatchLine {
  detailId:
    number;

  productName:
    string;

  unit:
    string;

  approved:
    number;

  delivered:
    number;

  pending:
    number;

  quantity:
    string;
}

interface Props {
  open:
    boolean;

  request:
    Request | null;

  warehouses:
    Warehouse[];

  loading?:
    boolean;

  onClose:
    () => void;

  onConfirm: (
    data:
      DeliverRequestDto,
  ) => void;
}

export function DeliverRequestModal({
  open,
  request,
  warehouses,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  const [
    sourceWarehouseId,
    setSourceWarehouseId,
  ] =
    useState("");

  const [
    lines,
    setLines,
  ] =
    useState<DispatchLine[]>(
      [],
    );

  const [
    observations,
    setObservations,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  // ============================================================
  // INICIALIZAR
  // ============================================================

  useEffect(() => {
    if (
      !open ||
      !request
    ) {
      return;
    }

    const available =
      warehouses.filter(
        (
          warehouse,
        ) =>
          warehouse.isActive &&
          warehouse.id !==
            request.warehouse.id,
      );

    const central =
      available.find(
        (
          warehouse,
        ) =>
          String(
            warehouse.type,
          ).toUpperCase() ===
          "CENTRAL",
      );

    const lima =
      available.find(
        (
          warehouse,
        ) =>
          warehouse.city
            ?.toLowerCase() ===
            "lima" ||
          warehouse.name
            .toLowerCase()
            .includes(
              "lima",
            ),
      );

    const suggested =
      central ??
      lima ??
      (
        available.length ===
        1
          ? available[0]
          : undefined
      );

    setSourceWarehouseId(
      suggested
        ? String(
            suggested.id,
          )
        : "",
    );

    const availableLines =
      request.details
        .filter(
          (
            detail,
          ) => {
            const approved =
              Number(
                detail.approvedQuantity,
              );

            const delivered =
              Number(
                detail.deliveredQuantity,
              );

            return (
              approved >
              delivered
            );
          },
        )
        .map(
          (
            detail,
          ) => {
            const approved =
              Number(
                detail.approvedQuantity,
              );

            const delivered =
              Number(
                detail.deliveredQuantity,
              );

            const pending =
              Math.max(
                approved -
                  delivered,
                0,
              );

            return {
              detailId:
                detail.id,

              productName:
                detail.product
                  .name,

              unit:
                detail.product
                  .unit,

              approved,

              delivered,

              pending,

              quantity:
                "",
            };
          },
        );

    setLines(
      availableLines,
    );

    setObservations(
      "",
    );

    setError(
      "",
    );
  }, [
    open,
    request,
    warehouses,
  ]);

  // ============================================================
  // RESUMEN
  // ============================================================

  const summary =
    useMemo(() => {
      const productCount =
        lines.filter(
          (
            line,
          ) =>
            Number(
              line.quantity,
            ) >
            0,
        ).length;

      const totalQuantity =
        lines.reduce(
          (
            total,
            line,
          ) => {
            const quantity =
              Number(
                line.quantity,
              );

            return (
              total +
              (
                Number.isFinite(
                  quantity,
                )
                  ? quantity
                  : 0
              )
            );
          },
          0,
        );

      return {
        productCount,
        totalQuantity,
      };
    }, [
      lines,
    ]);

  if (
    !open ||
    !request
  ) {
    return null;
  }

  // ============================================================
  // ALMACENES DE ORIGEN
  // ============================================================

  const sourceWarehouses =
    warehouses.filter(
      (
        warehouse,
      ) =>
        warehouse.isActive &&
        warehouse.id !==
          request.warehouse.id,
    );

  // ============================================================
  // MODIFICAR CANTIDAD
  // ============================================================

  const updateQuantity = (
    detailId:
      number,

    value:
      string,
  ) => {
    setLines(
      (
        previous,
      ) =>
        previous.map(
          (
            line,
          ) =>
            line.detailId ===
            detailId
              ? {
                  ...line,
                  quantity:
                    value,
                }
              : line,
        ),
    );

    setError(
      "",
    );
  };

  // ============================================================
  // DESPACHAR TODO PENDIENTE
  // ============================================================

  const fillAllPending =
    () => {
      setLines(
        (
          previous,
        ) =>
          previous.map(
            (
              line,
            ) => ({
              ...line,

              quantity:
                String(
                  line.pending,
                ),
            }),
          ),
      );

      setError(
        "",
      );
    };

  // ============================================================
  // CONFIRMAR
  // ============================================================

  const handleConfirm =
    () => {
      setError(
        "",
      );

      const sourceId =
        Number(
          sourceWarehouseId,
        );

      if (
        !sourceId
      ) {
        setError(
          "Selecciona el almacén de origen.",
        );

        return;
      }

      const details =
        lines.map(
          (
            line,
          ) => ({
            detailId:
              line.detailId,

            quantity:
              Number(
                line.quantity ||
                  0,
              ),
          }),
        );

      let hasQuantity =
        false;

      for (
        let index =
          0;
        index <
        details.length;
        index++
      ) {
        const detail =
          details[index];

        const original =
          lines[index];

        if (
          !Number.isFinite(
            detail.quantity,
          )
        ) {
          setError(
            `Cantidad inválida para ${original.productName}.`,
          );

          return;
        }

        if (
          detail.quantity <
          0
        ) {
          setError(
            "Las cantidades a despachar no pueden ser negativas.",
          );

          return;
        }

        if (
          detail.quantity >
          original.pending
        ) {
          setError(
            `Solo quedan ${original.pending} ${original.unit} pendientes de ${original.productName}.`,
          );

          return;
        }

        if (
          detail.quantity >
          0
        ) {
          hasQuantity =
            true;
        }
      }

      if (
        !hasQuantity
      ) {
        setError(
          "Ingresa una cantidad mayor a cero para al menos un producto.",
        );

        return;
      }

      onConfirm({
        sourceWarehouseId:
          sourceId,

        details,

        observations:
          observations
            .trim() ||
          undefined,
      });
    };

  return (
    <Modal
      open={
        open
      }
      onClose={
        onClose
      }
      title="Despachar solicitud"
    >
      <div className="space-y-5">

        {/* ===================================================
            CABECERA
        =================================================== */}

        <div
          className="
            rounded-xl
            border
            border-blue-200
            bg-blue-50
            p-4
          "
        >
          <div className="flex items-start gap-3">

            <PackageCheck
              size={
                22
              }
              className="mt-0.5 text-blue-600"
            />

            <div>

              <p className="font-semibold text-blue-800">
                {
                  request.requestNumber
                }
              </p>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  gap-2
                  text-sm
                  text-blue-700
                "
              >
                <span>
                  Almacén central
                </span>

                <ArrowRight
                  size={
                    15
                  }
                />

                <span>
                  {
                    request
                      .warehouse
                      .name
                  }
                </span>
              </div>

            </div>

          </div>
        </div>

        {/* ===================================================
            ALMACÉN ORIGEN
        =================================================== */}

        <div>

          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Almacén de origen *
          </label>

          <select
            value={
              sourceWarehouseId
            }
            disabled={
              loading
            }
            onChange={(
              event,
            ) => {
              setSourceWarehouseId(
                event.target.value,
              );

              setError(
                "",
              );
            }}
            className="
              h-10
              w-full
              rounded-lg
              border
              border-gray-300
              bg-white
              px-3
              text-sm
              text-gray-700
              outline-none
              focus:border-orange-500
              focus:ring-2
              focus:ring-orange-100
            "
          >

            <option value="">
              Selecciona almacén
            </option>

            {sourceWarehouses.map(
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
                    warehouse.city
                      ? ` - ${warehouse.city}`
                      : ""
                  }
                </option>
              ),
            )}

          </select>

        </div>

        {/* ===================================================
            PRODUCTOS
        =================================================== */}

        <div>

          <div className="mb-3 flex items-center justify-between gap-4">

            <div>
              <p className="font-semibold text-gray-800">
                Productos pendientes
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Indica únicamente la cantidad que saldrá en este despacho.
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              disabled={
                loading
              }
              onClick={
                fillAllPending
              }
            >
              Todo lo pendiente
            </Button>

          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">

            <table className="min-w-[820px] w-full text-sm">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-4 py-3 text-left text-gray-600">
                    Producto
                  </th>

                  <th className="px-4 py-3 text-center text-gray-600">
                    Aprobado
                  </th>

                  <th className="px-4 py-3 text-center text-gray-600">
                    Enviado
                  </th>

                  <th className="px-4 py-3 text-center text-gray-600">
                    Pendiente
                  </th>

                  <th className="px-4 py-3 text-center text-gray-600">
                    Enviar ahora
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {lines.map(
                  (
                    line,
                  ) => (
                    <tr
                      key={
                        line.detailId
                      }
                    >

                      <td className="px-4 py-3">

                        <p className="font-medium text-gray-800">
                          {
                            line.productName
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {
                            line.unit
                          }
                        </p>

                      </td>

                      <td className="px-4 py-3 text-center font-semibold text-gray-700">
                        {
                          line.approved
                        }
                      </td>

                      <td className="px-4 py-3 text-center text-blue-600">
                        {
                          line.delivered
                        }
                      </td>

                      <td className="px-4 py-3 text-center font-semibold text-orange-600">
                        {
                          line.pending
                        }
                      </td>

                      <td className="px-4 py-3">

                        <div className="mx-auto w-28">

                          <Input
                            type="number"
                            min={
                              0
                            }
                            max={
                              line.pending
                            }
                            step="0.01"
                            disabled={
                              loading
                            }
                            value={
                              line.quantity
                            }
                            placeholder="0"
                            onChange={(
                              event,
                            ) =>
                              updateQuantity(
                                line.detailId,
                                event.target.value,
                              )
                            }
                          />

                        </div>

                      </td>

                    </tr>
                  ),
                )}

                {lines.length ===
                  0 && (
                  <tr>

                    <td
                      colSpan={
                        5
                      }
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No existen productos pendientes de despacho.
                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* ===================================================
            RESUMEN
        =================================================== */}

        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-xl bg-gray-50 p-4 text-center">

            <p className="text-xl font-bold text-gray-800">
              {
                summary.productCount
              }
            </p>

            <p className="text-xs text-gray-500">
              Productos en este despacho
            </p>

          </div>

          <div className="rounded-xl bg-blue-50 p-4 text-center">

            <p className="text-xl font-bold text-blue-700">
              {
                summary.totalQuantity
              }
            </p>

            <p className="text-xs text-blue-600">
              Cantidad total
            </p>

          </div>

        </div>

        {/* ===================================================
            OBSERVACIONES
        =================================================== */}

        <div>

          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Observación del despacho
          </label>

          <textarea
            rows={
              3
            }
            disabled={
              loading
            }
            value={
              observations
            }
            onChange={(
              event,
            ) =>
              setObservations(
                event.target.value,
              )
            }
            placeholder="Ej. Primer envío, queda material pendiente por fabricar..."
            className="
              w-full
              resize-none
              rounded-lg
              border
              border-gray-300
              px-3
              py-2
              text-sm
              outline-none
              focus:border-orange-500
              focus:ring-2
              focus:ring-orange-100
            "
          />

        </div>

        {/* ===================================================
            AVISO
        =================================================== */}

        <div
          className="
            flex
            gap-3
            rounded-xl
            border
            border-amber-200
            bg-amber-50
            p-4
            text-sm
            text-amber-700
          "
        >

          <Truck
            size={
              20
            }
            className="shrink-0"
          />

          <p>
            Solo se descontarán del inventario las cantidades indicadas en
            <strong>
              {" "}Enviar ahora
            </strong>.
            Lo restante continuará pendiente para futuros despachos.
          </p>

        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {
              error
            }
          </div>
        )}

        {/* ===================================================
            BOTONES
        =================================================== */}

        <div className="flex justify-end gap-3">

          <Button
            type="button"
            variant="secondary"
            disabled={
              loading
            }
            onClick={
              onClose
            }
          >
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={
              loading ||
              lines.length ===
                0
            }
            onClick={
              handleConfirm
            }
          >
            {
              loading
                ? "Despachando..."
                : "Registrar despacho"
            }
          </Button>

        </div>

      </div>
    </Modal>
  );
}