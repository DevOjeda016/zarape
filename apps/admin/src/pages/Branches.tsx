import { CrosshairIcon, GlobeIcon, MapPinIcon, StorefrontIcon } from '@phosphor-icons/react';
import { Button } from '@zarape/ui/components/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@zarape/ui/components/field';
import { Textarea } from '@zarape/ui/components/textarea';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { CatalogPage } from '@/components/catalog/CatalogPage';
import { CatalogTable } from '@/components/catalog/CatalogTable';
import { PhotoField, SelectField, StatusFilter, TextField } from '@/components/catalog/fields';
import { FormDialog } from '@/components/catalog/FormDialog';
import { STATUS_OPTIONS } from '@/components/catalog/options';
import { RowActions } from '@/components/catalog/RowActions';
import { summarizeFilters } from '@/components/catalog/summary';
import { useCatalog } from '@/components/catalog/useCatalog';
import { type FieldErrors, required, useForm } from '@/components/catalog/useForm';
import { StatusBadge } from '@/components/StatusBadge';
import { api, photoSrc } from '@/lib/api';
import type { Branch } from '@/lib/types';

interface Values {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  photoUrl: string;
  url: string;
  hours: string;
  status: string;
}

const EMPTY: Values = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  photoUrl: '',
  url: '',
  hours: '',
  status: 'ACTIVE',
};

const EMPTY_FILTERS = { name: '', location: '', status: '' };

function validate(v: Values): FieldErrors<Values> {
  const lat = Number(v.latitude);
  const lng = Number(v.longitude);
  return {
    name: required(v.name, 'Escribe el nombre.'),
    address: required(v.address, 'Escribe la dirección.'),
    latitude: !v.latitude.trim() || !Number.isFinite(lat) || Math.abs(lat) > 90 ? 'Latitud de -90 a 90.' : undefined,
    longitude: !v.longitude.trim() || !Number.isFinite(lng) || Math.abs(lng) > 180 ? 'Longitud de -180 a 180.' : undefined,
    photoUrl: required(v.photoUrl, 'Sube una foto o pega una URL.'),
    url: /^https?:\/\/\S+\.\S+/.test(v.url.trim()) ? undefined : 'Escribe una URL completa (https://…).',
    hours: required(v.hours, 'Escribe los horarios.'),
  };
}

