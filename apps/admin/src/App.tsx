import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { RutaProtegida } from '@/auth/RutaProtegida';
import { Cargando } from '@/components/Cargando';
import { Marco } from '@/components/Marco';
import { Entrar } from '@/paginas/Entrar';
import { Inicio } from '@/paginas/Inicio';
import { NoEncontrada } from '@/paginas/NoEncontrada';

// Cada catálogo se carga al abrirlo (paquete inicial más chico; el SW los precarga para uso sin red)
const Sucursales = lazy(() => import('@/paginas/Sucursales').then((m) => ({ default: m.Sucursales })));
const Usuarios = lazy(() => import('@/paginas/Usuarios').then((m) => ({ default: m.Usuarios })));
const Categorias = lazy(() => import('@/paginas/Categorias').then((m) => ({ default: m.Categorias })));
const Productos = lazy(() => import('@/paginas/Productos').then((m) => ({ default: m.Productos })));
const Combos = lazy(() => import('@/paginas/Combos').then((m) => ({ default: m.Combos })));

/** Módulo I (intranet): todo el menú de gestión es solo para ADMIN (RF01). */
export function App() {
  return (
    <Suspense fallback={<Cargando />}>
      <Routes>
        <Route path="/entrar" element={<Entrar />} />
        <Route element={<RutaProtegida roles={['ADMIN']} />}>
          <Route element={<Marco />}>
            <Route index element={<Inicio />} />
            <Route path="sucursales" element={<Sucursales />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="alimentos" element={<Productos key="ALIMENTO" tipo="ALIMENTO" />} />
            <Route path="bebidas" element={<Productos key="BEBIDA" tipo="BEBIDA" />} />
            <Route path="combos" element={<Combos />} />
            <Route path="*" element={<NoEncontrada />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
