// ============================================================
// 00c-ui-theme.js — v5: Fondos de menús + Botones nine-slice + Iconos
// ============================================================

const UI_SCREEN_MAP = {
  'titleScreen':   'title',
  'carouselScreen': 'carousel',
  'chapterScreen': 'chapters',
  'troopScreen': 'troops',
  'hubScreen':     'hub',
  'upgradeScreen': 'upgrades',
  'storyScreen':   'story',
  'eventScreen':   'event',
  'legendScreen':  'legend',
};

// Mapeo de clases CSS de botones → nombre de archivo en img/ui/buttons/
const BUTTON_CLASS_MAP = {
  'big-yellow':   'big-yellow',
  'save-btn':     'save-blue',
  'retreat-btn':  'retreat-cyan',
  'test-btn':     'test-purple',
  'cannon-btn':   'cannon-red',
  'back':         'back-gray',
  'menu-btn':     'menu-default',
  'set-btn':      'set-default',
  'story-btn':    'story-default',
  'event-btn':    'event-default',
  'gacha-btn':    'gacha-default',
  'icon-btn':     'icon-default',
  'hub-back':     'hub-back',
  'carousel-arrow': 'carousel-arrow',
  'mode-card': 'mode-card',
  'chapter-card': 'chapter-card',
  'close-x': 'close-x',
};

// No se altera el CSS hasta verificar que la imagen existe y se puede cargar.
const UI_IMAGE_CACHE = new Map();
const UI_ANIMATIONS = new Map();
function loadUIImage(src) {
  if (!src) return Promise.resolve(null);
  if (!UI_IMAGE_CACHE.has(src)) UI_IMAGE_CACHE.set(src, new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0 && img.naturalHeight > 0 ? img : null);
    img.onerror = () => resolve(null);
    img.src = src;
  }));
  return UI_IMAGE_CACHE.get(src);
}
function stopUIAnimation(el) {
  const state = UI_ANIMATIONS.get(el);
  if (!state) return;
  cancelAnimationFrame(state.raf);
  state.observer.disconnect();
  state.canvas.remove();
  UI_ANIMATIONS.delete(el);
}
function setupSpriteCanvas(el, img, frames, fps, overlay) {
  // Una animación por capa; la base y el overlay pueden animarse por separado.
  const key = overlay || el;
  stopUIAnimation(key);
  const canvas = document.createElement('canvas');
  canvas.className = 'ui-bg-canvas';
  if (overlay) overlay.appendChild(canvas); else el.insertBefore(canvas, el.firstChild);
  const ctx = canvas.getContext('2d');
  const state = { canvas, raf: 0, observer: null };
  let frame = 0, last = null;
  function draw() {
    const width = el.clientWidth, height = el.clientHeight;
    if (!width || !height || !el.getClientRects().length || document.hidden) return;
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    const cellWidth = img.naturalWidth / frames, cellHeight = img.naturalHeight;
    const scale = Math.max(width / cellWidth, height / cellHeight);
    const w = cellWidth * scale, h = cellHeight * scale;
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, frame * cellWidth, 0, cellWidth, cellHeight, (width-w)/2, (height-h)/2, w, h);
  }
  function tick(ts) {
    state.raf = 0;
    if (!el.isConnected || !el.getClientRects().length || document.hidden) { last = null; return; }
    if (last === null) last = ts;
    const steps = Math.floor((ts - last) / (1000 / fps));
    if (steps) { frame = (frame + steps) % frames; last += steps * 1000 / fps; draw(); }
    state.raf = requestAnimationFrame(tick);
  }
  function resume() {
    draw();
    if (!state.raf && el.getClientRects().length && !document.hidden) state.raf = requestAnimationFrame(tick);
  }
  state.resume = resume;
  state.observer = new ResizeObserver(resume);
  state.observer.observe(el);
  UI_ANIMATIONS.set(key, state);
  resume();
}
document.addEventListener('visibilitychange', () => {
  for (const state of UI_ANIMATIONS.values()) state.resume();
});
async function applyUITheme() {
  const manifest = typeof UI_MANIFEST !== 'undefined' ? UI_MANIFEST : { screens: {}, buttons: {} };
  await Promise.all(Object.entries(UI_SCREEN_MAP).map(async ([id, folder]) => {
    const el = document.getElementById(id), entry = (manifest.screens || {})[folder];
    if (!el || !entry) return;
    await Promise.all(['base', 'overlay'].map(async layer => {
      const img = await loadUIImage(entry[layer]?.src);
      if (!img) return;
      el.classList.add('ui-themed-screen');
      let target = el;
      if (layer === 'overlay') {
        target = el.querySelector('.ui-screen-overlay');
        if (!target) { target = document.createElement('div'); target.className = 'ui-screen-overlay'; el.appendChild(target); }
      }
      const config = entry.config?.[layer] || {};
      const frames = Number.isInteger(config.frames) && config.frames > 1 ? config.frames : 1;
      const fps = Number.isFinite(config.fps) && config.fps > 0 ? config.fps : 8;
      if (frames > 1 && img.naturalWidth % frames === 0) {
        setupSpriteCanvas(el, img, frames, fps, layer === 'overlay' ? target : null);
        target.style.backgroundImage = 'none';
      } else {
        stopUIAnimation(target);
        target.style.backgroundImage = `url("${img.src}")`;
        target.style.backgroundSize = 'cover';
        target.style.backgroundPosition = 'center';
      }
    }));
  }));
  // Reglas CSS: también alcanzan los botones creados después de cargar el tema.
  const rules = [];
  for (const [cssClass, name] of Object.entries(BUTTON_CLASS_MAP)) {
    const entry = (manifest.buttons || {})[name] || (manifest.buttons || {}).default;
    if (!entry) continue;
    const normal = await loadUIImage(entry.normal?.src || entry.src);
    if (!normal) continue;
    const selector = `button.${cssClass}`;
    rules.push(`${selector}{border:8px solid transparent!important;border-image:url(${JSON.stringify(normal.src)}) 8 fill stretch!important;background:transparent!important;}`);
    for (const state of ['hover', 'active', 'disabled']) {
      const img = await loadUIImage(entry[state]?.src);
      if (!img) continue;
      const suffix = state === 'disabled' ? ':disabled' : `:${state}:not(:disabled)`;
      rules.push(`${selector}${suffix}{border-image-source:url(${JSON.stringify(img.src)})!important;}`);
    }
  }
  let style = document.getElementById('ui-sprite-styles');
  if (rules.length || style) {
    if (!style) { style = document.createElement('style'); style.id = 'ui-sprite-styles'; document.head.appendChild(style); }
    style.textContent = rules.join('\n');
  }
}
if (document.readyState === 'complete') applyUITheme();
else window.addEventListener('load', applyUITheme);
