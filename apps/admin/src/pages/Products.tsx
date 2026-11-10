import { CoffeeIcon, ForkKnifeIcon } from '@phosphor-icons/react';
import type { CategoryType } from '@zarape/shared';
import { Field, FieldError, FieldLabel } from '@zarape/ui/components/field';
import { Textarea } from '@zarape/ui/components/textarea';
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
import type { Category, Product } from '@/lib/types';

interface Values {
  name: string;
  description: string;
  photoUrl: string;
  price: string;
  categoryId: string;
  status: string;
}

const EMPTY: Values = { name: '', description: '', photoUrl: '', price: '', categoryId: '', status: 'ACTIVE' };
const EMPTY_FILTERS = { name: '', categoryId: '', minPrice: '', maxPrice: '', status: '' };

const TEXTS = {
  FOOD: {
    path: '/foods',
    title: 'Alimentos',
    singular: 'alimento',
    column: 'Alimento',
    description: 'Platillos, ensaladas, tortas, postres y fruta del menú.',
    icon: ForkKnifeIcon,
    example: 'Chilaquiles rojos con pollo',
  },
  DRINK: {
    path: '/drinks',
    title: 'Bebidas',
    singular: 'bebida',
    column: 'Bebida',
    description: 'Cafés, jugos, aguas y refrescos del menú.',
    icon: CoffeeIcon,
    example: 'Café de olla',
  },
} as const;

function validate(v: Values): FieldErrors<Values> {
  return {
    name: required(v.name, 'Escribe el nombre.'),
    description: required(v.description, 'Escribe la descripción.'),
    photoUrl: required(v.photoUrl, 'Sube una foto o pega una URL.'),
    price: validatePrice(v.price),
    categoryId: v.categoryId ? undefined : 'Elige una categoría.',
  };
}

