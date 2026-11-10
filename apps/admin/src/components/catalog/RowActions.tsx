import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@zarape/ui/components/alert-dialog';
import { Button } from '@zarape/ui/components/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@zarape/ui/components/tooltip';
import { useState } from 'react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { DeletionResult } from '@/lib/types';

/** Editar y eliminar de una fila. Eliminar siempre pide confirmación (destructive + ícono). */
export function RowActions({
  label,
  deletePath,
  inactive,
  onEdit,
  onDeleted,
}: {
  label: string;
  deletePath: string;
  inactive: boolean;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    try {
      const result = await api<DeletionResult>('DELETE', deletePath);
      (result.action === 'DEACTIVATED' ? toast.info : toast.success)(result.message);
      onDeleted();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'No pudimos eliminarlo.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-lg" onClick={onEdit} aria-label={`Editar ${label}`}>
            <PencilSimpleIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Editar</TooltipContent>
      </Tooltip>
      <AlertDialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon-lg" disabled={deleting} aria-label={`Eliminar ${label}`}>
                <TrashIcon />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Eliminar</TooltipContent>
        </Tooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-chile-tinte text-chile">
              <TrashIcon weight="duotone" />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Eliminar {label}?</AlertDialogTitle>
            <AlertDialogDescription>
              {inactive
                ? 'Ya está dado de baja. Si ya no tiene registros relacionados, se borra para siempre.'
                : 'Si no tiene registros relacionados se borra para siempre. Si los tiene, solo se da de baja y puedes reactivarlo después.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={remove}>
              <TrashIcon data-icon="inline-start" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
