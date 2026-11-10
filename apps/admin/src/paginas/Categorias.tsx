import { CoffeeIcon, ForkKnifeIcon, TagIcon } from '@phosphor-icons/react';
import type { TipoCategoria } from '@zarape/shared';
import { Badge } from '@zarape/ui/components/badge';
import { useState } from 'react';
import { BotonesFila } from '@/components/catalogo/BotonesFila';
import { CampoSelect, CampoTexto, FiltroEstatus } from '@/components/catalogo/campos';
import { OPCIONES_ESTATUS } from '@/components/catalogo/opciones';
import { DialogoFormulario } from '@/components/catalogo/DialogoFormulario';
import { PaginaCatalogo } from '@/components/catalogo/PaginaCatalogo';
import { resumirFiltros } from '@/components/catalogo/resumen';
import { TablaCatalogo } from '@/components/catalogo/TablaCatalogo';
import { useCatalogo } from '@/components/catalogo/useCatalogo';
import { type Errores, requerido, useFormulario } from '@/components/catalogo/useFormulario';
import { EstatusInsignia } from '@/components/EstatusInsignia';
import { api } from '@/lib/api';
import type { Categoria } from '@/lib/tipos';

interface Valores {
  nombre: string;
  tipo: TipoCategoria;
  estatus: string;
}

const VACIO: Valores = { nombre: '', tipo: 'ALIMENTO', estatus: 'ACTIVO' };
const FILTROS_VACIOS = { nombre: '', tipo: '', estatus: '' };
const TIPOS = { ALIMENTO: 'Alimentos', BEBIDA: 'Bebidas' } as const;

const validar = (v: Valores): Errores<Valores> => ({ nombre: requerido(v.nombre, 'Escribe el nombre.') });

/** Categorías de alimentos (Platillos, Ensaladas…) y de bebidas (Refrescos, Aguas…), RF04 y RF05. */
export function Categorias() {
  const lista = useCatalogo<Categoria>('/categorias');
  const [borrador, setBorrador] = useState(FILTROS_VACIOS);
  const form = useFormulario<Valores>(VACIO);
  const v = form.valores;
  const editando = lista.datos.find((c) => c.id === form.idEditando);

  function guardar() {
    form.guardar(validar, async (valores) => {
      if (form.esNuevo) await api('POST', '/categorias', { nombre: valores.nombre, tipo: valores.tipo });
      else await api('PATCH', `/categorias/${form.idEditando}`, valores);
      lista.recargar();
      return form.esNuevo ? `Categoría ${valores.nombre} agregada` : 'Cambios guardados';
    });
  }

  return (
    <PaginaCatalogo
      titulo="Categorías"
      descripcion="Cómo se agrupa el menú de alimentos y de bebidas."
      icono={TagIcon}
      agregar="Agregar categoría"
      onAgregar={() => form.abrir(null, VACIO)}
      onBuscar={() => lista.buscar(borrador)}
      onLimpiar={() => {
        setBorrador(FILTROS_VACIOS);
        lista.buscar({});
      }}
      resumenFiltros={resumirFiltros(lista.filtros, { nombre: 'Nombre', tipo: 'Tipo' }, { tipo: (t) => TIPOS[t as TipoCategoria] })}
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
            etiqueta="Tipo"
            valor={borrador.tipo || 'TODOS'}
            onCambio={(t) => setBorrador({ ...borrador, tipo: t === 'TODOS' ? '' : t })}
            opciones={[
              { valor: 'TODOS', texto: 'Todos' },
              { valor: 'ALIMENTO', texto: 'Alimentos' },
              { valor: 'BEBIDA', texto: 'Bebidas' },
            ]}
            className="w-44"
          />
          <FiltroEstatus valor={borrador.estatus} onCambio={(estatus) => setBorrador({ ...borrador, estatus })} />
        </>
      }
    >
      <TablaCatalogo
        filas={lista.datos}
        cargando={lista.cargando}
        error={lista.error}
        vacio="No hay categorías con esos filtros."
        columnas={[
          { titulo: 'Categoría', celda: (c) => <span className="font-semibold">{c.nombre}</span> },
          {
            titulo: 'Tipo',
            celda: (c) => (
              <Badge variant="outline">
                {c.tipo === 'ALIMENTO' ? <ForkKnifeIcon data-icon="inline-start" /> : <CoffeeIcon data-icon="inline-start" />}
                {TIPOS[c.tipo]}
              </Badge>
            ),
          },
          { titulo: 'Productos', celda: (c) => <span className="tabular-nums">{c.productos}</span>, className: 'text-right' },
          { titulo: 'Estatus', celda: (c) => <EstatusInsignia estatus={c.estatus} /> },
        ]}
        acciones={(c) => (
          <BotonesFila
            nombre={`la categoría ${c.nombre}`}
            rutaEliminar={`/categorias/${c.id}`}
            yaEnBaja={c.estatus === 'BAJA'}
            onEditar={() => form.abrir(c.id, { nombre: c.nombre, tipo: c.tipo, estatus: c.estatus })}
            onEliminado={lista.recargar}
          />
        )}
      />

      <DialogoFormulario
        abierto={form.abierto}
        onCerrar={form.cerrar}
        titulo={form.esNuevo ? 'Agregar categoría' : `Editar categoría #${form.idEditando}`}
        descripcion="Todos los campos son obligatorios."
        guardando={form.guardando}
        error={form.errorGeneral}
        onGuardar={guardar}
      >
        <CampoTexto etiqueta="Nombre" value={v.nombre} error={form.errores.nombre} onChange={(e) => form.cambiar('nombre', e.target.value)} />
        <CampoSelect
          etiqueta="Agrupa"
          valor={v.tipo}
          onCambio={(t) => form.cambiar('tipo', t as TipoCategoria)}
          opciones={[
            { valor: 'ALIMENTO', texto: 'Alimentos' },
            { valor: 'BEBIDA', texto: 'Bebidas' },
          ]}
          error={editando && editando.productos > 0 && v.tipo !== editando.tipo ? 'Ya tiene productos; no puede cambiar de tipo.' : undefined}
        />
        {!form.esNuevo && (
          <CampoSelect etiqueta="Estatus" valor={v.estatus} onCambio={(e) => form.cambiar('estatus', e)} opciones={OPCIONES_ESTATUS} />
        )}
      </DialogoFormulario>
    </PaginaCatalogo>
  );
}
