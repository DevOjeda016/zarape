import { CoffeeIcon, ForkKnifeIcon, MinusIcon, PackageIcon, PlusIcon, XIcon } from '@phosphor-icons/react';
import { Badge } from '@zarape/ui/components/badge';
import { Button } from '@zarape/ui/components/button';
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet } from '@zarape/ui/components/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@zarape/ui/components/select';
import { Textarea } from '@zarape/ui/components/textarea';
import { AnimatePresence, motion } from 'motion/react';
import { useId, useState } from 'react';
import { CatalogPage } from '@/components/catalog/CatalogPage';
import { CatalogTable } from '@/components/catalog/CatalogTable';
import { PhotoField, PriceField, SelectField, StatusFilter, TextField } from '@/components/catalog/fields';
import { FormDialog } from '@/components/catalog/FormDialog';
import { STATUS_OPTIONS } from '@/components/catalog/options';
import { RowActions } from '@/components/catalog/RowActions';
import { summarizeFilters } from '@/components/catalog/summary';
import { useCatalog, useOptions } from '@/components/catalog/useCatalog';
import { type FieldErrors, required, useForm, validatePrice } from '@/components/catalog/useForm';
import { StatusBadge } from '@/components/StatusBadge';
import { api, photoSrc } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import type { Combo, ComboItem, Product } from '@/lib/types';

type Kind = 'F' | 'D';
interface Line {
  kind: Kind;
  id: number;
  name: string;
  price: number;
  quantity: number;
  inactive: boolean;
}

interface Values {
  name: string;
  description: string;
  photoUrl: string;
  price: string;
  status: string;
  lines: Line[];
}

const EMPTY: Values = { name: '', description: '', photoUrl: '', price: '', status: 'ACTIVE', lines: [] };
const EMPTY_FILTERS = { name: '', food: '', drink: '', status: '' };

function validate(v: Values): FieldErrors<Values> {
  return {
    name: required(v.name, 'Escribe el nombre.'),
    description: required(v.description, 'Escribe la descripción.'),
    photoUrl: required(v.photoUrl, 'Sube una foto o pega una URL.'),
    price: validatePrice(v.price),
    lines: v.lines.length ? undefined : 'Agrega al menos un alimento o una bebida.',
  };
}

const toLine =
  (kind: Kind) =>
  (c: ComboItem): Line => ({ kind, id: c.id, name: c.name, price: c.price, quantity: c.quantity, inactive: c.status === 'INACTIVE' });

const KindIcon = ({ kind }: { kind: Kind }) =>
  kind === 'F' ? <ForkKnifeIcon aria-label="Alimento" /> : <CoffeeIcon aria-label="Bebida" />;

