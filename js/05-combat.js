// ============================================================
// 05-combat.js — Lógica de batalla: spawns, update, modos, cañón
// v58: · Todo nivel (historia/eventos/futuros) empieza con
//        LEVEL_START_MONEY (450) en vez de L.startMoney.
//      · El daño masivo (proyectil aoe y melee aoe) salpica a la
//        base enemiga si la explosión la alcanza, aunque el golpe
//        no sea directo contra ella.
//      · Sanador: SIEMPRE detrás de la tropa no-sanadora más
//        avanzada; si no hay ninguna, retrocede a la base aliada.
// v57: · storyVictory/eventVictory usan coinRewardFor() (bonus 🐾)
//        y respetan el modo desarrollador (nada se guarda).
// v47: · FLECHAS PERFORANTES del Arquero evolucionado.
// ============================================================
// Puente seguro con el módulo de audio (si no existe, no petardea)
function sfxNow(name) { if (window.sfx) window.sfx(name); }
// v47: cuántos enemigos puede atravesar una flecha del Arquero evolucionado
const ARCHER_PIERCE_COUNT = 5;
// v37: helpers de rango de proyectil
function hasProj(u) {
  const t = u.type || u.unitType;
  return t === 'ranged' || t === 'roboRanged' || t === 'aoe';
}
function projRangeOf(u) {
  // v48: override por unidad (el Arquero tiene projRange:400 en la config)
  if (u.projRange) return u.projRange;
  const t = u.type || u.unitType;
  const r = u.range || 0;
  return (t === 'ranged' || t === 'roboRanged') ? r + 60 : r;
}
function addFloatingText(x, y, text, color) {
  if (floatingTexts.length >= MAX_FLOATING_TEXTS) floatingTexts.shift();
  floatingTexts.push({ x, y, text, color, life: 60, maxLife: 60 });
}
function addParticle(x, y, color, count, size) {
  count = count || 3; size = size || 2;
  for (let i = 0; i < count; i++) {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    particles.push({ x, y, vx:(Math.random()-0.5)*4, vy:(Math.random()-0.5)*4 - 1, life:20, maxLife:20, color, size:Math.random()*size+1 });
  }
}
function addRing(x, y, color, radius) {
  if (particles.length >= MAX_PARTICLES) particles.shift();
  particles.push({ x, y, vx:0, vy:0, life:15, maxLife:15, color, ring:true, radius:0, maxRadius:radius });
}
function findTarget(unit, targets) {
  let target = null;
  let minDist = Infinity;
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const d = Math.abs(t.x - unit.x);
    if (d < minDist) { minDist = d; target = t; }
  }
  return { target, minDist };
}
function findFrontEnemy(unit, range) {
  let best = null;
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (Math.abs(e.x - unit.x) <= range && (!best || e.x < best.x)) best = e;
  }
  return best;
}
function findFrontCat(unit, range) {
  let best = null;
  for (let i = 0; i < cats.length; i++) {
    const c = cats[i];
    if (Math.abs(c.x - unit.x) <= range && (!best || c.x > best.x)) best = c;
  }
  return best;
}

// --- Invocar unidades propias ---
function spawnCat(type) {
  if (!isUnitUnlocked(type)) return;
  if (!isTest() && spawnTimers[type] > 0) return;
  if (cats.length >= MAX_CATS) { addFloatingText(450, 100, '¡Máximo 30 gatos!', '#ff4444'); return; }
  const stats = getCatStats(type);
  if (!isTest() && money < stats.cost) return;
  money -= stats.cost;
  if (!isTest()) spawnTimers[type] = Math.round(CAT_BASE[type].spawnCd * 60);
  const waveBonus = getWaveBonus();
  cats.push({
    x: 80, y: GROUND_Y, type,
    hp: Math.min(Math.floor(stats.hp * waveBonus), MAX_STATS),
    maxHp: Math.min(Math.floor(stats.hp * waveBonus), MAX_STATS),
    dmg: Math.min(Math.floor(stats.dmg * waveBonus), MAX_STATS),
    speed: stats.speed, range: stats.range,
    cooldown: stats.cooldown, cdTimer: 0, color: stats.color, color2: stats.color2,
    facing: 1, attackAnim: 0, scale: stats.scale || 1,
    unitType: stats.type, projSpeed: stats.projSpeed, aoeRadius: stats.aoeRadius,
    healAmt: Math.min(Math.floor(stats.healAmt * waveBonus), MAX_STATS),
    visual: stats.visual || null,
    poison: 0, poisonTimer: 0, walkCycle: Math.random() * Math.PI * 2,
    level: unitLevels[type],
    evo: formIsEvo(type)   // v48: forma elegida en Selección de Tropas
  });
  if (CAT_BASE[type].visual === 'king')      { addFloatingText(120, 120, '👑 ¡El Rey Gatontito ha llegado! 👑', '#ffd700'); addParticle(80, GROUND_Y, 'rgb(255,215,0)', 20, 5); }
  if (CAT_BASE[type].visual === 'demon')      { addFloatingText(120, 120, '😈 ¡El Gato Demoníaco acecha! 😈', '#ff2222'); addParticle(80, GROUND_Y, 'rgb(255,0,0)', 20, 5); }
  if (CAT_BASE[type].visual === 'headless')   { addFloatingText(120, 120, '🎃 ¡El Gato Sin Cabeza cabalga en la noche! 🎃', '#88ffaa'); addParticle(80, GROUND_Y, 'rgb(136,255,170)', 20, 5); }
  if (CAT_BASE[type].visual === 'gatoclaus')  { addFloatingText(120, 120, '🎅 ¡Gatoclaus trae nieve y castigo! 🎄', '#ffffff'); addParticle(80, GROUND_Y, 'rgb(255,255,255)', 20, 5); }
}

