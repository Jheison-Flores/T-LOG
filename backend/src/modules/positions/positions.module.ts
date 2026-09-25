import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Position } from './entities/position.entity';

import { PositionsController } from './controllers/positions.controller';

import { PositionsService } from './services/positions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Position])],

  controllers: [PositionsController],

  providers: [PositionsService],

  exports: [PositionsService, TypeOrmModule],
})
export class PositionsModule {}
