import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  ClipboardList,
  MousePointer2,
  Save,
  UserRound,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/Button";

import {
  useWarehouses,
} from "@/modules/warehouses/hooks/useWarehouses";

import {
  useEmployeeAssignments,
} from "@/modules/employee-assignments/hooks/useEmployeeAssignments";

import {
  useBulkUpsertMineTimesheets,
  useMineTimesheetMonth,
} from "../hooks/useMineTimesheets";

import type {
  MineTimesheet,
  MineTimesheetCode,
  CreateMineTimesheetDto,
} from "../types/mine-timesheet.types";

import type {
  Employee,
} from "@/modules/employees/types/employee.types";

import type {
  EmployeeAssignment,
} from "@/modules/employee-assignments/types/employee-assignment.types";

import type {
  Warehouse,
} from "@/modules/warehouses/types/warehouse.types";

interface TimesheetRow {
  date: string;

  dayNumber: number;

  dayName: string;

  recordId?: number;

  code:
    MineTimesheetCode | "";

  observations: string;

  selected: boolean;
}

const EMPTY_WAREHOUSES: Warehouse[] = [];

const EMPTY_ASSIGNMENTS: EmployeeAssignment[] = [];

const EMPTY_TIMESHEETS: MineTimesheet[] = [];

const MONTHS = [
  {
    value: 1,
    label: "Enero",
  },
  {
    value: 2,
    label: "Febrero",
  },
  {
    value: 3,
    label: "Marzo",
  },
  {
    value: 4,
    label: "Abril",
  },
  {
    value: 5,
    label: "Mayo",
  },
  {
    value: 6,
    label: "Junio",
  },
  {
    value: 7,
    label: "Julio",
  },
  {
    value: 8,
    label: "Agosto",
  },
  {
    value: 9,
    label: "Septiembre",
  },
  {
    value: 10,
    label: "Octubre",
  },
  {
    value: 11,
    label: "Noviembre",
  },
  {
    value: 12,
    label: "Diciembre",
  },
];

const TIMESHEET_CODES:
  MineTimesheetCode[] = [
  "DL",
  "P",
  "I",
  "S",
  "PG",
  "V",
  "R",
  "DM",
  "TO",
  "TC",
  "AT",
];

function getDaysInMonth(
  year: number,
  month: number,
): number {
  return new Date(
    year,
    month,
    0,
  ).getDate();
}

function formatDate(
  year: number,
  month: number,
  day: number,
): string {
  return `${year}-${String(
    month,
  ).padStart(
    2,
    "0",
  )}-${String(
    day,
  ).padStart(
    2,
    "0",
  )}`;
}

function getDayName(
  year: number,
  month: number,
  day: number,
): string {
  const value =
    new Date(
      year,
      month - 1,
      day,
    )
      .toLocaleDateString(
        "es-PE",
        {
          weekday:
            "short",
        },
      )
      .replace(
        ".",
        "",
      );

  return (
    value
      .charAt(
        0,
      )
      .toUpperCase() +
    value.slice(
      1,
    )
  );
}

