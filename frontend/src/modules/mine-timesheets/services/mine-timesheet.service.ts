import {
  api,
} from "@/services/api";

import type {
  BulkUpsertMineTimesheetDto,
  CreateMineTimesheetDto,
  MineTimesheet,
  MineTimesheetMonthParams,
  UpdateMineTimesheetDto,
} from "../types/mine-timesheet.types";

class MineTimesheetService {
  async getAll(): Promise<MineTimesheet[]> {
    const response =
      await api.get<MineTimesheet[]>(
        "/mine-timesheets",
      );

    return response.data;
  }

  async getOne(
    id: number,
  ): Promise<MineTimesheet> {
    const response =
      await api.get<MineTimesheet>(
        `/mine-timesheets/${id}`,
      );

    return response.data;
  }

  async getByMonth(
    params:
      MineTimesheetMonthParams,
  ): Promise<MineTimesheet[]> {
    const response =
      await api.get<MineTimesheet[]>(
        "/mine-timesheets/month",
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

  async getByEmployee(
    employeeId: number,
  ): Promise<MineTimesheet[]> {
    const response =
      await api.get<MineTimesheet[]>(
        `/mine-timesheets/employee/${employeeId}`,
      );

    return response.data;
  }

  async create(
    data:
      CreateMineTimesheetDto,
  ): Promise<MineTimesheet> {
    const response =
      await api.post<MineTimesheet>(
        "/mine-timesheets",
        data,
      );

    return response.data;
  }

  async update(
    id: number,
    data:
      UpdateMineTimesheetDto,
  ): Promise<MineTimesheet> {
    const response =
      await api.patch<MineTimesheet>(
        `/mine-timesheets/${id}`,
        data,
      );

    return response.data;
  }

  async bulkUpsert(
    data:
      BulkUpsertMineTimesheetDto,
  ): Promise<MineTimesheet[]> {
    const response =
      await api.post<MineTimesheet[]>(
        "/mine-timesheets/bulk-upsert",
        data,
      );

    return response.data;
  }

  async remove(
    id: number,
  ): Promise<{
    message: string;
  }> {
    const response =
      await api.delete<{
        message: string;
      }>(
        `/mine-timesheets/${id}`,
      );

    return response.data;
  }
}

export const mineTimesheetService =
  new MineTimesheetService();