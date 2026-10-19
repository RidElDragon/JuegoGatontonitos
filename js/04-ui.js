// ============================================================
// 04-ui.js — Pantallas, menús, grids y refresco de interfaz
// v68 FIX: paréntesis de más en buildUpgradeScreen rompía el
//   parseo del archivo entero (cascada: showMenu / isUnitUnlocked
//   quedaban indefinidos). La zona de texto del botón se reescribió
//   con variables intermedias (a prueba de desbalanceos) y se corrigió
//   la lógica de disabled cuando las mejoras base están al tope.
// v67: buildUpgradeScreen() muestra unitLevels + gachaLevels.
// v63: Banners / Almacén / Misiones (inyectados desde 11-gacha.js)
// v61: Bosque Catedral con troncos marrones
// v60: Bosque Catedral rediseñado (10 capas)
// v59: Pantalla y grid de ETAPAS DE LEYENDA (showLegend)
// v58: 450 dinero inicial, splash a base, sanador atrás,
//      Mago evolucionado aoeRadius 130
// v57: Bonus de 🐾 (buyCoinBonus, coinRewardFor en grids)
// v56: troopStatsLine(idx) muestra stats REALES
// v55: Modo desarrollador (grids y compras conscientes de dev)
// v48: Selección de Tropas con selector de FORMA (🐱/✨)
// ============================================================
// -------------------- RAREZAS --------------------
const RARITIES = {
  normal:     { name:'Normal',     color:'#b8c0c8', glow:false },
  raro:       { name:'Raro',       color:'#33aaff', glow:false },
  superraro:  { name:'Superraro',  color:'#33cc66', glow:false },
  epico:      { name:'Épico',      color:'#aa55ff', glow:true },
  legendario: { name:'Legendario', color:'#ffbb00', glow:true },
  mitico:     { name:'Mítico',     color:'#ff3355', glow:true },
};
const UNIT_RARITY = [
  'normal','normal','normal','normal','normal','normal','normal',
  'raro','raro',
  'legendario',
  'legendario',
  'epico',
  'legendario',
];
function rarityOf(idx) { return RARITIES[UNIT_RARITY[idx] || 'normal'] || RARITIES.normal; }
function applyRarityStyle(el, idx) {
  const r = rarityOf(idx);
  el.style.border = '2px solid ' + r.color;
  el.style.boxShadow = r.glow ? ('0 0 10px ' + r.color) : '';
}
function rarityTag(idx) {
  const r = rarityOf(idx);
  return '<span class="sb-info" style="color:' + r.color + ';font-weight:bold">◆ ' + r.name + '</span>';
}

// -------------------- UTILIDADES UI --------------------
function setStatus(text, color) {
  const status = document.getElementById('saveStatus');
  status.textContent = text;
  status.style.color = color || '#88ff88';
  clearTimeout(status._t);
  status._t = setTimeout(() => { status.textContent = ''; }, 3000);
}
function hideScreens() {
  document.getElementById('menuScreen').style.display = 'none';
  document.getElementById('upgradeScreen').style.display = 'none';
  document.getElementById('storyScreen').style.display = 'none';
  document.getElementById('eventScreen').style.display = 'none';
  document.getElementById('legendScreen').style.display = 'none';
  document.getElementById('troopScreen').style.display = 'none';
  document.getElementById('resultOverlay').style.display = 'none';
  document.getElementById('gameWrap').style.display = 'none';
}
function showMenu() {
  leaveTestIfNeeded();
  if (gameMode === 'test') gameMode = 'menu';
  screen = 'menu'; playing = false;
  hideScreens();
  document.getElementById('menuScreen').style.display = 'flex';
  document.getElementById('continueBtn').style.display = readSave() ? 'inline-block' : 'none';
  document.getElementById('menuCoins').textContent = coins;
  document.getElementById('menuLoadoutCount').textContent = loadout.length;
  document.getElementById('menuStoryProgress').textContent = storyProgress;
  document.getElementById('evH').textContent = (eventProgress['halloween'] || 0);
  document.getElementById('evA').textContent = (eventProgress['alien'] || 0);
  document.getElementById('evI').textContent = (eventProgress['infernal'] || 0);
  document.getElementById('evX').textContent = (eventProgress['xmas'] || 0);
  document.getElementById('evL').textContent = legendProgress;
  updateDevModeButton();
}
function showGame() {
  screen = 'game';
  hideScreens();
  document.getElementById('gameWrap').style.display = 'block';
}
function goMenu() {
  if (gameMode === 'infinite' && playing) writeSave(buildSaveData());
  showMenu();
}

