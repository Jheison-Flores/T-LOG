import {
  Eye,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

import type {
  RemissionGuide,
} from "../types/remission-guide.types";

interface Props {
  guides: RemissionGuide[];

  onView: (
    guide: RemissionGuide,
  ) => void;

  onDownloadPdf: (
    guide: RemissionGuide,
  ) => void;

  onDownloadExcel: (
    guide: RemissionGuide,
  ) => void;

  downloadingPdfId?:
    number | null;

  downloadingExcelId?:
    number | null;
}

// ============================================================
// FECHA
// ============================================================

function formatDate(
  value: string,
): string {
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    const [
      year,
      month,
      day,
    ] =
      value.split(
        "-",
      );

    return `${day}/${month}/${year}`;
  }

  return value;
}

// ============================================================
// TIPO DE GUÍA
// ============================================================

function getGuideTypeLabel(
  guide: RemissionGuide,
): string {
  switch (
    guide.guideType
  ) {
    case "MANUAL_WAREHOUSE":
      return "Manual a mina";

    case "EXTERNAL_SERVICE":
      return "Servicio externo";

    case "REQUEST":
    default:
      return "Por requerimiento";
  }
}

// ============================================================
// DESTINO
// ============================================================

function getDestinationName(
  guide: RemissionGuide,
): string {
  if (
    guide.destinationWarehouse
  ) {
    return guide
      .destinationWarehouse
      .name;
  }

  return (
    guide.recipientName ||
    "Destino externo"
  );
}

function getDestinationSubtitle(
  guide: RemissionGuide,
): string {
  if (
    guide.destinationWarehouse
  ) {
    return (
      guide
        .destinationWarehouse
        .city ??
      ""
    );
  }

  return (
    guide.arrivalPoint ??
    ""
  );
}

// ============================================================
// TABLA
// ============================================================

