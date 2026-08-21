import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeOwnedEchoValue } from '../src/ownedEchoValue.ts';
import {
  AUGUSTA_LIVE_CURRENT_BUILD_2026_08_21,
  augustaStandardEchoDamageEvaluator,
} from '../src/characters/augustaEchoEvaluator.ts';

test('owned Echo value measures real rotation impact of each existing substat', () => {
  const result = analyzeOwnedEchoValue(
    AUGUSTA_LIVE_CURRENT_BUILD_2026_08_21,
    2,
    augustaStandardEchoDamageEvaluator,
  );
  const heavy = result.statImpacts.find((x) => x.stat.name === 'Heavy Attack DMG');
  assert.ok(heavy);
  assert.ok((heavy.dpsLostIfRemovedPct ?? 0) > 0.02);
});

test('ER can be valuable as a gate even when its direct DPS delta is zero', () => {
  const result = analyzeOwnedEchoValue(
    AUGUSTA_LIVE_CURRENT_BUILD_2026_08_21,
    0,
    augustaStandardEchoDamageEvaluator,
  );
  const er = result.statImpacts.find((x) => x.stat.name === 'Energy Regen');
  assert.ok(er);
  assert.equal(er.erGateWithoutStat, 'FAIL');
});
