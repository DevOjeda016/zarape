# El Zarape

Brunch mexicano que pides y pagas desde cualquier pantalla: el kiosko del restaurante, tu teléfono rumbo al drive thru o la intranet donde el equipo administra el menú. Esta guía define cómo se ve, cómo suena y cómo se construye la marca en las tres apps.

> El manual del documento de requerimientos (paletas A/B/C, Arial Black, Comic Sans MS) era solo un ejemplo. El equipo propone esta identidad nueva, con la misma idea de fondo: nombre, imagen mexicana y un zarape de colores.

## Idea de marca

**Un jarrito de café de olla envuelto en su zarape.** El jarro de barro humeante es la mañana y la cocina de casa; el zarape con flecos que lo abraza es la tradición mexicana y el nombre de la marca. Calidez de cocina casera con la rapidez de lo digital.

| | |
|---|---|
| Esencia | Brunch mexicano rápido, cálido y sin filas. |
| Personalidad | Cálida, directa, orgullosamente mexicana sin caer en caricatura. |
| Slogan | **Sabor mexicano a tu ritmo.** |
| Frases de apoyo | "Pide sin fila." · "Tu desayuno, a tu hora." · "Del comal a tu mano." |

## Logo

El **isotipo** es un **jarrito de barro** como los de café de olla: panza redonda, boca abierta y asa de lado, **envuelto en un zarape** con flecos (crema, rosa, cempasúchil, talavera, crema) y con tres hilos de vapor. Funciona solo (ícono de app, favicon) o junto al nombre.

**Logotipo (lockup):** jarro + "El Zarape" en Bricolage Grotesque ExtraBold (800), color `cafe`. El nombre mide de alto la mitad del jarro. Debajo, opcional, el slogan en Inter 500, color `cafe-suave`.

| Archivo | Uso |
|---|---|
| `jarro.svg` | El jarro sin fondo. Encabezados, lockup, splash. Se adapta al tema. |
| `isotipo.svg` | Jarro sobre cuadro redondeado masa. Ícono de app y favicon en claro. Se adapta al tema. |
| `isotipo-oscuro.svg` | Jarro sobre cuadro redondeado `cafe`. Ícono y splash en oscuro. |
| `isotipo-maskable.svg` | Ícono PWA `purpose: maskable` (fondo a sangre, arte al 80 %). |
| `jarro-mono.svg` | Una tinta con `currentColor`: toma el color del texto. Tickets impresos, sellos, íconos de UI. |

**Modo claro, oscuro y variantes.** Los SVG usan variables CSS con valor de respaldo. Como `<img>` se ven con su color fijo; insertados en línea (componente React) toman el tema de la página:

| Variable | Claro | Oscuro | Pinta |
|---|---|---|---|
| `--logo-fondo` | `#FFF8EF` | `#2B1810` | Cuadro del isotipo |
| `--logo-jarro` | `#B4532A` | `#C8633A` | Barro del jarro y asa |
| `--logo-boca` | `#5E2A14` | `#4A200E` | Interior de la boca |
| `--logo-vapor` | `#B3261E` | `#F4A019` | Hilos de vapor |

Las franjas del zarape y los flecos **no cambian** con el tema: son la firma de la marca. El barro se aclara en oscuro para mantener 3:1 contra el fondo.

Todas las variantes salen de una sola geometría: si cambia el jarro o un color, edita `scripts/generar-logos.js` y corre `node branding/scripts/generar-logos.js branding/logos`.

Reglas:

- Tamaño mínimo: 24 px en pantalla, 12 mm impreso.
- Aire alrededor: un cuarto del ancho del isotipo por lado.
- No cambiar el orden ni los colores de las franjas.
- No agregar sombrero, bigote, nopal ni cactus. El jarro y el zarape ya dicen "México".
- No estirar, rotar, delinear ni poner sombra.
- Sobre fotos, usar el isotipo con su cuadro (claro u oscuro), nunca el jarro suelto.
- Pendiente: lockup en vector con el texto convertido a curvas, e íconos PNG de la PWA generados desde `isotipo.svg` y `isotipo-maskable.svg`.

