#!/usr/bin/env node
// ============================================================
// tools/build-sprites.js
// Lee las carpetas de img/ y genera js/sprites-manifest.js con la lista de
// animaciones de cada unidad. Así no hay que mantener SPRITE_LIST a mano.
//
// Uso (desde la carpeta del proyecto):   node tools/build-sprites.js
//
// Estructura que espera:
//   img/cats/<id>/<animación>.png       ids: cat_0, cat_king, ...
//   img/enemies/<id>/<animación>.png    ids: enemy_0, event_<clave>, legend_<clave>
//   img/bosses/<id>/<animación>.png     ids: boss_0, eboss_<clave>, lboss_<clave>
// Animaciones válidas (en minúsculas): idle, walk, attack, knockback
// ============================================================
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'img');
const OUT = path.join(ROOT, 'js', 'sprites-manifest.js');

const ANIMS = ['idle', 'walk', 'attack', 'knockback'];
const TYPES = [                       // carpeta, prefijos de id permitidos, título
  { dir: 'cats',    prefixes: ['cat_'],                          title: 'gatos' },
  { dir: 'enemies', prefixes: ['enemy_', 'event_', 'legend_'],   title: 'enemigos' },
  { dir: 'bosses',  prefixes: ['boss_', 'eboss_', 'lboss_'],     title: 'jefes' },
];
const natural = (a, b) => a.localeCompare(b, 'en', { numeric: true });
const warnings = [];
const warn = msg => warnings.push(msg);

// Lee ancho y alto de un PNG sin dependencias (cabecera IHDR)
function pngSize(file) {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(24);
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  if (buf.toString('latin1', 1, 4) !== 'PNG') return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const sections = [];
let total = 0;

for (const type of TYPES) {
  const typeDir = path.join(IMG, type.dir);
  if (!fs.existsSync(typeDir)) continue;
  const lines = [];
  const ids = fs.readdirSync(typeDir, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name).sort(natural);

  for (const id of ids) {
    const where = `img/${type.dir}/${id}`;
    if (!type.prefixes.some(p => id.startsWith(p))) {
      warn(`${where}: el id no empieza con ${type.prefixes.join(' / ')}; el juego no la va a usar`);
      continue;
    }
    const found = {};
    for (const file of fs.readdirSync(path.join(typeDir, id))) {
      if (!file.toLowerCase().endsWith('.png')) continue;
      const base = file.slice(0, -4);
      if (ANIMS.includes(base)) found[base] = file;
      else if (ANIMS.includes(base.toLowerCase())) warn(`${where}/${file}: usa minúsculas (${base.toLowerCase()}.png) o no cargará en un servidor`);
      else warn(`${where}/${file}: nombre de animación desconocido (válidos: ${ANIMS.join(', ')}); se ignora`);
    }
    const names = ANIMS.filter(a => found[a]);
    if (!names.length) { warn(`${where}: no tiene ninguna animación válida`); continue; }

    // validar tiras: celdas cuadradas y mismo alto en todas las animaciones
    const heights = new Set();
    const info = names.map(a => {
      const s = pngSize(path.join(typeDir, id, found[a]));
      if (!s) { warn(`${where}/${found[a]}: no es un PNG válido`); return a; }
      heights.add(s.h);
      if (s.w < s.h || s.w % s.h !== 0) {
        warn(`${where}/${found[a]}: mide ${s.w}×${s.h}, el ancho debe ser múltiplo del alto; el juego la tratará como 1 frame`);
        return a;
      }
      return `${a}×${s.w / s.h}`;
    });
    if (heights.size > 1) warn(`${where}: las animaciones tienen alturas distintas (${[...heights].join(', ')}); el sprite saltará al cambiar`);

    lines.push(`  ${id}: [${names.map(n => `'${n}'`).join(', ')}],`);
    console.log(`  ${id.padEnd(20)} ${info.join('  ')}`);
    total++;
  }
  if (lines.length) sections.push(`  // --- ${type.title} ---\n${lines.join('\n')}`);
}

const out = `// ============================================================
// js/sprites-manifest.js — AUTO-GENERADO por tools/build-sprites.js
// No lo edites a mano: se sobrescribe cada vez que ejecutas el script.
// ============================================================
const SPRITE_LIST = {
${sections.join('\n')}
};
`;
fs.writeFileSync(OUT, out);
console.log(`\n${total} unidad(es) → ${path.relative(ROOT, OUT)}`);
if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} aviso(s):`);
  warnings.forEach(w => console.log('  - ' + w));
}