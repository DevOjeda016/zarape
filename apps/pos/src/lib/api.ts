/**
 * Cliente HTTP del punto de venta. En desarrollo Vite redirige /api y /photos a la API (puerto 3000);
 * en producción VITE_API_URL apunta al origen de la API.
 */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

/** Error de la API con el mensaje listo para mostrar. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    const init: RequestInit =
      body === undefined
        ? { method }
        : { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
    response = await fetch(`${API_BASE}/api${path}`, init);
  } catch {
    throw new ApiError(0, 'Sin internet. Revisa la conexión e intenta otra vez.');
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(data.message) ? data.message.join(' ') : data.message;
    throw new ApiError(response.status, message ?? 'Algo salió mal. Intenta otra vez.');
  }
  return (await response.json()) as T;
}

/** Las fotos subidas vienen como /photos/…; las URL https se usan tal cual. */
export function photoSrc(photoUrl: string): string {
  return photoUrl.startsWith('/') ? `${API_BASE}${photoUrl}` : photoUrl;
}
