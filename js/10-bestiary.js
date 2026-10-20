// ============================================================
// 10-bestiary.js — v77: BIBLIOTECA (menú del libro) + galerías
// · v77: el botón 💎 Tesoros llama a showTreasuresScreen (de 13-treasures.js).
// · v70: menú del libro con 3 puertas (Gatopedia / Bestiario / Tesoros) + 🏆 Logros.
// · v69: window.resetBestiary() para el Reinicio Total.
// · v65: enemigos/jefes de LEYENDA registrados y mostrados.
// · v56: entradas a prueba de null + safeEntry (nunca lista en blanco).
// · MODO DEV: todo visible con tag 🔧 DEV · no registra apariciones.
// · Retratos EN VIVO compatibles con setRenderContext / sceneCanvas.
// ============================================================
(function () {
const B_KEY = 'catBattleBestiary';
let seen = load();
function load() {
  try { const o = JSON.parse(localStorage.getItem(B_KEY)); return (o && typeof o === 'object') ? o : {}; } catch (e) { return {}; }
}
function save() { try { localStorage.setItem(B_KEY, JSON.stringify(seen)); } catch (e) {} }

// ---------------- Identificación de enemigos ----------------
function idOf(t) {
  let i = ENEMY_TYPES.indexOf(t); if (i >= 0) return 'n' + i;
  i = BOSS_TYPES.indexOf(t); if (i >= 0) return 'b' + i;
  for (const k in EVENT_ENEMY_TYPES) if (EVENT_ENEMY_TYPES[k] === t) return 'ee:' + k;
  for (const k in EVENT_BOSS_TYPES) if (EVENT_BOSS_TYPES[k] === t) return 'eb:' + k;
  for (const k in LEGEND_ENEMY_TYPES) if (LEGEND_ENEMY_TYPES[k] === t) return 'le:' + k;
  for (const k in LEGEND_BOSS_TYPES) if (LEGEND_BOSS_TYPES[k] === t) return 'lb:' + k;
  return null;
}
function objById(id) {
  if (id.startsWith('le:')) return LEGEND_ENEMY_TYPES[id.slice(3)];
  if (id.startsWith('lb:')) return LEGEND_BOSS_TYPES[id.slice(3)];
  if (id.startsWith('ee:')) return EVENT_ENEMY_TYPES[id.slice(3)];
  if (id.startsWith('eb:')) return EVENT_BOSS_TYPES[id.slice(3)];
  if (id[0] === 'b') return BOSS_TYPES[+id.slice(1)];
  return ENEMY_TYPES[+id.slice(1)];
}
function allEnemyIds() {
  const ids = [];
  for (let i = 0; i < ENEMY_TYPES.length; i++) ids.push('n' + i);
  for (const k in EVENT_ENEMY_TYPES) ids.push('ee:' + k);
  for (let i = 0; i < BOSS_TYPES.length; i++) ids.push('b' + i);
  for (const k in EVENT_BOSS_TYPES) ids.push('eb:' + k);
  for (const k in LEGEND_ENEMY_TYPES) ids.push('le:' + k);
  for (const k in LEGEND_BOSS_TYPES) ids.push('lb:' + k);
  return ids;
}
function contextNow() {
  if (gameMode === 'story') return 'Historia Nv.' + (storyLevelIdx + 1);
  if (gameMode === 'event') {
    const ev = EVENTS[currentEventId];
    return ev ? ev.name + ' · ' + ev.levels[eventLevelIdx].name : currentEventId;
  }
  if (gameMode === 'legend') return 'Leyenda Etapa ' + (legendLevelIdx + 1);
  if (gameMode === 'infinite') return 'Infinito · Oleada ' + wave;
  return '';
}
function record(t) {
  if (isTest()) return;
  if (isDevMode()) return;
  const id = idOf(t);
  if (!id) return;
  const ctxName = contextNow();
  if (!seen[id]) seen[id] = { n: 0, first: ctxName };
  seen[id].n++;
  save();
}

// ---------------- Pistas de aparición ----------------
function enemyHint(id) {
  if (id.startsWith('le:') || id.startsWith('lb:')) {
    const k = id.slice(3);
    for (const L of LEGEND_STAGES) {
      if (L.pool.includes(k) || L.boss === k) return 'Etapas de Leyenda · ' + L.name;
    }
    return 'Etapas de Leyenda';
  }
  if (id.startsWith('ee:')) {
    const k = id.slice(3);
    for (const ev of Object.values(EVENTS)) for (const L of ev.levels) if (L.pool.includes(k)) return ev.name + ' · ' + L.name;
    return 'Evento especial';
  }
  if (id.startsWith('eb:')) {
    const k = id.slice(3);
    for (const ev of Object.values(EVENTS)) for (const L of ev.levels) if (L.boss === k) return ev.name + ' · ' + L.name;
    return 'Jefe de evento';
  }
  if (id[0] === 'b') {
    const lv = [5, 10, 15, 35, 40, 45][+id.slice(1)];
    return 'Historia Nv.' + lv + ' (JEFE) · Infinito';
  }
  const i = +id.slice(1);
  if (i >= 11) return 'Historia Parte 3 · Desierto (Nv.31+)';
  const w = [1, 1, 3, 3, 6, 12, 25, 3, 6, 25, 12][i];
  return 'Infinito · Oleada ' + w + '+ · Historia';
}

const TYPE_CHIP = {
  melee: '⚔️ Cuerpo a cuerpo', ranged: '🏹 A distancia', roboRanged: '🔫 A distancia',
  aoe: '💥 Daño en área', healer: '💚 Curación', poison: '☠️ Veneno',
  flying: '🪽 Volador', boss: '👑 JEFE'
};
const TROOP_LORE = [
  'El recluta de siempre: barato, valiente y maúlla primero.',
  'Un muro con patas. Aguanta lo que hundiría a cualquier otro.',
  'Cristal con garras: entra volando, golpea fuerte y reza.',
  'Lluvia de flechas desde la retaguardia. Nunca se acerca demasiado.',
  'Sus bolas de fuego salpican a filas enteras. Manténlo protegido.',
  'La razón por la que tu línea de frente sigue en pie.',
  'Lento, enorme y coronado. No se aparta por nadie.',
  'Acero felino forjado tras la invasión alienígena.',
  'Dispara más rápido de lo que maúlla. Bala tras bala.',
  'El monarca absoluto: su hacha juzga filas enteras de una vez.',
  'Escapó del infierno con su lanza ígnea y muy mal humor.',
  'Nadie sabe dónde mira… pero siempre acierta.',
  'Reparte nieve y castigo a partes iguales. Ho-ho-ho.',
];

// ---------------- Enganche: registrar apariciones ----------------
(function wrapPushEnemy() {
  const orig = window.pushEnemy;
  if (typeof orig !== 'function') return;
  window.pushEnemy = function (t) {
    const r = orig.apply(this, arguments);
    try { record(t); } catch (e) {}
    return r;
  };
})();

// ============================================================
// RETRATOS EN VIVO
// ============================================================
const THUMB = 100;
const PSCALE = (typeof RENDER_SCALE === 'number' && RENDER_SCALE > 1) ? Math.min(RENDER_SCALE, 4) : 2;
const BACK = Math.round(THUMB * PSCALE);
const WIN = 220;
const WIN_CX = 450, WIN_CY = 200;
const PAD = 10;
const FIG_R = 54;
const PORT_LOGICAL = 110, PORT_S = 2;
let portCanvas = null, portCtx = null;
let galleryFrame = 0;
let jobs = [];
const srcCache = {};

function useScenePipeline() {
  return (typeof sceneCanvas !== 'undefined' && !!sceneCanvas);
}
function measureFigure() {
  let data = null;
  const ox = WIN_CX * PSCALE - WIN * PSCALE / 2, oy = WIN_CY * PSCALE - WIN * PSCALE / 2;
  const win = Math.round(WIN * PSCALE);
  try { data = ctx.getImageData(ox, oy, win, win).data; } catch (e) { data = null; }
  let minx = 1e9, miny = 1e9, maxx = -1, maxy = -1;
  if (data && data.length >= win * win * 4) {
    for (let y = 0; y < win; y++) {
      for (let x = 0; x < win; x++) {
        if (data[(y * win + x) * 4 + 3] > 24) {
          if (x < minx) minx = x; if (x > maxx) maxx = x;
          if (y < miny) miny = y; if (y > maxy) maxy = y;
        }
      }
    }
  }
  if (maxx < 0) return [WIN_CX * PSCALE - FIG_R * PSCALE, WIN_CY * PSCALE - FIG_R * PSCALE, FIG_R * 2 * PSCALE, FIG_R * 2 * PSCALE];
  const cx = ox + (minx + maxx) / 2, cy = oy + (miny + maxy) / 2;
  const side = Math.max(maxx - minx, maxy - miny) + PAD * 2 * PSCALE;
  return [cx - side / 2, cy - side / 2, side, side];
}
function drawFigure(job) {
  const prevF = frameCount;
  frameCount = galleryFrame;
  const tc = job.tctx;
  if (useScenePipeline()) {
    ctx.save();
    ctx.setTransform(PSCALE, 0, 0, PSCALE, 0, 0);
    ctx.clearRect(0, 0, LOGIC_W, LOGIC_H);
    try { job.draw(WIN_CX, WIN_CY); } catch (e) {}
    ctx.restore();
    frameCount = prevF;
    if (!job.src) job.src = srcCache[job.key] || (srcCache[job.key] = measureFigure());
    if (!tc) return;
    try {
      tc.setTransform(1, 0, 0, 1, 0, 0);
      tc.clearRect(0, 0, job.w, job.h);
      if ('imageSmoothingEnabled' in tc) tc.imageSmoothingEnabled = true;
      tc.drawImage(sceneCanvas, job.src[0], job.src[1], job.src[2], job.src[3], 0, 0, job.w, job.h);
    } catch (e) {}
  } else if (typeof setRenderContext === 'function') {
    if (!portCanvas) {
      portCanvas = document.createElement('canvas');
      portCanvas.width = PORT_LOGICAL * PORT_S;
      portCanvas.height = PORT_LOGICAL * PORT_S;
      portCtx = portCanvas.getContext('2d');
    }
    setRenderContext(portCtx);
    portCtx.setTransform(PORT_S, 0, 0, PORT_S, 0, 0);
    portCtx.clearRect(0, 0, PORT_LOGICAL, PORT_LOGICAL);
    try { job.draw(PORT_LOGICAL / 2, 78); } catch (e) {}
    frameCount = prevF;
    resetRenderContext();
    if (!tc) return;
    tc.setTransform(1, 0, 0, 1, 0, 0);
    tc.clearRect(0, 0, job.w, job.h);
    tc.imageSmoothingEnabled = true;
    tc.drawImage(portCanvas, 0, 0, portCanvas.width, portCanvas.height, 0, 0, job.w, job.h);
  } else {
    frameCount = prevF;
  }
}
function refreshGallery() {
  const vh = window.innerHeight || 800;
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const cv = job.tctx && job.tctx.canvas;
    if (cv && cv.getBoundingClientRect) {
      const r = cv.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40) continue;
    }
    drawFigure(job);
  }
}
function makeThumb() {
  const cv = document.createElement('canvas');
  cv.className = 'best-thumb';
  cv.width = BACK; cv.height = BACK;
  return cv;
}
function portraitJob(key, draw, cv) {
  let tctx = null;
  try { tctx = cv.getContext('2d'); } catch (e) {}
  return { key: key, draw: draw, tctx: tctx, w: BACK, h: BACK, src: null };
}
function catPortrait(idx, cv, level, evo) {
  const u = CAT_BASE[idx];
  return portraitJob('c' + idx + (evo ? 'e' : 'n'), function (x, y) {
    drawCat({
      x: x, y: y, type: idx, level: level, evo: evo, scale: 1,
      hp: 1, maxHp: 1, color: u.color, color2: u.color2,
      visual: u.visual || null, unitType: u.type,
      walkCycle: 0.9, attackAnim: 0, spawnAnim: 0, hurtFlash: 0, poisonTimer: 0
    }, { hideHud: true });
  }, cv);
}
function enemyPortrait(id, cv) {
  const t = objById(id);
  const isBoss = id[0] === 'b' || id.startsWith('eb:') || id.startsWith('lb:');
  let type;
  if (id.startsWith('ee:') || id.startsWith('eb:') || id.startsWith('le:') || id.startsWith('lb:')) type = id.slice(3);
  else type = +id.slice(1);
  return portraitJob('e' + id, function (x, y) {
    drawEnemy({
      x: x, y: y, type: type, scale: 1,
      hp: 1, maxHp: 1, color: t.color, color2: t.color2,
      unitType: t.type, isBoss: isBoss, bossStyle: t.bossStyle || null,
      desertStyle: t.desertStyle || null, xmasStyle: t.xmasStyle || null,
      legendStyle: t.legendStyle || null,
      name: t.name, walkCycle: 0.9, attackAnim: 0, spawnAnim: 0, hurtFlash: 0, poisonTimer: 0
    }, { hideHud: true });
  }, cv);
}
function formStatsLine(idx, lvl) {
  const u = CAT_BASE[idx];
  const s = unitStatsAt(idx, lvl);
  let line = u.healAmt ? 'HP:' + s.hp + ' · Cura:' + s.heal : 'HP:' + s.hp + ' · DMG:' + s.dmg;
  line += ' · SPD:' + u.speed;
  return line;
}

