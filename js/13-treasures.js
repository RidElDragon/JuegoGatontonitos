// ============================================================
// 13-treasures.js — v77: PANTALLA DE 💎 TESOROS
// · Muestra los 6 combos + 3 tesoros sueltos de jefes.
// · Cada tesoro: ? si no lo tienes, o el emoji de su calidad.
// · Cada combo: barra de progreso con calidad del peor tesoro.
// · Bonuses activos resaltados en dorado.
// ============================================================
(function () {
  let tScreen = null;

  function buildUI() {
    tScreen = document.createElement('div');
    tScreen.className = 'screen';
    tScreen.style.display = 'none';
    tScreen.style.padding = '14px';
    tScreen.innerHTML =
      '<h2>💎 TESOROS</h2>' +
      '<div class="menu-info" id="tresInfo"></div>' +
      '<div id="tresBody" style="width:100%;max-width:1000px"></div>' +
      '<div class="best-foot"></div>';
    const foot = tScreen.querySelector('.best-foot');
    const b = document.createElement('button');
    b.className = 'back'; b.textContent = '⬅ Volver a la Biblioteca';
    b.onclick = function () { if (window.showBookMenu) window.showBookMenu(); else showMenu(); };
    foot.appendChild(b);
    document.body.appendChild(tScreen);
  }

  function qualityEmoji(q) {
    if (q === undefined || q === null) return '❓';
    return TREASURE_QUALITY_NAMES[q];
  }
  function qualityColor(q) {
    if (q === undefined || q === null) return '#666';
    return TREASURE_QUALITY_COLORS[q];
  }

  function render() {
    const info = document.getElementById('tresInfo');
    const body = document.getElementById('tresBody');
    if (!info || !body) return;

    const totalTreasures = TREASURE_DEFS.length;
    const obtained = Object.keys(treasuresObtained).length;
    const completedSets = TREASURE_SETS.filter(s => isSetComplete(s.id)).length;

    info.innerHTML =
      'Tesoros obtenidos: <b>' + obtained + '/' + totalTreasures + '</b> · ' +
      'Combos completos: <b>' + completedSets + '/' + TREASURE_SETS.length + '</b> · ' +
      '<span style="color:#aabbcc;font-size:11px">La calidad de un combo depende del tesoro MÁS débil del set. ¡Rejugar niveles mejora la calidad!</span>';

    body.innerHTML = '';

    for (let zone = 1; zone <= 3; zone++) {
      const zoneHeader = document.createElement('div');
      zoneHeader.className = 'grid-header';
      zoneHeader.textContent = '🗺️ Zona ' + zone + ' — ' + (STORY_PART_NAMES[zone - 1] || '');
      body.appendChild(zoneHeader);

      const zoneSets = TREASURE_SETS.filter(s => s.zone === zone);
      const zoneBosses = TREASURE_DEFS.filter(t => t.zone === zone && t.set === null);

      zoneSets.forEach(set => {
        const card = document.createElement('div');
        card.className = 'upg-card';
        card.style.textAlign = 'left';
        card.style.minWidth = '300px';

        const q = getSetQuality(set.id);
        const complete = q >= 0;
        const borderColor = complete ? TREASURE_QUALITY_COLORS[q] : '#556677';
        card.style.border = '3px solid ' + borderColor;
        if (complete) card.style.boxShadow = '0 0 12px ' + borderColor;

        let html = '<div class="best-name">' + set.name + '</div>';
        html += '<div class="sb-info" style="color:#aabbcc;font-size:11px">' + set.desc + '</div>';
        if (complete) {
          const mult = TREASURE_QUALITY_MULT[q];
          const ef = set.effect;
          let valueTxt = '';
          if (ef.kind === 'unitHpMult') valueTxt = '+' + Math.round(ef.base * mult * 100) + '% HP';
          else if (ef.kind === 'unitDmgMult') valueTxt = '+' + Math.round(ef.base * mult * 100) + '% DMG';
          else if (ef.kind === 'allDmgMult') valueTxt = '+' + Math.round(ef.base * mult * 100) + '% DMG a TODAS';
          else if (ef.kind === 'unitSpeedMult') valueTxt = '+' + Math.round(ef.base * mult * 100) + '% velocidad';
          else if (ef.kind === 'baseHpFlat') valueTxt = '+' + Math.floor(ef.base * mult) + ' HP máx';
          else if (ef.kind === 'unitAoeMult') valueTxt = '+' + Math.round(ef.base * mult * 100) + '% AOE';
          html += '<div class="sb-info" style="color:#ffd700;font-weight:bold;margin-top:4px">✨ ACTIVO: ' + valueTxt + '</div>';
        } else {
          const obtainedCount = set.treasureIds.filter(id => treasuresObtained[id] !== undefined).length;
          html += '<div class="sb-info" style="margin-top:4px">Progreso: ' + obtainedCount + '/7 tesoros</div>';
        }

        html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:8px">';
        set.treasureIds.forEach(tid => {
          const t = TREASURE_DEFS.find(x => x.id === tid);
          const tq = treasuresObtained[tid];
          const emoji = qualityEmoji(tq);
          const color = qualityColor(tq);
          html += '<div title="' + (t ? t.name : tid) + '" style="background:rgba(0,0,0,0.3);border:1px solid #445566;border-radius:4px;padding:4px 2px;text-align:center;font-size:11px">';
          html += '<div style="font-size:18px;color:' + color + '">' + emoji + '</div>';
          html += '<div style="font-size:9px;opacity:0.8">' + (t ? t.name.substring(0, 8) : '') + '</div>';
          html += '</div>';
        });
        html += '</div>';

        card.innerHTML = html;
        body.appendChild(card);
      });

      zoneBosses.forEach(t => {
        const card = document.createElement('div');
        card.className = 'upg-card';
        card.style.textAlign = 'left';
        card.style.minWidth = '300px';
        const tq = treasuresObtained[t.id];
        const obtained = tq !== undefined;
        const emoji = qualityEmoji(tq);
        const color = qualityColor(tq);
        if (obtained) {
          card.style.border = '3px solid ' + color;
          card.style.boxShadow = '0 0 12px ' + color;
        }
        card.innerHTML =
          '<div class="best-name">👑 Tesoro de Jefe: ' + t.name + '</div>' +
          '<div style="font-size:22px;color:' + color + '">' + emoji + '</div>' +
          (obtained
            ? '<div class="sb-info" style="color:#ffd700">' + TREASURE_BOSS_EFFECTS[t.id].desc + '</div>'
            : '<div class="sb-info locked">Completa el nivel ' + t.level + ' para obtenerlo</div>');
        body.appendChild(card);
      });
    }

    const footer = document.createElement('div');
    footer.className = 'upg-card maxed';
    footer.style.textAlign = 'left';
    footer.style.minWidth = '300px';
    footer.innerHTML =
      '<div class="best-name">ℹ️ Calidades de tesoros</div>' +
      '<div class="sb-info">🥉 Bronce · 🥈 Plata · 🥇 Oro</div>' +
      '<div class="sb-info">Al ganar un tesoro por primera vez: 55% bronce / 32% plata / 13% oro.</div>' +
      '<div class="sb-info">Rejugar un nivel puede mejorar la calidad del tesoro si tienes suerte.</div>' +
      '<div class="sb-info" style="color:#ffd700">El bonus del combo se calcula con la calidad MÁS BAJA del set, así que ¡mejora los 7!</div>';
    body.appendChild(footer);
  }

  function showTreasuresScreen() {
    leaveTestIfNeeded();
    hideScreens();
    if (tScreen) tScreen.style.display = 'flex';
    screen = 'treasures'; playing = false;
    render();
  }
  window.showTreasuresScreen = showTreasuresScreen;

  function wrap(name, after) {
    const orig = window[name];
    if (typeof orig !== 'function') return;
    window[name] = function () { const r = orig.apply(this, arguments); try { after.apply(this, arguments); } catch (e) {} return r; };
  }
  wrap('hideScreens', () => { if (tScreen) tScreen.style.display = 'none'; });

  buildUI();
})();