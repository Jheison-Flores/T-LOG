import {
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  FileText,
  XCircle,
} from "lucide-react";

import type {
  Request,
  RequestStatus,
} from "../types/request.types";

interface Props {
  requests:
    Request[];

  canApprove:
    boolean;

  onView: (
    request:
      Request,
  ) => void;

  onApprove: (
    request:
      Request,
  ) => void;

  onReject: (
    request:
      Request,
  ) => void;

  onDownloadPdf: (
    request:
      Request,
  ) => void;

  onDownloadExcel: (
    request:
      Request,
  ) => void;
}

// ============================================================
// ETIQUETA DE ESTADO
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
      return "Aprobado";

    case "PARTIAL":
      return "Aprobado parcialmente";

    case "REJECTED":
      return "Rechazado";

    /*
     * Estos estados se conservan únicamente para registros
     * antiguos que ya fueron procesados antes del nuevo flujo.
     */

    case "IN_PROGRESS":
      return "En despacho";

    case "DELIVERED":
      return "Despachado";

    default:
      return status;
  }
}

// ============================================================
// COLOR DE ESTADO
// ============================================================

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

    case "REJECTED":
      return "bg-red-100 text-red-700";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";

    case "DELIVERED":
      return "bg-emerald-100 text-emerald-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

// ============================================================
// TABLA
// ============================================================

export function RequestTable({
  requests,
  canApprove,
  onView,
  onApprove,
  onReject,
  onDownloadPdf,
  onDownloadExcel,
}: Props) {
  // ============================================================
  // SIN REQUERIMIENTOS
  // ============================================================

  if (
    requests.length ===
    0
  ) {
    return (
      <div
        className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-10
          text-center
        "
      >
        <p className="font-medium text-gray-500">
          No se encontraron requerimientos.
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Crea un nuevo requerimiento o modifica los filtros.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-gray-200
        bg-white
        shadow-sm
      "
    >
      <div className="overflow-x-auto">
        <table
          className="
            min-w-[1050px]
            w-full
            text-sm
          "
        >
          {/* ===================================================
              CABECERA
          =================================================== */}

          <thead
            className="
              border-b
              border-gray-200
              bg-gray-50
            "
          >
            <tr>
              <th className="px-5 py-4 text-left font-semibold text-gray-600">
                Requerimiento
              </th>

              <th className="px-5 py-4 text-left font-semibold text-gray-600">
                Mina / Almacén
              </th>

              <th className="px-5 py-4 text-left font-semibold text-gray-600">
                Solicitante
              </th>

              <th className="px-5 py-4 text-center font-semibold text-gray-600">
                Productos
              </th>

              <th className="px-5 py-4 text-center font-semibold text-gray-600">
                Estado
              </th>

              <th className="px-5 py-4 text-left font-semibold text-gray-600">
                Fecha
              </th>

              <th className="px-5 py-4 text-right font-semibold text-gray-600">
                Acciones
              </th>
            </tr>
          </thead>

          {/* ===================================================
              CUERPO
          =================================================== */}

          <tbody className="divide-y divide-gray-100">
            {requests.map(
              (
                request,
              ) => {
                const pending =
                  request.status ===
                  "PENDING";

                return (
                  <tr
                    key={
                      request.id
                    }
                    className="
                      transition-colors
                      hover:bg-gray-50
                    "
                  >
                    {/* ===========================================
                        REQUERIMIENTO
                    =========================================== */}

                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">
                        {
                          request.requestNumber
                        }
                      </p>
                    </td>

                    {/* ===========================================
                        MINA / ALMACÉN
                    =========================================== */}

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-700">
                        {
                          request.warehouse.name
                        }
                      </p>

                      {request
                        .warehouse
                        .city && (
                        <p className="mt-1 text-xs text-gray-400">
                          {
                            request
                              .warehouse
                              .city
                          }
                        </p>
                      )}
                    </td>

                    {/* ===========================================
                        SOLICITANTE
                    =========================================== */}

                    <td className="px-5 py-4 text-gray-600">
                      {
                        request.requester
                      }
                    </td>

                    {/* ===========================================
                        PRODUCTOS
                    =========================================== */}

                    <td className="px-5 py-4 text-center">
                      <span
                        className="
                          inline-flex
                          min-w-8
                          items-center
                          justify-center
                          rounded-full
                          bg-gray-100
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          text-gray-700
                        "
                      >
                        {
                          request.details.length
                        }
                      </span>
                    </td>

                    {/* ===========================================
                        ESTADO
                    =========================================== */}

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-2.5
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
                    </td>

                    {/* ===========================================
                        FECHA
                    =========================================== */}

                    <td className="px-5 py-4 whitespace-nowrap text-gray-600">
                      {new Date(
                        request.createdAt,
                      ).toLocaleDateString(
                        "es-PE",
                      )}
                    </td>

                    {/* ===========================================
                        ACCIONES
                    =========================================== */}

                    <td className="px-5 py-4">
                      <div
                        className="
                          flex
                          items-center
                          justify-end
                          gap-1
                        "
                      >
                        {/* =====================================
                            VER
                        ===================================== */}

                        <button
                          type="button"
                          title="Ver detalle"
                          onClick={() =>
                            onView(
                              request,
                            )
                          }
                          className="
                            rounded-lg
                            p-2
                            text-gray-500
                            transition-colors
                            hover:bg-blue-50
                            hover:text-blue-600
                          "
                        >
                          <Eye
                            size={17}
                          />
                        </button>

                        {/* =====================================
                            PDF
                        ===================================== */}

                        <button
                          type="button"
                          title="Descargar PDF"
                          onClick={() =>
                            onDownloadPdf(
                              request,
                            )
                          }
                          className="
                            rounded-lg
                            p-2
                            text-gray-500
                            transition-colors
                            hover:bg-red-50
                            hover:text-red-600
                          "
                        >
                          <FileText
                            size={17}
                          />
                        </button>

                        {/* =====================================
                            EXCEL
                        ===================================== */}

                        <button
                          type="button"
                          title="Descargar Excel"
                          onClick={() =>
                            onDownloadExcel(
                              request,
                            )
                          }
                          className="
                            rounded-lg
                            p-2
                            text-gray-500
                            transition-colors
                            hover:bg-green-50
                            hover:text-green-600
                          "
                        >
                          <FileSpreadsheet
                            size={17}
                          />
                        </button>

                        {/* =====================================
                            APROBAR / RECHAZAR

                            Solo aparecen mientras el
                            requerimiento está PENDING.
                        ===================================== */}

                        {canApprove &&
                          pending && (
                            <>
                              <button
                                type="button"
                                title="Revisar y aprobar requerimiento"
                                onClick={() =>
                                  onApprove(
                                    request,
                                  )
                                }
                                className="
                                  rounded-lg
                                  p-2
                                  text-gray-500
                                  transition-colors
                                  hover:bg-green-50
                                  hover:text-green-600
                                "
                              >
                                <CheckCircle2
                                  size={17}
                                />
                              </button>

                              <button
                                type="button"
                                title="Rechazar requerimiento"
                                onClick={() =>
                                  onReject(
                                    request,
                                  )
                                }
                                className="
                                  rounded-lg
                                  p-2
                                  text-gray-500
                                  transition-colors
                                  hover:bg-red-50
                                  hover:text-red-600
                                "
                              >
                                <XCircle
                                  size={17}
                                />
                              </button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}