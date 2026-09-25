import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  UserRound,
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
  Employee,
} from "@/modules/employees/types/employee.types";

import type {
  Position,
} from "@/modules/positions/types/position.types";

import type {
  Warehouse,
} from "@/modules/warehouses/types/warehouse.types";

import type {
  CreateEmployeeAssignmentDto,
  EmployeeAssignment,
} from "../types/employee-assignment.types";

interface Props {
  open: boolean;

  assignment?:
    EmployeeAssignment | null;

  employees:
    Employee[];

  positions:
    Position[];

  warehouses:
    Warehouse[];

  loading?: boolean;

  onClose:
    () => void;

  onSubmit: (
    data:
      CreateEmployeeAssignmentDto,
  ) => void;
}

const EMPTY_FORM:
  CreateEmployeeAssignmentDto = {
  employeeId: 0,

  positionId: 0,

  warehouseId: 0,

  startDate: "",

  endDate: "",

  isCurrent: true,

  observations: "",
};

export function EmployeeAssignmentModal({
  open,
  assignment,
  employees,
  positions,
  warehouses,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [
    form,
    setForm,
  ] =
    useState<CreateEmployeeAssignmentDto>(
      EMPTY_FORM,
    );

  const [
    error,
    setError,
  ] =
    useState("");

  const activeEmployees =
    useMemo(
      () =>
        employees.filter(
          (
            employee,
          ) =>
            employee.isActive ||
            employee.id ===
              assignment?.employee.id,
        ),
      [
        employees,
        assignment,
      ],
    );

  const activePositions =
    useMemo(
      () =>
        positions.filter(
          (
            position,
          ) =>
            position.isActive ||
            position.id ===
              assignment?.position.id,
        ),
      [
        positions,
        assignment,
      ],
    );

  const activeWarehouses =
    useMemo(
      () =>
        warehouses.filter(
          (
            warehouse,
          ) =>
            warehouse.isActive ||
            warehouse.id ===
              assignment?.warehouse.id,
        ),
      [
        warehouses,
        assignment,
      ],
    );

  useEffect(
    () => {
      if (!open) {
        return;
      }

      if (assignment) {
        setForm({
          employeeId:
            assignment.employee.id,

          positionId:
            assignment.position.id,

          warehouseId:
            assignment.warehouse.id,

          startDate:
            assignment.startDate,

          endDate:
            assignment.endDate ??
            "",

          isCurrent:
            assignment.isCurrent,

          observations:
            assignment.observations ??
            "",
        });
      } else {
        setForm({
          ...EMPTY_FORM,
        });
      }

      setError("");
    },
    [
      open,
      assignment,
    ],
  );

  const updateField = <
    K extends keyof CreateEmployeeAssignmentDto,
  >(
    key:
      K,

    value:
      CreateEmployeeAssignmentDto[K],
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

  const handleSubmit = (
    event:
      React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (
      !form.employeeId
    ) {
      setError(
        "Selecciona un trabajador.",
      );

      return;
    }

    if (
      !form.positionId
    ) {
      setError(
        "Selecciona un cargo.",
      );

      return;
    }

    if (
      !form.warehouseId
    ) {
      setError(
        "Selecciona una sede o unidad.",
      );

      return;
    }

    if (
      !form.startDate
    ) {
      setError(
        "Ingresa la fecha de inicio.",
      );

      return;
    }

    if (
      form.endDate &&
      form.endDate <
        form.startDate
    ) {
      setError(
        "La fecha de fin no puede ser anterior a la fecha de inicio.",
      );

      return;
    }

    if (
      form.isCurrent &&
      form.endDate
    ) {
      setError(
        "Una asignación actual no debe tener fecha de fin.",
      );

      return;
    }

    onSubmit({
      employeeId:
        Number(
          form.employeeId,
        ),

      positionId:
        Number(
          form.positionId,
        ),

      warehouseId:
        Number(
          form.warehouseId,
        ),

      startDate:
        form.startDate,

      endDate:
        form.isCurrent
          ? undefined
          : form.endDate ||
            undefined,

      isCurrent:
        form.isCurrent,

      observations:
        form.observations
          ?.trim() ||
        undefined,
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

      title={
        assignment
          ? "Editar asignación"
          : "Nueva asignación"
      }

      size="lg"
    >
      <form
        onSubmit={
          handleSubmit
        }

        className="space-y-6"
      >
        <div className="rounded-xl border border-hr-border bg-hr-background px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <BriefcaseBusiness
                size={
                  20
                }

                className="text-hr-primary"
              />
            </div>

            <div>
              <p className="font-semibold text-hr-text">
                Asignación laboral
              </p>

              <p className="mt-1 text-sm leading-5 text-hr-text">
                Relaciona al trabajador con su cargo y sede actual.
                Si registras una nueva asignación actual, el sistema
                cerrará la anterior automáticamente.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-gray-500">
            Datos de asignación
          </h3>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* TRABAJADOR */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Trabajador *
              </label>

              <div className="relative">
                <UserRound
                  size={
                    17
                  }

                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  value={
                    form.employeeId ||
                    ""
                  }

                  disabled={
                    loading
                  }

                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "employeeId",

                      Number(
                        event.target.value,
                      ),
                    )
                  }

                  className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-700 outline-none focus:border-hr-primary focus:ring-2 focus:ring-hr-primary"
                >
                  <option value="">
                    Seleccionar trabajador
                  </option>

                  {activeEmployees.map(
                    (
                      employee,
                    ) => (
                      <option
                        key={
                          employee.id
                        }

                        value={
                          employee.id
                        }
                      >
                        {
                          employee.firstName
                        }{" "}
                        {
                          employee.lastName
                        } - DNI{" "}
                        {
                          employee.dni
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {/* CARGO */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Cargo *
              </label>

              <div className="relative">
                <BriefcaseBusiness
                  size={
                    17
                  }

                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  value={
                    form.positionId ||
                    ""
                  }

                  disabled={
                    loading
                  }

                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "positionId",

                      Number(
                        event.target.value,
                      ),
                    )
                  }

                  className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-700 outline-none focus:border-hr-primary focus:ring-2 focus:ring-hr-primary"
                >
                  <option value="">
                    Seleccionar cargo
                  </option>

                  {activePositions.map(
                    (
                      position,
                    ) => (
                      <option
                        key={
                          position.id
                        }

                        value={
                          position.id
                        }
                      >
                        {
                          position.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {/* SEDE */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Sede / Mina / Unidad *
              </label>

              <div className="relative">
                <MapPin
                  size={
                    17
                  }

                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  value={
                    form.warehouseId ||
                    ""
                  }

                  disabled={
                    loading
                  }

                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "warehouseId",

                      Number(
                        event.target.value,
                      ),
                    )
                  }

                  className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-700 outline-none focus:border-hr-primary focus:ring-2 focus:ring-hr-primary"
                >
                  <option value="">
                    Seleccionar sede
                  </option>

                  {activeWarehouses.map(
                    (
                      warehouse,
                    ) => (
                      <option
                        key={
                          warehouse.id
                        }

                        value={
                          warehouse.id
                        }
                      >
                        {
                          warehouse.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {/* FECHA INICIO */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Fecha de inicio *
              </label>

              <div className="relative">
                <CalendarDays
                  size={
                    17
                  }

                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <Input
                  type="date"

                  className="pl-10"

                  value={
                    form.startDate
                  }

                  disabled={
                    loading
                  }

                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "startDate",
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>

            {/* FECHA FIN */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Fecha de fin
              </label>

              <Input
                type="date"

                value={
                  form.endDate ??
                  ""
                }

                disabled={
                  loading ||
                  form.isCurrent
                }

                onChange={(
                  event,
                ) =>
                  updateField(
                    "endDate",
                    event.target.value,
                  )
                }
              />
            </div>
          </div>

          {/* ACTUAL */}

          <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
            <div>
              <p className="font-semibold text-gray-800">
                Asignación actual
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Indica que actualmente el trabajador ocupa este
                cargo y se encuentra asignado a esta unidad.
              </p>
            </div>

            <input
              type="checkbox"

              checked={
                form.isCurrent ??
                false
              }

              disabled={
                loading
              }

              onChange={(
                event,
              ) => {
                const checked =
                  event.target.checked;

                updateField(
                  "isCurrent",
                  checked,
                );

                if (
                  checked
                ) {
                  updateField(
                    "endDate",
                    "",
                  );
                }
              }}

              className="h-5 w-5 accent-hr-primary"
            />
          </label>

          {/* OBSERVACIONES */}

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Observaciones
            </label>

            <textarea
              rows={
                3
              }

              value={
                form.observations ??
                ""
              }

              disabled={
                loading
              }

              placeholder="Ej. Traslado a Poderosa por necesidad operativa"

              onChange={(
                event,
              ) =>
                updateField(
                  "observations",
                  event.target.value,
                )
              }

              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-700 outline-none transition focus:border-hr-primary focus:ring-2 focus:ring-hr-primary"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {
              error
            }
          </div>
        )}

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
              : assignment
                ? "Guardar cambios"
                : "Registrar asignación"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}