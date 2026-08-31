import assert from 'node:assert/strict';
import test from 'node:test';

import { buildOwnedBuildEchoFromCanonicalInput } from '../src/ownedBuildEchoInput.ts';

const FIVE_EXACT = [
  { name: 'CRIT Rate', value: 0.093 },
  { name: 'CRIT DMG', value: 0.21 },
  { name: 'ATK%', value: 0.116 },
  { name: 'Energy Regen', value: 0.124 },
  { name: 'Basic Attack DMG', value: 0.116 },
] as const;

test('canonical owned-build input constructs Ciaccona +25 without a Roll Assist policy', () => {
  const echo = buildOwnedBuildEchoFromCanonicalInput({
    presetId: 'ciaccona-cartethyia-aero',
    slotIndex: 0,
    level: 25,
    primaryMainStat: 'CRIT DMG',
    substats: FIVE_EXACT,
  });

  assert.equal(echo.rank, 5);
  assert.equal(echo.cost, 4);
  assert.equal(echo.level, 25);
  assert.deepEqual(echo.mainStat, { name: 'CRIT DMG', value: 0.44 });
  assert.deepEqual(echo.secondaryMainStat, { name: 'Flat ATK', value: 150 });
  assert.equal(echo.substats.length, 5);
});

test('canonical owned-build input preserves checkpoint exactness but does not invent stopping policy', () => {
  const echo = buildOwnedBuildEchoFromCanonicalInput({
    presetId: 'ciaccona-cartethyia-aero',
    slotIndex: 1,
    level: 10,
    primaryMainStat: 'Aero DMG',
    substats: FIVE_EXACT.slice(0, 2),
  });

  assert.equal(echo.cost, 3);
  assert.equal(echo.level, 10);
  assert.equal(echo.mainStat.name, 'Aero DMG');
  assert.equal(echo.substats.length, 2);
});

test('canonical owned-build input rejects non-canonical main stats and duplicate rolls', () => {
  assert.throws(
    () => buildOwnedBuildEchoFromCanonicalInput({
      presetId: 'ciaccona-cartethyia-aero',
      slotIndex: 1,
      level: 25,
      primaryMainStat: 'ATK%',
      substats: FIVE_EXACT,
    }),
    /outside canonical main-stat options/,
  );

  assert.throws(
    () => buildOwnedBuildEchoFromCanonicalInput({
      presetId: 'ciaccona-cartethyia-aero',
      slotIndex: 0,
      level: 10,
      primaryMainStat: 'CRIT Rate',
      substats: [
        { name: 'CRIT Rate', value: 0.093 },
        { name: 'CRIT Rate', value: 0.081 },
      ],
    }),
    /Duplicate Echo substat/,
  );
});
