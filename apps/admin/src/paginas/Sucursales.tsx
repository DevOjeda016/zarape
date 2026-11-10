import { CrosshairIcon, GlobeIcon, MapPinIcon, StorefrontIcon } from '@phosphor-icons/react';
import { Button } from '@zarape/ui/components/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@zarape/ui/components/field';
import { Textarea } from '@zarape/ui/components/textarea';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { BotonesFila } from '@/components/catalogo/BotonesFila';
import { CampoFoto, CampoSelect, CampoTexto, FiltroEstatus } from '@/components/catalogo/campos';
import { OPCIONES_ESTATUS } from '@/components/catalogo/opciones';
import { DialogoFormulario } from '@/components/catalogo/DialogoFormulario';
import { PaginaCatalogo } from '@/components/catalogo/PaginaCatalogo';
import { resumirFiltros } from '@/components/catalogo/resumen';
import { TablaCatalogo } from '@/components/catalogo/TablaCatalogo';
import { useCatalogo } from '@/components/catalogo/useCatalogo';
import { type Errores, requerido, useFormulario } from '@/components/catalogo/useFormulario';
import { EstatusInsignia } from '@/components/EstatusInsignia';
import { api, urlFoto } from '@/lib/api';
import type { Sucursal } from '@/lib/tipos';

interface Valores {
  nombre: string;
  direccion: string;
  latitud: string;
  longitud: string;
  fotoUrl: string;
  url: string;
  horarios: string;
  estatus: string;
}

const VACIO: Valores = {
  nombre: '',
  direccion: '',
  latitud: '',
  longitud: '',
  fotoUrl: '',
  url: '',
  horarios: '',
  estatus: 'ACTIVO',
};

const FILTROS_VACIOS = { nombre: '', ubicacion: '', estatus: '' };

function validar(v: Valores): Errores<Valores> {
  const lat = Number(v.latitud);
  const lng = Number(v.longitud);
  return {
    nombre: requerido(v.nombre, 'Escribe el nombre.'),
    direccion: requerido(v.direccion, 'Escribe la dirección.'),
    latitud: !v.latitud.trim() || !Number.isFinite(lat) || Math.abs(lat) > 90 ? 'Latitud de -90 a 90.' : undefined,
    longitud: !v.longitud.trim() || !Number.isFinite(lng) || Math.abs(lng) > 180 ? 'Longitud de -180 a 180.' : undefined,
    fotoUrl: requerido(v.fotoUrl, 'Sube una foto o pega una URL.'),
    url: /^https?:\/\/\S+\.\S+/.test(v.url.trim()) ? undefined : 'Escribe una URL completa (https://…).',
    horarios: requerido(v.horarios, 'Escribe los horarios.'),
  };
}

