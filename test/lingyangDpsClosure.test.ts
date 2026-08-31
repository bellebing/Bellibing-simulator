import assert from 'node:assert/strict';
import test from 'node:test';

import { buildContextFromVerifiedPreset } from '../src/profileBuildContext.ts';
import { resolveBuildPreset } from '../src/profileRegistry.ts';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';
import { LINGYANG_ACTION_FACTS, LINGYANG_PASSIVE_FACTS, LINGYANG_RESOURCE_FACTS } from '../src/data/characterMechanics/lingyangRawFacts.ts';
import { THE_SHOREKEEPER_PASSIVE_FACTS } from '../src/data/characterMechanics/theShorekeeperRawFacts.ts';
import { ZHEZHI_PASSIVE_FACTS } from '../src/data/characterMechanics/zhezhiRawFacts.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { GAUNTLET_WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectsGauntlet.ts';

const EXPECTED_PENDING_IDS = [
  'weapon:moongazers-sigil:MGS-LIB:trigger-uptime-adapter',
  'weapon:moongazers-sigil:MGS-DEF:shield-stack-state-adapter',
  'weapon:moongazers-sigil:MGS-MAX-STACK:cross-effect-stack-override-adapter',
  'sonata:sonata-9:S09_5PC_FIELD_ATK:on-field-stack-state-adapter',
  'echo:echo-60000485:mech-abomination-cast-timeline-adapter',
  'character:lingyang:striding-lion-resource-state-adapter',
  'character:lingyang:diligent-practice-three-second-window-adapter',
  'character:lingyang:burst-combo-action-mapping-adapter',
  'team:lingyang-standard:zhezhi-incoming-state-adapter',
  'team:lingyang-standard:shorekeeper-incoming-state-adapter',
  'stat-target:lingyang-standard-stats:exact-er-gate-adapter',
  'rotation:lingyang-standard-rotation:engine-model',
] as const;

