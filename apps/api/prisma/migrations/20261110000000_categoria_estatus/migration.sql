-- Categoría con estatus: la regla de eliminar (borrar si no tiene productos, si no BAJA) aplica igual que en los demás catálogos.
ALTER TABLE "categoria" ADD COLUMN "estatus" "estatus" NOT NULL DEFAULT 'ACTIVO';