// ---------------- Estado de vistas ----------------
let bookScreen = null, bScreen = null, bList = null, bTitle = null;
let mode = 'seen';
let view = 'enemies';

function seenCount() {
  if (isDevMode()) return allEnemyIds().length;
  return allEnemyIds().filter(id => seen[id]).length;
}
function troopCount() {
  if (isDevMode()) return NUM_UNITS;
  let n = 0; for (let i = 0; i < NUM_UNITS; i++) if (isUnitUnlocked(i)) n++;
  return n;
}

// ---------------- Construcción de pantallas ----------------
function buildUI() {
  // Menú del libro (📚) con las 4 puertas (Gatopedia, Bestiario, Tesoros, Logros)
  bookScreen = document.createElement('div');
  bookScreen.className = 'screen';
  bookScreen.style.display = 'none';
  bookScreen.innerHTML =
    '<h2>📚 BIBLIOTECA GATUNA</h2>' +
    '<div class="menu-info">Consulta todo lo que has descubierto en tus aventuras.</div>' +
    '<button class="menu-btn" style="background:linear-gradient(135deg,#88ff88,#228822)" onclick="showGatopedia()">🐱 Gatopedia</button>' +
    '<button class="menu-btn" style="background:linear-gradient(135deg,#ff8866,#aa2200)" onclick="showEnemyBook()">👹 Bestiario</button>' +
    '<button class="menu-btn" style="background:linear-gradient(135deg,#ffd700,#aa7700);color:#221100" onclick="showTreasuresScreen()">💎 Tesoros</button>' +
    '<button class="menu-btn" style="background:linear-gradient(135deg,#ffcc44,#886600);color:#221100" onclick="showAch()">🏆 Logros</button>' +
    '<div class="best-foot"></div>';
  const bf = bookScreen.querySelector('.best-foot');
  const bb = document.createElement('button');
  bb.className = 'back'; bb.textContent = '⬅ Volver'; bb.onclick = showMenu;
  bf.appendChild(bb);
  document.body.appendChild(bookScreen);

  // Galería compartida (Gatopedia / Bestiario)
  bScreen = document.createElement('div');
  bScreen.className = 'screen bestiary-screen';
  bScreen.style.display = 'none';
  bScreen.innerHTML =
    '<div class="best-head">' +
    '<h2 style="margin:2px" id="bestTitle">👹 BESTIARIO</h2>' +
    '<div class="menu-info" id="bestInfo"></div>' +
    '<div class="best-tabs">' +
    '<button class="best-tab" data-mode="seen">✅ Descubiertos</button>' +
    '<button class="best-tab" data-mode="all">📚 Todos</button>' +
    '</div></div>' +
    '<div class="best-list" id="bestList"></div>' +
    '<div class="best-foot"></div>';
  bList = bScreen.querySelector('#bestList');
  bTitle = bScreen.querySelector('#bestTitle');
  const tabs = bScreen.querySelector('.best-tabs');
  if (tabs) {
    tabs.querySelectorAll('.best-tab').forEach(t => {
      t.onclick = () => { mode = t.dataset.mode || 'seen'; render(); };
    });
  }
  const foot = bScreen.querySelector('.best-foot');
  const b = document.createElement('button');
  b.className = 'back'; b.textContent = '⬅ Volver a la Biblioteca'; b.onclick = showBookMenu;
  foot.appendChild(b);
  document.body.appendChild(bScreen);
}

