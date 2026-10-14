// ============================================================
// 06-render.js — Dibujo en canvas y bucle principal
// ============================================================

function drawStar(cx, cy, spikes, outerRadius) {
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * (outerRadius * 0.5), cy + Math.sin(rot) * (outerRadius * 0.5));
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
}

// -------------------- GATOS --------------------
function drawCat(c) {
  const bounce = Math.sin(c.walkCycle) * 1.5;
  const attackScale = c.attackAnim > 0 ? 1.1 : 1;
  const scale = c.scale;
  ctx.save();
  ctx.translate(c.x, c.y + bounce);
  ctx.scale(attackScale * scale, attackScale * scale);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, GROUND_Y - c.y - bounce, 16, 6, 0, 0, Math.PI*2);
  ctx.fill();
  if (c.visual === 'king') {
    const capeGrad = ctx.createLinearGradient(0, -10, 0, 22);
    capeGrad.addColorStop(0, '#dd0000');
    capeGrad.addColorStop(1, '#770000');
    ctx.fillStyle = capeGrad;
    ctx.beginPath();
    ctx.moveTo(-14, -8);
    ctx.quadraticCurveTo(-26, 8, -18, 21);
    ctx.lineTo(18, 21);
    ctx.quadraticCurveTo(26, 8, 14, -8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-14, -8, 4, 3, 0, 0, Math.PI*2);
    ctx.ellipse(14, -8, 4, 3, 0, 0, Math.PI*2);
    ctx.fill();
  }
  const grad = ctx.createRadialGradient(-6, -6, 4, 0, 0, 20);
  grad.addColorStop(0, c.color);
  grad.addColorStop(1, c.color2);
  ctx.fillStyle = grad;
  if (c.visual === 'headless') {
    ctx.beginPath();
    ctx.ellipse(0, 8, 16, 12, 0, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-14, 6);
    ctx.quadraticCurveTo(-10, -8, 0, -9);
    ctx.quadraticCurveTo(10, -8, 14, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 13, 9, 5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(170,255,194,0.55)';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#88ffaa';
    for (let i = 0; i < 4; i++) {
      const fy = -16 - i * 5 - Math.abs(Math.sin(frameCount * 0.08 + i)) * 4;
      ctx.beginPath();
      ctx.arc(-3 + i * 2.5, fy, 2.2 - i * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00331a';
    ctx.beginPath();
    ctx.ellipse(0, -9, 7, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ee2222';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-5, -9); ctx.lineTo(-4, -5);
    ctx.moveTo(0, -10); ctx.lineTo(1, -5);
    ctx.moveTo(5, -9); ctx.lineTo(4, -6);
    ctx.stroke();
  } else {
    // cabeza primero...
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI*2);
    ctx.fill();
    // ...orejas DELANTE de la bola (rellenan la frente)
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.moveTo(-13, -12); ctx.lineTo(-11, -29); ctx.lineTo(-1, -17); ctx.closePath();
    ctx.moveTo(1, -17); ctx.lineTo(11, -29); ctx.lineTo(13, -12); ctx.closePath();
    ctx.fill();
    const earGradCat = ctx.createLinearGradient(0, -26, 0, -12);
    earGradCat.addColorStop(0, '#ff8fa3');
    earGradCat.addColorStop(1, '#ffd1dc');
    ctx.fillStyle = earGradCat;
    ctx.beginPath();
    ctx.moveTo(-10.5, -14); ctx.lineTo(-9.5, -24); ctx.lineTo(-3.5, -16.5); ctx.closePath();
    ctx.moveTo(3.5, -16.5); ctx.lineTo(9.5, -24); ctx.lineTo(10.5, -14); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-13, -12); ctx.lineTo(-11, -29); ctx.lineTo(-1, -17);
    ctx.moveTo(1, -17); ctx.lineTo(11, -29); ctx.lineTo(13, -12);
    ctx.stroke();
  }
  if (c.visual === 'headless') {
    const legAnimH = Math.sin(c.walkCycle) * 3;
    const legAnim2H = Math.sin(c.walkCycle + Math.PI) * 3;
    const capeGradH = ctx.createLinearGradient(0, -14, 0, 26);
    capeGradH.addColorStop(0, 'rgba(80,30,110,0.85)');
    capeGradH.addColorStop(1, 'rgba(20,0,40,0.7)');
    ctx.fillStyle = capeGradH;
    const capeWave = Math.sin(frameCount * 0.12) * 3;
    ctx.beginPath();
    ctx.moveTo(-13, -8);
    ctx.quadraticCurveTo(-27, 6 + capeWave, -21, 24);
    ctx.quadraticCurveTo(-10, 29, 0, 25);
    ctx.quadraticCurveTo(10, 29, 21, 24);
    ctx.quadraticCurveTo(27, 6 - capeWave, 13, -8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,140,220,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-21, 24);
    ctx.quadraticCurveTo(-10, 29, 0, 25);
    ctx.quadraticCurveTo(10, 29, 21, 24);
    ctx.stroke();
    ctx.fillStyle = '#ddd8c4';
    ctx.beginPath(); ctx.arc(0, -8, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(-1, -8, 0.7, 0, Math.PI*2); ctx.arc(1, -8, 0.7, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#88ffaa';
    ctx.strokeStyle = c.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const tailWagH = Math.sin(frameCount * 0.07) * 4;
    ctx.beginPath();
    ctx.moveTo(-14, 12);
    ctx.quadraticCurveTo(-26, 8 + tailWagH, -23, -4 + tailWagH);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = c.color2;
    ctx.beginPath();
    ctx.ellipse(-10, 18 + legAnimH * 0.5, 4, 5, 0, 0, Math.PI*2);
    ctx.ellipse(10, 18 + legAnim2H * 0.5, 4, 5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 8, 15, 11, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-12, 6);
    ctx.quadraticCurveTo(-8, -6, 0, -7);
    ctx.quadraticCurveTo(8, -6, 12, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,60,30,0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-7, -1); ctx.quadraticCurveTo(0, -4, 7, -1);
    ctx.moveTo(-8, 4); ctx.quadraticCurveTo(0, 1, 8, 4);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 8, 4.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.ellipse(-7, 16 + legAnimH, 3.5, 5.5, 0, 0, Math.PI*2);
    ctx.ellipse(7, 16 + legAnim2H, 3.5, 5.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#ffaaaa';
    ctx.beginPath();
    ctx.arc(-7, 19 + legAnimH, 2, 0, Math.PI*2);
    ctx.arc(7, 19 + legAnim2H, 2, 0, Math.PI*2);
    ctx.fill();
    // sin orejas ni bigotes: no tiene cabeza
    ctx.fillStyle = 'rgba(170,255,194,0.55)';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#88ffaa';
    for (let i = 0; i < 4; i++) {
      const fy = -14 - i * 5 - Math.abs(Math.sin(frameCount * 0.08 + i)) * 4;
      ctx.beginPath();
      ctx.arc(-3 + i * 2.5, fy, 2.2 - i * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00331a';
    ctx.beginPath();
    ctx.ellipse(0, -7, 6.5, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ee2222';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-4, -7); ctx.lineTo(-3, -3.5);
    ctx.moveTo(0, -8); ctx.lineTo(1, -3.5);
    ctx.moveTo(4, -7); ctx.lineTo(3, -4);
    ctx.stroke();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffaa00';
    ctx.fillStyle = '#ff8800';
    ctx.beginPath(); ctx.arc(22, 2, 7, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#cc5500'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(22, 2, 7, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#ffff66';
    ctx.beginPath();
    ctx.moveTo(19, 0); ctx.lineTo(20.5, 2); ctx.lineTo(18, 2); ctx.closePath();
    ctx.moveTo(25, 0); ctx.lineTo(26, 2); ctx.lineTo(23.5, 2); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#006600';
    ctx.fillRect(21, -6, 2, 2);
    ctx.restore();
    return;
  }
  // --- cara estándar ---
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(-6, -2, 4, 5, 0, 0, Math.PI*2);
  ctx.ellipse(6, -2, 4, 5, 0, 0, Math.PI*2);
  ctx.fill();
  const eyeBase = c.visual === 'king' ? '#ffd700' : (c.visual === 'demon' ? '#ffcc00' : (c.visual === 'gatoclaus' ? '#ff9944' : (c.visual ? '#00ffff' : '#4488ff')));
  const eyeDark = c.visual === 'king' ? '#aa7700' : (c.visual === 'demon' ? '#aa5000' : (c.visual === 'gatoclaus' ? '#aa4400' : (c.visual ? '#0088aa' : '#2244aa')));
  const eyeGrad = ctx.createRadialGradient(-6, -2, 1, -6, -2, 3);
  eyeGrad.addColorStop(0, eyeBase);
  eyeGrad.addColorStop(1, eyeDark);
  ctx.fillStyle = eyeGrad;
  ctx.beginPath();
  ctx.arc(-6, -2, 2.5, 0, Math.PI*2);
  ctx.arc(6, -2, 2.5, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-6, -2, 1.2, 0, Math.PI*2);
  ctx.arc(6, -2, 1.2, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-5, -3, 0.8, 0, Math.PI*2);
  ctx.arc(7, -3, 0.8, 0, Math.PI*2);
  ctx.fill();
  const noseGrad = ctx.createRadialGradient(0, 3, 0.5, 0, 3, 2);
  noseGrad.addColorStop(0, '#ff88aa');
  noseGrad.addColorStop(1, '#ff6699');
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.moveTo(0, 2); ctx.lineTo(-2, 4); ctx.lineTo(2, 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 4); ctx.lineTo(-3, 7);
  ctx.moveTo(0, 4); ctx.lineTo(3, 7);
  ctx.stroke();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-8, 3); ctx.lineTo(-14, 2);
  ctx.moveTo(-8, 5); ctx.lineTo(-14, 6);
  ctx.moveTo(8, 3); ctx.lineTo(14, 2);
  ctx.moveTo(8, 5); ctx.lineTo(14, 6);
  ctx.stroke();
  const legAnim = Math.sin(c.walkCycle) * 3;
  const legAnim2 = Math.sin(c.walkCycle + Math.PI) * 3;
  ctx.fillStyle = c.color2;
  ctx.beginPath();
  ctx.ellipse(-9, 16 + legAnim, 3.5, 5, 0, 0, Math.PI*2);
  ctx.ellipse(9, 16 + legAnim2, 3.5, 5, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = (c.visual === 'robosword' || c.visual === 'robogun') ? '#dde6ee' : '#ffaaaa';
  ctx.beginPath();
  ctx.arc(-9, 19 + legAnim, 1.5, 0, Math.PI*2);
  ctx.arc(9, 19 + legAnim2, 1.5, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = c.color2;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const tailWave = Math.sin(frameCount*0.15)*6;
  ctx.beginPath();
  ctx.moveTo(-14, 4);
  ctx.quadraticCurveTo(-22, 0 + tailWave, -18, -10);
  ctx.stroke();
  ctx.fillStyle = c.color;
  ctx.beginPath();
  ctx.arc(-18, -10, 2.5, 0, Math.PI*2);
  ctx.fill();
  // --- accesorios ---
  if (c.visual === 'king') {
    const crownGrad = ctx.createLinearGradient(0, -36, 0, -20);
    crownGrad.addColorStop(0, '#fff200');
    crownGrad.addColorStop(1, '#ffaa00');
    ctx.fillStyle = crownGrad;
    ctx.beginPath();
    ctx.moveTo(-13, -20);
    ctx.lineTo(-13, -33); ctx.lineTo(-9, -27); ctx.lineTo(-5, -35);
    ctx.lineTo(0, -27); ctx.lineTo(5, -35); ctx.lineTo(9, -27); ctx.lineTo(13, -33);
    ctx.lineTo(13, -20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#805500'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.fillStyle = '#ff0000';
    ctx.beginPath(); ctx.arc(0, -24, 2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#00cc00';
    ctx.beginPath(); ctx.arc(-7, -23, 1.4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#0066ff';
    ctx.beginPath(); ctx.arc(7, -23, 1.4, 0, Math.PI*2); ctx.fill();
    // hacha con el filo hacia el FRENTE
    ctx.strokeStyle = '#6b4423'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(14, 14); ctx.lineTo(22, -12); ctx.stroke();
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath();
    ctx.moveTo(20, -18);
    ctx.quadraticCurveTo(34, -12, 20, -4);
    ctx.quadraticCurveTo(25, -11, 20, -18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(24, -16);
    ctx.quadraticCurveTo(33, -11, 24, -6);
    ctx.stroke();
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.arc(21, -11, 2.2, 0, Math.PI*2);
    ctx.fill();
  } else if (c.visual === 'demon') {
    ctx.fillStyle = '#5a0000';
    ctx.beginPath();
    ctx.moveTo(-13, -12); ctx.lineTo(-11, -29); ctx.lineTo(-1, -17); ctx.closePath();
    ctx.moveTo(1, -17); ctx.lineTo(11, -29); ctx.lineTo(13, -12); ctx.closePath();
    ctx.fill();
    const earGradD = ctx.createLinearGradient(0, -26, 0, -12);
    earGradD.addColorStop(0, '#ff6633');
    earGradD.addColorStop(1, '#ffaa66');
    ctx.fillStyle = earGradD;
    ctx.beginPath();
    ctx.moveTo(-10.5, -14); ctx.lineTo(-9.5, -24); ctx.lineTo(-3.5, -16.5); ctx.closePath();
    ctx.moveTo(3.5, -16.5); ctx.lineTo(9.5, -24); ctx.lineTo(10.5, -14); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#220000'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff0000';
    ctx.beginPath(); ctx.moveTo(16, 8); ctx.lineTo(29, -9); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ff2222'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(16, 8); ctx.lineTo(29, -9); ctx.stroke();
    ctx.strokeStyle = '#880000'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(13, 4); ctx.lineTo(19, 11); ctx.stroke();
    ctx.fillStyle = '#ff4444';
    ctx.beginPath(); ctx.arc(22, -1, 1.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(25, -5, 1.2, 0, Math.PI*2); ctx.fill();
  } else if (c.visual === 'robosword') {
    ctx.fillStyle = '#99aabb';
    ctx.beginPath(); ctx.arc(0, -14, 10, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-6, -16, 12, 3);
    ctx.strokeStyle = '#654321'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(14, 6); ctx.lineTo(19, 1); ctx.stroke();
    ctx.strokeStyle = '#dde6ee'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(19, 1); ctx.lineTo(30, -10); ctx.stroke();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(17, -1); ctx.lineTo(21, 3); ctx.stroke();
  } else if (c.visual === 'robogun') {
    ctx.strokeStyle = '#99aabb'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, -26); ctx.stroke();
    ctx.fillStyle = '#00ffff';
    ctx.beginPath(); ctx.arc(0, -27, 2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#445566';
    ctx.fillRect(12, -2, 12, 4);
    ctx.fillRect(14, 2, 3, 5);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(23, -1, 2, 2);
  } else if (c.visual === 'gatoclaus') {
    // bola única: barba, gorro y bola de nieve (sin saco/pipa)
    ctx.fillStyle = '#f4f4f4';
    ctx.beginPath();
    ctx.moveTo(-11, 8);
    ctx.quadraticCurveTo(-12, 18, 0, 19);
    ctx.quadraticCurveTo(12, 18, 11, 8);
    ctx.quadraticCurveTo(6, 12, 0, 11);
    ctx.quadraticCurveTo(-6, 12, -11, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ee2233';
    ctx.beginPath();
    ctx.moveTo(-13, -10);
    ctx.quadraticCurveTo(-4, -24, 7, -18);
    ctx.quadraticCurveTo(14, -22, 18, -26);
    ctx.quadraticCurveTo(16, -16, 11, -10);
    ctx.quadraticCurveTo(0, -14, -13, -6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(19, -27, 3.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -9, 14, 3.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 6; ctx.shadowColor = '#cfeeff';
    ctx.beginPath(); ctx.arc(13, 13, 4, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  } else if (c.unitType === 'ranged') {
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(11, 0, 11, -Math.PI/2, Math.PI/2);
    ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(11, -11); ctx.lineTo(11, 11);
    ctx.stroke();
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(8, -1, 10, 1.5);
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(18, -2.5); ctx.lineTo(21, 0); ctx.lineTo(18, 2.5);
    ctx.closePath();
    ctx.fill();
  } else if (c.unitType === 'aoe') {
    const hatGrad = ctx.createLinearGradient(0, -35, 0, -18);
    hatGrad.addColorStop(0, '#4400aa');
    hatGrad.addColorStop(1, '#220066');
    ctx.fillStyle = hatGrad;
    ctx.beginPath();
    ctx.moveTo(-10, -18); ctx.lineTo(0, -35); ctx.lineTo(10, -18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.ellipse(0, -18, 12, 3, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ffcc00';
    drawStar(0, -26, 5, 3);
    ctx.shadowBlur = 0;
  } else if (c.unitType === 'healer') {
    const crossGrad = ctx.createLinearGradient(0, -10, 0, 6);
    crossGrad.addColorStop(0, '#ffffff');
    crossGrad.addColorStop(1, '#dddddd');
    ctx.fillStyle = crossGrad;
    ctx.fillRect(-3, -10, 6, 16);
    ctx.fillRect(-7, -6, 14, 6);
    ctx.strokeStyle = '#ff0066';
    ctx.lineWidth = 1;
    ctx.strokeRect(-3, -10, 6, 16);
    ctx.strokeRect(-7, -6, 14, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(-2, -9, 2, 14);
  } else if (c.unitType === 'melee' && c.scale > 1 && !c.visual) {
    const crownGrad = ctx.createLinearGradient(0, -28, 0, -20);
    crownGrad.addColorStop(0, '#ffee00');
    crownGrad.addColorStop(1, '#ffaa00');
    ctx.fillStyle = crownGrad;
    ctx.beginPath();
    ctx.moveTo(-10, -20);
    ctx.lineTo(-10, -28); ctx.lineTo(-7, -25); ctx.lineTo(-4, -30);
    ctx.lineTo(0, -25); ctx.lineTo(4, -30); ctx.lineTo(7, -25); ctx.lineTo(10, -28);
    ctx.lineTo(10, -20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ff0000';
    ctx.beginPath(); ctx.arc(0, -24, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#00ff00';
    ctx.beginPath(); ctx.arc(-6, -23, 1, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -23, 1, 0, Math.PI*2); ctx.fill();
  }
  if (c.level > 1) {
    ctx.fillStyle = '#ffd700';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(0, c.visual === 'king' ? -40 : -28, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(c.level, 0, c.visual === 'king' ? -37 : -25);
  }
  ctx.restore();
  const barW = 28 * scale;
  const barY = c.y - (c.visual === 'king' ? 50 : 38) * scale + bounce;
  ctx.fillStyle = '#000';
  ctx.fillRect(c.x-barW/2, barY, barW, 4);
  ctx.fillStyle = '#0f0';
  ctx.fillRect(c.x-barW/2, barY, barW*(c.hp/c.maxHp), 4);
  if (c.attackAnim > 0) c.attackAnim--;
  c.walkCycle += c.speed * 0.1;
}

// -------------------- ENEMIGOS --------------------
function drawEnemy(e) {
  const bounce = Math.sin(e.walkCycle) * 1.5;
  const attackScale = e.attackAnim > 0 ? 1.15 : 1;
  const scale = e.scale;
  ctx.save();
  ctx.translate(e.x, e.y + bounce);
  ctx.scale(attackScale * scale, attackScale * scale);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, GROUND_Y - e.y - bounce, 18, 6, 0, 0, Math.PI*2);
  ctx.fill();
  const grad = ctx.createRadialGradient(-6, -6, 4, 0, 0, 20);
  grad.addColorStop(0, e.color);
  grad.addColorStop(1, e.color2);
  ctx.fillStyle = grad;
  if ((e.unitType === 'melee' && e.scale > 1) || e.unitType === 'boss') {
    ctx.beginPath();
    ctx.arc(0, 0, e.unitType === 'boss' ? 22 : 20, 0, Math.PI*2);
    ctx.fill();
  } else {
    ctx.fillRect(-16, -16, 32, 32);
  }
  if (e.xmasStyle === 'elf') {
    ctx.fillStyle = '#145a24';
    ctx.beginPath();
    ctx.moveTo(-10, -16); ctx.lineTo(0, -30); ctx.lineTo(10, -16); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, -31, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffccaa';
    ctx.beginPath(); ctx.arc(-16, -2, 3, 0, Math.PI*2); ctx.arc(16, -2, 3, 0, Math.PI*2); ctx.fill();
  } else if (e.xmasStyle === 'snowman') {
    ctx.fillStyle = '#ff7722';
    ctx.beginPath();
    ctx.moveTo(-2, -2); ctx.lineTo(-14, 1); ctx.lineTo(-2, 4); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-16, 2); ctx.lineTo(-26, -6); ctx.moveTo(-22, -2); ctx.lineTo(-25, 3);
    ctx.moveTo(16, 2); ctx.lineTo(26, -6); ctx.moveTo(22, -2); ctx.lineTo(25, 3);
    ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(0, 6, 2, 0, Math.PI*2); ctx.arc(0, 12, 2, 0, Math.PI*2); ctx.fill();
  } else if (e.xmasStyle === 'gremlin') {
    ctx.strokeStyle = '#cc2255'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(12, 6); ctx.lineTo(22, 0); ctx.stroke();
    ctx.fillStyle = '#ff3366';
    ctx.shadowBlur = 8; ctx.shadowColor = '#ff3366';
    ctx.beginPath(); ctx.arc(26, -2, 6, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(24, -9, 4, 2);
  } else if (e.desertStyle === 'mummy') {
    ctx.strokeStyle = 'rgba(120,100,50,0.9)';
    ctx.lineWidth = 2.5;
    for (let i = -12; i <= 12; i += 6) {
      ctx.beginPath();
      ctx.moveTo(-16, i); ctx.lineTo(16, i + 3);
      ctx.stroke();
    }
    ctx.fillStyle = '#1a1408';
    ctx.fillRect(-13, -6, 26, 4);
    ctx.fillStyle = '#ffdd55';
    ctx.shadowBlur = 6; ctx.shadowColor = '#ffdd55';
    ctx.beginPath(); ctx.arc(-6, -4, 1.6, 0, Math.PI*2); ctx.arc(6, -4, 1.6, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  } else if (e.desertStyle === 'cactus') {
    ctx.strokeStyle = '#00cc44'; ctx.lineWidth = 2;
    for (let i = -12; i <= 12; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, -16); ctx.lineTo(i, 16);
      ctx.stroke();
    }
    ctx.strokeStyle = '#006400'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-16, -4); ctx.quadraticCurveTo(-24, -4, -24, -14);
    ctx.moveTo(16, 2); ctx.quadraticCurveTo(24, 2, 24, -8);
    ctx.stroke();
    ctx.fillStyle = '#ff66aa';
    ctx.beginPath(); ctx.arc(-24, -16, 2.5, 0, Math.PI*2); ctx.arc(24, -10, 2.5, 0, Math.PI*2); ctx.fill();
  } else if (e.desertStyle === 'beetle') {
    ctx.strokeStyle = 'rgba(120,80,200,0.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, 16); ctx.stroke();
    ctx.fillStyle = '#4b0082';
    const legA = Math.sin(e.walkCycle * 2) * 2;
    ctx.beginPath();
    ctx.moveTo(-16, -8); ctx.lineTo(-23, -12 + legA);
    ctx.moveTo(-16, 0); ctx.lineTo(-24, 0 - legA);
    ctx.moveTo(-16, 8); ctx.lineTo(-23, 12 + legA);
    ctx.moveTo(16, -8); ctx.lineTo(23, -12 - legA);
    ctx.moveTo(16, 0); ctx.lineTo(24, 0 + legA);
    ctx.moveTo(16, 8); ctx.lineTo(23, 12 - legA);
    ctx.stroke();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(-6, -10, 1.8, 0, Math.PI*2); ctx.arc(6, -10, 1.8, 0, Math.PI*2); ctx.fill();
  } else if (e.desertStyle === 'djinn') {
    ctx.fillStyle = 'rgba(255,200,80,0.35)';
    ctx.beginPath();
    ctx.moveTo(-16, 16);
    ctx.quadraticCurveTo(-6, 26, 6, 20);
    ctx.quadraticCurveTo(14, 16, 16, 16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffcc66'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -16); ctx.quadraticCurveTo(-12, -24, -6, -26);
    ctx.moveTo(8, -16); ctx.quadraticCurveTo(12, -24, 6, -26);
    ctx.stroke();
  } else if (e.desertStyle === 'ankh') {
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -8, 5, 0, Math.PI*2);
    ctx.moveTo(0, -3); ctx.lineTo(0, 12);
    ctx.moveTo(-6, 2); ctx.lineTo(6, 2);
    ctx.stroke();
  }
  if (e.unitType === 'melee') {
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, 8 + i*3, 0, Math.PI*2);
      ctx.stroke();
    }
  } else if (e.unitType === 'poison') {
    ctx.fillStyle = 'rgba(0,100,0,0.3)';
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 12, Math.sin(angle) * 12, 2.5, 0, Math.PI*2);
      ctx.fill();
    }
  }
  ctx.strokeStyle = e.color2;
  ctx.lineWidth = 1.5;
  if ((e.unitType === 'melee' && e.scale > 1) || e.unitType === 'boss') {
    ctx.beginPath();
    ctx.arc(0, 0, e.unitType === 'boss' ? 22 : 20, 0, Math.PI*2);
    ctx.stroke();
  } else {
    ctx.strokeRect(-16, -16, 32, 32);
  }
  ctx.fillStyle = '#ff0000';
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#ff0000';
  ctx.beginPath();
  ctx.ellipse(-7, -4, 3.5, 4.5, 0, 0, Math.PI*2);
  ctx.ellipse(7, -4, 3.5, 4.5, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(-7, -4, 1.5, 3, 0, 0, Math.PI*2);
  ctx.ellipse(7, -4, 1.5, 3, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-6, -5, 1, 0, Math.PI*2);
  ctx.arc(8, -5, 1, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-10, 7); ctx.lineTo(-5, 11); ctx.lineTo(0, 7);
  ctx.lineTo(5, 11); ctx.lineTo(10, 7);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(-5, 9); ctx.lineTo(-3, 13); ctx.lineTo(-1, 9); ctx.closePath();
  ctx.moveTo(1, 9); ctx.lineTo(3, 13); ctx.lineTo(5, 9); ctx.closePath();
  ctx.fill();
  const legAnim = Math.sin(e.walkCycle) * 3;
  const legAnim2 = Math.sin(e.walkCycle + Math.PI) * 3;
  ctx.fillStyle = e.color2;
  ctx.beginPath();
  ctx.ellipse(-10, 17 + legAnim, 4, 6, 0, 0, Math.PI*2);
  ctx.ellipse(10, 17 + legAnim2, 4, 6, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(-12, 21 + legAnim); ctx.lineTo(-11, 24 + legAnim); ctx.lineTo(-10, 21 + legAnim);
  ctx.moveTo(-10, 21 + legAnim); ctx.lineTo(-9, 24 + legAnim); ctx.lineTo(-8, 21 + legAnim);
  ctx.moveTo(8, 21 + legAnim2); ctx.lineTo(9, 24 + legAnim2); ctx.lineTo(10, 21 + legAnim2);
  ctx.moveTo(10, 21 + legAnim2); ctx.lineTo(11, 24 + legAnim2); ctx.lineTo(12, 21 + legAnim2);
  ctx.fill();
  if (e.unitType === 'boss') {
    if (e.bossStyle === 'pumpkin') {
      const glow = Math.sin(frameCount * 0.1) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255,100,0,${glow})`;
      ctx.shadowBlur = 20; ctx.shadowColor = '#ff6600';
      ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffff00';
      ctx.shadowBlur = 15; ctx.shadowColor = '#ffff00';
      ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(-6, -2); ctx.lineTo(-14, -2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(10, -8); ctx.lineTo(14, -2); ctx.lineTo(6, -2); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-12, 8); ctx.lineTo(-8, 14); ctx.lineTo(-4, 8); ctx.lineTo(0, 14); ctx.lineTo(4, 8); ctx.lineTo(8, 14); ctx.lineTo(12, 8);
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#006600';
      ctx.fillRect(-3, -28, 6, 8);
    } else if (e.bossStyle === 'titan') {
      ctx.fillStyle = 'rgba(180,240,255,0.9)';
      ctx.beginPath();
      ctx.moveTo(-18,-10); ctx.lineTo(-26,-30); ctx.lineTo(-12,-16); ctx.closePath();
      ctx.moveTo(18,-10); ctx.lineTo(26,-30); ctx.lineTo(12,-16); ctx.closePath();
      ctx.moveTo(0,-20); ctx.lineTo(0,-38); ctx.lineTo(8,-20); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,191,255,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 26 + Math.sin(frameCount*0.1)*3, 0, Math.PI*2); ctx.stroke();
    } else if (e.bossStyle === 'demon') {
      ctx.strokeStyle = e.color2; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-14,-16); ctx.quadraticCurveTo(-30,-26,-24,-40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(14,-16); ctx.quadraticCurveTo(30,-26,24,-40); ctx.stroke();
      ctx.strokeStyle = 'rgba(200,0,255,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 28 + Math.sin(frameCount*0.12)*4, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = '#ff00ff';
      ctx.beginPath(); ctx.arc(-4,-14,2,0,Math.PI*2); ctx.arc(4,-14,2,0,Math.PI*2); ctx.fill();
    } else if (e.bossStyle === 'alien') {
      ctx.fillStyle = 'rgba(0,255,136,0.35)';
      ctx.beginPath(); ctx.arc(0, -6, 26, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-10,-24); ctx.lineTo(-14,-34); ctx.moveTo(10,-24); ctx.lineTo(14,-34); ctx.stroke();
      ctx.fillStyle = '#00ff88';
      ctx.beginPath(); ctx.arc(-14,-35,3,0,Math.PI*2); ctx.arc(14,-35,3,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,255,136,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 30 + Math.sin(frameCount*0.12)*4, 0, Math.PI*2); ctx.stroke();
    } else if (e.bossStyle === 'infernal') {
      ctx.strokeStyle = '#ff4400'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-14,-16); ctx.quadraticCurveTo(-26,-30,-18,-44); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(14,-16); ctx.quadraticCurveTo(26,-30,18,-44); ctx.stroke();
      ctx.fillStyle = 'rgba(255,120,0,0.5)';
      for (let i=0;i<6;i++){ const a=frameCount*0.1+i; ctx.beginPath(); ctx.arc(Math.cos(a)*26, Math.sin(a)*26, 4,0,Math.PI*2); ctx.fill(); }
      ctx.strokeStyle = 'rgba(255,60,0,0.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 32 + Math.sin(frameCount*0.15)*4, 0, Math.PI*2); ctx.stroke();
    } else if (e.bossStyle === 'pharaoh') {
      ctx.fillStyle = '#ffd700';
      ctx.shadowBlur = 12; ctx.shadowColor = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-14,-18); ctx.lineTo(-14,-34); ctx.lineTo(-8,-26); ctx.lineTo(-4,-38);
      ctx.lineTo(0,-26); ctx.lineTo(4,-38); ctx.lineTo(8,-26); ctx.lineTo(14,-34); ctx.lineTo(14,-18);
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(120,100,50,0.95)'; ctx.lineWidth = 2.5;
      for (let i=-14;i<=14;i+=7){ ctx.beginPath(); ctx.moveTo(-20,i); ctx.lineTo(20,i+4); ctx.stroke(); }
      ctx.fillStyle = '#ffdd55';
      ctx.beginPath(); ctx.arc(-7,-6,2.5,0,Math.PI*2); ctx.arc(7,-6,2.5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,215,0,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 30 + Math.sin(frameCount*0.1)*4, 0, Math.PI*2); ctx.stroke();
    } else if (e.bossStyle === 'sandgolem') {
      ctx.fillStyle = 'rgba(210,170,90,0.7)';
      for (let i=0;i<8;i++){ const a=frameCount*0.06+i*0.8; const r=24+Math.sin(frameCount*0.1+i)*5; ctx.beginPath(); ctx.arc(Math.cos(a)*r, Math.sin(a)*r, 3,0,Math.PI*2); ctx.fill(); }
      ctx.strokeStyle = 'rgba(120,80,20,0.8)'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10,-14); ctx.lineTo(-4,-2); ctx.lineTo(-9,8);
      ctx.moveTo(8,-12); ctx.lineTo(3,0); ctx.lineTo(10,10);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(218,165,32,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 30 + Math.sin(frameCount*0.08)*5, 0, Math.PI*2); ctx.stroke();
    } else if (e.bossStyle === 'krampus') {
      ctx.strokeStyle = '#3a2a10'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-14,-18); ctx.quadraticCurveTo(-34,-24,-30,-46); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(14,-18); ctx.quadraticCurveTo(34,-24,30,-46); ctx.stroke();
      ctx.fillStyle = '#cc1111';
      ctx.beginPath(); ctx.arc(-30,-48,4,0,Math.PI*2); ctx.arc(30,-48,4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#c0c0c0'; ctx.lineWidth = 2.5;
      for (let i=0;i<5;i++){ const a=frameCount*0.08+i*1.25; ctx.beginPath(); ctx.arc(Math.cos(a)*26, Math.sin(a)*26+4, 3.5, 0, Math.PI*2); ctx.stroke(); }
      ctx.fillStyle = 'rgba(200,30,30,0.5)';
      ctx.beginPath(); ctx.arc(0, -2, 30 + Math.sin(frameCount*0.1)*3, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,80,80,0.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 34 + Math.sin(frameCount*0.13)*4, 0, Math.PI*2); ctx.stroke();
    } else if (e.bossStyle === 'djinnboss') {
      ctx.fillStyle = 'rgba(255,170,60,0.55)';
      ctx.beginPath(); ctx.arc(0, -26, 14 + Math.sin(frameCount*0.1)*2, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#ffcc66'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-12,-18); ctx.quadraticCurveTo(-24,-32,-14,-44); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12,-18); ctx.quadraticCurveTo(24,-32,14,-44); ctx.stroke();
      ctx.fillStyle = 'rgba(255,140,0,0.6)';
      for (let i=0;i<7;i++){ const a=frameCount*0.12+i*0.9; ctx.beginPath(); ctx.arc(Math.cos(a)*30, Math.sin(a)*30, 4.5,0,Math.PI*2); ctx.fill(); }
      ctx.strokeStyle = 'rgba(255,150,50,0.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 34 + Math.sin(frameCount*0.14)*5, 0, Math.PI*2); ctx.stroke();
    } else {
      const wingFlap = Math.sin(frameCount * 0.2) * 10;
      ctx.fillStyle = 'rgba(255,0,0,0.6)';
      ctx.beginPath(); ctx.ellipse(-25, -5 + wingFlap, 18, 10, -0.3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(25, -5 - wingFlap, 18, 10, 0.3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#880000';
      ctx.beginPath();
      ctx.moveTo(-12,-18); ctx.lineTo(-18,-32); ctx.lineTo(-8,-20); ctx.closePath();
      ctx.moveTo(12,-18); ctx.lineTo(18,-32); ctx.lineTo(8,-20); ctx.closePath();
      ctx.fill();
    }
  } else if (e.unitType === 'flying') {
    const wingFlap = Math.sin(frameCount * 0.3) * 8;
    const wingGrad = ctx.createRadialGradient(-18, -3, 4, -18, -3, 12);
    wingGrad.addColorStop(0, 'rgba(200,150,255,0.9)');
    wingGrad.addColorStop(1, 'rgba(150,100,255,0.5)');
    ctx.fillStyle = wingGrad;
    ctx.beginPath(); ctx.ellipse(-18, -3 + wingFlap, 12, 6, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(18, -3 - wingFlap, 12, 6, 0.3, 0, Math.PI*2); ctx.fill();
  } else if (e.unitType === 'ranged') {
    const staffGrad = ctx.createLinearGradient(-12, -15, -12, 15);
    staffGrad.addColorStop(0, '#880088');
    staffGrad.addColorStop(1, '#440044');
    ctx.strokeStyle = staffGrad;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-12, -15); ctx.lineTo(-12, 15); ctx.stroke();
    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 12; ctx.shadowColor = '#ff00ff';
    ctx.beginPath(); ctx.arc(-12, -18, 5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(-11, -19, 1.5, 0, Math.PI*2); ctx.fill();
  } else if (e.unitType === 'poison') {
    ctx.fillStyle = '#00ff00';
    ctx.shadowBlur = 6; ctx.shadowColor = '#00ff00';
    for (let i = 0; i < 4; i++) {
      const angle = (frameCount * 0.03 + i * Math.PI * 2 / 4);
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 13, Math.sin(angle) * 13, 2.5, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  if (e.poisonTimer > 0) {
    ctx.fillStyle = 'rgba(0,255,0,0.25)';
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
  const barW = 28 * scale;
  const barY = e.y - 38 * scale + bounce;
  ctx.fillStyle = '#000';
  ctx.fillRect(e.x-barW/2, barY, barW, 4);
  ctx.fillStyle = '#f00';
  ctx.fillRect(e.x-barW/2, barY, barW*(e.hp/e.maxHp), 4);
  if (e.isBoss) {
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('👑 ' + e.name, e.x, e.y - 50 * scale + bounce);
    if (e.hp <= e.maxHp * 0.5) {
      ctx.fillStyle = '#ffaa00';
      ctx.font = 'bold 10px Arial';
      ctx.fillText('🛡️ Inmune al cañón', e.x, e.y - 38 * scale + bounce);
    }
  }
  if (e.attackAnim > 0) e.attackAnim--;
  e.walkCycle += e.speed * 0.1;
}

// -------------------- BASES / PROYECTILES / PARTÍCULAS --------------------
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
  for (let i = 0; i < 5; i++) ctx.fillRect(-30 + i*14, -53, 10, 8);
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
  ctx.shadowBlur = 8; ctx.shadowColor = '#ffff00';
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
  const theme = isEvent() ? currentEventId : (isTest() ? 'test' : 'normal');
  let skyTop, skyBot, groundTop, groundBot, grassTop, grassBot, flower, enemyBaseColor;
  if (theme === 'halloween') { skyTop='#1a0033'; skyBot='#330066'; groundTop='#2a1a0a'; groundBot='#1a0a00'; grassTop='#1a3300'; grassBot='#0a1a00'; flower='#ff6600'; enemyBaseColor='#ff6600'; }
  else if (theme === 'alien') { skyTop='#001122'; skyBot='#003322'; groundTop='#223322'; groundBot='#112211'; grassTop='#00ff66'; grassBot='#009933'; flower='#88ffaa'; enemyBaseColor='#00cc66'; }
  else if (theme === 'infernal') { skyTop='#220000'; skyBot='#551100'; groundTop='#331100'; groundBot='#1a0800'; grassTop='#cc3300'; grassBot='#882200'; flower='#ff6644'; enemyBaseColor='#ff3300'; }
  else if (theme === 'xmas') { skyTop='#1a3a5c'; skyBot='#4a6a8c'; groundTop='#ffffff'; groundBot='#ddeeff'; grassTop='#cc2233'; grassBot='#881122'; flower='#ffffff'; enemyBaseColor='#cc2233'; }
  else if (theme === 'test') { skyTop='#9966cc'; skyBot='#e0ccff'; groundTop='#8B4513'; groundBot='#4a3218'; grassTop='#32CD32'; grassBot='#228B22'; flower='#ff69b4'; enemyBaseColor='#ff4444'; }
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
  } else if (theme === 'normal') {
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

  drawBase(50, baseHP, 1500, '#4488ff', false);
  drawBase(ENEMY_BASE_X, enemyBaseHP, enemyBaseMaxHP, enemyBaseColor, true);

  // indicador de rango del cañón
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
  ctx.beginPath(); ctx.arc(MY_BASE_X, 106, 6, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`💣 Rango: ${cannonRange}px`, (MY_BASE_X + rangeRight) / 2, 25);
  ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('▼', rangeRight, 40);

  for (let i=0; i<cats.length; i++) drawCat(cats[i]);
  for (let i=0; i<enemies.length; i++) drawEnemy(enemies[i]);
  for (let i=0; i<projectiles.length; i++) drawProjectile(projectiles[i]);
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

// -------------------- BUCLE PRINCIPAL (60 FPS fijos) --------------------
function loop() {
  const now = performance.now();
  let delta = now - lastTime;
  lastTime = now;
  if (delta > 250) delta = 250;
  frameAccumulator += delta;
  let ticks = 0;
  while (frameAccumulator >= FRAME_MS && ticks < 4) {
    frameAccumulator -= FRAME_MS;
    ticks++;
    fpsTickCount++;
  }
  if (frameAccumulator > FRAME_MS * 4) frameAccumulator = 0;
  if (ticks > 0 && playing) {
    try {
      update();
      draw();
    } catch (err) {
      playing = false;
      console.error(err);
      setStatus('⚠️ Error interno: ' + err.message + ' · Vuelve al menú', '#ff6666');
    }
  } else if (ticks > 0) {
    draw();
  }
  fpsSampleTimer += delta;
  if (fpsSampleTimer >= 500) {
    fps = Math.round(fpsTickCount * 1000 / fpsSampleTimer);
    fpsSampleTimer = 0;
    fpsTickCount = 0;
    document.getElementById('fps').textContent = `FPS: ${fps}`;
  }
  requestAnimationFrame(loop);
}