// --- Desbloqueos ---
function isUnitUnlocked(idx) {
  if (isDevMode()) return true;
  if (isTest()) return true;
  if (gachaUnlocked[idx]) return true;
  const u = UNIT_UNLOCK[idx];
  if (!u || u.type === 'always') return true;
  if (u.type === 'story') return storyProgress >= u.lvl;
  if (u.type === 'event') return (eventProgress[u.id] || 0) >= u.lvl;
  if (u.type === 'legend') return legendProgress >= u.lvl;
  return true;
}
function unlockLabel(idx) {
  const u = UNIT_UNLOCK[idx];
  if (!u || u.type === 'always') return '';
  if (u.type === 'story') return '🔒 Se desbloquea: Historia Nv.' + u.lvl;
  if (u.type === 'legend') return '🔒 Se desbloquea: Leyenda Etapa ' + u.lvl;
  const ev = EVENTS[u.id];
  return '🔒 Se desbloquea: ' + (ev ? ev.name : u.id) + ' Nv.' + u.lvl;
}
function unlockAtLevel(lvl) {
  const names = [];
  for (let i = 0; i < NUM_UNITS; i++) {
    const u = UNIT_UNLOCK[i];
    if (u && u.type === 'story' && u.lvl === lvl) names.push(UNIT_EMOJI[i] || '🐱');
  }
  return names.join('');
}
function eventUnlocksLabel(L) {
  if (!L.unlocks || !L.unlocks.length) return '';
  return 'Desbloquea: ' + L.unlocks.map(i => UNIT_EMOJI[i] || '🐱').join(' ');
}

// --- Menú de mejoras permanentes ---
function showUpgrades() {
  leaveTestIfNeeded();
  screen = 'upgrades'; playing = false;
  hideScreens();
  buildUpgradeScreen();
  document.getElementById('upgradeScreen').style.display = 'flex';
}
function buyUnitUpgrade(idx) {
  if (!isUnitUnlocked(idx)) return;
  if (unitLevels[idx] >= unitLevelCap()) return;
  if (!isDevMode()) {
    const cost = getUnitCoinCost(idx);
    if (coins < cost) return;
    coins -= cost;
  }
  unitLevels[idx]++;
  if (!isDevMode()) saveMeta();
  buildUpgradeScreen();
}
function buyCannonDmg() {
  if (cannonDmgLevel >= CANNON_DMG_MAX) return;
  if (!isDevMode()) { const c = getCannonDmgCoinCost(); if (coins < c) return; coins -= c; }
  cannonDmgLevel++;
  if (!isDevMode()) saveMeta();
  buildUpgradeScreen();
}
function buyCannonRange() {
  if (cannonRangeLevel >= CANNON_RANGE_MAX) return;
  if (!isDevMode()) { const c = getCannonRangeCoinCost(); if (coins < c) return; coins -= c; }
  cannonRangeLevel++;
  if (!isDevMode()) saveMeta();
  buildUpgradeScreen();
}
function buyCannonCd() {
  if (cannonCdLevel >= CANNON_CD_MAX) return;
  if (!isDevMode()) { const c = getCannonCdCoinCost(); if (coins < c) return; coins -= c; }
  cannonCdLevel++;
  if (!isDevMode()) saveMeta();
  buildUpgradeScreen();
}
function buyIncome() {
  if (incomeLevel >= MAX_INCOME_LEVEL) return;
  if (!isDevMode()) { const c = getIncomeCoinCost(); if (coins < c) return; coins -= c; }
  incomeLevel++;
  if (!isDevMode()) saveMeta();
  buildUpgradeScreen();
}
function buyCoinBonus() {
  if (coinBonusLevel >= COIN_BONUS_MAX) return;
  if (!isDevMode()) { const c = getCoinBonusCost(); if (coins < c) return; coins -= c; }
  coinBonusLevel++;
  if (!isDevMode()) saveMeta();
  buildUpgradeScreen();
}

