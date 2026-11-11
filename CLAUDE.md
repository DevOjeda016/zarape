# CLAUDE.md

Guía para Claude Code (y el equipo) al trabajar en este repositorio.

## Proyecto

**El Zarape**: sistema de autoservicio para una cadena de restaurantes de brunch mexicano en León, Guanajuato, hecho como Aplicaciones Web Progresivas (PWA).
Proyecto final de *Aplicaciones Web Progresivas* (IDGS-1001), Universidad Tecnológica de León. Profesor: Rafael Augusto Rocha Angulo.
Periodo: 4 nov – 7 dic 2026 (5 sprints Scrum de una semana).

| Integrante | Rol |
|---|---|
| Daniel Ojeda Luna (DOL) | Líder de proyecto y Scrum Master |
| Cristian Veuliah Mares Cerda (CVMC) | Front end líder (arquitectura, componentes, hooks, revisión de código) |
| Ricardo Garnica Mejia (RGM) | PWA y despliegue; cocina/turnos/avisador; drive thru |
| Juan Pablo Rea Cano (JPRC) | Back end, base de datos, simulador de pago, consultas del dashboard |
| Haziel Orlando Gutierrez Hernandez (HOGH) | UI/UX, identidad visual, prototipos |
| Jael Neftali Vargas Grijalva (JNVG) | Mercado, pruebas (funcionales + Lighthouse), documentación |

## Fuentes de verdad (`requirements/`)

- `El Zarape_8910.pdf`: **documento de requerimientos original** (Soria García et al., 2024). Define RF/RDF/NF con sus campos y reglas. Es la referencia de *qué* debe hacer el sistema.
- `Proyecto final PWA SD26_0105.pdf`: lineamientos del profesor. 15 entregables y un **Dashboard** para administrar la distribución/venta del producto.
- `El_Zarape_PWA_Objetivos_Alcance_y_Plan_de_Mercadeo_0459.docx`: planeación del equipo (puntos 1–13): alcance, precios, combos, métricas, calendario, roles.
- `branding/README.md`: identidad visual **vigente** (ver abajo).

Prioridad ante dudas: requerimiento original > lineamientos del profesor > planeación del equipo. No agregar funciones que nadie pidió.

**Excepción NF03:** el profesor confirmó que las paletas A/B/C, las tipografías (Arial Black, Comic Sans MS, Arial), el logo y las pantallas del documento son solo ejemplos. Lo que se conserva es la idea: logo con el nombre, una imagen mexicana y un zarape de colores, más slogan y diseño por módulo. Manda `branding/`.

## Arquitectura

Detalle completo en `docs/arquitectura.md` y `docs/modelo-de-datos.md`.

- **Monorepo** con pnpm workspaces:
  - `apps/api`: **NestJS** + **PostgreSQL** (Prisma) + **Socket.IO** (gateway de NestJS) + JWT con roles + Swagger.
  - `apps/admin` (`@zarape/admin`): Módulo I, Gestión (intranet, NF01): catálogos y dashboard.
  - `apps/pos` (`@zarape/pos`): Módulo II, punto de venta en sitio (tabletas del restaurante, NF02): kiosko, cocina, turnos y **lectura del QR del drive thru en ventanilla**.
  - `apps/drive-thru` (`@zarape/drive-thru`): Módulo III, PWA pública móvil.
  - Nombres de carpetas y paquetes en inglés estándar; la documentación y los textos de la UI van en español.
  - `packages/ui`: tokens y componentes de la marca.
  - `packages/shared`: tipos, enums de estatus, cálculo de la comanda (IVA) y reglas de contraseña.
- La API **recalcula** precios y totales con la BD; nunca confía en los totales que manda el cliente.
- Tiempo real: el socket solo avisa (salas por sucursal y por comanda); la fuente de verdad es REST.
- Estados de comanda (`OrderStatus`): `PENDING` → `PAID` → `IN_KITCHEN` → `READY` → `DELIVERED` (o `CANCELLED`).
- Por confirmar: proveedores de despliegue y de fotos, y si se agrega Turborepo.

