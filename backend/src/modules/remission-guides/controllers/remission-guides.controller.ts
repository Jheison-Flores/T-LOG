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

import { RemissionGuidesService } from '../services/remission-guides.service';

import { RemissionGuideExportService } from '../services/remission-guide-export.service';

import { CreateRemissionGuideDto } from '../dto/create-remission-guide.dto';

import { RemissionGuide } from '../entities/remission-guide.entity';

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

@Controller('remission-guides')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'LOGISTICS')
export class RemissionGuidesController {
  constructor(
    private readonly remissionGuidesService: RemissionGuidesService,

    private readonly remissionGuideExportService: RemissionGuideExportService,
  ) {}

  // ============================================================
  // CREAR
  // ============================================================

  @Post()
  create(
    @Req()
    req: RequestWithUser,

    @Body()
    dto: CreateRemissionGuideDto,
  ): Promise<RemissionGuide> {
    return this.remissionGuidesService.create(dto, req.user.id);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  @Get()
  findAll(
    @Req()
    req: RequestWithUser,
  ): Promise<RemissionGuide[]> {
    return this.remissionGuidesService.findAll(req.user.id);
  }

  // ============================================================
  // PDF
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
    const guide = await this.remissionGuidesService.findOne(id, req.user.id);

    const buffer = await this.remissionGuideExportService.generatePdf(
      id,
      req.user.id,
    );

    response.set({
      'Content-Type': 'application/pdf',

      'Content-Disposition': `attachment; filename="GR-${guide.fullNumber}.pdf"`,

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
    const guide = await this.remissionGuidesService.findOne(id, req.user.id);

    const buffer = await this.remissionGuideExportService.generateExcel(
      id,
      req.user.id,
    );

    response.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

      'Content-Disposition': `attachment; filename="GR-${guide.fullNumber}.xlsx"`,

      'Content-Length': buffer.length,
    });

    response.end(buffer);
  }

  // ============================================================
  // OBTENER
  // ============================================================

  @Get(':id')
  findOne(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<RemissionGuide> {
    return this.remissionGuidesService.findOne(id, req.user.id);
  }
}
