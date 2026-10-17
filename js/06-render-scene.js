// ============================================================
// 06-render-scene.js — Escena: fondo, temas, bases, proyectiles,
// partículas y draw() completo (v53: separado de los gatos).
// Incluye: tema 'kingdom' (Parte 2, Nv.16-30) con árboles grandes
// y suelo más oscuro + orden de dibujo por TAMAÑO (v51).
// ============================================================

// v52: árbol de fondo redondeado (tronco + 3 capas de copa).
// `far` = fila lejana (más pequeña y oscura, da profundidad).
function drawTree(x, y, s, far) {
  const trunk = far ? '#3a2210' : '#5a3a1e';
  const leaf1 = far ? '#164a1e' : '#1c5f26';
  const leaf2 = far ? '#1c5f26' : '#27772f';
  const leaf3 = far ? '#226b2a' : '#2f8f38';
  ctx.fillStyle = trunk;
  ctx.fillRect(x - 3*s, y - 22*s, 6*s, 22*s);
  ctx.fillStyle = leaf1;
  ctx.beginPath(); ctx.ellipse(x, y - 26*s, 16*s, 12*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = leaf2;
  ctx.beginPath(); ctx.ellipse(x - 6*s, y - 34*s, 11*s, 9*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 7*s, y - 32*s, 10*s, 8*s, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = leaf3;
  ctx.beginPath(); ctx.ellipse(x, y - 40*s, 8*s, 7*s, 0, 0, Math.PI*2); ctx.fill();
}

// -------------------- BASES --------------------
function drawBase(x, hp, maxHp, color, isEnemy) {
  ctx.save();
  ctx.translate(x, 170);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(0, GROUND_Y - 170, 35, 10, 0, 0, Math.PI*2);
  ctx.fill();
  const grad = ctx.createLinearGradient(0, -45, 0, 45);
  grad.addColorStop(0, color);
  grad.addColorStop(0.5, isEnemy ? '#aa0000' : '#0000aa');
  grad.addColorStop(1, isEnemy ? '#660000' : '#000066');
  ctx.fillStyle = grad;
  ctx.fillRect(-30, -45, 60, 90);
  ctx.fillStyle = isEnemy ? '#880000' : '#000088';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(-30 + i*14, -53, 10, 8);
  }
  ctx.fillStyle = '#654321';
  ctx.fillRect(-10, 10, 20, 35);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-10, 10, 20, 35);
  ctx.beginPath();
  ctx.arc(0, 10, 10, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -53); ctx.lineTo(0, -70);
  ctx.stroke();
  const flagWave = Math.sin(frameCount * 0.1) * 3;
  const flagGrad = ctx.createLinearGradient(0, -70, 15, -65);
  flagGrad.addColorStop(0, isEnemy ? '#ff0000' : '#0000ff');
  flagGrad.addColorStop(1, isEnemy ? '#aa0000' : '#0000aa');
  ctx.fillStyle = flagGrad;
  ctx.beginPath();
  ctx.moveTo(0, -70); ctx.lineTo(15 + flagWave, -66); ctx.lineTo(0, -62);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffff00';
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#ffff00';
  ctx.fillRect(-8, -25, 6, 8);
  ctx.fillRect(2, -25, 6, 8);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(-8, -25, 6, 8);
  ctx.strokeRect(2, -25, 6, 8);
  ctx.restore();
  ctx.fillStyle = '#000';
  ctx.fillRect(x-25, 115, 50, 5);
  ctx.fillStyle = isEnemy ? '#f00' : '#0f0';
  ctx.fillRect(x-25, 115, 50*(hp/maxHp), 5);
}