## Convenciones

- **Idioma:** código, base de datos, rutas REST, variables de entorno y git en **inglés**. Textos de la UI y documentación en **español**.
- **Ramas:** `feat/`, `fix/`, `chore/`, `docs/` + nombre corto en kebab-case (ej. `feat/admin-catalogs`). Nada se sube directo a `main`.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) en inglés: `tipo(alcance): descripción` (ej. `feat(api): add branch search`).
- **Glosario** (dominio en español → código en inglés; tabla completa en `docs/modelo-de-datos.md`):

| Español | Código |
|---|---|
| Sucursal | `Branch` |
| Usuario (empleado) | `Employee` |
| Categoría | `Category` |
| Alimento / Bebida | `Food` / `Drink` |
| Combo | `Combo` |
| Cliente | `Customer` |
| Medio de pago | `PaymentMethod` |
| Comanda / Detalle | `Order` / `OrderItem` |
| Pago | `Payment` |
| Gasto de marketing | `MarketingExpense` |
| Calificación | `Rating` |
| Turno / Token QR | `ticketNumber` / `qrToken` |
| Estatus activo / baja | `ACTIVE` / `INACTIVE` |
| Canal kiosko / drive thru | `KIOSK` / `DRIVE_THRU` |
| Roles administrador / cocina | `ADMIN` / `KITCHEN` |
| Estados de comanda | `PENDING`, `PAID`, `IN_KITCHEN`, `READY`, `DELIVERED`, `CANCELLED` |

- **Rutas REST** en plural y kebab-case: `/api/branches`, `/api/foods`, `/api/employees/:id/password`. Rutas públicas con `@Public()`.

## Stack de front end

- **React + Vite**, componentes funcionales y hooks.
- **shadcn/ui** + **Tailwind CSS v4** en `packages/ui`, con las variables de shadcn conectadas a los tokens de marca (tabla en `branding/README.md`).
- **Motion** (`motion/react`) para animaciones; reglas de movimiento en `branding/README.md`. Siempre `MotionConfig reducedMotion="user"`.
- Íconos: **Phosphor** (`@phosphor-icons/react`) como `iconLibrary` de shadcn; pesos regular (gestión) / bold (kiosko, drive thru, cocina) / fill (activo). Detalle en `branding/README.md`.
- Extras: Sonner, Drawer (Vaul), shadcn Charts para el dashboard, Magic UI solo donde sume. Sin GSAP: Motion cubre las animaciones.
- **vite-plugin-pwa** (Workbox) para manifest y service worker.
- Rutas del lado del cliente con **rutas protegidas por rol**.
- APIs del navegador: Geolocation (sucursal cercana), cámara (leer QR), audio (alerta del avisador).
- Navegadores objetivo: Chrome, Edge y Safari recientes.

## Roles

- **Administrador** (empleado): acceso a todo el Módulo I.
- **Cocina** (empleado): consulta todas las comandas y su detalle, cambia el estatus a lista (activa el avisador).
- **Comensal en sitio**: sin registro (RF08).
- **Cliente drive thru**: registrado, tipo Cliente que a su vez es Persona (RF17).

## Requerimientos por módulo

### I. Gestión (RF01–RF06, NF01)
- **RF01 Login** de empleado; **RDF0101** menú: Sucursal, Usuario, Alimento, Bebida, Combo.
- **RF02 Sucursal**: id, nombre, dirección, gps_latitud, gps_longitud, foto, URL, horarios. Buscar por nombre o ubicación.
- **RF03 Usuario** (empleado): id, nombre de usuario, contraseña **aleatoria de 12 caracteres** generada por el sistema. Buscar por nombre de usuario.
- **RF04 Alimento**: id, nombre, descripción, foto, precio, categoría (Platillos, Ensaladas, Tortas, Postres, Fruta…). Buscar por nombre, precio o categoría.
- **RF05 Bebida**: igual que alimento, categorías Refrescos, Aguas, Jugos, Cafés… Buscar por nombre, precio o categoría.
- **RF06 Combo**: id_combo, nombre, precio, descripción y varios alimentos y/o bebidas tomados de sus catálogos. Buscar por nombre, alimentos o bebidas.
- En todos los catálogos: alta (todos los campos obligatorios), modificación de todo excepto el ID, búsqueda **con impresión de resultados**.

