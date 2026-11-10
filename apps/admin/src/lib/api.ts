/**
 * Cliente HTTP de la intranet. En desarrollo Vite redirige /api y /fotos a la API (puerto 3000);
 * en producción VITE_API_URL apunta al origen de la API.
 */
export const BASE_API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

const CLAVE_TOKEN = 'zarape.admin.token';

export const tokenGuardado = {
  // sessionStorage: cerrar la pestaña cierra la sesión (intranet compartida en sucursal)
  leer: () => leerSeguro(() => sessionStorage.getItem(CLAVE_TOKEN)),
  guardar: (token: string) => leerSeguro(() => sessionStorage.setItem(CLAVE_TOKEN, token)),
  borrar: () => leerSeguro(() => sessionStorage.removeItem(CLAVE_TOKEN)),
};

function leerSeguro<T>(accion: () => T): T | null {
  try {
    return accion();
  } catch {
    return null;
  }
}

/** Error de la API con el mensaje listo para mostrar. */
export class ErrorApi extends Error {
  readonly estado: number;

  constructor(estado: number, mensaje: string) {
    super(mensaje);
    this.estado = estado;
  }
}

/** Se llama cuando la API responde 401 (sesión vencida): AuthProvider cierra la sesión. */
let alExpirar: (() => void) | undefined;
export function alExpirarSesion(fn: () => void): void {
  alExpirar = fn;
}

type Metodo = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export async function api<T>(metodo: Metodo, ruta: string, cuerpo?: unknown): Promise<T> {
  const token = tokenGuardado.leer();
  const esArchivo = cuerpo instanceof FormData;
  let respuesta: Response;
  try {
    respuesta = await fetch(`${BASE_API}/api${ruta}`, {
      method: metodo,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(cuerpo !== undefined && !esArchivo ? { 'Content-Type': 'application/json' } : {}),
      },
      body: cuerpo === undefined ? undefined : esArchivo ? cuerpo : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorApi(0, 'Sin conexión con el servidor. Revisa tu red e intenta otra vez.');
  }

  if (!respuesta.ok) {
    const datos = (await respuesta.json().catch(() => ({}))) as { message?: string | string[] };
    if (respuesta.status === 401 && ruta !== '/auth/login') alExpirar?.();
    throw new ErrorApi(respuesta.status, mensajeDe(datos.message, respuesta.status));
  }
  return (await respuesta.json()) as T;
}

function mensajeDe(mensaje: string | string[] | undefined, estado: number): string {
  if (Array.isArray(mensaje)) return mensaje.join(' ');
  if (mensaje) return mensaje;
  if (estado === 413) return 'El archivo pesa demasiado.';
  return 'Algo salió mal. Intenta otra vez.';
}

/** Arma la query string sin los filtros vacíos. */
export function conFiltros(ruta: string, filtros: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== '') params.set(clave, String(valor));
  }
  const query = params.toString();
  return query ? `${ruta}?${query}` : ruta;
}

/** Las fotos subidas vienen como /fotos/…; las URL https se usan tal cual. */
export function urlFoto(fotoUrl: string): string {
  return fotoUrl.startsWith('/') ? `${BASE_API}${fotoUrl}` : fotoUrl;
}

export async function subirFoto(archivo: File): Promise<string> {
  const datos = new FormData();
  datos.append('foto', archivo);
  return (await api<{ url: string }>('POST', '/archivos/fotos', datos)).url;
}
