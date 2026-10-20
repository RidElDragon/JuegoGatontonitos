// ============================================================
// 01-config.js — Constantes y datos ESTÁTICOS del juego (v79g)
// · GACHA_EVENT_POOL global (fix scope).
// · Raro = solo Rey Gatontito [9]; Evento = solo unidades de evento.
// · Cartera v78b (ampliación manual de pago, máx 6, sin crecimiento solo).
// · Income v78c (mejora en partida, máx 6, +5/s).
// · Tesoros v79e: 40% drop; si cae 60%🥉/25%🥈/15%🥇.
// ============================================================
const COIN = 'XP';
const GROUND_Y = 215;
const ENEMY_BASE_X = 850;
const MY_BASE_X = 50;
const MAX_CATS = 30;
const MAX_ENEMIES = 30;
const MAX_PARTICLES = 100;
const MAX_FLOATING_TEXTS = 20;
const MAX_INCOME_LEVEL = 10;
const MAX_STATS = 1000000;
const MAX_UNIT_LEVEL = 10;
const NUM_UNITS = 13;
const MAX_LOADOUT = 6;
const HEALER_SAFE_DIST = 120;
const HEALER_BACK_DIST = 60;
const HEALER_CATCHUP_GAP = 150;
const HEALER_CATCHUP_MULT = 2.5;
const TARGET_FPS = 60;
const FRAME_MS = 1000 / TARGET_FPS;
const BASE_INCOME = 0.0;
const INCOME_UPGRADE_BASE_COST = 400;
const CANNON_DMG_MAX = 9;
const CANNON_RANGE_MAX = 5;
const CANNON_CD_MAX = 5;
const CANNON_BASE_COOLDOWN = 1500;
const CANNON_MIN_COOLDOWN = 1200;
const CANNON_BOSS_LIMIT = 0.5;
const STORY_MAX_LEVEL = 45;
const COIN_BONUS_MAX = 10;
const COIN_BONUS_PER_LVL = 0.10;
const COIN_BONUS_BASE_COST = 4000;
const COIN_BONUS_COST_STEP = 4000;
const LEVEL_START_MONEY = 450;
const MAGE_UNIT_IDX = 4;
const MAGE_EVO_AOE = 130;
const HEALER_HOME_X = 60;
const BASE_HP_PER_LEVEL = 150;
const BASE_GACHA_MAX = 20;
const GACHA_LVL_MAX = 10;
const GACHA_NORMAL_POOL = [0, 1, 2, 3, 4, 5, 6];   // historia básica
const GACHA_RARE_POOL = [9];                        // solo Rey Gatontito (premium historia)
const GACHA_EVENT_POOL = [7, 8, 10, 11, 12];        // solo unidades de evento

const UNIT_EMOJI = ['🐱','','⚡','','🔮','💚','👑','','🤖','','','','🎅'];

// ------------------------------------------------------------
// UNIDADES JUGABLES
// ------------------------------------------------------------
const CAT_BASE = [
{ name:'Básico',       cost:50,   hp:80,   dmg:25,  speed:1.2, range:40,  cooldown:60,  color:'#ffcc66', color2:'#ff9933', type:'melee',  spawnCd:2 },
{ name:'Tanque',       cost:110,  hp:450,  dmg:12,  speed:0.8, range:30,  cooldown:90,  color:'#99ccff', color2:'#3366cc', type:'melee',  spawnCd:3 },
{ name:'Rápido',       cost:170,  hp:75,   dmg:100,  speed:2.2, range:35,  cooldown:100,  color:'#ff9999', color2:'#cc3333', type:'melee',  spawnCd:5 },
{ name:'Arquero',      cost:140,  hp:70,   dmg:50, speed:0.9, range:300, cooldown:75,  color:'#cc99ff', color2:'#6633cc', type:'ranged', projSpeed:6, spawnCd:3, projRange:400 },
{ name:'Mago',         cost:450,  hp:90,   dmg:50,  speed:0.8, range:180, cooldown:110, color:'#99ff99', color2:'#339933', type:'aoe', aoeRadius:90, projSpeed:5, spawnCd:6 },
{ name:'Sanador',      cost:300,  hp:100,  dmg:0,   speed:0.9, range:120, cooldown:80,  color:'#ff99cc', color2:'#cc3399', type:'healer', healAmt:50, spawnCd:8 },
{ name:'Gigante',      cost:1000, hp:1200, dmg:55,  speed:0.4, range:40,  cooldown:120, color:'#ff6600', color2:'#993300', type:'melee',  scale:1.8, spawnCd:12 },
{ name:'Robo-Espada',  cost:660,  hp:275,  dmg:38,  speed:1.0, range:45,  cooldown:70,  color:'#aabbcc', color2:'#667788', type:'melee',  spawnCd:5, visual:'robosword', upMult:1.20 },
{ name:'Robo-Pistola', cost:400,  hp:90,   dmg:33,  speed:1.0, range:240, cooldown:20,  color:'#8899aa', color2:'#556677', type:'roboRanged', projSpeed:9, spawnCd:4, visual:'robogun' },
{ name:'Rey Gatontito',cost:5500, hp:4200, dmg:170, speed:0.6, range:50,  cooldown:100, color:'#ffd700', color2:'#b8860b', type:'melee',  scale:2.4, spawnCd:60, visual:'king', aoeRadius:45 },
{ name:'Gato Demoníaco',cost:2700,hp:1500, dmg:80,  speed:1.5, range:45,  cooldown:70,  color:'#dd1111', color2:'#770000', type:'melee',  spawnCd:25, visual:'demon' },
{ name:'Gato Sin Cabeza',cost:900,hp:400,  dmg:37,  speed:1.5, range:45,  cooldown:60,  color:'#baffc2', color2:'#00331a', type:'melee',  spawnCd:10, visual:'headless', scale:1.15 },
{ name:'Gatoclaus',    cost:3100, hp:750, dmg:90,  speed:1,   range:260, cooldown:150, color:'#ee2222', color2:'#8a0f0f', type:'aoe', aoeRadius:100, projSpeed:7, spawnCd:30, scale:1.6, visual:'gatoclaus' },
];

