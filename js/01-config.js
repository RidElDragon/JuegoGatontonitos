// ============================================================
// 01-config.js — Constantes y datos ESTÁTICOS del juego
// Si añades unidades/enemigos/jefes/eventos/niveles, es AQUÍ.
// ============================================================
const COIN = '🐾';
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
const CANNON_BASE_COOLDOWN = 1500; // 25s
const CANNON_MIN_COOLDOWN = 1200;  // 20s
const CANNON_BOSS_LIMIT = 0.5;     // el cañón nunca baja a un jefe del 50%
const STORY_MAX_LEVEL = 45;
// v57: bonus permanente de 🐾 por nivel superado
const COIN_BONUS_MAX = 10;
const COIN_BONUS_PER_LVL = 0.10;
const COIN_BONUS_BASE_COST = 4000;
const COIN_BONUS_COST_STEP = 4000;
// v58: constantes de combate
const LEVEL_START_MONEY = 450;  // dinero inicial de TODO nivel (historia/eventos/leyenda)
const MAGE_UNIT_IDX = 4;        // índice del Mago en CAT_BASE
const MAGE_EVO_AOE = 130;       // radio de área del Mago evolucionado (base: 90)
const HEALER_HOME_X = 60;       // zona de la base aliada (retroceso del Sanador sin tropas)
const UNIT_EMOJI = ['🐱','💪','⚡','','🔮','','👑','','🤖','','😈','','🎅'];
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
// Cómo se desbloquea cada unidad (historia, evento o leyenda)
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
// Costes en 🐾 de las mejoras permanentes de unidades
const UNIT_COIN_BASE = [3000, 4500, 6000, 6000, 9000, 7500, 13500, 10500, 9000, 30000, 18000, 12000, 25000];
const UNIT_COIN_STEP = [2000, 3000, 4000, 4000, 6000, 5000, 9000, 7000, 6000, 20000, 12000, 8000, 16000];
// ------------------------------------------------------------
// ENEMIGOS NORMALES (infinito + pools de historia)
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
// JEFES DEL MODO INFINITO / HISTORIA
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
id:'infernal', name:'🔥 Incursión Infernal', theme:'infernal',
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
// HISTORIA: pools de enemigos y jefes por nivel
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
// Generación de los 45 niveles de historia
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
// v59: ETAPAS DE LEYENDA — endgame permanente (30 etapas, 6 zonas)
// · 12 enemigos nuevos + 6 jefes nuevos (arte en 06b, Parte 2).
// · Pools con enemigos REUTILIZADOS (números = ENEMY_TYPES,
//   strings = EVENT_ENEMY_TYPES o LEGEND_ENEMY_TYPES).
// · Zona 6 reutiliza 4 jefes antiguos y cierra con el jefe final.
// ============================================================
const LEGEND_ENEMY_TYPES = {
// --- Ruinas Ancestrales ---
gargoyle:   { name:'Gárgola de Piedra',   hp:400,  dmg:50,  speed:1.4, range:35,  cooldown:70,  color:'#8a8a9a', color2:'#55556a', reward:350,  type:'flying', flyY:115, legendStyle:'gargoyle' },
templar:    { name:'Templario Olvidado',  hp:900,  dmg:70,  speed:0.7, range:40,  cooldown:95,  color:'#b8a060', color2:'#6a5a2a', reward:500,  type:'melee',  legendStyle:'templar' },
// --- Caldera del Magma ---
magmaSlime: { name:'Limo de Magma',       hp:1200, dmg:60,  speed:0.5, range:38,  cooldown:100, color:'#ff5500', color2:'#882200', reward:550,  type:'melee',  legendStyle:'magmaslime' },
emberBat:   { name:'Murciélago de Ascuas',hp:350,  dmg:45,  speed:2.0, range:30,  cooldown:55,  color:'#ff8844', color2:'#993311', reward:450,  type:'flying', flyY:105, legendStyle:'emberbat' },
// --- Islas Flotantes ---
harpy:      { name:'Arpía del Viento',    hp:500,  dmg:55,  speed:1.6, range:170, cooldown:85,  color:'#aaddff', color2:'#4488aa', reward:600,  type:'ranged', projSpeed:6, legendStyle:'harpy' },
galeWolf:   { name:'Lobo de la Tormenta', hp:650,  dmg:80,  speed:2.2, range:35,  cooldown:60,  color:'#ddeeff', color2:'#7799bb', reward:650,  type:'melee',  legendStyle:'galewolf' },
// --- Fosa Abisal ---
angler:     { name:'Pez Abisal',          hp:700,  dmg:65,  speed:0.9, range:200, cooldown:90,  color:'#334466', color2:'#112233', reward:700,  type:'ranged', projSpeed:5, legendStyle:'angler' },
crabTitan:  { name:'Cangrejo Titán',      hp:2000, dmg:90,  speed:0.4, range:45,  cooldown:110, color:'#cc4444', color2:'#772222', reward:800,  type:'melee',  scale:1.5, legendStyle:'crabtitan' },
// --- Fábrica de Engranajes ---
gearSpider: { name:'Araña de Engranajes', hp:600,  dmg:55,  speed:1.9, range:30,  cooldown:50,  color:'#8899aa', color2:'#445566', reward:750,  type:'melee',  legendStyle:'gearspider' },
steamGolem: { name:'Gólem de Vapor',      hp:2400, dmg:100, speed:0.35,range:50,  cooldown:120, color:'#aabb99', color2:'#556644', reward:900,  type:'melee',  scale:1.6, legendStyle:'steamgolem' },
// --- Umbral del Vacío ---
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
// Resolución de jefes de leyenda (propios → eventos → infinito por índice)
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
// Zona 6: 4 jefes REUTILIZADOS + jefe final nuevo
const LEGEND_VOID_BOSSES = ['lord', 'krampus', 'emperor', '5', 'voidMonarch'];
const LEGEND_STAGE_NAMES = [
  ['Selva de Templos', 'Cripta Musgosa', 'Puente Colgante', 'Altar Roto', 'Trono del Coloso'],
  ['Túneles de Lava', 'Campo de Géiseres', 'Forja Apagada', 'Río de Fuego', 'Corazón del Magma'],
  ['Pradera de Nubes', 'Cascada Invertida', 'Jardín del Viento', 'Torres de Hielo', 'Ojo del Huracán'],
  ['Arrecife Hundido', 'Cueva de Perlas', 'Fosa de Tinta', 'Trinchera Helada', 'Tumba del Leviatán'],
  ['Almacén de Piezas', 'Línea de Montaje', 'Caldera de Vapor', 'Torre del Reloj', 'Núcleo de Engranajes'],
  ['Grieta Carmesí', 'Páramo Helado', 'Flota Perdida', 'Desierto Lunar', 'Trono del Monarca'],
];
// Generación de las 30 etapas
const LEGEND_STAGES = [];
for (let z = 0; z < 6; z++) {
  for (let s = 0; s < 5; s++) {
    const i = z * 5 + s + 1;
    const isBossStage = (s === 4);
    const boss = isBossStage ? (z === 5 ? LEGEND_VOID_BOSSES[s] : LEGEND_ZONE_BOSSES[z]) : null;
    LEGEND_STAGES.push({
      level: i,
      zone: z,
      theme: LEGEND_ZONE_THEMES[z],
      name: `Etapa ${i}: ${LEGEND_STAGE_NAMES[z][s]}`,
      enemyBaseHP: 40000 + i * 5000 + z * 30000,
      spawnInterval: Math.max(15, 55 - z * 5 - s * 3),
      mult: 12 + i * 0.8 + z * 3,
      pool: LEGEND_ZONE_POOLS[z],
      boss: boss,
      coins: 8000 + i * 1200 + z * 4000,
    });
  }
}