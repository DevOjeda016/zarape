import { CreditCardIcon, WarningCircleIcon, WifiSlashIcon } from '@phosphor-icons/react';
import { type CardInput, cardError } from '@zarape/shared';
import { Button } from '@zarape/ui/components/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@zarape/ui/components/dialog';
import { FrijolLoader } from '@zarape/ui/components/frijol';
import { Input } from '@zarape/ui/components/input';
import { Label } from '@zarape/ui/components/label';
import { useOnlineStatus } from '@zarape/ui/hooks/use-online-status';
import { type FormEvent, useState } from 'react';
import { formatPrice } from '@/lib/format';

const EMPTY = { number: '', holderName: '', expMonth: '', expYear: '', cvv: '' };

/** "4242424242424242" → "4242 4242 4242 4242". */
function groupDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})(?=.)/g, '$1 ');
}

const digits = (value: string, max: number) => value.replace(/\D/g, '').slice(0, max);

/**
 * RF12, RF13: "Pagar en línea" con el simulador; "Pagar con terminal" se ve pero no está disponible.
 * `onPay` cobra y regresa el mensaje si el pago no pasó (o `null` si se aprobó).
 */
export function PayDialog({
  open,
  onOpenChange,
  total,
  onPay,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onPay: (card: CardInput) => Promise<string | null>;
}) {
  const online = useOnlineStatus();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const set = (field: keyof typeof EMPTY, value: string) => setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const card: CardInput = {
      number: form.number,
      holderName: form.holderName,
      expMonth: Number(form.expMonth),
      expYear: Number(form.expYear),
      cvv: form.cvv,
    };
    const invalid = cardError(card);
    if (invalid) return setError(invalid);

    setError(null);
    setPaying(true);
    const declined = await onPay(card);
    setPaying(false);
    if (declined) setError(declined);
    else setForm(EMPTY);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !paying && onOpenChange(next)}>
      <DialogContent data-theme="papel" className="border-3 border-tinta bg-carta text-tinta sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-[28px]/8">Pagar {formatPrice(total)}</DialogTitle>
          <DialogDescription>Paga con tu tarjeta y te damos tu turno.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="grid grid-cols-6 gap-x-3 gap-y-4">
          <div className="col-span-6 grid gap-1.5">
            <Label htmlFor="card-number">Número de tarjeta</Label>
            <Input
              id="card-number"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              value={form.number}
              onChange={(event) => set('number', groupDigits(event.target.value))}
              required
            />
          </div>
          <div className="col-span-6 grid gap-1.5">
            <Label htmlFor="card-holder">Nombre en la tarjeta</Label>
            <Input
              id="card-holder"
              autoComplete="cc-name"
              maxLength={100}
              value={form.holderName}
              onChange={(event) => set('holderName', event.target.value)}
              required
            />
          </div>
          <div className="col-span-2 grid gap-1.5">
            <Label htmlFor="card-month">Mes</Label>
            <Input
              id="card-month"
              inputMode="numeric"
              autoComplete="cc-exp-month"
              placeholder="MM"
              value={form.expMonth}
              onChange={(event) => set('expMonth', digits(event.target.value, 2))}
              required
            />
          </div>
          <div className="col-span-2 grid gap-1.5">
            <Label htmlFor="card-year">Año</Label>
            <Input
              id="card-year"
              inputMode="numeric"
              autoComplete="cc-exp-year"
              placeholder="AA"
              value={form.expYear}
              onChange={(event) => set('expYear', digits(event.target.value, 2))}
              required
            />
          </div>
          <div className="col-span-2 grid gap-1.5">
            <Label htmlFor="card-cvv">CVV</Label>
            <Input
              id="card-cvv"
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              value={form.cvv}
              onChange={(event) => set('cvv', digits(event.target.value, 4))}
              required
            />
          </div>

          <div className="col-span-6 min-h-6" role="alert">
            {error && (
              <p className="flex items-start gap-2 font-semibold text-destructive">
                <WarningCircleIcon weight="bold" className="mt-0.5 size-5 shrink-0" aria-hidden />
                {error}
              </p>
            )}
            {!online && !error && (
              <p className="flex items-start gap-2 font-semibold">
                <WifiSlashIcon weight="bold" className="mt-0.5 size-5 shrink-0" aria-hidden />
                Sin internet. Para pagar necesitas conexión.
              </p>
            )}
          </div>

          <Button type="submit" size="xl" className="col-span-6" disabled={paying || !online}>
            {paying ? <FrijolLoader label="Cobrando" /> : 'Pagar en línea'}
          </Button>
          <Button type="button" variant="outline" size="lg" className="col-span-6" disabled>
            <CreditCardIcon weight="bold" data-icon="inline-start" />
            Pago con terminal: próximamente
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
