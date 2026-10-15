// ============================================================
// 10-bestiary.js — v43: BESTIARIO (colección de prestigio)
// · Registra cada enemigo que aparece en batalla (fuera de sandbox).
// · Muestra tropas desbloqueadas (stats + rareza + lore) y las
//   bloqueadas como ??? con su pista de desbloqueo.
// · Enemigos no vistos = ??? con pista de dónde aparecen.
// · Pantalla y botón de menú inyectados por JS (sin tocar index.html).
// ============================================================
(function () {
  const B_KEY = 'catBattleBestiary';
  let seen = load();
  function load() {
    try { const o = JSON.parse(localStorage.getItem(B_KEY)); return (o && typeof o === 'object') ? o : {}; } catch (e) { return {}; }
  }
  function save() { try { localStorage.setItem(BBattleKey(), JSON.stringify(seen)); } catch (e) {} }
  function BBattleKey() { return B_KEY; }

  // ---------------- Identificación de enemigos ----------------
  function idOf(t) {
    let i = ENEMY_TYPES.indexOf(t); if (i >= 0) return 'n' + i;
    i = BOSS_TYPES.indexOf(t); if (i >= 0) return 'b' + i;
    for (const k in EVENT_ENEMY_TYPES) if (EVENT_ENEMY_TYPES[k] === t) return 'ee:' + k;
    for (const k in EVENT_BOSS_TYPES) if (EVENT_BOSS_TYPES[k] === t) return 'eb:' + k;
    return null;
  }
  function objById(id) {
    if (id.startsWith('ee:')) return EVENT_ENEMY_TYPES[id.slice(3)];
    if (id.startsWith('eb:')) return EVENT_BOSS_TYPES[id.slice(3)];
    if (id[0] === 'b') return BOSS_TYPES[+id.slice(1)];
    return ENEMY_TYPES[+id.slice(1)];
  }
  function allEnemyIds() {
    const ids = [];
    for (let i = 0; i < ENEMY_TYPES.length; i++) ids.push('n' + i);
    for (const k in EVENT_ENEMY_TYPES) ids.push('ee:' + k);
    for (let i = 0; i < BOSS_TYPES.length; i++) ids.push('b' + i);
    for (const k in EVENT_BOSS_TYPES) ids.push('eb:' + k);
    return ids;
  }
  function contextNow() {
    if (gameMode === 'story') return 'Historia Nv.' + (storyLevelIdx + 1);
    if (gameMode === 'event') {
      const ev = EVENTS[currentEventId];
      return ev ? ev.name + ' · ' + ev.levels[eventLevelIdx].name : currentEventId;
    }
    if (gameMode === 'infinite') return 'Infinito · Oleada ' + wave;
    return '';
  }
  function record(t) {
    if (isTest()) return; // en sandbox no se registra nada
    const id = idOf(t);
    if (!id) return;
    const ctx = contextNow();
    if (!seen[id]) seen[id] = { n: 0, first: ctx };
    seen[id].n++;
    save();
    refreshButton();
  }

  // ---------------- Pistas de aparición ----------------
  function enemyHint(id) {
    if (id.startsWith('ee:')) {
      const k = id.slice(3);
      for (const ev of Object.values(EVENTS)) for (const L of ev.levels) if (L.pool.includes(k)) return ev.name + ' · ' + L.name;
      return 'Evento especial';
    }
    if (id.startsWith('eb:')) {
      const k = id.slice(3);
      for (const ev of Object.values(EVENTS)) for (const L of ev.levels) if (L.boss === k) return ev.name + ' · ' + L.name;
      return 'Jefe de evento';
    }
    if (id[0] === 'b') {
      const lv = [5, 10, 15, 35, 40, 45][+id.slice(1)];
      return 'Historia Nv.' + lv + ' (JEFE) · Infinito';
    }
    const i = +id.slice(1);
    if (i >= 11) return 'Historia Parte 3 · Desierto (Nv.31+)';
    const w = [1, 1, 3, 3, 6, 12, 25, 3, 6, 25, 12][i];
    return 'Infinito · Oleada ' + w + '+ · Historia';
  }
  const TYPE_CHIP = {
    melee: '⚔️ Cuerpo a cuerpo', ranged: '🏹 A distancia', roboRanged: '🔫 A distancia',
    aoe: '💥 Daño en área', healer: '💚 Curación', poison: '☠️ Veneno',
    flying: '🪽 Volador', boss: '👑 JEFE'
  };

  // ---------------- Lore de tropas ----------------
  const TROOP_LORE = [
    'El recluta de siempre: barato, valiente y maúlla primero.',
    'Un muro con patas. Aguanta lo que hundiría a cualquier otro.',
    'Cristal con garras: entra volando, golpea fuerte y reza.',
    'Lluvia de flechas desde la retaguardia. Nunca se acerca demasiado.',
    'Sus bolas de fuego salpican a filas enteras. Manténlo protegido.',
    'La razón por la que tu línea de frente sigue en pie.',
    'Lento, enorme y coronado. No se aparta por nadie.',
    'Acero felino forjado tras la invasión alienígena.',
    'Dispara más rápido de lo que maúlla. Bala tras bala.',
    'El monarca absoluto: su hacha juzga filas enteras de una vez.',
    'Escapó del infierno con su lanza ígnea y muy mal humor.',
    'Nadie sabe dónde mira… pero siempre acierta.',
    'Reparte nieve y castigo a partes iguales. Ho-ho-ho.',
  ];

  // ---------------- Enganche: registrar apariciones ----------------
  (function wrapPushEnemy() {
    const orig = window.pushEnemy;
    if (typeof orig !== 'function') return;
    window.pushEnemy = function (t) {
      const r = orig.apply(this, arguments);
      try { record(t); } catch (e) {}
      return r;
    };
  })();

  // ---------------- Pantalla ----------------
  let bBtn = null, bScreen = null;
  function seenCount() { return allEnemyIds().filter(id => seen[id]).length; }
  function troopCount() { let n = 0; for (let i = 0; i < NUM_UNITS; i++) if (isUnitUnlocked(i)) n++; return n; }

  function buildUI() {
    const menu = document.getElementById('menuScreen');
    if (menu) {
      bBtn = document.createElement('button');
      bBtn.className = 'menu-btn';
      bBtn.style.background = 'linear-gradient(135deg, #66aacc, #225577)';
      bBtn.onclick = showBestiary;
      const resetBtn = menu.querySelector('.reset-all');
      if (resetBtn) menu.insertBefore(bBtn, resetBtn); else menu.appendChild(bBtn);
    }
    bScreen = document.createElement('div');
    bScreen.className = 'screen';
    bScreen.style.display = 'none';
    bScreen.style.justifyContent = 'flex-start';
    bScreen.innerHTML = `<h2>📖 BESTIARIO</h2>
      <div class="menu-info" id="bestInfo"></div>
      <div class="panel-title" style="margin-top:10px">🐱 TROPAS (${troopCount()}/${NUM_UNITS})</div>
      <div id="bestTroops" class="troop-grid" style="max-width:980px"></div>
      <div class="panel-title" style="margin-top:14px">👹 ENEMIGOS</div>
      <div id="bestEnemies" class="troop-grid" style="max-width:980px"></div>
      <div class="panel-title" style="margin-top:14px">🎃 ENEMIGOS DE EVENTOS</div>
      <div id="bestEventEnemies" class="troop-grid" style="max-width:980px"></div>
      <div class="panel-title" style="margin-top:14px">👑 JEFES</div>
      <div id="bestBosses" class="troop-grid" style="max-width:980px"></div>
      <button class="back" onclick="showMenu()" style="margin-top:14px">⬅ Volver al menú</button>`;
    document.body.appendChild(bScreen);
  }
  function refreshButton() {
    if (bBtn) bBtn.textContent = `📖 Bestiario (${seenCount()}/${allEnemyIds().length} enemigos · ${troopCount()}/${NUM_UNITS} tropas)`;
  }
  function showBestiary() {
    hideScreens();
    if (bScreen) bScreen.style.display = 'flex';
    screen = 'bestiary'; playing = false;
    render();
  }
  function enemyCard(id) {
    const t = objById(id);
    const s = seen[id];
    const b = document.createElement('button');
    b.className = 'troop-card';
    b.disabled = true;
    if (s) {
      b.style.border = '2px solid #66aacc';
      b.innerHTML = `${t.name} <span class="sb-info" style="color:#88ccee">${TYPE_CHIP[t.type] || ''}</span>
        <span class="sb-info">HP:${t.hp} · DMG:${t.dmg} · SPD:${t.speed}${t.reward ? ' · 💰' + t.reward : ''}</span>
        <span class="sb-info">👁 Visto ${s.n}× · 1ª vez: ${s.first || '—'}</span>`;
    } else {
      b.className += ' lockedcard';
      b.innerHTML = `❓ ??? <span class="sb-info locked">${TYPE_CHIP[t.type] || 'Enemigo'}</span>
        <span class="sb-info locked">Aún no lo has encontrado</span>
        <span class="sb-info locked">📍 ${enemyHint(id)}</span>`;
    }
    return b;
  }
  function render() {
    const info = document.getElementById('bestInfo');
    if (info) info.innerHTML = `Enemigos descubiertos: <b style="color:#88ccee">${seenCount()}/${allEnemyIds().length}</b> · Tropas: <b style="color:#88ff88">${troopCount()}/${NUM_UNITS}</b><br><span style="font-size:11px">Se registra automáticamente al aparecer en batalla (no en 🧪 sandbox). Solo prestigio.</span>`;
    const tg = document.getElementById('bestTroops');
    tg.innerHTML = '';
    CAT_BASE.forEach((u, idx) => {
      const unlocked = isUnitUnlocked(idx);
      const b = document.createElement('button');
      b.className = 'troop-card';
      b.disabled = true;
      if (unlocked) {
        applyRarityStyle(b, idx);
        b.innerHTML = `${UNIT_EMOJI[idx]} ${u.name}${rarityTag(idx)}
          <span class="sb-info">${troopStatsLine(u)}</span>
          <span class="sb-info" style="font-style:italic;opacity:.8">"${TROOP_LORE[idx] || ''}"</span>
          <span class="sb-info">Nivel actual: ${unitLevels[idx]}/${unitLevelCap()}</span>`;
      } else {
        b.className += ' lockedcard';
        b.innerHTML = `🔒 ???<span class="sb-info locked">${unlockLabel(idx)}</span><span class="sb-info locked">Desbloquéala para ver su ficha</span>`;
      }
      tg.appendChild(b);
    });
    const eg = document.getElementById('bestEnemies');
    eg.innerHTML = '';
    for (let i = 0; i < ENEMY_TYPES.length; i++) eg.appendChild(enemyCard('n' + i));
    const eeg = document.getElementById('bestEventEnemies');
    eeg.innerHTML = '';
    for (const k in EVENT_ENEMY_TYPES) eeg.appendChild(enemyCard('ee:' + k));
    const bg = document.getElementById('bestBosses');
    bg.innerHTML = '';
    for (let i = 0; i < BOSS_TYPES.length; i++) bg.appendChild(enemyCard('b' + i));
    for (const k in EVENT_BOSS_TYPES) bg.appendChild(enemyCard('eb:' + k));
  }

  // ---------------- Wrappers ----------------
  function wrap(name, after) {
    const orig = window[name];
    if (typeof orig !== 'function') return;
    window[name] = function () {
      const r = orig.apply(this, arguments);
      try { after.apply(this, arguments); } catch (e) {}
      return r;
    };
  }
  wrap('hideScreens', () => { if (bScreen) bScreen.style.display = 'none'; });
  wrap('showMenu', () => { refreshButton(); });

  // Arranque
  buildUI();
  refreshButton();
})();