import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { listCharacterDirectHitSupport, type DirectHitDamageClass } from '../src/combat/characterDirectHitAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listCharacterOutroAmplificationHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextAmplificationEvents,
  ProvenHitCharacterOutroAmplification,
  ProvenHitShorekeeperOutroTeamAmplification,
} from '../src/combat/hitContextAmplificationEvents.ts';
import type { Element } from '../src/gameDataDomain.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `character-outro-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'character-outro-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function target(params: {
  readonly element?: Element;
  readonly damageClass?: DirectHitDamageClass;
  readonly excludeCharacterId?: string;
  readonly hitAtSeconds?: number;
} = {}): CharacterHitContextSelection {
  const support = listCharacterDirectHitSupport().find(row => {
    const character = CHARACTER_CATALOG.find(c => c.id === row.characterId);
    return character?.releaseStatus === 'RELEASED'
      && (!params.element || character.element === params.element)
      && (!params.damageClass || row.sourceDamageClass === params.damageClass)
      && row.characterId !== params.excludeCharacterId;
  });
  assert.ok(support, `No canonical target for ${JSON.stringify(params)}`);
  const character = CHARACTER_CATALOG.find(row => row.id === support.characterId)!;
  const weapon = WEAPON_CATALOG.find(row => row.releaseStatus === 'RELEASED'
    && row.verificationStatus === 'VERIFIED' && row.weaponType === character.weaponType
    && row.id !== 'abyss-surges' && Number.isFinite(row.level90BaseAtk) && row.secondary)!;
  assert.ok(character.element && weapon);
  return {
    hit: { characterId: character.id, factId: support.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element as Element,
    eventContextId: `character-outro-${character.id}-${support.factId}`,
    hitAtSeconds: params.hitAtSeconds ?? 2,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: weapon.id, level: 90, rank: 1 },
  };
}

function outroProof(
  sel: CharacterHitContextSelection,
  equippedCards: ReturnType<typeof cards>,
  factId: string,
  sourceWielderId: string,
  patch: Partial<ProvenHitCharacterOutroAmplification> = {},
): HitContextAmplificationEvents {
  const support = listCharacterOutroAmplificationHitContextSupport().filter(row => row.factId === factId);
  assert.ok(support.length > 0, factId);
  const requiresPriorNoneActive = support[0].requiresPriorNoneActive;
  const row: ProvenHitCharacterOutroAmplification = {
    factId,
    evidenceId: `synthetic-${factId}-outro`,
    sourceWielderId,
    sourceQualification: 'SOURCE_PROVEN_CHARACTER_OUTRO',
    event: {
      kind: 'OUTRO_SWITCH',
      actorId: sourceWielderId,
      incomingResonatorId: sel.hit.characterId,
      incomingEntry: 'DIRECT_SWITCH',
      atSeconds: 1,
    },
    switchOutEvents: [],
    priorActivationState: requiresPriorNoneActive ? 'NONE_ACTIVE' : 'NOT_REQUIRED',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    sameTimestampSwitchOutOrder: 'NO_TIE',
    ...patch,
  };
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    eventContextId: sel.eventContextId,
    evidenceId: `synthetic-context-${factId}`,
    characterOutros: [row],
  };
}

function remaining(
  a: ReturnType<typeof assembleCharacterHitContext>,
  amplification = 0,
): RemainingHitContext {
  return {
    status: 'QUALIFIED', provenance: 'CALLER_QUALIFIED',
    assemblyKey: a.assemblyKey,
    evidenceId: 'synthetic-residual-context',
    requirements: a.requirements.map(id => ({ id, evidenceId: `synthetic-proof:${id}` })),
    buildDependentEffectsRecomputed: true,
    scalingPercent: 0,
    scalingFlat: 0,
    critRate: 0,
    critDamage: 0,
    damageBonus: 0,
    amplification,
    defenseMultiplier: 0.5,
    resistanceMultiplier: 0.9,
    damageReduction: 0,
  };
}

