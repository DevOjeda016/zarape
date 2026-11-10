import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Rol } from '../generated/prisma/enums.js';
import { CLAVE_ROLES } from './decoradores.js';
import type { SesionEmpleado } from './sesion.js';

/** Revisa @Roles(). Corre después de JwtGuard, así que la sesión ya está en la petición. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Rol[] | undefined>(CLAVE_ROLES, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (!roles?.length) return true;

    const { sesion } = contexto.switchToHttp().getRequest<{ sesion?: SesionEmpleado }>();
    if (sesion?.tipo === 'EMPLEADO' && roles.includes(sesion.rol)) return true;
    throw new ForbiddenException('Tu usuario no tiene permiso para esta sección.');
  }
}
