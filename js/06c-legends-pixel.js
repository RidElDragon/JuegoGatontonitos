// ============================================================
// 06c-legends-pixel.js — v59: ARTE de ETAPAS DE LEYENDA
// · 12 enemigos nuevos + 6 jefes nuevos en pixel-art vectorial,
//   usando los mismos helpers que 06b (flatBall, monHorn, etc.).
// · NO reescribe 06b: captura su drawEnemy y lo extiende. Si el
//   enemigo no es de leyenda, delega en el dispatcher original.
// · v59 FIX: el wrapper se ASIGNA (window.drawEnemy = function...)
//   en vez de declararse. Si se declarara, el hoisting pisaría el
//   global antes de capturar _baseDrawEnemy → recursión infinita.
// · Se carga DESPUÉS de 06b-enemies-pixel.js (ver index.html).
// ============================================================
const _baseDrawEnemy = drawEnemy; // captura el dispatcher original de 06b

// -------------------- ENEMIGOS DE LEYENDA --------------------
// --- Zona 1: Ruinas Ancestrales ---
function drawLegendGargoyle(o){ o.line='#3a3a4a'; o.eyeColor='#ffe14d'; o.pupil='#3a2a00';
const flap=Math.sin(frameCount*0.25)*6;
drawCreatureBase(o,{ bodyColor:'#8a8a9a', bodyColor2:'#55556a', headColor:'#9a9aaa', line:'#3a3a4a',
back:function(){ monBatWing(-1,-2,-2,24,flap,'#6a6a7a'); monBatWing(1,2,-2,24,-flap,'#6a6a7a'); },
ears:function(){ for(const s of [1,-1]) flatPoly([[s*6,-18],[s*12,-28],[s*10,-14]],'#7a7a8a',CAT_LINE,2); },
extra:function(){ monHorn(1,4,o.headY-8,8,'#5a5a6a',2); monHorn(-1,-4,o.headY-8,8,'#5a5a6a',-2);
ctx.strokeStyle='#4a4a5a'; ctx.lineWidth=1.4;
ctx.beginPath(); ctx.moveTo(-6,o.bodyY-4); ctx.lineTo(-2,o.bodyY+2); ctx.lineTo(-6,o.bodyY+8); ctx.moveTo(5,o.bodyY-6); ctx.lineTo(8,o.bodyY); ctx.stroke();
flatPoly([[-6,10],[6,10],[4,16],[-4,16]],'#6a6a7a',CAT_LINE,1.6); } }); }

function drawLegendTemplar(o){ o.line='#3a2a10'; o.eyeColor='#ffdd55'; o.pupil='#3a2a00';
drawCreatureBase(o,{ bodyColor:'#b8a060', bodyColor2:'#6a5a2a', headColor:'#c8b070', line:'#3a2a10', mouth:false,
back:function(){ flatLimb(-14,6,-20,-14,'#6b4423',4); flatPoly([[-24,-18],[-16,-22],[-16,-10]],'#c0c0c0',CAT_LINE,1.6); },
extra:function(){
ctx.fillStyle='#8a7a4a'; ctx.beginPath(); ctx.arc(0,o.headY,o.headR+2,Math.PI,0); ctx.closePath(); ctx.fill();
ctx.strokeStyle='#3a2a10'; ctx.lineWidth=2; ctx.stroke();
ctx.fillStyle='#2a2018'; ctx.fillRect(-o.headR,o.eyeY-2,o.headR*2,4);
ctx.fillStyle='#ffdd55'; ctx.beginPath(); ctx.arc(-4,o.eyeY,1.6,0,Math.PI*2); ctx.arc(4,o.eyeY,1.6,0,Math.PI*2); ctx.fill();
flatPoly([[0,o.headY-o.headR-8],[3,o.headY-o.headR],[0,o.headY-o.headR+2],[-3,o.headY-o.headR]],'#cc3333',CAT_LINE,1.2);
ctx.fillStyle='#6a5a2a'; catRoundRect(12,-6,10,16,3); ctx.fill(); ctx.strokeStyle='#3a2a10'; ctx.lineWidth=2; ctx.stroke();
ctx.fillStyle='#ffd700'; ctx.beginPath(); ctx.arc(17,2,3,0,Math.PI*2); ctx.fill(); } }); }

