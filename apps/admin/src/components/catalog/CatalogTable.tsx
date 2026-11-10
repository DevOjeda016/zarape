import { MagnifyingGlassIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from '@zarape/ui/components/alert';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@zarape/ui/components/empty';
import { Skeleton } from '@zarape/ui/components/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@zarape/ui/components/table';
import { cn } from '@zarape/ui/lib/utils';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  loading: boolean;
  error: string | null;
  /** Botones por fila (editar, eliminar…). No se imprimen. */
  actions?: (row: T) => ReactNode;
  emptyMessage: string;
}

/** Tabla de resultados de búsqueda. Lo que no debe salir en papel lleva `print:hidden`. */
export function CatalogTable<T extends { id: number }>({ columns, rows, loading, error, actions, emptyMessage }: Props<T>) {
  if (error) {
    return (
      <Alert variant="destructive">
        <WarningCircleIcon />
        <AlertTitle>No pudimos cargar la lista</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!loading && rows.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MagnifyingGlassIcon weight="duotone" />
          </EmptyMedia>
          <EmptyTitle>Sin resultados</EmptyTitle>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="rounded-lg border bg-card print:rounded-none print:border-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">ID</TableHead>
            {columns.map((c) => (
              <TableHead key={c.header} className={c.className}>
                {c.header}
              </TableHead>
            ))}
            {actions && (
              <TableHead className="w-0 text-right print:hidden">
                <span className="sr-only">Acciones</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody aria-busy={loading}>
          {loading && rows.length === 0
            ? Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={columns.length + 2}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  data-slot="table-row"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: loading ? 0.6 : 1 }}
                  transition={{ duration: 0.2, delay: Math.min(i, 10) * 0.015 }}
                  className="border-b transition-colors hover:bg-muted/50 print:break-inside-avoid"
                >
                  <TableCell className="font-medium text-muted-foreground tabular-nums">{row.id}</TableCell>
                  {columns.map((c) => (
                    <TableCell key={c.header} className={cn('whitespace-normal', c.className)}>
                      {c.cell(row)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right print:hidden">
                      <div className="flex justify-end gap-1">{actions(row)}</div>
                    </TableCell>
                  )}
                </motion.tr>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
