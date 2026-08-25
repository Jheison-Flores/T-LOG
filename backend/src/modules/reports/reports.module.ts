import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportsController } from './controllers/reports.controller';

import { ReportsService } from './services/reports.service';

import { RemissionGuideDetail } from '../remission-guides/entities/remission-guide-detail.entity';

import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RemissionGuideDetail, User])],

  controllers: [ReportsController],

  providers: [ReportsService],

  exports: [ReportsService],
})
export class ReportsModule {}
