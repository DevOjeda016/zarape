import { CoffeeIcon, ForkKnifeIcon, MinusIcon, PackageIcon, PlusIcon, XIcon } from '@phosphor-icons/react';
import { Badge } from '@zarape/ui/components/badge';
import { Button } from '@zarape/ui/components/button';
import { Field, FieldDescription, FieldError, FieldLabel, FieldSet, FieldLegend } from '@zarape/ui/components/field';
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
import type { Combo, ComponenteCombo, Producto } from '@/lib/tipos';

type Tipo = 'A' | 'B';
interface Linea {
  tipo: Tipo;
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  enBaja: boolean;
}

interface Valores {
  nombre: string;
  descripcion: string;
  fotoUrl: string;
  precio: string;
  estatus: string;
  lineas: Linea[];
}

const VACIO: Valores = { nombre: '', descripcion: '', fotoUrl: '', precio: '', estatus: 'ACTIVO', lineas: [] };
const FILTROS_VACIOS = { nombre: '', alimento: '', bebida: '', estatus: '' };

function validar(v: Valores): Errores<Valores> {
  return {
    nombre: requerido(v.nombre, 'Escribe el nombre.'),
    descripcion: requerido(v.descripcion, 'Escribe la descripción.'),
    fotoUrl: requerido(v.fotoUrl, 'Sube una foto o pega una URL.'),
    precio: validarPrecio(v.precio),
    lineas: v.lineas.length ? undefined : 'Agrega al menos un alimento o una bebida.',
  };
}

const aLinea = (tipo: Tipo) => (c: ComponenteCombo): Linea => ({ tipo, ...c, enBaja: c.estatus === 'BAJA' });

