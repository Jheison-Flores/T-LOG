import {
  Modal,
} from "@/components/ui/Modal";

import type {
  RemissionGuide,
} from "../types/remission-guide.types";

interface Props {
  open:
    boolean;

  guide:
    RemissionGuide | null;

  onClose:
    () => void;
}

function formatDate(
  value:
    string,
) {
  const parts =
    value.split(
      "-",
    );

  if (
    parts.length ===
    3
  ) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return value;
}

function getGuideTypeLabel(
  guide: RemissionGuide,
) {
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

function getDestinationName(
  guide: RemissionGuide,
) {
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

export function RemissionGuideDetailModal({
  open,
  guide,
  onClose,
}: Props) {
  if (
    !open ||
    !guide
  ) {
    return null;
  }

  const requestNumber =
    guide.request
      ?.requestNumber ??
    "Sin requerimiento";

  const destinationName =
    getDestinationName(
      guide,
    );

  return (
    <Modal
      open={
        open
      }
      onClose={
        onClose
      }
      title={`Guía de Remisión ${guide.fullNumber}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* INFORMACIÓN GENERAL */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
            xl:grid-cols-5
          "
        >
          <div>
            <p className="text-xs text-gray-400">
              Tipo de guía
            </p>

            <p className="mt-1 font-semibold">
              {
                getGuideTypeLabel(
                  guide,
                )
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Requerimiento
            </p>

            <p className="mt-1 font-semibold">
              {
                requestNumber
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Fecha emisión
            </p>

            <p className="mt-1 font-semibold">
              {
                formatDate(
                  guide.issueDate,
                )
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Inicio traslado
            </p>

            <p className="mt-1 font-semibold">
              {
                formatDate(
                  guide.transferStartDate,
                )
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Estado
            </p>

            <p className="mt-1 font-semibold text-green-700">
              {guide.status ===
              "ISSUED"
                ? "Emitida"
                : "Anulada"}
            </p>
          </div>
        </div>

        {/* AVISO SEGÚN TIPO */}

        {guide.guideType ===
          "EXTERNAL_SERVICE" && (
          <div
            className="
              rounded-xl
              border
              border-violet-200
              bg-violet-50
              px-4
              py-3
              text-sm
              text-violet-700
            "
          >
            Esta guía corresponde a un servicio externo y no genera movimiento de inventario.
          </div>
        )}

        {guide.guideType ===
          "MANUAL_WAREHOUSE" && (
          <div
            className="
              rounded-xl
              border
              border-blue-200
              bg-blue-50
              px-4
              py-3
              text-sm
              text-blue-700
            "
          >
            Esta guía fue generada manualmente hacia una unidad minera y sí genera transferencia de inventario.
          </div>
        )}

        {/* ORIGEN / DESTINO */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            rounded-xl
            bg-gray-50
            p-4
            md:grid-cols-2
          "
        >
          <div>
            <p className="text-xs uppercase text-gray-400">
              Origen
            </p>

            <p className="mt-1 font-semibold">
              {
                guide
                  .sourceWarehouse
                  ?.name ??
                "—"
              }
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {
                guide.departurePoint
              }
            </p>
          </div>

          <div>
            <p className="text-xs uppercase text-gray-400">
              Destino
            </p>

            <p className="mt-1 font-semibold">
              {
                destinationName
              }
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {
                guide.arrivalPoint
              }
            </p>
          </div>
        </div>

        {/* DESTINATARIO */}

        <div>
          <h3 className="font-semibold text-gray-800">
            Destinatario
          </h3>

          <p className="mt-2">
            {
              guide.recipientName
            }
          </p>

          <p className="text-sm text-gray-500">
            RUC:{" "}
            {
              guide.recipientRuc ??
              "—"
            }
          </p>
        </div>

        {/* TRANSPORTE */}

        <div>
          <h3 className="font-semibold text-gray-800">
            Transporte
          </h3>

          <div
            className="
              mt-3
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
              xl:grid-cols-4
            "
          >
            <div>
              <p className="text-xs text-gray-400">
                Marca
              </p>

              <p className="mt-1">
                {
                  guide.vehicleBrand ??
                  "—"
                }
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Placa
              </p>

              <p className="mt-1">
                {
                  guide.vehiclePlate ??
                  "—"
                }
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Constancia
              </p>

              <p className="mt-1">
                {
                  guide.registrationCertificate ??
                  "—"
                }
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Licencia
              </p>

              <p className="mt-1">
                {
                  guide.driverLicense ??
                  "—"
                }
              </p>
            </div>
          </div>
        </div>

        {/* TRANSPORTISTA */}

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
              Empresa transportista
            </p>

            <p className="mt-1 font-medium">
              {
                guide.transportCompanyName ??
                "—"
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              RUC transportista
            </p>

            <p className="mt-1 font-medium">
              {
                guide.transportCompanyRuc ??
                "—"
              }
            </p>
          </div>
        </div>

        {/* MOTIVO */}

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
              Motivo de traslado
            </p>

            <p className="mt-1 font-medium">
              {
                guide.transferReason
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Detalle del motivo
            </p>

            <p className="mt-1 font-medium">
              {
                guide.otherTransferReason ??
                "—"
              }
            </p>
          </div>
        </div>

        {/* PRODUCTOS */}

        <div>
          <h3 className="mb-3 font-semibold text-gray-800">
            Productos trasladados
          </h3>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-[750px] w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center">
                    Item
                  </th>

                  <th className="px-4 py-3 text-left">
                    Descripción
                  </th>

                  <th className="px-4 py-3 text-center">
                    Unidad
                  </th>

                  <th className="px-4 py-3 text-center">
                    Cantidad
                  </th>

                  <th className="px-4 py-3 text-center">
                    Peso total
                  </th>
                </tr>
              </thead>

              <tbody>
                {guide.details.map(
                  (
                    detail,
                    index,
                  ) => {
                    const description =
                      detail.product
                        ?.name ??
                      detail.description ??
                      "Producto sin descripción";

                    const unit =
                      detail.product
                        ?.unit ??
                      detail.unit ??
                      "—";

                    return (
                      <tr
                        key={
                          detail.id
                        }
                        className="border-t"
                      >
                        <td className="px-4 py-3 text-center">
                          {
                            index + 1
                          }
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {
                            description
                          }
                        </td>

                        <td className="px-4 py-3 text-center">
                          {
                            unit
                          }
                        </td>

                        <td className="px-4 py-3 text-center">
                          {
                            detail.quantity
                          }
                        </td>

                        <td className="px-4 py-3 text-center">
                          {
                            detail.totalWeight ??
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

        {guide.purchaseOrderReference && (
          <div>
            <p className="text-xs text-gray-400">
              O/C referencial
            </p>

            <p className="mt-1 text-sm">
              {
                guide.purchaseOrderReference
              }
            </p>
          </div>
        )}

        {guide.observations && (
          <div>
            <p className="text-xs text-gray-400">
              Observaciones
            </p>

            <p className="mt-2 text-sm">
              {
                guide.observations
              }
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}