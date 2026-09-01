import test from 'node:test';
import assert from 'node:assert/strict';

import { SIGRIKA_RESOURCE_STATE_CONTRACT } from '../src/combat/sigrikaResourceState.ts';
import { buildContextFromVerifiedPreset } from '../src/profileBuildContext.ts';
import { PROFILE_ADAPTER_DEPENDENCY_MATRIX } from '../src/profileAdapterDependencyMatrix.ts';
import { PROFILE_EXECUTION_WORK_QUEUE } from '../src/profileExecutionWorkQueue.ts';
import { resolveRollAssistProfileBinding } from '../src/rollAssistProfileRegistry.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import { PROFILE_FREEZE_APPROVALS } from '../src/data/profileFreezeReview.ts';
import {
  SIGRIKA_ACTION_FACTS,
  SIGRIKA_PASSIVE_FACTS,
  SIGRIKA_RESOURCE_FACTS,
} from '../src/data/characterMechanics/sigrikaRawFacts.ts';
import { ECHO_MAIN_SLOT_EFFECT_MODELS } from '../src/data/echoMainSlotEffects.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import {
  SIGRIKA_STANDARD_BACKWARD_IMPACT_REVIEW,
  SIGRIKA_STANDARD_EXECUTION_PREFLIGHT,
  SIGRIKA_STANDARD_INITIAL_PENDING_EXECUTION_IDS,
  SIGRIKA_STANDARD_PENDING_EXECUTION_IDS,
} from '../src/data/sigrikaExecutionPreflight20260901.ts';
import { GAUNTLET_WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectsGauntlet.ts';

test('sigrika-standard canonical package and source sequence remain exact and SOURCE_SEQUENCE_ONLY', () => {
  const resolved = {
    preset: PROFILE_REGISTRY.presets.get('sigrika-standard'),
    weapon: PROFILE_REGISTRY.weaponRecommendations.get('sigrika-standard-weapons'),
    echoes: PROFILE_REGISTRY.echoLoadouts.get('sigrika-standard-echoes'),
    team: PROFILE_REGISTRY.teams.get('sigrika-qiuyuan-ciaccona'),
    rotation: PROFILE_REGISTRY.rotations.get('sigrika-standard-source-sequence'),
  };

  assert.equal(resolved.preset?.verificationStatus, 'VERIFIED');
  assert.equal(resolved.weapon?.defaultWeaponId, 'solsworn-ciphers');
  assert.equal(resolved.weapon?.options.find((row) => row.weaponId === 'solsworn-ciphers')?.rank, 1);
  assert.deepEqual(resolved.echoes?.sonataSetIds, ['sonata-29']);
  assert.equal(resolved.echoes?.mainEchoId, 'echo-60001925');
  assert.deepEqual(resolved.team?.members.map((row) => row.characterId), ['sigrika', 'qiuyuan', 'ciaccona']);
  assert.equal(resolved.rotation?.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(resolved.rotation?.engineModelId, undefined);
  assert.deepEqual(resolved.rotation?.sourceSequence, SIGRIKA_STANDARD_EXECUTION_PREFLIGHT.canonicalSourceSequence);
  assert.equal(resolved.rotation?.sourceSequence.some((step) => /Double Outburst/i.test(step)), false);
});

test('Sigrika raw state remains decomposed while source-closed transitions use one event primitive', () => {
  const rune = SIGRIKA_RESOURCE_FACTS.find((row) => row.factId === 'sigrika-resource-rune');
  const fullStop = SIGRIKA_RESOURCE_FACTS.find((row) => row.factId === 'sigrika-resource-full-stop');
  const innateGift = SIGRIKA_RESOURCE_FACTS.find((row) => row.factId === 'sigrika-resource-innate-gift');
  const decipher = SIGRIKA_PASSIVE_FACTS.find((row) => row.factId === 'sigrika-basic-decipher');
  const convergent = SIGRIKA_PASSIVE_FACTS.find((row) => row.factId === 'sigrika-inherent-true-names-invoked');
  const blessing = SIGRIKA_PASSIVE_FACTS.find((row) => row.factId === 'sigrika-inherent-true-names-aligned');

  assert.equal(rune?.maxValue, 4);
  assert.match(rune?.ruleSummary ?? '', /Trust/);
  assert.match(rune?.ruleSummary ?? '', /Answer/);
  assert.match(rune?.ruleSummary ?? '', /leftmost Rune/);
  assert.equal(fullStop?.maxValue, 100);
  assert.match(fullStop?.ruleSummary ?? '', /grants 50 Full Stop/);
  assert.equal(innateGift?.maxValue, 2);
  assert.equal(decipher?.durationSeconds, 5);
  assert.equal(decipher?.modelingStatus, 'RAW_ONLY');
  assert.equal(convergent?.durationSeconds, 20);
  assert.equal(convergent?.modelingStatus, 'RAW_ONLY');
  assert.equal(blessing?.maxStacks, 6);
  assert.equal(blessing?.durationSeconds, null);
  assert.equal(blessing?.modelingStatus, 'RAW_ONLY');

  assert.equal(SIGRIKA_STANDARD_EXECUTION_PREFLIGHT.runeState.primitiveId, 'sigrika-resource-state-v1');
  assert.equal(SIGRIKA_STANDARD_EXECUTION_PREFLIGHT.runeState.creation, 'PRIMITIVE_AVAILABLE_EVENT_DRIVEN_DIRECT_HIT');
  assert.equal(SIGRIKA_STANDARD_EXECUTION_PREFLIGHT.runeState.consume, 'PRIMITIVE_AVAILABLE_EXACT_TWO_RUNE_CANONICAL_FAIL_CLOSED_GT2');
  assert.equal(SIGRIKA_STANDARD_EXECUTION_PREFLIGHT.runeState.actionEligibility, 'CANONICAL_SOURCE_CHECKPOINTS_CLOSED_GENERAL_TIMELINE_OPEN');
  assert.equal(SIGRIKA_RESOURCE_STATE_CONTRACT.rune.selectionWhenMoreThanTwoRunes, 'UNMODELED_FAIL_CLOSED');
});

test('canonical Sigrika action data exists while versioned timing evidence remains outside execution', () => {
  const factIds = new Set(SIGRIKA_ACTION_FACTS.map((row) => row.factId));
  assert.equal(factIds.has('sigrika-basic-attack-one-two-three-basic-attack-elucidated-dmg'), true);
  assert.equal(factIds.has('sigrika-forte-circuit-within-infinity-s-embrace-runic-chain-whip-dmg'), true);
  assert.equal(factIds.has('sigrika-forte-circuit-within-infinity-s-embrace-runic-outburst-dmg'), true);
  assert.equal(factIds.has('sigrika-forte-circuit-within-infinity-s-embrace-forte-circuit-learn-my-true-name-dmg'), true);
  assert.equal(factIds.has('sigrika-resonance-liberation-where-trust-leads-me-skill-dmg'), true);

  const timing = SIGRIKA_STANDARD_EXECUTION_PREFLIGHT.timing;
  assert.equal(timing.exactActionTimestamps, null);
  assert.equal(timing.exactRotationSeconds, null);
  assert.equal(timing.currentPrydwenMajorBuildCalcsPatch, '3.5');
  assert.equal(timing.currentPrydwenExposedRotationSeconds, null);
  assert.equal(timing.historicalPrydwenExactActionOrderRotationSeconds, 12.8);
  assert.equal(timing.historicalPrydwenTimingStatus, 'EXACT_FIXED_ACTION_ORDER_MATCH_STALE_MAJOR_CALCS_NOT_CURRENT_DENOMINATOR');
  assert.equal(timing.externalTestedRotationSeconds, 12.75);
  assert.equal(timing.externalTestedRotationStatus, 'EVIDENCE_ONLY_MISMATCHED_ACTION_SET_NOT_CANONICAL_DENOMINATOR');
  assert.equal(timing.denominatorStatus, 'BLOCKED_SOURCE_SEMANTICS');
  assert.match(timing.cancelPolicy, /current Prydwen marks major build\/calcs Patch 3\.5/);
  assert.match(timing.cancelPolicy, /per-action timestamps/);
});

test('Solsworn, Sound of True Name and Nameless Explorer preserve static versus event-driven semantics', () => {
  const solsworn = GAUNTLET_WEAPON_EFFECT_CATALOG.filter((row) => row.weaponId === 'solsworn-ciphers');
  const byWeaponEffectId = new Map(solsworn.map((row) => [row.effectId, row]));
  assert.equal(byWeaponEffectId.get('SCIP-ATK')?.rankValues[0], 0.12);
  assert.equal(byWeaponEffectId.get('SCIP-ATK')?.simulatorMode, 'ALWAYS');
  assert.equal(byWeaponEffectId.get('SCIP-ECHO-AMP')?.rankValues[0], 0.32);
  assert.equal(byWeaponEffectId.get('SCIP-ECHO-AMP')?.durationSeconds, 15);
  assert.equal(byWeaponEffectId.get('SCIP-ECHO-AMP')?.trigger, 'Cast Intro Skill or Echo Skill');
  assert.equal(byWeaponEffectId.get('SCIP-AERO-DEF')?.rankValues[0], 0.10);
  assert.equal(byWeaponEffectId.get('SCIP-AERO-DEF')?.durationSeconds, 6);
  assert.equal(byWeaponEffectId.get('SCIP-AERO-DEF')?.trigger, 'Deal Echo Skill DMG');

  const sound = SONATA_EFFECT_MODELS.filter((row) => row.sonataSetId === 'sonata-29');
  const bySonataEffectId = new Map(sound.map((row) => [row.effectId, row]));
  assert.equal(bySonataEffectId.get('S29_5PC_ECHO_CR')?.value, 0.20);
  assert.equal(bySonataEffectId.get('S29_5PC_ECHO_CR')?.durationSeconds, 5);
  assert.equal(bySonataEffectId.get('S29_5PC_AERO')?.value, 0.15);
  assert.equal(bySonataEffectId.get('S29_5PC_AERO')?.durationSeconds, 5);

  const nameless = ECHO_MAIN_SLOT_EFFECT_MODELS.filter((row) => row.echoId === 'echo-60001925');
  const namelessByEffectId = new Map(nameless.map((row) => [row.effectId, row]));
  assert.equal(namelessByEffectId.get('ECHO_60001925_AERO_DMG')?.value, 0.12);
  assert.equal(namelessByEffectId.get('ECHO_60001925_ECHO_SKILL_DMG')?.value, 0.20);
  assert.equal(SIGRIKA_STANDARD_EXECUTION_PREFLIGHT.equipmentExecution.namelessExplorer.rank5ActiveCoefficient, 2.736);
  assert.equal(SIGRIKA_STANDARD_EXECUTION_PREFLIGHT.equipmentExecution.namelessExplorer.canonicalActiveCastRequired, false);
  assert.match(SIGRIKA_STANDARD_EXECUTION_PREFLIGHT.equipmentExecution.namelessExplorer.activeDamage, /RANK5_COEFFICIENT_SOURCE_PROVEN/);
  assert.match(SIGRIKA_STANDARD_EXECUTION_PREFLIGHT.equipmentExecution.namelessExplorer.activeDamage, /scalingStat/);
});

test('Sigrika historical review keeps fifteen boundaries while aggregate catalog exposes ten live dependencies', () => {
  assert.equal(SIGRIKA_STANDARD_INITIAL_PENDING_EXECUTION_IDS.length, 15);
  assert.deepEqual(SIGRIKA_STANDARD_BACKWARD_IMPACT_REVIEW.pendingExecutionIds, SIGRIKA_STANDARD_INITIAL_PENDING_EXECUTION_IDS);

  const canonical = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.reviewId === SIGRIKA_STANDARD_BACKWARD_IMPACT_REVIEW.reviewId);
  assert.ok(canonical);
  assert.equal(canonical.result, 'REVIEWED_WITH_PENDING_EXECUTION');
  assert.deepEqual(canonical.pendingExecutionIds, SIGRIKA_STANDARD_PENDING_EXECUTION_IDS);

  const edges = PROFILE_ADAPTER_DEPENDENCY_MATRIX.edges.filter((row) => row.presetId === 'sigrika-standard');
  assert.equal(edges.length, 10);
  assert.deepEqual(edges.map((row) => row.pendingExecutionId), [...SIGRIKA_STANDARD_PENDING_EXECUTION_IDS]);

  const queueEdges = PROFILE_EXECUTION_WORK_QUEUE.edges.filter((row) => row.presetId === 'sigrika-standard');
  assert.equal(queueEdges.length, 10);
  assert.equal(queueEdges.filter((row) => row.semanticStatus === 'BLOCKED_SOURCE_SEMANTICS').length, 1);
  assert.equal(queueEdges.filter((row) => row.semanticStatus === 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING').length, 0);
  assert.equal(queueEdges.filter((row) => row.semanticStatus === 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE').length, 8);
  assert.equal(queueEdges.filter((row) => row.semanticStatus === 'PROFILE_SPECIFIC_EXECUTION').length, 1);
  assert.equal(queueEdges.filter((row) => row.blockerId === 'BUG-018').length, 1);
  for (const closedId of [
    'profile:sigrika-standard:energy-regen-hard-gate-adapter',
    'character:sigrika:decipher-elucidated-eligibility-adapter',
    'character:sigrika:runic-heavy-branch-selection-adapter',
    'character:sigrika:learn-my-true-name-full-stop-adapter',
    'team:ciaccona:solo-concert-aero-bonus-incoming-state-adapter',
  ]) {
    assert.equal(queueEdges.some((row) => row.pendingExecutionId === closedId), false, closedId);
  }
  assert.equal(queueEdges.some((row) => row.pendingExecutionId === 'team:qiuyuan:outro-echo-skill-amplification-incoming-state-adapter'), true);
});

test('canonical ER gate resolves while BuildContext, freeze and product routes remain fail-closed', () => {
  assert.deepEqual(SIGRIKA_STANDARD_EXECUTION_PREFLIGHT.energyRegen, {
    sourceMinimum: 1.09,
    sourcePreferred: 1.19,
    status: 'CANONICAL_TEAM_GATE_RESOLVED',
    hardGate: 1.09,
    preferredGate: 1.19,
    adapterId: 'sigrika-standard-er-gate-v1',
    reason: 'Current Prydwen explicitly maps the lower 109% estimate to Qiuyuan + Ciaccona (or Phrolova) and the higher 119% estimate to Qiuyuan + Shorekeeper. Canonical sigrika-qiuyuan-ciaccona therefore resolves the existing VERIFIED stat-target minimum to 1.09; 1.19 remains the preferred upper reference rather than a second hard minimum.',
  });
  assert.throws(
    () => buildContextFromVerifiedPreset('sigrika-standard', []),
    /rotation sigrika-standard-source-sequence is not ENGINE_MODELED/,
  );
  assert.equal(PROFILE_FREEZE_APPROVALS.some((row) => row.presetId === 'sigrika-standard'), false);
  assert.equal(resolveRollAssistProfileBinding('sigrika-standard'), null);
  assert.equal(SIGRIKA_STANDARD_EXECUTION_PREFLIGHT.dpsReady, false);
  assert.equal(SIGRIKA_STANDARD_EXECUTION_PREFLIGHT.productSupported, false);
});
