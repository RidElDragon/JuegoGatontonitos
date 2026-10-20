// ============================================================
// 12-gamatoto.js — v79e: GAMATOTO (expediciones)
// · Gamatoto NO es unidad y VIAJA SOLO: no hay selector de tropa.
//   La expedición se lanza eligiendo únicamente la duración.
// · Recompensas: XP + tickets + consumibles (escalán con duración).
// ============================================================
(function () {
  let gScreen = null;
  let refreshTimer = null;

  function buildUI() {
    gScreen = document.createElement('div');
    gScreen.className = 'screen';
    gScreen.style.display = 'none';
    gScreen.innerHTML =
      '<h2>🎲 GAMATOTO</h2>' +
      '<div style="display:flex;align-items:center;gap:10px;justify-content:center;margin:4px 0 8px">' +
        '<span style="font-size:34px">🎲</span>' +
        '<div style="text-align:left">' +
          '<div style="font-weight:bold;color:#ffd700">Gamatoto — gestor de expediciones</div>' +
          '<div class="sb-info" style="font-size:11px">Se queda en la base organizando los envíos. No se despliega, no se selecciona y no cambia de forma.</div>' +
        '</div>' +
      '</div>' +
      '<div class="menu-info" id="gamaInfo"></div>' +
      '<div id="gamaBody" class="upgrade-grid" style="max-width:980px"></div>' +
      '<div class="best-foot"></div>';
    const foot = gScreen.querySelector('.best-foot');
    const b = document.createElement('button');
    b.className = 'back'; b.textContent = '⬅ Volver'; b.onclick = showHub;
    foot.appendChild(b);
    document.body.appendChild(gScreen);
  }

  function timeLeft() {
    if (!expedition) return 0;
    const end = expedition.startTime + expedition.durationHours * 3600 * 1000;
    return Math.max(0, end - Date.now());
  }
  function fmtTime(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (h > 0 ? h + 'h ' : '') + m + 'm ' + sec + 's';
  }

  // consumible aleatorio según duración
  function rollConsumable(dur) {
    let chance = 0, pool = [];
    if (dur.hours === 1)      { chance = 0.15; pool = ['speed','radar']; }
    else if (dur.hours === 3) { chance = 0.25; pool = ['speed','radar','rich']; }
    else if (dur.hours === 8) { chance = 0.35; pool = ['speed','radar','rich','sabelotodo','sniper']; }
    else                      { chance = 0.50; pool = ['speed','radar','rich','cpu','sabelotodo','sniper']; }
    if (Math.random() < chance) {
      const id = pool[Math.floor(Math.random() * pool.length)];
      const count = (dur.hours >= 24 && Math.random() < 0.3) ? 2 : 1;
      return { id: id, count: count };
    }
    return null;
  }

  function rollReward(dur) {
    const coinsReward = dur.xpMin + Math.floor(Math.random() * (dur.xpMax - dur.xpMin + 1));
    let ticketType = null, ticketCount = 0;
    let roll = Math.random();
    for (const r of dur.rewards) {
      roll -= r.ch;
      if (roll <= 0) {
        if (r.t === 'normal') { ticketType = 'normal'; ticketCount = 1; }
        else if (r.t === 'rare') { ticketType = 'rare'; ticketCount = 1; }
        else if (r.t === 'rare2') { ticketType = 'rare'; ticketCount = 2; }
        else if (r.t === 'event') { ticketType = 'event'; ticketCount = 1; }
        break;
      }
    }
    return { coins: coinsReward, ticketType: ticketType, ticketCount: ticketCount, consumable: rollConsumable(dur) };
  }

  function render() {
    const info = document.getElementById('gamaInfo');
    const body = document.getElementById('gamaBody');
    if (!info || !body) return;
    body.innerHTML = '';
    info.innerHTML = isDevMode()
      ? '🔧 <b>Modo dev:</b> puedes probar sin esperar, y nada se guarda al salir.'
      : 'Gamatoto parte de expedición. Elige cuánto tiempo estará fuera: a más espera, mejores recompensas (XP, tickets y consumibles).';

    // --- Expedición en curso: Gamatoto viaja solo ---
    if (expedition) {
      const left = timeLeft();
      const card = document.createElement('div');
      card.className = 'upg-card';
      card.style.minWidth = '340px';
      card.style.textAlign = 'left';
      card.innerHTML =
        '<div class="best-name">🧳 Expedición en curso</div>' +
        '<div class="sb-info">Enviado: 🎲 <b>Gamatoto</b> (solo, como siempre)</div>' +
        '<div class="sb-info">Duración: <b>' + expedition.durationHours + 'h</b></div>' +
        '<div class="sb-info" style="font-size:16px;color:#ffd700">⏳ Tiempo restante: <b id="gamaCountdown">' + fmtTime(left) + '</b></div>';
      const btn = document.createElement('button');
      btn.className = 'save-btn';
      btn.style.cssText = 'margin-top:10px;padding:10px 20px;font-size:14px;background:linear-gradient(135deg,#ffd700,#aa7700);color:#221100;font-weight:bold;';
      if (left <= 0) { btn.textContent = '🎁 ¡Reclamar recompensa!'; btn.onclick = claimExpedition; }
      else {
        btn.textContent = '⏳ Aún en ruta...'; btn.disabled = true;
        if (isDevMode()) { btn.disabled = false; btn.textContent = '🎁 Reclamar [DEV]'; btn.onclick = claimExpedition; }
      }
      card.appendChild(btn);
      body.appendChild(card);
      if (isDevMode()) {
        const cancel = document.createElement('button');
        cancel.className = 'save-btn';
        cancel.style.cssText = 'margin-top:10px;padding:8px 16px;background:linear-gradient(135deg,#ff6666,#aa0000);';
        cancel.textContent = '🗑️ Cancelar expedición [DEV]';
        cancel.onclick = () => { expedition = null; saveMeta(); render(); };
        body.appendChild(cancel);
      }
      return;
    }

    // --- Sin expedición: solo duración (sin tropa) ---
    const card = document.createElement('div');
    card.className = 'upg-card';
    card.style.minWidth = '340px';
    card.style.textAlign = 'left';
    card.innerHTML = '<div class="best-name">🧭 Nueva expedición</div>' +
      '<div class="sb-info">Gamatoto se va solo. Tú solo decides cuánto tiempo estará fuera.</div>' +
      '<div class="sb-info" style="margin-top:10px"><b>Duración del viaje:</b></div>';
    const durSel = document.createElement('select');
    durSel.style.cssText = 'width:100%;padding:8px;font-size:14px;background:#222233;color:#fff;border:2px solid #4488ff;border-radius:6px;';
    GAMATOTO_DURATIONS.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = d.label + ' — XP ' + d.xpMin + '-' + d.xpMax + ' + tickets + consumibles';
      durSel.appendChild(opt);
    });
    card.appendChild(durSel);
    const go = document.createElement('button');
    go.className = 'save-btn';
    go.style.cssText = 'margin-top:14px;padding:10px 20px;font-size:15px;width:100%;background:linear-gradient(135deg,#88ff88,#228822);color:#111;font-weight:bold;';
    go.textContent = '🚀 Enviar a Gamatoto';
    go.onclick = () => {
      const durIdx = parseInt(durSel.value);
      const dur = GAMATOTO_DURATIONS[durIdx];
      expedition = { durationHours: dur.hours, startTime: Date.now(), reward: rollReward(dur) };
      if (!isDevMode()) saveMeta();
      render();
    };
    card.appendChild(go);
    body.appendChild(card);
  }

  function claimExpedition() {
    if (!expedition) return;
    const rew = expedition.reward;
    let msg = '🎉 ¡Expedición completada! +' + rew.coins + ' XP';
    coins += rew.coins;
    if (rew.ticketType && rew.ticketCount > 0) {
      if (rew.ticketType === 'normal') { ticketsNormal += rew.ticketCount; msg += ' +' + rew.ticketCount + ' 🎫'; }
      else if (rew.ticketType === 'rare') { ticketsRare += rew.ticketCount; msg += ' +' + rew.ticketCount + ' 💠'; }
      else if (rew.ticketType === 'event') { ticketsEvent += rew.ticketCount; msg += ' +' + rew.ticketCount + ' 🎟'; }
    }
    if (rew.consumable && window.addConsumable) {
      window.addConsumable(rew.consumable.id, rew.consumable.count);
      const d = CONSUMABLE_DEFS[rew.consumable.id];
      if (d) msg += ' +' + rew.consumable.count + ' ' + d.emoji + ' ' + d.name;
    }
    expedition = null;
    if (!isDevMode()) saveMeta();
    if (window.toastMsg) window.toastMsg(msg, '#ffd700');
    else setStatus(msg, '#ffd700');
    render();
    if (window.sfx) window.sfx('victory');
  }

  function showGamatoto() {
    leaveTestIfNeeded();
    hideScreens();
    if (gScreen) gScreen.style.display = 'flex';
    screen = 'gamatoto'; playing = false;
    render();
    if (!refreshTimer) {
      refreshTimer = setInterval(() => {
        if (screen === 'gamatoto' && expedition) {
          const cd = document.getElementById('gamaCountdown');
          if (cd) cd.textContent = fmtTime(timeLeft());
          if (timeLeft() <= 0) render();
        }
      }, 1000);
    }
  }
  window.showGamatoto = showGamatoto;
  window.openGamatoto = showGamatoto;
  window.claimExpedition = claimExpedition;

  function wrap(name, after) {
    const orig = window[name];
    if (typeof orig !== 'function') return;
    window[name] = function () { const r = orig.apply(this, arguments); try { after.apply(this, arguments); } catch (e) {} return r; };
  }
  wrap('hideScreens', () => { if (gScreen) gScreen.style.display = 'none'; });

  buildUI();
})();