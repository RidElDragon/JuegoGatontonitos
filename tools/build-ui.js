#!/usr/bin/env node
// tools/build-ui.js — Genera js/ui-manifest.js leyendo img/ui/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const UI_DIR = path.join(ROOT, 'img', 'ui');
const OUT = path.join(ROOT, 'js', 'ui-manifest.js');
const SCREEN_LAYERS = ['base', 'overlay'];
const BUTTON_LAYERS = ['normal', 'hover', 'active']; // opcional: estados

const manifest = { screens: {}, buttons: {}, icons: {} };
const warnings = [];

function scanFolder(relPath, layers) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return {};
  const result = {};
  for (const f of fs.readdirSync(full)) {
    if (!f.toLowerCase().endsWith('.png')) continue;
    const name = f.slice(0, -4).toLowerCase();
    if (!layers.includes(name)) {
      warnings.push(`${relPath}/${f}: capa desconocida; se ignora`);
      continue;
    }
    const filePath = path.join(full, f);
    const stats = fs.statSync(filePath);
    result[name] = { src: `${relPath}/${f}`, size: (stats.size / 1024).toFixed(1) + ' KB' };
  }
  return result;
}

// 1. Screens
const screensDir = path.join(UI_DIR, 'screens');
if (fs.existsSync(screensDir)) {
  for (const t of fs.readdirSync(screensDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort()) {
    const entry = {};
    for (const layer of SCREEN_LAYERS) {
      const file = path.join(screensDir, t, layer + '.png');
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        entry[layer] = { src: `img/ui/screens/${t}/${layer}.png`, size: (stats.size / 1024).toFixed(1) + ' KB' };
      }
    }
    if (Object.keys(entry).length > 0) manifest.screens[t] = entry;
  }
}

// 2. Buttons
manifest.buttons = scanFolder('img/ui/buttons', [...BUTTON_LAYERS, 'default']);

// 3. Icons
const iconsDir = path.join(UI_DIR, 'icons');
if (fs.existsSync(iconsDir)) {
  for (const f of fs.readdirSync(iconsDir)) {
    if (!f.toLowerCase().endsWith('.png')) continue;
    const name = f.slice(0, -4).toLowerCase();
    const filePath = path.join(iconsDir, f);
    const stats = fs.statSync(filePath);
    manifest.icons[name] = { src: `img/ui/icons/${f}`, size: (stats.size / 1024).toFixed(1) + ' KB' };
  }
}

const out = `// ============================================================
// js/ui-manifest.js — AUTO-GENERADO por tools/build-ui
// ============================================================
const UI_MANIFEST = ${JSON.stringify(manifest, null, 2)};
// Backwards compatibility
const UI_SCREEN_LIST = UI_MANIFEST.screens;
`;

fs.writeFileSync(OUT, out);
console.log(`\n✅ ui-manifest.js generado:`);
console.log(`   ${Object.keys(manifest.screens).length} pantalla(s)`);
console.log(`   ${Object.keys(manifest.buttons).length} botón(es)`);
console.log(`   ${Object.keys(manifest.icons).length} icono(s)`);
if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} aviso(s):`);
  warnings.forEach(w => console.log('  - ' + w));
}