const UNIT_UNLOCK = [
{ type:'story', lvl:0 },
{ type:'story', lvl:1 },
{ type:'story', lvl:2 },
{ type:'story', lvl:4 },
{ type:'story', lvl:6 },
{ type:'story', lvl:6 },
{ type:'story', lvl:10 },
{ type:'event', id:'alien', lvl:3 },
{ type:'event', id:'alien', lvl:2 },
{ type:'story', lvl:30 },
{ type:'event', id:'infernal', lvl:3 },
{ type:'event', id:'halloween', lvl:3 },
{ type:'event', id:'xmas', lvl:3 },
];

const UNIT_COIN_BASE = [3000, 4500, 6000, 6000, 9000, 7500, 13500, 10500, 9000, 30000, 18000, 12000, 25000];
const UNIT_COIN_STEP = [2000, 3000, 4000, 4000, 6000, 5000, 9000, 7000, 6000, 20000, 12000, 8000, 16000];

// ------------------------------------------------------------
// ENEMIGOS NORMALES
// ------------------------------------------------------------
const ENEMY_TYPES = [
{ name:'Orco',          hp:100,  dmg:15, speed:0.8,  range:30,  cooldown:70,  color:'#666',    color2:'#333',    reward:60,  type:'melee' },
{ name:'Tanque',        hp:250,  dmg:25, speed:0.5,  range:35,  cooldown:90,  color:'#444',    color2:'#222',    reward:120, type:'melee' },
{ name:'Corredor',      hp:60,   dmg:10, speed:2.0,  range:25,  cooldown:40,  color:'#993300', color2:'#662200', reward:80,  type:'melee' },
{ name:'Volador',       hp:80,   dmg:20, speed:1.2,  range:40,  cooldown:60,  color:'#6633cc', color2:'#330099', reward:100, type:'flying', flyY:120 },
{ name:'Mago Oscuro',   hp:120,  dmg:30, speed:0.6,  range:180, cooldown:100, color:'#330033', color2:'#000',    reward:140, type:'ranged', projSpeed:4 },
{ name:'Venomoso',      hp:150,  dmg:10, speed:0.9,  range:35,  cooldown:80,  color:'#339933', color2:'#006600', reward:110, type:'poison', poisonDmg:5, poisonDur:120 },
{ name:'Gigante',       hp:1000, dmg:60, speed:0.3,  range:50,  cooldown:130, color:'#333',    color2:'#111',    reward:300, type:'melee', scale:1.8 },
{ name:'Bruto',         hp:400,  dmg:45, speed:0.6,  range:40,  cooldown:100, color:'#8B4513', color2:'#5a2d0c', reward:160, type:'melee' },
{ name:'Escorpión',     hp:120,  dmg:15, speed:1.6,  range:30,  cooldown:50,  color:'#2e8b57', color2:'#145a32', reward:150, type:'poison', poisonDmg:8, poisonDur:150 },
{ name:'Fantasma',      hp:70,   dmg:25, speed:1.8,  range:35,  cooldown:55,  color:'#b0c4de', color2:'#778899', reward:130, type:'flying', flyY:110 },
{ name:'Gólem',         hp:800,  dmg:40, speed:0.35, range:45,  cooldown:120, color:'#708090', color2:'#2f4f4f', reward:250, type:'melee', scale:1.6 },
{ name:'Momia',         hp:600,  dmg:45, speed:0.5,  range:35,  cooldown:95,  color:'#e8d9a0', color2:'#8a7a45', reward:220, type:'melee', desertStyle:'mummy' },
{ name:'Escarabajo',    hp:220,  dmg:30, speed:1.7,  range:30,  cooldown:55,  color:'#1a1a2e', color2:'#4b0082', reward:180, type:'melee', desertStyle:'beetle' },
{ name:'Djinn Menor',   hp:300,  dmg:55, speed:1.3,  range:150, cooldown:85,  color:'#ffaa33', color2:'#aa5500', reward:260, type:'ranged', projSpeed:5, desertStyle:'djinn' },
{ name:'Cáctus Animado',hp:900,  dmg:35, speed:0.4,  range:38,  cooldown:105, color:'#2e8b57', color2:'#006400', reward:240, type:'poison', poisonDmg:10, poisonDur:150, desertStyle:'cactus' },
{ name:'Esqueleto Ankh',hp:450,  dmg:60, speed:0.9,  range:38,  cooldown:75,  color:'#f5f5dc', color2:'#b8a060', reward:280, type:'melee', desertStyle:'ankh' },
];

