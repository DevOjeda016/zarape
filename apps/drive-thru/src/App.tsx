import { motion } from 'motion/react';

export function App() {
  return (
    <main className="grid min-h-svh place-items-center bg-background p-6 text-foreground">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <h1>
          <img src="/carta.svg" alt="El Zarape" width={208} height={320} className="h-80 w-auto -rotate-3 rounded-carta shadow-carta" />
        </h1>
        <p className="font-heading text-3xl">Sabor mexicano a tu ritmo.</p>
        <p className="rounded-full border-2 border-current px-4 py-1 text-sm font-semibold">Módulo III · Drive thru</p>
      </motion.section>
    </main>
  );
}
