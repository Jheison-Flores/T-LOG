import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { RemissionGuide } from './entities/remission-guide.entity';

import { RemissionGuideDetail } from './entities/remission-guide-detail.entity';

import { Request } from '../requests/entities/request.entity';

import { RequestDetail } from '../requests/entities/request-detail.entity';

import { Warehouse } from '../warehouses/entities/warehouse.entity';

import { User } from '../users/entities/user.entity';

import { RemissionGuidesController } from './controllers/remission-guides.controller';

import { RemissionGuidesService } from './services/remission-guides.service';

import { RemissionGuideExportService } from './services/remission-guide-export.service';

import { StockMovementsModule } from '../stock-movements/stock-movements.module';

import { SettingsModule } from '../settings/setting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RemissionGuide,
      RemissionGuideDetail,
      Request,
      RequestDetail,
      Warehouse,
      User,
    ]),

    StockMovementsModule,

    SettingsModule,
  ],

  controllers: [RemissionGuidesController],

  providers: [RemissionGuidesService, RemissionGuideExportService],

  exports: [RemissionGuidesService, RemissionGuideExportService],
})
export class RemissionGuidesModule {}
