import assert from 'node:assert/strict';
import test from 'node:test';

import {
  RANK5_PRIMARY_MAIN_STATS,
  RANK5_SECONDARY_MAIN_STATS,
  SUBSTAT_VALUE_TABLE,
  primaryMainStatValueAtLevel,
  secondaryMainStatValueAtLevel,
} from '../src/echoCore.ts';
import {
  ECHO_STATS_EDITOR_LEVELS,
  assertEchoStatsEditorSelection,
  createEchoStatsEditorSelection,
  echoStatsEditorLevelForCompleteSubstats,
  getEchoStatsEditorSecondaryMainStat,
  listEchoStatsEditorMainStatOptions,
} from '../src/echoStatEditor.ts';

for (const cost of [1, 3, 4] as const) {
  test(`Echo Stats Editor Cost ${cost} Main Stat pool comes from canonical Rank-5 source at every checkpoint`, () => {
    for (const level of ECHO_STATS_EDITOR_LEVELS) {
      const options = listEchoStatsEditorMainStatOptions(cost, level);
      assert.deepEqual(
        options.map((option) => option.name),
        RANK5_PRIMARY_MAIN_STATS[cost].map((option) => option.name),
      );
      for (const option of options) {
        assert.equal(option.value, primaryMainStatValueAtLevel(cost, option.name, level));
      }
    }
  });
}

test('Echo Stats Editor derives levels exactly from 0..5 complete substats', () => {
  assert.deepEqual(
    Array.from({ length: 6 }, (_, count) => echoStatsEditorLevelForCompleteSubstats(count)),
    [0, 5, 10, 15, 20, 25],
  );
  assert.throws(() => echoStatsEditorLevelForCompleteSubstats(-1), /complete substat count/);
  assert.throws(() => echoStatsEditorLevelForCompleteSubstats(6), /complete substat count/);
});

test('Echo Stats Editor rejects an invalid Main Stat for Cost', () => {
  const selection = createEchoStatsEditorSelection(4);
  assert.throws(
    () => assertEchoStatsEditorSelection({
      ...selection,
      mainStat: { name: 'Aero DMG', value: 0.06 },
    }),
    /Invalid 4-cost primary main stat/,
  );
});

test('Echo Stats Editor secondary Main Stat is automatic and canonical per Cost and level', () => {
  for (const cost of [1, 3, 4] as const) {
    for (const level of ECHO_STATS_EDITOR_LEVELS) {
      const secondary = getEchoStatsEditorSecondaryMainStat(cost, level);
      assert.equal(secondary.name, RANK5_SECONDARY_MAIN_STATS[cost].name);
      assert.equal(secondary.value, secondaryMainStatValueAtLevel(cost, level));
    }
  }
});

test('Echo Stats Editor recomputes main and secondary values when substat count rises or falls', () => {
  const crit = SUBSTAT_VALUE_TABLE['CRIT Rate']![0]!;
  const atk = SUBSTAT_VALUE_TABLE['ATK%']![0]!;
  const one = createEchoStatsEditorSelection(4, 'CRIT Rate', [{ name: 'CRIT Rate', value: crit }]);
  assert.equal(one.level, 5);
  assert.equal(one.mainStat.value, primaryMainStatValueAtLevel(4, 'CRIT Rate', 5));
  assert.equal(one.secondaryMainStat.value, secondaryMainStatValueAtLevel(4, 5));

  const two = createEchoStatsEditorSelection(4, 'CRIT Rate', [
    { name: 'CRIT Rate', value: crit },
    { name: 'ATK%', value: atk },
  ]);
  assert.equal(two.level, 10);
  assert.equal(two.mainStat.value, primaryMainStatValueAtLevel(4, 'CRIT Rate', 10));
  assert.equal(two.secondaryMainStat.value, secondaryMainStatValueAtLevel(4, 10));

  const lowered = createEchoStatsEditorSelection(4, 'CRIT Rate', [
    { name: 'CRIT Rate', value: crit },
  ]);
  assert.equal(lowered.level, 5);
  assert.equal(lowered.mainStat.value, one.mainStat.value);
  assert.equal(lowered.secondaryMainStat.value, one.secondaryMainStat.value);
});

test('Echo Stats Editor rejects level/substat-count mismatch', () => {
  const value = SUBSTAT_VALUE_TABLE['CRIT Rate']![0]!;
  const selection = createEchoStatsEditorSelection(4, 'CRIT Rate', [{ name: 'CRIT Rate', value }]);
  assert.throws(
    () => assertEchoStatsEditorSelection({ ...selection, level: 10 }),
    /does not match 1 complete substats/,
  );
});

test('Echo Stats Editor rejects duplicate substats', () => {
  const value = SUBSTAT_VALUE_TABLE['CRIT Rate']![0]!;
  assert.throws(
    () => createEchoStatsEditorSelection(4, undefined, [
      { name: 'CRIT Rate', value },
      { name: 'CRIT Rate', value },
    ]),
    /Duplicate Echo substat/,
  );
});

test('Echo Stats Editor rejects unsupported substat names and values', () => {
  assert.throws(
    () => createEchoStatsEditorSelection(3, undefined, [{ name: 'Made Up Stat', value: 1 }]),
    /Unknown Echo substat/,
  );
  assert.throws(
    () => createEchoStatsEditorSelection(3, undefined, [{ name: 'CRIT DMG', value: 0.999 }]),
    /not an exact verified Rank-5 roll value/,
  );
});
