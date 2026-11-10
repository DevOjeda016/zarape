// Genera las variantes del isotipo "jarro envuelto en zarape" desde una sola geometría.
// Módulo ES: el package.json de la raíz declara "type": "module".
import fs from 'node:fs';
import path from 'node:path';

const out = process.argv[2];

const BODY = 'M34 36C38 40 40 44 40 48C30 54 26 64 28 76C30 90 38 98 46 100L70 100C78 98 86 90 88 76C90 64 86 54 76 48C76 44 78 40 82 36Z';
const stripe = (y, h) => `M16 ${y}Q58 ${y + 6} 100 ${y}V${y + h}Q58 ${y + h + 6} 16 ${y + h}Z`;
const STRIPES = [
  ['crema', 60, 2],
  ['rosa', 62, 5],
  ['cemp', 67, 4],
  ['tala', 71, 5],
  ['crema', 76, 2],
];
const fringeX = [];
for (let x = 34; x <= 82; x += 4) fringeX.push(x);
const sag = (x) => 3 * (1 - ((x - 58) / 42) ** 2);
const fringe = fringeX
  .map((x) => { const y = +(78 + sag(x)).toFixed(1); return `<line x1="${x}" y1="${(y + 0.8).toFixed(1)}" x2="${x}" y2="${(y + 5.5).toFixed(1)}"/>`; })
  .join('');
const STEAM = '<path d="M48 26c-4-4 4-7 0-12"/><path d="M58 24c-4-4 4-7 0-12"/><path d="M68 26c-4-4 4-7 0-12"/>';
// Los dos extremos del asa quedan dentro del cuerpo (contando el radio del trazo) para que no asomen.
const HANDLE = 'M75 51C99 44 103 72 82 78';

const style = (v, r) => `<style>
.${r} .zr-fondo{fill:var(--logo-fondo,${v.fondo})}
.${r} .zr-jarro{fill:var(--logo-jarro,${v.jarro})}
.${r} .zr-asa{fill:none;stroke:var(--logo-jarro,${v.jarro});stroke-width:7;stroke-linecap:round}
.${r} .zr-boca{fill:var(--logo-boca,${v.boca})}
.${r} .zr-vapor{fill:none;stroke:var(--logo-vapor,${v.vapor});stroke-width:3;stroke-linecap:round}
.${r} .zr-crema{fill:#FFF8EF}.${r} .zr-rosa{fill:#C2185B}.${r} .zr-cemp{fill:#F4A019}.${r} .zr-tala{fill:#1F5FA8}
.${r} .zr-fleco{stroke:#FFF8EF;stroke-width:1.6;stroke-linecap:round}
</style>`;

const art = (id) => `<g transform="translate(-3 4)">
<g class="zr-vapor">${STEAM}</g>
<path class="zr-asa" d="${HANDLE}"/>
<path class="zr-jarro" d="${BODY}"/>
<g clip-path="url(#${id})">${STRIPES.map(([c, y, h]) => `<path class="zr-${c}" d="${stripe(y, h)}"/>`).join('')}<g class="zr-fleco">${fringe}</g></g>
<ellipse class="zr-jarro" cx="58" cy="36" rx="25" ry="5"/>
<ellipse class="zr-boca" cx="58" cy="36" rx="20.5" ry="3.2"/>
</g>`;

const clip = (id) => `<clipPath id="${id}"><path d="${BODY}"/></clipPath>`;
const svg = (body, r = "") => `<svg xmlns="http://www.w3.org/2000/svg"${r ? ` class="${r}"` : ""} viewBox="0 0 120 120" role="img" aria-label="El Zarape">\n${body}\n</svg>\n`;

const CLARO = { fondo: '#FFF8EF', jarro: '#B4532A', boca: '#5E2A14', vapor: '#B3261E' };
const OSCURO = { fondo: '#2B1810', jarro: '#C8633A', boca: '#4A200E', vapor: '#F4A019' };

const files = {
  'jarro.svg': svg(`${style(CLARO, 'zr-l-jarro')}<defs>${clip('zr-c-jarro')}</defs>\n${art('zr-c-jarro')}`, 'zr-l-jarro'),
  'isotipo.svg': svg(`${style(CLARO, 'zr-l-iso')}<defs>${clip('zr-c-iso')}</defs>\n<rect class="zr-fondo" width="120" height="120" rx="28"/>\n${art('zr-c-iso')}`, 'zr-l-iso'),
  'isotipo-oscuro.svg': svg(`${style(OSCURO, 'zr-l-isoo')}<defs>${clip('zr-c-isoo')}</defs>\n<rect class="zr-fondo" width="120" height="120" rx="28"/>\n${art('zr-c-isoo')}`, 'zr-l-isoo'),
  'isotipo-maskable.svg': svg(`${style(CLARO, 'zr-l-mask')}<defs>${clip('zr-c-mask')}</defs>\n<rect class="zr-fondo" width="120" height="120"/>\n<g transform="translate(12 12) scale(0.8)">${art('zr-c-mask')}</g>`, 'zr-l-mask'),
};

// Una tinta: todo en currentColor; la franja, los flecos y la boca se recortan con una máscara.
const monoMask = `<mask id="zr-m-mono" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
<rect width="120" height="120" fill="#fff"/>
<path d="${stripe(60, 2)}" fill="#000"/><path d="${stripe(66.5, 1.5)}" fill="#000"/><path d="${stripe(71, 1.5)}" fill="#000"/><path d="${stripe(76, 2)}" fill="#000"/>
<g stroke="#000" stroke-width="1.6" stroke-linecap="round">${fringe}</g>
<ellipse cx="58" cy="36" rx="20.5" ry="3.2" fill="#000"/>
</mask>`;
// El asa se oculta dentro del cuerpo: si no, se asoma por los huecos de la franja y parece encimada.
const asaMask = `<mask id="zr-m-asa" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
<rect width="120" height="120" fill="#fff"/>
<path d="${BODY}" fill="#000"/>
</mask>`;
files['jarro-mono.svg'] = svg(`<defs>${monoMask}${asaMask}</defs>
<g transform="translate(-3 4)" fill="currentColor" stroke="currentColor">
<g fill="none" stroke-width="3" stroke-linecap="round">${STEAM}</g>
<path d="${HANDLE}" fill="none" stroke-width="7" stroke-linecap="round" mask="url(#zr-m-asa)"/>
<g mask="url(#zr-m-mono)" stroke="none"><path d="${BODY}"/><ellipse cx="58" cy="36" rx="25" ry="5"/></g>
</g>`);

for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(out, name), text);
console.log(Object.keys(files).join('\n'));
