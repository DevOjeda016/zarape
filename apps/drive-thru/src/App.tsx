import { motion } from 'motion/react';

export function App() {
  return (
    <main className="grid min-h-svh place-items-center bg-background p-6 text-foreground">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <img src="/jarro.svg" alt="" width={128} height={128} className="size-32" />
        <h1 className="font-heading text-6xl font-extrabold tracking-tight">El Zarape</h1>
        <p className="text-lg font-medium text-muted-foreground">Sabor mexicano a tu ritmo.</p>
        <p className="rounded-full bg-secondary px-4 py-1 text-sm font-semibold">Módulo III · Drive thru</p>
      </motion.section>
    </main>
  );
}
