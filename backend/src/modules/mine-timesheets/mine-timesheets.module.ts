import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Employee } from '../employees/entities/employee.entity';

import { Warehouse } from '../warehouses/entities/warehouse.entity';

import { MineTimesheetsController } from './controllers/mine-timesheets.controller';

import { MineTimesheet } from './entities/mine-timesheet.entity';

import { MineTimesheetsService } from './services/mine-timesheets.service';

@Module({
  imports: [TypeOrmModule.forFeature([MineTimesheet, Employee, Warehouse])],

  controllers: [MineTimesheetsController],

  providers: [MineTimesheetsService],

  exports: [MineTimesheetsService],
})
export class MineTimesheetsModule {}
