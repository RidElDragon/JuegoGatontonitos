(function(root){
  'use strict';
  const schema=typeof module!=='undefined'&&module.exports?require('./15-cloud-schema.js'):root.CloudSchema;
  const names={meta:'catBattleMeta',story:'catBattleStory',events:'catBattleEvents',legend:'catBattleLegend',loadout:'catBattleLoadout',forms:'catBattleForms',storage:'catBattleStorage',missions:'catBattleMissions',achievements:'catBattleAch',bestiary:'catBattleBestiary',battle:'catBattleSave'};
  const localKeys=[...Object.values(names),'catBattleMetaBak','catBattleStorageLegacy'];
  function canonical(value){if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';return JSON.stringify(value);}
  function nextDocument(remote,payload,expectedRevision){
    schema.validate(payload);
    if(remote && (remote.schema!==1||!Number.isSafeInteger(remote.revision)||remote.revision<1))throw new Error('La nube contiene un formato desconocido. No se ha sobrescrito.');
    const revision=remote?remote.revision:0;
    if(revision!==expectedRevision){const e=new Error('Otro dispositivo guardó una partida más reciente. Elige cuál conservar.');e.code='cloud/conflict';throw e;}
    return {schema:1,revision:revision+1,progress:payload};
  }
  function readRaw(storage){return Object.fromEntries(localKeys.map(key=>[key,storage.getItem(key)]));}
  function writeRaw(storage,raw){for(const key of localKeys){if(raw[key]===null||raw[key]===undefined)storage.removeItem(key);else storage.setItem(key,raw[key]);}}
  function archive(storage,owner){storage.setItem('catBattleProfile:'+owner,JSON.stringify(readRaw(storage)));}
  function persist(storage,payload){
    schema.validate(payload);
    const old=readRaw(storage);
    try{for(const [name,key] of Object.entries(names)){if(payload[name]===null)storage.removeItem(key);else storage.setItem(key,JSON.stringify(payload[name]));}}
    catch(e){try{writeRaw(storage,old);}catch(_){}throw e;}
  }
  function install(storage,payload,owner){
    schema.validate(payload);
    const old=readRaw(storage),oldOwner=storage.getItem('catBattleLocalOwner');
    const raw={};for(const [name,key] of Object.entries(names))raw[key]=payload[name]===null?null:JSON.stringify(payload[name]);
    try{writeRaw(storage,raw);storage.setItem('catBattleLocalOwner',owner);}
    catch(err){try{writeRaw(storage,old);if(oldOwner===null)storage.removeItem('catBattleLocalOwner');else storage.setItem('catBattleLocalOwner',oldOwner);}catch(_){}throw err;}
  }
  function restoreGuest(storage){
    const backup=storage.getItem('catBattleProfile:guest');
    if(!backup)throw new Error('No hay una partida de invitado guardada en este navegador.');
    const old=readRaw(storage),owner=storage.getItem('catBattleLocalOwner');
    try{writeRaw(storage,JSON.parse(backup));storage.removeItem('catBattleLocalOwner');}
    catch(e){writeRaw(storage,old);if(owner)storage.setItem('catBattleLocalOwner',owner);throw e;}
  }
  function restoreAccount(storage,uid){
    const raw=storage.getItem('catBattleProfile:'+uid);
    if(!raw)throw new Error('No hay un respaldo local de esta cuenta en este dispositivo.');
    const old=readRaw(storage),oldOwner=storage.getItem('catBattleLocalOwner');
    try{writeRaw(storage,JSON.parse(raw));storage.setItem('catBattleLocalOwner',uid);}
    catch(e){writeRaw(storage,old);if(oldOwner===null)storage.removeItem('catBattleLocalOwner');else storage.setItem('catBattleLocalOwner',oldOwner);throw e;}
  }
  function finishAccountDeletion(storage,uid){
    if(storage.getItem('catBattleLocalOwner')===uid){
      if(storage.getItem('catBattleProfile:guest'))restoreGuest(storage);
      else {writeRaw(storage,{});storage.removeItem('catBattleLocalOwner');}
    }
    storage.removeItem('catBattleProfile:'+uid);
    storage.removeItem('catBattleCloudBase:'+uid);
  }
  const api={canonical,nextDocument,readRaw,archive,persist,install,restoreGuest,restoreAccount,finishAccountDeletion};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CloudCore=api;
})(typeof window!=='undefined'?window:globalThis);
