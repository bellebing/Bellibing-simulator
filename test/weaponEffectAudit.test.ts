import assert from 'node:assert/strict';
import test from 'node:test';

import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import {
  WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V36,
  WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36,
  WEAPON_EFFECT_ROSTER_AUDIT_V36,
  auditWeaponEffectCoverage,
  getWeaponEffectCoverageStatus,
} from '../src/data/weaponEffectAudit.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { WEAPON_RECOMMENDATION_PROFILES } from '../src/data/weaponRecommendations.ts';
import { WEAPON_CATALOG, getWeaponGameData } from '../src/data/weapons.ts';

test('Version 3.6 released roster has explicit Weapon Effect coverage status for all 121 weapons', () => {
  const audit = auditWeaponEffectCoverage();

  assert.equal(WEAPON_EFFECT_ROSTER_AUDIT_V36.patch, '3.6');
  assert.equal(WEAPON_EFFECT_ROSTER_AUDIT_V36.checkedAt, '2026-08-25');
  assert.equal(audit.releasedCount, 121);
  assert.equal(audit.auditedEffectWeaponCount, 95);
  assert.equal(audit.verifiedNoCombatEffectCount, 0);
  assert.equal(audit.pendingSourceAuditCount, 26);
  assert.equal(audit.explicitCoverageCount, 121);
  assert.equal(audit.fullReleasedRosterComplete, false);
  assert.deepEqual(audit.issues, []);
  assert.equal(WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36.length, 26);
});

test('future released weapon fails the effect coverage gate until its status is explicitly audited', () => {
  const glint = getWeaponGameData('glint-of-clouds');
  assert.ok(glint);

  const synthetic = {
    ...glint,
    id: 'test-only-future-effect-weapon',
    name: 'TEST ONLY — future effect weapon',
  };
  const catalog = [...WEAPON_CATALOG, synthetic];
  const audit = auditWeaponEffectCoverage(catalog, WEAPON_EFFECT_CATALOG);
  const codes = new Set(audit.issues.map((issue) => issue.code));

  assert.equal(getWeaponEffectCoverageStatus(synthetic.id, catalog, WEAPON_EFFECT_CATALOG), 'MISSING_COVERAGE_STATUS');
  assert.equal(audit.releasedCount, 122);
  assert.equal(audit.explicitCoverageCount, 121);
  assert.ok(codes.has('RELEASED_COUNT_MISMATCH'));
  assert.ok(codes.has('MISSING_COVERAGE_STATUS'));
});

test('adding audited effect data requires removing the weapon from the pending-source set', () => {
  const source = WEAPON_EFFECT_CATALOG[0];
  assert.ok(source);

  const syntheticEffect = {
    ...source,
    effectId: 'TEST-PENDING-OVERLAP',
    weaponId: 'glint-of-clouds',
  };
  const audit = auditWeaponEffectCoverage(WEAPON_CATALOG, [...WEAPON_EFFECT_CATALOG, syntheticEffect]);
  const overlap = audit.issues.find((issue) => issue.code === 'PENDING_OVERLAPS_EFFECT_DATA');

  assert.equal(overlap?.weaponId, 'glint-of-clouds');
});

function releasedCharacterIds(weaponType: string): string[] {
  return CHARACTER_CATALOG
    .filter((character) => character.releaseStatus === 'RELEASED' && character.weaponType === weaponType)
    .map((character) => character.id)
    .sort();
}

function currentProfileIds(weaponType: string): string[] {
  return WEAPON_RECOMMENDATION_PROFILES
    .filter((profile) => {
      const character = CHARACTER_CATALOG.find((row) => row.id === profile.characterId);
      return character?.weaponType === weaponType;
    })
    .map((profile) => profile.id)
    .sort();
}

function releasedWeaponIds(weaponType: string): string[] {
  return WEAPON_CATALOG
    .filter((weapon) => weapon.releaseStatus === 'RELEASED' && weapon.weaponType === weaponType)
    .map((weapon) => weapon.id)
    .sort();
}

const EXPECTED_RELEASED_PISTOL_CHARACTERS = [
  'aalto',
  'carlotta',
  'chixia',
  'ciaccona',
  'galbrena',
  'lucy',
  'lynae',
  'mortefi',
  'rebecca',
] as const;

const EXPECTED_RELEASED_RECTIFIER_CHARACTERS = [
  'baizhi',
  'buling',
  'cantarella',
  'denia',
  'encore',
  'lucilla',
  'phoebe',
  'phrolova',
  'suisui',
  'the-shorekeeper',
  'verina',
  'yinlin',
  'zhezhi',
] as const;

