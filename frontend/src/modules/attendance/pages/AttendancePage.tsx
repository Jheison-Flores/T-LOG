import { useEffect, useMemo, useState } from "react";

import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Save,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/Button";

import { useWarehouses } from "@/modules/warehouses/hooks/useWarehouses";

import { useEmployeeAssignments } from "@/modules/employee-assignments/hooks/useEmployeeAssignments";

import {
  useAttendanceMonth,
  useBulkUpsertAttendance,
  useExportAttendanceToCsv,
} from "../hooks/useAttendance";

import type {
  AttendanceRecord,
  AttendanceStatus,
  CreateAttendanceDto,
} from "../types/attendance.types";

import type { Employee } from "@/modules/employees/types/employee.types";

import type { EmployeeAssignment } from "@/modules/employee-assignments/types/employee-assignment.types";

import type { Warehouse } from "@/modules/warehouses/types/warehouse.types";

interface AttendanceRow {
  date: string;

  dayNumber: number;

  dayName: string;

  recordId?: number;

  status: AttendanceStatus | "";

  checkIn: string;

  breakStart: string;

  breakEnd: string;

  checkOut: string;

  normalHours: number;

  overtimeHours: number;

  observations: string;
}

// ============================================================
// ARRAYS VACÍOS ESTABLES
// Evitan nuevos [] en cada render
// ============================================================

const EMPTY_WAREHOUSES: Warehouse[] = [];

const EMPTY_ASSIGNMENTS: EmployeeAssignment[] = [];

const EMPTY_ATTENDANCE_RECORDS: AttendanceRecord[] = [];

// ============================================================
// MESES
// ============================================================

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

// ============================================================
// ESTADOS
// ============================================================

const STATUS_OPTIONS: {
  value: AttendanceStatus;
  label: string;
}[] = [
  {
    value: "PRESENT",
    label: "Presente",
  },
  {
    value: "ABSENT",
    label: "Falta",
  },
  {
    value: "REST",
    label: "Descanso",
  },
  {
    value: "VACATION",
    label: "Vacaciones",
  },
  {
    value: "MEDICAL_LEAVE",
    label: "Descanso médico",
  },
  {
    value: "PERMISSION",
    label: "Permiso",
  },
  {
    value: "HOLIDAY",
    label: "Feriado",
  },
  {
    value: "OTHER",
    label: "Otro",
  },
];

// ============================================================
// UTILIDADES
// ============================================================

function normalizeTime(value?: string | null): string {
  if (!value) {
    return "";
  }

  return value.substring(0, 5);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

function getDayName(year: number, month: number, day: number): string {
  const date = new Date(year, month - 1, day);

  const value = date
    .toLocaleDateString("es-PE", {
      weekday: "short",
    })
    .replace(".", "");

  return value.charAt(0).toUpperCase() + value.slice(1);
}

// ============================================================
// VISTA PREVIA DE HORAS
// ============================================================

function calculatePreviewHours(row: AttendanceRow): {
  normalHours: number;
  overtimeHours: number;
} {
  if (row.status !== "PRESENT") {
    return {
      normalHours: 0,
      overtimeHours: 0,
    };
  }

  if (!row.checkIn || !row.checkOut) {
    return {
      normalHours: 0,
      overtimeHours: 0,
    };
  }

  const toMinutes = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);

    return hour * 60 + minute;
  };

  const start = toMinutes(row.checkIn);

  const end = toMinutes(row.checkOut);

  if (end < start) {
    return {
      normalHours: 0,
      overtimeHours: 0,
    };
  }

  let totalMinutes = end - start;

  if (row.breakStart && row.breakEnd) {
    const breakStart = toMinutes(row.breakStart);

    const breakEnd = toMinutes(row.breakEnd);

    if (breakEnd >= breakStart) {
      totalMinutes -= breakEnd - breakStart;
    }
  }

  totalMinutes = Math.max(totalMinutes, 0);

  const normalMinutes = Math.min(totalMinutes, 480);

  const overtimeMinutes = Math.max(totalMinutes - 480, 0);

  return {
    normalHours: Number((normalMinutes / 60).toFixed(2)),

    overtimeHours: Number((overtimeMinutes / 60).toFixed(2)),
  };
}