/** RF04 (alimentos) y RF05 (bebidas): mismos campos y búsqueda por nombre, precio o categoría. */
export function Products({ type }: { type: CategoryType }) {
  const t = TEXTS[type];
  const list = useCatalog<Product>(t.path);
  const categories = useOptions<Category>(`/categories?type=${type}`);
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const form = useForm<Values>(EMPTY);
  const descriptionId = useId();
  const v = form.values;

  // En el alta solo categorías activas; al editar se conserva la actual aunque esté en baja
  const categoryOptions = categories
    .filter((c) => c.status === 'ACTIVE' || String(c.id) === v.categoryId)
    .map((c) => ({ value: String(c.id), label: c.status === 'INACTIVE' ? `${c.name} (baja)` : c.name }));

  function edit(p: Product) {
    form.openWith(p.id, {
      name: p.name,
      description: p.description,
      photoUrl: p.photoUrl,
      price: p.price.toFixed(2),
      categoryId: String(p.categoryId),
      status: p.status,
    });
  }

  function save() {
    form.save(validate, async (values) => {
      const body = {
        name: values.name,
        description: values.description,
        photoUrl: values.photoUrl,
        price: Number(values.price),
        categoryId: Number(values.categoryId),
      };
      if (form.isNew) await api('POST', t.path, body);
      else await api('PATCH', `${t.path}/${form.editingId}`, { ...body, status: values.status });
      list.reload();
      return form.isNew ? `${values.name} agregado al menú` : 'Cambios guardados';
    });
  }

  return (
    <CatalogPage
      title={t.title}
      description={t.description}
      icon={t.icon}
      addLabel={`Agregar ${t.singular}`}
      onAdd={() => form.openWith(null, EMPTY)}
      onSearch={() => list.search(draft)}
      onClear={() => {
        setDraft(EMPTY_FILTERS);
        list.search({});
      }}
      filterSummary={summarizeFilters(
        list.filters,
        { name: 'Nombre', categoryId: 'Categoría', minPrice: 'Precio desde', maxPrice: 'Precio hasta' },
        {
          categoryId: (id) => categories.find((c) => String(c.id) === id)?.name ?? id,
          minPrice: (p) => formatPrice(Number(p)),
          maxPrice: (p) => formatPrice(Number(p)),
        },
      )}
      total={list.rows.length}
      filters={
        <>
          <TextField label="Nombre" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-56" />
          <SelectField
            label="Categoría"
            value={draft.categoryId || 'ALL'}
            onChange={(c) => setDraft({ ...draft, categoryId: c === 'ALL' ? '' : c })}
            options={[{ value: 'ALL', label: 'Todas' }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))]}
            className="w-52"
          />
          <TextField
            label="Precio desde"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={draft.minPrice}
            onChange={(e) => setDraft({ ...draft, minPrice: e.target.value })}
            placeholder="$0.00"
            className="w-32"
          />
          <TextField
            label="Precio hasta"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={draft.maxPrice}
            onChange={(e) => setDraft({ ...draft, maxPrice: e.target.value })}
            placeholder="$999.00"
            className="w-32"
          />
          <StatusFilter value={draft.status} onChange={(status) => setDraft({ ...draft, status })} />
        </>
      }
    >
      <CatalogTable
        rows={list.rows}
        loading={list.loading}
        error={list.error}
        emptyMessage={`No hay ${t.title.toLowerCase()} con esos filtros.`}
        columns={[
          {
            header: t.column,
            cell: (p) => (
              <div className="flex items-center gap-3">
                <img src={photoSrc(p.photoUrl)} alt="" className="aspect-[4/3] w-14 shrink-0 rounded-md object-cover" loading="lazy" />
                <span className="flex flex-col">
                  <span className="font-semibold">{p.name}</span>
                  <span className="line-clamp-2 text-xs text-muted-foreground print:line-clamp-none">{p.description}</span>
                </span>
              </div>
            ),
          },
          { header: 'Categoría', cell: (p) => p.category.name },
          {
            header: 'Precio',
            cell: (p) => <span className="font-bold tabular-nums">{formatPrice(p.price)}</span>,
            className: 'text-right',
          },
          { header: 'Estatus', cell: (p) => <StatusBadge status={p.status} /> },
        ]}
        actions={(p) => (
          <RowActions
            label={p.name}
            deletePath={`${t.path}/${p.id}`}
            inactive={p.status === 'INACTIVE'}
            onEdit={() => edit(p)}
            onDeleted={list.reload}
          />
        )}
      />

      <FormDialog
        open={form.open}
        onClose={form.close}
        title={form.isNew ? `Agregar ${t.singular}` : `Editar ${t.singular} #${form.editingId}`}
        description="Todos los campos son obligatorios. El precio incluye IVA."
        saving={form.saving}
        error={form.formError}
        onSave={save}
        width="wide"
      >
        <TextField
          label="Nombre"
          value={v.name}
          error={form.errors.name}
          placeholder={t.example}
          onChange={(e) => form.set('name', e.target.value)}
        />
        <Field data-invalid={!!form.errors.description || undefined}>
          <FieldLabel htmlFor={descriptionId}>Descripción</FieldLabel>
          <Textarea
            id={descriptionId}
            rows={3}
            value={v.description}
            aria-invalid={!!form.errors.description || undefined}
            onChange={(e) => form.set('description', e.target.value)}
          />
          {form.errors.description && <FieldError>{form.errors.description}</FieldError>}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <PriceField value={v.price} error={form.errors.price} onChange={(e) => form.set('price', e.target.value)} />
          <SelectField
            label="Categoría"
            value={v.categoryId}
            onChange={(c) => form.set('categoryId', c)}
            options={categoryOptions}
            error={form.errors.categoryId}
          />
        </div>
        <PhotoField value={v.photoUrl} onChange={(url) => form.set('photoUrl', url)} error={form.errors.photoUrl} alt={v.name} />
        {!form.isNew && (
          <SelectField label="Estatus" value={v.status} onChange={(s) => form.set('status', s)} options={STATUS_OPTIONS} />
        )}
      </FormDialog>
    </CatalogPage>
  );
}
