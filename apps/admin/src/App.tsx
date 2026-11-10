import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { AppShell } from '@/components/AppShell';
import { Loading } from '@/components/Loading';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { NotFound } from '@/pages/NotFound';

// Cada catálogo se carga al abrirlo (paquete inicial más chico; el SW los precarga para uso sin red)
const Branches = lazy(() => import('@/pages/Branches').then((m) => ({ default: m.Branches })));
const Employees = lazy(() => import('@/pages/Employees').then((m) => ({ default: m.Employees })));
const Categories = lazy(() => import('@/pages/Categories').then((m) => ({ default: m.Categories })));
const Products = lazy(() => import('@/pages/Products').then((m) => ({ default: m.Products })));
const Combos = lazy(() => import('@/pages/Combos').then((m) => ({ default: m.Combos })));

/** Módulo I (intranet): todo el menú de gestión es solo para ADMIN (RF01). */
export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="branches" element={<Branches />} />
            <Route path="employees" element={<Employees />} />
            <Route path="categories" element={<Categories />} />
            <Route path="foods" element={<Products key="FOOD" type="FOOD" />} />
            <Route path="drinks" element={<Products key="DRINK" type="DRINK" />} />
            <Route path="combos" element={<Combos />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
