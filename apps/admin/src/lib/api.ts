/**
 * Cliente HTTP de la intranet. En desarrollo Vite redirige /api y /photos a la API (puerto 3000);
 * en producción VITE_API_URL apunta al origen de la API.
 */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

const TOKEN_KEY = 'zarape.admin.token';

export const storedToken = {
  // sessionStorage: cerrar la pestaña cierra la sesión (intranet compartida en sucursal)
  read: () => safely(() => sessionStorage.getItem(TOKEN_KEY)),
  save: (token: string) => safely(() => sessionStorage.setItem(TOKEN_KEY, token)),
  clear: () => safely(() => sessionStorage.removeItem(TOKEN_KEY)),
};

function safely<T>(action: () => T): T | null {
  try {
    return action();
  } catch {
    return null;
  }
}

/** Error de la API con el mensaje listo para mostrar. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Se llama cuando la API responde 401 (sesión vencida): SessionProvider cierra la sesión. */
let onExpired: (() => void) | undefined;
export function onSessionExpired(fn: () => void): void {
  onExpired = fn;
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export async function api<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const token = storedToken.read();
  const isFile = body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined && !isFile ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body === undefined ? undefined : isFile ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Sin conexión con el servidor. Revisa tu red e intenta otra vez.');
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string | string[] };
    if (response.status === 401 && path !== '/auth/login') onExpired?.();
    throw new ApiError(response.status, messageFrom(data.message, response.status));
  }
  return (await response.json()) as T;
}

function messageFrom(message: string | string[] | undefined, status: number): string {
  if (Array.isArray(message)) return message.join(' ');
  if (message) return message;
  if (status === 413) return 'El archivo pesa demasiado.';
  return 'Algo salió mal. Intenta otra vez.';
}

/** Arma la query string sin los filtros vacíos. */
export function withFilters(path: string, filters: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

/** Las fotos subidas vienen como /photos/…; las URL https se usan tal cual. */
export function photoSrc(photoUrl: string): string {
  return photoUrl.startsWith('/') ? `${API_BASE}${photoUrl}` : photoUrl;
}

export async function uploadPhoto(file: File): Promise<string> {
  const data = new FormData();
  data.append('photo', file);
  return (await api<{ url: string }>('POST', '/files/photos', data)).url;
}