### II. En sitio (RF07–RF15, NF02)
- **RF07** menú: Platillos, Bebidas, Combos, Ver comanda. **RF08** sin registro.
- **RF09** comanda tipo ticket: cantidad +/−, eliminar, precio unitario, total por producto, total, IVA y total a pagar; todo se recalcula solo.
- **RF10** comanda: ID, fecha, hora, estatus, total, IVA, total a pagar. **RDF1002** buscar por rango de días o de total, con impresión.
- **RF11** detalle: id comanda, id producto (alimento, bebida o combo), cantidad, precio, total. **RDF1102** consultar detalle, con impresión.
- **RF12** "Pagar en línea" (simulador) y "Pagar con terminal" visible pero no disponible.
- **RF13** pago: número de tarjeta, nombre, vencimiento (mes/año), CVV, fecha, cantidad, estatus. **RDF130102** buscar pagos por rango de fechas o cantidad.
- **RF14** avisador **digital** (pantalla de turnos + QR); el físico RF-433 (RDF1401) queda fuera.
- **RF15** cocina: cola de comandas nuevas; al terminar marca "lista" y se activa el aviso.
- **NF02**: solo dentro del restaurante; el pago requiere internet.

### III. Drive thru (RF16–RF20)
- **RF16** login con usuario y contraseña, registrarse, recordar contraseña. Si es correcto: saludo por horario y nombre ("Buenas tardes, John"); si no: "Usuario o contraseña incorrectos".
- **RF17** perfil: acceso (usuario + contraseña de **12 caracteres, empieza con letra, mayúsculas, minúsculas, números y `* $ _`**), datos personales (nombre, apellidos, teléfono), medio de pago (tarjeta, MM, YY, CVV, titular) y dirección del medio de pago (calle y número, colonia, ciudad, estado, CP). Todo obligatorio; ID automático; se modifica todo excepto el ID.
- **RF18** menú: Perfil, Ordenar, Revisar pedido.
- **RF19** ordenar: sucursales por cercanía, menú por categorías (Alimentos, Bebidas, Combos), tarjetas con foto/descripción/precio y "Agregar", ticket, pago simulado y **QR** de la compra.
- **RF20** revisar pedido: detalle + QR. En ventanilla se lee el QR, se entrega y queda como **entregado**.

### Transversal
- Identidad y diseño por módulo (NF03, ver `branding/`), capacidades PWA, Dashboard de administración.

## Reglas de negocio clave

- **Eliminar**: si el registro no tiene registros relacionados se borra; si tiene, solo cambia su estatus a **baja**. El perfil del cliente **nunca** se borra: el cliente se da de baja y solo cambia el estatus (RDF1702).
- Precios en MXN **con IVA incluido**. Ticket: `subtotal = total / 1.16`, `IVA = total − subtotal`, dos decimales.
- Pago: **solo simulador**, con tarjetas de prueba. El número completo y el CVV se validan pero **no se guardan**; solo titular, marca, últimos 4 y vencimiento.
- Paridad de precios entre canales. Combos = mecanismo de descuento (sin motor de cupones).
- Cada comanda guarda fecha, hora, estatus, canal, sucursal y total: de ahí salen las métricas del dashboard.

## Arquitectura de front end planeada

- Componentes en 3 niveles: **base** (botón, campo, tarjeta, modal, insignia, cargador) → **compuestos** (tarjeta de producto, ticket, tabla de catálogo con búsqueda e impresión, formulario, cola de comandas, visor QR, gráficas) → **vistas**.
- Hooks: `useAuth`, `useComanda` (useReducer para agregar/aumentar/disminuir/eliminar + useMemo para totales), `useApi`, `useGeolocation`, `useOnlineStatus`, `useInstallPrompt`.
- `useContext` para sesión y comanda activa.

