// Prueba real con Edge/Chrome y un perfil temporal, sin usar la partida del usuario.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http'),{spawn}=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const executable=process.env.CAT_TEST_BROWSER||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'cat-battle-browser-'));
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let browser,socket,server;
(async()=>{
 try{
  server=http.createServer((req,res)=>{const relative=decodeURIComponent(req.url.split('?')[0]);if(relative==='/js/firebase-config.js'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end('window.CAT_FIREBASE_CONFIG=null;window.CAT_APP_CHECK_SITE_KEY="";');return;}if(relative==='/js/username-config.js'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end('window.CAT_USERNAME_API="";');return;}const file=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));if(!file.startsWith(root+path.sep)||relative.includes('/.')||relative.includes('node_modules')){res.writeHead(403);res.end();return;}const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json'}[path.extname(file)];if(!mime){res.writeHead(404);res.end();return;}fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime});res.end(err?'':data);});});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=spawn(executable,['--headless','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
  browser.on('error',err=>{throw err;});
  let info;
  for(let i=0;i<200;i++){try{info=fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n');break;}catch(e){await wait(100);}}
  if(!info)throw Error('El navegador no abrió el puerto de prueba');
  socket=new WebSocket('ws://127.0.0.1:'+info[0]+info[1]);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  let sequence=0;const pending=new Map(),errors=[];
  socket.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.id){const task=pending.get(msg.id);if(task){pending.delete(msg.id);msg.error?task.reject(Error(msg.error.message)):task.resolve(msg.result);}}else if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails.text+': '+(msg.params.exceptionDetails.exception?.description||''));};
  const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});
  const target=await send('Target.createTarget',{url:'http://127.0.0.1:'+server.address().port+'/'});const {sessionId}=await send('Target.attachToTarget',{targetId:target.targetId,flatten:true});await send('Runtime.enable',{},sessionId);
  const evaluate=async expression=>{const value=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},sessionId);if(value.exceptionDetails)throw Error(value.exceptionDetails.exception?.description||'Error en la página');return value.result.value;};
  let ready=false;for(let i=0;i<150;i++){ready=await evaluate('window.gameReady===true');if(ready)break;await wait(100);}assert.ok(ready,'El juego terminó de cargar');
  const result=await evaluate(`(()=>{AccountUI.open();const accountVisible=!document.getElementById('accountOverlay').hidden;const uploadDisabled=document.getElementById('cloudUpload').disabled;const deleteDisabled=document.getElementById('accountDelete').disabled;const deleteFormHidden=document.getElementById('accountDeleteForm').hidden;const loginType=document.getElementById('accountEmail').type;window.CAT_USERNAME_API='https://api.example';document.getElementById('accountRegister').onclick();const nameRequired=document.getElementById('accountRegisterUsername').required;const registerEmailType=document.getElementById('accountRegisterEmail').type;document.getElementById('accountRecover').onclick();const recoverEmailType=document.getElementById('accountRecoverEmail').type;const deleteTextCorrect=document.getElementById('accountDeleteForm').textContent.includes('La eliminaci\u00f3n');window.CAT_USERNAME_API='';const progress=AccountUI.capture();document.getElementById('accountClose').click();showCarousel();const modes=document.querySelectorAll('#modeBand .mode-card');modes[0].click();return {accountVisible,uploadDisabled,deleteDisabled,deleteFormHidden,loginType,nameRequired,registerEmailType,recoverEmailType,deleteTextCorrect,modes:modes.length,chapters:getComputedStyle(document.getElementById('chapterScreen')).display!=='none',story:progress.story};})()`);
  assert.deepEqual(result,{accountVisible:true,uploadDisabled:true,deleteDisabled:true,deleteFormHidden:true,loginType:'text',nameRequired:true,registerEmailType:'email',recoverEmailType:'email',deleteTextCorrect:true,modes:5,chapters:true,story:0});assert.deepEqual(errors,[]);console.log('OK Edge: cuenta sin configurar, captura de progreso, cinco modos y capítulos; sin errores JavaScript.');
  await send('Browser.close').catch(()=>{});
 }finally{
  if(socket)socket.close();if(browser&&!browser.killed)browser.kill();if(server)await new Promise(resolve=>server.close(resolve));
  const resolved=path.resolve(profile);if(path.dirname(resolved)===path.resolve(os.tmpdir())&&path.basename(resolved).startsWith('cat-battle-browser-')){try{fs.rmSync(resolved,{recursive:true,force:true,maxRetries:10,retryDelay:200});}catch(e){console.log('Perfil temporal pendiente de limpieza: '+resolved);}}
 }
})().catch(err=>{console.error(err);process.exitCode=1;});