function buildUpgradeScreen() {
  document.getElementById('upgCoins').textContent =
    isDevMode() ? coins + ' (DEV: gratis)' : coins;
  const ug = document.getElementById('upgradeUnitGrid');
  ug.innerHTML = '';
  CAT_BASE.forEach((u, idx) => {
    const unlocked = isUnitUnlocked(idx);
    const baseLvl = unitLevels[idx];
    const gachaLvl = gachaLevels[idx] || 0;
    const totalLvl = baseLvl + gachaLvl;
    const cap = unitLevelCap() + GACHA_LVL_MAX;
    const maxed = baseLvl >= unitLevelCap() && gachaLvl >= GACHA_LVL_MAX;
    const canBuyNormal = baseLvl < unitLevelCap();   // ¿se puede subir la mejora normal?
    const cost = getUnitCoinCost(idx);
    const evo = totalLvl >= EVOLVE_LEVEL;
    const b = document.createElement('button');
    applyRarityStyle(b, idx);
    if (!unlocked) {
      b.className = 'upg-card lockedcard';
      b.disabled = true;
      b.innerHTML = '🔒 ' + u.name + rarityTag(idx) +
        '<span class="sb-info locked">' + unlockLabel(idx) + '</span>' +
        '<span class="sb-info locked">Desbloquéala para mejorarla</span>';
    } else {
      const cur = unitStatsAt(idx, totalLvl);
      const nxt = unitStatsAt(idx, totalLvl + 1);
      let preview;
      if (u.healAmt) preview = 'HP ' + cur.hp + '→<span class="up">' + nxt.hp + '</span> · Cura ' + cur.heal + '→<span class="up">' + nxt.heal + '</span>';
      else preview = 'HP ' + cur.hp + '→<span class="up">' + nxt.hp + '</span> · DMG ' + cur.dmg + '→<span class="up">' + nxt.dmg + '</span>';
      // etiqueta de nivel (con desglose base + 🎰 si hay gacha)
      const lvlLabel = gachaLvl > 0
        ? 'Nivel ' + totalLvl + '/' + cap + ' (base ' + baseLvl + ' + 🎰' + gachaLvl + ')'
        : 'Nivel ' + totalLvl + '/' + cap;
      // línea de estado/costo (construida con if/else: sin paréntesis anidados)
      let statusLine;
      if (maxed) {
        statusLine = '🏆 MAX';
      } else if (!canBuyNormal) {
        statusLine = '⬆️ Mejoras base al tope (usa 🎰 del Almacén para más niveles)';
      } else if (isDevMode()) {
        statusLine = '➡ Nv.' + (totalLvl + 1) + ': GRATIS [DEV]';
      } else {
        statusLine = '➡ Nv.' + (totalLvl + 1) + ': ' + cost + ' ' + COIN;
      }
      // ¿se puede clicar? solo si hay mejora normal disponible y (dev o coins suficientes)
      b.disabled = maxed || !canBuyNormal || (!isDevMode() && coins < cost);
      b.className = 'upg-card' + (maxed ? ' maxed' : '');
      b.innerHTML =
        UNIT_EMOJI[idx] + ' ' + u.name + rarityTag(idx) +
        '<span class="sb-info">' + lvlLabel + (evo ? ' · ✨ EVOLUCIONADA' : '') + '</span>' +
        '<span class="sb-info">' + (canBuyNormal && !maxed ? preview : '') + '</span>' +
        (evo ? '<span class="sb-info" style="color:#88ffcc">✨ +10% stats por evolución</span>' : '') +
        '<span class="sb-info">' + statusLine + '</span>' +
        (isDevMode() ? '<span class="sb-info" style="color:#ff88ff"> [DEV]</span>' : '');
      b.onclick = () => buyUnitUpgrade(idx);
    }
    ug.appendChild(b);
  });
  const mg = document.getElementById('upgradeMiscGrid');
  mg.innerHTML = '';
  const curDmgPct = (getCannonDamagePercentAt(cannonDmgLevel) * 100).toFixed(1);
  const nxtDmgPct = (getCannonDamagePercentAt(cannonDmgLevel + 1) * 100).toFixed(1);
  const curCd = cannonCdSecAt(cannonDmgLevel, cannonCdLevel);
  const cdIfDmg = cannonCdSecAt(cannonDmgLevel + 1, cannonCdLevel);
  const cdIfCd = cannonCdSecAt(cannonDmgLevel, cannonCdLevel + 1);
  const misc = [
    { label:'💣 Cañón: Daño', info:'Nv ' + cannonDmgLevel + '/' + CANNON_DMG_MAX, max:cannonDmgLevel >= CANNON_DMG_MAX, cost:getCannonDmgCoinCost(), fn:'buyCannonDmg()',
      preview:'Daño ' + curDmgPct + '%→<span class="up">' + nxtDmgPct + '%</span> · CD ' + curCd + 's→<span class="down">' + cdIfDmg + 's</span>' },
    { label:'💣 Cañón: Rango', info:'Nv ' + cannonRangeLevel + '/' + CANNON_RANGE_MAX, max:cannonRangeLevel >= CANNON_RANGE_MAX, cost:getCannonRangeCoinCost(), fn:'buyCannonRange()',
      preview:'Rango ' + getCannonRangeAt(cannonRangeLevel) + 'px→<span class="up">' + getCannonRangeAt(cannonRangeLevel + 1) + 'px</span>' },
    { label:'💣 Cañón: Cooldown', info:'Nv ' + cannonCdLevel + '/' + CANNON_CD_MAX, max:cannonCdLevel >= CANNON_CD_MAX, cost:getCannonCdCoinCost(), fn:'buyCannonCd()',
      preview:'CD ' + curCd + 's→<span class="up">' + cdIfCd + 's</span>' },
    { label:'💵 Income base', info:'Nv ' + incomeLevel + '/' + MAX_INCOME_LEVEL, max:incomeLevel >= MAX_INCOME_LEVEL, cost:getIncomeCoinCost(), fn:'buyIncome()',
      preview:getIncomeAt(incomeLevel).toFixed(0) + '/s→<span class="up">' + getIncomeAt(incomeLevel + 1).toFixed(0) + '/s</span>' },
    { label:'🐾 Bonus de Coins', info:'Nv ' + coinBonusLevel + '/' + COIN_BONUS_MAX, max:coinBonusLevel >= COIN_BONUS_MAX, cost:getCoinBonusCost(), fn:'buyCoinBonus()',
      preview:'Ganas +' + Math.round(getCoinBonusPercentAt(coinBonusLevel) * 100) + '% → <span class="up">+' + Math.round(getCoinBonusPercentAt(coinBonusLevel + 1) * 100) + '%</span> de 🐾 por nivel superado' },
  ];
  misc.forEach(m => {
    const b = document.createElement('button');
    b.className = 'upg-card' + (m.max ? ' maxed' : '');
    b.disabled = m.max || (!isDevMode() && coins < m.cost);
    b.setAttribute('onclick', m.fn);
    b.innerHTML =
      m.label + '<span class="sb-info">' + m.info + '</span>' +
      '<span class="sb-info">' + (m.max ? '' : m.preview) + '</span>' +
      '<span class="sb-info">' + (m.max ? '🏆 MAX' : (isDevMode() ? '➡ GRATIS [DEV]' : '➡ ' + m.cost + ' ' + COIN)) + '</span>' +
      (isDevMode() ? '<span class="sb-info" style="color:#ff88ff"> [DEV]</span>' : '');
    mg.appendChild(b);
  });
}

