import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from '../entities/user.entity';

import { Role } from '../../roles/entities/role.entity';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { CreateUserDto } from '../dto/create-user.dto';

import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  // ============================================================
  // CREAR USUARIO
  // ============================================================

  async create(createUserDto: CreateUserDto): Promise<User> {
    /*
     * Username / email duplicado
     */

    const existingUser = await this.usersRepository.findOne({
      where: [
        {
          username: createUserDto.username.trim(),
        },
        {
          email: createUserDto.email.trim().toLowerCase(),
        },
      ],
    });

    if (existingUser) {
      throw new ConflictException('El username o el email ya existen.');
    }

    /*
     * Rol
     */

    const role = await this.roleRepository.findOne({
      where: {
        id: createUserDto.roleId,
      },
    });

    if (!role) {
      throw new NotFoundException('El rol seleccionado no existe.');
    }

    /*
     * Almacén / mina
     */

    let warehouse: Warehouse | null = null;

    if (createUserDto.warehouseId) {
      warehouse = await this.warehouseRepository.findOne({
        where: {
          id: createUserDto.warehouseId,
        },
      });

      if (!warehouse) {
        throw new NotFoundException(
          'El almacén o mina seleccionada no existe.',
        );
      }

      if (!warehouse.isActive) {
        throw new BadRequestException(
          'El almacén o mina seleccionada se encuentra inactivo.',
        );
      }
    }

    /*
     * Password
     */

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    /*
     * Crear
     */

    const user = this.usersRepository.create({
      username: createUserDto.username.trim(),

      firstName: createUserDto.firstName.trim(),

      lastName: createUserDto.lastName.trim(),

      email: createUserDto.email.trim().toLowerCase(),

      phone: createUserDto.phone?.trim(),

      position: createUserDto.position?.trim(),

      password: hashedPassword,

      role,

      warehouse,
    });

    return this.usersRepository.save(user);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: {
        role: true,
        warehouse: true,
      },

      order: {
        createdAt: 'DESC',
      },
    });
  }

  // ============================================================
  // BUSCAR POR ID
  // ============================================================

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },

      relations: {
        role: true,
        warehouse: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return user;
  }

  // ============================================================
  // BUSCAR POR USERNAME
  // JWT
  // ============================================================

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        username,
        isActive: true,
      },

      relations: {
        role: true,
        warehouse: true,
      },
    });
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // ==========================================================
    // USERNAME DUPLICADO
    // ==========================================================

    if (
      updateUserDto.username &&
      updateUserDto.username.trim() !== user.username
    ) {
      const existingUsername = await this.usersRepository.findOne({
        where: {
          username: updateUserDto.username.trim(),
        },
      });

      if (existingUsername && existingUsername.id !== id) {
        throw new ConflictException('El username ya está registrado.');
      }
    }

    // ==========================================================
    // EMAIL DUPLICADO
    // ==========================================================

    if (
      updateUserDto.email &&
      updateUserDto.email.trim().toLowerCase() !== user.email
    ) {
      const existingEmail = await this.usersRepository.findOne({
        where: {
          email: updateUserDto.email.trim().toLowerCase(),
        },
      });

      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('El email ya está registrado.');
      }
    }

    // ==========================================================
    // ROL
    // ==========================================================

    if (updateUserDto.roleId) {
      const role = await this.roleRepository.findOne({
        where: {
          id: updateUserDto.roleId,
        },
      });

      if (!role) {
        throw new NotFoundException('El rol seleccionado no existe.');
      }

      user.role = role;
    }

    // ==========================================================
    // ALMACÉN
    // ==========================================================

    if (updateUserDto.warehouseId) {
      const warehouse = await this.warehouseRepository.findOne({
        where: {
          id: updateUserDto.warehouseId,
        },
      });

      if (!warehouse) {
        throw new NotFoundException(
          'El almacén o mina seleccionada no existe.',
        );
      }

      if (!warehouse.isActive) {
        throw new BadRequestException(
          'El almacén o mina seleccionada está inactivo.',
        );
      }

      user.warehouse = warehouse;
    }

    // ==========================================================
    // PASSWORD
    // ==========================================================

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // ==========================================================
    // DATOS
    // ==========================================================

    if (updateUserDto.username) {
      user.username = updateUserDto.username.trim();
    }

    if (updateUserDto.firstName) {
      user.firstName = updateUserDto.firstName.trim();
    }

    if (updateUserDto.lastName) {
      user.lastName = updateUserDto.lastName.trim();
    }

    if (updateUserDto.email) {
      user.email = updateUserDto.email.trim().toLowerCase();
    }

    if (updateUserDto.phone !== undefined) {
      user.phone = updateUserDto.phone?.trim();
    }

    if (updateUserDto.position !== undefined) {
      user.position = updateUserDto.position?.trim();
    }

    return this.usersRepository.save(user);
  }

  // ============================================================
  // DESACTIVAR
  // ============================================================

  async deactivate(id: number): Promise<User> {
    const user = await this.findOne(id);

    user.isActive = false;

    return this.usersRepository.save(user);
  }

  // ============================================================
  // ACTIVAR
  // ============================================================

  async activate(id: number): Promise<User> {
    const user = await this.findOne(id);

    user.isActive = true;

    return this.usersRepository.save(user);
  }

  // ============================================================
  // ÚLTIMO LOGIN
  // ============================================================

  async updateLastLogin(id: number): Promise<void> {
    await this.usersRepository.update(id, {
      lastLogin: new Date(),
    });
  }
}
