import { useMemo, useState } from "react";

import {
  BarChart3,
  Building2,
  CalendarDays,
  Clock3,
  FileSpreadsheet,
  Search,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import { Input } from "@/components/ui/Input";

import { useCompanies } from "@/modules/companies/hooks/UseCompanies";

import { useWarehouses } from "@/modules/warehouses/hooks/useWarehouses";

import { useHrConsolidation } from "../hooks/useHrConsolidation";

import type { HrEmployeeConsolidation } from "../types/hr-consolidation.types";

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

const TIMESHEET_CODES = [
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

function getEmployeeCompanyName(employee: HrEmployeeConsolidation): string {
  return employee.company.tradeName || employee.company.legalName;
}

export function HrConsolidationPage() {
  const today = new Date();

  // ============================================================
  // FILTROS
  // ============================================================

  const [year, setYear] = useState(today.getFullYear());

  const [month, setMonth] = useState(today.getMonth() + 1);

  const [companyId, setCompanyId] = useState<number>(0);

  const [warehouseId, setWarehouseId] = useState<number>(0);

  const [search, setSearch] = useState("");

  const [sourceFilter, setSourceFilter] = useState<
    "ALL" | "ATTENDANCE" | "MINE"
  >("ALL");

  // ============================================================
  // CATÁLOGOS
  // ============================================================

  const { data: companies = [] } = useCompanies();

  const { data: warehouses = [] } = useWarehouses();

  // ============================================================
  // CONSOLIDADO
  // ============================================================

  const { data, isLoading, isFetching, isError, refetch } = useHrConsolidation({
    year,
    month,

    companyId: companyId || undefined,

    warehouseId: warehouseId || undefined,
  });

  const summary = data?.summary;

  const employees = data?.employees ?? [];

  // ============================================================
  // FILTRO LOCAL
  // ============================================================

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();

    return employees.filter((employee) => {
      if (
        sourceFilter === "ATTENDANCE" &&
        employee.attendance.registeredDays === 0
      ) {
        return false;
      }

      if (
        sourceFilter === "MINE" &&
        employee.mineTimesheet.registeredDays === 0
      ) {
        return false;
      }

      if (!term) {
        return true;
      }

      const fullName =
        `${employee.firstName} ${employee.lastName}`.toLowerCase();

      const reverseName =
        `${employee.lastName} ${employee.firstName}`.toLowerCase();

      const company = getEmployeeCompanyName(employee).toLowerCase();

      return (
        fullName.includes(term) ||
        reverseName.includes(term) ||
        employee.dni.includes(term) ||
        company.includes(term)
      );
    });
  }, [employees, search, sourceFilter]);

  // ============================================================
  // TOTALES ADICIONALES
  // ============================================================

  const totalMineDays = useMemo(
    () =>
      employees.reduce(
        (total, employee) => total + employee.mineTimesheet.registeredDays,

        0,
      ),

    [employees],
  );

  const totalRegisteredAttendance = useMemo(
    () =>
      employees.reduce(
        (total, employee) => total + employee.attendance.registeredDays,

        0,
      ),

    [employees],
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-7 p-1">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hr-background">
            <BarChart3 size={24} className="text-hr-primary" />
          </div>
          Consolidado RR.HH.
        </h1>

        <p className="ml-14 text-sm text-gray-500">
          Resumen mensual de asistencia y tareos del personal
        </p>
      </div>

      {/* ======================================================
          FILTROS
      ====================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* AÑO */}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
              Año
            </label>

            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
            >
              {Array.from(
                {
                  length: 7,
                },

                (_, index) => today.getFullYear() - 3 + index,
              ).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* MES */}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
              Mes
            </label>

            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
            >
              {MONTHS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* EMPRESA */}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
              Empresa
            </label>

            <select
              value={companyId || ""}
              onChange={(event) => setCompanyId(Number(event.target.value))}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
            >
              <option value="">Todas las empresas</option>

              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.tradeName || company.legalName}
                </option>
              ))}
            </select>
          </div>

          {/* SEDE */}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
              Sede / Unidad
            </label>

            <select
              value={warehouseId || ""}
              onChange={(event) => setWarehouseId(Number(event.target.value))}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
            >
              <option value="">Todas las sedes</option>

              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================
          INDICADORES
      ====================================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Trabajadores</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {summary?.employees ?? 0}
              </p>
            </div>

            <Users size={24} className="text-gray-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Presentes</p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {summary?.presentDays ?? 0}
              </p>
            </div>

            <UserCheck size={24} className="text-green-500" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Faltas</p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {summary?.absentDays ?? 0}
              </p>
            </div>

            <UserX size={24} className="text-red-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">H. normales</p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {Number(summary?.normalHours ?? 0).toFixed(2)}
              </p>
            </div>

            <Clock3 size={24} className="text-blue-500" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">H. extra</p>

              <p className="mt-2 text-2xl font-bold text-orange-600">
                {Number(summary?.overtimeHours ?? 0).toFixed(2)}
              </p>
            </div>

            <Clock3 size={24} className="text-orange-500" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tareos mina</p>

              <p className="mt-2 text-2xl font-bold text-purple-600">
                {totalMineDays}
              </p>
            </div>

            <FileSpreadsheet size={24} className="text-purple-500" />
          </div>
        </div>
      </div>

      {/* ======================================================
          RESUMEN FUENTES
      ====================================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <CalendarDays size={20} className="text-blue-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Registros de asistencia</p>

              <p className="text-xl font-bold text-gray-900">
                {totalRegisteredAttendance}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <Building2 size={20} className="text-orange-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Registros de mina</p>

              <p className="text-xl font-bold text-gray-900">{totalMineDays}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          BÚSQUEDA
      ====================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <Input
              className="h-11 pl-11"
              value={search}
              placeholder="Buscar trabajador, DNI o empresa..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={sourceFilter}
              onChange={(event) =>
                setSourceFilter(
                  event.target.value as "ALL" | "ATTENDANCE" | "MINE",
                )
              }
              className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
            >
              <option value="ALL">Todos</option>

              <option value="ATTENDANCE">Con asistencia</option>

              <option value="MINE">Con tareo mina</option>
            </select>

            <button
              type="button"
              disabled={isFetching}
              onClick={() => refetch()}
              className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              {isFetching ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Mostrando{" "}
          <span className="font-semibold text-gray-700">
            {filteredEmployees.length}
          </span>{" "}
          trabajadores
        </p>
      </div>

      {/* ======================================================
          ESTADOS
      ====================================================== */}

      {isLoading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center text-gray-500 shadow-sm">
          Cargando consolidado de RR.HH...
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-red-600">
          No se pudo cargar el consolidado mensual.
        </div>
      )}

      {/* ======================================================
          TABLA
      ====================================================== */}

      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1600px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">
                    Trabajador
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">
                    Empresa
                  </th>

                  <th className="px-4 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    Presente
                  </th>

                  <th className="px-4 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    Falta
                  </th>

                  <th className="px-4 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    Descanso
                  </th>

                  <th className="px-4 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    Vac.
                  </th>

                  <th className="px-4 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    DM
                  </th>

                  <th className="px-4 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    Permiso
                  </th>

                  <th className="px-4 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    H. normales
                  </th>

                  <th className="px-4 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    H. extra
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">
                    Tareo mina
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-6 py-16 text-center text-gray-500"
                    >
                      No existen registros para los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => {
                    const activeCodes = TIMESHEET_CODES.map((code) => ({
                      code,

                      count: employee.mineTimesheet.codes[code] ?? 0,
                    })).filter((item) => item.count > 0);

                    return (
                      <tr
                        key={employee.employeeId}
                        className="hover:bg-gray-50"
                      >
                        {/* TRABAJADOR */}

                        <td className="px-4 py-4">
                          <p className="font-semibold text-gray-900">
                            {employee.lastName}, {employee.firstName}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            DNI {employee.dni}
                          </p>
                        </td>

                        {/* EMPRESA */}

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {getEmployeeCompanyName(employee)}
                        </td>

                        {/* PRESENTE */}

                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-green-600">
                            {employee.attendance.presentDays}
                          </span>
                        </td>

                        {/* FALTAS */}

                        <td className="px-4 py-4 text-center">
                          <span
                            className={
                              employee.attendance.absentDays > 0
                                ? "font-bold text-red-600"
                                : "text-gray-400"
                            }
                          >
                            {employee.attendance.absentDays}
                          </span>
                        </td>

                        {/* DESCANSO */}

                        <td className="px-4 py-4 text-center text-sm text-gray-600">
                          {employee.attendance.restDays}
                        </td>

                        {/* VACACIONES */}

                        <td className="px-4 py-4 text-center text-sm text-gray-600">
                          {employee.attendance.vacationDays}
                        </td>

                        {/* DESCANSO MÉDICO */}

                        <td className="px-4 py-4 text-center text-sm text-gray-600">
                          {employee.attendance.medicalLeaveDays}
                        </td>

                        {/* PERMISO */}

                        <td className="px-4 py-4 text-center text-sm text-gray-600">
                          {employee.attendance.permissionDays}
                        </td>

                        {/* HORAS NORMALES */}

                        <td className="px-4 py-4 text-center">
                          <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                            {Number(employee.attendance.normalHours).toFixed(2)}
                          </span>
                        </td>

                        {/* HORAS EXTRA */}

                        <td className="px-4 py-4 text-center">
                          <span className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700">
                            {Number(employee.attendance.overtimeHours).toFixed(
                              2,
                            )}
                          </span>
                        </td>

                        {/* TAREO */}

                        <td className="px-4 py-4">
                          {activeCodes.length === 0 ? (
                            <span className="text-sm text-gray-400">
                              Sin tareo
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {activeCodes.map((item) => (
                                <span
                                  key={item.code}
                                  className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-700"
                                >
                                  {item.code}: {item.count}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
