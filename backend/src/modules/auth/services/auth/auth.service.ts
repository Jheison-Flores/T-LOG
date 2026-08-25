import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { UsersService } from '../../../users/services/users.service';

import { LoginDto } from '../../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,

    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('El usuario está deshabilitado.');
    }

    await this.usersService.updateLastLogin(user.id);

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role.code,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,

      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,

        role: {
          id: user.role.id,
          code: user.role.code,
          name: user.role.name,
        },
      },
    };
  }
}
