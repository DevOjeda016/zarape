import { MinusIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { lineKey, MAX_QUANTITY } from '@zarape/shared';
import { Button } from '@zarape/ui/components/button';
import { AnimatePresence, motion } from 'motion/react';
import { formatPrice } from '@/lib/format';
import type { Comanda } from './useComanda';

/**
 * RF09: comanda tipo ticket. Cantidad +/−, eliminar, precio unitario, total por producto,
 * subtotal, IVA y total a pagar. Hoja de papel con marco, también sobre la mesa.
 */
export function Ticket({ comanda, onPay }: { comanda: Comanda; onPay: () => void }) {
  const { lines, subtotal, tax, total } = comanda;
  const empty = lines.length === 0;

  return (
    <section
      data-theme="papel"
      aria-labelledby="ticket-title"
      className="flex h-full min-h-0 flex-col rounded-carta border-3 border-tinta bg-carta p-1.5 text-tinta"
    >
      <div className="flex min-h-0 flex-1 flex-col rounded-[2px] border-2 border-tinta">
        <h2 id="ticket-title" className="border-b-2 border-tinta px-4 py-3 font-heading text-[28px]/8">
          Tu pedido
        </h2>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <img src="/jarro.svg" alt="" width={96} height={96} className="size-24" />
            <p className="text-lg text-muted-foreground">Toca "Agregar" en lo que se te antoje.</p>
          </div>
        ) : (
          <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto px-4">
            <AnimatePresence initial={false}>
              {lines.map((line) => (
                <motion.li
                  key={lineKey(line)}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="py-3"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold">{line.name}</span>
                    <span className="font-semibold tabular-nums">{formatPrice(line.lineTotal)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-lg"
                      aria-label={`Quitar uno de ${line.name}`}
                      disabled={line.quantity <= 1}
                      onClick={() => comanda.decrease(line)}
                    >
                      <MinusIcon weight="bold" />
                    </Button>
                    <span className="w-8 text-center text-lg font-semibold tabular-nums" aria-label={`Cantidad: ${line.quantity}`}>
                      {line.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-lg"
                      aria-label={`Agregar uno de ${line.name}`}
                      disabled={line.quantity >= MAX_QUANTITY}
                      onClick={() => comanda.increase(line)}
                    >
                      <PlusIcon weight="bold" />
                    </Button>
                    <span className="text-sm text-muted-foreground tabular-nums">{formatPrice(line.unitPrice)} c/u</span>
                    <Button
                      variant="ghost"
                      size="icon-lg"
                      className="ml-auto text-destructive"
                      aria-label={`Eliminar ${line.name}`}
                      onClick={() => comanda.remove(line)}
                    >
                      <TrashIcon weight="bold" />
                    </Button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        <div className="border-t-2 border-tinta p-4">
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 tabular-nums" aria-live="polite">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-right">{formatPrice(subtotal)}</dd>
            <dt className="text-muted-foreground">IVA (16%)</dt>
            <dd className="text-right">{formatPrice(tax)}</dd>
            <dt className="pt-2 font-heading text-xl">Total a pagar</dt>
            <dd className="pt-2 text-right font-heading text-[28px]/8 text-chile">{formatPrice(total)}</dd>
          </dl>
          <Button size="xl" className="mt-4 w-full" disabled={empty} onClick={onPay}>
            {empty ? 'Pagar' : `Pagar ${formatPrice(total)}`}
          </Button>
        </div>
      </div>
    </section>
  );
}
