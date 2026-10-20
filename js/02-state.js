// ============================================================
// 02-state.js — Estado mutable global + cálculos/getters (v79g)
// · addMoney(): TODA ganancia de dinero se clampa al cap en el momento.
// · Cartera v78b + Income v78c en partida.
// ============================================================
let coins = 0;
const unitLevels = new Array(NUM_UNITS).fill(1);
let incomeLevel = 1;
let cannonDmgLevel = 1;
let cannonRangeLevel = 1;
let cannonCdLevel = 1;
let coinBonusLevel = 0;
let walletLevel = 0;
let baseDefLevel = 0;
let researchLevel = 0;
let rewardLevel = 0;
let storyProgress = 0;
let eventProgress = {};
let legendProgress = 0;
let ticketsNormal = 3;
let ticketsRare = 1;
let ticketsEvent = 1;
let baseLevel = 0;
const gachaLevels = new Array(NUM_UNITS).fill(0);
const gachaUnlocked = new Array(NUM_UNITS).fill(false);
let treasuresObtained = {};
let expedition = null;
let consumables = { speed:0, radar:0, rich:0, cpu:0, sabelotodo:0, sniper:0 };
let loadout = [0];
let tempLoadout = [0];
let metaSnapshot = null;
let baseMeta = null;
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
let pendingEventBoss = '';
let pendingLegendBoss = '';
let storyBossSpawned = false;
let storyBossTimer = 0;
let gameSpeed = 1;
let battleFlags = { radar:false, rich:false, cpu:false, cpuAutoWin:false, sabelotodo:false, sniper:false, sniperTimer:0, walletCap:WALLET_BATTLE_START, walletUpgrades:0, incomeUpgrades:0, cpuTimer:0 };
function resetBattleFlags() {
  gameSpeed = 1;
  battleFlags = { radar:false, rich:false, cpu:false, cpuAutoWin:false, sabelotodo:false, sniper:false, sniperTimer:0, walletCap:WALLET_BATTLE_START, walletUpgrades:0, incomeUpgrades:0, cpuTimer:0 };
}
let screen = 'menu';
let playing = false;
let gameMode = 'infinite';
let storyLevelIdx = 0;
let eventLevelIdx = 0;
let currentEventId = '';
let legendLevelIdx = 0;
let lastTime = performance.now();
let fps = 60;
let frameAccumulator = 0;
let fpsSampleTimer = 0;
let fpsTickCount = 0;

let devMode = false;
let devSnapshot = null;
function isDevMode() { return devMode; }
function toggleDevMode() {
  if (!devMode) {
    cannonDmgLevel, cannonRangeLevel, cannonCdLevel, coinBonusLevel, walletLevel,
    baseDefLevel, researchLevel, rewardLevel,
    setStatus('🔧 Modo desarrollador ACTIVADO - NADA se guarda', '#ff88ff');
  } else {
    if (devSnapshot) { restoreMeta(devSnapshot); devSnapshot = null; setStatus('🔧 Modo desarrollador DESACTIVADO - Estado restaurado', '#888888'); }
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
  const btn = document.getElementById('setDevBtn');
  if (btn) btn.textContent = 'Modo desarrollador: ' + (devMode ? 'ON' : 'OFF');
}

const EVOLVE_LEVEL = 10;
const EVOLVE_MULT = 1.10;
function isEvolved(c) {
  if (!c) return false;
  if (c.evo !== undefined) return !!c.evo;
  return (c.level || 1) >= EVOLVE_LEVEL;
}
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
function saveForms() { try { localStorage.setItem('catBattleForms', JSON.stringify(unitFormPref)); } catch (e) {} }
let unitFormPref = loadForms();
function formIsEvo(idx) { return unitFormPref[idx] !== 'normal' && unitLevels[idx] >= EVOLVE_LEVEL; }

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
    coins, unitLevels: unitLevels.slice(), incomeLevel,
    cannonDmgLevel, cannonRangeLevel, cannonCdLevel, coinBonusLevel, walletLevel,
    ticketsNormal, ticketsRare, ticketsEvent, baseLevel,
    gachaLevels: gachaLevels.slice(), gachaUnlocked: gachaUnlocked.slice(),
    treasuresObtained: Object.assign({}, treasuresObtained),
    expedition: expedition ? Object.assign({}, expedition) : null,
    consumables: Object.assign({}, consumables)
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
  walletLevel = s.walletLevel || 0;
  baseDefLevel = s.baseDefLevel || 0;
  researchLevel = s.researchLevel || 0;
  rewardLevel = s.rewardLevel || 0;
  ticketsNormal = (typeof s.ticketsNormal === 'number') ? s.ticketsNormal : 3;
  ticketsRare = (typeof s.ticketsRare === 'number') ? s.ticketsRare : 1;
  ticketsEvent = (typeof s.ticketsEvent === 'number') ? s.ticketsEvent : 1;
  baseLevel = s.baseLevel || 0;
  if (Array.isArray(s.gachaLevels)) for (let i = 0; i < NUM_UNITS; i++) gachaLevels[i] = s.gachaLevels[i] || 0;
  if (Array.isArray(s.gachaUnlocked)) for (let i = 0; i < NUM_UNITS; i++) gachaUnlocked[i] = !!s.gachaUnlocked[i];
  if (s.treasuresObtained && typeof s.treasuresObtained === 'object') treasuresObtained = s.treasuresObtained;
  else treasuresObtained = {};
  expedition = (s.expedition && typeof s.expedition === 'object') ? s.expedition : null;
  if (s.consumables && typeof s.consumables === 'object') consumables = Object.assign({ speed:0, radar:0, rich:0, cpu:0, sabelotodo:0, sniper:0 }, s.consumables);
}
function leaveTestIfNeeded() {
  if (gameMode === 'test') {
    if (metaSnapshot) restoreMeta(metaSnapshot);
    else if (baseMeta) restoreMeta(baseMeta);
    else loadMeta();
    metaSnapshot = null;
  }
}

