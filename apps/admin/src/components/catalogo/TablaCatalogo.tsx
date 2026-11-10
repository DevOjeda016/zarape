import { MagnifyingGlassIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from '@zarape/ui/components/alert';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@zarape/ui/components/empty';
import { Skeleton } from '@zarape/ui/components/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@zarape/ui/components/table';
import { cn } from '@zarape/ui/lib/utils';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

export interface Columna<T> {
  titulo: string;
  celda: (fila: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columnas: Columna<T>[];
  filas: T[];
  cargando: boolean;
  error: string | null;
  /** Botones por fila (editar, eliminar…). No se imprimen. */
  acciones?: (fila: T) => ReactNode;
  vacio: string;
}

/** Tabla de resultados de búsqueda. Lo que no debe salir en papel lleva `print:hidden`. */
export function TablaCatalogo<T extends { id: number }>({ columnas, filas, cargando, error, acciones, vacio }: Props<T>) {
  if (error) {
    return (
      <Alert variant="destructive">
        <WarningCircleIcon />
        <AlertTitle>No pudimos cargar la lista</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!cargando && filas.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MagnifyingGlassIcon weight="duotone" />
          </EmptyMedia>
          <EmptyTitle>Sin resultados</EmptyTitle>
          <EmptyDescription>{vacio}</EmptyDescription>
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
            {columnas.map((c) => (
              <TableHead key={c.titulo} className={c.className}>
                {c.titulo}
              </TableHead>
            ))}
            {acciones && (
              <TableHead className="w-0 text-right print:hidden">
                <span className="sr-only">Acciones</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody aria-busy={cargando}>
          {cargando && filas.length === 0
            ? Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={columnas.length + 2}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : filas.map((fila, i) => (
                <motion.tr
                  key={fila.id}
                  data-slot="table-row"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: cargando ? 0.6 : 1 }}
                  transition={{ duration: 0.2, delay: Math.min(i, 10) * 0.015 }}
                  className="border-b transition-colors hover:bg-muted/50 print:break-inside-avoid"
                >
                  <TableCell className="font-medium text-muted-foreground tabular-nums">{fila.id}</TableCell>
                  {columnas.map((c) => (
                    <TableCell key={c.titulo} className={cn('whitespace-normal', c.className)}>
                      {c.celda(fila)}
                    </TableCell>
                  ))}
                  {acciones && (
                    <TableCell className="text-right print:hidden">
                      <div className="flex justify-end gap-1">{acciones(fila)}</div>
                    </TableCell>
                  )}
                </motion.tr>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
