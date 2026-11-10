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
import { api, ErrorApi } from '@/lib/api';
import type { ResultadoEliminacion } from '@/lib/tipos';

/** Editar y eliminar de una fila. Eliminar siempre pide confirmación (destructive + ícono). */
export function BotonesFila({
  nombre,
  rutaEliminar,
  yaEnBaja,
  onEditar,
  onEliminado,
}: {
  nombre: string;
  rutaEliminar: string;
  yaEnBaja: boolean;
  onEditar: () => void;
  onEliminado: () => void;
}) {
  const [eliminando, setEliminando] = useState(false);

  async function eliminar() {
    setEliminando(true);
    try {
      const resultado = await api<ResultadoEliminacion>('DELETE', rutaEliminar);
      (resultado.accion === 'BAJA' ? toast.info : toast.success)(resultado.mensaje);
      onEliminado();
    } catch (e) {
      toast.error(e instanceof ErrorApi ? e.message : 'No pudimos eliminarlo.');
    } finally {
      setEliminando(false);
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-lg" onClick={onEditar} aria-label={`Editar ${nombre}`}>
            <PencilSimpleIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Editar</TooltipContent>
      </Tooltip>
      <AlertDialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon-lg" disabled={eliminando} aria-label={`Eliminar ${nombre}`}>
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
            <AlertDialogTitle>¿Eliminar {nombre}?</AlertDialogTitle>
            <AlertDialogDescription>
              {yaEnBaja
                ? 'Ya está dado de baja. Si ya no tiene registros relacionados, se borra para siempre.'
                : 'Si no tiene registros relacionados se borra para siempre. Si los tiene, solo se da de baja y puedes reactivarlo después.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={eliminar}>
              <TrashIcon data-icon="inline-start" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
