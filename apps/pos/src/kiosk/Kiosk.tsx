import { CoffeeIcon, ForkKnifeIcon, type Icon, PackageIcon, ReceiptIcon } from '@phosphor-icons/react';
import type { CardInput, ProductType } from '@zarape/shared';
import { Button } from '@zarape/ui/components/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@zarape/ui/components/sheet';
import { Skeleton } from '@zarape/ui/components/skeleton';
import { cn } from '@zarape/ui/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import type { Branch, Menu, Order, OrderPayment } from '@/lib/types';
import { saveBranchId, storedBranchId } from './branch';
import { MenuBoard } from './MenuBoard';
import { OrderDone } from './OrderDone';
import { PayDialog } from './PayDialog';
import { Ticket } from './Ticket';
import { useComanda } from './useComanda';

/** RF07: Platillos, Bebidas, Combos (y "Ver comanda", que es el ticket). */
const SECTIONS: { type: ProductType; key: keyof Menu; label: string; icon: Icon }[] = [
  { type: 'FOOD', key: 'foods', label: 'Platillos', icon: ForkKnifeIcon },
  { type: 'DRINK', key: 'drinks', label: 'Bebidas', icon: CoffeeIcon },
  { type: 'COMBO', key: 'combos', label: 'Combos', icon: PackageIcon },
];

/** Módulo II: kiosko de autoservicio, sin registro (RF07–RF09, RF12). */
export function Kiosk() {
  const [branchId, setBranchId] = useState(storedBranchId);
  const [branches, setBranches] = useState<Branch[] | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [section, setSection] = useState<ProductType>('FOOD');
  const [ticketOpen, setTicketOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [done, setDone] = useState<Order | null>(null);
  const comanda = useComanda();
  // Comanda que quedó pendiente por un pago rechazado: el reintento cobra esa misma
  const pending = useRef<{ qrToken: string; lines: typeof comanda.lines } | null>(null);

  useEffect(() => {
    const failed = (error: unknown) => setLoadError(error instanceof ApiError ? error.message : 'Algo salió mal.');
    if (branchId === null) api<Branch[]>('GET', '/menu/branches').then(setBranches, failed);
    else api<Menu>('GET', '/menu').then(setMenu, failed);
  }, [branchId]);

  async function pay(card: CardInput): Promise<string | null> {
    try {
      const retry = pending.current?.lines === comanda.lines ? pending.current : null;
      const { order, payment } = retry
        ? await api<OrderPayment>('POST', `/orders/by-token/${retry.qrToken}/payments`, { card })
        : await api<OrderPayment>('POST', '/orders', {
            branchId,
            items: comanda.lines.map(({ type, productId, quantity }) => ({ type, productId, quantity })),
            card,
          });

      if (payment.status === 'DECLINED') {
        pending.current = { qrToken: order.qrToken, lines: comanda.lines };
        return payment.message ?? 'No pudimos cobrar. Revisa los datos de la tarjeta e intenta otra vez.';
      }
      pending.current = null;
      comanda.clear();
      setPayOpen(false);
      setTicketOpen(false);
      setSection('FOOD');
      setDone(order);
      return null;
    } catch (error) {
      return error instanceof ApiError ? error.message : 'No pudimos cobrar. Intenta otra vez.';
    }
  }

  if (done) return <OrderDone order={done} onNewOrder={() => setDone(null)} />;

  if (loadError) {
    return (
      <main className="grid min-h-svh place-items-center p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg">{loadError}</p>
          <Button size="xl" onClick={() => location.reload()}>
            Intentar otra vez
          </Button>
        </div>
      </main>
    );
  }

  if (branchId === null) {
    return (
      <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-6 p-6">
        <h1 className="font-heading text-[40px]/11">¿En qué sucursal está esta tableta?</h1>
        {branches === null ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <ul className="flex flex-col gap-3">
            {branches.map((branch) => (
              <li key={branch.id}>
                <Button
                  variant="outline"
                  className="h-auto min-h-14 w-full flex-col items-start gap-0 py-3 text-left whitespace-normal"
                  onClick={() => {
                    saveBranchId(branch.id);
                    setBranchId(branch.id);
                  }}
                >
                  <span className="font-heading text-xl">{branch.name}</span>
                  <span className="font-normal">{branch.address}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
    );
  }

  const current = SECTIONS.find((item) => item.type === section)!;

  return (
    <div className="grid h-svh grid-rows-[auto_1fr] lg:grid-cols-[1fr_26rem] lg:grid-rows-1">
      <div className="flex min-h-0 flex-col lg:row-span-2">
        <header className="flex flex-wrap items-center gap-x-6 gap-y-3 px-6 pt-5 pb-4">
          <img src="/isotipo.svg" alt="El Zarape" width={56} height={56} className="size-14" />
          <nav aria-label="Menú" className="flex flex-wrap gap-2">
            {SECTIONS.map(({ type, label, icon: SectionIcon }) => {
              const active = type === section;
              return (
                <button
                  key={type}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setSection(type)}
                  className={cn(
                    'flex h-14 items-center gap-2 rounded-full border-2 px-5 font-heading text-xl outline-none transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring',
                    active ? 'border-tinta bg-maiz text-tinta' : 'border-mesa-linea hover:bg-mesa-alta',
                  )}
                >
                  <SectionIcon weight={active ? 'fill' : 'bold'} className="size-7" aria-hidden />
                  {label}
                </button>
              );
            })}
          </nav>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-6 pb-28 lg:pb-8">
          <h1 className="sr-only">{current.label}</h1>
          {menu === null ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-5" aria-busy="true" aria-label="Cargando el menú">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="aspect-[13/20] rounded-carta" />
              ))}
            </div>
          ) : (
            <MenuBoard type={section} products={menu[current.key]} onAdd={comanda.add} />
          )}
        </main>
      </div>

      {/* Tableta en horizontal: el ticket siempre a la vista */}
      <aside className="hidden min-h-0 p-4 pl-0 lg:block">
        <Ticket comanda={comanda} onPay={() => setPayOpen(true)} />
      </aside>

      {/* Pantallas angostas: "Ver comanda" abre el ticket */}
      <div className="fixed inset-x-0 bottom-0 border-t-2 border-mesa-linea bg-mesa p-3 lg:hidden">
        <Button size="xl" className="w-full justify-between" onClick={() => setTicketOpen(true)}>
          <span className="flex items-center gap-3">
            <ReceiptIcon weight="bold" />
            Ver comanda ({comanda.pieces})
          </span>
          <span className="tabular-nums">{formatPrice(comanda.total)}</span>
        </Button>
      </div>
      <Sheet open={ticketOpen} onOpenChange={setTicketOpen}>
        <SheetContent side="bottom" className="h-[90svh] border-0 bg-transparent p-3 shadow-none lg:hidden">
          <SheetTitle className="sr-only">Tu pedido</SheetTitle>
          <SheetDescription className="sr-only">Revisa tu comanda y paga.</SheetDescription>
          <Ticket comanda={comanda} onPay={() => setPayOpen(true)} />
        </SheetContent>
      </Sheet>

      <PayDialog open={payOpen} onOpenChange={setPayOpen} total={comanda.total} onPay={pay} />
    </div>
  );
}
