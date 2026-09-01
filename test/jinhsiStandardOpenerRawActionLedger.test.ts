import assert from 'node:assert/strict';
import test from 'node:test';

import {
  JINHSI_STANDARD_OPENER_RAW_ACTION_LEDGER_PRIMITIVE_ID,
  JINHSI_STANDARD_OPENER_RAW_ACTION_LEDGER_SEMANTIC_REVIEW,
  resolveJinhsiStandardOpenerRawActionLedger,
} from '../src/combat/jinhsiStandardOpenerRawActionLedger.ts';
import { JINHSI_STANDARD_OPENER_ACTION_MAP } from '../src/combat/jinhsiStandardOpenerState.ts';
import { getCharacterMechanicFact } from '../src/data/characterMechanics.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { resolveBuildPreset } from '../src/profileRegistry.ts';

const CANONICAL_STANDARD_OPENER = JINHSI_STANDARD_OPENER_ACTION_MAP.map((row) => row.sourceStep);

test('raw action ledger resolves exact Character-owned base coefficients without claiming execution', () => {
  const level1 = resolveJinhsiStandardOpenerRawActionLedger(CANONICAL_STANDARD_OPENER, 1);
  const level10 = resolveJinhsiStandardOpenerRawActionLedger(CANONICAL_STANDARD_OPENER, 10);

  assert.equal(level10.primitiveId, JINHSI_STANDARD_OPENER_RAW_ACTION_LEDGER_PRIMITIVE_ID);
  assert.equal(level10.canonicalResonanceChainSequence, 0);
  assert.equal(level10.damageFacts.length, 12);
  assert.deepEqual(level10.damageBearingSteps, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.ok(level10.totalBaseMotionValue > level1.totalBaseMotionValue);
  assert.equal(level10.additionalIncandescenceMotionValue, null);
  assert.equal(level10.resonanceChainBonusesApplied, false);
  assert.equal(level10.s2OutOfCombatRestoreAuthorized, false);
  assert.equal(level10.exactHitTimestampsKnown, false);
  assert.equal(level10.agesSkillTimedUptimeResolved, false);
  assert.equal(level10.jueContributionResolved, false);
  assert.equal(level10.exactOpenerDamageAuthorized, false);
  assert.equal(level10.engineModelAuthorized, false);

  const damageClassCounts = new Map<string, number>();
  for (const row of level10.damageFacts) {
    damageClassCounts.set(row.damageClass, (damageClassCounts.get(row.damageClass) ?? 0) + 1);
  }
  assert.deepEqual(Object.fromEntries(damageClassCounts), {
    BASIC: 4,
    SKILL: 7,
    LIBERATION: 1,
  });
});

test('Incarnation Basics preserve BASIC action identity while using SKILL damage taxonomy', () => {
  const ledger = resolveJinhsiStandardOpenerRawActionLedger(CANONICAL_STANDARD_OPENER, 10);
  const incarnationBasics = ledger.damageFacts.filter((row) => row.step >= 7 && row.step <= 10);

  assert.equal(incarnationBasics.length, 4);
  assert.ok(incarnationBasics.every((row) => row.actionKind === 'BASIC'));
  assert.ok(incarnationBasics.every((row) => row.damageClass === 'SKILL'));
});

test('Illuminous base curves are exact while conditional Incandescence motion value stays separate', () => {
  const ledger = resolveJinhsiStandardOpenerRawActionLedger(CANONICAL_STANDARD_OPENER, 10);
  const luminous = ledger.damageFacts.filter((row) => row.step === 11);

  assert.equal(luminous.length, 2);
  assert.deepEqual(luminous.map((row) => row.sourceFactId), [
    'jinhsi-forte-circuit-luminal-synthesis-illuminous-epiphany-solar-flare-dmg',
    'jinhsi-forte-circuit-luminal-synthesis-illuminous-epiphany-stella-glamor-dmg',
  ]);
  assert.ok(Math.abs(luminous[0]!.baseMotionValue - 1.1934) < 1e-12);
  assert.ok(Math.abs(luminous[1]!.baseMotionValue - 3.4792) < 1e-12);
  assert.equal(ledger.additionalIncandescenceFactId, 'jinhsi-forte-incandescence-damage-multiplier');
  assert.equal(ledger.additionalIncandescenceMotionValue, null);
});

test('sequence-zero preset excludes S2 out-of-combat Incandescence restore from the canonical opener', () => {
  const resolved = resolveBuildPreset(PROFILE_REGISTRY, 'jinhsi-standard-opener');
  assert.equal(resolved.preset.sequence, 0);

  const s2 = getCharacterMechanicFact('jinhsi-s2-chronofrost-repose');
  assert.ok(s2);
  assert.equal(s2.kind, 'SEQUENCE');
  if (s2.kind !== 'SEQUENCE') assert.fail('expected Jinhsi S2 sequence fact');
  assert.equal(s2.sequence, 2);
  assert.match(s2.effectSummary, /restores 50 Incandescence/);

  const ledger = resolveJinhsiStandardOpenerRawActionLedger(CANONICAL_STANDARD_OPENER, 10);
  assert.equal(ledger.canonicalResonanceChainSequence, resolved.preset.sequence);
  assert.equal(ledger.s2OutOfCombatRestoreAuthorized, false);
  assert.equal(ledger.resonanceChainBonusesApplied, false);
});

test('raw action ledger requires explicit skill level and exact canonical source sequence', () => {
  assert.throws(
    () => resolveJinhsiStandardOpenerRawActionLedger(CANONICAL_STANDARD_OPENER, 0),
    /skillLevel must be an integer 1-10/,
  );
  assert.throws(
    () => resolveJinhsiStandardOpenerRawActionLedger(CANONICAL_STANDARD_OPENER, 11),
    /skillLevel must be an integer 1-10/,
  );
  assert.throws(
    () => resolveJinhsiStandardOpenerRawActionLedger([
      ...CANONICAL_STANDARD_OPENER.slice(0, 4),
      'Echo: Jué',
      ...CANONICAL_STANDARD_OPENER.slice(5),
    ], 10),
    /source sequence drift at step 5/,
  );
});

test('raw action ledger semantic review closes no execution dependency', () => {
  assert.equal(JINHSI_STANDARD_OPENER_RAW_ACTION_LEDGER_SEMANTIC_REVIEW.canonicalResonanceChainSequence, 0);
  assert.equal(JINHSI_STANDARD_OPENER_RAW_ACTION_LEDGER_SEMANTIC_REVIEW.sourceBackedDamageFactCount, 12);
  assert.equal(JINHSI_STANDARD_OPENER_RAW_ACTION_LEDGER_SEMANTIC_REVIEW.skillLevelMustBeExplicit, true);
  assert.equal(JINHSI_STANDARD_OPENER_RAW_ACTION_LEDGER_SEMANTIC_REVIEW.resonanceChainBonusesAuthorized, false);
  assert.equal(JINHSI_STANDARD_OPENER_RAW_ACTION_LEDGER_SEMANTIC_REVIEW.s2OutOfCombatRestoreAuthorized, false);
  assert.deepEqual(JINHSI_STANDARD_OPENER_RAW_ACTION_LEDGER_SEMANTIC_REVIEW.closesPendingExecutionIds, []);
});
