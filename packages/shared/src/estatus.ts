/**
 * Enums del dominio. Mismos valores que los enums de `apps/api/prisma/schema.prisma`.
 * Se usan objetos `as const` (no `enum` de TypeScript) para que funcionen igual en Node y en Vite.
 */

/** Estatus de catálogos, usuarios y clientes. `BAJA` = borrado lógico. */
export const EstatusRegistro = {
  ACTIVO: 'ACTIVO',
  BAJA: 'BAJA',
} as const;
export type EstatusRegistro = (typeof EstatusRegistro)[keyof typeof EstatusRegistro];

/** Rol del empleado (Módulo I y cocina). El cliente del drive thru no tiene rol de empleado. */
export const Rol = {
  ADMIN: 'ADMIN',
  COCINA: 'COCINA',
} as const;
export type Rol = (typeof Rol)[keyof typeof Rol];

export const TipoCategoria = {
  ALIMENTO: 'ALIMENTO',
  BEBIDA: 'BEBIDA',
} as const;
export type TipoCategoria = (typeof TipoCategoria)[keyof typeof TipoCategoria];

export const Canal = {
  KIOSKO: 'KIOSKO',
  DRIVE_THRU: 'DRIVE_THRU',
} as const;
export type Canal = (typeof Canal)[keyof typeof Canal];

export const EstatusComanda = {
  PENDIENTE: 'PENDIENTE',
  PAGADA: 'PAGADA',
  EN_COCINA: 'EN_COCINA',
  LISTA: 'LISTA',
  ENTREGADA: 'ENTREGADA',
  CANCELADA: 'CANCELADA',
} as const;
export type EstatusComanda = (typeof EstatusComanda)[keyof typeof EstatusComanda];

export const TipoProducto = {
  ALIMENTO: 'ALIMENTO',
  BEBIDA: 'BEBIDA',
  COMBO: 'COMBO',
} as const;
export type TipoProducto = (typeof TipoProducto)[keyof typeof TipoProducto];

export const EstatusPago = {
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
} as const;
export type EstatusPago = (typeof EstatusPago)[keyof typeof EstatusPago];

/**
 * Flujo de la comanda (docs/arquitectura.md):
 * PENDIENTE → PAGADA → EN_COCINA → LISTA → ENTREGADA.
 * Puede pasar a CANCELADA desde PENDIENTE o PAGADA.
 */
export const TRANSICIONES_COMANDA: Readonly<Record<EstatusComanda, readonly EstatusComanda[]>> = {
  PENDIENTE: ['PAGADA', 'CANCELADA'],
  PAGADA: ['EN_COCINA', 'CANCELADA'],
  EN_COCINA: ['LISTA'],
  LISTA: ['ENTREGADA'],
  ENTREGADA: [],
  CANCELADA: [],
};

export function puedeCambiarEstatus(actual: EstatusComanda, siguiente: EstatusComanda): boolean {
  return TRANSICIONES_COMANDA[actual].includes(siguiente);
}