// --- Invocar enemigos ---
function pushEnemy(t, typeKey, isBoss) {
  const flyY = t.flyY || GROUND_Y;
  const m = getEnemyMult();
  enemies.push({
    x: 880, y: flyY, type: typeKey,
    hp: Math.min(Math.floor(t.hp * m), MAX_STATS),
    maxHp: Math.min(Math.floor(t.hp * m), MAX_STATS),
    dmg: Math.min(Math.floor(t.dmg * m), MAX_STATS),
    speed: t.speed, range: t.range,
    cooldown: t.cooldown, cdTimer: 0, color: t.color, color2: t.color2,
    facing: -1, attackAnim: 0, scale: t.scale || 1,
    unitType: t.type, reward: Math.min(Math.floor(t.reward * m), MAX_STATS), projSpeed: t.projSpeed || 0,
    poisonDmg: t.poisonDmg || 0, poisonDur: t.poisonDur || 0,
    poison: 0, poisonTimer: 0, flyY: flyY, walkCycle: Math.random() * Math.PI * 2,
    isBoss: isBoss, name: t.name, bossStyle: t.bossStyle || null, desertStyle: t.desertStyle || null, xmasStyle: t.xmasStyle || null
  });
}
function spawnEnemy(typeIdx, bossIdx) {
  if (enemies.length >= MAX_ENEMIES) return;
  const isBoss = (bossIdx !== undefined && bossIdx >= 0);
  const t = isBoss ? BOSS_TYPES[bossIdx] : ENEMY_TYPES[typeIdx];
  if (!t) return;
  pushEnemy(t, typeIdx, isBoss);
}
function spawnEventEnemy(key, isBoss) {
  if (enemies.length >= MAX_ENEMIES) return;
  const t = isBoss ? EVENT_BOSS_TYPES[key] : EVENT_ENEMY_TYPES[key];
  if (!t) return;
  pushEnemy(t, key, !!isBoss);
}
function spawnWaveEnemy() {
  if (gameMode === 'event') {
    const L = EVENTS[currentEventId].levels[eventLevelIdx];
    spawnEventEnemy(L.pool[Math.floor(Math.random() * L.pool.length)], false);
    return;
  }
  const roll = Math.random();
  let type;
  if (wave < 3) type = roll < 0.7 ? 0 : 1;
  else if (wave < 6) {
    if (roll < 0.28) type = 0; else if (roll < 0.52) type = 1; else if (roll < 0.68) type = 2;
    else if (roll < 0.84) type = 3; else type = 7;
  }
  else if (wave < 12) {
    if (roll < 0.22) type = 0; else if (roll < 0.40) type = 1; else if (roll < 0.52) type = 2;
    else if (roll < 0.64) type = 3; else if (roll < 0.74) type = 4; else if (roll < 0.86) type = 7;
    else type = 8;
  }
  else if (wave < 25) {
    if (roll < 0.18) type = 0; else if (roll < 0.32) type = 1; else if (roll < 0.42) type = 2;
    else if (roll < 0.52) type = 3; else if (roll < 0.62) type = 4; else if (roll < 0.70) type = 5;
    else if (roll < 0.80) type = 7; else if (roll < 0.90) type = 8; else type = 10;
  }
  else {
    if (roll < 0.13) type = 0; else if (roll < 0.24) type = 1; else if (roll < 0.33) type = 2;
    else if (roll < 0.42) type = 3; else if (roll < 0.51) type = 4; else if (roll < 0.59) type = 5;
    else if (roll < 0.67) type = 6; else if (roll < 0.75) type = 7; else if (roll < 0.83) type = 8;
    else if (roll < 0.91) type = 9; else type = 10;
  }
  spawnEnemy(type, -1);
}

