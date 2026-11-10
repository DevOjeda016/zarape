import { CheckCircleIcon, MinusCircleIcon } from '@phosphor-icons/react';
import type { Status } from '@zarape/shared';
import { Badge } from '@zarape/ui/components/badge';

/** Estatus con color + texto + ícono (nunca solo color). */
export function StatusBadge({ status }: { status: Status }) {
  return status === 'ACTIVE' ? (
    <Badge variant="outline" className="border-transparent bg-nopal-tinte text-nopal">
      <CheckCircleIcon weight="fill" data-icon="inline-start" />
      Activo
    </Badge>
  ) : (
    <Badge variant="secondary" className="text-muted-foreground">
      <MinusCircleIcon data-icon="inline-start" />
      Baja
    </Badge>
  );
}