// ------------------------------------------------------------
// JEFES
// ------------------------------------------------------------
const BOSS_TYPES = [
{ name:'JEFE DRAGÓN',      hp:15000,  dmg:180, speed:0.4, range:60, cooldown:150, color:'#ff0000', color2:'#880000', reward:3000,  type:'boss', scale:2.5, bossStyle:'dragon' },
{ name:'TITÁN DE HIELO',   hp:22000,  dmg:140, speed:0.3, range:70, cooldown:160, color:'#00bfff', color2:'#006080', reward:5000,  type:'boss', scale:2.8, bossStyle:'titan' },
{ name:'REY DEMONIO',      hp:35000,  dmg:240, speed:0.5, range:60, cooldown:140, color:'#800080', color2:'#300030', reward:9000,  type:'boss', scale:3.0, bossStyle:'demon' },
{ name:'FARAÓN MOMIFICADO',hp:50000,  dmg:280, speed:0.4, range:65, cooldown:145, color:'#ffd700', color2:'#8a7a45', reward:12000, type:'boss', scale:2.9, bossStyle:'pharaoh' },
{ name:'COLOSO DE ARENA',  hp:70000,  dmg:320, speed:0.3, range:70, cooldown:155, color:'#daa520', color2:'#8b6914', reward:18000, type:'boss', scale:3.1, bossStyle:'sandgolem' },
{ name:'DJINN DEL DESIERTO',hp:100000,dmg:420, speed:0.5, range:80, cooldown:135, color:'#ff9933', color2:'#cc5500', reward:30000, type:'boss', scale:3.3, bossStyle:'djinnboss' },
];

// ------------------------------------------------------------
// ENEMIGOS Y JEFES DE EVENTOS
// ------------------------------------------------------------
const EVENT_ENEMY_TYPES = {
zombie:  { name:'Zombi', hp:300, dmg:40, speed:0.5, range:35,  cooldown:100, color:'#446644', color2:'#223322', reward:200, type:'melee' },
spider:  { name:'Araña Gigante', hp:120, dmg:25, speed:1.8, range:30, cooldown:50, color:'#222222', color2:'#000000', reward:150, type:'melee' },
witch:   { name:'Bruja', hp:180, dmg:35, speed:1.1, range:160, cooldown:90, color:'#6600cc', color2:'#330066', reward:180, type:'ranged', projSpeed:5 },
drone:   { name:'Dron Alien', hp:150, dmg:30, speed:2.0, range:35, cooldown:50, color:'#88ff88', color2:'#228822', reward:250, type:'flying', flyY:110 },
alien:   { name:'Soldado Alien', hp:500, dmg:60, speed:0.9, range:40, cooldown:80, color:'#00aa44', color2:'#005522', reward:300, type:'melee' },
psycho:  { name:'Psíquico Alien', hp:300, dmg:50, speed:0.8, range:200, cooldown:90, color:'#aa00ff', color2:'#550088', reward:350, type:'ranged', projSpeed:6 },
imp:     { name:'Diablillo', hp:250, dmg:45, speed:1.8, range:30, cooldown:45, color:'#ff4400', color2:'#882200', reward:300, type:'melee' },
hound:   { name:'Sabueso Infernal', hp:600, dmg:70, speed:1.2, range:40, cooldown:70, color:'#881100', color2:'#440800', reward:400, type:'melee' },
succubus:{ name:'Súcubo', hp:350, dmg:60, speed:1.0, range:190, cooldown:85, color:'#cc0066', color2:'#660033', reward:450, type:'ranged', projSpeed:6 },
elf:     { name:'Elfo Renegado', hp:280, dmg:40, speed:1.6, range:32, cooldown:55, color:'#2eaa4a', color2:'#145a24', reward:320, type:'melee', xmasStyle:'elf' },
snowman: { name:'Muñeco de Nieve Malvado', hp:750, dmg:55, speed:0.7, range:38, cooldown:85, color:'#f0f8ff', color2:'#9ab8cc', reward:420, type:'melee', xmasStyle:'snowman' },
gremlin: { name:'Gremlin del Árbol', hp:200, dmg:35, speed:1.9, range:170, cooldown:75, color:'#cc2255', color2:'#661133', reward:380, type:'ranged', projSpeed:6, xmasStyle:'gremlin' },
};
const EVENT_BOSS_TYPES = {
pumpkin: { name:'CALABAZA INFERNAL', hp:25000, dmg:200, speed:0.35, range:70, cooldown:140, color:'#ff6600', color2:'#883300', reward:5000,  type:'boss', scale:2.8, bossStyle:'pumpkin' },
emperor: { name:'EMPERADOR ZENON',   hp:60000, dmg:300, speed:0.4,  range:70, cooldown:140, color:'#00ff88', color2:'#005522', reward:20000, type:'boss', scale:3.0, bossStyle:'alien' },
lord:    { name:'SEÑOR INFERNAL',    hp:90000, dmg:400, speed:0.45, range:75, cooldown:140, color:'#ff2200', color2:'#550000', reward:40000, type:'boss', scale:3.2, bossStyle:'infernal' },
krampus: { name:'KRAMPUS',           hp:75000, dmg:380, speed:0.5,  range:80, cooldown:130, color:'#7a1010', color2:'#2a0505', reward:60000, type:'boss', scale:3.2, bossStyle:'krampus' },
};

