import { ChefHatIcon, CopyIcon, KeyIcon, ShieldCheckIcon, UsersIcon } from '@phosphor-icons/react';
import type { Rol } from '@zarape/shared';
import { Alert, AlertDescription, AlertTitle } from '@zarape/ui/components/alert';
import { Badge } from '@zarape/ui/components/badge';
import { Button } from '@zarape/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zarape/ui/components/dialog';
import { Field, FieldLabel } from '@zarape/ui/components/field';
import { ToggleGroup, ToggleGroupItem } from '@zarape/ui/components/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@zarape/ui/components/tooltip';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/auth/sesion';
import { BotonesFila } from '@/components/catalogo/BotonesFila';
import { CampoSelect, CampoTexto, FiltroEstatus } from '@/components/catalogo/campos';
import { OPCIONES_ESTATUS } from '@/components/catalogo/opciones';
import { DialogoFormulario } from '@/components/catalogo/DialogoFormulario';
import { PaginaCatalogo } from '@/components/catalogo/PaginaCatalogo';
import { resumirFiltros } from '@/components/catalogo/resumen';
import { TablaCatalogo } from '@/components/catalogo/TablaCatalogo';
import { useCatalogo, useOpciones } from '@/components/catalogo/useCatalogo';
import { type Errores, useFormulario } from '@/components/catalogo/useFormulario';
import { EstatusInsignia } from '@/components/EstatusInsignia';
import { api, ErrorApi } from '@/lib/api';
import type { Sucursal, Usuario, UsuarioConContrasena } from '@/lib/tipos';

interface Valores {
  nombreUsuario: string;
  rol: Rol;
  sucursalId: string;
  estatus: string;
}

const SIN_SUCURSAL = 'TODAS';
const VACIO: Valores = { nombreUsuario: '', rol: 'COCINA', sucursalId: SIN_SUCURSAL, estatus: 'ACTIVO' };
const FILTROS_VACIOS = { nombreUsuario: '', estatus: '' };

const ROLES: Record<Rol, { texto: string; icono: typeof ShieldCheckIcon }> = {
  ADMIN: { texto: 'Administrador', icono: ShieldCheckIcon },
  COCINA: { texto: 'Cocina', icono: ChefHatIcon },
};

function validar(v: Valores): Errores<Valores> {
  return {
    nombreUsuario: /^[\w.-]{3,40}$/.test(v.nombreUsuario.trim())
      ? undefined
      : 'Usa de 3 a 40 letras, números, punto, guion o guion bajo, sin espacios.',
  };
}

