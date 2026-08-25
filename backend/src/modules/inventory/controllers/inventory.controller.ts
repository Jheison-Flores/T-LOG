import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';

import { Request as ExpressRequest } from 'express';

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
