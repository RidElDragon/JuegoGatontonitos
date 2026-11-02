// ============================================================
// 00b-bg.js — v1: FONDOS DE BATALLA POR CAPAS ANIMADAS
// · Capas: sky / far / mid / ground / fg (todas opcionales).
// · Animación: scroll tileable (px/s), sprite sheet (frames+fps),
//   bob vertical y alpha, configurables en img/bg/<tema>/layers.json.
// · Fallback total: sin imagen → se pinta el código de 06-render-scene.
// · El generador (tools/build-bg) crea js/bg-manifest.js con BG_LIST.
// ============================================================
const BG_ORDER_BACK = ['sky', 'far', 'mid', 'ground'];
const BG_DEFAULTS = {
  sky:    { scroll: 6, anchor: 'top',     height: 220 },
  far:    { scroll: 2, anchor: 'horizon' },
  mid:    { scroll: 0, anchor: 'horizon' },
  ground: { scroll: 0, anchor: 'floor',  height: 105 },
  fg:     { scroll: 0, anchor: 'floor' },
};
let BG_CACHE = {};   // theme -> layer -> { img, conf, frames, cellW }
let BG_STARTED = false;

function bgList() { return (typeof BG_LIST !== 'undefined') ? BG_LIST : null; }

function startBgLoad() {
  if (BG_STARTED) return;
  BG_STARTED = true;
  const list = bgList();
  if (!list) return;
  
  for (const theme in list) {
    const folder = BG_THEME_MAP[theme] || theme;
    const entry = list[theme];
    const cacheKey = folder;
    BG_CACHE[cacheKey] = BG_CACHE[cacheKey] || {};
    
    for (const layer in entry) {
      if (layer === 'conf') continue;
      const src = entry[layer] && entry[layer].src;
      if (!src) continue;
      
      const conf = Object.assign({}, BG_DEFAULTS[layer] || {}, (entry.conf && entry.conf[layer]) || {});
      const img = new Image();
      const rec = { img: img, conf: conf, frames: conf.frames || 1, cellW: 0 };
      BG_CACHE[cacheKey][layer] = rec;
      
      img.onload = (function (r, e) {
        return function () {
          r.frames = r.conf.frames || 1;
          r.cellW = e.w ? (e.w / r.frames) : (img.width / r.frames);
        };
      })(rec, entry[layer]);
      
      img.src = src;
    }
  }
}
// Mapeo de theme del juego → ruta de carpeta
const BG_THEME_MAP = {
  // Historia
  'normal':   'historia/normal',
  'kingdom':  'historia/kingdom',
  'desert':   'historia/desert',
  // Eventos
  'halloween': 'eventos/halloween',
  'alien':     'eventos/alien',
  'infernal':  'eventos/infernal',
  'xmas':      'eventos/xmas',
  // Leyenda
  'ruins':     'leyenda/ruins',
  'volcano':   'leyenda/volcano',
  'sky':       'leyenda/sky',
  'abyss':     'leyenda/abyss',
  'clockwork': 'leyenda/clockwork',
  'void':      'leyenda/void',
  // Sandbox
  'test':      'test',
};

function bgRec(theme, layer) {
  const folder = BG_THEME_MAP[theme] || theme;
  const t = BG_CACHE[folder];   // se guarda como BG_CACHE[carpeta][capa]
  if (!t) return null;
  const r = t[layer];
  if (!r || !r.img || !r.img.complete || !r.img.naturalWidth) return null;
  if (!r.cellW) r.cellW = r.img.width / (r.frames || 1);
  return r;
}
function bgHas(theme, layer) { return !!bgRec(theme, layer); }

function paintBgLayer(r) {
  const img = r.img, conf = r.conf;
  const now = performance.now() / 1000;
  const frames = r.frames || 1;
  const cellW = r.cellW || img.width;
  const frame = frames > 1 ? (Math.floor(now * (conf.fps || 8)) % frames) : 0;
  const sx = frame * cellW;
  const dh = conf.height || img.height;
  const dw = cellW * (dh / img.height);
  let dy;
  const anchor = conf.anchor || 'horizon';
  if (anchor === 'top') dy = 0;
  else if (anchor === 'floor') dy = 320 - dh;
  else dy = 215 - dh;
  if (conf.bob) dy += Math.sin(now * (conf.bobSpeed || 1)) * conf.bob;
  const scroll = conf.scroll || 0;
  const off = scroll ? ((now * scroll) % dw + dw) % dw : 0;
  const prevAlpha = ctx.globalAlpha;
  if (conf.alpha !== undefined && conf.alpha !== 1) ctx.globalAlpha = conf.alpha;
  for (let x = -off; x < 900; x += dw) {
    ctx.drawImage(img, sx, 0, cellW, img.height, x, dy, dw, dh);
  }
  ctx.globalAlpha = prevAlpha;
}
function drawBgLayer(theme, layer) {
  const r = bgRec(theme, layer);
  if (!r) return false;
  paintBgLayer(r);
  return true;
}

window.bgHas = bgHas;
window.drawBgLayer = drawBgLayer;
if (document.readyState === 'complete') startBgLoad();
else window.addEventListener('load', startBgLoad);