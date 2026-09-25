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

import { Roles } from '../../../common/decorators/roles.decorator';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { BulkUpsertMineTimesheetDto } from '../dto/bulk-upsert-mine-timesheet.dto';

import { CreateMineTimesheetDto } from '../dto/create-mine-timesheet.dto';

import { UpdateMineTimesheetDto } from '../dto/update-mine-timesheet.dto';

import { MineTimesheetsService } from '../services/mine-timesheets.service';

@Controller('mine-timesheets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class MineTimesheetsController {
  constructor(private readonly mineTimesheetsService: MineTimesheetsService) {}

  // ============================================================
  // CREAR
  // ============================================================

  @Post()
  create(
    @Body()
    dto: CreateMineTimesheetDto,
  ) {
    return this.mineTimesheetsService.create(dto);
  }

  // ============================================================
  // GUARDAR VARIOS
  // ============================================================

  @Post('bulk-upsert')
  bulkUpsert(
    @Body()
    dto: BulkUpsertMineTimesheetDto,
  ) {
    return this.mineTimesheetsService.bulkUpsert(dto);
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
    return this.mineTimesheetsService.findByMonth(
      year,
      month,
      warehouseId ? Number(warehouseId) : undefined,
    );
  }

  // ============================================================
  // CONSULTAR POR TRABAJADOR
  // ============================================================

  @Get('employee/:employeeId')
  findByEmployee(
    @Param('employeeId', ParseIntPipe)
    employeeId: number,
  ) {
    return this.mineTimesheetsService.findByEmployee(employeeId);
  }

  // ============================================================
  // LISTAR TODO
  // ============================================================
  @Get()
  findAll() {
    return this.mineTimesheetsService.findAll();
  }

  // ============================================================
  // BUSCAR UNO
  // ============================================================
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.mineTimesheetsService.findOne(id);
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateMineTimesheetDto,
  ) {
    return this.mineTimesheetsService.update(id, dto);
  }

  // ============================================================
  // ELIMINAR
  // ============================================================
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.mineTimesheetsService.remove(id);
  }
}
