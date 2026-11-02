#!/usr/bin/env node
// tools/build-ui.js — Genera js/ui-manifest.js leyendo img/ui/screens/ (capas PNG + layers.json)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const UI_DIR = path.join(ROOT, 'img', 'ui', 'screens');
const OUT = path.join(ROOT, 'js', 'ui-manifest.js');
const LAYERS = ['base', 'overlay'];

const screens = {};
const warnings = [];

if (fs.existsSync(UI_DIR)) {
  for (const t of fs.readdirSync(UI_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort()) {
    const dir = path.join(UI_DIR, t);
    const entry = {};
    for (const f of fs.readdirSync(dir)) {
      if (!f.toLowerCase().endsWith('.png')) continue;
      const name = f.slice(0, -4).toLowerCase();
      if (!LAYERS.includes(name)) {
        warnings.push(`img/ui/screens/${t}/${f}: capa desconocida (válidas: ${LAYERS.join(', ')}); se ignora`);
        continue;
      }
      const filePath = path.join(dir, f);
      const stats = fs.statSync(filePath);
      entry[name] = { src: `img/ui/screens/${t}/${f}`, size: (stats.size / 1024).toFixed(1) + ' KB' };
      console.log(`  ${(t + '/' + name).padEnd(20)} ${entry[name].size}`);
    }
    if (Object.keys(entry).length > 0) {
      // Incrusta layers.json (frames/fps) en el manifiesto: así no hace falta fetch y funciona con doble clic
      const cfgPath = path.join(dir, 'layers.json');
      if (fs.existsSync(cfgPath)) {
        try {
          entry.config = JSON.parse(fs.readFileSync(cfgPath, 'utf8').replace(/^\uFEFF/, ''));
          console.log(`  ${(t + '/layers.json').padEnd(20)} incrustado`);
        } catch (e) {
          warnings.push(`img/ui/screens/${t}/layers.json: JSON inválido (${e.message}); se ignora`);
        }
      }
      screens[t] = entry;
    }
  }
}

const out = `// ============================================================
// js/ui-manifest.js — AUTO-GENERADO por tools/build-ui (.js o .bat)
// No lo edites a mano.
// ============================================================
const UI_SCREEN_LIST = ${JSON.stringify(screens, null, 2)};
`;

fs.writeFileSync(OUT, out);
console.log(`\n${Object.keys(screens).length} pantalla(s) → js/ui-manifest.js`);
if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} aviso(s):`);
  warnings.forEach(w => console.log('  - ' + w));
}