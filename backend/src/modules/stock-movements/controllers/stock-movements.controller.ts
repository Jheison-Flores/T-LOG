import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';

import { Request as ExpressRequest } from 'express';
import type { Response } from 'express';

import { StockMovementsService } from '../services/stock.movements.service';
import { StockMovementExportService } from '../services/stock-movement-export.service';

import { CreateStockMovementDto } from '../dto/create-stock-movement.dto';

import { CreateBatchStockMovementDto } from '../dto/create-batch-stock-movement.dto';

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

@Controller('stock-movements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockMovementsController {
  constructor(
    private readonly stockMovementsService: StockMovementsService,
    private readonly stockMovementExportService: StockMovementExportService,
  ) {}

  // ============================================================
  // CREAR MOVIMIENTO INDIVIDUAL
  //
  // Se mantiene por compatibilidad con Compras, Guías y otros
  // procesos internos que registran un producto por movimiento.
  // ============================================================

  @Post()
  @Roles('ADMIN', 'LOGISTICS')
  create(
    @Req()
    req: RequestWithUser,

    @Body()
    dto: CreateStockMovementDto,
  ) {
    return this.stockMovementsService.processMovement(dto, req.user.id);
  }

  // ============================================================
  // CREAR MOVIMIENTO MÚLTIPLE
  //
  // Registra varios productos dentro de UNA sola transacción.
  // Si un producto falla, se revierten todos los movimientos.
  // ============================================================

  @Post('batch')
  @Roles('ADMIN', 'LOGISTICS')
  createBatch(
    @Req()
    req: RequestWithUser,

    @Body()
    dto: CreateBatchStockMovementDto,
  ) {
    return this.stockMovementsService.processBatchMovement(dto, req.user.id);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  @Get()
  @Roles('ADMIN', 'LOGISTICS')
  findAll(
    @Req()
    req: RequestWithUser,
  ) {
    return this.stockMovementsService.findAll(req.user.id);
  }

  @Get('export/vouchers')
  @Roles('ADMIN', 'LOGISTICS')
  async exportVouchers(
    @Req() req: RequestWithUser,
    @Query('from') fromDate: string,
    @Query('to') toDate: string,
    @Query('warehouseId') warehouseId: string | undefined,
    @Query('movementType') movementType: string | undefined,
    @Query('format') format: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const selectedFormat = format ?? 'pdf';
    if (selectedFormat !== 'pdf' && selectedFormat !== 'xlsx') {
      throw new BadRequestException('El formato de descarga debe ser PDF o Excel.');
    }
    const buffer = selectedFormat === 'xlsx'
      ? await this.stockMovementExportService.generateRangeExcel(fromDate, toDate, warehouseId, movementType, req.user.id)
      : await this.stockMovementExportService.generateRangePdf(fromDate, toDate, warehouseId, movementType, req.user.id);

    response.set({
      'Content-Type': selectedFormat === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf',
      'Content-Disposition': `attachment; filename="${this.stockMovementExportService.getRangeDownloadFilename(fromDate, toDate, selectedFormat)}"`,
      'Content-Length': buffer.length,
    });
    response.end(buffer);
  }

  @Get('export/vouchers/pdf')
  @Roles('ADMIN', 'LOGISTICS')
  async exportMonthlyVouchers(
    @Req() req: RequestWithUser,
    @Query('month') month: string,
    @Res() response: Response,
  ): Promise<void> {
    const buffer = await this.stockMovementExportService.generateMonthlyPdf(month, req.user.id);
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${this.stockMovementExportService.getMonthlyDownloadFilename(month)}"`,
      'Content-Length': buffer.length,
    });
    response.end(buffer);
  }

  // ============================================================
  // OBTENER UNO
  // ============================================================

  @Get(':id')
  @Roles('ADMIN', 'LOGISTICS')
  findOne(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.stockMovementsService.findOne(id, req.user.id);
  }

  @Get(':id/export/pdf')
  @Roles('ADMIN', 'LOGISTICS')
  async exportPdf(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ): Promise<void> {
    const movement = await this.stockMovementsService.findOne(id, req.user.id);
    const buffer = await this.stockMovementExportService.generatePdf(id, req.user.id);

    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${this.stockMovementExportService.getDownloadFilename(movement)}"`,
      'Content-Length': buffer.length,
    });
    response.end(buffer);
  }
}
