import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { SettingsService } from '../services/settings.services';

import { UpdateSettingsDto } from '../dto/update.settings.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../../common/guards/roles.guard';

import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ============================================================
  // OBTENER CONFIGURACIÓN
  // ============================================================

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  // ============================================================
  // ACTUALIZAR CONFIGURACIÓN
  // ============================================================

  @Patch()
  update(
    @Body()
    dto: UpdateSettingsDto,
  ) {
    return this.settingsService.update(dto);
  }
}
