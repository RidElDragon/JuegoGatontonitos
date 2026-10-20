// ============================================================
// 04-ui.js — v79d
// · Medallas de tesoro en Historia: 🥇/🥈/🥉/○
// · Gamatoto NO aparece en tropas (solo vive en 12-gamatoto.js)
// · Cartera + Income en partida reflejados en HUD/panel
// · Navegación, ajustes, mejoras, historia, eventos, leyenda, tropas
// · Toast, candados, música de menú al salir de batalla
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

// -------------------- ESTADO DE NAVEGACIÓN --------------------
const hubState = { mode: null, chapter: null };
const MODES = [
  { key:'story',    name:'📖 Modo Historia',       color:'#3f8fd0', chapters:true },
  { key:'event',    name:'🎃 Eventos Especiales',  color:'#ff6600', chapters:true },
  { key:'legend',   name:'🌟 Etapas de Leyenda',   color:'#e02020', chapters:true },
  { key:'infinite', name:'∞ Modo Infinito',        color:'#b0764a', chapters:false },
  { key:'test',     name:'🧪 Sandbox',             color:'#c8bfe8', chapters:false },
];
const STORY_PART_NAMES = ['Praderas del Inicio', 'Tierras del Rey', 'Desierto Prohibido'];
const LEGEND_ZONE_SHORT = ['Ruinas Ancestrales', 'Caldera de Magma', 'Islas Flotantes', 'Fosa Abisal', 'Fábrica de Engranajes', 'Umbral del Vacío'];
function modeObj(key) { for (const m of MODES) if (m.key === key) return m; return null; }
function chaptersFor(mode) {
  if (mode === 'story') return [
    { value:1, name:STORY_PART_NAMES[0], color:'#e8b23a' },
    { value:2, name:STORY_PART_NAMES[1], color:'#e8b23a' },
    { value:3, name:STORY_PART_NAMES[2], color:'#e8b23a' },
  ];
  if (mode === 'event') return Object.values(EVENTS).map(ev => ({ value:ev.id, name:ev.name, color:'#ff8844' }));
  if (mode === 'legend') return LEGEND_ZONE_SHORT.map((n, i) => ({ value:i, name:n, color:'#e02020' }));
  return [];
}

