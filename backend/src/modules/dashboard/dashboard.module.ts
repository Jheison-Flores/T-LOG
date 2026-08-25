import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardService } from './service/dashboard.service';

import { DashboardController } from './controller/dashboard.controller';

import { Product } from '../products/entities/product.entity';

import { Warehouse } from '../warehouses/entities/warehouse.entity';

import { Inventory } from '../inventory/entities/inventory.entity';

import { Purchase } from '../purchases/entities/purchase.entity';

import { Request } from '../requests/entities/request.entity';

import { StockMovement } from '../stock-movements/entities/stock-movement.entity';

import { User } from '../users/entities/user.entity';

import { RemissionGuide } from '../remission-guides/entities/remission-guide.entity';

import { RouteSheet } from '../route-sheets/entities/route-sheet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,

      Warehouse,

      Inventory,

      Purchase,

      Request,

      StockMovement,

      User,

      RemissionGuide,

      RouteSheet,
    ]),
  ],

  controllers: [DashboardController],

  providers: [DashboardService],

  exports: [DashboardService],
})
export class DashboardModule {}