function compareQualified(
  sel: CharacterHitContextSelection,
  factId: string,
  sourceWielderId: string,
  currentEvents?: HitContextAmplificationEvents,
  candidateEvents?: HitContextAmplificationEvents,
) {
  const current = cards(), candidate = candidateCards();
  const ce = currentEvents ?? outroProof(sel, current, factId, sourceWielderId);
  const ne = candidateEvents ?? outroProof(sel, candidate, factId, sourceWielderId);
  const ca = assembleCharacterHitContext(sel, current, { amplification: ce });
  const na = assembleCharacterHitContext(sel, candidate, { amplification: ne });
  return {
    current, candidate, ce, ne, ca, na,
    result: () => compareCharacterHitWithAssembledContext({
      selection: sel,
      slotIndex: 0,
      current: { echoes: current, events: { amplification: ce }, remaining: remaining(ca) },
      candidate: { echoes: candidate, events: { amplification: ne }, remaining: remaining(na) },
    }),
  };
}

test('Character Outro hit support exposes 12 compatible facts / 19 typed terms and excludes Qiuyuan Echo Skill', () => {
  const support = listCharacterOutroAmplificationHitContextSupport();
  const facts = [...new Set(support.map(row => row.factId))].sort();
  assert.equal(support.length, 19);
  assert.deepEqual(facts, [
    'aalto-outro-dissolving-mist',
    'cantarella-outro-gentle-tentacles',
    'changli-outro-strategy-of-duality',
    'lumi-outro-escorting',
    'lupa-outro-stand-by-me-warrior',
    'lynae-outro-lets-hit-the-road-amplification',
    'mortefi-outro-rage-transposition',
    'roccia-outro-applause-please',
    'sanhua-outro-silversnow',
    'taoqi-outro-iron-will',
    'yinlin-outro-strategist',
    'zhezhi-outro-carve-and-draw',
  ]);
  assert.ok(!support.some(row => row.factId === 'qiuyuan-outro-strike-before-ready-amplification'));
  assert.ok(support.every(row => !Object.hasOwn(row, 'value') && !Object.hasOwn(row, 'durationSeconds')));
});

