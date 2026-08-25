import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

import type {
  RouteSheet,
} from "../types/route-sheet.types";

interface Props {
  routeSheets:
    RouteSheet[];

  onView: (
    routeSheet:
      RouteSheet,
  ) => void;

  onDownloadPdf: (
    routeSheet:
      RouteSheet,
  ) => void;

  onDownloadExcel: (
    routeSheet:
      RouteSheet,
  ) => void;

  downloadingPdfId?:
    number | null;

  downloadingExcelId?:
    number | null;
}

function formatDate(
  value:
    string,
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
      value.split("-");

    return `${day}/${month}/${year}`;
  }

  return value;
}

function getRequestNumber(
  routeSheet:
    RouteSheet,
): string {
  return (
    routeSheet.request
      ?.requestNumber ??
    "SIN REQUERIMIENTO"
  );
}

function getGuideTypeLabel(
  routeSheet:
    RouteSheet,
): string {
  const guideType =
    routeSheet.remissionGuide
      ?.guideType;

  if (
    guideType ===
    "MANUAL_WAREHOUSE"
  ) {
    return "Manual a mina";
  }

  if (
    guideType ===
    "REQUEST"
  ) {
    return "Por requerimiento";
  }

  return "—";
}

export function RouteSheetTable({
  routeSheets,
  onView,
  onDownloadPdf,
  onDownloadExcel,
  downloadingPdfId = null,
  downloadingExcelId = null,
}: Props) {
  if (
    routeSheets.length ===
    0
  ) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <p className="font-medium text-gray-500">
          No se encontraron hojas de recorrido.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1250px] w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-5 py-4 text-left">
                Hoja
              </th>

              <th className="px-5 py-4 text-left">
                Guía
              </th>

              <th className="px-5 py-4 text-left">
                Tipo
              </th>

              <th className="px-5 py-4 text-left">
                Requerimiento
              </th>

              <th className="px-5 py-4 text-left">
                Unidad
              </th>

              <th className="px-5 py-4 text-left">
                Responsable
              </th>

              <th className="px-5 py-4 text-center">
                Recepción
              </th>

              <th className="px-5 py-4 text-center">
                Estado
              </th>

              <th className="px-5 py-4 text-right">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {routeSheets.map(
              (
                routeSheet,
              ) => {
                const pdfLoading =
                  downloadingPdfId ===
                  routeSheet.id;

                const excelLoading =
                  downloadingExcelId ===
                  routeSheet.id;

                const requestNumber =
                  getRequestNumber(
                    routeSheet,
                  );

                const guideTypeLabel =
                  getGuideTypeLabel(
                    routeSheet,
                  );

                const guideType =
                  routeSheet.remissionGuide
                    ?.guideType;

                return (
                  <tr
                    key={
                      routeSheet.id
                    }
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {
                        routeSheet.routeSheetNumber
                      }
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-700">
                      {
                        routeSheet.remissionGuide
                          ?.fullNumber ??
                        "—"
                      }
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          ${
                            guideType ===
                            "MANUAL_WAREHOUSE"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                          }
                        `}
                      >
                        {
                          guideTypeLabel
                        }
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          routeSheet.request
                            ? "font-medium text-gray-700"
                            : "text-gray-400"
                        }
                      >
                        {
                          requestNumber
                        }
                      </span>
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {
                        routeSheet.warehouse
                          ?.name ??
                        "—"
                      }
                    </td>

                    <td className="px-5 py-4">
                      {
                        routeSheet.responsibleName ??
                        "—"
                      }
                    </td>

                    <td className="px-5 py-4 text-center">
                      {
                        formatDate(
                          routeSheet.receptionDate,
                        )
                      }
                    </td>

                    <td className="px-5 py-4 text-center">
                      {routeSheet.status ===
                      "CONFORMING" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          <CheckCircle2
                            size={
                              14
                            }
                          />

                          Conforme
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          <AlertTriangle
                            size={
                              14
                            }
                          />

                          Con observaciones
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          title="Ver"
                          onClick={() =>
                            onView(
                              routeSheet,
                            )
                          }
                          className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye
                            size={
                              17
                            }
                          />
                        </button>

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
                              routeSheet,
                            )
                          }
                          className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        >
                          <FileText
                            size={
                              17
                            }
                          />
                        </button>

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
                              routeSheet,
                            )
                          }
                          className="rounded-lg p-2 text-gray-500 hover:bg-green-50 hover:text-green-600 disabled:opacity-40"
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