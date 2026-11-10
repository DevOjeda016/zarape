/**
 * Enums del dominio. Mismos valores que los enums de `apps/api/prisma/schema.prisma`.
 * Se usan objetos `as const` (no `enum` de TypeScript) para que funcionen igual en Node y en Vite.
 */

/** Estatus de catálogos, empleados y clientes. `INACTIVE` = baja lógica. */
export const Status = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type Status = (typeof Status)[keyof typeof Status];

/** Rol del empleado (Módulo I y cocina). El cliente del drive thru no tiene rol de empleado. */
export const Role = {
  ADMIN: 'ADMIN',
  KITCHEN: 'KITCHEN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const CategoryType = {
  FOOD: 'FOOD',
  DRINK: 'DRINK',
} as const;
export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];

export const Channel = {
  KIOSK: 'KIOSK',
  DRIVE_THRU: 'DRIVE_THRU',
} as const;
export type Channel = (typeof Channel)[keyof typeof Channel];

export const OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  IN_KITCHEN: 'IN_KITCHEN',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ProductType = {
  FOOD: 'FOOD',
  DRINK: 'DRINK',
  COMBO: 'COMBO',
} as const;
export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export const PaymentStatus = {
  APPROVED: 'APPROVED',
  DECLINED: 'DECLINED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/**
 * Flujo de la comanda (docs/arquitectura.md):
 * PENDING → PAID → IN_KITCHEN → READY → DELIVERED.
 * Puede pasar a CANCELLED desde PENDING o PAID.
 */
export const ORDER_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['IN_KITCHEN', 'CANCELLED'],
  IN_KITCHEN: ['READY'],
  READY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export function canChangeStatus(current: OrderStatus, next: OrderStatus): boolean {
  return ORDER_TRANSITIONS[current].includes(next);
}
