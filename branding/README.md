# El Zarape

Brunch mexicano que pides y pagas desde cualquier pantalla: el kiosko del restaurante, tu teléfono rumbo al drive thru o la intranet donde el equipo administra el menú. Esta guía define cómo se ve, cómo suena y cómo se construye la marca en las tres apps.

> El manual del documento de requerimientos (paletas A/B/C, Arial Black, Comic Sans MS) era solo un ejemplo. El equipo propone esta identidad, con la misma idea de fondo: nombre, imagen mexicana y un zarape de colores.

## Idea de marca: Lotería

**Cada platillo es una carta y tu pedido se canta.** La lotería es el juego de mesa que todo México reconoce: cartas con marco negro, número en la esquina, un dibujo al centro y el nombre abajo. En El Zarape el menú es la baraja, la pantalla es la mesa verde donde se reparten las cartas y, cuando tu pedido está listo, la cocina lo canta: "¡Lotería! La 042 ya está lista."

La carta número 1 es la de la casa: **un jarrito de barro frente a un zarape colgado**. El jarro de café de olla es la mañana y la cocina de casa; el zarape es la tradición y el nombre de la marca.

| | |
|---|---|
| Esencia | Brunch mexicano rápido, cálido y sin filas. |
| Personalidad | Juguetona, directa, orgullosamente mexicana sin caer en caricatura. |
| Slogan | **Sabor mexicano a tu ritmo.** |
| Frases de apoyo | "Pide sin fila." · "Tu desayuno, a tu hora." · "¡Lotería! Ya está tu pedido." |

Exploración de direcciones (se eligió C, Lotería): https://claude.ai/artifact/8sdxUrvWNYTEz3d4rGBmF9

## Logo

El logo es **la carta número 1**: marco negro doble, el número en su recuadro, el dibujo del jarro con el zarape y el título **EL ZARAPE** en Ultra, convertido a curvas.

| Archivo | Uso |
|---|---|
| `carta.svg` | Logo principal: la carta completa con título. Pantalla de inicio, encabezados grandes, documentos. |
| `jarro.svg` | Solo el dibujo (zarape y jarro), sin carta. Ilustración en estados vacíos y portadas. |
| `isotipo.svg` | La carta inclinada sobre un cuadro redondeado verde mesa, sin título. Ícono de la app y favicon. |
| `isotipo-maskable.svg` | Ícono PWA `purpose: maskable` (mesa a sangre, carta dentro de la zona segura). |
| `jarro-mono.svg` | Una tinta con `currentColor`: franjas alternas rellenas y jarro sólido. Tickets impresos y sellos. |

Los colores del logo son fijos: la carta siempre es papel, con o sin tema oscuro. Todas las variantes salen de una sola geometría: si cambia el dibujo o un color, edita `scripts/generar-logos.js` y corre `node branding/scripts/generar-logos.js branding/logos` (necesita `pnpm install`, porque toma la fuente Ultra de `packages/ui`).

Reglas:

- Tamaño mínimo: la carta completa a 96 px de alto (el título deja de leerse abajo de eso); el isotipo a 16 px.
- Aire alrededor: un cuarto del ancho de la carta por lado.
- La carta puede inclinarse hasta 6° cuando está "sobre la mesa" (ícono, pantalla de inicio). No se estira, no se delinea de otro color y no se le cambia el número.
- No cambiar el orden ni los colores de las franjas.
- No agregar sombrero, bigote, nopal ni cactus. El jarro, el zarape y la carta ya dicen "México".
- Pendiente: íconos PNG de la PWA generados desde `isotipo.svg` e `isotipo-maskable.svg`.

## Color

Los colores de una baraja de lotería: papel de carta, tinta negra, la mesa verde y los colores impresos de las cartas. Hay **dos temas**: **papel** (claro) y **mesa** (verde oscuro). Todo par texto/fondo listado cumple WCAG AA (4.5:1) en su tema.

**Colores fijos** (no cambian con el tema; se usan como relleno):