const EXPECTED_RELEASED_BROADBLADE_CHARACTERS = [
  'augusta',
  'calcharo',
  'chisa',
  'jinhsi',
  'jiyan',
  'lumi',
  'lupa',
  'mornye',
  'taoqi',
] as const;

const EXPECTED_RELEASED_GAUNTLET_CHARACTERS = [
  'iuno',
  'jianxin',
  'lingyang',
  'luuk-herssen',
  'roccia',
  'sigrika',
  'xiangli-yao',
  'youhu',
  'yuanwu',
  'zani',
] as const;

test('Pistol effect batch 1 has an exact roster-wide backward-impact review', () => {
  const review = WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V36.find(
    (row) => row.reviewId === 'WEAPON-EFFECT-PISTOLS-2026-08-25-01',
  );
  assert.ok(review);

  const releasedIds = releasedCharacterIds('Pistols');
  assert.deepEqual([...review.reviewedReleasedCharacterIds].sort(), releasedIds);
  assert.deepEqual(releasedIds, [...EXPECTED_RELEASED_PISTOL_CHARACTERS]);

  const profileIds = currentProfileIds('Pistols');
  assert.deepEqual(profileIds, []);
  assert.deepEqual([...review.existingWeaponRecommendationProfileIds].sort(), profileIds);
  assert.deepEqual(review.weaponIds, ['relativistic-jet', 'woodland-aria']);
  assert.equal(review.result, 'REVIEWED_NO_EXISTING_PROFILE_CHANGE');
});

test('Pistol effect batch 2 repeats the full backward-impact screen', () => {
  const review = WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V36.find(
    (row) => row.reviewId === 'WEAPON-EFFECT-PISTOLS-2026-08-25-02',
  );
  assert.ok(review);

  assert.deepEqual([...review.reviewedReleasedCharacterIds].sort(), releasedCharacterIds('Pistols'));
  assert.deepEqual([...review.existingWeaponRecommendationProfileIds].sort(), currentProfileIds('Pistols'));
  assert.equal(review.result, 'REVIEWED_NO_EXISTING_PROFILE_CHANGE');
  assert.deepEqual(review.weaponIds, [
    'cadenza',
    'pistols-of-voyager',
    'pistols-of-night',
    'guardian-pistols',
    'originite-type-iii',
    'tyro-pistols',
    'training-pistols',
    'undying-flame',
    'novaburst',
    'thunderbolt',
  ]);
});

test('Pistol effect batch 3 closes released Pistol coverage and repeats backward-impact review', () => {
  const review = WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V36.find(
    (row) => row.reviewId === 'WEAPON-EFFECT-PISTOLS-2026-08-25-03',
  );
  assert.ok(review);

  assert.deepEqual([...review.reviewedReleasedCharacterIds].sort(), releasedCharacterIds('Pistols'));
  assert.deepEqual([...review.existingWeaponRecommendationProfileIds].sort(), currentProfileIds('Pistols'));
  assert.equal(review.result, 'REVIEWED_NO_EXISTING_PROFILE_CHANGE');
  assert.deepEqual(review.weaponIds, [
    'lux-and-umbra',
    'phasic-homogenizer',
    'skull-thrasher',
    'spectral-trigger',
    'static-mist',
    'the-last-dance',
    'pistols-26',
    'romance-in-farewell',
    'solar-flame',
  ]);

  const releasedWeapons = releasedWeaponIds('Pistols');
  assert.equal(releasedWeapons.length, 22);
  for (const weaponId of releasedWeapons) {
    assert.equal(getWeaponEffectCoverageStatus(weaponId), 'AUDITED_EFFECTS', weaponId);
    assert.equal(
      (WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36 as readonly string[]).includes(weaponId),
      false,
      weaponId,
    );
  }
});

test('Rectifier effect batch 1 screens the exact released Rectifier roster without creating profiles', () => {
  const review = WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V36.find(
    (row) => row.reviewId === 'WEAPON-EFFECT-RECTIFIERS-2026-08-25-01',
  );
  assert.ok(review);

  const releasedIds = releasedCharacterIds('Rectifier');
  assert.deepEqual(releasedIds, [...EXPECTED_RELEASED_RECTIFIER_CHARACTERS]);
  assert.equal(releasedIds.length, 13);
  assert.deepEqual([...review.reviewedReleasedCharacterIds].sort(), releasedIds);
  assert.deepEqual(currentProfileIds('Rectifier'), []);
  assert.deepEqual([...review.existingWeaponRecommendationProfileIds].sort(), []);
  assert.deepEqual(review.weaponIds, [
    'boson-astrolabe',
    'cosmic-ripples',
    'firstlights-herald',
    'luminous-hymn',
    'stellar-symphony',
  ]);
  assert.equal(review.result, 'REVIEWED_NO_EXISTING_PROFILE_CHANGE');

  for (const weaponId of review.weaponIds) {
    assert.equal(getWeaponEffectCoverageStatus(weaponId), 'AUDITED_EFFECTS', weaponId);
    assert.equal(
      (WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36 as readonly string[]).includes(weaponId),
      false,
      weaponId,
    );
  }
});

