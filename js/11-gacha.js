// ============================================================
// 11-gacha.js — v91: BANNERS, 📦 ALMACÉN y 📜 MISIONES
// · v91: el ALMACÉN apila por TIPO a nivel global (el banner de
//   origen es solo informativo: 🎫×7 · 💠×16 · 🎟×14).
// · v90: el 28% de BASE sale SIEMPRE; base al tope se conserva.
// · v89b: ítems idénticos AGRUPADOS (×N).
// · v89: el +1 nivel EXTRA sale con su probabilidad aunque la
//   unidad esté al tope 🎰; al tope se CONSERVA (no se reembolsa).
// · v79f: cada botón del hub abre SOLO su banner (1 tarjeta).
// · v79e: cada ítem recuerda su banner de origen.
// · v79: misiones con CONSUMIBLES vía campo `items`.
// · 🧪 sandbox bloqueado · 🔧 dev prueba sin guardar.
// ============================================================
(function () {
const STORE_KEY = 'catBattleStorage';
const MIS_KEY = 'catBattleMissions';
const UNLOCK_LEVEL = 10;
let storage = loadStorage();
let mis = loadMissions();
let storageSnapshot = null;
let focusBanner = 'normal';

function loadStorage() { try { const o = JSON.parse(localStorage.getItem(STORE_KEY)); return Array.isArray(o) ? o : []; } catch (e) { return []; } }
function saveStorage() { if (isDevMode()) return; try { localStorage.setItem(STORE_KEY, JSON.stringify(storage)); } catch (e) {} }
function loadMissions() {
  try { const o = JSON.parse(localStorage.getItem(MIS_KEY)); if (o && typeof o === 'object') return { claimed: o.claimed || {}, stats: Object.assign({ pulls: 0, applies: 0, maxWave: 0 }, o.stats || {}) }; } catch (e) {}
  return { claimed: {}, stats: { pulls: 0, applies: 0, maxWave: 0 } };
}
function saveMissions() { if (isDevMode()) return; try { localStorage.setItem(MIS_KEY, JSON.stringify(mis)); } catch (e) {} }
function blocked() { return isTest(); }
function gachaUnlocked() { return isDevMode() || storyProgress >= UNLOCK_LEVEL; }
function snapshotStorage() { storageSnapshot = storage.map(s => Object.assign({}, s)); }
function restoreStorage() { if (storageSnapshot) { storage = storageSnapshot.map(s => Object.assign({}, s)); storageSnapshot = null; } }
function storedCount(kind, idx) { let n = 0; for (const s of storage) if (s.kind === kind && (idx === undefined || s.idx === idx)) n++; return n; }

function mkItem(kind, idx, banner) { return { uid: Date.now() + '-' + Math.random().toString(36).slice(2, 8), kind: kind, idx: idx, banner: banner || null }; }

function itemLabel(it) {
  if (it.kind === 'unlock') return '🔓 Desbloquear tropa: ' + (UNIT_EMOJI[it.idx] || '🐱') + ' ' + CAT_BASE[it.idx].name;
  if (it.kind === 'unitLvl') return '⬆️ +1 nivel EXTRA: ' + (UNIT_EMOJI[it.idx] || '🐱') + ' ' + CAT_BASE[it.idx].name + ' (llevas +' + Math.min(gachaLevels[it.idx] || 0, GACHA_LVL_MAX) + '/' + GACHA_LVL_MAX + ')';
  return '🏰 +1 nivel de BASE (+' + BASE_HP_PER_LEVEL + ' HP máx · Nv.' + baseLevel + '/' + BASE_GACHA_MAX + ')';
}
function itemRefund(it) {
  if (it.kind === 'base') return 800;
  if (it.kind === 'unlock') return 1200;
  return (GACHA_RARE_POOL.includes(it.idx) || GACHA_EVENT_POOL.includes(it.idx)) ? 1500 : 400;
}

// Agrupar ítems idénticos por tipo (IGNORANDO el banner) + desglose de origen
function groupKey(it){ return it.kind + ':' + (it.idx === undefined ? '-' : it.idx); }
function groupItems(list){
  const map = {}; const order = [];
  list.forEach(it => {
    const k = groupKey(it);
    if (!map[k]) { map[k] = { kind: it.kind, idx: it.idx, banner: it.banner, count: 0, uids: [], byBanner: {} }; order.push(k); }
    map[k].count++; map[k].uids.push(it.uid);
    const b = it.banner || 'legacy';
    map[k].byBanner[b] = (map[k].byBanner[b] || 0) + 1;
  });
  return order.map(k => map[k]);
}

// Probabilidades intactas: 72% tropa (unitLvl de la elegida, o unlock)
// · 28% base SIEMPRE (se acumula como stock si algún día está al tope).
function rollItem(pool, banner) {
  const r = Math.random();
  if (r < 0.72) {
    const idx = pool[Math.floor(Math.random() * pool.length)];
    const willUnlock = !isUnitUnlocked(idx) && !gachaUnlocked[idx] && storedCount('unlock', idx) === 0;
    if (willUnlock) return mkItem('unlock', idx, banner);
    return mkItem('unitLvl', idx, banner);
  }
  return mkItem('base', undefined, banner);
}

const BANNER_META = {
  normal: { icon:'🎫', title:'🎫 Banner Normal',    pool:GACHA_NORMAL_POOL, grad:'linear-gradient(135deg,#88aacc,#335577)', desc:'Gatos normales. 72% tropa · 28% base.' },
  rare:   { icon:'💠', title:'💠 Banner Raro',      pool:GACHA_RARE_POOL,   grad:'linear-gradient(135deg,#cc88ff,#552288)', desc:'Unidades especiales. 72% tropa · 28% base.' },
  event:  { icon:'🎟', title:'🎟 Banner de Evento', pool:GACHA_EVENT_POOL,  grad:'linear-gradient(135deg,#ff8866,#882200)', desc:'Tropas exclusivas de eventos. 72% tropa · 28% base.' },
};
function ticketsFor(key) { return isDevMode() ? Infinity : (key === 'rare' ? ticketsRare : (key === 'event' ? ticketsEvent : ticketsNormal)); }

function doPull(banner) {
  if (blocked()) { setStatus('❌ En sandbox los banners no están disponibles', '#ff6666'); return; }
  if (!isDevMode()) {
    if (banner === 'event') { if (ticketsEvent <= 0) { setStatus('❌ No te quedan tickets 🎟', '#ff6666'); return; } ticketsEvent--; }
    else if (banner === 'rare') { if (ticketsRare <= 0) { setStatus('❌ No te quedan tickets 💠', '#ff6666'); return; } ticketsRare--; }
    else { if (ticketsNormal <= 0) { setStatus('❌ No te quedan tickets 🎫', '#ff6666'); return; } ticketsNormal--; }
  }
  mis.stats.pulls++; saveMissions();
  const meta = BANNER_META[banner];
  const item = rollItem(meta.pool, banner);
  storage.push(item); saveStorage(); saveMeta();
  if (window.sfx) { sfx('spawn'); setTimeout(() => sfx('upgrade'), 200); }
  renderBanners();
}

// Al tope (🎰 o base) NO se aplica NI se reembolsa: se conserva como stock.
function applyItem(uid) {
  if (blocked()) { setStatus('❌ En sandbox el almacén no está disponible', '#ff6666'); return; }
  const i = storage.findIndex(s => s.uid === uid); if (i < 0) return;
  const it = storage[i];
  if (it.kind === 'unlock') {
    gachaUnlocked[it.idx] = true;
  } else if (it.kind === 'unitLvl') {
    if ((gachaLevels[it.idx] || 0) >= GACHA_LVL_MAX) {
      setStatus('⬆️ ' + CAT_BASE[it.idx].name + ' ya está al tope 🎰 (+' + GACHA_LVL_MAX + '). El ítem se guarda sin usar.', '#ffaa00');
      return;
    }
    gachaLevels[it.idx] = (gachaLevels[it.idx] || 0) + 1;
  } else if (it.kind === 'base') {
    if (baseLevel >= BASE_GACHA_MAX) {
      setStatus('🏰 La BASE ya está al tope (Nv.' + BASE_GACHA_MAX + '). El ítem se guarda sin usar.', '#ffaa00');
      return;
    }
    baseLevel++;
  }
  storage.splice(i, 1); mis.stats.applies++; saveMissions(); saveStorage(); saveMeta();
  if (window.sfx) sfx('upgrade');
  renderStorage(); renderBanners();
}
function discardItem(uid) {
  if (blocked()) { setStatus('❌ En sandbox el almacén no está disponible', '#ff6666'); return; }
  const i = storage.findIndex(s => s.uid === uid); if (i < 0) return;
  coins += itemRefund(storage[i]); storage.splice(i, 1);
  saveStorage(); saveMeta();
  if (window.sfx) sfx('coin');
  renderStorage(); renderBanners();
}

function achBossKills() { try { const o = JSON.parse(localStorage.getItem('catBattleAch')); return (o && o.stats && o.stats.bossKills) || 0; } catch (e) { return 0; } }
function anyEventDone() { return Object.values(EVENTS).some(ev => (eventProgress[ev.id] || 0) >= ev.levels.length); }

const MISSIONS = [
  { id:'m_story5', name:'📖 Primeros Pasos', desc:'Supera el Nivel 5 de Historia.', coins:3000, tn:1, tr:0, check:() => storyProgress >= 5 },
  { id:'m_story15', name:'📖 Héroe en Formación', desc:'Supera el Nivel 15 de Historia.', coins:8000, tn:2, tr:0, check:() => storyProgress >= 15 },
  { id:'m_story30', name:'👑 Mano Derecha', desc:'Supera el Nivel 30 de Historia.', coins:20000, tn:0, tr:1, check:() => storyProgress >= 30 },
  { id:'m_story45', name:'🏜️ Dueño del Desierto', desc:'Supera el Nivel 45 de Historia.', coins:50000, tn:0, tr:2, check:() => storyProgress >= 45 },
  { id:'m_event1', name:'🎃 Cazador de Fiestas', desc:'Completa cualquier evento (3/3).', coins:10000, tn:0, tr:1, check:() => anyEventDone() },
  { id:'m_legend5', name:'🌟 Novato Legendario', desc:'Supera 5 Etapas de Leyenda.', coins:15000, tn:2, tr:0, check:() => legendProgress >= 5 },
  { id:'m_legend15', name:'🌟 Veterano Legendario', desc:'Supera 15 Etapas de Leyenda.', coins:40000, tn:0, tr:2, check:() => legendProgress >= 15 },
  { id:'m_legend30', name:'🌟 Leyenda Viviente', desc:'Supera las 30 Etapas de Leyenda.', coins:100000, tn:0, tr:5, check:() => legendProgress >= 30 },
  { id:'m_boss5', name:'💀 Cazarrecompensas', desc:'Derrota 5 jefes (acumulado).', coins:5000, tn:1, tr:0, check:() => achBossKills() >= 5 },
  { id:'m_boss20', name:'💀 Terror de Jefes', desc:'Derrota 20 jefes (acumulado).', coins:25000, tn:0, tr:2, check:() => achBossKills() >= 20 },
  { id:'m_wave30', name:'🌊 Marea Creciente', desc:'Llega a la oleada 30 en Infinito.', coins:8000, tn:1, tr:0, check:() => mis.stats.maxWave >= 30 },
  { id:'m_pull5', name:'🎰 Cliente Frecuente', desc:'Usa 5 tickets en los banners.', coins:4000, tn:1, tr:0, check:() => mis.stats.pulls >= 5 },
  { id:'m_pull20', name:'🎰 Adicto al Gacha', desc:'Usa 20 tickets en los banners.', coins:15000, tn:0, tr:2, check:() => mis.stats.pulls >= 20 },
  { id:'m_apply5', name:'📦 Logística Felina', desc:'Aplica 5 mejoras del Almacén.', coins:6000, tn:1, tr:0, check:() => mis.stats.applies >= 5 },
  { id:'m_rich50', name:'💰 Ahorrador', desc:'Ten 50.000 XP a la vez.', coins:0, tn:0, tr:2, check:() => coins >= 50000 },
  { id:'m_story10', name:'📖 Explorador', desc:'Supera el Nivel 10 de Historia.', coins:6000, tn:1, tr:0, items:{ radar:1 }, check:() => storyProgress >= 10 },
  { id:'m_story20', name:'📖 Veterano', desc:'Supera el Nivel 20 de Historia.', coins:12000, tn:0, tr:1, items:{ speed:1 }, check:() => storyProgress >= 20 },
  { id:'m_story40', name:'📖 Casi Leyenda', desc:'Supera el Nivel 40 de Historia.', coins:30000, tn:0, tr:1, items:{ rich:1, sabelotodo:1 }, check:() => storyProgress >= 40 },
  { id:'m_boss10', name:'💀 Cazajefes', desc:'Derrota 10 jefes (acumulado).', coins:15000, tn:0, tr:1, items:{ cpu:1 }, check:() => achBossKills() >= 10 },
  { id:'m_legend10', name:'🌟 Explorador Legendario', desc:'Supera 10 Etapas de Leyenda.', coins:30000, tn:0, tr:2, items:{ sniper:1 }, check:() => legendProgress >= 10 },
];
function claimMission(id) {
  if (blocked()) { setStatus('❌ En sandbox las misiones no están disponibles', '#ff6666'); return; }
  const m = MISSIONS.find(x => x.id === id);
  if (!m || mis.claimed[id] || !m.check()) return;
  mis.claimed[id] = Date.now();
  coins += m.coins; ticketsNormal += m.tn; ticketsRare += m.tr;
  let itemMsg = '';
  if (m.items && window.addConsumable) {
    for (const k in m.items) {
      window.addConsumable(k, m.items[k]);
      const d = CONSUMABLE_DEFS[k];
      if (d) itemMsg += ' ' + d.emoji + 'x' + m.items[k];
    }
  }
  saveMissions(); saveMeta();
  if (window.sfx) { sfx('coin'); setTimeout(() => sfx('upgrade'), 150); }
  if (itemMsg && window.toastMsg) window.toastMsg('🎁 Recompensa extra:' + itemMsg, '#88ff88');
  renderMissions();
}
function claimableCount() { return MISSIONS.filter(m => !mis.claimed[m.id] && m.check()).length; }

let gScreen = null, sScreen = null, mScreen = null;
function mkScreen(title, listId) {
  const d = document.createElement('div');
  d.className = 'screen'; d.style.display = 'none';
  d.innerHTML = '<h2>' + title + '</h2><div class="menu-info" id="' + listId + 'Info"></div><div id="' + listId + '" class="upgrade-grid" style="max-width:980px"></div><div class="best-foot"></div>';
  const foot = d.querySelector('.best-foot');
  const b = document.createElement('button'); b.className = 'back'; b.textContent = '⬅ Volver'; b.onclick = showMenu;
  foot.appendChild(b); document.body.appendChild(d); return d;
}
function buildUI() {
  gScreen = mkScreen('🎰 BANNERS DE TROPAS', 'gachaList');
  sScreen = mkScreen('📦 ALMACÉN DE MEJORAS', 'storageList');
  mScreen = mkScreen('📜 MISIONES', 'missionList');
}
function hideAll() { if (gScreen) gScreen.style.display = 'none'; if (sScreen) sScreen.style.display = 'none'; if (mScreen) mScreen.style.display = 'none'; }

function showBanners(focus) {
  leaveTestIfNeeded();
  if (!gachaUnlocked()) { setStatus('🔒 Se desbloquea al superar Historia Nivel ' + UNLOCK_LEVEL, '#ffaa00'); return; }
  focusBanner = focus || 'normal';
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

// Tarjeta por GRUPO global (stack por tipo), con desglose de origen
function storageCard(g) {
  const sample = { kind: g.kind, idx: g.idx };
  const icons = { normal:'🎫', rare:'💠', event:'🎟', legacy:'📦' };
  const origen = Object.keys(g.byBanner || {}).map(b => (icons[b] || '·') + '×' + g.byBanner[b]).join(' · ');
  const card = document.createElement('div');
  card.className = 'upg-card'; card.style.textAlign = 'left'; card.style.minWidth = '300px';
  card.innerHTML =
    '<div class="best-name">' + (g.count > 1 ? '×' + g.count + ' · ' : '') + itemLabel(sample) + '</div>' +
    '<div class="sb-info">En stock: ' + g.count + ' · Origen: ' + origen + ' · Descarte unitario: +' + itemRefund(sample) + ' XP</div>';
  const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;';
  const ap = document.createElement('button');
  ap.className = 'save-btn'; ap.style.background = 'linear-gradient(135deg,#88ff88,#228822)';
  ap.textContent = '✅ Aplicar 1'; ap.disabled = blocked(); ap.onclick = () => applyItem(g.uids[0]);
  const di = document.createElement('button');
  di.className = 'save-btn'; di.style.background = 'linear-gradient(135deg,#ff8844,#884400)';
  di.textContent = '🗑️ Descartar 1 (+' + itemRefund(sample) + ' XP)'; di.disabled = blocked(); di.onclick = () => discardItem(g.uids[0]);
  row.appendChild(ap); row.appendChild(di); card.appendChild(row);
  return card;
}

function buildBannerCard(key) {
  const bn = BANNER_META[key];
  const tickets = ticketsFor(key);
  const card = document.createElement('div');
  card.className = 'upg-card'; card.id = 'banner-' + key;
  card.style.background = bn.grad; card.style.minWidth = '300px'; card.style.maxWidth = '520px';
  card.style.margin = '0 auto'; card.style.textAlign = 'left';
  card.innerHTML =
    '<div class="best-name">' + bn.title + '</div>' +
    '<div class="sb-info">' + bn.desc + '</div>' +
    '<div class="sb-info">Pool: ' + bn.pool.map(i => UNIT_EMOJI[i] || '🐱').join(' ') + '</div>' +
    '<div class="sb-info">Tickets de este banner: <b>' + (isDevMode() ? '∞' : tickets) + '</b></div>';
  const pull = document.createElement('button');
  pull.className = 'save-btn'; pull.style.cssText = 'margin-top:6px;font-size:13px;padding:8px 14px;';
  pull.disabled = blocked(); pull.textContent = '🎰 Usar 1 ticket (' + bn.icon + ')';
  pull.onclick = () => doPull(key);
  card.appendChild(pull);
  const pend = storage.filter(s => s.banner === key);
  const box = document.createElement('div');
  box.style.cssText = 'margin-top:8px;border-top:1px solid rgba(255,255,255,.3);padding-top:5px';
  if (!pend.length) {
    box.innerHTML = '<div class="sb-info" style="opacity:.75">Sin premios pendientes de este banner.</div>';
  } else {
    box.innerHTML = '<div class="sb-info" style="font-weight:bold;color:#fff">📦 Pendientes de este banner (' + pend.length + '):</div>';
    groupItems(pend).forEach(g => {
      const d = document.createElement('div');
      d.className = 'sb-info'; d.style.cssText = 'font-size:11px;padding:2px 0;border-bottom:1px dotted rgba(255,255,255,.18);color:#fff';
      d.textContent = (g.count > 1 ? '×' + g.count + ' · ' : '') + itemLabel({ kind: g.kind, idx: g.idx });
      box.appendChild(d);
    });
    const goBtn = document.createElement('button');
    goBtn.className = 'save-btn'; goBtn.style.cssText = 'margin-top:6px;font-size:11px;padding:5px 10px;background:linear-gradient(135deg,#223344,#112233);color:#fff';
    goBtn.textContent = '📦 Gestionar en el Almacén';
    goBtn.onclick = () => showStorage();
    box.appendChild(goBtn);
  }
  card.appendChild(box);
  return card;
}
function renderBanners() {
  const key = focusBanner || 'normal';
  const bn = BANNER_META[key];
  const info = document.getElementById('gachaListInfo');
  if (info) {
    const tickets = isDevMode() ? '∞' : ticketsFor(key);
    info.innerHTML = bn.title + ' · Tickets disponibles: <b>' + tickets + '</b> · Cada premio que saques se guarda en el 📦 Almacén.' +
      (isDevMode() ? ' <span style="color:#ff88ff">🔧 Modo dev: tickets ∞, nada se guarda.</span>' : '');
  }
  const list = document.getElementById('gachaList'); if (!list) return;
  list.innerHTML = '';
  list.appendChild(buildBannerCard(key));
}

// v91: stack GLOBAL por tipo (una tarjeta por mejora, sin secciones por banner)
function renderStorage() {
  const info = document.getElementById('storageListInfo');
  if (info) info.innerHTML = 'Pendientes: <b>' + storage.length + '</b> · Apilados por tipo (el origen es solo informativo). Aplica (permanente) o descarta por XP.' + (isDevMode() ? ' <span style="color:#ff88ff">🔧 Modo dev: nada se guarda.</span>' : '');
  const list = document.getElementById('storageList'); if (!list) return;
  list.innerHTML = '';
  if (!storage.length) { const h = document.createElement('div'); h.className = 'best-section'; h.textContent = 'Almacén vacío: usa tickets en los 🎰 Banners.'; list.appendChild(h); return; }
  groupItems(storage).forEach(g => list.appendChild(storageCard(g)));
}

function renderMissions() {
  const info = document.getElementById('missionListInfo');
  const done = MISSIONS.filter(m => mis.claimed[m.id]).length;
  if (info) info.innerHTML = 'Completadas: <b>' + done + '/' + MISSIONS.length + '</b> · Reclama XP, tickets y consumibles.' + (isDevMode() ? ' <span style="color:#ff88ff">🔧 Modo dev: nada se guarda.</span>' : '');
  const list = document.getElementById('missionList'); if (!list) return;
  list.innerHTML = '';
  MISSIONS.forEach(m => {
    const claimed = !!mis.claimed[m.id];
    let ready = false;
    try { ready = m.check(); } catch (e) { ready = false; }
    const card = document.createElement('div');
    card.className = 'upg-card' + (claimed ? ' maxed' : ''); card.style.textAlign = 'left'; card.style.minWidth = '300px';
    const reward = [];
    if (m.coins) reward.push(m.coins + ' XP');
    if (m.tn) reward.push(m.tn + ' 🎫');
    if (m.tr) reward.push(m.tr + ' 💠');
    if (m.items) { for (const k in m.items) { const d = CONSUMABLE_DEFS[k]; if (d) reward.push(d.emoji + 'x' + m.items[k]); } }
    card.innerHTML =
      '<div class="best-name">' + (claimed ? '✅' : ready ? '🎯' : '🔒') + ' ' + m.name + '</div>' +
      '<div class="sb-info">' + m.desc + '</div>' +
      '<div class="sb-info">Recompensa: ' + reward.join(' · ') + '</div>';
    if (ready && !claimed) { const b = document.createElement('button'); b.className = 'save-btn'; b.style.background = 'linear-gradient(135deg,#ffd700,#aa7700)'; b.style.color = '#221100'; b.textContent = '🎁 Reclamar'; b.onclick = () => claimMission(m.id); card.appendChild(b); }
    else if (claimed) { const s = document.createElement('span'); s.className = 'sb-info'; s.style.color = '#88ff88'; s.textContent = '¡Reclamada!'; card.appendChild(s); }
    list.appendChild(card);
  });
}

function wrap(name, after) { const orig = window[name]; if (typeof orig !== 'function') return; window[name] = function () { const r = orig.apply(this, arguments); try { after.apply(this, arguments); } catch (e) {} return r; }; }
wrap('hideScreens', () => hideAll());
const origToggleDevMode = window.toggleDevMode;
window.toggleDevMode = function () {
  const wasDev = isDevMode(); origToggleDevMode(); const isNowDev = isDevMode();
  if (!wasDev && isNowDev) snapshotStorage();
  else if (wasDev && !isNowDev) { restoreStorage(); if (screen === 'gacha') renderBanners(); if (screen === 'storage') renderStorage(); if (screen === 'missions') renderMissions(); }
};
function setBattleChrome(on) { document.body.classList.toggle('in-battle', !!on); }
['showTitle','showCarousel','showChapters','showHub','showUpgrades','showTroops','showAch','showBookMenu','showGatopedia','showEnemyBook','showBanners','showStorage','showMissions'].forEach(f => wrap(f, () => { if (window.AudioSys && AudioSys.setMusic) AudioSys.setMusic('menu'); setBattleChrome(false); }));
wrap('showGame', () => setBattleChrome(true));
wrap('showHub', () => setBattleChrome(true));
window.showBanners = showBanners; window.showStorage = showStorage; window.showMissions = showMissions;
window.renderBanners = renderBanners; window.renderStorage = renderStorage; window.renderMissions = renderMissions;
buildUI();
})();