// ---------------- Navegación ----------------
function showBookMenu() {
  hideScreens();
  if (bookScreen) bookScreen.style.display = 'flex';
  screen = 'bookmenu'; playing = false;
}
function showGatopedia() {
  view = 'cats';
  hideScreens();
  if (bScreen) bScreen.style.display = 'flex';
  screen = 'bestiary'; playing = false;
  if (bTitle) bTitle.textContent = '🐱 GATOPEDIA';
  render();
}
function showEnemyBook() {
  view = 'enemies';
  hideScreens();
  if (bScreen) bScreen.style.display = 'flex';
  screen = 'bestiary'; playing = false;
  if (bTitle) bTitle.textContent = '👹 BESTIARIO';
  render();
}
function showTesoros() {
  // Fallback por si queda un onclick antiguo
  if (window.showTreasuresScreen) window.showTreasuresScreen();
  else setStatus('❌ Módulo de tesoros no cargado', '#ff6666');
}
window.showBestiary = showBookMenu;
window.showGatopedia = showGatopedia;
window.showEnemyBook = showEnemyBook;
window.showBookMenu = showBookMenu;
window.showTesoros = showTesoros;

// v69: hook para que resetAllProgress() limpie también en memoria
window.resetBestiary = function () {
  seen = {};
  try { localStorage.removeItem(B_KEY); } catch (e) {}
};

