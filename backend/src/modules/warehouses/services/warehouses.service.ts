import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Warehouse } from '../entities/warehouse.entity';

import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  // ==========================================================
  // Crear almacén
  // ==========================================================

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    const exists = await this.warehouseRepository.findOne({
      where: [
        {
          code: createWarehouseDto.code,
        },
        {
          name: createWarehouseDto.name,
        },
      ],
    });

    if (exists) {
      throw new ConflictException(
        'Ya existe un almacén con ese código o nombre.',
      );
    }

    const warehouse = this.warehouseRepository.create({
      code: createWarehouseDto.code.trim().toUpperCase(),

      name: createWarehouseDto.name.trim(),

      type: createWarehouseDto.type,

      city: createWarehouseDto.city?.trim(),

      address: createWarehouseDto.address?.trim(),

      manager: createWarehouseDto.manager?.trim(),

      phone: createWarehouseDto.phone?.trim(),

      email: createWarehouseDto.email?.trim().toLowerCase(),

      description: createWarehouseDto.description?.trim(),
    });

    return await this.warehouseRepository.save(warehouse);
  }

  // ==========================================================
  // Obtener todos
  // ==========================================================

  async findAll(): Promise<Warehouse[]> {
    return await this.warehouseRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // ==========================================================
  // Buscar por ID
  // ==========================================================

  async findOne(id: number): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: {
        id,
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Almacén no encontrado.');
    }

    return warehouse;
  }

  // ==========================================================
  // Actualizar
  // ==========================================================

  async update(
    id: number,
    updateWarehouseDto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    const warehouse = await this.findOne(id);

    if (updateWarehouseDto.code)
      warehouse.code = updateWarehouseDto.code.trim().toUpperCase();

    if (updateWarehouseDto.name)
      warehouse.name = updateWarehouseDto.name.trim();

    if (updateWarehouseDto.type) warehouse.type = updateWarehouseDto.type;

    if (updateWarehouseDto.city !== undefined)
      warehouse.city = updateWarehouseDto.city?.trim();

    if (updateWarehouseDto.address !== undefined)
      warehouse.address = updateWarehouseDto.address?.trim();

    if (updateWarehouseDto.manager !== undefined)
      warehouse.manager = updateWarehouseDto.manager?.trim();

    if (updateWarehouseDto.phone !== undefined)
      warehouse.phone = updateWarehouseDto.phone?.trim();

    if (updateWarehouseDto.email !== undefined)
      warehouse.email = updateWarehouseDto.email?.trim().toLowerCase();

    if (updateWarehouseDto.description !== undefined)
      warehouse.description = updateWarehouseDto.description?.trim();

    return await this.warehouseRepository.save(warehouse);
  }

  // ==========================================================
  // Desactivar
  // ==========================================================

  async deactivate(id: number): Promise<Warehouse> {
    const warehouse = await this.findOne(id);

    warehouse.isActive = false;

    return await this.warehouseRepository.save(warehouse);
  }

  // ==========================================================
  // Activar
  // ==========================================================

  async activate(id: number): Promise<Warehouse> {
    const warehouse = await this.findOne(id);

    warehouse.isActive = true;

    return await this.warehouseRepository.save(warehouse);
  }

  // ==========================================================
  // Eliminar
  // ==========================================================

  async remove(id: number): Promise<void> {
    const warehouse = await this.findOne(id);

    await this.warehouseRepository.remove(warehouse);
  }
}
