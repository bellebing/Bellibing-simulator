import assert from 'node:assert/strict';
import test from 'node:test';

import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { buildContextFromVerifiedPreset } from '../src/profileBuildContext.ts';
import { resolveVerifiedProfileSelection } from '../src/verifiedProfileSelection.ts';

test('verified source-only teammate identity does not authorize personal execution', () => {
  const { resolved, defaultWeapon } = resolveVerifiedProfileSelection(PROFILE_REGISTRY, 'iuno-augusta-hybrid');
  assert.equal(resolved.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.deepEqual({ id: defaultWeapon.weaponId, rank: defaultWeapon.rank }, { id: 'moongazers-sigil', rank: 1 });
  assert.throws(() => buildContextFromVerifiedPreset('iuno-augusta-hybrid', []), /not ENGINE_MODELED/);
});

test('a verified preset cannot hide an unverified support package row', () => {
  const { resolved } = resolveVerifiedProfileSelection(PROFILE_REGISTRY, 'iuno-augusta-hybrid');
  const echoLoadouts = new Map(PROFILE_REGISTRY.echoLoadouts);
  echoLoadouts.set(resolved.echoLoadout.id, { ...resolved.echoLoadout, verificationStatus: 'PENDING' });
  assert.throws(
    () => resolveVerifiedProfileSelection({ ...PROFILE_REGISTRY, echoLoadouts }, 'iuno-augusta-hybrid'),
    /profile package row iuno-augusta-moonlit-heron is not VERIFIED/,
  );
});

test('profile selection refuses a removed default option instead of choosing another weapon', () => {
  const { resolved } = resolveVerifiedProfileSelection(PROFILE_REGISTRY, 'augusta-standard');
  const weaponRecommendations = new Map(PROFILE_REGISTRY.weaponRecommendations);
  weaponRecommendations.set(resolved.weaponRecommendation.id, {
    ...resolved.weaponRecommendation,
    options: resolved.weaponRecommendation.options.filter((row) => row.weaponId !== 'thunderflare-dominion'),
  });
  assert.throws(
    () => resolveVerifiedProfileSelection({ ...PROFILE_REGISTRY, weaponRecommendations }, 'augusta-standard'),
    /default weapon thunderflare-dominion has no recommendation option/,
  );
});