const EVENTS = {
halloween: {
id:'halloween', name:'🎃 Noche de Halloween', theme:'halloween',
description:'Brujas, zombis y la temible Calabaza Infernal acechan en la noche más oscura.',
levels:[
{ name:'Cementerio',     enemyBaseHP:3000, spawnInterval:80, mult:1.5, pool:['zombie','spider'],         boss:null,      startMoney:500,  coins:3000 },
{ name:'Casa Embrujada', enemyBaseHP:5000, spawnInterval:70, mult:2.0, pool:['zombie','spider','witch'], boss:null,      startMoney:800,  coins:6000 },
{ name:'Bosque Oscuro',  enemyBaseHP:8000, spawnInterval:60, mult:2.5, pool:['zombie','spider','witch'], boss:'pumpkin', startMoney:1200, coins:12000, unlocks:[11] },
]
},
alien: {
id:'alien', name:'🛸 Invasión Alienígena', theme:'alien',
description:'Una flota extraterrestre ha llegado. Desbloquea a los Robo-Gatos defendiendo la Tierra.',
levels:[
{ name:'Avistamiento',    enemyBaseHP:12000, spawnInterval:55, mult:3.5, pool:['drone','alien'],         boss:null,      startMoney:1500, coins:20000 },
{ name:'Nave Nodriza',    enemyBaseHP:18000, spawnInterval:50, mult:4.5, pool:['drone','alien','psycho'],boss:null,      startMoney:2000, coins:30000, unlocks:[8] },
{ name:'Emperador Zenon', enemyBaseHP:26000, spawnInterval:45, mult:5.5, pool:['drone','alien','psycho'],boss:'emperor', startMoney:2600, coins:50000, unlocks:[7] },
]
},
infernal: {
id:'infernal', name:' Incursión Infernal', theme:'infernal',
description:'Los portales del infierno se abrieron. El Gato Demoníaco espera al final.',
levels:[
{ name:'Grietas de Lava',     enemyBaseHP:20000, spawnInterval:50, mult:5.0, pool:['imp','hound'],           boss:null,  startMoney:2500, coins:40000 },
{ name:'Ciudadela de Ceniza', enemyBaseHP:28000, spawnInterval:45, mult:6.0, pool:['imp','hound','succubus'],boss:null,  startMoney:3000, coins:60000 },
{ name:'Trono de Sangre',     enemyBaseHP:40000, spawnInterval:40, mult:7.0, pool:['imp','hound','succubus'],boss:'lord',startMoney:4000, coins:100000, unlocks:[10] },
]
},
xmas: {
id:'xmas', name:'🎄 Pesadilla Navideña', theme:'xmas',
description:'El Krampus ha corrompido la Navidad. Defiende el Polo y desbloquea a Gatoclaus lanzabolas de nieve.',
levels:[
{ name:'Taller Corrupto',   enemyBaseHP:22000, spawnInterval:50, mult:5.2, pool:['elf','snowman'],           boss:null,      startMoney:2800, coins:45000 },
{ name:'Bosque Nevado',     enemyBaseHP:30000, spawnInterval:45, mult:6.2, pool:['elf','snowman','gremlin'], boss:null,      startMoney:3300, coins:65000 },
{ name:'Polar del Krampus', enemyBaseHP:42000, spawnInterval:40, mult:7.2, pool:['elf','snowman','gremlin'], boss:'krampus', startMoney:4200, coins:110000, unlocks:[12] },
]
},
};

// ------------------------------------------------------------
// HISTORIA
// ------------------------------------------------------------
function poolForLevel(i) {
if (i < 3)  return [0, 1];
if (i < 6)  return [0, 1, 2, 3];
if (i < 9)  return [0, 1, 2, 3, 4, 5, 7];
if (i < 12) return [0, 1, 2, 3, 4, 5, 7, 8, 10];
if (i <= 30)return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
if (i === 31) return [0, 1, 2, 3, 4, 12, 13, 14];
if (i === 32) return [0, 1, 2, 3, 4, 8, 12, 13, 14];
if (i === 33) return [0, 1, 3, 4, 8, 12, 13, 14, 15];
if (i === 34) return [0, 2, 4, 6, 8, 12, 13, 14, 15];
if (i === 35) return [1, 3, 5, 8, 10, 12, 13, 14, 15];
if (i <= 40)  return [0, 1, 2, 3, 4, 5, 8, 10, 12, 13, 14, 15, 16];
return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16];
}
function bossForLevel(i) {
if (i === 5  || i === 20) return 0;
if (i === 10 || i === 25) return 1;
if (i === 15 || i === 30) return 2;
if (i === 35) return 3;
if (i === 40) return 4;
if (i === 45) return 5;
return -1;
}
const STORY_LEVELS = [];
for (let i = 1; i <= STORY_MAX_LEVEL; i++) {
const part2 = i > 15 && i <= 30;
const part3 = i > 30;
STORY_LEVELS.push({
level: i, name: 'Nivel ' + i, part: part3 ? 3 : (part2 ? 2 : 1),
enemyBaseHP: 1200 + i * 600 + (part2 ? (i - 15) * 1500 : 0) + (part3 ? (i - 30) * 3200 : 0),
spawnInterval: Math.max(22, 140 - i * 6 - (part2 ? (Math.min(i,30) - 15) * 2 : 0) - (part3 ? (i - 30) * 2 : 0)),
mult: 1 + (i - 1) * 0.25 + (part2 ? ((i > 30 ? 15 : i - 15)) * 0.35 : 0) + (part3 ? (i - 30) * 0.5 : 0),
pool: poolForLevel(i),
boss: bossForLevel(i),
startMoney: 300 + i * 40 + (part2 ? (Math.min(i,30) - 15) * 100 : 0) + (part3 ? (i - 30) * 150 : 0),
coins: 1500 * i + (part2 ? (Math.min(i,30) - 15) * 1000 : 0) + (part3 ? (i - 30) * 2000 : 0),
});
}

