import { BroomIcon, type Icon, MagnifyingGlassIcon, PlusIcon, PrinterIcon } from '@phosphor-icons/react';
import { Button } from '@zarape/ui/components/button';
import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/auth/session';
import { formatDateTime } from '@/lib/format';

interface Props {
  title: string;
  description: string;
  icon: Icon;
  /** Texto del botón de alta ("Agregar sucursal"). */
  addLabel: string;
  onAdd: () => void;
  /** Campos de búsqueda (van dentro de un form; Buscar hace submit). */
  filters: ReactNode;
  onSearch: () => void;
  onClear: () => void;
  /** Filtros activos en texto, para el encabezado impreso. */
  filterSummary: string;
  total: number;
  children: ReactNode;
}

/**
 * Pantalla de un catálogo (RF02–RF06): encabezado, búsqueda, tabla e impresión de resultados.
 * Al imprimir se ocultan menú, filtros y acciones; sale un encabezado con marca, filtros y fecha.
 */
export function CatalogPage(props: Props) {
  const { title, description, icon: IconComponent, total } = props;
  const { employee } = useAuth();
  // Fecha del encabezado impreso: se toma al abrir la página y se renueva al imprimir
  const [printedAt, setPrintedAt] = useState(() => new Date());
  useEffect(() => {
    const onBeforePrint = () => setPrintedAt(new Date());
    window.addEventListener('beforeprint', onBeforePrint);
    return () => window.removeEventListener('beforeprint', onBeforePrint);
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    props.onSearch();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado impreso */}
      <header className="hidden items-center gap-4 border-b-4 border-double border-chile pb-3 print:flex">
        <img src="/jarro.svg" alt="" className="size-12" />
        <div className="flex flex-1 flex-col">
          <p className="font-heading text-xl font-extrabold">El Zarape · {title}</p>
          <p className="text-sm">
            {props.filterSummary} · {total} {total === 1 ? 'registro' : 'registros'}
          </p>
        </div>
        <p className="text-right text-xs">
          {formatDateTime(printedAt)}
          <br />
          Imprimió: {employee?.username}
        </p>
      </header>

      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-lg bg-chile-tinte text-chile">
            <IconComponent size={24} weight="duotone" />
          </span>
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={() => window.print()} disabled={total === 0}>
            <PrinterIcon data-icon="inline-start" />
            Imprimir resultados
          </Button>
          <Button size="lg" onClick={props.onAdd}>
            <PlusIcon data-icon="inline-start" weight="bold" />
            {props.addLabel}
          </Button>
        </div>
      </div>

      <form
        onSubmit={submit}
        role="search"
        aria-label={`Buscar en ${title.toLowerCase()}`}
        className="flex flex-wrap items-end gap-3 rounded-lg bg-secondary p-4 print:hidden"
      >
        {props.filters}
        <div className="flex gap-2">
          <Button type="submit" size="lg">
            <MagnifyingGlassIcon data-icon="inline-start" />
            Buscar
          </Button>
          <Button type="reset" variant="ghost" size="lg" onClick={props.onClear}>
            <BroomIcon data-icon="inline-start" />
            Limpiar
          </Button>
        </div>
      </form>

      <p className="text-sm text-muted-foreground print:hidden" aria-live="polite">
        {total} {total === 1 ? 'resultado' : 'resultados'} · {props.filterSummary}
      </p>

      {props.children}
    </div>
  );
}
