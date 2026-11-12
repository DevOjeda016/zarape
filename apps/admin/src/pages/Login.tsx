import { EyeIcon, EyeSlashIcon, LockKeyIcon, SignInIcon, UserIcon, XIcon } from '@phosphor-icons/react';
import { greeting } from '@zarape/shared';
import { BoardField, BoardFieldButton } from '@zarape/ui/components/board-field';
import { Button } from '@zarape/ui/components/button';
import { CardFan } from '@zarape/ui/components/card-fan';
import { FrijolLoader } from '@zarape/ui/components/frijol';
import { TableBeans } from '@zarape/ui/components/table-beans';
import { ZarapeEdge } from '@zarape/ui/components/zarape-edge';
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react';
import { type FormEvent, type KeyboardEvent, useId, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/auth/session';
import { ApiError } from '@/lib/api';

type FieldErrors = { username?: string; password?: string };
type LoginError = { title: string; hint: string };

/** Qué pasó y qué hacer, según la respuesta de la API. */
function describe(error: unknown): LoginError {
  if (error instanceof ApiError && error.status === 401) {
    return { title: error.message, hint: 'Revisa los dos campos; las mayúsculas cuentan.' };
  }
  if (error instanceof ApiError) return { title: error.message, hint: 'Intenta otra vez en un momento.' };
  return { title: 'No hay conexión con el servidor.', hint: 'Revisa tu internet e intenta otra vez.' };
}

/**
 * RF01: acceso con privilegios de empleado.
 * La mesa de lotería con las cartas repartidas y, encima de la mesa, el formulario en papel.
 */
export function Login() {
  const { employee, login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<LoginError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const usernameId = useId();
  const passwordId = useId();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [formScope, animate] = useAnimate<HTMLDivElement>();
  const reduceMotion = useReducedMotion();
  const hello = greeting();

  if (employee) return <Navigate to={from} replace />;

  function shake() {
    if (!reduceMotion) animate(formScope.current, { x: [0, -10, 10, -7, 7, -3, 0] }, { duration: 0.45 });
  }

  function watchCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState('CapsLock'));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const missing: FieldErrors = {
      username: username.trim() ? undefined : 'Escribe tu usuario.',
      password: password ? undefined : 'Escribe tu contraseña.',
    };
    if (missing.username || missing.password) {
      setFieldErrors(missing);
      setError(null);
      (missing.username ? usernameRef : passwordRef).current?.focus();
      shake();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (e) {
      setError(describe(e));
      setSubmitting(false);
      shake();
    }
  }

  return (
    <main className="flex min-h-svh flex-col bg-mesa lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <h1 className="sr-only">El Zarape</h1>

      {/* La mesa */}
      <section
        data-theme="mesa"
        className="relative flex flex-1 flex-col items-center justify-center gap-5 overflow-hidden px-6 pt-8 pb-14 text-foreground lg:gap-10 lg:py-12 xl:flex-row xl:gap-12 xl:px-10"
      >
        <TableBeans />
        <CardFan className="relative [--card-h:165px] lg:[--card-h:250px] xl:[--card-h:270px] 2xl:[--card-h:350px]" />
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
          className="relative flex min-w-0 max-w-sm flex-col gap-3 text-center xl:flex-1 xl:text-left"
        >
          <p className="font-heading text-[1.75rem] leading-[1.05] text-balance lg:text-4xl xl:text-[clamp(2.4rem,3.3vw,3.25rem)]">
            Sabor mexicano a tu ritmo.
          </p>
          <p className="text-lg font-semibold text-maiz lg:text-xl xl:text-2xl">Del comal a tu mano.</p>
        </motion.div>
      </section>

      {/* El papel: en el teléfono es la hoja de abajo; en pantallas grandes, la mitad derecha. La orilla es un zarape con onda. */}
      <section className="relative flex flex-col bg-card lg:justify-center">
        <ZarapeEdge side="top" className="lg:hidden" />
        <ZarapeEdge side="left" className="hidden lg:block" />

        <div className="relative px-6 pt-7 pb-8 sm:px-12 lg:py-12 lg:pr-12 lg:pl-16">
          <motion.div
            ref={formScope}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease: 'easeOut' }}
            className="mx-auto flex w-full max-w-sm flex-col gap-7 xl:max-w-md"
          >
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-[clamp(2rem,2.6vw,2.5rem)] leading-none">{hello}.</h2>
              <p className="text-lg text-muted-foreground">Ingresa tu usuario y contraseña.</p>
            </div>

            <form onSubmit={submit} noValidate className="flex flex-col gap-5">
              <BoardField
                ref={usernameRef}
                id={usernameId}
                label="Usuario"
                icon={<UserIcon size={24} weight="bold" aria-hidden />}
                filled={username.trim().length > 0}
                error={fieldErrors.username}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setFieldErrors((f) => ({ ...f, username: undefined }));
                }}
              />
              <BoardField
                ref={passwordRef}
                id={passwordId}
                label="Contraseña"
                icon={<LockKeyIcon size={24} weight="bold" aria-hidden />}
                filled={password.length > 0}
                error={fieldErrors.password}
                hint={capsLock ? 'Tienes las mayúsculas activadas.' : undefined}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onKeyDown={watchCapsLock}
                onKeyUp={watchCapsLock}
                onBlur={() => setCapsLock(false)}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((f) => ({ ...f, password: undefined }));
                }}
                trailing={
                  <BoardFieldButton
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeSlashIcon size={22} weight="bold" /> : <EyeIcon size={22} weight="bold" />}
                  </BoardFieldButton>
                }
              />

              <AnimatePresence initial={false}>
                {error && (
                  <motion.div
                    key="error"
                    role="alert"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-3 rounded-md border-2 border-tinta bg-papel p-3"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-sm border-2 border-tinta bg-destructive text-background">
                      <XIcon size={20} weight="bold" aria-hidden />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-semibold">{error.title}</span>
                      <span className="text-sm text-muted-foreground">{error.hint}</span>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                size="xl"
                disabled={submitting}
                aria-busy={submitting || undefined}
                className="mt-1 w-full disabled:opacity-100"
              >
                {submitting ? (
                  <FrijolLoader label="Entrando" />
                ) : (
                  <>
                    Entrar
                    <SignInIcon size={22} weight="bold" aria-hidden />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
