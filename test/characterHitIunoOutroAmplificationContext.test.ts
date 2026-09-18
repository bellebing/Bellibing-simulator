import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { listCharacterDirectHitSupport, type DirectHitDamageClass } from '../src/combat/characterDirectHitAdapter.ts';
import { resolveIunoOutroTransferContract } from '../src/combat/iunoOutroTransferAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listIunoOutroAmplificationHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextAmplificationEvents,
  ProvenHitIunoOutroAmplification,
  ProvenHitShorekeeperOutroTeamAmplification,
} from '../src/combat/hitContextAmplificationEvents.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `iuno-outro-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'iuno-outro-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(damageClass: DirectHitDamageClass, hitAtSeconds = 2): CharacterHitContextSelection {
  const support = listCharacterDirectHitSupport().find(row =>
    row.sourceDamageClass === damageClass && row.characterId !== 'iuno');
  assert.ok(support);
  const character = CHARACTER_CATALOG.find(row => row.id === support.characterId)!;
  const weapon = WEAPON_CATALOG.find(row => row.releaseStatus === 'RELEASED'
    && row.verificationStatus === 'VERIFIED' && row.weaponType === character.weaponType
    && row.id !== 'abyss-surges' && Number.isFinite(row.level90BaseAtk) && row.secondary)!;
  assert.ok(character.element && weapon);
  return {
    hit: { characterId: character.id, factId: support.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element,
    eventContextId: `iuno-outro-${character.id}-${support.factId}`,
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: weapon.id, level: 90, rank: 1 },
  };
}

function proof(
  sel: CharacterHitContextSelection,
  equippedCards: ReturnType<typeof cards>,
  patch: Partial<ProvenHitIunoOutroAmplification> = {},
): HitContextAmplificationEvents {
  const row: ProvenHitIunoOutroAmplification = {
    sourceFactId: 'iuno-outro-from-gloom-to-gleam',
    evidenceId: 'synthetic-iuno-outro-window',
    sourceWielderId: 'iuno',
    sourceQualification: 'SOURCE_PROVEN_IUNO_OUTRO',
    event: { kind: 'OUTRO_SWITCH', actorId: 'iuno', incomingResonatorId: sel.hit.characterId,
      incomingEntry: 'DIRECT_SWITCH', atSeconds: 1 },
    switchOutEvents: [],
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    sameTimestampSwitchOutOrder: 'NO_TIE',
    ...patch,
  };
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-iuno-outro-context',
    iunoOutros: [row],
  };
}

function remaining(a: ReturnType<typeof assembleCharacterHitContext>, amplification = 0): RemainingHitContext {
  return {
    status: 'QUALIFIED',
    assemblyKey: a.assemblyKey,
    evidenceId: 'synthetic-residual-context',
    requirements: a.requirements.map(id => ({ id, evidenceId: `synthetic-proof:${id}` })),
    buildDependentEffectsRecomputed: true,
    scalingPercent: 0, scalingFlat: 0, critRate: 0, critDamage: 0, damageBonus: 0,
    amplification, defenseMultiplier: 0.5, resistanceMultiplier: 0.9, damageReduction: 0,
  };
}

test('Iuno support is identity/scope only and preserves the reviewed Heavy transfer contract', () => {
  const support = listIunoOutroAmplificationHitContextSupport();
  assert.deepEqual(support, [{
    sourceFactId: 'iuno-outro-from-gloom-to-gleam',
    sourceCharacterId: 'iuno',
    statOrEffect: 'Heavy Attack DMG Amplification',
    scope: { kind: 'DAMAGE_CLASS', damageClass: 'HEAVY' },
    primitiveId: 'iuno-outro-incoming-heavy-amplification-v1',
    contextScope: 'EXPLICIT_IUNO_INCOMING_HEAVY_SINGLE_ACTIVE_AMPLIFICATION',
    endsOnIncomingSwitchOut: true,
    requiresPriorNoneActive: true,
    contextPrimitiveId: 'character-source-qualified-hit-context-v1',
    requiresPerBuildEventProof: true,
    requiresExplicitIncomingRecipientProof: true,
    requiresExplicitSwitchOutHistory: true,
    stackingPolicy: 'SINGLE_ACTIVE_APPLICABLE_TERM_ONLY',
    magnitudeDependsOnEchoStats: false,
  }]);
  assert.equal(Object.hasOwn(support[0], 'amplification'), false);
  assert.equal(Object.hasOwn(support[0], 'durationSeconds'), false);
});

test('Iuno Outro feeds Heavy hits only and leaves non-Heavy hit amplification at zero', () => {
  const contract = resolveIunoOutroTransferContract();
  for (const [damageClass, expected] of [['HEAVY', contract.amplification], ['BASIC', 0]] as const) {
    const sel = selection(damageClass), current = cards(), candidate = candidateCards();
    const ce = proof(sel, current), ne = proof(sel, candidate);
    const ca = assembleCharacterHitContext(sel, current, { amplification: ce });
    const na = assembleCharacterHitContext(sel, candidate, { amplification: ne });
    assert.equal(ca.amplificationContributions[0].active, true);
    const result = compareCharacterHitWithAssembledContext({
      selection: sel, slotIndex: 0,
      current: { echoes: current, events: { amplification: ce }, remaining: remaining(ca) },
      candidate: { echoes: candidate, events: { amplification: ne }, remaining: remaining(na) },
    });
    assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
    if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
    assert.equal(result.comparison.current.snapshot.amplification, expected);
  }
});