function getIncomeAt(l) { return BASE_INCOME + 10 * (l * (l + 1) / 2); }
function getIncome() { return getIncomeAt(incomeLevel); }
function getIncomeCoinCost() { const l = incomeLevel; return 8000 + 5000 * l * (l - 1); }
function getBattleIncomeBonus() { return battleFlags.incomeUpgrades * INCOME_BATTLE_STEP; }
function getEffectiveIncome() { return getIncome() + getBattleIncomeBonus(); }
function getIncomeUpgradePrice() { return INCOME_BATTLE_BASE_PRICE * (battleFlags.incomeUpgrades + 1); }
function canUpgradeIncome() { return battleFlags.incomeUpgrades < INCOME_BATTLE_MAX_UPGRADES; }
function buyIncomeUpgrade() {
  if (isTest()) { setStatus('🧪 En sandbox el income es ∞', '#cc66ff'); return; }
  if (!canUpgradeIncome()) { setStatus('❌ Ya usaste las ' + INCOME_BATTLE_MAX_UPGRADES + ' mejoras de income de esta partida', '#ff6666'); return; }
  const price = getIncomeUpgradePrice();
  if (!isDevMode() && money < price) { setStatus('❌ Necesitas ' + price + '💰 para mejorar el income', '#ff6666'); return; }
  if (!isDevMode()) money -= price;
  battleFlags.incomeUpgrades++;
  if (window.toastMsg) window.toastMsg('📈 Income mejorado: +' + INCOME_BATTLE_STEP + '/s (−' + price + '💰) → ' + getEffectiveIncome().toFixed(1) + '/s', '#88ff88');
  if (window.sfx) window.sfx('upgrade');
  if (window.refreshIncomeBtn) window.refreshIncomeBtn();
  if (window.updateUI) window.updateUI();
}

function getCannonDamagePercentAt(l) { return 0.05 + (l - 1) * 0.005; }
function getCannonDamagePercent() { return getCannonDamagePercentAt(getEffectiveCannonDmgLevel()); }
function getCannonRangeAt(l) { return 250 + (l - 1) * 150; }
function getCannonRange() { return getCannonRangeAt(cannonRangeLevel); }
function getCannonCooldownFramesFor(dmgL, cdL) {
  return Math.max(CANNON_BASE_COOLDOWN + (dmgL - 1) * 120 - (cdL - 1) * 120, CANNON_MIN_COOLDOWN);
}
function getCannonCooldownFrames() { return getCannonCooldownFramesFor(getEffectiveCannonDmgLevel(), cannonCdLevel); }
function cannonCdSecAt(dmgL, cdL) { return Math.ceil(getCannonCooldownFramesFor(dmgL, cdL) / 60); }
function getCannonDmgCoinCost()   { const l = cannonDmgLevel;   return 20000 + 15000 * l * (l - 1); }
function getCannonRangeCoinCost() { const l = cannonRangeLevel; return 12000 + 8000  * l * (l - 1); }
function getCannonCdCoinCost()    { const l = cannonCdLevel;    return 15000 + 10000 * l * (l - 1); }
function getEffectiveCannonDmgLevel() { return Math.min(cannonDmgLevel + getTreasureCannonBonus(), CANNON_DMG_MAX); }

