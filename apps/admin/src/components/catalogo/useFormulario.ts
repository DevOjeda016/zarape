import { useState } from 'react';
import { toast } from 'sonner';
import { ErrorApi } from '@/lib/api';

export type Errores<V> = Partial<Record<keyof V, string>>;

/**
 * Estado del diálogo de alta / modificación: valores, errores por campo, guardando y error general.
 * `validar` corre en el navegador (campos obligatorios); la API vuelve a validar todo.
 */
export function useFormulario<V extends object>(vacio: V) {
  const [abierto, setAbierto] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [valores, setValores] = useState<V>(vacio);
  const [errores, setErrores] = useState<Errores<V>>({});
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  function abrir(id: number | null, iniciales: V) {
    setIdEditando(id);
    setValores(iniciales);
    setErrores({});
    setErrorGeneral(null);
    setAbierto(true);
  }

  function cambiar<K extends keyof V>(campo: K, valor: V[K]) {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  async function guardar(validar: (v: V) => Errores<V>, enviar: (v: V) => Promise<string>) {
    const encontrados = validar(valores);
    setErrores(encontrados);
    if (Object.values(encontrados).some(Boolean)) return;

    setGuardando(true);
    setErrorGeneral(null);
    try {
      toast.success(await enviar(valores));
      setAbierto(false);
    } catch (e) {
      setErrorGeneral(e instanceof ErrorApi ? e.message : 'No pudimos guardar. Intenta otra vez.');
    } finally {
      setGuardando(false);
    }
  }

  return {
    abierto,
    cerrar: () => setAbierto(false),
    idEditando,
    esNuevo: idEditando === null,
    valores,
    errores,
    guardando,
    errorGeneral,
    abrir,
    cambiar,
    guardar,
  };
}

/** Error si el texto está vacío. */
export const requerido = (valor: string, mensaje: string) => (valor.trim() ? undefined : mensaje);

/** Error si no es un precio válido (mayor a cero, máximo dos decimales). */
export function validarPrecio(valor: string): string | undefined {
  const texto = valor.trim();
  if (!texto) return 'Escribe el precio.';
  if (!/^\d+(\.\d{1,2})?$/.test(texto)) return 'Escribe el precio con máximo dos decimales, por ejemplo 95.50.';
  if (Number(texto) <= 0) return 'El precio debe ser mayor a cero.';
  return undefined;
}
