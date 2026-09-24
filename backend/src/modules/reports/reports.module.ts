import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportsController } from './controllers/reports.controller';

import { ReportsService } from './services/reports.service';

import { ReportsExportService } from './services/reports-export.service';

import { RemissionGuideDetail } from '../remission-guides/entities/remission-guide-detail.entity';

import { User } from '../users/entities/user.entity';

import { Warehouse } from '../warehouses/entities/warehouse.entity';

import { SettingsModule } from '../settings/setting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RemissionGuideDetail, User, Warehouse]),
    SettingsModule,
  ],

  controllers: [ReportsController],

  providers: [ReportsService, ReportsExportService],

  exports: [ReportsService, ReportsExportService],
})
export class ReportsModule {}
