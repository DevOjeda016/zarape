import { useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';

export type FieldErrors<V> = Partial<Record<keyof V, string>>;

/**
 * Estado del diálogo de alta / modificación: valores, errores por campo, guardando y error general.
 * `validate` corre en el navegador (campos obligatorios); la API vuelve a validar todo.
 */
export function useForm<V extends object>(empty: V) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [values, setValues] = useState<V>(empty);
  const [errors, setErrors] = useState<FieldErrors<V>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openWith(id: number | null, initial: V) {
    setEditingId(id);
    setValues(initial);
    setErrors({});
    setFormError(null);
    setOpen(true);
  }

  function set<K extends keyof V>(field: K, value: V[K]) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function save(validate: (v: V) => FieldErrors<V>, submit: (v: V) => Promise<string>) {
    const found = validate(values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    setSaving(true);
    setFormError(null);
    try {
      toast.success(await submit(values));
      setOpen(false);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'No pudimos guardar. Intenta otra vez.');
    } finally {
      setSaving(false);
    }
  }

  return {
    open,
    close: () => setOpen(false),
    editingId,
    isNew: editingId === null,
    values,
    errors,
    saving,
    formError,
    openWith,
    set,
    save,
  };
}

/** Error si el texto está vacío. */
export const required = (value: string, message: string) => (value.trim() ? undefined : message);

/** Error si no es un precio válido (mayor a cero, máximo dos decimales). */
export function validatePrice(value: string): string | undefined {
  const text = value.trim();
  if (!text) return 'Escribe el precio.';
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return 'Escribe el precio con máximo dos decimales, por ejemplo 95.50.';
  if (Number(text) <= 0) return 'El precio debe ser mayor a cero.';
  return undefined;
}
