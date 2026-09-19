import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import {
  activateForgedDwarfStarStatusWindow,
  isForgedDwarfStarStatusWindowActive,
  validateForgedDwarfStarStatusContract,
  type QualifiedForgedDwarfStarStatusApplicationEvent,
} from '../src/combat/forgedDwarfStarStatusWindowAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listForgedDwarfStarStatusHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextWeaponEvents,
  ProvenHitForgedDwarfStarApplication,
} from '../src/combat/hitContextWeaponEvents.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `fds-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'fds-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function findCompatibleDirectHitConsumer() {
  for (const character of CHARACTER_CATALOG.filter(row =>
    row.releaseStatus === 'RELEASED' && row.weaponType === 'Rectifier')) {
    const hits = listCharacterDirectHitSupport().filter(row => row.characterId === character.id);
    if (hits.some(row => row.sourceDamageClass === 'LIBERATION')
      && hits.some(row => row.sourceDamageClass !== 'LIBERATION')) return character.id;
  }
  throw new Error('No released Rectifier currently has both supported Liberation and non-Liberation direct hits');
}
const DIRECT_HIT_CONSUMER_ID = findCompatibleDirectHitConsumer();

function selection(
  scope: 'LIBERATION' | 'NON_LIBERATION',
  hitAtSeconds = 2,
  rank: 1 | 2 | 3 | 4 | 5 = 1,
): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === DIRECT_HIT_CONSUMER_ID)!;
  const hits = listCharacterDirectHitSupport().filter(row => row.characterId === DIRECT_HIT_CONSUMER_ID);
  const hit = scope === 'LIBERATION'
    ? hits.find(row => row.sourceDamageClass === 'LIBERATION')
    : hits.find(row => row.sourceDamageClass !== 'LIBERATION');
  assert.ok(character?.element && hit, `missing compatible ${scope} direct hit`);
  return {
    hit: {
      characterId: DIRECT_HIT_CONSUMER_ID,
      factId: hit.factId,
      componentIndex: 0,
      landedHitCount: 1,
      sequence: 0,
      maxSkills: true,
    },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `fds-${scope.toLowerCase()}-hit`,
    targetId: 'enemy',
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: 'forged-dwarf-star', level: 90, rank },
  };
}

function application(
  kind: QualifiedForgedDwarfStarStatusApplicationEvent['kind'] = 'FUSION_BURST_APPLIED',
  patch: Partial<ProvenHitForgedDwarfStarApplication> = {},
): ProvenHitForgedDwarfStarApplication {
  return {
    effectId: 'FDS-LIB',
    evidenceId: `synthetic-fds-${kind.toLowerCase()}`,
    event: {
      kind,
      actorId: DIRECT_HIT_CONSUMER_ID,
      targetId: 'enemy',
      sourceFactId: `caller-qualified-fds-${kind.toLowerCase()}`,
      atSeconds: 1,
      sourceTriggerQualification: 'VERIFIED_FORGED_DWARF_STAR_STATUS_APPLICATION',
    },
    equipmentAtEventQualified: true,
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    ...patch,
  };
}

function events(
  equippedCards: ReturnType<typeof cards>,
  sel: CharacterHitContextSelection,
  rank: 1 | 2 | 3 | 4 | 5 = 1,
  row: ProvenHitForgedDwarfStarApplication = application(),
): HitContextWeaponEvents {
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    weapon: { id: 'forged-dwarf-star', rank },
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-forged-dwarf-star-hit-context',
    casts: [],
    forgedDwarfStarApplications: [row],
  };
}

function remaining(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  return {
    status: 'QUALIFIED',
    assemblyKey: a.assemblyKey,
    evidenceId: 'synthetic-fds-remaining-context',
    requirements: a.requirements.map(id => ({ id, evidenceId: `synthetic-proof:${id}` })),
    buildDependentEffectsRecomputed: true,
    scalingPercent: 0,
    scalingFlat: 0,
    critRate: 0,
    critDamage: 0,
    damageBonus: 0,
    amplification: 0,
    defenseMultiplier: 0.5,
    resistanceMultiplier: 0.9,
    damageReduction: 0,
  };
}

