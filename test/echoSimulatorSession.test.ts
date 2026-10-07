import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { VerifiedWuwaEchoRuntime } from '../src/echoCoreRuntime.ts';
import { SeededRng } from '../src/seededRng.ts';
import { withRank5MainStatsAtLevel } from '../src/echoMainStats.ts';
import type { Echo } from '../src/echoCoreDomain.ts';
import type { SimulatorBuild, SimulatorEchoCard, EchoSimulatorSession } from '../src/echoSimulatorSession.ts';
import { startEchoSimulator, selectSimulatorSlot, startSimulatorCandidate, recordSimulatorCheckpoint,
  simulatedEchoSlots, simulatorCandidateContext, applySimulatorDisposition, inspectSimulatorTrash,
  resetEchoSimulator, closeEchoSimulator } from '../src/echoSimulatorSession.ts';
import { SIMULATOR_EVALUATOR_PENDING } from '../src/echoSimulatorBoundary.ts';

const runtime = new VerifiedWuwaEchoRuntime();
const fresh = (): Echo => withRank5MainStatsAtLevel({ id: 'fixture', cost: 1, rank: 5, level: 0, mainStat: { name: 'ATK%', value: 0 }, substats: [] }, 0);
const card = (echo: Echo): SimulatorEchoCard => ({ ...echo, echoId: 'fixture-species', selectedSonataSetId: 'fixture-set' });
function fixture() {
  const real: SimulatorBuild = { weaponId: 'owned', forte: { investment: [true] }, sequenceLevel: 2,
    echoSets: { activeSetId: 'custom', defaultSetId: 'set-1', sets: {
      'set-1': { slots: Array.from({ length: 5 }, (_, index) => ({ echoId: 'alternate-' + index })) },
      custom: { slots: Array.from({ length: 5 }, (_, index) => ({ echoId: 'real-' + index, substats: [{ name: 'CRIT Rate', value: .063 }] })) },
    } } };
  return { real, bytes: JSON.stringify(real), session: startEchoSimulator('augusta', real, 'test-session') };
}
function observed(session: EchoSimulatorSession): EchoSimulatorSession {
  const echo = fresh();
  const next = runtime.rollNext(echo, new SeededRng(42))!.echo;
  return recordSimulatorCheckpoint(startSimulatorCandidate(session, card(echo)), card(next));
}
function receipt(session: EchoSimulatorSession, disposition: 'accepted' | 'rejected') {
  return { ...simulatorCandidateContext(session)!, disposition, reason: 'Explicit external test fixture' };
}

test('start, transitions, reset and close never change real build bytes or alias any nested real data', () => {
  const { real, bytes, session } = fixture();
  assert.deepEqual(simulatedEchoSlots(session), [null, null, null, null, null]);
  assert.deepEqual(Object.keys(session.simulatedBuild.echoSets!.sets), ['custom']);
  assert.equal(session.simulatedBuild.weaponId, real.weaponId);
  assert.deepEqual(session.simulatedBuild.forte, real.forte);
  assert.equal(session.simulatedBuild.sequenceLevel, real.sequenceLevel);
  assert.doesNotMatch(JSON.stringify(session.simulatedBuild), /real-[0-4]|alternate-[0-4]/);
  session.simulatedBuild.forte = { investment: [false] };
  session.source.build.echoSets!.sets.custom.slots[0] = null;
  assert.equal(JSON.stringify(real), bytes);
  let s = observed(selectSimulatorSlot(session, 3));
  const before = structuredClone(s);
  s = applySimulatorDisposition(s, receipt(s, 'accepted'));
  assert.deepEqual(before.slots[2].candidate?.history.length, 2);
  assert.equal(simulatedEchoSlots(s)[2] && (simulatedEchoSlots(s)[2] as SimulatorEchoCard).level, 5);
  assert.deepEqual(simulatedEchoSlots(s).slice(0, 2), simulatedEchoSlots(before).slice(0, 2));
  assert.equal(JSON.stringify(real), bytes);
  const reset = resetEchoSimulator(s, 'new-session');
  assert.equal(reset.slots.every(slot => !slot.candidate && !slot.accepted.length && !slot.trash.length), true);
  assert.deepEqual(simulatedEchoSlots(reset), [null, null, null, null, null]);
  assert.deepEqual(reset.simulatedBuild.forte, real.forte);
  assert.equal(reset.simulatedBuild.weaponId, real.weaponId);
  assert.equal(closeEchoSimulator(reset), null);
  assert.equal(JSON.stringify(real), bytes);
});

