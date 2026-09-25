import { useEffect, useState } from "react";

import { Building2, FileText, MapPin } from "lucide-react";

import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/Input";

import { Modal } from "@/components/ui/Modal";

import type { CreateCompanyDto } from "../types/company.types";

// ============================================================
// PROPS
// ============================================================

interface Props {
  open: boolean;

  loading?: boolean;

  defaultValues?: Partial<CreateCompanyDto>;

  onClose: () => void;

  onSubmit: (data: CreateCompanyDto) => void;
}

// ============================================================
// FORM VACÍO
// ============================================================

const EMPTY_FORM: CreateCompanyDto = {
  legalName: "",

  tradeName: "",

  ruc: "",

  address: "",
};

// ============================================================
// MODAL
// ============================================================

export function CompanyModal({
  open,
  loading = false,
  defaultValues,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<CreateCompanyDto>(EMPTY_FORM);

  const [error, setError] = useState("");

  // ==========================================================
  // INICIALIZAR
  // ==========================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      legalName: defaultValues?.legalName ?? "",

      tradeName: defaultValues?.tradeName ?? "",

      ruc: defaultValues?.ruc ?? "",

      address: defaultValues?.address ?? "",
    });

    setError("");
  }, [open, defaultValues]);

  // ==========================================================
  // ACTUALIZAR CAMPO
  // ==========================================================

  const updateField = <K extends keyof CreateCompanyDto>(
    key: K,

    value: CreateCompanyDto[K],
  ) => {
    setForm((current) => ({
      ...current,

      [key]: value,
    }));
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    // ========================================================
    // RAZÓN SOCIAL
    // ========================================================

    if (!form.legalName.trim()) {
      setError("Ingresa la razón social de la empresa.");

      return;
    }

    // ========================================================
    // RUC
    // ========================================================

    const ruc = form.ruc.trim();

    if (!/^\d{11}$/.test(ruc)) {
      setError("El RUC debe contener exactamente 11 dígitos.");

      return;
    }

    // ========================================================
    // ENVIAR
    // ========================================================

    onSubmit({
      legalName: form.legalName.trim(),

      tradeName: form.tradeName?.trim() || undefined,

      ruc,

      address: form.address?.trim() || undefined,
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
      open={open}
      onClose={onClose}
      title={defaultValues ? "Editar empresa" : "Nueva empresa"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* =====================================================
            INFORMACIÓN
        ===================================================== */}

        <div className="rounded-xl border border-hr-border bg-hr-background px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <Building2 size={20} className="text-hr-primary" />
            </div>

            <div>
              <p className="font-semibold text-hr-text">Empresa empleadora</p>

              <p className="mt-1 text-sm leading-5 text-hr-text">
                Esta empresa podrá ser asignada a los trabajadores registrados
                en el módulo de RR.HH.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            DATOS
        ===================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-gray-500">
            Información de la empresa
          </h3>

          <div className="space-y-5">
            {/* RAZÓN SOCIAL */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Razón social *
              </label>

              <Input
                className="h-11"
                value={form.legalName}
                disabled={loading}
                placeholder="Ej. TEINCOMIN SAC"
                onChange={(event) =>
                  updateField("legalName", event.target.value)
                }
              />
            </div>

            {/* NOMBRE COMERCIAL + RUC */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Nombre comercial
                </label>

                <div className="relative">
                  <FileText
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <Input
                    className="h-11 pl-10"
                    value={form.tradeName ?? ""}
                    disabled={loading}
                    placeholder="Ej. TEINCOMIN"
                    onChange={(event) =>
                      updateField("tradeName", event.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  RUC *
                </label>

                <Input
                  className="h-11"
                  value={form.ruc}
                  disabled={loading}
                  placeholder="20XXXXXXXXX"
                  inputMode="numeric"
                  maxLength={11}
                  onChange={(event) => {
                    const value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 11);

                    updateField("ruc", value);
                  }}
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
                  size={17}
                  className="absolute left-3 top-3.5 text-gray-400"
                />

                <textarea
                  rows={3}
                  value={form.address ?? ""}
                  disabled={loading}
                  placeholder="Dirección fiscal de la empresa"
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-3 pl-10 text-sm text-gray-700 outline-none transition focus:border-hr-primary focus:ring-2 focus:ring-hr-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* =====================================================
            ACCIONES
        ===================================================== */}

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button type="submit" disabled={loading}>
            {loading
              ? "Guardando..."
              : defaultValues
                ? "Guardar cambios"
                : "Registrar empresa"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
