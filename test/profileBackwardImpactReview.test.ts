import assert from 'node:assert/strict';
import test from 'node:test';

import { ECHO_SKILL_PENDING_ADAPTER_FACTS } from '../src/data/echoSkillSourceReview.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReview.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/weaponEffectAudit.ts';

test('historical weapon-effect reviews keep the profile snapshots that existed at review time', () => {
  for (const reviewId of [
    'WEAPON-EFFECT-PISTOLS-2026-08-25-01',
    'WEAPON-EFFECT-PISTOLS-2026-08-25-02',
    'WEAPON-EFFECT-PISTOLS-2026-08-25-03',
    'WEAPON-EFFECT-SWORDS-2026-08-26-01',
  ]) {
    const review = WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.reviewId === reviewId);
    assert.ok(review, reviewId);
    assert.deepEqual(review.existingWeaponRecommendationProfileIds, [], reviewId);
  }
});

test('current source-backed profile packages have fresh current-patch onboarding impact reviews', () => {
  assert.deepEqual(
    PROFILE_BACKWARD_IMPACT_REVIEWS_V36.map((row) => [row.characterId, row.presetId, row.checkedAt, row.result]),
    [
      ['augusta', 'augusta-standard', '2026-08-29', 'REVIEWED_NO_BLOCKING_PROFILE_CHANGE'],
      ['aalto', 'aalto-hybrid-jiyan', '2026-08-29', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['cartethyia', 'cartethyia-aero-erosion', '2026-08-29', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['ciaccona', 'ciaccona-cartethyia-aero', '2026-08-29', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['rover-aero', 'rover-aero-cartethyia-ciaccona', '2026-08-29', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['iuno', 'iuno-augusta-hybrid', '2026-08-29', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['the-shorekeeper', 'shorekeeper-augusta-support', '2026-08-29', 'REVIEWED_WITH_PENDING_EXECUTION'],
    ],
  );

  for (const review of PROFILE_BACKWARD_IMPACT_REVIEWS_V36) {
    const preset = PROFILE_CATALOGS.presets.find((row) => row.id === review.presetId);
    assert.ok(preset, review.presetId);
    assert.equal(preset.characterId, review.characterId);
    assert.equal(preset.weaponRecommendationProfileId, review.weaponRecommendationProfileId);
    assert.equal(review.patch, '3.6');
    if (review.result === 'REVIEWED_NO_BLOCKING_PROFILE_CHANGE') {
      assert.deepEqual(review.pendingExecutionIds, []);
    } else {
      assert.ok(review.pendingExecutionIds.length > 0);
    }
  }
});

test('profile onboarding reviews cover exactly the selected default weapon effect rows', () => {
  const expectedByProfile = new Map([
    ['augusta-standard-weapons', ['TFD-ATK', 'TFD-DEF', 'TFD-HEAVY']],
    ['aalto-hybrid-jiyan-weapons', ['STM-ER', 'STM-NEXT-ATK']],
    ['cartethyia-aero-erosion-weapons', ['DT-AERO-AMP', 'DT-DEF', 'DT-HP']],
    ['ciaccona-cartethyia-aero-weapons', ['WA-AERO', 'WA-AERO-RES', 'WA-ATK']],
    ['rover-aero-cartethyia-ciaccona-weapons', ['BPP-SKILL', 'BPP-TEAM-AERO']],
    ['iuno-augusta-hybrid-weapons', ['MGS-ATK', 'MGS-DEF', 'MGS-LIB', 'MGS-MAX-STACK']],
    ['shorekeeper-augusta-iuno-weapons', ['SSY-CONCERTO', 'SSY-HP', 'SSY-TEAM-ATK']],
  ]);

  for (const review of PROFILE_BACKWARD_IMACT_REVIEWS_FOR_TEST()) {
    const weaponProfile = PROFILE_CATALOGS.weaponRecommendations.find(
      (row) => row.id === review.weaponRecommendationProfileId,
    );
    assert.ok(weaponProfile, review.weaponRecommendationProfileId);
    const actualEffectIds = WEAPON_EFFECT_CATALOG
      .filter((effect) => effect.weaponId === weaponProfile.defaultWeaponId)
      .map((effect) => effect.effectId)
      .sort();
    assert.deepEqual(actualEffectIds, expectedByProfile.get(review.weaponRecommendationProfileId));
    assert.deepEqual([...review.reviewedWeaponEffectIds].sort(), actualEffectIds);
  }
});

function PROFILE_BACKWARD_IMACT_REVIEWS_FOR_TEST() {
  return PROFILE_BACKWARD_IMPACT_REVIEWS_V36;
}

test('Cartethyia and Rover Aero reviews preserve the existing Fleurdelys character-restriction adapter boundary', () => {
  for (const characterId of ['cartethyia', 'rover-aero'] as const) {
    const review = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.characterId === characterId);
    assert.ok(review);
    assert.deepEqual(review.reviewedEchoIds, ['echo-60001065']);
    assert.ok(review.pendingExecutionIds.includes('echo:echo-60001065:fleurdelys-character-restriction-adapter'));
  }

  const pending = ECHO_SKILL_PENDING_ADAPTER_FACTS.find((row) => row.echoId === 'echo-60001065');
  assert.ok(pending);
  assert.equal(pending.kind, 'CHARACTER_RESTRICTION');
  assert.match(pending.fact, /Additional 10% Aero DMG Bonus/);
});

test('Ciaccona review does not invent a Nightmare Kelpie active adapter for an unused transform', () => {
  const review = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.characterId === 'ciaccona');
  assert.ok(review);
  assert.deepEqual(review.reviewedEchoIds, ['echo-60001135']);
  assert.equal(review.pendingExecutionIds.some((id) => id.includes('kelpie')), false);
});

test('support-oriented profiles retain their selected Echo-active execution boundaries', () => {
  const aalto = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.characterId === 'aalto');
  const rover = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.characterId === 'rover-aero');
  const iuno = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.characterId === 'iuno');
  const shorekeeper = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.characterId === 'the-shorekeeper');
  assert.ok(aalto);
  assert.ok(rover);
  assert.ok(iuno);
  assert.ok(shorekeeper);

  assert.ok(aalto.pendingExecutionIds.includes('echo:echo-60000525:impermanence-heron-active-transfer-adapter'));
  assert.ok(rover.pendingExecutionIds.includes('echo:echo-60001065:active-skill-damage-adapter'));
  assert.ok(iuno.pendingExecutionIds.includes('echo:echo-60000525:impermanence-heron-active-transfer-adapter'));
  assert.ok(shorekeeper.pendingExecutionIds.includes('echo:echo-60000605:fallacy-active-skill-damage-adapter'));
});