/** RF02: catálogo de sucursales. Búsqueda por nombre o ubicación (RDF0204). */
export function Sucursales() {
  const lista = useCatalogo<Sucursal>('/sucursales');
  const [borrador, setBorrador] = useState(FILTROS_VACIOS);
  const form = useFormulario<Valores>(VACIO);
  const idHorarios = useId();
  const v = form.valores;

  function editar(s: Sucursal) {
    // Solo los campos editables: el ID nunca viaja en el cuerpo (RDF0203)
    form.abrir(s.id, {
      nombre: s.nombre,
      direccion: s.direccion,
      latitud: String(s.latitud),
      longitud: String(s.longitud),
      fotoUrl: s.fotoUrl,
      url: s.url,
      horarios: s.horarios,
      estatus: s.estatus,
    });
  }

  function usarMiUbicacion() {
    if (!('geolocation' in navigator)) return toast.error('Este navegador no da la ubicación.');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        form.cambiar('latitud', coords.latitude.toFixed(6));
        form.cambiar('longitud', coords.longitude.toFixed(6));
      },
      () => toast.error('No pudimos leer tu ubicación. Revisa el permiso del navegador.'),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  function guardar() {
    form.guardar(validar, async (valores) => {
      const cuerpo = { ...valores, latitud: Number(valores.latitud), longitud: Number(valores.longitud) };
      if (form.esNuevo) {
        const { estatus: _, ...alta } = cuerpo;
        await api('POST', '/sucursales', alta);
      } else {
        await api('PATCH', `/sucursales/${form.idEditando}`, cuerpo);
      }
      lista.recargar();
      return form.esNuevo ? `Sucursal ${valores.nombre} agregada` : 'Cambios guardados';
    });
  }

  return (
    <PaginaCatalogo
      titulo="Sucursales"
      descripcion="Dónde está cada restaurante, sus horarios y su página."
      icono={StorefrontIcon}
      agregar="Agregar sucursal"
      onAgregar={() => form.abrir(null, VACIO)}
      onBuscar={() => lista.buscar(borrador)}
      onLimpiar={() => {
        setBorrador(FILTROS_VACIOS);
        lista.buscar({});
      }}
      resumenFiltros={resumirFiltros(lista.filtros, { nombre: 'Nombre', ubicacion: 'Ubicación' })}
      total={lista.datos.length}
      filtros={
        <>
          <CampoTexto
            etiqueta="Nombre"
            value={borrador.nombre}
            onChange={(e) => setBorrador({ ...borrador, nombre: e.target.value })}
            placeholder="Centro"
            className="w-56"
          />
          <CampoTexto
            etiqueta="Ubicación"
            value={borrador.ubicacion}
            onChange={(e) => setBorrador({ ...borrador, ubicacion: e.target.value })}
            placeholder="Calle, colonia o ciudad"
            className="w-64"
          />
          <FiltroEstatus valor={borrador.estatus} onCambio={(estatus) => setBorrador({ ...borrador, estatus })} />
        </>
      }
    >
      <TablaCatalogo
        filas={lista.datos}
        cargando={lista.cargando}
        error={lista.error}
        vacio="No hay sucursales con esos filtros. Prueba con menos palabras."
        columnas={[
          {
            titulo: 'Sucursal',
            celda: (s) => (
              <div className="flex items-center gap-3">
                <img src={urlFoto(s.fotoUrl)} alt="" className="aspect-[4/3] w-14 shrink-0 rounded-md object-cover" loading="lazy" />
                <span className="font-semibold">{s.nombre}</span>
              </div>
            ),
          },
          {
            titulo: 'Dirección',
            celda: (s) => (
              <span className="flex flex-col">
                {s.direccion}
                <span className="text-xs text-muted-foreground tabular-nums">
                  <MapPinIcon className="inline" aria-hidden /> {s.latitud.toFixed(4)}, {s.longitud.toFixed(4)}
                </span>
              </span>
            ),
          },
          { titulo: 'Horarios', celda: (s) => s.horarios },
          {
            titulo: 'Página',
            celda: (s) => (
              <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">
                <GlobeIcon aria-hidden />
                <span className="print:hidden">Abrir</span>
                <span className="hidden print:inline">{s.url}</span>
              </a>
            ),
          },
          { titulo: 'Estatus', celda: (s) => <EstatusInsignia estatus={s.estatus} /> },
        ]}
        acciones={(s) => (
          <BotonesFila
            nombre={`la sucursal ${s.nombre}`}
            rutaEliminar={`/sucursales/${s.id}`}
            yaEnBaja={s.estatus === 'BAJA'}
            onEditar={() => editar(s)}
            onEliminado={lista.recargar}
          />
        )}
      />

      <DialogoFormulario
        abierto={form.abierto}
        onCerrar={form.cerrar}
        titulo={form.esNuevo ? 'Agregar sucursal' : `Editar sucursal #${form.idEditando}`}
        descripcion="Todos los campos son obligatorios."
        guardando={form.guardando}
        error={form.errorGeneral}
        onGuardar={guardar}
        ancho="amplio"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto etiqueta="Nombre" value={v.nombre} error={form.errores.nombre} onChange={(e) => form.cambiar('nombre', e.target.value)} />
          <CampoTexto
            etiqueta="Página web"
            type="url"
            value={v.url}
            error={form.errores.url}
            placeholder="https://"
            onChange={(e) => form.cambiar('url', e.target.value)}
          />
        </div>
        <CampoTexto etiqueta="Dirección" value={v.direccion} error={form.errores.direccion} onChange={(e) => form.cambiar('direccion', e.target.value)} />
        <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <CampoTexto
            etiqueta="Latitud (GPS)"
            inputMode="decimal"
            value={v.latitud}
            error={form.errores.latitud}
            placeholder="21.122300"
            onChange={(e) => form.cambiar('latitud', e.target.value)}
          />
          <CampoTexto
            etiqueta="Longitud (GPS)"
            inputMode="decimal"
            value={v.longitud}
            error={form.errores.longitud}
            placeholder="-101.682900"
            onChange={(e) => form.cambiar('longitud', e.target.value)}
          />
          <Button type="button" variant="outline" size="lg" onClick={usarMiUbicacion}>
            <CrosshairIcon data-icon="inline-start" />
            Usar mi ubicación
          </Button>
        </div>
        <Field data-invalid={!!form.errores.horarios || undefined}>
          <FieldLabel htmlFor={idHorarios}>Horarios</FieldLabel>
          <Textarea
            id={idHorarios}
            rows={2}
            value={v.horarios}
            aria-invalid={!!form.errores.horarios || undefined}
            placeholder="Lunes a domingo, 7:00 a 15:00"
            onChange={(e) => form.cambiar('horarios', e.target.value)}
          />
          <FieldDescription>Como lo verá el cliente.</FieldDescription>
          {form.errores.horarios && <FieldError>{form.errores.horarios}</FieldError>}
        </Field>
        <CampoFoto valor={v.fotoUrl} onCambio={(url) => form.cambiar('fotoUrl', url)} error={form.errores.fotoUrl} alt={`Sucursal ${v.nombre}`} />
        {!form.esNuevo && (
          <CampoSelect etiqueta="Estatus" valor={v.estatus} onCambio={(e) => form.cambiar('estatus', e)} opciones={OPCIONES_ESTATUS} />
        )}
      </DialogoFormulario>
    </PaginaCatalogo>
  );
}
