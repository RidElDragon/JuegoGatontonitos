// ============================================================
// 00-assets.js — v5: SPRITES con fallback total y blindaje
// ============================================================

// >>> SPRITES <<<
// La lista de animaciones de cada unidad NO se escribe a mano: la genera
// tools/build-sprites.js leyendo las carpetas de img/ y la guarda en
// js/sprites-manifest.js (que index.html carga antes que este archivo).
// Cada vez que añadas o quites PNG, ejecuta:   node tools/build-sprites.js
//
// · Estructura de carpetas: img/<tipo>/<id>/<animación>.png
//     gatos    →  img/cats/cat_1/walk.png
//     enemigos →  img/enemies/enemy_0/walk.png   (también event_* y legend_*)
//     jefes    →  img/bosses/boss_0/walk.png     (también eboss_* y lboss_*)
// · Animaciones: idle, walk, attack, knockback (siempre en minúsculas)
// · Los frames se detectan solos: la tira debe ser horizontal con celdas cuadradas
//   (ancho = alto × número de frames). Todas las animaciones de una unidad: mismo alto.
// · Los gatos con "visual" usan ese nombre como id:
//   cat_robosword, cat_robogun, cat_king, cat_demon, cat_headless, cat_gatoclaus
// · Otros ids: enemy_0, boss_0, event_<clave>, eboss_<clave>, legend_<clave>, lboss_<clave>

// Solo las EXCEPCIONES: animaciones con un fps distinto al de ANIM_FPS
const SPRITE_FPS = {
  // cat_1: { walk: 12, attack: 20 },
};

const ANIM_FPS = { idle: 2, walk: 10, attack: 18, knockback: 15 };

// Carpeta según el prefijo del id (no hace falta tocar esto)
function spriteFolder(id) {
  if (id.startsWith('cat_')) return 'cats';
  if (id.startsWith('boss_') || id.startsWith('eboss_') || id.startsWith('lboss_')) return 'bosses';
  if (id.startsWith('enemy_') || id.startsWith('event_') || id.startsWith('legend_')) return 'enemies';
  return '';   // id desconocido: se busca directamente en img/<id>/
}

// Construye USER_SPRITES a partir de SPRITE_LIST (no hace falta tocar esto)
const USER_SPRITES = {};
const _spriteList = (typeof SPRITE_LIST !== 'undefined') ? SPRITE_LIST : {};
for (const id in _spriteList) {
  USER_SPRITES[id] = {};
  _spriteList[id].forEach(name => {
    const folder = spriteFolder(id);
    USER_SPRITES[id][name] = {
      src: 'img/' + (folder ? folder + '/' : '') + id + '/' + name + '.png',
      fps: (SPRITE_FPS[id] && SPRITE_FPS[id][name]) || ANIM_FPS[name]
    };
  });
}

const SPRITES = {};

function buildManifest() {
  if (typeof CAT_BASE !== 'undefined') {
    CAT_BASE.forEach((u, i) => {
      SPRITES['cat_' + i] = { w: 64, h: 64 };
      if (u.visual) SPRITES['cat_' + u.visual] = { w: 64, h: 64 };
    });
  }
  if (typeof ENEMY_TYPES !== 'undefined') {
    ENEMY_TYPES.forEach((e, i) => { SPRITES['enemy_' + i] = { w: 64, h: 64 }; });
  }
  if (typeof BOSS_TYPES !== 'undefined') {
    BOSS_TYPES.forEach((b, i) => { SPRITES['boss_' + i] = { w: 96, h: 96 }; });
  }
  if (typeof EVENT_ENEMY_TYPES !== 'undefined') {
    Object.keys(EVENT_ENEMY_TYPES).forEach(k => { SPRITES['event_' + k] = { w: 64, h: 64 }; });
  }
  if (typeof EVENT_BOSS_TYPES !== 'undefined') {
    Object.keys(EVENT_BOSS_TYPES).forEach(k => {
      const key = (k === 'alien') ? 'emperor' : (k === 'infernal') ? 'lord' : k;
      SPRITES['eboss_' + key] = { w: 96, h: 96 };
    });
  }
  if (typeof LEGEND_ENEMY_TYPES !== 'undefined') {
    Object.keys(LEGEND_ENEMY_TYPES).forEach(k => { SPRITES['legend_' + k] = { w: 64, h: 64 }; });
  }
  if (typeof LEGEND_BOSS_TYPES !== 'undefined') {
    Object.keys(LEGEND_BOSS_TYPES).forEach(k => { SPRITES['lboss_' + k] = { w: 96, h: 96 }; });
  }
  for (const k in USER_SPRITES) {
    if (!SPRITES[k]) SPRITES[k] = { w: 64, h: 64 };
    const u = USER_SPRITES[k];
    if (typeof u === 'object' && !u.src) {
      SPRITES[k].anims = u;
    } else {
      SPRITES[k].src = u.src || u;
      if (u.frames) SPRITES[k].frames = u.frames;
      if (u.fps) SPRITES[k].fps = u.fps;
    }
  }
}

