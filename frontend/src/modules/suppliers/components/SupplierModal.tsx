import {
  useEffect,
  useState,
} from "react";

import {
  Building2,
  Mail,
  MapPin,
  Phone,
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
  CreateSupplierDto,
} from "../types/supplier.types";

// ============================================================
// PROPS
// ============================================================

interface Props {
  open:
    boolean;

  loading?:
    boolean;

  defaultValues?:
    Partial<CreateSupplierDto>;

  onClose:
    () => void;

  onSubmit: (
    data:
      CreateSupplierDto,
  ) => void;
}

// ============================================================
// FORM VACÍO
// ============================================================

const EMPTY_FORM:
  CreateSupplierDto = {
  name: "",
  ruc: "",
  address: "",
  phone: "",
  email: "",
  isActive: true,
};

// ============================================================
// MODAL
// ============================================================

export function SupplierModal({
  open,
  loading = false,
  defaultValues,
  onClose,
  onSubmit,
}: Props) {
  const [
    form,
    setForm,
  ] =
    useState<CreateSupplierDto>(
      EMPTY_FORM,
    );

  const [
    error,
    setError,
  ] =
    useState("");

  // ==========================================================
  // INICIALIZAR
  // ==========================================================

  useEffect(
    () => {
      if (!open) {
        return;
      }

      setForm({
        name:
          defaultValues?.name ??
          "",

        ruc:
          defaultValues?.ruc ??
          "",

        address:
          defaultValues?.address ??
          "",

        phone:
          defaultValues?.phone ??
          "",

        email:
          defaultValues?.email ??
          "",

        isActive:
          defaultValues?.isActive ??
          true,
      });

      setError("");
    },
    [
      open,
      defaultValues,
    ],
  );

  // ==========================================================
  // UPDATE FIELD
  // ==========================================================

  const updateField = <
    K extends keyof CreateSupplierDto,
  >(
    key:
      K,
    value:
      CreateSupplierDto[K],
  ) => {
    setForm(
      (
        current,
      ) => ({
        ...current,
        [key]:
          value,
      }),
    );
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = (
    event:
      React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    // ========================================================
    // NOMBRE
    // ========================================================

    if (
      !form.name.trim()
    ) {
      setError(
        "Ingresa la razón social o nombre del proveedor.",
      );

      return;
    }

    // ========================================================
    // RUC
    // ========================================================

    if (
      form.ruc &&
      form.ruc.trim().length >
        0 &&
      !/^\d+$/.test(
        form.ruc.trim(),
      )
    ) {
      setError(
        "El RUC debe contener únicamente números.",
      );

      return;
    }

    // ========================================================
    // SUBMIT
    // ========================================================

    onSubmit({
      name:
        form.name.trim(),

      ruc:
        form.ruc
          ?.trim() ||
        undefined,

      address:
        form.address
          ?.trim() ||
        undefined,

      phone:
        form.phone
          ?.trim() ||
        undefined,

      email:
        form.email
          ?.trim()
          .toLowerCase() ||
        undefined,

      isActive:
        form.isActive ??
        true,
    });
  };

  if (!open) {
    return null;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Modal
      open={
        open
      }

      onClose={
        onClose
      }

      title={
        defaultValues
          ? "Editar proveedor"
          : "Nuevo proveedor"
      }

      size="lg"
    >
      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        {/* =====================================================
            INFORMACIÓN
        ===================================================== */}

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <Building2
                size={
                  20
                }
                className="text-blue-600"
              />
            </div>

            <div>
              <p className="font-semibold text-blue-900">
                Proveedor corporativo
              </p>

              <p className="mt-1 text-sm leading-5 text-blue-700">
                El proveedor estará disponible para Lima, Kolpa,
                Poderosa y OreX al generar Órdenes de Compra.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            DATOS PRINCIPALES
        ===================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-gray-500">
            Información del proveedor
          </h3>

          <div className="space-y-5">
            {/* NOMBRE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Razón Social / Nombre *
              </label>

              <Input
                className="h-11"
                value={
                  form.name
                }
                disabled={
                  loading
                }
                placeholder="Ej. FERRETERÍA INDUSTRIAL S.A.C."
                onChange={(
                  event,
                ) =>
                  updateField(
                    "name",
                    event.target.value,
                  )
                }
              />
            </div>

            {/* RUC + TELÉFONO */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  RUC
                </label>

                <Input
                  className="h-11"
                  value={
                    form.ruc ??
                    ""
                  }
                  disabled={
                    loading
                  }
                  placeholder="20XXXXXXXXX"
                  maxLength={
                    20
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "ruc",
                      event.target.value,
                    )
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Teléfono
                </label>

                <div className="relative">
                  <Phone
                    size={
                      17
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <Input
                    className="h-11 pl-10"
                    value={
                      form.phone ??
                      ""
                    }
                    disabled={
                      loading
                    }
                    placeholder="999 999 999"
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "phone",
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Correo electrónico
              </label>

              <div className="relative">
                <Mail
                  size={
                    17
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <Input
                  type="email"
                  className="h-11 pl-10"
                  value={
                    form.email ??
                    ""
                  }
                  disabled={
                    loading
                  }
                  placeholder="ventas@proveedor.com"
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "email",
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>

            {/* DIRECCIÓN */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Dirección
              </label>

              <div className="relative">
                <MapPin
                  size={
                    17
                  }
                  className="absolute left-3 top-3.5 text-gray-400"
                />

                <textarea
                  rows={
                    3
                  }
                  value={
                    form.address ??
                    ""
                  }
                  disabled={
                    loading
                  }
                  placeholder="Dirección fiscal o comercial del proveedor"
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "address",
                      event.target.value,
                    )
                  }
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-3 pl-10 text-sm text-gray-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            ESTADO
        ===================================================== */}

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 transition hover:bg-gray-100">
          <div>
            <p className="font-semibold text-gray-800">
              Proveedor activo
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Los proveedores activos estarán disponibles al registrar nuevas Órdenes de Compra.
            </p>
          </div>

          <input
            type="checkbox"
            checked={
              form.isActive ??
              true
            }
            disabled={
              loading
            }
            onChange={(
              event,
            ) =>
              updateField(
                "isActive",
                event.target.checked,
              )
            }
            className="h-5 w-5 shrink-0 cursor-pointer accent-orange-500"
          />
        </label>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {
              error
            }
          </div>
        )}

        {/* =====================================================
            ACCIONES
        ===================================================== */}

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
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
              loading
            }
          >
            {loading
              ? "Guardando..."
              : defaultValues
                ? "Guardar cambios"
                : "Registrar proveedor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}