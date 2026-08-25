import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from '../../entities/role.entity';

import { CreateRoleDto } from '../../dto/create-role.dto';
import { UpdateRoleDto } from '../../dto/update-role.dto';

@Injectable()
export class RolesService {
  private readonly SYSTEM_ROLES = ['ADMIN', 'LOGISTICS'];

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // ============================================================
  // CREAR
  // ============================================================

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const code = createRoleDto.code.trim().toUpperCase();

    const name = createRoleDto.name.trim();

    /*
     * Por ahora T-LOG trabaja únicamente
     * con los roles del sistema.
     *
     * Si en el futuro se implementa una matriz
     * dinámica de permisos, esta restricción
     * puede eliminarse.
     */
    if (!this.SYSTEM_ROLES.includes(code)) {
      throw new BadRequestException(
        'Actualmente el sistema solo admite los roles ADMIN y LOGISTICS.',
      );
    }

    const existsCode = await this.roleRepository.findOne({
      where: {
        code,
      },
    });

    if (existsCode) {
      throw new ConflictException('Ya existe un rol con ese código.');
    }

    const existsName = await this.roleRepository.findOne({
      where: {
        name,
      },
    });

    if (existsName) {
      throw new ConflictException('Ya existe un rol con ese nombre.');
    }

    const role = this.roleRepository.create({
      code,

      name,

      description: createRoleDto.description?.trim(),

      isActive: createRoleDto.isActive ?? true,
    });

    return this.roleRepository.save(role);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  // ============================================================
  // OBTENER UNO
  // ============================================================

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: {
        id,
      },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado.');
    }

    return role;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // ==========================================================
    // CÓDIGO
    // ==========================================================

    if (updateRoleDto.code !== undefined) {
      const newCode = updateRoleDto.code.trim().toUpperCase();

      /*
       * Los códigos ADMIN y LOGISTICS son
       * identificadores internos utilizados
       * por guards, frontend y servicios.
       */
      if (this.SYSTEM_ROLES.includes(role.code) && newCode !== role.code) {
        throw new BadRequestException(
          `El código ${role.code} es reservado y no puede modificarse.`,
        );
      }

      if (!this.SYSTEM_ROLES.includes(newCode)) {
        throw new BadRequestException(
          'Actualmente el sistema solo admite los roles ADMIN y LOGISTICS.',
        );
      }

      if (newCode !== role.code) {
        const exists = await this.roleRepository.findOne({
          where: {
            code: newCode,
          },
        });

        if (exists) {
          throw new ConflictException('Ya existe un rol con ese código.');
        }
      }

      role.code = newCode;
    }

    // ==========================================================
    // NOMBRE
    // ==========================================================

    if (updateRoleDto.name !== undefined) {
      const newName = updateRoleDto.name.trim();

      if (!newName) {
        throw new BadRequestException(
          'El nombre del rol no puede estar vacío.',
        );
      }

      if (newName !== role.name) {
        const exists = await this.roleRepository.findOne({
          where: {
            name: newName,
          },
        });

        if (exists) {
          throw new ConflictException('Ya existe un rol con ese nombre.');
        }
      }

      role.name = newName;
    }

    // ==========================================================
    // DESCRIPCIÓN
    // ==========================================================

    if (updateRoleDto.description !== undefined) {
      role.description = updateRoleDto.description?.trim();
    }

    // ==========================================================
    // ESTADO
    // ==========================================================

    if (updateRoleDto.isActive !== undefined) {
      if (
        this.SYSTEM_ROLES.includes(role.code) &&
        updateRoleDto.isActive === false
      ) {
        throw new BadRequestException(
          `El rol ${role.code} es necesario para el funcionamiento del sistema y no puede desactivarse.`,
        );
      }

      role.isActive = updateRoleDto.isActive;
    }

    return this.roleRepository.save(role);
  }

  // ============================================================
  // DESACTIVAR
  // ============================================================

  async disable(id: number): Promise<Role> {
    const role = await this.findOne(id);

    if (this.SYSTEM_ROLES.includes(role.code)) {
      throw new BadRequestException(
        `El rol ${role.code} es necesario para el funcionamiento del sistema y no puede desactivarse.`,
      );
    }

    role.isActive = false;

    return this.roleRepository.save(role);
  }

  // ============================================================
  // ACTIVAR
  // ============================================================

  async enable(id: number): Promise<Role> {
    const role = await this.findOne(id);

    role.isActive = true;

    return this.roleRepository.save(role);
  }
}
