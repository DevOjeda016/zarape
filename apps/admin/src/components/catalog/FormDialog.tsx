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
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  saving: boolean;
  error: string | null;
  onSave: () => void;
  saveLabel?: string;
  width?: 'normal' | 'wide';
  children: ReactNode;
}

/** Diálogo de alta o modificación. El ID no aparece como campo: no se modifica (RF02–RF06). */
export function FormDialog(props: Props) {
  function submit(event: FormEvent) {
    event.preventDefault();
    props.onSave();
  }

  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && !props.saving && props.onClose()}>
      <DialogContent className={props.width === 'wide' ? 'sm:max-w-2xl' : 'sm:max-w-lg'}>
        <form onSubmit={submit} noValidate className="flex max-h-[85svh] flex-col gap-6">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">{props.title}</DialogTitle>
            <DialogDescription>{props.description}</DialogDescription>
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
              <Button type="button" variant="outline" size="lg" disabled={props.saving}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" size="lg" disabled={props.saving}>
              {props.saving ? (
                <CircleNotchIcon data-icon="inline-start" className="animate-spin" />
              ) : (
                <FloppyDiskIcon data-icon="inline-start" />
              )}
              {props.saveLabel ?? 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
