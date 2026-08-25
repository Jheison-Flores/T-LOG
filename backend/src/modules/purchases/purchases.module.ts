import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Purchase } from './entities/purchase.entity';

import { PurchaseDetail } from './entities/purchase-detail.entity';

import { Product } from '../products/entities/product.entity';

import { Supplier } from '../suppliers/entities/supplier.entity';

import { Warehouse } from '../warehouses/entities/warehouse.entity';

import { User } from '../users/entities/user.entity';

import { Request } from '../requests/entities/request.entity';

import { PurchasesController } from './controllers/purchases.controller';

import { PurchasesService } from './services/purchases.service';

import { PurchaseExportService } from './services/purchase-export.service';

import { StockMovementsModule } from '../stock-movements/stock-movements.module';

import { SettingsModule } from '../settings/setting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Purchase,
      PurchaseDetail,
      Product,
      Supplier,
      Warehouse,
      User,
      Request,
    ]),

    StockMovementsModule,

    SettingsModule,
  ],

  controllers: [PurchasesController],

  providers: [PurchasesService, PurchaseExportService],

  exports: [PurchasesService],
})
export class PurchasesModule {}
