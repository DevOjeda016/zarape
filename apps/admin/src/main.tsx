import { PwaNotices } from '@zarape/ui/components/pwa-notices';
import { Toaster } from '@zarape/ui/components/sonner';
import { TooltipProvider } from '@zarape/ui/components/tooltip';
import { MotionConfig } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import '@zarape/ui/globals.css';
import './print.css';
import { App } from './App.tsx';
import { SessionProvider } from './auth/session.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Si el sistema pide menos movimiento, Motion quita desplazamientos y deja fundidos */}
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <SessionProvider>
          <TooltipProvider delayDuration={300}>
            <App />
            <Toaster position="top-center" richColors={false} closeButton />
            <PwaNotices />
          </TooltipProvider>
        </SessionProvider>
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
);
