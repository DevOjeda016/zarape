/**
 * Pruebas e2e del Módulo I (RF01–RF06) contra una BD real.
 * Se corren solo si DATABASE_URL_PRUEBAS existe (en el entorno o en apps/api/.env).
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

const URL_PRUEBAS = process.env['DATABASE_URL_PRUEBAS'];
const CONTRASENA = 'E2e*Zarape26';
const P = 'e2e-';

describe.skipIf(!URL_PRUEBAS)('Módulo I · Gestión (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: import('../src/prisma/prisma.service.js').PrismaService;
  let carpetaFotos: string;
  let admin = '';
  let cocina = '';
  let idAdmin = 0;

  const api = () => request(app.getHttpServer());
  const comoAdmin = (metodo: 'get' | 'post' | 'patch' | 'delete', ruta: string) =>
    api()[metodo](`/api${ruta}`).set('Authorization', `Bearer ${admin}`);

  async function limpiar(): Promise<void> {
    const nombre = { startsWith: P };
    await prisma.combo.deleteMany({ where: { nombre } });
    await prisma.alimento.deleteMany({ where: { nombre } });
    await prisma.bebida.deleteMany({ where: { nombre } });
    await prisma.categoria.deleteMany({ where: { nombre } });
    await prisma.usuario.deleteMany({ where: { nombreUsuario: nombre } });
    await prisma.sucursal.deleteMany({ where: { nombre } });
  }

  beforeAll(async () => {
    process.env['DATABASE_URL'] = URL_PRUEBAS;
    process.env['JWT_SECRETO'] ??= 'secreto-e2e';
    carpetaFotos = await mkdtemp(join(tmpdir(), 'zarape-fotos-'));
    process.env['CARPETA_FOTOS'] = carpetaFotos;

    const [{ AppModule }, { configurarApp }, { PrismaService }] = await Promise.all([
      import('../src/app.module.js'),
      import('../src/configurar-app.js'),
      import('../src/prisma/prisma.service.js'),
    ]);
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication<NestExpressApplication>({ logger: false });
    configurarApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    await limpiar();
    const passwordHash = await bcrypt.hash(CONTRASENA, 4);
    idAdmin = (await prisma.usuario.create({ data: { nombreUsuario: `${P}admin`, rol: 'ADMIN', passwordHash } })).id;
    await prisma.usuario.create({ data: { nombreUsuario: `${P}cocina`, rol: 'COCINA', passwordHash } });

    const entrar = async (nombreUsuario: string) =>
      (await api().post('/api/auth/login').send({ nombreUsuario, contrasena: CONTRASENA })).body.token as string;
    admin = await entrar(`${P}admin`);
    cocina = await entrar(`${P}cocina`);
  });

  afterAll(async () => {
    if (prisma) await limpiar();
    await app?.close();
    if (carpetaFotos) await rm(carpetaFotos, { recursive: true, force: true });
  });

  describe('RF01 · login y roles', () => {
    it('la salud es pública', async () => {
      await api().get('/api/salud').expect(200, { estado: 'ok' });
    });

    it('contraseña mal: 401 con el mensaje de la marca', async () => {
      const r = await api().post('/api/auth/login').send({ nombreUsuario: `${P}admin`, contrasena: 'no-es' });
      expect(r.status).toBe(401);
      expect(r.body.message).toBe('Usuario o contraseña incorrectos.');
    });

    it('login correcto da token; /auth/yo regresa al empleado', async () => {
      expect(admin).toBeTruthy();
      const r = await comoAdmin('get', '/auth/yo').expect(200);
      expect(r.body).toEqual({ id: idAdmin, nombreUsuario: `${P}admin`, rol: 'ADMIN' });
    });

    it('sin token: 401; con rol COCINA: 403 en los catálogos', async () => {
      await api().get('/api/sucursales').expect(401);
      await api().get('/api/sucursales').set('Authorization', `Bearer ${cocina}`).expect(403);
    });
  });

  describe('RF02 · sucursales', () => {
    const sucursal = {
      nombre: `${P}Centro`,
      direccion: 'Calle e2e 1, Colonia Prueba, León, Gto.',
      latitud: 21.12,
      longitud: -101.68,
      fotoUrl: '/fotos/muestra/sucursal.svg',
      url: 'https://elzarape.example/e2e',
      horarios: 'Lunes a domingo, 7:00 a 15:00',
    };
    let id = 0;

    it('alta: todos los campos son obligatorios', async () => {
      const r = await comoAdmin('post', '/sucursales').send({ nombre: `${P}Incompleta` }).expect(400);
      expect(r.body.message.length).toBeGreaterThan(3);
    });

    it('alta y búsqueda por nombre o por ubicación', async () => {
      id = (await comoAdmin('post', '/sucursales').send(sucursal).expect(201)).body.id;
      const porNombre = await comoAdmin('get', `/sucursales?nombre=${P}centro`).expect(200);
      expect(porNombre.body.map((s: { id: number }) => s.id)).toEqual([id]);
      const porUbicacion = await comoAdmin('get', '/sucursales?ubicacion=colonia prueba').expect(200);
      expect(porUbicacion.body.some((s: { id: number }) => s.id === id)).toBe(true);
    });

    it('modificación: todo excepto el ID', async () => {
      const r = await comoAdmin('patch', `/sucursales/${id}`).send({ horarios: 'Diario, 8:00 a 14:00' }).expect(200);
      expect(r.body.horarios).toBe('Diario, 8:00 a 14:00');
      const conId = await comoAdmin('patch', `/sucursales/${id}`).send({ id: 999 }).expect(400);
      expect(conId.body.message).toEqual(['El ID no se puede modificar.']);
    });

    it('eliminar con un empleado asignado: pasa a BAJA', async () => {
      const usuario = await comoAdmin('post', '/usuarios')
        .send({ nombreUsuario: `${P}asignado`, rol: 'COCINA', sucursalId: id })
        .expect(201);
      const r = await comoAdmin('delete', `/sucursales/${id}`).expect(200);
      expect(r.body.accion).toBe('BAJA');
      expect((await comoAdmin('get', `/sucursales/${id}`)).body.estatus).toBe('BAJA');
      await comoAdmin('delete', `/usuarios/${usuario.body.id}`).expect(200);
    });

    it('eliminar sin relacionados: se borra', async () => {
      const r = await comoAdmin('delete', `/sucursales/${id}`).expect(200);
      expect(r.body.accion).toBe('ELIMINADO');
      await comoAdmin('get', `/sucursales/${id}`).expect(404);
    });
  });

  describe('RF03 · usuarios', () => {
    let id = 0;
    let contrasena = '';

    it('alta con contraseña aleatoria de 12 caracteres que sirve para entrar', async () => {
      const r = await comoAdmin('post', '/usuarios').send({ nombreUsuario: `${P}maria`, rol: 'COCINA' }).expect(201);
      ({ id, contrasena } = r.body);
      expect(contrasena).toHaveLength(12);
      expect(r.body).not.toHaveProperty('passwordHash');
      await api().post('/api/auth/login').send({ nombreUsuario: `${P}maria`, contrasena }).expect(200);
    });

    it('nombre repetido: 409', async () => {
      await comoAdmin('post', '/usuarios').send({ nombreUsuario: `${P}maria`, rol: 'ADMIN' }).expect(409);
    });

    it('búsqueda por nombre de usuario', async () => {
      const r = await comoAdmin('get', `/usuarios?nombreUsuario=${P}mar`).expect(200);
      expect(r.body.map((u: { id: number }) => u.id)).toEqual([id]);
    });

    it('regenerar contraseña invalida la anterior', async () => {
      const r = await comoAdmin('post', `/usuarios/${id}/contrasena`).expect(201);
      expect(r.body.contrasena).not.toBe(contrasena);
      await api().post('/api/auth/login').send({ nombreUsuario: `${P}maria`, contrasena }).expect(401);
    });

    it('un usuario dado de baja ya no entra', async () => {
      await comoAdmin('patch', `/usuarios/${id}`).send({ estatus: 'BAJA' }).expect(200);
      const nueva = (await comoAdmin('post', `/usuarios/${id}/contrasena`)).body.contrasena;
      await api().post('/api/auth/login').send({ nombreUsuario: `${P}maria`, contrasena: nueva }).expect(401);
    });

    it('nadie se elimina a sí mismo', async () => {
      await comoAdmin('delete', `/usuarios/${idAdmin}`).expect(400);
    });

    it('eliminar sin relacionados: se borra', async () => {
      expect((await comoAdmin('delete', `/usuarios/${id}`).expect(200)).body.accion).toBe('ELIMINADO');
    });
  });

  describe('RF04–RF06 · alimentos, bebidas y combos', () => {
    let catAlimento = 0;
    let catBebida = 0;
    let alimento = 0;
    let bebida = 0;
    let combo = 0;

    it('categorías de alimentos y de bebidas', async () => {
      catAlimento = (await comoAdmin('post', '/categorias').send({ nombre: `${P}Platillos`, tipo: 'ALIMENTO' }).expect(201)).body.id;
      catBebida = (await comoAdmin('post', '/categorias').send({ nombre: `${P}Cafés`, tipo: 'BEBIDA' }).expect(201)).body.id;
    });

    it('un alimento no acepta categoría de bebidas', async () => {
      const r = await comoAdmin('post', '/alimentos')
        .send({ nombre: `${P}Molletes`, descripcion: 'Con frijoles', fotoUrl: '/fotos/muestra/platillo.svg', precio: 69, categoriaId: catBebida })
        .expect(400);
      expect(r.body.message).toBe('Elige una categoría de alimentos.');
    });

    it('precio con más de dos decimales: 400', async () => {
      await comoAdmin('post', '/alimentos')
        .send({ nombre: `${P}Caro`, descripcion: 'x', fotoUrl: '/fotos/muestra/platillo.svg', precio: 10.555, categoriaId: catAlimento })
        .expect(400);
    });

    it('alta de alimento y bebida; búsqueda por nombre, precio y categoría', async () => {
      const a = await comoAdmin('post', '/alimentos')
        .send({ nombre: `${P}Molletes`, descripcion: 'Con frijoles', fotoUrl: '/fotos/muestra/platillo.svg', precio: 69, categoriaId: catAlimento })
        .expect(201);
      alimento = a.body.id;
      expect(a.body.precio).toBe(69);
      expect(a.body.categoria.nombre).toBe(`${P}Platillos`);

      bebida = (
        await comoAdmin('post', '/bebidas')
          .send({ nombre: `${P}Café de olla`, descripcion: 'Con canela', fotoUrl: 'https://elzarape.example/cafe.webp', precio: 35.5, categoriaId: catBebida })
          .expect(201)
      ).body.id;

      const porPrecio = await comoAdmin('get', `/alimentos?nombre=${P}&precioMin=60&precioMax=70`).expect(200);
      expect(porPrecio.body.map((x: { id: number }) => x.id)).toEqual([alimento]);
      const fuera = await comoAdmin('get', `/alimentos?nombre=${P}&precioMin=70`).expect(200);
      expect(fuera.body).toEqual([]);
      const porCategoria = await comoAdmin('get', `/bebidas?categoriaId=${catBebida}`).expect(200);
      expect(porCategoria.body.map((x: { id: number }) => x.id)).toEqual([bebida]);
    });

    it('combo con alimentos y bebidas; calcula el ahorro', async () => {
      const r = await comoAdmin('post', '/combos')
        .send({
          nombre: `${P}Combo prueba`,
          descripcion: 'Molletes y café',
          fotoUrl: '/fotos/muestra/combo.svg',
          precio: 90,
          alimentos: [{ id: alimento, cantidad: 1 }],
          bebidas: [{ id: bebida, cantidad: 2 }],
        })
        .expect(201);
      combo = r.body.id;
      expect(r.body.precioPorSeparado).toBe(140);
      expect(r.body.ahorro).toBe(50);
    });

    it('combo vacío: 400', async () => {
      await comoAdmin('post', '/combos')
        .send({ nombre: `${P}Vacío`, descripcion: 'x', fotoUrl: '/fotos/muestra/combo.svg', precio: 10, alimentos: [], bebidas: [] })
        .expect(400);
    });

    it('búsqueda de combos por alimento o bebida', async () => {
      const porAlimento = await comoAdmin('get', `/combos?alimento=${P}mollet`).expect(200);
      expect(porAlimento.body.map((c: { id: number }) => c.id)).toEqual([combo]);
      const porBebida = await comoAdmin('get', '/combos?bebida=no-existe-e2e').expect(200);
      expect(porBebida.body).toEqual([]);
    });

    it('modificar componentes del combo', async () => {
      const r = await comoAdmin('patch', `/combos/${combo}`).send({ bebidas: [] }).expect(200);
      expect(r.body.bebidas).toEqual([]);
      expect(r.body.alimentos).toHaveLength(1);
    });

    it('alimento que está en un combo: BAJA; sin combo: se borra', async () => {
      expect((await comoAdmin('delete', `/alimentos/${alimento}`).expect(200)).body.accion).toBe('BAJA');
      expect((await comoAdmin('delete', `/combos/${combo}`).expect(200)).body.accion).toBe('ELIMINADO');
      expect((await comoAdmin('delete', `/alimentos/${alimento}`).expect(200)).body.accion).toBe('ELIMINADO');
    });

    it('categoría con productos: BAJA', async () => {
      expect((await comoAdmin('delete', `/categorias/${catBebida}`).expect(200)).body.accion).toBe('BAJA');
    });
  });

  describe('fotos', () => {
    it('sube un PNG y se sirve en /fotos', async () => {
      const png = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64',
      );
      const r = await comoAdmin('post', '/archivos/fotos').attach('foto', png, 'punto.png').expect(201);
      expect(r.body.url).toMatch(/^\/fotos\/[\w-]+\.png$/);
      await api().get(r.body.url).expect(200);
    });

    it('rechaza archivos que no son JPG, PNG o WebP', async () => {
      await comoAdmin('post', '/archivos/fotos').attach('foto', Buffer.from('<svg/>'), 'x.png').expect(400);
    });
  });
});