// -------------------- PROYECTILES --------------------
function drawProjectile(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  if (p.type === 'arrow') {
    ctx.rotate(p.vx > 0 ? 0 : Math.PI);
    ctx.fillStyle = '#654321';
    ctx.fillRect(-8, -1, 16, 2);
    ctx.fillStyle = '#ccc';
    ctx.beginPath(); ctx.moveTo(8, -3); ctx.lineTo(12, 0); ctx.lineTo(8, 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff0000';
    ctx.beginPath(); ctx.moveTo(-8, -2.5); ctx.lineTo(-10, 0); ctx.lineTo(-8, 2.5); ctx.closePath(); ctx.fill();
  } else if (p.type === 'bullet') {
    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = 6; ctx.shadowColor = '#ffd700';
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  } else if (p.type === 'snow') {
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8; ctx.shadowColor = '#cfeeff';
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(180,220,255,0.8)';
    ctx.beginPath(); ctx.arc(-2, -2, 2, 0, Math.PI*2); ctx.fill();
  } else if (p.type === 'magic') {
    const fireGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 8);
    fireGrad.addColorStop(0, '#ffffff');
    fireGrad.addColorStop(0.3, '#ffcc00');
    fireGrad.addColorStop(0.7, '#ff6600');
    fireGrad.addColorStop(1, '#ff0000');
    ctx.fillStyle = fireGrad;
    ctx.shadowBlur = 15; ctx.shadowColor = '#ff6600';
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  } else if (p.type === 'heal') {
    const healGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 6);
    healGrad.addColorStop(0, '#ffffff');
    healGrad.addColorStop(0.5, '#00ff88');
    healGrad.addColorStop(1, '#00aa55');
    ctx.fillStyle = healGrad;
    ctx.shadowBlur = 12; ctx.shadowColor = '#00ff88';
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

// -------------------- PARTÍCULAS / TEXTOS --------------------
function drawParticles() {
  particles.forEach(p => {
    const alpha = p.life / p.maxLife;
    if (p.ring) {
      ctx.strokeStyle = p.color.replace(')', `,${alpha})`).replace('rgb', 'rgba');
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.stroke();
    } else {
      ctx.fillStyle = p.color.replace(')', `,${alpha})`).replace('rgb', 'rgba');
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    }
  });
  floatingTexts.forEach(t => {
    const alpha = t.life / t.maxLife;
    ctx.fillStyle = t.color;
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
    ctx.globalAlpha = 1;
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
  if (theme === 'halloween') { skyTop='#1a0033'; skyBot='#330066'; groundTop='#2a1a0a'; groundBot='#1a0a00'; grassTop='#1a3300'; grassBot='#0a1a00'; flower='#ff6600'; enemyBaseColor='#ff6600'; }
  else if (theme === 'alien') { skyTop='#001122'; skyBot='#003322'; groundTop='#223322'; groundBot='#112211'; grassTop='#00ff66'; grassBot='#009933'; flower='#88ffaa'; enemyBaseColor='#00cc66'; }
  else if (theme === 'infernal') { skyTop='#220000'; skyBot='#551100'; groundTop='#331100'; groundBot='#1a0800'; grassTop='#cc3300'; grassBot='#882200'; flower='#ff6644'; enemyBaseColor='#ff3300'; }
  else if (theme === 'xmas') { skyTop='#1a3a5c'; skyBot='#4a6a8c'; groundTop='#ffffff'; groundBot='#ddeeff'; grassTop='#cc2233'; grassBot='#881122'; flower='#ffffff'; enemyBaseColor='#cc2233'; }
  else if (theme === 'test') { skyTop='#9966cc'; skyBot='#e0ccff'; groundTop='#8B4513'; groundBot='#4a3218'; grassTop='#32CD32'; grassBot='#228B22'; flower='#ff69b4'; enemyBaseColor='#ff4444'; }
  // v52: kingdom = cielo un pelín más profundo + césped y tierra MÁS OSCUROS
  else if (theme === 'kingdom') { skyTop='#3f8fd0'; skyBot='#b9d6ea'; groundTop='#6f3a12'; groundBot='#3a2410'; grassTop='#26a226'; grassBot='#186418'; flower='#ff69b4'; enemyBaseColor='#ff4444'; }
  else { skyTop='#87CEEB'; skyBot='#E0F6FF'; groundTop='#8B4513'; groundBot='#4a3218'; grassTop='#32CD32'; grassBot='#228B22'; flower='#ff69b4'; enemyBaseColor='#ff4444'; }

  const skyGrad = ctx.createLinearGradient(0, 0, 0, 220);
  skyGrad.addColorStop(0, skyTop);
  skyGrad.addColorStop(1, skyBot);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 900, 220);

  if (theme === 'halloween') {
    ctx.fillStyle = '#ffffcc';
    ctx.shadowBlur = 30; ctx.shadowColor = '#ffffcc';
    ctx.beginPath(); ctx.arc(750, 60, 40, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    for (let i = 0; i < 5; i++) {
      const x = (i * 180 + frameCount * 0.5) % 900;
      const y = 40 + Math.sin(frameCount * 0.1 + i) * 20;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x-10, y-15, x-20, y-5);
      ctx.quadraticCurveTo(x-10, y-5, x, y);
      ctx.quadraticCurveTo(x+10, y-5, x+20, y-15);
      ctx.quadraticCurveTo(x+10, y-15, x, y);
      ctx.fill();
    }
  } else if (theme === 'alien') {
    ctx.fillStyle = '#ffffff';
    for (let i=0;i<40;i++){ const x=(i*137)%900; const y=(i*61)%180; ctx.globalAlpha=0.4+0.6*Math.abs(Math.sin(frameCount*0.05+i)); ctx.fillRect(x,y,2,2); }
    ctx.globalAlpha=1;
  } else if (theme === 'infernal') {
    ctx.fillStyle = '#ff8844';
    for (let i=0;i<15;i++){ const x=(i*173 + frameCount*0.6)%900; const y=320-((frameCount*1.2 + i*47)%320); ctx.globalAlpha=0.6; ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill(); }
    ctx.globalAlpha=1;
  } else if (theme === 'xmas') {
    ctx.fillStyle = '#ffffff';
    for (let i=0;i<30;i++){
      const x=(i*31 + frameCount*0.3)%900;
      const y=(i*17 + frameCount*0.5)%220;
      ctx.globalAlpha=0.6;
      ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  } else if (theme === 'normal' || theme === 'kingdom') {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    const cloudOffset = (frameCount * 0.15) % 1000;
    for (let i=0; i<3; i++) { const cx = (i*350 - cloudOffset) % 1000; ctx.beginPath(); ctx.arc(cx, 50+i*15, 20, 0, Math.PI*2); ctx.arc(cx+20, 45+i*15, 25, 0, Math.PI*2); ctx.arc(cx+40, 50+i*15, 20, 0, Math.PI*2); ctx.fill(); }
  }

  const groundGrad = ctx.createLinearGradient(0, 220, 0, 320);
  groundGrad.addColorStop(0, groundTop);
  groundGrad.addColorStop(1, groundBot);
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, 220, 900, 100);
  const grassGrad = ctx.createLinearGradient(0, 215, 0, 225);
  grassGrad.addColorStop(0, grassTop);
  grassGrad.addColorStop(1, grassBot);
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0, 215, 900, 10);
  ctx.fillStyle = flower;
  for (let i=0; i<8; i++) { const x = (i * 115 + 30) % 900; ctx.beginPath(); ctx.arc(x, 218, 2.5, 0, Math.PI*2); ctx.fill(); }

  // v52: PARTE 2 — árboles grandes al fondo (detrás de bases y unidades)
  if (theme === 'kingdom') {
    // fila lejana (más oscura y pequeña = profundidad)
    drawTree(70, 210, 0.8, true);
    drawTree(290, 209, 0.7, true);
    drawTree(510, 210, 0.85, true);
    drawTree(730, 209, 0.75, true);
    // fila cercana (grande)
    drawTree(170, 216, 1.3, false);
    drawTree(400, 217, 1.15, false);
    drawTree(630, 216, 1.4, false);
    drawTree(860, 217, 1.1, false);
  }

  drawBase(50, baseHP, 1500, '#4488ff', false);
  drawBase(ENEMY_BASE_X, enemyBaseHP, enemyBaseMaxHP, enemyBaseColor, true);

  const cannonRange = getCannonRange();
  const rangeRight = Math.min(900, MY_BASE_X + cannonRange);
  const pulseAlpha = 0.10 + Math.sin(frameCount * 0.08) * 0.04;
  ctx.fillStyle = `rgba(255, 30, 30, ${pulseAlpha})`;
  ctx.fillRect(MY_BASE_X, 0, rangeRight - MY_BASE_X, 320);
  ctx.strokeStyle = 'rgba(255, 50, 50, 0.9)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(rangeRight, 0); ctx.lineTo(rangeRight, 320);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#333';
  ctx.fillRect(MY_BASE_X - 8, 100, 16, 12);
  ctx.fillStyle = '#555';
  ctx.fillRect(MY_BASE_X - 4, 92, 22, 8);
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(MY_BASE_X, 106, 6, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`💣 Rango: ${cannonRange}px`, (MY_BASE_X + rangeRight) / 2, 25);
  ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('▼', rangeRight, 40);

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

  if (bossWarningTimer > 0) {
    ctx.fillStyle = 'rgba(255,0,0,0.5)';
    ctx.fillRect(0, 0, 900, 320);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('👑 ¡' + currentBossName() + '! 👑', 450, 160);
    ctx.font = '20px Arial';
    ctx.fillText(`¡Prepárate! Aparece en ${Math.ceil(bossWarningTimer/60)}s`, 450, 200);
  }
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 900, 320);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DERROTA 💀', 450, 160);
    ctx.font = '20px Arial';
    ctx.fillText('Oleada ' + wave + ' · Usa 🏠 Menú o 🔄 Reiniciar', 450, 200);
  }
}