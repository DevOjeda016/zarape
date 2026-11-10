import { createContext, type ReactNode, use, useCallback, useEffect, useMemo, useState } from 'react';
import { alExpirarSesion, api, ErrorApi, tokenGuardado } from '@/lib/api';
import type { Empleado } from '@/lib/tipos';

interface Sesion {
  /** `undefined` mientras se revisa el token guardado; `null` sin sesión. */
  empleado: Empleado | null | undefined;
  entrar: (nombreUsuario: string, contrasena: string) => Promise<Empleado>;
  salir: () => void;
}

const ContextoSesion = createContext<Sesion | null>(null);

/** Datos del JWT guardado, sin verificar firma (solo para mostrar). `null` si no hay o venció. */
function leerToken(): Empleado | null {
  try {
    const carga = tokenGuardado.leer()?.split('.')[1];
    if (!carga) return null;
    const datos = JSON.parse(atob(carga.replace(/-/g, '+').replace(/_/g, '/'))) as {
      sub: number;
      nombreUsuario: string;
      rol: Empleado['rol'];
      exp: number;
    };
    if (datos.exp * 1000 < Date.now()) return null;
    return { id: datos.sub, nombreUsuario: datos.nombreUsuario, rol: datos.rol };
  } catch {
    return null;
  }
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [empleado, setEmpleado] = useState<Empleado | null | undefined>(() =>
    tokenGuardado.leer() ? undefined : null,
  );

  const salir = useCallback(() => {
    tokenGuardado.borrar();
    setEmpleado(null);
  }, []);

  // Al abrir con un token guardado, se confirma con la API (puede haber vencido)
  useEffect(() => {
    alExpirarSesion(salir);
    if (!tokenGuardado.leer()) return;
    api<Empleado>('GET', '/auth/yo').then(setEmpleado, (e: unknown) => {
      // Solo un 401 cierra la sesión. Sin red o con la API caída, se usa lo que dice el token
      // (solo para mostrar; la API valida cada petición)
      const delToken = e instanceof ErrorApi && e.estado !== 401 ? leerToken() : null;
      if (delToken) setEmpleado(delToken);
      else salir();
    });
  }, [salir]);

  const entrar = useCallback(async (nombreUsuario: string, contrasena: string) => {
    const { token, usuario } = await api<{ token: string; usuario: Empleado }>('POST', '/auth/login', {
      nombreUsuario,
      contrasena,
    });
    tokenGuardado.guardar(token);
    setEmpleado(usuario);
    return usuario;
  }, []);

  const valor = useMemo(() => ({ empleado, entrar, salir }), [empleado, entrar, salir]);
  return <ContextoSesion value={valor}>{children}</ContextoSesion>;
}

// oxlint-disable-next-line react/only-export-components -- el hook vive junto a su proveedor
export function useAuth(): Sesion {
  const sesion = use(ContextoSesion);
  if (!sesion) throw new Error('useAuth va dentro de <ProveedorSesion>.');
  return sesion;
}
