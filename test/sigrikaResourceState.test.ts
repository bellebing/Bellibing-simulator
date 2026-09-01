import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applySigrikaLineupChange,
  canCastSigrikaElucidated,
  canCastSigrikaLearnMyTrueName,
  castSigrikaBasicStage4,
  castSigrikaIntro,
  castSigrikaLearnMyTrueName,
  castSigrikaLiberation,
  castSigrikaOutro,
  castSigrikaSchemataOfRunes,
  createInitialSigrikaResourceState,
  gainSigrikaRuneFromDirectHit,
  getSigrikaBlessingBonuses,
  getSigrikaEnergyRegenEchoSkillBonus,
  getSigrikaInnateGiftDamageAmplification,
  registerSigrikaNearbyEchoSkillCast,
  SIGRIKA_RESOURCE_STATE_CONTRACT,
  switchSigrikaOffField,
  validateSigrikaResourceStateContract,
} from '../src/combat/sigrikaResourceState.ts';

test('Sigrika resource execution contract stays locked to current raw source anchors', () => {
  assert.deepEqual(validateSigrikaResourceStateContract(), []);
  assert.equal(SIGRIKA_RESOURCE_STATE_CONTRACT.rune.baseCapacity, 2);
  assert.equal(SIGRIKA_RESOURCE_STATE_CONTRACT.rune.expandedCapacityFullStopThreshold, 50);
  assert.equal(SIGRIKA_RESOURCE_STATE_CONTRACT.schemata.runeCost, 2);
  assert.equal(SIGRIKA_RESOURCE_STATE_CONTRACT.schemata.fullStopGain, 50);
  assert.deepEqual(SIGRIKA_RESOURCE_STATE_CONTRACT.schemata.branchByRunePair, {
    'TRUST+TRUST': 'RUNIC_CHAIN_WHIP',
    'TRUST+ANSWER': 'RUNIC_OUTBURST',
    'ANSWER+TRUST': 'RUNIC_OUTBURST',
    'ANSWER+ANSWER': 'RUNIC_SOLISKIN',
  });
  assert.equal(SIGRIKA_RESOURCE_STATE_CONTRACT.fullStop.learnMyTrueNameConsumesAll, true);
  assert.equal(SIGRIKA_RESOURCE_STATE_CONTRACT.fullStop.learnMyTrueNameCooldownSeconds, 25);
});

test('canonical source-order Rune branches are executable when a caller supplies exact event times', () => {
  let state = createInitialSigrikaResourceState();
  state = castSigrikaIntro(state, 0);
  state = castSigrikaBasicStage4(state, 1);
  assert.equal(canCastSigrikaElucidated(state, 2), true);
  state = gainSigrikaRuneFromDirectHit(state, { source: 'ELUCIDATED', atSeconds: 2 });
  assert.deepEqual(state.runes, ['TRUST', 'TRUST']);
  assert.equal(state.convergentExpiresAtSeconds, null);

  const firstHeavy = castSigrikaSchemataOfRunes(state, 3);
  assert.equal(firstHeavy.branch, 'RUNIC_CHAIN_WHIP');
  assert.deepEqual(firstHeavy.consumedRunes, ['TRUST', 'TRUST']);
  assert.equal(firstHeavy.state.fullStop, 50);
  assert.deepEqual(firstHeavy.state.runes, []);

  state = castSigrikaLiberation(firstHeavy.state, 4);
  state = castSigrikaBasicStage4(state, 5);
  state = gainSigrikaRuneFromDirectHit(state, { source: 'ELUCIDATED', atSeconds: 6 });
  assert.deepEqual(state.runes, ['TRUST', 'ANSWER']);
  assert.equal(state.divergentExpiresAtSeconds, null);

  const secondHeavy = castSigrikaSchemataOfRunes(state, 7);
  assert.equal(secondHeavy.branch, 'RUNIC_OUTBURST');
  assert.deepEqual(secondHeavy.consumedRunes, ['TRUST', 'ANSWER']);
  assert.equal(secondHeavy.state.fullStop, 100);
  assert.equal(canCastSigrikaLearnMyTrueName(secondHeavy.state, 8), true);

  const afterLearn = castSigrikaLearnMyTrueName(secondHeavy.state, 8);
  assert.equal(afterLearn.fullStop, 0);
  assert.equal(afterLearn.innateGiftStacks, 0);
  assert.equal(afterLearn.learnMyTrueNameCooldownUntilSeconds, 33);
  assert.equal(canCastSigrikaLearnMyTrueName({ ...afterLearn, fullStop: 100 }, 32.999), false);
  assert.equal(canCastSigrikaLearnMyTrueName({ ...afterLearn, fullStop: 100 }, 33), true);
});

