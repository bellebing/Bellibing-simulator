import assert from 'node:assert/strict';
import test from 'node:test';

import { FLEURDELYS_CHARACTER_RESTRICTION_REVIEW } from '../src/data/echoCharacterRestrictedEffects.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import {
  applyProfileExecutionDependencyClosures,
  PROFILE_EXECUTION_DEPENDENCY_CLOSURES_20260830,
} from '../src/data/profileExecutionClosures20260830.ts';
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
      ['ciaccona', 'ciaccona-cartethyia-aero', '2026-08-29', 'REVIEWED_NO_BLOCKING_PROFILE_CHANGE'],
      ['rover-aero', 'rover-aero-cartethyia-ciaccona', '2026-08-29', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['iuno', 'iuno-augusta-hybrid', '2026-08-29', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['the-shorekeeper', 'shorekeeper-augusta-support', '2026-08-29', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['zhezhi', 'zhezhi-empyrean-endgame', '2026-08-29', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['zhezhi', 'zhezhi-moonlit-fallback', '2026-08-29', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['denia', 'denia-fusion-burst-aemeath', '2026-08-29', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['denia', 'denia-tune-strain-luuk', '2026-08-29', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['lumi', 'lumi-hybrid', '2026-08-30', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['yinlin', 'yinlin-moonlit', '2026-08-30', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['calcharo', 'calcharo-standard', '2026-08-30', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['cantarella', 'cantarella-standard', '2026-08-30', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['carlotta', 'carlotta-standard', '2026-08-30', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['changli', 'changli-standard', '2026-08-30', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['chisa', 'chisa-standard', '2026-08-30', 'REVIEWED_WITH_PENDING_EXECUTION'],
      ['rover-havoc', 'rover-havoc-standard', '2026-08-31', 'REVIEWED_WITH_PENDING_EXECUTION'],
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
  const expectedByProfile = new Map<string, readonly string[]>([
    ['augusta-standard-weapons', ['TFD-ATK', 'TFD-DEF', 'TFD-HEAVY']],
    ['aalto-hybrid-jiyan-weapons', ['STM-ER', 'STM-NEXT-ATK']],
    ['cartethyia-aero-erosion-weapons', ['DT-AERO-AMP', 'DT-DEF', 'DT-HP']],
    ['ciaccona-cartethyia-aero-weapons', ['WA-AERO', 'WA-AERO-RES', 'WA-ATK']],
    ['rover-aero-cartethyia-ciaccona-weapons', ['BPP-SKILL', 'BPP-TEAM-AERO']],
    ['iuno-augusta-hybrid-weapons', ['MGS-ATK', 'MGS-DEF', 'MGS-LIB', 'MGS-MAX-STACK']],
    ['shorekeeper-augusta-iuno-weapons', ['SSY-CONCERTO', 'SSY-HP', 'SSY-TEAM-ATK']],
    ['zhezhi-carlotta-weapons', ['RDS-ATK', 'RDS-BASIC-STACK', 'RDS-OFFFIELD']],
    ['denia-multimode-weapons', ['FDS-ATK', 'FDS-LIB', 'FDS-TEAM']],
    ['lumi-hybrid-weapons', ['AH-ATTR', 'AH-INTRO', 'AH-SKILL']],
    ['yinlin-moonlit-weapons', ['SM-ATK', 'SM-ATTR']],
    ['calcharo-standard-weapons', ['WM-ATK', 'WM-FUSION', 'WM-LIB']],
    ['cantarella-standard-weapons', ['WS-ATK', 'WS-BASIC', 'WS-HAVOC-RES']],
    ['carlotta-standard-weapons', ['TLD-ATK', 'TLD-SKILL']],
    ['changli-standard-weapons', ['BBR-ATK', 'BBR-SKILL', 'BBR-SKILL-CAST-STACKS']],
    ['chisa-standard-weapons', ['KUMO-TEAM']],
    ['rover-havoc-standard-weapons', ['RS-ATK', 'RS-BASIC', 'RS-CONCERTO-BASIC']],
  ]);

  for (const review of PROFILE_BACKWARD_IMPACT_REVIEWS_V36) {
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

test('Cartethyia and Rover Aero reviews close only the Fleurdelys character-restriction dependency', () => {
  const pendingExecutionId = FLEURDELYS_CHARACTER_RESTRICTION_REVIEW.closesPendingExecutionId;
  const closure = PROFILE_EXECUTION_DEPENDENCY_CLOSURES_20260830[0];
  assert.ok(closure);
  assert.equal(closure.pendingExecutionId, pendingExecutionId);
  assert.deepEqual([...closure.presetIds].sort(), [
    'cartethyia-aero-erosion',
    'rover-aero-cartethyia-ciaccona',
  ]);

  for (const characterId of ['cartethyia', 'rover-aero'] as const) {
    const review = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.characterId === characterId);
    assert.ok(review);
    assert.deepEqual(review.reviewedEchoIds, ['echo-60001065']);
    assert.equal(review.pendingExecutionIds.includes(pendingExecutionId), false);
    assert.ok(review.notes.some((note) => note.includes(closure.closureId)));
    assert.ok(review.pendingExecutionIds.some((id) => id.startsWith('rotation:') && id.endsWith(':engine-model')));
  }

  assert.throws(
    () => applyProfileExecutionDependencyClosures(PROFILE_BACKWARD_IMPACT_REVIEWS_V36),
    /no longer contains echo:echo-60001065:fleurdelys-character-restriction-adapter/,
    'reapplying the exact closure must fail instead of silently hiding drift',
  );
});

test('unused active Echoes never receive fabricated execution dependencies', () => {
  const ciaccona = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.characterId === 'ciaccona');
  const changli = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.characterId === 'changli');
  assert.ok(ciaccona && changli);
  assert.deepEqual(ciaccona.reviewedEchoIds, ['echo-60001135']);
  assert.equal(ciaccona.pendingExecutionIds.some((id) => id.includes('kelpie')), false);
  assert.deepEqual(changli.reviewedEchoIds, ['echo-60000915']);
  assert.equal(changli.pendingExecutionIds.some((id) => id.startsWith('echo:')), false);
});

test('support-oriented profiles retain their selected Echo-active execution boundaries', () => {
  const byPreset = (presetId: string) => PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === presetId);
  const aalto = byPreset('aalto-hybrid-jiyan');
  const rover = byPreset('rover-aero-cartethyia-ciaccona');
  const iuno = byPreset('iuno-augusta-hybrid');
  const shorekeeper = byPreset('shorekeeper-augusta-support');
  const zhezhiMoonlit = byPreset('zhezhi-moonlit-fallback');
  const zhezhiEmpyrean = byPreset('zhezhi-empyrean-endgame');
  const deniaFusion = byPreset('denia-fusion-burst-aemeath');
  const deniaTune = byPreset('denia-tune-strain-luuk');
  const lumi = byPreset('lumi-hybrid');
  const yinlin = byPreset('yinlin-moonlit');
  const chisa = byPreset('chisa-standard');
  assert.ok(aalto && rover && iuno && shorekeeper && zhezhiMoonlit && zhezhiEmpyrean && deniaFusion && deniaTune && lumi && yinlin && chisa);

  assert.ok(aalto.pendingExecutionIds.includes('echo:echo-60000525:impermanence-heron-active-transfer-adapter'));
  assert.ok(rover.pendingExecutionIds.includes('echo:echo-60001065:active-skill-damage-adapter'));
  assert.ok(iuno.pendingExecutionIds.includes('echo:echo-60000525:impermanence-heron-active-transfer-adapter'));
  assert.ok(shorekeeper.pendingExecutionIds.includes('echo:echo-60000605:fallacy-active-skill-damage-adapter'));
  assert.ok(zhezhiMoonlit.pendingExecutionIds.includes('echo:echo-60000525:impermanence-heron-active-transfer-adapter'));
  assert.ok(zhezhiEmpyrean.pendingExecutionIds.includes('echo:echo-60001055:nightmare-lampylumen-active-skill-damage-adapter'));
  assert.ok(deniaFusion.pendingExecutionIds.includes('echo:echo-60002005:reminiscence-denia-outro-transfer-adapter'));
  assert.ok(deniaTune.pendingExecutionIds.includes('echo:echo-60001985:voidwing-moth-outro-transfer-adapter'));
  assert.ok(lumi.pendingExecutionIds.includes('echo:echo-60000525:impermanence-heron-active-transfer-adapter'));
  assert.ok(yinlin.pendingExecutionIds.includes('echo:echo-60000525:impermanence-heron-active-transfer-adapter'));
  assert.ok(chisa.pendingExecutionIds.includes('echo:echo-60000605:fallacy-active-skill-damage-adapter'));
});
