import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { EmployeeAssignmentsService } from '../services/employee-assignments.service';

import { CreateEmployeeAssignmentDto } from '../dto/create-employee-assignment.dto';

import { UpdateEmployeeAssignmentDto } from '../dto/update-employee-assignment.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('employee-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeAssignmentsController {
  constructor(
    private readonly employeeAssignmentsService: EmployeeAssignmentsService,
  ) {}

  // ============================================================
  // CREAR
  // ============================================================

  @Post()
  @Roles('ADMIN')
  create(
    @Body()
    dto: CreateEmployeeAssignmentDto,
  ) {
    return this.employeeAssignmentsService.create(dto);
  }

  // ============================================================
  // LISTAR TODAS
  // ============================================================

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.employeeAssignmentsService.findAll();
  }

  // ============================================================
  // HISTORIAL DE UN TRABAJADOR
  // ============================================================

  @Get('employee/:employeeId')
  @Roles('ADMIN')
  findByEmployee(
    @Param('employeeId', ParseIntPipe)
    employeeId: number,
  ) {
    return this.employeeAssignmentsService.findByEmployee(employeeId);
  }

  // ============================================================
  // OBTENER UNA ASIGNACIÓN
  // ============================================================

  @Get(':id')
  @Roles('ADMIN')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.employeeAssignmentsService.findOne(id);
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateEmployeeAssignmentDto,
  ) {
    return this.employeeAssignmentsService.update(id, dto);
  }

  // ============================================================
  // FINALIZAR ASIGNACIÓN
  // ============================================================

  @Patch(':id/finish')
  @Roles('ADMIN')
  finish(
    @Param('id', ParseIntPipe)
    id: number,

    @Body('endDate')
    endDate: string,
  ) {
    return this.employeeAssignmentsService.finish(id, endDate);
  }
}
