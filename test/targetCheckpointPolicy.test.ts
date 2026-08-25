import assert from 'node:assert/strict';
import test from 'node:test';
import type { Echo, EchoLevel, StatRoll } from '../src/echoCore.ts';
import { AUGUSTA_RECOMMENDED_V915 } from '../src/characters/augustaRecommended.ts';
import {
  calculateExactTargetPolicyDistribution,
  evaluateTargetCheckpoint,
  type CharacterRollProfile,
} from '../src/targetCheckpointPolicy.ts';

function echo(level: Exclude<EchoLevel, 0>, substats: StatRoll[]): Echo {
  return {
    id: `augusta-policy-${level}`,
    rank: 5,
    cost: 3,
    mainStat: { name: 'Electro DMG', value: 0.3 },
    secondaryMainStat: { name: 'Flat ATK', value: 100 },
    level,
    substats,
  };
}

test('current Augusta Recommended profile preserves the V9.15 target/minimum contract', () => {
  assert.equal(AUGUSTA_RECOMMENDED_V915.requiredCoreHits, 2);
  assert.equal(AUGUSTA_RECOMMENDED_V915.requiredUsefulHits, 1);
  assert.deepEqual(AUGUSTA_RECOMMENDED_V915.targets, [
    { name: 'CRIT DMG', role: 'CORE', minimum: 0.21 },
    { name: 'CRIT Rate', role: 'CORE', minimum: 0.093 },
    { name: 'ATK%', role: 'USEFUL', minimum: 0.064 },
    { name: 'Energy Regen', role: 'USEFUL', minimum: 0.068 },
    { name: 'Heavy Attack DMG', role: 'USEFUL', minimum: 0.064 },
  ]);
  assert.deepEqual(AUGUSTA_RECOMMENDED_V915.slots, [
    { cost: 4, primaryMain: 'CRIT Rate' },
    { cost: 3, primaryMain: 'Electro DMG' },
    { cost: 3, primaryMain: 'Electro DMG' },
    { cost: 1, primaryMain: 'ATK%' },
    { cost: 1, primaryMain: 'ATK%' },
  ]);
});

test('+5 Dead opener discards while a Filler opener gets one more test', () => {
  const dead = evaluateTargetCheckpoint(
    AUGUSTA_RECOMMENDED_V915,
    echo(5, [{ name: 'Flat DEF', value: 40 }]),
  );
  const filler = evaluateTargetCheckpoint(
    AUGUSTA_RECOMMENDED_V915,
    echo(5, [{ name: 'Flat ATK', value: 40 }]),
  );

  assert.equal(dead.assessment.decision, 'DISCARD');
  assert.equal(filler.assessment.decision, 'ROLL');
});

test('exact roll quality matters: 6.3 CR is dead-ended while 9.3 CR stays alive', () => {
  const low = evaluateTargetCheckpoint(
    AUGUSTA_RECOMMENDED_V915,
    echo(5, [{ name: 'CRIT Rate', value: 0.063 }]),
  );
  const high = evaluateTargetCheckpoint(
    AUGUSTA_RECOMMENDED_V915,
    echo(5, [{ name: 'CRIT Rate', value: 0.093 }]),
  );

  assert.equal(low.assessment.decision, 'DISCARD');
  assert.equal(high.assessment.decision, 'ROLL');
  assert.deepEqual(low.state.targetMisses, ['CRIT Rate']);
  assert.deepEqual(high.state.targetHits, ['CRIT Rate']);
});

test('a strong Core opener can survive DEF at +10', () => {
  const result = evaluateTargetCheckpoint(
    AUGUSTA_RECOMMENDED_V915,
    echo(10, [
      { name: 'CRIT Rate', value: 0.093 },
      { name: 'Flat DEF', value: 40 },
    ]),
  );

  assert.equal(result.assessment.decision, 'ROLL');
  assert.equal(result.state.deadCount, 1);
  assert.equal(result.state.finalRequirementStillPossible, true);
});

test('three useful rolls can reach +20 without Core, then stop if both required Core stats cannot still fit', () => {
  const at15 = evaluateTargetCheckpoint(
    AUGUSTA_RECOMMENDED_V915,
    echo(15, [
      { name: 'ATK%', value: 0.079 },
      { name: 'Energy Regen', value: 0.084 },
      { name: 'Heavy Attack DMG', value: 0.079 },
    ]),
  );
  const at20 = evaluateTargetCheckpoint(
    AUGUSTA_RECOMMENDED_V915,
    echo(20, [
      { name: 'ATK%', value: 0.079 },
      { name: 'Energy Regen', value: 0.084 },
      { name: 'Heavy Attack DMG', value: 0.079 },
      { name: 'Flat ATK', value: 40 },
    ]),
  );

  assert.equal(at15.assessment.decision, 'ROLL');
  assert.equal(at20.assessment.decision, 'DISCARD');
});

