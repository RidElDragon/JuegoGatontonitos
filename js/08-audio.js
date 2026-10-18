// ============================================================
// 08-audio.js — v41: SONIDO 100% PROCEDURAL (Web Audio API)
// Sin archivos externos: música y SFX sintetizados en vivo.
//  · Música por contexto: menú, batalla y un tema por evento.
//  · SFX: clicks, spawns, disparos, cañón, monedas, jefes, fin,
//    golpes melee ('melee') y impactos recibidos ('cat_hurt').
//  · Botón ⚙ Opciones (inyectado) con volúmenes y muteos,
//    persistido en localStorage ('catBattleAudio').
//  · window.sfx expuesto para que 05-combat.js dispare SFX.
// ============================================================

const AudioSys = (function () {
  // ---------------- Estado ----------------
  let ctx = null, master = null, musicGain = null, sfxGain = null, noiseBuf = null;
  let unlocked = false;
  let desired = 'menu';
  let sched = null;
  const settings = { music: 0.7, sfx: 0.8, musicMuted: false, sfxMuted: false };
  try {
    const s = JSON.parse(localStorage.getItem('catBattleAudio'));
    if (s && typeof s === 'object') Object.assign(settings, s);
  } catch (e) {}
  function saveSettings() { try { localStorage.setItem('catBattleAudio', JSON.stringify(settings)); } catch (e) {} }

  // ---------------- Núcleo ----------------
  function ensure() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    applyVolumes();
    return true;
  }
  function applyVolumes() {
    if (!ctx) return;
    musicGain.gain.value = settings.musicMuted ? 0 : settings.music * 0.5;
    sfxGain.gain.value = settings.sfxMuted ? 0 : settings.sfx;
  }
  function unlock() {
    if (!ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (!unlocked) { unlocked = true; setMusic(desired, true); }
  }

  // ---------------- Temas musicales (secuencias) ----------------
  const THEMES = {
    menu: { bpm: 92, steps: 32, leadWave: 'triangle', bassWave: 'sine',
      lead: [[0,72,3],[4,76,3],[8,79,3],[12,76,3],[16,74,3],[20,77,3],[24,81,3],[28,76,3]],
      bass: [[0,48,8],[8,45,8],[16,43,8],[24,41,8]], kick: [], hat: [8,24] },
    battle: { bpm: 132, steps: 32, leadWave: 'square', bassWave: 'sawtooth',
      lead: [[0,69,1],[2,69,1],[4,72,1],[6,69,1],[8,67,1],[10,67,1],[12,71,2],[16,69,1],[18,69,1],[20,72,1],[22,69,1],[24,74,2],[28,71,2]],
      bass: [[0,45,2],[4,45,2],[8,43,2],[12,43,2],[16,45,2],[20,45,2],[24,41,2],[28,43,2]],
      kick: [0,8,16,24], hat: [2,6,10,14,18,22,26,30] },
    halloween: { bpm: 100, steps: 32, leadWave: 'sine', bassWave: 'triangle',
      lead: [[0,69,4],[6,70,4],[12,69,4],[18,65,4],[24,68,6]],
      bass: [[0,45,8],[8,45,8],[16,46,8],[24,44,8]], kick: [0,16], hat: [12,28] },
    alien: { bpm: 128, steps: 32, leadWave: 'square', bassWave: 'square',
      lead: [[0,81,1],[2,84,1],[4,88,1],[6,84,1],[8,81,1],[10,84,1],[12,88,1],[14,91,1],[16,81,1],[18,84,1],[20,88,1],[22,84,1],[24,79,1],[26,83,1],[28,86,1],[30,83,1]],
      bass: [[0,45,4],[8,41,4],[16,48,4],[24,43,4]], kick: [0,8,16,24], hat: [4,12,20,28] },
    infernal: { bpm: 150, steps: 32, leadWave: 'sawtooth', bassWave: 'sawtooth',
      lead: [[0,57,2],[3,57,1],[6,60,2],[9,57,1],[12,55,3],[16,57,2],[19,57,1],[22,63,2],[26,62,2]],
      bass: [[0,33,4],[8,33,4],[16,31,4],[24,35,4]],
      kick: [0,4,8,12,16,20,24,28], hat: [2,6,10,14,18,22,26,30] },
    xmas: { bpm: 112, steps: 32, leadWave: 'triangle', bassWave: 'sine',
      lead: [[0,79,2],[4,76,2],[8,79,2],[12,84,4],[16,83,2],[20,79,2],[24,81,2],[28,76,4]],
      bass: [[0,48,4],[8,43,4],[16,45,4],[24,41,4]], kick: [0,16], hat: [8,24] },
  };
  function stepDur(th) { return 60 / th.bpm / 4; }
  function setMusic(theme, force) {
    desired = THEMES[theme] ? theme : 'battle';
    if (!unlocked || !ctx) return;
    if (sched && sched.theme === desired && !force) return;
    stopMusic();
    sched = { theme: desired, step: 0, next: ctx.currentTime + 0.06, timer: setInterval(tick, 25) };
  }
  function stopMusic() { if (sched) { clearInterval(sched.timer); sched = null; } }
  function tick() {
    if (!sched || !ctx) return;
    const th = THEMES[sched.theme] || THEMES.battle;
    while (sched.next < ctx.currentTime + 0.15) {
      playStep(th, sched.step, sched.next);
      sched.next += stepDur(th);
      sched.step = (sched.step + 1) % th.steps;
    }
  }
  function playStep(th, step, t) {
    if (th.kick && th.kick.includes(step)) perc(t, 'kick');
    if (th.hat && th.hat.includes(step)) perc(t, 'hat');
    for (const n of th.lead) if (n[0] === step) tone(t, n[1], n[2] * stepDur(th), th.leadWave, 0.22);
    for (const n of th.bass) if (n[0] === step) tone(t, n[1], n[2] * stepDur(th) * 0.9, th.bassWave, 0.18);
  }
  function tone(t, midi, dur, wave, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = wave; o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + dur + 0.05);
  }
  function perc(t, kind) {
    if (kind === 'kick') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + 0.16);
    } else {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      s.connect(f); f.connect(g); g.connect(musicGain); s.start(t); s.stop(t + 0.05);
    }
  }

  // ---------------- SFX ----------------
  const lastSfx = {};
  function osc(t, f, d, w, v, f2) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = w; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + d + 0.02);
  }
  function noiseSfx(t, d, v, freq) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq || 2000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t); s.stop(t + d + 0.02);
  }
  function sfx(name) {
    if (!ctx || settings.sfxMuted || settings.sfx <= 0) return;
    const now = performance.now();
    if (lastSfx[name] && now - lastSfx[name] < 60) return;
    lastSfx[name] = now;
    const t = ctx.currentTime;
    switch (name) {
      case 'click':        osc(t, 900, 0.04, 'square', 0.12); break;
      case 'spawn':        osc(t, 220, 0.18, 'triangle', 0.3, 660); break;
      case 'shoot_arrow':  osc(t, 1500, 0.05, 'square', 0.1); noiseSfx(t, 0.04, 0.08, 5000); break;
      case 'shoot_bullet': osc(t, 1400, 0.07, 'square', 0.14, 300); break;
      case 'shoot_magic':  osc(t, 700, 0.22, 'sawtooth', 0.18, 180); noiseSfx(t, 0.15, 0.1, 1200); break;
      case 'shoot_snow':   osc(t, 1000, 0.06, 'sine', 0.16); noiseSfx(t, 0.06, 0.06, 7000); break;
      case 'heal':         osc(t, 660, 0.09, 'sine', 0.2); osc(t + 0.09, 990, 0.12, 'sine', 0.2); break;
      case 'cannon':       noiseSfx(t, 0.35, 0.5, 800); osc(t, 180, 0.4, 'sine', 0.6, 40); break;
      case 'coin':         osc(t, 1300, 0.05, 'square', 0.13); osc(t + 0.06, 1800, 0.07, 'square', 0.13); break;
      case 'upgrade':      [523,659,784].forEach((f,i)=>osc(t+i*0.07, f, 0.09, 'triangle', 0.2)); break;
      case 'victory':      [523,659,784,1046].forEach((f,i)=>osc(t+i*0.12, f, 0.18, 'square', 0.16)); break;
      case 'defeat':       [392,330,262].forEach((f,i)=>osc(t+i*0.18, f, 0.25, 'sawtooth', 0.14)); break;
      case 'boss':         osc(t, 90, 0.6, 'sawtooth', 0.5, 45); osc(t + 0.1, 466, 0.4, 'square', 0.18); break;
      case 'hurt':         noiseSfx(t, 0.08, 0.2, 900); break;
      case 'explode':      noiseSfx(t, 0.25, 0.35, 600); osc(t, 300, 0.3, 'sine', 0.4, 50); break;
      // v41: golpe cuerpo a cuerpo (tajo + golpe seco)
      case 'melee':        noiseSfx(t, 0.06, 0.22, 3200); osc(t, 170, 0.09, 'triangle', 0.28, 80); break;
      // v41: una unidad tuya recibe un impacto
      case 'cat_hurt':     osc(t, 520, 0.12, 'square', 0.18, 240); noiseSfx(t, 0.05, 0.12, 1500); break;
    }
  }
  // v41: puente global para que 05-combat.js pueda disparar SFX
  window.sfx = sfx;

  // ---------------- Enganches a funciones existentes ----------------
  function wrap(name, after) {
    const orig = window[name];
    if (typeof orig !== 'function') return;
    window[name] = function () {
      const r = orig.apply(this, arguments);
      try { after.apply(this, arguments); } catch (e) {}
      return r;
    };
  }
  wrap('showMenu',        () => setMusic('menu'));
  wrap('startInfinite',   () => setMusic('battle'));
  wrap('continueInfinite',() => setMusic('battle'));
  wrap('startStory',      () => setMusic('battle'));
  wrap('startTest',       () => setMusic('battle'));
  wrap('startEvent',      () => setMusic(currentEventId || 'battle'));
  wrap('spawnCat',        () => sfx('spawn'));
  wrap('fireCannon',      () => sfx('cannon'));
