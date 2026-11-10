import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '../generated/prisma/enums.js';
import { ROLES_KEY } from './decorators.js';
import type { EmployeeSession } from './session.js';

/** Revisa @Roles(). Corre después de JwtGuard, así que la sesión ya está en la petición. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const { session } = context.switchToHttp().getRequest<{ session?: EmployeeSession }>();
    if (session?.kind === 'EMPLOYEE' && roles.includes(session.role)) return true;
    throw new ForbiddenException('Tu usuario no tiene permiso para esta sección.');
  }
}
