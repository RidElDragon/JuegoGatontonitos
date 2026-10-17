// ============================================================
// 10-bestiary.js — v46: BESTIARIO con retratos EN VIVO
// (nuestra arquitectura: sin sceneCanvas, usa un canvas aparte
//  mediante setRenderContext/resetRenderContext de 07-main).
// · Registra cada enemigo que aparece en batalla (fuera de sandbox).
// · Galería deslizable con pestañas ✅ Descubiertos / 📚 Todos.
// · Retratos animados de tropas y enemigos con el mismo código
//   de dibujo del juego (drawCat / drawEnemy con hideHud).
// ============================================================
(function () {
  const B_KEY = 'catBattleBestiary';
  let seen = load();
  function load() {
    try { const o = JSON.parse(localStorage.getItem(B_KEY)); return (o && typeof o === 'object') ? o : {}; } catch (e) { return {}; }
  }
  function save() { try { localStorage.setItem(B_KEY, JSON.stringify(seen)); } catch (e) {} }

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
    if (isTest()) return;
    const id = idOf(t);
    if (!id) return;
    const ctxName = contextNow();
    if (!seen[id]) seen[id] = { n: 0, first: ctxName };
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

  // ============================================================
  // RETRATOS EN VIVO (canvas aparte, ventana fija)
  // ============================================================
  const PORT_LOGICAL = 110;      // ventana lógica del retrato
  const PORT_S = 2;              // resolución interna (nitidez)
  const BACK = PORT_LOGICAL * PORT_S;
  const portCanvas = document.createElement('canvas');
  portCanvas.width = BACK; portCanvas.height = BACK;
  const portCtx = portCanvas.getContext('2d');
  let galleryFrame = 0;
  let jobs = [];

  function drawFigure(job) {
    const prevF = frameCount;
    frameCount = galleryFrame; // anima el retrato sin tocar la batalla
    setRenderContext(portCtx);
    portCtx.setTransform(PORT_S, 0, 0, PORT_S, 0, 0);
    portCtx.clearRect(0, 0, PORT_LOGICAL, PORT_LOGICAL);
    try { job.draw(); } catch (e) {}
    frameCount = prevF;
    resetRenderContext();
    const tc = job.tctx;
    if (!tc) return;
    tc.setTransform(1, 0, 0, 1, 0, 0);
    tc.clearRect(0, 0, job.w, job.h);
    tc.imageSmoothingEnabled = true;
    tc.drawImage(portCanvas, 0, 0, BACK, BACK, 0, 0, job.w, job.h);
  }
  function refreshGallery() {
    const vh = window.innerHeight || 800;
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const cv = job.tctx && job.tctx.canvas;
      if (cv && cv.getBoundingClientRect) {
        const r = cv.getBoundingClientRect();
        if (r.bottom < -40 || r.top > vh + 40) continue; // fuera de pantalla
      }
      drawFigure(job);
    }
  }
  function makeThumb() {
    const cv = document.createElement('canvas');
    cv.className = 'best-thumb';
    cv.width = BACK; cv.height = BACK;
    return cv;
  }
  function portraitJob(key, draw, cv) {
    let tctx = null;
    try { tctx = cv.getContext('2d'); } catch (e) {}
    return { key: key, draw: draw, tctx: tctx, w: BACK, h: BACK };
  }
  function catPortrait(idx, cv) {
    const u = CAT_BASE[idx];
    const lvl = Math.max(1, unitLevels[idx] || 1);
    return portraitJob('c' + idx, function () {
      drawCat({
        x: PORT_LOGICAL / 2, y: 78, type: idx, level: lvl, scale: 1,
        hp: 1, maxHp: 1, color: u.color, color2: u.color2,
        visual: u.visual || null, unitType: u.type,
        walkCycle: 0.9, attackAnim: 0, poisonTimer: 0
      }, { hideHud: true });
    }, cv);
  }
  function enemyPortrait(id, cv) {
    const t = objById(id);
    const isBoss = id[0] === 'b' || id.startsWith('eb:');
    let type;
    if (id.startsWith('ee:') || id.startsWith('eb:')) type = id.slice(3);
    else type = +id.slice(1);
    return portraitJob('e' + id, function () {
      drawEnemy({
        x: PORT_LOGICAL / 2, y: 78, type: type, scale: 1,
        hp: 1, maxHp: 1, color: t.color, color2: t.color2,
        unitType: t.type, isBoss: isBoss, bossStyle: t.bossStyle || null,
        desertStyle: t.desertStyle || null, xmasStyle: t.xmasStyle || null,
        name: t.name, walkCycle: 0.9, attackAnim: 0, poisonTimer: 0
      }, { hideHud: true });
    }, cv);
  }

  // ---------------- Pantalla ----------------
  let bBtn = null, bScreen = null, bList = null;
  let mode = 'seen';
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
    bScreen.className = 'screen bestiary-screen';
    bScreen.style.display = 'none';
    bScreen.innerHTML =
      `<div class="best-head">
        <h2 style="margin:2px">📖 BESTIARIO</h2>
        <div class="menu-info" id="bestInfo"></div>
        <div class="best-tabs">
          <button class="best-tab" data-mode="seen">✅ Descubiertos</button>
          <button class="best-tab" data-mode="all">📚 Todos</button>
        </div>
      </div>
      <div class="best-list" id="bestList"></div>
      <div class="best-foot"></div>`;
    bList = bScreen.querySelector('#bestList');
    const tabs = bScreen.querySelector('.best-tabs');
    if (tabs) {
      tabs.querySelectorAll('.best-tab').forEach(t => {
        t.onclick = () => { mode = t.dataset.mode || 'seen'; render(); };
      });
    }
    const foot = bScreen.querySelector('.best-foot');
    if (foot) {
      const b = document.createElement('button');
      b.className = 'back';
      b.textContent = '⬅ Volver al menú';
      b.onclick = showMenu;
      foot.appendChild(b);
    }
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
  function lockedThumb() {
    const d = document.createElement('div');
    d.className = 'best-thumb best-thumb-locked';
    d.textContent = '❓';
    return d;
  }
  function section(list, title, entries) {
    if (!entries.length) return;
    const h = document.createElement('div');
    h.className = 'best-section';
    h.textContent = title;
    list.appendChild(h);
    entries.forEach(e => list.appendChild(e));
  }
  function troopEntry(idx) {
    const unlocked = isUnitUnlocked(idx);
    if (!unlocked && mode === 'seen') return null;
    const u = CAT_BASE[idx];
    const node = document.createElement('div');
    node.className = 'best-entry' + (unlocked ? '' : ' locked-entry');
    const body = document.createElement('div');
    body.className = 'best-body';
    if (unlocked) {
      const r = rarityOf(idx);
      const cv = makeThumb();
      node.appendChild(cv);
      jobs.push(catPortrait(idx, cv));
      body.innerHTML =
        `<div class="best-name">${UNIT_EMOJI[idx]} ${u.name} <span class="best-tag" style="border-color:${r.color};color:${r.color}">${r.name}</span>${unitLevels[idx] >= EVOLVE_LEVEL ? ' <span class="best-tag">✨</span>' : ''}</div>` +
        `<div class="sb-info">${troopStatsLine(u)}</div>` +
        `<div class="sb-info" style="font-style:italic;opacity:.8">"${TROOP_LORE[idx] || ''}"</div>` +
        `<div class="sb-info">Nivel actual: ${unitLevels[idx]}/${unitLevelCap()}</div>`;
    } else {
      node.appendChild(lockedThumb());
      body.innerHTML =
        `<div class="best-name locked">🔒 ???</div>` +
        `<div class="sb-info locked">${unlockLabel(idx)}</div>` +
        `<div class="sb-info locked">Desbloquéala para ver su ficha</div>`;
    }
    node.appendChild(body);
    return node;
  }
  function enemyEntry(id) {
    const t = objById(id);
    const s = seen[id];
    if (!s && mode === 'seen') return null;
    const node = document.createElement('div');
    node.className = 'best-entry' + (s ? '' : ' locked-entry');
    const body = document.createElement('div');
    body.className = 'best-body';
    if (s) {
      const cv = makeThumb();
      node.appendChild(cv);
      jobs.push(enemyPortrait(id, cv));
      body.innerHTML =
        `<div class="best-name">${t.name} <span class="best-tag">${TYPE_CHIP[t.type] || ''}</span></div>` +
        `<div class="sb-info">HP:${t.hp} · DMG:${t.dmg} · SPD:${t.speed}${t.reward ? ' · 💰' + t.reward : ''}</div>` +
        `<div class="sb-info">👁 Visto ${s.n}× · 1ª vez: ${s.first || '—'}</div>`;
    } else {
      node.appendChild(lockedThumb());
      body.innerHTML =
        `<div class="best-name locked">❓ ???</div>` +
        `<div class="sb-info locked">${TYPE_CHIP[t.type] || 'Enemigo'}</div>` +
        `<div class="sb-info locked">Aún no lo has encontrado</div>` +
        `<div class="sb-info locked">📍 ${enemyHint(id)}</div>`;
    }
    node.appendChild(body);
    return node;
  }
  function render() {
    const info = document.getElementById('bestInfo');
    if (info) info.innerHTML = `Enemigos: <b style="color:#88ccee">${seenCount()}/${allEnemyIds().length}</b> · Tropas: <b style="color:#88ff88">${troopCount()}/${NUM_UNITS}</b> · <span style="font-size:11px">Retratos dibujados en vivo. Se registra al aparecer en batalla (no en 🧪 sandbox).</span>`;
    if (bScreen) {
      bScreen.querySelectorAll('.best-tab').forEach(t => {
        t.classList.toggle('active', (t.dataset.mode || 'seen') === mode);
      });
    }
    if (!bList) return;
    bList.innerHTML = '';
    jobs = [];
    const troops = [];
    for (let i = 0; i < NUM_UNITS; i++) { const e = troopEntry(i); if (e) troops.push(e); }
    const enemies = [];
    for (let i = 0; i < ENEMY_TYPES.length; i++) { const e = enemyEntry('n' + i); if (e) enemies.push(e); }
    const evEnemies = [];
    for (const k in EVENT_ENEMY_TYPES) { const e = enemyEntry('ee:' + k); if (e) evEnemies.push(e); }
    const bosses = [];
    for (let i = 0; i < BOSS_TYPES.length; i++) { const e = enemyEntry('b' + i); if (e) bosses.push(e); }
    for (const k in EVENT_BOSS_TYPES) { const e = enemyEntry('eb:' + k); if (e) bosses.push(e); }
    section(bList, `🐱 TROPAS (${troops.length}/${NUM_UNITS})`, troops);
    section(bList, `👹 ENEMIGOS (${enemies.length})`, enemies);
    section(bList, `🎃 ENEMIGOS DE EVENTOS (${evEnemies.length})`, evEnemies);
    section(bList, `👑 JEFES (${bosses.length})`, bosses);
    if (!troops.length && !enemies.length && !evEnemies.length && !bosses.length) {
      const h = document.createElement('div');
      h.className = 'best-section';
      h.textContent = 'Aún no has descubierto nada. ¡Sal a combatir!';
      bList.appendChild(h);
    }
    galleryFrame++;
    refreshGallery();
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
  // Anima los retratos solo mientras el bestiario está abierto (~30 fps)
  wrap('draw', () => {
    if (screen !== 'bestiary') return;
    galleryFrame++;
    if (galleryFrame & 1) return;
    refreshGallery();
  });

  // Arranque
  buildUI();
  refreshButton();
})();