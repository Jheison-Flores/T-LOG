import {
  useMemo,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  CalendarX2,
  History,
  MapPin,
  Pencil,
  Plus,
  Search,
  UserCheck,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/Button";

import {
  Input,
} from "@/components/ui/Input";

import {
  useEmployees,
} from "@/modules/employees/hooks/useEmployees";

import {
  usePositions,
} from "@/modules/positions/hooks/usePositions";

import {
  useWarehouses,
} from "@/modules/warehouses/hooks/useWarehouses";

import {
  EmployeeAssignmentModal,
} from "../components/EmployeeAssignmentModal";

import {
  useCreateEmployeeAssignment,
  useEmployeeAssignments,
  useFinishEmployeeAssignment,
  useUpdateEmployeeAssignment,
} from "../hooks/useEmployeeAssignments";

import type {
  CreateEmployeeAssignmentDto,
  EmployeeAssignment,
  UpdateEmployeeAssignmentDto,
} from "../types/employee-assignment.types";

export function EmployeeAssignmentsPage() {
  const {
    data:
      assignments = [],

    isLoading,

    isError,
  } =
    useEmployeeAssignments();

  const {
    data:
      employees = [],
  } =
    useEmployees();

  const {
    data:
      positions = [],
  } =
    usePositions();

  const {
    data:
      warehouses = [],
  } =
    useWarehouses();

  const createAssignment =
    useCreateEmployeeAssignment();

  const updateAssignment =
    useUpdateEmployeeAssignment();

  const finishAssignment =
    useFinishEmployeeAssignment();

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    warehouseFilter,
    setWarehouseFilter,
  ] =
    useState("ALL");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("ALL");

  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);

  const [
    editingAssignment,
    setEditingAssignment,
  ] =
    useState<EmployeeAssignment | null>(
      null,
    );

  const [
    actionError,
    setActionError,
  ] =
    useState("");

  const filteredAssignments =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        return assignments.filter(
          (
            assignment,
          ) => {
            if (
              statusFilter ===
                "CURRENT" &&
              !assignment.isCurrent
            ) {
              return false;
            }

            if (
              statusFilter ===
                "HISTORY" &&
              assignment.isCurrent
            ) {
              return false;
            }

            if (
              warehouseFilter !==
                "ALL" &&
              String(
                assignment.warehouse.id,
              ) !==
                warehouseFilter
            ) {
              return false;
            }

            if (!term) {
              return true;
            }

            const employeeName =
              `${assignment.employee.firstName} ${assignment.employee.lastName}`
                .toLowerCase();

            const reverseName =
              `${assignment.employee.lastName} ${assignment.employee.firstName}`
                .toLowerCase();

            const position =
              assignment.position.name
                .toLowerCase();

            const warehouse =
              assignment.warehouse.name
                .toLowerCase();

            const dni =
              assignment.employee.dni;

            return (
              employeeName.includes(
                term,
              ) ||
              reverseName.includes(
                term,
              ) ||
              position.includes(
                term,
              ) ||
              warehouse.includes(
                term,
              ) ||
              dni.includes(
                term,
              )
            );
          },
        );
      },
      [
        assignments,
        search,
        warehouseFilter,
        statusFilter,
      ],
    );

  const currentCount =
    assignments.filter(
      (
        assignment,
      ) =>
        assignment.isCurrent,
    ).length;

  const historyCount =
    assignments.length -
    currentCount;

  const getErrorMessage = (
    error:
      any,

    fallback:
      string,
  ) => {
    const message =
      error?.response?.data?.message;

    if (
      Array.isArray(
        message,
      )
    ) {
      return message.join(
        " ",
      );
    }

    return (
      message ??
      fallback
    );
  };

  const handleSubmit =
    async (
      data:
        CreateEmployeeAssignmentDto,
    ) => {
      setActionError("");

      try {
        if (
          editingAssignment
        ) {
          const updateData:
            UpdateEmployeeAssignmentDto = {
            ...data,
          };

          await updateAssignment.mutateAsync({
            id:
              editingAssignment.id,

            data:
              updateData,
          });
        } else {
          await createAssignment.mutateAsync(
            data,
          );
        }

        setModalOpen(
          false,
        );

        setEditingAssignment(
          null,
        );
      } catch (
        error:
          any
      ) {
        setActionError(
          getErrorMessage(
            error,

            editingAssignment
              ? "No se pudo actualizar la asignación."
              : "No se pudo registrar la asignación.",
          ),
        );
      }
    };

  const handleFinish =
    async (
      assignment:
        EmployeeAssignment,
    ) => {
      const endDate =
        window.prompt(
          `Ingresa la fecha de fin para ${assignment.employee.firstName} ${assignment.employee.lastName} (AAAA-MM-DD):`,
        );

      if (
        !endDate
      ) {
        return;
      }

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          endDate,
        )
      ) {
        setActionError(
          "La fecha debe tener formato AAAA-MM-DD.",
        );

        return;
      }

      if (
        endDate <
        assignment.startDate
      ) {
        setActionError(
          "La fecha de fin no puede ser anterior a la fecha de inicio.",
        );

        return;
      }

      const confirmed =
        window.confirm(
          `¿Deseas finalizar la asignación el ${endDate}?`,
        );

      if (!confirmed) {
        return;
      }

      setActionError("");

      try {
        await finishAssignment.mutateAsync({
          id:
            assignment.id,

          data: {
            endDate,
          },
        });
      } catch (
        error:
          any
      ) {
        setActionError(
          getErrorMessage(
            error,
            "No se pudo finalizar la asignación.",
          ),
        );
      }
    };

  if (
    isLoading
  ) {
    return (
      <div className="space-y-6 p-1">
        <h1 className="text-3xl font-bold text-gray-900">
          Asignaciones laborales
        </h1>

        <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center text-gray-500 shadow-sm">
          Cargando asignaciones...
        </div>
      </div>
    );
  }

  if (
    isError
  ) {
    return (
      <div className="space-y-6 p-1">
        <h1 className="text-3xl font-bold text-gray-900">
          Asignaciones laborales
        </h1>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-red-600">
          No se pudieron cargar las asignaciones.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 p-1">
      {/* HEADER */}

      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hr-background">
            <BriefcaseBusiness
              size={
                24
              }

              className="text-hr-primary"
            />
          </div>

          Asignaciones laborales
        </h1>

        <p className="ml-14 text-sm text-gray-500">
          Control de cargo, sede y movimientos del personal
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total asignaciones
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {
              assignments.length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Asignaciones actuales
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {
                  currentCount
                }
              </p>
            </div>

            <UserCheck
              size={
                25
              }

              className="text-green-600"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Históricas
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-600">
                {
                  historyCount
                }
              </p>
            </div>

            <History
              size={
                25
              }

              className="text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* ERROR */}

      {actionError && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-600">
            {
              actionError
            }
          </p>

          <button
            type="button"

            onClick={() =>
              setActionError(
                "",
              )
            }

            className="font-semibold text-red-600"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* FILTROS */}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search
              size={
                19
              }

              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <Input
              className="h-11 pl-11"

              value={
                search
              }

              placeholder="Buscar trabajador, DNI, cargo o sede..."

              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
            />
          </div>

          <select
            value={
              warehouseFilter
            }

            onChange={(
              event,
            ) =>
              setWarehouseFilter(
                event.target.value,
              )
            }

            className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="ALL">
              Todas las sedes
            </option>

            {warehouses.map(
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

          <select
            value={
              statusFilter
            }

            onChange={(
              event,
            ) =>
              setStatusFilter(
                event.target.value,
              )
            }

            className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="ALL">
              Todas
            </option>

            <option value="CURRENT">
              Actuales
            </option>

            <option value="HISTORY">
              Históricas
            </option>
          </select>

          <Button
            type="button"

            className="flex min-h-11 items-center justify-center gap-2 px-5"

            onClick={() => {
              setActionError("");

              setEditingAssignment(
                null,
              );

              setModalOpen(
                true,
              );
            }}
          >
            <Plus
              size={
                18
              }
            />

            Nueva asignación
          </Button>
        </div>
      </div>

      {/* TABLA */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Trabajador
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Cargo
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Sede / Mina
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Inicio
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Fin
                </th>

                <th className="px-5 py-4 text-center text-xs font-bold uppercase text-gray-500">
                  Estado
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredAssignments.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={
                      7
                    }

                    className="px-6 py-14 text-center text-gray-500"
                  >
                    No se encontraron asignaciones laborales.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map(
                  (
                    assignment,
                  ) => (
                    <tr
                      key={
                        assignment.id
                      }

                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {
                            assignment.employee.firstName
                          }{" "}
                          {
                            assignment.employee.lastName
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          DNI{" "}
                          {
                            assignment.employee.dni
                          }
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <BriefcaseBusiness
                            size={
                              16
                            }

                            className="text-gray-400"
                          />

                          <span className="text-sm font-medium text-gray-700">
                            {
                              assignment.position.name
                            }
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={
                              16
                            }

                            className="text-gray-400"
                          />

                          <span className="text-sm text-gray-700">
                            {
                              assignment.warehouse.name
                            }
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {
                          assignment.startDate
                        }
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {
                          assignment.endDate ||
                          "—"
                        }
                      </td>

                      <td className="px-5 py-4 text-center">
                        {assignment.isCurrent ? (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            Actual
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            Histórica
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"

                            title="Editar"

                            onClick={() => {
                              setActionError("");

                              setEditingAssignment(
                                assignment,
                              );

                              setModalOpen(
                                true,
                              );
                            }}

                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-hr-background hover:text-orange-600"
                          >
                            <Pencil
                              size={
                                16
                              }
                            />
                          </button>

                          {assignment.isCurrent && (
                            <button
                              type="button"

                              title="Finalizar asignación"

                              disabled={
                                finishAssignment.isPending
                              }

                              onClick={() =>
                                handleFinish(
                                  assignment,
                                )
                              }

                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <CalendarX2
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
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}

      <EmployeeAssignmentModal
        open={
          modalOpen
        }

        assignment={
          editingAssignment
        }

        employees={
          employees
        }

        positions={
          positions
        }

        warehouses={
          warehouses
        }

        loading={
          createAssignment.isPending ||
          updateAssignment.isPending
        }

        onClose={() => {
          if (
            createAssignment.isPending ||
            updateAssignment.isPending
          ) {
            return;
          }

          setModalOpen(
            false,
          );

          setEditingAssignment(
            null,
          );
        }}

        onSubmit={
          handleSubmit
        }
      />
    </div>
  );
}