import assert from 'node:assert/strict';
import test from 'node:test';

import {
  RANK5_PRIMARY_MAIN_STATS,
  RANK5_SECONDARY_MAIN_STATS,
  SUBSTAT_VALUE_TABLE,
} from '../src/echoCore.ts';
import {
  ECHO_STATS_EDITOR_LEVEL,
  assertEchoStatsEditorSelection,
  createEchoStatsEditorSelection,
  getEchoStatsEditorSecondaryMainStat,
  listEchoStatsEditorMainStatOptions,
} from '../src/echoStatEditor.ts';

for (const cost of [1, 3, 4] as const) {
  test(`Echo Stats Editor Cost ${cost} Main Stat pool comes from canonical Rank-5 source`, () => {
    assert.deepEqual(
      listEchoStatsEditorMainStatOptions(cost).map((option) => option.name),
      RANK5_PRIMARY_MAIN_STATS[cost].map((option) => option.name),
    );
  });
}

test('Echo Stats Editor rejects an invalid Main Stat for Cost', () => {
  const selection = createEchoStatsEditorSelection(4);
  assert.throws(
    () => assertEchoStatsEditorSelection({
      ...selection,
      mainStat: { name: 'Aero DMG', value: 0.30 },
    }),
    /Invalid 4-cost primary main stat/,
  );
});

test('Echo Stats Editor secondary Main Stat is automatic and canonical per Cost', () => {
  for (const cost of [1, 3, 4] as const) {
    const secondary = getEchoStatsEditorSecondaryMainStat(cost);
    assert.equal(secondary.name, RANK5_SECONDARY_MAIN_STATS[cost].name);
    assert.equal(
      secondary.value,
      RANK5_SECONDARY_MAIN_STATS[cost].atLevel25,
      `Cost ${cost} secondary should use canonical +${ECHO_STATS_EDITOR_LEVEL} value`,
    );
  }
});

test('Echo Stats Editor rejects duplicate substats', () => {
  const selection = createEchoStatsEditorSelection(4);
  const value = SUBSTAT_VALUE_TABLE['CRIT Rate']![0]!;
  assert.throws(
    () => assertEchoStatsEditorSelection({
      ...selection,
      substats: [
        { name: 'CRIT Rate', value },
        { name: 'CRIT Rate', value },
      ],
    }),
    /Duplicate Echo substat/,
  );
});

test('Echo Stats Editor rejects unsupported substat names and values', () => {
  const selection = createEchoStatsEditorSelection(3);
  assert.throws(
    () => assertEchoStatsEditorSelection({
      ...selection,
      substats: [{ name: 'Made Up Stat', value: 1 }],
    }),
    /Unknown Echo substat/,
  );
  assert.throws(
    () => assertEchoStatsEditorSelection({
      ...selection,
      substats: [{ name: 'CRIT DMG', value: 0.999 }],
    }),
    /not an exact verified Rank-5 roll value/,
  );
});
