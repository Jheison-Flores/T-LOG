import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Not, Repository } from 'typeorm';

import { Position } from '../entities/position.entity';

import { CreatePositionDto } from '../dto/create-position.dto';

import { UpdatePositionDto } from '../dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
  ) {}

  // ============================================================
  // CREAR
  // ============================================================

  async create(createPositionDto: CreatePositionDto): Promise<Position> {
    const name = createPositionDto.name.trim();

    // ==========================================================
    // VALIDAR NOMBRE DUPLICADO
    // ==========================================================

    const existing = await this.positionRepository.findOne({
      where: {
        name,
      },
    });

    if (existing) {
      throw new ConflictException('Ya existe un cargo con ese nombre.');
    }

    // ==========================================================
    // CREAR
    // ==========================================================

    const position = this.positionRepository.create({
      name,

      area: createPositionDto.area?.trim() || undefined,

      description: createPositionDto.description?.trim() || undefined,
    });

    return this.positionRepository.save(position);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  async findAll(): Promise<Position[]> {
    return this.positionRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  // ============================================================
  // BUSCAR POR ID
  // ============================================================

  async findOne(id: number): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: {
        id,
      },
    });

    if (!position) {
      throw new NotFoundException('Cargo no encontrado.');
    }

    return position;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(
    id: number,
    updatePositionDto: UpdatePositionDto,
  ): Promise<Position> {
    const position = await this.findOne(id);

    // ==========================================================
    // NOMBRE
    // ==========================================================

    if (updatePositionDto.name !== undefined) {
      const name = updatePositionDto.name.trim();

      const existing = await this.positionRepository.findOne({
        where: {
          name,
          id: Not(id),
        },
      });

      if (existing) {
        throw new ConflictException('Ya existe otro cargo con ese nombre.');
      }

      position.name = name;
    }

    // ==========================================================
    // ÁREA
    // ==========================================================

    if (updatePositionDto.area !== undefined) {
      position.area = updatePositionDto.area?.trim() || undefined;
    }

    // ==========================================================
    // DESCRIPCIÓN
    // ==========================================================

    if (updatePositionDto.description !== undefined) {
      position.description = updatePositionDto.description?.trim() || undefined;
    }

    return this.positionRepository.save(position);
  }

  // ============================================================
  // DESACTIVAR
  // ============================================================

  async deactivate(id: number): Promise<Position> {
    const position = await this.findOne(id);

    position.isActive = false;

    return this.positionRepository.save(position);
  }

  // ============================================================
  // ACTIVAR
  // ============================================================

  async activate(id: number): Promise<Position> {
    const position = await this.findOne(id);

    position.isActive = true;

    return this.positionRepository.save(position);
  }

  // ============================================================
  // ELIMINAR
  //
  // Cuando el módulo Trabajadores ya esté funcionando,
  // utilizaremos principalmente activar/desactivar para conservar
  // el historial.
  // ============================================================

  async remove(id: number): Promise<void> {
    const position = await this.findOne(id);

    await this.positionRepository.remove(position);
  }
}
