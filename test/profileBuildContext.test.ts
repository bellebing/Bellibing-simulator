import assert from 'node:assert/strict';
import test from 'node:test';
import { buildContextFromVerifiedPreset } from '../src/profileBuildContext.ts';

test('historical executable profile metadata cannot cross an unavailable private runtime boundary', () => {
  for (const preset of ['augusta-standard','ciaccona-cartethyia-aero']) {
    assert.throws(() => buildContextFromVerifiedPreset(preset, []), /Pending: private runtime unavailable/);
  }
});
test('SOURCE_SEQUENCE_ONLY profiles cannot cross the executable bridge', () => {
  for (const preset of ['cartethyia-aero-erosion','aemeath-standard']) {
    assert.throws(() => buildContextFromVerifiedPreset(preset, []), /not ENGINE_MODELED/);
  }
});
