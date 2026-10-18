// ============================================================
// 02-state.js — Estado mutable global + cálculos/getters
// v57: · coinBonusLevel + getters del bonus de 🐾 y coinRewardFor()
//      · Modo desarrollador con snapshot/restauración (snapshotMeta)
// v48: FORMAS DE UNIDAD — cada tropa Nv.10+ puede usarse en forma
//      normal o evolucionada (preferencia persistida y separada
//      por unidad). La evolución sigue dando +10% de stats SOLO
//      si la forma activa es la evolucionada.
// ============================================================
// --- Progreso persistente (se rellena en 07-main.js al iniciar) ---
let coins = 0;
const unitLevels = new Array(NUM_UNITS).fill(1);
let incomeLevel = 1;
let cannonDmgLevel = 1;
let cannonRangeLevel = 1;
let cannonCdLevel = 1;
let coinBonusLevel = 0;   // 0 = sin bonus · Nv.N = +N×10% de 🐾 por nivel superado
let storyProgress = 0;
let eventProgress = {};
let loadout = [0];
let tempLoadout = [0];
// --- Respaldos para el sandbox ---
let metaSnapshot = null;
let baseMeta = null;
// --- Estado de batalla ---
let spawnTimers = new Array(NUM_UNITS).fill(0);
let money = 400;
let baseHP = 1500;
let enemyBaseHP = 2000;
let enemyBaseMaxHP = 2000;
let cats = [];
let enemies = [];
let projectiles = [];
let particles = [];
let floatingTexts = [];
let enemySpawnTimer = 0;
let gameOver = false;
let frameCount = 0;
let wave = 1;
let waveTimer = 0;
let cannonCooldown = 0;
let autoSaveTimer = 0;
let bossWarningTimer = 0;
let bossSpawnedThisWave = false;
let pendingBoss = 0;
// --- Pantalla / modo ---
let screen = 'menu';
let playing = false;
let gameMode = 'infinite';
let storyLevelIdx = 0;
let eventLevelIdx = 0;
let currentEventId = '';
let storyBossSpawned = false;
let storyBossTimer = 0;
let pendingEventBoss = '';
// --- Bucle / FPS ---
let lastTime = performance.now();
let fps = 60;
let frameAccumulator = 0;
let fpsSampleTimer = 0;
let fpsTickCount = 0;

// ============================================================
// MODO DESARROLLADOR
// ============================================================
let devMode = false;
let devSnapshot = null;

function isDevMode() { return devMode; }

function toggleDevMode() {
  if (!devMode) {
    // Activando: guardar snapshot del estado actual
    devSnapshot = snapshotMeta();
    setStatus('🔧 Modo desarrollador ACTIVADO - NADA se guarda', '#ff88ff');
  } else {
    // Desactivando: restaurar snapshot
    if (devSnapshot) {
      restoreMeta(devSnapshot);
      devSnapshot = null;
      setStatus('🔧 Modo desarrollador DESACTIVADO - Estado restaurado', '#888888');
    }
  }
  devMode = !devMode;
  if (screen === 'story') buildStoryGrid();
  if (screen === 'events') buildEventGrid();
  if (screen === 'troops') buildTroopGrid();
  if (screen === 'upgrades') buildUpgradeScreen();
  if (screen === 'bestiary' && window.showBestiary) window.showBestiary();
  updateDevModeButton();
}

function updateDevModeButton() {
  const btn = document.getElementById('devModeBtn');
  if (btn) {
    btn.textContent = `🔧 Modo Desarrollador: ${devMode ? 'ON' : 'OFF'}`;
    btn.style.background = devMode
      ? 'linear-gradient(135deg, #ff88ff, #880088)'
      : 'linear-gradient(135deg, #888, #444)';
  }
}

// ------------------------------------------------------------
// v44: EVOLUCIÓN DE UNIDADES
// ------------------------------------------------------------
const EVOLVE_LEVEL = 10;   // nivel al que evoluciona una tropa
const EVOLVE_MULT = 1.10;  // +10% de estadísticas

// v48: si el objeto trae `evo` definido (instancia en batalla o retrato),
// manda ese flag; si no, se deduce del nivel (comportamiento clásico).
function isEvolved(c) {
  if (!c) return false;
  if (c.evo !== undefined) return !!c.evo;
  return (c.level || 1) >= EVOLVE_LEVEL;
}

