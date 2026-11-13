#!/usr/bin/env node
// Genera un único formato para fondos, botones e iconos opcionales.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const UI_DIR = path.join(ROOT, 'img', 'ui');
const manifest = { screens: {}, buttons: {}, icons: {} };
function entries(dir) { return fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name)) : []; }
function image(file) { return { src: path.relative(ROOT, file).split(path.sep).join('/') }; }
function config(dir) {
  const file = path.join(dir, 'layers.json');
  if (!fs.existsSync(file)) return {};
  try { const value = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  catch (err) { throw new Error(`${file}: JSON inválido: ${err.message}`); }
}
for (const folder of entries(path.join(UI_DIR, 'screens')).filter(e => e.isDirectory())) {
  const dir = path.join(UI_DIR, 'screens', folder.name), entry = {};
  for (const file of entries(dir).filter(e => e.isFile() && /^(base|overlay)\.png$/i.test(e.name))) entry[path.parse(file.name).name.toLowerCase()] = image(path.join(dir, file.name));
  if (Object.keys(entry).length) manifest.screens[folder.name] = { ...entry, config: config(dir) };
}
const buttonsDir = path.join(UI_DIR, 'buttons');
for (const item of entries(buttonsDir)) {
  const file = path.join(buttonsDir, item.name);
  if (item.isFile() && /\.png$/i.test(item.name)) manifest.buttons[path.parse(item.name).name] = { normal: image(file) };
  if (item.isDirectory()) {
    const states = {};
    for (const state of entries(file).filter(e => e.isFile() && /^(normal|hover|active|disabled)\.png$/i.test(e.name))) states[path.parse(state.name).name.toLowerCase()] = image(path.join(file, state.name));
    if (states.normal) manifest.buttons[item.name] = states;
  }
}
for (const file of entries(path.join(UI_DIR, 'icons')).filter(e => e.isFile() && /\.png$/i.test(e.name))) manifest.icons[path.parse(file.name).name.toLowerCase()] = image(path.join(UI_DIR, 'icons', file.name));
const output = '// AUTO-GENERADO por tools/build-ui.js\nconst UI_MANIFEST = ' + JSON.stringify(manifest, null, 2) + ';\nconst UI_SCREEN_LIST = UI_MANIFEST.screens;\n';
fs.writeFileSync(path.join(ROOT, 'js', 'ui-manifest.js'), output);
console.log(`UI: ${Object.keys(manifest.screens).length} fondos, ${Object.keys(manifest.buttons).length} botones, ${Object.keys(manifest.icons).length} iconos.`);
