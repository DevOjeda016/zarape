/**
 * Datos de prueba del Módulo I: categorías, menú y combos del plan de mercadeo (sección 7,
 * tablas 13 y 14), sucursales de muestra en León y dos empleados.
 *
 * Se puede correr varias veces: solo agrega lo que falta y no cambia precios ya editados.
 * Uso: pnpm --filter @zarape/api db:seed
 *
 * Contraseñas: SEED_CONTRASENA_ADMIN y SEED_CONTRASENA_COCINA (si no se dan, se generan
 * de 12 caracteres y se imprimen una sola vez). Solo aplican al crear el usuario.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { generarContrasena } from '../src/auth/contrasena.js';
import { PrismaClient } from '../src/generated/prisma/client.js';
import type { Rol, TipoCategoria } from '../src/generated/prisma/enums.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }) });

const FOTO = {
  platillo: '/fotos/muestra/platillo.svg',
  bebida: '/fotos/muestra/bebida.svg',
  combo: '/fotos/muestra/combo.svg',
  sucursal: '/fotos/muestra/sucursal.svg',
};

const CATEGORIAS: { nombre: string; tipo: TipoCategoria }[] = [
  { nombre: 'Platillos', tipo: 'ALIMENTO' },
  { nombre: 'Ensaladas', tipo: 'ALIMENTO' },
  { nombre: 'Sándwiches y tortas', tipo: 'ALIMENTO' },
  { nombre: 'Postres', tipo: 'ALIMENTO' },
  { nombre: 'Fruta', tipo: 'ALIMENTO' },
  { nombre: 'Cafés', tipo: 'BEBIDA' },
  { nombre: 'Jugos', tipo: 'BEBIDA' },
  { nombre: 'Aguas', tipo: 'BEBIDA' },
  { nombre: 'Refrescos', tipo: 'BEBIDA' },
];

/** Tabla 13: precios base de referencia, MXN con IVA incluido. */
const ALIMENTOS = [
  { nombre: 'Chilaquiles rojos o verdes con pollo', categoria: 'Platillos', precio: 95, descripcion: 'Totopos en salsa roja o verde con pollo deshebrado, crema, queso fresco y cebolla.' },
  { nombre: 'Enchiladas suizas', categoria: 'Platillos', precio: 105, descripcion: 'Tortillas rellenas de pollo, bañadas en salsa verde cremosa y gratinadas con queso.' },
  { nombre: 'Huevos al gusto con frijoles', categoria: 'Platillos', precio: 79, descripcion: 'Dos huevos a la mexicana, rancheros o revueltos, con frijoles de la olla y tortillas.' },
  { nombre: 'Molletes', categoria: 'Platillos', precio: 69, descripcion: 'Bolillo con frijoles refritos y queso gratinado, con pico de gallo.' },
  { nombre: 'Ensalada de la casa', categoria: 'Ensaladas', precio: 89, descripcion: 'Lechugas, jitomate, pepino, aguacate y queso panela con vinagreta de limón.' },
  { nombre: 'Sándwich club', categoria: 'Sándwiches y tortas', precio: 85, descripcion: 'Pan tostado con pollo, jamón, tocino, lechuga, jitomate y mayonesa.' },
  { nombre: 'Torta de milanesa', categoria: 'Sándwiches y tortas', precio: 89, descripcion: 'Telera con milanesa de res, frijoles, aguacate, jitomate y chiles en vinagre.' },
  { nombre: 'Flan napolitano', categoria: 'Postres', precio: 49, descripcion: 'Flan casero de vainilla con caramelo.' },
  { nombre: 'Plato de fruta de temporada', categoria: 'Fruta', precio: 55, descripcion: 'Fruta fresca picada con granola y miel o con chile y limón.' },
];

const BEBIDAS = [
  { nombre: 'Café americano', categoria: 'Cafés', precio: 35, descripcion: 'Café de grano recién hecho, 355 ml.' },
  { nombre: 'Jugo de naranja natural', categoria: 'Jugos', precio: 42, descripcion: 'Naranja exprimida al momento, 400 ml.' },
  { nombre: 'Agua fresca', categoria: 'Aguas', precio: 32, descripcion: 'Agua del día: horchata, jamaica o fruta de temporada, 500 ml.' },
  { nombre: 'Refresco', categoria: 'Refrescos', precio: 30, descripcion: 'Refresco de lata, 355 ml.' },
];

/** Tabla 14: combos y su precio con descuento. */
const COMBOS = [
  { nombre: 'Combo Zarape', precio: 145, alimentos: ['Chilaquiles rojos o verdes con pollo'], bebidas: ['Jugo de naranja natural', 'Café americano'], descripcion: 'Chilaquiles con pollo, jugo de naranja natural y café americano.' },
  { nombre: 'Combo Ligero', precio: 135, alimentos: ['Plato de fruta de temporada', 'Molletes'], bebidas: ['Café americano'], descripcion: 'Fruta de temporada, molletes y café americano.' },
  { nombre: 'Combo Club', precio: 145, alimentos: ['Sándwich club', 'Plato de fruta de temporada'], bebidas: ['Agua fresca'], descripcion: 'Sándwich club, fruta de temporada y agua fresca.' },
  { nombre: 'Combo Tradicional', precio: 129, alimentos: ['Huevos al gusto con frijoles'], bebidas: ['Jugo de naranja natural', 'Café americano'], descripcion: 'Huevos al gusto con frijoles, jugo de naranja natural y café americano.' },
];

