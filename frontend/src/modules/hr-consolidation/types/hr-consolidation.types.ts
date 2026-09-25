export interface HrConsolidationParams {
  year: number;

  month: number;

  warehouseId?: number;

  companyId?: number;
}

export interface HrConsolidationPeriod {
  year: number;

  month: number;

  startDate: string;

  endDate: string;
}

export interface HrConsolidationFilters {
  warehouseId: number | null;

  companyId: number | null;
}

export interface HrConsolidationSummary {
  employees: number;

  attendanceRecords: number;

  mineTimesheetRecords: number;

  presentDays: number;

  absentDays: number;

  normalHours: number;

  overtimeHours: number;
}

export interface HrConsolidationCompany {
  id: number;

  legalName: string;

  tradeName?: string;
}

export interface HrAttendanceSummary {
  registeredDays: number;

  presentDays: number;

  absentDays: number;

  restDays: number;

  vacationDays: number;

  medicalLeaveDays: number;

  permissionDays: number;

  holidayDays: number;

  otherDays: number;

  normalHours: number;

  overtimeHours: number;
}

export interface HrMineTimesheetSummary {
  registeredDays: number;

  codes: Record<string, number>;
}

export interface HrEmployeeConsolidation {
  employeeId: number;

  dni: string;

  firstName: string;

  lastName: string;

  company: HrConsolidationCompany;

  attendance: HrAttendanceSummary;

  mineTimesheet: HrMineTimesheetSummary;
}

export interface HrMonthlyConsolidation {
  period: HrConsolidationPeriod;

  filters: HrConsolidationFilters;

  summary: HrConsolidationSummary;

  employees: HrEmployeeConsolidation[];
}