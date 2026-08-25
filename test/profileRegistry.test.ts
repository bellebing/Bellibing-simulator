import assert from 'node:assert/strict';
import test from 'node:test';

import { AUGUSTA_RECOMMENDED_V915 } from '../src/characters/augustaRecommended.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { PROFILE_CATALOGS, PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import {
  createProfileRegistry,
  getDefaultBuildPreset,
  listCharacterPresets,
  resolveBuildPreset,
} from '../src/profileRegistry.ts';
import type { ProfileCatalogs } from '../src/profileDomain.ts';

const testSource = {
  sourceLabels: ['test-only'],
  checkedAt: '2026-08-23',
} as const;

test('Augusta default resolves through independent bases instead of UI hardcoding', () => {
  const resolved = getDefaultBuildPreset(PROFILE_REGISTRY, 'augusta');
  assert.ok(resolved);

  assert.equal(resolved.preset.id, 'augusta-standard');
  assert.equal(resolved.weaponRecommendation.defaultWeaponId, 'thunderflare-dominion');
  assert.equal(resolved.echoLoadout.mainEchoId, 'echo-60001215');
  assert.deepEqual(resolved.echoLoadout.sonataSetIds, ['sonata-20', 'sonata-3']);
  assert.deepEqual(resolved.echoLoadout.slots.map((slot) => [slot.cost, slot.primaryMainStat]), [
    [4, 'CRIT Rate'],
    [3, 'Electro DMG'],
    [3, 'Electro DMG'],
    [1, 'ATK%'],
    [1, 'ATK%'],
  ]);
  assert.equal(resolved.statTarget.requiredCoreHits, 2);
  assert.equal(resolved.statTarget.requiredUsefulHits, 1);
  assert.deepEqual(resolved.team.members.map((member) => member.characterId), ['augusta', 'iuno', 'the-shorekeeper']);
  assert.equal(resolved.rotation.engineModelId, 'AUGUSTA_STD_V1');
  assert.equal(resolved.rotation.rotationSeconds, 11.17);
});

test('Augusta parity fixture and composable Stat Target cannot drift on the active V9.15 requirement', () => {
  const resolved = getDefaultBuildPreset(PROFILE_REGISTRY, 'augusta');
  assert.ok(resolved);

  assert.equal(resolved.statTarget.requiredCoreHits, AUGUSTA_RECOMMENDED_V915.requiredCoreHits);
  assert.equal(resolved.statTarget.requiredUsefulHits, AUGUSTA_RECOMMENDED_V915.requiredUsefulHits);
  assert.deepEqual(
    resolved.statTarget.targetRules
      .filter((rule) => rule.role === 'CORE' || rule.role === 'USEFUL')
      .map((rule) => ({ name: rule.stat, role: rule.role, minimum: rule.minimumRoll })),
    AUGUSTA_RECOMMENDED_V915.targets,
  );
});

test('raw Character data remains free of defaults/profile relationships', () => {
  const augusta = CHARACTER_CATALOG.find((row) => row.id === 'augusta');
  assert.ok(augusta);
  for (const forbidden of [
    'defaultWeaponId',
    'recommendedEchoProfileId',
    'defaultTeamProfileId',
    'defaultRotationProfileId',
    'modeKey',
  ]) {
    assert.equal(Object.hasOwn(augusta, forbidden), false, `raw Augusta leaked ${forbidden}`);
  }
});

test('a character can expose multiple selectable modes without duplicating raw Character data', () => {
  const extraPreset = {
    ...PROFILE_CATALOGS.presets[0]!,
    id: 'augusta-test-alt-mode',
    name: 'Augusta — Test Alt Mode',
    modeKey: 'test-alt',
    displayLabel: 'Test Alt',
    isDefault: false,
    verificationStatus: 'PENDING' as const,
    provenance: testSource,
  };
  const registry = createProfileRegistry({
    ...PROFILE_CATALOGS,
    presets: [...PROFILE_CATALOGS.presets, extraPreset],
  });

  const presets = listCharacterPresets(registry, 'augusta');
  assert.equal(presets.length, 2);
  assert.equal(presets[0]?.id, 'augusta-standard');
  assert.equal(presets[1]?.id, 'augusta-test-alt-mode');
  assert.equal(CHARACTER_CATALOG.filter((row) => row.id === 'augusta').length, 1);
});

test('new profiles become discoverable from registry data without editing frontend lists', () => {
  const extraPreset = {
    ...PROFILE_CATALOGS.presets[0]!,
    id: 'augusta-test-discoverable',
    name: 'Augusta — Test Discoverable',
    modeKey: 'discoverable',
    displayLabel: 'Discoverable',
    isDefault: false,
    verificationStatus: 'PENDING' as const,
    provenance: testSource,
  };
  const registry = createProfileRegistry({
    ...PROFILE_CATALOGS,
    presets: [...PROFILE_CATALOGS.presets, extraPreset],
  });

  assert.ok(listCharacterPresets(registry, 'augusta').some((row) => row.id === extraPreset.id));
  assert.equal(resolveBuildPreset(registry, extraPreset.id).preset.modeKey, 'discoverable');
});

test('dangling profile references fail during registry construction', () => {
  const brokenCatalogs: ProfileCatalogs = {
    ...PROFILE_CATALOGS,
    presets: PROFILE_CATALOGS.presets.map((preset) => ({
      ...preset,
      weaponRecommendationProfileId: 'missing-weapons',
    })),
  };

  assert.throws(() => createProfileRegistry(brokenCatalogs), /dangling profile reference/);
});

test('only one default preset is allowed per character', () => {
  const duplicateDefault = {
    ...PROFILE_CATALOGS.presets[0]!,
    id: 'augusta-second-default',
    name: 'Augusta — Second Default',
    modeKey: 'second-default',
    verificationStatus: 'PENDING' as const,
    provenance: testSource,
  };

  assert.throws(
    () => createProfileRegistry({
      ...PROFILE_CATALOGS,
      presets: [...PROFILE_CATALOGS.presets, duplicateDefault],
    }),
    /multiple default presets/,
  );
});
