// Genera los logos de El Zarape (dirección "Lotería") desde una sola geometría.
// Uso: node branding/scripts/generar-logos.js branding/logos
// El título de la carta se convierte a curvas con la fuente Ultra de packages/ui
// (corre `pnpm install` antes), así los SVG se ven igual como <img>, favicon o ícono PWA.
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import opentype from 'opentype.js';

const out = process.argv[2];
if (!out) throw new Error('Falta la carpeta de salida: node branding/scripts/generar-logos.js branding/logos');

const FUENTE = 'packages/ui/node_modules/@fontsource/ultra/files/ultra-latin-400-normal.woff';
if (!fs.existsSync(FUENTE)) throw new Error(`No se encontró ${FUENTE}. Corre pnpm install en la raíz.`);
const ultra = opentype.parse(new Uint8Array(fs.readFileSync(FUENTE)).buffer);

// Colores fijos de la marca (branding/tokens.css). No cambian con el tema.
const C = {
  mesa: '#12402E',
  carta: '#FFFBF0',
  tinta: '#000000',
  chile: '#C8102E',
  maiz: '#F2B705',
  jarra: '#1F4FA0',
  nopal: '#1E7A46',
  rosa: '#E0457B',
  barro: '#B5562B',
  boca: '#5E2A14',
};

// --- Dibujo: zarape colgado de una vara y un jarro de barro al frente (caja de 220 × 220) ---
const ZARAPE = 'M28 30H192V160Q150 172 110 160Q70 148 28 162Z';
const JARRO = 'M78 130Q70 122 82 118H138Q150 122 142 130Q168 152 156 186Q148 206 110 206Q72 206 64 186Q52 152 78 130Z';
const ASA = 'M152 142Q182 140 174 168Q168 182 152 178';
// Franjas de arriba abajo: [color, y, alto]. El orden es la firma de la marca: no se cambia.
const FRANJAS = [
  ['chile', 30, 18], ['maiz', 48, 14], ['carta', 62, 8], ['jarra', 70, 16], ['carta', 86, 8],
  ['nopal', 94, 14], ['rosa', 108, 16], ['maiz', 124, 14], ['chile', 138, 40],
];
// Flecos: siguen la orilla de abajo del zarape; los del centro quedan detrás del jarro.
const orilla = (x) => (x <= 110 ? (t => (1 - t) ** 2 * 162 + 2 * (1 - t) * t * 148 + t * t * 160)((x - 28) / 82) : (t => (1 - t) ** 2 * 160 + 2 * (1 - t) * t * 172 + t * t * 160)((x - 110) / 82));
const FLECOS = [34, 46, 58, 70, 150, 162, 174, 186].map((x) => `M${x} ${orilla(x).toFixed(1)}v12`).join('');

function dibujo(id, k = 1) {
  // k engruesa los trazos para tamaños chicos (ícono)
  const w = (n) => +(n * k).toFixed(2);
  return `<defs><clipPath id="${id}"><path d="${ZARAPE}"/></clipPath></defs>
<g clip-path="url(#${id})">${FRANJAS.map(([c, y, h]) => `<rect x="20" y="${y}" width="180" height="${h}" fill="${C[c]}"/>`).join('')}</g>
<path d="${ZARAPE}" fill="none" stroke="${C.tinta}" stroke-width="${w(4)}" stroke-linejoin="round"/>
<path d="${FLECOS}" stroke="${C.tinta}" stroke-width="${w(3)}" stroke-linecap="round"/>
<path d="M18 30H202" stroke="${C.tinta}" stroke-width="${w(7)}" stroke-linecap="round"/>
<path d="${ASA}" fill="none" stroke="${C.tinta}" stroke-width="${w(12)}" stroke-linecap="round"/>
<path d="${ASA}" fill="none" stroke="${C.barro}" stroke-width="${w(5)}" stroke-linecap="round"/>
<path d="${JARRO}" fill="${C.barro}" stroke="${C.tinta}" stroke-width="${w(4)}" stroke-linejoin="round"/>
<path d="M66 164Q110 178 154 164" fill="none" stroke="${C.carta}" stroke-width="${w(4)}"/>
<circle cx="88" cy="184" r="${w(3)}" fill="${C.carta}"/><circle cx="110" cy="188" r="${w(3)}" fill="${C.carta}"/><circle cx="132" cy="184" r="${w(3)}" fill="${C.carta}"/>
<ellipse cx="110" cy="122" rx="30" ry="7" fill="${C.boca}" stroke="${C.tinta}" stroke-width="${w(3.5)}"/>`;
}

// Texto de Ultra convertido a curvas, centrado en cx y ajustado a un ancho máximo.
function texto(t, cx, base, size, maxW) {
  const s = Math.min(size, (size * maxW) / ultra.getAdvanceWidth(t, size));
  const x = cx - ultra.getAdvanceWidth(t, s) / 2;
  return `<path d="${ultra.getPath(t, x, base, s).toPathData(2)}" fill="${C.tinta}"/>`;
}

const svg = (vb, body, label = 'El Zarape') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${label}">\n${body}\n</svg>\n`;

