import {
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import {
  Modal,
} from "@/components/ui/Modal";

import type {
  RouteSheet,
} from "../types/route-sheet.types";

interface Props {
  open:
    boolean;

  routeSheet:
    RouteSheet | null;

  onClose:
    () => void;
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
      value.split(
        "-",
      );

    return `${day}/${month}/${year}`;
  }

  return value;
}

export function RouteSheetDetailModal({
  open,
  routeSheet,
  onClose,
}: Props) {
  if (
    !open ||
    !routeSheet
  ) {
    return null;
  }

  return (
    <Modal
      open={
        open
      }
      onClose={
        onClose
      }
      title={`Hoja de Recorrido ${routeSheet.routeSheetNumber}`}
      size="2xl"
    >
      <div
        className="
          space-y-6
        "
      >
        {/* =====================================================
            ESTADO
        ===================================================== */}

        <div
          className="
            flex
            justify-end
          "
        >
          {routeSheet.status ===
          "CONFORMING" ? (
            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-green-100
                px-4
                py-2
                text-sm
                font-semibold
                text-green-700
              "
            >
              <CheckCircle2
                size={
                  17
                }
              />

              Recepción conforme
            </span>
          ) : (
            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-amber-100
                px-4
                py-2
                text-sm
                font-semibold
                text-amber-700
              "
            >
              <AlertTriangle
                size={
                  17
                }
              />

              Recepción con observaciones
            </span>
          )}
        </div>

        {/* =====================================================
            INFORMACIÓN GENERAL
        ===================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            rounded-xl
            bg-gray-50
            p-4
            md:grid-cols-2
            xl:grid-cols-4
          "
        >
          <div>
            <p
              className="
                text-xs
                uppercase
                text-gray-400
              "
            >
              Unidad
            </p>

            <p
              className="
                mt-1
                font-semibold
              "
            >
              {
                routeSheet.warehouse.name
              }
            </p>
          </div>

          <div>
            <p
              className="
                text-xs
                uppercase
                text-gray-400
              "
            >
              Requerimiento
            </p>

            <p
              className="
                mt-1
                font-semibold
              "
            >
              {
                routeSheet.request.requestNumber
              }
            </p>
          </div>

          <div>
            <p
              className="
                text-xs
                uppercase
                text-gray-400
              "
            >
              Guía
            </p>

            <p
              className="
                mt-1
                font-semibold
              "
            >
              {
                routeSheet.remissionGuide.fullNumber
              }
            </p>
          </div>

          <div>
            <p
              className="
                text-xs
                uppercase
                text-gray-400
              "
            >
              Responsable
            </p>

            <p
              className="
                mt-1
                font-semibold
              "
            >
              {
                routeSheet.responsibleName
              }
            </p>
          </div>
        </div>

        {/* =====================================================
            FECHAS
        ===================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
          "
        >
          <div
            className="
              rounded-xl
              border
              border-gray-200
              p-4
            "
          >
            <p
              className="
                text-xs
                text-gray-400
              "
            >
              Fecha de envío
            </p>

            <p
              className="
                mt-1
                font-semibold
                text-gray-800
              "
            >
              {
                formatDate(
                  routeSheet.shippingDate,
                )
              }
            </p>
          </div>

          <div
            className="
              rounded-xl
              border
              border-gray-200
              p-4
            "
          >
            <p
              className="
                text-xs
                text-gray-400
              "
            >
              Fecha de recepción
            </p>

            <p
              className="
                mt-1
                font-semibold
                text-gray-800
              "
            >
              {
                formatDate(
                  routeSheet.receptionDate,
                )
              }
            </p>
          </div>
        </div>

        {/* =====================================================
            PRODUCTOS
        ===================================================== */}

        <div>
          <h3
            className="
              mb-3
              font-semibold
              text-gray-800
            "
          >
            Verificación de materiales
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
                min-w-[1000px]
                w-full
                text-sm
              "
            >
              <thead
                className="
                  bg-gray-50
                "
              >
                <tr>
                  <th
                    className="
                      px-4
                      py-3
                      text-left
                    "
                  >
                    Ítem
                  </th>

                  <th
                    className="
                      px-4
                      py-3
                      text-center
                    "
                  >
                    Sede Lima
                  </th>

                  <th
                    className="
                      px-4
                      py-3
                      text-center
                    "
                  >
                    Almacén Proyecto
                  </th>

                  <th
                    className="
                      px-4
                      py-3
                      text-center
                    "
                  >
                    Conforme
                  </th>

                  <th
                    className="
                      px-4
                      py-3
                      text-center
                    "
                  >
                    Instalación
                  </th>

                  <th
                    className="
                      px-4
                      py-3
                      text-left
                    "
                  >
                    Observación
                  </th>
                </tr>
              </thead>

              <tbody>
                {routeSheet.details.map(
                  (
                    detail,
                  ) => (
                    <tr
                      key={
                        detail.id
                      }
                      className="
                        border-t
                        border-gray-100
                      "
                    >
                      <td
                        className="
                          px-4
                          py-3
                          font-medium
                        "
                      >
                        {
                          detail.product.name
                        }
                      </td>

                      <td
                        className="
                          px-4
                          py-3
                          text-center
                        "
                      >
                        {
                          detail.sentQuantity
                        }
                      </td>

                      <td
                        className="
                          px-4
                          py-3
                          text-center
                        "
                      >
                        {
                          detail.receivedQuantity
                        }
                      </td>

                      <td
                        className="
                          px-4
                          py-3
                          text-center
                        "
                      >
                        {detail.isConforming
                          ? "C"
                          : "NO"}
                      </td>

                      <td
                        className="
                          px-4
                          py-3
                          text-center
                        "
                      >
                        {detail.installationConforming ===
                        null ||
                        detail.installationConforming ===
                        undefined
                          ? "—"
                          : detail.installationConforming
                            ? "C"
                            : "NO"}
                      </td>

                      <td
                        className="
                          px-4
                          py-3
                          text-gray-600
                        "
                      >
                        {
                          detail.observation ??
                          "—"
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
            INCIDENTE
        ===================================================== */}

        {routeSheet.incidentDescription && (
          <div
            className="
              rounded-xl
              border
              border-amber-200
              bg-amber-50
              p-4
            "
          >
            <p
              className="
                text-sm
                font-semibold
                text-amber-800
              "
            >
              Incidente / No conformidad
            </p>

            <p
              className="
                mt-2
                whitespace-pre-wrap
                text-sm
                text-amber-700
              "
            >
              {
                routeSheet.incidentDescription
              }
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}