// --- Zona 2: Caldera del Magma ---
function drawLegendMagmaSlime(o){ o.line='#5a1100'; o.eyeColor='#ffee88'; o.pupil='#882200'; o.angry=false;
drawCreatureBase(o,{ noLegs:true, noBelly:true, noHead:true, line:'#5a1100',
extra:function(){
ctx.fillStyle='rgba(255,120,0,0.5)'; ctx.beginPath(); ctx.ellipse(0,o.bodyY+7,o.bodyRx+4,6,0,0,Math.PI*2); ctx.fill();
ctx.fillStyle='#ffaa33';
for(let i=0;i<3;i++){ const t=(frameCount*0.04+i*0.8)%2; ctx.beginPath(); ctx.arc(-8+i*8,o.bodyY-6-t*6,2.4-(i%2),0,Math.PI*2); ctx.fill(); }
ctx.strokeStyle='#882200'; ctx.lineWidth=1.6; ctx.lineCap='round';
ctx.beginPath(); ctx.moveTo(-8,o.bodyY+3); ctx.quadraticCurveTo(-4,o.bodyY+7,0,o.bodyY+3); ctx.quadraticCurveTo(4,o.bodyY-1,8,o.bodyY+3); ctx.stroke(); ctx.lineCap='butt';
o.eyeY=o.bodyY-6; o.eyeX=5; o.eyeRx=3; o.eyeRy=3.6;
creatureEye(1,o); creatureEye(-1,o); } }); }

function drawLegendEmberBat(o){ o.line='#4a1100'; o.eyeColor='#ffee44'; o.pupil='#441100';
o.bodyRx=9; o.bodyRy=8; o.headR=9; o.headY=-11; o.eyeX=4; o.eyeY=-12; o.eyeRx=2.6; o.eyeRy=3.2; o.legX=4; o.legTop=6; o.legBot=12; o.legW=3;
const flap=Math.sin(frameCount*0.35)*8;
drawCreatureBase(o,{ bodyColor:'#ff8844', bodyColor2:'#993311', headColor:'#ff9955', line:'#4a1100',
back:function(){ monBatWing(-1,-2,-2,20,flap,'#cc5522'); monBatWing(1,2,-2,20,-flap,'#cc5522');
ctx.fillStyle='rgba(255,140,40,0.5)';
for(let i=0;i<3;i++){ const t=(frameCount*0.06+i*0.7)%2; ctx.beginPath(); ctx.arc(10+i*4,4+t*6,2-(i%2),0,Math.PI*2); ctx.fill(); } },
ears:function(){ for(const s of [1,-1]) flatPoly([[s*5,-15],[s*10,-24],[s*8,-12]],'#ff9955',CAT_LINE,2); } }); }

// --- Zona 3: Islas Flotantes ---
function drawLegendHarpy(o){ o.line='#225577'; o.eyeColor='#88eeff'; o.pupil='#114455';
const flap=Math.sin(frameCount*0.22)*7;
drawCreatureBase(o,{ bodyColor:'#aaddff', bodyColor2:'#4488aa', headColor:'#cfeeff', line:'#225577',
back:function(){ monBatWing(-1,-3,-4,26,flap,'#77bbee'); monBatWing(1,3,-4,26,-flap,'#77bbee'); },
extra:function(){
ctx.strokeStyle='#e8f8ff'; ctx.lineWidth=2.4; ctx.lineCap='round';
for(let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(-4+i*3,o.headY-8); ctx.quadraticCurveTo(6+i*4,o.headY-12+Math.sin(frameCount*0.1+i)*2,14+i*4,o.headY-6+i*2); ctx.stroke(); }
ctx.lineCap='butt';
ctx.strokeStyle='#ffcc66'; ctx.lineWidth=2; ctx.lineCap='round';
for(const s of [1,-1]){ ctx.beginPath(); ctx.moveTo(s*6,o.bodyY+8); ctx.lineTo(s*8,o.bodyY+14); ctx.moveTo(s*6,o.bodyY+8); ctx.lineTo(s*4,o.bodyY+14); ctx.stroke(); }
ctx.lineCap='butt'; } }); }