## Color

Paleta de cocina mexicana: masa, barro, café de olla y chile como base; las franjas del zarape como acentos. Todo par texto/fondo listado cumple WCAG AA (4.5:1) en tema claro y oscuro.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `masa` | `#FFF8EF` | `#1C120D` | Fondo de página. |
| `barro` | `#F3E6D6` | `#33241B` | Fondo alterno: secciones, barra lateral, filas pares. |
| `tarjeta` | `#FFFFFF` | `#2A1D16` | Tarjetas, modales, ticket. |
| `linea` | `#E7D5C1` | `#3D2B21` | Divisores decorativos (no para bordes de campos). |
| `borde-campo` | `#9C8573` | `#8C7563` | Borde de inputs y controles (3:1). |
| `cafe` | `#2B1810` | `#FBEFE2` | Texto principal. |
| `cafe-suave` | `#6B5446` | `#B9A08E` | Texto secundario, ayudas, metadatos. |
| `chile` | `#B3261E` | `#FF6B5B` | Color principal: botón primario, precio total, enlaces. |
| `chile-hover` | `#8F1D17` | `#FF8A7D` | Hover y presionado del primario. |
| `sobre-chile` | `#FFFFFF` | `#1C120D` | Texto sobre `chile`. |
| `rosa` | `#C2185B` | `#F06A9E` | Acento: combos, promos, "combo de la semana". |
| `cempasuchil` | `#F4A019` | `#F4A019` | Relleno de acento con texto `cafe` encima (nunca texto naranja sobre masa). |
| `cempasuchil-texto` | `#8A5A00` | `#F4A019` | Texto de advertencia. |
| `nopal` | `#2F7A3E` | `#6FCF7F` | Éxito: "Lista", pago aprobado. |
| `talavera` | `#1F5FA8` | `#7FB2F0` | Información: "Pagada", ayudas. |

Tintes para insignias (fondo + texto del mismo color): `chile-tinte`, `nopal-tinte`, `talavera-tinte`, `cempasuchil-tinte`.

**Estados de comanda** (siempre color + texto + ícono, nunca solo color):

| Estado | Color | Ícono |
|---|---|---|
| Pagada | `talavera` | recibo |
| En cocina | `cempasuchil-texto` | flama |
| Lista | `nopal` | campana |
| Entregada | `cafe-suave` sobre `barro` | check |
| Cancelada / pago rechazado | `chile` | x |

**Franjas del zarape** (de arriba abajo): rosa, cempasúchil, masa, talavera, masa, nopal, rosa. Úsalas como detalle (borde superior del ticket, separador del menú, pantalla de carga), nunca como fondo de texto.

## Tipografía

| Rol | Familia | Por qué |
|---|---|---|
| Display | **Bricolage Grotesque** (variable, 600–800) | Grotesca con carácter artesanal; da personalidad a títulos, nombres de platillos y números de turno. |
| Interfaz y texto | **Inter** (variable, 400–700) | Estándar actual de UI: muy legible en pantallas chicas y números tabulares para precios. |

Ambas son libres (Google Fonts). En las apps se **autoalojan** con `@fontsource-variable/bricolage-grotesque` y `@fontsource-variable/inter` para que funcionen sin conexión (PWA).

Escala:

| Estilo | Familia | Tamaño / interlínea | Peso | Uso |
|---|---|---|---|---|
| `turno` | Display | 120 / 120 | 800 | Número en pantalla de turnos. |
| `display-xl` | Display | 56 / 60 | 800 | Portada del kiosko. |
| `display-lg` | Display | 40 / 44 | 700 | Títulos de pantalla en kiosko. |
| `display-md` | Display | 28 / 32 | 700 | Títulos de sección, nombre de categoría. |
| `titulo` | Display | 20 / 26 | 700 | Nombre de platillo en tarjeta. |
| `cuerpo-lg` | Inter | 18 / 28 | 400 | Texto en kiosko. |
| `cuerpo` | Inter | 16 / 24 | 400 | Texto general. |
| `etiqueta` | Inter | 14 / 20 | 600 | Botones, etiquetas de campo, insignias. |
| `nota` | Inter | 12 / 16 | 500 | Metadatos, pie de ticket. |
| `precio` | Inter | 18 / 24 | 700 | Precios (`font-variant-numeric: tabular-nums`). |

