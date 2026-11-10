/**
 * Datos de prueba del Módulo I: categorías, menú y combos del plan de mercadeo (sección 7,
 * tablas 13 y 14), sucursales de muestra en León y dos empleados.
 *
 * Se puede correr varias veces: solo agrega lo que falta y no cambia precios ya editados.
 * Uso: pnpm --filter @zarape/api db:seed
 *
 * Contraseñas: SEED_ADMIN_PASSWORD y SEED_KITCHEN_PASSWORD (si no se dan, se generan
 * de 12 caracteres y se imprimen una sola vez). Solo aplican al crear el empleado.
 */
import 'dotenv/config';
import { pgAdapter } from '../src/prisma/pg-adapter.js';
import bcrypt from 'bcryptjs';
import { generatePassword } from '../src/auth/password.js';
import { PrismaClient } from '../src/generated/prisma/client.js';
import type { CategoryType, Role } from '../src/generated/prisma/enums.js';

const prisma = new PrismaClient({ adapter: pgAdapter(process.env['DATABASE_URL']) });

const PHOTO = {
  dish: '/photos/samples/dish.svg',
  drink: '/photos/samples/drink.svg',
  combo: '/photos/samples/combo.svg',
  branch: '/photos/samples/branch.svg',
};

const CATEGORIES: { name: string; type: CategoryType }[] = [
  { name: 'Platillos', type: 'FOOD' },
  { name: 'Ensaladas', type: 'FOOD' },
  { name: 'Sándwiches y tortas', type: 'FOOD' },
  { name: 'Postres', type: 'FOOD' },
  { name: 'Fruta', type: 'FOOD' },
  { name: 'Cafés', type: 'DRINK' },
  { name: 'Jugos', type: 'DRINK' },
  { name: 'Aguas', type: 'DRINK' },
  { name: 'Refrescos', type: 'DRINK' },
];

/** Tabla 13: precios base de referencia, MXN con IVA incluido. */
const FOODS = [
  { name: 'Chilaquiles rojos o verdes con pollo', category: 'Platillos', price: 95, description: 'Totopos en salsa roja o verde con pollo deshebrado, crema, queso fresco y cebolla.' },
  { name: 'Enchiladas suizas', category: 'Platillos', price: 105, description: 'Tortillas rellenas de pollo, bañadas en salsa verde cremosa y gratinadas con queso.' },
  { name: 'Huevos al gusto con frijoles', category: 'Platillos', price: 79, description: 'Dos huevos a la mexicana, rancheros o revueltos, con frijoles de la olla y tortillas.' },
  { name: 'Molletes', category: 'Platillos', price: 69, description: 'Bolillo con frijoles refritos y queso gratinado, con pico de gallo.' },
  { name: 'Ensalada de la casa', category: 'Ensaladas', price: 89, description: 'Lechugas, jitomate, pepino, aguacate y queso panela con vinagreta de limón.' },
  { name: 'Sándwich club', category: 'Sándwiches y tortas', price: 85, description: 'Pan tostado con pollo, jamón, tocino, lechuga, jitomate y mayonesa.' },
  { name: 'Torta de milanesa', category: 'Sándwiches y tortas', price: 89, description: 'Telera con milanesa de res, frijoles, aguacate, jitomate y chiles en vinagre.' },
  { name: 'Flan napolitano', category: 'Postres', price: 49, description: 'Flan casero de vainilla con caramelo.' },
  { name: 'Plato de fruta de temporada', category: 'Fruta', price: 55, description: 'Fruta fresca picada con granola y miel o con chile y limón.' },
];

const DRINKS = [
  { name: 'Café americano', category: 'Cafés', price: 35, description: 'Café de grano recién hecho, 355 ml.' },
  { name: 'Jugo de naranja natural', category: 'Jugos', price: 42, description: 'Naranja exprimida al momento, 400 ml.' },
  { name: 'Agua fresca', category: 'Aguas', price: 32, description: 'Agua del día: horchata, jamaica o fruta de temporada, 500 ml.' },
  { name: 'Refresco', category: 'Refrescos', price: 30, description: 'Refresco de lata, 355 ml.' },
];

