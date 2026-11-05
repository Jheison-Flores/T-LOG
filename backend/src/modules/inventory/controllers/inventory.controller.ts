import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';

import { Request as ExpressRequest } from 'express';
import type { Response } from 'express';

import { InventoryService } from '../services/inventory.service';

import { InventorySearchDto } from '../dto/inventory-search.dto';

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

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ============================================================
  // LISTAR INVENTARIO
  // ============================================================

  @Get()
  @Roles('ADMIN', 'LOGISTICS')
  findAll(
    @Req()
    req: RequestWithUser,

    @Query()
    search: InventorySearchDto,
  ) {
    return this.inventoryService.findAll(search, req.user.id);
  }

  @Get('export')
  @Roles('ADMIN', 'LOGISTICS')
  async exportExcel(
    @Req() req: RequestWithUser,
    @Query() search: InventorySearchDto,
    @Res() response: Response,
  ): Promise<void> {
    const buffer = await this.inventoryService.generateExcel(search, req.user.id);
    response.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="INVENTARIO.xlsx"',
      'Content-Length': buffer.length,
    });
    response.end(buffer);
  }

  // ============================================================
  // STOCK TOTAL DE PRODUCTO
  //
  // IMPORTANTE:
  // Esta ruta debe ir ANTES de @Get(':id')
  // ============================================================

  @Get('product/:productId/stock')
  @Roles('ADMIN', 'LOGISTICS')
  getTotalStockByProduct(
    @Req()
    req: RequestWithUser,

    @Param('productId', ParseIntPipe)
    productId: number,
  ) {
    return this.inventoryService.getTotalStockByProduct(productId, req.user.id);
  }

  // ============================================================
  // STOCK TOTAL DE ALMACÉN
  // ============================================================

  @Get('warehouse/:warehouseId/stock')
  @Roles('ADMIN', 'LOGISTICS')
  getTotalStockByWarehouse(
    @Req()
    req: RequestWithUser,

    @Param('warehouseId', ParseIntPipe)
    warehouseId: number,
  ) {
    return this.inventoryService.getTotalStockByWarehouse(
      warehouseId,
      req.user.id,
    );
  }

  // ============================================================
  // OBTENER INVENTARIO POR ID
  //
  // Debe estar DESPUÉS de las rutas específicas.
  // ============================================================

  @Get(':id')
  @Roles('ADMIN', 'LOGISTICS')
  findOne(
    @Req()
    req: RequestWithUser,

    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.inventoryService.findOne(id, req.user.id);
  }
}