/** RF06: combos con varios alimentos y/o bebidas de sus catálogos. Búsqueda por nombre, alimento o bebida. */
export function Combos() {
  const lista = useCatalogo<Combo>('/combos');
  const alimentos = useOpciones<Producto>('/alimentos?estatus=ACTIVO');
  const bebidas = useOpciones<Producto>('/bebidas?estatus=ACTIVO');
  const [borrador, setBorrador] = useState(FILTROS_VACIOS);
  const form = useFormulario<Valores>(VACIO);
  const idDescripcion = useId();
  const idAgregar = useId();
  const v = form.valores;

  const porSeparado = v.lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0);
  const ahorro = porSeparado - Number(v.precio || 0);

  function agregar(clave: string) {
    const [tipo, id] = [clave[0] as Tipo, Number(clave.slice(2))];
    const existente = v.lineas.find((l) => l.tipo === tipo && l.id === id);
    if (existente) return cambiarCantidad(existente, 1);
    const producto = (tipo === 'A' ? alimentos : bebidas).find((p) => p.id === id);
    if (!producto) return;
    form.cambiar('lineas', [...v.lineas, { tipo, id, nombre: producto.nombre, precio: producto.precio, cantidad: 1, enBaja: false }]);
  }

  function cambiarCantidad(linea: Linea, delta: number) {
    form.cambiar(
      'lineas',
      v.lineas.map((l) => (l === linea ? { ...l, cantidad: Math.min(20, Math.max(1, l.cantidad + delta)) } : l)),
    );
  }

  function guardar() {
    form.guardar(validar, async (valores) => {
      const componentes = (tipo: Tipo) =>
        valores.lineas.filter((l) => l.tipo === tipo).map(({ id, cantidad }) => ({ id, cantidad }));
      const cuerpo = {
        nombre: valores.nombre,
        descripcion: valores.descripcion,
        fotoUrl: valores.fotoUrl,
        precio: Number(valores.precio),
        alimentos: componentes('A'),
        bebidas: componentes('B'),
      };
      if (form.esNuevo) await api('POST', '/combos', cuerpo);
      else await api('PATCH', `/combos/${form.idEditando}`, { ...cuerpo, estatus: valores.estatus });
      lista.recargar();
      return form.esNuevo ? `${valores.nombre} agregado` : 'Cambios guardados';
    });
  }

  function editar(c: Combo) {
    form.abrir(c.id, {
      nombre: c.nombre,
      descripcion: c.descripcion,
      fotoUrl: c.fotoUrl,
      precio: c.precio.toFixed(2),
      estatus: c.estatus,
      lineas: [...c.alimentos.map(aLinea('A')), ...c.bebidas.map(aLinea('B'))],
    });
  }

  const disponibles = (tipo: Tipo, productos: Producto[]) =>
    productos.filter((p) => !v.lineas.some((l) => l.tipo === tipo && l.id === p.id));

  return (
    <PaginaCatalogo
      titulo="Combos"
      descripcion="Paquetes de desayuno a menor precio que por separado."
      icono={PackageIcon}
      agregar="Agregar combo"
      onAgregar={() => form.abrir(null, VACIO)}
      onBuscar={() => lista.buscar(borrador)}
      onLimpiar={() => {
        setBorrador(FILTROS_VACIOS);
        lista.buscar({});
      }}
      resumenFiltros={resumirFiltros(lista.filtros, { nombre: 'Nombre', alimento: 'Con alimento', bebida: 'Con bebida' })}
      total={lista.datos.length}
      filtros={
        <>
          <CampoTexto etiqueta="Nombre" value={borrador.nombre} onChange={(e) => setBorrador({ ...borrador, nombre: e.target.value })} className="w-48" />
          <CampoTexto
            etiqueta="Incluye alimento"
            value={borrador.alimento}
            onChange={(e) => setBorrador({ ...borrador, alimento: e.target.value })}
            placeholder="Chilaquiles"
            className="w-48"
          />
          <CampoTexto
            etiqueta="Incluye bebida"
            value={borrador.bebida}
            onChange={(e) => setBorrador({ ...borrador, bebida: e.target.value })}
            placeholder="Café"
            className="w-48"
          />
          <FiltroEstatus valor={borrador.estatus} onCambio={(estatus) => setBorrador({ ...borrador, estatus })} />
        </>
      }
    >
      <TablaCatalogo
        filas={lista.datos}
        cargando={lista.cargando}
        error={lista.error}
        vacio="No hay combos con esos filtros."
        columnas={[
          {
            titulo: 'Combo',
            celda: (c) => (
              <div className="flex items-center gap-3">
                <img src={urlFoto(c.fotoUrl)} alt="" className="aspect-[4/3] w-14 shrink-0 rounded-md object-cover" loading="lazy" />
                <span className="font-semibold">{c.nombre}</span>
              </div>
            ),
          },
          {
            titulo: 'Incluye',
            celda: (c) => (
              <ul className="flex flex-col gap-0.5 text-sm">
                {[...c.alimentos.map(aLinea('A')), ...c.bebidas.map(aLinea('B'))].map((l) => (
                  <li key={`${l.tipo}${l.id}`} className="flex items-center gap-1.5">
                    {l.tipo === 'A' ? <ForkKnifeIcon aria-label="Alimento" /> : <CoffeeIcon aria-label="Bebida" />}
                    {l.cantidad > 1 && <span className="font-semibold">{l.cantidad}×</span>}
                    <span className={l.enBaja ? 'text-muted-foreground line-through' : undefined}>{l.nombre}</span>
                  </li>
                ))}
              </ul>
            ),
          },
          {
            titulo: 'Precio',
            className: 'text-right',
            celda: (c) => (
              <span className="flex flex-col items-end">
                <span className="font-bold tabular-nums">{formatoPrecio(c.precio)}</span>
                <span className="text-xs text-muted-foreground tabular-nums line-through">{formatoPrecio(c.precioPorSeparado)}</span>
              </span>
            ),
          },
          {
            titulo: 'Ahorro',
            className: 'text-right',
            celda: (c) =>
              c.ahorro > 0 ? (
                <Badge variant="outline" className="border-transparent bg-chile-tinte text-chile tabular-nums">
                  {formatoPrecio(c.ahorro)}
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          { titulo: 'Estatus', celda: (c) => <EstatusInsignia estatus={c.estatus} /> },
        ]}
        acciones={(c) => (
          <BotonesFila
            nombre={c.nombre}
            rutaEliminar={`/combos/${c.id}`}
            yaEnBaja={c.estatus === 'BAJA'}
            onEditar={() => editar(c)}
            onEliminado={lista.recargar}
          />
        )}
      />

      <DialogoFormulario
        abierto={form.abierto}
        onCerrar={form.cerrar}
        titulo={form.esNuevo ? 'Agregar combo' : `Editar combo #${form.idEditando}`}
        descripcion="Todos los campos son obligatorios. Arma el combo con productos del menú."
        guardando={form.guardando}
        error={form.errorGeneral}
        onGuardar={guardar}
        ancho="amplio"
      >
        <CampoTexto etiqueta="Nombre" value={v.nombre} error={form.errores.nombre} placeholder="Combo Zarape" onChange={(e) => form.cambiar('nombre', e.target.value)} />
        <Field data-invalid={!!form.errores.descripcion || undefined}>
          <FieldLabel htmlFor={idDescripcion}>Descripción</FieldLabel>
          <Textarea
            id={idDescripcion}
            rows={2}
            value={v.descripcion}
            aria-invalid={!!form.errores.descripcion || undefined}
            onChange={(e) => form.cambiar('descripcion', e.target.value)}
          />
          {form.errores.descripcion && <FieldError>{form.errores.descripcion}</FieldError>}
        </Field>

        <FieldSet data-invalid={!!form.errores.lineas || undefined}>
          <FieldLegend variant="label">Incluye</FieldLegend>
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {v.lineas.map((l) => (
                <motion.li
                  key={`${l.tipo}${l.id}`}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
                >
                  {l.tipo === 'A' ? <ForkKnifeIcon aria-label="Alimento" /> : <CoffeeIcon aria-label="Bebida" />}
                  <span className="flex-1 text-sm">
                    {l.nombre}
                    {l.enBaja && <span className="text-muted-foreground"> (baja)</span>}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">{formatoPrecio(l.precio)}</span>
                  <Button type="button" variant="outline" size="icon" onClick={() => cambiarCantidad(l, -1)} disabled={l.cantidad <= 1} aria-label={`Quitar uno de ${l.nombre}`}>
                    <MinusIcon />
                  </Button>
                  <span className="w-6 text-center font-semibold tabular-nums" aria-label="Cantidad">
                    {l.cantidad}
                  </span>
                  <Button type="button" variant="outline" size="icon" onClick={() => cambiarCantidad(l, 1)} aria-label={`Agregar otro ${l.nombre}`}>
                    <PlusIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => form.cambiar('lineas', v.lineas.filter((x) => x !== l))}
                    aria-label={`Quitar ${l.nombre} del combo`}
                  >
                    <XIcon />
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <Field>
            <FieldLabel htmlFor={idAgregar} className="sr-only">
              Agregar producto al combo
            </FieldLabel>
            <Select value="" onValueChange={agregar}>
              <SelectTrigger id={idAgregar} className="w-full">
                <SelectValue placeholder="+ Agregar alimento o bebida" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Alimentos</SelectLabel>
                  {disponibles('A', alimentos).map((p) => (
                    <SelectItem key={`A${p.id}`} value={`A:${p.id}`}>
                      {p.nombre} · {formatoPrecio(p.precio)}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Bebidas</SelectLabel>
                  {disponibles('B', bebidas).map((p) => (
                    <SelectItem key={`B${p.id}`} value={`B:${p.id}`}>
                      {p.nombre} · {formatoPrecio(p.precio)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          {form.errores.lineas && <FieldError>{form.errores.lineas}</FieldError>}
        </FieldSet>

        <div className="grid items-start gap-4 sm:grid-cols-2">
          <CampoPrecio etiqueta="Precio del combo" value={v.precio} error={form.errores.precio} onChange={(e) => form.cambiar('precio', e.target.value)} />
          <Field>
            <FieldLabel>Por separado</FieldLabel>
            <p className="flex h-9 items-center text-lg font-bold tabular-nums">{formatoPrecio(porSeparado)}</p>
            <FieldDescription>
              {v.precio && porSeparado > 0
                ? ahorro > 0
                  ? `El cliente ahorra ${formatoPrecio(ahorro)} (${((ahorro / porSeparado) * 100).toFixed(1)} %).`
                  : 'Ojo: el combo no sale más barato que por separado.'
                : 'Suma de los productos a su precio actual.'}
            </FieldDescription>
          </Field>
        </div>
        <CampoFoto valor={v.fotoUrl} onCambio={(url) => form.cambiar('fotoUrl', url)} error={form.errores.fotoUrl} alt={v.nombre} />
        {!form.esNuevo && (
          <CampoSelect etiqueta="Estatus" valor={v.estatus} onCambio={(e) => form.cambiar('estatus', e)} opciones={OPCIONES_ESTATUS} />
        )}
      </DialogoFormulario>
    </PaginaCatalogo>
  );
}