test('single-scope element and damage-class Outros feed the scalar only when their exact hit scope applies', () => {
  const aero = target({ element: 'Aero', excludeCharacterId: 'aalto' });
  const aalto = compareQualified(aero, 'aalto-outro-dissolving-mist', 'aalto').result();
  assert.equal(aalto.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (aalto.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected Aalto comparison');
  assert.equal(aalto.comparison.current.snapshot.amplification, .23);

  const heavy = target({ damageClass: 'HEAVY', excludeCharacterId: 'mortefi' });
  const mortefi = compareQualified(heavy, 'mortefi-outro-rage-transposition', 'mortefi').result();
  assert.equal(mortefi.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (mortefi.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected Mortefi comparison');
  assert.equal(mortefi.comparison.current.snapshot.amplification, .38);
});

test('dual-term Changli Outro resolves one matching term or PENDING_STACKING for a Fusion Liberation hit', () => {
  const fusionBasic = target({ element: 'Fusion', damageClass: 'BASIC', excludeCharacterId: 'changli' });
  const single = compareQualified(fusionBasic, 'changli-outro-strategy-of-duality', 'changli').result();
  assert.equal(single.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (single.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected single-scope Changli comparison');
  assert.equal(single.comparison.current.snapshot.amplification, .20);

  const fusionLiberation = target({ element: 'Fusion', damageClass: 'LIBERATION', excludeCharacterId: 'changli' });
  const dual = compareQualified(fusionLiberation, 'changli-outro-strategy-of-duality', 'changli');
  assert.equal(dual.ca.amplificationContributions.length, 2);
  assert.throws(dual.result, /Multiple active applicable amplification terms/);
});

test('single-activation-only and model-ready Outro prior-state requirements remain distinct', () => {
  const skill = target({ damageClass: 'SKILL', excludeCharacterId: 'lumi' });
  const current = cards();
  assert.throws(() => assembleCharacterHitContext(skill, current, { amplification:
    outroProof(skill, current, 'lumi-outro-escorting', 'lumi', { priorActivationState: 'NOT_REQUIRED' }) }),
  /isolated query ordering/);

  const aero = target({ element: 'Aero', excludeCharacterId: 'aalto' });
  assert.throws(() => assembleCharacterHitContext(aero, current, { amplification:
    outroProof(aero, current, 'aalto-outro-dissolving-mist', 'aalto', { priorActivationState: 'NONE_ACTIVE' }) }),
  /isolated query ordering/);
});

test('actual incoming recipient, source actor, explicit switch history and build-bound evidence fail closed', () => {
  const sel = target({ element: 'Aero', excludeCharacterId: 'aalto' });
  const current = cards(), candidate = candidateCards();
  const base = outroProof(sel, current, 'aalto-outro-dissolving-mist', 'aalto');
  const row = base.characterOutros![0];

  const badPatches: Partial<ProvenHitCharacterOutroAmplification>[] = [
    { sourceWielderId: 'mortefi' },
    { sourceQualification: 'UNKNOWN' as never },
    { event: { ...row.event, actorId: 'mortefi' } },
    { event: { ...row.event, incomingResonatorId: 'augusta' } },
    { switchOutEvents: undefined as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
    { sameTimestampSwitchOutOrder: 'UNKNOWN' as never },
  ];
  for (const patch of badPatches) {
    const bad = structuredClone(base);
    Object.assign(bad.characterOutros![0], patch);
    assert.throws(() => assembleCharacterHitContext(sel, current, { amplification: bad }));
  }

  const currentAssembly = assembleCharacterHitContext(sel, current, { amplification: base });
  const candidateEvents = outroProof(sel, candidate, 'aalto-outro-dissolving-mist', 'aalto');
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { amplification: candidateEvents });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { amplification: base }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { amplification: base }, remaining: remaining(candidateAssembly) },
  }), /per-build scoped amplification proof/);
});

test('switch-out lifecycle and same-timestamp query ordering are explicit', () => {
  const current = cards();
  const sel = target({ element: 'Aero', excludeCharacterId: 'aalto', hitAtSeconds: 2 });
  const switched = outroProof(sel, current, 'aalto-outro-dissolving-mist', 'aalto', {
    switchOutEvents: [{ kind: 'RESONATOR_SWITCH_OUT', actorId: sel.hit.characterId, atSeconds: 1.5 }],
  });
  assert.ok(assembleCharacterHitContext(sel, current, { amplification: switched })
    .amplificationContributions.every(row => !row.active));

  const tieBefore = outroProof(sel, current, 'aalto-outro-dissolving-mist', 'aalto', {
    switchOutEvents: [{ kind: 'RESONATOR_SWITCH_OUT', actorId: sel.hit.characterId, atSeconds: 2 }],
    sameTimestampSwitchOutOrder: 'BEFORE_QUERY',
  });
  assert.ok(assembleCharacterHitContext(sel, current, { amplification: tieBefore })
    .amplificationContributions.every(row => !row.active));

  const tieAfter = outroProof(sel, current, 'aalto-outro-dissolving-mist', 'aalto', {
    switchOutEvents: [{ kind: 'RESONATOR_SWITCH_OUT', actorId: sel.hit.characterId, atSeconds: 2 }],
    sameTimestampSwitchOutOrder: 'AFTER_QUERY',
  });
  assert.ok(assembleCharacterHitContext(sel, current, { amplification: tieAfter })
    .amplificationContributions.every(row => row.active));

  const mismatched = outroProof(sel, current, 'aalto-outro-dissolving-mist', 'aalto', {
    switchOutEvents: [{ kind: 'RESONATOR_SWITCH_OUT', actorId: sel.hit.characterId, atSeconds: 2 }],
    sameTimestampSwitchOutOrder: 'NO_TIE',
  });
  assert.throws(() => assembleCharacterHitContext(sel, current, { amplification: mismatched }), /must match the supplied history/);
});

test('same-timestamp Outro query ordering is explicit for model-ready and single-activation-only sources', () => {
  for (const [factId, sourceId, scope] of [
    ['aalto-outro-dissolving-mist', 'aalto', { element: 'Aero' as Element }],
    ['lumi-outro-escorting', 'lumi', { damageClass: 'SKILL' as DirectHitDamageClass }],
  ] as const) {
    const sel = target({ ...scope, excludeCharacterId: sourceId, hitAtSeconds: 2 });
    const current = cards();
    const before = outroProof(sel, current, factId, sourceId, {
      event: { kind: 'OUTRO_SWITCH', actorId: sourceId, incomingResonatorId: sel.hit.characterId,
        incomingEntry: 'DIRECT_SWITCH', atSeconds: 2 },
      sameTimestampOrder: 'BEFORE_TRIGGER',
    });
    assert.ok(assembleCharacterHitContext(sel, current, { amplification: before })
      .amplificationContributions.every(row => !row.active));

    const after = outroProof(sel, current, factId, sourceId, {
      event: { kind: 'OUTRO_SWITCH', actorId: sourceId, incomingResonatorId: sel.hit.characterId,
        incomingEntry: 'DIRECT_SWITCH', atSeconds: 2 },
      sameTimestampOrder: 'AFTER_TRIGGER',
    });
    assert.ok(assembleCharacterHitContext(sel, current, { amplification: after })
      .amplificationContributions.every(row => row.active));
  }
});

test('active generic Outro rejects residual amplification and simultaneous Shorekeeper overlap stays pending', () => {
  const sel = target({ element: 'Aero', excludeCharacterId: 'aalto' });
  const current = cards(), candidate = candidateCards();
  const currentEvents = outroProof(sel, current, 'aalto-outro-dissolving-mist', 'aalto');
  const candidateEvents = outroProof(sel, candidate, 'aalto-outro-dissolving-mist', 'aalto');
  const ca = assembleCharacterHitContext(sel, current, { amplification: currentEvents });
  const na = assembleCharacterHitContext(sel, candidate, { amplification: candidateEvents });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { amplification: currentEvents }, remaining: remaining(ca, .05) },
    candidate: { echoes: candidate, events: { amplification: candidateEvents }, remaining: remaining(na) },
  }), /Residual amplification must be zero/);

  const shorekeeper: ProvenHitShorekeeperOutroTeamAmplification = {
    sourceFactId: 'the-shorekeeper-outro-binary-butterfly',
    evidenceId: 'synthetic-shorekeeper-overlap',
    sourceWielderId: 'the-shorekeeper',
    sourceQualification: 'SOURCE_PROVEN_SHOREKEEPER_OUTRO',
    teamMemberIds: [sel.hit.characterId, 'aalto', 'the-shorekeeper'],
    event: { kind: 'OUTRO_SKILL_CAST', actorId: 'the-shorekeeper', atSeconds: 1 },
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
  };
  const overlapCurrent: HitContextAmplificationEvents = { ...currentEvents, shorekeeperOutros: [shorekeeper] };
  const overlapCandidate: HitContextAmplificationEvents = { ...candidateEvents, shorekeeperOutros: [shorekeeper] };
  const oca = assembleCharacterHitContext(sel, current, { amplification: overlapCurrent });
  const ona = assembleCharacterHitContext(sel, candidate, { amplification: overlapCandidate });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { amplification: overlapCurrent }, remaining: remaining(oca) },
    candidate: { echoes: candidate, events: { amplification: overlapCandidate }, remaining: remaining(ona) },
  }), /Multiple active applicable amplification terms/);
});

