import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Adaptador de PostgreSQL a partir de la URL. Respeta `?schema=` igual que la CLI de Prisma,
 * para que la app, el seed y las migraciones usen el mismo esquema (por defecto, `public`).
 */
export function pgAdapter(connectionString: string | undefined): PrismaPg {
  const schema = connectionString ? new URL(connectionString).searchParams.get('schema') : null;
  return new PrismaPg({ connectionString }, schema ? { schema } : undefined);
}