function drawLegendGaleWolf(o){ o.line='#335577';
const legA=Math.sin(o.walk*2)*3;
drawCreatureBase(o,{ noLegs:true, noHead:true, noBelly:true, line:'#335577',
back:function(){ ctx.strokeStyle='rgba(200,230,255,0.5)'; ctx.lineWidth=2.4; ctx.lineCap='round';
for(let i=0;i<3;i++){ const y=-6+i*7; ctx.beginPath(); ctx.moveTo(14+i*3,y); ctx.lineTo(28+i*6,y+(i-1)*2); ctx.stroke(); } ctx.lineCap='butt';
for(const s of [1,-1]){ flatLimb(s*6,8,s*8,22+(s>0?legA:-legA),o.color2,4.5); flatLimb(s*13,8,s*15,22-(s>0?legA:-legA),o.color2,4.5); } },
extra:function(){ flatBall(-2,2,15,10,o.color,monsterLight(o.color),2,'#335577'); flatBall(-15,-6,9,8,o.color,monsterLight(o.color),2,'#335577');
flatPoly([[-22,-8],[-28,-4],[-20,0]],'#ffffff',CAT_LINE,1.6);
flatPoly([[-12,-13],[-9,-21],[-6,-12]],'#ddeeff',CAT_LINE,1.6); flatPoly([[-19,-12],[-18,-20],[-14,-11]],'#ddeeff',CAT_LINE,1.6);
ctx.fillStyle='#88ccff'; ctx.beginPath(); ctx.arc(-18,-8,1.8,0,Math.PI*2); ctx.arc(-12,-8,1.8,0,Math.PI*2); ctx.fill();
ctx.fillStyle='#113344'; ctx.beginPath(); ctx.arc(-18,-7.6,0.9,0,Math.PI*2); ctx.arc(-12,-7.6,0.9,0,Math.PI*2); ctx.fill();
ctx.strokeStyle='rgba(220,240,255,0.8)'; ctx.lineWidth=2; ctx.lineCap='round';
for(let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(-8+i*4,-12); ctx.quadraticCurveTo(2+i*4,-18+Math.sin(frameCount*0.15+i)*2,10+i*5,-14+i*2); ctx.stroke(); }
ctx.lineCap='butt'; } }); }

// --- Zona 4: Fosa Abisal ---
function drawLegendAngler(o){ o.line='#0a1a33'; o.eyeColor='#ffee66'; o.pupil='#332200';
const lure=Math.sin(frameCount*0.1)*3;
drawCreatureBase(o,{ noLegs:true, bodyColor:'#334466', bodyColor2:'#112233', headColor:'#3a4a70', line:'#0a1a33',
back:function(){ flatPoly([[12,0],[24,-8],[24,8]],'#223355',CAT_LINE,1.8); },
extra:function(){
ctx.strokeStyle='#223355'; ctx.lineWidth=2; ctx.lineCap='round';
ctx.beginPath(); ctx.moveTo(0,o.headY-o.headR); ctx.quadraticCurveTo(-6,o.headY-o.headR-10,-12+lure,o.headY-o.headR-6); ctx.stroke(); ctx.lineCap='butt';
const g=0.6+Math.sin(frameCount*0.15)*0.3;
ctx.fillStyle='rgba(255,240,120,'+g+')'; ctx.beginPath(); ctx.arc(-12+lure,o.headY-o.headR-6,3.4,0,Math.PI*2); ctx.fill();
ctx.fillStyle='#fff';
for(let i=0;i<4;i++){ flatPoly([[-8+i*4,o.headY+6],[-6+i*4,o.headY+11],[-4+i*4,o.headY+6]],'#fff',CAT_LINE,1); }
flatPoly([[-4,o.bodyY-8],[2,o.bodyY-14],[6,o.bodyY-8]],'#223355',CAT_LINE,1.6); } }); }

function drawLegendCrabTitan(o){ o.line='#441111'; o.eyeColor='#ffee44'; o.pupil='#442200';
const snap=Math.sin(frameCount*0.12)*2;
drawCreatureBase(o,{ noLegs:true, bodyColor:'#cc4444', bodyColor2:'#772222', headColor:'#dd5555', line:'#441111',
back:function(){ for(const s of [1,-1]){ for(let i=0;i<3;i++){ const bx=s*8, by=4+i*5; flatLimb(bx,by,s*(24+i*2),by+6,'#993333',3.6); } } },
extra:function(){
for(const s of [1,-1]){
flatLimb(s*12,-2,s*20,-8+snap*s,'#993333',5);
flatBall(s*24,-10+snap*s,8,6,'#cc4444',monsterLight('#cc4444'),2,'#441111');
flatPoly([[s*24,-16+snap*s],[s*32,-12+snap*s],[s*24,-8+snap*s]],'#ee6666',CAT_LINE,1.6);
}
for(const s of [1,-1]){ ctx.strokeStyle='#993333'; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(s*4,o.headY-6); ctx.lineTo(s*6,o.headY-12); ctx.stroke();
ctx.fillStyle='#ffee44'; ctx.beginPath(); ctx.arc(s*6,o.headY-13,2.4,0,Math.PI*2); ctx.fill();
ctx.fillStyle='#442200'; ctx.beginPath(); ctx.arc(s*6,o.headY-13,1,0,Math.PI*2); ctx.fill(); } } }); }