// --- Cañón ---
function fireCannon() {
  if (cannonCooldown > 0) return;
  cannonCooldown = getCannonCooldownFrames();
  const dmgPercent = getCannonDamagePercent();
  const range = getCannonRange();
  addRing(MY_BASE_X, 170, 'rgb(255,200,0)', range);
  addParticle(MY_BASE_X, 170, 'rgb(255,200,0)', 20, 6);
  addFloatingText(MY_BASE_X + 60, 100, '💣 ¡CAÑONAZO! 💣', '#ff4444');
  let totalDamage = 0, hitCount = 0, bossLimited = false;
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    const dist = e.x - MY_BASE_X;
    if (dist >= 0 && dist <= range) {
      let dmg = Math.floor(e.maxHp * dmgPercent);
      if (e.isBoss) {
        const minHp = Math.floor(e.maxHp * CANNON_BOSS_LIMIT);
        if (e.hp <= minHp) { bossLimited = true; continue; }
        dmg = Math.min(dmg, e.hp - minHp);
        bossLimited = true;
      }
      e.hp -= dmg; totalDamage += dmg; hitCount++;
      addParticle(e.x, e.y, 'rgb(255,200,0)', 5, 3);
    }
  }
  if (bossLimited) addFloatingText(450, 150, '🛡️ Jefe: el cañón máx. baja al 50%', '#ffaa00');
  addFloatingText(MY_BASE_X + range/2, 130, `${hitCount} enemigos | ${totalDamage} dmg`, '#ffaa00');
  updateUI();
}

// --- Oleadas y jefes ---
function advanceWave() {
  wave++;
  waveTimer = 0;
  enemyBaseMaxHP += 800;
  enemyBaseHP += 800;
  if (!isTest()) money += 400 + wave * 60;
  bossSpawnedThisWave = false;
  addFloatingText(450, 100, `¡Oleada ${wave}!`, '#ffd700');
  const bossInterval = wave >= 100 ? 25 : 10;
  if (wave % bossInterval === 0) {
    pendingBoss = getBossForWave();
    bossWarningTimer = 90;
  }
}

// --- Retirar tropas ---
function removeCat(index) {
  const c = cats[index];
  addParticle(c.x, c.y, 'rgb(150,200,255)', 8, 3);
  addFloatingText(c.x, c.y - 30, '🔙 Retirada', '#88ccff');
  cats.splice(index, 1);
}
function retreatAll() {
  if (cats.length === 0) { setStatus('❌ No hay tropas en el campo', '#ff6666'); return; }
  if (!confirm(`¿Retirar las ${cats.length} tropas del campo de batalla?`)) return;
  for (let i = 0; i < cats.length; i++) addParticle(cats[i].x, cats[i].y, 'rgb(150,200,255)', 5, 3);
  addFloatingText(450, 120, `🔙 ${cats.length} tropas retiradas`, '#88ccff');
  cats = [];
}

