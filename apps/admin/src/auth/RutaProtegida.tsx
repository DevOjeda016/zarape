import type { Rol } from '@zarape/shared';
import { Navigate, Outlet, useLocation } from 'react-router';
import { Cargando } from '@/components/Cargando';
import { SinPermiso } from '@/paginas/SinPermiso';
import { useAuth } from './sesion';

/** Rutas protegidas por rol: sin sesión manda al login; con otro rol muestra "sin permiso". */
export function RutaProtegida({ roles }: { roles: readonly Rol[] }) {
  const { empleado } = useAuth();
  const ubicacion = useLocation();

  if (empleado === undefined) return <Cargando />;
  if (!empleado) return <Navigate to="/entrar" replace state={{ desde: ubicacion.pathname }} />;
  if (!roles.includes(empleado.rol)) return <SinPermiso />;
  return <Outlet />;
}
