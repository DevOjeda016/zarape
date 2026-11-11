import { CircleNotchIcon, EyeIcon, EyeSlashIcon, SignInIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription } from '@zarape/ui/components/alert';
import { Button } from '@zarape/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@zarape/ui/components/card';
import { Field, FieldGroup, FieldLabel } from '@zarape/ui/components/field';
import { Input } from '@zarape/ui/components/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@zarape/ui/components/input-group';
import { motion } from 'motion/react';
import { type FormEvent, useId, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/auth/session';
import { ApiError } from '@/lib/api';

/** Franjas del zarape (de arriba abajo): detalle de marca, nunca fondo de texto. */
const ZARAPE_STRIPES = ['bg-chile', 'bg-maiz', 'bg-carta', 'bg-jarra', 'bg-carta', 'bg-nopal', 'bg-rosa', 'bg-maiz', 'bg-chile'];

/** RF01: acceso con privilegios de empleado. La carta de la casa y el formulario, sobre la mesa. */
export function Login() {
  const { employee, login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const usernameId = useId();
  const passwordId = useId();

  if (employee) return <Navigate to={from} replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!username.trim() || !password) return setError('Escribe tu usuario y tu contraseña.');
    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No pudimos entrar. Intenta otra vez.');
      setSubmitting(false);
    }
  }

  return (
    <main data-theme="mesa" className="grid min-h-svh place-items-center bg-background p-4 text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex w-full max-w-sm flex-col items-center gap-6"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <h1>
            <img src="/carta.svg" alt="El Zarape" width={130} height={200} className="h-50 w-auto -rotate-3 rounded-carta shadow-carta" />
          </h1>
          <p className="font-heading text-xl">Sabor mexicano a tu ritmo.</p>
        </div>

        <Card data-theme="papel" className="w-full overflow-hidden pt-0 shadow-carta">
          <div className="flex flex-col" aria-hidden>
            {ZARAPE_STRIPES.map((color, i) => (
              <span key={i} className={`h-1 ${color}`} />
            ))}
          </div>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Gestión</CardTitle>
            <CardDescription>Entra con tu usuario de empleado.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} noValidate>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={usernameId}>Usuario</FieldLabel>
                  <Input
                    id={usernameId}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={passwordId}>Contraseña</FieldLabel>
                  <InputGroup className="h-11">
                    <InputGroupInput
                      id={passwordId}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        size="icon-sm"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
                {error && (
                  <Alert variant="destructive" role="alert">
                    <WarningCircleIcon />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" size="lg" className="h-11 w-full" disabled={submitting}>
                  {submitting ? <CircleNotchIcon data-icon="inline-start" className="animate-spin" /> : <SignInIcon data-icon="inline-start" />}
                  Entrar
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">Solo para la red interna del restaurante.</p>
      </motion.div>
    </main>
  );
}
