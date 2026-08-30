import assert from 'node:assert/strict';
import test from 'node:test';

import { buildContextFromVerifiedPreset } from '../src/profileBuildContext.ts';
import { AUGUSTA_LIVE_CURRENT_ECHOES_2026_08_21 } from '../src/characters/augustaEchoEvaluator.ts';
import { CIACCONA_BASIC_ENGINE_MODEL_ID } from '../src/characters/ciacconaStandard.ts';

test('Augusta verified preset resolves to canonical executable BuildContext', () => {
  const build = buildContextFromVerifiedPreset('augusta-standard', AUGUSTA_LIVE_CURRENT_ECHOES_2026_08_21);
  assert.equal(build.characterId, 'augusta');
  assert.equal(build.sequence, 0);
  assert.deepEqual(build.weapon, { id: 'thunderflare-dominion', rank: 1 });
  assert.equal(build.teamId, 'augusta-iuno-shorekeeper');
  assert.equal(build.rotationProfileId, 'AUGUSTA_STD_V1');
  assert.equal(build.maxSkills, true);
  assert.equal(build.echoes, AUGUSTA_LIVE_CURRENT_ECHOES_2026_08_21);
});

test('Ciaccona verified preset resolves to the new executable BuildContext', () => {
  const build = buildContextFromVerifiedPreset('ciaccona-cartethyia-aero', []);
  assert.equal(build.characterId, 'ciaccona');
  assert.equal(build.sequence, 0);
  assert.deepEqual(build.weapon, { id: 'woodland-aria', rank: 1 });
  assert.equal(build.teamId, 'cartethyia-ciaccona-rover-aero');
  assert.equal(build.rotationProfileId, CIACCONA_BASIC_ENGINE_MODEL_ID);
  assert.equal(build.maxSkills, true);
  assert.deepEqual(build.echoes, []);
});

test('SOURCE_SEQUENCE_ONLY profiles cannot cross the executable bridge', () => {
  assert.throws(
    () => buildContextFromVerifiedPreset('cartethyia-aero-erosion', []),
    /not ENGINE_MODELED/,
  );
  assert.throws(
    () => buildContextFromVerifiedPreset('aemeath-standard', []),
    /not ENGINE_MODELED/,
  );
});
