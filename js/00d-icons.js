// ============================================================
// 00d-icons.js — v1.1: Sistema de iconos con precarga (Expandido)
// ============================================================

const ICON_EMOJI_MAP = {
  '💰': 'coin', '❤️': 'heart', '🌊': 'wave', '💣': 'cannon',
  '💀': 'skull', '🐱': 'cat', '👹': 'enemy', '👑': 'crown',
  '💾': 'save', '📂': 'load', '🗑️': 'trash', '🏠': 'home',
  '🔄': 'refresh', '📖': 'book', '🎲': 'dice', '📜': 'scroll',
  '⚡': 'speed', '📡': 'radar', '🤖': 'cpu', '📚': 'sabelotodo',
  '🎯': 'sniper', '🎃': 'pumpkin', '🛸': 'alien', '🎄': 'xmas',
  '⬆️': 'up', '⬅': 'left', '➡': 'right', '✖': 'close',
  '🔙': 'retreat', '🔍': 'eye', '🧹': 'broom', '🧪': 'test',
  '🏆': 'trophy', '💎': 'gem', '🥉': 'bronze', '🥈': 'silver',
  '🥇': 'gold', '🐾': 'paw', '⭐': 'star', '🔥': 'fire',
  '😈': 'demon', '🎅': 'santa', '💼': 'wallet', '📈': 'chart',
  // Nuevos para UI dinámica:
  '🔒': 'lock', '✅': 'check', '➕': 'add', '✨': 'sparkle',
  '🏰': 'castle', '🌟': 'star2', '▶': 'play'
};

const ICON_CACHE = {};
let ICONS_LOADED = false;
let ICONS_LOAD_PROMISE = null;

function loadIcons() {
  if (ICONS_LOADED || ICONS_LOAD_PROMISE) return ICONS_LOAD_PROMISE;
  
  const manifest = (typeof UI_MANIFEST !== 'undefined') ? UI_MANIFEST : { icons: {} };
  const icons = manifest.icons || {};
  
  ICONS_LOAD_PROMISE = new Promise((resolve) => {
    const keys = Object.keys(icons);
    if (keys.length === 0) { ICONS_LOADED = true; resolve(); return; }
    
    let loaded = 0;
    keys.forEach(name => {
      const img = new Image();
      img.onload = () => { ICON_CACHE[name] = img; loaded++; if (loaded === keys.length) { ICONS_LOADED = true; resolve(); } };
      img.onerror = () => { loaded++; if (loaded === keys.length) { ICONS_LOADED = true; resolve(); } };
      img.src = icons[name].src;
    });
  });
  return ICONS_LOAD_PROMISE;
}

function getIcon(emoji, size) {
  size = size || 20;
  const iconName = ICON_EMOJI_MAP[emoji];
  if (iconName && ICON_CACHE[iconName]) {
    return `<img src="${ICON_CACHE[iconName].src}" style="width:${size}px;height:${size}px;vertical-align:middle;" alt="${emoji}" class="ui-icon">`;
  }
  return emoji; // Fallback seguro
}

function drawIcon(ctx, emoji, x, y, size) {
  size = size || 20;
  const iconName = ICON_EMOJI_MAP[emoji];
  if (iconName && ICON_CACHE[iconName]) {
    ctx.drawImage(ICON_CACHE[iconName], x, y, size, size);
    return true;
  }
  return false;
}

function drawEmoji(ctx, emoji, x, y, size) {
  ctx.font = `${size}px Arial`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x, y + size / 2);
}

function drawIconOrEmoji(ctx, emoji, x, y, size) {
  if (!drawIcon(ctx, emoji, x, y, size)) drawEmoji(ctx, emoji, x, y, size);
}

window.getIcon = getIcon;
window.drawIcon = drawIcon;
window.drawEmoji = drawEmoji;
window.drawIconOrEmoji = drawIconOrEmoji;
window.ICON_CACHE = ICON_CACHE;

if (document.readyState === 'complete') loadIcons();
else window.addEventListener('load', loadIcons);