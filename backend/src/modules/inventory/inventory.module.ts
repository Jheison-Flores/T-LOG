import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryController } from './controllers/inventory.controller';

import { InventoryService } from './services/inventory.service';

import { Inventory } from './entities/inventory.entity';

import { Product } from '../products/entities/product.entity';

import { Warehouse } from '../warehouses/entities/warehouse.entity';

import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Product, Warehouse, User])],

  controllers: [InventoryController],

  providers: [InventoryService],

  exports: [InventoryService],
})
export class InventoryModule {}