function createPlaceholder(w, h, color, label) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const c2 = cv.getContext('2d');
  c2.fillStyle = color; c2.fillRect(0, 0, w, h);
  c2.fillStyle = '#000'; c2.font = 'bold ' + Math.max(9, Math.min(14, w / 6)) + 'px Arial';
  c2.textAlign = 'center'; c2.textBaseline = 'middle';
  c2.fillText(label, w / 2, h / 2);
  return cv.toDataURL('image/png');
}

function fillPlaceholders() {
  if (typeof CAT_BASE !== 'undefined') {
    CAT_BASE.forEach((u, i) => {
      if (!SPRITES['cat_' + i].src && !SPRITES['cat_' + i].anims) {
        SPRITES['cat_' + i].src = createPlaceholder(64, 64, u.color, u.name);
        SPRITES['cat_' + i].ph = true;
      }
      if (u.visual && !SPRITES['cat_' + u.visual].src && !SPRITES['cat_' + u.visual].anims) {
        SPRITES['cat_' + u.visual].src = createPlaceholder(64, 64, u.color, u.visual);
        SPRITES['cat_' + u.visual].ph = true;
      }
    });
  }
  if (typeof ENEMY_TYPES !== 'undefined') {
    ENEMY_TYPES.forEach((e, i) => {
      if (!SPRITES['enemy_' + i].src && !SPRITES['enemy_' + i].anims) {
        SPRITES['enemy_' + i].src = createPlaceholder(64, 64, e.color, e.name);
        SPRITES['enemy_' + i].ph = true;
      }
    });
  }
  if (typeof BOSS_TYPES !== 'undefined') {
    BOSS_TYPES.forEach((b, i) => {
      if (!SPRITES['boss_' + i].src && !SPRITES['boss_' + i].anims) {
        SPRITES['boss_' + i].src = createPlaceholder(96, 96, b.color, b.name);
        SPRITES['boss_' + i].ph = true;
      }
    });
  }
}

function usableSprite(key) {
  const s = SPRITES[key];
  if (!s) return null;
  if (s.ph) return null;
  if (s.anims) {
    for (const k in s.anims) {
      if (s.anims[k] && s.anims[k].img) return s;
    }
    return null;
  }
  return (s.img ? s : null);
}

function getAvailableAnim(sprite) {
  if (!sprite || !sprite.anims) return null;
  const a = sprite.anims;
  if (a.knockback && a.knockback.img) return 'knockback';
  if (a.attack && a.attack.img) return 'attack';
  if (a.walk && a.walk.img) return 'walk';
  if (a.idle && a.idle.img) return 'idle';
  return null;
}

function getAnimFrame(anim, now) {
  if (!anim) return 0;
  if (!anim.frames || anim.frames <= 1) return 0;
  const fps = anim.fps || 10;
  const key = 'frame_' + (anim.src || 'x');
  if (!anim._timers) anim._timers = {};
  if (anim._timers[key] === undefined) anim._timers[key] = now;
  const elapsed = (now - anim._timers[key]) / 1000;
  return Math.floor(elapsed * fps) % anim.frames;
}

function enemySpriteKey(e) {
  if (typeof enemyKind !== 'function') return null;
  const k = enemyKind(e);
  if (!k) return null;
  if (k.startsWith('N:')) return 'enemy_' + k.slice(2);
  if (k.startsWith('E:')) {
    const st = k.slice(2);
    if (typeof EVENT_ENEMY_TYPES !== 'undefined' && EVENT_ENEMY_TYPES[st]) return 'event_' + st;
    return 'legend_' + st;
  }
  if (k.startsWith('B:')) {
    const st = k.slice(2);
    const ni = ['dragon','titan','demon','pharaoh','sandgolem','djinnboss'].indexOf(st);
    if (ni >= 0) return 'boss_' + ni;
    const ei = ['pumpkin','alien','infernal','krampus'].indexOf(st);
    if (ei >= 0) return 'eboss_' + ['pumpkin','emperor','lord','krampus'][ei];
    const li = ['ruinking','magmawyrm','skytitan','abysslord','machinegod','voidmonarch'].indexOf(st);
    if (li >= 0) return 'lboss_' + ['ruinKing','magmaWyrm','skyTitan','abyssLord','machineGod','voidMonarch'][li];
  }
  return null;
}

