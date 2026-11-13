const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function game() {
  const context = { performance: { now: () => 0 }, localStorage: { getItem: () => null }, console,
    saveMeta() {}, saveStoryProgress() {}, saveEventProgress() {}, saveLegendProgress() {}, showResult() {} };
  context.window = context;
  vm.createContext(context);
  for (const file of ['01-config.js', '02-state.js', '05-combat.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8'), context);
  vm.runInContext('awardTreasureForLevel = () => null', context);
  return code => vm.runInContext(code, context);
}
for (const mode of ['story', 'event', 'legend']) {
  for (const first of [true, false]) {
    test(`${mode}: bonus XP en ${first ? 'primera victoria' : 'repetición'}`, () => {
      const run = game();
      run('coinBonusLevel = 3; coins = 0;');
      const progress = first ? 0 : 1;
      let base;
      if (mode === 'story') { run(`storyLevelIdx = 0; storyProgress = ${progress};`); base = run('STORY_LEVELS[0].coins'); }
      if (mode === 'event') { run(`currentEventId = Object.keys(EVENTS)[0]; eventLevelIdx = 0; eventProgress[currentEventId] = ${progress};`); base = run('EVENTS[currentEventId].levels[0].coins'); }
      if (mode === 'legend') { run(`legendLevelIdx = 0; legendProgress = ${progress};`); base = run('LEGEND_STAGES[0].coins'); }
      run(`${mode}Victory()`);
      assert.equal(run('coins'), Math.floor((first ? base : Math.floor(base / 2)) * 1.3));
    });
  }
}
test('sin bonus conserva la recompensa base y la mitad al repetir', () => {
  const run = game();
  assert.equal(run('coinRewardFor(1000, true)'), 1000);
  assert.equal(run('coinRewardFor(1000, false)'), 500);
});
