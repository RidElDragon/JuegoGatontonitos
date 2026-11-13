(function(){
  'use strict';
  let panel, status, sdkPromise, sdk, auth, db, user=null, remote=null, linked=false, busy=false, authReady=false;
  let timer=null, lastAttempt=0, stateVersion=0;
  let deletionPending=false;
  const owner=()=>localStorage.getItem('catBattleLocalOwner')||'guest';
  let localOwner=owner(),sessionBase=null,statusText='';
  const checkpointKey=uid=>'catBattleCloudBase:'+uid;
  const configured=()=>{const c=window.CAT_FIREBASE_CONFIG;return c&&['apiKey','authDomain','projectId','appId'].every(k=>typeof c[k]==='string'&&c[k].trim());};
  function message(text){statusText=text;if(status)status.textContent=text;}
  function errorText(e){
    if(e.code==='auth/requires-recent-login')return 'Vuelve a introducir tu contraseña para confirmar la eliminación.';
    if(e.code==='auth/wrong-password')return 'La contraseña no es correcta. No se ha eliminado la cuenta.';
    if(e.code==='cloud/conflict')return e.message;
    const messages={'auth/invalid-credential':'No se pudo iniciar sesión. Revisa el correo y la contraseña.','auth/email-already-in-use':'No se pudo crear la cuenta con ese correo. Prueba iniciar sesión o recuperar la contraseña.','auth/invalid-email':'Introduce un correo válido.','auth/weak-password':'La contraseña no cumple la política del proyecto.','auth/too-many-requests':'Demasiados intentos. Espera antes de volver a probar.','auth/network-request-failed':'Sin conexión. Tu progreso sigue guardado localmente.','permission-denied':'Firebase rechazó el acceso. Comprueba las reglas y la configuración del proyecto.','unavailable':'La nube no está disponible. Tu progreso sigue guardado localmente.'};
    return messages[e.code]||e.message||'No se pudo completar la operación.';
  }
  function capture(){
    if(owner()!==localOwner)throw new Error('La partida cambió en otra pestaña. Recarga esta página antes de continuar.');
    if(!window.gameReady||!metaReady)throw new Error('Espera a que termine de cargar el progreso local.');
    if(isDevMode()||isTest())throw new Error('Sal del modo desarrollador o sandbox antes de sincronizar.');
    const g=exportGachaProgress();
    return CloudSchema.validate(JSON.parse(JSON.stringify({meta:snapshotMeta(),story:storyProgress,events:eventProgress,legend:legendProgress,loadout,forms:unitFormPref,storage:g.storage,missions:g.missions,achievements:exportAchievements(),bestiary:exportBestiary(),battle:readSave()})));
  }
  function readCheckpoint(uid){try{return JSON.parse(localStorage.getItem(checkpointKey(uid)));}catch(e){return null;}}
  sessionBase=localOwner==='guest'?null:readCheckpoint(localOwner);
  function remember(uid,doc){localStorage.setItem(checkpointKey(uid),JSON.stringify({revision:doc.revision,fingerprint:CloudCore.canonical(doc.progress)}));}
  function cloudRef(uid){return sdk.doc(db,'players',uid);}
  function deletionRef(uid){return sdk.doc(db,'accountDeletions',uid);}
  const pendingMessage='El progreso de la nube se ha eliminado y sus subidas están bloqueadas. Vuelve a pulsar «Eliminar cuenta» para terminar de eliminar el acceso.';
  async function checkDeletion(uid){
    const snap=await sdk.getDocFromServer(deletionRef(uid));
    if(user?.uid===uid&&snap.exists()){
      deletionPending=true;linked=false;remote=null;clearTimeout(timer);timer=null;
      message(pendingMessage);updateButtons();
    }
    return snap.exists();
  }
  function updateButtons(){
    if(!panel)return;
    panel.querySelector('#accountIdentity').textContent=user?user.email||'Cuenta conectada':(owner()==='guest'?'Modo invitado':'Partida local de una cuenta; inicia sesión para sincronizar');
    for(const b of panel.querySelectorAll('[data-account-auth]'))b.disabled=busy||!!user||!configured();
    panel.querySelector('#cloudUpload').disabled=busy||!authReady||!user||(owner()!=='guest'&&owner()!==user.uid);
    panel.querySelector('#cloudDownload').disabled=busy||!authReady||!user||!remote;
    panel.querySelector('#accountLogout').disabled=busy||(!user&&owner()==='guest');
    panel.querySelector('#accountRestore').disabled=busy||!user||!localStorage.getItem('catBattleProfile:'+user.uid);
    if(deletionPending)for(const id of ['cloudUpload','cloudDownload','accountRestore'])panel.querySelector('#'+id).disabled=true;
    panel.querySelector('#accountDelete').disabled=busy||!authReady||!user;
    panel.querySelector('#accountDeleteConfirm').disabled=busy;
    panel.querySelector('#accountDeleteCancel').disabled=busy;
  }
  async function services(){
    if(sdkPromise)return sdkPromise;
    if(!configured())throw new Error('El modo nube todavía no está configurado. Puedes seguir jugando como invitado.');
    if(location.protocol==='file:')throw new Error('Para usar cuentas, abre el juego desde localhost o una dirección HTTPS. El modo invitado funciona con doble clic.');
    sdkPromise=(async()=>{
      const base='https://www.gstatic.com/firebasejs/13.3.0/';
      const [app,a,f]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
      sdk={...a,...f};const instance=app.initializeApp(window.CAT_FIREBASE_CONFIG);auth=a.getAuth(instance);db=f.getFirestore(instance);
      auth.languageCode='es';
      if(window.CAT_APP_CHECK_SITE_KEY){const check=await import(base+'firebase-app-check.js');check.initializeAppCheck(instance,{provider:new check.ReCaptchaV3Provider(window.CAT_APP_CHECK_SITE_KEY),isTokenAutoRefreshEnabled:true});}
      await a.setPersistence(auth,a.browserLocalPersistence);
      a.onAuthStateChanged(auth,async current=>{
        const token=++stateVersion;user=current;linked=false;remote=null;deletionPending=false;authReady=false;clearTimeout(timer);timer=null;updateButtons();
        if(!user){authReady=true;message('Juega como invitado o inicia sesión para recuperar tu partida.');updateButtons();return;}
        try{
          if(await checkDeletion(current.uid)){if(token===stateVersion){authReady=true;updateButtons();}return;}
          if(token!==stateVersion)return;
          const snap=await f.getDocFromServer(cloudRef(current.uid));if(token!==stateVersion)return;
          remote=snap.exists()?snap.data():null;
          if(remote){if(remote.schema!==1||!Number.isSafeInteger(remote.revision))throw new Error('Guardado de nube incompatible. Se ha conservado sin cambios.');CloudSchema.validate(remote.progress);}
          const cp=owner()===current.uid?sessionBase:null;
          linked=owner()===current.uid&&!!cp&&cp.revision===(remote?.revision||0);
          authReady=true;
          message(linked?'Cuenta conectada. Los cambios se sincronizarán automáticamente.':remote?'Hay una partida en la nube. Elige descargarla o subir la local. No se combinarán.':'Cuenta sin partida en la nube. Pulsa «Subir partida local» para vincularla.');
          if(linked)schedule();
        }catch(e){if(token===stateVersion){authReady=true;message(errorText(e));}}
        if(token===stateVersion)updateButtons();
      },e=>{authReady=true;message(errorText(e));});
      return sdk;
    })().catch(e=>{sdkPromise=null;throw e;});
    return sdkPromise;
  }
  async function action(fn){if(busy)return;busy=true;updateButtons();try{await fn();}catch(e){message(errorText(e));}finally{busy=false;updateButtons();}}
  async function authenticate(register){await action(async()=>{
    await services();const email=panel.querySelector('#accountEmail').value.trim(),input=panel.querySelector('#accountPassword'),password=input.value;input.value='';
    try{if(register)await sdk.createUserWithEmailAndPassword(auth,email,password);else await sdk.signInWithEmailAndPassword(auth,email,password);}finally{input.value='';}
  });}
  async function upload(manual=false){
    if(deletionPending)throw new Error(pendingMessage);
    if(!user||!authReady||(!manual&&!linked))return;
    if(owner()!=='guest'&&owner()!==user.uid)throw new Error('Esta partida local pertenece a otra cuenta. Descarga la de la cuenta actual o vuelve al modo invitado.');
    const uid=user.uid,token=stateVersion,payload=capture(),fingerprint=CloudCore.canonical(payload),cp=sessionBase;
    if(!manual&&cp?.fingerprint===fingerprint)return;
    const expected=manual?(remote?.revision||0):(cp?.revision||0);
    CloudCore.persist(localStorage,payload);
    lastAttempt=Date.now();
    let result;
    try{
      result=await sdk.runTransaction(db,async tx=>{
        const ref=cloudRef(uid),snap=await tx.get(ref);
        const next=CloudCore.nextDocument(snap.exists()?snap.data():null,payload,expected);
        tx.set(ref,{...next,updatedAt:sdk.serverTimestamp()});return next;
      });
    }catch(e){
      if((e.code==='cloud/conflict'||e.code==='permission-denied')&&token===stateVersion&&await checkDeletion(uid).catch(()=>false))throw new Error(pendingMessage);
      if(e.code==='cloud/conflict'&&token===stateVersion){linked=false;const snap=await sdk.getDocFromServer(cloudRef(uid));remote=snap.exists()?snap.data():null;}
      throw e;
    }
    if(token!==stateVersion)return;
    // La partida de invitado se conserva antes de vincular el dispositivo.
    if(owner()==='guest')CloudCore.archive(localStorage,'guest');
    localStorage.setItem('catBattleLocalOwner',uid);localOwner=uid;remember(uid,result);sessionBase=readCheckpoint(uid);remote=result;linked=true;
    message('Progreso guardado en la nube.');
  }
  function schedule(){
    if(deletionPending)return;
    if(timer||busy||!linked||!user||!window.gameReady||isDevMode()||isTest())return;
    timer=setTimeout(()=>{timer=null;action(()=>upload(false)).then(()=>updateButtons());},Math.max(5000,30000-(Date.now()-lastAttempt)));
  }
  function reload(){window.cloudReloading=true;playing=false;localStorage.setItem('catBattleProfileEpoch',String(Date.now())+Math.random());location.reload();}
  async function download(){await action(async()=>{
    if(deletionPending)throw new Error(pendingMessage);
    if(await checkDeletion(user.uid))throw new Error(pendingMessage);
    if(playing||isDevMode()||isTest())throw new Error('Vuelve al menú y sal del modo desarrollador o sandbox para cambiar de partida.');
    const uid=user.uid,token=stateVersion,snap=await sdk.getDocFromServer(cloudRef(uid));
    if(token!==stateVersion)return;
    if(!snap.exists())throw new Error('Esta cuenta no tiene una partida en la nube.');
    const doc=snap.data();if(doc.schema!==1||!Number.isSafeInteger(doc.revision))throw new Error('Formato de guardado desconocido.');CloudSchema.validate(doc.progress);
    if(!confirm('¿Descargar la partida de la cuenta? La partida local se conservará en un respaldo, pero será reemplazada en este dispositivo.'))return;
    persist();CloudCore.archive(localStorage,owner());CloudCore.install(localStorage,doc.progress,uid);remember(uid,doc);reload();
  });}
  async function uploadChosen(){await action(async()=>{
    if(playing)throw new Error('Vuelve al menú antes de vincular una partida.');
    if(!linked&&!confirm(remote?'¿Reemplazar la partida de la nube con la de este dispositivo? No se sumarán los progresos.':'¿Vincular la partida de este dispositivo a esta cuenta?'))return;
    persist();await upload(true);
  });}
  function persist(){
    if(owner()!==localOwner)throw new Error('La partida cambió en otra pestaña. Recarga antes de guardar.');
    if(!window.gameReady||!metaReady||isDevMode()||isTest())return;
    saveMeta();saveStoryProgress();saveEventProgress();saveLegendProgress();saveLoadout();saveForms();
    CloudCore.persist(localStorage,capture());
  }
  async function logout(){await action(async()=>{
    if(playing||isDevMode()||isTest())throw new Error('Vuelve al menú y sal del modo desarrollador o sandbox para cerrar sesión.');
    if(!confirm('¿Cerrar sesión y volver a tu partida de invitado en este dispositivo?'))return;
    const currentOwner=owner();
    if(currentOwner!=='guest'){
      // El progreso pendiente queda archivado, incluso si no hay conexión.
      persist();CloudCore.archive(localStorage,currentOwner);
    }
    linked=false;clearTimeout(timer);
    if(auth)await sdk.signOut(auth);
    if(currentOwner!=='guest'){CloudCore.restoreGuest(localStorage);reload();}
    else message('Sesión cerrada. Tu partida de invitado se conserva.');
  });}
  async function deleteAccount(){await action(async()=>{
    const input=panel.querySelector('#accountDeletePassword');
    try{
      if(!user)throw new Error('Inicia sesión en la cuenta que quieres eliminar.');
      if(playing||isDevMode()||isTest())throw new Error('Vuelve al menú y sal del modo desarrollador o sandbox antes de eliminar la cuenta.');
      if(!input.value)throw new Error('Introduce tu contraseña actual para confirmar la eliminación.');
      if(!confirm('¿Eliminar definitivamente esta cuenta y TODO su progreso en la nube? También se borrará su respaldo en este navegador. Tu partida de invitado se conservará. Esta acción no se puede deshacer.'))return;
      const account=user,uid=account.uid;
      const credential=sdk.EmailAuthProvider.credential(account.email,input.value);input.value='';
      await sdk.reauthenticateWithCredential(account,credential);
      if(user?.uid!==uid)throw new Error('La sesión cambió. Vuelve a abrir el panel de cuenta.');
      if(owner()==='guest')persist();
      linked=false;clearTimeout(timer);timer=null;
      // Cuenta y Firestore no comparten transacciones. La marca impide que un cliente antiguo recree el progreso.
      if(!await checkDeletion(uid)){
        const batch=sdk.writeBatch(db);
        batch.set(deletionRef(uid),{requestedAt:sdk.serverTimestamp()});
        batch.delete(cloudRef(uid));
        await batch.commit();
        deletionPending=true;remote=null;
      }
      message('Progreso eliminado. Terminando de eliminar la cuenta…');
      try{await sdk.deleteUser(account);}
      catch(e){throw new Error(pendingMessage+' '+errorText(e));}
      // Evita que los listeners de cierre vuelvan a escribir la partida eliminada.
      window.cloudReloading=true;playing=false;
      try{CloudCore.finishAccountDeletion(localStorage,uid);}
      catch(e){throw new Error('La cuenta y su progreso de la nube ya se eliminaron, pero no se pudo limpiar su copia local. Revisa el almacenamiento del navegador antes de continuar.');}
      panel.querySelector('#accountDeleteForm').hidden=true;
      message('Cuenta eliminada. Volviendo al modo invitado…');
      reload();
    }finally{input.value='';}
  });}
  function build(){
    if(panel)return;
    panel=document.createElement('div');panel.id='accountOverlay';panel.hidden=true;
    panel.innerHTML='<section class="account-box" role="dialog" aria-modal="true" aria-labelledby="accountTitle"><h2 id="accountTitle">Cuenta y guardado</h2><p id="accountIdentity"></p><p id="accountStatus" role="status" aria-live="polite"></p><form id="accountForm"><label>Correo<input id="accountEmail" type="email" autocomplete="username" required maxlength="254"></label><label>Contraseña<input id="accountPassword" type="password" autocomplete="current-password" required minlength="6" maxlength="128"></label><div class="account-actions"><button class="save-btn" data-account-auth type="submit">Iniciar sesión</button><button class="save-btn" data-account-auth id="accountRegister" type="button">Crear cuenta</button><button class="save-btn" data-account-auth id="accountRecover" type="button">Recuperar contraseña</button></div></form><div class="account-actions"><button class="save-btn" id="cloudUpload">Subir partida local</button><button class="save-btn" id="cloudDownload">Descargar partida de la cuenta</button><button class="save-btn" id="accountLogout">Cerrar sesión / volver a invitado</button><button class="account-danger" id="accountDelete">Eliminar cuenta</button><button class="back" id="accountClose">Volver</button></div><form id="accountDeleteForm" class="account-delete-form" hidden><p>La eliminaci?n es definitiva: se borrar?n tu cuenta, su progreso en la nube y el respaldo de esta cuenta en este navegador.</p><label>Contrase?a actual<input id="accountDeletePassword" type="password" autocomplete="current-password" required maxlength="128"></label><div class="account-actions"><button id="accountDeleteConfirm" class="account-danger" type="submit">Eliminar definitivamente</button><button id="accountDeleteCancel" class="back" type="button">Cancelar</button></div></form><p class="account-note">Puedes jugar sin cuenta. La sincronización necesita internet; los cambios sin conexión se conservan en este dispositivo.</p></section>';
    document.body.appendChild(panel);status=panel.querySelector('#accountStatus');
    const restore=document.createElement('button');restore.id='accountRestore';restore.type='button';restore.className='save-btn';restore.textContent='Recuperar respaldo local de esta cuenta';
    panel.querySelector('#accountLogout').parentElement.appendChild(restore);
    restore.onclick=()=>action(async()=>{
      if(playing||isDevMode()||isTest())throw new Error('Vuelve al menú y sal del modo desarrollador o sandbox.');
      if(!confirm('¿Recuperar el respaldo local de esta cuenta? Su sincronización quedará pendiente hasta resolver posibles diferencias con la nube.'))return;
      persist();CloudCore.archive(localStorage,owner());CloudCore.restoreAccount(localStorage,user.uid);reload();
    });
    panel.querySelector('#accountForm').onsubmit=e=>{e.preventDefault();authenticate(false);};
    panel.querySelector('#accountRegister').onclick=()=>{if(panel.querySelector('#accountForm').reportValidity())authenticate(true);};
    panel.querySelector('#accountRecover').onclick=()=>action(async()=>{await services();const input=panel.querySelector('#accountEmail');if(!input.reportValidity()||!input.value)return;await sdk.sendPasswordResetEmail(auth,input.value.trim());message('Si el correo corresponde a una cuenta, recibirás instrucciones para recuperar el acceso.');});
    panel.querySelector('#cloudUpload').onclick=uploadChosen;panel.querySelector('#cloudDownload').onclick=download;panel.querySelector('#accountLogout').onclick=logout;
    panel.querySelector('#accountDelete').onclick=()=>{
      panel.querySelector('#accountDeleteForm').hidden=false;
      panel.querySelector('#accountDeletePassword').focus();
    };
    panel.querySelector('#accountDeleteForm').onsubmit=event=>{event.preventDefault();return deleteAccount();};
    panel.querySelector('#accountDeleteCancel').onclick=()=>{
      panel.querySelector('#accountDeletePassword').value='';panel.querySelector('#accountDeleteForm').hidden=true;
    };
    panel.querySelector('#accountClose').onclick=()=>{if(!busy){panel.querySelector('#accountPassword').value='';panel.querySelector('#accountDeletePassword').value='';panel.querySelector('#accountDeleteForm').hidden=true;panel.hidden=true;}};
    updateButtons();
  }
  window.AccountUI={open(){build();panel.hidden=false;message(configured()?(statusText||'Conectando con tu cuenta…'):'El guardado en la nube aún no está activado. Puedes seguir jugando como invitado.');if(configured())services().then(()=>updateButtons()).catch(e=>message(errorText(e)));updateButtons();},capture,isLinked:()=>linked};
  window.addEventListener('storage',event=>{
    if(event.key==='catBattleProfileEpoch'||(event.key==='catBattleLocalOwner'&&owner()!==localOwner)){
      window.cloudReloading=true;playing=false;linked=false;clearTimeout(timer);location.reload();
    }
  });
  // Sin callbacks de red en beforeunload: los cambios se guardan localmente y se reintentan al volver.
  setInterval(()=>{if(window.gameReady&&configured()){if(!sdkPromise)services().catch(()=>{});else schedule();}},15000);
  window.addEventListener('online',()=>{
    if(!configured())return;
    services().then(async()=>{
      if(!user)return;
      if(await checkDeletion(user.uid))return;
      const uid=user.uid,token=stateVersion,snap=await sdk.getDocFromServer(cloudRef(uid));
      if(token!==stateVersion)return;
      remote=snap.exists()?snap.data():null;
      if(remote){if(remote.schema!==1||!Number.isSafeInteger(remote.revision))throw new Error('Guardado de nube incompatible.');CloudSchema.validate(remote.progress);}
      linked=owner()===uid&&!!sessionBase&&sessionBase.revision===(remote?.revision||0);
      message(linked?'Conexión recuperada. Se sincronizarán los cambios pendientes.':'Conexión recuperada. Revisa qué partida quieres conservar antes de sincronizar.');
      updateButtons();schedule();
    }).catch(e=>message(errorText(e)));
  });
})();
