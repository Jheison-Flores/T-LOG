import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

import type { Request as ExpressRequest } from 'express';

import {
  MaterialDispatchFilterOptions,
  MaterialDispatchReport,
  ReportsService,
} from '../services/reports.service';

import { ReportFilterDto } from '../dto/report-filter.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { Roles } from '../../../common/decorators/roles.decorator';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;

    email?: string;

    role?: string;
  };
}

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'LOGISTICS')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ============================================================
  // OPCIONES DE FILTRO
  //
  // IMPORTANTE:
  // Debe ir antes de rutas dinámicas si más adelante se agregan.
  // ============================================================

  @Get('material-dispatch/filters')
  getMaterialDispatchFilterOptions(
    @Req()
    req: RequestWithUser,
  ): Promise<MaterialDispatchFilterOptions> {
    return this.reportsService.getMaterialDispatchFilterOptions(req.user.id);
  }

  // ============================================================
  // REPORTE DE VALOR DE MATERIALES ENVIADOS
  // ============================================================

  @Get('material-dispatch')
  getMaterialDispatchReport(
    @Req()
    req: RequestWithUser,

    @Query()
    filter: ReportFilterDto,
  ): Promise<MaterialDispatchReport> {
    return this.reportsService.getMaterialDispatchReport(req.user.id, filter);
  }
}