/** Tabla 14: combos y su precio con descuento. */
const COMBOS = [
  { name: 'Combo Zarape', price: 145, foods: ['Chilaquiles rojos o verdes con pollo'], drinks: ['Jugo de naranja natural', 'Café americano'], description: 'Chilaquiles con pollo, jugo de naranja natural y café americano.' },
  { name: 'Combo Ligero', price: 135, foods: ['Plato de fruta de temporada', 'Molletes'], drinks: ['Café americano'], description: 'Fruta de temporada, molletes y café americano.' },
  { name: 'Combo Club', price: 145, foods: ['Sándwich club', 'Plato de fruta de temporada'], drinks: ['Agua fresca'], description: 'Sándwich club, fruta de temporada y agua fresca.' },
  { name: 'Combo Tradicional', price: 129, foods: ['Huevos al gusto con frijoles'], drinks: ['Jugo de naranja natural', 'Café americano'], description: 'Huevos al gusto con frijoles, jugo de naranja natural y café americano.' },
];

/** Sucursales de muestra (datos de prueba hasta que el restaurante dé los definitivos). */
const BRANCHES = [
  { name: 'Centro', address: 'Calle Madero 120, Zona Centro, León, Gto.', latitude: 21.122_3, longitude: -101.682_9, url: 'https://elzarape.example/sucursales/centro', hours: 'Lunes a domingo, 7:00 a 15:00' },
  { name: 'Campestre', address: 'Blvd. Campestre 1500, Jardines del Moral, León, Gto.', latitude: 21.155_1, longitude: -101.698_7, url: 'https://elzarape.example/sucursales/campestre', hours: 'Lunes a domingo, 7:00 a 16:00' },
  { name: 'Torres Landa', address: 'Blvd. Juan Alonso de Torres 2002, San José del Consuelo, León, Gto.', latitude: 21.143_8, longitude: -101.656_4, url: 'https://elzarape.example/sucursales/torres-landa', hours: 'Lunes a sábado, 7:00 a 14:00' },
];

async function category(name: string, type: CategoryType): Promise<number> {
  const existing = await prisma.category.findFirst({ where: { name, type } });
  return (existing ?? (await prisma.category.create({ data: { name, type } }))).id;
}

async function employee(username: string, role: Role, envVar: string): Promise<void> {
  if (await prisma.employee.findUnique({ where: { username } })) return;
  const given = process.env[envVar];
  const password = given || generatePassword();
  await prisma.employee.create({ data: { username, role, passwordHash: await bcrypt.hash(password, 10) } });
  console.log(
    given
      ? `Empleado ${username} (${role}) creado con la contraseña de ${envVar}.`
      : `Empleado ${username} (${role}) creado. Contraseña (guárdala, no se vuelve a mostrar): ${password}`,
  );
}

async function main(): Promise<void> {
  const categoryIds = new Map<string, number>();
  for (const c of CATEGORIES) categoryIds.set(`${c.type}:${c.name}`, await category(c.name, c.type));

  const foodIds = new Map<string, number>();
  for (const { category: cat, ...f } of FOODS) {
    const row =
      (await prisma.food.findFirst({ where: { name: f.name } })) ??
      (await prisma.food.create({ data: { ...f, photoUrl: PHOTO.dish, categoryId: categoryIds.get(`FOOD:${cat}`)! } }));
    foodIds.set(f.name, row.id);
  }

  const drinkIds = new Map<string, number>();
  for (const { category: cat, ...d } of DRINKS) {
    const row =
      (await prisma.drink.findFirst({ where: { name: d.name } })) ??
      (await prisma.drink.create({ data: { ...d, photoUrl: PHOTO.drink, categoryId: categoryIds.get(`DRINK:${cat}`)! } }));
    drinkIds.set(d.name, row.id);
  }

  for (const combo of COMBOS) {
    if (await prisma.combo.findFirst({ where: { name: combo.name } })) continue;
    await prisma.combo.create({
      data: {
        name: combo.name,
        description: combo.description,
        price: combo.price,
        photoUrl: PHOTO.combo,
        foods: { create: combo.foods.map((n) => ({ foodId: foodIds.get(n)!, quantity: 1 })) },
        drinks: { create: combo.drinks.map((n) => ({ drinkId: drinkIds.get(n)!, quantity: 1 })) },
      },
    });
  }

  for (const b of BRANCHES) {
    if (await prisma.branch.findFirst({ where: { name: b.name } })) continue;
    await prisma.branch.create({ data: { ...b, photoUrl: PHOTO.branch } });
  }

  await employee('admin', 'ADMIN', 'SEED_ADMIN_PASSWORD');
  await employee('cocina', 'KITCHEN', 'SEED_KITCHEN_PASSWORD');

  console.log(
    `Seed listo: ${CATEGORIES.length} categorías, ${FOODS.length} alimentos, ${DRINKS.length} bebidas, ` +
      `${COMBOS.length} combos y ${BRANCHES.length} sucursales.`,
  );
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
