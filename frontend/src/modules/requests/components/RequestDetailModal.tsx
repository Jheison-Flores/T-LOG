import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  Truck,
} from "lucide-react";

import {
  Modal,
} from "@/components/ui/Modal";

import type {
  Request,
  RequestStatus,
} from "../types/request.types";

interface Props {
  open:
    boolean;

  request:
    Request | null;

  onClose:
    () => void;
}

// ============================================================
// ESTADO
// ============================================================

function getStatusLabel(
  status:
    RequestStatus,
) {
  switch (
    status
  ) {
    case "PENDING":
      return "Pendiente";

    case "APPROVED":
      return "Aprobada";

    case "PARTIAL":
      return "Aprobada parcialmente";

    case "IN_PROGRESS":
      return "Despacho en proceso";

    case "REJECTED":
      return "Rechazada";

    case "DELIVERED":
      return "Entregada";

    default:
      return status;
  }
}

function getStatusClasses(
  status:
    RequestStatus,
) {
  switch (
    status
  ) {
    case "PENDING":
      return "bg-amber-100 text-amber-700";

    case "APPROVED":
      return "bg-green-100 text-green-700";

    case "PARTIAL":
      return "bg-orange-100 text-orange-700";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";

    case "REJECTED":
      return "bg-red-100 text-red-700";

    case "DELIVERED":
      return "bg-emerald-100 text-emerald-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

// ============================================================
// FECHA
// ============================================================

function formatDate(
  value?:
    | string
    | null,
) {
  if (
    !value
  ) {
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

  return date.toLocaleString(
    "es-PE",
  );
}

export function RequestDetailModal({
  open,
  request,
  onClose,
}: Props) {
  if (
    !open ||
    !request
  ) {
    return null;
  }

  // ============================================================
  // RESUMEN
  // ============================================================

  const totalApproved =
    request.details.reduce(
      (
        total,
        detail,
      ) =>
        total +
        Number(
          detail.approvedQuantity,
        ),
      0,
    );

  const totalDelivered =
    request.details.reduce(
      (
        total,
        detail,
      ) =>
        total +
        Number(
          detail.deliveredQuantity,
        ),
      0,
    );

  const progress =
    totalApproved >
    0
      ? Math.min(
          100,
          Math.round(
            (
              totalDelivered /
              totalApproved
            ) *
              100,
          ),
        )
      : 0;

  return (
    <Modal
      open={
        open
      }
      onClose={
        onClose
      }
      title={
        request.requestNumber
      }
    >
      <div className="space-y-6">

        {/* ===================================================
            CABECERA
        =================================================== */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <div>

            <p className="text-xs text-gray-400">
              Mina / Almacén
            </p>

            <p className="mt-1 font-semibold text-gray-800">
              {
                request.warehouse.name
              }
            </p>

          </div>

          <div>

            <p className="text-xs text-gray-400">
              Solicitante
            </p>

            <p className="mt-1 font-semibold text-gray-800">
              {
                request.requester
              }
            </p>

          </div>

          <div>

            <p className="text-xs text-gray-400">
              Estado
            </p>

            <div className="mt-2">

              <span
                className={`
                  inline-flex
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  ${getStatusClasses(
                    request.status,
                  )}
                `}
              >
                {
                  getStatusLabel(
                    request.status,
                  )
                }
              </span>

            </div>

          </div>

          <div>

            <p className="text-xs text-gray-400">
              Fecha
            </p>

            <p className="mt-1 text-sm font-medium text-gray-700">
              {
                formatDate(
                  request.createdAt,
                )
              }
            </p>

          </div>

          <div>

            <p className="text-xs text-gray-400">
              Creado por
            </p>

            <p className="mt-1 text-sm font-medium text-gray-700">
              {
                [
                  request
                    .createdBy
                    ?.firstName,

                  request
                    .createdBy
                    ?.lastName,
                ]
                  .filter(
                    Boolean,
                  )
                  .join(
                    " ",
                  ) ||
                request
                  .createdBy
                  ?.username ||
                "—"
              }
            </p>

          </div>

          {request.approvedBy && (
            <div>

              <p className="text-xs text-gray-400">
                Revisado por
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                {
                  [
                    request
                      .approvedBy
                      .firstName,

                    request
                      .approvedBy
                      .lastName,
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(
                      " ",
                    ) ||
                  request
                    .approvedBy
                    .username ||
                  "—"
                }
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {
                  formatDate(
                    request.approvedAt,
                  )
                }
              </p>

            </div>
          )}

        </div>

        {/* ===================================================
            PROGRESO
        =================================================== */}

        {totalApproved >
          0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

            <div className="mb-3 flex items-center justify-between">

              <div className="flex items-center gap-2">

                {progress ===
                100 ? (
                  <CheckCircle2
                    size={
                      18
                    }
                    className="text-green-600"
                  />
                ) : (
                  <Clock3
                    size={
                      18
                    }
                    className="text-blue-600"
                  />
                )}

                <span className="text-sm font-semibold text-gray-700">
                  Avance del despacho
                </span>

              </div>

              <span className="text-sm font-bold text-gray-800">
                {
                  progress
                }
                %
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-200">

              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{
                  width:
                    `${progress}%`,
                }}
              />

            </div>

            <div className="mt-3 flex justify-between text-xs text-gray-500">

              <span>
                Enviado:{" "}
                {
                  totalDelivered
                }
              </span>

              <span>
                Aprobado:{" "}
                {
                  totalApproved
                }
              </span>

            </div>

          </div>
        )}

        {/* ===================================================
            PRODUCTOS
        =================================================== */}

        <div>

          <h3 className="mb-3 font-semibold text-gray-800">
            Productos solicitados
          </h3>

          <div className="overflow-x-auto rounded-xl border border-gray-200">

            <table className="min-w-[850px] w-full text-sm">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-4 py-3 text-left text-gray-600">
                    Producto
                  </th>

                  <th className="px-4 py-3 text-center text-gray-600">
                    Solicitado
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

                  <th className="px-4 py-3 text-left text-gray-600">
                    Observación
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {request.details.map(
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

                    return (
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

                            {
                              detail.product.unit
                                ? ` · ${detail.product.unit}`
                                : ""
                            }

                          </p>

                        </td>

                        <td className="px-4 py-3 text-center font-semibold">
                          {
                            Number(
                              detail.quantity,
                            )
                          }
                        </td>

                        <td className="px-4 py-3 text-center text-green-700">
                          {
                            approved
                          }
                        </td>

                        <td className="px-4 py-3 text-center font-semibold text-blue-700">
                          {
                            delivered
                          }
                        </td>

                        <td className="px-4 py-3 text-center">

                          <span
                            className={
                              pending >
                              0
                                ? "font-semibold text-orange-600"
                                : "font-semibold text-green-600"
                            }
                          >
                            {
                              pending
                            }
                          </span>

                        </td>

                        <td className="px-4 py-3 text-gray-500">
                          {
                            detail.observations ||
                            "—"
                          }
                        </td>

                      </tr>
                    );
                  },
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* ===================================================
            HISTORIAL DE DESPACHOS
        =================================================== */}

        <div>

          <div className="mb-3 flex items-center gap-2">

            <Truck
              size={
                18
              }
              className="text-gray-600"
            />

            <h3 className="font-semibold text-gray-800">
              Historial de despachos
            </h3>

          </div>

          {!request.dispatches ||
          request.dispatches.length ===
            0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">

              <PackageCheck
                size={
                  28
                }
                className="mx-auto text-gray-300"
              />

              <p className="mt-2 text-sm text-gray-500">
                Todavía no se registraron despachos.
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              {request.dispatches.map(
                (
                  dispatch,
                ) => (
                  <div
                    key={
                      dispatch.id
                    }
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >

                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">

                      <div>

                        <p className="font-semibold text-gray-800">
                          {
                            dispatch.dispatchNumber
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            formatDate(
                              dispatch.createdAt,
                            )
                          }
                        </p>

                      </div>

                      <div className="text-sm text-gray-600">

                        <span className="font-medium">
                          {
                            dispatch.sourceWarehouse.name
                          }
                        </span>

                        {" → "}

                        <span className="font-medium">
                          {
                            dispatch.destinationWarehouse.name
                          }
                        </span>

                      </div>

                    </div>

                    <div className="mt-4 rounded-lg bg-gray-50">

                      {dispatch.details.map(
                        (
                          detail,
                        ) => (
                          <div
                            key={
                              detail.id
                            }
                            className="flex items-center justify-between border-b border-gray-100 px-3 py-2 last:border-b-0"
                          >

                            <span className="text-sm text-gray-600">
                              {
                                detail.product.name
                              }
                            </span>

                            <span className="text-sm font-semibold text-gray-800">
                              {
                                Number(
                                  detail.quantity,
                                )
                              }{" "}
                              {
                                detail.product.unit
                              }
                            </span>

                          </div>
                        ),
                      )}

                    </div>

                    {dispatch.observations && (
                      <p className="mt-3 text-sm text-gray-500">
                        {
                          dispatch.observations
                        }
                      </p>
                    )}

                  </div>
                ),
              )}

            </div>
          )}

        </div>

        {/* ===================================================
            OBSERVACIONES GENERALES
        =================================================== */}

        {request.observations && (
          <div>

            <p className="text-xs text-gray-400">
              Observaciones
            </p>

            <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
              {
                request.observations
              }
            </p>

          </div>
        )}

        {/* ===================================================
            RECHAZO
        =================================================== */}

        {request.status ===
          "REJECTED" &&
          request.rejectionReason && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">

            <p className="font-semibold text-red-700">
              Motivo del rechazo
            </p>

            <p className="mt-1 text-sm text-red-600">
              {
                request.rejectionReason
              }
            </p>

          </div>
        )}

      </div>
    </Modal>
  );
}