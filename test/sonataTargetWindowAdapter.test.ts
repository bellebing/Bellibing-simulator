import assert from 'node:assert/strict';
import test from 'node:test';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { activateSonataTargetWindow, isSonataTargetWindowActive, listSonataTargetWindowSupport } from '../src/combat/sonataTargetWindowAdapter.ts';
import { ZaniSpectroFrazzleTargetState } from '../src/combat/zaniSpectroFrazzleTargetState.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';

const input = () => ({ effectId: 'S11_5PC_SPECTRO', ownerId: 'zani', selectedSet: { id: 'sonata-11', pieces: 5 },
  event: { kind: 'ATTACK_ENEMY' as const, actorId: 'zani', targetId: 'enemy',
    sourceFactId: 'zani-resonance-skill-restless-watch-targeted-action-dmg', atSeconds: 2,
    sourceTriggerQualification: 'VERIFIED_SOURCE_TRIGGER' as const },
  target: { kind: 'SPECTRO_FRAZZLE' as const, targetId: 'enemy', observedAtSeconds: 2,
    observationOrder: 'BEFORE_TRIGGER' as const, stacks: 10 },
});
const query = (atSeconds: number) => ({ actorId: 'zani', atSeconds, sameTimestampOrder: 'UNKNOWN' as const });

test('target-window family joins canonical facts and four existing Character loadouts without copied values', () => {
  const support = listSonataTargetWindowSupport();
  assert.equal(support.length, 3);
  const sets = new Set<string>(support.map((row) => row.sonataSetId));
  assert.deepEqual(PROFILE_CATALOGS.echoLoadouts.filter((p) => p.sonataSetIds.some((id) => sets.has(id))).map((p) => p.characterId).sort(),
    ['cartethyia', 'jiyan', 'rover-aero', 'zani']);
  assert.deepEqual(buildCharacterDatabase().gear.sonataTargetWindows, support);
  for (const row of support) {
    const source = SONATA_EFFECT_MODELS.find((fact) => fact.effectId === row.effectId)!;
    assert.equal(source.sonataSetId, row.sonataSetId);
    assert.equal(source.trigger, row.trigger);
    assert.equal(Object.hasOwn(row, 'value'), false);
    assert.equal(Object.hasOwn(row, 'durationSeconds'), false);
  }
  (support[0] as { effectId: string }).effectId = 'client edit';
  assert.equal(listSonataTargetWindowSupport()[0].effectId, 'S11_5PC_SPECTRO');
});

