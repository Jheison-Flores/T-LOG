import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';

import type { Request as ExpressRequest, Response } from 'express';

import {
  MaterialDispatchFilterOptions,
  MaterialDispatchReport,
  ReportsService,
} from '../services/reports.service';

import { ReportsExportService } from '../services/reports-export.service';

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
  constructor(
    private readonly reportsService: ReportsService,
    private readonly reportsExportService: ReportsExportService,
  ) {}

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
  // EXPORTAR EXCEL DE MATERIALES ENVIADOS (FORMATO MATRIZ)
  // ============================================================

  @Get('material-dispatch/export/excel')
  async exportMaterialDispatchExcel(
    @Req()
    req: RequestWithUser,

    @Query()
    filter: ReportFilterDto,

    @Res()
    res: Response,
  ): Promise<void> {
    const buffer =
      await this.reportsExportService.generateMaterialDispatchExcel(
        req.user.id,
        filter,
      );

    const filename = await this.reportsExportService.getExportFileName(
      req.user.id,
      filter,
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

      'Content-Disposition': `attachment; filename="${filename}"`,

      'Content-Length': buffer.length,
    });

    res.end(buffer);
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
