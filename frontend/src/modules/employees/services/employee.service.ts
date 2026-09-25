import { api } from "@/services/api";

import type {
  CreateEmployeeDto,
  Employee,
  UpdateEmployeeDto,
} from "../types/employee.types";

class EmployeeService {
  async getAll(): Promise<Employee[]> {
    const response = await api.get<Employee[]>("/employees");

    return response.data;
  }

  async getOne(id: number): Promise<Employee> {
    const response = await api.get<Employee>(`/employees/${id}`);

    return response.data;
  }

  async create(data: CreateEmployeeDto): Promise<Employee> {
    const response = await api.post<Employee>("/employees", data);

    return response.data;
  }

  async update(id: number, data: UpdateEmployeeDto): Promise<Employee> {
    const response = await api.patch<Employee>(`/employees/${id}`, data);

    return response.data;
  }

  async activate(id: number): Promise<Employee> {
    const response = await api.patch<Employee>(`/employees/${id}/activate`);

    return response.data;
  }

  async deactivate(id: number): Promise<Employee> {
    const response = await api.patch<Employee>(`/employees/${id}/deactivate`);

    return response.data;
  }
}

export const employeeService = new EmployeeService();