// ------------------------------------------------------------
// v48: FORMA PREFERIDA POR UNIDAD ('evo' | 'normal')
// ------------------------------------------------------------
function loadForms() {
  try {
    const o = JSON.parse(localStorage.getItem('catBattleForms'));
    if (Array.isArray(o)) {
      const out = new Array(NUM_UNITS).fill('evo');
      for (let i = 0; i < NUM_UNITS; i++) if (o[i] === 'normal') out[i] = 'normal';
      return out;
    }
  } catch (e) {}
  return new Array(NUM_UNITS).fill('evo');
}
function saveForms() {
  try { localStorage.setItem('catBattleForms', JSON.stringify(unitFormPref)); } catch (e) {}
}
let unitFormPref = loadForms();

// La forma evolucionada solo está disponible con la tropa a Nv.10+
function formIsEvo(idx) {
  return unitFormPref[idx] !== 'normal' && unitLevels[idx] >= EVOLVE_LEVEL;
}

// ------------------------------------------------------------
// Utilidades y consultas de modo
// ------------------------------------------------------------
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function isTest()  { return gameMode === 'test'; }
function isEvent() { return gameMode === 'event'; }
function unitLevelCap() {
  if (isTest()) return MAX_STATS;
  if (isDevMode()) return MAX_STATS;  // 🔧 en modo dev: sin límite de progreso
  if (storyProgress >= 30) return 30;
  if (storyProgress >= 15) return 15;
  return MAX_UNIT_LEVEL;
}

// En sandbox se muestran/controlan TODAS las unidades; fuera, solo el escuadrón
function activeUnitList() {
  if (isTest()) { const all = []; for (let i = 0; i < NUM_UNITS; i++) all.push(i); return all; }
  return loadout;
}
function padUnitArray(arr) {
  const out = [];
  for (let i = 0; i < NUM_UNITS; i++) out.push(Array.isArray(arr) && arr[i] ? arr[i] : 1);
  return out;
}
function snapshotMeta() {
  return {
    coins,
    unitLevels: unitLevels.slice(),
    incomeLevel,
    cannonDmgLevel,
    cannonRangeLevel,
    cannonCdLevel,
    coinBonusLevel
  };
}
function restoreMeta(s) {
  if (!s) return;
  coins = s.coins;
  for (let i = 0; i < NUM_UNITS; i++) unitLevels[i] = s.unitLevels[i];
  incomeLevel = s.incomeLevel;
  cannonDmgLevel = s.cannonDmgLevel;
  cannonRangeLevel = s.cannonRangeLevel;
  cannonCdLevel = s.cannonCdLevel;
  coinBonusLevel = s.coinBonusLevel || 0;
}
function leaveTestIfNeeded() {
  if (gameMode === 'test') {
    if (metaSnapshot) restoreMeta(metaSnapshot);
    else if (baseMeta) restoreMeta(baseMeta);
    else loadMeta();
    metaSnapshot = null;
  }
}

// ------------------------------------------------------------
// Income
// ------------------------------------------------------------
function getIncomeAt(l) { return BASE_INCOME + 10 * (l * (l + 1) / 2); }
function getIncome() { return getIncomeAt(incomeLevel); }
function getIncomeCoinCost() { const l = incomeLevel; return 8000 + 5000 * l * (l - 1); }

// ------------------------------------------------------------
// Cañón
// ------------------------------------------------------------
function getCannonDamagePercentAt(l) { return 0.05 + (l - 1) * 0.005; }
function getCannonDamagePercent() { return getCannonDamagePercentAt(cannonDmgLevel); }
function getCannonRangeAt(l) { return 250 + (l - 1) * 150; }
function getCannonRange() { return getCannonRangeAt(cannonRangeLevel); }
function getCannonCooldownFramesFor(dmgL, cdL) {
  return Math.max(CANNON_BASE_COOLDOWN + (dmgL - 1) * 120 - (cdL - 1) * 120, CANNON_MIN_COOLDOWN);
}
function getCannonCooldownFrames() { return getCannonCooldownFramesFor(cannonDmgLevel, cannonCdLevel); }
function cannonCdSecAt(dmgL, cdL) { return Math.ceil(getCannonCooldownFramesFor(dmgL, cdL) / 60); }
function getCannonDmgCoinCost()   { const l = cannonDmgLevel;   return 20000 + 15000 * l * (l - 1); }
function getCannonRangeCoinCost() { const l = cannonRangeLevel; return 12000 + 8000  * l * (l - 1); }
function getCannonCdCoinCost()    { const l = cannonCdLevel;    return 15000 + 10000 * l * (l - 1); }

