import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SystemSettings } from '../entities/system-settings.entity';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { UpdateSettingsDto } from '../dto/update.settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SystemSettings)
    private readonly settingsRepository: Repository<SystemSettings>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  // ============================================================
  // CONFIGURACIÓN POR DEFECTO
  // ============================================================

  private createDefaultSettings(): SystemSettings {
    return this.settingsRepository.create({
      companyName: 'Teincomin',

      requestPrefix: 'REQ',

      dispatchPrefix: 'DSP',

      purchasePrefix: 'COM',

      systemName: 'T-LOG',

      currency: 'PEN',

      timezone: 'America/Lima',

      centralWarehouse: null,
    });
  }

  // ============================================================
  // OBTENER CONFIGURACIÓN
  //
  // Solo debe existir un registro.
  // Si todavía no existe, lo creamos automáticamente.
  // ============================================================

  async getSettings(): Promise<SystemSettings> {
    let settings = await this.settingsRepository.findOne({
      where: {},
      order: {
        id: 'ASC',
      },
      relations: {
        centralWarehouse: true,
      },
    });

    if (!settings) {
      settings = this.createDefaultSettings();

      await this.settingsRepository.save(settings);

      settings = await this.settingsRepository.findOne({
        where: {
          id: settings.id,
        },
        relations: {
          centralWarehouse: true,
        },
      });
    }

    if (!settings) {
      throw new NotFoundException(
        'No se pudo crear la configuración del sistema.',
      );
    }

    return settings;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(dto: UpdateSettingsDto): Promise<SystemSettings> {
    const settings = await this.getSettings();

    // ==========================================================
    // EMPRESA
    // ==========================================================

    if (dto.companyName !== undefined) {
      const companyName = dto.companyName.trim();

      if (!companyName) {
        throw new BadRequestException(
          'El nombre de la empresa es obligatorio.',
        );
      }

      settings.companyName = companyName;
    }

    if (dto.ruc !== undefined) {
      settings.ruc = dto.ruc.trim() || undefined;
    }

    if (dto.companyAddress !== undefined) {
      settings.companyAddress = dto.companyAddress.trim() || undefined;
    }

    if (dto.companyPhone !== undefined) {
      settings.companyPhone = dto.companyPhone.trim() || undefined;
    }

    if (dto.companyEmail !== undefined) {
      settings.companyEmail = dto.companyEmail.trim() || undefined;
    }

    // ==========================================================
    // ALMACÉN CENTRAL
    // ==========================================================

    if (dto.centralWarehouseId !== undefined) {
      if (dto.centralWarehouseId === null) {
        settings.centralWarehouse = null;
      } else {
        const warehouse = await this.warehouseRepository.findOne({
          where: {
            id: dto.centralWarehouseId,
          },
        });

        if (!warehouse) {
          throw new NotFoundException('El almacén seleccionado no existe.');
        }

        if (!warehouse.isActive) {
          throw new BadRequestException(
            'El almacén seleccionado está inactivo.',
          );
        }

        settings.centralWarehouse = warehouse;
      }
    }

    // ==========================================================
    // PREFIJOS
    // ==========================================================

    if (dto.requestPrefix !== undefined) {
      settings.requestPrefix = this.normalizePrefix(
        dto.requestPrefix,
        'solicitudes',
      );
    }

    if (dto.dispatchPrefix !== undefined) {
      settings.dispatchPrefix = this.normalizePrefix(
        dto.dispatchPrefix,
        'despachos',
      );
    }

    if (dto.purchasePrefix !== undefined) {
      settings.purchasePrefix = this.normalizePrefix(
        dto.purchasePrefix,
        'compras',
      );
    }

    // ==========================================================
    // SISTEMA
    // ==========================================================

    if (dto.systemName !== undefined) {
      const systemName = dto.systemName.trim();

      if (!systemName) {
        throw new BadRequestException(
          'El nombre del sistema no puede estar vacío.',
        );
      }

      settings.systemName = systemName;
    }

    if (dto.currency !== undefined) {
      const currency = dto.currency.trim().toUpperCase();

      if (!currency) {
        throw new BadRequestException('La moneda no puede estar vacía.');
      }

      settings.currency = currency;
    }

    if (dto.timezone !== undefined) {
      const timezone = dto.timezone.trim();

      if (!timezone) {
        throw new BadRequestException('La zona horaria no puede estar vacía.');
      }

      settings.timezone = timezone;
    }

    await this.settingsRepository.save(settings);

    return this.getSettings();
  }

  // ============================================================
  // NORMALIZAR PREFIJO
  // ============================================================

  private normalizePrefix(value: string, label: string): string {
    const prefix = value.trim().toUpperCase().replace(/\s+/g, '');

    if (!prefix) {
      throw new BadRequestException(
        `El prefijo de ${label} no puede estar vacío.`,
      );
    }

    if (!/^[A-Z0-9-]+$/.test(prefix)) {
      throw new BadRequestException(
        `El prefijo de ${label} solo puede contener letras, números y guiones.`,
      );
    }

    return prefix;
  }
}