['buyUnitUpgrade','buyCannonDmg','buyCannonRange','buyCannonCd','buyIncome','buyCoinBonus'].forEach(f => wrap(f, () => sfx('upgrade')));
  wrap('showResult', (v) => sfx(v ? 'victory' : 'defeat'));
  wrap('addFloatingText', (x, y, txt) => {
    if (typeof txt !== 'string') return;
    if (txt.includes('💰')) sfx('coin');
    else if (txt.includes('DERROTADO')) sfx('explode');
    else if (txt.includes('ha aparecido')) sfx('boss');
  });

  // Disparos: detecta proyectiles nuevos sin tocar el combate
  const seenProj = new WeakSet();
  let lastBase = null, lastHurt = 0;
  function poll() {
    requestAnimationFrame(poll);
    if (!ctx || !unlocked || typeof playing === 'undefined' || !playing) return;
    if (typeof projectiles !== 'undefined') {
      for (const p of projectiles) {
        if (!seenProj.has(p)) {
          seenProj.add(p);
          if (p.isHeal) sfx('heal');
          else if (p.owner === 'cat') sfx(p.type === 'arrow' ? 'shoot_arrow' : p.type === 'bullet' ? 'shoot_bullet' : p.type === 'snow' ? 'shoot_snow' : 'shoot_magic');
          else sfx('shoot_magic');
        }
      }
    }
    const now = performance.now();
    if (lastBase !== null && baseHP < lastBase && now - lastHurt > 350) { sfx('hurt'); lastHurt = now; }
    lastBase = baseHP;
  }

  // Clicks de botones + desbloqueo de audio con el primer gesto
  document.addEventListener('click', e => {
    if (e.target && e.target.closest && e.target.closest('button')) sfx('click');
  }, true);
  document.addEventListener('pointerdown', () => unlock(), true);
  document.addEventListener('keydown', () => unlock(), true);

  // ---------------- Opciones de sonido ----------------
  let overlay = null;
  function buildOptions() {
    overlay = document.createElement('div');
    overlay.id = 'optionsOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);display:none;align-items:center;justify-content:center;z-index:120';
    overlay.innerHTML = `
      <div style="background:#222233;padding:24px 32px;border-radius:12px;border:3px solid #4488ff;min-width:320px;max-width:90vw">
        <h2 style="margin:0 0 14px;text-align:center">⚙ OPCIONES DE SONIDO</h2>
        <label style="display:block;margin:10px 0;font-size:13px">🎵 Volumen de música: <b id="optMusicVal"></b>
          <input id="optMusic" type="range" min="0" max="100" style="width:100%">
        </label>
        <label style="display:block;margin:10px 0;font-size:13px">🔊 Volumen de efectos: <b id="optSfxVal"></b>
          <input id="optSfx" type="range" min="0" max="100" style="width:100%">
        </label>
        <div style="display:flex;gap:8px;margin:14px 0">
          <button id="optMuteMusic" class="save-btn" style="flex:1;font-size:12px;padding:8px">🎵 Mutear música</button>
          <button id="optMuteSfx" class="save-btn" style="flex:1;font-size:12px;padding:8px">🔊 Mutear SFX</button>
        </div>
        <div style="display:flex;gap:8px">
          <button id="optTest" class="save-btn" style="flex:1;font-size:12px;padding:8px">🎧 Probar</button>
          <button id="optClose" class="save-btn" style="flex:1;font-size:12px;padding:8px;background:linear-gradient(135deg,#88ff88,#228822)">✅ Cerrar</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const mSlider = overlay.querySelector('#optMusic');
    const sSlider = overlay.querySelector('#optSfx');
    mSlider.addEventListener('input', () => { settings.music = mSlider.value / 100; applyVolumes(); saveSettings(); syncOptions(); });
    sSlider.addEventListener('input', () => { settings.sfx = sSlider.value / 100; applyVolumes(); saveSettings(); syncOptions(); });
    overlay.querySelector('#optMuteMusic').onclick = () => { settings.musicMuted = !settings.musicMuted; applyVolumes(); saveSettings(); syncOptions(); };
    overlay.querySelector('#optMuteSfx').onclick = () => { settings.sfxMuted = !settings.sfxMuted; applyVolumes(); saveSettings(); syncOptions(); };
    overlay.querySelector('#optTest').onclick = () => { unlock(); sfx('coin'); setTimeout(() => sfx('upgrade'), 150); };
    overlay.querySelector('#optClose').onclick = () => { overlay.style.display = 'none'; };
  }
  function syncOptions() {
    if (!overlay) return;
    overlay.querySelector('#optMusic').value = Math.round(settings.music * 100);
    overlay.querySelector('#optSfx').value = Math.round(settings.sfx * 100);
    overlay.querySelector('#optMusicVal').textContent = settings.musicMuted ? 'MUTE' : Math.round(settings.music * 100) + '%';
    overlay.querySelector('#optSfxVal').textContent = settings.sfxMuted ? 'MUTE' : Math.round(settings.sfx * 100) + '%';
    overlay.querySelector('#optMuteMusic').style.opacity = settings.musicMuted ? '0.6' : '1';
    overlay.querySelector('#optMuteMusic').textContent = (settings.musicMuted ? '🔇' : '🎵') + ' Mutear música';
    overlay.querySelector('#optMuteSfx').style.opacity = settings.sfxMuted ? '0.6' : '1';
    overlay.querySelector('#optMuteSfx').textContent = (settings.sfxMuted ? '🔇' : '🔊') + ' Mutear SFX';
  }
  function openOptions() {
    unlock();
    if (!overlay) buildOptions();
    syncOptions();
    overlay.style.display = 'flex';
  }
  function injectButtons() {
    const menu = document.getElementById('menuScreen');
    if (menu) {
      const b = document.createElement('button');
      b.className = 'menu-btn';
      b.style.background = 'linear-gradient(135deg, #556677, #223344)';
      b.textContent = '⚙ Opciones de sonido';
      b.onclick = openOptions;
      const resetBtn = menu.querySelector('.reset-all');
      if (resetBtn) menu.insertBefore(b, resetBtn); else menu.appendChild(b);
    }
    const rows = document.querySelectorAll('#centerPanel .row');
    if (rows.length) {
      const b = document.createElement('button');
      b.className = 'save-btn';
      b.textContent = '⚙ Opciones';
      b.onclick = openOptions;
      rows[rows.length - 1].appendChild(b);
    }
  }

  // Arranque
  injectButtons();
  poll();

  return { unlock, setMusic, sfx, openOptions, settings };
})();