// --- Arranque de modos ---
function clearBattle() {
  cats = []; enemies = []; projectiles = []; particles = []; floatingTexts = [];
  spawnTimers = new Array(NUM_UNITS).fill(0);
  gameOver = false; frameCount = 0; waveTimer = 0;
  cannonCooldown = 0; bossWarningTimer = 0; bossSpawnedThisWave = false; pendingBoss = 0;
  pendingEventBoss = ''; storyBossSpawned = false; storyBossTimer = 0;
  autoSaveTimer = 0;
}
function startInfinite(fresh) {
  leaveTestIfNeeded();
  gameMode = 'infinite';
  if (fresh) {
    money = 400; baseHP = 1500; enemyBaseHP = 2000; enemyBaseMaxHP = 2000; wave = 1;
    clearBattle();
    enemySpawnTimer = 120;
  }
  buildUnitButtons();
  showGame();
  setTestControlsVisible(false);
  playing = true;
  updateUI();
}
function continueInfinite() {
  leaveTestIfNeeded();
  gameMode = 'infinite';
  if (loadGame()) {
    buildUnitButtons();
    showGame();
    setTestControlsVisible(false);
    playing = true;
  } else {
    startInfinite(true);
  }
}
function startStory(idx) {
  leaveTestIfNeeded();
  gameMode = 'story';
  storyLevelIdx = idx;
  const L = STORY_LEVELS[idx];
  money = LEVEL_START_MONEY;   // v58: todo nivel empieza con 450
  baseHP = 1500;
  enemyBaseHP = L.enemyBaseHP;
  enemyBaseMaxHP = L.enemyBaseHP;
  wave = 1;
  clearBattle();
  enemySpawnTimer = 90;
  storyBossTimer = 300;
  buildUnitButtons();
  showGame();
  setTestControlsVisible(false);
  playing = true;
  updateUI();
}
function startEvent(eventId, levelIdx) {
  leaveTestIfNeeded();
  gameMode = 'event';
  currentEventId = eventId;
  eventLevelIdx = levelIdx;
  const L = EVENTS[eventId].levels[levelIdx];
  money = LEVEL_START_MONEY;   // v58: todo nivel empieza con 450
  baseHP = 1500;
  enemyBaseHP = L.enemyBaseHP;
  enemyBaseMaxHP = L.enemyBaseHP;
  wave = 1;
  clearBattle();
  enemySpawnTimer = 90;
  storyBossTimer = 300;
  buildUnitButtons();
  showGame();
  setTestControlsVisible(false);
  playing = true;
  setStatus('🎃 Evento: ' + L.name, '#ff6600');
  updateUI();
}
function startTest() {
  if (gameMode !== 'test') metaSnapshot = snapshotMeta();
  gameMode = 'test';
  money = 0;
  baseHP = 1500;
  enemyBaseHP = 2000; enemyBaseMaxHP = 2000;
  wave = 1;
  clearBattle();
  enemySpawnTimer = 60;
  buildUnitButtons();
  showGame();
  setTestControlsVisible(true);
  playing = true;
  setStatus('🧪 Modo pruebas: dinero ∞, oleadas infinitas, base invulnerable, TODAS las unidades', '#cc66ff');
  updateUI();
}
function reset() {
  if (gameMode === 'story') { startStory(storyLevelIdx); return; }
  if (gameMode === 'event') { startEvent(currentEventId, eventLevelIdx); return; }
  if (gameMode === 'test') { startTest(); return; }
  startInfinite(true);
}

// --- Controles sandbox ---
function testAddWave(n) { for (let i = 0; i < n; i++) advanceWave(); updateUI(); }
function testSpawnBoss() {
  pendingBoss = getBossForWave();
  bossSpawnedThisWave = false;
  bossWarningTimer = 90;
}
function testClearEnemies() {
  for (let i = 0; i < enemies.length; i++) addParticle(enemies[i].x, enemies[i].y, 'rgb(150,150,150)', 4, 3);
  enemies = [];
  addFloatingText(450, 120, '🧹 Enemigos eliminados', '#88ccff');
}
function testMaxUpgrades() {
  for (let i = 0; i < NUM_UNITS; i++) unitLevels[i] = Math.min(MAX_UNIT_LEVEL, unitLevelCap());
  incomeLevel = MAX_INCOME_LEVEL;
  cannonDmgLevel = CANNON_DMG_MAX;
  cannonRangeLevel = CANNON_RANGE_MAX;
  cannonCdLevel = CANNON_CD_MAX;
  coinBonusLevel = COIN_BONUS_MAX;   // v57
  addFloatingText(450, 140, '⬆️ ¡Todo al máximo! (solo en pruebas)', '#ffd700');
  buildMetaInfoPanel();
  updateUI();
}

// --- Resultados ---
function retryLevel() {
  if (gameMode === 'story') startStory(storyLevelIdx);
  else if (gameMode === 'event') startEvent(currentEventId, eventLevelIdx);
  else startInfinite(true);
}
function nextLevel() {
  if (gameMode === 'story') {
    if (storyLevelIdx + 1 < STORY_LEVELS.length && storyLevelIdx + 1 <= storyProgress) startStory(storyLevelIdx + 1);
    else showMenu();
  } else if (gameMode === 'event') {
    const ev = EVENTS[currentEventId];
    const prog = eventProgress[currentEventId] || 0;
    if (eventLevelIdx + 1 < ev.levels.length && eventLevelIdx + 1 <= prog) startEvent(currentEventId, eventLevelIdx + 1);
    else showEvents();
  }
}

// v57: victoria de historia con bonus de 🐾 y respeto al modo dev
function storyVictory() {
  playing = false;
  const L = STORY_LEVELS[storyLevelIdx];
  if (!isDevMode()) {
    const before = storyProgress;
    const firstClear = storyLevelIdx === storyProgress;
    const earned = coinRewardFor(L.coins, firstClear);
    coins += earned;
    let unlockText = '';
    if (firstClear) {
      storyProgress++;
      saveStoryProgress();
      const newUnlocks = [];
      for (let i = 0; i < NUM_UNITS; i++) {
        const u = UNIT_UNLOCK[i];
        if (u && u.type === 'story' && u.lvl > before && u.lvl <= storyProgress) {
          newUnlocks.push(`${UNIT_EMOJI[i] || '🐱'} ${CAT_BASE[i].name}`);
        }
      }
      if (newUnlocks.length) unlockText = ` 🎉 ¡Nueva tropa: ${newUnlocks.join(', ')}! (añádela en 🎖)`;
    }
    saveMeta();
    const last = storyLevelIdx === STORY_LEVELS.length - 1;
    const bonusTxt = coinBonusLevel > 0 ? ` (🐾 +${Math.round(getCoinBonusPercent() * 100)}%)` : '';
    showResult(true,
      `Completaste ${L.name}. ¡+${earned} ${COIN}!${bonusTxt}${firstClear ? '' : ' (repetición)'}` +
      `${unlockText}${last ? ' 🏆 ¡HISTORIA COMPLETADA!' : ' 📖 Siguiente nivel desbloqueado.'}`);
  } else {
    showResult(true, `Completaste ${L.name}. [DEV: nada guardado]`);
  }
}

