/**
 * Pruebas e2e del Módulo II (RF07–RF15): menú público, comanda, pago simulado, cocina y turnos.
 * Se corren solo si TEST_DATABASE_URL existe (en el entorno o en apps/api/.env).
 * Todo lo que crean empieza con "e2eo-" (distinto del "e2e-" del Módulo I, que corre en paralelo)
 * y se borra al final.
 */
import 'dotenv/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { TEST_CARDS } from '@zarape/shared';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const TEST_DB_URL = process.env['TEST_DATABASE_URL'];
const PASSWORD = 'E2e*Zarape26';
const P = 'e2eo-';
const PHOTO = '/photos/samples/dish.svg';
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date());

const card = { number: '4242 4242 4242 4242', holderName: 'John Doe', expMonth: 12, expYear: 99, cvv: '123' };

describe.skipIf(!TEST_DB_URL)('Módulo II · En sitio (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: import('../src/prisma/prisma.service.js').PrismaService;
  let admin = '';
  let kitchen = '';
  let branchId = 0;
  let foodId = 0;
  let inactiveFoodId = 0;
  let drinkId = 0;
  let comboId = 0;

  const api = () => request(app.getHttpServer());
  const as = (token: string, method: 'get' | 'patch', path: string) =>
    api()[method](`/api${path}`).set('Authorization', `Bearer ${token}`);
  const items = () => [
    { type: 'FOOD', productId: foodId, quantity: 2 },
    { type: 'DRINK', productId: drinkId, quantity: 1 },
    { type: 'COMBO', productId: comboId, quantity: 1 },
  ];
  const order = (body: object = {}) => api().post('/api/orders').send({ branchId, items: items(), card, ...body });

  async function cleanUp(): Promise<void> {
    const name = { startsWith: P };
    await prisma.payment.deleteMany({ where: { order: { branch: { name } } } });
    await prisma.order.deleteMany({ where: { branch: { name } } });
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
    await prisma.employee.create({ data: { username: `${P}admin`, role: 'ADMIN', passwordHash } });
    await prisma.employee.create({ data: { username: `${P}kitchen`, role: 'KITCHEN', passwordHash } });
    const login = async (username: string) =>
      (await api().post('/api/auth/login').send({ username, password: PASSWORD })).body.token as string;
    admin = await login(`${P}admin`);
    kitchen = await login(`${P}kitchen`);

    branchId = (
      await prisma.branch.create({
        data: {
          name: `${P}Centro`,
          address: 'Calle e2e 1, León, Gto.',
          latitude: 21.12,
          longitude: -101.68,
          photoUrl: PHOTO,
          url: 'https://elzarape.example/e2e',
          hours: 'Diario, 7:00 a 15:00',
        },
      })
    ).id;
    const foods = await prisma.category.create({ data: { name: `${P}Platillos`, type: 'FOOD' } });
    const drinks = await prisma.category.create({ data: { name: `${P}Cafés`, type: 'DRINK' } });
    const product = { description: 'Prueba e2e', photoUrl: PHOTO };
    foodId = (await prisma.food.create({ data: { ...product, name: `${P}Chilaquiles`, price: 95, categoryId: foods.id } })).id;
    inactiveFoodId = (
      await prisma.food.create({
        data: { ...product, name: `${P}Molletes`, price: 69, categoryId: foods.id, status: 'INACTIVE' },
      })
    ).id;
    drinkId = (await prisma.drink.create({ data: { ...product, name: `${P}Café`, price: 35, categoryId: drinks.id } })).id;
    comboId = (
      await prisma.combo.create({
        data: {
          ...product,
          name: `${P}Combo`,
          price: 110,
          foods: { create: { foodId } },
          drinks: { create: { drinkId } },
        },
      })
    ).id;
  });

  afterAll(async () => {
    if (prisma) await cleanUp();
    await app?.close();
  });

  describe('RF07 · menú público', () => {
    it('sin sesión: solo productos activos, con lo que incluye cada combo', async () => {
      const { body } = await api().get('/api/menu').expect(200);
      const food = body.foods.find((x: { id: number }) => x.id === foodId);
      expect(food).toMatchObject({ name: `${P}Chilaquiles`, price: 95, category: { name: `${P}Platillos` } });
      expect(body.foods.some((x: { id: number }) => x.id === inactiveFoodId)).toBe(false);
      expect(body.drinks.some((x: { id: number }) => x.id === drinkId)).toBe(true);
      const combo = body.combos.find((x: { id: number }) => x.id === comboId);
      expect(combo.contents).toEqual([
        { name: `${P}Chilaquiles`, quantity: 1 },
        { name: `${P}Café`, quantity: 1 },
      ]);
    });

    it('sucursales activas sin sesión', async () => {
      const { body } = await api().get('/api/menu/branches').expect(200);
      expect(body.find((x: { id: number }) => x.id === branchId)).toMatchObject({ name: `${P}Centro`, latitude: 21.12 });
    });
  });

  describe('RF09, RF12, RF13 · comanda y pago', () => {
    let paid: { id: number; qrToken: string };
    let pending: { id: number; qrToken: string };

    it('rechaza comanda vacía, tarjeta mal escrita, producto dado de baja y precios del cliente', async () => {
      expect((await order({ items: [] }).expect(400)).body.message).toContain('La comanda está vacía.');
      const badCard = await order({ card: { ...card, number: '4242 4242 4242 4241' } }).expect(400);
      expect(badCard.body.message).toEqual(['Revisa el número de la tarjeta.']);
      const inactive = await order({ items: [{ type: 'FOOD', productId: inactiveFoodId, quantity: 1 }] }).expect(400);
      expect(inactive.body.message).toBe('Un producto de tu comanda ya no está disponible.');
      await order({ items: [{ type: 'FOOD', productId: foodId, quantity: 1, unitPrice: 1 }] }).expect(400);
      expect(await prisma.order.count({ where: { branchId } })).toBe(0);
    });

    it('pago aprobado: recalcula con la BD, queda PAID y recibe el turno 1', async () => {
      const { body } = await order().expect(201);
      paid = body.order;
      expect(body.payment).toMatchObject({ status: 'APPROVED', message: null, brand: 'VISA', last4: '4242' });
      expect(body.order).toMatchObject({
        status: 'PAID',
        channel: 'KIOSK',
        ticketNumber: 1,
        subtotal: 288.79,
        tax: 46.21,
        total: 335,
      });
      expect(body.order.items).toHaveLength(3);
      expect(body.order.items[0]).toMatchObject({
        type: 'FOOD',
        productId: foodId,
        name: `${P}Chilaquiles`,
        quantity: 2,
        unitPrice: 95,
        lineTotal: 190,
      });
    });

    it('del pago solo se guardan titular, marca, últimos 4 y vencimiento', async () => {
      const [payment] = await prisma.payment.findMany({ where: { orderId: paid.id } });
      expect(payment).toMatchObject({
        holderName: 'John Doe',
        brand: 'VISA',
        last4: '4242',
        expMonth: 12,
        expYear: 2099,
        status: 'APPROVED',
      });
      expect(JSON.stringify(payment)).not.toContain('4242424242424242');
    });

    it('junta las líneas repetidas del mismo producto', async () => {
      const line = { type: 'DRINK', productId: drinkId, quantity: 1 };
      const { body } = await order({ items: [line, line] }).expect(201);
      expect(body.order.ticketNumber).toBe(2);
      expect(body.order.items).toHaveLength(1);
      expect(body.order.items[0]).toMatchObject({ quantity: 2, lineTotal: 70 });
    });

    it('pago rechazado: la comanda sigue PENDING, sin turno', async () => {
      const { body } = await order({ card: { ...card, number: TEST_CARDS.DECLINED } }).expect(201);
      pending = body.order;
      expect(body.payment).toMatchObject({ status: 'DECLINED', message: 'El banco rechazó la tarjeta. Prueba con otra.' });
      expect(body.order).toMatchObject({ status: 'PENDING', ticketNumber: null, paidAt: null });
    });

    it('reintento con otra tarjeta: queda PAID con el siguiente turno; ya pagada no se cobra otra vez', async () => {
      const path = `/api/orders/by-token/${pending.qrToken}/payments`;
      const { body } = await api().post(path).send({ card }).expect(200);
      expect(body.order).toMatchObject({ id: pending.id, status: 'PAID', ticketNumber: 3 });
      const again = await api().post(path).send({ card }).expect(409);
      expect(again.body.message).toBe('La comanda ya está pagada.');
    });

    it('el comensal sigue su comanda con el token del QR', async () => {
      const { body } = await api().get(`/api/orders/by-token/${paid.qrToken}`).expect(200);
      expect(body).toMatchObject({ id: paid.id, status: 'PAID', total: 335 });
      await api().get('/api/orders/by-token/00000000-0000-4000-8000-000000000000').expect(404);
      await api().get('/api/orders/by-token/not-a-token').expect(400);
    });

    describe('RF10, RF11 · consulta de comandas', () => {
      it('buscar y ver el detalle es del personal', async () => {
        await api().get('/api/orders').expect(401);
        await api().get(`/api/orders/${paid.id}`).expect(401);
        const { body } = await as(kitchen, 'get', `/orders/${paid.id}`).expect(200);
        expect(body.items).toHaveLength(3);
      });

      it('por rango de días o de total', async () => {
        const search = async (query: string) =>
          (await as(admin, 'get', `/orders?branchId=${branchId}&${query}`).expect(200)).body.map((x: { id: number }) => x.id);
        expect(await search(`from=${TODAY}&to=${TODAY}`)).toHaveLength(3);
        expect(await search('to=2020-01-01')).toEqual([]);
        expect(await search('minTotal=300&maxTotal=400')).toEqual([pending.id, paid.id]);
        expect(await search('maxTotal=100')).toHaveLength(1);
        await as(admin, 'get', '/orders?from=ayer').expect(400);
      });
    });

    describe('RF14, RF15 · cocina y turnos', () => {
      it('la cola de cocina: pagadas o en cocina de la sucursal', async () => {
        const { body } = await as(kitchen, 'get', `/orders?branchId=${branchId}&status=PAID,IN_KITCHEN`).expect(200);
        expect(body).toHaveLength(3);
      });

      it('respeta el flujo: PAID → IN_KITCHEN → READY → DELIVERED', async () => {
        const change = (status: string) => as(kitchen, 'patch', `/orders/${paid.id}/status`).send({ status });
        await api().patch(`/api/orders/${paid.id}/status`).send({ status: 'READY' }).expect(401);
        await change('PAID').expect(400);
        const skipped = await change('READY').expect(409);
        expect(skipped.body.message).toBe('La comanda está pagada; no puede pasar a lista.');

        expect((await change('IN_KITCHEN').expect(200)).body.status).toBe('IN_KITCHEN');
        const ready = (await change('READY').expect(200)).body;
        expect(ready.status).toBe('READY');
        expect(ready.readyAt).toBeTruthy();
      });

      it('pantalla de turnos: pública, con los turnos en preparación y listos', async () => {
        const { body } = await api().get(`/api/orders/tickets?branchId=${branchId}`).expect(200);
        expect(body).toEqual({ preparing: [2, 3], ready: [1] });
        await api().get('/api/orders/tickets').expect(400);
      });

      it('entregada: sale de la pantalla de turnos y ya no cambia', async () => {
        const change = (status: string) => as(kitchen, 'patch', `/orders/${paid.id}/status`).send({ status });
        const delivered = (await change('DELIVERED').expect(200)).body;
        expect(delivered.deliveredAt).toBeTruthy();
        await change('CANCELLED').expect(409);
        const { body } = await api().get(`/api/orders/tickets?branchId=${branchId}`).expect(200);
        expect(body.ready).toEqual([]);
      });
    });

    describe('RDF130102 · consulta de pagos', () => {
      it('solo ADMIN', async () => {
        await api().get('/api/payments').expect(401);
        await as(kitchen, 'get', '/payments').expect(403);
      });

      it('por rango de fechas o de cantidad; incluye los rechazados', async () => {
        const mine = async (query: string) =>
          (await as(admin, 'get', `/payments?${query}`).expect(200)).body.filter(
            (x: { orderId: number }) => x.orderId === paid.id || x.orderId === pending.id,
          );
        const today = await mine(`from=${TODAY}&to=${TODAY}&minAmount=335&maxAmount=335`);
        expect(today.map((x: { status: string }) => x.status).sort()).toEqual(['APPROVED', 'APPROVED', 'DECLINED']);
        expect(today[0]).not.toHaveProperty('cvv');
        expect(await mine('to=2020-01-01')).toEqual([]);
        expect(await mine('status=DECLINED')).toHaveLength(1);
      });
    });
  });
});
