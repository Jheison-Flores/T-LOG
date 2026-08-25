import {
  Eye,
  FileSpreadsheet,
  FileText,
  PackageCheck,
  Pencil,
  Trash2,
} from "lucide-react";

import type {
  Purchase,
  PurchaseCurrency,
} from "../types/purchase.types";

interface Props {
  purchases:
    Purchase[];

  canEdit:
    boolean;

  canDelete:
    boolean;

  canReceive:
    boolean;

  onView: (
    purchase:
      Purchase,
  ) => void;

  onEdit: (
    purchase:
      Purchase,
  ) => void;

  onReceive: (
    purchase:
      Purchase,
  ) => void;

  onDelete: (
    purchase:
      Purchase,
  ) => void;

  onDownloadPdf: (
    purchase:
      Purchase,
  ) => void;

  onDownloadExcel: (
    purchase:
      Purchase,
  ) => void;

  loadingId?:
    number | null;

  downloadingPdfId?:
    number | null;

  downloadingExcelId?:
    number | null;
}

// ============================================================
// FORMATEAR MONEDA
// ============================================================

function formatCurrency(
  value:
    number | string,

  currency:
    PurchaseCurrency,
) {
  return Number(
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
}

// ============================================================
// FORMATEAR FECHA
// ============================================================

function formatDate(
  value?:
    string | null,
) {
  if (!value) {
    return "—";
  }

  /*
   * purchaseDate normalmente viene:
   * YYYY-MM-DD
   *
   * Evitamos new Date() para no tener problemas
   * de desfase por zona horaria.
   */

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
}

// ============================================================
// TABLA
// ============================================================

export function PurchaseTable({
  purchases,
  canEdit,
  canDelete,
  canReceive,
  onView,
  onEdit,
  onReceive,
  onDelete,
  onDownloadPdf,
  onDownloadExcel,
  loadingId = null,
  downloadingPdfId = null,
  downloadingExcelId = null,
}: Props) {
  // ============================================================
  // SIN DATOS
  // ============================================================

  if (
    purchases.length ===
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
          No se encontraron órdenes de compra.
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Genera una nueva orden o modifica los filtros.
        </p>
      </div>
    );
  }

  // ============================================================
  // TABLA
  // ============================================================

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
            min-w-[1200px]
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
              <th
                className="
                  px-5
                  py-4
                  text-left
                  font-semibold
                  text-gray-600
                "
              >
                Orden de compra
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
                Proveedor
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
                Moneda
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
                  text-right
                  font-semibold
                  text-gray-600
                "
              >
                Total
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

          {/* ===================================================
              CUERPO
          =================================================== */}

          <tbody
            className="
              divide-y
              divide-gray-100
            "
          >
            {purchases.map(
              (
                purchase,
              ) => {
                const received =
                  purchase.status ===
                  "RECEIVED";

                const isLoading =
                  loadingId ===
                  purchase.id;

                const isPdfLoading =
                  downloadingPdfId ===
                  purchase.id;

                const isExcelLoading =
                  downloadingExcelId ===
                  purchase.id;

                return (
                  <tr
                    key={
                      purchase.id
                    }
                    className="
                      transition-colors
                      hover:bg-gray-50
                    "
                  >
                    {/* ===========================================
                        ORDEN
                    =========================================== */}

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
                        OC N°{" "}
                        {
                          purchase.purchaseOrderNumber
                        }
                      </p>

                      {purchase
                        .quotationNumber && (
                        <p
                          className="
                            mt-1
                            text-xs
                            text-gray-400
                          "
                        >
                          Cotización:{" "}
                          {
                            purchase.quotationNumber
                          }
                        </p>
                      )}
                    </td>

                    {/* ===========================================
                        REQUERIMIENTO
                    =========================================== */}

                    <td
                      className="
                        px-5
                        py-4
                      "
                    >
                      {purchase
                        .request ? (
                        <>
                          <p
                            className="
                              font-medium
                              text-gray-700
                            "
                          >
                            {
                              purchase.request.requestNumber
                            }
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              text-gray-400
                            "
                          >
                            {
                              purchase.request.warehouse.name
                            }
                          </p>
                        </>
                      ) : (
                        <span className="text-gray-400">
                          —
                        </span>
                      )}
                    </td>

                    {/* ===========================================
                        PROVEEDOR
                    =========================================== */}

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
                          purchase.supplier?.name ??
                          "—"
                        }
                      </p>

                      {purchase
                        .supplier
                        ?.ruc && (
                        <p
                          className="
                            mt-1
                            text-xs
                            text-gray-400
                          "
                        >
                          RUC:{" "}
                          {
                            purchase.supplier.ruc
                          }
                        </p>
                      )}
                    </td>

                    {/* ===========================================
                        FECHA
                    =========================================== */}

                    <td
                      className="
                        whitespace-nowrap
                        px-5
                        py-4
                        text-gray-600
                      "
                    >
                      {
                        formatDate(
                          purchase.purchaseDate,
                        )
                      }
                    </td>

                    {/* ===========================================
                        MONEDA
                    =========================================== */}

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
                          rounded-full
                          bg-gray-100
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          text-gray-700
                        "
                      >
                        {purchase.currency ===
                        "PEN"
                          ? "PEN"
                          : "USD"}
                      </span>
                    </td>

                    {/* ===========================================
                        PRODUCTOS
                    =========================================== */}

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
                          purchase.details
                            ?.length ??
                          0
                        }
                      </span>
                    </td>

                    {/* ===========================================
                        TOTAL
                    =========================================== */}

                    <td
                      className="
                        whitespace-nowrap
                        px-5
                        py-4
                        text-right
                      "
                    >
                      <span
                        className="
                          font-semibold
                          text-gray-800
                        "
                      >
                        {
                          formatCurrency(
                            purchase.totalAmount,
                            purchase.currency,
                          )
                        }
                      </span>
                    </td>

                    {/* ===========================================
                        ESTADO
                    =========================================== */}

                    <td
                      className="
                        px-5
                        py-4
                        text-center
                      "
                    >
                      {received ? (
                        <span
                          className="
                            inline-flex
                            rounded-full
                            bg-green-100
                            px-2.5
                            py-1
                            text-xs
                            font-semibold
                            text-green-700
                          "
                        >
                          Recibida
                        </span>
                      ) : (
                        <span
                          className="
                            inline-flex
                            rounded-full
                            bg-amber-100
                            px-2.5
                            py-1
                            text-xs
                            font-semibold
                            text-amber-700
                          "
                        >
                          Emitida
                        </span>
                      )}
                    </td>

                    {/* ===========================================
                        ACCIONES
                    =========================================== */}

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
                        {/* =====================================
                            VER
                        ===================================== */}

                        <button
                          type="button"
                          title="Ver detalle"
                          onClick={() =>
                            onView(
                              purchase,
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

                        {/* =====================================
                            PDF
                        ===================================== */}

                        <button
                          type="button"
                          title="Descargar PDF"
                          disabled={
                            isPdfLoading
                          }
                          onClick={() =>
                            onDownloadPdf(
                              purchase,
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

                        {/* =====================================
                            EXCEL
                        ===================================== */}

                        <button
                          type="button"
                          title="Descargar Excel"
                          disabled={
                            isExcelLoading
                          }
                          onClick={() =>
                            onDownloadExcel(
                              purchase,
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

                        {/* =====================================
                            RECIBIR
                        ===================================== */}

                        {canReceive &&
                          !received && (
                          <button
                            type="button"
                            title="Confirmar recepción"
                            disabled={
                              isLoading
                            }
                            onClick={() =>
                              onReceive(
                                purchase,
                              )
                            }
                            className="
                              rounded-lg
                              p-2
                              text-gray-500
                              transition
                              hover:bg-emerald-50
                              hover:text-emerald-600
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
                          >
                            <PackageCheck
                              size={
                                17
                              }
                            />
                          </button>
                        )}

                        {/* =====================================
                            EDITAR
                        ===================================== */}

                        {canEdit &&
                          !received && (
                            <button
                              type="button"
                              title="Editar orden de compra"
                              disabled={
                                isLoading
                              }
                              onClick={() =>
                                onEdit(
                                  purchase,
                                )
                              }
                              className="
                                rounded-lg
                                p-2
                                text-gray-500
                                transition
                                hover:bg-orange-50
                                hover:text-orange-600
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                              "
                            >
                              <Pencil
                                size={
                                  17
                                }
                              />
                            </button>
                          )}

                        {/* =====================================
                            ELIMINAR
                        ===================================== */}

                        {canDelete &&
                          !received && (
                            <button
                              type="button"
                              title="Eliminar orden de compra"
                              disabled={
                                isLoading
                              }
                              onClick={() =>
                                onDelete(
                                  purchase,
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
                              <Trash2
                                size={
                                  17
                                }
                              />
                            </button>
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