import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildMornyeHealTriggeredWindows,
  createMornyeBoundednessState,
  createMornyeHighSyntonyField,
  createMornyeInterferedMarker,
  createMornyeObservationMarker,
  createMornyeOutroWindow,
  createMornyeSyntonyField,
  evaluateHaloTeamAtk,
  evaluateMornyeCriticalProtocolCrit,
  evaluateMornyeInterferedAllDamageAmplification,
  MORNYE_BLUEPRINT_RESOURCE_EVENTS,
} from '../src/combat/mornyeSupportEvents.ts';
import { MORNYE_CHARACTER_MECHANIC_FACTS } from '../src/data/characterMechanics/mornyeRawFacts.ts';
import { ECHO_ATTACK_PROFILES } from '../src/data/echoAttacks.ts';
import { ECHO_MAIN_SLOT_EFFECT_MODELS } from '../src/data/echoMainSlotEffects.ts';
import {
  MORNYE_STANDARD_EXECUTION_BLOCKERS_20260831,
  MORNYE_STANDARD_EXECUTION_REVIEW_20260831,
  MORNYE_STANDARD_SEQUENCE_20260831,
} from '../src/data/mornyeExecutionReview20260831.ts';
import {
  ECHOES,
  PRESETS,
  ROTATIONS,
  STATS,
  TEAMS,
  WEAPONS,
} from '../src/data/profileHorizontalGreenLane20260831/mornye.ts';
import { MORNYE_STANDARD_PROFILE_IMPACT_REVIEW_20260831 } from '../src/data/profileMornyeImpact20260831.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';

