// ============================================================
// 00c-ui-theme.js — v5: Canvas para sprite sheets de menús
// · La config de capas (frames/fps) viene incrustada en ui-manifest.js
//   (entry.config), así funciona también abriendo index.html con doble clic.
//   Si no está, se intenta leer img/ui/screens/<pantalla>/layers.json (solo con servidor).
// · Un único bucle de animación para todos los fondos; las pantallas ocultas
//   no se dibujan y el canvas se redimensiona solo cuando la pantalla es visible.
// ============================================================

const UI_SCREEN_MAP = {
  'titleScreen':   'title',
  'hubScreen':     'hub',
  'upgradeScreen': 'upgrades',
  'storyScreen':   'story',
  'eventScreen':   'event',
  'legendScreen':  'legend',
};

const UI_ANIMS = new Map();   // canvas -> { el, img, frames, fps, ready }
let UI_LOOP_STARTED = false;

async function loadLayerConfig(folder) {
  try {
    const response = await fetch(`img/ui/screens/${folder}/layers.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    return null;
  }
}

function uiLoop(ts) {
  UI_ANIMS.forEach((a, canvas) => {
    if (!a.ready) return;
    const w = a.el.clientWidth, h = a.el.clientHeight;
    if (!w || !h) return;                       // pantalla oculta: no se dibuja
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const frame = Math.floor((ts / 1000) * a.fps) % a.frames;
    const cellW = a.img.width / a.frames;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(a.img, frame * cellW, 0, cellW, a.img.height, 0, 0, w, h);
  });
  requestAnimationFrame(uiLoop);
}

function setupSpriteCanvas(el, src, frames, fps) {
  // Crear o reutilizar canvas
  let canvas = el.querySelector(':scope > .ui-bg-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'ui-bg-canvas';
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    el.insertBefore(canvas, el.firstChild);
  }

  const rec = { el: el, img: new Image(), frames: Math.max(1, frames | 0), fps: fps || 8, ready: false };
  UI_ANIMS.set(canvas, rec);

  rec.img.onload = () => {
    // Solo ahora se quita el fondo previo: si la imagen falla, se conserva el degradado
    el.style.backgroundImage = 'none';
    el.classList.remove('ui-animated-bg');
    rec.ready = true;
  };
  rec.img.src = src;

  if (!UI_LOOP_STARTED) {
    UI_LOOP_STARTED = true;
    requestAnimationFrame(uiLoop);
  }
}

function setupStaticBg(el, src) {
  // Eliminar canvas si existe
  const canvas = el.querySelector(':scope > .ui-bg-canvas');
  if (canvas) { UI_ANIMS.delete(canvas); canvas.remove(); }

  // Aplicar imagen estática SIN animación
  el.style.backgroundImage = `url('${src}')`;
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  el.classList.remove('ui-animated-bg');
}

async function applyUITheme() {
  const list = (typeof UI_SCREEN_LIST !== 'undefined') ? UI_SCREEN_LIST : {};

  for (const domId in UI_SCREEN_MAP) {
    const folder = UI_SCREEN_MAP[domId];
    const entry = list[folder];
    const el = document.getElementById(domId);
    if (!el || !entry) continue;

    // Config incrustada en el manifiesto; si no hay, se intenta leer layers.json
    const config = entry.config || await loadLayerConfig(folder);

    // Capa BASE
    if (entry.base) {
      if (config && config.base && config.base.frames && config.base.frames > 1) {
        setupSpriteCanvas(el, entry.base.src, config.base.frames, config.base.fps || 8);
      } else {
        setupStaticBg(el, entry.base.src);
      }
    }

    // Capa OVERLAY
    if (entry.overlay) {
      let overlayEl = el.querySelector(':scope > .ui-screen-overlay');
      if (!overlayEl) {
        overlayEl = document.createElement('div');
        overlayEl.className = 'ui-screen-overlay';
        overlayEl.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;z-index:1;pointer-events:none;';
        el.appendChild(overlayEl);
      }

      if (config && config.overlay && config.overlay.frames && config.overlay.frames > 1) {
        setupSpriteCanvas(overlayEl, entry.overlay.src, config.overlay.frames, config.overlay.fps || 8);
      } else {
        overlayEl.style.backgroundImage = `url('${entry.overlay.src}')`;
        overlayEl.style.backgroundSize = 'cover';
        overlayEl.style.backgroundPosition = 'center';
      }
    }
  }
}

if (document.readyState === 'complete') applyUITheme();
else window.addEventListener('load', applyUITheme);
