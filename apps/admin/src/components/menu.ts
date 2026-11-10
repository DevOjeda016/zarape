import { CoffeeIcon, ForkKnifeIcon, type Icon, PackageIcon, StorefrontIcon, TagIcon, UsersIcon } from '@phosphor-icons/react';

export interface OpcionMenu {
  ruta: string;
  texto: string;
  descripcion: string;
  icono: Icon;
}

/** RDF0101: menú de gestión con Sucursal, Usuario, Alimento, Bebida y Combo. */
export const MENU_GESTION: OpcionMenu[] = [
  { ruta: '/sucursales', texto: 'Sucursales', descripcion: 'Dirección, GPS, foto, página y horarios.', icono: StorefrontIcon },
  { ruta: '/usuarios', texto: 'Usuarios', descripcion: 'Empleados y sus contraseñas.', icono: UsersIcon },
  { ruta: '/alimentos', texto: 'Alimentos', descripcion: 'Platillos, ensaladas, tortas, postres y fruta.', icono: ForkKnifeIcon },
  { ruta: '/bebidas', texto: 'Bebidas', descripcion: 'Cafés, jugos, aguas y refrescos.', icono: CoffeeIcon },
  { ruta: '/combos', texto: 'Combos', descripcion: 'Paquetes con ahorro para el cliente.', icono: PackageIcon },
];

/** Catálogos de apoyo que usan los de arriba. */
export const MENU_APOYO: OpcionMenu[] = [
  { ruta: '/categorias', texto: 'Categorías', descripcion: 'Cómo se agrupa el menú.', icono: TagIcon },
];
