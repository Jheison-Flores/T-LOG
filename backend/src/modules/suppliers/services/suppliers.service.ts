import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Not, Repository } from 'typeorm';

import { Supplier } from '../entities/supplier.entity';

import { User } from '../../users/entities/user.entity';

import { CreateSupplierDto } from '../dto/create-supplier.dto';

import { UpdateSupplierDto } from '../dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ============================================================
  // OBTENER USUARIO
  // ============================================================

  private async getUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },

      relations: {
        role: true,
        warehouse: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('El usuario se encuentra inactivo.');
    }

    return user;
  }

  // ============================================================
  // VALIDAR PERMISO
  //
  // Proveedores es un maestro global.
  //
  // ADMIN y LOGISTICS:
  // - pueden ver
  // - pueden crear
  // - pueden editar
  // - pueden eliminar/desactivar
  // ============================================================

  private validatePermission(user: User): void {
    const roleCode = user.role?.code;

    if (roleCode !== 'ADMIN' && roleCode !== 'LOGISTICS') {
      throw new ForbiddenException(
        'No tienes permisos para gestionar proveedores.',
      );
    }
  }

  // ============================================================
  // VALIDAR RUC DUPLICADO
  // ============================================================

  private async validateRuc(ruc?: string, excludeId?: number): Promise<void> {
    const cleanRuc = ruc?.trim();

    if (!cleanRuc) {
      return;
    }

    const existing = await this.supplierRepository.findOne({
      where: excludeId
        ? {
            ruc: cleanRuc,
            id: Not(excludeId),
          }
        : {
            ruc: cleanRuc,
          },
    });

    if (existing) {
      throw new BadRequestException(
        `Ya existe un proveedor registrado con el RUC ${cleanRuc}.`,
      );
    }
  }

  // ============================================================
  // CREAR
  // ============================================================

  async create(dto: CreateSupplierDto, userId: number): Promise<Supplier> {
    const user = await this.getUser(userId);

    this.validatePermission(user);

    await this.validateRuc(dto.ruc);

    const name = dto.name?.trim();

    if (!name) {
      throw new BadRequestException('El nombre del proveedor es obligatorio.');
    }

    const supplier = this.supplierRepository.create({
      name,

      ruc: dto.ruc?.trim() || null,

      address: dto.address?.trim() || null,

      phone: dto.phone?.trim() || null,

      email: dto.email?.trim().toLowerCase() || null,

      isActive: dto.isActive ?? true,
    });

    return this.supplierRepository.save(supplier);
  }

  // ============================================================
  // LISTAR
  //
  // TODOS LOS PROVEEDORES PARA ADMIN Y LOGISTICS
  // ============================================================

  async findAll(userId: number): Promise<Supplier[]> {
    const user = await this.getUser(userId);

    this.validatePermission(user);

    return this.supplierRepository.find({
      order: {
        isActive: 'DESC',
        name: 'ASC',
      },
    });
  }

  // ============================================================
  // OBTENER UNO
  // ============================================================

  async findOne(id: number, userId: number): Promise<Supplier> {
    const user = await this.getUser(userId);

    this.validatePermission(user);

    const supplier = await this.supplierRepository.findOne({
      where: {
        id,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado.');
    }

    return supplier;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(
    id: number,
    dto: UpdateSupplierDto,
    userId: number,
  ): Promise<Supplier> {
    const user = await this.getUser(userId);

    this.validatePermission(user);

    const supplier = await this.supplierRepository.findOne({
      where: {
        id,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado.');
    }

    if (dto.ruc !== undefined) {
      await this.validateRuc(dto.ruc, supplier.id);
    }

    if (dto.name !== undefined) {
      const name = dto.name.trim();

      if (!name) {
        throw new BadRequestException(
          'El nombre del proveedor no puede estar vacío.',
        );
      }

      supplier.name = name;
    }

    if (dto.ruc !== undefined) {
      supplier.ruc = dto.ruc.trim() || null;
    }

    if (dto.address !== undefined) {
      supplier.address = dto.address.trim() || null;
    }

    if (dto.phone !== undefined) {
      supplier.phone = dto.phone.trim() || null;
    }

    if (dto.email !== undefined) {
      supplier.email = dto.email.trim().toLowerCase() || null;
    }

    if (dto.isActive !== undefined) {
      supplier.isActive = dto.isActive;
    }

    return this.supplierRepository.save(supplier);
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  async remove(
    id: number,
    userId: number,
  ): Promise<{
    message: string;
  }> {
    const user = await this.getUser(userId);

    this.validatePermission(user);

    const supplier = await this.supplierRepository.findOne({
      where: {
        id,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado.');
    }

    try {
      await this.supplierRepository.remove(supplier);

      return {
        message: 'Proveedor eliminado correctamente.',
      };
    } catch {
      throw new BadRequestException(
        'No se puede eliminar el proveedor porque posee registros relacionados. Puedes desactivarlo.',
      );
    }
  }
}