// ============================================================
// v59: ETAPAS DE LEYENDA
// ============================================================
const LEGEND_ENEMY_TYPES = {
gargoyle:   { name:'Gárgola de Piedra',   hp:400,  dmg:50,  speed:1.4, range:35,  cooldown:70,  color:'#8a8a9a', color2:'#55556a', reward:350,  type:'flying', flyY:115, legendStyle:'gargoyle' },
templar:    { name:'Templario Olvidado',  hp:900,  dmg:70,  speed:0.7, range:40,  cooldown:95,  color:'#b8a060', color2:'#6a5a2a', reward:500,  type:'melee',  legendStyle:'templar' },
magmaSlime: { name:'Limo de Magma',       hp:1200, dmg:60,  speed:0.5, range:38,  cooldown:100, color:'#ff5500', color2:'#882200', reward:550,  type:'melee',  legendStyle:'magmaslime' },
emberBat:   { name:'Murciélago de Ascuas',hp:350,  dmg:45,  speed:2.0, range:30,  cooldown:55,  color:'#ff8844', color2:'#993311', reward:450,  type:'flying', flyY:105, legendStyle:'emberbat' },
harpy:      { name:'Arpía del Viento',    hp:500,  dmg:55,  speed:1.6, range:170, cooldown:85,  color:'#aaddff', color2:'#4488aa', reward:600,  type:'ranged', projSpeed:6, legendStyle:'harpy' },
galeWolf:   { name:'Lobo de la Tormenta', hp:650,  dmg:80,  speed:2.2, range:35,  cooldown:60,  color:'#ddeeff', color2:'#7799bb', reward:650,  type:'melee',  legendStyle:'galewolf' },
angler:     { name:'Pez Abisal',          hp:700,  dmg:65,  speed:0.9, range:200, cooldown:90,  color:'#334466', color2:'#112233', reward:700,  type:'ranged', projSpeed:5, legendStyle:'angler' },
crabTitan:  { name:'Cangrejo Titán',      hp:2000, dmg:90,  speed:0.4, range:45,  cooldown:110, color:'#cc4444', color2:'#772222', reward:800,  type:'melee',  scale:1.5, legendStyle:'crabtitan' },
gearSpider: { name:'Araña de Engranajes', hp:600,  dmg:55,  speed:1.9, range:30,  cooldown:50,  color:'#8899aa', color2:'#445566', reward:750,  type:'melee',  legendStyle:'gearspider' },
steamGolem: { name:'Gólem de Vapor',      hp:2400, dmg:100, speed:0.35,range:50,  cooldown:120, color:'#aabb99', color2:'#556644', reward:900,  type:'melee',  scale:1.6, legendStyle:'steamgolem' },
voidEye:    { name:'Ojo del Vacío',       hp:800,  dmg:85,  speed:0.8, range:220, cooldown:95,  color:'#aa66ff', color2:'#440088', reward:1000, type:'ranged', projSpeed:6, legendStyle:'voideye' },
starWraith: { name:'Espectro Estelar',    hp:550,  dmg:70,  speed:2.4, range:35,  cooldown:55,  color:'#ccddff', color2:'#6677cc', reward:950,  type:'flying', flyY:110, legendStyle:'starwraith' },
};
const LEGEND_BOSS_TYPES = {
ruinKing:   { name:'COLOSO DE LA RUINA',  hp:60000,  dmg:300, speed:0.4,  range:70, cooldown:140, color:'#c8b070', color2:'#6a5a2a', reward:25000,  type:'boss', scale:3.0, bossStyle:'ruinking' },
magmaWyrm:  { name:'SERPIENTE DE MAGMA',  hp:80000,  dmg:340, speed:0.5,  range:75, cooldown:135, color:'#ff6600', color2:'#882200', reward:35000,  type:'boss', scale:3.1, bossStyle:'magmawyrm' },
skyTitan:   { name:'TITÁN DE LOS CIELOS', hp:100000, dmg:380, speed:0.45, range:80, cooldown:140, color:'#bfe8ff', color2:'#5588bb', reward:45000,  type:'boss', scale:3.2, bossStyle:'skytitan' },
abyssLord:  { name:'LEVIATÁN ABISAL',     hp:130000, dmg:420, speed:0.4,  range:85, cooldown:145, color:'#224488', color2:'#0a1a44', reward:60000,  type:'boss', scale:3.3, bossStyle:'abysslord' },
machineGod: { name:'DEUS EX MACHINA',     hp:170000, dmg:470, speed:0.45, range:80, cooldown:135, color:'#ccddee', color2:'#556677', reward:80000,  type:'boss', scale:3.2, bossStyle:'machinegod' },
voidMonarch:{ name:'MONARCA DEL VACÍO',   hp:250000, dmg:550, speed:0.5,  range:90, cooldown:130, color:'#bb77ff', color2:'#330066', reward:150000, type:'boss', scale:3.5, bossStyle:'voidmonarch' },
};
function legendBossObj(key) {
  if (LEGEND_BOSS_TYPES[key]) return LEGEND_BOSS_TYPES[key];
  if (EVENT_BOSS_TYPES[key]) return EVENT_BOSS_TYPES[key];
  const n = parseInt(key, 10);
  if (!isNaN(n) && BOSS_TYPES[n]) return BOSS_TYPES[n];
  return null;
}
const LEGEND_ZONE_TITLES = [
  '🏛️ ZONA 1 — Ruinas Ancestrales',
  '🌋 ZONA 2 — Caldera del Magma',
  '🌪️ ZONA 3 — Islas Flotantes',
  '🌊 ZONA 4 — Fosa Abisal',
  '⚙️ ZONA 5 — Fábrica de Engranajes',
  '🌌 ZONA 6 — Umbral del Vacío (reutiliza jefes antiguos)',
];
const LEGEND_ZONE_THEMES = ['ruins', 'volcano', 'sky', 'abyss', 'clockwork', 'void'];
const LEGEND_ZONE_POOLS = [
  ['gargoyle', 'templar', 11, 15],
  ['magmaSlime', 'emberBat', 'imp', 'hound'],
  ['harpy', 'galeWolf', 'drone', 9],
  ['angler', 'crabTitan', 5, 9],
  ['gearSpider', 'steamGolem', 'drone', 10],
  ['voidEye', 'starWraith', 'templar', 'harpy', 'angler', 'gearSpider'],
];
const LEGEND_ZONE_BOSSES = ['ruinKing', 'magmaWyrm', 'skyTitan', 'abyssLord', 'machineGod', null];
const LEGEND_VOID_BOSSES = ['lord', 'krampus', 'emperor', '5', 'voidMonarch'];
const LEGEND_STAGE_NAMES = [
  ['Selva de Templos', 'Cripta Musgosa', 'Puente Colgante', 'Altar Roto', 'Trono del Coloso'],
  ['Túneles de Lava', 'Campo de Géiseres', 'Forja Apagada', 'Río de Fuego', 'Corazón del Magma'],
  ['Pradera de Nubes', 'Cascada Invertida', 'Jardín del Viento', 'Torres de Hielo', 'Ojo del Huracán'],
  ['Arrecife Hundido', 'Cueva de Perlas', 'Fosa de Tinta', 'Trinchera Helada', 'Tumba del Leviatán'],
  ['Almacén de Piezas', 'Línea de Montaje', 'Caldera de Vapor', 'Torre del Reloj', 'Núcleo de Engranajes'],
  ['Grieta Carmesí', 'Páramo Helado', 'Flota Perdida', 'Desierto Lunar', 'Trono del Monarca'],
];
const LEGEND_STAGES = [];
for (let z = 0; z < 6; z++) {
  for (let s = 0; s < 5; s++) {
    const i = z * 5 + s + 1;
    const isBossStage = (s === 4);
    const boss = isBossStage ? (z === 5 ? LEGEND_VOID_BOSSES[s] : LEGEND_ZONE_BOSSES[z]) : null;
    LEGEND_STAGES.push({
      level: i, zone: z, theme: LEGEND_ZONE_THEMES[z],
      name: `Etapa ${i}: ${LEGEND_STAGE_NAMES[z][s]}`,
      enemyBaseHP: 40000 + i * 5000 + z * 30000,
      spawnInterval: Math.max(15, 55 - z * 5 - s * 3),
      mult: 12 + i * 0.8 + z * 3,
      pool: LEGEND_ZONE_POOLS[z], boss: boss,
      coins: 8000 + i * 1200 + z * 4000,
    });
  }
}