test('Qiuyuan Echo Skill-only Outro is rejected and broad team/timeline obligations remain open', () => {
  const sel = target({ damageClass: 'SKILL', excludeCharacterId: 'qiuyuan' });
  const current = cards();
  const unsupported: HitContextAmplificationEvents = {
    echoStatKey: projectRank5EchoStats(current).key,
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-qiuyuan-character-hit-attempt',
    characterOutros: [{
      factId: 'qiuyuan-outro-strike-before-ready-amplification',
      evidenceId: 'synthetic-qiuyuan-outro',
      sourceWielderId: 'qiuyuan',
      sourceQualification: 'SOURCE_PROVEN_CHARACTER_OUTRO',
      event: { kind: 'OUTRO_SWITCH', actorId: 'qiuyuan', incomingResonatorId: sel.hit.characterId,
        incomingEntry: 'DIRECT_SWITCH', atSeconds: 1 },
      switchOutEvents: [],
      priorActivationState: 'NONE_ACTIVE',
      noLaterActivationThroughHit: true,
      sameTimestampOrder: 'AFTER_TRIGGER',
      sameTimestampSwitchOutOrder: 'NO_TIE',
    }],
  };
  assert.throws(() => assembleCharacterHitContext(sel, current, { amplification: unsupported }),
    /no supported Character direct-hit amplification terms/);

  const supported = outroProof(sel, current, 'taoqi-outro-iron-will', 'taoqi');
  const assembly = assembleCharacterHitContext(sel, current, { amplification: supported });
  assert.ok(assembly.requirements.includes('selected-team-effects'));
  assert.equal(assembly.authorizesRotationDps, false);
});
