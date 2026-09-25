import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Employee } from './entities/employee.entity';

import { Company } from '../companies/entities/company.entity';

import { EmployeesController } from './controllers/employees.controller';

import { EmployeesService } from './services/employees.service';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Company])],

  controllers: [EmployeesController],

  providers: [EmployeesService],

  exports: [EmployeesService, TypeOrmModule],
})
export class EmployeesModule {}