test('Eternal Radiance uses the existing Zani stack view without manufacturing infliction or profile readiness', () => {
  const state = new ZaniSpectroFrazzleTargetState('enemy');
  state.applyIncomingSpectroFrazzle({ atSeconds: 1, targetId: 'enemy', sourceActorId: 'phoebe',
    sourceFactId: 'explicit-incoming-test-event', frazzleStacksOnTargetAfterApplication: 10 });
  const view = state.eternalRadianceView(2);
  assert.equal(view.provesInflictSpectroFrazzleTrigger, false);
  const window = activateSonataTargetWindow({ ...input(), target: { ...input().target, kind: 'ZANI_ETERNAL_RADIANCE', view } })!;
  const fact = SONATA_EFFECT_MODELS.find((row) => row.effectId === window.effectId)!;
  assert.equal(window.value, fact.value);
  assert.equal(window.expiresAtSeconds, 2 + fact.durationSeconds!);
  state.consumeHeliacalEmberForBeaconForTheFuture(3);
  assert.equal(state.eternalRadianceView(3).effectiveFrazzleStacksForEternalRadiance, 0);
  assert.equal(isSonataTargetWindowActive(window, query(4)), true, 'triggered window persists independently of subsequent target state');
  assert.throws(() => activateSonataTargetWindow({ ...input(), effectId: 'S11_5PC_CR' }), /No reviewed target-attack contract/);
  const queue = buildProfileExecutionWorkQueue();
  assert.equal(queue.summary.totalEdges, 83);
  assert.equal(queue.edges.find((edge) => edge.pendingExecutionId === 'sonata:sonata-11:S11_5PC_SPECTRO:target-stack-timeline-adapter')?.semanticStatus,
    'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(queue.edges.find((edge) => edge.pendingExecutionId === 'sonata:sonata-11:S11_5PC_CR:frazzle-infliction-event-adapter')?.semanticStatus, 'UNREVIEWED');
  assert.deepEqual(buildCharacterDatabase().characters.filter((row) => row.readiness?.disposition === 'DPS_READY').map((row) => row.id), ['augusta', 'ciaccona']);
});

test('target threshold is evaluated at the exact attack time including existing per-stack expiry', () => {
  for (const stacks of [0, 9]) assert.equal(activateSonataTargetWindow({ ...input(), target: { ...input().target, stacks } }), null);
  for (const stacks of [10, 11]) assert.ok(activateSonataTargetWindow({ ...input(), target: { ...input().target, stacks } }));
  for (const stacks of [-1, 10.5, Number.NaN]) assert.throws(() => activateSonataTargetWindow({ ...input(), target: { ...input().target, stacks } }), /stack count/);
  const state = new ZaniSpectroFrazzleTargetState('enemy');
  state.applyIncomingSpectroFrazzle({ atSeconds: 0, targetId: 'enemy', sourceActorId: 'phoebe',
    sourceFactId: 'explicit-incoming-test-event', frazzleStacksOnTargetAfterApplication: 10 });
  const expired = state.eternalRadianceView(6);
  assert.equal(activateSonataTargetWindow({ ...input(), event: { ...input().event, atSeconds: 6 },
    target: { ...input().target, kind: 'ZANI_ETERNAL_RADIANCE', observedAtSeconds: 6, view: expired } }), null);
});

test('Windward Pilgrimage requires an actual owned hit on an already affected target', () => {
  for (const effectId of ['S17_5PC_CR', 'S17_5PC_AERO']) {
    const args = { ...input(), effectId, ownerId: 'cartethyia', selectedSet: { id: 'sonata-17', pieces: 5 },
      event: { ...input().event, kind: 'HIT_TARGET' as const, actorId: 'cartethyia', sourceFactId: 'explicit-owned-hit' },
      target: { ...input().target, kind: 'AERO_EROSION' as const, affected: true } };
    const window = activateSonataTargetWindow(args)!;
    const fact = SONATA_EFFECT_MODELS.find((row) => row.effectId === effectId)!;
    assert.equal(window.value, fact.value);
    assert.equal(window.expiresAtSeconds, 2 + fact.durationSeconds!);
    assert.equal(activateSonataTargetWindow({ ...args, target: { ...args.target, affected: false } }), null);
    assert.equal(activateSonataTargetWindow({ ...args, event: { ...args.event, actorId: 'rover-aero' } }), null);
    assert.throws(() => activateSonataTargetWindow({ ...args, event: { ...args.event, kind: 'ATTACK_ENEMY' } }), /attack\/hit trigger/);
  }
});

test('unknown occurrence target identity time and pre-trigger ordering fail closed', () => {
  assert.throws(() => activateSonataTargetWindow({ ...input(), event: { ...input().event, kind: 'CAST' as never } }), /attack\/hit trigger/);
  assert.throws(() => activateSonataTargetWindow({ ...input(), event: { ...input().event, sourceTriggerQualification: 'UNKNOWN' } }), /attack\/hit trigger/);
  for (const patch of [{ targetId: 'other' }, { observedAtSeconds: 1 }, { observationOrder: 'UNKNOWN' as const }]) {
    assert.throws(() => activateSonataTargetWindow({ ...input(), target: { ...input().target, ...patch } }), /explicitly before/);
  }
  assert.throws(() => activateSonataTargetWindow({ ...input(), selectedSet: { id: 'sonata-17', pieces: 5 } }), /Exact selected Sonata/);
  for (const pieces of [-1, 6, 4.5, undefined as never]) assert.throws(() => activateSonataTargetWindow({ ...input(), selectedSet: { id: 'sonata-11', pieces } }), /piece count/);
  assert.equal(activateSonataTargetWindow({ ...input(), selectedSet: { id: 'sonata-11', pieces: 4 } }), null);
});

test('Heliacal equivalence cannot leak to other owners targets or effect triggers', () => {
  const state = new ZaniSpectroFrazzleTargetState('enemy');
  const view = state.eternalRadianceView(2);
  const target = { ...input().target, kind: 'ZANI_ETERNAL_RADIANCE' as const, view };
  assert.throws(() => activateSonataTargetWindow({ ...input(), ownerId: 'phoebe', target }), /Exact Zani/);
  for (const patch of [{ targetId: 'other' }, { effectiveFrazzleStacksForEternalRadiance: 10 }, { provesInflictSpectroFrazzleTrigger: true }]) {
    assert.throws(() => activateSonataTargetWindow({ ...input(), target: { ...target, view: { ...view, ...patch } as never } }), /Exact Zani/);
  }
});

test('source drift and ambiguous same-hit order cannot silently grant a target window', () => {
  for (const patch of [{ appliesTo: 'TEAM' }, { trigger: 'Inflict Spectro Frazzle' }, { maxStacks: 2 }, { durationSeconds: null }, { mechanicsStatus: 'VALUE_VERIFIED_TRIGGER_PENDING' }]) {
    const catalog = SONATA_EFFECT_MODELS.map((row) => row.effectId === 'S11_5PC_SPECTRO' ? { ...row, ...patch } as never : row);
    assert.throws(() => activateSonataTargetWindow({ ...input(), catalog }), /source contract drift/);
  }
  const window = activateSonataTargetWindow(input())!;
  assert.ok(Object.isFrozen(window));
  assert.throws(() => isSonataTargetWindowActive(window, query(2)), /ordering is unresolved/);
  assert.equal(isSonataTargetWindowActive(window, { ...query(2), sameTimestampOrder: 'BEFORE_TRIGGER' }), false);
  assert.equal(isSonataTargetWindowActive(window, { ...query(2), sameTimestampOrder: 'AFTER_TRIGGER' }), true);
  assert.equal(isSonataTargetWindowActive(window, { ...query(3), actorId: 'phoebe' }), false);
  assert.equal(isSonataTargetWindowActive(window, query(window.expiresAtSeconds)), false);
  for (const atSeconds of [-1, Number.NaN, Number.MAX_VALUE]) {
    assert.throws(() => activateSonataTargetWindow({ ...input(), event: { ...input().event, atSeconds }, target: { ...input().target, observedAtSeconds: atSeconds } }), /time|expiration/);
  }
});
