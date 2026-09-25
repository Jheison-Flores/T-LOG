import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Employee } from '../entities/employee.entity';
import { Company } from '../../companies/entities/company.entity';

import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  // ============================================================
  // CREAR TRABAJADOR
  // ============================================================

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const dni = dto.dni.trim();

    // ==========================================================
    // VALIDAR DNI DUPLICADO
    // ==========================================================

    const existingEmployee = await this.employeeRepository.findOne({
      where: {
        dni,
      },
    });

    if (existingEmployee) {
      throw new ConflictException(
        'Ya existe un trabajador registrado con ese DNI.',
      );
    }

    // ==========================================================
    // VALIDAR EMPRESA
    // ==========================================================

    const company = await this.companyRepository.findOne({
      where: {
        id: dto.companyId,
      },
    });

    if (!company) {
      throw new NotFoundException('La empresa seleccionada no existe.');
    }

    if (!company.isActive) {
      throw new BadRequestException(
        'No se puede registrar un trabajador en una empresa inactiva.',
      );
    }

    // ==========================================================
    // VALIDAR FECHAS
    // ==========================================================

    if (dto.terminationDate && dto.terminationDate < dto.hireDate) {
      throw new BadRequestException(
        'La fecha de cese no puede ser anterior a la fecha de ingreso.',
      );
    }

    // ==========================================================
    // CREAR
    // ==========================================================

    const employee = this.employeeRepository.create({
      dni,

      firstName: dto.firstName.trim(),

      lastName: dto.lastName.trim(),

      company,

      employeeType: dto.employeeType,

      hireDate: dto.hireDate,

      terminationDate: dto.terminationDate || null,

      phone: dto.phone?.trim() || undefined,

      email: dto.email?.trim().toLowerCase() || undefined,

      observations: dto.observations?.trim() || undefined,

      bankName: dto.bankName?.trim() || undefined,

      bankAccountType: dto.bankAccountType || null,

      bankAccount: dto.bankAccount?.trim() || undefined,

      cci: dto.cci?.trim() || undefined,

      dailyRate: dto.dailyRate ?? 0,

      overtimeHourRate: dto.overtimeHourRate ?? 0,

      isActive: true,
    });

    return this.employeeRepository.save(employee);
  }

  // ============================================================
  // LISTAR TODOS
  // ============================================================

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      order: {
        lastName: 'ASC',
        firstName: 'ASC',
      },
    });
  }

  // ============================================================
  // OBTENER UNO
  // ============================================================

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: {
        id,
      },
    });

    if (!employee) {
      throw new NotFoundException('El trabajador solicitado no existe.');
    }

    return employee;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(id: number, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    // ==========================================================
    // VALIDAR DNI
    // ==========================================================

    if (dto.dni !== undefined) {
      const dni = dto.dni.trim();

      const employeeWithSameDni = await this.employeeRepository.findOne({
        where: {
          dni,
        },
      });

      if (employeeWithSameDni && employeeWithSameDni.id !== employee.id) {
        throw new ConflictException(
          'Ya existe otro trabajador registrado con ese DNI.',
        );
      }

      employee.dni = dni;
    }

    // ==========================================================
    // VALIDAR EMPRESA
    // ==========================================================

    if (dto.companyId !== undefined) {
      const company = await this.companyRepository.findOne({
        where: {
          id: dto.companyId,
        },
      });

      if (!company) {
        throw new NotFoundException('La empresa seleccionada no existe.');
      }

      if (!company.isActive) {
        throw new BadRequestException(
          'No se puede asignar un trabajador a una empresa inactiva.',
        );
      }

      employee.company = company;
    }

    // ==========================================================
    // NOMBRES
    // ==========================================================

    if (dto.firstName !== undefined) {
      employee.firstName = dto.firstName.trim();
    }

    if (dto.lastName !== undefined) {
      employee.lastName = dto.lastName.trim();
    }

    // ==========================================================
    // TIPO DE TRABAJADOR
    // ==========================================================

    if (dto.employeeType !== undefined) {
      employee.employeeType = dto.employeeType;
    }

    // ==========================================================
    // FECHA DE INGRESO
    // ==========================================================

    if (dto.hireDate !== undefined) {
      employee.hireDate = dto.hireDate;
    }

    // ==========================================================
    // FECHA DE CESE
    // ==========================================================

    if (dto.terminationDate !== undefined) {
      employee.terminationDate = dto.terminationDate || null;
    }

    // ==========================================================
    // VALIDAR RANGO DE FECHAS
    // ==========================================================

    if (
      employee.terminationDate &&
      employee.terminationDate < employee.hireDate
    ) {
      throw new BadRequestException(
        'La fecha de cese no puede ser anterior a la fecha de ingreso.',
      );
    }

    // ==========================================================
    // CONTACTO
    // ==========================================================

    if (dto.phone !== undefined) {
      employee.phone = dto.phone.trim() || undefined;
    }

    if (dto.email !== undefined) {
      employee.email = dto.email.trim().toLowerCase() || undefined;
    }

    // ==========================================================
    // OBSERVACIONES
    // ==========================================================

    if (dto.observations !== undefined) {
      employee.observations = dto.observations.trim() || undefined;
    }

    // ==========================================================
    // CUENTA BANCARIA
    // ==========================================================

    if (dto.bankName !== undefined) {
      employee.bankName = dto.bankName.trim() || undefined;
    }

    if (dto.bankAccountType !== undefined) {
      employee.bankAccountType = dto.bankAccountType || null;
    }

    if (dto.bankAccount !== undefined) {
      employee.bankAccount = dto.bankAccount.trim() || undefined;
    }

    if (dto.cci !== undefined) {
      employee.cci = dto.cci.trim() || undefined;
    }

    if (dto.dailyRate !== undefined) {
      employee.dailyRate = dto.dailyRate;
    }

    if (dto.overtimeHourRate !== undefined) {
      employee.overtimeHourRate = dto.overtimeHourRate;
    }

    return this.employeeRepository.save(employee);
  }

  // ============================================================
  // DESACTIVAR
  // ============================================================

  async deactivate(id: number): Promise<Employee> {
    const employee = await this.findOne(id);

    employee.isActive = false;

    return this.employeeRepository.save(employee);
  }

  // ============================================================
  // ACTIVAR
  // ============================================================

  async activate(id: number): Promise<Employee> {
    const employee = await this.findOne(id);

    employee.isActive = true;

    return this.employeeRepository.save(employee);
  }
}