// --- Historia ---
function showStory() {
  leaveTestIfNeeded();
  screen = 'story'; playing = false;
  hideScreens();
  buildStoryGrid();
  document.getElementById('storyScreen').style.display = 'flex';
}
function buildStoryGrid() {
  const grid = document.getElementById('storyGrid');
  grid.innerHTML = '';
  STORY_LEVELS.forEach((L, idx) => {
    const lvl = idx + 1;
    if (lvl === 16) {
      const h = document.createElement('div');
      h.className = 'grid-header';
      h.textContent = '📖 PARTE 2 — Tierras del Rey (desbloquea al 👑 al final)';
      grid.appendChild(h);
    }
    if (lvl === 31) {
      const h = document.createElement('div');
      h.className = 'grid-header';
      h.textContent = '🏜️ PARTE 3 — Desierto Prohibido: momias, escarabajos, djinns y los 3 jefes del desierto';
      grid.appendChild(h);
    }
    const unlocked = isDevMode() || idx <= storyProgress;
    const done = idx < storyProgress;
    const unlock = unlockAtLevel(lvl);
    const b = document.createElement('button');
    b.className = 'story-btn';
    b.disabled = !unlocked;
    const rewardInfo =
      '<span class="sb-info">' + COIN + ' 1ª:' + coinRewardFor(L.coins, true) + ' / rep:' + coinRewardFor(L.coins, false) +
      (coinBonusLevel > 0 ? ' <span class="up">(+' + Math.round(getCoinBonusPercent() * 100) + '%)</span>' : '') +
      '</span>';
    const devTag = isDevMode() ? '<span class="sb-info" style="color:#ff88ff"> [DEV]</span>' : '';
    b.innerHTML =
      (done ? '✅' : unlocked ? '▶' : '🔒') + ' ' + L.name + (L.boss >= 0 ? ' 👑' : '') +
      '<span class="sb-info">Base: ' + L.enemyBaseHP + ' HP · ×' + L.mult.toFixed(2) + '</span>' +
      rewardInfo +
      (unlock ? '<span class="sb-info unlock">Desbloquea: ' + unlock + '</span>' : '') +
      devTag;
    if (unlocked) b.onclick = () => startStory(idx);
    grid.appendChild(b);
  });
}

