-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "estatus" AS ENUM ('ACTIVO', 'BAJA');

-- CreateEnum
CREATE TYPE "rol" AS ENUM ('ADMIN', 'COCINA');

-- CreateEnum
CREATE TYPE "tipo_categoria" AS ENUM ('ALIMENTO', 'BEBIDA');

-- CreateEnum
CREATE TYPE "canal" AS ENUM ('KIOSKO', 'DRIVE_THRU');

-- CreateEnum
CREATE TYPE "estatus_comanda" AS ENUM ('PENDIENTE', 'PAGADA', 'EN_COCINA', 'LISTA', 'ENTREGADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "tipo_producto" AS ENUM ('ALIMENTO', 'BEBIDA', 'COMBO');

-- CreateEnum
CREATE TYPE "estatus_pago" AS ENUM ('APROBADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "sucursal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "latitud" DECIMAL(9,6) NOT NULL,
    "longitud" DECIMAL(9,6) NOT NULL,
    "foto_url" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "horarios" TEXT NOT NULL,
    "estatus" "estatus" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nombre_usuario" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "rol" NOT NULL,
    "sucursal_id" INTEGER,
    "estatus" "estatus" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "tipo_categoria" NOT NULL,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alimento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "foto_url" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "estatus" "estatus" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "alimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bebida" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "foto_url" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "estatus" "estatus" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "bebida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "foto_url" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "estatus" "estatus" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "combo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combo_alimento" (
    "combo_id" INTEGER NOT NULL,
    "alimento_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "combo_alimento_pkey" PRIMARY KEY ("combo_id","alimento_id")
);

-- CreateTable
CREATE TABLE "combo_bebida" (
    "combo_id" INTEGER NOT NULL,
    "bebida_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "combo_bebida_pkey" PRIMARY KEY ("combo_id","bebida_id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "usuario" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "estatus" "estatus" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medio_pago" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "titular" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "ultimos4" CHAR(4) NOT NULL,
    "mes_venc" INTEGER NOT NULL,
    "anio_venc" INTEGER NOT NULL,
    "calle_numero" TEXT NOT NULL,
    "colonia" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "codigo_postal" CHAR(5) NOT NULL,

    CONSTRAINT "medio_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comanda" (
    "id" SERIAL NOT NULL,
    "token_qr" UUID NOT NULL DEFAULT gen_random_uuid(),
    "turno" INTEGER,
    "fecha_turno" DATE,
    "canal" "canal" NOT NULL,
    "estatus" "estatus_comanda" NOT NULL DEFAULT 'PENDIENTE',
    "sucursal_id" INTEGER NOT NULL,
    "cliente_id" INTEGER,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "iva" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "creada_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pagada_en" TIMESTAMPTZ(3),
    "lista_en" TIMESTAMPTZ(3),
    "entregada_en" TIMESTAMPTZ(3),

    CONSTRAINT "comanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_comanda" (
    "id" SERIAL NOT NULL,
    "comanda_id" INTEGER NOT NULL,
    "tipo" "tipo_producto" NOT NULL,
    "alimento_id" INTEGER,
    "bebida_id" INTEGER,
    "combo_id" INTEGER,
    "nombre" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "total_linea" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detalle_comanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pago" (
    "id" SERIAL NOT NULL,
    "comanda_id" INTEGER NOT NULL,
    "titular" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "ultimos4" CHAR(4) NOT NULL,
    "mes_venc" INTEGER NOT NULL,
    "anio_venc" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "estatus" "estatus_pago" NOT NULL,
    "referencia" TEXT NOT NULL,
    "fecha" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gasto_marketing" (
    "id" SERIAL NOT NULL,
    "campana" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "sucursal_id" INTEGER,

    CONSTRAINT "gasto_marketing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calificacion" (
    "id" SERIAL NOT NULL,
    "comanda_id" INTEGER NOT NULL,
    "estrellas" INTEGER NOT NULL,
    "comentario" TEXT,
    "creada_en" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_nombre_usuario_key" ON "usuario"("nombre_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_usuario_key" ON "cliente"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "medio_pago_cliente_id_key" ON "medio_pago"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "comanda_token_qr_key" ON "comanda"("token_qr");

-- CreateIndex
CREATE UNIQUE INDEX "comanda_turno_diario_key" ON "comanda"("sucursal_id", "fecha_turno", "turno");

-- CreateIndex
CREATE UNIQUE INDEX "calificacion_comanda_id_key" ON "calificacion"("comanda_id");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alimento" ADD CONSTRAINT "alimento_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bebida" ADD CONSTRAINT "bebida_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_alimento" ADD CONSTRAINT "combo_alimento_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "combo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_alimento" ADD CONSTRAINT "combo_alimento_alimento_id_fkey" FOREIGN KEY ("alimento_id") REFERENCES "alimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_bebida" ADD CONSTRAINT "combo_bebida_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "combo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_bebida" ADD CONSTRAINT "combo_bebida_bebida_id_fkey" FOREIGN KEY ("bebida_id") REFERENCES "bebida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medio_pago" ADD CONSTRAINT "medio_pago_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comanda" ADD CONSTRAINT "comanda_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comanda" ADD CONSTRAINT "comanda_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_comanda" ADD CONSTRAINT "detalle_comanda_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comanda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_comanda" ADD CONSTRAINT "detalle_comanda_alimento_id_fkey" FOREIGN KEY ("alimento_id") REFERENCES "alimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_comanda" ADD CONSTRAINT "detalle_comanda_bebida_id_fkey" FOREIGN KEY ("bebida_id") REFERENCES "bebida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_comanda" ADD CONSTRAINT "detalle_comanda_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "combo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comanda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gasto_marketing" ADD CONSTRAINT "gasto_marketing_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificacion" ADD CONSTRAINT "calificacion_comanda_id_fkey" FOREIGN KEY ("comanda_id") REFERENCES "comanda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Reglas que schema.prisma no puede expresar (docs/modelo-de-datos.md) ───

-- Un solo producto por línea: solo uno de alimento_id, bebida_id o combo_id, según el tipo.
ALTER TABLE "detalle_comanda" ADD CONSTRAINT "detalle_comanda_un_producto_check" CHECK (
    ("tipo" = 'ALIMENTO' AND "alimento_id" IS NOT NULL AND "bebida_id" IS NULL AND "combo_id" IS NULL)
    OR ("tipo" = 'BEBIDA' AND "bebida_id" IS NOT NULL AND "alimento_id" IS NULL AND "combo_id" IS NULL)
    OR ("tipo" = 'COMBO' AND "combo_id" IS NOT NULL AND "alimento_id" IS NULL AND "bebida_id" IS NULL)
);

-- La comanda del kiosko no tiene cliente; la del drive thru siempre lo tiene.
ALTER TABLE "comanda" ADD CONSTRAINT "comanda_cliente_por_canal_check" CHECK (
    ("canal" = 'KIOSKO' AND "cliente_id" IS NULL)
    OR ("canal" = 'DRIVE_THRU' AND "cliente_id" IS NOT NULL)
);

-- Turno y fecha_turno se asignan juntos (al pagar), para que el índice único por sucursal y día funcione.
ALTER TABLE "comanda" ADD CONSTRAINT "comanda_turno_con_fecha_check" CHECK (
    ("turno" IS NULL) = ("fecha_turno" IS NULL)
);
