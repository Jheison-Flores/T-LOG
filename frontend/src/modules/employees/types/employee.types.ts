import type {
  Company,
} from "@/modules/companies/types/company.types";

export type EmployeeType =
  | "EMPLOYEE"
  | "WORKER";

export interface Employee {
  id: number;

  dni: string;

  firstName: string;

  lastName: string;

  company: Company;

  employeeType:
    EmployeeType;

  hireDate: string;

  terminationDate?:
    string | null;

  phone?: string;

  email?: string;

  observations?: string;

  bankAccount?: string;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;
}

export interface CreateEmployeeDto {
  dni: string;

  firstName: string;

  lastName: string;

  companyId: number;

  employeeType:
    EmployeeType;

  hireDate: string;

  terminationDate?: string;

  phone?: string;

  email?: string;

  observations?: string;

  bankAccount?: string;
}

export interface UpdateEmployeeDto {
  dni?: string;

  firstName?: string;

  lastName?: string;

  companyId?: number;

  employeeType?:
    EmployeeType;

  hireDate?: string;

  terminationDate?: string;

  phone?: string;

  email?: string;

  observations?: string;

  bankAccount?: string;
}