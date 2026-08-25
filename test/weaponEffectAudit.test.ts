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
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffects.ts';
import { WEAPON_RECOMMENDATION_PROFILES } from '../src/data/weaponRecommendations.ts';
import { WEAPON_CATALOG, getWeaponGameData } from '../src/data/weapons.ts';

test('Version 3.6 released roster has explicit Weapon Effect coverage status for all 121 weapons', () => {
  const audit = auditWeaponEffectCoverage();

  assert.equal(WEAPON_EFFECT_ROSTER_AUDIT_V36.patch, '3.6');
  assert.equal(WEAPON_EFFECT_ROSTER_AUDIT_V36.checkedAt, '2026-08-25');
  assert.equal(audit.releasedCount, 121);
  assert.equal(audit.auditedEffectWeaponCount, 47);
  assert.equal(audit.verifiedNoCombatEffectCount, 0);
  assert.equal(audit.pendingSourceAuditCount, 74);
  assert.equal(audit.explicitCoverageCount, 121);
  assert.equal(audit.fullReleasedRosterComplete, false);
  assert.deepEqual(audit.issues, []);
  assert.equal(WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36.length, 74);
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
    weaponId: 'thunderflare-dominion',
  };
  const audit = auditWeaponEffectCoverage(WEAPON_CATALOG, [...WEAPON_EFFECT_CATALOG, syntheticEffect]);
  const overlap = audit.issues.find((issue) => issue.code === 'PENDING_OVERLAPS_EFFECT_DATA');

  assert.equal(overlap?.weaponId, 'thunderflare-dominion');
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

test('coverage lookup distinguishes audited, pending, upcoming and unknown weapons', () => {
  assert.equal(getWeaponEffectCoverageStatus('stringmaster'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('static-mist'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('solar-flame'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('boson-astrolabe'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('stellar-symphony'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('augment'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('jinzhou-keeper'), 'AUDITED_EFFECTS');
  assert.equal(getWeaponEffectCoverageStatus('glint-of-clouds'), 'PENDING_SOURCE_AUDIT');
  assert.equal(getWeaponEffectCoverageStatus('thousandfold-deliverance'), 'NOT_RELEASED');
  assert.equal(getWeaponEffectCoverageStatus('not-a-weapon'), 'UNKNOWN_WEAPON');
});