/** RF02: catálogo de sucursales. Búsqueda por nombre o ubicación (RDF0204). */
export function Branches() {
  const list = useCatalog<Branch>('/branches');
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const form = useForm<Values>(EMPTY);
  const hoursId = useId();
  const v = form.values;

  function edit(b: Branch) {
    // Solo los campos editables: el ID nunca viaja en el cuerpo (RDF0203)
    form.openWith(b.id, {
      name: b.name,
      address: b.address,
      latitude: String(b.latitude),
      longitude: String(b.longitude),
      photoUrl: b.photoUrl,
      url: b.url,
      hours: b.hours,
      status: b.status,
    });
  }

  function fillMyLocation() {
    if (!('geolocation' in navigator)) return toast.error('Este navegador no da la ubicación.');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        form.set('latitude', coords.latitude.toFixed(6));
        form.set('longitude', coords.longitude.toFixed(6));
      },
      () => toast.error('No pudimos leer tu ubicación. Revisa el permiso del navegador.'),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  function save() {
    form.save(validate, async (values) => {
      const body = { ...values, latitude: Number(values.latitude), longitude: Number(values.longitude) };
      if (form.isNew) {
        const { status: _, ...create } = body;
        await api('POST', '/branches', create);
      } else {
        await api('PATCH', `/branches/${form.editingId}`, body);
      }
      list.reload();
      return form.isNew ? `Sucursal ${values.name} agregada` : 'Cambios guardados';
    });
  }

  return (
    <CatalogPage
      title="Sucursales"
      description="Dónde está cada restaurante, sus horarios y su página."
      icon={StorefrontIcon}
      addLabel="Agregar sucursal"
      onAdd={() => form.openWith(null, EMPTY)}
      onSearch={() => list.search(draft)}
      onClear={() => {
        setDraft(EMPTY_FILTERS);
        list.search({});
      }}
      filterSummary={summarizeFilters(list.filters, { name: 'Nombre', location: 'Ubicación' })}
      total={list.rows.length}
      filters={
        <>
          <TextField
            label="Nombre"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Centro"
            className="w-56"
          />
          <TextField
            label="Ubicación"
            value={draft.location}
            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            placeholder="Calle, colonia o ciudad"
            className="w-64"
          />
          <StatusFilter value={draft.status} onChange={(status) => setDraft({ ...draft, status })} />
        </>
      }
    >
      <CatalogTable
        rows={list.rows}
        loading={list.loading}
        error={list.error}
        emptyMessage="No hay sucursales con esos filtros. Prueba con menos palabras."
        columns={[
          {
            header: 'Sucursal',
            cell: (b) => (
              <div className="flex items-center gap-3">
                <img src={photoSrc(b.photoUrl)} alt="" className="aspect-[4/3] w-14 shrink-0 rounded-md object-cover" loading="lazy" />
                <span className="font-semibold">{b.name}</span>
              </div>
            ),
          },
          {
            header: 'Dirección',
            cell: (b) => (
              <span className="flex flex-col">
                {b.address}
                <span className="text-xs text-muted-foreground tabular-nums">
                  <MapPinIcon className="inline" aria-hidden /> {b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}
                </span>
              </span>
            ),
          },
          { header: 'Horarios', cell: (b) => b.hours },
          {
            header: 'Página',
            cell: (b) => (
              <a
                href={b.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
              >
                <GlobeIcon aria-hidden />
                <span className="print:hidden">Abrir</span>
                <span className="hidden print:inline">{b.url}</span>
              </a>
            ),
          },
          { header: 'Estatus', cell: (b) => <StatusBadge status={b.status} /> },
        ]}
        actions={(b) => (
          <RowActions
            label={`la sucursal ${b.name}`}
            deletePath={`/branches/${b.id}`}
            inactive={b.status === 'INACTIVE'}
            onEdit={() => edit(b)}
            onDeleted={list.reload}
          />
        )}
      />

      <FormDialog
        open={form.open}
        onClose={form.close}
        title={form.isNew ? 'Agregar sucursal' : `Editar sucursal #${form.editingId}`}
        description="Todos los campos son obligatorios."
        saving={form.saving}
        error={form.formError}
        onSave={save}
        width="wide"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nombre" value={v.name} error={form.errors.name} onChange={(e) => form.set('name', e.target.value)} />
          <TextField
            label="Página web"
            type="url"
            value={v.url}
            error={form.errors.url}
            placeholder="https://"
            onChange={(e) => form.set('url', e.target.value)}
          />
        </div>
        <TextField label="Dirección" value={v.address} error={form.errors.address} onChange={(e) => form.set('address', e.target.value)} />
        <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <TextField
            label="Latitud (GPS)"
            inputMode="decimal"
            value={v.latitude}
            error={form.errors.latitude}
            placeholder="21.122300"
            onChange={(e) => form.set('latitude', e.target.value)}
          />
          <TextField
            label="Longitud (GPS)"
            inputMode="decimal"
            value={v.longitude}
            error={form.errors.longitude}
            placeholder="-101.682900"
            onChange={(e) => form.set('longitude', e.target.value)}
          />
          <Button type="button" variant="outline" size="lg" onClick={fillMyLocation}>
            <CrosshairIcon data-icon="inline-start" />
            Usar mi ubicación
          </Button>
        </div>
        <Field data-invalid={!!form.errors.hours || undefined}>
          <FieldLabel htmlFor={hoursId}>Horarios</FieldLabel>
          <Textarea
            id={hoursId}
            rows={2}
            value={v.hours}
            aria-invalid={!!form.errors.hours || undefined}
            placeholder="Lunes a domingo, 7:00 a 15:00"
            onChange={(e) => form.set('hours', e.target.value)}
          />
          <FieldDescription>Como lo verá el cliente.</FieldDescription>
          {form.errors.hours && <FieldError>{form.errors.hours}</FieldError>}
        </Field>
        <PhotoField value={v.photoUrl} onChange={(url) => form.set('photoUrl', url)} error={form.errors.photoUrl} alt={`Sucursal ${v.name}`} />
        {!form.isNew && (
          <SelectField label="Estatus" value={v.status} onChange={(s) => form.set('status', s)} options={STATUS_OPTIONS} />
        )}
      </FormDialog>
    </CatalogPage>
  );
}