test('five independently owned piles and accepted histories, freely selected in nonsequential order', () => {
  const { real, bytes, session } = fixture(); let s = session;
  for (const slot of [5, 2, 4, 1, 3]) {
    s = selectSimulatorSlot(s, slot);
    for (let attempt = 0; attempt < slot; attempt++) {
      s = observed(s); const oldBuild = structuredClone(s.simulatedBuild);
      s = applySimulatorDisposition(s, receipt(s, 'rejected'));
      assert.deepEqual(s.simulatedBuild, oldBuild);
    }
    s = observed(s); s = applySimulatorDisposition(s, receipt(s, 'accepted'));
    assert.equal(s.slots[slot - 1].accepted.length, 1);
    const acceptedSlots = s.slots.map((history, index) => history.accepted.length ? index : -1).filter(index => index >= 0);
    assert.equal(simulatedEchoSlots(s).filter(Boolean).length, acceptedSlots.length);
    simulatedEchoSlots(s).forEach((value, index) => { if (!acceptedSlots.includes(index)) assert.equal(value, null); });
    assert.equal(s.evaluator.status, 'PENDING');
    assert.doesNotMatch(JSON.stringify(s.slots), /real-[0-4]|alternate-[0-4]/);
  }
  assert.deepEqual(s.slots.map(slot => slot.trash.length), [1, 2, 3, 4, 5]);
  const id = s.slots[4].trash[0].id;
  s = inspectSimulatorTrash(s, 5, id); assert.deepEqual(s.inspected, { slot: 5, candidateId: id });
  assert.throws(() => inspectSimulatorTrash(s, 1, id), /another slot/);
  s = inspectSimulatorTrash(s, 5, null); assert.equal(s.inspected, null);
  assert.equal(JSON.stringify(real), bytes);
});

test('slot switch preserves active candidates and checks result context across slots, checkpoints, builds and sessions', () => {
  let { session: s } = fixture();
  s = observed(s); const old = receipt(s, 'rejected');
  s = selectSimulatorSlot(s, 2); s = observed(s);
  assert.throws(() => applySimulatorDisposition(s, old), /Stale/);
  s = applySimulatorDisposition(s, receipt(s, 'accepted'));
  s = selectSimulatorSlot(s, 1);
  assert.equal(s.slots[0].candidate?.history.length, 2);
  assert.throws(() => applySimulatorDisposition(s, old), /Stale/);
  const current = receipt(s, 'rejected');
  s = recordSimulatorCheckpoint(s, card(runtime.rollNext({ ...fresh(), ...s.slots[0].candidate!.card, id: 'fixture' } as Echo, new SeededRng(4))!.echo));
  assert.throws(() => applySimulatorDisposition(s, current), /Stale/);
  assert.throws(() => applySimulatorDisposition(s, { ...receipt(s, 'rejected'), characterId: 'cartethyia' }), /Stale/);
  assert.throws(() => applySimulatorDisposition(s, { ...receipt(s, 'rejected'), sessionId: 'old' }), /Stale/);
  assert.throws(() => startSimulatorCandidate(s, card(fresh())), /already exists/);
  assert.throws(() => selectSimulatorSlot(s, 6), /1–5/);
  assert.throws(() => resetEchoSimulator(s, s.id), /fresh session/);
});

test('input and history snapshots detached; identity-only acceptance fails closed; absence of adapter stays Pending', () => {
  const { session } = fixture(); const input = card(fresh());
  let s = startSimulatorCandidate(session, input); input.substats!.push({ name: 'test', value: 99 });
  assert.equal(s.slots[0].candidate!.card.substats!.length, 0);
  assert.equal(s.slots[0].candidate!.history[0].substats!.length, 0);
  const returned = simulatedEchoSlots(s); returned[0] = { echoId: 'detached-return' }; assert.equal(simulatedEchoSlots(s)[0], null);
  assert.deepEqual(s.evaluator, SIMULATOR_EVALUATOR_PENDING);
  s = startSimulatorCandidate(selectSimulatorSlot(s, 2), { echoId: 'identity-only' });
  assert.throws(() => applySimulatorDisposition(s, receipt(s, 'accepted')), /identity-only/);
  assert.equal(s.slots[1].candidate?.card.echoId, 'identity-only');
  assert.throws(() => applySimulatorDisposition(s, { ...receipt(s, 'rejected'), reason: 'a'.repeat(161) }), /invalid/);
});

test('public session has no persistence, resource fabrication, Character policy or fixture ingress; source runtime parity', () => {
  for (const name of ['echoSimulatorSession', 'echoSimulatorBoundary']) {
    const source = readFileSync('src/' + name + '.ts', 'utf8');
    assert.doesNotMatch(source, /localStorage|sessionStorage|fetch\(|echoStrategySimulator|CharacterTarget|statScore|tubeConversion|shellCredits/);
    const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, verbatimModuleSyntax: true, rewriteRelativeImportExtensions: true } }).outputText;
    assert.equal(readFileSync('docs/assets/' + name + '.js', 'utf8'), compiled);
  }
  const assets = JSON.parse(readFileSync('scripts/public-web-assets.json', 'utf8'));
  assert.equal(assets.some((path: string) => path.includes('echo-simulator-review')), false);
  const ui = readFileSync('docs/ui-prototypes/assets/echo-simulator.js', 'utf8');
  assert.doesNotMatch(ui, /applySimulatorDisposition\(|recordSimulatorCheckpoint\(|localStorage|fixture|Tube.*[0-9]|Shell Credits|\bEXP\b|\bXP\b/);
});