test('Lingyang canonical package and Burst Combo remain source-sequence truth', () => {
  const resolved = resolveBuildPreset(PROFILE_REGISTRY, 'lingyang-standard');
  assert.equal(resolved.weaponRecommendation.defaultWeaponId, 'moongazers-sigil');
  assert.deepEqual(resolved.echoLoadout.sonataSetIds, ['sonata-9']);
  assert.equal(resolved.echoLoadout.mainEchoId, 'echo-60000485');
  assert.deepEqual(resolved.team.members.map((row) => row.characterId), ['lingyang', 'zhezhi', 'the-shorekeeper']);
  assert.equal(resolved.rotation.id, 'lingyang-standard-rotation');
  assert.equal(resolved.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(resolved.rotation.engineModelId, undefined);
  assert.deepEqual(resolved.rotation.sourceSequence, [
    'Echo: Mech Abomination',
    'Intro',
    'Ultimate',
    'Heavy: Glorious Plunge',
    'Basic: Feral Gyrate',
    'Skill: Mountain Roamer',
    'Basic: Feral Gyrate',
    'Skill: Mountain Roamer',
    'Basic: Feral Gyrate',
    'Skill: Mountain Roamer',
    'Basic: Feral Gyrate',
    'Skill: Mountain Roamer',
    'Skill: Stormy Kicks',
    'Skill: Tail Strike',
    'Outro',
  ]);
  assert.equal(resolved.statTarget.gates.some((row) => row.stat === 'Energy Regen'), false);
});

test('Lingering Tunes facts preserve stack cadence/cap and do not invent a fixed lifetime', () => {
  const fieldAtk = SONATA_EFFECT_MODELS.find((row) => row.effectId === 'S09_5PC_FIELD_ATK')!;
  const outro = SONATA_EFFECT_MODELS.find((row) => row.effectId === 'S09_5PC_OUTRO_DMG')!;
  assert.equal(fieldAtk.sonataSetId, 'sonata-9');
  assert.equal(fieldAtk.value, 0.05);
  assert.equal(fieldAtk.stackIntervalSeconds, 1.5);
  assert.equal(fieldAtk.maxStacks, 4);
  assert.equal(fieldAtk.durationSeconds, null);
  assert.equal(fieldAtk.trigger, 'While on field');
  assert.equal(outro.value, 0.60);
  assert.equal(outro.statOrEffect, 'Outro Skill DMG Bonus');
  assert.equal(outro.appliesTo, 'SELF');
});

test('Moongazer conditional branches remain timeline/state dependencies', () => {
  const effects = GAUNTLET_WEAPON_EFFECT_CATALOG.filter((row) => row.weaponId === 'moongazers-sigil');
  assert.deepEqual(effects.map((row) => row.effectId), ['MGS-ATK', 'MGS-LIB', 'MGS-DEF', 'MGS-MAX-STACK']);
  assert.equal(effects.find((row) => row.effectId === 'MGS-ATK')?.rankValues[0], 0.12);
  assert.equal(effects.find((row) => row.effectId === 'MGS-LIB')?.durationSeconds, 15);
  assert.equal(effects.find((row) => row.effectId === 'MGS-DEF')?.maxStacks, 5);
  assert.equal(effects.find((row) => row.effectId === 'MGS-MAX-STACK')?.durationSeconds, 3);
});

test('Lingyang raw mechanics prove state rules but not an executable Striding Lion timeline', () => {
  const resource = LINGYANG_RESOURCE_FACTS.find((row) => row.factId === 'lingyang-resource-lions-spirit')!;
  const lionsVigor = LINGYANG_PASSIVE_FACTS.find((row) => row.factId === 'lingyang-liberation-lions-vigor')!;
  const stridingLion = LINGYANG_PASSIVE_FACTS.find((row) => row.factId === 'lingyang-forte-striding-lion')!;
  const diligent = LINGYANG_PASSIVE_FACTS.find((row) => row.factId === 'lingyang-inherent-diligent-practice')!;
  const feralStages = LINGYANG_ACTION_FACTS.filter((row) => row.factId.startsWith('lingyang-forte-feral-gyrate-'));
  const stormy = LINGYANG_ACTION_FACTS.find((row) => row.factId === 'lingyang-forte-stormy-kicks')!;
  const tail = LINGYANG_ACTION_FACTS.find((row) => row.factId === 'lingyang-forte-tail-strike')!;

  assert.equal(resource.maxValue, 100);
  assert.equal(lionsVigor.durationSeconds, 14);
  assert.equal(lionsVigor.modelingStatus, 'PENDING_INTERPRETATION');
  assert.equal(stridingLion.durationSeconds, null);
  assert.equal(stridingLion.modelingStatus, 'PENDING_INTERPRETATION');
  assert.equal(diligent.durationSeconds, 3);
  assert.equal(diligent.modelingStatus, 'PENDING_INTERPRETATION');
  assert.equal(feralStages.length, 2);
  assert.equal(stormy.damageClass, 'BASIC');
  assert.equal(tail.damageClass, 'BASIC');
});

test('Zhezhi and Shorekeeper canonical facts exist but remain external incoming-state owners', () => {
  const flourish = ZHEZHI_PASSIVE_FACTS.find((row) => row.factId === 'zhezhi-inherent-flourish')!;
  const carve = ZHEZHI_PASSIVE_FACTS.find((row) => row.factId === 'zhezhi-outro-carve-and-draw')!;
  const realm = THE_SHOREKEEPER_PASSIVE_FACTS.find((row) => row.factId === 'the-shorekeeper-liberation-stellarealms')!;
  const outro = THE_SHOREKEEPER_PASSIVE_FACTS.find((row) => row.factId === 'the-shorekeeper-outro-binary-butterfly')!;

  assert.equal(flourish.scope, 'NEXT_CHARACTER');
  assert.ok(flourish.effectSummary.includes('15 Resonance Energy'));
  assert.equal(carve.scope, 'NEXT_CHARACTER');
  assert.equal(carve.durationSeconds, 14);
  assert.ok(carve.effectSummary.includes('20%'));
  assert.ok(carve.effectSummary.includes('25%'));
  assert.equal(realm.scope, 'TEAM');
  assert.equal(realm.durationSeconds, 30);
  assert.equal(outro.scope, 'TEAM');
  assert.equal(outro.durationSeconds, 30);
  assert.ok(outro.effectSummary.includes('15%'));
});

test('Lingyang impact review records every current execution blocker and keeps DPS closed', () => {
  const review = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'lingyang-standard')!;
  assert.equal(review.reviewId, 'PROFILE-IMPACT-LINGYANG-2026-08-31-01');
  assert.equal(review.result, 'REVIEWED_WITH_PENDING_EXECUTION');
  assert.deepEqual(review.pendingExecutionIds, EXPECTED_PENDING_IDS);

  assert.throws(
    () => buildContextFromVerifiedPreset('lingyang-standard', []),
    /not ENGINE_MODELED/,
  );

  const readiness = auditProfileReadiness();
  const lingyang = readiness.characters.find((row) => row.characterId === 'lingyang')!;
  assert.notEqual(lingyang.disposition, 'DPS_READY');
  assert.equal(lingyang.freezeApprovalPresetIds.length, 0);
});
