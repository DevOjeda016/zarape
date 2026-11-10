import { CircleNotchIcon, FloppyDiskIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription } from '@zarape/ui/components/alert';
import { Button } from '@zarape/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zarape/ui/components/dialog';
import { FieldGroup } from '@zarape/ui/components/field';
import type { FormEvent, ReactNode } from 'react';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  descripcion: string;
  guardando: boolean;
  error: string | null;
  onGuardar: () => void;
  textoGuardar?: string;
  ancho?: 'normal' | 'amplio';
  children: ReactNode;
}

/** Diálogo de alta o modificación. El ID no aparece como campo: no se modifica (RF02–RF06). */
export function DialogoFormulario(props: Props) {
  function enviar(evento: FormEvent) {
    evento.preventDefault();
    props.onGuardar();
  }

  return (
    <Dialog open={props.abierto} onOpenChange={(abierto) => !abierto && !props.guardando && props.onCerrar()}>
      <DialogContent className={props.ancho === 'amplio' ? 'sm:max-w-2xl' : 'sm:max-w-lg'}>
        <form onSubmit={enviar} noValidate className="flex max-h-[85svh] flex-col gap-6">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">{props.titulo}</DialogTitle>
            <DialogDescription>{props.descripcion}</DialogDescription>
          </DialogHeader>
          <div className="-mx-1 overflow-y-auto px-1">
            <FieldGroup>{props.children}</FieldGroup>
          </div>
          {props.error && (
            <Alert variant="destructive">
              <WarningCircleIcon />
              <AlertDescription>{props.error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="lg" disabled={props.guardando}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" size="lg" disabled={props.guardando}>
              {props.guardando ? (
                <CircleNotchIcon data-icon="inline-start" className="animate-spin" />
              ) : (
                <FloppyDiskIcon data-icon="inline-start" />
              )}
              {props.textoGuardar ?? 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