export function RemissionGuideTable({
  guides,
  onView,
  onDownloadPdf,
  onDownloadExcel,
  downloadingPdfId = null,
  downloadingExcelId = null,
}: Props) {
  if (
    guides.length ===
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
          No se encontraron guías de remisión.
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
      <div
        className="
          overflow-x-auto
        "
      >
        <table
          className="
            min-w-[1250px]
            w-full
            text-sm
          "
        >
          <thead
            className="
              border-b
              border-gray-200
              bg-gray-50
            "
          >
            <tr>
              <th
                className="
                  px-5
                  py-4
                  text-left
                  font-semibold
                  text-gray-600
                "
              >
                Guía
              </th>

              <th
                className="
                  px-5
                  py-4
                  text-left
                  font-semibold
                  text-gray-600
                "
              >
                Tipo
              </th>

              <th
                className="
                  px-5
                  py-4
                  text-left
                  font-semibold
                  text-gray-600
                "
              >
                Requerimiento
              </th>

              <th
                className="
                  px-5
                  py-4
                  text-left
                  font-semibold
                  text-gray-600
                "
              >
                Origen
              </th>

              <th
                className="
                  px-5
                  py-4
                  text-left
                  font-semibold
                  text-gray-600
                "
              >
                Destino
              </th>

              <th
                className="
                  px-5
                  py-4
                  text-center
                  font-semibold
                  text-gray-600
                "
              >
                Productos
              </th>

              <th
                className="
                  px-5
                  py-4
                  text-left
                  font-semibold
                  text-gray-600
                "
              >
                Fecha
              </th>

              <th
                className="
                  px-5
                  py-4
                  text-center
                  font-semibold
                  text-gray-600
                "
              >
                Estado
              </th>

              <th
                className="
                  px-5
                  py-4
                  text-right
                  font-semibold
                  text-gray-600
                "
              >
                Acciones
              </th>
            </tr>
          </thead>

          <tbody
            className="
              divide-y
              divide-gray-100
            "
          >
            {guides.map(
              (
                guide,
              ) => {
                const pdfLoading =
                  downloadingPdfId ===
                  guide.id;

                const excelLoading =
                  downloadingExcelId ===
                  guide.id;

                const requestNumber =
                  guide.request
                    ?.requestNumber ??
                  "—";

                const destinationName =
                  getDestinationName(
                    guide,
                  );

                const destinationSubtitle =
                  getDestinationSubtitle(
                    guide,
                  );

                return (
                  <tr
                    key={
                      guide.id
                    }
                    className="
                      transition-colors
                      hover:bg-gray-50
                    "
                  >
                    {/* GUÍA */}

                    <td
                      className="
                        px-5
                        py-4
                      "
                    >
                      <p
                        className="
                          font-semibold
                          text-gray-800
                        "
                      >
                        {
                          guide.fullNumber
                        }
                      </p>

                      {guide.vehiclePlate && (
                        <p
                          className="
                            mt-1
                            text-xs
                            text-gray-400
                          "
                        >
                          Placa:{" "}
                          {
                            guide.vehiclePlate
                          }
                        </p>
                      )}
                    </td>

                    {/* TIPO */}

                    <td
                      className="
                        px-5
                        py-4
                      "
                    >
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          ${
                            guide.guideType ===
                            "EXTERNAL_SERVICE"
                              ? "bg-violet-100 text-violet-700"
                              : guide.guideType ===
                                  "MANUAL_WAREHOUSE"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                          }
                        `}
                      >
                        {
                          getGuideTypeLabel(
                            guide,
                          )
                        }
                      </span>
                    </td>

                    {/* REQUERIMIENTO */}

                    <td
                      className="
                        px-5
                        py-4
                      "
                    >
                      <p
                        className="
                          font-medium
                          text-gray-700
                        "
                      >
                        {
                          requestNumber
                        }
                      </p>
                    </td>

                    {/* ORIGEN */}

                    <td
                      className="
                        px-5
                        py-4
                        text-gray-600
                      "
                    >
                      {
                        guide
                          .sourceWarehouse
                          ?.name ??
                        "—"
                      }
                    </td>

                    {/* DESTINO */}

                    <td
                      className="
                        px-5
                        py-4
                      "
                    >
                      <p
                        className="
                          font-medium
                          text-gray-700
                        "
                      >
                        {
                          destinationName
                        }
                      </p>

                      {destinationSubtitle && (
                        <p
                          className="
                            mt-1
                            max-w-[260px]
                            truncate
                            text-xs
                            text-gray-400
                          "
                          title={
                            destinationSubtitle
                          }
                        >
                          {
                            destinationSubtitle
                          }
                        </p>
                      )}
                    </td>

                    {/* PRODUCTOS */}

                    <td
                      className="
                        px-5
                        py-4
                        text-center
                      "
                    >
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
                          guide.details
                            ?.length ??
                          0
                        }
                      </span>
                    </td>

                    {/* FECHA */}

                    <td
                      className="
                        px-5
                        py-4
                        text-gray-600
                      "
                    >
                      {
                        formatDate(
                          guide.issueDate,
                        )
                      }
                    </td>

                    {/* ESTADO */}

                    <td
                      className="
                        px-5
                        py-4
                        text-center
                      "
                    >
                      {guide.status ===
                      "ISSUED" ? (
                        <span
                          className="
                            rounded-full
                            bg-green-100
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-green-700
                          "
                        >
                          Emitida
                        </span>
                      ) : (
                        <span
                          className="
                            rounded-full
                            bg-red-100
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-red-700
                          "
                        >
                          Anulada
                        </span>
                      )}
                    </td>

                    {/* ACCIONES */}

                    <td
                      className="
                        px-5
                        py-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-end
                          gap-1
                        "
                      >
                        {/* VER */}

                        <button
                          type="button"
                          title="Ver guía"
                          onClick={() =>
                            onView(
                              guide,
                            )
                          }
                          className="
                            rounded-lg
                            p-2
                            text-gray-500
                            transition
                            hover:bg-blue-50
                            hover:text-blue-600
                          "
                        >
                          <Eye
                            size={
                              17
                            }
                          />
                        </button>

                        {/* PDF */}

                        <button
                          type="button"
                          title={
                            pdfLoading
                              ? "Generando PDF..."
                              : "Descargar PDF"
                          }
                          disabled={
                            pdfLoading ||
                            excelLoading
                          }
                          onClick={() =>
                            onDownloadPdf(
                              guide,
                            )
                          }
                          className="
                            rounded-lg
                            p-2
                            text-gray-500
                            transition
                            hover:bg-red-50
                            hover:text-red-600
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                          "
                        >
                          <FileText
                            size={
                              17
                            }
                          />
                        </button>

                        {/* EXCEL */}

                        <button
                          type="button"
                          title={
                            excelLoading
                              ? "Generando Excel..."
                              : "Descargar Excel"
                          }
                          disabled={
                            excelLoading ||
                            pdfLoading
                          }
                          onClick={() =>
                            onDownloadExcel(
                              guide,
                            )
                          }
                          className="
                            rounded-lg
                            p-2
                            text-gray-500
                            transition
                            hover:bg-green-50
                            hover:text-green-600
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                          "
                        >
                          <FileSpreadsheet
                            size={
                              17
                            }
                          />
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
    </div>
  );
}