test('Iuno owner, actual incoming recipient, explicit history and isolated lifecycle fail closed', () => {
  const sel = selection('HEAVY'), current = cards(), base = proof(sel, current), row = base.iunoOutros![0];
  const patches: Partial<ProvenHitIunoOutroAmplification>[] = [
    { evidenceId: '' },
    { sourceWielderId: 'mortefi' as 'iuno' },
    { sourceQualification: 'UNKNOWN' as never },
    { event: { ...row.event, actorId: 'mortefi' } },
    { event: { ...row.event, incomingResonatorId: 'augusta' } },
    { switchOutEvents: undefined as never },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
    { sameTimestampSwitchOutOrder: 'UNKNOWN' as never },
  ];
  for (const patch of patches) {
    const bad = structuredClone(base);
    Object.assign(bad.iunoOutros![0], patch);
    assert.throws(() => assembleCharacterHitContext(sel, current, { amplification: bad }));
  }
});

test('Iuno switch-out and same-timestamp ordering are explicit', () => {
  const current = cards(), sel = selection('HEAVY', 2);
  const switched = proof(sel, current, {
    switchOutEvents: [{ kind: 'RESONATOR_SWITCH_OUT', actorId: sel.hit.characterId, atSeconds: 1.5 }],
  });
  assert.equal(assembleCharacterHitContext(sel, current, { amplification: switched })
    .amplificationContributions[0].active, false);

  const tieBefore = proof(sel, current, {
    switchOutEvents: [{ kind: 'RESONATOR_SWITCH_OUT', actorId: sel.hit.characterId, atSeconds: 2 }],
    sameTimestampSwitchOutOrder: 'BEFORE_QUERY',
  });
  assert.equal(assembleCharacterHitContext(sel, current, { amplification: tieBefore })
    .amplificationContributions[0].active, false);

  const tieAfter = proof(sel, current, {
    switchOutEvents: [{ kind: 'RESONATOR_SWITCH_OUT', actorId: sel.hit.characterId, atSeconds: 2 }],
    sameTimestampSwitchOutOrder: 'AFTER_QUERY',
  });
  assert.equal(assembleCharacterHitContext(sel, current, { amplification: tieAfter })
    .amplificationContributions[0].active, true);

  const triggerSel = selection('HEAVY', 2);
  const beforeTrigger = proof(triggerSel, current, {
    event: { kind: 'OUTRO_SWITCH', actorId: 'iuno', incomingResonatorId: triggerSel.hit.characterId,
      incomingEntry: 'DIRECT_SWITCH', atSeconds: 2 },
    sameTimestampOrder: 'BEFORE_TRIGGER',
  });
  assert.equal(assembleCharacterHitContext(triggerSel, current, { amplification: beforeTrigger })
    .amplificationContributions[0].active, false);
});

test('Iuno proof is build-bound and active Heavy term rejects residual amplification', () => {
  const sel = selection('HEAVY'), current = cards(), candidate = candidateCards();
  const ce = proof(sel, current), ne = proof(sel, candidate);
  const ca = assembleCharacterHitContext(sel, current, { amplification: ce });
  const na = assembleCharacterHitContext(sel, candidate, { amplification: ne });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { amplification: ce }, remaining: remaining(ca) },
    candidate: { echoes: candidate, events: { amplification: ce }, remaining: remaining(na) },
  }), /per-build scoped amplification proof/);
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { amplification: ce }, remaining: remaining(ca, .1) },
    candidate: { echoes: candidate, events: { amplification: ne }, remaining: remaining(na) },
  }), /Residual amplification must be zero/);
});

test('Iuno plus Shorekeeper on one Heavy hit remains pending and no profile/timeline readiness is claimed', () => {
  const sel = selection('HEAVY'), current = cards(), candidate = candidateCards();
  const shorekeeper: ProvenHitShorekeeperOutroTeamAmplification = {
    sourceFactId: 'the-shorekeeper-outro-binary-butterfly',
    evidenceId: 'synthetic-shorekeeper-iuno-overlap',
    sourceWielderId: 'the-shorekeeper',
    sourceQualification: 'SOURCE_PROVEN_SHOREKEEPER_OUTRO',
    teamMemberIds: [sel.hit.characterId, 'iuno', 'the-shorekeeper'],
    event: { kind: 'OUTRO_SKILL_CAST', actorId: 'the-shorekeeper', atSeconds: 1 },
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
  };
  const ce: HitContextAmplificationEvents = { ...proof(sel, current), shorekeeperOutros: [shorekeeper] };
  const ne: HitContextAmplificationEvents = { ...proof(sel, candidate), shorekeeperOutros: [shorekeeper] };
  const ca = assembleCharacterHitContext(sel, current, { amplification: ce });
  const na = assembleCharacterHitContext(sel, candidate, { amplification: ne });
  assert.ok(ca.requirements.includes('selected-team-effects'));
  assert.equal(ca.authorizesRotationDps, false);
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { amplification: ce }, remaining: remaining(ca) },
    candidate: { echoes: candidate, events: { amplification: ne }, remaining: remaining(na) },
  }), /Multiple active applicable amplification terms/);
});
