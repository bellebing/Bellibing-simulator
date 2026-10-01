import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getCharacterMechanicFact } from '../src/data/characterMechanics.ts';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { evaluateRoverWindstringsGain as evaluate, readRoverWindstringsGains, readCartethyiaWindstringsGain,
  listRoverWindstringsGainSupport, type RoverWindstringsGainInput } from '../src/combat/roverWindstringsGainAdapter.ts';
import { CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT } from '../src/data/characterMechanics/cartethyiaWindstringsSourceContract.ts';

function input(index = 0): RoverWindstringsGainInput {
  const binding = listRoverWindstringsGainSupport()[index];
  return { characterId: binding.characterId, resourceFactId: binding.resourceFactId, actionFactId: binding.actionFactId,
    sequence: 0, maxSkills: true, event: { kind: binding.eventKind, actorId: 'rover-aero', atSeconds: 0, sourceQualified: true,
      ...(binding.eventKind === 'CLOUDBURST_STAGE_HIT' ? { landedHitCount: 1, targetId: 'explicit-target', targetCount: 1 } : {}) } };
}

test('Intro nominal Windstrings comes once from a cast, never from its two damage components', () => {
  const result = evaluate(input());
  assert.equal(result.nominalGain, 20);
  assert.equal(result.unit, 'Windstrings');
  assert.equal(result.recipientId, 'rover-aero');
  assert.equal(result.scope, 'NOMINAL_GAIN_ONLY');
  for (const landedHitCount of [0, 1, 2]) {
    const value = input();
    assert.throws(() => evaluate({ ...value, event: { ...value.event, landedHitCount } }), /per cast/);
  }
  assert.equal(Object.hasOwn(result, 'poolAfter'), false);
});

test('each exact single-hit Cloudburst stage requires a landed hit; no cast or all-hits default', () => {
  for (const stage of [1, 2]) {
    const value = input(stage);
    assert.equal(evaluate(value).nominalGain, 25);
    assert.equal(evaluate({ ...value, event: { ...value.event, landedHitCount: 0 } }).nominalGain, 0);
    for (const count of [undefined, 2, -1, 0.5, NaN, Infinity]) {
      assert.throws(() => evaluate({ ...value, event: { ...value.event, landedHitCount: count } }), /zero\/one/);
    }
    assert.throws(() => evaluate({ ...value, event: { ...value.event, targetId: undefined } }), /target/);
    for (const targetCount of [undefined, 0, 2, NaN]) {
      assert.throws(() => evaluate({ ...value, event: { ...value.event, targetCount } }), /single-target/);
    }
    assert.throws(() => evaluate({ ...value, event: { ...value.event, kind: 'INTRO_CAST' } }), /source-qualified/);
  }
});

test('resource source guard rejects unverified, cross-owner, incompatible or ambiguous canonical input', () => {
  const source = getCharacterMechanicFact('rover-aero-resource-windstrings')!;
  assert.equal(source.kind, 'RESOURCE');
  if (source.kind !== 'RESOURCE') throw new Error('resource required');
  assert.deepEqual(readRoverWindstringsGains(source), { cloudburstNominalGain: 25, introNominalGain: 20 });
  for (const altered of [
    { ...source, characterId: 'the-shorekeeper' },
    { ...source, factId: 'rover-aero-resource-other' },
    { ...source, verificationStatus: 'PENDING' as never },
    { ...source, modelingStatus: 'PENDING_INTERPRETATION' as const },
    { ...source, maxValue: null },
    { ...source, ruleSummary: source.ruleSummary.replace('on hit', 'on cast') },
    { ...source, ruleSummary: source.ruleSummary.replace('Intro restores 20', 'Intro restores 999') },
    { ...source, provenance: { ...source.provenance, checkedAt: '2026-09-12' } },
    { ...source, provenance: { ...source.provenance, sourceUrls: [] } },
  ]) assert.throws(() => readRoverWindstringsGains(altered));
});