function getCoinBonusPercentAt(l) { return l * COIN_BONUS_PER_LVL; }
function getCoinBonusPercent() { return getCoinBonusPercentAt(coinBonusLevel); }
function getCoinBonusCost() { return COIN_BONUS_BASE_COST + COIN_BONUS_COST_STEP * coinBonusLevel; }
function coinRewardFor(baseCoins, firstClear) {
  const baseEarned = firstClear ? baseCoins : Math.floor(baseCoins / 2);
  return Math.floor(baseEarned * (1 + getCoinBonusPercent()));
}
function getBaseMaxHP() { return 1500 + baseLevel * BASE_HP_PER_LEVEL + getTreasureFlatBaseHP() + getBaseDefBonus(); }
// v80: Defensa de base / Investigación / Recompensa mejorada
function getBaseDefBonus() { return baseDefLevel * BASE_DEF_PER_LVL; }
function getBaseDefCost() { return BASE_DEF_BASE_COST + BASE_DEF_COST_STEP * baseDefLevel; }
function getResearchMult() { return 1 - researchLevel * RESEARCH_PER_LVL; }
function getResearchCost() { return RESEARCH_BASE_COST + RESEARCH_COST_STEP * researchLevel; }
function getRewardMult() { return 1 + rewardLevel * REWARD_PER_LVL; }
function getRewardCost() { return REWARD_BASE_COST + REWARD_COST_STEP * rewardLevel; }
function getSpawnCdFrames(type) { return Math.max(1, Math.round(CAT_BASE[type].spawnCd * 60 * getResearchMult())); }

function getWalletTreasureBonus() {
  let n = 0;
  for (const id in treasuresObtained) if (treasuresObtained[id] === 2) n++;
  return n * WALLET_GOLD_TREASURE_BONUS;
}
function getWalletMax() { return WALLET_BASE + walletLevel * WALLET_UPGRADE_PER_LVL + getWalletTreasureBonus(); }
function getWalletUpgradeCost() { return getWalletUpgradeCostAt(walletLevel); }
function currentWalletCap() {
  if (isTest()) return Infinity;
  if (battleFlags.rich) return getWalletMax();
  return battleFlags.walletCap;
}
// v79g: TODA ganancia de dinero pasa por aquí → clamp al cap EN EL MOMENTO.
function addMoney(n) { money = Math.min(currentWalletCap(), money + n); }
function getWalletBattleStep() {
  const span = getWalletMax() - WALLET_BATTLE_START;
  if (span <= 0) return 0;
  return Math.max(50, Math.ceil(span / WALLET_BATTLE_MAX_UPGRADES / 50) * 50);
}
function getWalletUpgradePrice() { return WALLET_UPGRADE_BASE_PRICE + WALLET_UPGRADE_PRICE_STEP * battleFlags.walletUpgrades; }
function canUpgradeWallet() {
  if (battleFlags.rich) return false;
  if (battleFlags.walletUpgrades >= WALLET_BATTLE_MAX_UPGRADES) return false;
  return battleFlags.walletCap < getWalletMax();
}
function buyWalletUpgrade() {
  if (isTest()) { setStatus('🧪 En sandbox la cartera es infinita', '#cc66ff'); return; }
  if (!canUpgradeWallet()) {
    if (battleFlags.rich) setStatus('💰 Ricachón ya fijó tu cap al máximo', '#ffd700');
    else if (battleFlags.walletUpgrades >= WALLET_BATTLE_MAX_UPGRADES) setStatus('❌ Ya usaste las ' + WALLET_BATTLE_MAX_UPGRADES + ' ampliaciones de esta partida', '#ff6666');
    else setStatus('❌ Cap al máximo permitido (sube 💼 Cartera en el menú de mejoras)', '#ffaa00');
    return;
  }
  const price = getWalletUpgradePrice();
  if (!isDevMode() && money < price) { setStatus('❌ Necesitas ' + price + '💰 para ampliar la cartera', '#ff6666'); return; }
  if (!isDevMode()) money -= price;
  battleFlags.walletUpgrades++;
  const step = getWalletBattleStep();
  battleFlags.walletCap = Math.min(getWalletMax(), battleFlags.walletCap + step);
  if (window.toastMsg) window.toastMsg('💼 Cartera ampliada: +' + step + ' cap (−' + price + '💰) → ' + Math.floor(battleFlags.walletCap) + '/' + getWalletMax(), '#ffd700');
  if (window.sfx) window.sfx('upgrade');
  if (window.refreshWalletBtn) window.refreshWalletBtn();
  if (window.updateUI) window.updateUI();
}

