import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Between, Repository } from 'typeorm';

import { AttendanceRecord } from '../entities/attendance-record.entity';

import { AttendanceStatus } from '../entities/attendance-status.enum';

import { Employee } from '../../employees/entities/employee.entity';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { CreateAttendanceDto } from '../dto/create-attendance.dto';

import { UpdateAttendanceDto } from '../dto/update-attendance.dto';

import { BulkUpsertAttendanceDto } from '../dto/bulk-upsert-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepository: Repository<AttendanceRecord>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  // ============================================================
  // CONVERTIR HH:mm A MINUTOS
  // ============================================================

  private timeToMinutes(time?: string | null): number | null {
    if (!time) {
      return null;
    }

    const [hour, minute] = time.substring(0, 5).split(':').map(Number);

    return hour * 60 + minute;
  }

  // ============================================================
  // CALCULAR HORAS
  // ============================================================

  private calculateHours(
    status: AttendanceStatus,

    checkIn?: string | null,

    breakStart?: string | null,

    breakEnd?: string | null,

    checkOut?: string | null,
  ): {
    normalHours: number;
    overtimeHours: number;
  } {
    if (status !== AttendanceStatus.PRESENT) {
      return {
        normalHours: 0,
        overtimeHours: 0,
      };
    }

    const start = this.timeToMinutes(checkIn);

    const end = this.timeToMinutes(checkOut);

    if (start === null || end === null) {
      return {
        normalHours: 0,
        overtimeHours: 0,
      };
    }

    if (end < start) {
      throw new BadRequestException(
        'La hora de salida no puede ser anterior a la hora de ingreso.',
      );
    }

    let workedMinutes = end - start;

    const lunchStart = this.timeToMinutes(breakStart);

    const lunchEnd = this.timeToMinutes(breakEnd);

    if (lunchStart !== null || lunchEnd !== null) {
      if (lunchStart === null || lunchEnd === null) {
        throw new BadRequestException(
          'Debe registrar tanto el inicio como el fin del refrigerio.',
        );
      }

      if (lunchEnd < lunchStart) {
        throw new BadRequestException(
          'El fin del refrigerio no puede ser anterior al inicio.',
        );
      }

      if (lunchStart < start || lunchEnd > end) {
        throw new BadRequestException(
          'El refrigerio debe encontrarse dentro del horario de trabajo.',
        );
      }

      workedMinutes -= lunchEnd - lunchStart;
    }

    if (workedMinutes < 0) {
      throw new BadRequestException('El horario registrado no es válido.');
    }

    const normalMinutes = Math.min(workedMinutes, 8 * 60);

    const overtimeMinutes = Math.max(workedMinutes - 8 * 60, 0);

    return {
      normalHours: Number((normalMinutes / 60).toFixed(2)),

      overtimeHours: Number((overtimeMinutes / 60).toFixed(2)),
    };
  }

  // ============================================================
  // VALIDAR TRABAJADOR
  // ============================================================

  private async getEmployee(employeeId: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: {
        id: employeeId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Trabajador no encontrado.');
    }

    if (!employee.isActive) {
      throw new BadRequestException('El trabajador se encuentra inactivo.');
    }

    return employee;
  }

  // ============================================================
  // VALIDAR SEDE
  // ============================================================

  private async getWarehouse(warehouseId: number): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: {
        id: warehouseId,
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Sede o unidad no encontrada.');
    }

    if (!warehouse.isActive) {
      throw new BadRequestException('La sede o unidad se encuentra inactiva.');
    }

    return warehouse;
  }

  // ============================================================
  // CREAR
  // ============================================================

  async create(dto: CreateAttendanceDto): Promise<AttendanceRecord> {
    const employee = await this.getEmployee(dto.employeeId);

    const warehouse = await this.getWarehouse(dto.warehouseId);

    const existing = await this.attendanceRepository.findOne({
      where: {
        employee: {
          id: dto.employeeId,
        },

        date: dto.date,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe un registro de asistencia para este trabajador en esa fecha.',
      );
    }

    const status = dto.status ?? AttendanceStatus.PRESENT;

    const hours = this.calculateHours(
      status,
      dto.checkIn,
      dto.breakStart,
      dto.breakEnd,
      dto.checkOut,
    );

    const attendance = this.attendanceRepository.create({
      employee,

      warehouse,

      date: dto.date,

      status,

      checkIn: dto.checkIn || null,

      breakStart: dto.breakStart || null,

      breakEnd: dto.breakEnd || null,

      checkOut: dto.checkOut || null,

      normalHours: hours.normalHours,

      overtimeHours: hours.overtimeHours,

      observations: dto.observations?.trim() || undefined,
    });

    return this.attendanceRepository.save(attendance);
  }

  // ============================================================
  // LISTAR TODO
  // ============================================================

  async findAll(): Promise<AttendanceRecord[]> {
    return this.attendanceRepository.find({
      order: {
        date: 'DESC',
      },
    });
  }

  // ============================================================
  // BUSCAR POR ID
  // ============================================================

  async findOne(id: number): Promise<AttendanceRecord> {
    const attendance = await this.attendanceRepository.findOne({
      where: {
        id,
      },
    });

    if (!attendance) {
      throw new NotFoundException('Registro de asistencia no encontrado.');
    }

    return attendance;
  }

  // ============================================================
  // CONSULTAR MES
  // ============================================================

  async findByMonth(
    year: number,
    month: number,
    warehouseId?: number,
  ): Promise<AttendanceRecord[]> {
    if (month < 1 || month > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12.');
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(
      lastDay,
    ).padStart(2, '0')}`;

    const where: any = {
      date: Between(startDate, endDate),
    };

    if (warehouseId) {
      where.warehouse = {
        id: warehouseId,
      };
    }

    return this.attendanceRepository.find({
      where,

      order: {
        date: 'ASC',
      },
    });
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(
    id: number,
    dto: UpdateAttendanceDto,
  ): Promise<AttendanceRecord> {
    const attendance = await this.findOne(id);

    if (dto.employeeId !== undefined) {
      attendance.employee = await this.getEmployee(dto.employeeId);
    }

    if (dto.warehouseId !== undefined) {
      attendance.warehouse = await this.getWarehouse(dto.warehouseId);
    }

    if (dto.date !== undefined) {
      attendance.date = dto.date;
    }

    if (dto.status !== undefined) {
      attendance.status = dto.status;
    }

    if (dto.checkIn !== undefined) {
      attendance.checkIn = dto.checkIn || null;
    }

    if (dto.breakStart !== undefined) {
      attendance.breakStart = dto.breakStart || null;
    }

    if (dto.breakEnd !== undefined) {
      attendance.breakEnd = dto.breakEnd || null;
    }

    if (dto.checkOut !== undefined) {
      attendance.checkOut = dto.checkOut || null;
    }

    if (dto.observations !== undefined) {
      attendance.observations = dto.observations?.trim() || undefined;
    }

    const hours = this.calculateHours(
      attendance.status,
      attendance.checkIn,
      attendance.breakStart,
      attendance.breakEnd,
      attendance.checkOut,
    );

    attendance.normalHours = hours.normalHours;

    attendance.overtimeHours = hours.overtimeHours;

    return this.attendanceRepository.save(attendance);
  }

  // ============================================================
  // BULK UPSERT
  // ============================================================

  async bulkUpsert(dto: BulkUpsertAttendanceDto): Promise<AttendanceRecord[]> {
    const results: AttendanceRecord[] = [];

    for (const record of dto.records) {
      const existing = await this.attendanceRepository.findOne({
        where: {
          employee: {
            id: record.employeeId,
          },

          date: record.date,
        },
      });

      if (existing) {
        const updated = await this.update(existing.id, record);

        results.push(updated);
      } else {
        const created = await this.create(record);

        results.push(created);
      }
    }

    return results;
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  async remove(id: number): Promise<{
    message: string;
  }> {
    const attendance = await this.findOne(id);

    await this.attendanceRepository.remove(attendance);

    return {
      message: 'Registro de asistencia eliminado correctamente.',
    };
  }

  // ============================================================
  // EXPORTAR A CSV
  // ============================================================

  async exportToCsv(
    year?: number,
    month?: number,
    warehouseId?: number,
  ): Promise<string> {
    const where: any = {};

    // Filtrar por año y mes si se proporcionan
    if (year !== undefined && month !== undefined) {
      if (month < 1 || month > 12) {
        throw new BadRequestException('El mes debe estar entre 1 y 12.');
      }

      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(
        lastDay,
      ).padStart(2, '0')}`;

      where.date = Between(startDate, endDate);
    }

    // Filtrar por sede si se proporciona
    if (warehouseId !== undefined) {
      where.warehouse = {
        id: warehouseId,
      };
    }

    const records = await this.attendanceRepository.find({
      where,
      relations: {
        employee: {
          company: true,
        },
        warehouse: true,
      },
      order: {
        date: 'ASC',
        employee: {
          lastName: 'ASC',
          firstName: 'ASC',
        },
      },
    });

    // Generar CSV
    const csvRows: string[] = [];

    // Encabezado
    csvRows.push([
      'Fecha',
      'DNI',
      'Apellidos',
      'Nombres',
      'Empresa',
      'Sede',
      'Estado',
      'Ingreso',
      'Refrigerio inicio',
      'Refrigerio fin',
      'Salida',
      'Horas normales',
      'Horas extra',
      'Observaciones',
    ].join(','));

    // Datos
    for (const record of records) {
      csvRows.push([
        record.date,
        record.employee.dni,
        record.employee.lastName,
        record.employee.firstName,
        record.employee.company.tradeName || record.employee.company.legalName,
        record.warehouse.name,
        record.status,
        record.checkIn || '',
        record.breakStart || '',
        record.breakEnd || '',
        record.checkOut || '',
        record.normalHours.toFixed(2),
        record.overtimeHours.toFixed(2),
        `"${(record.observations || '').replace(/"/g, '""')}"`,
      ].join(','));
    }

    return csvRows.join('\n');
  }
}
