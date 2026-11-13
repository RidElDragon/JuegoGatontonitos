// ============================================================
// 00c-ui-theme.js — v5: Fondos de menús + Botones nine-slice + Iconos
// ============================================================

const UI_SCREEN_MAP = {
  'titleScreen':   'title',
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
};

const UI_ANIM_CACHE = {};

async function loadLayerConfig(folder) {
  try {
    const response = await fetch(`img/ui/screens/${folder}/layers.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) { return null; }
}

function setupSpriteCanvas(el, src, frames, fps) {
  el.style.backgroundImage = 'none';
  el.classList.remove('ui-animated-bg');
  let canvas = el.querySelector('.ui-bg-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'ui-bg-canvas';
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    el.insertBefore(canvas, el.firstChild);
  }
  const ctx = canvas.getContext('2d');
  const img = new Image();
  let currentFrame = 0, lastTime = 0;
  img.onload = () => {
    const resize = () => { canvas.width = el.clientWidth; canvas.height = el.clientHeight; };
    resize();
    window.addEventListener('resize', resize);
    const cellW = img.width / frames, cellH = img.height;
    const animate = (ts) => {
      if (!lastTime) lastTime = ts;
      const delta = ts - lastTime;
      if (delta >= 1000 / fps) { currentFrame = (currentFrame + 1) % frames; lastTime = ts; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, currentFrame * cellW, 0, cellW, cellH, 0, 0, canvas.width, canvas.height);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };
  img.src = src;
}

function setupStaticBg(el, src) {
  const canvas = el.querySelector('.ui-bg-canvas');
  if (canvas) canvas.remove();
  el.style.backgroundImage = `url('${src}')`;
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  el.classList.remove('ui-animated-bg');
}

async function applyUITheme() {
  const manifest = (typeof UI_MANIFEST !== 'undefined') ? UI_MANIFEST : { screens: {}, buttons: {}, icons: {} };

  // 1. Fondos de pantallas
  for (const domId in UI_SCREEN_MAP) {
    const folder = UI_SCREEN_MAP[domId];
    const entry = manifest.screens[folder];
    const el = document.getElementById(domId);
    if (!el || !entry) continue;
    const config = await loadLayerConfig(folder);
    if (entry.base) {
      if (config && config.base && config.base.frames && config.base.frames > 1) {
        setupSpriteCanvas(el, entry.base.src, config.base.frames, config.base.fps || 8);
      } else {
        setupStaticBg(el, entry.base.src);
      }
    }
    if (entry.overlay) {
      let overlayEl = el.querySelector('.ui-screen-overlay');
      if (!overlayEl) {
        overlayEl = document.createElement('div');
        overlayEl.className = 'ui-screen-overlay';
        overlayEl.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;z-index:1;pointer-events:none;';
        el.appendChild(overlayEl);
      }
      overlayEl.style.backgroundImage = `url('${entry.overlay.src}')`;
      overlayEl.style.backgroundSize = 'cover';
      overlayEl.style.backgroundPosition = 'center';
    }
  }

  // 2. Botones nine-slice
  const buttons = manifest.buttons || {};
  for (const cssClass in BUTTON_CLASS_MAP) {
    const btnName = BUTTON_CLASS_MAP[cssClass];
    const btnData = buttons[btnName] || buttons['default'];
    if (!btnData) continue;
    const src = btnData.default || btnData.normal || btnData.src;
    if (!src) continue;
    // Aplicar border-image a todos los botones con esa clase
    document.querySelectorAll(`.${cssClass}`).forEach(btn => {
      btn.style.borderImage = `url('${src}') 8 round`;
      btn.style.border = '8px solid transparent';
    });
  }

  // Los iconos se gestionan en 00d-icons.js, incluida su precarga.
}

if (document.readyState === 'complete') applyUITheme();
else window.addEventListener('load', applyUITheme);