// --- Zona 5: Fábrica de Engranajes ---
function drawLegendGearSpider(o){ o.line='#223344';
const legA=Math.sin(o.walk*2)*2.4;
drawCreatureBase(o,{ noLegs:true, noHead:true, noBelly:true, line:'#223344',
back:function(){ for(const s of [1,-1]){ for(let i=0;i<4;i++){ const bx=s*6, by=-6+i*5, kx=s*(18+i*3);
flatLimb(bx,by,kx,by-5+(i%2?legA:-legA),'#556677',3); flatLimb(kx,by-5+(i%2?legA:-legA),s*(22+i*3),by+6,'#556677',3); } } },
extra:function(){ flatBall(0,2,13,11,o.color,monsterLight(o.color),2,'#223344'); flatBall(-13,-2,8,8,'#667788','#8899aa',2,'#223344');
const rot=frameCount*0.08;
ctx.save(); ctx.translate(2,0); ctx.rotate(rot);
ctx.fillStyle='#445566';
for(let i=0;i<6;i++){ ctx.save(); ctx.rotate(i*Math.PI/3); ctx.fillRect(6,-2.4,5,4.8); ctx.restore(); }
ctx.beginPath(); ctx.arc(0,0,7,0,Math.PI*2); ctx.fill();
ctx.fillStyle='#223344'; ctx.beginPath(); ctx.arc(0,0,3,0,Math.PI*2); ctx.fill();
ctx.restore();
ctx.fillStyle='#ff4444';
const eyes=[[-16,-5],[-13,-7],[-12,-2],[-17,-1]];
for(const p of eyes){ ctx.beginPath(); ctx.arc(p[0],p[1],1.6,0,Math.PI*2); ctx.fill(); } } }); }

function drawLegendSteamGolem(o){ o.line='#2a3322';
const puff=(frameCount*0.03)%2;
drawCreatureBase(o,{ noHead:true, bodyColor:'#aabb99', bodyColor2:'#556644', line:'#2a3322',
back:function(){ flatBall(-12,18,8,8,o.color2,monsterLight(o.color2),2,'#2a3322'); flatBall(12,18,8,8,o.color2,monsterLight(o.color2),2,'#2a3322');
flatBall(-22,4,9,12,'#889977','#aabb99',2,'#2a3322'); flatBall(22,4,9,12,'#889977','#aabb99',2,'#2a3322'); },
extra:function(){ flatBall(0,4,17,14,o.color,monsterLight(o.color),2,'#2a3322'); flatBall(0,-14,11,10,'#889977','#aabb99',2,'#2a3322');
ctx.fillStyle='#667755'; catRoundRect(-8,o.bodyY-6,16,12,3); ctx.fill(); ctx.strokeStyle='#2a3322'; ctx.lineWidth=1.6; ctx.stroke();
ctx.fillStyle='#334422';
const riv=[[-6,-3],[0,-3],[6,-3],[-6,3],[0,3],[6,3]];
for(const p of riv){ ctx.beginPath(); ctx.arc(p[0],o.bodyY+p[1],1.2,0,Math.PI*2); ctx.fill(); }
ctx.fillStyle='#556644'; ctx.fillRect(6,o.headY-o.headR-8,5,10);
ctx.fillStyle='rgba(230,230,220,'+(0.55-puff*0.2)+')';
ctx.beginPath(); ctx.arc(8,o.headY-o.headR-12-puff*8,4+puff*3,0,Math.PI*2); ctx.fill();
o.eyeX=4.6; o.eyeY=-14; o.eyeColor='#ffee88'; o.pupil='#554400'; o.angry=false;
creatureEye(1,o); creatureEye(-1,o); } }); }