function compareFor(
  scope: 'LIBERATION' | 'NON_LIBERATION',
  sameTimestampOrder: ProvenHitForgedDwarfStarApplication['sameTimestampOrder'],
) {
  const sel = selection(scope, 1);
  const current = cards(), candidate = candidateCards();
  const currentEvents = events(current, sel, 1, application('FUSION_BURST_APPLIED', { sameTimestampOrder }));
  const candidateEvents = events(candidate, sel, 1, application('FUSION_BURST_APPLIED', { sameTimestampOrder }));
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
  const result = compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { weapon: candidateEvents }, remaining: remaining(candidateAssembly) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected evaluated comparison');
  return { result, currentAssembly };
}

test('Forged Dwarf Star hit support exposes only FDS-LIB, exact Liberation scope and no copied numeric values', () => {
  const support = listForgedDwarfStarStatusHitContextSupport();
  assert.equal(support.length, 1);
  assert.equal(support[0].effectId, 'FDS-LIB');
  assert.equal(support[0].weaponId, 'forged-dwarf-star');
  assert.equal(support[0].statOrEffect, 'Resonance Liberation DMG');
  assert.equal(support[0].selectedHitScope, 'LIBERATION_DIRECT_HIT_ONLY');
  assert.equal(support[0].sourceTriggerMeaning,
    'AFTER_WIELDER_INFLICTS_FUSION_BURST_OR_TUNE_STRAIN_SHIFTING');
  assert.equal(support[0].occurrencePolicy, 'CALLER_QUALIFIED_TIMESTAMP_ONLY');
  assert.equal(support[0].requiresPerBuildEventProof, true);
  assert.equal(support[0].requiresExplicitTriggerTargetIdentity, true);
  assert.equal(Object.hasOwn(support[0], 'value'), false);
  assert.equal(Object.hasOwn(support[0], 'durationSeconds'), false);
  assert.ok(!support.some(row => row.effectId === 'FDS-TEAM'));
});

test('Denia is not counted as a direct-hit FDS-LIB consumer while her Liberation-class actions remain conditional', () => {
  const deniaHits = listCharacterDirectHitSupport().filter(row => row.characterId === 'denia');
  assert.deepEqual([...new Set(deniaHits.map(row => row.sourceDamageClass))].sort(), ['BASIC', 'HEAVY']);
  assert.equal(deniaHits.some(row => row.sourceDamageClass === 'LIBERATION'), false);
});

test('both reviewed negative-status occurrences activate exact canonical R1-R5 values and five-second lifetime', () => {
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'FDS-LIB')!;
  assert.deepEqual(validateForgedDwarfStarStatusContract(), []);
  for (const kind of ['FUSION_BURST_APPLIED', 'TUNE_STRAIN_SHIFTING_APPLIED'] as const) {
    for (const rank of [1, 2, 3, 4, 5] as const) {
      const event: QualifiedForgedDwarfStarStatusApplicationEvent = {
        kind,
        actorId: DIRECT_HIT_CONSUMER_ID,
        targetId: 'enemy',
        sourceFactId: `caller-qualified-${kind.toLowerCase()}`,
        atSeconds: 3,
        sourceTriggerQualification: 'VERIFIED_FORGED_DWARF_STAR_STATUS_APPLICATION',
      };
      const window = activateForgedDwarfStarStatusWindow({
        selectedWeapon: { id: 'forged-dwarf-star', rank },
        wielderId: DIRECT_HIT_CONSUMER_ID,
        event,
      })!;
      assert.equal(window.value, source.rankValues[rank - 1]);
      assert.equal(window.startedAtSeconds, 3);
      assert.equal(window.expiresAtSeconds, 8);
      assert.equal(window.triggerStatusKind, kind);
      assert.equal(window.triggerTargetId, 'enemy');
      assert.equal(window.sourceFactId, event.sourceFactId);
      assert.equal(isForgedDwarfStarStatusWindowActive(window, {
        actorId: DIRECT_HIT_CONSUMER_ID, atSeconds: 3, sameTimestampOrder: 'BEFORE_TRIGGER',
      }), false);
      assert.equal(isForgedDwarfStarStatusWindowActive(window, {
        actorId: DIRECT_HIT_CONSUMER_ID, atSeconds: 3, sameTimestampOrder: 'AFTER_TRIGGER',
      }), true);
      assert.equal(isForgedDwarfStarStatusWindowActive(window, {
        actorId: DIRECT_HIT_CONSUMER_ID, atSeconds: 7.999, sameTimestampOrder: 'AFTER_TRIGGER',
      }), true);
      assert.equal(isForgedDwarfStarStatusWindowActive(window, {
        actorId: DIRECT_HIT_CONSUMER_ID, atSeconds: 8, sameTimestampOrder: 'AFTER_TRIGGER',
      }), false);
    }
  }
});