/** RF03: empleados. La contraseña la genera el sistema (12 caracteres) y se ve una sola vez. */
export function Usuarios() {
  const { empleado } = useAuth();
  const lista = useCatalogo<Usuario>('/usuarios');
  const sucursales = useOpciones<Sucursal>('/sucursales?estatus=ACTIVO');
  const [borrador, setBorrador] = useState(FILTROS_VACIOS);
  const [nueva, setNueva] = useState<UsuarioConContrasena | null>(null);
  const form = useFormulario<Valores>(VACIO);
  const v = form.valores;

  function guardar() {
    form.guardar(validar, async (valores) => {
      const cuerpo = {
        nombreUsuario: valores.nombreUsuario.trim(),
        rol: valores.rol,
        sucursalId: valores.sucursalId === SIN_SUCURSAL ? null : Number(valores.sucursalId),
      };
      if (form.esNuevo) {
        const creado = await api<UsuarioConContrasena>('POST', '/usuarios', cuerpo);
        lista.recargar();
        setNueva(creado);
        return `Usuario ${creado.nombreUsuario} agregado`;
      }
      await api('PATCH', `/usuarios/${form.idEditando}`, { ...cuerpo, estatus: valores.estatus });
      lista.recargar();
      return 'Cambios guardados';
    });
  }

  async function regenerar(u: Usuario) {
    try {
      setNueva(await api<UsuarioConContrasena>('POST', `/usuarios/${u.id}/contrasena`));
    } catch (e) {
      toast.error(e instanceof ErrorApi ? e.message : 'No pudimos generar la contraseña.');
    }
  }

  async function copiar(texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success('Contraseña copiada');
    } catch {
      toast.error('No pudimos copiarla; anótala a mano.');
    }
  }

  const esYo = (u: Usuario) => u.id === empleado?.id;

  return (
    <PaginaCatalogo
      titulo="Usuarios"
      descripcion="Empleados con acceso a la gestión y a la cocina."
      icono={UsersIcon}
      agregar="Agregar usuario"
      onAgregar={() => form.abrir(null, VACIO)}
      onBuscar={() => lista.buscar(borrador)}
      onLimpiar={() => {
        setBorrador(FILTROS_VACIOS);
        lista.buscar({});
      }}
      resumenFiltros={resumirFiltros(lista.filtros, { nombreUsuario: 'Usuario' })}
      total={lista.datos.length}
      filtros={
        <>
          <CampoTexto
            etiqueta="Nombre de usuario"
            value={borrador.nombreUsuario}
            onChange={(e) => setBorrador({ ...borrador, nombreUsuario: e.target.value })}
            placeholder="maria"
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
        vacio="No hay usuarios con ese nombre."
        columnas={[
          {
            titulo: 'Usuario',
            celda: (u) => (
              <span className="font-semibold">
                {u.nombreUsuario}
                {esYo(u) && <span className="font-normal text-muted-foreground"> (tú)</span>}
              </span>
            ),
          },
          {
            titulo: 'Rol',
            celda: (u) => {
              const { texto, icono: Icono } = ROLES[u.rol];
              return (
                <Badge variant="outline">
                  <Icono data-icon="inline-start" />
                  {texto}
                </Badge>
              );
            },
          },
          { titulo: 'Sucursal', celda: (u) => u.sucursal?.nombre ?? <span className="text-muted-foreground">Todas</span> },
          { titulo: 'Contraseña', celda: () => <span className="tracking-widest text-muted-foreground">••••••••••••</span> },
          { titulo: 'Estatus', celda: (u) => <EstatusInsignia estatus={u.estatus} /> },
        ]}
        acciones={(u) => (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-lg" onClick={() => regenerar(u)} aria-label={`Nueva contraseña para ${u.nombreUsuario}`}>
                  <KeyIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Nueva contraseña</TooltipContent>
            </Tooltip>
            {esYo(u) ? (
              <Button variant="ghost" size="icon-lg" onClick={() => form.abrir(u.id, aValores(u))} aria-label="Editar tu usuario">
                <ShieldCheckIcon />
              </Button>
            ) : (
              <BotonesFila
                nombre={`al usuario ${u.nombreUsuario}`}
                rutaEliminar={`/usuarios/${u.id}`}
                yaEnBaja={u.estatus === 'BAJA'}
                onEditar={() => form.abrir(u.id, aValores(u))}
                onEliminado={lista.recargar}
              />
            )}
          </>
        )}
      />

      <DialogoFormulario
        abierto={form.abierto}
        onCerrar={form.cerrar}
        titulo={form.esNuevo ? 'Agregar usuario' : `Editar usuario #${form.idEditando}`}
        descripcion={
          form.esNuevo
            ? 'Al guardar, el sistema genera una contraseña aleatoria de 12 caracteres.'
            : 'Para cambiar la contraseña usa la llave en la lista.'
        }
        guardando={form.guardando}
        error={form.errorGeneral}
        onGuardar={guardar}
      >
        <CampoTexto
          etiqueta="Nombre de usuario"
          value={v.nombreUsuario}
          error={form.errores.nombreUsuario}
          autoComplete="off"
          onChange={(e) => form.cambiar('nombreUsuario', e.target.value)}
        />
        <Field>
          <FieldLabel>Rol</FieldLabel>
          <ToggleGroup
            type="single"
            variant="outline"
            value={v.rol}
            onValueChange={(rol) => rol && form.cambiar('rol', rol as Rol)}
            disabled={form.idEditando === empleado?.id}
            aria-label="Rol"
          >
            {(Object.keys(ROLES) as Rol[]).map((rol) => {
              const { texto, icono: Icono } = ROLES[rol];
              return (
                <ToggleGroupItem key={rol} value={rol} className="px-4">
                  <Icono weight={v.rol === rol ? 'fill' : 'regular'} />
                  {texto}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </Field>
        <CampoSelect
          etiqueta="Sucursal"
          valor={v.sucursalId}
          onCambio={(s) => form.cambiar('sucursalId', s)}
          opciones={[
            { valor: SIN_SUCURSAL, texto: 'Todas (oficina central)' },
            ...sucursales.map((s) => ({ valor: String(s.id), texto: s.nombre })),
          ]}
        />
        {!form.esNuevo && form.idEditando !== empleado?.id && (
          <CampoSelect etiqueta="Estatus" valor={v.estatus} onCambio={(e) => form.cambiar('estatus', e)} opciones={OPCIONES_ESTATUS} />
        )}
      </DialogoFormulario>

      <Dialog open={!!nueva} onOpenChange={(abierto) => !abierto && setNueva(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Contraseña de {nueva?.nombreUsuario}</DialogTitle>
            <DialogDescription>Entrégasela en persona. Por seguridad no la guardamos en claro.</DialogDescription>
          </DialogHeader>
          <p className="rounded-lg border-2 border-dashed bg-secondary p-4 text-center font-mono text-2xl font-bold tracking-wider select-all">
            {nueva?.contrasena}
          </p>
          <Alert>
            <KeyIcon />
            <AlertTitle>Solo se muestra esta vez</AlertTitle>
            <AlertDescription>Si se pierde, genera otra con la llave de la lista.</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" size="lg" onClick={() => nueva && copiar(nueva.contrasena)}>
              <CopyIcon data-icon="inline-start" />
              Copiar
            </Button>
            <Button size="lg" onClick={() => setNueva(null)}>
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PaginaCatalogo>
  );
}

function aValores(u: Usuario): Valores {
  return {
    nombreUsuario: u.nombreUsuario,
    rol: u.rol,
    sucursalId: u.sucursalId ? String(u.sucursalId) : SIN_SUCURSAL,
    estatus: u.estatus,
  };
}
