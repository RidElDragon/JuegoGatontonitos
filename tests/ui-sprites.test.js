const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = name => fs.readFileSync(path.join(root, name), 'utf8');
function runtime(manifest, broken = []) {
  const nodes = new Map(), queued = new Map(), observers = [];
  let sequence = 0, draws = 0;
  function element() {
    const e = { style: {}, children: [], clientWidth: 900, clientHeight: 400, isConnected: true,
      classList: { add() {} }, appendChild(c) { this.children.push(c); if (c.id) nodes.set(c.id, c); },
      insertBefore(c) { this.children.unshift(c); }, remove() { this.isConnected = false; },
      querySelector(selector) { return this.children.find(c => '.' + c.className === selector) || null; },
      getClientRects() { return this.clientWidth ? [{}] : []; },
      getContext() { return { clearRect() {}, drawImage() { draws++; } }; }
    }; return e;
  }
  nodes.set('titleScreen', element());
  const c = { document: { readyState: 'loading', hidden: false, addEventListener() {}, getElementById: id => nodes.get(id), createElement: element, head: { appendChild(c) { nodes.set(c.id, c); } } },
    Image: class { naturalWidth = 128; naturalHeight = 32; set src(value) { this.value = value; queueMicrotask(() => broken.includes(value) ? this.onerror() : this.onload()); } get src() { return this.value; } },
    ResizeObserver: class { constructor(fn) { this.fn = fn; observers.push(this); } observe() {} disconnect() { this.disconnected = true; } },
    requestAnimationFrame(fn) { queued.set(++sequence, fn); return sequence; }, cancelAnimationFrame(id) { queued.delete(id); }, addEventListener() {}, console };
  c.window = c;
  vm.createContext(c); vm.runInContext('const UI_MANIFEST=' + JSON.stringify(manifest), c);
  vm.runInContext(source('js/00c-ui-theme.js'), c);
  return { c, nodes, observers, queued, draws: () => draws, tick(ts) { const pending = [...queued.values()]; queued.clear(); pending.forEach(fn => fn(ts)); } };
}
test('sin sprites o con imágenes rotas conserva el CSS', async () => {
  for (const manifest of [{}, { screens: { title: { base: { src: 'bad.png' } } }, buttons: { default: { normal: { src: 'bad.png' } } } }]) {
    const r = runtime(manifest, ['bad.png']); await r.c.applyUITheme();
    assert.deepEqual(r.nodes.get('titleScreen').style, {}); assert.equal(r.nodes.has('ui-sprite-styles'), false);
  }
});
test('botones usan reglas para elementos dinámicos y sus estados', async () => {
  const r = runtime({ buttons: { 'big-yellow': { normal: { src: 'normal.png' }, hover: { src: 'hover.png' }, active: { src: 'active.png' }, disabled: { src: 'disabled.png' } } } });
  await r.c.applyUITheme(); const css = r.nodes.get('ui-sprite-styles').textContent;
  assert.match(css, /8 fill stretch/); assert.match(css, /:hover:not\(:disabled\)/); assert.match(css, /:active:not\(:disabled\)/); assert.match(css, /:disabled\{border-image-source/);
});
test('animación oculta se pausa, se reajusta y no duplica bucles', async () => {
  const r = runtime({ screens: { title: { base: { src: 'sheet.png' }, config: { base: { frames: 4, fps: 6 } } } } });
  const screen = r.nodes.get('titleScreen'); screen.clientWidth = 0;
  await r.c.applyUITheme(); assert.equal(r.queued.size, 0);
  screen.clientWidth = 900; r.observers[0].fn(); assert.equal(r.queued.size, 1); assert.ok(r.draws() > 0);
  screen.clientWidth = 0; r.tick(200); assert.equal(r.queued.size, 0);
  screen.clientWidth = 500; r.observers[0].fn(); assert.equal(screen.children[0].width, 500);
  await r.c.applyUITheme(); assert.equal(r.observers[0].disconnected, true); assert.equal(r.queued.size, 1);
});
test('generador incluye configuración local, PNG simples y estados', () => {
  const files = new Map([
    ['img/ui/screens/title/base.png', 'PNG'], ['img/ui/screens/title/layers.json', '{"base":{"frames":4,"fps":6}}'],
    ['img/ui/buttons/big-yellow.png', 'PNG'], ['img/ui/buttons/save-blue/normal.png', 'PNG'], ['img/ui/buttons/save-blue/hover.png', 'PNG'], ['img/ui/icons/coin.png', 'PNG']
  ].map(([p,v]) => [path.join(root,p),v]));
  let output;
  const mock = { existsSync: p => files.has(p) || [...files.keys()].some(f => f.startsWith(p + path.sep)), readFileSync: p => files.get(p), writeFileSync: (p,v) => output=v,
    readdirSync(p) { const names = new Set([...files.keys()].filter(f => f.startsWith(p+path.sep)).map(f => path.relative(p,f).split(path.sep)[0])); return [...names].map(name => ({ name, isFile: () => files.has(path.join(p,name)), isDirectory: () => !files.has(path.join(p,name)) })); } };
  vm.runInNewContext(source('tools/build-ui.js'), { require: n => n === 'fs' ? mock : path, __dirname: path.join(root,'tools'), console: { log() {} } });
  const m = vm.runInNewContext(output + '; UI_MANIFEST');
  assert.equal(m.screens.title.config.base.frames, 4); assert.equal(m.buttons['big-yellow'].normal.src, 'img/ui/buttons/big-yellow.png');
  assert.equal(m.buttons['save-blue'].hover.src, 'img/ui/buttons/save-blue/hover.png'); assert.ok(m.icons.coin);
});
