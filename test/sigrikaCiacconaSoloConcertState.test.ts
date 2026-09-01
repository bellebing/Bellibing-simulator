import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CIACCONA_SOLO_CONCERT_EXTERNAL_STATE_CONTRACT,
  projectCiacconaSoloConcertForSigrika,
  validateCiacconaSoloConcertExternalStateContract,
} from '../src/combat/sigrikaCiacconaSoloConcertState.ts';

test('Ciaccona Solo Concert external-state contract stays source-locked and durationless', () => {
  assert.deepEqual(validateCiacconaSoloConcertExternalStateContract(), []);
  assert.deepEqual(CIACCONA_SOLO_CONCERT_EXTERNAL_STATE_CONTRACT, {
    adapterId: 'ciaccona-solo-concert-external-team-state-v1',
    sourceFactId: 'ciaccona-basic-solo-concert',
    sourceCharacterId: 'ciaccona',
    targetCharacterId: 'sigrika',
    statOrEffect: 'Aero DMG Bonus',
    value: 0.24,
    durationSeconds: null,
    stateOwner: 'EXTERNAL_CIACCONA_EXECUTION',
    requiresSameTimestampSnapshot: true,
  });
});

test('Solo Concert projects only from an explicit active Ciaccona-owned point-in-time snapshot', () => {
  assert.deepEqual(projectCiacconaSoloConcertForSigrika({
    kind: 'CIACCONA_SOLO_CONCERT_EXTERNAL_STATE',
    sourceCharacterId: 'ciaccona',
    active: true,
    observedAtSeconds: 4.25,
  }), {
    adapterId: 'ciaccona-solo-concert-external-team-state-v1',
    sourceFactId: 'ciaccona-basic-solo-concert',
    sourceCharacterId: 'ciaccona',
    targetCharacterId: 'sigrika',
    statOrEffect: 'Aero DMG Bonus',
    value: 0.24,
    observedAtSeconds: 4.25,
    extrapolatesBeyondSnapshot: false,
  });

  assert.equal(projectCiacconaSoloConcertForSigrika({
    kind: 'CIACCONA_SOLO_CONCERT_EXTERNAL_STATE',
    sourceCharacterId: 'ciaccona',
    active: false,
    observedAtSeconds: 4.25,
  }), null);

  assert.equal(projectCiacconaSoloConcertForSigrika({
    kind: 'CIACCONA_SOLO_CONCERT_EXTERNAL_STATE',
    sourceCharacterId: 'other-character',
    active: true,
    observedAtSeconds: 4.25,
  }), null);
});

test('Solo Concert projection rejects fabricated time and exposes no duration inference', () => {
  assert.throws(
    () => projectCiacconaSoloConcertForSigrika({
      kind: 'CIACCONA_SOLO_CONCERT_EXTERNAL_STATE',
      sourceCharacterId: 'ciaccona',
      active: true,
      observedAtSeconds: Number.NaN,
    }),
    /snapshot time must be a finite non-negative number/,
  );

  const projection = projectCiacconaSoloConcertForSigrika({
    kind: 'CIACCONA_SOLO_CONCERT_EXTERNAL_STATE',
    sourceCharacterId: 'ciaccona',
    active: true,
    observedAtSeconds: 9,
  });
  assert.ok(projection);
  assert.equal('expiresAtSeconds' in projection, false);
  assert.equal('durationSeconds' in projection, false);
});