test('canonical Mornye package stays exact, generated and SOURCE_SEQUENCE_ONLY', () => {
  assert.equal(PRESETS[0]?.id, 'mornye-standard');
  assert.equal(WEAPONS[0]?.defaultWeaponId, 'starfield-calibrator');
  assert.equal(WEAPONS[0]?.options[0]?.rank, 1);
  assert.deepEqual(ECHOES[0]?.sonataSetIds, ['sonata-25']);
  assert.equal(ECHOES[0]?.mainEchoId, 'echo-60001905');
  assert.deepEqual(TEAMS[0]?.members.map((member) => member.characterId), ['mornye', 'lucy', 'rebecca']);
  assert.deepEqual(STATS[0]?.gates, []);
  assert.equal(ROTATIONS[0]?.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.deepEqual(ROTATIONS[0]?.sourceSequence, [...MORNYE_STANDARD_SEQUENCE_20260831]);
});

test('Mornye execution review proves 260 ER mechanic cap but fail-closes DPS', () => {
  const review = MORNYE_STANDARD_EXECUTION_REVIEW_20260831;
  assert.equal(review.disposition, 'BLOCKED');
  assert.equal(review.exactErMechanicCapPercent, 260);
  assert.equal(review.currentRotationStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.ok(review.intentionallyNotPromoted.includes('No ENGINE_MODELED rotation.'));
  assert.ok(review.intentionallyNotPromoted.includes('No DPS_READY readiness mutation.'));
  assert.deepEqual(
    MORNYE_STANDARD_EXECUTION_BLOCKERS_20260831.map((row) => row.blockerId),
    [
      'mornye-rotation-timeline',
      'mornye-critical-protocol-scaling-stat',
      'reactor-husk-active-scaling-stat',
      'starfield-calibrator-concerto-trigger',
      'starfield-calibrator-def-effect-catalog',
      'mornye-team-incoming-state',
      'mornye-syntony-first-heal-offset',
    ],
  );
});

test('current raw Critical Protocol conflict is explicit instead of silently corrected in combat code', () => {
  const critical = MORNYE_CHARACTER_MECHANIC_FACTS.find((fact) => fact.factId === 'mornye-resonance-liberation-critical-protocol-skill-dmg');
  assert.ok(critical && critical.kind === 'ACTION');
  if (!critical || critical.kind !== 'ACTION') throw new Error('Critical Protocol action fact missing');
  assert.equal(critical.scalingStat, 'ATK');
  assert.ok(MORNYE_STANDARD_EXECUTION_BLOCKERS_20260831.some((row) => row.blockerId === 'mornye-critical-protocol-scaling-stat'));
});

test('heal event activates exact Starfield R1 and Halo team windows without teammate hardcoding', () => {
  const starfield = WEAPON_EFFECT_CATALOG.find((effect) => effect.effectId === 'SC-TEAM-CD');
  const halo = SONATA_EFFECT_MODELS.find((effect) => effect.effectId === 'HALO_TEAM_ATK');
  assert.equal(starfield?.rankValues[0], 0.20);
  assert.equal(starfield?.durationSeconds, 4);
  assert.equal(starfield?.appliesTo, 'TEAM');
  assert.equal(halo?.value, 0.002);
  assert.equal(halo?.capValue, 0.25);
  assert.equal(halo?.durationSeconds, 4);
  assert.equal(halo?.appliesTo, 'TEAM');

  const [critWindow, atkWindow] = buildMornyeHealTriggeredWindows({ atSeconds: 10, offTuneBuildupRatePercent: 100 });
  assert.deepEqual(
    [critWindow.value, critWindow.startedAtSeconds, critWindow.expiresAtSeconds, critWindow.appliesTo],
    [0.20, 10, 14, 'TEAM'],
  );
  assert.deepEqual(
    [atkWindow.value, atkWindow.startedAtSeconds, atkWindow.expiresAtSeconds, atkWindow.appliesTo],
    [0.20, 10, 14, 'TEAM'],
  );
  assert.equal(JSON.stringify([critWindow, atkWindow]).includes('lucy'), false);
  assert.equal(JSON.stringify([critWindow, atkWindow]).includes('rebecca'), false);
});

test('Halo evaluator remains input-driven and respects the source cap', () => {
  assert.equal(evaluateHaloTeamAtk(0), 0);
  assert.equal(evaluateHaloTeamAtk(50), 0.10);
  assert.equal(evaluateHaloTeamAtk(100), 0.20);
  assert.equal(evaluateHaloTeamAtk(200), 0.25);
  const [, unresolved] = buildMornyeHealTriggeredWindows({ atSeconds: 3 });
  assert.equal(unresolved.value, null);
  assert.equal(unresolved.inputRequired, 'healer Off-Tune Buildup Rate percent at heal event');
});

test('Syntony and High Syntony preserve exact source lifetimes without inventing first heal phase', () => {
  const syntony = createMornyeSyntonyField(2);
  assert.equal(syntony.expiresAtSeconds, 27);
  assert.equal(syntony.nearbyTeamOffTuneBuildupRatePercent, 50);
  assert.equal(syntony.healCadenceSeconds, 3);
  assert.equal(syntony.firstHealOffsetSeconds, null);
  assert.equal(syntony.nearbyTeamDefBonus, 0);

  const high = createMornyeHighSyntonyField(7);
  assert.equal(high.expiresAtSeconds, 32);
  assert.equal(high.nearbyTeamDefBonus, 0.20);
  assert.equal(high.healingMultiplierIncrease, 0.40);
  assert.equal(high.nearbyTeamOffTuneBuildupRatePercent, 50);
  assert.equal(high.firstHealOffsetSeconds, null);
});

test('marker, ER-scaling and Outro support semantics are executable as relative events', () => {
  const observation = createMornyeObservationMarker(5);
  const interfered = createMornyeInterferedMarker(8);
  const outro = createMornyeOutroWindow(12);
  assert.equal(observation.expiresAtSeconds, 35);
  assert.equal(interfered.expiresAtSeconds, 16);
  assert.equal(outro.value, 0.25);
  assert.equal(outro.expiresAtSeconds, 42);
  assert.equal(evaluateMornyeInterferedAllDamageAmplification(100), 0);
  assert.equal(evaluateMornyeInterferedAllDamageAmplification(200), 0.25);
  assert.equal(evaluateMornyeInterferedAllDamageAmplification(260), 0.40);
  assert.deepEqual(evaluateMornyeCriticalProtocolCrit(260), { critRateBonus: 0.80, critDmgBonus: 1.60 });
});

test('Blueprint and Boundedness stay event/state based rather than permanent uptime', () => {
  assert.deepEqual(MORNYE_BLUEPRINT_RESOURCE_EVENTS.map((row) => [row.amount, row.cooldownSeconds]), [[20, 20], [20, 20]]);
  const blocked = createMornyeBoundednessState({ atSeconds: 4, sourceActionId: 'DISTRIBUTED_ARRAY', cooldownReady: false });
  assert.equal(blocked, null);
  const active = createMornyeBoundednessState({ atSeconds: 4, sourceActionId: 'DISTRIBUTED_ARRAY', cooldownReady: true });
  assert.ok(active);
  assert.equal(active.expiresAtSeconds, 64);
  assert.equal(active.acquisitionCooldownSeconds, 300);
  assert.equal(active.maxCappedHits, 3);
  assert.equal(active.cappedIncomingDamageMaxHpFraction, 0.30);
  assert.equal(active.maxFatalPreventions, 1);
  assert.equal(active.removalHealDefMultiplier, 1.50);
});

test('Reactor Husk keeps passive ER but active attack remains absent', () => {
  const er = ECHO_MAIN_SLOT_EFFECT_MODELS.find((effect) => effect.effectId === 'ECHO_60001905_ENERGY_REGEN');
  assert.equal(er?.value, 0.10);
  assert.equal(ECHO_ATTACK_PROFILES.some((profile) => profile.echoId === 'echo-60001905'), false);
});

test('Mornye backward-impact review remains pending and does not pretend global gaps are closed', () => {
  const review = MORNYE_STANDARD_PROFILE_IMPACT_REVIEW_20260831;
  assert.equal(review.result, 'REVIEWED_WITH_PENDING_EXECUTION');
  assert.deepEqual(review.reviewedWeaponEffectIds, ['SC-TEAM-CD']);
  assert.deepEqual(review.reviewedSonataSetIds, ['sonata-25']);
  assert.deepEqual(review.reviewedEchoIds, ['echo-60001905']);
  assert.ok(review.pendingExecutionIds.includes('rotation:mornye-standard-rotation:engine-model'));
  assert.ok(review.pendingExecutionIds.includes('echo:echo-60001905:reactor-husk-active-skill-damage-adapter'));
});
