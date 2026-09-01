import assert from 'node:assert/strict';
import test from 'node:test';

import { ECHO_ATTACK_PROFILES } from '../src/data/echoAttacks.ts';
import { totalMotionValue } from '../src/echoAttackDomain.ts';
import {
  CHIXIA_CHARACTER_MECHANIC_FACTS,
} from '../src/data/characterMechanics/chixiaRawFacts.ts';
import {
  CHIXIA_STANDARD_EXECUTION_BLOCKER_ID,
  CHIXIA_STANDARD_ROTATION_EXECUTION_REVIEW_20260831,
} from '../src/data/chixiaExecutionReview20260831.ts';
import { ECHO_EFFECT_MODELS } from '../src/data/echoEffects.ts';
import {
  ECHOES,
  PRESETS,
  ROTATIONS,
  STATS,
  TEAMS,
  WEAPONS,
} from '../src/data/profileHorizontalGreenLane20260831/chixia.ts';
import { CHIXIA_STANDARD_PROFILE_IMPACT_REVIEW_20260831 } from '../src/data/profileChixiaImpact20260831.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { PROFILE_EXECUTION_WORK_QUEUE } from '../src/profileExecutionWorkQueue.ts';

test('canonical Chixia package remains exact and source-sequence-only', () => {
  const preset = PRESETS[0]!;
  const weapon = WEAPONS[0]!;
  const echoes = ECHOES[0]!;
  const stats = STATS[0]!;
  const team = TEAMS[0]!;
  const rotation = ROTATIONS[0]!;

  assert.equal(preset.id, 'chixia-standard');
  assert.equal(preset.characterId, 'chixia');
  assert.equal(preset.sequence, 0);
  assert.equal(weapon.defaultWeaponId, 'the-last-dance');
  assert.equal(weapon.options[0]?.rank, 1);
  assert.deepEqual(echoes.sonataSetIds, ['sonata-2']);
  assert.equal(echoes.mainEchoId, 'echo-60000915');
  assert.deepEqual(team.members.map((member) => member.characterId), ['chixia', 'lupa', 'brant']);
  assert.equal(rotation.id, 'chixia-standard-rotation');
  assert.equal(rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.deepEqual(rotation.sourceSequence, [
    'Echo: Nightmare: Inferno Rider (before combo)',
    'Intro',
    'Skill: Forte: Thermobaric Bullets',
    'Skill: Forte: BOOM BOOM',
    'Ultimate',
    'Skill: Forte: Thermobaric Bullets',
    'Skill: Forte: BOOM BOOM',
    'Outro',
  ]);
  assert.deepEqual(stats.gates, []);
});

test('Chixia raw mechanics keep the execution-sensitive state facts pending', () => {
  const daka = CHIXIA_CHARACTER_MECHANIC_FACTS.find((fact) => fact.factId === 'chixia-forte-daka-daka-state');
  const spicy = CHIXIA_CHARACTER_MECHANIC_FACTS.find((fact) => fact.factId === 'chixia-inherent-numbingly-spicy');
  assert.ok(daka && spicy);
  assert.equal(daka.modelingStatus, 'PENDING_INTERPRETATION');
  assert.equal(spicy.modelingStatus, 'PENDING_INTERPRETATION');
  assert.equal(spicy.kind, 'PASSIVE');
  if (spicy.kind !== 'PASSIVE') throw new Error('Numbingly Spicy fact drifted away from PASSIVE.');
  assert.equal(spicy.durationSeconds, 10);
  assert.equal(spicy.maxStacks, 30);
});

test('Chixia selected external effects are source-backed without invented uptime', () => {
  const tldAtk = WEAPON_EFFECT_CATALOG.find((effect) => effect.effectId === 'TLD-ATK');
  const tldSkill = WEAPON_EFFECT_CATALOG.find((effect) => effect.effectId === 'TLD-SKILL');
  const molten2 = SONATA_EFFECT_MODELS.find((effect) => effect.effectId === 'S02_2PC_FUSION');
  const molten5 = SONATA_EFFECT_MODELS.find((effect) => effect.effectId === 'S02_5PC_FUSION');
  const infernoFusion = ECHO_EFFECT_MODELS.find((effect) => effect.effectId === 'ECHO_60000915_FUSION_DMG');
  const infernoSkill = ECHO_EFFECT_MODELS.find((effect) => effect.effectId === 'ECHO_60000915_RESONANCE_SKILL_DMG');

  assert.equal(tldAtk?.rankValues[0], 0.12);
  assert.equal(tldAtk?.effectType, 'PERMANENT');
  assert.equal(tldSkill?.rankValues[0], 0.48);
  assert.equal(tldSkill?.durationSeconds, 5);
  assert.equal(tldSkill?.simulatorMode, 'MANUAL');
  assert.equal(molten2?.value, 0.10);
  assert.equal(molten5?.value, 0.30);
  assert.equal(molten5?.durationSeconds, 15);
  assert.equal(infernoFusion?.value, 0.12);
  assert.equal(infernoSkill?.value, 0.12);
});

test('Nightmare Inferno Rider normal Rank-5 attack is exact data but not an assumed Chixia cast variant', () => {
  const profile = ECHO_ATTACK_PROFILES.find((row) => row.echoId === 'echo-60000915');
  assert.ok(profile);
  assert.equal(profile.rank, 5);
  assert.equal(profile.cooldownSeconds, 25);
  assert.equal(profile.attacks.length, 1);
  const attack = profile.attacks[0]!;
  assert.equal(attack.attackId, 'NIGHTMARE_INFERNO_RIDER_ACTIVE_STRIKE');
  assert.equal(attack.trigger, 'ACTIVE_CAST');
  assert.equal(attack.element, 'Fusion');
  assert.equal(attack.scalingStat, 'ATK');
  assert.deepEqual(attack.components, [{ motionValuePerHit: 4.05, hits: 1 }]);
  assert.equal(totalMotionValue(attack), 4.05);
  assert.equal(profile.attacks.some((row) => {
    const tokens = row.attackId.split('_');
    return tokens.includes('RIDING') || tokens.includes('HOLD');
  }), false);
});

test('Chixia backward-impact review exposes the exact four execution dependencies', () => {
  const review = CHIXIA_STANDARD_PROFILE_IMPACT_REVIEW_20260831;
  assert.equal(review.result, 'REVIEWED_WITH_PENDING_EXECUTION');
  assert.deepEqual(review.reviewedWeaponEffectIds, ['TLD-ATK', 'TLD-SKILL']);
  assert.deepEqual(review.reviewedSonataSetIds, ['sonata-2']);
  assert.deepEqual(review.reviewedEchoIds, ['echo-60000915']);
  assert.deepEqual(review.pendingExecutionIds, [
    'weapon:the-last-dance:TLD-SKILL:trigger-uptime-adapter',
    'sonata:sonata-2:S02_5PC_FUSION:trigger-uptime-adapter',
    'echo:echo-60000915:nightmare-inferno-rider-active-skill-damage-adapter',
    'rotation:chixia-standard-rotation:engine-model',
  ]);
});

test('Chixia execution review fail-closes the DPS denominator and cast variant', () => {
  const review = CHIXIA_STANDARD_ROTATION_EXECUTION_REVIEW_20260831;
  assert.equal(review.disposition, 'SOURCE_SEMANTICS_BLOCKED');
  assert.equal(review.blockerId, CHIXIA_STANDARD_EXECUTION_BLOCKER_ID);
  assert.equal(review.blockerId, 'BUG-022');
  assert.equal(review.rotationSeconds, null);
  assert.deepEqual(review.closesPendingExecutionIds, []);
  assert.ok(review.sourceEstablished.some((note) => note.includes('4 seconds')));
  assert.ok(review.sourceEstablished.some((note) => note.includes('30 Thermobaric Bullets')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('Personal Rotation DPS denominator')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('normal activation versus Hold/Riding Mode')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('Energy Regen')));
});

test('execution queue reuses generic windows and parks only Chixia-specific unresolved semantics', () => {
  const byPendingId = new Map(
    PROFILE_EXECUTION_WORK_QUEUE.edges
      .filter((edge) => edge.presetId === 'chixia-standard')
      .map((edge) => [edge.pendingExecutionId, edge] as const),
  );
  assert.equal(byPendingId.size, 4);

  const tld = byPendingId.get('weapon:the-last-dance:TLD-SKILL:trigger-uptime-adapter');
  assert.equal(tld?.semanticStatus, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(tld?.primitiveId, 'weapon-cast-timed-self-window-v1');

  const molten = byPendingId.get('sonata:sonata-2:S02_5PC_FUSION:trigger-uptime-adapter');
  assert.equal(molten?.semanticStatus, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(molten?.primitiveId, 'sonata-cast-timed-self-window-v1');

  const echo = byPendingId.get('echo:echo-60000915:nightmare-inferno-rider-active-skill-damage-adapter');
  assert.equal(echo?.semanticStatus, 'BLOCKED_SOURCE_SEMANTICS');
  assert.equal(echo?.blockerId, 'BUG-022');

  const rotation = byPendingId.get('rotation:chixia-standard-rotation:engine-model');
  assert.equal(rotation?.semanticStatus, 'PROFILE_SPECIFIC_EXECUTION');

  assert.equal(PROFILE_EXECUTION_WORK_QUEUE.authorizesExecution, false);
});
