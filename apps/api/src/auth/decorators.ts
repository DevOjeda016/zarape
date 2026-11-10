import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common';
import type { Role } from '../generated/prisma/enums.js';
import type { EmployeeSession } from './session.js';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

/** La ruta no pide token (salud, login). Todo lo demás exige sesión. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Roles de empleado que pueden usar la ruta o el controlador. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/** Sesión del empleado que hace la petición (la pone JwtGuard). */
export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): EmployeeSession =>
    context.switchToHttp().getRequest<{ session: EmployeeSession }>().session,
);
