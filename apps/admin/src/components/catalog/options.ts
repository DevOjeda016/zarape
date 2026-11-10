export interface Option {
  value: string;
  label: string;
}

export const STATUS_FILTER_OPTIONS: Option[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'INACTIVE', label: 'Dados de baja' },
];

/** Estatus al editar: INACTIVE → ACTIVE reactiva el registro. */
export const STATUS_OPTIONS: Option[] = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'INACTIVE', label: 'Baja' },
];
