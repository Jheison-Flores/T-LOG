import {
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";

import type {
  Supplier,
} from "../types/supplier.types";

interface Props {
  suppliers:
    Supplier[];

  canEdit?:
    boolean;

  canDelete?:
    boolean;

  onEdit: (
    supplier:
      Supplier,
  ) => void;

  onDelete: (
    supplier:
      Supplier,
  ) => void;
}

export function SupplierTable({
  suppliers,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
}: Props) {
  // ============================================================
  // SIN RESULTADOS
  // ============================================================

  if (
    suppliers.length ===
    0
  ) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
        <p className="text-base font-semibold text-gray-600">
          No se encontraron proveedores
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Registra un nuevo proveedor o modifica los criterios de búsqueda.
        </p>
      </div>
    );
  }

  // ============================================================
  // TABLA
  // ============================================================

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-sm">
          {/* =====================================================
              CABECERA
          ===================================================== */}

          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="w-[28%] px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Proveedor
              </th>

              <th className="w-[13%] px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                RUC
              </th>

              <th className="w-[15%] px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Contacto
              </th>

              <th className="w-[28%] px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                Dirección
              </th>

              <th className="w-[8%] px-6 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-500">
                Estado
              </th>

              <th className="w-[8%] px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>

          {/* =====================================================
              CUERPO
          ===================================================== */}

          <tbody className="divide-y divide-gray-100">
            {suppliers.map(
              (
                supplier,
              ) => (
                <tr
                  key={
                    supplier.id
                  }
                  className="transition-colors duration-150 hover:bg-orange-50/30"
                >
                  {/* =================================================
                      PROVEEDOR + CORREO
                  ================================================= */}

                  <td className="px-6 py-5 align-middle">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-5 text-gray-900">
                        {
                          supplier.name
                        }
                      </p>

                      {supplier.email ? (
                        <div className="mt-1.5 flex items-center gap-2">
                          <Mail
                            size={
                              14
                            }
                            className="shrink-0 text-gray-400"
                          />

                          <span
                            className="max-w-[320px] truncate text-xs text-gray-500"
                            title={
                              supplier.email
                            }
                          >
                            {
                              supplier.email
                            }
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
                          <Mail
                            size={
                              14
                            }
                            className="shrink-0"
                          />

                          <span>
                            Sin correo registrado
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* =================================================
                      RUC
                  ================================================= */}

                  <td className="px-6 py-5 align-middle">
                    <span className="font-medium text-gray-700">
                      {
                        supplier.ruc ??
                        "—"
                      }
                    </span>
                  </td>

                  {/* =================================================
                      CONTACTO
                  ================================================= */}

                  <td className="px-6 py-5 align-middle">
                    {supplier.phone ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone
                          size={
                            15
                          }
                          className="shrink-0 text-gray-400"
                        />

                        <span>
                          {
                            supplier.phone
                          }
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone
                          size={
                            15
                          }
                        />

                        <span>
                          —
                        </span>
                      </div>
                    )}
                  </td>

                  {/* =================================================
                      DIRECCIÓN
                  ================================================= */}

                  <td className="px-6 py-5 align-middle">
                    {supplier.address ? (
                      <div className="flex items-start gap-2">
                        <MapPin
                          size={
                            15
                          }
                          className="mt-0.5 shrink-0 text-gray-400"
                        />

                        <p
                          className="max-w-[430px] leading-5 text-gray-600"
                          title={
                            supplier.address
                          }
                        >
                          {
                            supplier.address
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin
                          size={
                            15
                          }
                        />

                        <span>
                          —
                        </span>
                      </div>
                    )}
                  </td>

                  {/* =================================================
                      ESTADO
                  ================================================= */}

                  <td className="px-6 py-5 text-center align-middle">
                    {supplier.isActive ? (
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                        Inactivo
                      </span>
                    )}
                  </td>

                  {/* =================================================
                      ACCIONES
                  ================================================= */}

                  <td className="px-6 py-5 align-middle">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <button
                          type="button"
                          title="Editar proveedor"
                          onClick={() =>
                            onEdit(
                              supplier,
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil
                            size={
                              16
                            }
                          />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          title="Eliminar proveedor"
                          onClick={() =>
                            onDelete(
                              supplier,
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2
                            size={
                              16
                            }
                          />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}