test('missing FDS status occurrence remains explicit PENDING_EVENT for exact Forged Dwarf Star build', () => {
  const sel = selection('LIBERATION'), current = cards();
  const result = assembleCharacterHitContext(sel, current);
  assert.equal(result.pending.find(row => row.id === 'weapon:FDS-LIB')?.status, 'PENDING_EVENT');
});

test('qualified FDS occurrence resolves per-build evidence and affects only Liberation damage projection', () => {
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'FDS-LIB')!;
  const libBefore = compareFor('LIBERATION', 'BEFORE_TRIGGER');
  const libAfter = compareFor('LIBERATION', 'AFTER_TRIGGER');
  const nonLibBefore = compareFor('NON_LIBERATION', 'BEFORE_TRIGGER');
  const nonLibAfter = compareFor('NON_LIBERATION', 'AFTER_TRIGGER');

  const contribution = libAfter.currentAssembly.eventContributions.find(row => row.sourceId === 'weapon:FDS-LIB')!;
  assert.equal(contribution.value, source.rankValues[0]);
  assert.equal(contribution.active, true);
  assert.equal(contribution.triggerTargetId, 'enemy');
  assert.equal(contribution.triggerStatusKind, 'FUSION_BURST_APPLIED');
  assert.ok(!libAfter.currentAssembly.requirements.includes('weapon:FDS-LIB'));

  const libDelta = libAfter.result.comparison.current.snapshot.damageBonus
    - libBefore.result.comparison.current.snapshot.damageBonus;
  const nonLibDelta = nonLibAfter.result.comparison.current.snapshot.damageBonus
    - nonLibBefore.result.comparison.current.snapshot.damageBonus;
  assert.ok(Math.abs(libDelta - source.rankValues[0]) < 1e-12);
  assert.ok(Math.abs(nonLibDelta) < 1e-12,
    'active FDS-LIB source window must not leak onto a non-Liberation Character hit');
});

test('Forged Dwarf Star current/candidate evidence remains bound to exact Echo cards and weapon rank', () => {
  const sel = selection('LIBERATION', 2, 3), current = cards(), candidate = candidateCards();
  const currentEvents = events(current, sel, 3), candidateEvents = events(candidate, sel, 3);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
  const input = {
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { weapon: candidateEvents }, remaining: remaining(candidateAssembly) },
  };
  assert.equal(compareCharacterHitWithAssembledContext(input).comparison.status, 'EVALUATED_HIT_COMPARISON');
  assert.throws(() => compareCharacterHitWithAssembledContext({
    ...input,
    candidate: { ...input.candidate, events: { weapon: currentEvents } },
  }), /per-build event proof/);

  const wrongRank = structuredClone(candidateEvents);
  wrongRank.weapon.rank = 2;
  assert.throws(() => assembleCharacterHitContext(sel, candidate, { weapon: wrongRank }), /per-build event proof/);
});

