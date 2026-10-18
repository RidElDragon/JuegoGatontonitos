// ============================================================
// 03-save.js — Persistencia en localStorage (v62)
// · v62 FIX ANTI-PÉRDIDA: saveMeta() VALIDA los datos antes de
//   escribir y mantiene una COPIA DE SEGURIDAD ('catBattleMetaBak')
//   con el último valor bueno. Si al cargar el guardado principal
//   está vacío o corrupto, se restaura desde la copia solo.
// · El modo desarrollador y el sandbox siguen sin guardar NADA.
// ============================================================
let memorySave = null;
let localStorageOK = true;
const META_KEY = 'catBattleMeta';
const META_BAK_KEY = 'catBattleMetaBak';

// ---------------- Validación de meta ----------------
function metaObjIsValid(m) {
  if (!m || typeof m !== 'object') return false;
  if (typeof m.coins !== 'number' || !isFinite(m.coins) || m.coins < 0) return false;
  if (!Array.isArray(m.unitLevels) || m.unitLevels.length !== NUM_UNITS) return false;
  for (let i = 0; i < NUM_UNITS; i++) {
    const v = m.unitLevels[i];
    if (typeof v !== 'number' || !isFinite(v) || v < 1) return false;
  }
  const nums = ['incomeLevel', 'cannonDmgLevel', 'cannonRangeLevel', 'cannonCdLevel', 'coinBonusLevel'];
  for (const k of nums) {
    if (typeof m[k] !== 'number' || !isFinite(m[k]) || m[k] < 0) return false;
  }
  return true;
}
function readMetaObj() {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return null;
    const m = JSON.parse(raw);
    return metaObjIsValid(m) ? m : null;
  } catch (e) { return null; }
}
function readMetaBackupObj() {
  try {
    const raw = localStorage.getItem(META_BAK_KEY);
    if (!raw) return null;
    const m = JSON.parse(raw);
    return metaObjIsValid(m) ? m : null;
  } catch (e) { return null; }
}
function applyMetaObj(m) {
  coins = m.coins;
  const padded = padUnitArray(m.unitLevels);
  for (let i = 0; i < NUM_UNITS; i++) unitLevels[i] = clamp(padded[i] || 1, 1, MAX_STATS);
  incomeLevel      = clamp(m.incomeLevel, 1, MAX_INCOME_LEVEL);
  cannonDmgLevel   = clamp(m.cannonDmgLevel, 1, CANNON_DMG_MAX);
  cannonRangeLevel = clamp(m.cannonRangeLevel, 1, CANNON_RANGE_MAX);
  cannonCdLevel    = clamp(m.cannonCdLevel, 1, CANNON_CD_MAX);
  coinBonusLevel   = clamp(m.coinBonusLevel || 0, 0, COIN_BONUS_MAX);
}

// --- Meta (coins + mejoras permanentes) ---
function saveMeta() {
  if (isTest()) return;
  if (isDevMode()) return;  // 🔧 NO guardar en modo desarrollador
  const obj = {
    coins, unitLevels: unitLevels.slice(), incomeLevel,
    cannonDmgLevel, cannonRangeLevel, cannonCdLevel, coinBonusLevel
  };
  // v62: NUNCA sobrescribir el guardado con datos inválidos
  if (!metaObjIsValid(obj)) {
    setStatus('⚠️ Guardado de mejoras omitido (datos inválidos)', '#ffaa00');
    return;
  }
  baseMeta = snapshotMeta();
  try {
    // rotar copia: el valor bueno actual pasa a ser el backup
    const currentRaw = localStorage.getItem(META_KEY);
    if (currentRaw) {
      try {
        const cur = JSON.parse(currentRaw);
        if (metaObjIsValid(cur)) localStorage.setItem(META_BAK_KEY, currentRaw);
      } catch (e) {}
    }
    localStorage.setItem(META_KEY, JSON.stringify(obj));
  } catch (e) {}
}
function loadMeta() {
  const m = readMetaObj();
  if (m) { applyMetaObj(m); return; }
  // principal vacío/corrupto → intentar la copia de seguridad
  const bak = readMetaBackupObj();
  if (bak) {
    applyMetaObj(bak);
    try { localStorage.setItem(META_KEY, JSON.stringify(bak)); } catch (e) {}
    setTimeout(() => setStatus('🩹 Mejoras restauradas desde la copia de seguridad', '#88ccff'), 400);
    return;
  }
  // sin datos válidos en ningún sitio: se quedan los valores por defecto
}
// Utilidad de consola por si algún día quieres forzar la restauración:
//   restoreMetaBackup()
window.restoreMetaBackup = function () {
  const bak = readMetaBackupObj();
  if (!bak) { setStatus('❌ Sin copia de seguridad válida', '#ff6666'); return; }
  applyMetaObj(bak);
  saveMeta();
  setStatus('🩹 Copia de seguridad aplicada', '#88ff88');
};

