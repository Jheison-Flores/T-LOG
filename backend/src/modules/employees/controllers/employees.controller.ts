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

import { EmployeesService } from '../services/employees.service';

import { CreateEmployeeDto } from '../dto/create-employee.dto';

import { UpdateEmployeeDto } from '../dto/update-employee.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // ============================================================
  // CREAR
  // ============================================================

  @Post()
  @Roles('ADMIN')
  create(
    @Body()
    dto: CreateEmployeeDto,
  ) {
    return this.employeesService.create(dto);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.employeesService.findAll();
  }

  // ============================================================
  // OBTENER UNO
  // ============================================================

  @Get(':id')
  @Roles('ADMIN')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.employeesService.findOne(id);
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
    dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, dto);
  }

  // ============================================================
  // DESACTIVAR
  // ============================================================

  @Patch(':id/deactivate')
  @Roles('ADMIN')
  deactivate(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.employeesService.deactivate(id);
  }

  // ============================================================
  // ACTIVAR
  // ============================================================

  @Patch(':id/activate')
  @Roles('ADMIN')
  activate(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.employeesService.activate(id);
  }
}