// ---------------- Elementos de galería ----------------
function lockedThumb() {
  const d = document.createElement('div');
  d.className = 'best-thumb best-thumb-locked';
  d.textContent = '❓';
  return d;
}
function section(list, title, entries) {
  const valid = entries.filter(e => !!e);
  if (!valid.length) return;
  const h = document.createElement('div');
  h.className = 'best-section';
  h.textContent = title;
  list.appendChild(h);
  valid.forEach(e => list.appendChild(e));
}
function makeFormColumn(cv, label, labelColor, statsText) {
  const col = document.createElement('div');
  col.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px';
  const lab = document.createElement('span');
  lab.className = 'sb-info';
  lab.style.fontWeight = 'bold';
  if (labelColor) lab.style.color = labelColor;
  lab.textContent = label;
  const st = document.createElement('span');
  st.className = 'sb-info';
  st.textContent = statsText;
  col.appendChild(cv);
  col.appendChild(lab);
  col.appendChild(st);
  return col;
}
function troopEntry(idx) {
  const unlocked = isDevMode() || isUnitUnlocked(idx);
  if (!unlocked && mode === 'seen') return null;
  const u = CAT_BASE[idx];
  const node = document.createElement('div');
  node.className = 'best-entry' + (unlocked ? '' : ' locked-entry');
  const body = document.createElement('div');
  body.className = 'best-body';
  if (unlocked) {
    const r = rarityOf(idx);
    const cvN = makeThumb();
    const cvE = makeThumb();
    const duo = document.createElement('div');
    duo.style.cssText = 'display:flex;gap:10px;align-items:flex-start;flex:0 0 auto';
    duo.appendChild(makeFormColumn(cvN, '🐱 Normal', null, formStatsLine(idx, 1)));
    duo.appendChild(makeFormColumn(cvE, '✨ Evolucionada', '#88ffcc', formStatsLine(idx, EVOLVE_LEVEL)));
    node.appendChild(duo);
    jobs.push(catPortrait(idx, cvN, 1, false));
    jobs.push(catPortrait(idx, cvE, EVOLVE_LEVEL, true));
    body.innerHTML =
      '<div class="best-name">' + (UNIT_EMOJI[idx] || '🐱') + ' ' + u.name +
      ' <span class="best-tag" style="border-color:' + r.color + ';color:' + r.color + '">' + r.name + '</span>' +
      (unitLevels[idx] >= EVOLVE_LEVEL ? ' <span class="best-tag">✨</span>' : '') +
      (isDevMode() ? ' <span class="best-tag" style="color:#ff88ff">🔧 DEV</span>' : '') + '</div>' +
      '<div class="sb-info">' + troopStatsLine(idx) + '</div>' +
      '<div class="sb-info" style="font-style:italic;opacity:.8">"' + (TROOP_LORE[idx] || '') + '"</div>' +
      '<div class="sb-info">Nivel actual: ' + unitLevels[idx] + '/' + unitLevelCap() + ' · Forma en uso: ' + (formIsEvo(idx) ? '✨ Evolucionada' : '🐱 Normal') + '</div>';
  } else {
    node.appendChild(lockedThumb());
    body.innerHTML =
      '<div class="best-name locked">🔒 ???</div>' +
      '<div class="sb-info locked">' + unlockLabel(idx) + '</div>' +
      '<div class="sb-info locked">Desbloquéala para ver sus dos formas</div>';
  }
  node.appendChild(body);
  return node;
}
function enemyEntry(id) {
  const t = objById(id);
  const s = isDevMode() ? (seen[id] || { n: 0, first: '[DEV]' }) : seen[id];
  if (!s && mode === 'seen') return null;
  const node = document.createElement('div');
  node.className = 'best-entry' + (s ? '' : ' locked-entry');
  const body = document.createElement('div');
  body.className = 'best-body';
  if (s) {
    const cv = makeThumb();
    node.appendChild(cv);
    jobs.push(enemyPortrait(id, cv));
    body.innerHTML =
      '<div class="best-name">' + t.name + ' <span class="best-tag">' + (TYPE_CHIP[t.type] || '') + '</span>' +
      (isDevMode() ? ' <span class="best-tag" style="color:#ff88ff">🔧 DEV</span>' : '') + '</div>' +
      '<div class="sb-info">HP:' + t.hp + ' · DMG:' + t.dmg + ' · SPD:' + t.speed + (t.reward ? ' · 💰' + t.reward : '') + '</div>' +
      '<div class="sb-info">' + (isDevMode() && !seen[id] ? '🔧 [DEV: visible]' : ('👁 Visto ' + s.n + '× · 1ª vez: ' + (s.first || '—'))) + '</div>';
  } else {
    node.appendChild(lockedThumb());
    body.innerHTML =
      '<div class="best-name locked">❓ ???</div>' +
      '<div class="sb-info locked">' + (TYPE_CHIP[t.type] || 'Enemigo') + '</div>' +
      '<div class="sb-info locked">Aún no lo has encontrado</div>' +
      '<div class="sb-info locked">📍 ' + enemyHint(id) + '</div>';
  }
  node.appendChild(body);
  return node;
}
function safeEntry(fn, arg) {
  try { return fn(arg); } catch (e) { console.error('📖 Bestiario: error en entrada', arg, e); return null; }
}

