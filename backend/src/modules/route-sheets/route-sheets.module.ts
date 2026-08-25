import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { RouteSheet } from './entities/route-sheet.entity';

import { RouteSheetDetail } from './entities/route-sheet-detail.entity';

import { RemissionGuide } from '../remission-guides/entities/remission-guide.entity';

import { RemissionGuideDetail } from '../remission-guides/entities/remission-guide-detail.entity';

import { Request } from '../requests/entities/request.entity';

import { User } from '../users/entities/user.entity';

import { RouteSheetsController } from './controllers/route-sheets.controller';

import { RouteSheetsService } from './services/route-sheets.service';

import { RouteSheetExportService } from './services/route-sheet-export.service';

import { SettingsModule } from '../settings/setting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RouteSheet,
      RouteSheetDetail,
      RemissionGuide,
      RemissionGuideDetail,
      Request,
      User,
    ]),

    SettingsModule,
  ],

  controllers: [RouteSheetsController],

  providers: [RouteSheetsService, RouteSheetExportService],

  exports: [RouteSheetsService, RouteSheetExportService],
})
export class RouteSheetsModule {}
