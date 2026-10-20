// ============================================================
// 02-state.js — Estado mutable global + cálculos/getters
// v63: gachaLevels, gachaUnlocked, baseLevel, tickets, getBaseMaxHP
// v61: Bosque Catedral con troncos marrones
// v60: Bosque Catedral rediseñado (10 capas)
// v59: legendProgress, legendLevelIdx, pendingLegendBoss, legendBossObj
// v58: Mago evolucionado aoeRadius 130, LEVEL_START_MONEY,
//      splash a base, sanador siempre atrás
// v57: coinBonusLevel, coinRewardFor, snapshotMeta completo
// v48: FORMAS DE UNIDAD
// ============================================================
// --- Progreso persistente ---
let coins = 0;
const unitLevels = new Array(NUM_UNITS).fill(1);
let incomeLevel = 1;
let cannonDmgLevel = 1;
let cannonRangeLevel = 1;
let cannonCdLevel = 1;
let coinBonusLevel = 0;
let storyProgress = 0;
let eventProgress = {};
let legendProgress = 0;
// v63: gacha
let ticketsNormal = 3;
let ticketsRare = 1;
let ticketsEvent = 1;   // v68: tickets de banner de evento
let baseLevel = 0;
const gachaLevels = new Array(NUM_UNITS).fill(0);
const gachaUnlocked = new Array(NUM_UNITS).fill(false);
// ---
let loadout = [0];
let tempLoadout = [0];
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
let legendLevelIdx = 0;
let pendingLegendBoss = '';
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
    devSnapshot = snapshotMeta();
    setStatus('🔧 Modo desarrollador ACTIVADO - NADA se guarda', '#ff88ff');
  } else {
    if (devSnapshot) {
      restoreMeta(devSnapshot);
      devSnapshot = null;
      setStatus(' Modo desarrollador DESACTIVADO - Estado restaurado', '#888888');
    }
  }
  devMode = !devMode;
  if (screen === 'story') buildStoryGrid();
  if (screen === 'events') buildEventGrid();
  if (screen === 'troops') buildTroopGrid();
  if (screen === 'upgrades') buildUpgradeScreen();
  if (screen === 'legend') buildLegendGrid();
  if (screen === 'gacha' && window.renderBanners) window.renderBanners();
  if (screen === 'storage' && window.renderStorage) window.renderStorage();
  if (screen === 'missions' && window.renderMissions) window.renderMissions();
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
const EVOLVE_LEVEL = 10;
const EVOLVE_MULT = 1.10;

function isEvolved(c) {
  if (!c) return false;
  if (c.evo !== undefined) return !!c.evo;
  return (c.level || 1) >= EVOLVE_LEVEL;
}

// ------------------------------------------------------------
// v48: FORMA PREFERIDA POR UNIDAD
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
  if (isDevMode()) return MAX_STATS;
  if (storyProgress >= 30) return 30;
  if (storyProgress >= 15) return 15;
  return MAX_UNIT_LEVEL;
}

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
    coinBonusLevel,
    ticketsNormal,
    ticketsRare,
    ticketsEvent,
    baseLevel,
    gachaLevels: gachaLevels.slice(),
    gachaUnlocked: gachaUnlocked.slice()
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
  ticketsNormal = (typeof s.ticketsNormal === 'number') ? s.ticketsNormal : 3;
  ticketsRare = (typeof s.ticketsRare === 'number') ? s.ticketsRare : 1;
  ticketsEvent = (typeof s.ticketsEvent === 'number') ? s.ticketsEvent : 1;
  baseLevel = s.baseLevel || 0;
  if (Array.isArray(s.gachaLevels)) for (let i = 0; i < NUM_UNITS; i++) gachaLevels[i] = s.gachaLevels[i] || 0;
  if (Array.isArray(s.gachaUnlocked)) for (let i = 0; i < NUM_UNITS; i++) gachaUnlocked[i] = !!s.gachaUnlocked[i];
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
// v57: BONUS DE 🐾
// ------------------------------------------------------------
function getCoinBonusPercentAt(l) { return l * COIN_BONUS_PER_LVL; }
function getCoinBonusPercent() { return getCoinBonusPercentAt(coinBonusLevel); }
function getCoinBonusCost() { return COIN_BONUS_BASE_COST + COIN_BONUS_COST_STEP * coinBonusLevel; }

function coinRewardFor(baseCoins, firstClear) {
  const baseEarned = firstClear ? baseCoins : Math.floor(baseCoins / 2);
  return Math.floor(baseEarned * (1 + getCoinBonusPercent()));
}

// v63: HP máximo de la base
function getBaseMaxHP() { return 1500 + baseLevel * BASE_HP_PER_LEVEL; }

// ------------------------------------------------------------
// Stats de unidades
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
  const lvl = unitLevels[type] + (gachaLevels[type] || 0);  // v63: niveles extra del gacha
  const mult = Math.pow(base.upMult || 1.15, lvl - 1) * (formIsEvo(type) ? EVOLVE_MULT : 1);
  const stats = {
    ...base,
    hp:  Math.min(Math.floor(base.hp * mult), MAX_STATS),
    dmg: Math.min(Math.floor(base.dmg * mult), MAX_STATS),
    healAmt: base.healAmt ? Math.min(Math.floor(base.healAmt * mult), MAX_STATS) : 0
  };
  if (type === MAGE_UNIT_IDX && formIsEvo(type)) stats.aoeRadius = MAGE_EVO_AOE;
  return stats;
}
function getUnitCoinCost(idx) { const l = unitLevels[idx]; return UNIT_COIN_BASE[idx] + UNIT_COIN_STEP[idx] * l * (l - 1); }
function getWaveBonus() { return 1 + (wave - 1) * 0.03; }
function isRanged(c) { return c.unitType === 'ranged' || c.unitType === 'roboRanged'; }

function getWaveMult() {
  return (1 + (wave - 1) * 0.18) * Math.pow(1.03, Math.max(0, wave - 20));
}
function getEnemyMult() {
  if (gameMode === 'story') return STORY_LEVELS[storyLevelIdx].mult;
  if (gameMode === 'event') return EVENTS[currentEventId].levels[eventLevelIdx].mult;
  if (gameMode === 'legend') return LEGEND_STAGES[legendLevelIdx].mult;
  return getWaveMult();
}

function getBossForWave() {
  if (wave >= 40) return Math.floor(Math.random() * 3);
  if (wave >= 30) return 2;
  if (wave >= 20) return 1;
  return 0;
}
function currentBossName() {
  if (gameMode === 'event') return EVENT_BOSS_TYPES[pendingEventBoss] ? EVENT_BOSS_TYPES[pendingEventBoss].name : '';
  if (gameMode === 'legend') { const t = legendBossObj(pendingLegendBoss); return t ? t.name : ''; }
  return BOSS_TYPES[pendingBoss] ? BOSS_TYPES[pendingBoss].name : '';
}