// ---------------- Render ----------------
function render() {
  const info = document.getElementById('bestInfo');
  if (info) {
    if (view === 'cats') {
      info.innerHTML = 'Tropas: <b style="color:#88ff88">' + troopCount() + '/' + NUM_UNITS + '</b> · <span style="font-size:11px">Cada tropa muestra su forma 🐱 Normal y ✨ Evolucionada con sus stats reales.</span>' + (isDevMode() ? ' <span style="color:#ff88ff">🔧 MODO DEV.</span>' : '');
    } else {
      info.innerHTML = 'Enemigos: <b style="color:#88ccee">' + seenCount() + '/' + allEnemyIds().length + '</b> · <span style="font-size:11px">Se registra al aparecer en batalla (no en 🧪 sandbox ni 🔧 dev).</span>' + (isDevMode() ? ' <span style="color:#ff88ff">🔧 MODO DEV: todo visible.</span>' : '');
    }
  }
  if (bScreen) {
    bScreen.querySelectorAll('.best-tab').forEach(t => {
      t.classList.toggle('active', (t.dataset.mode || 'seen') === mode);
    });
  }
  if (!bList) return;
  bList.innerHTML = '';
  jobs = [];

  if (view === 'cats') {
    const troops = [];
    for (let i = 0; i < NUM_UNITS; i++) troops.push(safeEntry(troopEntry, i));
    section(bList, '🐱 TROPAS (' + troops.filter(e => e).length + '/' + NUM_UNITS + ')', troops);
    if (!troops.some(e => e)) {
      const h = document.createElement('div');
      h.className = 'best-section';
      h.textContent = 'Aún no has descubierto ninguna tropa.';
      bList.appendChild(h);
    }
  } else {
    const enemies = [];
    for (let i = 0; i < ENEMY_TYPES.length; i++) enemies.push(safeEntry(enemyEntry, 'n' + i));
    const evEnemies = [];
    for (const k in EVENT_ENEMY_TYPES) evEnemies.push(safeEntry(enemyEntry, 'ee:' + k));
    const legendEnemies = [];
    for (const k in LEGEND_ENEMY_TYPES) legendEnemies.push(safeEntry(enemyEntry, 'le:' + k));
    const bosses = [];
    for (let i = 0; i < BOSS_TYPES.length; i++) bosses.push(safeEntry(enemyEntry, 'b' + i));
    for (const k in EVENT_BOSS_TYPES) bosses.push(safeEntry(enemyEntry, 'eb:' + k));
    const legendBosses = [];
    for (const k in LEGEND_BOSS_TYPES) legendBosses.push(safeEntry(enemyEntry, 'lb:' + k));
    section(bList, '👹 ENEMIGOS (' + enemies.filter(e => e).length + ')', enemies);
    section(bList, '🎃 ENEMIGOS DE EVENTOS (' + evEnemies.filter(e => e).length + ')', evEnemies);
    section(bList, '🌟 ENEMIGOS DE LEYENDA (' + legendEnemies.filter(e => e).length + ')', legendEnemies);
    section(bList, '👑 JEFES (' + bosses.filter(e => e).length + ')', bosses);
    section(bList, '🌟 JEFES DE LEYENDA (' + legendBosses.filter(e => e).length + ')', legendBosses);
    const any = enemies.some(e => e) || evEnemies.some(e => e) || legendEnemies.some(e => e) || bosses.some(e => e) || legendBosses.some(e => e);
    if (!any) {
      const h = document.createElement('div');
      h.className = 'best-section';
      h.textContent = 'Aún no has descubierto nada. ¡Sal a combatir!';
      bList.appendChild(h);
    }
  }
  galleryFrame++;
  refreshGallery();
}

// ---------------- Wrappers ----------------
function wrap(name, after) {
  const orig = window[name];
  if (typeof orig !== 'function') return;
  window[name] = function () {
    const r = orig.apply(this, arguments);
    try { after.apply(this, arguments); } catch (e) {}
    return r;
  };
}
wrap('hideScreens', () => {
  if (bookScreen) bookScreen.style.display = 'none';
  if (bScreen) bScreen.style.display = 'none';
});
wrap('draw', () => {
  if (screen !== 'bestiary') return;
  galleryFrame++;
  if (galleryFrame & 1) return;
  refreshGallery();
});

// Arranque
buildUI();
})();