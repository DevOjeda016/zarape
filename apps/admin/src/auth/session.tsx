import { createContext, type ReactNode, use, useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiError, onSessionExpired, storedToken } from '@/lib/api';
import type { SessionEmployee } from '@/lib/types';

interface Session {
  /** `undefined` mientras se revisa el token guardado; `null` sin sesión. */
  employee: SessionEmployee | null | undefined;
  login: (username: string, password: string) => Promise<SessionEmployee>;
  logout: () => void;
}

const SessionContext = createContext<Session | null>(null);

/** Datos del JWT guardado, sin verificar firma (solo para mostrar). `null` si no hay o venció. */
function readToken(): SessionEmployee | null {
  try {
    const payload = storedToken.read()?.split('.')[1];
    if (!payload) return null;
    const data = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      sub: number;
      username: string;
      role: SessionEmployee['role'];
      exp: number;
    };
    if (data.exp * 1000 < Date.now()) return null;
    return { id: data.sub, username: data.username, role: data.role };
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<SessionEmployee | null | undefined>(() =>
    storedToken.read() ? undefined : null,
  );

  const logout = useCallback(() => {
    storedToken.clear();
    setEmployee(null);
  }, []);

  // Al abrir con un token guardado, se confirma con la API (puede haber vencido)
  useEffect(() => {
    onSessionExpired(logout);
    if (!storedToken.read()) return;
    api<SessionEmployee>('GET', '/auth/me').then(setEmployee, (e: unknown) => {
      // Solo un 401 cierra la sesión. Sin red o con la API caída, se usa lo que dice el token
      // (solo para mostrar; la API valida cada petición)
      const fromToken = e instanceof ApiError && e.status !== 401 ? readToken() : null;
      if (fromToken) setEmployee(fromToken);
      else logout();
    });
  }, [logout]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await api<{ token: string; employee: SessionEmployee }>('POST', '/auth/login', {
      username,
      password,
    });
    storedToken.save(response.token);
    setEmployee(response.employee);
    return response.employee;
  }, []);

  const value = useMemo(() => ({ employee, login, logout }), [employee, login, logout]);
  return <SessionContext value={value}>{children}</SessionContext>;
}

// oxlint-disable-next-line react/only-export-components -- el hook vive junto a su proveedor
export function useAuth(): Session {
  const session = use(SessionContext);
  if (!session) throw new Error('useAuth va dentro de <SessionProvider>.');
  return session;
}
