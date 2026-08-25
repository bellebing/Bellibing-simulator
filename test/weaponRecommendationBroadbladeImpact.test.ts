import assert from 'node:assert/strict';
import test from 'node:test';

import { WEAPON_RECOMMENDATION_PROFILES } from '../src/data/weaponRecommendations.ts';

test('Broadblade source-audit completion does not mutate Augusta recommendation ranking', () => {
  const profile = WEAPON_RECOMMENDATION_PROFILES.find((row) => row.id === 'augusta-standard-weapons');
  assert.ok(profile);
  assert.equal(profile.defaultWeaponId, 'thunderflare-dominion');
  assert.deepEqual(
    profile.options.map((option) => ({
      weaponId: option.weaponId,
      rank: option.rank,
      relativePerformance: option.relativePerformance,
    })),
    [
      { weaponId: 'thunderflare-dominion', rank: 1, relativePerformance: 1 },
      { weaponId: 'verdant-summit', rank: 1, relativePerformance: .903 },
      { weaponId: 'ages-of-harvest', rank: 1, relativePerformance: .804 },
      { weaponId: 'wildfire-mark', rank: 1, relativePerformance: .773 },
      { weaponId: 'radiance-cleaver', rank: 1, relativePerformance: .773 },
      { weaponId: 'kumokiri', rank: 1, relativePerformance: .772 },
      { weaponId: 'lustrous-razor', rank: 1, relativePerformance: .743 },
      { weaponId: 'aureate-zenith', rank: 5, relativePerformance: .732 },
      { weaponId: 'autumntrace', rank: 5, relativePerformance: .71 },
      { weaponId: 'waning-redshift', rank: 5, relativePerformance: .665 },
      { weaponId: 'helios-cleaver', rank: 5, relativePerformance: .639 },
      { weaponId: 'meditations-on-mercy', rank: 5, relativePerformance: .607 },
    ],
  );
});
