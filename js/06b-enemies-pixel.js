// ============================================================
// 06b-enemies-pixel.js — v46: Enemigos/jefes pixel-art portados
// a NUESTRO pipeline clásico (ctx visible, sin sceneCanvas).
// Se carga después de 06-render.js → su drawEnemy() reemplaza al anterior.
// Los gatos NO se tocan (siguen siendo los nuestros).
// ============================================================
function pxSnap(v){ return Math.round(v); }
function mixHex(a,b,t){
  if(typeof a!=='string'||a[0]!=='#'||a.length!==7) return a;
  if(typeof b!=='string'||b[0]!=='#'||b.length!==7) return b;
  const na=parseInt(a.slice(1),16), nb=parseInt(b.slice(1),16);
  const r=Math.round(((na>>16)&255)*(1-t)+((nb>>16)&255)*t);
  const g=Math.round(((na>>8)&255)*(1-t)+((nb>>8)&255)*t);
  const bl=Math.round((na&255)*(1-t)+(nb&255)*t);
  return '#'+((1<<24)+(r<<16)+(g<<8)+bl).toString(16).slice(1);
}
const CAT_LINE='#2a1c10';
function monsterLight(hex){ return mixHex(hex,'#ffffff',0.22); }
function monLine(col){
  if(typeof col!=='string'||col[0]!=='#'||col.length!==7) return CAT_LINE;
  const n=parseInt(col.slice(1),16);
  const lum=(((n>>16)&255)+((n>>8)&255)+(n&255))/3;
  return lum<78?mixHex(col,'#ffffff',0.5):CAT_LINE;
}
function catRoundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}
function flatBall(cx,cy,rx,ry,base,light,lineW,line){
  ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2); ctx.fillStyle=base; ctx.fill();
  if(light&&light!==base){
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2); ctx.clip();
    ctx.fillStyle=light; ctx.beginPath(); ctx.ellipse(cx-rx*0.24,cy-ry*0.30,rx,ry,0,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
  ctx.strokeStyle=line||CAT_LINE; ctx.lineWidth=lineW||2; ctx.stroke();
}
function flatPoly(pts,fill,line,lw){
  ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]);
  ctx.closePath();
  if(fill){ ctx.fillStyle=fill; ctx.fill(); }
  if(line){ ctx.strokeStyle=line; ctx.lineWidth=lw||2; ctx.lineJoin='round'; ctx.stroke(); }
}
function flatLimb(x1,y1,x2,y2,color,w){
  ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
  ctx.strokeStyle=CAT_LINE; ctx.lineWidth=w+2.6; ctx.stroke();
  ctx.strokeStyle=color; ctx.lineWidth=w; ctx.stroke();
  ctx.lineCap='butt';
}
function monBatWing(s,ox,oy,span,flap,col){
  ctx.save(); ctx.translate(ox,oy);
  ctx.beginPath();
  ctx.moveTo(s*4,-2);
  ctx.quadraticCurveTo(s*(span*0.62),-11-flap,s*span,-5+flap*0.4);
  ctx.quadraticCurveTo(s*(span*0.64),2+flap*0.5,s*(span*0.5),6);
  ctx.quadraticCurveTo(s*(span*0.34),2,s*5,6);
  ctx.closePath();
  ctx.fillStyle=col; ctx.fill();
  ctx.strokeStyle=CAT_LINE; ctx.lineWidth=1.8; ctx.lineJoin='round'; ctx.stroke();
  ctx.strokeStyle=CAT_LINE; ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(s*5,0); ctx.lineTo(s*span*0.92,-4+flap*0.35);
  ctx.moveTo(s*5,3); ctx.lineTo(s*span*0.5,3);
  ctx.stroke();
  ctx.restore();
}
function monHorn(s,x,y,len,col,bend){
  bend=bend||0; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x,y);
  ctx.quadraticCurveTo(x+s*len*0.45,y-len*0.75,x+s*(len*0.85)+bend,y-len);
  ctx.strokeStyle=CAT_LINE; ctx.lineWidth=7; ctx.stroke();
  ctx.strokeStyle=col; ctx.lineWidth=4.4; ctx.stroke();
  ctx.lineCap='butt';
}
function creatureEye(s,o){
  const ex=s*o.eyeX, ey=o.eyeY;
  if(o.eyeBack){ ctx.fillStyle=o.eyeBack; ctx.beginPath(); ctx.ellipse(ex,ey,o.eyeRx,o.eyeRy,0,0,Math.PI*2); ctx.fill(); }
  const k=o.eyeBack?0.72:1;
  ctx.fillStyle=o.eyeColor; ctx.beginPath(); ctx.ellipse(ex,ey,o.eyeRx*k,o.eyeRy*k,0,0,Math.PI*2); ctx.fill();
  if(o.pupil){ ctx.fillStyle=o.pupil; ctx.beginPath(); ctx.ellipse(ex,ey+0.4,o.pupilRx,o.pupilRy,0,0,Math.PI*2); ctx.fill(); }
  ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(ex-o.eyeRx*0.32,ey-o.eyeRy*0.4,0.9,0,Math.PI*2); ctx.fill();
  if(o.angry){
    ctx.strokeStyle=CAT_LINE; ctx.lineWidth=2; ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(s*(o.eyeX-o.eyeRx),ey-o.eyeRy-1.7);
    ctx.lineTo(s*(o.eyeX+o.eyeRx),ey-o.eyeRy*0.8);
    ctx.stroke(); ctx.lineCap='butt';
  }
}
function creatureMouth(o,deco){
  deco=deco||{};
  const my=deco.mouthY!=null?deco.mouthY:o.headY+o.headR*0.54;
  const mw=deco.mouthW||o.headR*0.46;
  ctx.strokeStyle=deco.mouthColor||o.mouth; ctx.lineWidth=1.7; ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(-mw,my); ctx.lineTo(-mw*0.5,my+2.6); ctx.lineTo(0,my); ctx.lineTo(mw*0.5,my+2.6); ctx.lineTo(mw,my);
  ctx.stroke(); ctx.lineCap='butt';
  if(deco.fangs!==false){
    ctx.fillStyle='#fff';
    ctx.beginPath();
    ctx.moveTo(-mw*0.44,my+1.4); ctx.lineTo(-mw*0.30,my+6); ctx.lineTo(-mw*0.16,my+1.4);
    ctx.moveTo(mw*0.16,my+1.4); ctx.lineTo(mw*0.30,my+6); ctx.lineTo(mw*0.44,my+1.4);
    ctx.fill();
  }
}
function creatureFace(o,deco){
  deco=deco||{};
  if((deco.eyes||'normal')==='normal'){ creatureEye(1,o); creatureEye(-1,o); }
  if(deco.mouth!==false) creatureMouth(o,deco);
}
function creatureLegs(o,col){
  const a=Math.sin(o.walk)*2.6, b=Math.sin(o.walk+Math.PI)*2.6;
  flatLimb(-o.legX,o.legTop,-o.legX-1,o.legBot+a,col,o.legW);
  flatLimb(o.legX,o.legTop,o.legX+1,o.legBot+b,col,o.legW);
}
function drawCreatureBase(o,deco){
  deco=deco||{};
  if(deco.back) deco.back();
  const body=deco.bodyColor||o.color, body2=deco.bodyColor2||o.color2, line=deco.line||o.line;
  if(!deco.noLegs) creatureLegs(o,body2);
  flatBall(0,o.bodyY,o.bodyRx,o.bodyRy,body,monsterLight(body),2,line);
  if(!deco.noBelly){ ctx.fillStyle='rgba(255,255,255,0.14)'; ctx.beginPath(); ctx.ellipse(0,o.bodyY+o.bodyRy*0.34,o.bodyRx*0.5,o.bodyRy*0.42,0,0,Math.PI*2); ctx.fill(); }
  if(!deco.noHead){
    if(deco.ears) deco.ears();
    const hc=deco.headColor||body;
    flatBall(0,o.headY,o.headR,o.headR,hc,deco.headLight||monsterLight(hc),2,line);
    if(deco.face) deco.face(); else creatureFace(o,deco);
  }
  if(deco.extra) deco.extra();
}
function enemyBase(e){
  const color=e.color;
  return { e:e, attack:e.attackAnim, walk:e.walkCycle, fly:e.unitType==='flying',
    color:color, color2:e.color2||color, line:monLine(color),
    bodyRx:13, bodyRy:11.5, bodyY:3, headR:11.5, headY:-15,
    eyeX:5, eyeY:-16, eyeRx:3.2, eyeRy:4.2, eyeBack:null, eyeColor:'#ff2b2b',
    pupil:'#1c0000', pupilRx:1.3, pupilRy:2.6, angry:true, mouth:'#3a0d0d',
    legX:7, legTop:11, legBot:21, legW:5 };
}
// ---------- ENEMIGOS NORMALES ----------
function drawEnemyOrc(o){ o.headR=11; o.headY=-15; o.eyeColor='#ffd23a'; o.pupil='#2a1400'; o.mouth='#4a1010';
  drawCreatureBase(o,{ bodyColor:'#6f7a55', bodyColor2:'#464f34', headColor:'#6f7a55', line:CAT_LINE,
    back:function(){ flatLimb(-13,7,-23,-11,'#6b4423',5); flatBall(-24,-13,5.4,6.4,'#8a5a2b',monsterLight('#8a5a2b'),2); },
    ears:function(){ for(const s of [1,-1]) flatPoly([[s*9,-20],[s*16,-27],[s*12,-16]],'#6f7a55',CAT_LINE,2); },
    extra:function(){ flatPoly([[-4.6,-9],[-5.8,-13.5],[-2.4,-9]],'#f5efd8',CAT_LINE,1.2); flatPoly([[4.6,-9],[5.8,-13.5],[2.4,-9]],'#f5efd8',CAT_LINE,1.2); flatPoly([[-7,12],[7,12],[5,17],[-5,17]],'#5a3a1e',CAT_LINE,1.6); } }); }
