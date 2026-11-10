import { CoffeeIcon, ForkKnifeIcon, TagIcon } from '@phosphor-icons/react';
import type { CategoryType } from '@zarape/shared';
import { Badge } from '@zarape/ui/components/badge';
import { useState } from 'react';
import { CatalogPage } from '@/components/catalog/CatalogPage';
import { CatalogTable } from '@/components/catalog/CatalogTable';
import { SelectField, StatusFilter, TextField } from '@/components/catalog/fields';
import { FormDialog } from '@/components/catalog/FormDialog';
import { STATUS_OPTIONS } from '@/components/catalog/options';
import { RowActions } from '@/components/catalog/RowActions';
import { summarizeFilters } from '@/components/catalog/summary';
import { useCatalog } from '@/components/catalog/useCatalog';
import { type FieldErrors, required, useForm } from '@/components/catalog/useForm';
import { StatusBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';

interface Values {
  name: string;
  type: CategoryType;
  status: string;
}

const EMPTY: Values = { name: '', type: 'FOOD', status: 'ACTIVE' };
const EMPTY_FILTERS = { name: '', type: '', status: '' };
const TYPE_LABELS = { FOOD: 'Alimentos', DRINK: 'Bebidas' } as const;

const validate = (v: Values): FieldErrors<Values> => ({ name: required(v.name, 'Escribe el nombre.') });

/** Categorías de alimentos (Platillos, Ensaladas…) y de bebidas (Refrescos, Aguas…), RF04 y RF05. */
export function Categories() {
  const list = useCatalog<Category>('/categories');
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const form = useForm<Values>(EMPTY);
  const v = form.values;
  const editing = list.rows.find((c) => c.id === form.editingId);

  function save() {
    form.save(validate, async (values) => {
      if (form.isNew) await api('POST', '/categories', { name: values.name, type: values.type });
      else await api('PATCH', `/categories/${form.editingId}`, values);
      list.reload();
      return form.isNew ? `Categoría ${values.name} agregada` : 'Cambios guardados';
    });
  }

  return (
    <CatalogPage
      title="Categorías"
      description="Cómo se agrupa el menú de alimentos y de bebidas."
      icon={TagIcon}
      addLabel="Agregar categoría"
      onAdd={() => form.openWith(null, EMPTY)}
      onSearch={() => list.search(draft)}
      onClear={() => {
        setDraft(EMPTY_FILTERS);
        list.search({});
      }}
      filterSummary={summarizeFilters(list.filters, { name: 'Nombre', type: 'Tipo' }, { type: (t) => TYPE_LABELS[t as CategoryType] })}
      total={list.rows.length}
      filters={
        <>
          <TextField label="Nombre" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-56" />
          <SelectField
            label="Tipo"
            value={draft.type || 'ALL'}
            onChange={(t) => setDraft({ ...draft, type: t === 'ALL' ? '' : t })}
            options={[
              { value: 'ALL', label: 'Todos' },
              { value: 'FOOD', label: 'Alimentos' },
              { value: 'DRINK', label: 'Bebidas' },
            ]}
            className="w-44"
          />
          <StatusFilter value={draft.status} onChange={(status) => setDraft({ ...draft, status })} />
        </>
      }
    >
      <CatalogTable
        rows={list.rows}
        loading={list.loading}
        error={list.error}
        emptyMessage="No hay categorías con esos filtros."
        columns={[
          { header: 'Categoría', cell: (c) => <span className="font-semibold">{c.name}</span> },
          {
            header: 'Tipo',
            cell: (c) => (
              <Badge variant="outline">
                {c.type === 'FOOD' ? <ForkKnifeIcon data-icon="inline-start" /> : <CoffeeIcon data-icon="inline-start" />}
                {TYPE_LABELS[c.type]}
              </Badge>
            ),
          },
          { header: 'Productos', cell: (c) => <span className="tabular-nums">{c.productCount}</span>, className: 'text-right' },
          { header: 'Estatus', cell: (c) => <StatusBadge status={c.status} /> },
        ]}
        actions={(c) => (
          <RowActions
            label={`la categoría ${c.name}`}
            deletePath={`/categories/${c.id}`}
            inactive={c.status === 'INACTIVE'}
            onEdit={() => form.openWith(c.id, { name: c.name, type: c.type, status: c.status })}
            onDeleted={list.reload}
          />
        )}
      />

      <FormDialog
        open={form.open}
        onClose={form.close}
        title={form.isNew ? 'Agregar categoría' : `Editar categoría #${form.editingId}`}
        description="Todos los campos son obligatorios."
        saving={form.saving}
        error={form.formError}
        onSave={save}
      >
        <TextField label="Nombre" value={v.name} error={form.errors.name} onChange={(e) => form.set('name', e.target.value)} />
        <SelectField
          label="Agrupa"
          value={v.type}
          onChange={(t) => form.set('type', t as CategoryType)}
          options={[
            { value: 'FOOD', label: 'Alimentos' },
            { value: 'DRINK', label: 'Bebidas' },
          ]}
          error={editing && editing.productCount > 0 && v.type !== editing.type ? 'Ya tiene productos; no puede cambiar de tipo.' : undefined}
        />
        {!form.isNew && (
          <SelectField label="Estatus" value={v.status} onChange={(s) => form.set('status', s)} options={STATUS_OPTIONS} />
        )}
      </FormDialog>
    </CatalogPage>
  );
}
