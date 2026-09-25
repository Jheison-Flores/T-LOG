import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EmployeeAssignment } from '../entities/employee-assignment.entity';

import { Employee } from '../../employees/entities/employee.entity';

import { Position } from '../../positions/entities/position.entity';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { WarehouseType } from '../../warehouses/entities/warehouse-type.enum';

import { WorkScope } from '../entities/work-scope.enum';

import { CreateEmployeeAssignmentDto } from '../dto/create-employee-assignment.dto';

import { UpdateEmployeeAssignmentDto } from '../dto/update-employee-assignment.dto';

@Injectable()
export class EmployeeAssignmentsService {
  constructor(
    @InjectRepository(EmployeeAssignment)
    private readonly assignmentRepository: Repository<EmployeeAssignment>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  // ============================================================
  // RESTAR UN DÍA A UNA FECHA
  // ============================================================

  private getPreviousDate(date: string): string {
    const value = new Date(`${date}T00:00:00Z`);

    value.setUTCDate(value.getUTCDate() - 1);

    return value.toISOString().slice(0, 10);
  }

  // ============================================================
  // VALIDAR TRABAJADOR
  // ============================================================

  private async getEmployee(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: {
        id,
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
  // VALIDAR CARGO
  // ============================================================

  private async getPosition(id: number): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: {
        id,
      },
    });

    if (!position) {
      throw new NotFoundException('Cargo no encontrado.');
    }

    if (!position.isActive) {
      throw new BadRequestException(
        'El cargo seleccionado se encuentra inactivo.',
      );
    }

    return position;
  }

  // ============================================================
  // VALIDAR UNIDAD / SEDE
  // ============================================================

  private async getWarehouse(id: number): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: {
        id,
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Unidad o sede no encontrada.');
    }

    if (!warehouse.isActive) {
      throw new BadRequestException(
        'La unidad o sede seleccionada se encuentra inactiva.',
      );
    }