function drawEnemyTank(o){ const metal='#6d7076', metalHi='#9aa0a8'; o.headR=12; o.headY=-15; o.eyeColor='#ff3a3a'; o.line='#15151a';
  drawCreatureBase(o,{ bodyColor:'#4a4d52', bodyColor2:'#2b2d31', headColor:'#4a4d52', line:'#15151a',
    back:function(){ flatBall(-16,4,9,12,'#8a5a2b','#a9743c',2.4); ctx.fillStyle=metal; ctx.beginPath(); ctx.arc(-16,4,3.4,0,Math.PI*2); ctx.fill(); ctx.strokeStyle=CAT_LINE; ctx.lineWidth=1.4; ctx.stroke(); },
    extra:function(){ flatBall(-13,-3,6,5,metal,metalHi,2,'#15151a'); flatBall(13,-3,6,5,metal,metalHi,2,'#15151a');
      const cy=o.eyeY-o.eyeRy-1, R=o.headR+1.6;
      ctx.fillStyle=metal; ctx.beginPath(); ctx.arc(0,cy,R,Math.PI,Math.PI*2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#15151a'; ctx.lineWidth=2; ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.arc(-3,cy+1,R*0.72,Math.PI*1.15,Math.PI*1.5); ctx.stroke();
      for(const s of [1,-1]) flatPoly([[s*7,cy-2],[s*12,cy-13],[s*13,cy]],metal,CAT_LINE,1.8); } }); }
function drawEnemyRunner(o){ o.bodyRx=10.5; o.bodyRy=10; o.headR=10; o.headY=-16; o.eyeColor='#ffe14d'; o.pupil='#3a1c00'; o.legX=6; o.legW=4.5;
  drawCreatureBase(o,{ bodyColor:'#a5561f', bodyColor2:'#6b3410', headColor:'#b3601f', line:CAT_LINE,
    back:function(){ ctx.strokeStyle='rgba(255,180,130,0.5)'; ctx.lineWidth=2.4; ctx.lineCap='round';
      for(let i=0;i<3;i++){ const y=-8+i*8; ctx.beginPath(); ctx.moveTo(15+i*3,y); ctx.lineTo(30+i*6,y+(i-1)*2); ctx.stroke(); } ctx.lineCap='butt'; },
    extra:function(){ ctx.fillStyle='#3a2a20'; catRoundRect(-9,-23,18,5,2.5); ctx.fill(); ctx.strokeStyle=CAT_LINE; ctx.lineWidth=1.6; ctx.stroke();
      ctx.fillStyle='#2a2a33'; ctx.beginPath(); ctx.arc(-5,-20.5,3,0,Math.PI*2); ctx.arc(5,-20.5,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(150,220,255,0.9)'; ctx.beginPath(); ctx.arc(-5.6,-21.4,1,0,Math.PI*2); ctx.arc(4.4,-21.4,1,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#e03030'; ctx.lineWidth=4; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(-4,0); ctx.quadraticCurveTo(10,-2,20,4); ctx.stroke(); ctx.lineCap='butt'; } }); }
function drawEnemyFlyer(o){ o.bodyRx=9; o.bodyRy=9; o.bodyY=2; o.headR=10; o.headY=-12; o.eyeX=4; o.eyeY=-13; o.eyeRx=2.8; o.eyeRy=3.6; o.eyeColor='#ff5a5a'; o.pupil='#250000'; o.legX=5; o.legTop=8; o.legBot=15; o.legW=3.6;
  const flap=Math.sin(frameCount*0.3)*7;
  drawCreatureBase(o,{ back:function(){ monBatWing(-1,-3,0,22,flap,o.color2); monBatWing(1,3,0,22,-flap,o.color2); },
    ears:function(){ for(const s of [1,-1]) flatPoly([[s*6,-17],[s*12,-27],[s*9,-14]],o.color,CAT_LINE,2); } }); }
function drawEnemyDarkMage(o){ o.headR=10.5; o.headY=-15; o.eyeColor='#c66bff'; o.pupil='#2a0044';
  drawCreatureBase(o,{ bodyColor:'#3a1152', bodyColor2:'#200a30', headColor:'#2a0c3c', line:'#7a4c95', mouth:false,
    extra:function(){ flatPoly([[-o.bodyRx-1,12],[o.bodyRx+1,12],[o.bodyRx+3,20],[-o.bodyRx-3,20]],'#2a0c3c',CAT_LINE,2);
      ctx.fillStyle='#2a0c3c'; ctx.beginPath(); ctx.arc(0,o.headY-1,o.headR+3.2,Math.PI*0.96,Math.PI*2.04); ctx.lineTo(o.headR+2,o.headY+6); ctx.lineTo(-o.headR-2,o.headY+6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#7a4c95'; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle='#0d0414'; ctx.beginPath(); ctx.ellipse(0,o.eyeY+1,o.headR*0.86,o.headR*0.7,0,0,Math.PI*2); ctx.fill();
      creatureEye(1,o); creatureEye(-1,o);
      flatLimb(-15,18,-15,-22,'#4a3320',3.4);
      const g=0.6+Math.sin(frameCount*0.12)*0.25;
      ctx.fillStyle='rgba(190,110,255,'+g+')'; ctx.beginPath(); ctx.arc(-15,-25,4.4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#d9a6ff'; ctx.lineWidth=1.6; ctx.stroke();
      if(o.attack>5){ ctx.fillStyle='rgba(230,180,255,0.9)'; ctx.beginPath(); ctx.arc(-15,-25,7.5,0,Math.PI*2); ctx.fill(); } } }); }
function drawEnemyVenom(o){ o.bodyRx=16; o.bodyRy=11; o.bodyY=7; o.headR=10; o.headY=-4; o.eyeX=4.4; o.eyeY=-5; o.eyeRx=2.8; o.eyeRy=3.6; o.eyeColor='#e9ff4d'; o.pupil='#123300'; o.line='#0d3a12';
  drawCreatureBase(o,{ noLegs:true, noBelly:true, line:'#0d3a12',
    extra:function(){ ctx.fillStyle='rgba(210,255,140,0.35)'; ctx.beginPath(); ctx.ellipse(-6,1,5,3,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#0a2a08'; ctx.lineWidth=1.8; ctx.lineCap='round'; ctx.beginPath(); ctx.arc(0,3,6,Math.PI*0.12,Math.PI*0.88); ctx.stroke(); ctx.lineCap='butt';
      ctx.fillStyle='rgba(120,220,80,0.6)';
      for(let i=0;i<4;i++){ const t=(frameCount*0.03+i*0.9)%3; ctx.beginPath(); ctx.arc(Math.sin(i*2.1)*9,8-t*9,1.6+(i%2),0,Math.PI*2); ctx.fill(); }
      ctx.fillStyle=o.color2; ctx.beginPath(); ctx.arc(-9,17,2.4,0,Math.PI*2); ctx.arc(8,18,2,0,Math.PI*2); ctx.fill(); } }); }
function drawEnemyGiant(o){ o.bodyRx=16; o.bodyRy=14; o.bodyY=4; o.headR=12; o.headY=-16; o.eyeX=5.4; o.eyeColor='#ffae2b'; o.pupil='#2a1400'; o.legX=9; o.legW=6;
  drawCreatureBase(o,{ bodyColor:'#4a4a4a', bodyColor2:'#242424', headColor:'#4a4a4a', line:'#1a1a1a',
    extra:function(){ for(const s of [1,-1]){ flatBall(s*17,-4,7,6,'#3a3a3a','#565656',2,'#1a1a1a'); flatPoly([[s*20,-9],[s*24,-15],[s*22,-6]],'#c9c2b4',CAT_LINE,1.6); }
      ctx.fillStyle='#f2ecdc'; flatPoly([[-4,-9],[-6,-16],[-1.6,-9]],'#f2ecdc',CAT_LINE,1.2); flatPoly([[4,-9],[6,-16],[1.6,-9]],'#f2ecdc',CAT_LINE,1.2); } }); }
function drawEnemyBrute(o){ o.bodyRx=15; o.bodyRy=13; o.bodyY=4; o.headR=11; o.headY=-15; o.eyeColor='#ffd23a'; o.pupil='#2a1400';
  const swing=o.attack>0?-pxSnap(o.attack*0.4):0;
  drawCreatureBase(o,{ bodyColor:'#9a5a24', bodyColor2:'#5f3413', headColor:'#9a5a24', line:CAT_LINE,
    back:function(){ ctx.save(); ctx.translate(-17,8+swing); ctx.rotate(-0.5+swing*0.06);
      flatLimb(0,0,0,-26,'#6b4423',4.4); flatBall(0,-30,7,8,'#7c8288','#a3a9af',2); ctx.restore(); },
    extra:function(){ flatLimb(-13,-4,-19,8,'#7d481d',6); flatLimb(13,-4,19,8,'#7d481d',6);
      for(const s of [1,-1]) flatPoly([[s*8,-20],[s*14,-25],[s*11,-15]],o.color,CAT_LINE,1.8); } }); }
function drawEnemyScorpion(o){ o.line='#0c3a1f';
  const legA=Math.sin(o.walk*2)*2, tailWave=Math.sin(frameCount*0.1)*2.5;
  drawCreatureBase(o,{ noLegs:true, noHead:true,
    back:function(){ for(const s of [1,-1]){ for(let i=0;i<3;i++){ const bx=s*8, by=-4+i*8; flatLimb(bx,by,s*(22+i*2),by+(i-1)*3+(i%2?legA:-legA),o.color2,3.4); } }
      ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(14,4); ctx.quadraticCurveTo(28,4,28+tailWave,-16);
      ctx.strokeStyle=CAT_LINE; ctx.lineWidth=8; ctx.stroke(); ctx.strokeStyle=o.color; ctx.lineWidth=5; ctx.stroke();
      flatPoly([[28+tailWave-4,-14],[28+tailWave+4,-14],[28+tailWave,-26]],'#ffcc33',CAT_LINE,1.6); ctx.lineCap='butt'; },
    extra:function(){ flatBall(-4,3,14,9,o.color,monsterLight(o.color),2,o.line); flatBall(11,2,9,8,o.color2,monsterLight(o.color2),2,o.line);
      flatLimb(-16,-2,-26,-8,o.color,4);
      flatPoly([[-30,-12],[-22,-12],[-25,-4],[-32,-4]],o.color,CAT_LINE,1.8);
      flatPoly([[-30,-12],[-24,-8],[-28,-3]],o.color2,CAT_LINE,1.4);
      o.eyeX=3; o.eyeY=-4; o.eyeRx=2.2; o.eyeRy=2.8; o.angry=false;
      creatureEye(-1,o); creatureEye(1,o); } }); }
function drawEnemyGhost(o){ o.line='#4a5a72';
  const wave=Math.sin(frameCount*0.12)*2;
  drawCreatureBase(o,{ noLegs:true, noBelly:true, headColor:o.color, line:'#4a5a72',
    extra:function(){ const bot=22+wave;
      ctx.fillStyle=o.color; ctx.beginPath();
      ctx.moveTo(-o.bodyRx,o.bodyY); ctx.quadraticCurveTo(-o.bodyRx,o.bodyY+16,-o.bodyRx+2,bot);
      ctx.lineTo(-o.bodyRx*0.45,bot-5); ctx.lineTo(-o.bodyRx*0.1,bot); ctx.lineTo(o.bodyRx*0.35,bot-5); ctx.lineTo(o.bodyRx*0.8,bot);
      ctx.quadraticCurveTo(o.bodyRx,o.bodyY+16,o.bodyRx,o.bodyY); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#4a5a72'; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle='rgba(120,140,170,0.35)'; ctx.beginPath(); ctx.ellipse(0,bot-8,o.bodyRx*0.75,7,0,0,Math.PI*2); ctx.fill(); },
    face:function(){ ctx.fillStyle='#20242e'; ctx.beginPath();
      ctx.ellipse(-4.6,o.eyeY,3,4.2,0,0,Math.PI*2); ctx.ellipse(4.6,o.eyeY,3,4.2,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0,o.headY+7,3,4.4,0,0,Math.PI*2); ctx.fill(); } }); }
function drawEnemyGolem(o){ o.line='#1e2a2a';
  drawCreatureBase(o,{ noHead:true,
    back:function(){ flatBall(-8,17,6,6,o.color2,monsterLight(o.color2),2,o.line); flatBall(8,17,6,6,o.color2,monsterLight(o.color2),2,o.line);
      flatBall(-18,6,7,9,'#5b6b73','#7c8c94',2,o.line); flatBall(18,6,7,9,'#5b6b73','#7c8c94',2,o.line); },
    extra:function(){ flatBall(0,3,15,13,o.color,monsterLight(o.color),2,o.line); flatBall(0,-14,11,10,'#5b6b73','#7c8c94',2,o.line);
      ctx.strokeStyle='#39e6c0'; ctx.lineWidth=1.6; ctx.lineCap='round'; ctx.beginPath();
      ctx.moveTo(-8,-6); ctx.lineTo(-3,0); ctx.lineTo(-7,8); ctx.moveTo(7,-5); ctx.lineTo(3,1); ctx.lineTo(8,9); ctx.moveTo(-6,-16); ctx.lineTo(0,-20); ctx.lineTo(6,-15);
      ctx.stroke(); ctx.lineCap='butt';
      o.eyeX=4.4; o.eyeY=-14; o.eyeColor='#48ffd8'; o.pupil='#0a3a30'; o.angry=false;
      creatureEye(1,o); creatureEye(-1,o); } }); }
function drawEnemyMummy(o){ o.line='#5a4a1e'; o.eyeColor='#ffdd55'; o.pupil='#3a2a00';
  const sway=Math.sin(o.walk*0.5)*1.5;
  drawCreatureBase(o,{ bodyColor:'#d8c88a', bodyColor2:'#a8965a', headColor:'#e6d9a4', line:'#5a4a1e',
    extra:function(){ flatLimb(-9,-4,-24,2+sway,'#cbbd80',5); flatLimb(9,-4,-20,9+sway,'#cbbd80',5);
      ctx.strokeStyle='rgba(110,95,50,0.85)'; ctx.lineWidth=2.2; ctx.lineCap='round';
      const rows=[-6,0,6,12];
      for(let i=0;i<rows.length;i++){ ctx.beginPath(); ctx.moveTo(-o.bodyRx+1,o.bodyY+rows[i]*0.6); ctx.lineTo(o.bodyRx-1,o.bodyY+rows[i]*0.6+2.5); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(o.headR*0.7,o.headY+2); ctx.quadraticCurveTo(o.headR+6,o.headY+6,o.headR+3,o.headY+12);
      ctx.strokeStyle='#cbbd80'; ctx.lineWidth=3.4; ctx.stroke();
      ctx.strokeStyle='rgba(110,95,50,0.5)'; ctx.lineWidth=1; ctx.stroke(); ctx.lineCap='butt'; } }); }
function drawEnemyBeetle(o){ o.line='#6a5acd';
  const legA=Math.sin(o.walk*2)*2.2;
  drawCreatureBase(o,{ noLegs:true,
    extra:function(){ for(const s of [1,-1]){ for(let i=0;i<3;i++){ const bx=s*11, by=-5+i*7; flatLimb(bx,by,s*(23+i),by+(i-1)*3+(i%2?legA:-legA),'#2a2440',3.2); } }
      flatBall(0,4,15,12,o.color,monsterLight(o.color),2,o.line);
      ctx.strokeStyle='#7a6adf'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(0,15); ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(-6,-1,5,4,-0.4,0,Math.PI*2); ctx.fill();
      flatPoly([[0,-22],[3.5,-32],[5.5,-21]],'#8a7ae0',CAT_LINE,1.6);
      o.eyeX=5; o.eyeY=-13; o.eyeRx=3; o.eyeRy=3.6; o.angry=false; o.eyeColor='#ffd23a'; o.pupil='#1a1400';
      creatureEye(1,o); creatureEye(-1,o); } }); }
function drawEnemyDjinn(o){ o.line='#7a4a00';
  const sway=Math.sin(frameCount*0.1)*2;
  drawCreatureBase(o,{ noLegs:true, noBelly:true, line:'#7a4a00',
    extra:function(){ ctx.fillStyle='rgba(255,190,90,0.5)'; ctx.beginPath();
      ctx.moveTo(-11,12); ctx.quadraticCurveTo(-6,24+sway,0,20); ctx.quadraticCurveTo(6,26-sway,11,12); ctx.closePath(); ctx.fill();
      flatLimb(-10,0,-2,6,o.color2,4); flatLimb(10,0,2,4,o.color2,4);
      flatBall(0,o.headY-o.headR*0.85,o.headR*0.95,5,'#ffd27a','#fff0c0',2);
      flatPoly([[0,o.headY-o.headR*1.4],[4,o.headY-o.headR*2.2],[0,o.headY-o.headR*1.9]],'#ff5533',CAT_LINE,1.2);
      const g=0.6+Math.sin(frameCount*0.12)*0.3;
      ctx.fillStyle='rgba(255,230,120,'+g+')'; ctx.beginPath(); ctx.arc(0,o.headY-o.headR*0.85,2.6,0,Math.PI*2); ctx.fill(); } }); }
function drawEnemyCactus(o){ o.line='#0c3a17'; o.bodyRx=11; o.bodyRy=16; o.bodyY=4; o.headY=-16; o.headR=10;
  drawCreatureBase(o,{ noBelly:true, line:'#0c3a17',
    back:function(){ flatLimb(-10,2,-18,2,o.color,6); flatLimb(-18,2,-18,-8,o.color,6); flatLimb(10,6,18,6,o.color,6); flatLimb(18,6,18,-4,o.color,6); },
    extra:function(){ ctx.strokeStyle='#e9f5c0'; ctx.lineWidth=1.2; ctx.lineCap='round';
      for(let i=0;i<5;i++){ const y=-8+i*6; ctx.beginPath(); ctx.moveTo(-o.bodyRx+1,y); ctx.lineTo(-o.bodyRx-3,y-2); ctx.moveTo(o.bodyRx-1,y); ctx.lineTo(o.bodyRx+3,y-2); ctx.stroke(); }
      ctx.lineCap='butt';
      ctx.fillStyle='#ff5aa8';
      for(let i=0;i<5;i++){ const a=(i/5)*Math.PI*2; ctx.beginPath(); ctx.ellipse(Math.cos(a)*3.2,o.headY-o.headR-1+Math.sin(a)*3.2,2.4,2.4,0,0,Math.PI*2); ctx.fill(); }
      ctx.fillStyle='#ffe14d'; ctx.beginPath(); ctx.arc(0,o.headY-o.headR-1,2,0,Math.PI*2); ctx.fill(); } }); }
function drawEnemyAnkh(o){ o.line='#6b5a2a'; o.eyeColor='#ff3a3a'; o.pupil='#000';
  const bone='#f2ecd8', bone2='#c9bf9c';
  drawCreatureBase(o,{ noBelly:true, headColor:bone, line:'#6b5a2a',
    back:function(){ flatLimb(-16,20,-16,-26,'#6b5a2a',3);
      ctx.strokeStyle='#ffd700'; ctx.lineWidth=2.6; ctx.lineCap='round'; ctx.beginPath();
      ctx.arc(-16,-30,4,0,Math.PI*2); ctx.moveTo(-16,-26); ctx.lineTo(-16,-14); ctx.moveTo(-21,-21); ctx.lineTo(-11,-21);
      ctx.stroke(); ctx.lineCap='butt'; },
    extra:function(){ flatBall(0,o.bodyY+2,o.bodyRx*0.85,o.bodyRy*0.7,bone2,'#fff8e6',1.6,'#6b5a2a');
      ctx.strokeStyle='#6b5a2a'; ctx.lineWidth=1.2;
      for(let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(0,o.bodyY+1+i*4,o.bodyRx*0.7,Math.PI*0.15,Math.PI*0.85); ctx.stroke(); }
      flatLimb(-10,-2,-20,6,bone,4); flatLimb(10,-2,18,8,bone,4);
      flatPoly([[-5,o.headY+6],[5,o.headY+6],[3,o.headY+10],[-3,o.headY+10]],bone,'#6b5a2a',1.2);
      ctx.strokeStyle='#6b5a2a'; ctx.lineWidth=1;
      for(let i=-3;i<=3;i+=2){ ctx.beginPath(); ctx.moveTo(i,o.headY+6); ctx.lineTo(i,o.headY+10); ctx.stroke(); } } }); }
// ---------- JEFES ----------
function drawBossDragon(o){ o.bodyRx=16; o.bodyRy=13; o.bodyY=4; o.headR=12; o.headY=-16; o.eyeColor='#ffe14d'; o.pupil='#3a0a00';
  const flap=Math.sin(frameCount*0.18)*9;
  drawCreatureBase(o,{ bodyColor:o.color, bodyColor2:o.color2, headColor:o.color,
    back:function(){ monBatWing(-1,-2,-2,30,flap,'#b02020'); monBatWing(1,2,-2,30,-flap,'#b02020');
      ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(12,10); ctx.quadraticCurveTo(26,16,30,2+flap*0.3);
      ctx.strokeStyle=CAT_LINE; ctx.lineWidth=8; ctx.stroke(); ctx.strokeStyle=o.color; ctx.lineWidth=5; ctx.stroke(); ctx.lineCap='butt'; },
    extra:function(){ monHorn(1,7,o.headY-6,12,'#e8d9a0',2); monHorn(-1,-7,o.headY-6,12,'#e8d9a0',-2);
      flatPoly([[2,o.headY+1],[14,o.headY+3],[12,o.headY+8],[2,o.headY+8]],o.color2,CAT_LINE,2);
      ctx.fillStyle='#3a0000'; ctx.beginPath(); ctx.arc(8,o.headY+3,1.2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff';
      for(let i=0;i<3;i++) flatPoly([[2+i*3.4,o.headY+7],[3.6+i*3.4,o.headY+11],[5.2+i*3.4,o.headY+7]],'#fff');
      if(o.attack>4){ ctx.fillStyle='rgba(255,150,0,0.85)'; ctx.beginPath(); ctx.moveTo(-14,o.headY+3); ctx.lineTo(-30,o.headY); ctx.lineTo(-30,o.headY+9); ctx.closePath(); ctx.fill();
        ctx.fillStyle='rgba(255,230,90,0.9)'; ctx.beginPath(); ctx.moveTo(-14,o.headY+4); ctx.lineTo(-24,o.headY+2); ctx.lineTo(-24,o.headY+7); ctx.closePath(); ctx.fill(); }
      for(let i=0;i<3;i++) flatPoly([[-3+i*4,o.bodyY-13],[-1+i*4,o.bodyY-20],[1+i*4,o.bodyY-13]],'#e8d9a0',CAT_LINE,1.2); } }); }
function drawBossTitan(o){ o.line='#0a4a66';
  drawCreatureBase(o,{ bodyColor:o.color, bodyColor2:o.color2, headColor:'#8fe0ff', line:'#0a4a66',
    back:function(){ for(const s of [1,-1]) flatPoly([[s*12,-6],[s*26,-16],[s*22,2],[s*12,6]],'#7fd6ff','#0a4a66',2); },
    extra:function(){ for(let i=-2;i<=2;i++){ const h=12-Math.abs(i)*3; flatPoly([[i*6-3,o.headY-o.headR+1],[i*6,o.headY-o.headR-h],[i*6+3,o.headY-o.headR+1]],'#d6f4ff','#0a4a66',1.4); }
      ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=1.4; ctx.beginPath();
      ctx.moveTo(-8,-4); ctx.lineTo(0,0); ctx.lineTo(8,-4); ctx.moveTo(-6,4); ctx.lineTo(0,8); ctx.lineTo(6,4); ctx.stroke();
      ctx.fillStyle='rgba(180,240,255,0.35)'; ctx.beginPath(); ctx.arc(0,0,30+Math.sin(frameCount*0.1)*3,0,Math.PI*2); ctx.fill(); } }); }
function drawBossDemon(o){ o.line='#1a001a';
  const flap=Math.sin(frameCount*0.16)*8;
  drawCreatureBase(o,{ bodyColor:o.color, bodyColor2:o.color2, headColor:o.color, line:'#1a001a',
    back:function(){ monBatWing(-1,-2,-2,32,flap,'#5a005a'); monBatWing(1,2,-2,32,-flap,'#5a005a'); },
    extra:function(){ monHorn(1,7,o.headY-7,16,'#3a003a',4); monHorn(-1,-7,o.headY-7,16,'#3a003a',-4);
      ctx.fillStyle='#ff44ff'; ctx.beginPath(); ctx.arc(-4,o.headY+1,1.8,0,Math.PI*2); ctx.arc(4,o.headY+1,1.8,0,Math.PI*2); ctx.fill();
      flatLimb(-18,18,-18,-22,'#3a2a1a',3.4);
      ctx.strokeStyle='#c0c0d0'; ctx.lineWidth=2.4; ctx.lineCap='round'; ctx.beginPath();
      ctx.moveTo(-18,-22); ctx.lineTo(-18,-30); ctx.moveTo(-22,-30); ctx.lineTo(-22,-24); ctx.moveTo(-14,-30); ctx.lineTo(-14,-24);
      ctx.stroke(); ctx.lineCap='butt';
      ctx.strokeStyle='rgba(200,0,255,0.5)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,32+Math.sin(frameCount*0.12)*4,0,Math.PI*2); ctx.stroke(); } }); }
function drawBossPharaoh(o){ o.line='#6a5a1e'; o.eyeColor='#ffdd55'; o.pupil='#3a2a00';
  drawCreatureBase(o,{ bodyColor:'#d8c88a', bodyColor2:'#a8965a', headColor:'#e6d9a4', line:'#6a5a1e',
    back:function(){ flatLimb(-18,18,-18,-18,'#8a6a20',3);
      ctx.strokeStyle='#ffd700'; ctx.lineWidth=2.4; ctx.lineCap='round'; ctx.beginPath(); ctx.arc(-18,-22,3.4,0,Math.PI*2); ctx.stroke(); ctx.lineCap='butt'; },
    extra:function(){ flatPoly([[-16,o.headY-4],[-16,o.headY+8],[-9,o.headY+8],[-9,o.headY-8],[9,o.headY-8],[9,o.headY+8],[16,o.headY+8],[16,o.headY-4],[0,o.headY-16]],'#ffd700',CAT_LINE,2);
      ctx.strokeStyle='#1a3a8a'; ctx.lineWidth=2;
      for(let i=-1;i<=1;i++){ ctx.beginPath(); ctx.moveTo(i*7-1,o.headY-12); ctx.lineTo(i*7-1,o.headY+8); ctx.stroke(); }
      ctx.fillStyle='#1a3a8a'; flatPoly([[-2,o.headY+8],[2,o.headY+8],[2,o.headY+15],[-2,o.headY+15]],'#1a3a8a',CAT_LINE,1.2);
      ctx.strokeStyle='rgba(90,75,30,0.8)'; ctx.lineWidth=2.2;
      for(let i=-1;i<=2;i++){ ctx.beginPath(); ctx.moveTo(-o.bodyRx+1,o.bodyY+i*5); ctx.lineTo(o.bodyRx-1,o.bodyY+i*5+2.5); ctx.stroke(); } } }); }
function drawBossSandGolem(o){ o.line='#6a4a10';
  drawCreatureBase(o,{ noHead:true, line:'#6a4a10',
    back:function(){ flatBall(-11,18,8,8,o.color2,monsterLight(o.color2),2,'#6a4a10'); flatBall(11,18,8,8,o.color2,monsterLight(o.color2),2,'#6a4a10');
      flatBall(-22,6,9,11,o.color,monsterLight(o.color),2,'#6a4a10'); flatBall(22,6,9,11,o.color,monsterLight(o.color),2,'#6a4a10');
      ctx.fillStyle='rgba(210,170,90,0.5)';
      for(let i=0;i<7;i++){ const a=frameCount*0.05+i*0.9; ctx.beginPath(); ctx.arc(Math.cos(a)*30,Math.sin(a)*26,2.6,0,Math.PI*2); ctx.fill(); } },
    extra:function(){ flatBall(0,4,18,15,o.color,monsterLight(o.color),2,'#6a4a10'); flatBall(0,-14,12,11,o.color,monsterLight(o.color),2,'#6a4a10');
      const g=0.6+Math.sin(frameCount*0.1)*0.3;
      ctx.fillStyle='rgba(255,180,60,'+g+')'; ctx.beginPath(); ctx.arc(0,2,6,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#ffb43c'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(-8,-4); ctx.lineTo(-2,2); ctx.moveTo(8,-4); ctx.lineTo(2,2); ctx.stroke();
      o.eyeX=5; o.eyeY=-14; o.eyeColor='#ffb43c'; o.pupil='#5a2200'; o.angry=false;
      creatureEye(1,o); creatureEye(-1,o); } }); }
function drawBossDjinn(o){ o.line='#7a4400';
  const sway=Math.sin(frameCount*0.09)*3;
  drawCreatureBase(o,{ noLegs:true, noBelly:true, line:'#7a4400',
    extra:function(){ ctx.fillStyle='rgba(255,180,70,0.55)'; ctx.beginPath();
      ctx.moveTo(-14,14); ctx.quadraticCurveTo(-6,30+sway,0,24); ctx.quadraticCurveTo(6,32-sway,14,14); ctx.closePath(); ctx.fill();
      flatLimb(-13,0,-2,8,o.color2,5); flatLimb(13,0,2,6,o.color2,5);
      flatBall(0,o.headY-o.headR*0.8,o.headR*1.0,7,'#ffd27a','#fff0c0',2);
      const g=0.6+Math.sin(frameCount*0.12)*0.3;
      ctx.fillStyle='rgba(255,90,60,'+g+')'; ctx.beginPath(); ctx.arc(0,o.headY-o.headR*0.8,3.4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,150,50,0.55)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,34+Math.sin(frameCount*0.13)*4,0,Math.PI*2); ctx.stroke(); } }); }
function drawBossPumpkin(o){
  const glow=0.6+Math.sin(frameCount*0.1)*0.3, body='#ff7a1a';
  drawCreatureBase(o,{ noLegs:true, noBelly:true, noHead:true,
    extra:function(){ ctx.fillStyle='rgba(255,120,0,'+(glow*0.5)+')'; ctx.beginPath(); ctx.arc(0,2,30,0,Math.PI*2); ctx.fill();
      for(const s of [-1,1]) flatBall(s*11,3,10,20,'#e0620f','#ff8a33',2,'#5a2a00');
      flatBall(0,3,15,22,body,monsterLight(body),2,'#5a2a00');
      ctx.strokeStyle='#3a1f00'; ctx.lineWidth=5; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(0,-19); ctx.quadraticCurveTo(6,-26,3,-32); ctx.stroke(); ctx.lineCap='butt';
      ctx.fillStyle='#2f7a2a'; flatPoly([[-2,-24],[-16,-30],[-4,-18]],'#2f7a2a',CAT_LINE,1.4);
      ctx.fillStyle='rgba(255,245,120,'+glow+')';
      flatPoly([[-9,-8],[-3,-2],[-13,-2]],'rgba(255,245,120,'+glow+')');
      flatPoly([[9,-8],[3,-2],[13,-2]],'rgba(255,245,120,'+glow+')');
      flatPoly([[-11,8],[-7,3],[-3,8],[0,3],[3,8],[7,3],[11,8],[9,14],[-9,14]],'rgba(255,245,120,'+glow+')'); } }); }
function drawBossAlienEmperor(o){ o.line='#0a4a2a';
  drawCreatureBase(o,{ noBelly:true, line:'#0a4a2a',
    back:function(){ flatPoly([[-18,-6],[-30,20],[30,20],[18,-6]],'#0a3a22',CAT_LINE,2); },
    extra:function(){ ctx.fillStyle='#00e888'; ctx.strokeStyle='#0a4a2a'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.ellipse(0,o.headY-4,17,14,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#0a0a0a'; ctx.beginPath(); ctx.ellipse(-7,o.headY-4,5,7,0.3,0,Math.PI*2); ctx.ellipse(7,o.headY-4,5,7,-0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(-8,o.headY-7,1.2,0,Math.PI*2); ctx.arc(6,o.headY-7,1.2,0,Math.PI*2); ctx.fill();
      ctx.lineCap='round';
      for(let i=-1;i<=1;i++){ ctx.strokeStyle='#00e888'; ctx.lineWidth=3; ctx.beginPath();
        ctx.moveTo(i*9,o.headY+6); ctx.quadraticCurveTo(i*12,o.headY+16,i*9+Math.sin(frameCount*0.1+i)*2,o.headY+22); ctx.stroke(); }
      ctx.lineCap='butt';
      const g=0.6+Math.sin(frameCount*0.14)*0.3;
      ctx.fillStyle='rgba(120,255,180,'+g+')'; ctx.beginPath(); ctx.arc(0,o.headY-14,3,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(0,255,136,0.5)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,34+Math.sin(frameCount*0.12)*4,0,Math.PI*2); ctx.stroke(); } }); }
function drawBossInfernalLord(o){ o.line='#3a0800';
  const flap=Math.sin(frameCount*0.15)*9;
  drawCreatureBase(o,{ bodyColor:o.color, bodyColor2:o.color2, headColor:o.color, line:'#3a0800',
    back:function(){ monBatWing(-1,-2,-2,34,flap,'#8a1000'); monBatWing(1,2,-2,34,-flap,'#8a1000');
      ctx.fillStyle='rgba(255,120,0,0.6)';
      for(let i=0;i<6;i++){ const a=frameCount*0.1+i; ctx.beginPath(); ctx.arc(Math.cos(a)*28,Math.sin(a)*28,3.6,0,Math.PI*2); ctx.fill(); } },
    extra:function(){ monHorn(1,7,o.headY-7,15,'#2a0500',4); monHorn(-1,-7,o.headY-7,15,'#2a0500',-4);
      flatLimb(-19,18,-19,-22,'#3a2a1a',3.4);
      ctx.strokeStyle='#ffcc66'; ctx.lineWidth=2.6; ctx.lineCap='round'; ctx.beginPath();
      ctx.moveTo(-19,-22); ctx.lineTo(-19,-31); ctx.moveTo(-23,-31); ctx.lineTo(-23,-25); ctx.moveTo(-15,-31); ctx.lineTo(-15,-25);
      ctx.stroke(); ctx.lineCap='butt';
      ctx.fillStyle='rgba(255,180,40,0.9)';
      for(let i=-1;i<=1;i++) flatPoly([[i*6-2,o.headY-o.headR],[i*6,o.headY-o.headR-7],[i*6+2,o.headY-o.headR]],'rgba(255,180,40,0.9)');
      ctx.strokeStyle='rgba(255,60,0,0.6)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,34+Math.sin(frameCount*0.14)*4,0,Math.PI*2); ctx.stroke(); } }); }
function drawBossKrampus(o){ o.line='#1a0505';
  drawCreatureBase(o,{ bodyColor:o.color, bodyColor2:o.color2, headColor:'#8a1a1a', line:'#1a0505',
    extra:function(){ monHorn(1,7,o.headY-7,18,'#3a2010',7); monHorn(-1,-7,o.headY-7,18,'#3a2010',-7);
      for(const s of [1,-1]) flatPoly([[s*9,o.headY-1],[s*17,o.headY-6],[s*12,o.headY+5]],'#5a1010',CAT_LINE,1.8);
      ctx.fillStyle='#e05555'; flatPoly([[-2,o.headY+8],[2,o.headY+8],[1,o.headY+15],[-1,o.headY+15]],'#e05555',CAT_LINE,1);
      ctx.strokeStyle='#4a0808'; ctx.lineWidth=2; ctx.lineCap='round';
      for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(i*5,o.bodyY+10); ctx.lineTo(i*5+(i%2?2:-2),o.bodyY+16); ctx.stroke(); }
      ctx.lineCap='butt';
      ctx.strokeStyle='#b0b0b0'; ctx.lineWidth=2.4;
      for(let i=0;i<4;i++){ const a=frameCount*0.06+i*1.4; ctx.beginPath(); ctx.arc(Math.cos(a)*26,Math.sin(a)*20+6,3.4,0,Math.PI*2); ctx.stroke(); }
      ctx.fillStyle='rgba(180,20,20,0.4)'; ctx.beginPath(); ctx.arc(0,0,30,0,Math.PI*2); ctx.fill(); } }); }
// ---------- ENEMIGOS DE EVENTOS ----------
function drawEvZombie(o){ o.eyeColor='#d8ff4d'; o.pupil='#123300';
  drawCreatureBase(o,{ bodyColor:'#5a7a4a', bodyColor2:'#33472a', headColor:'#6a8a55', line:'#1e2a18',
    extra:function(){ flatLimb(-9,-3,-22,1,'#6a8a55',4.6); flatLimb(9,-3,-19,7,'#6a8a55',4.6);
      ctx.strokeStyle='#2a3a20'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(6,6); ctx.moveTo(-4,8); ctx.lineTo(6,0); ctx.stroke();
      ctx.strokeStyle='#243018'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-3,o.headY+6); ctx.lineTo(3,o.headY+6); ctx.stroke(); } }); }
function drawEvSpider(o){
  const legA=Math.sin(o.walk*2)*2.4;
  drawCreatureBase(o,{ noLegs:true, noHead:true, noBelly:true, line:'#5a5a6a',
    back:function(){ for(const s of [1,-1]){ for(let i=0;i<4;i++){ const bx=s*7, by=-8+i*6, kx=s*(20+i*3);
        flatLimb(bx,by,kx,by-6+(i%2?legA:-legA),'#1a1a1a',3); flatLimb(kx,by-6+(i%2?legA:-legA),s*(24+i*3),by+6,'#1a1a1a',3); } } },
    extra:function(){ flatBall(8,2,13,12,o.color,monsterLight(o.color),2,'#5a5a6a'); flatBall(-8,0,9,9,'#2e2e38','#4a4a58',2,'#5a5a6a');
      ctx.fillStyle='#ff3a3a';
      const eyes=[[-13,-4],[-10,-7],[-9,-1],[-4,-4],[-3,-8],[-6,1]];
      for(const p of eyes){ ctx.beginPath(); ctx.arc(p[0],p[1],1.6,0,Math.PI*2); ctx.fill(); }
      ctx.fillStyle='#e8e8e8'; flatPoly([[-13,5],[-11,11],[-9,5]],'#e8e8e8',CAT_LINE,1); flatPoly([[-7,5],[-6,11],[-4,5]],'#e8e8e8',CAT_LINE,1); } }); }
function drawEvWitch(o){ o.line='#1a0a2a'; o.eyeColor='#e0ff5a'; o.pupil='#123300';
  drawCreatureBase(o,{ bodyColor:'#4a1a7a', bodyColor2:'#2a0e48', headColor:'#8fbf6a', line:'#1a0a2a', mouth:false,
    back:function(){ ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(-22,18); ctx.lineTo(-6,-12);
      ctx.strokeStyle=CAT_LINE; ctx.lineWidth=4; ctx.stroke(); ctx.strokeStyle='#7a5a2a'; ctx.lineWidth=2.2; ctx.stroke(); ctx.lineCap='butt'; },
    extra:function(){ flatPoly([[-o.bodyRx-1,10],[o.bodyRx+1,10],[o.bodyRx+4,20],[-o.bodyRx-4,20]],'#2a0e48',CAT_LINE,2);
      flatPoly([[-14,o.headY-5],[14,o.headY-5],[0,o.headY-34]],'#2a0e48',CAT_LINE,2);
      ctx.fillStyle='#3a1560'; flatPoly([[-16,o.headY-4],[16,o.headY-4],[12,o.headY+1],[-12,o.headY+1]],'#3a1560',CAT_LINE,2);
      ctx.fillStyle='#ffd24d'; ctx.beginPath(); ctx.arc(0,o.headY-5,2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#7faf5a'; flatPoly([[-1,o.headY+3],[-6,o.headY+7],[-1,o.headY+6]],'#7faf5a',CAT_LINE,1.2);
      ctx.fillStyle='#c9a94d'; flatPoly([[-28,22],[-20,12],[-16,18],[-24,28]],'#c9a94d',CAT_LINE,1.6); } }); }
function drawEvDrone(o){
  const bob=Math.sin(frameCount*0.2)*2;
  drawCreatureBase(o,{ noHead:true, noLegs:true, noBelly:true, line:'#0a3a1a',
    extra:function(){ const y=-2+bob;
      flatBall(0,y,20,7,o.color,monsterLight(o.color),2,'#0a3a1a');
      ctx.fillStyle='#aaffcc'; ctx.strokeStyle='#0a3a1a'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(0,y-5,10,Math.PI,Math.PI*2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#0a3a1a'; ctx.beginPath(); ctx.ellipse(0,y-5,5,4,0,0,Math.PI*2); ctx.fill();
      for(let i=-2;i<=2;i++){ const on=(Math.floor(frameCount/8)+i)%2===0;
        ctx.fillStyle=on?'#ffe14d':'#2f7a2a'; ctx.beginPath(); ctx.arc(i*7,y+4,1.8,0,Math.PI*2); ctx.fill(); }
      ctx.strokeStyle='#0a3a1a'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(0,y-15); ctx.lineTo(0,y-22); ctx.stroke();
      ctx.fillStyle='#ff5555'; ctx.beginPath(); ctx.arc(0,y-23,2,0,Math.PI*2); ctx.fill(); } }); }
function drawEvAlien(o){ o.line='#04381e';
  drawCreatureBase(o,{ bodyColor:'#0a8a44', bodyColor2:'#05502a', headColor:'#0fa855', line:'#04381e',
    extra:function(){ ctx.fillStyle='#0fa855'; ctx.strokeStyle='#04381e'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.ellipse(0,o.headY-6,13,11,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#050505'; ctx.beginPath(); ctx.ellipse(-5,o.headY-6,4,6,0.3,0,Math.PI*2); ctx.ellipse(5,o.headY-6,4,6,-0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(-6,o.headY-9,1,0,Math.PI*2); ctx.arc(4,o.headY-9,1,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#2a2a33'; catRoundRect(-26,0,12,5,2); ctx.fill(); ctx.strokeStyle=CAT_LINE; ctx.lineWidth=1.4; ctx.stroke();
      if(o.attack>5){ ctx.fillStyle='rgba(120,255,160,0.9)'; ctx.beginPath(); ctx.arc(-27,2.5,4,0,Math.PI*2); ctx.fill(); } } }); }
function drawEvPsycho(o){ o.line='#2a0044';
  drawCreatureBase(o,{ bodyColor:'#8a3ad0', bodyColor2:'#5a1a90', headColor:'#9a4ae0', line:'#2a0044',
    extra:function(){ ctx.fillStyle='#ff9ad0'; ctx.strokeStyle='#7a1050'; ctx.lineWidth=1.6;
      ctx.beginPath(); ctx.ellipse(0,o.headY-o.headR+1,11,8,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle='#d060a0'; ctx.lineWidth=1; ctx.beginPath();
      ctx.moveTo(0,o.headY-o.headR-6); ctx.lineTo(0,o.headY-o.headR+4);
      ctx.moveTo(-5,o.headY-o.headR-3); ctx.lineTo(-5,o.headY-o.headR+4);
      ctx.moveTo(5,o.headY-o.headR-3); ctx.lineTo(5,o.headY-o.headR+4); ctx.stroke();
      ctx.strokeStyle='rgba(220,120,255,0.6)'; ctx.lineWidth=1.6;
      for(let i=1;i<=2;i++){ ctx.beginPath(); ctx.arc(0,o.headY-8,10+i*7+Math.sin(frameCount*0.1)*2,Math.PI*1.15,Math.PI*1.85); ctx.stroke(); }
      flatLimb(-9,-2,-20,-8,'#9a4ae0',4); flatLimb(9,-2,-16,-12,'#9a4ae0',4); } }); }
function drawEvImp(o){ o.line='#3a0000'; o.eyeColor='#ffe14d'; o.pupil='#3a1000'; o.bodyRx=11; o.bodyRy=10; o.headR=10.5; o.headY=-14;
  drawCreatureBase(o,{ back:function(){ ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(10,6); ctx.quadraticCurveTo(24,6,24,-6);
      ctx.strokeStyle=CAT_LINE; ctx.lineWidth=5; ctx.stroke(); ctx.strokeStyle=o.color; ctx.lineWidth=3; ctx.stroke(); ctx.lineCap='butt';
      flatPoly([[22,-6],[28,-10],[25,-2]],o.color,CAT_LINE,1.2);
      flatLimb(-15,16,-15,-16,'#3a2010',2.6);
      ctx.strokeStyle='#c0c0d0'; ctx.lineWidth=2.2; ctx.lineCap='round'; ctx.beginPath();
      ctx.moveTo(-15,-16); ctx.lineTo(-15,-22); ctx.moveTo(-18,-22); ctx.lineTo(-18,-17); ctx.moveTo(-12,-22); ctx.lineTo(-12,-17);
      ctx.stroke(); ctx.lineCap='butt'; },
    extra:function(){ monHorn(1,5,o.headY-6,10,'#7a1010',2); monHorn(-1,-5,o.headY-6,10,'#7a1010',-2); } }); }
function drawEvHound(o){
  const legA=Math.sin(o.walk*2)*3;
  drawCreatureBase(o,{ noLegs:true, noHead:true, noBelly:true, line:'#2a0500',
    back:function(){ ctx.fillStyle='rgba(255,120,0,0.45)';
      for(let i=0;i<5;i++){ const a=frameCount*0.12+i*1.3; ctx.beginPath(); ctx.arc(Math.cos(a)*22,Math.sin(a)*10+2,4,0,Math.PI*2); ctx.fill(); }
      for(const s of [1,-1]){ flatLimb(s*6,8,s*8,22+(s>0?legA:-legA),o.color2,4.5); flatLimb(s*14,8,s*16,22-(s>0?legA:-legA),o.color2,4.5); } },
    extra:function(){ flatBall(-2,2,16,10,o.color,monsterLight(o.color),2,'#2a0500'); flatBall(-16,-6,10,9,o.color,monsterLight(o.color),2,'#2a0500');
      flatPoly([[-24,-8],[-30,-4],[-22,0]],o.color2,CAT_LINE,1.8);
      flatPoly([[-13,-14],[-9,-22],[-7,-12]],o.color2,CAT_LINE,1.6); flatPoly([[-21,-13],[-20,-21],[-16,-12]],o.color2,CAT_LINE,1.6);
      ctx.fillStyle='#ffcc33'; ctx.beginPath(); ctx.arc(-19,-8,1.8,0,Math.PI*2); ctx.arc(-13,-8,1.8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#3a1000'; ctx.beginPath(); ctx.arc(-19,-7.6,0.9,0,Math.PI*2); ctx.arc(-13,-7.6,0.9,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; flatPoly([[-25,-1],[-23,-6],[-21,-1]],'#fff',CAT_LINE,1);
      ctx.fillStyle='rgba(255,160,0,0.9)'; ctx.beginPath(); ctx.moveTo(14,-2); ctx.quadraticCurveTo(28,-6,30,-14+Math.sin(frameCount*0.2)*3); ctx.lineTo(24,-4); ctx.closePath(); ctx.fill(); } }); }
function drawEvSuccubus(o){ o.line='#3a0016'; o.eyeColor='#ff5a9a'; o.pupil='#3a0016';
  const flap=Math.sin(frameCount*0.18)*7;
  drawCreatureBase(o,{ back:function(){ monBatWing(-1,-2,-3,26,flap,o.color2); monBatWing(1,2,-3,26,-flap,o.color2);
      ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(10,8); ctx.quadraticCurveTo(26,10,26,-2);
      ctx.strokeStyle=CAT_LINE; ctx.lineWidth=4.5; ctx.stroke(); ctx.strokeStyle=o.color; ctx.lineWidth=2.6; ctx.stroke(); ctx.lineCap='butt';
      flatPoly([[24,-2],[29,-7],[29,2]],o.color,CAT_LINE,1.2); },
    extra:function(){ monHorn(1,5,o.headY-6,9,'#3a0026',2); monHorn(-1,-5,o.headY-6,9,'#3a0026',-2);
      ctx.fillStyle='#2a0016'; ctx.beginPath(); ctx.ellipse(0,o.headY-o.headR+2,o.headR+1,5,0,Math.PI,Math.PI*2); ctx.fill();
      flatLimb(-10,0,-16,8,o.color,3.6); flatLimb(10,0,16,8,o.color,3.6); } }); }
function drawEvElf(o){ o.line='#0a3a18'; o.eyeColor='#8aff9a'; o.pupil='#0a3318';
  drawCreatureBase(o,{ bodyColor:'#2f8a4a', bodyColor2:'#15602e', headColor:'#e0b48a', line:'#0a3a18',
    back:function(){ ctx.strokeStyle='#7a4a20'; ctx.lineWidth=2.6; ctx.beginPath(); ctx.arc(-20,4,12,-Math.PI*0.7,Math.PI*0.7); ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=1; ctx.beginPath();
      ctx.moveTo(-20+12*Math.cos(-Math.PI*0.7),4+12*Math.sin(-Math.PI*0.7)); ctx.lineTo(-20+12*Math.cos(Math.PI*0.7),4+12*Math.sin(Math.PI*0.7)); ctx.stroke(); },
    extra:function(){ for(const s of [1,-1]) flatPoly([[s*9,-16],[s*17,-20],[s*11,-11]],'#e0b48a',CAT_LINE,1.8);
      flatPoly([[-11,o.headY-5],[11,o.headY-5],[0,o.headY-26]],'#217a3a',CAT_LINE,2);
      ctx.fillStyle='#e8e8f0'; flatPoly([[-11,o.headY-4],[11,o.headY-4],[9,o.headY]],'#e8e8f0',CAT_LINE,1.6);
      ctx.beginPath(); ctx.arc(0,o.headY-26,2.6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#3a2a10'; ctx.fillRect(-o.bodyRx,o.bodyY+2,o.bodyRx*2,3); } }); }
function drawEvSnowman(o){ o.line='#8aa8c0';
  const sway=Math.sin(frameCount*0.1)*1.5;
  drawCreatureBase(o,{ noHead:true, noLegs:true, noBelly:true, line:'#8aa8c0',
    back:function(){ ctx.strokeStyle='#6b4a2a'; ctx.lineWidth=2.4; ctx.lineCap='round'; ctx.beginPath();
      ctx.moveTo(-12,2); ctx.lineTo(-26,-6+sway); ctx.moveTo(-22,-3+sway); ctx.lineTo(-26,3+sway);
      ctx.moveTo(12,2); ctx.lineTo(26,-6-sway); ctx.moveTo(22,-3-sway); ctx.lineTo(26,3-sway);
      ctx.stroke(); ctx.lineCap='butt'; },
    extra:function(){ flatBall(0,14,13,10,o.color,monsterLight(o.color),2,'#8aa8c0'); flatBall(0,0,11,10,o.color,monsterLight(o.color),2,'#8aa8c0'); flatBall(0,-15,10,9,o.color,monsterLight(o.color),2,'#8aa8c0');
      ctx.fillStyle='#1a1a1a'; ctx.beginPath(); ctx.arc(0,2,1.6,0,Math.PI*2); ctx.arc(0,6,1.6,0,Math.PI*2); ctx.arc(0,10,1.6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1a1a1a'; flatPoly([[-6,-18],[-1,-16],[-6,-15]],'#1a1a1a'); flatPoly([[6,-18],[1,-16],[6,-15]],'#1a1a1a');
      flatPoly([[0,-15],[-16,-11],[0,-10]],'#ff7a1a',CAT_LINE,1.2);
      ctx.fillStyle='#1a1a1a'; for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.arc(i*3,-6+Math.abs(i),1.4,0,Math.PI*2); ctx.fill(); }
      ctx.fillStyle='#20202a'; ctx.strokeStyle=CAT_LINE; ctx.lineWidth=2;
      ctx.beginPath(); ctx.rect(-7,-34,14,12); ctx.fill(); ctx.stroke();
      ctx.fillRect(-12,-23,24,3); ctx.strokeRect(-12,-23,24,3);
      ctx.fillStyle='#c02020'; ctx.fillRect(-7,-25,14,2.4); } }); }
function drawEvGremlin(o){ o.line='#3a0016'; o.eyeColor='#ffe14d'; o.pupil='#3a1000'; o.bodyRx=11; o.bodyRy=10.5; o.headR=10.5; o.headY=-14;
  drawCreatureBase(o,{ ears:function(){ for(const s of [1,-1]) flatPoly([[s*7,-16],[s*20,-24],[s*11,-9]],o.color,CAT_LINE,2); },
    extra:function(){ ctx.strokeStyle='#e03030'; ctx.lineWidth=3.6; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(14,18); ctx.lineTo(14,-8); ctx.stroke();
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(14,18); ctx.lineTo(14,-8); ctx.stroke();
      ctx.strokeStyle='#e03030'; ctx.lineWidth=3.4; ctx.beginPath(); ctx.arc(14,-12,4.4,Math.PI*0.5,Math.PI*1.9); ctx.stroke(); ctx.lineCap='butt';
      ctx.fillStyle='#fff'; flatPoly([[-3.4,-8],[-4.4,-12],[-2.2,-8]],'#fff',CAT_LINE,1); flatPoly([[3.4,-8],[4.4,-12],[2.2,-8]],'#fff',CAT_LINE,1); } }); }
// ---------- DISPATCHER ----------
function enemyKind(e){
  if(e.isBoss) return 'B:'+(e.bossStyle||'dragon');
  if(typeof e.type==='string') return 'E:'+e.type;
  return 'N:'+e.type;
}
function drawEnemy(e, opts){
  const scale=e.scale;
  const hideHud=!!(opts&&opts.hideHud);
  const bounce=pxSnap(Math.sin(e.walkCycle)*1.5);
  const lunge=e.attackAnim>0?-pxSnap(e.attackAnim*0.7):0;
  const attackScale=e.attackAnim>0?1.12:1;
  ctx.save();
  ctx.translate(e.x+lunge,e.y+bounce);
  ctx.scale(attackScale*scale,attackScale*scale);
  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0,GROUND_Y-e.y-bounce,18,6,0,0,Math.PI*2); ctx.fill();
  const o=enemyBase(e);
  switch(enemyKind(e)){
    case 'N:0': drawEnemyOrc(o); break;
    case 'N:1': drawEnemyTank(o); break;
    case 'N:2': drawEnemyRunner(o); break;
    case 'N:3': drawEnemyFlyer(o); break;
    case 'N:4': drawEnemyDarkMage(o); break;
    case 'N:5': drawEnemyVenom(o); break;
    case 'N:6': drawEnemyGiant(o); break;
    case 'N:7': drawEnemyBrute(o); break;
    case 'N:8': drawEnemyScorpion(o); break;
    case 'N:9': drawEnemyGhost(o); break;
    case 'N:10': drawEnemyGolem(o); break;
    case 'N:11': drawEnemyMummy(o); break;
    case 'N:12': drawEnemyBeetle(o); break;
    case 'N:13': drawEnemyDjinn(o); break;
    case 'N:14': drawEnemyCactus(o); break;
    case 'N:15': drawEnemyAnkh(o); break;
    case 'B:dragon': drawBossDragon(o); break;
    case 'B:titan': drawBossTitan(o); break;
    case 'B:demon': drawBossDemon(o); break;
    case 'B:pharaoh': drawBossPharaoh(o); break;
    case 'B:sandgolem': drawBossSandGolem(o); break;
    case 'B:djinnboss': drawBossDjinn(o); break;
    case 'B:pumpkin': drawBossPumpkin(o); break;
    case 'B:alien': drawBossAlienEmperor(o); break;
    case 'B:infernal': drawBossInfernalLord(o); break;
    case 'B:krampus': drawBossKrampus(o); break;
    case 'E:zombie': drawEvZombie(o); break;
    case 'E:spider': drawEvSpider(o); break;
    case 'E:witch': drawEvWitch(o); break;
    case 'E:drone': drawEvDrone(o); break;
    case 'E:alien': drawEvAlien(o); break;
    case 'E:psycho': drawEvPsycho(o); break;
    case 'E:imp': drawEvImp(o); break;
    case 'E:hound': drawEvHound(o); break;
    case 'E:succubus': drawEvSuccubus(o); break;
    case 'E:elf': drawEvElf(o); break;
    case 'E:snowman': drawEvSnowman(o); break;
    case 'E:gremlin': drawEvGremlin(o); break;
    default: drawCreatureBase(o,{}); break;
  }
  if(e.poisonTimer>0){ ctx.strokeStyle='rgba(120,255,110,0.75)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,23+Math.sin(frameCount*0.3)*2,0,Math.PI*2); ctx.stroke(); }
  ctx.restore();
  if(hideHud) return;
  const barW=28*scale, barY=e.y-38*scale+bounce;
  ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(e.x-barW/2-1,barY-1,barW+2,6);
  ctx.fillStyle='#000'; ctx.fillRect(e.x-barW/2,barY,barW,4);
  ctx.fillStyle='#f00'; ctx.fillRect(e.x-barW/2,barY,barW*Math.max(0,e.hp/e.maxHp),4);
  if(e.isBoss){
    ctx.fillStyle='#ff5555'; ctx.font='bold 12px Arial'; ctx.textAlign='center';
    ctx.strokeStyle='#000'; ctx.lineWidth=3; ctx.lineJoin='round';
    ctx.strokeText('👑 '+e.name,e.x,e.y-50*scale+bounce);
    ctx.fillText('👑 '+e.name,e.x,e.y-50*scale+bounce);
    if(e.hp<=e.maxHp*0.5){
      ctx.fillStyle='#ffaa00'; ctx.font='bold 10px Arial';
      ctx.strokeText('🛡️ Inmune al cañón',e.x,e.y-38*scale+bounce);
      ctx.fillText('🛡️ Inmune al cañón',e.x,e.y-38*scale+bounce);
    }
  }
}