import type { Filtros } from './useCatalogo';

const ESTATUS: Record<string, string> = { ACTIVO: 'activos', BAJA: 'dados de baja' };

/**
 * Filtros aplicados en texto, para el encabezado impreso y el conteo:
 * "Nombre: centro · Estatus: activos" o "Todos los registros".
 */
export function resumirFiltros(
  filtros: Filtros,
  etiquetas: Record<string, string>,
  valores: Record<string, (v: string) => string> = {},
): string {
  const partes = Object.entries(filtros)
    .filter(([, v]) => v)
    .map(([clave, v]) => {
      if (clave === 'estatus') return `Estatus: ${ESTATUS[v] ?? v}`;
      const texto = valores[clave]?.(v) ?? v;
      return `${etiquetas[clave] ?? clave}: ${texto}`;
    });
  return partes.length ? partes.join(' · ') : 'Todos los registros';
}
