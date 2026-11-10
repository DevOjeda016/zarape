import { CoffeeIcon, ForkKnifeIcon } from '@phosphor-icons/react';
import type { TipoCategoria } from '@zarape/shared';
import { Field, FieldError, FieldLabel } from '@zarape/ui/components/field';
import { Textarea } from '@zarape/ui/components/textarea';
import { useId, useState } from 'react';
import { BotonesFila } from '@/components/catalogo/BotonesFila';
import { CampoFoto, CampoPrecio, CampoSelect, CampoTexto, FiltroEstatus } from '@/components/catalogo/campos';
import { OPCIONES_ESTATUS } from '@/components/catalogo/opciones';
import { DialogoFormulario } from '@/components/catalogo/DialogoFormulario';
import { PaginaCatalogo } from '@/components/catalogo/PaginaCatalogo';
import { resumirFiltros } from '@/components/catalogo/resumen';
import { TablaCatalogo } from '@/components/catalogo/TablaCatalogo';
import { useCatalogo, useOpciones } from '@/components/catalogo/useCatalogo';
import { type Errores, requerido, useFormulario, validarPrecio } from '@/components/catalogo/useFormulario';
import { EstatusInsignia } from '@/components/EstatusInsignia';
import { api, urlFoto } from '@/lib/api';
import { formatoPrecio } from '@/lib/formato';
import type { Categoria, Producto } from '@/lib/tipos';

interface Valores {
  nombre: string;
  descripcion: string;
  fotoUrl: string;
  precio: string;
  categoriaId: string;
  estatus: string;
}

const VACIO: Valores = { nombre: '', descripcion: '', fotoUrl: '', precio: '', categoriaId: '', estatus: 'ACTIVO' };
const FILTROS_VACIOS = { nombre: '', categoriaId: '', precioMin: '', precioMax: '', estatus: '' };

const TEXTOS = {
  ALIMENTO: {
    ruta: '/alimentos',
    titulo: 'Alimentos',
    singular: 'alimento',
    descripcion: 'Platillos, ensaladas, tortas, postres y fruta del menú.',
    icono: ForkKnifeIcon,
    ejemplo: 'Chilaquiles rojos con pollo',
  },
  BEBIDA: {
    ruta: '/bebidas',
    titulo: 'Bebidas',
    singular: 'bebida',
    descripcion: 'Cafés, jugos, aguas y refrescos del menú.',
    icono: CoffeeIcon,
    ejemplo: 'Café de olla',
  },
} as const;

function validar(v: Valores): Errores<Valores> {
  return {
    nombre: requerido(v.nombre, 'Escribe el nombre.'),
    descripcion: requerido(v.descripcion, 'Escribe la descripción.'),
    fotoUrl: requerido(v.fotoUrl, 'Sube una foto o pega una URL.'),
    precio: validarPrecio(v.precio),
    categoriaId: v.categoriaId ? undefined : 'Elige una categoría.',
  };
}

