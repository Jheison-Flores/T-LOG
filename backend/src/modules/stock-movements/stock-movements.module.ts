import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StockMovementsController } from './controllers/stock-movements.controller';
import { StockMovementsService } from './services/stock.movements.service';
import { StockMovement } from './entities/stock-movement.entity';

import { Product } from '../products/entities/product.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { User } from '../users/entities/user.entity';

import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockMovement, Product, Warehouse, User]),
    InventoryModule, // Para que reconozca el InventoryService
  ],
  controllers: [StockMovementsController],
  providers: [StockMovementsService],
  exports: [StockMovementsService],
})
export class StockMovementsModule {}
