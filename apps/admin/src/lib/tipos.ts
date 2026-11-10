import type { EstatusRegistro, Rol, TipoCategoria } from '@zarape/shared';

/** Respuestas de la API (ver Swagger en /api/docs). */

export interface Empleado {
  id: number;
  nombreUsuario: string;
  rol: Rol;
}

export interface ResultadoEliminacion {
  accion: 'ELIMINADO' | 'BAJA';
  mensaje: string;
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  fotoUrl: string;
  url: string;
  horarios: string;
  estatus: EstatusRegistro;
}

export interface Usuario {
  id: number;
  nombreUsuario: string;
  rol: Rol;
  sucursalId: number | null;
  sucursal: { id: number; nombre: string } | null;
  estatus: EstatusRegistro;
}

export interface UsuarioConContrasena extends Usuario {
  contrasena: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  tipo: TipoCategoria;
  estatus: EstatusRegistro;
  productos: number;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  fotoUrl: string;
  precio: number;
  categoriaId: number;
  categoria: { id: number; nombre: string };
  estatus: EstatusRegistro;
}

export interface ComponenteCombo {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  estatus: EstatusRegistro;
}

export interface Combo {
  id: number;
  nombre: string;
  descripcion: string;
  fotoUrl: string;
  precio: number;
  estatus: EstatusRegistro;
  alimentos: ComponenteCombo[];
  bebidas: ComponenteCombo[];
  precioPorSeparado: number;
  ahorro: number;
}