// --- Eventos ---
function showEvents() {
  leaveTestIfNeeded();
  screen = 'events'; playing = false;
  hideScreens();
  buildEventGrid();
  document.getElementById('eventScreen').style.display = 'flex';
}
function buildEventGrid() {
  const grid = document.getElementById('eventGrid');
  grid.innerHTML = '';
  document.getElementById('eventBackBtn').style.display = 'none';
  document.getElementById('eventMenuBtn').style.display = 'inline-block';
  document.getElementById('eventInfo').textContent =
    'Eventos temáticos con recompensas de ' + COIN + ' (mitad al repetir) y tropas exclusivas.' +
    (isDevMode() ? ' 🔧 [MODO DEV: todos desbloqueados, nada se guarda]' : '');
  Object.values(EVENTS).forEach(ev => {
    const progress = isDevMode() ? ev.levels.length : (eventProgress[ev.id] || 0);
    const b = document.createElement('button');
    b.className = 'event-btn ' + ev.theme;
    b.innerHTML = ev.name + '<span class="sb-info">' + ev.description + '</span><span class="sb-info">Progreso: ' + progress + '/' + ev.levels.length + '</span>';
    b.onclick = () => showEventLevels(ev.id);
    grid.appendChild(b);
  });
}
function showEventLevels(eventId) {
  const ev = EVENTS[eventId];
  const grid = document.getElementById('eventGrid');
  grid.innerHTML = '';
  const progress = isDevMode() ? ev.levels.length : (eventProgress[eventId] || 0);
  document.getElementById('eventInfo').textContent =
    ev.name + ' — ' + ev.description + (isDevMode() ? ' 🔧 [MODO DEV]' : '');
  ev.levels.forEach((L, idx) => {
    const unlocked = isDevMode() || idx <= progress;
    const done = idx < progress;
    const uk = eventUnlocksLabel(L);
    const b = document.createElement('button');
    b.className = 'event-btn ' + ev.theme;
    b.disabled = !unlocked;
    const rewardInfo =
      '<span class="sb-info">' + COIN + ' 1ª:' + coinRewardFor(L.coins, true) + ' / rep:' + coinRewardFor(L.coins, false) +
      (coinBonusLevel > 0 ? ' <span class="up">(+' + Math.round(getCoinBonusPercent() * 100) + '%)</span>' : '') +
      '</span>';
    const devTag = isDevMode() ? '<span class="sb-info" style="color:#ff88ff"> [DEV]</span>' : '';
    b.innerHTML =
      (done ? '✅' : unlocked ? '▶' : '🔒') + ' ' + L.name + (L.boss ? ' 👑' : '') +
      '<span class="sb-info">Base: ' + L.enemyBaseHP + ' HP · ×' + L.mult.toFixed(1) + '</span>' +
      rewardInfo +
      (uk ? '<span class="sb-info unlock">' + uk + '</span>' : '') +
      devTag;
    if (unlocked) b.onclick = () => startEvent(eventId, idx);
    grid.appendChild(b);
  });
  document.getElementById('eventBackBtn').style.display = 'inline-block';
  document.getElementById('eventMenuBtn').style.display = 'none';
}

// --- v59: Etapas de Leyenda ---
function legendUnlocked() { return isDevMode() || storyProgress >= STORY_MAX_LEVEL; }
function showLegend() {
  leaveTestIfNeeded();
  screen = 'legend'; playing = false;
  hideScreens();
  buildLegendGrid();
  document.getElementById('legendScreen').style.display = 'flex';
}
function buildLegendGrid() {
  const grid = document.getElementById('legendGrid');
  grid.innerHTML = '';
  const info = document.getElementById('legendInfo');
  if (info) {
    info.innerHTML = legendUnlocked()
      ? 'Endgame definitivo: 6 zonas × 5 etapas, jefes únicos y tropas enemigas de élite. Recompensas de ' + COIN + ' (mitad al repetir). Progreso: <b>' + legendProgress + '/' + LEGEND_STAGES.length + '</b>' + (isDevMode() ? ' 🔧 [MODO DEV]' : '')
      : '🔒 Se desbloquea al completar la Historia Nivel 45 (Desierto Prohibido).';
  }
  let lastZone = -1;
  LEGEND_STAGES.forEach((L, idx) => {
    if (L.zone !== lastZone) {
      lastZone = L.zone;
      const h = document.createElement('div');
      h.className = 'grid-header';
      h.textContent = LEGEND_ZONE_TITLES[L.zone];
      grid.appendChild(h);
    }
    const unlocked = isDevMode() || (legendUnlocked() && idx <= legendProgress);
    const done = idx < legendProgress;
    const b = document.createElement('button');
    b.className = 'story-btn';
    b.disabled = !unlocked;
    b.innerHTML =
      (done ? '✅' : unlocked ? '▶' : '🔒') + ' ' + L.name + (L.boss ? ' 👑' : '') +
      '<span class="sb-info">Base: ' + L.enemyBaseHP + ' HP · ×' + L.mult.toFixed(1) + '</span>' +
      '<span class="sb-info">' + COIN + ' 1ª:' + coinRewardFor(L.coins, true) + ' / rep:' + coinRewardFor(L.coins, false) + '</span>' +
      (isDevMode() ? '<span class="sb-info" style="color:#ff88ff"> [DEV]</span>' : '');
    if (unlocked) b.onclick = () => startLegend(idx);
    grid.appendChild(b);
  });
}