// ============================================================
// v77: TESOROS + GAMATOTO
// ============================================================
const TREASURES = [];
const TREASURE_DEFS = [
  { id:'t01', name:'Hoja de Trébol',    zone:1, level:1,  set:'set_prairie' },
  { id:'t02', name:'Pluma de Gorrión',  zone:1, level:2,  set:'set_prairie' },
  { id:'t03', name:'Roca de Río',       zone:1, level:3,  set:'set_prairie' },
  { id:'t04', name:'Flor Silvestre',    zone:1, level:4,  set:'set_prairie' },
  { id:'t05', name:'Espina de Zarza',   zone:1, level:5,  set:'set_prairie' },
  { id:'t06', name:'Gota de Rocío',     zone:1, level:6,  set:'set_prairie' },
  { id:'t07', name:'Raíz Antigua',      zone:1, level:7,  set:'set_prairie' },
  { id:'t08', name:'Cristal de Cuarzo', zone:1, level:8,  set:'set_hills' },
  { id:'t09', name:'Pico de Cuervo',    zone:1, level:9,  set:'set_hills' },
  { id:'t10', name:'Corteza de Roble',  zone:1, level:10, set:'set_hills' },
  { id:'t11', name:'Semilla Dorada',    zone:1, level:11, set:'set_hills' },
  { id:'t12', name:'Espora Mágica',     zone:1, level:12, set:'set_hills' },
  { id:'t13', name:'Pluma de Búho',     zone:1, level:13, set:'set_hills' },
  { id:'t14', name:'Hueso Pulido',      zone:1, level:14, set:'set_hills' },
  { id:'t15', name:'Corona de Dragón',  zone:1, level:15, set:null },
  { id:'t16', name:'Cetro de Marfil',   zone:2, level:16, set:'set_crown' },
  { id:'t17', name:'Pergamino Real',    zone:2, level:17, set:'set_crown' },
  { id:'t18', name:'Gema Azul',         zone:2, level:18, set:'set_crown' },
  { id:'t19', name:'Anillo de Plata',   zone:2, level:19, set:'set_crown' },
  { id:'t20', name:'Moneda Antigua',    zone:2, level:20, set:'set_crown' },
  { id:'t21', name:'Sello de Cera',     zone:2, level:21, set:'set_crown' },
  { id:'t22', name:'Capa Púrpura',      zone:2, level:22, set:'set_crown' },
  { id:'t23', name:'Varita de Hechicero',zone:2, level:23, set:'set_enchanted' },
  { id:'t24', name:'Hoja Lunar',        zone:2, level:24, set:'set_enchanted' },
  { id:'t25', name:'Raíz de Mandrágora',zone:2, level:25, set:'set_enchanted' },
  { id:'t26', name:'Cristal Psíquico',  zone:2, level:26, set:'set_enchanted' },
  { id:'t27', name:'Pluma de Fénix',    zone:2, level:27, set:'set_enchanted' },
  { id:'t28', name:'Escama Dorada',     zone:2, level:28, set:'set_enchanted' },
  { id:'t29', name:'Ojo de Halcón',     zone:2, level:29, set:'set_enchanted' },
  { id:'t30', name:'Cuerno Demoníaco',  zone:2, level:30, set:null },
  { id:'t31', name:'Cactus Sagrado',    zone:3, level:31, set:'set_oasis' },
  { id:'t32', name:'Arena de Oro',      zone:3, level:32, set:'set_oasis' },
  { id:'t33', name:'Escarabajo Dorado', zone:3, level:33, set:'set_oasis' },
  { id:'t34', name:'Pluma de Íbice',    zone:3, level:34, set:'set_oasis' },
  { id:'t35', name:'Perla del Desierto',zone:3, level:35, set:'set_oasis' },
  { id:'t36', name:'Agua Cristalina',   zone:3, level:36, set:'set_oasis' },
  { id:'t37', name:'Flor de Loto',      zone:3, level:37, set:'set_oasis' },
  { id:'t38', name:'Ankh de Oro',       zone:3, level:38, set:'set_pharaoh' },
  { id:'t39', name:'Ushabti de Piedra', zone:3, level:39, set:'set_pharaoh' },
  { id:'t40', name:'Papiro Sagrado',    zone:3, level:40, set:'set_pharaoh' },
  { id:'t41', name:'Esfinge Miniatura', zone:3, level:41, set:'set_pharaoh' },
  { id:'t42', name:'Joya Escarlata',    zone:3, level:42, set:'set_pharaoh' },
  { id:'t43', name:'Máscara Funeraria', zone:3, level:43, set:'set_pharaoh' },
  { id:'t44', name:'Cáliz de Lapislázuli', zone:3, level:44, set:'set_pharaoh' },
  { id:'t45', name:'Lámpara Mágica',    zone:3, level:45, set:null },
];
const TREASURE_SETS = [
  { id:'set_prairie',   name:'🌿 Pradera Verde',       zone:1,
    treasureIds:['t01','t02','t03','t04','t05','t06','t07'],
    desc:'+HP a tropas normales (Básico-Gigante)',
    effect:{ kind:'unitHpMult', units:[0,1,2,3,4,5,6], base:0.10 } },
  { id:'set_hills',     name:'⛰️ Colinas del Alba',    zone:1,
    treasureIds:['t08','t09','t10','t11','t12','t13','t14'],
    desc:'+DMG a tropas normales',
    effect:{ kind:'unitDmgMult', units:[0,1,2,3,4,5,6], base:0.15 } },
  { id:'set_crown',     name:'👑 Corona Real',         zone:2,
    treasureIds:['t16','t17','t18','t19','t20','t21','t22'],
    desc:'+HP máximo a tu base',
    effect:{ kind:'baseHpFlat', base:300 } },
  { id:'set_enchanted', name:'✨ Bosque Encantado',    zone:2,
    treasureIds:['t23','t24','t25','t26','t27','t28','t29'],
    desc:'+DMG a Mago y Arquero',
    effect:{ kind:'unitDmgMult', units:[3,4], base:0.25 } },
  { id:'set_oasis',     name:'🌵 Oasis Perdido',       zone:3,
    treasureIds:['t31','t32','t33','t34','t35','t36','t37'],
    desc:'+Velocidad a todas las tropas',
    effect:{ kind:'unitSpeedMult', units:'all', base:0.20 } },
  { id:'set_pharaoh',   name:'🏺 Tumba del Faraón',    zone:3,
    treasureIds:['t38','t39','t40','t41','t42','t43','t44'],
    desc:'+DMG a TODAS las tropas',
    effect:{ kind:'allDmgMult', base:0.30 } },
];
const TREASURE_BOSS_EFFECTS = {
  't15': { desc:'🐉 Corona de Dragón: +1 nivel de cañón gratis', effect:{ kind:'cannonDmgFlat', base:1 } },
  't30': { desc:'😈 Cuerno Demoníaco: +20% daño en área a todas las tropas AOE', effect:{ kind:'unitAoeMult', units:[4,9,12], base:0.20 } },
  't45': { desc:'🪔 Lámpara Mágica: +2 niveles de cañón gratis', effect:{ kind:'cannonDmgFlat', base:2 } },
};
const TREASURE_QUALITY_NAMES = ['🥉 Bronce', '🥈 Plata', '🥇 Oro'];
const TREASURE_QUALITY_COLORS = ['#cd7f32', '#c0c0c0', '#ffd700'];
const TREASURE_QUALITY_MULT = [1.0, 1.5, 2.0];
// v79e: 40% de que CAIGA un tesoro al ganar nivel; si cae, calidad condicional.
const TREASURE_DROP_CHANCE = 0.40;
const TREASURE_QUALITY_CHANCE = [0.60, 0.25, 0.15]; // bronce 60%, plata 25%, oro 15%

