import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { AttendanceRecord } from './entities/attendance-record.entity';

import { Employee } from '../employees/entities/employee.entity';

import { Warehouse } from '../warehouses/entities/warehouse.entity';

import { AttendanceController } from './controllers/attendance.controller';

import { AttendanceService } from './services/attendance.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecord, Employee, Warehouse])],

  controllers: [AttendanceController],

  providers: [AttendanceService],

  exports: [AttendanceService],
})
export class AttendanceModule {}
