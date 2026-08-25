import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { RequestsController } from './controllers/requests.controller';

import { RequestsService } from './services/requests.service';

import { RequestExportService } from './services/request-export.service';

import { Request } from './entities/request.entity';

import { RequestDetail } from './entities/request-detail.entity';

import { RequestDispatch } from './entities/request-dispatch.entity';

import { RequestDispatchDetail } from './entities/request-dispatch.detail.entity';

import { Product } from '../products/entities/product.entity';

import { Warehouse } from '../warehouses/entities/warehouse.entity';

import { User } from '../users/entities/user.entity';

import { StockMovementsModule } from '../stock-movements/stock-movements.module';

import { SettingsModule } from '../settings/setting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Request,
      RequestDetail,
      RequestDispatch,
      RequestDispatchDetail,
      Product,
      Warehouse,
      User,
    ]),

    StockMovementsModule,

    SettingsModule,
  ],

  controllers: [RequestsController],

  providers: [RequestsService, RequestExportService],

  exports: [RequestsService, RequestExportService],
})
export class RequestsModule {}