const GAMATOTO_DURATIONS = [
  { hours:1,  label:'1 hora',  xpMin:200,  xpMax:600,   rewards:[{t:'normal',ch:0.30},{t:'none',ch:0.70}] },
  { hours:3,  label:'3 horas', xpMin:800,  xpMax:2000,  rewards:[{t:'normal',ch:0.55},{t:'rare',ch:0.25},{t:'none',ch:0.20}] },
  { hours:8,  label:'8 horas', xpMin:2500, xpMax:6000,  rewards:[{t:'rare',ch:0.60},{t:'event',ch:0.25},{t:'normal',ch:0.15}] },
  { hours:24, label:'24 horas',xpMin:8000, xpMax:20000, rewards:[{t:'event',ch:0.70},{t:'rare',ch:0.25},{t:'rare2',ch:0.05}] },
];

// ============================================================
// v78/v78c: CONSUMIBLES + CARTERA + INCOME EN PARTIDA
// ============================================================
const CONSUMABLE_DEFS = {
  speed:      { id:'speed',      name:'Acelerador',     emoji:'⚡', desc:'Desbloquea la velocidad x3 en batalla (la x2 es gratis).' },
  radar:      { id:'radar',      name:'Radar de Tesoros',emoji:'📡', desc:'Garantiza un tesoro 🥇 ORO al ganar un nivel de Historia.' },
  rich:       { id:'rich',       name:'Gato Ricachón',  emoji:'💰', desc:'Llena tu dinero al máximo de la cartera en esta partida.' },
  cpu:        { id:'cpu',        name:'Gatomático',     emoji:'🤖', desc:'1 click: auto-invoca tropas. 2 click: auto-gana el nivel (solo si ya lo superaste).' },
  sabelotodo: { id:'sabelotodo', name:'Sabelotodo',     emoji:'📚', desc:'+50% XP al completar el nivel en que lo usas.' },
  sniper:     { id:'sniper',     name:'Gatotirador',    emoji:'🎯', desc:'Torreta en tu base: dispara 2% de la vida máx del enemigo y lo empuja.' },
};
const CONSUMABLE_IDS = ['speed','radar','rich','cpu','sabelotodo','sniper'];

