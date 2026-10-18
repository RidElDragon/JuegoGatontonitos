// ============================================================
// 09-achievements.js — v42: SISTEMA DE LOGROS (SOLO PRESTIGIO)
// No otorgan mejoras: pura gloria gatuna. 🏆
// · Se guardan en localStorage ('catBattleAch').
// · NO se desbloquean en Modo Pruebas (sandbox) NI en Modo Dev.
// · Se engancha a funciones existentes sin modificarlas.
// · 🔧 Incluye resetAchievements() para reiniciar logros.
// ============================================================
(function () {
const ACH_KEY = 'catBattleAch';
let data = load();
function load() {
  try {
    const o = JSON.parse(localStorage.getItem(ACH_KEY));
    if (o && typeof o === 'object') return { unlocked: o.unlocked || {}, stats: o.stats || { bossKills: 0 } };
  } catch (e) {}
  return { unlocked: {}, stats: { bossKills: 0 } };
}
function save() { try { localStorage.setItem(ACH_KEY, JSON.stringify(data)); } catch (e) {} }
// ---------------- CATÁLOGO DE LOGROS ----------------
const ACH = [
  // Colección
  { id:'normales',   emoji:'🐱', name:'Gatotería Básica',        desc:'Desbloquea los 7 gatos normales (Historia Nv.10).' },
  { id:'todos',      emoji:'', name:'Colección Completa',      desc:'Desbloquea las 13 tropas del juego.' },
  // Historia
  { id:'story15',    emoji:'📖', name:'Héroe del Reino',         desc:'Supera el Nivel 15 (final de la Parte 1).' },
  { id:'story30',    emoji:'👑', name:'Mano Derecha del Rey',    desc:'Supera el Nivel 30 (final de la Parte 2).' },
  { id:'story45',    emoji:'️', name:'Dueño del Desierto',      desc:'Supera el Nivel 45 (final del Desierto Prohibido).' },
  // Eventos
  { id:'ev_h',       emoji:'', name:'Noche de Brujas Superada',desc:'Completa el evento 🎃 Noche de Halloween (3/3).' },
  { id:'ev_a',       emoji:'🛸', name:'Invasor Repelido',        desc:'Completa el evento 🛸 Invasión Alienígena (3/3).' },
  { id:'ev_i',       emoji:'🔥', name:'Infierno Cerrado',        desc:'Completa el evento 🔥 Incursión Infernal (3/3).' },
  { id:'ev_x',       emoji:'🎄', name:'Navidad Rescatada',       desc:'Completa el evento 🎄 Pesadilla Navideña (3/3).' },
  { id:'ev_all',     emoji:'🎭', name:'Turista de Cataclismos',  desc:'Completa los 4 eventos al 3/3.' },
  // Retos (sin ayudas / con restricciones)
  { id:'solo_basico_3',  emoji:'🐤', name:'Minimalista',         desc:'Supera el Nivel 3 usando SOLO al Gato Básico.' },
  { id:'no_cannon_15',   emoji:'🚫', name:'Sin Artillería',      desc:'Supera el Nivel 15 sin disparar el cañón.' },
  { id:'no_healer_30',   emoji:'💔', name:'Fe en el Equipo',     desc:'Supera el Nivel 30 sin invocar al Sanador.' },
  { id:'solo_normales_5',emoji:'⚔️', name:'A la Antigua',        desc:'Supera el Nivel 5 usando solo gatos normales (sin robos ni especiales).' },
  { id:'sin_retirar_10', emoji:'🛡️', name:'Ni un Paso Atrás',    desc:'Supera el Nivel 10 sin retirar ninguna tropa del campo.' },
  { id:'rapido_20',      emoji:'⏱️', name:'Velocista',           desc:'Supera el Nivel 20 en menos de 2 minutos.' },
  // Infinito y varios
  { id:'wave50',     emoji:'🌊', name:'Marea Alta',              desc:'Llega a la oleada 50 en Modo Infinito.' },
  { id:'wave100',    emoji:'🌀', name:'Tsunami',                 desc:'Llega a la oleada 100 en Modo Infinito.' },
  { id:'boss10',     emoji:'💀', name:'Cazajefes',               desc:'Derrota 10 jefes (acumulado, cualquier modo).' },
  { id:'coins_rich', emoji:'🐾', name:'Acaparador de Gatontitos',desc:'Ten 100.000  a la vez.' },
  { id:'max_unit',   emoji:'⬆️', name:'Maestro Gato',            desc:'Sube cualquier tropa al Nv.15.' },
  { id:'legend30',   emoji:'🌟', name:'Leyenda Viviente',        desc:'Completa las 30 Etapas de Leyenda.' },
];
// ---------------- Registro de la batalla en curso (para retos) ----------------
let track = resetTrack();
function resetTrack() { return { types: new Set(), cannon: 0, removed: 0, t0: performance.now() }; }
function isUnlocked(id) { return !!data.unlocked[id]; }
function countUnlocked() { return ACH.filter(a => data.unlocked[a.id]).length; }
// ---------------- Toast de desbloqueo ----------------
let toastEl = null;
function toast(a) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#222233;border:3px solid #ffd700;border-radius:10px;padding:10px 18px;z-index:200;display:none;text-align:center;box-shadow:0 0 20px rgba(255,215,0,.5);min-width:280px';
    document.body.appendChild(toastEl);
  }
  toastEl.innerHTML = `<div style="font-size:14px;font-weight:bold;color:#ffd700">🏆 ¡LOGRO DESBLOQUEADO!</div>
    <div style="font-size:13px;margin-top:4px">${a.emoji} <b>${a.name}</b></div>
    <div style="font-size:11px;color:#aabbcc;margin-top:2px">${a.desc}</div>`;
  toastEl.style.display = 'block';
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => { toastEl.style.display = 'none'; }, 3500);
}
function tryUnlock(id) {
  if (isTest()) return;               // en sandbox no se ganan logros
  if (isDevMode()) return;            // 🔧 en modo dev tampoco
  if (data.unlocked[id]) return;
  data.unlocked[id] = Date.now();
  save();
  const a = ACH.find(x => x.id === id);
  if (a) toast(a);
  if (window.sfx) { sfx('upgrade'); setTimeout(() => sfx('coin'), 180); }
  refreshMenuButton();
}
// ---------------- Comprobaciones ----------------
function checkPassive() {
  if (isTest()) return;
  if (isDevMode()) return;            // 🔧 no comprobar en modo dev
  let norm = true; for (let i = 0; i <= 6; i++) if (!isUnitUnlocked(i)) norm = false;
  if (norm) tryUnlock('normales');
  let all = true; for (let i = 0; i < NUM_UNITS; i++) if (!isUnitUnlocked(i)) all = false;
  if (all) tryUnlock('todos');
  if (storyProgress >= 15) tryUnlock('story15');
  if (storyProgress >= 30) tryUnlock('story30');
  if (storyProgress >= 45) tryUnlock('story45');
  const h = (eventProgress.halloween || 0) >= 3, a = (eventProgress.alien || 0) >= 3,
    i = (eventProgress.infernal || 0) >= 3, x = (eventProgress.xmas || 0) >= 3;
  if (h) tryUnlock('ev_h'); if (a) tryUnlock('ev_a'); if (i) tryUnlock('ev_i'); if (x) tryUnlock('ev_x');
  if (h && a && i && x) tryUnlock('ev_all');
  if (coins >= 100000) tryUnlock('coins_rich');
  if (unitLevels.some(l => l >= 15)) tryUnlock('max_unit');
  if ((data.stats.bossKills || 0) >= 10) tryUnlock('boss10');
  if (legendProgress >= 30) tryUnlock('legend30');
}
function checkStoryChallenges() {
  if (isTest() || isDevMode() || gameMode !== 'story') return;  // 🔧
  const li = storyLevelIdx;
  if (li === 2  && track.types.size === 1 && track.types.has(0)) tryUnlock('solo_basico_3');
  if (li === 14 && track.cannon === 0) tryUnlock('no_cannon_15');
  if (li === 29 && track.types.size > 0 && !track.types.has(5)) tryUnlock('no_healer_30');
  if (li === 4  && track.types.size > 0 && [...track.types].every(t => t <= 6)) tryUnlock('solo_normales_5');
  if (li === 9  && track.removed === 0) tryUnlock('sin_retirar_10');
  if (li === 19 && (performance.now() - track.t0) < 120000) tryUnlock('rapido_20');
}
// ---------------- Pantalla de logros ----------------
let achBtn = null, achScreen = null;
function buildUI() {
  const menu = document.getElementById('menuScreen');
  if (menu) {
    achBtn = document.createElement('button');
    achBtn.className = 'menu-btn';
    achBtn.style.background = 'linear-gradient(135deg, #ffcc44, #886600)';
    achBtn.style.color = '#221100';
    achBtn.onclick = showAch;
    const resetBtn = menu.querySelector('.reset-all');
    if (resetBtn) menu.insertBefore(achBtn, resetBtn); else menu.appendChild(achBtn);
  }
  achScreen = document.createElement('div');
  achScreen.className = 'screen';
  achScreen.style.display = 'none';
  achScreen.innerHTML = `<h2> LOGROS</h2>
    <div class="menu-info" id="achInfo"></div>
    <div id="achGrid" class="upgrade-grid" style="max-width:980px"></div>
    <button class="back" onclick="showMenu()">⬅ Volver al menú</button>`;
  document.body.appendChild(achScreen);
}
function refreshMenuButton() {
  if (achBtn) achBtn.textContent = `🏆 Logros (${countUnlocked()}/${ACH.length})`;
}
function showAch() {
  hideScreens();
  if (achScreen) achScreen.style.display = 'flex';
  screen = 'ach'; playing = false;
  renderGrid();
}
function renderGrid() {
  const info = document.getElementById('achInfo');
  if (info) info.innerHTML = `Desbloqueados: <b style="color:#ffd700">${countUnlocked()}/${ACH.length}</b> · 💀 Jefes derrotados: <b>${data.stats.bossKills || 0}</b><br><span style="font-size:11px">Los logros son solo prestigio: no dan ventajas. No cuentan en 🧪 sandbox ni en 🔧 modo dev.</span>`;
  const grid = document.getElementById('achGrid');
  if (!grid) return;
  grid.innerHTML = '';
  ACH.forEach(a => {
    const done = isUnlocked(a.id);
    const b = document.createElement('button');
    b.className = 'upg-card' + (done ? ' maxed' : '');
    b.disabled = true; // solo exhibición
    b.style.border = done ? '2px solid #ffd700' : '2px solid #444';
    b.style.boxShadow = done ? '0 0 10px rgba(255,215,0,.5)' : '';
    b.style.textAlign = 'left';
    b.innerHTML = `${done ? '✅' : ''} ${a.emoji} <b>${a.name}</b>
      <span class="sb-info">${a.desc}</span>
      <span class="sb-info" style="color:${done ? '#88ff88' : '#778'}">${done ? '¡Conseguido!' : 'Bloqueado'}</span>`;
    grid.appendChild(b);
  });
}
// ---------------- Enganches ----------------
function wrap(name, after) {
  const orig = window[name];
  if (typeof orig !== 'function') return;
  window[name] = function () {
    const r = orig.apply(this, arguments);
    try { after.apply(this, arguments); } catch (e) {}
    return r;
  };
}
wrap('hideScreens',    () => { if (achScreen) achScreen.style.display = 'none'; });
wrap('startStory',     () => { track = resetTrack(); });
wrap('startEvent',     () => { track = resetTrack(); });
wrap('startLegend',    () => { track = resetTrack(); });
wrap('startInfinite',  () => { track = resetTrack(); });
wrap('continueInfinite',() => { track = resetTrack(); });
wrap('spawnCat',       (t) => { if (!isTest() && !isDevMode()) track.types.add(t); });
wrap('fireCannon',     () => { if (!isTest() && !isDevMode()) track.cannon++; });
wrap('removeCat',      () => { if (!isTest() && !isDevMode()) track.removed++; });
wrap('retreatAll',     () => { if (!isTest() && !isDevMode()) track.removed++; });
wrap('storyVictory',   () => { checkStoryChallenges(); checkPassive(); });
wrap('eventVictory',   () => { checkPassive(); });
wrap('advanceWave',    () => {
  if (!isTest() && !isDevMode() && gameMode === 'infinite') {
    if (wave >= 50) tryUnlock('wave50');
    if (wave >= 100) tryUnlock('wave100');
  }
});
wrap('addFloatingText', (x, y, txt) => {
  if (typeof txt === 'string' && txt.includes('DERROTADO') && !isTest() && !isDevMode()) {
    data.stats.bossKills = (data.stats.bossKills || 0) + 1;
    save();
    if (data.stats.bossKills >= 10) tryUnlock('boss10');
  }
});
wrap('showMenu', () => { checkPassive(); refreshMenuButton(); });

// ============================================================
// 🔧 RESET DE LOGROS (expuesto globalmente)
// ============================================================
function resetAchievements() {
  if (!confirm('⚠️ ¿Seguro que quieres reiniciar TODOS los logros?\n\nSe borrarán:\n· Todos los logros desbloqueados\n· Contador de jefes derrotados\n\nEsta acción no se puede deshacer.')) return;
  if (!confirm('🔁 Confirmación final: ¿reiniciar logros desde cero?')) return;
  data = { unlocked: {}, stats: { bossKills: 0 } };
  save();
  refreshMenuButton();
  if (screen === 'ach') renderGrid();
  setStatus('🏆 Logros reiniciados', '#ffaa00');
}
window.resetAchievements = resetAchievements;

// Arranque
buildUI();
refreshMenuButton();
})();