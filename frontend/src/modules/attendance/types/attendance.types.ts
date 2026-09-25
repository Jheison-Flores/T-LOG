import type {
  Employee,
} from "@/modules/employees/types/employee.types";

import type {
  Warehouse,
} from "@/modules/warehouses/types/warehouse.types";

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "REST"
  | "VACATION"
  | "MEDICAL_LEAVE"
  | "PERMISSION"
  | "HOLIDAY"
  | "OTHER";

export interface AttendanceRecord {
  id: number;

  employee: Employee;

  warehouse: Warehouse;

  date: string;

  status: AttendanceStatus;

  checkIn?: string | null;

  breakStart?: string | null;

  breakEnd?: string | null;

  checkOut?: string | null;

  normalHours:
    number | string;

  overtimeHours:
    number | string;

  observations?: string;

  createdAt?: string;

  updatedAt?: string;
}

export interface CreateAttendanceDto {
  employeeId: number;

  warehouseId: number;

  date: string;

  status?:
    AttendanceStatus;

  checkIn?: string;

  breakStart?: string;

  breakEnd?: string;

  checkOut?: string;

  observations?: string;
}

export interface UpdateAttendanceDto {
  employeeId?: number;

  warehouseId?: number;

  date?: string;

  status?:
    AttendanceStatus;

  checkIn?: string;

  breakStart?: string;

  breakEnd?: string;

  checkOut?: string;

  observations?: string;
}

export interface BulkUpsertAttendanceDto {
  records:
    CreateAttendanceDto[];
}

export interface AttendanceMonthParams {
  year: number;

  month: number;

  warehouseId?: number;
}