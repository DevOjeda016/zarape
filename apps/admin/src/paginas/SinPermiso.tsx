import { LockKeyIcon, SignOutIcon } from '@phosphor-icons/react';
import { Button } from '@zarape/ui/components/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@zarape/ui/components/empty';
import { useAuth } from '@/auth/sesion';

/** El rol de cocina no entra a la gestión (solo a comandas en el Módulo II). */
export function SinPermiso() {
  const { empleado, salir } = useAuth();
  return (
    <main className="grid min-h-svh place-items-center p-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LockKeyIcon weight="duotone" />
          </EmptyMedia>
          <EmptyTitle>Esta sección es solo para administración</EmptyTitle>
          <EmptyDescription>
            {empleado?.nombreUsuario}, tu usuario es de cocina. Las comandas están en la app del restaurante.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="lg" onClick={salir}>
            <SignOutIcon data-icon="inline-start" />
            Entrar con otro usuario
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
