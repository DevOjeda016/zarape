import { BroomIcon, type Icon, MagnifyingGlassIcon, PlusIcon, PrinterIcon } from '@phosphor-icons/react';
import { Button } from '@zarape/ui/components/button';
import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/auth/sesion';
import { formatoFechaHora } from '@/lib/formato';

interface Props {
  titulo: string;
  descripcion: string;
  icono: Icon;
  /** Texto del botón de alta ("Agregar sucursal"). */
  agregar: string;
  onAgregar: () => void;
  /** Campos de búsqueda (van dentro de un form; Buscar hace submit). */
  filtros: ReactNode;
  onBuscar: () => void;
  onLimpiar: () => void;
  /** Filtros activos en texto, para el encabezado impreso. */
  resumenFiltros: string;
  total: number;
  children: ReactNode;
}

/**
 * Pantalla de un catálogo (RF02–RF06): encabezado, búsqueda, tabla e impresión de resultados.
 * Al imprimir se ocultan menú, filtros y acciones; sale un encabezado con marca, filtros y fecha.
 */
export function PaginaCatalogo(props: Props) {
  const { titulo, descripcion, icono: Icono, total } = props;
  const { empleado } = useAuth();
  // Fecha del encabezado impreso: se toma al abrir la página y se renueva al imprimir
  const [impreso, setImpreso] = useState(() => new Date());
  useEffect(() => {
    const alImprimir = () => setImpreso(new Date());
    window.addEventListener('beforeprint', alImprimir);
    return () => window.removeEventListener('beforeprint', alImprimir);
  }, []);

  function buscar(evento: FormEvent) {
    evento.preventDefault();
    props.onBuscar();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado impreso */}
      <header className="hidden items-center gap-4 border-b-4 border-double border-chile pb-3 print:flex">
        <img src="/jarro.svg" alt="" className="size-12" />
        <div className="flex flex-1 flex-col">
          <p className="font-heading text-xl font-extrabold">El Zarape · {titulo}</p>
          <p className="text-sm">
            {props.resumenFiltros} · {total} {total === 1 ? 'registro' : 'registros'}
          </p>
        </div>
        <p className="text-right text-xs">
          {formatoFechaHora(impreso)}
          <br />
          Imprimió: {empleado?.nombreUsuario}
        </p>
      </header>

      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-lg bg-chile-tinte text-chile">
            <Icono size={24} weight="duotone" />
          </span>
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">{titulo}</h1>
            <p className="text-sm text-muted-foreground">{descripcion}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={() => window.print()} disabled={total === 0}>
            <PrinterIcon data-icon="inline-start" />
            Imprimir resultados
          </Button>
          <Button size="lg" onClick={props.onAgregar}>
            <PlusIcon data-icon="inline-start" weight="bold" />
            {props.agregar}
          </Button>
        </div>
      </div>

      <form
        onSubmit={buscar}
        role="search"
        aria-label={`Buscar en ${titulo.toLowerCase()}`}
        className="flex flex-wrap items-end gap-3 rounded-lg bg-secondary p-4 print:hidden"
      >
        {props.filtros}
        <div className="flex gap-2">
          <Button type="submit" size="lg">
            <MagnifyingGlassIcon data-icon="inline-start" />
            Buscar
          </Button>
          <Button type="reset" variant="ghost" size="lg" onClick={props.onLimpiar}>
            <BroomIcon data-icon="inline-start" />
            Limpiar
          </Button>
        </div>
      </form>

      <p className="text-sm text-muted-foreground print:hidden" aria-live="polite">
        {total} {total === 1 ? 'resultado' : 'resultados'} · {props.resumenFiltros}
      </p>

      {props.children}
    </div>
  );
}
