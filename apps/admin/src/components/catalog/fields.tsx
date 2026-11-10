import { CameraIcon, CircleNotchIcon, CurrencyDollarIcon } from '@phosphor-icons/react';
import { Button } from '@zarape/ui/components/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@zarape/ui/components/field';
import { Input } from '@zarape/ui/components/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@zarape/ui/components/input-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@zarape/ui/components/select';
import { type ChangeEvent, type ComponentProps, useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ApiError, photoSrc, uploadPhoto } from '@/lib/api';
import { type Option, STATUS_FILTER_OPTIONS } from './options';

/** Campo de texto con etiqueta y error (data-invalid + aria-invalid). */
export function TextField({
  label,
  error,
  description,
  className,
  ...props
}: ComponentProps<typeof Input> & { label: string; error?: string; description?: string }) {
  const id = useId();
  return (
    <Field data-invalid={!!error || undefined} className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} aria-invalid={!!error || undefined} {...props} />
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}

/** Precio en MXN con IVA incluido. */
export function PriceField({
  label = 'Precio (IVA incluido)',
  error,
  ...props
}: ComponentProps<typeof InputGroupInput> & { label?: string; error?: string }) {
  const id = useId();
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
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

/** Select con etiqueta. Radix no acepta "" como valor: usa un valor como "ALL". */
export function SelectField({
  label,
  value,
  onChange,
  options,
  error,
  placeholder = 'Elige una opción',
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  error?: string;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <Field data-invalid={!!error || undefined} className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} aria-invalid={!!error || undefined} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}

/** Filtro de estatus común. "ALL" no se manda a la API. */
export function StatusFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <SelectField
      label="Estatus"
      value={value || 'ALL'}
      onChange={(v) => onChange(v === 'ALL' ? '' : v)}
      options={STATUS_FILTER_OPTIONS}
      className="w-44"
    />
  );
}

/** Foto obligatoria: se sube a la API (JPG, PNG o WebP) o se pega una URL https. */
export function PhotoField({
  value,
  onChange,
  error,
  alt,
}: {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  alt: string;
}) {
  const id = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadPhoto(file));
      toast.success('Foto lista');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'No pudimos subir la foto.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={id}>Foto</FieldLabel>
      <div className="flex items-start gap-3">
        <div className="grid aspect-[4/3] w-28 shrink-0 place-items-center overflow-hidden rounded-lg border bg-secondary">
          {value ? (
            <img src={photoSrc(value)} alt={alt} className="size-full object-cover" />
          ) : (
            <CameraIcon size={28} weight="duotone" className="text-muted-foreground" aria-hidden />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} disabled={uploading}>
            {uploading ? (
              <CircleNotchIcon data-icon="inline-start" className="animate-spin" />
            ) : (
              <CameraIcon data-icon="inline-start" />
            )}
            {uploading ? 'Subiendo…' : value ? 'Cambiar foto' : 'Subir foto'}
          </Button>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onPick} />
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
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
