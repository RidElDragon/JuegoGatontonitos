// ============================================================
// 06-render-scene.js — Escena completa (v63): fondo, temas, bases,
// proyectiles, partículas y draw().
// · v63: drawBase usa getBaseMaxHP() para tu base.
// · v61: Bosque Catedral con troncos MARRONES.
// · v60: Bosque Catedral rediseñado (10 capas).
// · v59: 6 temas de ETAPAS DE LEYENDA (ruins, volcano, sky, abyss,
//        clockwork, void) + desierto (desert) + bosque (kingdom).
// · Orden de dibujo por TAMAÑO: grandes detrás, pequeñas delante.
// ============================================================
// -------------------- helpers --------------------
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
// ============================================================
// v61: BOSQUE CATEDRAL (Parte 2) — troncos MARRONES.
// ============================================================
function drawKingdomForest() {
const t = frameCount;
// 1) Pared de fondo verde profundo
const bg = ctx.createLinearGradient(0, 0, 0, 215);
bg.addColorStop(0, '#081a0a');
bg.addColorStop(0.45, '#16361a');
bg.addColorStop(1, '#2c5426');
ctx.fillStyle = bg;
ctx.fillRect(0, 0, 900, 215);
// 2) Claridad al fondo
const glow = ctx.createRadialGradient(450, 118, 10, 450, 118, 270);
glow.addColorStop(0, 'rgba(226,255,178,0.55)');
glow.addColorStop(0.4, 'rgba(160,220,110,0.25)');
glow.addColorStop(1, 'rgba(160,220,110,0)');
ctx.fillStyle = glow;
ctx.fillRect(0, 0, 900, 215);
// 3) Fila lejana: troncos finos MARRONES, MUY densos
for (let x = -10; x <= 910; x += 24) {
const h = 140 + ((x * 7) % 46);
const w = 4 + ((x * 13) % 3);
ctx.fillStyle = 'rgba(62,44,26,0.92)';
ctx.fillRect(x, 215 - h, w, h);
ctx.fillStyle = 'rgba(160,120,80,0.14)';
ctx.fillRect(x, 215 - h, 1.4, h);
}
ctx.fillStyle = 'rgba(12,30,14,0.95)';
for (let x = -20; x <= 920; x += 30) {
ctx.beginPath();
ctx.ellipse(x, 58 + ((x * 11) % 24), 24, 18, 0, 0, Math.PI * 2);
ctx.fill();
}
// 4) Fila media: troncos CAFÉ con corteza, raíces y musgo
for (let x = 15; x <= 900; x += 58) {
const w = 10 + ((x * 17) % 6);
const top = 26 + ((x * 29) % 30);
const tg = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
tg.addColorStop(0, '#241408');
tg.addColorStop(0.35, '#6b4a26');
tg.addColorStop(0.7, '#4a3018');
tg.addColorStop(1, '#1a0e06');
ctx.fillStyle = tg;
ctx.fillRect(x - w / 2, top, w, 215 - top);
ctx.strokeStyle = 'rgba(0,0,0,0.30)';
ctx.lineWidth = 1;
for (let y = top + 14; y < 210; y += 30) {
ctx.beginPath();
ctx.moveTo(x - w / 2 + 2, y);
ctx.quadraticCurveTo(x, y + 4, x + w / 2 - 2, y);
ctx.stroke();
}
ctx.fillStyle = '#3a2412';
ctx.beginPath();
ctx.moveTo(x - w / 2, 215);
ctx.quadraticCurveTo(x - w, 212, x - w - 5, 215);
ctx.lineTo(x + w + 5, 215);
ctx.quadraticCurveTo(x + w, 212, x + w / 2, 215);
ctx.closePath();
ctx.fill();
ctx.fillStyle = 'rgba(96,150,64,0.45)';
ctx.fillRect(x - w / 2, 215 - 24, 2.6, 24);
}
// 5) Bóveda de copas en arco
ctx.fillStyle = '#0f2a0d';
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(900, 0);
ctx.lineTo(900, 42);
for (let x = 900; x >= 45; x -= 45) {
ctx.quadraticCurveTo(x - 22, 80 + ((x * 31) % 26), x - 45, 46 + ((x * 17) % 18));
}
ctx.closePath();
ctx.fill();
ctx.fillStyle = 'rgba(120,190,80,0.30)';
for (let x = 12; x <= 900; x += 45) {
ctx.beginPath();
ctx.ellipse(x, 54 + ((x * 31) % 22), 15, 8, 0, 0, Math.PI * 2);
ctx.fill();
}
// lianas colgando
ctx.strokeStyle = 'rgba(70,120,50,0.7)';
ctx.lineWidth = 2;
ctx.lineCap = 'round';
for (let x = 60; x <= 880; x += 130) {
const sway = Math.sin(t * 0.02 + x) * 3;
const len = 40 + ((x * 19) % 35);
ctx.beginPath();
ctx.moveTo(x, 50);
ctx.quadraticCurveTo(x + sway, 50 + len * 0.6, x + sway * 1.6, 50 + len);
ctx.stroke();
ctx.fillStyle = 'rgba(90,150,60,0.8)';
ctx.beginPath();
ctx.ellipse(x + sway * 1.6, 52 + len, 4, 2.6, sway * 0.1, 0, Math.PI * 2);
ctx.fill();
}
ctx.lineCap = 'butt';
// 6) Rayos de luz
ctx.save();
ctx.globalCompositeOperation = 'lighter';
for (let i = 0; i < 5; i++) {
const bx = 120 + i * 170 + Math.sin(t * 0.004 + i) * 12;
const a = Math.max(0.02, 0.05 + 0.04 * Math.sin(t * 0.02 + i * 1.7));
ctx.fillStyle = 'rgba(255,250,180,' + a.toFixed(3) + ')';
ctx.beginPath();
ctx.moveTo(bx - 10, 44);
ctx.lineTo(bx + 10, 44);
ctx.lineTo(bx + 46, 215);
ctx.lineTo(bx - 46, 215);
ctx.closePath();
ctx.fill();
}
ctx.restore();
// 7) Sotobosque: helechos y setas
for (let x = 6; x <= 900; x += 36) {
const s = 0.8 + ((x * 7) % 5) / 10;
ctx.fillStyle = '#1d4a1c';
for (let k = -2; k <= 2; k++) {
ctx.beginPath();
ctx.ellipse(x + k * 6 * s, 213 - Math.abs(k) * 2, 7 * s, 3.4 * s, k * 0.5, 0, Math.PI * 2);
ctx.fill();
}
}
for (let x = 60; x <= 880; x += 210) {
ctx.fillStyle = '#d8cdb4';
ctx.fillRect(x - 1.5, 209, 3, 6);
ctx.fillStyle = '#b03a2e';
ctx.beginPath(); ctx.ellipse(x, 209, 6, 3.6, 0, Math.PI, 0); ctx.fill();
ctx.fillStyle = '#fff';
ctx.beginPath(); ctx.arc(x - 2, 207.6, 0.9, 0, Math.PI * 2); ctx.arc(x + 2.4, 208.2, 0.8, 0, Math.PI * 2); ctx.fill();
}
// 8) Troncos-marco de MADERA en los bordes
for (const x of [24, 876]) {
const w = 26;
const tg2 = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
tg2.addColorStop(0, '#160d05');
tg2.addColorStop(0.4, '#4a3018');
tg2.addColorStop(1, '#0d0703');
ctx.fillStyle = tg2;
ctx.fillRect(x - w / 2, 0, w, 215);
ctx.strokeStyle = 'rgba(0,0,0,0.40)';
ctx.lineWidth = 1.4;
for (let y = 20; y < 215; y += 34) {
ctx.beginPath();
ctx.moveTo(x - w / 2 + 3, y);
ctx.quadraticCurveTo(x, y + 6, x + w / 2 - 3, y);
ctx.stroke();
}
ctx.fillStyle = '#241408';
ctx.beginPath();
ctx.moveTo(x - w / 2, 215);
ctx.quadraticCurveTo(x - w, 210, x - w - 10, 215);
ctx.lineTo(x + w + 10, 215);
ctx.quadraticCurveTo(x + w, 210, x + w / 2, 215);
ctx.closePath();
ctx.fill();
}
// 9) Polen / motas de luz
for (let i = 0; i < 14; i++) {
const px = (i * 137 + t * 0.25) % 900;
const py = 60 + (i * 53) % 140 + Math.sin(t * 0.02 + i * 2.1) * 8;
ctx.globalAlpha = 0.25 + 0.45 * Math.abs(Math.sin(t * 0.03 + i));
ctx.fillStyle = 'rgba(255,255,200,0.9)';
ctx.beginPath(); ctx.arc(px, py, 1.4, 0, Math.PI * 2); ctx.fill();
}
ctx.globalAlpha = 1;
// 10) Manchas de luz en el suelo
ctx.fillStyle = 'rgba(255,244,170,0.13)';
for (let i = 0; i < 7; i++) {
const dx = 70 + i * 125 + Math.sin(t * 0.006 + i) * 8;
ctx.beginPath();
ctx.ellipse(dx, 219, 34, 5, 0, 0, Math.PI * 2);
ctx.fill();
}
}
// ============================================================
// v59: DESIERTO PROHIBIDO (Parte 3)
// ============================================================
function drawDesert() {
ctx.fillStyle = '#d4a574';
for (let x = -50; x <= 950; x += 180) {
ctx.beginPath();
ctx.moveTo(x - 90, 140);
ctx.quadraticCurveTo(x, 100, x + 90, 140);
ctx.quadraticCurveTo(x + 45, 130, x, 135);
ctx.quadraticCurveTo(x - 45, 130, x - 90, 140);
ctx.closePath();
ctx.fill();
}
ctx.fillStyle = '#c89968';
for (let x = 0; x <= 900; x += 150) {
ctx.beginPath();
ctx.moveTo(x - 75, 170);
ctx.quadraticCurveTo(x, 140, x + 75, 170);
ctx.lineTo(x + 75, 220);
ctx.lineTo(x - 75, 220);
ctx.closePath();
ctx.fill();
ctx.fillStyle = 'rgba(180,140,90,0.4)';
ctx.beginPath();
ctx.moveTo(x - 60, 175);
ctx.quadraticCurveTo(x, 150, x + 60, 175);
ctx.lineTo(x + 60, 220);
ctx.lineTo(x - 60, 220);
ctx.closePath();
ctx.fill();
ctx.fillStyle = '#c89968';
}
ctx.fillStyle = '#b8895a';
ctx.fillRect(0, 200, 900, 20);
for (let x = 80; x <= 880; x += 160) {
ctx.fillStyle = '#2e8b57';
ctx.fillRect(x - 3, 180, 6, 35);
ctx.fillRect(x - 12, 190, 8, 18);
ctx.fillRect(x + 4, 185, 8, 22);
ctx.fillStyle = '#1e6b3a';
ctx.fillRect(x - 3, 180, 2, 35);
ctx.fillRect(x - 12, 190, 2, 18);
ctx.fillRect(x + 4, 185, 2, 22);
ctx.strokeStyle = '#8bca7a';
ctx.lineWidth = 1;
for (let y = 182; y < 215; y += 6) {
ctx.beginPath();
ctx.moveTo(x - 3, y); ctx.lineTo(x - 5, y - 2);
ctx.moveTo(x + 3, y); ctx.lineTo(x + 5, y - 2);
ctx.stroke();
}
}
for (let x = 150; x <= 850; x += 200) {
ctx.fillStyle = '#8b7355';
ctx.beginPath();
ctx.moveTo(x - 20, 210);
ctx.quadraticCurveTo(x - 15, 195, x - 5, 190);
ctx.quadraticCurveTo(x + 5, 185, x + 15, 195);
ctx.quadraticCurveTo(x + 20, 205, x + 18, 215);
ctx.lineTo(x - 18, 215);
ctx.closePath();
ctx.fill();
ctx.fillStyle = 'rgba(60,50,40,0.3)';
ctx.beginPath();
ctx.ellipse(x, 212, 18, 6, 0, 0, Math.PI * 2);
ctx.fill();
}
for (let x = 200; x <= 800; x += 300) {
ctx.fillStyle = '#a67c52';
ctx.beginPath();
ctx.moveTo(x - 30, 160);
ctx.lineTo(x, 130);
ctx.lineTo(x + 30, 160);
ctx.closePath();
ctx.fill();
ctx.fillStyle = '#8b6538';
ctx.beginPath();
ctx.moveTo(x - 25, 160);
ctx.lineTo(x, 135);
ctx.lineTo(x + 25, 160);
ctx.closePath();
ctx.fill();
ctx.fillStyle = '#3a2a1a';
ctx.fillRect(x - 4, 152, 8, 8);
ctx.strokeStyle = '#6b4a28';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(x - 15, 150); ctx.lineTo(x - 10, 150);
ctx.moveTo(x + 10, 150); ctx.lineTo(x + 15, 150);
ctx.moveTo(x - 12, 145); ctx.lineTo(x - 8, 145);
ctx.moveTo(x + 8, 145); ctx.lineTo(x + 12, 145);
ctx.stroke();
}
ctx.fillStyle = 'rgba(210,170,110,0.4)';
for (let i = 0; i < 12; i++) {
const x = (i * 83 + frameCount * 1.5) % 900;
const y = 120 + (i * 29) % 80 + Math.sin(frameCount * 0.08 + i) * 8;
ctx.beginPath();
ctx.arc(x, y, 1.2, 0, Math.PI * 2);
ctx.fill();
}
}
// ============================================================
// v59: DECORADOS DE LEYENDA (6 zonas)
// ============================================================
function drawRuinsDecor() {
for (let x = 60; x <= 880; x += 150) {
const h = 60 + ((x / 150) % 3) * 22;
ctx.fillStyle = '#8a7a5a';
ctx.fillRect(x - 8, 214 - h, 16, h);
ctx.fillStyle = 'rgba(0,0,0,0.25)';
ctx.fillRect(x - 8, 214 - h, 5, h);
ctx.fillStyle = '#9a8a6a';
ctx.fillRect(x - 12, 214 - h - 6, 24, 6);
ctx.fillRect(x - 12, 208, 24, 6);
ctx.strokeStyle = '#5a4a30'; ctx.lineWidth = 1.2;
ctx.beginPath(); ctx.moveTo(x - 2, 214 - h + 8); ctx.lineTo(x + 2, 214 - h + 20); ctx.lineTo(x - 1, 214 - h + 32); ctx.stroke();
ctx.strokeStyle = '#3a7a2a'; ctx.lineWidth = 2; ctx.lineCap = 'round';
ctx.beginPath(); ctx.moveTo(x - 8, 214 - h + 4); ctx.quadraticCurveTo(x - 14, 214 - h / 2, x - 9, 210); ctx.stroke();
ctx.lineCap = 'butt';
}
ctx.strokeStyle = '#7a6a4a'; ctx.lineWidth = 10;
ctx.beginPath(); ctx.arc(450, 214, 90, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
ctx.fillStyle = 'rgba(60,140,60,0.5)';
for (let i = 0; i < 10; i++) { const x = 40 + i * 88; ctx.beginPath(); ctx.ellipse(x, 216, 14, 4, 0, 0, Math.PI * 2); ctx.fill(); }
}
function drawVolcanoDecor() {
ctx.fillStyle = '#2a0800';
ctx.beginPath(); ctx.moveTo(80, 214); ctx.lineTo(200, 60); ctx.lineTo(320, 214); ctx.closePath(); ctx.fill();
ctx.beginPath(); ctx.moveTo(560, 214); ctx.lineTo(700, 40); ctx.lineTo(840, 214); ctx.closePath(); ctx.fill();
const g = 0.6 + Math.sin(frameCount * 0.08) * 0.3;
ctx.fillStyle = 'rgba(255,120,0,' + g + ')';
ctx.beginPath(); ctx.ellipse(200, 62, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
ctx.beginPath(); ctx.ellipse(700, 42, 30, 9, 0, 0, Math.PI * 2); ctx.fill();
ctx.strokeStyle = 'rgba(255,90,0,0.8)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
ctx.beginPath(); ctx.moveTo(200, 70); ctx.quadraticCurveTo(230, 140, 210, 214); ctx.stroke();
ctx.beginPath(); ctx.moveTo(700, 50); ctx.quadraticCurveTo(660, 130, 690, 214); ctx.stroke();
ctx.lineCap = 'butt';
ctx.fillStyle = '#1a0a05';
for (let x = 30; x <= 880; x += 110) { ctx.beginPath(); ctx.moveTo(x - 14, 214); ctx.lineTo(x, 196); ctx.lineTo(x + 14, 214); ctx.closePath(); ctx.fill(); }
}
function drawSkyDecor() {
const bob = Math.sin(frameCount * 0.02) * 4;
const islands = [[140, 90, 46], [420, 60, 60], [720, 100, 40]];
for (const isl of islands) {
const ix = isl[0], iy = isl[1] + bob, ir = isl[2];
ctx.fillStyle = '#7a9a5a';
ctx.beginPath(); ctx.ellipse(ix, iy, ir, ir * 0.32, 0, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = '#8a6a40';
ctx.beginPath();
ctx.moveTo(ix - ir, iy); ctx.quadraticCurveTo(ix - ir * 0.4, iy + ir * 0.9, ix, iy + ir * 1.1);
ctx.quadraticCurveTo(ix + ir * 0.4, iy + ir * 0.9, ix + ir, iy);
ctx.closePath(); ctx.fill();
ctx.strokeStyle = 'rgba(180,220,255,0.7)'; ctx.lineWidth = 4;
ctx.beginPath(); ctx.moveTo(ix + ir * 0.3, iy + ir * 0.6); ctx.lineTo(ix + ir * 0.3, iy + ir * 1.6 + ((frameCount * 2) % 20)); ctx.stroke();
}
ctx.strokeStyle = 'rgba(40,60,90,0.6)'; ctx.lineWidth = 1.6;
for (let i = 0; i < 4; i++) {
const x = (i * 230 + frameCount * 0.4) % 980 - 40;
const y = 50 + i * 18 + Math.sin(frameCount * 0.05 + i) * 6;
ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.quadraticCurveTo(x, y - 4, x + 6, y); ctx.stroke();
}
}
function drawAbyssDecor() {
ctx.strokeStyle = 'rgba(40,120,90,0.7)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
for (let x = 50; x <= 880; x += 90) {
const sway = Math.sin(frameCount * 0.04 + x) * 8;
ctx.beginPath(); ctx.moveTo(x, 214); ctx.quadraticCurveTo(x + sway, 170, x + sway * 1.6, 130); ctx.stroke();
}
ctx.lineCap = 'butt';
for (let x = 90; x <= 860; x += 170) {
ctx.strokeStyle = '#cc6688'; ctx.lineWidth = 3; ctx.lineCap = 'round';
ctx.beginPath();
ctx.moveTo(x, 214); ctx.lineTo(x, 196); ctx.moveTo(x, 202); ctx.lineTo(x - 8, 192);
ctx.moveTo(x, 200); ctx.lineTo(x + 8, 190);
ctx.stroke(); ctx.lineCap = 'butt';
}
const g = 0.5 + Math.sin(frameCount * 0.06) * 0.3;
ctx.fillStyle = 'rgba(100,230,220,' + g + ')';
for (let x = 130; x <= 850; x += 240) { ctx.beginPath(); ctx.ellipse(x, 212, 10, 5, 0, 0, Math.PI * 2); ctx.fill(); }
}
function drawClockworkDecor() {
const gears = [[150, 120, 46, 8], [450, 90, 60, 10], [760, 130, 40, 7]];
for (const gr of gears) {
const gx = gr[0], gy = gr[1], rad = gr[2], teeth = gr[3];
const rot = frameCount * 0.01 * (rad > 50 ? 1 : -1);
ctx.save(); ctx.translate(gx, gy); ctx.rotate(rot);
ctx.fillStyle = 'rgba(60,50,35,0.85)';
ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = 'rgba(90,75,50,0.9)';
for (let i = 0; i < teeth; i++) {
const a = (i / teeth) * Math.PI * 2;
ctx.save(); ctx.rotate(a); ctx.fillRect(rad - 4, -6, 10, 12); ctx.restore();
}
ctx.fillStyle = 'rgba(30,25,18,0.9)';
ctx.beginPath(); ctx.arc(0, 0, rad * 0.35, 0, Math.PI * 2); ctx.fill();
ctx.restore();
}
ctx.fillStyle = '#4a4038';
ctx.fillRect(0, 196, 900, 8);
for (let x = 100; x <= 850; x += 180) {
ctx.fillRect(x - 6, 176, 12, 22);
const p = (frameCount * 0.02 + x) % 3;
ctx.fillStyle = 'rgba(220,220,210,' + Math.max(0, 0.5 - p * 0.15) + ')';
ctx.beginPath(); ctx.arc(x, 168 - p * 10, 6 + p * 3, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = '#4a4038';
}
}
function drawVoidDecor() {
for (let i = 0; i < 6; i++) {
const x = 80 + i * 150;
const y = 120 + Math.sin(frameCount * 0.03 + i * 1.7) * 10;
ctx.fillStyle = '#2a1a44';
ctx.beginPath();
ctx.moveTo(x - 16, y); ctx.lineTo(x - 6, y - 12); ctx.lineTo(x + 10, y - 8);
ctx.lineTo(x + 16, y + 2); ctx.lineTo(x + 4, y + 10); ctx.lineTo(x - 10, y + 8);
ctx.closePath(); ctx.fill();
ctx.strokeStyle = 'rgba(160,100,255,0.6)'; ctx.lineWidth = 1.4; ctx.stroke();
}
for (let x = 60; x <= 880; x += 130) {
ctx.fillStyle = 'rgba(150,90,255,0.75)';
ctx.beginPath(); ctx.moveTo(x - 8, 214); ctx.lineTo(x, 186); ctx.lineTo(x + 8, 214); ctx.closePath(); ctx.fill();
ctx.fillStyle = 'rgba(220,180,255,0.5)';
ctx.beginPath(); ctx.moveTo(x - 3, 214); ctx.lineTo(x, 194); ctx.lineTo(x + 3, 214); ctx.closePath(); ctx.fill();
}
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
// v63: selección de tema (eventos → test → leyenda → desierto → bosque → normal)
let theme;
if (isEvent()) theme = currentEventId;
else if (isTest()) theme = 'test';
else if (gameMode === 'legend') theme = LEGEND_STAGES[legendLevelIdx] ? LEGEND_STAGES[legendLevelIdx].theme : 'normal';
else if (gameMode === 'story' && storyLevelIdx + 1 >= 31 && storyLevelIdx + 1 <= 45) theme = 'desert';
else if (gameMode === 'story' && storyLevelIdx + 1 >= 16 && storyLevelIdx + 1 <= 30) theme = 'kingdom';
else theme = 'normal';
let skyTop, skyBot, groundTop, groundBot, grassTop, grassBot, flower, enemyBaseColor;
if (theme === 'halloween') { skyTop='#1a0033'; skyBot='#330066'; groundTop='#2a1a0a'; groundBot='#1a0a00'; grassTop='#1a3300'; grassBot='#0a1a00'; flower='#ff6600'; enemyBaseColor='#ff6600'; }
else if (theme === 'alien') { skyTop='#001122'; skyBot='#003322'; groundTop='#223322'; groundBot='#112211'; grassTop='#00ff66'; grassBot='#009933'; flower='#88ffaa'; enemyBaseColor='#00cc66'; }
else if (theme === 'infernal') { skyTop='#220000'; skyBot='#551100'; groundTop='#331100'; groundBot='#1a0800'; grassTop='#cc3300'; grassBot='#882200'; flower='#ff6644'; enemyBaseColor='#ff3300'; }
else if (theme === 'xmas') { skyTop='#1a3a5c'; skyBot='#4a6a8c'; groundTop='#ffffff'; groundBot='#ddeeff'; grassTop='#cc2233'; grassBot='#881122'; flower='#ffffff'; enemyBaseColor='#cc2233'; }
else if (theme === 'test') { skyTop='#9966cc'; skyBot='#e0ccff'; groundTop='#8B4513'; groundBot='#4a3218'; grassTop='#32CD32'; grassBot='#228B22'; flower='#ff69b4'; enemyBaseColor='#ff4444'; }
else if (theme === 'kingdom') { skyTop='#12290f'; skyBot='#3f6b2f'; groundTop='#4a3418'; groundBot='#241708'; grassTop='#2f7a2a'; grassBot='#1c4f1a'; flower='#ffd76a'; enemyBaseColor='#ff4444'; }
else if (theme === 'desert') { skyTop='#f4a460'; skyBot='#ffdab9'; groundTop='#d2b48c'; groundBot='#8b7355'; grassTop='#c89968'; grassBot='#a67c52'; flower='#d4a574'; enemyBaseColor='#ff8844'; }
else if (theme === 'ruins') { skyTop='#2e4a3a'; skyBot='#8aa87a'; groundTop='#6a5a3a'; groundBot='#3a2a1a'; grassTop='#4a8a3a'; grassBot='#2a5a2a'; flower='#ffd700'; enemyBaseColor='#c8b070'; }
else if (theme === 'volcano') { skyTop='#1a0000'; skyBot='#661100'; groundTop='#3a1100'; groundBot='#1a0500'; grassTop='#ff5500'; grassBot='#aa2200'; flower='#ffaa00'; enemyBaseColor='#ff4400'; }
else if (theme === 'sky') { skyTop='#4a90d9'; skyBot='#cfe8ff'; groundTop='#7a9a5a'; groundBot='#4a6a3a'; grassTop='#66bb55'; grassBot='#338833'; flower='#ffffff'; enemyBaseColor='#88bbee'; }
else if (theme === 'abyss') { skyTop='#001a33'; skyBot='#004466'; groundTop='#1a3344'; groundBot='#0a1a22'; grassTop='#226677'; grassBot='#113344'; flower='#66ddee'; enemyBaseColor='#3388aa'; }
else if (theme === 'clockwork') { skyTop='#3a3025'; skyBot='#9a8060'; groundTop='#5a4a3a'; groundBot='#2a2018'; grassTop='#8a7a50'; grassBot='#5a4a30'; flower='#ffcc44'; enemyBaseColor='#ccaa66'; }
else if (theme === 'void') { skyTop='#0a0018'; skyBot='#2a0044'; groundTop='#221133'; groundBot='#110518'; grassTop='#6633aa'; grassBot='#331166'; flower='#bb88ff'; enemyBaseColor='#9944ff'; }
else { skyTop='#87CEEB'; skyBot='#E0F6FF'; groundTop='#8B4513'; groundBot='#4a3218'; grassTop='#32CD32'; grassBot='#228B22'; flower='#ff69b4'; enemyBaseColor='#ff4444'; }
const skyGrad = ctx.createLinearGradient(0, 0, 0, 220);
skyGrad.addColorStop(0, skyTop);
skyGrad.addColorStop(1, skyBot);
ctx.fillStyle = skyGrad;
ctx.fillRect(0, 0, 900, 220);
// ---- cielos / atmósfera ----
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
} else if (theme === 'normal' || theme === 'sky') {
ctx.fillStyle = 'rgba(255,255,255,0.7)';
const cloudOffset = (frameCount * 0.15) % 1000;
for (let i=0; i<3; i++) { const cx = (i*350 - cloudOffset) % 1000; ctx.beginPath(); ctx.arc(cx, 50+i*15, 20, 0, Math.PI*2); ctx.arc(cx+20, 45+i*15, 25, 0, Math.PI*2); ctx.arc(cx+40, 50+i*15, 20, 0, Math.PI*2); ctx.fill(); }
} else if (theme === 'desert') {
ctx.fillStyle = '#ffffaa';
ctx.shadowBlur = 40; ctx.shadowColor = '#ffffaa';
ctx.beginPath(); ctx.arc(750, 50, 35, 0, Math.PI*2); ctx.fill();
ctx.shadowBlur = 0;
ctx.strokeStyle = 'rgba(255,200,150,0.3)';
ctx.lineWidth = 2;
for (let i = 0; i < 4; i++) {
const y = 180 + i * 10;
ctx.beginPath();
for (let x = 0; x <= 900; x += 5) {
ctx.lineTo(x, y + Math.sin((x + frameCount * 2) * 0.05) * 2);
}
ctx.stroke();
}
} else if (theme === 'ruins') {
ctx.fillStyle = 'rgba(255,240,180,0.5)';
for (let i = 0; i < 12; i++) {
const x = (i * 83 + frameCount * 0.2) % 900;
const y = 40 + (i * 37) % 140 + Math.sin(frameCount * 0.03 + i) * 8;
ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
}
} else if (theme === 'volcano') {
ctx.fillStyle = '#ff8844';
for (let i = 0; i < 20; i++) {
const x = (i * 149 + frameCount * 0.5) % 900;
const y = 320 - ((frameCount * 1.4 + i * 41) % 320);
ctx.globalAlpha = 0.6;
ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
}
ctx.globalAlpha = 1;
} else if (theme === 'abyss') {
ctx.fillStyle = 'rgba(180,230,255,0.5)';
for (let i = 0; i < 18; i++) {
const x = (i * 61) % 900;
const y = 220 - ((frameCount * 0.8 + i * 37) % 220);
ctx.beginPath(); ctx.arc(x, y, 1.5 + (i % 3), 0, Math.PI * 2); ctx.fill();
}
ctx.fillStyle = 'rgba(120,200,255,0.10)';
for (let i = 0; i < 4; i++) {
const x = 120 + i * 220 + Math.sin(frameCount * 0.01 + i) * 20;
ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x + 90, 220); ctx.lineTo(x + 20, 220); ctx.closePath(); ctx.fill();
}
} else if (theme === 'clockwork') {
ctx.fillStyle = 'rgba(200,180,140,0.35)';
for (let i = 0; i < 8; i++) {
const x = (i * 127 + frameCount * 0.15) % 900;
const y = 30 + (i * 29) % 120;
ctx.beginPath(); ctx.arc(x, y, 8 + (i % 3) * 4, 0, Math.PI * 2); ctx.fill();
}
} else if (theme === 'void') {
ctx.fillStyle = '#ffffff';
for (let i = 0; i < 50; i++) {
const x = (i * 137) % 900; const y = (i * 61) % 200;
ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(frameCount * 0.04 + i));
ctx.fillRect(x, y, 2, 2);
}
ctx.globalAlpha = 1;
const ng = ctx.createRadialGradient(650, 70, 10, 650, 70, 120);
ng.addColorStop(0, 'rgba(160,80,255,0.35)');
ng.addColorStop(1, 'rgba(160,80,255,0)');
ctx.fillStyle = ng;
ctx.beginPath(); ctx.arc(650, 70, 120, 0, Math.PI * 2); ctx.fill();
}
// ---- suelo ----
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
// ---- decorados de fondo ----
if (theme === 'kingdom') drawKingdomForest();
else if (theme === 'desert') drawDesert();
else if (theme === 'ruins') drawRuinsDecor();
else if (theme === 'volcano') drawVolcanoDecor();
else if (theme === 'sky') drawSkyDecor();
else if (theme === 'abyss') drawAbyssDecor();
else if (theme === 'clockwork') drawClockworkDecor();
else if (theme === 'void') drawVoidDecor();
// ---- bases + cañón ----
drawBase(50, baseHP, getBaseMaxHP(), '#4488ff', false);
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
// ---- entidades (orden por TAMAÑO) ----
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