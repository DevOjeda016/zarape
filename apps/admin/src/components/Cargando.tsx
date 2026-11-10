import { Skeleton } from '@zarape/ui/components/skeleton';

/** Carga de pantalla completa: skeleton, nunca spinner a pantalla completa (branding). */
export function Cargando() {
  return (
    <div className="flex min-h-svh flex-col gap-4 p-6" aria-busy="true" aria-label="Cargando">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-6 w-96 max-w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