test('Convergent expires and canonical Rune duplication is never assumed without a timestamp', () => {
  let state = castSigrikaIntro(createInitialSigrikaResourceState(), 0);
  state = castSigrikaBasicStage4(state, 20);
  state = gainSigrikaRuneFromDirectHit(state, { source: 'ELUCIDATED', atSeconds: 20 });
  assert.deepEqual(state.runes, ['TRUST']);
  assert.equal(state.convergentExpiresAtSeconds, 20);
});

test('Rune capacity expands at 50 Full Stop and left-shift overwrite stays deterministic', () => {
  let state = { ...createInitialSigrikaResourceState(), fullStop: 50 };
  state = castSigrikaBasicStage4(state, 0);
  state = gainSigrikaRuneFromDirectHit(state, { source: 'ELUCIDATED', atSeconds: 1 });
  state = castSigrikaBasicStage4(state, 2);
  state = gainSigrikaRuneFromDirectHit(state, { source: 'ELUCIDATED', atSeconds: 3 });
  state = castSigrikaBasicStage4(state, 4);
  state = gainSigrikaRuneFromDirectHit(state, { source: 'BIG_BOOMY_BOOM', atSeconds: 5 });
  state = castSigrikaBasicStage4(state, 6);
  state = gainSigrikaRuneFromDirectHit(state, { source: 'BIG_BOOMY_BOOM', atSeconds: 7 });
  assert.deepEqual(state.runes, ['TRUST', 'TRUST', 'ANSWER', 'ANSWER']);

  state = castSigrikaBasicStage4(state, 8);
  state = gainSigrikaRuneFromDirectHit(state, { source: 'ELUCIDATED', atSeconds: 9 });
  assert.deepEqual(state.runes, ['TRUST', 'ANSWER', 'ANSWER', 'TRUST']);

  assert.throws(
    () => castSigrikaSchemataOfRunes(state, 10),
    /more than two stored Runes is not source-modeled/,
  );
});

test('Soliskin Vitality keeps multiplier increase separate from damage amplification and feeds Innate Gift', () => {
  let state = createInitialSigrikaResourceState();
  state = registerSigrikaNearbyEchoSkillCast(state, 'Echo A');
  state = registerSigrikaNearbyEchoSkillCast(state, 'Echo B');
  state = registerSigrikaNearbyEchoSkillCast(state, 'Echo C');
  assert.equal(state.soliskinVitality, 30);
  assert.equal(state.blessingOfRunesStacks, 3);

  state = castSigrikaIntro(state, 0);
  state = castSigrikaBasicStage4(state, 1);
  state = gainSigrikaRuneFromDirectHit(state, { source: 'ELUCIDATED', atSeconds: 2 });
  const boosted = castSigrikaSchemataOfRunes(state, 3);
  assert.equal(boosted.consumedSoliskinVitality, 30);
  assert.equal(boosted.runicMultiplierIncrease, 0.50);
  assert.equal(boosted.runicDamageAmplification, 0);
  assert.equal(boosted.innateGiftStackGained, true);
  assert.equal(boosted.state.innateGiftStacks, 1);
  assert.equal(getSigrikaInnateGiftDamageAmplification(boosted.state), 0.30);

  let low = createInitialSigrikaResourceState();
  low = registerSigrikaNearbyEchoSkillCast(low, 'Echo A');
  low = registerSigrikaNearbyEchoSkillCast(low, 'Echo B');
  low = castSigrikaIntro(low, 0);
  low = castSigrikaBasicStage4(low, 1);
  low = gainSigrikaRuneFromDirectHit(low, { source: 'ELUCIDATED', atSeconds: 2 });
  const lowResult = castSigrikaSchemataOfRunes(low, 3);
  assert.equal(lowResult.consumedSoliskinVitality, 20);
  assert.equal(lowResult.runicMultiplierIncrease, 0);
  assert.equal(lowResult.runicDamageAmplification, 0.30);
  assert.equal(lowResult.state.innateGiftStacks, 0);
});