// ---------- Hook GATOS ----------
// ---- Elección de animación de una unidad (gato o enemigo) ----
// Prioridad: knockback > attack > walk > idle
//  · walk: solo mientras avanza de verdad (u.moving la pone el combate)
//  · attack y knockback se reproducen una vez desde su primer frame
//  · después de atacar, mientras espera el cooldown, vuelve a idle
const ANIM_FALLBACK = {
  knockback: ['idle', 'walk', 'attack'],
  attack:    ['idle', 'walk', 'knockback'],
  walk:      ['idle', 'attack', 'knockback'],
  idle:      ['walk', 'attack', 'knockback']
};
function resolveUnitAnim(u, sprite, now) {
  const anims = sprite.anims || null;
  const has = n => !!(anims && anims[n] && anims[n].img);

  // detectar el inicio de un golpe o empuje nuevo (los contadores vuelven a subir)
  const atkNow = u.attackAnim || 0, kbNow = u.knockbackTimer || 0;
  if (atkNow > (u._prevAtk || 0)) u._atkStart = now;
  if (kbNow > (u._prevKb || 0)) u._kbStart = now;
  u._prevAtk = atkNow; u._prevKb = kbNow;

  // sprite sin animaciones separadas (formato simple): una sola tira
  if (!anims) return sprite.img ? { anim: sprite, frame: getAnimFrame(sprite, now) } : null;

  // el ataque dura lo que dura su tira de frames (o el contador, lo que sea más largo)
  let attacking = atkNow > 0;
  if (!attacking && has('attack') && u._atkStart !== undefined) {
    const at = anims.attack;
    attacking = (now - u._atkStart) < ((at.frames || 1) / (at.fps || 10)) * 1000;
  }
  const moving = (u.moving !== undefined) ? u.moving : Math.abs(u.speed) > 0.1;

  let name = 'idle', start = null;
  if (kbNow > 0)      { name = 'knockback'; start = u._kbStart; }
  else if (attacking) { name = 'attack';    start = u._atkStart; }
  else if (moving)    { name = 'walk'; }

  if (!has(name)) {                       // falta esa animación: usar la más parecida
    start = null;
    name = (ANIM_FALLBACK[name] || []).find(has) || getAvailableAnim(sprite);
    if (!name || !has(name)) return null;
  }
  const anim = anims[name];
  let frame;
  if (start !== null && start !== undefined && anim.frames > 1) {
    frame = Math.min(anim.frames - 1, Math.floor(((now - start) / 1000) * (anim.fps || 10)));
  } else {
    frame = getAnimFrame(anim, now);
  }
  return { anim, frame };
}

