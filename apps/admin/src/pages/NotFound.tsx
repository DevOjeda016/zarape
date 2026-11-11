import { HouseIcon, MapTrifoldIcon } from '@phosphor-icons/react';
import { Button } from '@zarape/ui/components/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@zarape/ui/components/empty';
import { Link } from 'react-router';

export function NotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MapTrifoldIcon />
        </EmptyMedia>
        <EmptyTitle>No encontramos esta página</EmptyTitle>
        <EmptyDescription>Revisa la dirección o vuelve al inicio.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild size="lg">
          <Link to="/">
            <HouseIcon data-icon="inline-start" />
            Ir al inicio
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