## Voz y tono

Hablamos de **tú**, corto y amable, como quien te atiende en la barra. Mexicano natural, sin modismos forzados ni "¡Ándale, güey!".

| Momento | Sí | No |
|---|---|---|
| Saludo (RF16) | "Buenos días, Ana. ¿Lo de siempre?" | "Bienvenido estimado usuario." |
| Agregar | "Agregar" · "Agregado a tu pedido" | "Producto añadido exitosamente!!" |
| Pagar | "Pagar $145.00" | "Proceder al pago" |
| Error de login | "Usuario o contraseña incorrectos." | "Error 401: credenciales inválidas." |
| Pago rechazado | "No pudimos cobrar. Revisa los datos de la tarjeta e intenta otra vez." | "Transacción fallida." |
| Pedido listo | "¡Tu pedido 042 está listo! Pasa a recogerlo." | "Estatus actualizado a: LISTO." |
| Sin conexión | "Sin internet. Puedes ver el menú, pero para pagar necesitas conexión." | "Offline." |
| Terminal | "Pago con terminal: próximamente" | Ocultar el botón. |

Reglas: verbos al inicio en botones ("Ver pedido", "Agregar combo"); precios siempre con dos decimales y `$`; solo un "¡!" por pantalla, y solo para buenas noticias.

## Fotografía

- Comida real, recién servida, con luz natural cálida (ventana, mañana).
- Encuadre cenital o a 45°, el platillo ocupa 60–70 % de la foto.
- Utilería mexicana sutil: barro, talavera, madera, una orilla de zarape. Sin banderitas ni sombreros.
- Colores naturales, sin saturar de más; sin texto encima de la foto.
- Proporciones: 4:3 tarjetas de producto, 16:9 portada, 1:1 miniaturas.
- Archivos: WebP (respaldo JPG), máximo 1920×1080, menos de 200 KB en tarjetas. Siempre con `alt` que describa el platillo.

## Iconografía

