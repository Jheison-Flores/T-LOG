import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { SystemSettings } from './entities/system-settings.entity';

import { Warehouse } from '../warehouses/entities/warehouse.entity';

import { SettingsService } from './services/settings.services';

import { SettingsController } from './controllers/setting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SystemSettings, Warehouse])],

  controllers: [SettingsController],

  providers: [SettingsService],

  exports: [SettingsService],
})
export class SettingsModule {}