function trySpriteCat(c, hideHud) {
  try {
    if (!c || typeof c.type !== 'number') return false;
    if (typeof ctx === 'undefined' || !ctx) return false;

    const now = performance.now();
    let key = 'cat_' + c.type;
    if (c.visual) key = 'cat_' + c.visual;
    const sprite = usableSprite(key);
    if (!sprite) return false;

    const res = resolveUnitAnim(c, sprite, now);
    if (!res) return false;
    const anim = res.anim;

    const bounce = Math.sin(c.walkCycle || 0) * 1.5;
    const scale = c.scale || 1;
    const attackScale = c.attackAnim > 0 ? 1.1 : 1;
    const frame = res.frame;

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(c.x, GROUND_Y, 16 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(c.x, c.y + bounce);
    if ((c.facing || 1) === -1) ctx.scale(-attackScale * scale, attackScale * scale);
    else ctx.scale(attackScale * scale, attackScale * scale);
    const cellW = anim.cellW || sprite.w;
    const cellH = anim.cellH || sprite.h;
    const totalFrames = anim.frames || 1;
    const sx = (frame % totalFrames) * cellW;
    ctx.drawImage(anim.img, sx, 0, cellW, cellH, -cellW / 2, -cellH / 2, cellW, cellH);
    ctx.restore();

    if (c.attackAnim > 0) c.attackAnim--;
    c.walkCycle = (c.walkCycle || 0) + (c.speed || 0) * 0.1;

    if (!hideHud && typeof catHudBar === 'function') catHudBar(c, scale, bounce);
    return true;
  } catch (e) {
    console.warn('trySpriteCat error:', e);
    return false;
  }
}

// ---------- Hook ENEMIGOS ----------
function trySpriteEnemy(e, opts) {
  try {
    if (!e) return false;
    if (typeof ctx === 'undefined' || !ctx) return false;

    const now = performance.now();
    const key = enemySpriteKey(e);
    if (!key) return false;
    const sprite = usableSprite(key);
    if (!sprite) return false;

    const res = resolveUnitAnim(e, sprite, now);
    if (!res) return false;
    const anim = res.anim;

    const hideHud = !!(opts && opts.hideHud);
    const scale = e.scale || 1;
    const bounce = Math.round(Math.sin(e.walkCycle || 0) * 1.5);
    const lunge = e.attackAnim > 0 ? -Math.round(e.attackAnim * 0.7) : 0;
    const attackScale = e.attackAnim > 0 ? 1.12 : 1;
    const frame = res.frame;

    ctx.save();
    ctx.translate(e.x + lunge, e.y + bounce);
    ctx.scale(attackScale * scale, attackScale * scale);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, GROUND_Y - e.y - bounce, 18 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    const cellW = anim.cellW || sprite.w;
    const cellH = anim.cellH || sprite.h;
    const totalFrames = anim.frames || 1;
    const sx = (frame % totalFrames) * cellW;
    if ((e.facing || -1) === -1) ctx.scale(-1, 1);
    ctx.drawImage(anim.img, sx, 0, cellW, cellH, -cellW / 2, -cellH / 2, cellW, cellH);
    ctx.restore();

    if (hideHud) return true;
    const barW = 28 * scale, barY = e.y - 38 * scale + bounce;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(e.x - barW / 2 - 1, barY - 1, barW + 2, 6);
    ctx.fillStyle = '#000'; ctx.fillRect(e.x - barW / 2, barY, barW, 4);
    ctx.fillStyle = '#f00'; ctx.fillRect(e.x - barW / 2, barY, barW * Math.max(0, e.hp / e.maxHp), 4);
    if (e.isBoss) {
      ctx.fillStyle = '#ff5555'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
      ctx.strokeText('👑 ' + e.name, e.x, e.y - 50 * scale + bounce);
      ctx.fillText('👑 ' + e.name, e.x, e.y - 50 * scale + bounce);
    }
    return true;
  } catch (e) {
    console.warn('trySpriteEnemy error:', e);
    return false;
  }
}

// ---------- Precarga ----------
function loadAssets(callback) {
  buildManifest();
  fillPlaceholders();
  const keys = Object.keys(SPRITES);
  const total = keys.length;
  let loaded = 0;

  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:#1a1a2e;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;font-family:Arial;';
  ov.innerHTML = '<h2 style="margin-bottom:16px">🐱 Cargando Cat Battle…</h2>' +
    '<div style="width:300px;height:18px;background:#333;border-radius:9px;overflow:hidden">' +
    '<div id="assetBar" style="width:0%;height:100%;background:linear-gradient(90deg,#ffd700,#ff8800);transition:width .15s"></div></div>' +
    '<div id="assetTxt" style="margin-top:8px;font-size:13px;color:#8899aa">0%</div>';
  document.body.appendChild(ov);

  function done() {
    loaded++;
    const pct = Math.floor(loaded / total * 100);
    const bar = document.getElementById('assetBar');
    const txt = document.getElementById('assetTxt');
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.textContent = pct + '%';
    if (loaded >= total) {
      setTimeout(() => { ov.remove(); if (callback) callback(); }, 150);
    }
  }

  if (total === 0) { if (callback) callback(); return; }

  keys.forEach(k => {
    const s = SPRITES[k];
    if (s.anims) {
      const animKeys = Object.keys(s.anims);
      let animLoaded = 0;
      animKeys.forEach(animKey => {
        const anim = s.anims[animKey];
        if (!anim || !anim.src) { animLoaded++; if (animLoaded === animKeys.length) done(); return; }
        const img = new Image();
        img.onload = () => {
          anim.img = img;
          if (img.width > img.height && img.width % img.height === 0) {
            anim.frames = anim.frames || (img.width / img.height);
            anim.cellW = img.height;
            anim.cellH = img.height;
          } else {
            anim.frames = 1;
            anim.cellW = img.width;
            anim.cellH = img.height;
          }
          s.w = anim.cellW;
          s.h = anim.cellH;
          animLoaded++;
          if (animLoaded === animKeys.length) done();
        };
        img.onerror = () => { animLoaded++; if (animLoaded === animKeys.length) done(); };
        img.src = anim.src;
      });
    } else if (s.src) {
      const img = new Image();
      img.onload = () => {
        s.img = img;
        if (img.width > img.height && img.width % img.height === 0) {
          s.frames = s.frames || (img.width / img.height);
          s.cellW = img.height;
          s.cellH = img.height;
        } else {
          s.frames = 1;
          s.cellW = img.width;
          s.cellH = img.height;
        }
        s.w = s.cellW;
        s.h = s.cellH;
        done();
      };
      img.onerror = () => { s.img = null; done(); };
      img.src = s.src;
    } else {
      done();
    }
  });
}

window.SPRITES = SPRITES;
window.loadAssets = loadAssets;
window.trySpriteCat = trySpriteCat;
window.trySpriteEnemy = trySpriteEnemy;