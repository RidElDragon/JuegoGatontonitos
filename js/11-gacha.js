// ============================================================
// 11-gacha.js — v66: BANNERS (GACHA), 📦 ALMACÉN y 📜 MISIONES
// · v66 FIX: snapshot del almacén al entrar/salir del modo dev
//            para que los items obtenidos en dev no persistan.
// · v65: · Tickets INFINITOS en modo desarrollador.
//        · Indicador "∞" en los banners cuando está activo.
// · 🎫 Banner Normal: pool de gatos normales (0-6).
//   💠 Banner Raro: pool de unidades especiales (7-12).
// · Cada pull: 72% tropa / 28% mejora de BASE.
// · Los premios van al 📦 ALMACÉN y tú decides APLICARLOS o
//   DESCARTARLOS por .
// · 📜 Misiones: objetivos permanentes que pagan 🐾 y tickets.
// · Base: cada nivel de mejora = +150 HP máx (getBaseMaxHP).
// · En 🧪 sandbox: NADA de esto se guarda ni se permite.
// · En  modo dev: se permite probar TODO pero NADA se guarda
//   (el snapshot de 02-state.js restaura todo al salir).
// ============================================================
(function () {
const STORE_KEY = 'catBattleStorage';
const MIS_KEY = 'catBattleMissions';
const UNLOCK_LEVEL = 10;

// ---------------- persistencia propia ----------------
let storage = loadStorage();
let mis = loadMissions();
let storageSnapshot = null;  // v66: snapshot para modo dev

function loadStorage() {
  try { const o = JSON.parse(localStorage.getItem(STORE_KEY)); return Array.isArray(o) ? o : []; } catch (e) { return []; }
}
function saveStorage() { if (isDevMode()) return; try { localStorage.setItem(STORE_KEY, JSON.stringify(storage)); } catch (e) {} }
function loadMissions() {
  try {
    const o = JSON.parse(localStorage.getItem(MIS_KEY));
    if (o && typeof o === 'object') {
      return { claimed: o.claimed || {}, stats: Object.assign({ pulls: 0, applies: 0, maxWave: 0 }, o.stats || {}) };
    }
  } catch (e) {}
  return { claimed: {}, stats: { pulls: 0, applies: 0, maxWave: 0 } };
}
function saveMissions() { if (isDevMode()) return; try { localStorage.setItem(MIS_KEY, JSON.stringify(mis)); } catch (e) {} }

function blocked() { return isTest(); }
function gachaUnlocked() { return isDevMode() || storyProgress >= UNLOCK_LEVEL; }

// v66: snapshot del almacén al entrar en modo dev
function snapshotStorage() {
  storageSnapshot = storage.map(s => ({...s}));
}
function restoreStorage() {
  if (storageSnapshot) {
    storage = storageSnapshot.map(s => ({...s}));
    storageSnapshot = null;
  }
}

// ---------------- helpers de pendientes ----------------
function storedCount(kind, idx) {
  let n = 0;
  for (const s of storage) if (s.kind === kind && (idx === undefined || s.idx === idx)) n++;
  return n;
}
function mkItem(kind, idx) {
  return { uid: Date.now() + '-' + Math.random().toString(36).slice(2, 8), kind: kind, idx: idx };
}
function itemLabel(it) {
  if (it.kind === 'unlock') return '🔓 Desbloquear tropa: ' + (UNIT_EMOJI[it.idx] || '🐱') + ' ' + CAT_BASE[it.idx].name;
  if (it.kind === 'unitLvl') return '⬆️ +1 nivel EXTRA (supera el tope): ' + (UNIT_EMOJI[it.idx] || '🐱') + ' ' + CAT_BASE[it.idx].name + ' (llevas +' + (gachaLevels[it.idx] || 0) + '/' + GACHA_LVL_MAX + ')';
  return ' +1 nivel de BASE (+' + BASE_HP_PER_LEVEL + ' HP máx · actual Nv.' + baseLevel + '/' + BASE_GACHA_MAX + ')';
}
function itemRefund(it) {
  if (it.kind === 'base') return 800;
  if (it.kind === 'unlock') return 1200;
  return GACHA_RARE_POOL.includes(it.idx) ? 1500 : 400;
}

// ---------------- BANNERS ----------------
function rollItem(pool) {
  const r = Math.random();
  if (r < 0.72) {
    const idx = pool[Math.floor(Math.random() * pool.length)];
    const willUnlock = !isUnitUnlocked(idx) && !gachaUnlocked[idx] && storedCount('unlock', idx) === 0;
    if (willUnlock) return mkItem('unlock', idx);
    if ((gachaLevels[idx] || 0) + storedCount('unitLvl', idx) < GACHA_LVL_MAX) return mkItem('unitLvl', idx);
    if (baseLevel + storedCount('base') < BASE_GACHA_MAX) return mkItem('base');
    return mkItem('unitLvl', idx);
  }
  if (baseLevel + storedCount('base') < BASE_GACHA_MAX) return mkItem('base');
  const idx = pool[Math.floor(Math.random() * pool.length)];
  return mkItem('unitLvl', idx);
}
let lastPull = null;
function doPull(banner) {
  if (blocked()) { setStatus('❌ En sandbox los banners no están disponibles', '#ff6666'); return; }
  const isRare = banner === 'rare';
  if (!isDevMode()) {
    if (isRare ? ticketsRare <= 0 : ticketsNormal <= 0) { setStatus('❌ No te quedan tickets de ese tipo', '#ff6666'); return; }
    if (isRare) ticketsRare--; else ticketsNormal--;
  }
  mis.stats.pulls++; saveMissions();
  const item = rollItem(isRare ? GACHA_RARE_POOL : GACHA_NORMAL_POOL);
  storage.push(item);
  saveStorage(); saveMeta();
  lastPull = { item: item, rare: isRare };
  if (window.sfx) { sfx('spawn'); setTimeout(() => sfx('upgrade'), 200); }
  renderBanners(); refreshButtons();
}

// ---------------- ALMACÉN ----------------
function applyItem(uid) {
  if (blocked()) { setStatus('❌ En sandbox el almacén no está disponible', '#ff6666'); return; }
  const i = storage.findIndex(s => s.uid === uid);
  if (i < 0) return;
  const it = storage[i];
  if (it.kind === 'unlock') gachaUnlocked[it.idx] = true;
  else if (it.kind === 'unitLvl') gachaLevels[it.idx] = (gachaLevels[it.idx] || 0) + 1;
  else if (it.kind === 'base') baseLevel++;
  storage.splice(i, 1);
  mis.stats.applies++; saveMissions();
  saveStorage(); saveMeta();
  if (window.sfx) sfx('upgrade');
  renderStorage(); refreshButtons();
}
function discardItem(uid) {
  if (blocked()) { setStatus('❌ En sandbox el almacén no está disponible', '#ff6666'); return; }
  const i = storage.findIndex(s => s.uid === uid);
  if (i < 0) return;
  const refund = itemRefund(storage[i]);
  coins += refund;
  storage.splice(i, 1);
  saveStorage(); saveMeta();
  if (window.sfx) sfx('coin');
  renderStorage(); refreshButtons();
}

// ---------------- MISIONES ----------------
function achBossKills() {
  try { const o = JSON.parse(localStorage.getItem('catBattleAch')); return (o && o.stats && o.stats.bossKills) || 0; } catch (e) { return 0; }
}
function anyEventDone() { return Object.values(EVENTS).some(ev => (eventProgress[ev.id] || 0) >= ev.levels.length); }
const MISSIONS = [
  { id:'m_story5',   name:'📖 Primeros Pasos',      desc:'Supera el Nivel 5 de Historia.',         coins:3000,   tn:1, tr:0, check:() => storyProgress >= 5 },
  { id:'m_story15',  name:'📖 Héroe en Formación',  desc:'Supera el Nivel 15 de Historia.',        coins:8000,   tn:2, tr:0, check:() => storyProgress >= 15 },
  { id:'m_story30',  name:'👑 Mano Derecha',        desc:'Supera el Nivel 30 de Historia.',        coins:20000,  tn:0, tr:1, check:() => storyProgress >= 30 },
  { id:'m_story45',  name:'️ Dueño del Desierto',  desc:'Supera el Nivel 45 de Historia.',        coins:50000,  tn:0, tr:2, check:() => storyProgress >= 45 },
  { id:'m_event1',   name:'🎃 Cazador de Fiestas',  desc:'Completa cualquier evento (3/3).',       coins:10000,  tn:0, tr:1, check:() => anyEventDone() },
  { id:'m_legend5',  name:'🌟 Novato Legendario',   desc:'Supera 5 Etapas de Leyenda.',            coins:15000,  tn:2, tr:0, check:() => legendProgress >= 5 },
  { id:'m_legend15', name:'🌟 Veterano Legendario', desc:'Supera 15 Etapas de Leyenda.',           coins:40000,  tn:0, tr:2, check:() => legendProgress >= 15 },
  { id:'m_legend30', name:' Leyenda Viviente',    desc:'Supera las 30 Etapas de Leyenda.',       coins:100000, tn:0, tr:5, check:() => legendProgress >= 30 },
  { id:'m_boss5',    name:'💀 Cazarrecompensas',    desc:'Derrota 5 jefes (acumulado).',           coins:5000,   tn:1, tr:0, check:() => achBossKills() >= 5 },
  { id:'m_boss20',   name:'💀 Terror de Jefes',     desc:'Derrota 20 jefes (acumulado).',          coins:25000,  tn:0, tr:2, check:() => achBossKills() >= 20 },
  { id:'m_wave30',   name:'🌊 Marea Creciente',     desc:'Llega a la oleada 30 en Modo Infinito.', coins:8000,   tn:1, tr:0, check:() => mis.stats.maxWave >= 30 },
  { id:'m_pull5',    name:'🎰 Cliente Frecuente',   desc:'Usa 5 tickets en los banners.',          coins:4000,   tn:1, tr:0, check:() => mis.stats.pulls >= 5 },
  { id:'m_pull20',   name:'🎰 Adicto al Gacha',     desc:'Usa 20 tickets en los banners.',         coins:15000,  tn:0, tr:2, check:() => mis.stats.pulls >= 20 },
  { id:'m_apply5',   name:'📦 Logística Felina',    desc:'Aplica 5 mejoras desde el Almacén.',     coins:6000,   tn:1, tr:0, check:() => mis.stats.applies >= 5 },
  { id:'m_rich50',   name:' Ahorrador',           desc:'Ten 50.000 🐾 a la vez.',                coins:0,      tn:0, tr:2, check:() => coins >= 50000 },
];
function claimMission(id) {
  if (blocked()) { setStatus('❌ En sandbox las misiones no están disponibles', '#ff6666'); return; }
  const m = MISSIONS.find(x => x.id === id);
  if (!m || mis.claimed[id] || !m.check()) return;
  mis.claimed[id] = Date.now();
  coins += m.coins; ticketsNormal += m.tn; ticketsRare += m.tr;
  saveMissions(); saveMeta();
  if (window.sfx) { sfx('coin'); setTimeout(() => sfx('upgrade'), 150); }
  renderMissions(); refreshButtons();
}
function claimableCount() { return MISSIONS.filter(m => !mis.claimed[m.id] && m.check()).length; }

// ---------------- UI inyectada ----------------
let gBtn = null, sBtn = null, mBtn = null;
let gScreen = null, sScreen = null, mScreen = null;
function mkScreen(title, listId) {
  const d = document.createElement('div');
  d.className = 'screen';
  d.style.display = 'none';
  d.innerHTML = '<h2>' + title + '</h2><div class="menu-info" id="' + listId + 'Info"></div><div id="' + listId + '" class="upgrade-grid" style="max-width:980px"></div><div class="best-foot"></div>';
  const foot = d.querySelector('.best-foot');
  const b = document.createElement('button');
  b.className = 'back'; b.textContent = '⬅ Volver al menú'; b.onclick = showMenu;
  foot.appendChild(b);
  document.body.appendChild(d);
  return d;
}
function buildUI() {
  const menu = document.getElementById('menuScreen');
  if (menu) {
    const resetBtn = menu.querySelector('.reset-all');
    gBtn = document.createElement('button'); gBtn.className = 'menu-btn'; gBtn.style.background = 'linear-gradient(135deg,#ff66cc,#660066)'; gBtn.onclick = showBanners;
    sBtn = document.createElement('button'); sBtn.className = 'menu-btn'; sBtn.style.background = 'linear-gradient(135deg,#cc9966,#664422)'; sBtn.onclick = showStorage;
    mBtn = document.createElement('button'); mBtn.className = 'menu-btn'; mBtn.style.background = 'linear-gradient(135deg,#66cc99,#226644)'; mBtn.onclick = showMissions;
    if (resetBtn) { menu.insertBefore(gBtn, resetBtn); menu.insertBefore(sBtn, resetBtn); menu.insertBefore(mBtn, resetBtn); }
    else { menu.appendChild(gBtn); menu.appendChild(sBtn); menu.appendChild(mBtn); }
  }
  gScreen = mkScreen('🎰 BANNERS DE TROPAS', 'gachaList');
  sScreen = mkScreen('📦 ALMACÉN DE MEJORAS', 'storageList');
  mScreen = mkScreen('📜 MISIONES', 'missionList');
}
function hideAll() {
  if (gScreen) gScreen.style.display = 'none';
  if (sScreen) sScreen.style.display = 'none';
  if (mScreen) mScreen.style.display = 'none';
}
function showBanners() {
  leaveTestIfNeeded();
  if (!gachaUnlocked()) { setStatus(' Se desbloquea al superar Historia Nivel ' + UNLOCK_LEVEL, '#ffaa00'); return; }
  screen = 'gacha'; playing = false; hideScreens(); gScreen.style.display = 'flex'; renderBanners();
}
function showStorage() {
  leaveTestIfNeeded();
  if (!gachaUnlocked()) { setStatus('🔒 Se desbloquea al superar Historia Nivel ' + UNLOCK_LEVEL, '#ffaa00'); return; }
  screen = 'storage'; playing = false; hideScreens(); sScreen.style.display = 'flex'; renderStorage();
}
function showMissions() {
  leaveTestIfNeeded();
  if (!gachaUnlocked()) { setStatus('🔒 Se desbloquea al superar Historia Nivel ' + UNLOCK_LEVEL, '#ffaa00'); return; }
  screen = 'missions'; playing = false; hideScreens(); mScreen.style.display = 'flex'; renderMissions();
}
function refreshButtons() {
  const locked = !gachaUnlocked();
  const tNormal = isDevMode() ? '∞' : ticketsNormal;
  const tRare = isDevMode() ? '∞' : ticketsRare;
  if (gBtn) {
    gBtn.textContent = locked
      ? ' Banners 🔒 (Historia Nv.' + UNLOCK_LEVEL + ')'
      : ' Banners (🎫 ' + tNormal + ' / 💠 ' + tRare + ')';
  }
  if (sBtn) {
    sBtn.textContent = locked
      ? '📦 Almacén 🔒 (Historia Nv.' + UNLOCK_LEVEL + ')'
      : '📦 Almacén (' + storage.length + ')';
  }
  if (mBtn) {
    const claimTag = !locked && claimableCount() ? ' (¡' + claimableCount() + ' listas!)' : '';
    mBtn.textContent = locked
      ? '📜 Misiones 🔒 (Historia Nv.' + UNLOCK_LEVEL + ')'
      : '📜 Misiones' + claimTag;
  }
}
function renderBanners() {
  const info = document.getElementById('gachaListInfo');
  if (info) {
    const tNormal = isDevMode() ? '∞' : ticketsNormal;
    const tRare = isDevMode() ? '∞' : ticketsRare;
    let html = 'Tickets: 🎫 Normal <b>' + tNormal + '</b> ·  Raro <b>' + tRare + '</b> · Los premios van al 📦 Almacén: tú decides cuándo aplicarlos.';
    if (isDevMode()) html += ' <span style="color:#ff88ff">🔧 Modo dev: tickets infinitos, puedes probar sin gastar.</span>';
    info.innerHTML = html;
  }
  const list = document.getElementById('gachaList');
  if (!list) return;
  list.innerHTML = '';
  const banners = [
    { key:'normal', title:'🎫 Banner Normal', pool:GACHA_NORMAL_POOL, grad:'linear-gradient(135deg,#88aacc,#335577)',
      desc:'Gatos normales (Básico → Gigante). 72% tropa · 28% mejora de base.' },
    { key:'rare', title:'💠 Banner Raro', pool:GACHA_RARE_POOL, grad:'linear-gradient(135deg,#cc88ff,#552288)',
      desc:'Unidades especiales (Robos, Rey, Demonio, Sin Cabeza, Gatoclaus). 72% tropa · 28% mejora de base.' },
  ];
  banners.forEach(bn => {
    const tickets = isDevMode() ? Infinity : (bn.key === 'rare' ? ticketsRare : ticketsNormal);
    const card = document.createElement('div');
    card.className = 'upg-card';
    card.style.background = bn.grad;
    card.style.minWidth = '320px';
    card.style.textAlign = 'left';
    const emojis = bn.pool.map(i => UNIT_EMOJI[i] || '🐱').join(' ');
    card.innerHTML =
      '<div class="best-name">' + bn.title + '</div>' +
      '<div class="sb-info">' + bn.desc + '</div>' +
      '<div class="sb-info">Pool: ' + emojis + '</div>' +
      '<div class="sb-info">Tickets disponibles: <b>' + (isDevMode() ? '∞' : tickets) + '</b></div>';
    const pull = document.createElement('button');
    pull.className = 'save-btn';
    pull.style.cssText = 'margin-top:6px;font-size:13px;padding:8px 14px;';
    pull.disabled = blocked();
    pull.textContent = '🎰 Usar 1 ticket (' + (bn.key === 'rare' ? '💠' : '🎫') + ')';
    pull.onclick = () => doPull(bn.key);
    card.appendChild(pull);
    list.appendChild(card);
  });
  if (lastPull) {
    const res = document.createElement('div');
    res.className = 'upg-card maxed';
    res.style.minWidth = '320px';
    res.style.textAlign = 'left';
    res.innerHTML =
      '<div class="best-name">' + (lastPull.rare ? '💠' : '🎫') + ' Último premio:</div>' +
      '<div class="sb-info">' + itemLabel(lastPull.item) + '</div>' +
      '<div class="sb-info">→ Guardado en el 📦 Almacén (no aplicado aún).</div>';
    list.appendChild(res);
  }
}
function renderStorage() {
  const info = document.getElementById('storageListInfo');
  if (info) {
    let html = 'Mejoras pendientes: <b>' + storage.length + '</b> · Aplícalas para hacerlas PERMANENTES o descártalas por .';
    if (isDevMode()) html += ' <span style="color:#ff88ff">🔧 Modo dev: puedes probar, pero nada se guardará al salir.</span>';
    info.innerHTML = html;
  }
  const list = document.getElementById('storageList');
  if (!list) return;
  list.innerHTML = '';
  if (!storage.length) {
    const h = document.createElement('div');
    h.className = 'best-section';
    h.textContent = 'Almacén vacío: usa tickets en los 🎰 Banners para conseguir mejoras.';
    list.appendChild(h);
    return;
  }
  storage.forEach(it => {
    const card = document.createElement('div');
    card.className = 'upg-card';
    card.style.textAlign = 'left';
    card.style.minWidth = '300px';
    card.innerHTML = '<div class="best-name">' + itemLabel(it) + '</div><div class="sb-info">Descarte: +' + itemRefund(it) + ' 🐾</div>';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;';
    const ap = document.createElement('button');
    ap.className = 'save-btn'; ap.style.background = 'linear-gradient(135deg,#88ff88,#228822)';
    ap.textContent = '✅ Aplicar (permanente)'; ap.disabled = blocked();
    ap.onclick = () => applyItem(it.uid);
    const di = document.createElement('button');
    di.className = 'save-btn'; di.style.background = 'linear-gradient(135deg,#ff8844,#884400)';
    di.textContent = '🗑️ Descartar (+' + itemRefund(it) + '🐾)'; di.disabled = blocked();
    di.onclick = () => discardItem(it.uid);
    row.appendChild(ap); row.appendChild(di);
    card.appendChild(row);
    list.appendChild(card);
  });
}
function renderMissions() {
  const info = document.getElementById('missionListInfo');
  const done = MISSIONS.filter(m => mis.claimed[m.id]).length;
  if (info) {
    let html = 'Completadas: <b>' + done + '/' + MISSIONS.length + '</b> · Reclama  y tickets al cumplir cada una.';
    if (isDevMode()) html += ' <span style="color:#ff88ff"> Modo dev: puedes probar, pero nada se guardará al salir.</span>';
    info.innerHTML = html;
  }
  const list = document.getElementById('missionList');
  if (!list) return;
  list.innerHTML = '';
  MISSIONS.forEach(m => {
    const claimed = !!mis.claimed[m.id];
    const ready = !claimed && m.check();
    const card = document.createElement('div');
    card.className = 'upg-card' + (claimed ? ' maxed' : '');
    card.style.textAlign = 'left';
    card.style.minWidth = '300px';
    const reward = [];
    if (m.coins) reward.push(m.coins + ' 🐾');
    if (m.tn) reward.push(m.tn + ' 🎫');
    if (m.tr) reward.push(m.tr + ' 💠');
    card.innerHTML =
      '<div class="best-name">' + (claimed ? '✅' : ready ? '' : '🔒') + ' ' + m.name + '</div>' +
      '<div class="sb-info">' + m.desc + '</div>' +
      '<div class="sb-info">Recompensa: ' + reward.join(' · ') + '</div>';
    if (ready) {
      const b = document.createElement('button');
      b.className = 'save-btn';
      b.style.background = 'linear-gradient(135deg,#ffd700,#aa7700)';
      b.style.color = '#221100';
      b.textContent = '🎁 Reclamar';
      b.onclick = () => claimMission(m.id);
      card.appendChild(b);
    } else if (claimed) {
      const s = document.createElement('span');
      s.className = 'sb-info'; s.style.color = '#88ff88'; s.textContent = '¡Reclamada!';
      card.appendChild(s);
    }
    list.appendChild(card);
  });
}

// ---------------- Enganches ----------------
function wrap(name, after) {
  const orig = window[name];
  if (typeof orig !== 'function') return;
  window[name] = function () { const r = orig.apply(this, arguments); try { after.apply(this, arguments); } catch (e) {} return r; };
}
wrap('hideScreens', () => hideAll());
wrap('showMenu', () => refreshButtons());
wrap('advanceWave', () => {
  if (gameMode === 'infinite' && wave > mis.stats.maxWave) { mis.stats.maxWave = wave; saveMissions(); }
});

// v66: snapshot del almacén al entrar en modo dev
const origToggleDevMode = toggleDevMode;
window.toggleDevMode = function() {
  const wasDev = isDevMode();
  origToggleDevMode();
  const isNowDev = isDevMode();
  if (!wasDev && isNowDev) {
    snapshotStorage();
  } else if (wasDev && !isNowDev) {
    restoreStorage();
    if (screen === 'gacha') renderBanners();
    if (screen === 'storage') renderStorage();
    if (screen === 'missions') renderMissions();
    refreshButtons();
  }
};

// Arranque
buildUI();
refreshButtons();
})();