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
import { useAuth } from '@/auth/sesion';
import { ErrorApi } from '@/lib/api';

/** Franjas del zarape (de arriba abajo): detalle de marca, nunca fondo de texto. */
const FRANJAS = ['bg-rosa', 'bg-cempasuchil', 'bg-masa', 'bg-talavera', 'bg-masa', 'bg-nopal', 'bg-rosa'];

/** RF01: acceso con privilegios de empleado. */
export function Entrar() {
  const { empleado, entrar } = useAuth();
  const navegar = useNavigate();
  const desde = (useLocation().state as { desde?: string } | null)?.desde ?? '/';
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [ver, setVer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const idUsuario = useId();
  const idContrasena = useId();

  if (empleado) return <Navigate to={desde} replace />;

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!usuario.trim() || !contrasena) return setError('Escribe tu usuario y tu contraseña.');
    setEnviando(true);
    setError(null);
    try {
      await entrar(usuario.trim(), contrasena);
      navegar(desde, { replace: true });
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : 'No pudimos entrar. Intenta otra vez.');
      setEnviando(false);
    }
  }

  return (
    <main className="grid min-h-svh place-items-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex w-full max-w-sm flex-col items-center gap-6"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <img src="/jarro.svg" alt="" width={96} height={96} className="size-24" />
          <h1 className="font-heading text-4xl font-extrabold tracking-tight">El Zarape</h1>
          <p className="font-medium text-muted-foreground">Sabor mexicano a tu ritmo.</p>
        </div>

        <Card className="w-full overflow-hidden pt-0">
          <div className="flex flex-col" aria-hidden>
            {FRANJAS.map((color, i) => (
              <span key={i} className={`h-1 ${color}`} />
            ))}
          </div>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Gestión</CardTitle>
            <CardDescription>Entra con tu usuario de empleado.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={enviar} noValidate>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={idUsuario}>Usuario</FieldLabel>
                  <Input
                    id={idUsuario}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoFocus
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className="h-11"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={idContrasena}>Contraseña</FieldLabel>
                  <InputGroup className="h-11">
                    <InputGroupInput
                      id={idContrasena}
                      type={ver ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        size="icon-sm"
                        onClick={() => setVer(!ver)}
                        aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        aria-pressed={ver}
                      >
                        {ver ? <EyeSlashIcon /> : <EyeIcon />}
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
                <Button type="submit" size="lg" className="h-11 w-full" disabled={enviando}>
                  {enviando ? <CircleNotchIcon data-icon="inline-start" className="animate-spin" /> : <SignInIcon data-icon="inline-start" />}
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