/** Sucursales de muestra (datos de prueba hasta que el restaurante dé los definitivos). */
const SUCURSALES = [
  { nombre: 'Centro', direccion: 'Calle Madero 120, Zona Centro, León, Gto.', latitud: 21.122_3, longitud: -101.682_9, url: 'https://elzarape.example/sucursales/centro', horarios: 'Lunes a domingo, 7:00 a 15:00' },
  { nombre: 'Campestre', direccion: 'Blvd. Campestre 1500, Jardines del Moral, León, Gto.', latitud: 21.155_1, longitud: -101.698_7, url: 'https://elzarape.example/sucursales/campestre', horarios: 'Lunes a domingo, 7:00 a 16:00' },
  { nombre: 'Torres Landa', direccion: 'Blvd. Juan Alonso de Torres 2002, San José del Consuelo, León, Gto.', latitud: 21.143_8, longitud: -101.656_4, url: 'https://elzarape.example/sucursales/torres-landa', horarios: 'Lunes a sábado, 7:00 a 14:00' },
];

async function categoria(nombre: string, tipo: TipoCategoria): Promise<number> {
  const existente = await prisma.categoria.findFirst({ where: { nombre, tipo } });
  return (existente ?? (await prisma.categoria.create({ data: { nombre, tipo } }))).id;
}

async function empleado(nombreUsuario: string, rol: Rol, variable: string): Promise<void> {
  if (await prisma.usuario.findUnique({ where: { nombreUsuario } })) return;
  const dada = process.env[variable];
  const contrasena = dada || generarContrasena();
  await prisma.usuario.create({
    data: { nombreUsuario, rol, passwordHash: await bcrypt.hash(contrasena, 10) },
  });
  console.log(
    dada
      ? `Usuario ${nombreUsuario} (${rol}) creado con la contraseña de ${variable}.`
      : `Usuario ${nombreUsuario} (${rol}) creado. Contraseña (guárdala, no se vuelve a mostrar): ${contrasena}`,
  );
}

async function main(): Promise<void> {
  const ids = new Map<string, number>();
  for (const c of CATEGORIAS) ids.set(`${c.tipo}:${c.nombre}`, await categoria(c.nombre, c.tipo));

  const alimentos = new Map<string, number>();
  for (const { categoria: cat, ...a } of ALIMENTOS) {
    const fila =
      (await prisma.alimento.findFirst({ where: { nombre: a.nombre } })) ??
      (await prisma.alimento.create({ data: { ...a, fotoUrl: FOTO.platillo, categoriaId: ids.get(`ALIMENTO:${cat}`)! } }));
    alimentos.set(a.nombre, fila.id);
  }

  const bebidas = new Map<string, number>();
  for (const { categoria: cat, ...b } of BEBIDAS) {
    const fila =
      (await prisma.bebida.findFirst({ where: { nombre: b.nombre } })) ??
      (await prisma.bebida.create({ data: { ...b, fotoUrl: FOTO.bebida, categoriaId: ids.get(`BEBIDA:${cat}`)! } }));
    bebidas.set(b.nombre, fila.id);
  }

  for (const combo of COMBOS) {
    if (await prisma.combo.findFirst({ where: { nombre: combo.nombre } })) continue;
    await prisma.combo.create({
      data: {
        nombre: combo.nombre,
        descripcion: combo.descripcion,
        precio: combo.precio,
        fotoUrl: FOTO.combo,
        alimentos: { create: combo.alimentos.map((n) => ({ alimentoId: alimentos.get(n)!, cantidad: 1 })) },
        bebidas: { create: combo.bebidas.map((n) => ({ bebidaId: bebidas.get(n)!, cantidad: 1 })) },
      },
    });
  }

  for (const s of SUCURSALES) {
    if (await prisma.sucursal.findFirst({ where: { nombre: s.nombre } })) continue;
    await prisma.sucursal.create({ data: { ...s, fotoUrl: FOTO.sucursal } });
  }

  await empleado('admin', 'ADMIN', 'SEED_CONTRASENA_ADMIN');
  await empleado('cocina', 'COCINA', 'SEED_CONTRASENA_COCINA');

  console.log(
    `Seed listo: ${CATEGORIAS.length} categorías, ${ALIMENTOS.length} alimentos, ${BEBIDAS.length} bebidas, ` +
      `${COMBOS.length} combos y ${SUCURSALES.length} sucursales.`,
  );
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
