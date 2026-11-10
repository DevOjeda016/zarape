-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "role" AS ENUM ('ADMIN', 'KITCHEN');

-- CreateEnum
CREATE TYPE "category_type" AS ENUM ('FOOD', 'DRINK');

-- CreateEnum
CREATE TYPE "channel" AS ENUM ('KIOSK', 'DRIVE_THRU');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('PENDING', 'PAID', 'IN_KITCHEN', 'READY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "product_type" AS ENUM ('FOOD', 'DRINK', 'COMBO');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('APPROVED', 'DECLINED');

-- CreateTable
CREATE TABLE "branch" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "photo_url" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "hours" TEXT NOT NULL,
    "status" "status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "role" NOT NULL,
    "branch_id" INTEGER,
    "status" "status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "category_type" NOT NULL,
    "status" "status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "status" "status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drink" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "status" "status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "drink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "combo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combo_food" (
    "combo_id" INTEGER NOT NULL,
    "food_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "combo_food_pkey" PRIMARY KEY ("combo_id","food_id")
);

-- CreateTable
CREATE TABLE "combo_drink" (
    "combo_id" INTEGER NOT NULL,
    "drink_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "combo_drink_pkey" PRIMARY KEY ("combo_id","drink_id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_method" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "holder_name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "last4" CHAR(4) NOT NULL,
    "exp_month" INTEGER NOT NULL,
    "exp_year" INTEGER NOT NULL,
    "street_address" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postal_code" CHAR(5) NOT NULL,

    CONSTRAINT "payment_method_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "qr_token" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_number" INTEGER,
    "ticket_date" DATE,
    "channel" "channel" NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'PENDING',
    "branch_id" INTEGER NOT NULL,
    "customer_id" INTEGER,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMPTZ(3),
    "ready_at" TIMESTAMPTZ(3),
    "delivered_at" TIMESTAMPTZ(3),

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "type" "product_type" NOT NULL,
    "food_id" INTEGER,
    "drink_id" INTEGER,
    "combo_id" INTEGER,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "line_total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "holder_name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "last4" CHAR(4) NOT NULL,
    "exp_month" INTEGER NOT NULL,
    "exp_year" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "payment_status" NOT NULL,
    "reference" TEXT NOT NULL,
    "paid_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_expense" (
    "id" SERIAL NOT NULL,
    "campaign" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "branch_id" INTEGER,

    CONSTRAINT "marketing_expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rating" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_username_key" ON "employee"("username");

-- CreateIndex
CREATE UNIQUE INDEX "customer_username_key" ON "customer"("username");

-- CreateIndex
CREATE UNIQUE INDEX "payment_method_customer_id_key" ON "payment_method"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_qr_token_key" ON "order"("qr_token");

-- CreateIndex
CREATE UNIQUE INDEX "order_daily_ticket_key" ON "order"("branch_id", "ticket_date", "ticket_number");

-- CreateIndex
CREATE UNIQUE INDEX "rating_order_id_key" ON "rating"("order_id");

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food" ADD CONSTRAINT "food_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drink" ADD CONSTRAINT "drink_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_food" ADD CONSTRAINT "combo_food_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "combo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_food" ADD CONSTRAINT "combo_food_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_drink" ADD CONSTRAINT "combo_drink_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "combo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_drink" ADD CONSTRAINT "combo_drink_drink_id_fkey" FOREIGN KEY ("drink_id") REFERENCES "drink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_method" ADD CONSTRAINT "payment_method_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_drink_id_fkey" FOREIGN KEY ("drink_id") REFERENCES "drink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "combo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_expense" ADD CONSTRAINT "marketing_expense_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ─── Reglas que schema.prisma no puede expresar (docs/modelo-de-datos.md) ───

-- Un solo producto por línea: solo uno de food_id, drink_id o combo_id, según el tipo.
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_single_product_check" CHECK (
    ("type" = 'FOOD' AND "food_id" IS NOT NULL AND "drink_id" IS NULL AND "combo_id" IS NULL)
    OR ("type" = 'DRINK' AND "drink_id" IS NOT NULL AND "food_id" IS NULL AND "combo_id" IS NULL)
    OR ("type" = 'COMBO' AND "combo_id" IS NOT NULL AND "food_id" IS NULL AND "drink_id" IS NULL)
);

-- La comanda del kiosko no tiene cliente; la del drive thru siempre lo tiene.
ALTER TABLE "order" ADD CONSTRAINT "order_customer_by_channel_check" CHECK (
    ("channel" = 'KIOSK' AND "customer_id" IS NULL)
    OR ("channel" = 'DRIVE_THRU' AND "customer_id" IS NOT NULL)
);

-- Turno (ticket_number) y ticket_date se asignan juntos (al pagar), para que el índice único por sucursal y día funcione.
ALTER TABLE "order" ADD CONSTRAINT "order_ticket_with_date_check" CHECK (
    ("ticket_number" IS NULL) = ("ticket_date" IS NULL)
);