function getSetQuality(setId) {
  const set = TREASURE_SETS.find(s => s.id === setId);
  if (!set) return -1;
  let minQ = 2;
  for (const tid of set.treasureIds) {
    const q = treasuresObtained[tid];
    if (q === undefined || q === null) return -1;
    if (q < minQ) minQ = q;
  }
  return minQ;
}
function isSetComplete(setId) { return getSetQuality(setId) >= 0; }
function getTreasureBonus(kind, unitIdx) {
  let total = 0;
  for (const set of TREASURE_SETS) {
    const q = getSetQuality(set.id);
    if (q < 0) continue;
    const mult = TREASURE_QUALITY_MULT[q];
    const ef = set.effect;
    if (ef.kind !== kind) continue;
    if (ef.kind === 'allDmgMult') { total += ef.base * mult; continue; }
    if (ef.kind === 'unitAoeMult') { if (Array.isArray(ef.units) && ef.units.includes(unitIdx)) total += ef.base * mult; continue; }
    if (ef.units === 'all' || (Array.isArray(ef.units) && ef.units.includes(unitIdx))) total += ef.base * mult;
  }
  for (const tid in TREASURE_BOSS_EFFECTS) {
    if (!treasuresObtained[tid]) continue;
    const q = treasuresObtained[tid];
    const mult = TREASURE_QUALITY_MULT[q];
    const ef = TREASURE_BOSS_EFFECTS[tid].effect;
    if (ef.kind !== kind) continue;
    if (ef.kind === 'unitAoeMult' && Array.isArray(ef.units) && ef.units.includes(unitIdx)) total += ef.base * mult;
  }
  return total;
}
function getTreasureFlatBaseHP() {
  let total = 0;
  for (const set of TREASURE_SETS) {
    const q = getSetQuality(set.id);
    if (q < 0) continue;
    if (set.effect.kind === 'baseHpFlat') total += set.effect.base * TREASURE_QUALITY_MULT[q];
  }
  return Math.floor(total);
}
function getTreasureCannonBonus() {
  let total = 0;
  for (const tid in TREASURE_BOSS_EFFECTS) {
    if (!treasuresObtained[tid]) continue;
    const q = treasuresObtained[tid];
    const ef = TREASURE_BOSS_EFFECTS[tid].effect;
    if (ef.kind === 'cannonDmgFlat') total += ef.base * TREASURE_QUALITY_MULT[q];
  }
  return Math.floor(total);
}

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
  const lvl = unitLevels[type] + (gachaLevels[type] || 0);
  const mult = Math.pow(base.upMult || 1.15, lvl - 1) * (formIsEvo(type) ? EVOLVE_MULT : 1);
  const stats = {
    ...base,
    hp:  Math.min(Math.floor(base.hp * mult), MAX_STATS),
    dmg: Math.min(Math.floor(base.dmg * mult), MAX_STATS),
    healAmt: base.healAmt ? Math.min(Math.floor(base.healAmt * mult), MAX_STATS) : 0
  };
  if (type === MAGE_UNIT_IDX && formIsEvo(type)) stats.aoeRadius = MAGE_EVO_AOE;
  const hpMult = 1 + getTreasureBonus('unitHpMult', type);
  const dmgMult = 1 + getTreasureBonus('unitDmgMult', type) + getTreasureBonus('allDmgMult', type);
  const aoeMult = 1 + getTreasureBonus('unitAoeMult', type);
  const speedMult = 1 + getTreasureBonus('unitSpeedMult', type);
  stats.hp = Math.min(Math.floor(stats.hp * hpMult), MAX_STATS);
  stats.dmg = Math.min(Math.floor(stats.dmg * dmgMult), MAX_STATS);
  stats.healAmt = Math.min(Math.floor(stats.healAmt * dmgMult), MAX_STATS);
  if (stats.aoeRadius) stats.aoeRadius = Math.floor(stats.aoeRadius * aoeMult);
  stats.speed = stats.speed * speedMult;
  return stats;
}
function getUnitCoinCost(idx) { const l = unitLevels[idx]; return UNIT_COIN_BASE[idx] + UNIT_COIN_STEP[idx] * l * (l - 1); }
function getWaveBonus() { return 1 + (wave - 1) * 0.03; }
function isRanged(c) { return c.unitType === 'ranged' || c.unitType === 'roboRanged'; }
function getWaveMult() { return (1 + (wave - 1) * 0.18) * Math.pow(1.03, Math.max(0, wave - 20)); }
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