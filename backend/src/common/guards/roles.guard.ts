import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Definimos la interfaz para el usuario
interface RequestUser {
  role?: {
    code: string;
  };
}

// Definimos la interfaz para la Request de Express/Fastify
interface RequestWithUser extends Request {
  user: RequestUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    // Al añadir <RequestWithUser>, le indicamos a NestJS el tipo de objeto que esperamos
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Validación segura utilizando optional chaining
    return requiredRoles.includes(user?.role?.code ?? '');
  }
}
