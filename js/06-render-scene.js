// ============================================================
// 06c-render-scene.js — Bases, proyectiles, partículas y escena (pixel-art)
// v56: BOSQUE DENSO de la Parte 2 con 4 hileras de árboles + sotobosque
//      continuo que tapa TODO el cielo (sin línea azul entre tierra y árboles).
// ============================================================
// Todo se dibuja en colores PLANOS y con contornos duros (sin degradados ni
// brillos suaves) para que el escalado nearest-neighbor dé un look pixel-art
// limpio. El texto se encola con pxText() y se pinta nítido en present().
// -------------------- helpers de figura --------------------
// Colores "oscurecidos" seguros ante un color no-hex.
function safeShade(col, f) { return (typeof col === 'string' && col[0] === '#') ? shadeHex(col, f) : col; }
function drawCloud(cx, cy, s) {
  s = s || 1;
  cx = Math.round(cx); cy = Math.round(cy);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(cx, cy, Math.round(38 * s), Math.round(13 * s));
  ctx.fillRect(cx + Math.round(12 * s), cy - Math.round(9 * s), Math.round(24 * s), Math.round(12 * s));
  ctx.fillRect(cx - Math.round(8 * s), cy + Math.round(4 * s), Math.round(22 * s), Math.round(9 * s));
}
// v56: árbol pixel-art con tronco marrón y copa en 3 pisos.
// `far` = filas lejanas (paleta más oscura, sin brillo de copa).
function drawTreePixel(x, y, s, far) {
  const L = '#171018';
  const trunk = far ? '#33200e' : '#4a2c12';
  const c1 = far ? '#123c18' : '#1c5f26';
  const c2 = far ? '#164a1e' : '#27772f';
  const c3 = far ? '#1a5424' : '#2f8f38';
  const R = Math.round;
  // tronco
  const tw = R(8 * s), th = R(40 * s);
  const tx = R(x) - R(tw / 2), ty = R(y) - th;
  ctx.fillStyle = trunk;
  ctx.fillRect(tx, ty, tw, th);
  ctx.strokeStyle = L; ctx.lineWidth = 2;
  ctx.strokeRect(tx, ty, tw, th);
  // copa en 3 pisos (de ancha a estrecha)
  const tiers = [
    [-22, -70, 44, 34, c1],
    [-17, -92, 34, 26, c2],
    [-11, -108, 22, 20, c3]
  ];
  for (const t of tiers) {
    const rx = R(x + t[0] * s), ry = R(y + t[1] * s), rw = R(t[2] * s), rh = R(t[3] * s);
    ctx.fillStyle = t[4];
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeRect(rx, ry, rw, rh);
  }
  // brillo sutil de copa (solo cercanos)
  if (!far) {
    ctx.fillStyle = 'rgba(160,230,160,0.16)';
    ctx.fillRect(R(x - 14 * s), R(y - 86 * s), R(10 * s), R(6 * s));
  }
}
// v56: BOSQUE DENSO de la Parte 2 — 4 hileras + sotobosque continuo.
// El sotobosque cubre desde y=118 hasta y=214 (tapando TODO el cielo entre
// el muro de copas y la hierba), y se añaden 2 hileras intermedias más.
function drawKingdomForest() {
  // 1) Fila 1: muro de copas MUY lejano (silueta continua, muy denso)
  ctx.fillStyle = '#0c260f';
  for (let x = -40; x <= 940; x += 34) {
    const h = 46 + ((x / 34) % 3) * 10;
    ctx.fillRect(x, 118 - h, 40, h + 4);
    ctx.beginPath();
    ctx.ellipse(x + 20, 118 - h, 24, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // 2) Sotobosque CONTINUO: franja oscura desde y=118 hasta y=214
  //    (tapa TODO el cielo entre el muro y la hierba)
  ctx.fillStyle = '#0e2c12';
  ctx.fillRect(0, 118, 900, 96);
  // matas del sotobosque (textura)
  ctx.fillStyle = '#123818';
  for (let x = -25; x <= 925; x += 55) {
    ctx.beginPath();
    ctx.ellipse(x, 126, 32, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // 3) Fila 2: árboles lejanos (troncos finos, copas pequeñas, color oscuro)
  for (let x = -10; x <= 920; x += 60) {
    drawTreePixel(x, 200, 0.75, true);
  }
  // 4) Fila 3: árboles medios (troncos medianos, copas medianas)
  for (let x = -15; x <= 925; x += 90) {
    drawTreePixel(x, 210, 1.0, true);
  }
  // 5) Fila 4: árboles cercanos GRANDES (troncos gruesos, copas grandes)
  for (let x = 45; x <= 905; x += 130) {
    drawTreePixel(x, 216, 1.4, false);
  }
}
// -------------------- BASES --------------------
function drawBase(x, hp, maxHp, color, isEnemy) {
  ctx.save();
  ctx.translate(x, 170);
  // sombra de contacto
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, GROUND_Y - 170, 36, 10, 0, 0, Math.PI * 2); ctx.fill();
  // muro: dos tonos planos (luz / sombra)
  ctx.fillStyle = color;
  ctx.fillRect(-30, -45, 60, 90);
  ctx.fillStyle = safeShade(color, 0.68);
  ctx.fillRect(-30, -45, 26, 90);
  // almenas
  ctx.fillStyle = safeShade(color, 0.82);
  for (let i = 0; i < 5; i++) ctx.fillRect(-30 + i * 14, -53, 10, 8);
  // contorno duro
  ctx.strokeStyle = '#171018'; ctx.lineWidth = 2;
  ctx.strokeRect(-30, -45, 60, 90);
  for (let i = 0; i < 5; i++) ctx.strokeRect(-30 + i * 14, -53, 10, 8);
  // puerta
  ctx.fillStyle = '#5a3a1e';
  ctx.fillRect(-10, 8, 20, 37);
  ctx.strokeStyle = '#2a1810'; ctx.lineWidth = 1.6; ctx.strokeRect(-10, 8, 20, 37);
  // ventanas iluminadas (planas, con parpadeo sutil)
  const flick = (frameCount >> 4) % 2 === 0 ? '#ffe066' : '#ffd23c';
  ctx.fillStyle = flick;
  ctx.fillRect(-22, -30, 6, 8);
  ctx.fillRect(16, -30, 6, 8);
  // mástil + bandera (ondulación "snap" a pixel)
  ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -53); ctx.lineTo(0, -72); ctx.stroke();
  const wave = pxSnap(Math.sin(frameCount * 0.12) * 2);
  ctx.fillStyle = isEnemy ? '#ff3b3b' : '#4d7dff';
  ctx.beginPath();
  ctx.moveTo(0, -72); ctx.lineTo(16, -68 + wave); ctx.lineTo(0, -62);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#171018'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(-2, -73, 4, 4);
  ctx.restore();
  // barra de vida
  ctx.fillStyle = '#171018';
  ctx.fillRect(x - 26, 114, 52, 7);
  ctx.fillStyle = '#3a1414';
  ctx.fillRect(x - 25, 115, 50, 5);
  ctx.fillStyle = isEnemy ? '#ff4d4d' : '#4dff88';
  ctx.fillRect(x - 25, 115, 50 * Math.max(0, hp / maxHp), 5);
}
// -------------------- PROYECTILES --------------------
function drawProjectile(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  if (p.type === 'arrow') {
    ctx.rotate(p.vx > 0 ? 0 : Math.PI);
    ctx.fillStyle = '#6e4a28';
    ctx.fillRect(-8, -1, 16, 2);
    ctx.fillStyle = '#d8d8e0';
    ctx.beginPath(); ctx.moveTo(8, -3); ctx.lineTo(12, 0); ctx.lineTo(8, 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff3b3b';
    ctx.beginPath(); ctx.moveTo(-8, -2.5); ctx.lineTo(-11, 0); ctx.lineTo(-8, 2.5); ctx.closePath(); ctx.fill();
  } else if (p.type === 'bullet') {
    ctx.fillStyle = '#ff9a2e';
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe066';
    ctx.beginPath(); ctx.arc(0, 0, 2.4, 0, Math.PI * 2); ctx.fill();
  } else if (p.type === 'snow') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#bfe3ff';
    ctx.beginPath(); ctx.arc(-2, -2, 2.4, 0, Math.PI * 2); ctx.fill();
  } else if (p.type === 'magic') {
    const pu = 1 + Math.sin(frameCount * 0.4) * 0.12;
    ctx.fillStyle = '#ff3b00';
    ctx.beginPath(); ctx.arc(0, 0, 8 * pu, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff9900';
    ctx.beginPath(); ctx.arc(0, 0, 5.5 * pu, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe066';
    ctx.beginPath(); ctx.arc(0, 0, 2.8 * pu, 0, Math.PI * 2); ctx.fill();
  } else if (p.type === 'heal') {
    ctx.fillStyle = '#00b45a';
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#43ff9c';
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#eafff4';
    ctx.fillRect(-1, -3.4, 2, 6.8);
    ctx.fillRect(-3.4, -1, 6.8, 2);
  }
  ctx.restore();
}
// -------------------- PARTÍCULAS / TEXTOS FLOTANTES --------------------
function drawParticles() {
  particles.forEach(p => {
    const alpha = p.life / p.maxLife;
    const col = p.color.replace(')', ',' + alpha + ')').replace('rgb', 'rgba');
    if (p.ring) {
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0, p.radius), 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.fillStyle = col;
      const s = Math.max(1, p.size);
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s); // chispa cuadrada (pixel)
    }
  });
  floatingTexts.forEach(t => {
    const alpha = t.life / t.maxLife;
    pxText(t.x, t.y, t.text, { font: 'bold 14px monospace', color: t.color, outline: 3, alpha: alpha });
  });
}
// -------------------- ESCENA COMPLETA --------------------
function draw() {
  // v52: la Parte 2 de la historia (Nv.16-30) usa el tema 'kingdom'
  let theme;
  if (isEvent()) theme = currentEventId;
  else if (isTest()) theme = 'test';
  else if (gameMode === 'story' && storyLevelIdx + 1 >= 16 && storyLevelIdx + 1 <= 30) theme = 'kingdom';
  else theme = 'normal';
  let skyTop, skyBot, groundTop, groundBot, grassTop, grassBot, flower, enemyBaseColor;
  if (theme === 'halloween') { skyTop='#1a0033'; skyBot='#4a1a66'; groundTop='#2a1a0a'; groundBot='#140800'; grassTop='#2a4a00'; grassBot='#12260a'; flower='#ff8a2e'; enemyBaseColor='#ff6600'; }
  else if (theme === 'alien') { skyTop='#001122'; skyBot='#06514a'; groundTop='#223322'; groundBot='#0c1a0c'; grassTop='#00e05a'; grassBot='#009933'; flower='#88ffaa'; enemyBaseColor='#00cc66'; }
  else if (theme === 'infernal') { skyTop='#220000'; skyBot='#7a2200'; groundTop='#331100'; groundBot='#180600'; grassTop='#d43a00'; grassBot='#7a1e00'; flower='#ff8a44'; enemyBaseColor='#ff3300'; }
  else if (theme === 'xmas') { skyTop='#12304f'; skyBot='#7fa6c8'; groundTop='#f2f8ff'; groundBot='#bcd8ee'; grassTop='#cc2233'; grassBot='#881122'; flower='#ffffff'; enemyBaseColor='#cc2233'; }
  else if (theme === 'test') { skyTop='#6a3aa0'; skyBot='#e6ccff'; groundTop='#8B4513'; groundBot='#4a3218'; grassTop='#32CD32'; grassBot='#228B22'; flower='#ff69b4'; enemyBaseColor='#ff4444'; }
  // v52: kingdom = cielo un pelín más profundo + césped y tierra MÁS OSCUROS
  else if (theme === 'kingdom') { skyTop='#3f8fd0'; skyBot='#b9d6ea'; groundTop='#6f3a12'; groundBot='#3a2410'; grassTop='#26a226'; grassBot='#186418'; flower='#ff69b4'; enemyBaseColor='#ff4444'; }
  else { skyTop='#4aa3e0'; skyBot='#cdeafc'; groundTop='#8B4513'; groundBot='#4a3218'; grassTop='#32CD32'; grassBot='#228B22'; flower='#ff69b4'; enemyBaseColor='#ff4444'; }
  // cielo por bandas (degradado retro)
  vBands(0, 220, skyTop, skyBot, 8);
  // ---- decoración por tema ----
  if (theme === 'halloween') {
    ctx.fillStyle = '#f7f0b0';
    ctx.beginPath(); ctx.arc(750, 60, 38, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(120,90,40,0.35)';
    ctx.beginPath(); ctx.arc(738, 52, 9, 0, Math.PI * 2); ctx.arc(762, 70, 6, 0, Math.PI * 2); ctx.fill();
    // murciélagos (pixel, aleteo snap)
    ctx.fillStyle = '#120018';
    for (let i = 0; i < 5; i++) {
      const bx = Math.round((i * 180 + frameCount * 0.5) % 900);
      const by = Math.round(40 + Math.sin(frameCount * 0.1 + i) * 20);
      const f = ((frameCount >> 3) + i) % 2;
      ctx.fillRect(bx - 10, by - (f ? 4 : 0), 8, 3);
      ctx.fillRect(bx + 2, by - (f ? 4 : 0), 8, 3);
      ctx.fillRect(bx - 2, by, 4, 4);
    }
  } else if (theme === 'alien') {
    for (let i = 0; i < 40; i++) {
      const x = (i * 137) % 900, y = (i * 61) % 180;
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(frameCount * 0.05 + i));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
  } else if (theme === 'infernal') {
    ctx.fillStyle = '#ff8844';
    for (let i = 0; i < 15; i++) {
      const x = (i * 173 + frameCount * 0.6) % 900;
      const y = 320 - ((frameCount * 1.2 + i * 47) % 320);
      ctx.globalAlpha = 0.6;
      ctx.fillRect(x, y, 3, 3);
    }
    ctx.globalAlpha = 1;
  } else if (theme === 'xmas') {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 30; i++) {
      const x = (i * 31 + frameCount * 0.3) % 900;
      const y = (i * 17 + frameCount * 0.5) % 220;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
    // montañitas
    ctx.fillStyle = '#dfeefc';
    for (let i = 0; i < 4; i++) {
      const mx = 60 + i * 240;
      ctx.beginPath(); ctx.moveTo(mx - 60, 220); ctx.lineTo(mx, 150); ctx.lineTo(mx + 60, 220); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) { const mx = 60 + i * 240; ctx.beginPath(); ctx.moveTo(mx - 20, 178); ctx.lineTo(mx, 150); ctx.lineTo(mx + 20, 178); ctx.closePath(); ctx.fill(); }
  } else if (theme === 'normal' || theme === 'kingdom') {
    const cloudOffset = (frameCount * 0.15) % 1000;
    for (let i = 0; i < 3; i++) {
      const cx = ((i * 350 - cloudOffset) % 1000);
      drawCloud(cx, 40 + i * 18, 1);
    }
  } else if (theme === 'test') {
    const cloudOffset = (frameCount * 0.15) % 1000;
    drawCloud(((0 - cloudOffset) % 1000) + 200, 50, 1);
  }
  // ---- suelo ----
  vBands(220, 320, groundTop, groundBot, 6);
  ctx.fillStyle = grassTop;
  ctx.fillRect(0, 214, 900, 9);
  ctx.fillStyle = grassBot;
  ctx.fillRect(0, 222, 900, 4);
  // matitas/flores
  ctx.fillStyle = flower;
  for (let i = 0; i < 8; i++) {
    const x = (i * 115 + 30) % 900;
    ctx.fillRect(x - 1, 216, 3, 3);
  }
  // v56: bosque denso de la Parte 2 (4 hileras + sotobosque continuo)
  if (theme === 'kingdom') drawKingdomForest();
  drawBase(50, baseHP, 1500, '#4488ff', false);
  drawBase(ENEMY_BASE_X, enemyBaseHP, enemyBaseMaxHP, enemyBaseColor, true);
  // ---- rango del cañón ----
  const cannonRange = getCannonRange();
  const rangeRight = Math.min(900, MY_BASE_X + cannonRange);
  const pulseAlpha = 0.10 + Math.sin(frameCount * 0.08) * 0.04;
  ctx.fillStyle = 'rgba(255, 30, 30, ' + pulseAlpha + ')';
  ctx.fillRect(MY_BASE_X, 0, rangeRight - MY_BASE_X, 320);
  ctx.strokeStyle = 'rgba(255, 50, 50, 0.9)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 4]);
  ctx.beginPath(); ctx.moveTo(rangeRight, 0); ctx.lineTo(rangeRight, 320); ctx.stroke();
  ctx.setLineDash([]);
  // cañón (formas planas)
  ctx.fillStyle = '#2a2f36';
  ctx.fillRect(MY_BASE_X - 9, 99, 18, 13);
  ctx.fillStyle = '#4a525c';
  ctx.fillRect(MY_BASE_X - 5, 91, 24, 8);
  ctx.fillStyle = '#1c2026';
  ctx.beginPath(); ctx.arc(MY_BASE_X, 106, 6, 0, Math.PI * 2); ctx.fill();
  pxText((MY_BASE_X + rangeRight) / 2, 25, '💣 Rango: ' + cannonRange + 'px', { font: 'bold 12px monospace', color: '#ffffff', outline: 3 });
  pxText(rangeRight, 40, '▼', { font: 'bold 14px monospace', color: '#ff7777', outline: 3 });
  // ---- entidades (v51: orden por TAMAÑO, grandes detrás) ----
  const drawList = [];
  for (let i = 0; i < cats.length; i++)    drawList.push({ s: cats[i].scale || 1,    f: 0, i: i, o: cats[i] });
  for (let i = 0; i < enemies.length; i++) drawList.push({ s: enemies[i].scale || 1, f: 1, i: i, o: enemies[i] });
  drawList.sort((a, b) => (b.s - a.s) || (a.f - b.f) || (a.i - b.i));
  for (let k = 0; k < drawList.length; k++) {
    const d = drawList[k];
    if (d.f === 0) drawCat(d.o); else drawEnemy(d.o);
  }
  for (let i = 0; i < projectiles.length; i++) drawProjectile(projectiles[i]);
  drawParticles();
  // ---- avisos a pantalla completa ----
  if (bossWarningTimer > 0) {
    ctx.fillStyle = 'rgba(255,0,0,0.45)';
    ctx.fillRect(0, 0, 900, 320);
    pxText(450, 160, ' ¡' + currentBossName() + '! 👑', { font: 'bold 38px monospace', color: '#ffffff', outline: 6 });
    pxText(450, 202, '¡Prepárate! Aparece en ' + Math.ceil(bossWarningTimer / 60) + 's', { font: '20px monospace', color: '#ffffff', outline: 4 });
  }
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 900, 320);
    pxText(450, 160, 'DERROTA 💀', { font: 'bold 46px monospace', color: '#ffffff', outline: 6 });
    pxText(450, 204, 'Oleada ' + wave + ' · Usa  Menú o 🔄 Reiniciar', { font: '20px monospace', color: '#ffffff', outline: 4 });
  }
  // Volcado pixel-art a pantalla + textos nítidos.
  present();
}