| Token | Valor | Uso |
|---|---|---|
| `mesa` | `#12402E` | Fondo del tema mesa, barra lateral de gestión, color de la barra del navegador. |
| `mesa-alta` | `#1A4D39` | Superficies sobre la mesa: menús, diálogos, filas alternas. |
| `mesa-linea` | `#2C5E49` | Divisores sobre la mesa. |
| `carta` | `#FFFBF0` | Papel de las cartas y fondo del tema papel. |
| `papel` | `#F3EBD7` | Fondo alterno claro: filas pares, secciones. |
| `tinta` | `#000000` | Texto en papel, marcos de las cartas. |
| `chile` | `#C8102E` | Acción principal en papel (Pagar, total, enlaces). Texto `carta` encima. |
| `maiz` | `#F2B705` | Acción principal en mesa, elemento seleccionado, "en cocina". Texto `tinta` encima, nunca texto amarillo sobre papel. |
| `jarra` | `#1F4FA0` | Información, "pagada", foco en papel. Texto `carta` encima. |
| `nopal` | `#1E7A46` | Éxito: "lista", pago aprobado. Texto `carta` encima. |
| `rosa` | `#E0457B` | Combos y "combo de la semana". Solo como relleno con texto `tinta`. |
| `barro` | `#B5562B` | Solo el jarro del logo. |

**Colores por tema** (en el código se usan estos; cambian solos con `data-theme`):

| Token | Papel | Mesa | Uso |
|---|---|---|---|
| `fondo` | `carta` | `mesa` | Fondo de página. |
| `fondo-alterno` | `papel` | `mesa-alta` | Secciones, filas pares. |
| `superficie` | `#FFFFFF` | `mesa-alta` | Diálogos, menús, tarjetas de shadcn. |
| `texto` | `tinta` | `carta` | Texto principal. |
| `texto-suave` | `#5C5546` | `#BFD3C6` | Texto secundario, ayudas, metadatos. |
| `linea` | `#D9CDB2` | `mesa-linea` | Divisores decorativos. |
| `borde-campo` | `#7A7262` | `#9DBBAA` | Borde de inputs y controles (3:1). |
| `accion` / `sobre-accion` | `chile` / `carta` | `maiz` / `tinta` | Botón primario y su texto. |
| `accion-hover` | `#A00D25` | `#FFC933` | Hover y presionado del primario. |
| `peligro` | `#A00D25` | `#FF9C8F` | Borrar, errores (siempre con confirmación e ícono). |
| `foco` | `jarra` | `maiz` | Anillo de foco. |
| `texto-exito` / `texto-info` / `texto-aviso` | `nopal` / `jarra` / `#8A6400` | `#7BD99A` / `#8DB3F2` / `maiz` | Mensajes de estado en texto. |

**Estados de comanda** (insignia rellena: color + texto + ícono, nunca solo color; igual en los dos temas):

| Estado | Relleno | Texto | Ícono |
|---|---|---|---|
| Pagada | `jarra` | `carta` | recibo |
| En cocina | `maiz` | `tinta` | flama |
| Lista | `nopal` | `carta` | campana |
| Entregada | `papel` | `tinta` | check |
| Cancelada / pago rechazado | `chile` | `carta` | x |

**Franjas del zarape** (de arriba abajo): chile, maíz, carta, jarra, carta, nopal, rosa, maíz, chile. Úsalas como detalle (logo, pantalla de carga, orilla del ticket), nunca como fondo de texto.

## Tipografía

| Rol | Familia | Por qué |
|---|---|---|
| Display | **Ultra** (un solo peso) | Slab gorda como la madera de imprenta de los carteles y las cartas de lotería. Títulos de carta, títulos de pantalla, precios grandes y números de turno. |
| Interfaz y texto | **Libre Franklin** (variable, 400–800) | Grotesca clásica americana, sobria al lado de Ultra; muy legible en tablas y tickets, con números tabulares. |

Ambas son libres (Google Fonts) y se **autoalojan** con `@fontsource/ultra` y `@fontsource-variable/libre-franklin` para que funcionen sin conexión (PWA). Ultra tiene un solo peso: nunca le pongas `font-bold` (el tema apaga el engrosado falso con `font-synthesis-weight: none`).

Escala:

| Estilo | Familia | Tamaño / interlínea | Peso | Uso |
|---|---|---|---|---|
| `turno` | Ultra | 120 / 120 | 400 | Número en pantalla de turnos. |
| `display-xl` | Ultra | 56 / 60 | 400 | Portada del kiosko. |
| `display-lg` | Ultra | 40 / 44 | 400 | Títulos de pantalla en kiosko. |
| `display-md` | Ultra | 28 / 32 | 400 | Títulos de sección, "Tu pedido". |
| `titulo-carta` | Ultra | 14 / 17, MAYÚSCULAS | 400 | Nombre del platillo al pie de su carta (como en la lotería). Es el único lugar con mayúsculas. |
| `cuerpo-lg` | Libre Franklin | 18 / 28 | 400 | Texto en kiosko. |
| `cuerpo` | Libre Franklin | 16 / 24 | 400 | Texto general. |
| `etiqueta` | Libre Franklin | 14 / 20 | 600 | Botones, etiquetas de campo, insignias. |
| `nota` | Libre Franklin | 12 / 16 | 500 | Metadatos, pie de ticket. |
| `precio` | Ultra en cartas y totales; Libre Franklin 600 con `tabular-nums` en tablas y ticket | — | — | Precios siempre con `$` y dos decimales en el ticket. |