// ============================================================
// COMPONENTE
// ============================================================

export function AttendancePage() {
  const today = new Date();

  // ============================================================
  // FILTROS
  // ============================================================

  const [year, setYear] = useState(today.getFullYear());

  const [month, setMonth] = useState(today.getMonth() + 1);

  const [warehouseId, setWarehouseId] = useState<number>(0);

  const [employeeId, setEmployeeId] = useState<number>(0);

  // ============================================================
  // FILAS
  // ============================================================

  const [rows, setRows] = useState<AttendanceRow[]>([]);

  const [actionError, setActionError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [isExporting, setIsExporting] = useState(false);

// ============================================================
  // EXPORTAR A CSV
  // ============================================================

  const handleExport = async () => {
    setIsExporting(true);
    setActionError("");
    setSuccessMessage("");

    try {
      const csvData = await exportAttendance.mutateAsync({
        year,
        month,
        warehouseId: warehouseId || undefined,
      });

      // Crear un blob y un enlace para descargar el CSV
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const fileName = `asistencia_${year || 'todos'}_${month
        ? String(month).padStart(2, '0')
        : 'todos'}_${warehouseId ? String(warehouseId) : 'todas'}.csv`;

      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMessage("Asistencia exportada correctamente.");
    } catch (error) {
      const message = error instanceof Error && 'response' in error && error.response
        && typeof error.response === 'object' && error.response !== null
        && 'data' in error.response && error.response.data
        && typeof error.response.data === 'object' && error.response.data !== null
        && 'message' in error.response.data
        ? String(error.response.data.message)
        : undefined;
      setActionError(
        Array.isArray(message)
          ? message.join(" ")
          : (message ?? "No se pudo exportar la asistencia."),
      );
    } finally {
      setIsExporting(false);
    }
  };

// ============================================================
  // QUERIES
  // ============================================================

  const warehousesQuery = useWarehouses();

  const assignmentsQuery = useEmployeeAssignments();

  const attendanceQuery = useAttendanceMonth(
    {
      year,
      month,

      warehouseId: warehouseId || undefined,
    },

    Boolean(warehouseId),
  );

  const bulkUpsert = useBulkUpsertAttendance();
  const exportAttendance = useExportAttendanceToCsv();

  // ============================================================
  // DATOS ESTABLES
  // ============================================================

  const warehouses = warehousesQuery.data ?? EMPTY_WAREHOUSES;

  const assignments = assignmentsQuery.data ?? EMPTY_ASSIGNMENTS;

  const attendanceRecords = attendanceQuery.data ?? EMPTY_ATTENDANCE_RECORDS;

  const attendanceLoading = attendanceQuery.isLoading;

  const attendanceFetching = attendanceQuery.isFetching;

  // ============================================================
  // SEDES ACTIVAS
  // ============================================================

  const activeWarehouses = useMemo(
    () => warehouses.filter((warehouse) => warehouse.isActive),

    [warehouses],
  );

  // ============================================================
  // TRABAJADORES ASIGNADOS A LA SEDE
  // ============================================================

  const availableEmployees: Employee[] = useMemo(() => {
    if (!warehouseId) {
      return [];
    }

    const map = new Map<number, Employee>();

    assignments
      .filter(
        (assignment) =>
          assignment.isCurrent &&
          assignment.warehouse.id === warehouseId &&
          assignment.employee.isActive,
      )
      .forEach((assignment) => {
        map.set(assignment.employee.id, assignment.employee);
      });

    return Array.from(map.values()).sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
        "es",
      ),
    );
  }, [assignments, warehouseId]);

  // ============================================================
  // TRABAJADOR SELECCIONADO
  // ============================================================

  const selectedEmployee = useMemo(
    () => availableEmployees.find((employee) => employee.id === employeeId),

    [availableEmployees, employeeId],
  );

  // ============================================================
  // REGISTROS DEL TRABAJADOR
  // ============================================================

  const employeeRecords = useMemo(() => {
    if (!employeeId) {
      return [];
    }

    return attendanceRecords.filter(
      (record) => record.employee.id === employeeId,
    );
  }, [attendanceRecords, employeeId]);

  // ============================================================
  // GENERAR PLANILLA DEL MES
  // ============================================================

  useEffect(() => {
    // ========================================================
    // SIN SELECCIÓN
    // ========================================================

    if (!employeeId || !warehouseId) {
      setRows([]);
      return;
    }

    // ========================================================
    // GENERAR DÍAS
    // ========================================================

    const days = getDaysInMonth(year, month);

    const recordMap = new Map<string, AttendanceRecord>();

    employeeRecords.forEach((record) => {
      recordMap.set(record.date, record);
    });

    const generatedRows: AttendanceRow[] = [];

    for (let day = 1; day <= days; day += 1) {
      const date = formatDate(year, month, day);

      const existing = recordMap.get(date);

      generatedRows.push({
        date,

        dayNumber: day,

        dayName: getDayName(year, month, day),

        recordId: existing?.id,

        status: existing?.status ?? "",

        checkIn: normalizeTime(existing?.checkIn),

        breakStart: normalizeTime(existing?.breakStart),

        breakEnd: normalizeTime(existing?.breakEnd),

        checkOut: normalizeTime(existing?.checkOut),

        normalHours: Number(existing?.normalHours ?? 0),

        overtimeHours: Number(existing?.overtimeHours ?? 0),

        observations: existing?.observations ?? "",
      });
    }

    setRows(generatedRows);
  }, [year, month, employeeId, warehouseId, employeeRecords]);

  // ============================================================
  // CAMBIO DE AÑO
  // ============================================================

  const handleYearChange = (value: string) => {
    setYear(Number(value));

    setSuccessMessage("");

    setActionError("");
  };

  // ============================================================
  // CAMBIO DE MES
  // ============================================================

  const handleMonthChange = (value: string) => {
    setMonth(Number(value));

    setSuccessMessage("");

    setActionError("");
  };

  // ============================================================
  // CAMBIO DE SEDE
  // ============================================================

  const handleWarehouseChange = (value: string) => {
    const newWarehouseId = Number(value);

    setWarehouseId(newWarehouseId);

    setEmployeeId(0);

    setRows([]);

    setActionError("");

    setSuccessMessage("");
  };

  // ============================================================
  // CAMBIO DE TRABAJADOR
  // ============================================================

  const handleEmployeeChange = (value: string) => {
    setEmployeeId(Number(value));

    setActionError("");

    setSuccessMessage("");
  };

  // ============================================================
  // ACTUALIZAR FILA
  // ============================================================

  const updateRow = (
    index: number,

    changes: Partial<AttendanceRow>,
  ) => {
    setRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        const updated: AttendanceRow = {
          ...row,
          ...changes,
        };

        // ==================================================
        // SI NO ES PRESENTE, LIMPIAMOS HORARIOS
        // ==================================================

        if (changes.status !== undefined && changes.status !== "PRESENT") {
          updated.checkIn = "";

          updated.breakStart = "";

          updated.breakEnd = "";

          updated.checkOut = "";
        }

        // ==================================================
        // RECALCULAR PREVIEW
        // ==================================================

        const hours = calculatePreviewHours(updated);

        updated.normalHours = hours.normalHours;

        updated.overtimeHours = hours.overtimeHours;

        return updated;
      }),
    );

    setSuccessMessage("");
  };

  // ============================================================
  // VALIDACIONES
  // ============================================================

  const validateRows = (): string => {
    for (const row of rows) {
      if (!row.status) {
        continue;
      }

      if (row.status === "PRESENT") {
        // ====================================================
        // REFRIGERIO INCOMPLETO
        // ====================================================

        if (
          (row.breakStart && !row.breakEnd) ||
          (!row.breakStart && row.breakEnd)
        ) {
          return `Completa correctamente el refrigerio del día ${row.dayNumber}.`;
        }

        // ====================================================
        // SALIDA MENOR A INGRESO
        // ====================================================

        if (row.checkIn && row.checkOut && row.checkOut < row.checkIn) {
          return `La salida del día ${row.dayNumber} no puede ser anterior al ingreso.`;
        }

        // ====================================================
        // REFRIGERIO INVÁLIDO
        // ====================================================

        if (row.breakStart && row.breakEnd && row.breakEnd < row.breakStart) {
          return `El fin del refrigerio del día ${row.dayNumber} no puede ser anterior al inicio.`;
        }

        // ====================================================
        // REFRIGERIO FUERA DEL HORARIO
        // ====================================================

        if (row.checkIn && row.breakStart && row.breakStart < row.checkIn) {
          return `El refrigerio del día ${row.dayNumber} no puede iniciar antes del ingreso.`;
        }

        if (row.checkOut && row.breakEnd && row.breakEnd > row.checkOut) {
          return `El refrigerio del día ${row.dayNumber} debe terminar antes de la salida.`;
        }
      }
    }

    return "";
  };

  // ============================================================
  // GUARDAR MES
  // ============================================================

  const handleSave = async () => {
    setActionError("");

    setSuccessMessage("");

    if (!warehouseId) {
      setActionError("Selecciona una sede.");

      return;
    }

    if (!employeeId) {
      setActionError("Selecciona un trabajador.");

      return;
    }

    const validationError = validateRows();

    if (validationError) {
      setActionError(validationError);

      return;
    }

    // ========================================================
    // SOLO GUARDAMOS DÍAS CON ESTADO
    // ========================================================

    const records: CreateAttendanceDto[] = rows
      .filter((row) => Boolean(row.status))
      .map((row) => ({
        employeeId,

        warehouseId,

        date: row.date,

        status: row.status as AttendanceStatus,

        checkIn:
          row.status === "PRESENT" && row.checkIn ? row.checkIn : undefined,

        breakStart:
          row.status === "PRESENT" && row.breakStart
            ? row.breakStart
            : undefined,

        breakEnd:
          row.status === "PRESENT" && row.breakEnd ? row.breakEnd : undefined,

        checkOut:
          row.status === "PRESENT" && row.checkOut ? row.checkOut : undefined,

        observations: row.observations.trim() || undefined,
      }));

    if (records.length === 0) {
      setActionError("No hay registros para guardar.");

      return;
    }

    try {
      await bulkUpsert.mutateAsync({
        records,
      });

      setSuccessMessage("Asistencia mensual guardada correctamente.");
    } catch (error: any) {
      const message = error?.response?.data?.message;

      setActionError(
        Array.isArray(message)
          ? message.join(" ")
          : (message ?? "No se pudo guardar la asistencia."),
      );
    }
  };

  // ============================================================
  // CONTADORES
  // ============================================================

  const registeredDays = useMemo(
    () => rows.filter((row) => Boolean(row.status)).length,

    [rows],
  );

  const presentDays = useMemo(
    () => rows.filter((row) => row.status === "PRESENT").length,

    [rows],
  );

  const totalNormalHours = useMemo(
    () =>
      rows.reduce(
        (total, row) => total + Number(row.normalHours || 0),

        0,
      ),

    [rows],
  );

  const totalOvertimeHours = useMemo(
    () =>
      rows.reduce(
        (total, row) => total + Number(row.overtimeHours || 0),

        0,
      ),

    [rows],
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
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hr-background">
              <CalendarCheck2 size={24} className="text-hr-primary" />
            </div>
            Asistencia
          </h1>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              disabled={
                bulkUpsert.isPending ||
                attendanceFetching ||
                !warehouseId ||
                !employeeId
              }
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4"
            >
              <Save size={18} />
              {isExporting ? "Exportando..." : "Exportar CSV"}
            </Button>
          </div>
        </div>

        <p className="ml-14 text-sm text-gray-500">
          Control mensual de asistencia del personal
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
              onChange={(event) => handleYearChange(event.target.value)}
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
              onChange={(event) => handleMonthChange(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
            >
              {MONTHS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* SEDE */}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
              Sede
            </label>

            <select
              value={warehouseId || ""}
              onChange={(event) => handleWarehouseChange(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
            >
              <option value="">Seleccionar sede</option>

              {activeWarehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          {/* TRABAJADOR */}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
              Trabajador
            </label>

            <select
              value={employeeId || ""}
              disabled={!warehouseId}
              onChange={(event) => handleEmployeeChange(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 disabled:bg-gray-100"
            >
              <option value="">Seleccionar trabajador</option>

              {availableEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.lastName}, {employee.firstName} - DNI {employee.dni}
                </option>
              ))}
            </select>
          </div>
        </div>

        {warehouseId && availableEmployees.length === 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            No existen trabajadores con una asignación actual en esta sede.
            Registra primero la asignación laboral.
          </div>
        )}
      </div>

      {/* ======================================================
          TRABAJADOR SELECCIONADO
      ====================================================== */}

      {selectedEmployee && (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-hr-background">
                <UserRound size={24} className="text-hr-primary" />
              </div>

              <div>
                <p className="text-lg font-bold text-gray-900">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  DNI {selectedEmployee.dni} ·{" "}
                  {selectedEmployee.company.tradeName ||
                    selectedEmployee.company.legalName}
                </p>
              </div>
            </div>

            <Button
              type="button"
              disabled={bulkUpsert.isPending || attendanceFetching}
              onClick={handleSave}
              className="flex items-center justify-center gap-2"
            >
              <Save size={18} />

              {bulkUpsert.isPending ? "Guardando..." : "Guardar asistencia"}
            </Button>
          </div>
        </div>
      )}

      {/* ======================================================
          MENSAJES
      ====================================================== */}

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {actionError}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
          <CheckCircle2 size={19} />

          {successMessage}
        </div>
      )}

      {/* ======================================================
          RESUMEN
      ====================================================== */}

      {selectedEmployee && rows.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Días registrados</p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {registeredDays}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Días presentes</p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {presentDays}
            </p>
          </div>

          <div className="rounded-2xl border border-hr-border bg-hr-background p-5 shadow-sm">
            <p className="text-sm text-gray-500">Horas normales</p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {totalNormalHours.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-hr-border bg-hr-background p-5 shadow-sm">
            <p className="text-sm text-gray-500">Horas extra</p>

            <p className="mt-2 text-2xl font-bold text-orange-600">
              {totalOvertimeHours.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          TABLA
      ====================================================== */}

      {!selectedEmployee ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center shadow-sm">
          <CalendarCheck2 size={42} className="mx-auto text-gray-300" />

          <p className="mt-4 font-semibold text-gray-700">
            Selecciona una sede y un trabajador
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Se mostrará automáticamente el control mensual de asistencia.
          </p>
        </div>
      ) : attendanceLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center text-gray-500 shadow-sm">
          Cargando asistencia...
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1350px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-3 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    Día
                  </th>

                  <th className="px-3 py-4 text-left text-xs font-bold uppercase text-gray-500">
                    Estado
                  </th>

                  <th className="px-3 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    Ingreso
                  </th>

                  <th className="px-3 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    Refrigerio inicio
                  </th>

                  <th className="px-3 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    Refrigerio fin
                  </th>

                  <th className="px-3 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    Salida
                  </th>

                  <th className="px-3 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    H. normales
                  </th>

                  <th className="px-3 py-4 text-center text-xs font-bold uppercase text-gray-500">
                    H. extra
                  </th>

                  <th className="px-3 py-4 text-left text-xs font-bold uppercase text-gray-500">
                    Observación
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {rows.map((row, index) => {
                  const date = new Date(year, month - 1, row.dayNumber);

                  const dayOfWeek = date.getDay();

                  const weekend = dayOfWeek === 0 || dayOfWeek === 6;

                  const present = row.status === "PRESENT";

                  return (
                    <tr
                      key={row.date}
                      className={weekend ? "bg-gray-50/80" : "hover:bg-gray-50"}
                    >
                      {/* DÍA */}

                      <td className="px-3 py-3 text-center">
                        <p className="font-bold text-gray-800">
                          {row.dayNumber}
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            weekend
                              ? "font-semibold text-orange-600"
                              : "text-gray-400"
                          }`}
                        >
                          {row.dayName}
                        </p>
                      </td>

                      {/* ESTADO */}

                      <td className="px-3 py-3">
                        <select
                          value={row.status}
                          onChange={(event) =>
                            updateRow(index, {
                              status: event.target.value as
                                | AttendanceStatus
                                | "",
                            })
                          }
                          className="h-9 w-40 rounded-lg border border-gray-300 bg-white px-2 text-xs text-gray-700"
                        >
                          <option value="">Sin registrar</option>

                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* INGRESO */}

                      <td className="px-3 py-3">
                        <input
                          type="time"
                          value={row.checkIn}
                          disabled={!present}
                          onChange={(event) =>
                            updateRow(index, {
                              checkIn: event.target.value,
                            })
                          }
                          className="h-9 w-28 rounded-lg border border-gray-300 bg-white px-2 text-sm disabled:bg-gray-100"
                        />
                      </td>

                      {/* REFRIGERIO INICIO */}

                      <td className="px-3 py-3">
                        <input
                          type="time"
                          value={row.breakStart}
                          disabled={!present}
                          onChange={(event) =>
                            updateRow(index, {
                              breakStart: event.target.value,
                            })
                          }
                          className="h-9 w-28 rounded-lg border border-gray-300 bg-white px-2 text-sm disabled:bg-gray-100"
                        />
                      </td>

                      {/* REFRIGERIO FIN */}

                      <td className="px-3 py-3">
                        <input
                          type="time"
                          value={row.breakEnd}
                          disabled={!present}
                          onChange={(event) =>
                            updateRow(index, {
                              breakEnd: event.target.value,
                            })
                          }
                          className="h-9 w-28 rounded-lg border border-gray-300 bg-white px-2 text-sm disabled:bg-gray-100"
                        />
                      </td>

                      {/* SALIDA */}

                      <td className="px-3 py-3">
                        <input
                          type="time"
                          value={row.checkOut}
                          disabled={!present}
                          onChange={(event) =>
                            updateRow(index, {
                              checkOut: event.target.value,
                            })
                          }
                          className="h-9 w-28 rounded-lg border border-gray-300 bg-white px-2 text-sm disabled:bg-gray-100"
                        />
                      </td>

                      {/* HORAS NORMALES */}

                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex min-w-16 justify-center rounded-lg bg-hr-background px-3 py-2 text-sm font-bold text-hr-text">
                          {Number(row.normalHours).toFixed(2)}
                        </span>
                      </td>

                      {/* HORAS EXTRA */}

                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex min-w-16 justify-center rounded-lg bg-hr-background px-3 py-2 text-sm font-bold text-hr-text">
                          {Number(row.overtimeHours).toFixed(2)}
                        </span>
                      </td>

                      {/* OBSERVACIÓN */}

                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={row.observations}
                          onChange={(event) =>
                            updateRow(index, {
                              observations: event.target.value,
                            })
                          }
                          placeholder="Observación"
                          className="h-9 min-w-52 rounded-lg border border-gray-300 bg-white px-3 text-sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock3 size={17} />
              Las horas mostradas son una vista previa. El backend realiza el
              cálculo definitivo al guardar.
            </div>

            <Button
              type="button"
              disabled={bulkUpsert.isPending || attendanceFetching}
              onClick={handleSave}
              className="flex items-center justify-center gap-2"
            >
              <Save size={18} />

              {bulkUpsert.isPending ? "Guardando..." : "Guardar mes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
