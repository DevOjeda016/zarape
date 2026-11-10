import type { CategoryType, Role, Status } from '@zarape/shared';

/** Respuestas de la API (ver Swagger en /api/docs). */

export interface SessionEmployee {
  id: number;
  username: string;
  role: Role;
}

export interface DeletionResult {
  action: 'DELETED' | 'DEACTIVATED';
  message: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
  url: string;
  hours: string;
  status: Status;
}

export interface Employee {
  id: number;
  username: string;
  role: Role;
  branchId: number | null;
  branch: { id: number; name: string } | null;
  status: Status;
}

export interface EmployeeWithPassword extends Employee {
  password: string;
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  status: Status;
  productCount: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  photoUrl: string;
  price: number;
  categoryId: number;
  category: { id: number; name: string };
  status: Status;
}

export interface ComboItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  status: Status;
}

export interface Combo {
  id: number;
  name: string;
  description: string;
  photoUrl: string;
  price: number;
  status: Status;
  foods: ComboItem[];
  drinks: ComboItem[];
  separatePrice: number;
  savings: number;
}