function storyDefeat() {
  playing = false;
  showResult(false, `Tu base cayó en ${STORY_LEVELS[storyLevelIdx].name}. ¡Ajusta tu escuadrón y reintenta!`);
}

// v57: victoria de evento con bonus de 🐾 y respeto al modo dev
function eventVictory() {
  playing = false;
  const ev = EVENTS[currentEventId];
  const L = ev.levels[eventLevelIdx];
  if (!isDevMode()) {
    const prog = eventProgress[currentEventId] || 0;
    const firstClear = eventLevelIdx === prog;
    const earned = coinRewardFor(L.coins, firstClear);
    coins += earned;
    let unlockText = '';
    if (firstClear) {
      eventProgress[currentEventId] = prog + 1;
      saveEventProgress();
      if (L.unlocks && L.unlocks.length) {
        unlockText = ` 🎉 ¡Nueva tropa: ${L.unlocks.map(i => `${UNIT_EMOJI[i] || '🐱'} ${CAT_BASE[i].name}`).join(', ')}! (añádela en 🎖)`;
      }
    }
    saveMeta();
    const last = eventLevelIdx === ev.levels.length - 1;
    const bonusTxt = coinBonusLevel > 0 ? ` (🐾 +${Math.round(getCoinBonusPercent() * 100)}%)` : '';
    showResult(true,
      `¡${L.name} completado! ¡+${earned} ${COIN}!${bonusTxt}${firstClear ? '' : ' (repetición)'}` +
      `${unlockText}${last ? ` ${ev.name} ¡COMPLETADO!` : ' 📖 Siguiente nivel desbloqueado.'}`);
  } else {
    showResult(true, `¡${L.name} completado! [DEV: nada guardado]`);
  }
}

function eventDefeat() {
  playing = false;
  const L = EVENTS[currentEventId].levels[eventLevelIdx];
  showResult(false, `Tu base cayó en ${L.name}. ¡Ajusta tu escuadrón y reintenta!`);
}

