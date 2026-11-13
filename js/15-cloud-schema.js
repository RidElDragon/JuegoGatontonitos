(function (root) {
  'use strict';
  const MAX = 1000000000;
  const metaBounds = {coins:MAX,incomeLevel:10,cannonDmgLevel:9,cannonRangeLevel:5,cannonCdLevel:5,coinBonusLevel:10,walletLevel:10,baseDefLevel:10,researchLevel:10,rewardLevel:10,ticketsNormal:MAX,ticketsRare:MAX,ticketsEvent:MAX,baseLevel:20};
  const minOne = ['incomeLevel','cannonDmgLevel','cannonRangeLevel','cannonCdLevel'];
  const plain = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const integer = (v, min=0, max=MAX) => Number.isSafeInteger(v) && v>=min && v<=max;
  function demand(condition, message) { if (!condition) throw new Error('Guardado inválido: '+message); }
  function keys(value, names, name) { demand(plain(value) && Object.keys(value).length === names.length && names.every(k=>Object.hasOwn(value,k)), name); }
  function list(value, length, check, name) { demand(Array.isArray(value)&&value.length===length&&value.every(check),name); }
  function map(value, limit, check, name) { demand(plain(value)&&Object.keys(value).length<=limit&&Object.entries(value).every(([k,v])=>k.length<=100&&check(v,k)),name); }
  function validate(p) {
    keys(p,['meta','story','events','legend','loadout','forms','storage','missions','achievements','bestiary','battle'],'estructura');
    const m=p.meta;
    keys(m,[...Object.keys(metaBounds),'unitLevels','gachaLevels','gachaUnlocked','treasuresObtained','expedition','consumables'],'mejoras');
    for(const [key,max] of Object.entries(metaBounds)) demand(integer(m[key],minOne.includes(key)?1:0,max),key);
    list(m.unitLevels,13,v=>integer(v,1,30),'niveles');
    list(m.gachaLevels,13,v=>integer(v,0,10),'niveles extra');
    list(m.gachaUnlocked,13,v=>typeof v==='boolean','desbloqueos');
    map(m.treasuresObtained,45,v=>integer(v,0,2),'tesoros');
    keys(m.consumables,['speed','radar','rich','cpu','sabelotodo','sniper'],'consumibles');
    demand(Object.values(m.consumables).every(v=>integer(v)),'cantidades de consumibles');
    if(m.expedition!==null) {
      keys(m.expedition,['durationHours','startTime','reward'],'expedición');
      demand([1,3,8,24].includes(m.expedition.durationHours)&&integer(m.expedition.startTime,0,Number.MAX_SAFE_INTEGER),'tiempo de expedición');
      const r=m.expedition.reward; keys(r,['coins','ticketType','ticketCount','consumable'],'recompensa de expedición');
      demand(integer(r.coins)&&[null,'normal','rare','event'].includes(r.ticketType)&&integer(r.ticketCount,0,2),'recompensa');
      if(r.consumable!==null) { keys(r.consumable,['id','count'],'objeto de expedición'); demand(Object.hasOwn(m.consumables,r.consumable.id)&&integer(r.consumable.count,1,2),'objeto'); }
    }
    demand(integer(p.story,0,45)&&integer(p.legend,0,30),'niveles completados');
    map(p.events,20,v=>integer(v,0,3),'eventos');
    demand(Array.isArray(p.loadout)&&p.loadout.length>=1&&p.loadout.length<=6&&new Set(p.loadout).size===p.loadout.length&&p.loadout.every(v=>integer(v,0,12)),'escuadrón');
    list(p.forms,13,v=>['normal','evo'].includes(v),'formas');
    keys(p.storage,['version','items'],'almacén'); demand(p.storage.version===2&&Array.isArray(p.storage.items)&&p.storage.items.length<=112,'almacén agrupado');
    const stacks=new Set();
    for(const s of p.storage.items) {
      keys(s,s.kind==='base'?['kind','banner','count']:['kind','idx','banner','count'],'premio');
      demand(['base','unitLvl','unlock'].includes(s.kind)&&[null,'normal','rare','event'].includes(s.banner)&&integer(s.count,1),'premio');
      if(s.kind!=='base') demand(integer(s.idx,0,12),'unidad del premio');
      const key=JSON.stringify([s.kind,s.idx??null,s.banner]); demand(!stacks.has(key),'premios repetidos'); stacks.add(key);
    }
    keys(p.missions,['claimed','stats'],'misiones'); map(p.missions.claimed,20,v=>integer(v,0,Number.MAX_SAFE_INTEGER),'misiones reclamadas');
    keys(p.missions.stats,['pulls','applies','maxWave'],'estadísticas'); demand(Object.values(p.missions.stats).every(v=>integer(v)),'estadísticas');
    keys(p.achievements,['unlocked','stats'],'logros'); map(p.achievements.unlocked,20,v=>integer(v,0,Number.MAX_SAFE_INTEGER),'logros desbloqueados'); map(p.achievements.stats,20,v=>integer(v),'estadísticas de logros');
    map(p.bestiary,100,v=>plain(v)&&Object.keys(v).length===2&&integer(v.n)&&typeof v.first==='string'&&v.first.length<=200,'bestiario');
    if(p.battle!==null) {
      keys(p.battle,['version','money','baseHP','enemyBaseHP','enemyBaseMaxHP','wave','walletCap','walletUpgrades','incomeUpgrades','timestamp'],'batalla');
      demand(p.battle.version===36&&Object.values(p.battle).every(v=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=Number.MAX_SAFE_INTEGER),'datos de batalla');
      demand(integer(p.battle.wave,1)&&integer(p.battle.walletUpgrades,0,6)&&integer(p.battle.incomeUpgrades,0,6)&&p.battle.money>=0&&p.battle.walletCap>=0,'mejoras de batalla');
    }
    demand(JSON.stringify(p).length<=150000,'tamaño máximo');
    return p;
  }
  const api={validate};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.CloudSchema=api;
})(typeof window!=='undefined'?window:globalThis);
