// ============================================================
// 14-consumables.js — v78c: INVENTARIO 🎒 + botones de mejora en partida
// · v78c: botón 📈 INCOME (de pago, máx 6, +5/s c/u) en la fila del cañón.
// · v78b: botón 💼 AMPLIAR CARTERA (de pago, máx 6) en la fila del cañón.
// · Panel 🎒 con toggle de velocidad y los 5 consumibles de uso.
// ============================================================
(function () {
  let panelEl = null;
  let lastCpuClick = 0;
  const CPU_DOUBLE_CLICK_MS = 500;

  function addConsumable(id, n) {
    if (!CONSUMABLE_DEFS[id]) return;
    n = n || 1;
    consumables[id] = (consumables[id] || 0) + n;
    if (!isDevMode()) saveMeta();
    refreshPanel();
  }
  window.addConsumable = addConsumable;

  function useConsumable(id) {
    if (id === 'speed') { toggleSpeed(); return; }
    if (!CONSUMABLE_DEFS[id]) return;
    if (!isDevMode() && (consumables[id] || 0) <= 0) {
      setStatus('❌ No tienes ' + CONSUMABLE_DEFS[id].emoji + ' ' + CONSUMABLE_DEFS[id].name, '#ff6666');
      return;
    }
    if (id === 'cpu') {
      const now = Date.now();
      if (now - lastCpuClick < CPU_DOUBLE_CLICK_MS) {
        if (battleFlags.cpu) {
          if (levelAlreadyCleared()) {
            if (!isDevMode()) consumables[id] = Math.max(0, (consumables[id] || 0) - 1);
            setStatus('🤖 ¡Gatomático resuelve el nivel!', '#ffd700');
            autoWinLevel();
            refreshPanel();
            return;
          } else {
            setStatus('❌ Solo funciona en niveles que ya hayas superado', '#ff6666');
            lastCpuClick = now;
            return;
          }
        }
      }
      lastCpuClick = now;
    }
    if (!isDevMode()) {
      consumables[id] = Math.max(0, (consumables[id] || 0) - 1);
      saveMeta();
    }
    if (id === 'radar')      battleFlags.radar = true;
    else if (id === 'rich')  { battleFlags.rich = true; money = currentWalletCap(); }
    else if (id === 'cpu')   { battleFlags.cpu = true; battleFlags.cpuTimer = 0; }
    else if (id === 'sabelotodo') battleFlags.sabelotodo = true;
    else if (id === 'sniper'){ battleFlags.sniper = true; battleFlags.sniperTimer = 0; }
    const d = CONSUMABLE_DEFS[id];
    if (window.toastMsg) window.toastMsg(d.emoji + ' ' + d.name + ' activado', '#ffd700');
    refreshPanel();
    refreshWalletBtn();
    refreshIncomeBtn();
    updateUI();
  }
  window.useConsumable = useConsumable;

  function toggleSpeed() {
    if (gameSpeed === 1) { gameSpeed = 2; setStatus('⚡ Velocidad x2 (gratis)', '#88ccff'); }
    else if (gameSpeed === 2) {
      if (!isDevMode() && (consumables.speed || 0) <= 0) {
        setStatus('❌ Necesitas un ⚡ Acelerador para la velocidad x3', '#ff6666');
        gameSpeed = 1; refreshPanel(); return;
      }
      if (!isDevMode()) { consumables.speed = Math.max(0, (consumables.speed || 0) - 1); saveMeta(); }
      gameSpeed = 3;
      setStatus('⚡ ¡Velocidad x3! (⚡ consumido)', '#ffd700');
    } else {
      gameSpeed = 1;
      setStatus('⏸ Velocidad normal', '#cccccc');
    }
    refreshPanel();
  }

  // --- Refresco del botón de cartera (fila del cañón) ---
  function refreshWalletBtn() {
    const b = document.getElementById('walletBtn');
    if (!b) return;
    const can = canUpgradeWallet();
    const price = getWalletUpgradePrice();
    const step = getWalletBattleStep();
    const left = WALLET_BATTLE_MAX_UPGRADES - battleFlags.walletUpgrades;
    b.disabled = !can;
    b.style.opacity = can ? '1' : '0.5';
    b.style.background = can ? 'linear-gradient(135deg,#ffd700,#aa7700)' : 'linear-gradient(135deg,#333,#222)';
    b.style.color = can ? '#221100' : '#888';
    b.innerHTML = '💼 Ampliar<br><span style="font-size:10px">+' + step + ' cap · ' + price + '💰</span><br><span style="font-size:9px;opacity:.85">' + left + '/' + WALLET_BATTLE_MAX_UPGRADES + ' restantes</span>';
  }
  window.refreshWalletBtn = refreshWalletBtn;

  // --- v78c: Refresco del botón de income (fila del cañón) ---
  function refreshIncomeBtn() {
    const b = document.getElementById('incomeBtn');
    if (!b) return;
    const can = canUpgradeIncome();
    const price = getIncomeUpgradePrice();
    const left = INCOME_BATTLE_MAX_UPGRADES - battleFlags.incomeUpgrades;
    b.disabled = !can;
    b.style.opacity = can ? '1' : '0.5';
    b.style.background = can ? 'linear-gradient(135deg,#88ff88,#228822)' : 'linear-gradient(135deg,#333,#222)';
    b.style.color = can ? '#112211' : '#888';
    b.innerHTML = '📈 Income<br><span style="font-size:10px">+5/s · ' + price + '💰</span><br><span style="font-size:9px;opacity:.85">' + left + '/' + INCOME_BATTLE_MAX_UPGRADES + ' restantes</span>';
  }
  window.refreshIncomeBtn = refreshIncomeBtn;

  function buildPanel() {
    if (panelEl) return;
    panelEl = document.createElement('div');
    panelEl.id = 'consumablesPanel';
    panelEl.style.cssText = 'display:none;width:100%;max-width:720px;margin:6px auto;padding:6px 10px;background:linear-gradient(135deg,#2a2a3a,#1a1a2a);border:2px solid #4488ff;border-radius:10px;';
    panelEl.innerHTML =
      '<div style="font-size:11px;color:#aabbcc;margin-bottom:4px;font-weight:bold">🎒 CONSUMIBLES DE PARTIDA</div>' +
      '<div id="consumablesRow" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center"></div>' +
      '<div style="font-size:10px;color:#8899aa;margin-top:4px;text-align:center">🤖 Gatomático: 1 click = auto-invoca · 2 click rápidos = auto-gana (solo niveles ya superados)</div>';
    const cp = document.getElementById('centerPanel');
    if (cp) {
      const cannonBtn = document.getElementById('cannonBtn');
      const cannonRow = cannonBtn ? cannonBtn.parentElement : null;
      if (cannonRow) cp.insertBefore(panelEl, cannonRow);
      else cp.appendChild(panelEl);
    } else document.body.appendChild(panelEl);
  }

  function refreshPanel() {
    if (!panelEl) return;
    const row = document.getElementById('consumablesRow');
    if (!row) return;
    row.innerHTML = '';
    const speedBtn = document.createElement('button');
    speedBtn.style.cssText = 'padding:6px 10px;font-size:12px;border:2px solid ' +
      (gameSpeed === 3 ? '#ffd700' : (gameSpeed === 2 ? '#88ff88' : '#4488ff')) +
      ';background:' +
      (gameSpeed === 3 ? 'linear-gradient(135deg,#ffd700,#aa7700)' :
       (gameSpeed === 2 ? 'linear-gradient(135deg,#88ff88,#228822)' :
        'linear-gradient(135deg,#334455,#1a2233)')) +
      ';color:' + (gameSpeed === 3 ? '#221100' : '#fff') +
      ';border-radius:6px;cursor:pointer;font-weight:bold;min-width:110px;';
    const speedLabel = gameSpeed === 1 ? '▶ Normal' : (gameSpeed === 2 ? '⚡ x2 (gratis)' : '⚡⚡ x3');
    speedBtn.innerHTML = speedLabel + '<br><span style="font-size:10px;opacity:.8">Tienes: ' + (isDevMode() ? '∞' : (consumables.speed || 0)) + ' ⚡</span>';
    speedBtn.onclick = toggleSpeed;
    row.appendChild(speedBtn);
    ['radar','rich','cpu','sabelotodo','sniper'].forEach(id => {
      const d = CONSUMABLE_DEFS[id];
      const n = consumables[id] || 0;
      const active =
        (id === 'radar' && battleFlags.radar) ||
        (id === 'rich' && battleFlags.rich) ||
        (id === 'cpu' && battleFlags.cpu) ||
        (id === 'sabelotodo' && battleFlags.sabelotodo) ||
        (id === 'sniper' && battleFlags.sniper);
      const b = document.createElement('button');
      b.style.cssText = 'padding:6px 10px;font-size:12px;border:2px solid ' +
        (active ? '#ffd700' : (n > 0 || isDevMode() ? '#4488ff' : '#333344')) +
        ';background:' +
        (active ? 'linear-gradient(135deg,#ffd700,#aa7700)' :
         (n > 0 || isDevMode() ? 'linear-gradient(135deg,#334455,#1a2233)' : 'linear-gradient(135deg,#222,#111)')) +
        ';color:' + (active ? '#221100' : '#ddd') +
        ';border-radius:6px;cursor:pointer;min-width:90px;opacity:' +
        (n > 0 || isDevMode() || active ? '1' : '0.45') + ';';
      b.innerHTML = d.emoji + '<br><span style="font-size:10px">' + d.name + '</span><br><span style="font-size:10px;opacity:.8">x' + (isDevMode() ? '∞' : n) + '</span>';
      b.title = d.desc;
      b.onclick = () => useConsumable(id);
      row.appendChild(b);
    });
  }

  function showPanel() { buildPanel(); if (panelEl) panelEl.style.display = 'block'; refreshPanel(); refreshWalletBtn(); refreshIncomeBtn(); }
  function hidePanel() { if (panelEl) panelEl.style.display = 'none'; }

  // Envolver update para aplicar gameSpeed (x2/x3)
  (function () {
    const orig = window.update;
    if (typeof orig !== 'function') return;
    window.update = function () {
      const speed = Math.max(1, Math.floor(gameSpeed || 1));
      if (speed <= 1) return orig.apply(this, arguments);
      let r;
      for (let i = 0; i < speed; i++) r = orig.apply(this, arguments);
      return r;
    };
  })();

  function wrap(name, after) { const orig = window[name]; if (typeof orig !== 'function') return; window[name] = function () { const r = orig.apply(this, arguments); try { after.apply(this, arguments); } catch (e) {} return r; }; }
  wrap('showGame', () => { showPanel(); });
  ['showHub','showMenu','showTitle','showCarousel','showChapters','showUpgrades','showTroops'].forEach(f => wrap(f, () => { hidePanel(); }));
  wrap('updateUI', () => { refreshWalletBtn(); refreshIncomeBtn(); });

  buildPanel();
})();