// ============================================================
// BUCLE DE LÓGICA (1 tick = 1/60s)
// ============================================================
function update() {
  if (gameOver || !playing) return;
  frameCount++;
  if (!isTest()) money += getIncome() / 60;
  for (let i = 0; i < NUM_UNITS; i++) if (spawnTimers[i] > 0) spawnTimers[i]--;
  if (gameMode === 'infinite') {
    autoSaveTimer++;
    if (autoSaveTimer >= 1800) { autoSaveTimer = 0; saveGame(true); }
    waveTimer++;
    if (waveTimer > 1800) advanceWave();
  } else if (gameMode === 'test') {
    waveTimer++;
    if (waveTimer > 900) advanceWave();
  } else if (gameMode === 'story') {
    const L = STORY_LEVELS[storyLevelIdx];
    if (L.boss >= 0 && !storyBossSpawned) {
      storyBossTimer--;
      if (storyBossTimer <= 0) { storyBossSpawned = true; pendingBoss = L.boss; bossWarningTimer = 90; }
    }
  } else if (gameMode === 'event') {
    const L = EVENTS[currentEventId].levels[eventLevelIdx];
    if (L.boss && !storyBossSpawned) {
      storyBossTimer--;
      if (storyBossTimer <= 0) { storyBossSpawned = true; pendingEventBoss = L.boss; bossWarningTimer = 90; }
    }
  }
  if (cannonCooldown > 0) cannonCooldown--;
  if (bossWarningTimer > 0) {
    bossWarningTimer--;
    if (bossWarningTimer === 30 && !bossSpawnedThisWave) {
      if (enemies.length < MAX_ENEMIES) {
        if (gameMode === 'event') spawnEventEnemy(pendingEventBoss, true);
        else spawnEnemy(0, pendingBoss);
        bossSpawnedThisWave = true;
        addFloatingText(450, 150, '¡' + currentBossName() + ' ha aparecido!', '#ff0000');
      }
    }
  }
  enemySpawnTimer--;
  if (enemySpawnTimer <= 0) {
    spawnWaveEnemy();
    if (gameMode === 'story') enemySpawnTimer = STORY_LEVELS[storyLevelIdx].spawnInterval + Math.random()*40;
    else if (gameMode === 'event') enemySpawnTimer = EVENTS[currentEventId].levels[eventLevelIdx].spawnInterval + Math.random()*40;
    else enemySpawnTimer = Math.max(35, 150 - wave*5) + Math.random()*80;
  }
  // ---------------- UNIDADES PROPIAS ----------------
  for (let i = 0; i < cats.length; i++) {
    const c = cats[i];
    c.cdTimer--;
    if (c.poisonTimer > 0) { c.poisonTimer--; if (frameCount % 30 === 0) c.hp -= c.poison; }
    if (c.unitType === 'healer') {
      // --- Curación (sin cambios) ---
      let hurtAlly = null; let minHP = Infinity;
      for (let j = 0; j < cats.length; j++) {
        const ally = cats[j];
        if (ally !== c && ally.hp < ally.maxHp) {
          const d = Math.abs(ally.x - c.x);
          if (d <= c.range && ally.hp < minHP) { minHP = ally.hp; hurtAlly = ally; }
        }
      }
      if (hurtAlly && c.cdTimer <= 0) {
        projectiles.push({ x:c.x, y:c.y, target:hurtAlly, dmg:c.healAmt, type:'heal', isHeal:true, owner:'cat', speed:5 });
        c.cdTimer = c.cooldown; c.attackAnim = 8;
      }
      // --- v58: POSICIONAMIENTO DEL SANADOR ---
      // Siempre detrás de la tropa no-sanadora más avanzada.
      // Si no hay ninguna tropa así, retrocede hasta la base aliada.
      let frontX = 0;
      let hasTroop = false;
      for (let j = 0; j < cats.length; j++) {
        const ally = cats[j];
        if (ally === c || ally.unitType === 'healer') continue;
        hasTroop = true;
        if (ally.x > frontX) frontX = ally.x;
      }
      let desired;
      if (hasTroop) {
        desired = Math.min(frontX - HEALER_BACK_DIST, ENEMY_BASE_X - HEALER_SAFE_DIST);
      } else {
        desired = HEALER_HOME_X;
      }
      if (desired < HEALER_HOME_X) desired = HEALER_HOME_X;
      const gap = desired - c.x;
      const mult = (hasTroop && Math.abs(gap) > HEALER_CATCHUP_GAP) ? HEALER_CATCHUP_MULT : 1;
      if (gap > 0) c.x += c.speed * mult;
      else if (gap < 0) c.x -= c.speed;   // v58: retrocede SIEMPRE que esté adelantado
      continue;
    }
    const front = findFrontEnemy(c, c.range);
    const baseInRange = (ENEMY_BASE_X - c.x) <= c.range;
    if (front || baseInRange) {
      if (c.cdTimer <= 0) {
        if (isRanged(c)) {
          projectiles.push({
            x: c.x + 12, y: c.y - 4,
            vx: (c.projSpeed || 6),
            dmg: c.dmg,
            type: c.unitType === 'roboRanged' ? 'bullet' : 'arrow',
            owner: 'cat',
            speed: c.projSpeed || 6,
            aoeRadius: 0,
            projRange: projRangeOf(c),
            traveled: 0,
            canHitBase: true,
            // v47: Arquero evolucionado (Nv.10+) = flechas perforantes
            pierce: (c.type === 3 && isEvolved(c)) ? ARCHER_PIERCE_COUNT : 0,
            hitSet: null
          });
        } else if (c.unitType === 'aoe') {
          projectiles.push({
            x: c.x + 12, y: c.y - 4,
            vx: (c.projSpeed || 5),
            dmg: c.dmg,
            type: c.visual === 'gatoclaus' ? 'snow' : 'magic',
            owner: 'cat',
            speed: c.projSpeed || 5,
            aoeRadius: c.aoeRadius || 0,
            projRange: projRangeOf(c),
            traveled: 0,
            canHitBase: !front && baseInRange
          });
        } else if (front) {
          front.hp -= c.dmg;
          addParticle(front.x, front.y, 'rgb(255,100,100)', 2, 2);
          sfxNow('melee');
          if (c.aoeRadius) {
            addRing(front.x, front.y, 'rgb(255,215,0)', c.aoeRadius);
            for (let j = 0; j < enemies.length; j++) {
              const t = enemies[j];
              if (t !== front && Math.abs(t.x - front.x) <= c.aoeRadius) { t.hp -= c.dmg; addParticle(t.x, t.y, 'rgb(255,215,0)', 2, 2); }
            }
            // v58: el golpe masivo salpica a la base si la explosión la alcanza
            if (Math.abs(ENEMY_BASE_X - front.x) <= c.aoeRadius) {
              enemyBaseHP -= c.dmg;
              addParticle(ENEMY_BASE_X, 170, 'rgb(255,215,0)', 4, 3);
            }
          }
        } else {
          enemyBaseHP -= c.dmg;
          addParticle(ENEMY_BASE_X, 170, 'rgb(255,100,100)', 2, 2);
          sfxNow('melee');
          if (c.aoeRadius) {
            addRing(ENEMY_BASE_X, 170, 'rgb(255,215,0)', c.aoeRadius);
            for (let j = 0; j < enemies.length; j++) {
              const t = enemies[j];
              if (Math.abs(t.x - ENEMY_BASE_X) <= c.aoeRadius) { t.hp -= c.dmg; addParticle(t.x, t.y, 'rgb(255,215,0)', 2, 2); }
            }
          }
        }
        c.cdTimer = c.cooldown;
        c.attackAnim = 8;
      }
    } else {
      c.x += c.speed;
    }
  }
  // ---------------- ENEMIGOS ----------------
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    e.cdTimer--;
    if (e.poisonTimer > 0) { e.poisonTimer--; if (frameCount % 30 === 0) e.hp -= e.poison; }
    const frontCat = findFrontCat(e, e.range);
    if (frontCat) {
      if (e.cdTimer <= 0) {
        if (e.unitType === 'ranged') {
          projectiles.push({
            x: e.x - 12, y: e.y - 4,
            vx: -(e.projSpeed || 4),
            dmg: e.dmg, type: 'magic', owner: 'enemy',
            speed: e.projSpeed || 4, aoeRadius: 0,
            projRange: projRangeOf(e), traveled: 0, canHitBase: false
          });
        } else if (e.unitType === 'poison') {
          frontCat.hp -= e.dmg; frontCat.poison = e.poisonDmg; frontCat.poisonTimer = e.poisonDur;
          addParticle(frontCat.x, frontCat.y, 'rgb(0,255,0)', 2, 2);
          sfxNow('cat_hurt');
        } else {
          frontCat.hp -= e.dmg;
          addParticle(frontCat.x, frontCat.y, 'rgb(255,200,100)', 2, 2);
          sfxNow('cat_hurt');
        }
        e.cdTimer = e.cooldown; e.attackAnim = 8;
      }
    } else if (e.x > 100) {
      e.x -= e.speed;
    } else {
      if (e.cdTimer <= 0) {
        if (!isTest()) baseHP -= e.dmg;
        e.cdTimer = e.cooldown; e.attackAnim = 8;
      }
    }
  }
  // ---------------- PROYECTILES ----------------
  for (let i = 0; i < projectiles.length; i++) {
    const p = projectiles[i];
    if (p.isHeal) {
      if (!p.target || p.target.hp <= 0) { p.dead = true; continue; }
      const dx = p.target.x - p.x, dy = p.target.y - p.y, dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 10) { p.target.hp = Math.min(p.target.maxHp, p.target.hp + p.dmg); addParticle(p.target.x, p.target.y, 'rgb(0,255,136)', 3, 2); p.dead = true; }
      else { p.x += (dx/dist) * p.speed; p.y += (dy/dist) * p.speed; }
      continue;
    }
    if (p.owner === 'cat') {
      p.x += p.speed;
      p.traveled += p.speed;
      let hit = null;
      for (let j = 0; j < enemies.length; j++) {
        const e = enemies[j];
        // v47: una flecha perforante no golpea dos veces al mismo enemigo
        if (p.hitSet && p.hitSet.has(e)) continue;
        const r = 14 * (e.scale || 1) + 4;
        if (p.x >= e.x - r && p.x <= e.x + r) { hit = e; break; }
      }
      if (hit) {
        if (p.aoeRadius) {
          addRing(p.x, p.y, 'rgb(255,0,255)', p.aoeRadius);
          for (let j = 0; j < enemies.length; j++) {
            const t = enemies[j];
            if (Math.abs(t.x - p.x) <= p.aoeRadius) { t.hp -= p.dmg; addParticle(t.x, t.y, 'rgb(255,0,255)', 3, 3); }
          }
          // v58: la explosión masiva salpica a la base enemiga si está a tiro
          if (Math.abs(ENEMY_BASE_X - p.x) <= p.aoeRadius) {
            enemyBaseHP -= p.dmg;
            addParticle(ENEMY_BASE_X, 170, 'rgb(255,0,255)', 4, 3);
          }
          p.dead = true;
        } else {
          hit.hp -= p.dmg;
          addParticle(hit.x, hit.y, 'rgb(255,200,100)', 3, 2);
          // v47: FLECHA PERFORANTE — atraviesan hasta ARCHER_PIERCE_COUNT enemigos
          if (p.pierce > 0) {
            p.pierce--;
            if (!p.hitSet) p.hitSet = new Set();
            p.hitSet.add(hit);
            addParticle(hit.x, hit.y, 'rgb(200,160,255)', 2, 2);
            if (p.pierce <= 0) p.dead = true;
          } else {
            p.dead = true;
          }
        }
      } else if (p.canHitBase && p.x >= ENEMY_BASE_X - 24) {
        enemyBaseHP -= p.dmg;
        addParticle(ENEMY_BASE_X, 170, 'rgb(255,100,100)', 4, 3);
        if (p.aoeRadius) {
          addRing(ENEMY_BASE_X, 170, 'rgb(255,0,255)', p.aoeRadius);
          for (let j = 0; j < enemies.length; j++) {
            const t = enemies[j];
            if (Math.abs(t.x - ENEMY_BASE_X) <= p.aoeRadius) { t.hp -= p.dmg; addParticle(t.x, t.y, 'rgb(255,0,255)', 3, 3); }
          }
        }
        p.dead = true;
      } else if (p.traveled >= (p.projRange || 0) || p.x > 930) {
        addParticle(p.x, p.y, 'rgb(200,200,200)', 2, 2);
        p.dead = true;
      }
    } else {
      p.x -= p.speed;
      p.traveled += p.speed;
      let hit = null;
      for (let j = 0; j < cats.length; j++) {
        const c = cats[j];
        const r = 14 * (c.scale || 1) + 4;
        if (p.x <= c.x + r && p.x >= c.x - r) { hit = c; break; }
      }
      if (hit) {
        hit.hp -= p.dmg;
        addParticle(hit.x, hit.y, 'rgb(255,100,100)', 3, 2);
        sfxNow('cat_hurt');
        p.dead = true;
      } else if (p.traveled >= (p.projRange || 0) || p.x < -30) {
        addParticle(p.x, p.y, 'rgb(200,200,200)', 2, 2);
        p.dead = true;
      }
    }
  }
  projectiles = projectiles.filter(p => !p.dead);
  // ---------------- PARTÍCULAS / TEXTOS ----------------
  for (let i = 0; i < particles.length; i++) { const p = particles[i]; if (p.ring) p.radius += (p.maxRadius - p.radius) * 0.2; else { p.x += p.vx; p.y += p.vy; p.vy += 0.2; } p.life--; }
  particles = particles.filter(p => p.life > 0);
  for (let i = 0; i < floatingTexts.length; i++) { floatingTexts[i].y -= 1; floatingTexts[i].life--; }
  floatingTexts = floatingTexts.filter(t => t.life > 0);
  // ---------------- MUERTES ----------------
  enemies = enemies.filter(e => {
    if (e.hp <= 0) {
      if (!isTest()) money += e.reward;
      addParticle(e.x, e.y, 'rgb(100,100,100)', 5, 3);
      addFloatingText(e.x, e.y - 25, `+${e.reward}💰`, '#ffd700');
      if (e.isBoss) addFloatingText(450, 100, '👑 ¡' + e.name + ' DERROTADO! 👑', '#ff0000');
      return false;
    }
    return true;
  });
  cats = cats.filter(c => { if (c.hp <= 0) { addParticle(c.x, c.y, 'rgb(255,200,100)', 5, 3); return false; } return true; });
  // ---------------- FIN DE PARTIDA ----------------
  if (baseHP <= 0 && !isTest()) {
    if (gameMode === 'story') { storyDefeat(); return; }
    if (gameMode === 'event') { eventDefeat(); return; }
    gameOver = true;
  }
  if (enemyBaseHP <= 0) {
    if (gameMode === 'story') { storyVictory(); return; }
    if (gameMode === 'event') { eventVictory(); return; }
    wave++;
    if (!isTest()) {
      const bonus = 600 + wave * 120;
      money += bonus;
      addFloatingText(450, 100, `¡VICTORIA! +${bonus}💰`, '#ffd700');
    } else {
      addFloatingText(450, 100, `¡Oleada ${wave}!`, '#ffd700');
    }
    enemyBaseMaxHP = 2000 + wave * 800;
    enemyBaseHP = enemyBaseMaxHP;
    bossSpawnedThisWave = false;
    addParticle(ENEMY_BASE_X, 170, 'rgb(255,215,0)', 15, 4);
    const bossInterval = wave >= 100 ? 25 : 10;
    if (wave % bossInterval === 0) { pendingBoss = getBossForWave(); bossWarningTimer = 90; }
  }
  updateUI();
}