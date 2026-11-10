import type { Role } from '../generated/prisma/enums.js';

/** Datos que viajan en el JWT del empleado. `kind` deja lugar al login del cliente (RF16). */
export interface EmployeeSession {
  sub: number;
  username: string;
  role: Role;
  kind: 'EMPLOYEE';
}