// --- Selección de tropas ---
function showTroops() {
  leaveTestIfNeeded();
  screen = 'troops'; playing = false;
  hideScreens();
  tempLoadout = [...loadout];
  buildTroopGrid();
  document.getElementById('troopScreen').style.display = 'flex';
}
function troopStatsLine(idx) {
  const u = CAT_BASE[idx];
  const stats = getCatStats(idx);
  let line = u.cost + '💰 · HP:' + stats.hp + ' · ';
  line += u.healAmt ? 'Cura:' + stats.healAmt : 'DMG:' + stats.dmg;
  line += ' · SPD:' + stats.speed;
  if (stats.aoeRadius) line += ' · AOE:' + stats.aoeRadius;
  if (u.healAmt) line += ' · RNG:' + stats.range;
  else if (stats.type === 'ranged' || stats.type === 'roboRanged') line += ' · RNG:' + stats.range;
  if (hasProj(stats)) line += ' · PRJ:' + projRangeOf(stats);
  line += ' · CD:' + u.spawnCd + 's';
  return line;
}
function buildTroopGrid() {
  const grid = document.getElementById('troopGrid');
  grid.innerHTML = '';
  CAT_BASE.forEach((u, idx) => {
    const unlocked = isUnitUnlocked(idx);
    const sel = tempLoadout.includes(idx);
    const canEvo = (unitLevels[idx] + (gachaLevels[idx] || 0)) >= EVOLVE_LEVEL;
    const evoActive = formIsEvo(idx);
    const card = document.createElement('div');
    card.className = 'troop-card' + (sel ? ' selected' : '') + (unlocked ? '' : ' lockedcard');
    if (unlocked) applyRarityStyle(card, idx);
    let line = troopStatsLine(idx);
    if (canEvo) line += evoActive ? ' · ✨ Evolución activa' : ' · 🐱 Forma normal';
    const selectBtn = document.createElement('button');
    selectBtn.style.cssText = 'display:block;width:100%;background:transparent;border:none;box-shadow:none;color:inherit;padding:0;font-size:12px;cursor:pointer;text-align:center;';
    selectBtn.disabled = !unlocked;
    selectBtn.innerHTML = unlocked
      ? UNIT_EMOJI[idx] + ' ' + u.name + rarityTag(idx) + '<span class="sb-info">' + line + '</span><span class="sb-info">' + (sel ? '✅ En el escuadrón' : '➕ Añadir') + '</span>'
      : '🔒 ' + u.name + rarityTag(idx) + '<span class="sb-info">' + line + '</span><span class="sb-info locked">' + unlockLabel(idx) + '</span>';
    selectBtn.onclick = () => toggleTroop(idx);
    card.appendChild(selectBtn);
    const formBtn = document.createElement('button');
    formBtn.style.cssText = 'margin-top:6px;width:100%;font-size:10px;padding:4px 6px;';
    if (!unlocked) {
      formBtn.disabled = true;
      formBtn.style.background = 'linear-gradient(135deg,#333,#222)';
      formBtn.textContent = '🔒 Formas: desbloquea la tropa';
    } else if (!canEvo) {
      formBtn.disabled = true;
      formBtn.style.background = 'linear-gradient(135deg,#333,#222)';
      formBtn.textContent = '🔒 Forma evolucionada: se activa al Nv.10';
    } else {
      formBtn.style.background = evoActive ? 'linear-gradient(135deg,#ffd700,#aa7700)' : 'linear-gradient(135deg,#8899aa,#556677)';
      formBtn.style.color = evoActive ? '#221100' : '#fff';
      formBtn.textContent = evoActive ? '✨ Usar forma evolucionada' : '🐱 Usar forma normal';
      formBtn.onclick = () => {
        unitFormPref[idx] = evoActive ? 'normal' : 'evo';
        saveForms();
        buildTroopGrid();
      };
    }
    card.appendChild(formBtn);
    grid.appendChild(card);
  });
  document.getElementById('troopCount').textContent = 'Seleccionadas: ' + tempLoadout.length + '/' + MAX_LOADOUT;
}
function toggleTroop(idx) {
  if (!isUnitUnlocked(idx)) return;
  const pos = tempLoadout.indexOf(idx);
  if (pos >= 0) { if (tempLoadout.length > 1) tempLoadout.splice(pos, 1); }
  else { if (tempLoadout.length < MAX_LOADOUT) tempLoadout.push(idx); }
  buildTroopGrid();
}
function saveLoadoutAndBack() {
  loadout = [...new Set(tempLoadout.filter(i => isUnitUnlocked(i)))].sort((a, b) => a - b);
  if (loadout.length === 0) loadout = [0];
  saveLoadout();
  showMenu();
}

