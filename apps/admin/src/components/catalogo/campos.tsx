import { CameraIcon, CircleNotchIcon, CurrencyDollarIcon } from '@phosphor-icons/react';
import { Field, FieldDescription, FieldError, FieldLabel } from '@zarape/ui/components/field';
import { Input } from '@zarape/ui/components/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@zarape/ui/components/input-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@zarape/ui/components/select';
import { Button } from '@zarape/ui/components/button';
import { type ChangeEvent, type ComponentProps, useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ErrorApi, subirFoto, urlFoto } from '@/lib/api';
import { type Opcion, OPCIONES_ESTATUS_FILTRO } from './opciones';

/** Campo de texto con etiqueta y error (data-invalid + aria-invalid). */
export function CampoTexto({
  etiqueta,
  error,
  descripcion,
  className,
  ...props
}: ComponentProps<typeof Input> & { etiqueta: string; error?: string; descripcion?: string }) {
  const id = useId();
  return (
    <Field data-invalid={!!error || undefined} className={className}>
      <FieldLabel htmlFor={id}>{etiqueta}</FieldLabel>
      <Input id={id} aria-invalid={!!error || undefined} {...props} />
      {descripcion && <FieldDescription>{descripcion}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}

/** Precio en MXN con IVA incluido. */
export function CampoPrecio({
  etiqueta = 'Precio (IVA incluido)',
  error,
  ...props
}: ComponentProps<typeof InputGroupInput> & { etiqueta?: string; error?: string }) {
  const id = useId();
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={id}>{etiqueta}</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <CurrencyDollarIcon />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          aria-invalid={!!error || undefined}
          className="tabular-nums"
          {...props}
        />
      </InputGroup>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}

/** Select con etiqueta. Radix no acepta "" como valor: usa un valor como "TODOS". */
export function CampoSelect({
  etiqueta,
  valor,
  onCambio,
  opciones,
  error,
  placeholder = 'Elige una opción',
  className,
}: {
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
  opciones: Opcion[];
  error?: string;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <Field data-invalid={!!error || undefined} className={className}>
      <FieldLabel htmlFor={id}>{etiqueta}</FieldLabel>
      <Select value={valor} onValueChange={onCambio}>
        <SelectTrigger id={id} aria-invalid={!!error || undefined} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {opciones.map((o) => (
              <SelectItem key={o.valor} value={o.valor}>
                {o.texto}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}

/** Filtro de estatus común. "TODOS" no se manda a la API. */
export function FiltroEstatus({ valor, onCambio }: { valor: string; onCambio: (v: string) => void }) {
  return (
    <CampoSelect
      etiqueta="Estatus"
      valor={valor || 'TODOS'}
      onCambio={(v) => onCambio(v === 'TODOS' ? '' : v)}
      opciones={OPCIONES_ESTATUS_FILTRO}
      className="w-44"
    />
  );
}

/** Foto obligatoria: se sube a la API (JPG, PNG o WebP) o se pega una URL https. */
export function CampoFoto({
  valor,
  onCambio,
  error,
  alt,
}: {
  valor: string;
  onCambio: (url: string) => void;
  error?: string;
  alt: string;
}) {
  const id = useId();
  const archivo = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);

  async function alElegir(evento: ChangeEvent<HTMLInputElement>) {
    const elegido = evento.target.files?.[0];
    evento.target.value = '';
    if (!elegido) return;
    setSubiendo(true);
    try {
      onCambio(await subirFoto(elegido));
      toast.success('Foto lista');
    } catch (e) {
      toast.error(e instanceof ErrorApi ? e.message : 'No pudimos subir la foto.');
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={id}>Foto</FieldLabel>
      <div className="flex items-start gap-3">
        <div className="grid aspect-[4/3] w-28 shrink-0 place-items-center overflow-hidden rounded-lg border bg-secondary">
          {valor ? (
            <img src={urlFoto(valor)} alt={alt} className="size-full object-cover" />
          ) : (
            <CameraIcon size={28} weight="duotone" className="text-muted-foreground" aria-hidden />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Button type="button" variant="outline" onClick={() => archivo.current?.click()} disabled={subiendo}>
            {subiendo ? (
              <CircleNotchIcon data-icon="inline-start" className="animate-spin" />
            ) : (
              <CameraIcon data-icon="inline-start" />
            )}
            {subiendo ? 'Subiendo…' : valor ? 'Cambiar foto' : 'Subir foto'}
          </Button>
          <input ref={archivo} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={alElegir} />
          <Input
            id={id}
            value={valor}
            onChange={(e) => onCambio(e.target.value)}
            placeholder="o pega una URL https://…"
            aria-invalid={!!error || undefined}
          />
        </div>
      </div>
      <FieldDescription>JPG, PNG o WebP de hasta 2 MB. Mejor en 4:3.</FieldDescription>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
