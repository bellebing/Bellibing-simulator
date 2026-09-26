import assert from 'node:assert/strict';
import test from 'node:test';

import { ECHO_LOADOUT_PROFILES } from '../src/data/echoLoadoutProfiles.ts';
import {
  findVerifiedEchoWorkspaceLoadoutProfile,
  projectVerifiedEchoWorkspaceLoadoutProfiles,
} from '../src/echoWorkspaceRecommendationProjection.ts';

test('Echo Workspace recommendations are projected only from VERIFIED source-backed loadout profiles', () => {
  const expected = ECHO_LOADOUT_PROFILES
    .filter((profile) => profile.verificationStatus === 'VERIFIED')
    .map((profile) => ({
      profileId: profile.id,
      characterId: profile.characterId,
      slotCosts: profile.slots.map((slot) => slot.cost),
      sonataSetIds: [...profile.sonataSetIds],
    }));

  assert.deepEqual(projectVerifiedEchoWorkspaceLoadoutProfiles(), expected);
});

test('Augusta recommendation resolves verified 4/3/3/1/1 costs and Crown of Valor + Void Thunder', () => {
  const augusta = findVerifiedEchoWorkspaceLoadoutProfile('augusta');
  assert.ok(augusta);
  assert.equal(augusta.profileId, 'augusta-standard-echoes');
  assert.deepEqual(augusta.slotCosts, [4, 3, 3, 1, 1]);
  assert.deepEqual(augusta.sonataSetIds, ['sonata-20', 'sonata-3']);
});

test('Character without VERIFIED loadout profile receives no invented recommendation', () => {
  assert.equal(findVerifiedEchoWorkspaceLoadoutProfile('aalto'), null);
  assert.equal(findVerifiedEchoWorkspaceLoadoutProfile(''), null);
  assert.equal(findVerifiedEchoWorkspaceLoadoutProfile(null), null);
});