[Phosphor Icons](https://phosphoricons.com) (`@phosphor-icons/react`), configurado como `iconLibrary` de shadcn. Redondeado y cálido como el jarro y Bricolage Grotesque. Color `cafe` o el color del estado.

| Peso | Uso |
|---|---|
| `regular` | Interfaz en general: navegación, botones, tablas. |
| `fill` | Estado seleccionado o activo (pestaña actual, categoría elegida). El cambio regular → fill se anima con Motion. |
| `duotone` | Botones grandes de categoría en el kiosko y estados vacíos. |
| `bold` | Solo en la pantalla de turnos y de cocina, para leer a distancia. |

Tamaños: 20 px en texto, 24 px en botones, 32 px en kiosko. Íconos clave: `ForkKnifeIcon` (platillos), `CoffeeIcon` (bebidas), `PackageIcon` (combos), `CakeIcon` (postres), `ReceiptIcon` (ticket), `FireIcon` (en cocina), `BellRingingIcon` (lista), `QrCodeIcon`, `MapPinIcon` (sucursal), `CarIcon` (drive thru), `StorefrontIcon` (en sitio). Los íconos de estado de comanda (EstadoComanda) usan estos mismos.

## Forma y espacio

- Base de 4 px: `space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-6` 24 · `space-8` 32 · `space-12` 48.
- Esquinas: `radius-sm` 6 (insignias) · `radius-md` 10 (botones, campos) · `radius-lg` 16 (tarjetas, ticket) · `radius-pill` (chips de categoría).
- Áreas táctiles: `touch-min` 44 px (teléfono, intranet) · `touch-kiosko` 56 px (tableta del restaurante).
- Una sola sombra suave (`sombra-tarjeta`); el resto se separa con color de fondo.

## Componentes: shadcn/ui con la marca

La UI se arma con **shadcn/ui** + **Tailwind CSS v4** en `packages/ui`. Los tokens de la marca se conectan a las variables de shadcn, así todos los componentes salen con la identidad de El Zarape sin reescribirlos:

| Variable shadcn | Token de marca |
|---|---|
| `--background` | `masa` |
| `--foreground` | `cafe` |
| `--card`, `--popover` | `tarjeta` |
| `--primary` / `--primary-foreground` | `chile` / `sobre-chile` |
| `--secondary`, `--muted` | `barro` |
| `--muted-foreground` | `cafe-suave` |
| `--accent` / `--accent-foreground` | `cempasuchil-tinte` / `cafe` |
| `--destructive` | `chile-hover` (siempre con diálogo de confirmación e ícono) |
| `--border` | `linea` |
| `--input` | `borde-campo` |
| `--ring` | `talavera` |
| `--chart-1` … `--chart-5` | `chile`, `talavera`, `nopal`, `cempasuchil`, `rosa` |
| `--radius` | `radius-md` (10 px) |

Se usan de shadcn: Button, Input, Form, Select, Dialog, Sheet, Drawer, Table, Tabs, Badge, Card, Sonner, Skeleton, Chart. Componentes propios de la marca encima: TarjetaProducto, Ticket, EstadoComanda, Turnos, VisorQR.

## Movimiento

Look **fresco y elegante**: el movimiento explica qué pasó, no decora. Se usa **Motion** (`motion/react`).

| Momento | Animación |
|---|---|
| Agregar producto | La tarjeta da un pulso corto y la línea entra al ticket con animación de layout. |
| Cambiar cantidad | El total cuenta hacia el nuevo valor (`NumberTicker` o spring de Motion). |
| Cambio de pantalla | Fundido + desplazamiento de 8–12 px con `AnimatePresence`. |
| Ticket en móvil | Drawer que sube desde abajo con resorte. |
| Pago aprobado | Check que se dibuja + aparece el turno. |
| Pedido listo (turnos) | El número entra grande con resorte y tres pulsos suaves. |
| Cocina: comanda nueva | La tarjeta entra desde arriba y las demás se recorren (layout). |
| Carga | Skeletons con brillo suave, nunca spinners a pantalla completa. |

Reglas:

- Duración 150–300 ms; resortes suaves (sin rebote exagerado).
- Solo animar `transform` y `opacity` (cuida Lighthouse ≥ 90).
- `<MotionConfig reducedMotion="user">` en cada app: si el usuario pide menos movimiento, se quitan desplazamientos y se dejan fundidos.
- Nunca bloquear una acción esperando una animación.

## Por app

| App | Tema | Carácter |
|---|---|---|
| I. Gestión (intranet) | Claro | Denso y ordenado: tablas, filtros, formularios; color solo para acciones y estados. |
| II. Kiosko en sitio | Claro | Grande y táctil: fotos protagonistas, botones de 56 px, ticket siempre visible a la derecha. |
| II. Cocina y turnos | Oscuro | Alto contraste a distancia: columnas por estado, números de turno de 120 px, alerta con sonido + parpadeo suave. |
| III. Drive thru (móvil) | Claro y oscuro | Una mano: barra inferior con Perfil · Ordenar · Revisar pedido; QR grande con brillo al máximo. |

## Accesibilidad

- Contraste AA en todo par texto/fondo (ya validado en esta paleta).
- Foco visible: anillo de 2 px `talavera` con separación de 2 px.
- Estados con texto + ícono, no solo color.
- El avisador combina sonido y señal visual; respeta `prefers-reduced-motion`.
- Meta del proyecto: Lighthouse ≥ 90 en rendimiento y accesibilidad.

## Archivos

- `logos/`: isotipos SVG.
- `tokens.css`: variables CSS listas para importar en las apps.
- Sistema de marca interactivo: https://claude.ai/artifact/MBmLHKVu9Q878MttpVD6VQ
