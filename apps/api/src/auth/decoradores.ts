import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common';
import type { Rol } from '../generated/prisma/enums.js';
import type { SesionEmpleado } from './sesion.js';

export const CLAVE_PUBLICO = 'publico';
export const CLAVE_ROLES = 'roles';

/** La ruta no pide token (salud, login). Todo lo demás exige sesión. */
export const Publico = () => SetMetadata(CLAVE_PUBLICO, true);

/** Roles de empleado que pueden usar la ruta o el controlador. */
export const Roles = (...roles: Rol[]) => SetMetadata(CLAVE_ROLES, roles);

/** Sesión del empleado que hace la petición (la pone JwtGuard). */
export const SesionActual = createParamDecorator(
  (_dato: unknown, contexto: ExecutionContext): SesionEmpleado =>
    contexto.switchToHttp().getRequest<{ sesion: SesionEmpleado }>().sesion,
);