test('Rectifier effect batch 2 repeats the exact released Rectifier backward-impact screen', () => {
  const review = WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V36.find(
    (row) => row.reviewId === 'WEAPON-EFFECT-RECTIFIERS-2026-08-25-02',
  );
  assert.ok(review);

  const releasedIds = releasedCharacterIds('Rectifier');
  assert.deepEqual(releasedIds, [...EXPECTED_RELEASED_RECTIFIER_CHARACTERS]);
  assert.equal(releasedIds.length, 13);
  assert.deepEqual([...review.reviewedReleasedCharacterIds].sort(), releasedIds);
  assert.deepEqual(currentProfileIds('Rectifier'), []);
  assert.deepEqual([...review.existingWeaponRecommendationProfileIds].sort(), []);
  assert.deepEqual(review.weaponIds, [
    'augment',
    'call-of-the-abyss',
    'comet-flare',
    'fusion-accretion',
    'jinzhou-keeper',
  ]);
  assert.equal(review.result, 'REVIEWED_NO_EXISTING_PROFILE_CHANGE');

  for (const weaponId of review.weaponIds) {
    assert.equal(getWeaponEffectCoverageStatus(weaponId), 'AUDITED_EFFECTS', weaponId);
    assert.equal(
      (WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36 as readonly string[]).includes(weaponId),
      false,
      weaponId,
    );
  }
});

test('Rectifier batches 3 and 4 close released Rectifier coverage with exact backward-impact screens', () => {
  const batch3 = WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V36.find(
    (row) => row.reviewId === 'WEAPON-EFFECT-RECTIFIERS-2026-08-25-03',
  );
  const batch4 = WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V36.find(
    (row) => row.reviewId === 'WEAPON-EFFECT-RECTIFIERS-2026-08-25-04',
  );
  assert.ok(batch3 && batch4);

  const releasedIds = releasedCharacterIds('Rectifier');
  assert.deepEqual(releasedIds, [...EXPECTED_RELEASED_RECTIFIER_CHARACTERS]);
  assert.deepEqual([...batch3.reviewedReleasedCharacterIds].sort(), releasedIds);
  assert.deepEqual([...batch4.reviewedReleasedCharacterIds].sort(), releasedIds);
  assert.deepEqual([...batch3.existingWeaponRecommendationProfileIds].sort(), currentProfileIds('Rectifier'));
  assert.deepEqual([...batch4.existingWeaponRecommendationProfileIds].sort(), currentProfileIds('Rectifier'));
  assert.equal(batch3.result, 'REVIEWED_NO_EXISTING_PROFILE_CHANGE');
  assert.equal(batch4.result, 'REVIEWED_NO_EXISTING_PROFILE_CHANGE');
  assert.deepEqual(batch3.weaponIds, [
    'oceans-gift',
    'radiant-dawn',
    'rectifier-25',
    'variation',
    'waltz-in-masquerade',
  ]);
  assert.deepEqual(batch4.weaponIds, [
    'guardian-rectifier',
    'originite-type-v',
    'rectifier-of-night',
    'rectifier-of-voyager',
    'tyro-rectifier',
    'training-rectifier',
  ]);

  const releasedWeapons = releasedWeaponIds('Rectifier');
  assert.equal(releasedWeapons.length, 27);
  for (const weaponId of releasedWeapons) {
    assert.equal(getWeaponEffectCoverageStatus(weaponId), 'AUDITED_EFFECTS', weaponId);
    assert.equal(
      (WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36 as readonly string[]).includes(weaponId),
      false,
      weaponId,
    );
  }
});

