import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Between, Repository } from 'typeorm';

import { AttendanceRecord } from '../../attendance/entities/attendance-record.entity';

import { AttendanceStatus } from '../../attendance/entities/attendance-status.enum';

import { MineTimesheet } from '../../mine-timesheets/entities/mine-timesheet.entity';

import { MineTimesheetCode } from '../../mine-timesheets/entities/mine-timesheet-code.enum';

interface EmployeeConsolidation {
  employeeId: number;

  dni: string;

  firstName: string;

  lastName: string;

  company: {
    id: number;

    legalName: string;

    tradeName?: string;
  };

  attendance: {
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
  };

  mineTimesheet: {
    registeredDays: number;

    codes: Record<string, number>;
  };
}

@Injectable()
export class HrConsolidationService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepository: Repository<AttendanceRecord>,

    @InjectRepository(MineTimesheet)
    private readonly mineTimesheetRepository: Repository<MineTimesheet>,
  ) {}

  // ============================================================
  // RANGO DEL MES
  // ============================================================

  private getMonthRange(
    year: number,
    month: number,
  ): {
    startDate: string;
    endDate: string;
  } {
    if (month < 1 || month > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12.');
    }

    if (year < 2000 || year > 2100) {
      throw new BadRequestException('El año no es válido.');
    }

    const monthText = String(month).padStart(2, '0');

    const startDate = `${year}-${monthText}-01`;

    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

    const endDate = `${year}-${monthText}-${String(lastDay).padStart(2, '0')}`;

    return {
      startDate,
      endDate,
    };
  }

  // ============================================================
  // ESTRUCTURA VACÍA
  // ============================================================

  private createEmptyEmployee(employee: any): EmployeeConsolidation {
    const codes: Record<string, number> = {};

    Object.values(MineTimesheetCode).forEach((code) => {
      codes[code] = 0;
    });

    return {
      employeeId: employee.id,

      dni: employee.dni,

      firstName: employee.firstName,

      lastName: employee.lastName,

      company: {
        id: employee.company.id,

        legalName: employee.company.legalName,

        tradeName: employee.company.tradeName,
      },

      attendance: {
        registeredDays: 0,

        presentDays: 0,

        absentDays: 0,

        restDays: 0,

        vacationDays: 0,

        medicalLeaveDays: 0,

        permissionDays: 0,

        holidayDays: 0,

        otherDays: 0,

        normalHours: 0,

        overtimeHours: 0,
      },

      mineTimesheet: {
        registeredDays: 0,

        codes,
      },
    };
  }

  // ============================================================
  // CONSOLIDADO MENSUAL
  // ============================================================

  async getMonthlyConsolidation(
    year: number,
    month: number,
    warehouseId?: number,
    companyId?: number,
  ) {
    const { startDate, endDate } = this.getMonthRange(year, month);

    // ==========================================================
    // ASISTENCIA
    // ==========================================================

    const attendanceWhere: any = {
      date: Between(startDate, endDate),
    };

    if (warehouseId) {
      attendanceWhere.warehouse = {
        id: warehouseId,
      };
    }

    if (companyId) {
      attendanceWhere.employee = {
        company: {
          id: companyId,
        },
      };
    }

    const attendanceRecords = await this.attendanceRepository.find({
      where: attendanceWhere,

      relations: {
        employee: {
          company: true,
        },

        warehouse: true,
      },

      order: {
        date: 'ASC',
      },
    });

    // ==========================================================
    // TAREO MINA
    // ==========================================================

    const timesheetWhere: any = {
      date: Between(startDate, endDate),
    };

    if (warehouseId) {
      timesheetWhere.warehouse = {
        id: warehouseId,
      };
    }

    if (companyId) {
      timesheetWhere.employee = {
        company: {
          id: companyId,
        },
      };
    }

    const mineTimesheets = await this.mineTimesheetRepository.find({
      where: timesheetWhere,

      relations: {
        employee: {
          company: true,
        },

        warehouse: true,
      },

      order: {
        date: 'ASC',
      },
    });

    // ==========================================================
    // MAPA POR TRABAJADOR
    // ==========================================================

    const employeesMap = new Map<number, EmployeeConsolidation>();

    // ==========================================================
    // PROCESAR ASISTENCIA
    // ==========================================================

    for (const record of attendanceRecords) {
      const employee = record.employee;

      if (!employeesMap.has(employee.id)) {
        employeesMap.set(employee.id, this.createEmptyEmployee(employee));
      }

      const item = employeesMap.get(employee.id)!;

      item.attendance.registeredDays += 1;

      switch (record.status) {
        case AttendanceStatus.PRESENT:
          item.attendance.presentDays += 1;
          break;

        case AttendanceStatus.ABSENT:
          item.attendance.absentDays += 1;
          break;

        case AttendanceStatus.REST:
          item.attendance.restDays += 1;
          break;

        case AttendanceStatus.VACATION:
          item.attendance.vacationDays += 1;
          break;

        case AttendanceStatus.MEDICAL_LEAVE:
          item.attendance.medicalLeaveDays += 1;
          break;

        case AttendanceStatus.PERMISSION:
          item.attendance.permissionDays += 1;
          break;

        case AttendanceStatus.HOLIDAY:
          item.attendance.holidayDays += 1;
          break;

        case AttendanceStatus.OTHER:
          item.attendance.otherDays += 1;
          break;
      }

      item.attendance.normalHours += Number(record.normalHours ?? 0);

      item.attendance.overtimeHours += Number(record.overtimeHours ?? 0);
    }

    // ==========================================================
    // PROCESAR TAREOS
    // ==========================================================

    for (const record of mineTimesheets) {
      const employee = record.employee;

      if (!employeesMap.has(employee.id)) {
        employeesMap.set(employee.id, this.createEmptyEmployee(employee));
      }

      const item = employeesMap.get(employee.id)!;

      item.mineTimesheet.registeredDays += 1;

      const currentCount = item.mineTimesheet.codes[record.code] ?? 0;

      item.mineTimesheet.codes[record.code] = currentCount + 1;
    }

    // ==========================================================
    // FORMATEAR DECIMALES
    // ==========================================================

    const employees = Array.from(employeesMap.values())
      .map((item) => ({
        ...item,

        attendance: {
          ...item.attendance,

          normalHours: Number(item.attendance.normalHours.toFixed(2)),

          overtimeHours: Number(item.attendance.overtimeHours.toFixed(2)),
        },
      }))
      .sort((a, b) =>
        `${a.lastName} ${a.firstName}`.localeCompare(
          `${b.lastName} ${b.firstName}`,
          'es',
        ),
      );

    // ==========================================================
    // RESUMEN GLOBAL
    // ==========================================================

    const summary = {
      employees: employees.length,

      attendanceRecords: attendanceRecords.length,

      mineTimesheetRecords: mineTimesheets.length,

      presentDays: employees.reduce(
        (total, item) => total + item.attendance.presentDays,

        0,
      ),

      absentDays: employees.reduce(
        (total, item) => total + item.attendance.absentDays,

        0,
      ),

      normalHours: Number(
        employees
          .reduce(
            (total, item) => total + item.attendance.normalHours,

            0,
          )
          .toFixed(2),
      ),

      overtimeHours: Number(
        employees
          .reduce(
            (total, item) => total + item.attendance.overtimeHours,

            0,
          )
          .toFixed(2),
      ),
    };

    return {
      period: {
        year,
        month,
        startDate,
        endDate,
      },

      filters: {
        warehouseId: warehouseId ?? null,

        companyId: companyId ?? null,
      },

      summary,

      employees,
    };
  }
}
