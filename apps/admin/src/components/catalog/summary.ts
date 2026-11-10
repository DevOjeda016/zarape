import type { Filters } from './useCatalog';

const STATUS_LABELS: Record<string, string> = { ACTIVE: 'activos', INACTIVE: 'dados de baja' };

/**
 * Filtros aplicados en texto, para el encabezado impreso y el conteo:
 * "Nombre: centro · Estatus: activos" o "Todos los registros".
 */
export function summarizeFilters(
  filters: Filters,
  labels: Record<string, string>,
  formatters: Record<string, (v: string) => string> = {},
): string {
  const parts = Object.entries(filters)
    .filter(([, v]) => v)
    .map(([key, v]) => {
      if (key === 'status') return `Estatus: ${STATUS_LABELS[v] ?? v}`;
      return `${labels[key] ?? key}: ${formatters[key]?.(v) ?? v}`;
    });
  return parts.length ? parts.join(' · ') : 'Todos los registros';
}