## PWA

- Manifest por app: nombre, nombre corto, íconos (`branding/logos/isotipo.svg` y `isotipo-maskable.svg`), `theme_color` `#12402E` (mesa), `display: standalone`.
- Service worker: precache del shell; **stale-while-revalidate** para el menú (consulta sin conexión); **network-first** para comandas y pagos (sin red, avisar claro, no mostrar datos viejos).
- Aviso propio de instalación (Android) e instrucciones para iOS/Safari; aviso de nueva versión.
- Fuentes autoalojadas (`@fontsource/ultra`, `@fontsource-variable/libre-franklin`) para que funcionen sin conexión.
- **HTTPS obligatorio** en todo despliegue, incluida la intranet.
- Meta: **Lighthouse ≥ 90** en rendimiento y accesibilidad.

## Identidad visual (`branding/`)

- Guía completa: `branding/README.md`. Variables CSS: `branding/tokens.css`. Logos: `branding/logos/` (se generan con `branding/scripts/generar-logos.js`).
- Dirección **Lotería**: cada platillo es una carta (marco negro doble, precio en el recuadro del número, nombre en mayúsculas al pie) sobre la mesa verde; cuando el pedido está listo se canta "¡Lotería!". Exploración: https://claude.ai/artifact/8sdxUrvWNYTEz3d4rGBmF9
- Logo: **la carta número 1**, un jarrito de barro frente a un zarape colgado, con el título "EL ZARAPE". Archivos: `carta` (logo principal), `jarro` (solo el dibujo), `isotipo` (carta sobre la mesa, ícono y favicon), `isotipo-maskable` y `jarro-mono` (`currentColor`).
- Dos temas: **papel** (claro, predeterminado: gestión, tickets) y **mesa** (`data-theme="mesa"`: kiosko, cocina, turnos, drive thru). Dentro de mesa, cada carta lleva `data-theme="papel"`.
- Resumen: fijos `mesa` `#12402E`, `carta` `#FFFBF0`, `tinta` `#000000`, `chile` `#C8102E` (acción en papel), `maiz` `#F2B705` (acción en mesa), `jarra`, `nopal`, `rosa`. Tipografías **Ultra** (display, un solo peso) y **Libre Franklin** (interfaz). Slogan: "Sabor mexicano a tu ritmo."
- Usar siempre los tokens; nada de colores sueltos en el código. Estados de comanda con color + texto + ícono.

## Fuera de alcance

Pasarela de pago real, terminal bancaria física, avisador físico RF-433, publicación en tiendas de apps, entrega a domicilio e integraciones con terceros, facturación electrónica, lealtad/cupones/puntos, inventarios/compras/nómina/contabilidad.

## Fechas de entrega

| Entrega | Fecha | Contenido |
|---|---|---|
| Primer avance | Mié 25 nov 2026 | Documento puntos 1–13, identidad visual, Módulo I completo, PWA base (manifest + SW) |
| Segundo avance | Mié 2 dic 2026 | Módulo II completo (comanda, pago, cocina, avisador), login y perfil del Módulo III, diagramas de BD |
| Presentación | Lun 7 dic 2026 | Módulo III completo, dashboard, offline, resultados de pruebas, versión desplegada |

## Comandos

Requisitos: Node 24 (mínimo 22.12, ver `.nvmrc`) y pnpm 12 (`npm i -g pnpm@12`). Todo se corre desde la raíz.

| Comando | Qué hace |
|---|---|
| `pnpm install` | Instala todo, compila `packages/shared` y genera el cliente de Prisma. |
| `pnpm dev` | API y las tres apps en paralelo (compila `shared` primero y lo vigila). |
| `pnpm dev:api`, `pnpm dev:admin`, `pnpm dev:pos`, `pnpm dev:drive-thru` | Una sola pieza. |
| `pnpm build` | Compila todo en orden; cada app genera su manifest y service worker en `dist/`. |
| `pnpm test` | Pruebas con Vitest (`packages/shared` y `apps/api`). |
| `pnpm lint` | oxlint en todo el repo (`.oxlintrc.json`). |
| `pnpm typecheck` | Revisa los tipos de cada paquete. |
| `pnpm --filter @zarape/<app> preview` | Sirve el build de una app (puertos 4173–4175). |