// --- Carta completa: el logo principal (número 1, dibujo y título) ---
const carta = svg('0 0 260 400', `<rect x="2" y="2" width="256" height="396" rx="8" fill="${C.carta}" stroke="${C.tinta}" stroke-width="4"/>
<rect x="14" y="14" width="232" height="372" rx="3" fill="none" stroke="${C.tinta}" stroke-width="3"/>
<rect x="22" y="22" width="34" height="38" fill="none" stroke="${C.tinta}" stroke-width="2.5"/>
${texto('1', 39, 51, 28, 24)}
<g transform="translate(3.5 45.5) scale(1.15)">${dibujo('zr-carta')}</g>
${texto('EL ZARAPE', 130, 356, 40, 204)}`);

// --- Ícono: la carta inclinada sobre la mesa verde (sin título: a tamaño de ícono no se lee) ---
const cartaIcono = (id) => `<g transform="rotate(-6)">
<rect x="-36" y="-50" width="72" height="100" rx="3" fill="${C.carta}" stroke="${C.tinta}" stroke-width="3"/>
<rect x="-31" y="-45" width="62" height="90" fill="none" stroke="${C.tinta}" stroke-width="1.8"/>
<g transform="translate(-34.7 -38) scale(0.315)">${dibujo(id, 1.6)}</g>
</g>`;

const files = {
  'carta.svg': carta,
  'jarro.svg': svg('0 0 220 220', dibujo('zr-jarro')),
  'isotipo.svg': svg('0 0 120 120', `<rect width="120" height="120" rx="26" fill="${C.mesa}"/>\n<g transform="translate(60 60)">${cartaIcono('zr-iso')}</g>`),
  // Maskable: fondo a sangre y la carta dentro de la zona segura (círculo del 80 %)
  'isotipo-maskable.svg': svg('0 0 120 120', `<rect width="120" height="120" fill="${C.mesa}"/>\n<g transform="translate(60 60) scale(0.76)">${cartaIcono('zr-mask')}</g>`),
};

// --- Una tinta (currentColor): tickets impresos y sellos. Franjas alternas rellenas, jarro sólido. ---
const MONO_LLENAS = FRANJAS.filter((_, i) => i % 2 === 0);
files['jarro-mono.svg'] = svg('0 0 220 220', `<defs><clipPath id="zr-mono"><path d="${ZARAPE}"/></clipPath>
<mask id="zr-mono-jarro" maskUnits="userSpaceOnUse" x="0" y="0" width="220" height="220">
<rect width="220" height="220" fill="#fff"/>
<path d="M66 164Q110 178 154 164" fill="none" stroke="#000" stroke-width="4"/>
<circle cx="88" cy="184" r="3" fill="#000"/><circle cx="110" cy="188" r="3" fill="#000"/><circle cx="132" cy="184" r="3" fill="#000"/>
<ellipse cx="110" cy="122" rx="24" ry="3.5" fill="#000"/>
</mask>
<mask id="zr-mono-hueco" maskUnits="userSpaceOnUse" x="0" y="0" width="220" height="220">
<rect width="220" height="220" fill="#fff"/>
<path d="${JARRO}" stroke="#000" stroke-width="12" stroke-linejoin="round"/>
<ellipse cx="110" cy="122" rx="32" ry="9" stroke="#000" stroke-width="12"/>
<path d="${ASA}" fill="none" stroke="#000" stroke-width="22" stroke-linecap="round"/>
</mask></defs>
<g fill="currentColor" stroke="currentColor">
<g mask="url(#zr-mono-hueco)">
<g clip-path="url(#zr-mono)" stroke="none">${MONO_LLENAS.map(([, y, h]) => `<rect x="20" y="${y}" width="180" height="${h}"/>`).join('')}</g>
<path d="${ZARAPE}" fill="none" stroke-width="4" stroke-linejoin="round"/>
<path d="${FLECOS}" stroke-width="3" stroke-linecap="round"/>
</g>
<path d="M18 30H202" stroke-width="7" stroke-linecap="round"/>
<path d="${ASA}" fill="none" stroke-width="10" stroke-linecap="round"/>
<g mask="url(#zr-mono-jarro)" stroke="none"><path d="${JARRO}"/><ellipse cx="110" cy="122" rx="32" ry="9"/></g>
</g>`);

fs.mkdirSync(out, { recursive: true });
for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(out, name), text);

// --- Íconos PNG de la PWA: Chrome los pide para instalar y iOS solo acepta PNG (apple-touch-icon) ---
const PNG = [
  ['icon-192.png', 'isotipo.svg', 192],
  ['icon-512.png', 'isotipo.svg', 512],
  ['icon-maskable-192.png', 'isotipo-maskable.svg', 192],
  ['icon-maskable-512.png', 'isotipo-maskable.svg', 512],
  // iOS redondea las esquinas por su cuenta: usa la versión a sangre, sin transparencia
  ['apple-touch-icon.png', 'isotipo-maskable.svg', 180],
];
for (const [name, from, size] of PNG) {
  const png = new Resvg(files[from], { fitTo: { mode: 'width', value: size } }).render().asPng();
  fs.writeFileSync(path.join(out, name), png);
}

console.log([...Object.keys(files), ...PNG.map(([name]) => name)].join('\n'));
