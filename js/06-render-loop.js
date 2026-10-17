// ============================================================
// 06-render-loop.js — Bucle principal (60 FPS fijos)
// v53: separado de la escena. update() viene de 05-combat.js y
// draw() de 06-render-scene.js.
// ============================================================
function loop() {
  const now = performance.now();
  let delta = now - lastTime;
  lastTime = now;
  if (delta > 250) delta = 250; // si la pestaña estuvo inactiva, no simular de golpe
  frameAccumulator += delta;
  let ticks = 0;
  while (frameAccumulator >= FRAME_MS && ticks < 4) {
    frameAccumulator -= FRAME_MS;
    ticks++;
    fpsTickCount++;
  }
  // evita acumular "deuda" de frames tras saltos largos
  if (frameAccumulator > FRAME_MS * 4) frameAccumulator = 0;
  if (ticks > 0 && playing) {
    try {
      update();
      draw();
    } catch (err) {
      playing = false;
      console.error(err);
      setStatus('⚠️ Error interno: ' + err.message + ' · Vuelve al menú', '#ff6666');
    }
  } else if (ticks > 0) {
    draw(); // el mundo se congela pero sigue viéndose
  }
  // FPS reales medidos sobre ventanas de ~0.5s (no el delta de un solo rAF)
  fpsSampleTimer += delta;
  if (fpsSampleTimer >= 500) {
    fps = Math.round(fpsTickCount * 1000 / fpsSampleTimer);
    fpsSampleTimer = 0;
    fpsTickCount = 0;
    document.getElementById('fps').textContent = `FPS: ${fps}`;
  }
  requestAnimationFrame(loop);
}