Puertos en desarrollo: API `3000` (Swagger en `/api/docs`, salud en `/api/health`), admin `5173`, pos `5174`, drive-thru `5175`.

API y base de datos (`apps/api`):

- Copiar `apps/api/.env.example` a `apps/api/.env` y poner el `DATABASE_URL`. La API arranca sin BD: Prisma se conecta en la primera consulta.
- `pnpm --filter @zarape/api <script>` con `prisma:validate`, `prisma:generate`, `prisma:migrate` (crea y aplica migraciones en desarrollo), `prisma:deploy` y `prisma:studio`.
- Sin PostgreSQL instalado: `pnpm --filter @zarape/api exec prisma dev` levanta una base local y muestra su URL.
- `pnpm --filter @zarape/api db:seed`: datos de prueba (menú y combos del plan de mercadeo, sucursales, empleados `admin` y `cocina`; contraseñas en `SEED_ADMIN_PASSWORD` / `SEED_KITCHEN_PASSWORD` o se imprimen una vez).
- Auth: toda ruta de la API pide JWT salvo las marcadas con `@Public()`; `@Roles('ADMIN')` limita por rol (`apps/api/src/auth/decorators.ts`). En producción `JWT_SECRET` es obligatorio.
- Pruebas e2e: corren con `TEST_DATABASE_URL` (si no, se saltan); crean y borran registros `e2e-`. `DATABASE_URL` acepta `?schema=` (app, seed y migraciones usan el mismo esquema).
- En desarrollo, el admin manda `/api` y `/photos` a la API por el proxy de Vite.

Componentes de shadcn: `pnpm --filter @zarape/ui exec shadcn add <componente>` (quedan en `packages/ui/src/components`). Desde una app, el CLI agrega dependencias a esa app; mejor desde `packages/ui`.

## Herramientas de IA del proyecto

Solo oficiales, fijadas por versión o commit. Fuentes, licencias y cómo actualizarlas: `.claude/README.md`.

- **Skills** (`.claude/skills/`): `frontend-design` (Anthropic: dirección visual con carácter, evita diseños genéricos; usarla antes de diseñar pantallas o identidad), `shadcn` (CLI, reglas de composición y theming; usa el shadcn del repo), `prisma-cli`, `prisma-client-api` y `prisma-orm-setup` (Prisma 7), `motion` (buenas prácticas de animación), y `chrome-devtools`, `a11y-debugging`, `debug-optimize-lcp` y `troubleshooting` (Chrome DevTools).
- **MCP** (`.mcp.json`; cada quien los aprueba la primera vez): `shadcn` (registro de componentes), `chrome-devtools` (Lighthouse, accesibilidad y rendimiento en Chrome), `motion` (docs y ejemplos de Motion) y `prisma` (estado y creación de migraciones, Studio).
- Sin nada oficial para Claude: Tailwind CSS, Socket.IO, Phosphor, pnpm, NestJS, React, Vite, vite-plugin-pwa, Vitest y oxlint. De esas, publican `llms.txt` (docs para IA): [React](https://react.dev/llms.txt), [Vite](https://vite.dev/llms.txt), [vite-plugin-pwa](https://vite-pwa-org.netlify.app/llms.txt), [NestJS](https://docs.nestjs.com/llms.txt), [Vitest](https://vitest.dev/llms.txt) y [oxc](https://oxc.rs/llms.txt).

## Changelog (obligatorio)

Todo cambio al repositorio (código, config, docs) lleva una entrada nueva en `changelog/`:

1. Crear `changelog/AAAA-MM-DD-NNN-slug.md` con la plantilla de `changelog/README.md`.
2. Agregar una línea al índice de `changelog/README.md` (más nuevo arriba).

No editar entradas viejas salvo para corregir errores de redacción; un cambio nuevo = archivo nuevo.