// --- Zona 6: Umbral del Vacío ---
function drawLegendVoidEye(o){ o.line='#220044';
const pulse=1+Math.sin(frameCount*0.12)*0.08;
drawCreatureBase(o,{ noLegs:true, noHead:true, noBelly:true, line:'#220044',
back:function(){
ctx.strokeStyle='#6633aa'; ctx.lineWidth=3; ctx.lineCap='round';
for(let i=0;i<5;i++){ const a=Math.PI*0.15+i*Math.PI*0.175; const w=Math.sin(frameCount*0.08+i)*4;
ctx.beginPath(); ctx.moveTo(Math.cos(a)*10,Math.sin(a)*8+2); ctx.quadraticCurveTo(Math.cos(a)*20+w,Math.sin(a)*16+6,Math.cos(a)*26+w,Math.sin(a)*22+10); ctx.stroke(); }
ctx.lineCap='butt'; },
extra:function(){
flatBall(0,0,15*pulse,14*pulse,'#e8ddff','#ffffff',2,'#220044');
ctx.fillStyle='#aa66ff'; ctx.beginPath(); ctx.arc(0,0,8*pulse,0,Math.PI*2); ctx.fill();
ctx.fillStyle='#220044'; ctx.beginPath(); ctx.arc(0,0,4*pulse,0,Math.PI*2); ctx.fill();
ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(-3,-3,2,0,Math.PI*2); ctx.fill();
ctx.strokeStyle='rgba(190,120,255,0.6)'; ctx.lineWidth=1.6;
ctx.beginPath(); ctx.arc(0,0,20+Math.sin(frameCount*0.1)*2,0,Math.PI*2); ctx.stroke(); } }); }

function drawLegendStarWraith(o){ o.line='#334466';
const wave=Math.sin(frameCount*0.14)*2;
drawCreatureBase(o,{ noLegs:true, noBelly:true, headColor:'#dde8ff', line:'#334466',
extra:function(){ const bot=22+wave;
ctx.fillStyle='rgba(190,210,255,0.85)'; ctx.beginPath();
ctx.moveTo(-o.bodyRx,o.bodyY); ctx.quadraticCurveTo(-o.bodyRx,o.bodyY+16,-o.bodyRx+2,bot);
ctx.lineTo(-o.bodyRx*0.45,bot-5); ctx.lineTo(-o.bodyRx*0.1,bot); ctx.lineTo(o.bodyRx*0.35,bot-5); ctx.lineTo(o.bodyRx*0.8,bot);
ctx.quadraticCurveTo(o.bodyRx,o.bodyY+16,o.bodyRx,o.bodyY); ctx.closePath(); ctx.fill();
ctx.strokeStyle='#334466'; ctx.lineWidth=2; ctx.stroke();
ctx.fillStyle='#ffffff';
for(let i=0;i<5;i++){ const a=frameCount*0.05+i*1.25; const r=16+Math.sin(frameCount*0.09+i)*3;
ctx.globalAlpha=0.4+0.6*Math.abs(Math.sin(frameCount*0.1+i*2));
ctx.beginPath(); ctx.arc(Math.cos(a)*r,Math.sin(a)*r*0.7,1.6,0,Math.PI*2); ctx.fill(); }
ctx.globalAlpha=1; },
face:function(){ ctx.fillStyle='#1a2244'; ctx.beginPath();
ctx.ellipse(-4.6,o.eyeY,3,4.2,0,0,Math.PI*2); ctx.ellipse(4.6,o.eyeY,3,4.2,0,0,Math.PI*2); ctx.fill();
ctx.fillStyle='#88ccff'; ctx.beginPath(); ctx.arc(-4.6,o.eyeY,1.2,0,Math.PI*2); ctx.arc(4.6,o.eyeY,1.2,0,Math.PI*2); ctx.fill(); } }); }

// -------------------- JEFES DE LEYENDA --------------------
function drawBossRuinKing(o){ o.line='#4a3a18'; o.eyeColor='#ffe14d'; o.pupil='#3a2a00';
drawCreatureBase(o,{ bodyColor:'#c8b070', bodyColor2:'#6a5a2a', headColor:'#d8c080', line:'#4a3a18',
back:function(){
for(const s of [1,-1]){ ctx.fillStyle='#8a7a5a'; ctx.fillRect(s*16-6,-14,12,34); ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(s*16-6,-14,4,34);
ctx.fillStyle='#9a8a6a'; ctx.fillRect(s*16-9,-20,18,6); } },
extra:function(){
for(let i=-2;i<=2;i++){ const h=10-Math.abs(i)*3; flatPoly([[i*7-3,o.headY-o.headR+1],[i*7,o.headY-o.headR-h],[i*7+3,o.headY-o.headR+1]],'#9a8a6a','#4a3a18',1.4); }
const g=0.5+Math.sin(frameCount*0.1)*0.3;
ctx.strokeStyle='rgba(255,220,120,'+g+')'; ctx.lineWidth=1.6; ctx.lineCap='round';
ctx.beginPath(); ctx.moveTo(-8,-4); ctx.lineTo(-3,2); ctx.lineTo(-7,10); ctx.moveTo(7,-6); ctx.lineTo(3,0); ctx.lineTo(8,8); ctx.stroke(); ctx.lineCap='butt';
ctx.fillStyle='rgba(70,140,60,0.6)';
ctx.beginPath(); ctx.ellipse(-10,o.bodyY+8,6,3,0,0,Math.PI*2); ctx.ellipse(9,o.bodyY+6,5,2.6,0,0,Math.PI*2); ctx.fill(); } }); }

