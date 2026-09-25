import { useMemo, useState } from "react";

import {
  Building2,
  CreditCard,
  Pencil,
  Plus,
  Power,
  Search,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";

import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/Input";

import { useCompanies } from "@/modules/companies/hooks/UseCompanies";

import { EmployeeModal } from "../components/EmployeeModal";

import {
  useActivateEmployee,
  useCreateEmployee,
  useDeactivateEmployee,
  useEmployees,
  useUpdateEmployee,
} from "../hooks/useEmployees";

import type {
  CreateEmployeeDto,
  Employee,
  UpdateEmployeeDto,
} from "../types/employee.types";

export function EmployeesPage() {
  // ============================================================
  // DATA
  // ============================================================

  const {
    data: employees = [],

    isLoading,

    isError,
  } = useEmployees();

  const { data: companies = [] } =
    useCompanies();

  const createEmployee =
    useCreateEmployee();

  const updateEmployee =
    useUpdateEmployee();

  const activateEmployee =
    useActivateEmployee();

  const deactivateEmployee =
    useDeactivateEmployee();

  // ============================================================
  // STATE
  // ============================================================

  const [search, setSearch] =
    useState("");

  const [companyFilter, setCompanyFilter] =
    useState("ALL");

  const [typeFilter, setTypeFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    editingEmployee,
    setEditingEmployee,
  ] = useState<Employee | null>(null);

  const [actionError, setActionError] =
    useState("");

  // ============================================================
  // FILTRAR
  // ============================================================

  const filteredEmployees = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase();

    return employees.filter(
      (employee) => {
        // ESTADO

        if (
          statusFilter === "ACTIVE" &&
          !employee.isActive
        ) {
          return false;
        }

        if (
          statusFilter === "INACTIVE" &&
          employee.isActive
        ) {
          return false;
        }

        // EMPRESA

        if (
          companyFilter !== "ALL" &&
          String(
            employee.company.id,
          ) !== companyFilter
        ) {
          return false;
        }

        // TIPO

        if (
          typeFilter !== "ALL" &&
          employee.employeeType !==
            typeFilter
        ) {
          return false;
        }

        // BÚSQUEDA

        if (!term) {
          return true;
        }

        const fullName =
          `${employee.firstName} ${employee.lastName}`.toLowerCase();

        const reverseFullName =
          `${employee.lastName} ${employee.firstName}`.toLowerCase();

        const company = (
          employee.company.tradeName ||
          employee.company.legalName
        ).toLowerCase();

        const email =
          employee.email?.toLowerCase() ??
          "";

        const phone =
          employee.phone?.toLowerCase() ??
          "";

        const bankAccount =
          employee.bankAccount?.toLowerCase() ??
          "";

        return (
          fullName.includes(term) ||
          reverseFullName.includes(term) ||
          employee.dni.includes(term) ||
          company.includes(term) ||
          email.includes(term) ||
          phone.includes(term) ||
          bankAccount.includes(term)
        );
      },
    );
  }, [
    employees,
    search,
    companyFilter,
    typeFilter,
    statusFilter,
  ]);

  // ============================================================
  // CONTADORES
  // ============================================================

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.isActive,
    ).length;

  const inactiveEmployees =
    employees.length -
    activeEmployees;

  // ============================================================
  // ERROR API
  // ============================================================

  const getErrorMessage = (
    error: any,
    fallback: string,
  ) => {
    const message =
      error?.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(" ");
    }

    return message ?? fallback;
  };

  // ============================================================
  // CREAR / EDITAR
  // ============================================================

  const handleSubmit = async (
    data: CreateEmployeeDto,
  ) => {
    setActionError("");

    try {
      if (editingEmployee) {
        const updateData: UpdateEmployeeDto =
          {
            ...data,
          };

        await updateEmployee.mutateAsync({
          id: editingEmployee.id,

          data: updateData,
        });
      } else {
        await createEmployee.mutateAsync(
          data,
        );
      }

      setModalOpen(false);

      setEditingEmployee(null);
    } catch (error: any) {
      setActionError(
        getErrorMessage(
          error,

          editingEmployee
            ? "No se pudo actualizar el trabajador."
            : "No se pudo registrar el trabajador.",
        ),
      );
    }
  };

  // ============================================================
  // ACTIVAR
  // ============================================================

  const handleActivate = async (
    employee: Employee,
  ) => {
    const confirmed =
      window.confirm(
        `¿Deseas activar a "${employee.firstName} ${employee.lastName}"?`,
      );

    if (!confirmed) {
      return;
    }

    setActionError("");

    try {
      await activateEmployee.mutateAsync(
        employee.id,
      );
    } catch (error: any) {
      setActionError(
        getErrorMessage(
          error,
          "No se pudo activar el trabajador.",
        ),
      );
    }
  };

  // ============================================================
  // DESACTIVAR
  // ============================================================

  const handleDeactivate = async (
    employee: Employee,
  ) => {
    const confirmed =
      window.confirm(
        `¿Deseas desactivar a "${employee.firstName} ${employee.lastName}"?`,
      );

    if (!confirmed) {
      return;
    }

    setActionError("");

    try {
      await deactivateEmployee.mutateAsync(
        employee.id,
      );
    } catch (error: any) {
      setActionError(
        getErrorMessage(
          error,
          "No se pudo desactivar el trabajador.",
        ),
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="space-y-6 p-1">
        <h1 className="text-3xl font-bold text-gray-900">
          Trabajadores
        </h1>

        <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center text-gray-500 shadow-sm">
          Cargando trabajadores...
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (isError) {
    return (
      <div className="space-y-6 p-1">
        <h1 className="text-3xl font-bold text-gray-900">
          Trabajadores
        </h1>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-red-600">
          No se pudieron cargar los
          trabajadores.
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-7 p-1">
      {/* HEADER */}

      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
            <Users
              size={24}
              className="text-orange-500"
            />
          </div>

          Trabajadores
        </h1>

        <p className="ml-14 text-sm text-gray-500">
          Administración del personal de
          TEINCOMIN y COMPANY
        </p>
      </div>

      {/* ESTADÍSTICAS */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* TOTAL */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total trabajadores
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {employees.length}
          </p>
        </div>

        {/* ACTIVOS */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Activos
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {activeEmployees}
              </p>
            </div>

            <UserCheck
              size={25}
              className="text-green-600"
            />
          </div>
        </div>

        {/* INACTIVOS */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Inactivos
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-600">
                {inactiveEmployees}
              </p>
            </div>

            <UserX
              size={25}
              className="text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* ERROR */}

      {actionError && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-600">
            {actionError}
          </p>

          <button
            type="button"
            onClick={() =>
              setActionError("")
            }
            className="font-semibold text-red-600"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* FILTROS */}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto]">
          {/* BÚSQUEDA */}

          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <Input
              className="h-11 pl-11"
              value={search}
              placeholder="Buscar por nombre, DNI, empresa, correo o teléfono..."
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
            />
          </div>

          {/* EMPRESA */}

          <select
            value={companyFilter}
            onChange={(event) =>
              setCompanyFilter(
                event.target.value,
              )
            }
            className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="ALL">
              Todas las empresas
            </option>

            {companies.map(
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

          {/* TIPO */}

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value,
              )
            }
            className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="ALL">
              Todos los tipos
            </option>

            <option value="EMPLOYEE">
              Empleados
            </option>

            <option value="WORKER">
              Obreros
            </option>
          </select>

          {/* ESTADO */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="ALL">
              Todos
            </option>

            <option value="ACTIVE">
              Activos
            </option>

            <option value="INACTIVE">
              Inactivos
            </option>
          </select>

          {/* NUEVO */}

          <Button
            type="button"
            className="flex min-h-11 items-center justify-center gap-2 bg-purple-50 px-5 hover:bg-purple-100"
            onClick={() => {
              setActionError("");

              setEditingEmployee(null);

              setModalOpen(true);
            }}
          >
            <Plus
              size={18}
              className="text-purple-500 hover:text-purple-600"
            />

            <span className="text-purple-500 hover:text-purple-600">
              Nuevo trabajador
            </span>
          </Button>
        </div>
      </div>

      {/* RESULTADOS */}

      <div className="px-1 text-sm text-gray-500">
        Mostrando{" "}
        <span className="font-semibold text-gray-700">
          {filteredEmployees.length}
        </span>{" "}
        trabajadores
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
                  DNI
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Empresa
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Tipo
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Cuenta Bancaria
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Ingreso
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
              {filteredEmployees.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-14 text-center text-gray-500"
                  >
                    No se encontraron
                    trabajadores.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(
                  (employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-gray-50"
                    >
                      {/* TRABAJADOR */}

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {
                            employee.firstName
                          }{" "}
                          {
                            employee.lastName
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {employee.email ||
                            employee.phone ||
                            "Sin contacto registrado"}
                        </p>
                      </td>

                      {/* DNI */}

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-700">
                          {employee.dni}
                        </p>
                      </td>

                      {/* EMPRESA */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Building2
                            size={16}
                            className="text-gray-400"
                          />

                          <span className="text-sm text-gray-700">
                            {employee
                              .company
                              .tradeName ||
                              employee
                                .company
                                .legalName}
                          </span>
                        </div>
                      </td>

                      {/* TIPO */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {employee.employeeType ===
                        "EMPLOYEE"
                          ? "Empleado"
                          : "Obrero"}
                      </td>

                      {/* CUENTA BANCARIA */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard
                            size={16}
                            className="text-gray-400"
                          />

                          <span className="text-sm text-gray-600">
                            {employee.bankAccount ||
                              "Sin registrar"}
                          </span>
                        </div>
                      </td>

                      {/* INGRESO */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {employee.hireDate}
                      </td>

                      {/* ESTADO */}

                      <td className="px-5 py-4 text-center">
                        {employee.isActive ? (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            Activo
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* ACCIONES */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {/* EDITAR */}

                          <button
                            type="button"
                            title="Editar"
                            onClick={() => {
                              setActionError("");

                              setEditingEmployee(
                                employee,
                              );

                              setModalOpen(
                                true,
                              );
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-orange-50 hover:text-orange-600"
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          {/* ACTIVAR / DESACTIVAR */}

                          <button
                            type="button"
                            title={
                              employee.isActive
                                ? "Desactivar"
                                : "Activar"
                            }
                            onClick={() =>
                              employee.isActive
                                ? handleDeactivate(
                                    employee,
                                  )
                                : handleActivate(
                                    employee,
                                  )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                          >
                            <Power
                              size={16}
                            />
                          </button>
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

      <EmployeeModal
        open={modalOpen}
        employee={editingEmployee}
        companies={companies}
        loading={
          createEmployee.isPending ||
          updateEmployee.isPending
        }
        onClose={() => {
          if (
            createEmployee.isPending ||
            updateEmployee.isPending
          ) {
            return;
          }

          setModalOpen(false);

          setEditingEmployee(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}