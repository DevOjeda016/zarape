import { Button } from '@zarape/ui/components/button';
import { LoteriaCard } from '@zarape/ui/components/loteria-card';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDateTime, formatPrice, formatTicket } from '@/lib/format';
import type { Order } from '@/lib/types';

/**
 * Pago aprobado: la carta con tu turno y el QR de la compra (RF14), más el ticket (RF10, RF11).
 */
export function OrderDone({ order, onNewOrder }: { order: Order; onNewOrder: () => void }) {
  const ticket = formatTicket(order.ticketNumber ?? 0);

  return (
    <main className="grid min-h-svh place-items-center p-6">
      <div className="grid w-full max-w-4xl items-center gap-8 md:grid-cols-[auto_1fr]">
        <motion.div
          initial={{ opacity: 0, rotate: -8, y: 24 }}
          animate={{ opacity: 1, rotate: -3, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="mx-auto w-64"
        >
          <LoteriaCard number={ticket} title="Tu pedido" className="shadow-carta">
            <QRCodeSVG
              value={order.qrToken}
              level="M"
              marginSize={0}
              bgColor="transparent"
              fgColor="currentColor"
              title={`Código QR del turno ${ticket}`}
              className="h-auto w-full"
            />
          </LoteriaCard>
        </motion.div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-heading text-[40px]/11">Tu turno es el {ticket}</h1>
            <p className="mt-2 text-lg text-muted-foreground">Se está cocinando. Cuando esté listo te cantamos.</p>
          </div>

          <section
            data-theme="papel"
            aria-label="Ticket"
            className="rounded-carta border-3 border-tinta bg-carta p-4 text-tinta"
          >
            <p className="text-sm text-muted-foreground">
              Comanda {order.id}, {formatDateTime(order.paidAt ?? order.createdAt)}
            </p>
            <ul className="mt-3 divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-baseline justify-between gap-3 py-2 tabular-nums">
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span>{formatPrice(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t-2 border-tinta pt-3 tabular-nums">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="text-right">{formatPrice(order.subtotal)}</dd>
              <dt className="text-muted-foreground">IVA (16%)</dt>
              <dd className="text-right">{formatPrice(order.tax)}</dd>
              <dt className="font-heading text-xl">Pagado</dt>
              <dd className="text-right font-heading text-xl text-chile">{formatPrice(order.total)}</dd>
            </dl>
          </section>

          <Button size="xl" className="self-start" onClick={onNewOrder}>
            Hacer otro pedido
          </Button>
        </div>
      </div>
    </main>
  );
}