function drawBossMagmaWyrm(o){ o.line='#441100'; o.eyeColor='#ffee44'; o.pupil='#441100';
drawCreatureBase(o,{ noLegs:true, bodyColor:'#ff6600', bodyColor2:'#882200', headColor:'#ff7722', line:'#441100',
back:function(){
for(let i=1;i<=4;i++){ const x=10+i*11; const y=4+Math.sin(frameCount*0.12+i*0.8)*5;
flatBall(x,y,10-i*1.4,9-i*1.3,'#cc4400','#ff7733',2,'#441100'); }
ctx.fillStyle='rgba(255,150,0,0.8)';
for(let i=0;i<4;i++){ const x=8+i*11; const y=4+Math.sin(frameCount*0.12+i*0.8)*5;
flatPoly([[x-4,y-8],[x,y-16],[x+4,y-8]],'rgba(255,150,0,0.8)'); } },
extra:function(){
monHorn(1,6,o.headY-6,12,'#221100',3); monHorn(-1,-6,o.headY-6,12,'#221100',-3);
ctx.fillStyle='rgba(255,180,60,0.8)';
for(let i=0;i<5;i++){ const a=frameCount*0.09+i*1.25; ctx.beginPath(); ctx.arc(Math.cos(a)*26,Math.sin(a)*14,2.6,0,Math.PI*2); ctx.fill(); }
ctx.fillStyle='rgba(255,220,80,0.9)';
flatPoly([[-6,o.headY+6],[0,o.headY+12],[6,o.headY+6]],'rgba(255,220,80,0.9)'); } }); }

function drawBossSkyTitan(o){ o.line='#224466'; o.eyeColor='#aaeeff'; o.pupil='#113344';
const flap=Math.sin(frameCount*0.14)*8;
drawCreatureBase(o,{ bodyColor:'#bfe8ff', bodyColor2:'#5588bb', headColor:'#d8f2ff', line:'#224466',
back:function(){
for(const s of [1,-1]){ ctx.fillStyle='rgba(255,255,255,0.85)';
ctx.beginPath(); ctx.ellipse(s*20,-6+flap*0.3*s,16,9,0,0,Math.PI*2); ctx.ellipse(s*30,-2+flap*0.3*s,12,7,0,0,Math.PI*2); ctx.fill(); } },
extra:function(){
ctx.strokeStyle='#ffee88'; ctx.lineWidth=2.4; ctx.lineCap='round';
for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(i*6,o.headY-o.headR); ctx.lineTo(i*6+2,o.headY-o.headR-8); ctx.lineTo(i*6-1,o.headY-o.headR-12); ctx.stroke(); }
ctx.lineCap='butt';
if(frameCount%90<12){ ctx.strokeStyle='rgba(255,240,120,0.9)'; ctx.lineWidth=3; ctx.lineCap='round';
ctx.beginPath(); ctx.moveTo(18,-20); ctx.lineTo(24,-8); ctx.lineTo(19,-6); ctx.lineTo(26,8); ctx.stroke(); ctx.lineCap='butt'; }
const g=0.5+Math.sin(frameCount*0.12)*0.3;
ctx.fillStyle='rgba(160,220,255,'+g+')'; ctx.beginPath(); ctx.arc(0,o.bodyY,7,0,Math.PI*2); ctx.fill(); } }); }