test('Echo-name trigger records for Soliskin Vitality and Blessing remain distinct and source-scoped', () => {
  let state = createInitialSigrikaResourceState();
  state = registerSigrikaNearbyEchoSkillCast(state, 'Nameless Explorer');
  state = registerSigrikaNearbyEchoSkillCast(state, 'Nameless Explorer');
  assert.equal(state.soliskinVitality, 10);
  assert.equal(state.blessingOfRunesStacks, 1);

  const afterOutro = castSigrikaOutro(state);
  const afterRepeatPostOutro = registerSigrikaNearbyEchoSkillCast(afterOutro, 'Nameless Explorer');
  assert.equal(afterRepeatPostOutro.soliskinVitality, 20);
  assert.equal(afterRepeatPostOutro.blessingOfRunesStacks, 1);

  const afterLineupChange = applySigrikaLineupChange(afterRepeatPostOutro);
  assert.equal(afterLineupChange.blessingOfRunesStacks, 0);
  const afterRepeatPostLineup = registerSigrikaNearbyEchoSkillCast(afterLineupChange, 'Nameless Explorer');
  assert.equal(afterRepeatPostLineup.soliskinVitality, 20);
  assert.equal(afterRepeatPostLineup.blessingOfRunesStacks, 1);
});

test('Blessing and ER conversion formulas preserve exact source caps', () => {
  let state = createInitialSigrikaResourceState();
  for (const name of ['A', 'B', 'C', 'D', 'E', 'F']) state = registerSigrikaNearbyEchoSkillCast(state, name);
  assert.equal(state.blessingOfRunesStacks, 6);
  assert.deepEqual(getSigrikaBlessingBonuses(state, 'qiuyuan'), {
    aeroDamageBonus: 0.18,
    echoSkillDamageBonus: 0.18,
  });
  assert.deepEqual(getSigrikaBlessingBonuses(state, 'sigrika'), {
    aeroDamageBonus: 0.48,
    echoSkillDamageBonus: 0.48,
  });
  assert.equal(getSigrikaEnergyRegenEchoSkillBonus(1.25), 0);
  assert.equal(getSigrikaEnergyRegenEchoSkillBonus(1.30), 0.10);
  assert.equal(getSigrikaEnergyRegenEchoSkillBonus(1.50), 0.50);
  assert.equal(getSigrikaEnergyRegenEchoSkillBonus(2.00), 0.50);
});

test('switch-out clears only source-proven Sigrika self states', () => {
  const state = {
    ...createInitialSigrikaResourceState(),
    innateGiftStacks: 2,
    decipherExpiresAtSeconds: 10,
    fullStop: 50,
    runes: ['TRUST'] as const,
  };
  const switched = switchSigrikaOffField(state);
  assert.equal(switched.innateGiftStacks, 0);
  assert.equal(switched.decipherExpiresAtSeconds, null);
  assert.equal(switched.fullStop, 50);
  assert.deepEqual(switched.runes, ['TRUST']);
});
