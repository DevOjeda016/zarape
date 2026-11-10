export interface Opcion {
  valor: string;
  texto: string;
}

export const OPCIONES_ESTATUS_FILTRO: Opcion[] = [
  { valor: 'TODOS', texto: 'Todos' },
  { valor: 'ACTIVO', texto: 'Activos' },
  { valor: 'BAJA', texto: 'Dados de baja' },
];

/** Estatus al editar: BAJA → ACTIVO reactiva el registro. */
export const OPCIONES_ESTATUS: Opcion[] = [
  { valor: 'ACTIVO', texto: 'Activo' },
  { valor: 'BAJA', texto: 'Baja' },
];