// --- Paneles dentro de la partida ---
function buildMetaInfoPanel() {
  const el = document.getElementById('metaInfo');
  let html = '';
  activeUnitList().forEach(idx => {
    const r = rarityOf(idx);
    const totalLvl = unitLevels[idx] + (gachaLevels[idx] || 0);
    html += UNIT_EMOJI[idx] + ' <span style="color:' + r.color + '">' + CAT_BASE[idx].name + '</span>: <b>Nv.' + totalLvl + '/' + (unitLevelCap() + GACHA_LVL_MAX) + '</b>' + (formIsEvo(idx) ? ' ✨' : '') + (gachaLevels[idx] ? ' <span style="color:#ff88ff">+' + gachaLevels[idx] + '🎰</span>' : '') + '<br>';
  });
  html += '<hr style="border-color:#444">💵 Income: <b>Nv.' + incomeLevel + '/' + MAX_INCOME_LEVEL + '</b><br>';
  html += '💣 Cañón: <b>D' + cannonDmgLevel + ' R' + cannonRangeLevel + ' C' + cannonCdLevel + '</b><br>';
  html += '🐾 Bonus coins: <b>+' + Math.round(getCoinBonusPercent() * 100) + '%</b> (Nv.' + coinBonusLevel + '/' + COIN_BONUS_MAX + ')<br>';
  html += '🏰 Base: <b>Nv.' + baseLevel + '/' + BASE_GACHA_MAX + '</b> (+' + baseLevel * BASE_HP_PER_LEVEL + ' HP máx)';
  el.innerHTML = html;
}
function buildUnitButtons() {
  const uc = document.getElementById('unitButtons');
  uc.innerHTML = '';
  const list = activeUnitList();
  document.getElementById('unitPanelTitle').textContent = isTest()
    ? '🐱 UNIDADES (🧪 sandbox: todas disponibles)'
    : '🐱 UNIDADES (escuadrón)';
  list.forEach(idx => {
    const u = CAT_BASE[idx];
    const b = document.createElement('button');
    b.className = 'cat' + (idx + 1) + ' side';
    b.id = 'btn' + idx;
    b.onclick = () => spawnCat(idx);
    applyRarityStyle(b, idx);
    const totalLvl = unitLevels[idx] + (gachaLevels[idx] || 0);
    b.innerHTML = UNIT_EMOJI[idx] + ' ' + u.name + ' (' + u.cost + '💰)<span class="level-badge" id="lvl' + idx + '">' + totalLvl + '</span>' + rarityTag(idx) + '<span class="stats" id="stats' + idx + '"></span><span class="cd" id="cd' + idx + '">CD: ' + u.spawnCd + 's</span>';
    uc.appendChild(b);
  });
  buildMetaInfoPanel();
}
function setTestControlsVisible(v) {
  document.getElementById('testControls').style.display = v ? 'flex' : 'none';
  document.getElementById('gameHint').textContent = v
    ? '💡 Sandbox: todas las unidades disponibles · dinero ∞ · sin cooldowns de invocación · base invulnerable'
    : '💡 Click en una tropa propia para retirarla · Las mejoras se compran en el menú principal con 🐾';
}

