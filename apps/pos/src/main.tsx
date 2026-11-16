import { PwaNotices } from '@zarape/ui/components/pwa-notices';
import { MotionConfig } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import '@zarape/ui/globals.css';
import { App } from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Si el sistema pide menos movimiento, Motion quita desplazamientos y deja fundidos */}
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <App />
        <PwaNotices />
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
);
