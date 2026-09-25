import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { Roles } from '../../../common/decorators/roles.decorator';

import { AttendanceService } from '../services/attendance.service';

import { CreateAttendanceDto } from '../dto/create-attendance.dto';

import { UpdateAttendanceDto } from '../dto/update-attendance.dto';

import { BulkUpsertAttendanceDto } from '../dto/bulk-upsert-attendance.dto';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ============================================================
  // CREAR
  // ============================================================

  @Post()
  create(
    @Body()
    dto: CreateAttendanceDto,
  ) {
    return this.attendanceService.create(dto);
  }

  // ============================================================
  // GUARDAR VARIOS
  // ============================================================

  @Post('bulk-upsert')
  bulkUpsert(
    @Body()
    dto: BulkUpsertAttendanceDto,
  ) {
    return this.attendanceService.bulkUpsert(dto);
  }

  // ============================================================
  // CONSULTAR POR MES
  // ============================================================

  @Get('month')
  findByMonth(
    @Query('year', ParseIntPipe)
    year: number,

    @Query('month', ParseIntPipe)
    month: number,

    @Query('warehouseId')
    warehouseId?: string,
  ) {
    return this.attendanceService.findByMonth(
      year,
      month,

      warehouseId ? Number(warehouseId) : undefined,
    );
  }

  // ============================================================
  // LISTAR
  // ============================================================

  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  // ============================================================
  // BUSCAR
  // ============================================================

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.attendanceService.findOne(id);
  }

  // ============================================================
  // EDITAR
  // ============================================================

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, dto);
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.attendanceService.remove(id);
  }

  // ============================================================
  // EXPORTAR A CSV
  // ============================================================

  @Get('export/csv')
  exportToCsv(
    @Query('year', ParseIntPipe) year?: number,
    @Query('month', ParseIntPipe) month?: number,
    @Query('warehouseId', ParseIntPipe) warehouseId?: number,
  ) {
    return this.attendanceService.exportToCsv(year, month, warehouseId);
  }
}