function drawBossAbyssLord(o){ o.line='#04102a'; o.eyeColor='#66ffee'; o.pupil='#003322';
const sway=Math.sin(frameCount*0.1)*3;
drawCreatureBase(o,{ noLegs:true, bodyColor:'#224488', bodyColor2:'#0a1a44', headColor:'#2a5599', line:'#04102a',
back:function(){
flatPoly([[12,4],[30,-4+sway],[26,10+sway]],'#1a3366',CAT_LINE,2);
for(let i=0;i<3;i++){ flatPoly([[2+i*8,o.bodyY-10],[6+i*8,o.bodyY-20],[10+i*8,o.bodyY-10]],'#1a3366',CAT_LINE,1.6); } },
extra:function(){
ctx.fillStyle='#0a1a44';
ctx.beginPath(); ctx.moveTo(-o.headR,o.headY+4); ctx.quadraticCurveTo(0,o.headY+14,o.headR,o.headY+4); ctx.quadraticCurveTo(0,o.headY+8,-o.headR,o.headY+4); ctx.closePath(); ctx.fill();
ctx.fillStyle='#fff';
for(let i=0;i<5;i++){ flatPoly([[-8+i*4,o.headY+5],[-6+i*4,o.headY+10],[-4+i*4,o.headY+5]],'#fff',CAT_LINE,1); }
ctx.strokeStyle='#66ffee'; ctx.lineWidth=1.8; ctx.lineCap='round';
for(const s of [1,-1]){ ctx.beginPath(); ctx.moveTo(s*6,o.headY+8); ctx.quadraticCurveTo(s*10,o.headY+16,s*8+sway,o.headY+22); ctx.stroke(); }
ctx.lineCap='butt';
ctx.fillStyle='rgba(100,200,255,0.35)';
for(let i=0;i<4;i++){ ctx.beginPath(); ctx.ellipse(-6+i*6,o.bodyY+2,3.4,2.2,0,0,Math.PI*2); ctx.fill(); } } }); }

