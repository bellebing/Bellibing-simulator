import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { SeededRng } from '../src/seededRng.ts';
import { SUBSTAT_VALUE_TABLE, checkpointIncrement } from '../src/echoCoreRules.ts';
import { createRank5EchoAtLevel0 } from '../src/echoMainStats.ts';
import { VerifiedWuwaEchoRuntime } from '../src/echoCoreRuntime.ts';
import { startEchoSimulator, selectSimulatorSlot, startSimulatorCandidate, simulatedEchoSlots, resetEchoSimulator } from '../src/echoSimulatorSession.ts';
import { rollSimulatorCandidate, placeSimulatorCandidate, clearSimulatorCandidate } from '../src/echoSimulatorRolling.ts';

const template = { echoId: 'species', selectedSonataSetId: 'assigned-set', cost: 4 as const, primaryMainStat: 'CRIT Rate' as const };
const prepare = (session: ReturnType<typeof startEchoSimulator>) => startSimulatorCandidate(session, { echoId: template.echoId, selectedSonataSetId: template.selectedSonataSetId });

test('injected RNG follows canonical runtime exactly, unique tiers, five ordered checkpoints and gross costs', () => {
  for (let seed = 0; seed < 100; seed++) {
    const session = prepare(startEchoSimulator('augusta', {}, 'session'));
    const result = rollSimulatorCandidate(session, template, new SeededRng(seed));
    const candidate = result.slots[0].candidate!;
    assert.equal(session.slots[0].candidate!.card.level, undefined);
    assert.deepEqual(candidate.history.slice(1).map(card => card.level), [0, 5, 10, 15, 20, 25]);
    assert.equal(candidate.card.substats!.length, 5);
    assert.equal(new Set(candidate.card.substats!.map(stat => stat.name)).size, 5);
    candidate.card.substats!.forEach(stat => assert.ok(SUBSTAT_VALUE_TABLE[stat.name].includes(stat.value)));
    const runtime = new VerifiedWuwaEchoRuntime(), rng = new SeededRng(seed);
    let echo = runtime.acquireFresh(createRank5EchoAtLevel0({ id: candidate.id, cost: 4, primaryMainStat: 'CRIT Rate' }), rng).echo;
    for (const card of candidate.history.slice(2)) {
      echo = runtime.rollNext(echo, rng)!.echo;
      assert.deepEqual(card.substats, echo.substats);
      assert.deepEqual(card.mainStat, echo.mainStat);
      assert.deepEqual(card.secondaryMainStat, echo.secondaryMainStat);
    }
    assert.deepEqual(result.rolling, { attempts: 1, checkpoints: 5, tuners: 50, exp: ([5,10,15,20,25] as const).reduce((sum,to) => sum + checkpointIncrement((to-5) as any, to).exp, 0) });
    assert.throws(() => rollSimulatorCandidate(result, template, rng), /Place or clear/);
  }
});

test('all five slots, explicit replacement, preserved history and real-build isolation across repeated rolls/reset', () => {
  const real = { weaponId: 'real-weapon', echoSets: { activeSetId: 'real-set', sets: { 'real-set': { slots: Array(5).fill({ echoId: 'real-equipment' }) } } } };
  const bytes = JSON.stringify(real); let session = startEchoSimulator('augusta', real, 'session');
  for (const slot of [5, 2, 4, 1, 3]) {
    session = selectSimulatorSlot(session, slot);
    session = rollSimulatorCandidate(prepare(session), template, new SeededRng(slot));
    session = placeSimulatorCandidate(session);
    assert.equal(session.slots[slot - 1].accepted[0].disposition, 'placed');
    assert.equal(session.evaluator.status, 'PENDING');
  }
  assert.equal(simulatedEchoSlots(session).filter(Boolean).length, 5);
  const old = structuredClone(session);
  session = rollSimulatorCandidate(prepare(session), template, new SeededRng(123));
  assert.throws(() => placeSimulatorCandidate(session), /confirmation/);
  assert.deepEqual(session.simulatedBuild, old.simulatedBuild);
  session = placeSimulatorCandidate(session, true);
  assert.deepEqual(session.slots[2].accepted[0], old.slots[2].accepted[0]);
  assert.equal(session.slots[2].accepted.length, 2);
  session = rollSimulatorCandidate(prepare(session), template, new SeededRng(456));
  const gross = structuredClone(session.rolling);
  session = clearSimulatorCandidate(session);
  assert.equal(session.slots[2].unplaced[0].history.at(-1)!.level, 25);
  assert.deepEqual(session.rolling, gross);
  assert.equal(session.slots.every(slot => slot.trash.length === 0), true);
  assert.equal(JSON.stringify(real), bytes);
  const reset = resetEchoSimulator(session, 'new-session');
  assert.deepEqual(reset.rolling, { attempts: 0, checkpoints: 0, tuners: 0, exp: 0 });
  assert.equal(simulatedEchoSlots(reset).every(slot => slot === null), true);
});

test('invalid templates, partial/fabricated cards and throwing RNG fail atomically', () => {
  const session = prepare(startEchoSimulator('augusta', {}, 'session')), bytes = JSON.stringify(session);
  assert.throws(() => rollSimulatorCandidate(session, { ...template, primaryMainStat: 'Electro DMG' as any }, new SeededRng(1)), /valid/);
  assert.throws(() => rollSimulatorCandidate(session, { ...template, echoId: 'different' }, new SeededRng(1)), /eligible/);
  assert.throws(() => rollSimulatorCandidate(session, { ...template, cost: 2 as any }, new SeededRng(1)), /cost/);
  assert.throws(() => rollSimulatorCandidate(session, template, { next() { throw new Error('RNG failed'); } }), /RNG failed/);
  assert.equal(JSON.stringify(session), bytes);
  assert.throws(() => placeSimulatorCandidate(session), /complete/);
  const rolled = rollSimulatorCandidate(session, template, new SeededRng(1));
  rolled.slots[0].candidate!.card.substats![1] = rolled.slots[0].candidate!.card.substats![0];
  assert.throws(() => placeSimulatorCandidate(rolled), /Invalid/);
});

test('public rolling adapter remains source-preview identical, with no evaluator or inventory ingress', () => {
  const source = readFileSync('src/echoSimulatorRolling.ts', 'utf8');
  assert.doesNotMatch(source, /refundOnDiscard|localStorage|fetch\(|applySimulatorDisposition\(/);
  for (const name of ['echoSimulatorRolling', 'echoCoreRuntime', 'echoMainStats']) {
    const compiled = ts.transpileModule(readFileSync('src/' + name + '.ts', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, verbatimModuleSyntax: true, rewriteRelativeImportExtensions: true } }).outputText;
    assert.equal(readFileSync('docs/assets/' + name + '.js', 'utf8'), compiled);
  }
});
