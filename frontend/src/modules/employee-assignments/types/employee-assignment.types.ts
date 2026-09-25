import type {
  Employee,
} from "@/modules/employees/types/employee.types";

import type {
  Position,
} from "@/modules/positions/types/position.types";

import type {
  Warehouse,
} from "@/modules/warehouses/types/warehouse.types";

export interface EmployeeAssignment {
  id: number;

  employee: Employee;

  position: Position;

  warehouse: Warehouse;

  startDate: string;

  endDate?: string | null;

  isCurrent: boolean;

  observations?: string;

  createdAt?: string;

  updatedAt?: string;
}

export interface CreateEmployeeAssignmentDto {
  employeeId: number;

  positionId: number;

  warehouseId: number;

  startDate: string;

  endDate?: string;

  isCurrent?: boolean;

  observations?: string;
}

export interface UpdateEmployeeAssignmentDto {
  employeeId?: number;

  positionId?: number;

  warehouseId?: number;

  startDate?: string;

  endDate?: string;

  isCurrent?: boolean;

  observations?: string;
}

export interface FinishEmployeeAssignmentDto {
  endDate: string;
}