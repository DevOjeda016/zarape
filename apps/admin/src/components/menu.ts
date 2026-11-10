import { CoffeeIcon, ForkKnifeIcon, type Icon, PackageIcon, StorefrontIcon, TagIcon, UsersIcon } from '@phosphor-icons/react';

export interface MenuItem {
  path: string;
  label: string;
  description: string;
  icon: Icon;
}

/** RDF0101: menú de gestión con Sucursal, Usuario, Alimento, Bebida y Combo. */
export const CATALOG_MENU: MenuItem[] = [
  { path: '/branches', label: 'Sucursales', description: 'Dirección, GPS, foto, página y horarios.', icon: StorefrontIcon },
  { path: '/employees', label: 'Usuarios', description: 'Empleados y sus contraseñas.', icon: UsersIcon },
  { path: '/foods', label: 'Alimentos', description: 'Platillos, ensaladas, tortas, postres y fruta.', icon: ForkKnifeIcon },
  { path: '/drinks', label: 'Bebidas', description: 'Cafés, jugos, aguas y refrescos.', icon: CoffeeIcon },
  { path: '/combos', label: 'Combos', description: 'Paquetes con ahorro para el cliente.', icon: PackageIcon },
];

/** Catálogos de apoyo que usan los de arriba. */
export const SUPPORT_MENU: MenuItem[] = [
  { path: '/categories', label: 'Categorías', description: 'Cómo se agrupa el menú.', icon: TagIcon },
];
