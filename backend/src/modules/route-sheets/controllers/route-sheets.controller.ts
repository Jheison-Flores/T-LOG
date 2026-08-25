import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Request as ExpressRequest, Response } from 'express';

import { RouteSheetsService } from '../services/route-sheets.service';

import { RouteSheetExportService } from '../services/route-sheet-export.service';

import { CreateRouteSheetDto } from '../dto/create-route-sheet.dto';

import { RouteSheet } from '../entities/route-sheet.entity';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { Roles } from '../../../common/decorators/roles.decorator';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
  };
}

@Controller('route-sheets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'LOGISTICS')
export class RouteSheetsController {
  constructor(
    private readonly routeSheetsService: RouteSheetsService,

    private readonly routeSheetExportService: RouteSheetExportService,
  ) {}

  // ============================================================
  // CREAR
  // ============================================================

  @Post()
  create(
    @Req()
    req: RequestWithUser,

    @Body()
    dto: CreateRouteSheetDto,
  ): Promise<RouteSheet> {
    return this.routeSheetsService.create(dto, req.user.id);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  @Get()
  findAll(
    @Req()
    req: RequestWithUser,
  ): Promise<RouteSheet[]> {
    return this.routeSheetsService.findAll(req.user.id);
  }

  // ============================================================
  // PDF
  //
  // IMPORTANTE:
  // ANTES DE @Get(':id')
  // ============================================================

  @Get(':id/export/pdf')
  async exportPdf(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,

    @Res()
    response: Response,
  ): Promise<void> {
    const routeSheet = await this.routeSheetsService.findOne(id, req.user.id);

    const buffer = await this.routeSheetExportService.generatePdf(
      id,
      req.user.id,
    );

    response.set({
      'Content-Type': 'application/pdf',

      'Content-Disposition': `attachment; filename="${routeSheet.routeSheetNumber}.pdf"`,

      'Content-Length': buffer.length,
    });

    response.end(buffer);
  }

  // ============================================================
  // EXCEL
  // ============================================================

  @Get(':id/export/excel')
  async exportExcel(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,

    @Res()
    response: Response,
  ): Promise<void> {
    const routeSheet = await this.routeSheetsService.findOne(id, req.user.id);

    const buffer = await this.routeSheetExportService.generateExcel(
      id,
      req.user.id,
    );

    response.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

      'Content-Disposition': `attachment; filename="${routeSheet.routeSheetNumber}.xlsx"`,

      'Content-Length': buffer.length,
    });

    response.end(buffer);
  }

  // ============================================================
  // OBTENER UNA
  // ============================================================

  @Get(':id')
  findOne(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<RouteSheet> {
    return this.routeSheetsService.findOne(id, req.user.id);
  }
}
