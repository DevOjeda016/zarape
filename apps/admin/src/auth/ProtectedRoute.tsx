import type { Role } from '@zarape/shared';
import { Navigate, Outlet, useLocation } from 'react-router';
import { Loading } from '@/components/Loading';
import { Forbidden } from '@/pages/Forbidden';
import { useAuth } from './session';

/** Rutas protegidas por rol: sin sesión manda al login; con otro rol muestra "sin permiso". */
export function ProtectedRoute({ roles }: { roles: readonly Role[] }) {
  const { employee } = useAuth();
  const location = useLocation();

  if (employee === undefined) return <Loading />;
  if (!employee) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!roles.includes(employee.role)) return <Forbidden />;
  return <Outlet />;
}