// --- Refresco de HUD en batalla ---
function updateUI() {
  document.getElementById('money').textContent = isTest() ? '∞' : Math.floor(money);
  document.getElementById('baseHP').textContent = isTest() ? '∞' : Math.floor(baseHP);
  document.getElementById('enemyHP').textContent = Math.floor(enemyBaseHP);
  document.getElementById('waveLabel').textContent = gameMode === 'story' ? '📖 Nivel:' : (isTest() ? '🧪 Oleada:' : (isEvent() ? '🎃 Nivel:' : (gameMode === 'legend' ? '🌟 Etapa:' : '🌊 Oleada:')));
  document.getElementById('wave').textContent = gameMode === 'story' ? (storyLevelIdx + 1) : (isEvent() ? (eventLevelIdx + 1) : (gameMode === 'legend' ? (legendLevelIdx + 1) : wave));
  document.getElementById('catCount').textContent = cats.length;
  document.getElementById('enemyCount').textContent = enemies.length;
  document.getElementById('income').textContent = isTest() ? '∞' : getIncome().toFixed(1);
  document.getElementById('incomeLevel').textContent = incomeLevel;
  const list = activeUnitList();
  for (const i of list) {
    const badge = document.getElementById('lvl' + i);
    if (badge) badge.textContent = unitLevels[i] + (gachaLevels[i] ? '+' + gachaLevels[i] : '');
  }
  for (const i of list) {
    const btn = document.getElementById('btn' + i);
    const cdEl = document.getElementById('cd' + i);
    if (btn && cdEl) {
      if (!isTest() && spawnTimers[i] > 0) {
        btn.disabled = true;
        cdEl.textContent = '⏳ ' + (spawnTimers[i] / 60).toFixed(1) + 's';
      } else {
        btn.disabled = false;
        cdEl.textContent = isTest() ? 'CD: 0s (pruebas)' : ('CD: ' + CAT_BASE[i].spawnCd + 's');
      }
    }
  }
  for (const i of list) {
    const statsEl = document.getElementById('stats' + i);
    if (statsEl) {
      const stats = getCatStats(i);
      const waveBonus = getWaveBonus();
      const displayHp = Math.min(Math.floor(stats.hp * waveBonus), MAX_STATS);
      const displayDmg = Math.min(Math.floor(stats.dmg * waveBonus), MAX_STATS);
      const displayHeal = Math.min(Math.floor(stats.healAmt * waveBonus), MAX_STATS);
      let statsText = i === 5 ? 'HP:' + displayHp + ' Heal:' + displayHeal + ' RNG:' + stats.range
        : i === 4 ? 'HP:' + displayHp + ' DMG:' + displayDmg + ' AOE:' + stats.aoeRadius + ' RNG:' + stats.range
        : (i === 3 || i === 8) ? 'HP:' + displayHp + ' DMG:' + displayDmg + ' RNG:' + stats.range
        : i === 9 ? 'HP:' + displayHp + ' DMG:' + displayDmg + ' AOE:' + stats.aoeRadius
        : i === 12 ? 'HP:' + displayHp + ' DMG:' + displayDmg + ' AOE:' + stats.aoeRadius + ' RNG:' + stats.range
        : 'HP:' + displayHp + ' DMG:' + displayDmg + ' SPD:' + stats.speed.toFixed(1);
      if (hasProj(CAT_BASE[i])) statsText += ' PRJ:' + projRangeOf(CAT_BASE[i]);
      if (formIsEvo(i)) statsText = '✨ ' + statsText;
      statsEl.textContent = statsText;
    }
  }
  const cannonBtn = document.getElementById('cannonBtn');
  const cannonCooldownEl = document.getElementById('cannonCooldown');
  const cannonBar = document.getElementById('cannonBar');
  const cannonStats = document.getElementById('cannonStats');
  const maxCd = getCannonCooldownFrames();
  const dmgPct = (getCannonDamagePercent() * 100).toFixed(1);
  const range = getCannonRange();
  const cdSec = Math.ceil(maxCd / 60);
  cannonStats.textContent = dmgPct + '% HP | Rango: ' + range + 'px | CD: ' + cdSec + 's';
  if (cannonCooldown > 0) {
    const seconds = Math.ceil(cannonCooldown / 60);
    cannonCooldownEl.textContent = seconds + 's';
    cannonBar.style.width = (100 - (cannonCooldown / maxCd * 100)) + '%';
    cannonBtn.disabled = true;
  } else {
    cannonCooldownEl.textContent = '¡Listo!';
    cannonBar.style.width = '100%';
    cannonBtn.disabled = false;
  }
}

// --- Overlay de resultados ---
function showResult(victory, text) {
  document.getElementById('resultTitle').textContent = victory ? '🎉 ¡VICTORIA!' : '💀 DERROTA';
  document.getElementById('resultText').textContent = text;
  document.getElementById('retryBtn').style.display = 'inline-block';
  document.getElementById('nextBtn').style.display = victory ? 'inline-block' : 'none';
  document.getElementById('resultOverlay').style.display = 'flex';
}