## Voz y tono

Hablamos de **tú**, corto y amable, como quien te atiende en la barra. Mexicano natural, sin modismos forzados ni "¡Ándale, güey!". El juego de la lotería aparece en el momento que lo merece (tu pedido listo), no en cada botón.

| Momento | Sí | No |
|---|---|---|
| Saludo (RF16) | "Buenos días, Ana. ¿Lo de siempre?" | "Bienvenido estimado usuario." |
| Agregar | "Agregar" · "Agregado a tu pedido" | "Producto añadido exitosamente!!" |
| Pagar | "Pagar $145.00" | "Proceder al pago" |
| Error de login | "Usuario o contraseña incorrectos." | "Error 401: credenciales inválidas." |
| Pago rechazado | "No pudimos cobrar. Revisa los datos de la tarjeta e intenta otra vez." | "Transacción fallida." |
| En cocina | "Se está cocinando. Cuando esté listo te cantamos." | "Estatus: EN_COCINA." |
| Pedido listo | "¡Lotería! La 042 ya está lista. Pasa a recogerla." | "Estatus actualizado a: LISTO." |
| Sin conexión | "Sin internet. Puedes ver el menú, pero para pagar necesitas conexión." | "Offline." |
| Terminal | "Pago con terminal: próximamente" | Ocultar el botón. |
| Login de gestión | "Buenas noches." · "Ingresa tu usuario y contraseña." | "Intranet del restaurante: sucursales, menú y combos." · "Solo para la red interna." |
| Versión nueva | "Recién salido del comal" · "Hay una versión nueva lista para ti." | "Actualización disponible de la aplicación." |
| Instalar | "Tenla a la mano" · "Instálala y ábrela de un toque." | "Instala la aplicación web progresiva en tu dispositivo." |

**No expliques el sistema.** Nada de "intranet", "módulo", "red interna" ni listas de lo que hace la pantalla: el usuario ya sabe dónde está. El texto acompaña con la voz de la marca; las etiquetas de campos y botones sí son claras y directas, y en pantallas conocidas (login) se usan las frases de siempre.

Reglas: verbos al inicio en botones ("Ver pedido", "Agregar combo"); precios siempre con dos decimales y `$` en el ticket; solo un "¡!" por pantalla, y solo para buenas noticias.

## Fotografía

- Comida real, recién servida, con luz natural cálida (ventana, mañana).
- Encuadre cenital o a 45°, el platillo ocupa 60–70 % de la foto.
- Utilería mexicana sutil: barro, talavera, madera, una orilla de zarape. Sin banderitas ni sombreros.
- Colores naturales, sin saturar de más; sin texto encima de la foto.
- En las cartas la foto va dentro del marco, con borde `tinta` de 2 px: proporción 1:1. Portada 16:9.
- Archivos: WebP (respaldo JPG), máximo 1920×1080, menos de 200 KB en cartas. Siempre con `alt` que describa el platillo.

## Iconografía