    return warehouse;
  }

  // ============================================================
  // ÁMBITO POR TIPO DE SEDE
  // ============================================================

  private resolveWorkScope(
    warehouse: Warehouse,
    workScope?: WorkScope,
  ): WorkScope {
    if (workScope) {
      return workScope;
    }

    if (warehouse.type === WarehouseType.WORKSHOP) {
      return WorkScope.WORKSHOP;
    }

    if (warehouse.type === WarehouseType.MINE) {
      return WorkScope.FIELD;
    }

    return WorkScope.OFFICE;
  }

  // ============================================================
  // CERRAR ASIGNACIÓN ACTUAL ANTERIOR
  // ============================================================

  private async closePreviousCurrentAssignment(
    employeeId: number,
    newStartDate: string,
    excludeAssignmentId?: number,
  ): Promise<void> {
    const current = await this.assignmentRepository.findOne({
      where: {
        employee: {
          id: employeeId,
        },

        isCurrent: true,
      },
    });

    if (!current) {
      return;
    }

    if (
      excludeAssignmentId !== undefined &&
      current.id === excludeAssignmentId
    ) {
      return;
    }

    if (newStartDate <= current.startDate) {
      throw new BadRequestException(
        'La nueva asignación debe iniciar después de la asignación actual.',
      );
    }

    current.isCurrent = false;

    current.endDate = this.getPreviousDate(newStartDate);

    await this.assignmentRepository.save(current);
  }

  // ============================================================
  // CREAR ASIGNACIÓN
  // ============================================================

  async create(dto: CreateEmployeeAssignmentDto): Promise<EmployeeAssignment> {
    const employee = await this.getEmployee(dto.employeeId);

    const position = await this.getPosition(dto.positionId);

    const warehouse = await this.getWarehouse(dto.warehouseId);

    // ==========================================================
    // VALIDAR FECHAS
    // ==========================================================

    if (dto.endDate && dto.endDate < dto.startDate) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la fecha de inicio.',
      );
    }

    if (dto.startDate < employee.hireDate) {
      throw new BadRequestException(
        'La asignación no puede iniciar antes de la fecha de ingreso del trabajador.',
      );
    }

    // ==========================================================
    // DETERMINAR SI ES ACTUAL
    // ==========================================================

    const isCurrent = dto.isCurrent ?? !dto.endDate;

    if (isCurrent && dto.endDate) {
      throw new BadRequestException(
        'Una asignación actual no debe tener fecha de fin.',
      );
    }

    // ==========================================================
    // CERRAR ASIGNACIÓN ACTUAL ANTERIOR
    // ==========================================================

    if (isCurrent) {
      await this.closePreviousCurrentAssignment(employee.id, dto.startDate);
    }

    // ==========================================================
    // CREAR
    // ==========================================================

    const assignment = this.assignmentRepository.create({
      employee,

      position,

      warehouse,

      workScope: this.resolveWorkScope(warehouse, dto.workScope),

      startDate: dto.startDate,

      endDate: isCurrent ? null : dto.endDate || null,

      isCurrent,

      observations: dto.observations?.trim() || undefined,
    });

    return this.assignmentRepository.save(assignment);
  }

  // ============================================================
  // LISTAR TODAS
  // ============================================================

  async findAll(): Promise<EmployeeAssignment[]> {
    return this.assignmentRepository.find({
      relations: {
        employee: true,
        position: true,
        warehouse: true,
      },

      order: {
        startDate: 'DESC',
      },
    });
  }

  // ============================================================
  // LISTAR POR TRABAJADOR
  // ============================================================

  async findByEmployee(employeeId: number): Promise<EmployeeAssignment[]> {
    const employee = await this.employeeRepository.findOne({
      where: {
        id: employeeId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Trabajador no encontrado.');
    }

    return this.assignmentRepository.find({
      where: {
        employee: {
          id: employeeId,
        },
      },

      relations: {
        employee: true,
        position: true,
        warehouse: true,
      },

      order: {
        startDate: 'DESC',
      },
    });
  }

  // ============================================================
  // BUSCAR POR ID
  // ============================================================

  async findOne(id: number): Promise<EmployeeAssignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: {
        id,
      },

      relations: {
        employee: true,
        position: true,
        warehouse: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Asignación laboral no encontrada.');
    }

    return assignment;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(
    id: number,
    dto: UpdateEmployeeAssignmentDto,
  ): Promise<EmployeeAssignment> {
    const assignment = await this.findOne(id);

    // ==========================================================
    // TRABAJADOR
    // ==========================================================

    let employee = assignment.employee;

    if (dto.employeeId !== undefined) {
      employee = await this.getEmployee(dto.employeeId);

      assignment.employee = employee;
    }

    // ==========================================================
    // CARGO
    // ==========================================================

    if (dto.positionId !== undefined) {
      assignment.position = await this.getPosition(dto.positionId);
    }

    // ==========================================================
    // UNIDAD
    // ==========================================================

    if (dto.warehouseId !== undefined) {
      assignment.warehouse = await this.getWarehouse(dto.warehouseId);
    }

    if (dto.workScope !== undefined) {
      assignment.workScope = dto.workScope;
    } else if (dto.warehouseId !== undefined) {
      assignment.workScope = this.resolveWorkScope(
        assignment.warehouse,
        dto.workScope,
      );
    }

    // ==========================================================
    // FECHA DE INICIO
    // ==========================================================

    if (dto.startDate !== undefined) {
      assignment.startDate = dto.startDate;
    }

    // ==========================================================
    // FECHA DE FIN
    // ==========================================================

    if (dto.endDate !== undefined) {
      assignment.endDate = dto.endDate || null;
    }

    // ==========================================================
    // ESTADO ACTUAL
    // ==========================================================

    if (dto.isCurrent !== undefined) {
      assignment.isCurrent = dto.isCurrent;
    }

    // ==========================================================
    // OBSERVACIONES
    // ==========================================================

    if (dto.observations !== undefined) {
      assignment.observations = dto.observations?.trim() || undefined;
    }

    // ==========================================================
    // VALIDACIONES
    // ==========================================================

    if (assignment.startDate < employee.hireDate) {
      throw new BadRequestException(
        'La asignación no puede iniciar antes de la fecha de ingreso del trabajador.',
      );
    }

    if (assignment.endDate && assignment.endDate < assignment.startDate) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la fecha de inicio.',
      );
    }

    if (assignment.isCurrent && assignment.endDate) {
      throw new BadRequestException(
        'Una asignación actual no debe tener fecha de fin.',
      );
    }

    // ==========================================================
    // SI SE MARCA COMO ACTUAL, CERRAMOS LA ANTERIOR
    // ==========================================================

    if (assignment.isCurrent) {
      await this.closePreviousCurrentAssignment(
        employee.id,
        assignment.startDate,
        assignment.id,
      );

      assignment.endDate = null;
    }

    return this.assignmentRepository.save(assignment);
  }

  // ============================================================
  // FINALIZAR ASIGNACIÓN
  // ============================================================

  async finish(id: number, endDate: string): Promise<EmployeeAssignment> {
    const assignment = await this.findOne(id);

    if (endDate < assignment.startDate) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la fecha de inicio.',
      );
    }

    assignment.endDate = endDate;

    assignment.isCurrent = false;

    return this.assignmentRepository.save(assignment);
  }
}
