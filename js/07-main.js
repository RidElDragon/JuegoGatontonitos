// ============================================================
// 07-main.js — Arranque: canvas, listeners e inicialización
// v46: ctx intercambiable (setRenderContext) para que el
//      bestiario pueda dibujar retratos en un canvas aparte.
// v59: carga también el progreso de Etapas de Leyenda.
// ============================================================
const canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
// Permite redirigir TODO el dibujo (drawCat/drawEnemy/...) a otro contexto.
function setRenderContext(c) { ctx = c; }
function resetRenderContext() { ctx = canvas.getContext('2d'); }
// Click en el canvas: retirar tropa propia
canvas.addEventListener('click', (ev) => {
  if (gameOver || !playing) return;
  const rect = canvas.getBoundingClientRect();
  const x = (ev.clientX - rect.left) * (canvas.width / rect.width);
  const y = (ev.clientY - rect.top) * (canvas.height / rect.height);
  for (let i = cats.length - 1; i >= 0; i--) {
    const c = cats[i];
    const radius = 22 * (c.scale || 1);
    const dx = x - c.x, dy = y - c.y;
    if (dx*dx + dy*dy <= radius*radius) { removeCat(i); break; }
  }
});
// Inicialización (orden importante: meta → progreso → escuadrón)
window.onload = function() {
  loadMeta();
  storyProgress = Math.min(loadStoryProgress(), STORY_MAX_LEVEL);
  eventProgress = loadEventProgress();
  legendProgress = Math.min(loadLegendProgress(), LEGEND_STAGES.length);
  loadout = loadLoadout();
  tempLoadout = [...loadout];
  baseMeta = snapshotMeta();
  showMenu();
  loop();
};