// --- Guardado de batalla (solo modo infinito) ---
function buildSaveData() {
  return { version: 35, money, baseHP, enemyBaseHP, enemyBaseMaxHP, wave, timestamp: Date.now() };
}
function writeSave(data) {
  memorySave = data;
  try {
    localStorage.setItem('catBattleSave', JSON.stringify(data));
    const check = localStorage.getItem('catBattleSave');
    if (!check) { localStorageOK = false; return false; }
    return true;
  } catch (e) { localStorageOK = false; return false; }
}
function readSave() {
  try {
    const s = localStorage.getItem('catBattleSave');
    if (s) { const p = JSON.parse(s); if (p && typeof p.wave === 'number') return p; }
  } catch (e) { localStorageOK = false; }
  if (memorySave && typeof memorySave.wave === 'number') return memorySave;
  return null;
}
function isValidSave(d) {
  return d && typeof d === 'object' && typeof d.money === 'number' && typeof d.wave === 'number' &&
         typeof d.baseHP === 'number' && typeof d.enemyBaseHP === 'number';
}
function saveGame(auto) {
  if (gameMode !== 'infinite') { setStatus('❌ El guardado de batalla es solo del modo infinito', '#ff6666'); return; }
  const ok = writeSave(buildSaveData());
  if (ok) setStatus((auto ? '💾 Auto-guardado' : '💾 ¡Guardado!') + ` (Ol.${wave}, ${Math.floor(money)}💰)`, '#88ff88');
  else setStatus('⚠️ Guardado solo en memoria (localStorage bloqueado)', '#ffaa00');
}
function loadGame() {
  const data = readSave();
  if (!data || !isValidSave(data)) { setStatus('❌ No hay guardado válido', '#ff6666'); return false; }
  money = data.money; baseHP = data.baseHP; enemyBaseHP = data.enemyBaseHP;
  enemyBaseMaxHP = data.enemyBaseMaxHP || data.enemyBaseHP;
  wave = data.wave;
  cats = []; enemies = []; projectiles = []; particles = []; floatingTexts = [];
  spawnTimers = new Array(NUM_UNITS).fill(0);
  gameOver = false; frameCount = 0; waveTimer = 0; enemySpawnTimer = 120;
  cannonCooldown = 0; bossSpawnedThisWave = false; bossWarningTimer = 0; autoSaveTimer = 0;
  setStatus(`📂 Cargado: Ol.${wave}, ${Math.floor(money)}💰`, '#88ccff');
  updateUI();
  return true;
}
function showSaveInfo() {
  const data = readSave();
  if (!data) { setStatus('❌ Sin guardado', '#ff6666'); return; }
  const fecha = data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '?';
  setStatus(`🔍 Ol.${data.wave} | ${Math.floor(data.money)}💰 | ${fecha} | LS:${localStorageOK ? 'OK' : 'NO'}`, '#cccccc');
}
function deleteSave() {
  if (confirm('¿Seguro que quieres borrar el guardado de batalla?')) {
    memorySave = null;
    try { localStorage.removeItem('catBattleSave'); } catch (e) {}
    setStatus('🗑️ Guardado borrado', '#ffaa00');
  }
}

// --- Progreso de historia ---
function loadStoryProgress() {
  try {
    const raw = localStorage.getItem('catBattleStory');
    if (raw === null) return 0;
    const v = parseInt(raw);
    return isNaN(v) || v < 0 ? 0 : v;
  } catch (e) { return 0; }
}
function saveStoryProgress() {
  if (isDevMode()) return;  // 🔧 NO guardar en modo desarrollador
  try { localStorage.setItem('catBattleStory', String(storyProgress)); } catch (e) {}
}