// ------------------------------------------------------------
// v57: BONUS DE 🐾 GATONTITO COINS (mejora permanente)
// Nv.N = +N×10% de coins al superar niveles de Historia/Eventos
// ------------------------------------------------------------
function getCoinBonusPercentAt(l) { return l * COIN_BONUS_PER_LVL; }
function getCoinBonusPercent() { return getCoinBonusPercentAt(coinBonusLevel); }
function getCoinBonusCost() { return COIN_BONUS_BASE_COST + COIN_BONUS_COST_STEP * coinBonusLevel; }

// Recompensa REAL de 🐾 al superar un nivel (mitad en repetición + bonus).
// Única fuente de verdad: la usan las grids Y las victorias, para que
// el número del botón sea exactamente el que cobras.
function coinRewardFor(baseCoins, firstClear) {
  const baseEarned = firstClear ? baseCoins : Math.floor(baseCoins / 2);
  return Math.floor(baseEarned * (1 + getCoinBonusPercent()));
}

// ------------------------------------------------------------
// Stats de unidades y multiplicadores
// v48: getCatStats respeta la FORMA elegida (el +10% solo si está
//      activa la forma evolucionada). unitStatsAt sigue mostrando el
//      potencial máximo (para previews del menú de mejoras y bestiario).
// ------------------------------------------------------------
function unitStatsAt(idx, lvl) {
  const base = CAT_BASE[idx];
  const mult = Math.pow(base.upMult || 1.15, lvl - 1) * (lvl >= EVOLVE_LEVEL ? EVOLVE_MULT : 1);
  return {
    hp:  Math.min(Math.floor(base.hp * mult), MAX_STATS),
    dmg: Math.min(Math.floor(base.dmg * mult), MAX_STATS),
    heal: base.healAmt ? Math.min(Math.floor(base.healAmt * mult), MAX_STATS) : 0
  };
}
function getCatStats(type) {
  const base = CAT_BASE[type];
  const lvl = unitLevels[type];
  const mult = Math.pow(base.upMult || 1.15, lvl - 1) * (formIsEvo(type) ? EVOLVE_MULT : 1);
  return {
    ...base,
    hp:  Math.min(Math.floor(base.hp * mult), MAX_STATS),
    dmg: Math.min(Math.floor(base.dmg * mult), MAX_STATS),
    healAmt: base.healAmt ? Math.min(Math.floor(base.healAmt * mult), MAX_STATS) : 0
  };
}
function getUnitCoinCost(idx) { const l = unitLevels[idx]; return UNIT_COIN_BASE[idx] + UNIT_COIN_STEP[idx] * l * (l - 1); }
function getWaveBonus() { return 1 + (wave - 1) * 0.03; }
function isRanged(c) { return c.unitType === 'ranged' || c.unitType === 'roboRanged'; }

// Escalado de enemigos en modo infinito (lineal + exponencial suave en late)
function getWaveMult() {
  return (1 + (wave - 1) * 0.18) * Math.pow(1.03, Math.max(0, wave - 20));
}
function getEnemyMult() {
  if (gameMode === 'story') return STORY_LEVELS[storyLevelIdx].mult;
  if (gameMode === 'event') return EVENTS[currentEventId].levels[eventLevelIdx].mult;
  return getWaveMult();
}

// Rotación de jefes del infinito
function getBossForWave() {
  if (wave >= 40) return Math.floor(Math.random() * 3);
  if (wave >= 30) return 2;
  if (wave >= 20) return 1;
  return 0;
}
function currentBossName() {
  if (gameMode === 'event') return EVENT_BOSS_TYPES[pendingEventBoss] ? EVENT_BOSS_TYPES[pendingEventBoss].name : '';
  return BOSS_TYPES[pendingBoss] ? BOSS_TYPES[pendingBoss].name : '';
}