test('Broadblade completion closes all 23 released weapons and preserves Augusta profile relations', () => {
  const review = WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V36.find(
    (row) => row.reviewId === 'WEAPON-EFFECT-BROADBLADES-2026-08-25-01',
  );
  assert.ok(review);

  const releasedIds = releasedCharacterIds('Broadblade');
  assert.deepEqual(releasedIds, [...EXPECTED_RELEASED_BROADBLADE_CHARACTERS]);
  assert.equal(releasedIds.length, 9);
  assert.deepEqual([...review.reviewedReleasedCharacterIds].sort(), releasedIds);

  const profileIds = currentProfileIds('Broadblade');
  assert.deepEqual(profileIds, ['augusta-standard-weapons']);
  assert.deepEqual([...review.existingWeaponRecommendationProfileIds].sort(), profileIds);
  assert.equal(review.result, 'REVIEWED_NO_EXISTING_PROFILE_CHANGE');
  assert.deepEqual(review.weaponIds, [
    'radiance-cleaver',
    'thunderflare-dominion',
    'aureate-zenith',
    'broadblade-41',
    'dauntless-evernight',
    'discord',
    'meditations-on-mercy',
    'waning-redshift',
    'beguiling-melody',
    'broadblade-of-night',
    'broadblade-of-voyager',
    'guardian-broadblade',
    'originite-type-i',
    'tyro-broadblade',
    'training-broadblade',
  ]);

  const augustaProfile = WEAPON_RECOMMENDATION_PROFILES.find((profile) => profile.id === 'augusta-standard-weapons');
  assert.ok(augustaProfile);
  assert.deepEqual(
    augustaProfile.options.map((option) => [option.weaponId, option.rank, option.relativePerformance]),
    [
      ['thunderflare-dominion', 1, 1],
      ['verdant-summit', 1, .903],
      ['ages-of-harvest', 1, .804],
      ['wildfire-mark', 1, .773],
      ['radiance-cleaver', 1, .773],
      ['kumokiri', 1, .772],
      ['lustrous-razor', 1, .743],
      ['aureate-zenith', 5, .732],
      ['autumntrace', 5, .71],
      ['waning-redshift', 5, .665],
      ['helios-cleaver', 5, .639],
      ['meditations-on-mercy', 5, .607],
    ],
  );

  const releasedWeapons = releasedWeaponIds('Broadblade');
  assert.equal(releasedWeapons.length, 23);
  for (const weaponId of releasedWeapons) {
    assert.equal(getWeaponEffectCoverageStatus(weaponId), 'AUDITED_EFFECTS', weaponId);
    assert.equal(
      (WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36 as readonly string[]).includes(weaponId),
      false,
      weaponId,
    );
  }
});

test('Gauntlet completion closes all 22 released weapons and screens the exact 10-character roster', () => {
  const review = WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V36.find(
    (row) => row.reviewId === 'WEAPON-EFFECT-GAUNTLETS-2026-08-25-01',
  );
  assert.ok(review);

  const releasedIds = releasedCharacterIds('Gauntlets');
  assert.deepEqual(releasedIds, [...EXPECTED_RELEASED_GAUNTLET_CHARACTERS]);
  assert.equal(releasedIds.length, 10);
  assert.deepEqual([...review.reviewedReleasedCharacterIds].sort(), releasedIds);
  assert.deepEqual(currentProfileIds('Gauntlets'), []);
  assert.deepEqual([...review.existingWeaponRecommendationProfileIds].sort(), []);
  assert.equal(review.result, 'REVIEWED_NO_EXISTING_PROFILE_CHANGE');
  assert.deepEqual(review.weaponIds, [
    'abyss-surges',
    'blazing-justice',
    'daybreakers-spine',
    'moongazers-sigil',
    'pulsation-bracer',
    'solsworn-ciphers',
    'tragicomedy',
    'veritys-handle',
    'aether-strike',
    'amity-accord',
    'celestial-spiral',
    'gauntlets-21d',
    'hollow-mirage',
    'legend-of-drunken-hero',
    'marcato',
    'stonard',
    'gauntlets-of-night',
    'gauntlets-of-voyager',
    'guardian-gauntlets',
    'originite-type-iv',
    'tyro-gauntlets',
    'training-gauntlets',
  ]);

  const releasedWeapons = releasedWeaponIds('Gauntlets');
  assert.equal(releasedWeapons.length, 22);
  for (const weaponId of releasedWeapons) {
    assert.equal(getWeaponEffectCoverageStatus(weaponId), 'AUDITED_EFFECTS', weaponId);
    assert.equal(
      (WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36 as readonly string[]).includes(weaponId),
      false,
      weaponId,
    );
  }
});

test('coverage lookup distinguishes audited, pending, upcoming and unknown weapons', () => {
  assert.equal(getWeaponEffectCoverageStatus('stringmaster'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('static-mist'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('solar-flame'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('boson-astrolabe'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('stellar-symphony'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('augment'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('jinzhou-keeper'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('oceans-gift'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('training-rectifier'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('thunderflare-dominion'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('training-broadblade'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('abyss-surges'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('training-gauntlets'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('glint-of-clouds'), 'PENDING_SOURCE_AUDIT');
  assert.equal(getWeaponEffectCoverageStatus('thousandfold-deliverance'), 'NOT_RELEASED');
  assert.equal(getWeaponEffectCoverageStatus('not-a-weapon'), 'UNKNOWN_WEAPON');
});