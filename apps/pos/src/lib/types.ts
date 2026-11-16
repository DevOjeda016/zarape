import type { Channel, OrderStatus, PaymentStatus, ProductType } from '@zarape/shared';

/** Respuestas de la API (docs/arquitectura.md, Swagger en /api/docs). */

export interface MenuProduct {
  id: number;
  name: string;
  description: string;
  photoUrl: string;
  price: number;
  category: { id: number; name: string };
}

export interface MenuCombo extends Omit<MenuProduct, 'category'> {
  contents: { name: string; quantity: number }[];
}

export interface Menu {
  foods: MenuProduct[];
  drinks: MenuProduct[];
  combos: MenuCombo[];
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  hours: string;
}

export interface OrderItem {
  id: number;
  type: ProductType;
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  qrToken: string;
  ticketNumber: number | null;
  channel: Channel;
  status: OrderStatus;
  branchId: number;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  paidAt: string | null;
  items: OrderItem[];
}

export interface OrderPayment {
  order: Order;
  payment: { status: PaymentStatus; message: string | null; brand: string; last4: string; reference: string };
}
