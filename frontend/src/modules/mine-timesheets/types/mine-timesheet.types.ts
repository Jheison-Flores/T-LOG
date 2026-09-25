import type {
  Employee,
} from "@/modules/employees/types/employee.types";

import type {
  Warehouse,
} from "@/modules/warehouses/types/warehouse.types";

export type MineTimesheetCode =
  | "DL"
  | "P"
  | "I"
  | "S"
  | "PG"
  | "V"
  | "R"
  | "DM"
  | "TO"
  | "TC"
  | "AT";

export interface MineTimesheet {
  id: number;

  employee: Employee;

  warehouse: Warehouse;

  date: string;

  code: MineTimesheetCode;

  observations?: string;

  createdAt?: string;

  updatedAt?: string;
}

export interface CreateMineTimesheetDto {
  employeeId: number;

  warehouseId: number;

  date: string;

  code: MineTimesheetCode;

  observations?: string;
}

export interface UpdateMineTimesheetDto {
  employeeId?: number;

  warehouseId?: number;

  date?: string;

  code?: MineTimesheetCode;

  observations?: string;
}

export interface BulkUpsertMineTimesheetDto {
  records: CreateMineTimesheetDto[];
}

export interface MineTimesheetMonthParams {
  year: number;

  month: number;

  warehouseId?: number;
}