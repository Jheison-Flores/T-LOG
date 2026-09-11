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
import { ChangePasswordDto } from '../dto/change-pasword.dto';

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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: createUserDto.username.trim() },
        { email: createUserDto.email.trim().toLowerCase() },
      ],
    });

    if (existingUser) {
      throw new ConflictException('El username o el email ya existen.');
    }

    const role = await this.roleRepository.findOne({
      where: { id: createUserDto.roleId },
    });

    if (!role) {
      throw new NotFoundException('El rol seleccionado no existe.');
    }

    let warehouse: Warehouse | null = null;

    if (createUserDto.warehouseId) {
      warehouse = await this.warehouseRepository.findOne({
        where: { id: createUserDto.warehouseId },
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

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

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

    const saved = await this.usersRepository.save(user);

    return this.findOne(saved.id);
  }

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

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
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

  // Solo este método carga el hash porque AuthService lo necesita para login.
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.warehouse', 'warehouse')
      .where('user.username = :username', {
        username,
      })
      .andWhere('user.isActive = :isActive', {
        isActive: true,
      })
      .getOne();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (
      updateUserDto.username &&
      updateUserDto.username.trim() !== user.username
    ) {
      const existingUsername = await this.usersRepository.findOne({
        where: { username: updateUserDto.username.trim() },
      });

      if (existingUsername && existingUsername.id !== id) {
        throw new ConflictException('El username ya está registrado.');
      }
    }

    if (
      updateUserDto.email &&
      updateUserDto.email.trim().toLowerCase() !== user.email
    ) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: updateUserDto.email.trim().toLowerCase() },
      });

      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('El email ya está registrado.');
      }
    }

    if (updateUserDto.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: updateUserDto.roleId },
      });

      if (!role) {
        throw new NotFoundException('El rol seleccionado no existe.');
      }

      user.role = role;
    }

    if (updateUserDto.warehouseId === null) {
      user.warehouse = null;
    } else if (updateUserDto.warehouseId) {
      const warehouse = await this.warehouseRepository.findOne({
        where: { id: updateUserDto.warehouseId },
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

    // IMPORTANTE:
    // La contraseña NO se modifica aquí, aunque alguien intente enviarla
    // manualmente en el PATCH /users/:id.

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

  async changeOwnPassword(
    userId: number,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException(
        'La confirmación de la nueva contraseña no coincide.',
      );
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la contraseña actual.',
      );
    }

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :userId', {
        userId,
      })
      .andWhere('user.isActive = :isActive', {
        isActive: true,
      })
      .getOne();

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const validCurrentPassword = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!validCurrentPassword) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.mustChangePassword = false;

    await this.usersRepository.save(user);

    return {
      message: 'Contraseña actualizada correctamente.',
    };
  }

  async deactivate(id: number): Promise<User> {
    const user = await this.findOne(id);

    user.isActive = false;

    return this.usersRepository.save(user);
  }

  async activate(id: number): Promise<User> {
    const user = await this.findOne(id);

    user.isActive = true;

    return this.usersRepository.save(user);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.usersRepository.update(id, {
      lastLogin: new Date(),
    });
  }
}
