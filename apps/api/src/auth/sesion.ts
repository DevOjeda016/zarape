import type { Rol } from '../generated/prisma/enums.js';

/** Datos que viajan en el JWT del empleado. `tipo` deja lugar al login del cliente (RF16). */
export interface SesionEmpleado {
  sub: number;
  nombreUsuario: string;
  rol: Rol;
  tipo: 'EMPLEADO';
}
