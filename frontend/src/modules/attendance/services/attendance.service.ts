import {
  api,
} from "@/services/api";

import type {
  AttendanceMonthParams,
  AttendanceRecord,
  BulkUpsertAttendanceDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from "../types/attendance.types";

class AttendanceService {
  // ============================================================
  // LISTAR TODO
  // ============================================================

  async getAll(): Promise<AttendanceRecord[]> {
    const response =
      await api.get<AttendanceRecord[]>(
        "/attendance",
      );

    return response.data;
  }

  // ============================================================
  // CONSULTAR MES
  // ============================================================

  async getByMonth(
    params:
      AttendanceMonthParams,
  ): Promise<AttendanceRecord[]> {
    const response =
      await api.get<AttendanceRecord[]>(
        "/attendance/month",
        {
          params: {
            year:
              params.year,

            month:
              params.month,

            warehouseId:
              params.warehouseId,
          },
        },
      );

    return response.data;
  }

  // ============================================================
  // OBTENER UNO
  // ============================================================

  async getOne(
    id: number,
  ): Promise<AttendanceRecord> {
    const response =
      await api.get<AttendanceRecord>(
        `/attendance/${id}`,
      );

    return response.data;
  }

  // ============================================================
  // CREAR
  // ============================================================

  async create(
    data:
      CreateAttendanceDto,
  ): Promise<AttendanceRecord> {
    const response =
      await api.post<AttendanceRecord>(
        "/attendance",
        data,
      );

    return response.data;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(
    id: number,
    data:
      UpdateAttendanceDto,
  ): Promise<AttendanceRecord> {
    const response =
      await api.patch<AttendanceRecord>(
        `/attendance/${id}`,
        data,
      );

    return response.data;
  }

  // ============================================================
  // GUARDAR VARIOS
  // ============================================================

  async bulkUpsert(
    data:
      BulkUpsertAttendanceDto,
  ): Promise<AttendanceRecord[]> {
    const response =
      await api.post<AttendanceRecord[]>(
        "/attendance/bulk-upsert",
        data,
      );

    return response.data;
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  async remove(
    id: number,
  ): Promise<{
    message: string;
  }> {
    const response =
      await api.delete<{
        message: string;
      }>(
        `/attendance/${id}`,
      );

    return response.data;
  }

  // ============================================================
  // EXPORTAR A CSV
  // ============================================================

  async exportToCsv(
    year?: number,
    month?: number,
    warehouseId?: number,
  ): Promise<string> {
    const response =
      await api.get<string>(
        `/attendance/export/csv`,
        {
          params: {
            year,
            month,
            warehouseId,
          },
        },
      );

    return response.data;
  }
}

export const attendanceService =
  new AttendanceService();