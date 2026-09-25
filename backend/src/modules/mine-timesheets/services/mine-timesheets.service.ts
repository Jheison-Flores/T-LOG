import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Employee } from '../../employees/entities/employee.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { BulkUpsertMineTimesheetDto } from '../dto/bulk-upsert-mine-timesheet.dto';
import { CreateMineTimesheetDto } from '../dto/create-mine-timesheet.dto';
import { UpdateMineTimesheetDto } from '../dto/update-mine-timesheet.dto';
import { MineTimesheet } from '../entities/mine-timesheet.entity';

@Injectable()
export class MineTimesheetsService {
  constructor(
    @InjectRepository(MineTimesheet)
    private readonly mineTimesheetRepository: Repository<MineTimesheet>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

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

  private async getWarehouse(warehouseId: number): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: {
        id: warehouseId,
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Unidad minera no encontrada.');
    }

    if (!warehouse.isActive) {
      throw new BadRequestException('La unidad se encuentra inactiva.');
    }

    return warehouse;
  }

  async create(dto: CreateMineTimesheetDto): Promise<MineTimesheet> {
    const employee = await this.getEmployee(dto.employeeId);
    const warehouse = await this.getWarehouse(dto.warehouseId);

    const existing = await this.mineTimesheetRepository.findOne({
      where: {
        employee: {
          id: dto.employeeId,
        },
        date: dto.date,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe un tareo para este trabajador en esa fecha.',
      );
    }

    const record = this.mineTimesheetRepository.create({
      employee,
      warehouse,
      date: dto.date,
      code: dto.code,
      observations: dto.observations?.trim() || undefined,
    });

    return this.mineTimesheetRepository.save(record);
  }

  async findAll(): Promise<MineTimesheet[]> {
    return this.mineTimesheetRepository.find({
      order: {
        date: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<MineTimesheet> {
    const record = await this.mineTimesheetRepository.findOne({
      where: {
        id,
      },
    });

    if (!record) {
      throw new NotFoundException('Registro de tareo no encontrado.');
    }

    return record;
  }

  async findByMonth(
    year: number,
    month: number,
    warehouseId?: number,
  ): Promise<MineTimesheet[]> {
    if (month < 1 || month > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12.');
    }

    const monthText = String(month).padStart(2, '0');

    const startDate = `${year}-${monthText}-01`;

    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const endDate = `${year}-${monthText}-${String(lastDay).padStart(2, '0')}`;

    const where: any = {
      date: Between(startDate, endDate),
    };

    if (warehouseId) {
      where.warehouse = {
        id: warehouseId,
      };
    }

    return this.mineTimesheetRepository.find({
      where,
      order: {
        date: 'ASC',
      },
    });
  }

  async findByEmployee(employeeId: number): Promise<MineTimesheet[]> {
    return this.mineTimesheetRepository.find({
      where: {
        employee: {
          id: employeeId,
        },
      },
      order: {
        date: 'DESC',
      },
    });
  }

  async update(
    id: number,
    dto: UpdateMineTimesheetDto,
  ): Promise<MineTimesheet> {
    const record = await this.findOne(id);

    if (dto.employeeId !== undefined) {
      record.employee = await this.getEmployee(dto.employeeId);
    }

    if (dto.warehouseId !== undefined) {
      record.warehouse = await this.getWarehouse(dto.warehouseId);
    }

    if (dto.date !== undefined) {
      record.date = dto.date;
    }

    if (dto.code !== undefined) {
      record.code = dto.code;
    }

    if (dto.observations !== undefined) {
      record.observations = dto.observations?.trim() || undefined;
    }

    return this.mineTimesheetRepository.save(record);
  }

  async bulkUpsert(dto: BulkUpsertMineTimesheetDto): Promise<MineTimesheet[]> {
    const results: MineTimesheet[] = [];

    for (const item of dto.records) {
      const existing = await this.mineTimesheetRepository.findOne({
        where: {
          employee: {
            id: item.employeeId,
          },
          date: item.date,
        },
      });

      if (existing) {
        const updated = await this.update(existing.id, item);
        results.push(updated);
      } else {
        const created = await this.create(item);
        results.push(created);
      }
    }

    return results;
  }

  async remove(id: number): Promise<{
    message: string;
  }> {
    const record = await this.findOne(id);

    await this.mineTimesheetRepository.remove(record);

    return {
      message: 'Registro de tareo eliminado correctamente.',
    };
  }
}