/** RF04 (alimentos) y RF05 (bebidas): mismos campos y búsqueda por nombre, precio o categoría. */
export function Productos({ tipo }: { tipo: TipoCategoria }) {
  const t = TEXTOS[tipo];
  const lista = useCatalogo<Producto>(t.ruta);
  const categorias = useOpciones<Categoria>(`/categorias?tipo=${tipo}`);
  const [borrador, setBorrador] = useState(FILTROS_VACIOS);
  const form = useFormulario<Valores>(VACIO);
  const idDescripcion = useId();
  const v = form.valores;

  // En el alta solo categorías activas; al editar se conserva la actual aunque esté en baja
  const opcionesCategoria = categorias
    .filter((c) => c.estatus === 'ACTIVO' || String(c.id) === v.categoriaId)
    .map((c) => ({ valor: String(c.id), texto: c.estatus === 'BAJA' ? `${c.nombre} (baja)` : c.nombre }));

  function guardar() {
    form.guardar(validar, async (valores) => {
      const cuerpo = {
        nombre: valores.nombre,
        descripcion: valores.descripcion,
        fotoUrl: valores.fotoUrl,
        precio: Number(valores.precio),
        categoriaId: Number(valores.categoriaId),
      };
      if (form.esNuevo) await api('POST', t.ruta, cuerpo);
      else await api('PATCH', `${t.ruta}/${form.idEditando}`, { ...cuerpo, estatus: valores.estatus });
      lista.recargar();
      return form.esNuevo ? `${valores.nombre} agregado al menú` : 'Cambios guardados';
    });
  }

  return (
    <PaginaCatalogo
      titulo={t.titulo}
      descripcion={t.descripcion}
      icono={t.icono}
      agregar={`Agregar ${t.singular}`}
      onAgregar={() => form.abrir(null, VACIO)}
      onBuscar={() => lista.buscar(borrador)}
      onLimpiar={() => {
        setBorrador(FILTROS_VACIOS);
        lista.buscar({});
      }}
      resumenFiltros={resumirFiltros(
        lista.filtros,
        { nombre: 'Nombre', categoriaId: 'Categoría', precioMin: 'Precio desde', precioMax: 'Precio hasta' },
        {
          categoriaId: (id) => categorias.find((c) => String(c.id) === id)?.nombre ?? id,
          precioMin: (p) => formatoPrecio(Number(p)),
          precioMax: (p) => formatoPrecio(Number(p)),
        },
      )}
      total={lista.datos.length}
      filtros={
        <>
          <CampoTexto
            etiqueta="Nombre"
            value={borrador.nombre}
            onChange={(e) => setBorrador({ ...borrador, nombre: e.target.value })}
            className="w-56"
          />
          <CampoSelect
            etiqueta="Categoría"
            valor={borrador.categoriaId || 'TODOS'}
            onCambio={(c) => setBorrador({ ...borrador, categoriaId: c === 'TODOS' ? '' : c })}
            opciones={[{ valor: 'TODOS', texto: 'Todas' }, ...categorias.map((c) => ({ valor: String(c.id), texto: c.nombre }))]}
            className="w-52"
          />
          <CampoTexto
            etiqueta="Precio desde"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={borrador.precioMin}
            onChange={(e) => setBorrador({ ...borrador, precioMin: e.target.value })}
            placeholder="$0.00"
            className="w-32"
          />
          <CampoTexto
            etiqueta="Precio hasta"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={borrador.precioMax}
            onChange={(e) => setBorrador({ ...borrador, precioMax: e.target.value })}
            placeholder="$999.00"
            className="w-32"
          />
          <FiltroEstatus valor={borrador.estatus} onCambio={(estatus) => setBorrador({ ...borrador, estatus })} />
        </>
      }
    >
      <TablaCatalogo
        filas={lista.datos}
        cargando={lista.cargando}
        error={lista.error}
        vacio={`No hay ${t.titulo.toLowerCase()} con esos filtros.`}
        columnas={[
          {
            titulo: t.titulo.slice(0, -1),
            celda: (p) => (
              <div className="flex items-center gap-3">
                <img src={urlFoto(p.fotoUrl)} alt="" className="aspect-[4/3] w-14 shrink-0 rounded-md object-cover" loading="lazy" />
                <span className="flex flex-col">
                  <span className="font-semibold">{p.nombre}</span>
                  <span className="line-clamp-2 text-xs text-muted-foreground print:line-clamp-none">{p.descripcion}</span>
                </span>
              </div>
            ),
          },
          { titulo: 'Categoría', celda: (p) => p.categoria.nombre },
          {
            titulo: 'Precio',
            celda: (p) => <span className="font-bold tabular-nums">{formatoPrecio(p.precio)}</span>,
            className: 'text-right',
          },
          { titulo: 'Estatus', celda: (p) => <EstatusInsignia estatus={p.estatus} /> },
        ]}
        acciones={(p) => (
          <BotonesFila
            nombre={p.nombre}
            rutaEliminar={`${t.ruta}/${p.id}`}
            yaEnBaja={p.estatus === 'BAJA'}
            onEditar={() =>
              form.abrir(p.id, { ...p, precio: p.precio.toFixed(2), categoriaId: String(p.categoriaId) })
            }
            onEliminado={lista.recargar}
          />
        )}
      />

      <DialogoFormulario
        abierto={form.abierto}
        onCerrar={form.cerrar}
        titulo={form.esNuevo ? `Agregar ${t.singular}` : `Editar ${t.singular} #${form.idEditando}`}
        descripcion="Todos los campos son obligatorios. El precio incluye IVA."
        guardando={form.guardando}
        error={form.errorGeneral}
        onGuardar={guardar}
        ancho="amplio"
      >
        <CampoTexto
          etiqueta="Nombre"
          value={v.nombre}
          error={form.errores.nombre}
          placeholder={t.ejemplo}
          onChange={(e) => form.cambiar('nombre', e.target.value)}
        />
        <Field data-invalid={!!form.errores.descripcion || undefined}>
          <FieldLabel htmlFor={idDescripcion}>Descripción</FieldLabel>
          <Textarea
            id={idDescripcion}
            rows={3}
            value={v.descripcion}
            aria-invalid={!!form.errores.descripcion || undefined}
            onChange={(e) => form.cambiar('descripcion', e.target.value)}
          />
          {form.errores.descripcion && <FieldError>{form.errores.descripcion}</FieldError>}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoPrecio value={v.precio} error={form.errores.precio} onChange={(e) => form.cambiar('precio', e.target.value)} />
          <CampoSelect
            etiqueta="Categoría"
            valor={v.categoriaId}
            onCambio={(c) => form.cambiar('categoriaId', c)}
            opciones={opcionesCategoria}
            error={form.errores.categoriaId}
          />
        </div>
        <CampoFoto valor={v.fotoUrl} onCambio={(url) => form.cambiar('fotoUrl', url)} error={form.errores.fotoUrl} alt={v.nombre} />
        {!form.esNuevo && (
          <CampoSelect etiqueta="Estatus" valor={v.estatus} onCambio={(e) => form.cambiar('estatus', e)} opciones={OPCIONES_ESTATUS} />
        )}
      </DialogoFormulario>
    </PaginaCatalogo>
  );
}
