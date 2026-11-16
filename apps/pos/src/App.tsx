import { Route, Routes } from 'react-router';
import { Kiosk } from '@/kiosk/Kiosk';

/** Módulo II (en sitio): kiosko. Cocina, turnos y ventanilla llegan en sus propias rutas. */
export function App() {
  return (
    <Routes>
      <Route path="*" element={<Kiosk />} />
    </Routes>
  );
}
