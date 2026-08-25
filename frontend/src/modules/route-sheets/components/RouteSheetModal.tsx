import {
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/Button";

import {
  Input,
} from "@/components/ui/Input";

import {
  Modal,
} from "@/components/ui/Modal";

import type {
  RemissionGuide,
} from "@/modules/remission-guides/types/remission-guide.types";

import type {
  CreateRouteSheetDto,
  RouteSheet,
} from "../types/route-sheet.types";

// ============================================================
// FILA LOCAL
// ============================================================

interface RouteSheetLine {
  remissionGuideDetailId:
    number;

  productName:
    string;

  unit:
    string;

  sentQuantity:
    number;

  receivedQuantity:
    string;

  isConforming:
    boolean;

  installationConforming:
    boolean;

  observation:
    string;
}

interface Props {
  open:
    boolean;

  guides:
    RemissionGuide[];

  routeSheets:
    RouteSheet[];

  loading?:
    boolean;

  onClose:
    () => void;

  onSubmit: (
    data:
      CreateRouteSheetDto,
  ) => void;
}

// ============================================================
// FECHA ACTUAL
// ============================================================

function getToday():
  string {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() +
        1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      now.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

// ============================================================
// MODAL
// ============================================================

export function RouteSheetModal({
  open,
  guides,
  routeSheets,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [
    remissionGuideId,
    setRemissionGuideId,
  ] =
    useState("");

  const [
    receptionDate,
    setReceptionDate,
  ] =
    useState(
      getToday(),
    );

  const [
    responsibleName,
    setResponsibleName,
  ] =
    useState("");

  const [
    incidentDescription,
    setIncidentDescription,
  ] =
    useState("");

  const [
    lines,
    setLines,
  ] =
    useState<
      RouteSheetLine[]
    >([]);

  const [
    error,
    setError,
  ] =
    useState("");

  // ============================================================
  // GUÍAS QUE TODAVÍA NO TIENEN HOJA
  // ============================================================

  const availableGuides =
    useMemo(
      () => {
        const alreadyRegistered =
          new Set(
            routeSheets.map(
              (
                sheet,
              ) =>
                sheet
                  .remissionGuide
                  .id,
            ),
          );

        return guides.filter(
          (
            guide,
          ) =>
            guide.status ===
              "ISSUED" &&
            (
              guide.guideType ===
                "REQUEST" ||
              guide.guideType ===
                "MANUAL_WAREHOUSE"
            ) &&
            Boolean(
              guide.destinationWarehouse,
            ) &&
            !alreadyRegistered.has(
              guide.id,
            ),
        );
      },
      [
        guides,
        routeSheets,
      ],
    );

  // ============================================================
  // GUÍA SELECCIONADA
  // ============================================================

  const selectedGuide =
    useMemo(
      () =>
        availableGuides.find(
          (
            guide,
          ) =>
            guide.id ===
            Number(
              remissionGuideId,
            ),
        ) ??
        null,
      [
        availableGuides,
        remissionGuideId,
      ],
    );

  // ============================================================
  // CAMBIAR GUÍA
  // ============================================================

  const handleGuideChange = (
    value:
      string,
  ) => {
    setRemissionGuideId(
      value,
    );

    setError("");

    setIncidentDescription(
      "",
    );

    if (!value) {
      setLines(
        [],
      );

      return;
    }

    const guide =
      availableGuides.find(
        (
          item,
        ) =>
          item.id ===
          Number(
            value,
          ),
      );

    if (!guide) {
      setLines(
        [],
      );

      return;
    }

    setLines(
      guide.details.map(
        (
          detail,
        ): RouteSheetLine => {
          const sent =
            Number(
              detail.quantity,
            );

          return {
            remissionGuideDetailId:
              detail.id,

            productName:
              detail.product?.name ??
              detail.description ??
              "Producto sin descripción",

            unit:
              String(
                detail.product?.unit ??
                  detail.unit ??
                  "—",
              ),

            sentQuantity:
              sent,

            receivedQuantity:
              String(
                sent,
              ),

            isConforming:
              true,

            installationConforming:
              true,

            observation:
              "",
          };
        },
      ),
    );
  };

  // ============================================================
  // ACTUALIZAR CANTIDAD
  // ============================================================

  const updateReceivedQuantity = (
    index:
      number,

    value:
      string,
  ) => {
    setLines(
      (
        current,
      ) =>
        current.map(
          (
            line,
            currentIndex,
          ) => {
            if (
              currentIndex !==
              index
            ) {
              return line;
            }

            const received =
              Number(
                value,
              );

            const sameQuantity =
              Number.isFinite(
                received,
              ) &&
              received ===
                line.sentQuantity;

            return {
              ...line,

              receivedQuantity:
                value,

              isConforming:
                sameQuantity
                  ? line.isConforming
                  : false,
            };
          },
        ),
    );
  };

  // ============================================================
  // CAMBIAR CONFORMIDAD
  // ============================================================

  const updateConforming = (
    index:
      number,

    value:
      boolean,
  ) => {
    setLines(
      (
        current,
      ) =>
        current.map(
          (
            line,
            currentIndex,
          ) =>
            currentIndex ===
            index
              ? {
                  ...line,

                  isConforming:
                    value,
                }
              : line,
        ),
    );
  };

  // ============================================================
  // INSTALACIÓN
  // ============================================================

  const updateInstallation = (
    index:
      number,

    value:
      boolean,
  ) => {
    setLines(
      (
        current,
      ) =>
        current.map(
          (
            line,
            currentIndex,
          ) =>
            currentIndex ===
            index
              ? {
                  ...line,

                  installationConforming:
                    value,
                }
              : line,
        ),
    );
  };

  // ============================================================
  // OBSERVACIÓN
  // ============================================================

  const updateObservation = (
    index:
      number,

    value:
      string,
  ) => {
    setLines(
      (
        current,
      ) =>
        current.map(
          (
            line,
            currentIndex,
          ) =>
            currentIndex ===
            index
              ? {
                  ...line,

                  observation:
                    value,
                }
              : line,
        ),
    );
  };

  // ============================================================
  // ¿EXISTE ALGUNA NO CONFORMIDAD?
  // ============================================================

  const hasNonConformity =
    useMemo(
      () =>
        lines.some(
          (
            line,
          ) =>
            !line.isConforming ||
            !line.installationConforming ||
            Number(
              line.receivedQuantity,
            ) !==
              line.sentQuantity,
        ),
      [
        lines,
      ],
    );

  // ============================================================
  // GUARDAR
  // ============================================================

  const handleSubmit = (
    event:
      React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (
      !remissionGuideId
    ) {
      setError(
        "Selecciona una Guía de Remisión.",
      );

      return;
    }

    if (
      !receptionDate
    ) {
      setError(
        "Indica la fecha de recepción.",
      );

      return;
    }

    if (
      !responsibleName.trim()
    ) {
      setError(
        "Indica el responsable de la recepción.",
      );

      return;
    }

    if (
      lines.length ===
      0
    ) {
      setError(
        "La guía no contiene productos para verificar.",
      );

      return;
    }

    for (
      const line of
      lines
    ) {
      const received =
        Number(
          line.receivedQuantity,
        );

      if (
        !Number.isFinite(
          received,
        ) ||
        received <
          0
      ) {
        setError(
          `La cantidad recibida de "${line.productName}" no es válida.`,
        );

        return;
      }

      if (
        received >
        line.sentQuantity
      ) {
        setError(
          `No puedes recibir más de ${line.sentQuantity} ${line.unit} de "${line.productName}".`,
        );

        return;
      }

      if (
        received !==
          line.sentQuantity &&
        line.isConforming
      ) {
        setError(
          `"${line.productName}" tiene diferencia de cantidad y debe marcarse como No Conforme.`,
        );

        return;
      }
    }

    if (
      hasNonConformity &&
      !incidentDescription.trim()
    ) {
      setError(
        "Describe brevemente el incidente porque existe al menos una no conformidad.",
      );

      return;
    }

    onSubmit({
      remissionGuideId:
        Number(
          remissionGuideId,
        ),

      receptionDate,

      responsibleName:
        responsibleName.trim(),

      incidentDescription:
        incidentDescription
          .trim() ||
        undefined,

      details:
        lines.map(
          (
            line,
          ) => ({
            remissionGuideDetailId:
              line.remissionGuideDetailId,

            receivedQuantity:
              Number(
                line.receivedQuantity,
              ),

            isConforming:
              line.isConforming,

            installationConforming:
              line.installationConforming,

            observation:
              line.observation
                .trim() ||
              undefined,
          }),
        ),
    });
  };

  if (!open) {
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
      title="Registrar Hoja de Recorrido"
      size="2xl"
    >
      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        {/* =====================================================
            GUÍA
        ===================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            lg:grid-cols-3
          "
        >
          <div className="lg:col-span-2">
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-gray-700
              "
            >
              Guía de Remisión *
            </label>

            <select
              value={
                remissionGuideId
              }
              disabled={
                loading
              }
              onChange={(
                event,
              ) =>
                handleGuideChange(
                  event.target.value,
                )
              }
              className="
                h-10
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                text-sm
                outline-none
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-100
              "
            >
              <option value="">
                Selecciona una guía pendiente de recepción
              </option>

              {availableGuides.map(
                (
                  guide,
                ) => (
                  <option
                    key={
                      guide.id
                    }
                    value={
                      guide.id
                    }
                  >
                    {
                      guide.fullNumber
                    }
                    {" - "}
                    {
                      guide.destinationWarehouse?.name ??
                      "Sin destino"
                    }
                    {" - "}
                    {
                      guide.request?.requestNumber ??
                      "SIN REQUERIMIENTO"
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-gray-700
              "
            >
              Fecha de recepción *
            </label>

            <Input
              type="date"
              value={
                receptionDate
              }
              disabled={
                loading
              }
              onChange={(
                event,
              ) =>
                setReceptionDate(
                  event.target.value,
                )
              }
            />
          </div>
        </div>

        {/* =====================================================
            INFORMACIÓN AUTOMÁTICA
        ===================================================== */}

        {selectedGuide && (
          <div
            className="
              grid
              grid-cols-1
              gap-4
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              p-4
              md:grid-cols-2
              xl:grid-cols-5
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  text-gray-400
                "
              >
                Unidad / Proyecto
              </p>

              <p
                className="
                  mt-1
                  font-semibold
                  text-gray-800
                "
              >
                {
                  selectedGuide
                    .destinationWarehouse
                    ?.name ??
                  "—"
                }
              </p>
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-semibold
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
                  text-gray-800
                "
              >
                {
                  selectedGuide
                    .request
                    ?.requestNumber ??
                  "Sin requerimiento"
                }
              </p>
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  text-gray-400
                "
              >
                Tipo
              </p>

              <p
                className="
                  mt-1
                  font-semibold
                  text-gray-800
                "
              >
                {
                  selectedGuide.guideType ===
                  "MANUAL_WAREHOUSE"
                    ? "Manual a mina"
                    : "Por requerimiento"
                }
              </p>
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-semibold
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
                  text-gray-800
                "
              >
                {
                  selectedGuide.fullNumber
                }
              </p>
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
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
                  selectedGuide.transferStartDate
                }
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            RESPONSABLE
        ===================================================== */}

        <div>
          <label
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-gray-700
            "
          >
            Responsable de recepción *
          </label>

          <Input
            value={
              responsibleName
            }
            disabled={
              loading
            }
            placeholder="Ej. ADRIAN TELADA"
            onChange={(
              event,
            ) =>
              setResponsibleName(
                event.target.value
                  .toUpperCase(),
              )
            }
          />
        </div>

        {/* =====================================================
            TABLA
        ===================================================== */}

        <div>
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <h3
                className="
                  font-semibold
                  text-gray-800
                "
              >
                Verificación de materiales
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-500
                "
              >
                Los valores se cargan como conformes. Modifica únicamente los ítems que presenten incidencias.
              </p>
            </div>

            {hasNonConformity ? (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-full
                  bg-amber-100
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-amber-700
                "
              >
                <AlertTriangle
                  size={
                    15
                  }
                />

                Existen observaciones
              </div>
            ) : (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-full
                  bg-green-100
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-green-700
                "
              >
                <CheckCircle2
                  size={
                    15
                  }
                />

                Todo conforme
              </div>
            )}
          </div>

          <div
            className="
              mt-4
              overflow-x-auto
              rounded-xl
              border
              border-gray-200
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
                  bg-gray-50
                "
              >
                <tr>
                  <th
                    className="
                      min-w-[300px]
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
                    U.M.
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
                      min-w-[130px]
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
                      min-w-[280px]
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
                {lines.map(
                  (
                    line,
                    index,
                  ) => (
                    <tr
                      key={
                        line.remissionGuideDetailId
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
                          text-gray-800
                        "
                      >
                        {
                          line.productName
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
                          line.unit
                        }
                      </td>

                      <td
                        className="
                          px-4
                          py-3
                          text-center
                          font-semibold
                          text-gray-700
                        "
                      >
                        {
                          line.sentQuantity
                        }
                      </td>

                      <td
                        className="
                          px-4
                          py-3
                        "
                      >
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          max={
                            line.sentQuantity
                          }
                          value={
                            line.receivedQuantity
                          }
                          disabled={
                            loading
                          }
                          onChange={(
                            event,
                          ) =>
                            updateReceivedQuantity(
                              index,
                              event.target.value,
                            )
                          }
                        />
                      </td>

                      {/* CONFORME */}

                      <td
                        className="
                          px-4
                          py-3
                          text-center
                        "
                      >
                        <button
                          type="button"
                          disabled={
                            loading
                          }
                          onClick={() =>
                            updateConforming(
                              index,
                              !line.isConforming,
                            )
                          }
                          className={`
                            inline-flex
                            min-w-[100px]
                            items-center
                            justify-center
                            rounded-lg
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            transition
                            ${
                              line.isConforming
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }
                          `}
                        >
                          {line.isConforming
                            ? "C - Conforme"
                            : "No Conforme"}
                        </button>
                      </td>

                      {/* INSTALACIÓN */}

                      <td
                        className="
                          px-4
                          py-3
                          text-center
                        "
                      >
                        <button
                          type="button"
                          disabled={
                            loading
                          }
                          onClick={() =>
                            updateInstallation(
                              index,
                              !line.installationConforming,
                            )
                          }
                          className={`
                            inline-flex
                            min-w-[100px]
                            items-center
                            justify-center
                            rounded-lg
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            transition
                            ${
                              line.installationConforming
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }
                          `}
                        >
                          {line.installationConforming
                            ? "C - Conforme"
                            : "No Conforme"}
                        </button>
                      </td>

                      {/* OBSERVACIÓN */}

                      <td
                        className="
                          px-4
                          py-3
                        "
                      >
                        <Input
                          value={
                            line.observation
                          }
                          disabled={
                            loading
                          }
                          placeholder={
                            line.isConforming &&
                            line.installationConforming
                              ? "Sin observaciones"
                              : "Describe la incidencia..."
                          }
                          onChange={(
                            event,
                          ) =>
                            updateObservation(
                              index,
                              event.target.value,
                            )
                          }
                        />
                      </td>
                    </tr>
                  ),
                )}

                {lines.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={
                        7
                      }
                      className="
                        px-4
                        py-10
                        text-center
                        text-gray-400
                      "
                    >
                      Selecciona una Guía de Remisión.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =====================================================
            INCIDENTE
        ===================================================== */}

        <div>
          <label
            className="
              mb-2
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-gray-700
            "
          >
            Descripción del incidente

            {hasNonConformity && (
              <span
                className="
                  rounded
                  bg-red-100
                  px-2
                  py-0.5
                  text-xs
                  text-red-600
                "
              >
                Obligatorio
              </span>
            )}
          </label>

          <textarea
            rows={
              4
            }
            value={
              incidentDescription
            }
            disabled={
              loading
            }
            placeholder={
              hasNonConformity
                ? "Describe brevemente la no conformidad..."
                : "Opcional. No se detectaron incidencias."
            }
            onChange={(
              event,
            ) =>
              setIncidentDescription(
                event.target.value,
              )
            }
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

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-600
            "
          >
            {
              error
            }
          </div>
        )}

        {/* =====================================================
            BOTONES
        ===================================================== */}

        <div
          className="
            sticky
            bottom-0
            flex
            justify-end
            gap-3
            border-t
            border-gray-200
            bg-white
            py-4
          "
        >
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
            type="submit"
            disabled={
              loading ||
              lines.length ===
                0
            }
          >
            {loading
              ? "Registrando..."
              : "Registrar conformidad"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}