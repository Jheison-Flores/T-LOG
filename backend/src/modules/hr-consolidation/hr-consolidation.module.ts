import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';

import { MineTimesheet } from '../mine-timesheets/entities/mine-timesheet.entity';

import { HrConsolidationController } from './controllers/hr-consolidation.controller';

import { HrConsolidationService } from './services/hr-consolidation.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecord, MineTimesheet])],

  controllers: [HrConsolidationController],

  providers: [HrConsolidationService],

  exports: [HrConsolidationService],
})
export class HrConsolidationModule {}
