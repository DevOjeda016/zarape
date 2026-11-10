import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, withFilters } from '@/lib/api';

export type Filters = Record<string, string>;

interface Response<T> {
  key: string;
  rows: T[];
  error: string | null;
}

/**
 * Lista de un catálogo con sus filtros. La búsqueda corre al aplicar filtros (botón Buscar),
 * no a cada tecla. `reload` repite la última búsqueda (después de guardar o eliminar).
 * `loading` se deriva: la última respuesta no es de la petición actual.
 */
export function useCatalog<T>(path: string, initialFilters: Filters = {}) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [version, setVersion] = useState(0);
  const [response, setResponse] = useState<Response<T>>({ key: '', rows: [], error: null });
  const url = withFilters(path, filters);
  const key = `${url}#${version}`;

  useEffect(() => {
    let current = true;
    api<T[]>('GET', url).then(
      (rows) => current && setResponse({ key, rows, error: null }),
      (e: unknown) =>
        current &&
        setResponse((previous) => ({
          key,
          rows: previous.rows,
          error: e instanceof ApiError ? e.message : 'No pudimos cargar la lista.',
        })),
    );
    return () => {
      current = false;
    };
  }, [url, key]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return {
    rows: response.rows,
    loading: response.key !== key,
    error: response.error,
    filters,
    search: setFilters,
    reload,
  };
}

/** Catálogo auxiliar para los selects (categorías, sucursales, productos activos). */
export function useOptions<T>(path: string) {
  const [options, setOptions] = useState<T[]>([]);
  useEffect(() => {
    let current = true;
    api<T[]>('GET', path).then((rows) => current && setOptions(rows), () => undefined);
    return () => {
      current = false;
    };
  }, [path]);
  return options;
}
