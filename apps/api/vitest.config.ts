import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: './',
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    // Las e2e comparten una sola BD (la de `prisma dev` no aguanta dos archivos a la vez)
    fileParallelism: false,
  },
});