test('wrong actor, unknown occurrence/time, unsupported action and unsupported sequence fail closed', () => {
  const value = input();
  for (const altered of [
    { ...value, characterId: 'cartethyia' }, { ...value, resourceFactId: 'concerto' },
    { ...value, actionFactId: 'rover-aero-resource-windstrings' },
    { ...value, sequence: 1 }, { ...value, sequence: 2 }, { ...value, maxSkills: false },
    { ...value, event: { ...value.event, actorId: 'cartethyia' } },
    { ...value, event: { ...value.event, sourceQualified: false as never } },
    ...[NaN, Infinity, -1].map(atSeconds => ({ ...value, event: { ...value.event, atSeconds } })),
  ]) assert.throws(() => evaluate(altered));
});

test('database exposes four identity-only resource bindings for the existing Rover profile without promoting execution', () => {
  const database = buildCharacterDatabase();
  assert.equal(database.resourceGainSupport.length, 4);
  for (const binding of database.resourceGainSupport) {
    assert.ok(database.mechanicsFacts.some(f => f.factId === binding.actionFactId));
    const resource = database.mechanicsFacts.find(f => f.factId === binding.resourceFactId)!;
    assert.equal(resource.modelingStatus, 'RAW_ONLY');
    assert.equal(Object.hasOwn(binding, 'nominalGain'), false);
    assert.equal(Object.hasOwn(binding, 'maxValue'), false);
  }
  const preset = database.profiles.presets.find(p => p.id === 'rover-aero-cartethyia-ciaccona')!;
  const rotation = database.profiles.rotations.find(r => r.id === preset.rotationProfileId)!;
  assert.equal(rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(rotation.rotationSeconds, undefined);
  database.resourceGainSupport[0].characterId = 'mutated';
  assert.equal(buildCharacterDatabase().resourceGainSupport[0].characterId, 'rover-aero');
  assert.equal(database.referenceTeam01.unresolvedDependencies.length, 6);
  assert.deepEqual(database.characters.filter(c => c.readiness?.disposition === 'DPS_READY').map(c => c.id).sort(), ['augusta', 'ciaccona']);
});

test('current canonical Cartethyia Inherent source contract is accepted and keeps exact pinned 25 Windstrings truth', async () => {
  const fact = getCharacterMechanicFact(CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.factId)!;
  assert.equal(readCartethyiaWindstringsGain(fact), 25);

  const source = JSON.parse(await readFile('data/source/character-forte-ui.json', 'utf8'));
  assert.equal(source.provenance.characters.repository, CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.pinnedSkillsForteSource.repository);
  assert.equal(source.provenance.characters.commit, CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.pinnedSkillsForteSource.commit);
  assert.equal(source.provenance.characters.path, CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.pinnedSkillsForteSource.path);
  const sourceCharacter = source.characters.find((character: { characterId: string }) =>
    character.characterId === CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.sourceIdentity.characterId);
  assert.equal(sourceCharacter?.sourceId, CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.sourceIdentity.sourceCharacterId);
  const sourceMove = sourceCharacter?.moves.find((move: { id: number }) =>
    move.id === CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.sourceIdentity.moveId);
  assert.equal(sourceMove?.type, CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.sourceIdentity.moveType);
  assert.equal(sourceMove?.name, CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.sourceIdentity.moveName);
  assert.equal(sourceMove?.description, CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.sourceIdentity.description);
  assert.deepEqual(sourceMove?.descriptionParams, CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.sourceIdentity.descriptionParams);
  assert.equal(CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.omegaStormWindstringsGain, 25);
});

test('Cartethyia Windstrings source identity, provenance and semantics fail closed under drift', () => {
  const fact = getCharacterMechanicFact(CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.factId)!;
  assert.equal(fact.kind, 'PASSIVE');
  if (fact.kind !== 'PASSIVE') throw new Error('passive required');
  const provenance = CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.canonicalFactProvenance;
  const sourceIndex = fact.provenance.sourceUrls?.indexOf(provenance.sourceUrl) ?? -1;
  assert.ok(sourceIndex >= 0);
  const wrongLabels = [...fact.provenance.sourceLabels];
  wrongLabels[sourceIndex] = 'wrong source identity';

  for (const altered of [
    { ...fact, characterId: 'rover-aero' },
    { ...fact, factId: 'cartethyia-inherent-other' },
    { ...fact, name: 'Inherent Skill — Wrong Source' },
    { ...fact, section: 'FORTE_CIRCUIT' as const },
    { ...fact, scope: 'SELF' as const },
    { ...fact, triggerSummary: 'Omega Storm is cast.' },
    { ...fact, effectSummary: fact.effectSummary.replace('25 Windstrings', '30 Windstrings') },
    { ...fact, effectSummary: fact.effectSummary.replace('Omega Storm', 'Cloudburst Dance') },
    { ...fact, provenance: { ...fact.provenance, checkedAt: '2026-09-12' } },
    { ...fact, provenance: { ...fact.provenance, sourceUrls: (fact.provenance.sourceUrls ?? []).filter((url) => url !== provenance.sourceUrl) } },
    { ...fact, provenance: { ...fact.provenance, sourceLabels: wrongLabels } },
  ]) assert.throws(() => readCartethyiaWindstringsGain(altered), /Unsupported Cartethyia Windstrings source/);
});

test('character database accepts the current Cartethyia Windstrings contract without changing readiness', () => {
  assert.doesNotThrow(() => buildCharacterDatabase());
  const database = buildCharacterDatabase();
  const omega = database.resourceGainSupport.find((binding) =>
    binding.actionFactId === 'rover-aero-resonance-liberation-omega-storm-skill-dmg');
  assert.equal(omega?.requiredTeamSourceFactId, CARTETHYIA_WINDSTRINGS_SOURCE_CONTRACT.factId);
  assert.deepEqual(database.characters.filter(c => c.readiness?.disposition === 'DPS_READY').map(c => c.id).sort(), ['augusta', 'ciaccona']);
});

test('Omega Storm requires the actual Cartethyia team/passive and grants only Rover nominal Windstrings', () => {
  const sourceId = 'cartethyia-inherent-a-hearts-truest-wishes';
  const value = { ...input(3), teamProof: { memberCharacterIds: ['rover-aero', 'cartethyia', 'ciaccona'],
    activeSourceFactId: sourceId, sourceCharacterSequence: 0 } };
  const result = evaluate(value);
  assert.equal(result.nominalGain, 25);
  assert.equal(result.sourceFactId, sourceId);
  assert.equal(result.recipientId, 'rover-aero');
  assert.equal(Object.hasOwn(result, 'healingBonus'), false);
  assert.equal(Object.hasOwn(result, 'poolAfter'), false);
  for (const altered of [
    { ...value, teamProof: undefined },
    { ...value, teamProof: { ...value.teamProof, activeSourceFactId: 'unknown' } },
    { ...value, teamProof: { ...value.teamProof, sourceCharacterSequence: 1 } },
    ...[['rover-aero'], ['cartethyia'], ['rover-aero', 'cartethyia', 'unknown'], ['rover-aero', 'cartethyia', 'cartethyia']]
      .map(memberCharacterIds => ({ ...value, teamProof: { ...value.teamProof, memberCharacterIds } })),
    { ...value, event: { ...value.event, actorId: 'cartethyia' } },
    { ...value, event: { ...value.event, landedHitCount: 1 } },
  ]) assert.throws(() => evaluate(altered));
  const fact = getCharacterMechanicFact(sourceId)!;
  assert.equal(fact.kind, 'PASSIVE');
  if (fact.kind !== 'PASSIVE') throw new Error('passive required');
  for (const altered of [
    { ...fact, scope: 'SELF' as const },
    { ...fact, effectSummary: fact.effectSummary.replace('Omega Storm', 'Cloudburst Dance') },
    { ...fact, effectSummary: fact.effectSummary.replace('25 Windstrings', 'unknown Windstrings') },
    { ...fact, provenance: { ...fact.provenance, sourceUrls: [] } },
  ]) assert.throws(() => readCartethyiaWindstringsGain(altered));
});