// --- Progreso de eventos ---
function loadEventProgress() {
  try { const o = JSON.parse(localStorage.getItem('catBattleEvents')); return (o && typeof o === 'object') ? o : {}; } catch (e) { return {}; }
}
function saveEventProgress() {
  if (isDevMode()) return;  // 🔧 NO guardar en modo desarrollador
  try { localStorage.setItem('catBattleEvents', JSON.stringify(eventProgress)); } catch (e) {}
}

// --- Progreso de Etapas de Leyenda (v59) ---
function loadLegendProgress() {
  try {
    const raw = localStorage.getItem('catBattleLegend');
    if (raw === null) return 0;
    const v = parseInt(raw);
    return isNaN(v) || v < 0 ? 0 : v;
  } catch (e) { return 0; }
}
function saveLegendProgress() {
  if (isDevMode()) return;  // 🔧 NO guardar en modo desarrollador
  try { localStorage.setItem('catBattleLegend', String(legendProgress)); } catch (e) {}
}

// --- Escuadrón ---
function loadLoadout() {
  let arr = null;
  try {
    const s = JSON.parse(localStorage.getItem('catBattleLoadout'));
    if (Array.isArray(s)) arr = s.filter(i => Number.isInteger(i) && i >= 0 && i < NUM_UNITS && isUnitUnlocked(i));
  } catch (e) {}
  if (!arr) arr = [0, 1, 2, 3, 4, 5].filter(i => isUnitUnlocked(i));
  arr = [...new Set(arr)].slice(0, MAX_LOADOUT);
  if (arr.length === 0) arr = [0];
  return arr;
}
function saveLoadout() {
  if (isDevMode()) return;  // 🔧 NO guardar en modo desarrollador
  try { localStorage.setItem('catBattleLoadout', JSON.stringify(loadout)); } catch (e) {}
}

// --- Reinicio total ---
function resetAllProgress() {
  const msg = '⚠️ ¿Seguro? Se borrará TODO el progreso:\n' +
    '· 🐾 Gatontito Coins y todas las mejoras (y su copia de seguridad)\n' +
    '· 📖 Progreso de Historia\n' +
    '· 🎃🛸🔥🎄 Progreso de Eventos y tropas desbloqueadas\n' +
    '· 🌟 Progreso de Etapas de Leyenda\n' +
    '· 💾 Guardado de la partida infinita\n' +
    '· 🎖 Escuadrón seleccionado\n' +
    '¡Esta acción no se puede deshacer!';
  if (!confirm(msg)) return;
  if (!confirm('🔁 Confirmación final: ¿reiniciar TODO el progreso desde cero?')) return;
  playing = false; gameOver = false;
  metaSnapshot = null; memorySave = null; baseMeta = null;
  try {
    localStorage.removeItem(META_KEY);
    localStorage.removeItem(META_BAK_KEY);
    localStorage.removeItem('catBattleStory');
    localStorage.removeItem('catBattleEvents');
    localStorage.removeItem('catBattleLegend');
    localStorage.removeItem('catBattleLoadout');
    localStorage.removeItem('catBattleSave');
  } catch (e) {}
  coins = 0;
  for (let i = 0; i < NUM_UNITS; i++) unitLevels[i] = 1;
  incomeLevel = 1; cannonDmgLevel = 1; cannonRangeLevel = 1; cannonCdLevel = 1;
  coinBonusLevel = 0;
  storyProgress = 0;
  eventProgress = {};
  legendProgress = 0;
  loadout = [0];
  tempLoadout = [0];
  spawnTimers = new Array(NUM_UNITS).fill(0);
  cats = []; enemies = []; projectiles = []; particles = []; floatingTexts = [];
  money = 400; baseHP = 1500; enemyBaseHP = 2000; enemyBaseMaxHP = 2000; wave = 1;
  cannonCooldown = 0;
  gameMode = 'infinite';
  showMenu();
}

// --- Guardado automático al cerrar/ocultar la pestaña ---
// 🔧 verifican isDevMode() antes de guardar
window.addEventListener('beforeunload', () => {
  if (!isDevMode()) {
    saveMeta();
    if (gameMode === 'infinite' && screen === 'game') writeSave(buildSaveData());
  }
});
window.addEventListener('pagehide', () => {
  if (!isDevMode()) {
    saveMeta();
    if (gameMode === 'infinite' && screen === 'game') writeSave(buildSaveData());
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && !isDevMode()) {
    saveMeta();
    if (gameMode === 'infinite' && screen === 'game') writeSave(buildSaveData());
  }
});