// -------------------- UTILIDADES UI --------------------
function setStatus(text, color) {
  const status = document.getElementById('saveStatus');
  if (!status) return;
  status.textContent = text;
  status.style.color = color || '#88ff88';
  clearTimeout(status._t);
  status._t = setTimeout(() => { status.textContent = ''; }, 3000);
}
function hideScreens() {
  const ids = ['titleScreen','carouselScreen','chapterScreen','hubScreen','upgradeScreen','storyScreen','eventScreen','legendScreen','troopScreen','resultOverlay','gameWrap'];
  for (const id of ids) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
}
function showTitle() {
  leaveTestIfNeeded();
  screen = 'title'; playing = false;
  hideScreens();
  document.getElementById('titleScreen').style.display = 'flex';
}
function showCarousel() {
  leaveTestIfNeeded();
  screen = 'carousel'; playing = false;
  hideScreens();
  document.getElementById('carouselScreen').style.display = 'flex';
  renderModeBand();
}
function showChapters() {
  leaveTestIfNeeded();
  screen = 'chapters'; playing = false;
  hideScreens();
  document.getElementById('chapterScreen').style.display = 'flex';
  renderChapterBand();
}
function showHub() {
  leaveTestIfNeeded();
  screen = 'hub'; playing = false;
  hideScreens();
  document.getElementById('hubScreen').style.display = 'flex';
  renderHub();
}
function showMenu() {
  if (hubState.mode) showHub(); else showCarousel();
}
function showGame() {
  screen = 'game';
  hideScreens();
  document.getElementById('gameWrap').style.display = 'block';
}
function goMenu() {
  if (gameMode === 'infinite' && playing) writeSave(buildSaveData());
  showHub();
}
function scrollCarousel(dir) { const b = document.getElementById('modeBand'); if (b) b.scrollBy({ left: dir * 260, behavior: 'smooth' }); }
function scrollChapters(dir) { const b = document.getElementById('chapterBand'); if (b) b.scrollBy({ left: dir * 260, behavior: 'smooth' }); }
function renderModeBand() {
  const band = document.getElementById('modeBand');
  if (!band) return;
  band.innerHTML = '';
  band.style.overflowX = 'auto';
  band.style.scrollBehavior = 'smooth';
  MODES.forEach(m => {
    const c = document.createElement('button');
    c.className = 'mode-card';
    c.style.background = m.color;
    c.textContent = m.name;
    c.onclick = () => selectMode(m.key);
    band.appendChild(c);
  });
}
function selectMode(key) {
  hubState.mode = key;
  hubState.chapter = null;
  const m = modeObj(key);
  if (m && m.chapters) showChapters(); else showHub();
}
function renderChapterBand() {
  const band = document.getElementById('chapterBand');
  if (!band) return;
  band.innerHTML = '';
  band.style.overflowX = 'auto';
  band.style.scrollBehavior = 'smooth';
  const back = document.createElement('button');
  back.className = 'chapter-card back-card';
  back.textContent = 'Volver';
  back.onclick = showCarousel;
  band.appendChild(back);
  chaptersFor(hubState.mode).forEach((ch, i) => {
    const c = document.createElement('button');
    c.className = 'chapter-card';
    c.style.background = ch.color;
    c.innerHTML = '<span class="ch-num">Capítulo ' + (i + 1) + '</span><br>' + ch.name;
    c.onclick = () => { hubState.chapter = ch.value; showHub(); };
    band.appendChild(c);
  });
}
function renderHub() {
  const m = modeObj(hubState.mode);
  const base = document.getElementById('hubBase');
  const modeEl = document.getElementById('hubMode');
  const xp = document.getElementById('hubXP');
  const cannon = document.getElementById('hubCannon');
  if (base) base.textContent = 'Base Gatuna Nv.' + baseLevel;
  let title = m ? m.name : '';
  if (hubState.chapter != null) {
    const ch = chaptersFor(hubState.mode).find(c => c.value === hubState.chapter);
    if (ch) title += ' · ' + ch.name;
  }
  if (modeEl) modeEl.textContent = title;
  if (xp) xp.textContent = coins;
  if (cannon) {
    const eff = getEffectiveCannonDmgLevel();
    const bonus = eff > cannonDmgLevel ? ' (+' + (eff - cannonDmgLevel) + '💎)' : '';
    cannon.innerHTML = 'ℹ️ Cañón Nv.' + cannonDmgLevel + bonus + ' · Rango <b>' + getCannonRange() + '</b>';
  }
}
function hubStart() {
  leaveTestIfNeeded();
  const m = hubState.mode;
  if (m === 'story') showStoryScreen();
  else if (m === 'event') showEventScreen();
  else if (m === 'legend') showLegendScreen();
  else if (m === 'infinite') { if (readSave()) continueInfinite(); else startInfinite(true); }
  else if (m === 'test') startTest();
}
function hubUpgrade() { showUpgrades(); }
function hubOrganize() { showTroops(); }
function hubBack() {
  const m = modeObj(hubState.mode);
  if (m && m.chapters) showChapters(); else showCarousel();
}
function eventBallsSoon() { setStatus('🔮 Las Bolas de evento llegarán en una futura actualización', '#ffaa00'); }

// -------------------- AJUSTES --------------------
function openSettings() {
  syncSettingsUI();
  const o = document.getElementById('settingsOverlay');
  if (o) o.style.display = 'flex';
}
function closeSettings() {
  const o = document.getElementById('settingsOverlay');
  if (o) o.style.display = 'none';
}
function syncSettingsUI() {
  if (window.audioControls) {
    const s = window.audioControls.settings;
    const m = document.getElementById('setMusicVol');
    const x = document.getElementById('setSfxVol');
    if (m) m.value = Math.round(s.music * 100);
    if (x) x.value = Math.round(s.sfx * 100);
  }
  updateDevModeButton();
}
function setSettingMusic(v) { if (window.audioControls) window.audioControls.setMusic(v); }
function setSettingSfx(v) { if (window.audioControls) window.audioControls.setSfx(v); }
function toggleSettingMusicMute() { if (window.audioControls) { window.audioControls.muteMusic(); syncSettingsUI(); } }
function toggleSettingSfxMute() { if (window.audioControls) { window.audioControls.muteSfx(); syncSettingsUI(); } }
function testSettingSound() { if (window.audioControls) window.audioControls.test(); }

// -------------------- DESBLOQUEOS --------------------
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