test('weapon, owner, source fact, qualification and isolated lifecycle proof fail closed', () => {
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'FDS-LIB')!;
  const baseEvent: QualifiedForgedDwarfStarStatusApplicationEvent = {
    kind: 'FUSION_BURST_APPLIED',
    actorId: DIRECT_HIT_CONSUMER_ID,
    targetId: 'enemy',
    sourceFactId: 'caller-qualified-fds-fusion-burst',
    atSeconds: 1,
    sourceTriggerQualification: 'VERIFIED_FORGED_DWARF_STAR_STATUS_APPLICATION',
  };
  assert.throws(() => activateForgedDwarfStarStatusWindow({
    selectedWeapon: { id: 'stringmaster', rank: 1 }, wielderId: DIRECT_HIT_CONSUMER_ID, event: baseEvent,
  }), /exact selected weapon/);
  assert.throws(() => activateForgedDwarfStarStatusWindow({
    selectedWeapon: { id: 'forged-dwarf-star', rank: 0 }, wielderId: DIRECT_HIT_CONSUMER_ID, event: baseEvent,
  }), /R1 through R5/);
  assert.equal(activateForgedDwarfStarStatusWindow({
    selectedWeapon: { id: 'forged-dwarf-star', rank: 1 }, wielderId: DIRECT_HIT_CONSUMER_ID,
    event: { ...baseEvent, actorId: 'different-actor' },
  }), null);
  assert.throws(() => activateForgedDwarfStarStatusWindow({
    selectedWeapon: { id: 'forged-dwarf-star', rank: 1 }, wielderId: DIRECT_HIT_CONSUMER_ID,
    event: { ...baseEvent, sourceFactId: '' },
  }), /source\/target\/fact/);
  assert.throws(() => activateForgedDwarfStarStatusWindow({
    selectedWeapon: { id: 'forged-dwarf-star', rank: 1 }, wielderId: DIRECT_HIT_CONSUMER_ID,
    event: { ...baseEvent, sourceTriggerQualification: 'UNKNOWN' },
  }), /source-qualified Fusion Burst or Tune Strain/);

  const sel = selection('LIBERATION'), current = cards(), base = events(current, sel);
  const original = base.forgedDwarfStarApplications![0];
  const patches: Partial<ProvenHitForgedDwarfStarApplication>[] = [
    { evidenceId: '' },
    { equipmentAtEventQualified: false as true },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
    { event: { ...original.event, actorId: 'encore' } },
    { event: { ...original.event, targetId: '' } },
    { event: { ...original.event, sourceFactId: '' } },
  ];
  for (const patch of patches) {
    const bad = structuredClone(base);
    Object.assign(bad.forgedDwarfStarApplications![0], patch);
    assert.throws(() => assembleCharacterHitContext(sel, current, { weapon: bad }));
  }

  const drifted = WEAPON_EFFECT_CATALOG.map(row =>
    row.effectId === source.effectId ? { ...row, durationSeconds: 6 } : row);
  assert.ok(validateForgedDwarfStarStatusContract(drifted).some(issue => issue.includes('contract drift')));
});

test('FDS refresh/stacking is not invented and the separate FDS-TEAM effect remains outside this primitive', () => {
  const sel = selection('LIBERATION'), current = cards(), base = events(current, sel);
  const duplicate: HitContextWeaponEvents = {
    ...base,
    forgedDwarfStarApplications: [
      base.forgedDwarfStarApplications![0],
      application('TUNE_STRAIN_SHIFTING_APPLIED'),
    ],
  };
  assert.throws(() => assembleCharacterHitContext(sel, current, { weapon: duplicate }),
    /refresh\/stacking is unreviewed/);

  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'FDS-TEAM');
  assert.ok(source, 'canonical FDS-TEAM row remains present for later chained-state work');
  assert.ok(!listForgedDwarfStarStatusHitContextSupport().some(row => row.effectId === 'FDS-TEAM'));
});
