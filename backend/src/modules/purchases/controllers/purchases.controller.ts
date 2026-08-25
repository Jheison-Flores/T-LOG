import {
  Body,
  Controller,
  Delete,
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

import { PurchasesService } from '../services/purchases.service';

import { PurchaseExportService } from '../services/purchase-export.service';

import { CreatePurchaseDto } from '../dto/create-purchase.dto';

import { UpdatePurchaseDto } from '../dto/update-purchase.dto';

import { ReceivePurchaseDto } from '../dto/receive-purchase.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { Roles } from '../../../common/decorators/roles.decorator';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: number;
  };
}

@Controller('purchases')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'LOGISTICS')
export class PurchasesController {
  constructor(
    private readonly purchasesService: PurchasesService,

    private readonly purchaseExportService: PurchaseExportService,
  ) {}

  // ============================================================
  // CREAR
  // ============================================================

  @Post()
  create(
    @Req()
    req: RequestWithUser,

    @Body()
    dto: CreatePurchaseDto,
  ) {
    return this.purchasesService.create(dto, req.user.id);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  @Get()
  findAll(
    @Req()
    req: RequestWithUser,
  ) {
    return this.purchasesService.findAll(req.user.id);
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
    // Validamos primero que tenga acceso.
    const purchase = await this.purchasesService.findOne(id, req.user.id);

    const buffer = await this.purchaseExportService.generatePdf(purchase.id);

    response.set({
      'Content-Type': 'application/pdf',

      'Content-Disposition': `attachment; filename="OC-${purchase.purchaseOrderNumber}.pdf"`,

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
    const purchase = await this.purchasesService.findOne(id, req.user.id);

    const buffer = await this.purchaseExportService.generateExcel(purchase.id);

    response.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

      'Content-Disposition': `attachment; filename="OC-${purchase.purchaseOrderNumber}.xlsx"`,

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
    return this.purchasesService.findOne(id, req.user.id);
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  @Patch(':id')
  update(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdatePurchaseDto,
  ) {
    return this.purchasesService.update(id, dto, req.user.id);
  }

  // ============================================================
  // RECEPCIONAR
  // ============================================================

  @Post(':id/receive')
  receive(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: ReceivePurchaseDto,
  ) {
    return this.purchasesService.receive(id, dto, req.user.id);
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  @Delete(':id')
  remove(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.purchasesService.remove(id, req.user.id);
  }
}
