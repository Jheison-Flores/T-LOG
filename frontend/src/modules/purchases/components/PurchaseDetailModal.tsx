import {
  Modal,
} from "@/components/ui/Modal";

import type {
  Purchase,
  PurchaseCurrency,
} from "../types/purchase.types";

interface Props {
  open:
    boolean;

  purchase:
    Purchase | null;

  onClose:
    () => void;
}

export function PurchaseDetailModal({
  open,
  purchase,
  onClose,
}: Props) {
  if (
    !open ||
    !purchase
  ) {
    return null;
  }

  // ============================================================
  // MONEDA
  // ============================================================

  const formatCurrency = (
    value:
      number | string,

    currency:
      PurchaseCurrency,
  ) =>
    Number(
      value,
    ).toLocaleString(
      "es-PE",
      {
        style:
          "currency",

        currency,

        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      },
    );

  // ============================================================
  // FECHA
  // ============================================================

  const formatDate = (
    value?:
      string | null,
  ) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(
        value,
      );

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "es-PE",
    );
  };

  const received =
    purchase.status ===
    "RECEIVED";

  return (
    <Modal
      open={
        open
      }
      onClose={
        onClose
      }
      title={`Orden de Compra ${purchase.purchaseOrderNumber}`}
    >
      <div className="space-y-6">
        {/* =====================================================
            INFORMACIÓN
        ===================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
          "
        >
          <div>
            <p className="text-xs text-gray-400">
              Número de OC
            </p>

            <p className="mt-1 font-semibold text-gray-800">
              {
                purchase.purchaseOrderNumber
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Fecha
            </p>

            <p className="mt-1 font-medium text-gray-700">
              {
                formatDate(
                  purchase.purchaseDate,
                )
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Requerimiento
            </p>

            <p className="mt-1 font-medium text-gray-700">
              {
                purchase.request
                  ?.requestNumber ??
                "Sin requerimiento asociado"
              }
            </p>

            {purchase.request && (
              <p className="mt-1 text-xs text-gray-400">
                {
                  purchase.request
                    .warehouse.name
                }
              </p>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-400">
              N° Cotización
            </p>

            <p className="mt-1 font-medium text-gray-700">
              {
                purchase.quotationNumber ??
                "—"
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Moneda
            </p>

            <p className="mt-1 font-semibold text-gray-700">
              {
                purchase.currency ===
                "PEN"
                  ? "PEN - Soles"
                  : "USD - Dólares"
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Estado
            </p>

            <div className="mt-2">
              {received ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Recibida
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Emitida
                </span>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            PROVEEDOR
        ===================================================== */}

        <div
          className="
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            p-4
          "
        >
          <h3 className="font-semibold text-gray-800">
            Proveedor
          </h3>

          <div
            className="
              mt-3
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
            "
          >
            <div>
              <p className="text-xs text-gray-400">
                Razón social
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {
                  purchase.supplier.name
                }
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                RUC
              </p>

              <p className="mt-1 font-medium text-gray-700">
                {
                  purchase.supplier.ruc ??
                  "—"
                }
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs text-gray-400">
                Dirección
              </p>

              <p className="mt-1 font-medium text-gray-700">
                {
                  purchase.supplier.address ??
                  "—"
                }
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            PRODUCTOS
        ===================================================== */}

        <div>
          <h3 className="mb-3 font-semibold text-gray-800">
            Productos
          </h3>

          <div
            className="
              overflow-x-auto
              rounded-xl
              border
              border-gray-200
            "
          >
            <table
              className="
                min-w-[700px]
                w-full
                text-sm
              "
            >
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600">
                    Producto
                  </th>

                  <th className="px-4 py-3 text-center text-gray-600">
                    U.M.
                  </th>

                  <th className="px-4 py-3 text-center text-gray-600">
                    Cant.
                  </th>

                  <th className="px-4 py-3 text-right text-gray-600">
                    P. Unit.
                  </th>

                  <th className="px-4 py-3 text-right text-gray-600">
                    Importe
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {purchase.details.map(
                  (
                    detail,
                  ) => (
                    <tr
                      key={
                        detail.id
                      }
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">
                          {
                            detail.product.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {
                            detail.product.internalCode ??
                            detail.product.sku ??
                            ""
                          }
                        </p>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {
                          detail.product.unit
                        }
                      </td>

                      <td className="px-4 py-3 text-center">
                        {
                          detail.quantity
                        }
                      </td>

                      <td className="px-4 py-3 text-right">
                        {
                          formatCurrency(
                            detail.unitPrice,
                            purchase.currency,
                          )
                        }
                      </td>

                      <td className="px-4 py-3 text-right font-semibold">
                        {
                          formatCurrency(
                            detail.subtotal,
                            purchase.currency,
                          )
                        }
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =====================================================
            TOTALES
        ===================================================== */}

        <div className="flex justify-end">
          <div
            className="
              w-full
              max-w-sm
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              p-4
            "
          >
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Subtotal
              </span>

              <span className="font-semibold">
                {
                  formatCurrency(
                    purchase.subtotalAmount,
                    purchase.currency,
                  )
                }
              </span>
            </div>

            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-500">
                IGV
                {purchase.applyIgv
                  ? " 18 %"
                  : ""}
              </span>

              <span className="font-semibold">
                {
                  formatCurrency(
                    purchase.igvAmount,
                    purchase.currency,
                  )
                }
              </span>
            </div>

            <div className="my-3 border-t border-gray-200" />

            <div className="flex justify-between">
              <span className="font-bold text-gray-900">
                TOTAL
              </span>

              <span className="text-xl font-bold text-orange-600">
                {
                  formatCurrency(
                    purchase.totalAmount,
                    purchase.currency,
                  )
                }
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            CONDICIONES
        ===================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
          "
        >
          <div>
            <p className="text-xs text-gray-400">
              Condiciones comerciales
            </p>

            <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
              {
                purchase.commercialConditions ??
                "—"
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Forma de pago
            </p>

            <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
              {
                purchase.paymentMethod ??
                "—"
              }
            </p>
          </div>
        </div>

        {/* =====================================================
            RECEPCIÓN
        ===================================================== */}

        {received && (
          <div
            className="
              rounded-xl
              border
              border-green-200
              bg-green-50
              p-4
            "
          >
            <p className="font-semibold text-green-700">
              Mercadería recibida
            </p>

            <p className="mt-1 text-sm text-green-700">
              Almacén:{" "}
              {
                purchase.receivedWarehouse
                  ?.name ??
                "—"
              }
            </p>

            <p className="mt-1 text-sm text-green-700">
              Fecha:{" "}
              {
                formatDate(
                  purchase.receivedAt,
                )
              }
            </p>

            {purchase.receivedBy && (
              <p className="mt-1 text-sm text-green-700">
                Recibido por:{" "}
                {[
                  purchase.receivedBy.firstName,
                  purchase.receivedBy.lastName,
                ]
                  .filter(Boolean)
                  .join(" ") ||
                  purchase.receivedBy.username ||
                  "—"}
              </p>
            )}
          </div>
        )}

        {/* =====================================================
            OBSERVACIÓN
        ===================================================== */}

        {purchase.observation && (
          <div>
            <p className="text-xs text-gray-400">
              Observación
            </p>

            <p className="mt-2 text-sm text-gray-600">
              {
                purchase.observation
              }
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}