/** RF06: combos con varios alimentos y/o bebidas de sus catálogos. Búsqueda por nombre, alimento o bebida. */
export function Combos() {
  const list = useCatalog<Combo>('/combos');
  const foods = useOptions<Product>('/foods?status=ACTIVE');
  const drinks = useOptions<Product>('/drinks?status=ACTIVE');
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const form = useForm<Values>(EMPTY);
  const descriptionId = useId();
  const addId = useId();
  const v = form.values;

  const separatePrice = v.lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const savings = separatePrice - Number(v.price || 0);

  function addLine(key: string) {
    const [kind, id] = [key[0] as Kind, Number(key.slice(2))];
    const existing = v.lines.find((l) => l.kind === kind && l.id === id);
    if (existing) return changeQuantity(existing, 1);
    const product = (kind === 'F' ? foods : drinks).find((p) => p.id === id);
    if (!product) return;
    form.set('lines', [...v.lines, { kind, id, name: product.name, price: product.price, quantity: 1, inactive: false }]);
  }

  function changeQuantity(line: Line, delta: number) {
    form.set(
      'lines',
      v.lines.map((l) => (l === line ? { ...l, quantity: Math.min(20, Math.max(1, l.quantity + delta)) } : l)),
    );
  }

  function save() {
    form.save(validate, async (values) => {
      const items = (kind: Kind) => values.lines.filter((l) => l.kind === kind).map(({ id, quantity }) => ({ id, quantity }));
      const body = {
        name: values.name,
        description: values.description,
        photoUrl: values.photoUrl,
        price: Number(values.price),
        foods: items('F'),
        drinks: items('D'),
      };
      if (form.isNew) await api('POST', '/combos', body);
      else await api('PATCH', `/combos/${form.editingId}`, { ...body, status: values.status });
      list.reload();
      return form.isNew ? `${values.name} agregado` : 'Cambios guardados';
    });
  }

  function edit(c: Combo) {
    form.openWith(c.id, {
      name: c.name,
      description: c.description,
      photoUrl: c.photoUrl,
      price: c.price.toFixed(2),
      status: c.status,
      lines: [...c.foods.map(toLine('F')), ...c.drinks.map(toLine('D'))],
    });
  }

  const available = (kind: Kind, products: Product[]) =>
    products.filter((p) => !v.lines.some((l) => l.kind === kind && l.id === p.id));

  return (
    <CatalogPage
      title="Combos"
      description="Paquetes de desayuno a menor precio que por separado."
      icon={PackageIcon}
      addLabel="Agregar combo"
      onAdd={() => form.openWith(null, EMPTY)}
      onSearch={() => list.search(draft)}
      onClear={() => {
        setDraft(EMPTY_FILTERS);
        list.search({});
      }}
      filterSummary={summarizeFilters(list.filters, { name: 'Nombre', food: 'Con alimento', drink: 'Con bebida' })}
      total={list.rows.length}
      filters={
        <>
          <TextField label="Nombre" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-48" />
          <TextField
            label="Incluye alimento"
            value={draft.food}
            onChange={(e) => setDraft({ ...draft, food: e.target.value })}
            placeholder="Chilaquiles"
            className="w-48"
          />
          <TextField
            label="Incluye bebida"
            value={draft.drink}
            onChange={(e) => setDraft({ ...draft, drink: e.target.value })}
            placeholder="Café"
            className="w-48"
          />
          <StatusFilter value={draft.status} onChange={(status) => setDraft({ ...draft, status })} />
        </>
      }
    >
      <CatalogTable
        rows={list.rows}
        loading={list.loading}
        error={list.error}
        emptyMessage="No hay combos con esos filtros."
        columns={[
          {
            header: 'Combo',
            cell: (c) => (
              <div className="flex items-center gap-3">
                <img src={photoSrc(c.photoUrl)} alt="" className="aspect-[4/3] w-14 shrink-0 rounded-md object-cover" loading="lazy" />
                <span className="font-semibold">{c.name}</span>
              </div>
            ),
          },
          {
            header: 'Incluye',
            cell: (c) => (
              <ul className="flex flex-col gap-0.5 text-sm">
                {[...c.foods.map(toLine('F')), ...c.drinks.map(toLine('D'))].map((l) => (
                  <li key={`${l.kind}${l.id}`} className="flex items-center gap-1.5">
                    <KindIcon kind={l.kind} />
                    {l.quantity > 1 && <span className="font-semibold">{l.quantity}×</span>}
                    <span className={l.inactive ? 'text-muted-foreground line-through' : undefined}>{l.name}</span>
                  </li>
                ))}
              </ul>
            ),
          },
          {
            header: 'Precio',
            className: 'text-right',
            cell: (c) => (
              <span className="flex flex-col items-end">
                <span className="font-bold tabular-nums">{formatPrice(c.price)}</span>
                <span className="text-xs text-muted-foreground tabular-nums line-through">{formatPrice(c.separatePrice)}</span>
              </span>
            ),
          },
          {
            header: 'Ahorro',
            className: 'text-right',
            cell: (c) =>
              c.savings > 0 ? (
                <Badge variant="outline" className="border-transparent bg-chile-tinte text-chile tabular-nums">
                  {formatPrice(c.savings)}
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          { header: 'Estatus', cell: (c) => <StatusBadge status={c.status} /> },
        ]}
        actions={(c) => (
          <RowActions
            label={c.name}
            deletePath={`/combos/${c.id}`}
            inactive={c.status === 'INACTIVE'}
            onEdit={() => edit(c)}
            onDeleted={list.reload}
          />
        )}
      />

      <FormDialog
        open={form.open}
        onClose={form.close}
        title={form.isNew ? 'Agregar combo' : `Editar combo #${form.editingId}`}
        description="Todos los campos son obligatorios. Arma el combo con productos del menú."
        saving={form.saving}
        error={form.formError}
        onSave={save}
        width="wide"
      >
        <TextField label="Nombre" value={v.name} error={form.errors.name} placeholder="Combo Zarape" onChange={(e) => form.set('name', e.target.value)} />
        <Field data-invalid={!!form.errors.description || undefined}>
          <FieldLabel htmlFor={descriptionId}>Descripción</FieldLabel>
          <Textarea
            id={descriptionId}
            rows={2}
            value={v.description}
            aria-invalid={!!form.errors.description || undefined}
            onChange={(e) => form.set('description', e.target.value)}
          />
          {form.errors.description && <FieldError>{form.errors.description}</FieldError>}
        </Field>

        <FieldSet data-invalid={!!form.errors.lines || undefined}>
          <FieldLegend variant="label">Incluye</FieldLegend>
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {v.lines.map((l) => (
                <motion.li
                  key={`${l.kind}${l.id}`}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
                >
                  <KindIcon kind={l.kind} />
                  <span className="flex-1 text-sm">
                    {l.name}
                    {l.inactive && <span className="text-muted-foreground"> (baja)</span>}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">{formatPrice(l.price)}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => changeQuantity(l, -1)}
                    disabled={l.quantity <= 1}
                    aria-label={`Quitar uno de ${l.name}`}
                  >
                    <MinusIcon />
                  </Button>
                  <span className="w-6 text-center font-semibold tabular-nums" aria-label="Cantidad">
                    {l.quantity}
                  </span>
                  <Button type="button" variant="outline" size="icon" onClick={() => changeQuantity(l, 1)} aria-label={`Agregar otro ${l.name}`}>
                    <PlusIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => form.set('lines', v.lines.filter((x) => x !== l))}
                    aria-label={`Quitar ${l.name} del combo`}
                  >
                    <XIcon />
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <Field>
            <FieldLabel htmlFor={addId} className="sr-only">
              Agregar producto al combo
            </FieldLabel>
            <Select value="" onValueChange={addLine}>
              <SelectTrigger id={addId} className="w-full">
                <SelectValue placeholder="+ Agregar alimento o bebida" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Alimentos</SelectLabel>
                  {available('F', foods).map((p) => (
                    <SelectItem key={`F${p.id}`} value={`F:${p.id}`}>
                      {p.name} · {formatPrice(p.price)}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Bebidas</SelectLabel>
                  {available('D', drinks).map((p) => (
                    <SelectItem key={`D${p.id}`} value={`D:${p.id}`}>
                      {p.name} · {formatPrice(p.price)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          {form.errors.lines && <FieldError>{form.errors.lines}</FieldError>}
        </FieldSet>

        <div className="grid items-start gap-4 sm:grid-cols-2">
          <PriceField label="Precio del combo" value={v.price} error={form.errors.price} onChange={(e) => form.set('price', e.target.value)} />
          <Field>
            <FieldLabel>Por separado</FieldLabel>
            <p className="flex h-9 items-center text-lg font-bold tabular-nums">{formatPrice(separatePrice)}</p>
            <FieldDescription>
              {v.price && separatePrice > 0
                ? savings > 0
                  ? `El cliente ahorra ${formatPrice(savings)} (${((savings / separatePrice) * 100).toFixed(1)} %).`
                  : 'Ojo: el combo no sale más barato que por separado.'
                : 'Suma de los productos a su precio actual.'}
            </FieldDescription>
          </Field>
        </div>
        <PhotoField value={v.photoUrl} onChange={(url) => form.set('photoUrl', url)} error={form.errors.photoUrl} alt={v.name} />
        {!form.isNew && (
          <SelectField label="Estatus" value={v.status} onChange={(s) => form.set('status', s)} options={STATUS_OPTIONS} />
        )}
      </FormDialog>
    </CatalogPage>
  );
}