const WALLET_BASE = 4500;
const WALLET_UPGRADE_PER_LVL = 200;
const WALLET_UPGRADE_MAX = 10;
const WALLET_GOLD_TREASURE_BONUS = 50;
const WALLET_BATTLE_START = 2500;
const WALLET_BATTLE_MAX_UPGRADES = 6;
const WALLET_UPGRADE_BASE_PRICE  = 500;
const WALLET_UPGRADE_PRICE_STEP  = 500;
function getWalletUpgradeCostAt(l) { return 6000 + 4000 * l; }
// v80: nuevas mejoras permanentes (Defensa / Investigación / Recompensa)
const BASE_DEF_MAX = 10;
const BASE_DEF_PER_LVL = 1000;      // +1000 HP máx de base por nivel
const BASE_DEF_BASE_COST = 2000;
const BASE_DEF_COST_STEP = 2000;
const RESEARCH_MAX = 10;
const RESEARCH_PER_LVL = 0.05;      // -5% cooldown de spawn por nivel
const RESEARCH_BASE_COST = 2000;
const RESEARCH_COST_STEP = 2000;
const REWARD_MAX = 10;
const REWARD_PER_LVL = 0.05;        // +5% drop de enemigos por nivel
const REWARD_BASE_COST = 2000;
const REWARD_COST_STEP = 2000;

// v78c: income en partida (de pago, máx 6, +5/s c/u)
const INCOME_BATTLE_MAX_UPGRADES = 6;
const INCOME_BATTLE_STEP         = 5;
const INCOME_BATTLE_BASE_PRICE   = 600;

const SNIPER_INTERVAL_FRAMES = 180;
const SNIPER_DMG_PERCENT = 0.02;
const SNIPER_KNOCKBACK = 45;