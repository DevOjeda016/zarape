import { useCallback, useEffect, useState } from 'react';
import { api, conFiltros, ErrorApi } from '@/lib/api';

export type Filtros = Record<string, string>;

interface Respuesta<T> {
  clave: string;
  datos: T[];
  error: string | null;
}

/**
 * Lista de un catálogo con sus filtros. La búsqueda corre al aplicar filtros (botón Buscar),
 * no a cada tecla. `recargar` repite la última búsqueda (después de guardar o eliminar).
 * `cargando` se deriva: la última respuesta no es de la petición actual.
 */
export function useCatalogo<T>(ruta: string, filtrosIniciales: Filtros = {}) {
  const [filtros, setFiltros] = useState<Filtros>(filtrosIniciales);
  const [version, setVersion] = useState(0);
  const [respuesta, setRespuesta] = useState<Respuesta<T>>({ clave: '', datos: [], error: null });
  const url = conFiltros(ruta, filtros);
  const clave = `${url}#${version}`;

  useEffect(() => {
    let vigente = true;
    api<T[]>('GET', url).then(
      (datos) => vigente && setRespuesta({ clave, datos, error: null }),
      (e: unknown) =>
        vigente &&
        setRespuesta((anterior) => ({
          clave,
          datos: anterior.datos,
          error: e instanceof ErrorApi ? e.message : 'No pudimos cargar la lista.',
        })),
    );
    return () => {
      vigente = false;
    };
  }, [url, clave]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  return {
    datos: respuesta.datos,
    cargando: respuesta.clave !== clave,
    error: respuesta.error,
    filtros,
    buscar: setFiltros,
    recargar,
  };
}

/** Catálogo auxiliar para los selects (categorías, sucursales, productos activos). */
export function useOpciones<T>(ruta: string) {
  const [opciones, setOpciones] = useState<T[]>([]);
  useEffect(() => {
    let vigente = true;
    api<T[]>('GET', ruta).then((filas) => vigente && setOpciones(filas), () => undefined);
    return () => {
      vigente = false;
    };
  }, [ruta]);
  return opciones;
}
