/**
 * Pruebas e2e del Módulo I (RF01–RF06) contra una BD real.
 * Se corren solo si TEST_DATABASE_URL existe (en el entorno o en apps/api/.env).
 * Todo lo que crean empieza con "e2e-" y se borra al final.
 */
import 'dotenv/config';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const TEST_DB_URL = process.env['TEST_DATABASE_URL'];
const PASSWORD = 'E2e*Zarape26';
const P = 'e2e-';

describe.skipIf(!TEST_DB_URL)('Módulo I · Gestión (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: import('../src/prisma/prisma.service.js').PrismaService;
  let photosDir: string;
  let admin = '';
  let kitchen = '';
  let adminId = 0;

  const api = () => request(app.getHttpServer());
  const asAdmin = (method: 'get' | 'post' | 'patch' | 'delete', path: string) =>
    api()[method](`/api${path}`).set('Authorization', `Bearer ${admin}`);
  const ids = (body: { id: number }[]) => body.map((x) => x.id);

  async function cleanUp(): Promise<void> {
    const name = { startsWith: P };
    await prisma.combo.deleteMany({ where: { name } });
    await prisma.food.deleteMany({ where: { name } });
    await prisma.drink.deleteMany({ where: { name } });
    await prisma.category.deleteMany({ where: { name } });
    await prisma.employee.deleteMany({ where: { username: name } });
    await prisma.branch.deleteMany({ where: { name } });
  }

  beforeAll(async () => {
    process.env['DATABASE_URL'] = TEST_DB_URL;
    process.env['JWT_SECRET'] ??= 'e2e-secret';
    photosDir = await mkdtemp(join(tmpdir(), 'zarape-photos-'));
    process.env['PHOTOS_DIR'] = photosDir;

    const [{ AppModule }, { configureApp }, { PrismaService }] = await Promise.all([
      import('../src/app.module.js'),
      import('../src/configure-app.js'),
      import('../src/prisma/prisma.service.js'),
    ]);
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication<NestExpressApplication>({ logger: false });
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    await cleanUp();
    const passwordHash = await bcrypt.hash(PASSWORD, 4);
    adminId = (await prisma.employee.create({ data: { username: `${P}admin`, role: 'ADMIN', passwordHash } })).id;
    await prisma.employee.create({ data: { username: `${P}kitchen`, role: 'KITCHEN', passwordHash } });

    const login = async (username: string) =>
      (await api().post('/api/auth/login').send({ username, password: PASSWORD })).body.token as string;
    admin = await login(`${P}admin`);
    kitchen = await login(`${P}kitchen`);
  });

  afterAll(async () => {
    if (prisma) await cleanUp();
    await app?.close();
    if (photosDir) await rm(photosDir, { recursive: true, force: true });
  });

  describe('RF01 · login y roles', () => {
    it('la salud es pública', async () => {
      await api().get('/api/health').expect(200, { status: 'ok' });
    });

    it('contraseña mal: 401 con el mensaje de la marca', async () => {
      const r = await api().post('/api/auth/login').send({ username: `${P}admin`, password: 'wrong' });
      expect(r.status).toBe(401);
      expect(r.body.message).toBe('Usuario o contraseña incorrectos.');
    });

    it('login correcto da token; /auth/me regresa al empleado', async () => {
      expect(admin).toBeTruthy();
      const r = await asAdmin('get', '/auth/me').expect(200);
      expect(r.body).toEqual({ id: adminId, username: `${P}admin`, role: 'ADMIN' });
    });

    it('sin token: 401; con rol KITCHEN: 403 en los catálogos', async () => {
      await api().get('/api/branches').expect(401);
      await api().get('/api/branches').set('Authorization', `Bearer ${kitchen}`).expect(403);
    });
  });

  describe('RF02 · sucursales', () => {
    const branch = {
      name: `${P}Centro`,
      address: 'Calle e2e 1, Colonia Prueba, León, Gto.',
      latitude: 21.12,
      longitude: -101.68,
      photoUrl: '/photos/samples/branch.svg',
      url: 'https://elzarape.example/e2e',
      hours: 'Lunes a domingo, 7:00 a 15:00',
    };
    let id = 0;

    it('alta: todos los campos son obligatorios', async () => {
      const r = await asAdmin('post', '/branches').send({ name: `${P}Incompleta` }).expect(400);
      expect(r.body.message.length).toBeGreaterThan(3);
    });

    it('alta y búsqueda por nombre o por ubicación', async () => {
      id = (await asAdmin('post', '/branches').send(branch).expect(201)).body.id;
      expect(ids((await asAdmin('get', `/branches?name=${P}centro`).expect(200)).body)).toEqual([id]);
      expect(ids((await asAdmin('get', '/branches?location=colonia prueba').expect(200)).body)).toContain(id);
    });

    it('modificación: todo excepto el ID', async () => {
      const r = await asAdmin('patch', `/branches/${id}`).send({ hours: 'Diario, 8:00 a 14:00' }).expect(200);
      expect(r.body.hours).toBe('Diario, 8:00 a 14:00');
      const withId = await asAdmin('patch', `/branches/${id}`).send({ id: 999 }).expect(400);
      expect(withId.body.message).toEqual(['El ID no se puede modificar.']);
    });

    it('eliminar con un empleado asignado: pasa a INACTIVE', async () => {
      const employee = await asAdmin('post', '/employees')
        .send({ username: `${P}assigned`, role: 'KITCHEN', branchId: id })
        .expect(201);
      expect((await asAdmin('delete', `/branches/${id}`).expect(200)).body.action).toBe('DEACTIVATED');
      expect((await asAdmin('get', `/branches/${id}`)).body.status).toBe('INACTIVE');
      await asAdmin('delete', `/employees/${employee.body.id}`).expect(200);
    });

    it('eliminar sin relacionados: se borra', async () => {
      expect((await asAdmin('delete', `/branches/${id}`).expect(200)).body.action).toBe('DELETED');
      await asAdmin('get', `/branches/${id}`).expect(404);
    });
  });

  describe('RF03 · empleados', () => {
    let id = 0;
    let password = '';

    it('alta con contraseña aleatoria de 12 caracteres que sirve para entrar', async () => {
      const r = await asAdmin('post', '/employees').send({ username: `${P}maria`, role: 'KITCHEN' }).expect(201);
      ({ id, password } = r.body);
      expect(password).toHaveLength(12);
      expect(r.body).not.toHaveProperty('passwordHash');
      await api().post('/api/auth/login').send({ username: `${P}maria`, password }).expect(200);
    });

    it('nombre repetido: 409', async () => {
      await asAdmin('post', '/employees').send({ username: `${P}maria`, role: 'ADMIN' }).expect(409);
    });

    it('búsqueda por nombre de usuario', async () => {
      expect(ids((await asAdmin('get', `/employees?username=${P}mar`).expect(200)).body)).toEqual([id]);
    });

    it('regenerar contraseña invalida la anterior', async () => {
      const r = await asAdmin('post', `/employees/${id}/password`).expect(201);
      expect(r.body.password).not.toBe(password);
      await api().post('/api/auth/login').send({ username: `${P}maria`, password }).expect(401);
    });

    it('un empleado dado de baja ya no entra', async () => {
      await asAdmin('patch', `/employees/${id}`).send({ status: 'INACTIVE' }).expect(200);
      const fresh = (await asAdmin('post', `/employees/${id}/password`)).body.password;
      await api().post('/api/auth/login').send({ username: `${P}maria`, password: fresh }).expect(401);
    });

    it('nadie se elimina a sí mismo', async () => {
      await asAdmin('delete', `/employees/${adminId}`).expect(400);
    });

    it('eliminar sin relacionados: se borra', async () => {
      expect((await asAdmin('delete', `/employees/${id}`).expect(200)).body.action).toBe('DELETED');
    });
  });

  describe('RF04–RF06 · alimentos, bebidas y combos', () => {
    let foodCategory = 0;
    let drinkCategory = 0;
    let food = 0;
    let drink = 0;
    let combo = 0;
    const dish = (extra: object) => ({
      name: `${P}Molletes`,
      description: 'Con frijoles',
      photoUrl: '/photos/samples/dish.svg',
      price: 69,
      ...extra,
    });

    it('categorías de alimentos y de bebidas', async () => {
      foodCategory = (await asAdmin('post', '/categories').send({ name: `${P}Platillos`, type: 'FOOD' }).expect(201)).body.id;
      drinkCategory = (await asAdmin('post', '/categories').send({ name: `${P}Cafés`, type: 'DRINK' }).expect(201)).body.id;
    });

    it('un alimento no acepta categoría de bebidas', async () => {
      const r = await asAdmin('post', '/foods').send(dish({ categoryId: drinkCategory })).expect(400);
      expect(r.body.message).toBe('Elige una categoría de alimentos.');
    });

    it('precio con más de dos decimales: 400', async () => {
      await asAdmin('post', '/foods').send(dish({ name: `${P}Caro`, price: 10.555, categoryId: foodCategory })).expect(400);
    });

    it('alta de alimento y bebida; búsqueda por nombre, precio y categoría', async () => {
      const a = await asAdmin('post', '/foods').send(dish({ categoryId: foodCategory })).expect(201);
      food = a.body.id;
      expect(a.body.price).toBe(69);
      expect(a.body.category.name).toBe(`${P}Platillos`);

      drink = (
        await asAdmin('post', '/drinks')
          .send({ name: `${P}Café de olla`, description: 'Con canela', photoUrl: 'https://elzarape.example/cafe.webp', price: 35.5, categoryId: drinkCategory })
          .expect(201)
      ).body.id;

      expect(ids((await asAdmin('get', `/foods?name=${P}&minPrice=60&maxPrice=70`).expect(200)).body)).toEqual([food]);
      expect((await asAdmin('get', `/foods?name=${P}&minPrice=70`).expect(200)).body).toEqual([]);
      expect(ids((await asAdmin('get', `/drinks?categoryId=${drinkCategory}`).expect(200)).body)).toEqual([drink]);
    });

    it('combo con alimentos y bebidas; calcula el ahorro', async () => {
      const r = await asAdmin('post', '/combos')
        .send({
          name: `${P}Combo prueba`,
          description: 'Molletes y café',
          photoUrl: '/photos/samples/combo.svg',
          price: 90,
          foods: [{ id: food, quantity: 1 }],
          drinks: [{ id: drink, quantity: 2 }],
        })
        .expect(201);
      combo = r.body.id;
      expect(r.body.separatePrice).toBe(140);
      expect(r.body.savings).toBe(50);
    });

    it('combo vacío: 400', async () => {
      await asAdmin('post', '/combos')
        .send({ name: `${P}Vacío`, description: 'x', photoUrl: '/photos/samples/combo.svg', price: 10, foods: [], drinks: [] })
        .expect(400);
    });

    it('búsqueda de combos por alimento o bebida', async () => {
      expect(ids((await asAdmin('get', `/combos?food=${P}mollet`).expect(200)).body)).toEqual([combo]);
      expect((await asAdmin('get', '/combos?drink=no-existe-e2e').expect(200)).body).toEqual([]);
    });

    it('modificar componentes del combo', async () => {
      const r = await asAdmin('patch', `/combos/${combo}`).send({ drinks: [] }).expect(200);
      expect(r.body.drinks).toEqual([]);
      expect(r.body.foods).toHaveLength(1);
    });

    it('alimento que está en un combo: INACTIVE; sin combo: se borra', async () => {
      expect((await asAdmin('delete', `/foods/${food}`).expect(200)).body.action).toBe('DEACTIVATED');
      expect((await asAdmin('delete', `/combos/${combo}`).expect(200)).body.action).toBe('DELETED');
      expect((await asAdmin('delete', `/foods/${food}`).expect(200)).body.action).toBe('DELETED');
    });

    it('categoría con productos: INACTIVE', async () => {
      expect((await asAdmin('delete', `/categories/${drinkCategory}`).expect(200)).body.action).toBe('DEACTIVATED');
    });
  });

  describe('fotos', () => {
    it('sube un PNG y se sirve en /photos', async () => {
      const png = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64',
      );
      const r = await asAdmin('post', '/files/photos').attach('photo', png, 'dot.png').expect(201);
      expect(r.body.url).toMatch(/^\/photos\/[\w-]+\.png$/);
      await api().get(r.body.url).expect(200);
    });

    it('rechaza archivos que no son JPG, PNG o WebP', async () => {
      await asAdmin('post', '/files/photos').attach('photo', Buffer.from('<svg/>'), 'x.png').expect(400);
    });
  });
});
