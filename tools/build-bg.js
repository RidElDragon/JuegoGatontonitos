#!/usr/bin/env node
// ============================================================
// tools/build-bg.js — Genera js/bg-manifest.js leyendo img/bg/
// · Detecta automáticamente subcarpetas (historia/, eventos/, leyenda/)
//   o temas sueltos directamente en img/bg/.
// · Valida PNGs y dimensiones.
// · Uso: node tools/build-bg.js
// ============================================================
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BG = path.join(ROOT, 'img', 'bg');
const OUT = path.join(ROOT, 'js', 'bg-manifest.js');
const LAYERS = ['sky', 'far', 'mid', 'ground', 'fg'];

// Subcarpetas opcionales para organizar por modo
const SUBFOLDERS = ['historia', 'eventos', 'leyenda', 'test'];

function pngSize(file) {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(24);
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  if (buf.toString('latin1', 1, 4) !== 'PNG') return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const themes = {};
const warnings = [];

function scanDir(dir, relPrefix) {
  if (!fs.existsSync(dir)) return;
  for (const t of fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort()) {
    
    const themeDir = path.join(dir, t);
    const entry = {};
    const confFile = path.join(themeDir, 'layers.json');
    
    if (fs.existsSync(confFile)) {
      try { entry.conf = JSON.parse(fs.readFileSync(confFile, 'utf8')); }
      catch (e) { warnings.push(`${relPrefix}${t}/layers.json inválido: ${e.message}`); }
    }
    
    for (const f of fs.readdirSync(themeDir)) {
      if (!f.toLowerCase().endsWith('.png')) continue;
      const name = f.slice(0, -4).toLowerCase();
      if (!LAYERS.includes(name)) {
        warnings.push(`${relPrefix}${t}/${f}: capa desconocida (válidas: ${LAYERS.join(', ')}); se ignora`);
        continue;
      }
      const s = pngSize(path.join(themeDir, f));
      if (!s) { warnings.push(`${relPrefix}${t}/${f}: no es un PNG válido`); continue; }
      entry[name] = { src: `img/bg/${relPrefix}${t}/${f}`, w: s.w, h: s.h };
      console.log(`  ${(relPrefix + t + '/' + name).padEnd(30)} ${s.w}×${s.h}`);
    }
    
    if (Object.keys(entry).length > (entry.conf ? 1 : 0)) {
      themes[t] = entry;
    }
  }
}

// 1) Escanear subcarpetas organizadas (historia/, eventos/, leyenda/)
for (const sub of SUBFOLDERS) {
  scanDir(path.join(BG, sub), sub + '/');
}

// 2) Escanear temas sueltos directamente en img/bg/
scanDir(BG, '');

// Generar archivo
const out = `// ============================================================
// js/bg-manifest.js — AUTO-GENERADO por tools/build-bg (.js o .bat)
// No lo edites a mano: se sobrescribe cada vez que ejecutas el script.
// ============================================================
const BG_LIST = ${JSON.stringify(themes, null, 2)};
`;

fs.writeFileSync(OUT, out);
console.log(`\n${Object.keys(themes).length} tema(s) → js/bg-manifest.js`);

if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} aviso(s):`);
  warnings.forEach(w => console.log('  - ' + w));
}