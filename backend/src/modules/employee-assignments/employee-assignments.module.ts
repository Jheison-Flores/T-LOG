import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { EmployeeAssignment } from './entities/employee-assignment.entity';

import { Employee } from '../employees/entities/employee.entity';

import { Position } from '../positions/entities/position.entity';

import { Warehouse } from '../warehouses/entities/warehouse.entity';

import { EmployeeAssignmentsController } from './controllers/employee-assignments.controller';

import { EmployeeAssignmentsService } from './services/employee-assignments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeAssignment,
      Employee,
      Position,
      Warehouse,
    ]),
  ],

  controllers: [EmployeeAssignmentsController],

  providers: [EmployeeAssignmentsService],

  exports: [EmployeeAssignmentsService],
})
export class EmployeeAssignmentsModule {}
