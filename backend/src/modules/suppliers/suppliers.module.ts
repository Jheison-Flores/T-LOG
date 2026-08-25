import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Supplier } from './entities/supplier.entity';

import { Warehouse } from '../warehouses/entities/warehouse.entity';

import { User } from '../users/entities/user.entity';

import { SuppliersController } from './controllers/suppliers.controller';

import { SuppliersService } from './services/suppliers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, Warehouse, User])],

  controllers: [SuppliersController],

  providers: [SuppliersService],

  exports: [SuppliersService],
})
export class SuppliersModule {}
