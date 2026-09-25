import { api } from "@/services/api";

import type {
  CreateEmployeeAssignmentDto,
  EmployeeAssignment,
  FinishEmployeeAssignmentDto,
  UpdateEmployeeAssignmentDto,
} from "../types/employee-assignment.types";

class EmployeeAssignmentService {
  // ============================================================
  // LISTAR TODAS
  // ============================================================

  async getAll(): Promise<EmployeeAssignment[]> {
    const response = await api.get<EmployeeAssignment[]>(
      "/employee-assignments",
    );

    return response.data;
  }

  // ============================================================
  // OBTENER UNA
  // ============================================================

  async getOne(id: number): Promise<EmployeeAssignment> {
    const response = await api.get<EmployeeAssignment>(
      `/employee-assignments/${id}`,
    );

    return response.data;
  }

  // ============================================================
  // HISTORIAL POR TRABAJADOR
  // ============================================================

  async getByEmployee(employeeId: number): Promise<EmployeeAssignment[]> {
    const response = await api.get<EmployeeAssignment[]>(
      `/employee-assignments/employee/${employeeId}`,
    );

    return response.data;
  }

  // ============================================================
  // CREAR
  // ============================================================

  async create(data: CreateEmployeeAssignmentDto): Promise<EmployeeAssignment> {
    const response = await api.post<EmployeeAssignment>(
      "/employee-assignments",
      data,
    );

    return response.data;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(
    id: number,
    data: UpdateEmployeeAssignmentDto,
  ): Promise<EmployeeAssignment> {
    const response = await api.patch<EmployeeAssignment>(
      `/employee-assignments/${id}`,
      data,
    );

    return response.data;
  }

  // ============================================================
  // FINALIZAR
  // ============================================================

  async finish(
    id: number,
    data: FinishEmployeeAssignmentDto,
  ): Promise<EmployeeAssignment> {
    const response = await api.patch<EmployeeAssignment>(
      `/employee-assignments/${id}/finish`,
      data,
    );

    return response.data;
  }
}

export const employeeAssignmentService = new EmployeeAssignmentService();