function drawBossMachineGod(o){ o.line='#22303a'; o.eyeColor='#88ffee'; o.pupil='#003322';
const rot=frameCount*0.06;
drawCreatureBase(o,{ bodyColor:'#ccddee', bodyColor2:'#556677', headColor:'#dde8f2', line:'#22303a',
back:function(){
ctx.save(); ctx.translate(0,o.headY-o.headR-10); ctx.rotate(rot);
ctx.fillStyle='#8899aa';
for(let i=0;i<8;i++){ ctx.save(); ctx.rotate(i*Math.PI/4); ctx.fillRect(10,-2.6,6,5.2); ctx.restore(); }
ctx.beginPath(); ctx.arc(0,0,11,0,Math.PI*2); ctx.fill();
ctx.fillStyle='#22303a'; ctx.beginPath(); ctx.arc(0,0,4.5,0,Math.PI*2); ctx.fill();
ctx.restore(); },
extra:function(){
ctx.fillStyle='#8899aa'; catRoundRect(-10,o.bodyY-7,20,14,3); ctx.fill(); ctx.strokeStyle='#22303a'; ctx.lineWidth=1.6; ctx.stroke();
ctx.fillStyle='#334455';
const riv=[[-7,-4],[0,-4],[7,-4],[-7,3],[0,3],[7,3]];
for(const p of riv){ ctx.beginPath(); ctx.arc(p[0],o.bodyY+p[1],1.3,0,Math.PI*2); ctx.fill(); }
for(const s of [1,-1]){ flatLimb(s*13,-2,s*20,8,'#778899',5); ctx.fillStyle='#556677'; ctx.beginPath(); ctx.arc(s*20,8,4,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#22303a'; ctx.lineWidth=1.4; ctx.stroke(); }
const g=0.6+Math.sin(frameCount*0.14)*0.3;
ctx.fillStyle='rgba(120,255,220,'+g+')'; ctx.beginPath(); ctx.arc(0,o.bodyY,5,0,Math.PI*2); ctx.fill();
ctx.strokeStyle='rgba(120,255,220,0.5)'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(0,o.bodyY,9+Math.sin(frameCount*0.1)*2,0,Math.PI*2); ctx.stroke(); } }); }

function drawBossVoidMonarch(o){ o.line='#110022'; o.eyeColor='#dd99ff'; o.pupil='#220044';
const flap=Math.sin(frameCount*0.12)*8;
drawCreatureBase(o,{ bodyColor:'#bb77ff', bodyColor2:'#330066', headColor:'#cc88ff', line:'#110022',
back:function(){
ctx.fillStyle='rgba(40,0,80,0.85)';
ctx.beginPath(); ctx.moveTo(-14,-8); ctx.quadraticCurveTo(-30,10+flap*0.4,-22,26); ctx.lineTo(22,26); ctx.quadraticCurveTo(30,10-flap*0.4,14,-8); ctx.closePath(); ctx.fill();
ctx.fillStyle='#ffffff';
for(let i=0;i<6;i++){ ctx.globalAlpha=0.4+0.6*Math.abs(Math.sin(frameCount*0.08+i*1.7)); ctx.beginPath(); ctx.arc(-14+i*6,8+(i%3)*6,1.4,0,Math.PI*2); ctx.fill(); }
ctx.globalAlpha=1; },
extra:function(){
ctx.strokeStyle='#eeccff'; ctx.lineWidth=2.2; ctx.lineCap='round';
for(let i=-2;i<=2;i++){ const tw=Math.abs(Math.sin(frameCount*0.1+i))*3;
ctx.beginPath(); ctx.moveTo(i*6,o.headY-o.headR); ctx.lineTo(i*7,o.headY-o.headR-9-tw); ctx.stroke();
ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.arc(i*7,o.headY-o.headR-11-tw,1.6,0,Math.PI*2); ctx.fill(); }
ctx.lineCap='butt';
const g=0.6+Math.sin(frameCount*0.12)*0.3;
ctx.fillStyle='rgba(180,100,255,'+g+')'; ctx.beginPath(); ctx.arc(0,o.bodyY,7,0,Math.PI*2); ctx.fill();
ctx.strokeStyle='rgba(220,160,255,0.6)'; ctx.lineWidth=1.8; ctx.beginPath(); ctx.arc(0,o.bodyY,12+Math.sin(frameCount*0.09)*3,0,Math.PI*2); ctx.stroke();
ctx.strokeStyle='rgba(150,80,255,0.4)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,36+Math.sin(frameCount*0.07)*4,0,Math.PI*2); ctx.stroke(); } }); }

// -------------------- DISPATCHER EXTENDIDO --------------------
const LEGEND_DRAW = {
  'E:gargoyle':   drawLegendGargoyle,
  'E:templar':    drawLegendTemplar,
  'E:magmaSlime': drawLegendMagmaSlime,
  'E:emberBat':   drawLegendEmberBat,
  'E:harpy':      drawLegendHarpy,
  'E:galeWolf':   drawLegendGaleWolf,
  'E:angler':     drawLegendAngler,
  'E:crabTitan':  drawLegendCrabTitan,
  'E:gearSpider': drawLegendGearSpider,
  'E:steamGolem': drawLegendSteamGolem,
  'E:voidEye':    drawLegendVoidEye,
  'E:starWraith': drawLegendStarWraith,
  'B:ruinking':   drawBossRuinKing,
  'B:magmawyrm':  drawBossMagmaWyrm,
  'B:skytitan':   drawBossSkyTitan,
  'B:abysslord':  drawBossAbyssLord,
  'B:machinegod': drawBossMachineGod,
  'B:voidmonarch':drawBossVoidMonarch,
};
// v59 FIX: ASIGNACIÓN, no declaración. Así _baseDrawEnemy conserva el
// dispatcher de 06b y no hay recursión infinita.
window.drawEnemy = function (e, opts) {
  const fn = LEGEND_DRAW[enemyKind(e)];
  if (!fn) { _baseDrawEnemy(e, opts); return; }
  const scale = e.scale;
  const hideHud = !!(opts && opts.hideHud);
  const bounce = pxSnap(Math.sin(e.walkCycle) * 1.5);
  const lunge = e.attackAnim > 0 ? -pxSnap(e.attackAnim * 0.7) : 0;
  const attackScale = e.attackAnim > 0 ? 1.12 : 1;
  ctx.save();
  ctx.translate(e.x + lunge, e.y + bounce);
  ctx.scale(attackScale * scale, attackScale * scale);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, GROUND_Y - e.y - bounce, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
  fn(enemyBase(e));
  if (e.poisonTimer > 0) {
    ctx.strokeStyle = 'rgba(120,255,110,0.75)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 23 + Math.sin(frameCount * 0.3) * 2, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  if (hideHud) return;
  const barW = 28 * scale, barY = e.y - 38 * scale + bounce;
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(e.x - barW/2 - 1, barY - 1, barW + 2, 6);
  ctx.fillStyle = '#000'; ctx.fillRect(e.x - barW/2, barY, barW, 4);
  ctx.fillStyle = '#f00'; ctx.fillRect(e.x - barW/2, barY, barW * Math.max(0, e.hp / e.maxHp), 4);
  if (e.isBoss) {
    ctx.fillStyle = '#ff5555'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.strokeText('👑 ' + e.name, e.x, e.y - 50 * scale + bounce);
    ctx.fillText('👑 ' + e.name, e.x, e.y - 50 * scale + bounce);
    if (e.hp <= e.maxHp * 0.5) {
      ctx.fillStyle = '#ffaa00'; ctx.font = 'bold 10px Arial';
      ctx.strokeText('🛡️ Inmune al cañón', e.x, e.y - 38 * scale + bounce);
      ctx.fillText('🛡️ Inmune al cañón', e.x, e.y - 38 * scale + bounce);
    }
  }
};