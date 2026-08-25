import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Request as ExpressRequest, Response } from 'express';

import { RequestsService } from '../services/requests.service';

import { RequestExportService } from '../services/request-export.service';

import { CreateRequestDto } from '../dto/create-request.dto';

import { ApproveRequestDto } from '../dto/approve-request.dto';

import { RejectRequestDto } from '../dto/reject-request.dto';

import { DeliverRequestDto } from '../dto/deliver-request.dto';

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

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'LOGISTICS')
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,

    private readonly requestExportService: RequestExportService,
  ) {}

  // ============================================================
  // CREAR REQUERIMIENTO
  // ============================================================

  @Post()
  create(
    @Req()
    req: RequestWithUser,

    @Body()
    dto: CreateRequestDto,
  ) {
    return this.requestsService.create(dto, req.user.id);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  @Get()
  findAll(
    @Req()
    req: RequestWithUser,
  ) {
    return this.requestsService.findAll(req.user.id);
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
  ) {
    const request = await this.requestsService.findOne(id, req.user.id);

    const buffer = await this.requestExportService.generatePdf(id, req.user.id);

    response.set({
      'Content-Type': 'application/pdf',

      'Content-Disposition': `attachment; filename="${request.requestNumber}.pdf"`,

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
  ) {
    const request = await this.requestsService.findOne(id, req.user.id);

    const buffer = await this.requestExportService.generateExcel(
      id,
      req.user.id,
    );

    response.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

      'Content-Disposition': `attachment; filename="${request.requestNumber}.xlsx"`,

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
  ) {
    return this.requestsService.findOne(id, req.user.id);
  }

  // ============================================================
  // APROBAR
  // ============================================================

  @Patch(':id/approve')
  @Roles('ADMIN')
  approve(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: ApproveRequestDto,
  ) {
    return this.requestsService.approve(id, dto, req.user.id);
  }

  // ============================================================
  // RECHAZAR
  // ============================================================

  @Patch(':id/reject')
  @Roles('ADMIN')
  reject(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: RejectRequestDto,
  ) {
    return this.requestsService.reject(id, dto, req.user.id);
  }

  // ============================================================
  // DESPACHAR
  // ============================================================

  @Patch(':id/deliver')
  @Roles('ADMIN', 'LOGISTICS')
  deliver(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: DeliverRequestDto,
  ) {
    return this.requestsService.deliver(id, dto, req.user.id);
  }
}
