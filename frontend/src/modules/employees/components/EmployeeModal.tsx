import { useEffect, useMemo, useState } from "react";

import {
  Building2,
  CalendarDays,
  ContactRound,
  CreditCard,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

import type { Company } from "@/modules/companies/types/company.types";

import type {
  CreateEmployeeDto,
  Employee,
  EmployeeType,
} from "../types/employee.types";

interface Props {
  open: boolean;

  employee?: Employee | null;

  companies: Company[];

  loading?: boolean;

  onClose: () => void;

  onSubmit: (data: CreateEmployeeDto) => void;
}

const EMPTY_FORM: CreateEmployeeDto = {
  dni: "",
  firstName: "",
  lastName: "",
  companyId: 0,
  employeeType: "WORKER",
  hireDate: "",
  terminationDate: "",
  phone: "",
  email: "",
  observations: "",
  bankAccount: "",
};

export function EmployeeModal({
  open,
  employee,
  companies,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] =
    useState<CreateEmployeeDto>(EMPTY_FORM);

  const [error, setError] = useState("");

  // ============================================================
  // EMPRESAS DISPONIBLES
  // ============================================================

  const activeCompanies = useMemo(
    () =>
      companies.filter(
        (company) =>
          company.isActive ||
          company.id === employee?.company.id,
      ),
    [companies, employee],
  );

  // ============================================================
  // CARGAR FORMULARIO
  // ============================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    if (employee) {
      setForm({
        dni: employee.dni,

        firstName: employee.firstName,

        lastName: employee.lastName,

        companyId: employee.company.id,

        employeeType: employee.employeeType,

        hireDate: employee.hireDate,

        terminationDate:
          employee.terminationDate ?? "",

        phone: employee.phone ?? "",

        email: employee.email ?? "",

        observations:
          employee.observations ?? "",

        // CORREGIDO
        bankAccount:
          employee.bankAccount ?? "",
      });
    } else {
      setForm({
        ...EMPTY_FORM,
      });
    }

    setError("");
  }, [open, employee]);

  // ============================================================
  // ACTUALIZAR CAMPO
  // ============================================================

  const updateField = <
    K extends keyof CreateEmployeeDto
  >(
    key: K,
    value: CreateEmployeeDto[K],
  ) => {
    setForm((current) => ({
      ...current,

      [key]: value,
    }));
  };

  // ============================================================
  // GUARDAR
  // ============================================================

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    // ==========================================================
    // DNI
    // ==========================================================

    if (!/^\d{8}$/.test(form.dni.trim())) {
      setError(
        "El DNI debe contener exactamente 8 dígitos.",
      );

      return;
    }

    // ==========================================================
    // NOMBRES
    // ==========================================================

    if (
      !form.firstName.trim() ||
      !form.lastName.trim()
    ) {
      setError("Ingresa nombres y apellidos.");

      return;
    }

    // ==========================================================
    // EMPRESA
    // ==========================================================

    if (!form.companyId) {
      setError(
        "Selecciona la empresa del trabajador.",
      );

      return;
    }

    // ==========================================================
    // FECHA DE INGRESO
    // ==========================================================

    if (!form.hireDate) {
      setError("Ingresa la fecha de ingreso.");

      return;
    }

    // ==========================================================
    // FECHA DE CESE
    // ==========================================================

    if (
      form.terminationDate &&
      form.terminationDate < form.hireDate
    ) {
      setError(
        "La fecha de cese no puede ser anterior a la fecha de ingreso.",
      );

      return;
    }

    // ==========================================================
    // ENVIAR
    // ==========================================================

    onSubmit({
      dni: form.dni.trim(),

      firstName: form.firstName.trim(),

      lastName: form.lastName.trim(),

      companyId: Number(form.companyId),

      employeeType: form.employeeType,

      hireDate: form.hireDate,

      terminationDate:
        form.terminationDate || undefined,

      phone:
        form.phone?.trim() || undefined,

      email:
        form.email?.trim().toLowerCase() ||
        undefined,

      observations:
        form.observations?.trim() || undefined,

      bankAccount:
        form.bankAccount?.trim() || undefined,
    });
  };

  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        employee
          ? "Editar trabajador"
          : "Nuevo trabajador"
      }
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* =====================================================
            INFORMACIÓN
        ===================================================== */}

        <div className="rounded-xl border border-hr-border bg-hr-background px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <UserRound
                size={20}
                className="text-hr-primary"
              />
            </div>

            <div>
              <p className="font-semibold text-hr-text">
                Registro de trabajador
              </p>

              <p className="mt-1 text-sm leading-5 text-hr-text">
                Registra la información personal y
                laboral base. El cargo y la unidad se
                gestionarán mediante asignaciones
                laborales.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            DATOS PERSONALES
        ===================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-5 flex items-center gap-2">
            <ContactRound
              size={18}
              className="text-gray-500"
            />

            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              Información personal
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* DNI */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                DNI *
              </label>

              <Input
                value={form.dni}
                disabled={loading}
                inputMode="numeric"
                maxLength={8}
                placeholder="12345678"
                onChange={(event) => {
                  const value =
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 8);

                  updateField("dni", value);
                }}
              />
            </div>

            {/* TIPO */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Tipo de trabajador *
              </label>

              <select
                value={form.employeeType}
                disabled={loading}
                onChange={(event) =>
                  updateField(
                    "employeeType",
                    event.target
                      .value as EmployeeType,
                  )
                }
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-hr-primary focus:ring-2 focus:ring-hr-primary"
              >
                <option value="WORKER">
                  Obrero
                </option>

                <option value="EMPLOYEE">
                  Empleado
                </option>
              </select>
            </div>

            {/* NOMBRES */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nombres *
              </label>

              <Input
                value={form.firstName}
                disabled={loading}
                placeholder="Nombres"
                onChange={(event) =>
                  updateField(
                    "firstName",
                    event.target.value,
                  )
                }
              />
            </div>

            {/* APELLIDOS */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Apellidos *
              </label>

              <Input
                value={form.lastName}
                disabled={loading}
                placeholder="Apellidos"
                onChange={(event) =>
                  updateField(
                    "lastName",
                    event.target.value,
                  )
                }
              />
            </div>

            {/* TELÉFONO */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Teléfono
              </label>

              <div className="relative">
                <Phone
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <Input
                  className="pl-10"
                  value={form.phone ?? ""}
                  disabled={loading}
                  placeholder="999 999 999"
                  onChange={(event) =>
                    updateField(
                      "phone",
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>

            {/* CORREO */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Correo
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <Input
                  type="email"
                  className="pl-10"
                  value={form.email ?? ""}
                  disabled={loading}
                  placeholder="trabajador@empresa.com"
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            INFORMACIÓN LABORAL
        ===================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-5 flex items-center gap-2">
            <Building2
              size={18}
              className="text-gray-500"
            />

            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              Información laboral
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* EMPRESA */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Empresa *
              </label>

              <select
                value={form.companyId || ""}
                disabled={loading}
                onChange={(event) =>
                  updateField(
                    "companyId",
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-hr-primary focus:ring-2 focus:ring-hr-primary"
              >
                <option value="">
                  Seleccionar empresa
                </option>

                {activeCompanies.map(
                  (company) => (
                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {company.tradeName ||
                        company.legalName}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* FECHA INGRESO */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Fecha de ingreso *
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <Input
                  type="date"
                  className="pl-10"
                  value={form.hireDate}
                  disabled={loading}
                  onChange={(event) =>
                    updateField(
                      "hireDate",
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>

            {/* FECHA CESE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Fecha de cese
              </label>

              <Input
                type="date"
                value={
                  form.terminationDate ?? ""
                }
                disabled={loading}
                onChange={(event) =>
                  updateField(
                    "terminationDate",
                    event.target.value,
                  )
                }
              />
            </div>

            {/* CUENTA BANCARIA */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Cuenta bancaria
              </label>

              <div className="relative">
                <CreditCard
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <Input
                  className="pl-10"
                  value={
                    form.bankAccount ?? ""
                  }
                  disabled={loading}
                  placeholder="Número de cuenta"
                  onChange={(event) =>
                    updateField(
                      "bankAccount",
                      event.target.value,
                    )
                  }
                />
              </div>

              <p className="mt-1 text-xs text-gray-400">
                Se utilizará posteriormente para
                procesos de pago.
              </p>
            </div>
          </div>

          {/* OBSERVACIONES */}

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Observaciones
            </label>

            <textarea
              rows={3}
              value={
                form.observations ?? ""
              }
              disabled={loading}
              placeholder="Información adicional del trabajador"
              onChange={(event) =>
                updateField(
                  "observations",
                  event.target.value,
                )
              }
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-700 outline-none transition focus:border-hr-primary focus:ring-2 focus:ring-hr-primary"
            />
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

          <Button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Guardando..."
              : employee
                ? "Guardar cambios"
                : "Registrar trabajador"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}