export function MineTimesheetsPage() {
  const today =
    new Date();

  // ============================================================
  // FILTROS
  // ============================================================

  const [
    year,
    setYear,
  ] =
    useState(
      today.getFullYear(),
    );

  const [
    month,
    setMonth,
  ] =
    useState(
      today.getMonth() +
        1,
    );

  const [
    warehouseId,
    setWarehouseId,
  ] =
    useState<number>(
      0,
    );

  const [
    employeeId,
    setEmployeeId,
  ] =
    useState<number>(
      0,
    );

  // ============================================================
  // EDICIÓN MASIVA
  // ============================================================

  const [
    bulkCode,
    setBulkCode,
  ] =
    useState<
      MineTimesheetCode | ""
    >(
      "",
    );

  const [
    rows,
    setRows,
  ] =
    useState<
      TimesheetRow[]
    >(
      [],
    );

  const [
    actionError,
    setActionError,
  ] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState("");

  // ============================================================
  // QUERIES
  // ============================================================

  const warehousesQuery =
    useWarehouses();

  const assignmentsQuery =
    useEmployeeAssignments();

  const timesheetsQuery =
    useMineTimesheetMonth(
      {
        year,
        month,

        warehouseId:
          warehouseId ||
          undefined,
      },

      Boolean(
        warehouseId,
      ),
    );

  const bulkUpsert =
    useBulkUpsertMineTimesheets();

  // ============================================================
  // DATOS ESTABLES
  // ============================================================

  const warehouses =
    warehousesQuery.data ??
    EMPTY_WAREHOUSES;

  const assignments =
    assignmentsQuery.data ??
    EMPTY_ASSIGNMENTS;

  const timesheets =
    timesheetsQuery.data ??
    EMPTY_TIMESHEETS;

  // ============================================================
  // SOLO UNIDADES MINERAS
  // ============================================================

  const mineWarehouses =
    useMemo(
      () =>
        warehouses.filter(
          (
            warehouse,
          ) =>
            warehouse.isActive &&
            warehouse.type ===
              "MINE",
        ),

      [
        warehouses,
      ],
    );

  // ============================================================
  // TRABAJADORES DE LA UNIDAD
  // ============================================================

  const availableEmployees:
    Employee[] =
    useMemo(
      () => {
        if (
          !warehouseId
        ) {
          return [];
        }

        const map =
          new Map<
            number,
            Employee
          >();

        assignments
          .filter(
            (
              assignment,
            ) =>
              assignment.isCurrent &&
              assignment.warehouse.id ===
                warehouseId &&
              assignment.employee.isActive,
          )
          .forEach(
            (
              assignment,
            ) => {
              map.set(
                assignment.employee.id,
                assignment.employee,
              );
            },
          );

        return Array.from(
          map.values(),
        ).sort(
          (
            a,
            b,
          ) =>
            `${a.lastName} ${a.firstName}`.localeCompare(
              `${b.lastName} ${b.firstName}`,
              "es",
            ),
        );
      },

      [
        assignments,
        warehouseId,
      ],
    );

  // ============================================================
  // TRABAJADOR ACTUAL
  // ============================================================

  const selectedEmployee =
    useMemo(
      () =>
        availableEmployees.find(
          (
            employee,
          ) =>
            employee.id ===
            employeeId,
        ),

      [
        availableEmployees,
        employeeId,
      ],
    );

  // ============================================================
  // REGISTROS DEL TRABAJADOR
  // ============================================================

  const employeeTimesheets =
    useMemo(
      () => {
        if (
          !employeeId
        ) {
          return [];
        }

        return timesheets.filter(
          (
            item,
          ) =>
            item.employee.id ===
            employeeId,
        );
      },

      [
        timesheets,
        employeeId,
      ],
    );

  // ============================================================
  // GENERAR MES
  // ============================================================

  useEffect(
    () => {
      if (
        !employeeId ||
        !warehouseId
      ) {
        setRows(
          (
            current,
          ) =>
            current.length ===
            0
              ? current
              : [],
        );

        return;
      }

      const days =
        getDaysInMonth(
          year,
          month,
        );

      const recordMap =
        new Map<
          string,
          MineTimesheet
        >();

      employeeTimesheets.forEach(
        (
          item,
        ) => {
          recordMap.set(
            item.date,
            item,
          );
        },
      );

      const generated:
        TimesheetRow[] = [];

      for (
        let day = 1;
        day <= days;
        day += 1
      ) {
        const date =
          formatDate(
            year,
            month,
            day,
          );

        const existing =
          recordMap.get(
            date,
          );

        generated.push({
          date,

          dayNumber:
            day,

          dayName:
            getDayName(
              year,
              month,
              day,
            ),

          recordId:
            existing?.id,

          code:
            existing?.code ??
            "",

          observations:
            existing?.observations ??
            "",

          selected:
            false,
        });
      }

      setRows(
        generated,
      );
    },

    [
      year,
      month,
      warehouseId,
      employeeId,
      employeeTimesheets,
    ],
  );

  // ============================================================
  // CAMBIO DE UNIDAD
  // ============================================================

  const handleWarehouseChange = (
    value: string,
  ) => {
    setWarehouseId(
      Number(
        value,
      ),
    );

    setEmployeeId(
      0,
    );

    setRows(
      [],
    );

    setActionError(
      "",
    );

    setSuccessMessage(
      "",
    );
  };

  // ============================================================
  // CAMBIO TRABAJADOR
  // ============================================================

  const handleEmployeeChange = (
    value: string,
  ) => {
    setEmployeeId(
      Number(
        value,
      ),
    );

    setActionError(
      "",
    );

    setSuccessMessage(
      "",
    );
  };

  // ============================================================
  // ACTUALIZAR FILA
  // ============================================================

  const updateRow = (
    index: number,

    changes:
      Partial<TimesheetRow>,
  ) => {
    setRows(
      (
        current,
      ) =>
        current.map(
          (
            row,
            rowIndex,
          ) =>
            rowIndex ===
            index
              ? {
                  ...row,
                  ...changes,
                }
              : row,
        ),
    );

    setSuccessMessage(
      "",
    );
  };

  // ============================================================
  // SELECCIONAR TODOS
  // ============================================================

  const allSelected =
    rows.length >
      0 &&
    rows.every(
      (
        row,
      ) =>
        row.selected,
    );

  const toggleAll =
    () => {
      setRows(
        (
          current,
        ) =>
          current.map(
            (
              row,
            ) => ({
              ...row,

              selected:
                !allSelected,
            }),
          ),
      );
    };

  // ============================================================
  // APLICAR CÓDIGO
  // ============================================================

  const applyCodeToSelected =
    () => {
      setActionError(
        "",
      );

      setSuccessMessage(
        "",
      );

      if (
        !bulkCode
      ) {
        setActionError(
          "Selecciona un código para aplicar.",
        );

        return;
      }

      const selectedCount =
        rows.filter(
          (
            row,
          ) =>
            row.selected,
        ).length;

      if (
        selectedCount ===
        0
      ) {
        setActionError(
          "Selecciona al menos un día.",
        );

        return;
      }

      setRows(
        (
          current,
        ) =>
          current.map(
            (
              row,
            ) =>
              row.selected
                ? {
                    ...row,

                    code:
                      bulkCode,

                    selected:
                      false,
                  }
                : row,
          ),
      );

      setSuccessMessage(
        `Código ${bulkCode} aplicado a ${selectedCount} día(s).`,
      );
    };

  // ============================================================
  // SELECCIONAR LUNES A VIERNES
  // ============================================================

  const selectWeekdays =
    () => {
      setRows(
        (
          current,
        ) =>
          current.map(
            (
              row,
            ) => {
              const date =
                new Date(
                  year,
                  month - 1,
                  row.dayNumber,
                );

              const day =
                date.getDay();

              return {
                ...row,

                selected:
                  day >= 1 &&
                  day <= 5,
              };
            },
          ),
      );
    };

  // ============================================================
  // LIMPIAR SELECCIÓN
  // ============================================================

  const clearSelection =
    () => {
      setRows(
        (
          current,
        ) =>
          current.map(
            (
              row,
            ) => ({
              ...row,

              selected:
                false,
            }),
          ),
      );
    };

  // ============================================================
  // GUARDAR
  // ============================================================

  const handleSave =
    async () => {
      setActionError(
        "",
      );

      setSuccessMessage(
        "",
      );

      if (
        !warehouseId
      ) {
        setActionError(
          "Selecciona una unidad minera.",
        );

        return;
      }

      if (
        !employeeId
      ) {
        setActionError(
          "Selecciona un trabajador.",
        );

        return;
      }

      const records:
        CreateMineTimesheetDto[] =
        rows
          .filter(
            (
              row,
            ) =>
              Boolean(
                row.code,
              ),
          )
          .map(
            (
              row,
            ) => ({
              employeeId,

              warehouseId,

              date:
                row.date,

              code:
                row.code as MineTimesheetCode,

              observations:
                row.observations
                  .trim() ||
                undefined,
            }),
          );

      if (
        records.length ===
        0
      ) {
        setActionError(
          "No existen días con códigos para guardar.",
        );

        return;
      }

      try {
        await bulkUpsert.mutateAsync({
          records,
        });

        setSuccessMessage(
          "Tareo mensual guardado correctamente.",
        );
      } catch (
        error:
          any
      ) {
        const message =
          error?.response?.data?.message;

        setActionError(
          Array.isArray(
            message,
          )
            ? message.join(
                " ",
              )
            : message ??
                "No se pudo guardar el tareo.",
        );
      }
    };

  // ============================================================
  // RESUMEN
  // ============================================================

  const codeSummary =
    useMemo(
      () => {
        const result =
          new Map<
            MineTimesheetCode,
            number
          >();

        TIMESHEET_CODES.forEach(
          (
            code,
          ) => {
            result.set(
              code,
              0,
            );
          },
        );

        rows.forEach(
          (
            row,
          ) => {
            if (
              row.code
            ) {
              const code =
                row.code as MineTimesheetCode;

              result.set(
                code,
                (
                  result.get(
                    code,
                  ) ??
                  0
                ) + 1,
              );
            }
          },
        );

        return Array.from(
          result.entries(),
        )
          .filter(
            (
              [
                ,
                count,
              ],
            ) =>
              count >
              0,
          );
      },

      [
        rows,
      ],
    );

  const registeredDays =
    rows.filter(
      (
        row,
      ) =>
        Boolean(
          row.code,
        ),
    ).length;

  const selectedDays =
    rows.filter(
      (
        row,
      ) =>
        row.selected,
    ).length;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-7 p-1">
      {/* HEADER */}

      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
            <ClipboardList
              size={
                24
              }

              className="text-orange-500"
            />
          </div>

          Tareo de Mina
        </h1>

        <p className="ml-14 text-sm text-gray-500">
          Control mensual del personal asignado a unidades mineras
        </p>
      </div>

      {/* FILTROS */}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-gray-500">
              Año
            </label>

            <select
              value={
                year
              }

              onChange={(
                event,
              ) => {
                setYear(
                  Number(
                    event.target.value,
                  ),
                );

                setSuccessMessage(
                  "",
                );
              }}

              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
            >
              {Array.from(
                {
                  length: 7,
                },

                (
                  _,
                  index,
                ) =>
                  today.getFullYear() -
                  3 +
                  index,
              ).map(
                (
                  value,
                ) => (
                  <option
                    key={
                      value
                    }

                    value={
                      value
                    }
                  >
                    {
                      value
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-gray-500">
              Mes
            </label>

            <select
              value={
                month
              }

              onChange={(
                event,
              ) => {
                setMonth(
                  Number(
                    event.target.value,
                  ),
                );

                setSuccessMessage(
                  "",
                );
              }}

              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
            >
              {MONTHS.map(
                (
                  item,
                ) => (
                  <option
                    key={
                      item.value
                    }

                    value={
                      item.value
                    }
                  >
                    {
                      item.label
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-gray-500">
              Unidad minera
            </label>

            <select
              value={
                warehouseId ||
                ""
              }

              onChange={(
                event,
              ) =>
                handleWarehouseChange(
                  event.target.value,
                )
              }

              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
            >
              <option value="">
                Seleccionar unidad
              </option>

              {mineWarehouses.map(
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

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-gray-500">
              Trabajador
            </label>

            <select
              value={
                employeeId ||
                ""
              }

              disabled={
                !warehouseId
              }

              onChange={(
                event,
              ) =>
                handleEmployeeChange(
                  event.target.value,
                )
              }

              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 disabled:bg-gray-100"
            >
              <option value="">
                Seleccionar trabajador
              </option>

              {availableEmployees.map(
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
                      employee.lastName
                    },{" "}
                    {
                      employee.firstName
                    }{" "}
                    - DNI{" "}
                    {
                      employee.dni
                    }
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        {warehouseId &&
          availableEmployees.length ===
            0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              No existen trabajadores con asignación actual en esta
              unidad minera.
            </div>
          )}
      </div>

      {/* TRABAJADOR */}

      {selectedEmployee && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <UserRound
                  size={
                    23
                  }

                  className="text-blue-600"
                />
              </div>

              <div>
                <p className="font-bold text-gray-900">
                  {
                    selectedEmployee.firstName
                  }{" "}
                  {
                    selectedEmployee.lastName
                  }
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  DNI{" "}
                  {
                    selectedEmployee.dni
                  }
                </p>
              </div>
            </div>

            <Button
              type="button"

              disabled={
                bulkUpsert.isPending
              }

              onClick={
                handleSave
              }

              className="flex items-center justify-center gap-2"
            >
              <Save
                size={
                  18
                }
              />

              {bulkUpsert.isPending
                ? "Guardando..."
                : "Guardar tareo"}
            </Button>
          </div>
        </div>
      )}

      {/* EDICIÓN MASIVA */}

      {selectedEmployee && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <MousePointer2
                  size={
                    19
                  }

                  className="text-orange-600"
                />

                <p className="font-bold text-gray-900">
                  Edición rápida
                </p>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Marca varios días y aplica un código de una sola vez.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <button
                type="button"

                onClick={
                  selectWeekdays
                }

                className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Seleccionar L-V
              </button>

              <button
                type="button"

                onClick={
                  clearSelection
                }

                className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Limpiar selección
              </button>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                  Código
                </label>

                <select
                  value={
                    bulkCode
                  }

                  onChange={(
                    event,
                  ) =>
                    setBulkCode(
                      event.target
                        .value as
                        | MineTimesheetCode
                        | "",
                    )
                  }

                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm"
                >
                  <option value="">
                    Seleccionar
                  </option>

                  {TIMESHEET_CODES.map(
                    (
                      code,
                    ) => (
                      <option
                        key={
                          code
                        }

                        value={
                          code
                        }
                      >
                        {
                          code
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              <Button
                type="button"

                onClick={
                  applyCodeToSelected
                }
              >
                Aplicar a{" "}
                {
                  selectedDays
                }{" "}
                día(s)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MENSAJES */}

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {
            actionError
          }
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
          <CheckCircle2
            size={
              19
            }
          />

          {
            successMessage
          }
        </div>
      )}

      {/* RESUMEN */}

      {selectedEmployee && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="mr-3">
              <p className="text-xs font-bold uppercase text-gray-400">
                Días registrados
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {
                  registeredDays
                }
              </p>
            </div>

            {codeSummary.map(
              (
                [
                  code,
                  count,
                ],
              ) => (
                <div
                  key={
                    code
                  }

                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                >
                  <p className="text-xs font-bold text-gray-500">
                    {
                      code
                    }
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {
                      count
                    }
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* TABLA */}

      {!selectedEmployee ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-sm">
          <ClipboardList
            size={
              42
            }

            className="mx-auto text-gray-300"
          />

          <p className="mt-4 font-semibold text-gray-700">
            Selecciona una unidad minera y un trabajador
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Aquí aparecerá automáticamente el tareo del mes.
          </p>
        </div>
      ) : timesheetsQuery.isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center text-gray-500 shadow-sm">
          Cargando tareo...
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="w-16 px-4 py-4 text-center">
                    <input
                      type="checkbox"

                      checked={
                        allSelected
                      }

                      onChange={
                        toggleAll
                      }

                      className="h-4 w-4 accent-orange-500"
                    />
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">
                    Día
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">
                    Código
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">
                    Observación
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {rows.map(
                  (
                    row,
                    index,
                  ) => {
                    const currentDate =
                      new Date(
                        year,
                        month - 1,
                        row.dayNumber,
                      );

                    const day =
                      currentDate.getDay();

                    const weekend =
                      day ===
                        0 ||
                      day ===
                        6;

                    return (
                      <tr
                        key={
                          row.date
                        }

                        className={
                          row.selected
                            ? "bg-orange-50"
                            : weekend
                              ? "bg-gray-50/80"
                              : "hover:bg-gray-50"
                        }
                      >
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"

                            checked={
                              row.selected
                            }

                            onChange={(
                              event,
                            ) =>
                              updateRow(
                                index,
                                {
                                  selected:
                                    event.target.checked,
                                },
                              )
                            }

                            className="h-4 w-4 accent-orange-500"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 font-bold text-gray-800">
                              {
                                row.dayNumber
                              }
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800">
                                {
                                  row.dayName
                                }
                              </p>

                              <p className="text-xs text-gray-400">
                                {
                                  row.date
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={
                              row.code
                            }

                            onChange={(
                              event,
                            ) =>
                              updateRow(
                                index,
                                {
                                  code:
                                    event.target.value as
                                      | MineTimesheetCode
                                      | "",
                                },
                              )
                            }

                            className="h-10 w-32 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700"
                          >
                            <option value="">
                              —
                            </option>

                            {TIMESHEET_CODES.map(
                              (
                                code,
                              ) => (
                                <option
                                  key={
                                    code
                                  }

                                  value={
                                    code
                                  }
                                >
                                  {
                                    code
                                  }
                                </option>
                              ),
                            )}
                          </select>
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="text"

                            value={
                              row.observations
                            }

                            placeholder="Observación opcional"

                            onChange={(
                              event,
                            ) =>
                              updateRow(
                                index,
                                {
                                  observations:
                                    event.target.value,
                                },
                              )
                            }

                            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"
                          />
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
            <Button
              type="button"

              disabled={
                bulkUpsert.isPending
              }

              onClick={
                handleSave
              }

              className="flex items-center gap-2"
            >
              <Save
                size={
                  18
                }
              />

              {bulkUpsert.isPending
                ? "Guardando..."
                : "Guardar mes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}