test('+25 final target is Kept; a Core-led miss can remain Temporary', () => {
  const kept = evaluateTargetCheckpoint(
    AUGUSTA_RECOMMENDED_V915,
    echo(25, [
      { name: 'CRIT DMG', value: 0.21 },
      { name: 'CRIT Rate', value: 0.093 },
      { name: 'Heavy Attack DMG', value: 0.079 },
      { name: 'Flat ATK', value: 40 },
      { name: 'Flat DEF', value: 40 },
    ]),
  );
  const temporary = evaluateTargetCheckpoint(
    AUGUSTA_RECOMMENDED_V915,
    echo(25, [
      { name: 'CRIT Rate', value: 0.093 },
      { name: 'ATK%', value: 0.079 },
      { name: 'Heavy Attack DMG', value: 0.079 },
      { name: 'Flat ATK', value: 40 },
      { name: 'Flat DEF', value: 40 },
    ]),
  );

  assert.equal(kept.assessment.decision, 'KEEP');
  assert.equal(temporary.assessment.decision, 'TEMPORARY');
});

test('the same partial Echo can receive a different final verdict under another character/mode requirement', () => {
  const customMode: CharacterRollProfile = {
    ...AUGUSTA_RECOMMENDED_V915,
    id: 'TEST_ONLY_ONE_CORE_TWO_USEFUL',
    targetMode: 'CUSTOM',
    requiredCoreHits: 1,
    requiredUsefulHits: 2,
    provenance: 'Synthetic test-only profile proving requirement selection is data-driven; not game data.',
  };
  const candidate = echo(25, [
    { name: 'CRIT Rate', value: 0.093 },
    { name: 'ATK%', value: 0.079 },
    { name: 'Energy Regen', value: 0.084 },
    { name: 'Flat ATK', value: 40 },
    { name: 'Flat DEF', value: 40 },
  ]);

  assert.equal(evaluateTargetCheckpoint(AUGUSTA_RECOMMENDED_V915, candidate).assessment.decision, 'TEMPORARY');
  assert.equal(evaluateTargetCheckpoint(customMode, candidate).assessment.decision, 'KEEP');
});

test('profiles may define more than two Core targets and require only a subset of them', () => {
  const threeCoreProfile: CharacterRollProfile = {
    ...AUGUSTA_RECOMMENDED_V915,
    id: 'TEST_ONLY_THREE_CORE_REQUIRE_TWO',
    requiredCoreHits: 2,
    requiredUsefulHits: 1,
    targets: [
      { name: 'CRIT DMG', role: 'CORE', minimum: 0.21 },
      { name: 'CRIT Rate', role: 'CORE', minimum: 0.093 },
      { name: 'ATK%', role: 'CORE', minimum: 0.064 },
      { name: 'Energy Regen', role: 'USEFUL', minimum: 0.068 },
      { name: 'Heavy Attack DMG', role: 'USEFUL', minimum: 0.064 },
    ],
    provenance: 'Synthetic test-only profile proving Core cardinality is profile data; not game data.',
  };
  const result = evaluateTargetCheckpoint(
    threeCoreProfile,
    echo(20, [
      { name: 'CRIT Rate', value: 0.093 },
      { name: 'ATK%', value: 0.079 },
      { name: 'Energy Regen', value: 0.084 },
      { name: 'Flat ATK', value: 40 },
    ]),
  );

  assert.equal(result.state.finalRequirementSatisfied, true);
  assert.equal(result.state.finalRequirementStillPossible, true);
  assert.equal(result.assessment.decision, 'ROLL');
});

test('invalid requirement counts are rejected instead of silently becoming impossible', () => {
  const tooManyCore: CharacterRollProfile = {
    ...AUGUSTA_RECOMMENDED_V915,
    id: 'TEST_ONLY_INVALID_CORE_COUNT',
    requiredCoreHits: 3,
  };
  const tooManyUseful: CharacterRollProfile = {
    ...AUGUSTA_RECOMMENDED_V915,
    id: 'TEST_ONLY_INVALID_USEFUL_COUNT',
    requiredUsefulHits: 4,
  };

  assert.throws(
    () => evaluateTargetCheckpoint(tooManyCore, echo(5, [{ name: 'CRIT Rate', value: 0.093 }])),
    /requires 3 Core hits but defines only 2 Core targets/,
  );
  assert.throws(
    () => evaluateTargetCheckpoint(tooManyUseful, echo(5, [{ name: 'CRIT Rate', value: 0.093 }])),
    /requires 4 Useful hits but defines only 3 Useful targets/,
  );
});

test('exact dynamic distribution reproduces current V9.15 Augusta Strategy Cache', () => {
  const result = calculateExactTargetPolicyDistribution(AUGUSTA_RECOMMENDED_V915);
  const expected = {
    5: 0.4484615253846023,
    10: 0.26263845489230103,
    15: 0.06865314548811038,
    20: 0.20360825596476242,
    25: 0.016394515217918085,
  } as const;

  for (const level of [5, 10, 15, 20, 25] as const) {
    assert.ok(
      Math.abs(result.rejectionByLevel[level] - expected[level]) < 1e-12,
      `+${level} reject probability mismatch: ${result.rejectionByLevel[level]} vs ${expected[level]}`,
    );
  }
  assert.ok(Math.abs(result.acceptance - 0.0002441030523084247) < 1e-12);
  assert.ok(Math.abs(result.totalProbability - 1) < 1e-12);
});