[Phosphor Icons](https://phosphoricons.com) (`@phosphor-icons/react`), configurado como `iconLibrary` de shadcn. Color `texto` o el color del estado.

| Peso | Uso |
|---|---|
| `regular` | Gestión (intranet): navegación, botones, tablas. |
| `bold` | Kiosko, drive thru, cocina y turnos: combina con el trazo grueso de las cartas y se lee a distancia. |
| `fill` | Estado seleccionado o activo (pestaña actual, categoría elegida). El cambio a fill se anima con Motion. |

Tamaños: 20 px en texto, 24 px en botones, 32 px en kiosko. Íconos clave: `ForkKnifeIcon` (platillos), `CoffeeIcon` (bebidas), `PackageIcon` (combos), `CakeIcon` (postres), `ReceiptIcon` (ticket), `FireIcon` (en cocina), `BellRingingIcon` (lista), `QrCodeIcon`, `MapPinIcon` (sucursal), `CarIcon` (drive thru), `StorefrontIcon` (en sitio). Los íconos de estado de comanda (EstadoComanda) usan estos mismos.

## Forma y espacio

- Base de 4 px: `space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-6` 24 · `space-8` 32 · `space-12` 48.
- Esquinas: `radius-sm` 4 (insignias) · `radius-md` 6 (botones, campos) · `radius-carta` 8 (cartas, ticket) · `radius-pill` (pestañas de categoría).
- **Marco de carta**: borde `tinta` de 3 px (`--marco`) con un segundo marco interior de 2 px. Es la firma de la marca: cartas de producto, ticket, turno y QR. Las tablas y formularios de gestión no lo llevan.
- Sombra: en papel no hay sombras (se separa con marco o color de fondo). En mesa, las cartas proyectan `shadow-carta`, como cartas sobre la mesa.
- Áreas táctiles: `touch-min` 44 px (teléfono, intranet) · `touch-kiosko` 56 px (tableta del restaurante).

## Componentes: shadcn/ui con la marca

La UI se arma con **shadcn/ui** + **Tailwind CSS v4** en `packages/ui`. Los tokens por tema se conectan a las variables de shadcn, así todos los componentes salen con la identidad sin reescribirlos:

| Variable shadcn | Token de marca |
|---|---|
| `--background` / `--foreground` | `fondo` / `texto` |
| `--card`, `--popover` | `superficie` |
| `--primary` / `--primary-foreground` | `accion` / `sobre-accion` |
| `--secondary`, `--muted`, `--accent` | `fondo-alterno` |
| `--muted-foreground` | `texto-suave` |
| `--destructive` | `peligro` |
| `--border` | `linea` |
| `--input` | `borde-campo` |
| `--ring` | `foco` |
| `--chart-1` … `--chart-5` | `chile`, `jarra`, `maiz`, `nopal`, `rosa` |
| `--sidebar*` | Siempre mesa: fondo `mesa`, texto `carta`, activo `maiz` |
| `--radius` | `radius-md` (6 px) |

Temas: papel es el predeterminado. `data-theme="mesa"` en `<html>` pone el tema verde (kiosko, cocina, drive thru) y la variante `dark:` de Tailwind/shadcn. Dentro de una pantalla mesa, cada carta lleva `data-theme="papel"` para que sus campos y botones usen los estilos claros.

Utilidades de marca: `bg-mesa`, `bg-carta`, `border-tinta`, `bg-maiz`, `text-chile`, `text-exito`, `rounded-carta`, `shadow-carta`, `font-heading` (Ultra).

Se usan de shadcn: Button, Input, Form, Select, Dialog, Sheet, Drawer, Table, Tabs, Badge, Card, Sonner, Skeleton, Chart. Sus campos y botones ya traen la forma de Lotería (en `packages/ui`), así ninguna pantalla se ve "por defecto":

- **Campos** (Input, Textarea, InputGroup, Select): marco `tinta` de 2 px, fondo `carta` (también sobre la mesa, como una carta), 44 px de alto, foco con contorno de 3 px en `foco`.
- **Botones**: marco de 2 px. El principal es una ficha: marco `tinta` y relieve de 3 px que se hunde al presionar. Tamaños: `lg` 44 px (acciones principales), `default` 40 px, `icon-lg` 44 px.

Componentes propios de la marca encima:

- **Carta** (`LoteriaCard`, en `packages/ui`): el marco doble de lotería con número, dibujo y título; todo escala con el ancho de la carta. Base de los demás.
- **Frijol** (`Frijol`): el marcador de la lotería. Marca casillas llenas, brinca mientras algo carga y se riega en la mesa como detalle. Color `frijol` `#4A2414`, solo para él.
- **Orilla de zarape** (`ZarapeEdge`): las nueve franjas con onda, como tela colgada, con flecos hacia afuera y la orilla del panel siguiendo la curva. Se monta sola arriba o a la izquierda de un panel.
- **Casilla** (`BoardField` y `BoardFieldButton`): campo de 56 px para pantallas de marca como los logins. Marco `tinta` de 2 px, recuadro a la izquierda con el ícono (como el número de la carta) que se pone `maiz` al enfocar, y un frijol que lo marca cuando ya tiene algo. Para formularios normales, `Input` (44 px).
- **Abanico de cartas** (`CardFan`): la Concha, el Café y la carta 1 repartidas sobre la mesa; se inclina hacia el mouse. Tamaño con `--card-h`. Los dibujos están en `loteria-art.tsx` (`ConchaArt`, `CafeArt`).
- **Frijoles en la mesa** (`TableBeans`) y **cargando** (`FrijolLoader`): los frijoles caen después de repartir; mientras algo carga, brincan tres.
- **Botón `xl`**: la ficha grande (56 px, Ultra, relieve de 5 px) para la acción principal de una pantalla de marca.
- **TarjetaProducto**: carta con el precio en el recuadro del número, la foto al centro, el nombre en `titulo-carta` al pie y el botón "Agregar" (`maiz`) debajo.
- **Ticket**: hoja papel con marco; líneas, IVA y total en Ultra `chile`.
- **EstadoComanda**: insignia rellena de la tabla de estados.
- **Turnos**: la pantalla canta los números listos como cartas.
- **VisorQR**: el QR dentro de una carta "Tu pedido" con el número de turno en la esquina.

## Movimiento

El movimiento explica qué pasó, no decora. Se usa **Motion** (`motion/react`).

| Momento | Animación |
|---|---|
| Agregar producto | La carta se levanta un poco (4 px) y la línea entra al ticket con animación de layout. |
| Cambiar cantidad | El total cuenta hacia el nuevo valor (`NumberTicker` o spring de Motion). |
| Cambio de pantalla | Fundido + desplazamiento de 8–12 px con `AnimatePresence`. |
| Ticket en móvil | Drawer que sube desde abajo con resorte. |
| Pago aprobado | Check que se dibuja y aparece la carta con tu número de turno. |
| Pedido listo (turnos) | **El momento de la marca:** la carta del turno se voltea y entra grande con resorte: "¡Lotería!". Es la única animación llamativa del sistema. |
| Cocina: comanda nueva | La carta entra desde arriba y las demás se recorren (layout). |
| Carga | Skeletons con brillo suave, nunca spinners a pantalla completa. |

Reglas:

- Duración 150–300 ms (el volteo del turno hasta 500 ms); resortes suaves.
- Solo animar `transform` y `opacity` (cuida Lighthouse ≥ 90).
- `<MotionConfig reducedMotion="user">` en cada app: si el usuario pide menos movimiento, se quitan desplazamientos y volteos y se dejan fundidos.
- Nunca bloquear una acción esperando una animación.

## Por app

| App | Tema | Carácter |
|---|---|---|
| I. Gestión (intranet) | Papel, barra lateral mesa | Denso y ordenado: tablas, filtros, formularios; color solo para acciones y estados. Ultra solo en títulos. El elemento activo del menú va en `maiz` con texto `tinta`. El login es el momento de marca: en la mesa se reparten tres cartas (la Concha, El Zarape y el Café) y caen frijoles; el formulario va en papel con casillas de 56 px, botón de ficha (Ultra, relieve `tinta`) y saludo por hora. La orilla entre mesa y papel es un zarape con onda (`ZarapeEdge`): a la izquierda del formulario en pantalla grande, arriba de la hoja en el teléfono. |
| II. Kiosko en sitio | Mesa | Cartas grandes sobre la mesa: fotos protagonistas, botones de 56 px, ticket papel siempre visible a la derecha. |
| II. Cocina y turnos | Mesa | Alto contraste a distancia: columnas por estado, números de turno de 120 px en cartas, alerta con sonido + volteo de la carta. |
| III. Drive thru (móvil) | Mesa | Una mano: barra inferior con Perfil · Ordenar · Revisar pedido; el QR va en una carta grande con brillo al máximo. |

## Accesibilidad

- Contraste AA en todo par texto/fondo de esta guía (validado en los dos temas).
- Foco visible: anillo de 2 px `foco` (jarra en papel, maíz en mesa) con separación de 2 px.
- Estados con texto + ícono, no solo color.
- El avisador combina sonido y señal visual; respeta `prefers-reduced-motion`.
- Meta del proyecto: Lighthouse ≥ 90 en rendimiento y accesibilidad.

## Archivos

- `logos/`: carta, dibujo, isotipos y versión de una tinta (SVG).
- `scripts/generar-logos.js`: genera todos los logos desde una sola geometría.
- `tokens.css`: variables CSS de los dos temas, listas para importar en las apps.
- Exploración de direcciones: https://claude.ai/artifact/8sdxUrvWNYTEz3d4rGBmF9
