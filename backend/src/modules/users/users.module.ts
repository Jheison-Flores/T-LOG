import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from '../roles/entities/role.entity';

import { Warehouse } from '../warehouses/entities/warehouse.entity';

import { User } from './entities/user.entity';

import { UsersController } from './Controllers/users.controller';

import { UsersService } from './services/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Warehouse])],

  controllers: [UsersController],

  providers: [UsersService],

  exports: [UsersService],
})
export class UsersModule {}
