import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { Roles } from '../../../common/decorators/roles.decorator';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { HrConsolidationService } from '../services/hr-consolidation.service';

@Controller('hr-consolidation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class HrConsolidationController {
  constructor(
    private readonly hrConsolidationService: HrConsolidationService,
  ) {}

  // ============================================================
  // CONSOLIDADO MENSUAL
  // ============================================================

  @Get('monthly')
  getMonthly(
    @Query('year', ParseIntPipe)
    year: number,

    @Query('month', ParseIntPipe)
    month: number,

    @Query('warehouseId')
    warehouseId?: string,

    @Query('companyId')
    companyId?: string,
  ) {
    return this.hrConsolidationService.getMonthlyConsolidation(
      year,
      month,

      warehouseId ? Number(warehouseId) : undefined,

      companyId ? Number(companyId) : undefined,
    );
  }
}
