// ============================================================
// 09-achievements.js — v71: LOGROS
// · El botón ⬅ Volver de la pantalla de logros va al MENÚ DEL LIBRO
//   (backToBook → showBookMenu), no al hub.
// · Modo dev: NO desbloquea ni guarda logros.
// · resetAchievements() y window.showAch expuestos.
// · Tracking: jefes, oleadas, cañón, gatos, victorias, retos de nivel.
// ============================================================
(function () {
const ACH_KEY = 'catBattleAch';

// -------------------- CATÁLOGO --------------------
const ACH = [
  { id:'first_win',   emoji:'🎉', name:'Primera Victoria',     desc:'Gana tu primera batalla.' },
  { id:'wave10',      emoji:'🌊', name:'Marea Alta',           desc:'Llega a la oleada 10 en Infinito.' },
  { id:'wave20',      emoji:'🌊', name:'Marea Fuerte',         desc:'Llega a la oleada 20 en Infinito.' },
  { id:'wave30',      emoji:'🌊', name:'Marea Creciente',      desc:'Llega a la oleada 30 en Infinito.' },
  { id:'boss1',       emoji:'💀', name:'Cazajefes',            desc:'Derrota tu primer jefe.' },
  { id:'boss10',      emoji:'💀', name:'Terror de Jefes',      desc:'Derrota 10 jefes (acumulado).' },
  { id:'boss20',      emoji:'💀', name:'Extirminajefes',       desc:'Derrota 20 jefes (acumulado).' },
  { id:'story5',      emoji:'📖', name:'Primeros Pasos',       desc:'Supera el Nivel 5 de Historia.' },
  { id:'story15',     emoji:'📖', name:'Héroe en Formación',   desc:'Supera el Nivel 15 de Historia.' },
  { id:'story30',     emoji:'👑', name:'Mano Derecha',         desc:'Supera el Nivel 30 de Historia.' },
  { id:'story45',     emoji:'🏜️', name:'Dueño del Desierto',   desc:'Supera el Nivel 45 de Historia.' },
  { id:'event1',      emoji:'🎃', name:'Cazador de Fiestas',   desc:'Completa cualquier evento (3/3).' },
  { id:'legend5',     emoji:'🌟', name:'Novato Legendario',    desc:'Supera 5 Etapas de Leyenda.' },
  { id:'legend30',    emoji:'🌟', name:'Leyenda Viviente',     desc:'Supera las 30 Etapas de Leyenda.' },
  { id:'rich50',      emoji:'💰', name:'Acaparador',           desc:'Ten 50.000 XP a la vez.' },
  { id:'rich100',     emoji:'💰', name:'Magnate Gatuno',       desc:'Ten 100.000 XP a la vez.' },
  { id:'collector',   emoji:'🐱', name:'Colección Completa',   desc:'Desbloquea las 13 tropas.' },
  { id:'max_unit15',  emoji:'⬆️', name:'Maestro Gato',         desc:'Sube cualquier tropa al Nv.15.' },
  { id:'no_cannon',   emoji:'🚫', name:'Sin Artillería',       desc:'Gana un nivel sin usar el cañón.' },
  { id:'cannon50',    emoji:'💣', name:'Artillero',            desc:'Dispara el cañón 50 veces.' },
];

// -------------------- ESTADO --------------------
let data = load();
let track = resetTrack();
function load() {
  try {
    const o = JSON.parse(localStorage.getItem(ACH_KEY));
    if (o && typeof o === 'object') return { unlocked: o.unlocked || {}, stats: o.stats || {} };
  } catch (e) {}
  return { unlocked: {}, stats: {} };
}
function save() {
  if (isDevMode()) return;
  try { localStorage.setItem(ACH_KEY, JSON.stringify(data)); } catch (e) {}
}
function resetTrack() {
  return { cannonShots: 0, won: false };
}
function has(id) { return !!data.unlocked[id]; }
function bump(stat, n) { data.stats[stat] = (data.stats[stat] || 0) + (n || 1); }
function setMax(stat, v) { if (v > (data.stats[stat] || 0)) data.stats[stat] = v; }

// -------------------- TOAST --------------------
let toastEl = null, toastT = null;
function toast(a) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#ffd700,#aa7700);color:#221100;font-weight:bold;padding:10px 22px;border:3px solid #000;border-radius:12px;z-index:300;font-size:14px;box-shadow:0 4px 14px rgba(0,0,0,.5);';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = a.emoji + ' ¡Logro: ' + a.name + '!';
  toastEl.style.display = 'block';
  clearTimeout(toastT);
  toastT = setTimeout(() => { toastEl.style.display = 'none'; }, 3200);
  if (window.sfx) window.sfx('upgrade');
}
function tryUnlock(id) {
  if (isDevMode()) return;
  if (has(id)) return;
  const a = ACH.find(x => x.id === id);
  if (!a) return;
  data.unlocked[id] = Date.now();
  save();
  toast(a);
}

// -------------------- CHEQUEOS --------------------
function anyEventDone() { return Object.values(EVENTS).some(ev => (eventProgress[ev.id] || 0) >= ev.levels.length); }
function allUnitsUnlocked() { for (let i = 0; i < NUM_UNITS; i++) if (!isUnitUnlocked(i)) return false; return true; }
function maxUnitLevel() { let m = 0; for (let i = 0; i < NUM_UNITS; i++) m = Math.max(m, unitLevels[i]); return m; }
function checkPassive() {
  if ((data.stats.maxWave || 0) >= 10) tryUnlock('wave10');
  if ((data.stats.maxWave || 0) >= 20) tryUnlock('wave20');
  if ((data.stats.maxWave || 0) >= 30) tryUnlock('wave30');
  if ((data.stats.bossKills || 0) >= 1) tryUnlock('boss1');
  if ((data.stats.bossKills || 0) >= 10) tryUnlock('boss10');
  if ((data.stats.bossKills || 0) >= 20) tryUnlock('boss20');
  if (storyProgress >= 5) tryUnlock('story5');
  if (storyProgress >= 15) tryUnlock('story15');
  if (storyProgress >= 30) tryUnlock('story30');
  if (storyProgress >= 45) tryUnlock('story45');
  if (anyEventDone()) tryUnlock('event1');
  if (legendProgress >= 5) tryUnlock('legend5');
  if (legendProgress >= 30) tryUnlock('legend30');
  if (coins >= 50000) tryUnlock('rich50');
  if (coins >= 100000) tryUnlock('rich100');
  if (allUnitsUnlocked()) tryUnlock('collector');
  if (maxUnitLevel() >= 15) tryUnlock('max_unit15');
  if ((data.stats.cannonShots || 0) >= 50) tryUnlock('cannon50');
}
function onVictory() {
  tryUnlock('first_win');
  if (track.cannonShots === 0) tryUnlock('no_cannon');
  track = resetTrack();
  checkPassive();
}

// -------------------- WRAPS --------------------
function wrap(name, after) {
  const orig = window[name];
  if (typeof orig !== 'function') return;
  window[name] = function () { const r = orig.apply(this, arguments); try { after.apply(this, arguments); } catch (e) {} return r; };
}
wrap('startStory',  () => { track = resetTrack(); });
wrap('startEvent',  () => { track = resetTrack(); });
wrap('startLegend', () => { track = resetTrack(); });
wrap('startInfinite', () => { track = resetTrack(); });
wrap('fireCannon',  () => { track.cannonShots++; bump('cannonShots', 1); save(); checkPassive(); });
wrap('advanceWave', () => { setMax('maxWave', wave); save(); checkPassive(); });
// Detecta muertes de jefe por el texto flotante "DERROTADO"
wrap('addFloatingText', (x, y, text) => {
  if (typeof text === 'string' && text.indexOf('DERROTADO') >= 0) { bump('bossKills', 1); save(); checkPassive(); }
});
wrap('storyVictory',  () => onVictory());
wrap('eventVictory',  () => onVictory());
wrap('legendVictory', () => onVictory());

// -------------------- PANTALLA --------------------
let achScreen = null;
function buildUI() {
  achScreen = document.createElement('div');
  achScreen.className = 'screen';
  achScreen.style.display = 'none';
  achScreen.innerHTML =
    '<h2>🏆 LOGROS</h2>' +
    '<div class="menu-info" id="achInfo"></div>' +
    '<div id="achGrid" class="upgrade-grid" style="max-width:980px"></div>' +
    '<div class="best-foot"></div>';
  const foot = achScreen.querySelector('.best-foot');
  const b = document.createElement('button');
  b.className = 'back';
  b.textContent = '⬅ Volver a la Biblioteca';
  // v71: vuelve al MENÚ DEL LIBRO, no al hub
  b.onclick = function () {
    if (window.backToBook) window.backToBook();
    else if (window.showBookMenu) window.showBookMenu();
    else showMenu();
  };
  foot.appendChild(b);
  document.body.appendChild(achScreen);
}
function showAch() {
  hideScreens();
  if (achScreen) achScreen.style.display = 'flex';
  screen = 'achievements'; playing = false;
  checkPassive();
  renderAch();
}
function renderAch() {
  const info = document.getElementById('achInfo');
  const done = ACH.filter(a => has(a.id)).length;
  if (info) info.innerHTML = 'Desbloqueados: <b>' + done + '/' + ACH.length + '</b>' + (isDevMode() ? ' · <span style="color:#ff88ff">🔧 En modo dev no se desbloquean logros.</span>' : '');
  const grid = document.getElementById('achGrid');
  if (!grid) return;
  grid.innerHTML = '';
  ACH.forEach(a => {
    const un = has(a.id);
    const card = document.createElement('div');
    card.className = 'upg-card' + (un ? ' maxed' : ' lockedcard');
    card.style.textAlign = 'left';
    card.style.minWidth = '220px';
    card.innerHTML =
      '<div class="best-name">' + (un ? a.emoji : '🔒') + ' ' + a.name + '</div>' +
      '<div class="sb-info">' + a.desc + '</div>' +
      '<div class="sb-info" style="color:' + (un ? '#88ff88' : '#889') + '">' + (un ? '✅ Desbloqueado' : 'Pendiente') + '</div>';
    grid.appendChild(card);
  });
}

// -------------------- RESET --------------------
function resetAchievements() {
  if (!confirm('⚠️ ¿Reiniciar TODOS los logros? Se borrará el progreso de logros (no afecta al resto del juego).')) return;
  data = { unlocked: {}, stats: {} };
  track = resetTrack();
  try { localStorage.removeItem(ACH_KEY); } catch (e) {}
  save();
  if (achScreen && achScreen.style.display !== 'none') renderAch();
  setStatus('🏆 Logros reiniciados', '#ffaa00');
}

// -------------------- EXPOSICIÓN --------------------
window.showAch = showAch;
window.resetAchievements = resetAchievements;

// Arranque
buildUI();
checkPassive();
})();