// -------------------- MEJORAS --------------------
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
function buyWallet() {
  if (walletLevel >= WALLET_UPGRADE_MAX) return;
  if (!isDevMode()) { const c = getWalletUpgradeCost(); if (coins < c) return; coins -= c; }
  walletLevel++;
  if (!isDevMode()) saveMeta();
  buildUpgradeScreen();
}
function buyBaseDef() {
  if (baseDefLevel >= BASE_DEF_MAX) return;
  if (!isDevMode()) { const c = getBaseDefCost(); if (coins < c) return; coins -= c; }
  baseDefLevel++;
  if (!isDevMode()) saveMeta();
  buildUpgradeScreen();
}
function buyResearch() {
  if (researchLevel >= RESEARCH_MAX) return;
  if (!isDevMode()) { const c = getResearchCost(); if (coins < c) return; coins -= c; }
  researchLevel++;
  if (!isDevMode()) saveMeta();
  buildUpgradeScreen();
}
function buyReward() {
  if (rewardLevel >= REWARD_MAX) return;
  if (!isDevMode()) { const c = getRewardCost(); if (coins < c) return; coins -= c; }
  rewardLevel++;
  if (!isDevMode()) saveMeta();
  buildUpgradeScreen();
}
function buildUpgradeScreen() {
  document.getElementById('upgCoins').textContent = isDevMode() ? coins + ' (DEV)' : coins;
  const ug = document.getElementById('upgradeUnitGrid');
  ug.innerHTML = '';
  CAT_BASE.forEach((u, idx) => {
    const unlocked = isUnitUnlocked(idx);
    const baseLvl = unitLevels[idx];
    const gachaLvl = gachaLevels[idx] || 0;
    const totalLvl = baseLvl + gachaLvl;
    const cap = unitLevelCap() + GACHA_LVL_MAX;
    const maxed = baseLvl >= unitLevelCap() && gachaLvl >= GACHA_LVL_MAX;
    const canBuyNormal = baseLvl < unitLevelCap();
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
      const lvlLabel = gachaLvl > 0
        ? 'Nivel ' + totalLvl + '/' + cap + ' (base ' + baseLvl + ' + 🎰' + gachaLvl + ')'
        : 'Nivel ' + totalLvl + '/' + cap;
      let statusLine;
      if (maxed) statusLine = '🏆 MAX';
      else if (!canBuyNormal) statusLine = '⬆️ Base al tope (usa 🎰 del Almacén)';
      else if (isDevMode()) statusLine = '➡ Nv.' + (totalLvl + 1) + ': GRATIS [DEV]';
      else statusLine = '➡ Nv.' + (totalLvl + 1) + ': ' + cost + ' ' + COIN;
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
    { label:'⭐ Bonus de XP', info:'Nv ' + coinBonusLevel + '/' + COIN_BONUS_MAX, max:coinBonusLevel >= COIN_BONUS_MAX, cost:getCoinBonusCost(), fn:'buyCoinBonus()',
      preview:'Ganas +' + Math.round(getCoinBonusPercentAt(coinBonusLevel) * 100) + '% → <span class="up">+' + Math.round(getCoinBonusPercentAt(coinBonusLevel + 1) * 100) + '%</span> de XP por nivel' },
    { label:'💼 Cartera', info:'Nv ' + walletLevel + '/' + WALLET_UPGRADE_MAX, max:walletLevel >= WALLET_UPGRADE_MAX, cost:getWalletUpgradeCost(), fn:'buyWallet()',
      preview:'Cap máx en partida: ' + getWalletMax() + '💰→<span class="up">' + (getWalletMax() + WALLET_UPGRADE_PER_LVL) + '💰</span>' },
          { label:'🛡️ Defensa de base', info:'Nv ' + baseDefLevel + '/' + BASE_DEF_MAX, max:baseDefLevel >= BASE_DEF_MAX, cost:getBaseDefCost(), fn:'buyBaseDef()',
      preview:'HP máx base: ' + getBaseMaxHP() + '→<span class="up">' + (getBaseMaxHP() + BASE_DEF_PER_LVL) + '</span>' },
    { label:'🔬 Investigación', info:'Nv ' + researchLevel + '/' + RESEARCH_MAX, max:researchLevel >= RESEARCH_MAX, cost:getResearchCost(), fn:'buyResearch()',
      preview:'CD spawn: -' + Math.round(researchLevel * RESEARCH_PER_LVL * 100) + '%→<span class="up">-' + Math.round((researchLevel + 1) * RESEARCH_PER_LVL * 100) + '%</span>' },
    { label:'💰 Recompensa mejorada', info:'Nv ' + rewardLevel + '/' + REWARD_MAX, max:rewardLevel >= REWARD_MAX, cost:getRewardCost(), fn:'buyReward()',
      preview:'Drop enemigos: +' + Math.round(researchLevel * 0 + rewardLevel * REWARD_PER_LVL * 100) + '%→<span class="up">+' + Math.round((rewardLevel + 1) * REWARD_PER_LVL * 100) + '%</span>' },
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

// -------------------- HISTORIA --------------------
function showStoryScreen() {
  leaveTestIfNeeded();
  screen = 'story'; playing = false;
  hideScreens();
  buildStoryGrid();
  document.getElementById('storyScreen').style.display = 'flex';
}
function buildStoryGrid() {
  const grid = document.getElementById('storyGrid');
  grid.innerHTML = '';
  const part = hubState.chapter;
  const info = document.getElementById('storyInfo');
  if (info) info.textContent = part ? ('Parte ' + part + ' — ' + STORY_PART_NAMES[part - 1]) : 'Todas las partes';

  STORY_LEVELS.forEach((L, idx) => {
    if (part && L.part !== part) return;

    const unlocked = isDevMode() || idx <= storyProgress;
    const done = idx < storyProgress;
    const unlock = unlockAtLevel(idx + 1);

    const b = document.createElement('button');
    b.className = 'story-btn';
    b.disabled = !unlocked;

    // v79: medalla de tesoro encima del nivel
    const tdef = TREASURE_DEFS.find(t => t.level === idx + 1);
    let medalHtml = '';
    if (tdef) {
      const q = treasuresObtained[tdef.id];
      if (q === undefined || q === null) {
        medalHtml =
          '<div style="text-align:right;font-size:14px;line-height:1;margin:-3px 0 2px;color:#667788" ' +
          'title="Tesoro pendiente: ' + tdef.name + '">○</div>';
      } else {
        const sym = q === 2 ? '🥇' : (q === 1 ? '🥈' : '🥉');
        const col = TREASURE_QUALITY_COLORS[q];
        medalHtml =
          '<div style="text-align:right;font-size:15px;line-height:1;margin:-3px 0 2px;text-shadow:0 0 5px ' + col + '" ' +
          'title="' + tdef.name + ' · ' + TREASURE_QUALITY_NAMES[q] + '">' + sym + '</div>';
      }
    }

    const rewardInfo =
      '<span class="sb-info">' + COIN + ' 1ª:' + coinRewardFor(L.coins, true) + ' / rep:' + coinRewardFor(L.coins, false) +
      (coinBonusLevel > 0 ? ' <span class="up">(+' + Math.round(getCoinBonusPercent() * 100) + '%)</span>' : '') +
      '</span>';

    const devTag = isDevMode() ? '<span class="sb-info" style="color:#ff88ff"> [DEV]</span>' : '';

    b.innerHTML =
      medalHtml +
      (done ? '✅' : unlocked ? '▶' : '🔒') + ' ' + L.name + (L.boss >= 0 ? ' 👑' : '') +
      '<span class="sb-info">Base: ' + L.enemyBaseHP + ' HP · ×' + L.mult.toFixed(2) + '</span>' +
      rewardInfo +
      (unlock ? '<span class="sb-info unlock">Desbloquea: ' + unlock + '</span>' : '') +
      devTag;

    if (unlocked) b.onclick = () => startStory(idx);
    grid.appendChild(b);
  });
}

// -------------------- EVENTOS --------------------
function showEventScreen() {
  leaveTestIfNeeded();
  screen = 'events'; playing = false;
  hideScreens();
  if (hubState.chapter) showEventLevels(hubState.chapter);
  else buildEventGrid();
  document.getElementById('eventScreen').style.display = 'flex';
}
function buildEventGrid() {
  const grid = document.getElementById('eventGrid');
  grid.innerHTML = '';
  document.getElementById('eventBackBtn').style.display = 'none';
  document.getElementById('eventMenuBtn').style.display = 'inline-block';
  document.getElementById('eventInfo').textContent =
    'Eventos temáticos con recompensas de ' + COIN + ' (mitad al repetir) y tropas exclusivas.' +
    (isDevMode() ? ' 🔧 [MODO DEV]' : '');
  Object.values(EVENTS).forEach(ev => {
    const progress = isDevMode() ? ev.levels.length : (eventProgress[ev.id] || 0);
    const b = document.createElement('button');
    b.className = 'event-btn ' + ev.theme;
    b.innerHTML = ev.name + '<span class="sb-info">' + ev.description + '</span><span class="sb-info">Progreso: ' + progress + '/' + ev.levels.length + '</span>';
    b.onclick = () => { hubState.mode = 'event'; hubState.chapter = ev.id; showEventScreen(); };
    grid.appendChild(b);
  });
}
function showEventLevels(eventId) {
  const ev = EVENTS[eventId];
  const grid = document.getElementById('eventGrid');
  grid.innerHTML = '';
  const progress = isDevMode() ? ev.levels.length : (eventProgress[eventId] || 0);
  document.getElementById('eventInfo').textContent = ev.name + ' — ' + ev.description + (isDevMode() ? ' 🔧 [MODO DEV]' : '');
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

// -------------------- LEYENDA --------------------
function legendUnlocked() { return isDevMode() || storyProgress >= STORY_MAX_LEVEL; }
function showLegendScreen() {
  leaveTestIfNeeded();
  screen = 'legend'; playing = false;
  hideScreens();
  buildLegendGrid();
  document.getElementById('legendScreen').style.display = 'flex';
}
function buildLegendGrid() {
  const grid = document.getElementById('legendGrid');
  grid.innerHTML = '';
  const zone = hubState.chapter;
  const info = document.getElementById('legendInfo');
  if (info) {
    info.innerHTML = legendUnlocked()
      ? (zone != null ? ('Zona ' + (zone + 1) + ' — ' + LEGEND_ZONE_SHORT[zone]) : 'Todas las zonas') +
        ' · Progreso: <b>' + legendProgress + '/' + LEGEND_STAGES.length + '</b>' + (isDevMode() ? ' 🔧 [MODO DEV]' : '')
      : '🔒 Se desbloquea al completar la Historia Nivel 45.';
  }
  LEGEND_STAGES.forEach((L, idx) => {
    if (zone != null && L.zone !== zone) return;
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

// -------------------- TROPAS --------------------
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
  line += ' · SPD:' + stats.speed.toFixed(2);
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
  showHub();
}

// -------------------- PANELES EN BATALLA --------------------
function buildMetaInfoPanel() {
  const el = document.getElementById('metaInfo');
  let html = '';
  activeUnitList().forEach(idx => {
    const r = rarityOf(idx);
    const totalLvl = unitLevels[idx] + (gachaLevels[idx] || 0);
    html += UNIT_EMOJI[idx] + ' <span style="color:' + r.color + '">' + CAT_BASE[idx].name + '</span>: <b>Nv.' + totalLvl + '/' + (unitLevelCap() + GACHA_LVL_MAX) + '</b>' + (formIsEvo(idx) ? ' ✨' : '') + (gachaLevels[idx] ? ' <span style="color:#ff88ff">+' + gachaLevels[idx] + '🎰</span>' : '') + '<br>';
  });
  html += '<hr style="border-color:#444">';
  html += '💵 Income: <b>Nv.' + incomeLevel + '/' + MAX_INCOME_LEVEL + '</b>';
  if (typeof battleFlags !== 'undefined' && battleFlags.incomeUpgrades > 0) {
    html += ' <span style="color:#88ff88">(+' + (battleFlags.incomeUpgrades * INCOME_BATTLE_STEP) + '/s)</span>';
  }
  html += '<br>';
  html += '💣 Cañón: <b>D' + cannonDmgLevel + ' R' + cannonRangeLevel + ' C' + cannonCdLevel + '</b>';
  const eff = getEffectiveCannonDmgLevel();
  if (eff > cannonDmgLevel) html += ' <span style="color:#ffd700">(+' + (eff - cannonDmgLevel) + '💎)</span>';
  html += '<br>';
  html += '⭐ Bonus XP: <b>+' + Math.round(getCoinBonusPercent() * 100) + '%</b> (Nv.' + coinBonusLevel + '/' + COIN_BONUS_MAX + ')<br>';
  const baseBonusFlat = getTreasureFlatBaseHP();
  html += '🏰 Base: <b>Nv.' + baseLevel + '/' + BASE_GACHA_MAX + '</b> (+' + baseLevel * BASE_HP_PER_LEVEL;
  if (baseBonusFlat > 0) html += ' +<span style="color:#ffd700">' + baseBonusFlat + '💎</span>';
  html += ' HP máx)<br>';
  html += '💼 Cartera: <b>Nv.' + walletLevel + '/' + WALLET_UPGRADE_MAX + '</b> (cap actual ' + (isTest() ? '∞' : Math.floor(currentWalletCap())) + '/' + getWalletMax() + '💰)<br>';
  html += '<hr style="border-color:#444"><b style="color:#ffd700">💎 TESOROS ACTIVOS:</b><br>';
  const treasureCount = Object.keys(treasuresObtained).length;
  html += '<span style="color:#aabbcc">· ' + treasureCount + '/45 tesoros obtenidos</span><br>';
  let activeBuffs = 0;
  for (const set of TREASURE_SETS) {
    const q = getSetQuality(set.id);
    if (q < 0) continue;
    activeBuffs++;
    html += '<span style="color:' + TREASURE_QUALITY_COLORS[q] + '">· ' + set.name + ' (' + TREASURE_QUALITY_NAMES[q] + ')</span><br>';
    html += '<span style="color:#aabbcc;font-size:10px">  → ' + set.desc + '</span><br>';
  }
  for (const tid in TREASURE_BOSS_EFFECTS) {
    if (!treasuresObtained[tid]) continue;
    const q = treasuresObtained[tid];
    activeBuffs++;
    html += '<span style="color:' + TREASURE_QUALITY_COLORS[q] + '">· ' + TREASURE_BOSS_EFFECTS[tid].desc + '</span><br>';
  }
  if (activeBuffs === 0) html += '<span style="color:#8899aa">· Ningún bonus activo (consigue tesoros en Historia)</span><br>';
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
    ? '💡 Sandbox: todas las unidades disponibles · dinero ∞ · sin cooldowns · base invulnerable'
    : '💡 Click en una tropa propia para retirarla · Las mejoras se compran con XP';
}

// -------------------- HUD --------------------
function updateUI() {
  document.getElementById('money').textContent = isTest() ? '∞' : Math.floor(money);
  const wcEl = document.getElementById('walletCap');
  if (wcEl) wcEl.textContent = isTest() ? '∞' : Math.floor(currentWalletCap());
  document.getElementById('baseHP').textContent = isTest() ? '∞' : Math.floor(baseHP);
  document.getElementById('enemyHP').textContent = Math.floor(enemyBaseHP);
  document.getElementById('waveLabel').textContent = gameMode === 'story' ? '📖 Nivel:' : (isTest() ? '🧪 Oleada:' : (isEvent() ? '🎃 Nivel:' : (gameMode === 'legend' ? '🌟 Etapa:' : '🌊 Oleada:')));
  document.getElementById('wave').textContent = gameMode === 'story' ? (storyLevelIdx + 1) : (isEvent() ? (eventLevelIdx + 1) : (gameMode === 'legend' ? (legendLevelIdx + 1) : wave));
  document.getElementById('catCount').textContent = cats.length;
  document.getElementById('enemyCount').textContent = enemies.length;
  document.getElementById('income').textContent = isTest() ? '∞' : getEffectiveIncome().toFixed(1);
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
        cdEl.textContent = isTest() ? 'CD: 0s (pruebas)' : ('CD: ' + (CAT_BASE[i].spawnCd * getResearchMult()).toFixed(1) + 's');
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

// -------------------- RESULTADOS --------------------
function showResult(victory, text) {
  document.getElementById('resultTitle').textContent = victory ? '🎉 ¡VICTORIA!' : '💀 DERROTA';
  document.getElementById('resultText').innerHTML = text;
  document.getElementById('retryBtn').style.display = 'inline-block';
  document.getElementById('nextBtn').style.display = victory ? 'inline-block' : 'none';
  document.getElementById('resultOverlay').style.display = 'flex';
}

// ------------------------------------------------------------
// v70: reenvíos seguros para los botones del hub
// ------------------------------------------------------------
function openBanners(focus) { if (window.showBanners) window.showBanners(focus); else setStatus('❌ Módulo de banners no cargado', '#ff6666'); }
function openStorage() { if (window.showStorage) window.showStorage(); else setStatus('❌ Módulo de almacén no cargado', '#ff6666'); }
function openMissions() { if (window.showMissions) window.showMissions(); else setStatus('❌ Módulo de misiones no cargado', '#ff6666'); }
function openBook() { if (window.showBestiary) window.showBestiary(); else setStatus('❌ Módulo de biblioteca no cargado', '#ff6666'); }
function openGamatoto() { if (window.showGamatoto) window.showGamatoto(); else setStatus('❌ Módulo de Gamatoto no cargado', '#ff6666'); }

// Aliases para 05-combat.js
function showEvents() { showEventScreen(); }
function showLegend() { showLegendScreen(); }
window.showEvents = showEvents;
window.showLegend = showLegend;

// ============================================================
// v72: AVISOS VISIBLES + CANDADOS EN EL HUB + BACK DE LOGROS
// ============================================================
(function () {
  let tEl = null, tT = null;
  window.toastMsg = function (text, color) {
    if (!tEl) {
      tEl = document.createElement('div');
      tEl.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%);background:#222233;color:#fff;border:3px solid #ffd700;border-radius:12px;padding:10px 22px;z-index:400;font-size:14px;font-weight:bold;box-shadow:0 4px 14px rgba(0,0,0,.5);max-width:80vw;text-align:center;';
      document.body.appendChild(tEl);
    }
    tEl.innerHTML = text;
    tEl.style.borderColor = color || '#ffd700';
    tEl.style.display = 'block';
    clearTimeout(tT);
    tT = setTimeout(() => { tEl.style.display = 'none'; }, 3200);
  };
  const origSet = window.setStatus;
  window.setStatus = function (text, color) {
    try { window.toastMsg(text, color); } catch (e) {}
    if (origSet) return origSet.apply(this, arguments);
  };
})();
(function () {
  const orig = window.showAch;
  if (typeof orig !== 'function') return;
  window.showAch = function () {
    const before = new Set();
    document.querySelectorAll('.screen').forEach(el => { if (el.style.display !== 'none') before.add(el); });
    const r = orig.apply(this, arguments);
    try {
      document.querySelectorAll('.screen').forEach(scr => {
        if (scr.style.display !== 'none' && !before.has(scr)) {
          const bk = scr.querySelector('.back');
          if (bk) bk.onclick = function () { if (window.showBookMenu) window.showBookMenu(); else showMenu(); };
        }
      });
    } catch (e) {}
    return r;
  };
})();
(function () {
  const orig = window.renderHub;
  if (typeof orig !== 'function') return;
  window.renderHub = function () {
    const r = orig.apply(this, arguments);
    try {
      const locked = !(isDevMode() || storyProgress >= 10);
      const q = s => document.querySelector('#hubScreen ' + s);
      [['.gacha-btn.white','Almacén'], ['.gacha-btn.green','Gatobolas'], ['.gacha-btn.yellow','Bolas raras'], ['.gacha-btn.purple','Bolas de evento']].forEach(p => {
        const el = q(p[0]);
        if (el) el.textContent = (locked ? '🔒 ' : '') + p[1];
      });
      const mi = q('.hub-icons .icon-btn[title="Misiones"]');
      if (mi) mi.textContent = locked ? '🔒' : '📜';
    } catch (e) {}
    return r;
  };
})();

// ============================================================
// v73: hideScreens universal
// ============================================================
(function () {
  const orig = window.hideScreens;
  if (typeof orig !== 'function') return;
  window.hideScreens = function () {
    const r = orig.apply(this, arguments);
    document.querySelectorAll('.screen').forEach(el => { el.style.display = 'none'; });
    return r;
  };
})();

// ============================================================
// v75: música de menú al salir de batalla
// (NO envuelve retryLevel/nextLevel para no pisar la música de batalla)
// ============================================================
(function () {
  function menuMusic() {
    try {
      if (window.AudioSys && typeof AudioSys.setMusic === 'function') { AudioSys.setMusic('menu'); return; }
    } catch (e) {}
  }
  ['goMenu', 'showHub', 'showTitle', 'showCarousel', 'showChapters', 'showUpgrades', 'showTroops', 'showStoryScreen', 'showEventScreen', 'showLegendScreen', 'showEvents', 'showLegend'].forEach(f => {
    const orig = window[f];
    if (typeof orig !== 'function') return;
    window[f] = function () {
      const r = orig.apply(this, arguments);
      menuMusic();
      return r;
    };
  });
})();