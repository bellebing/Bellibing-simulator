import assert from 'node:assert/strict';
import test from 'node:test';

import type { CharacterActionFact } from '../src/characterMechanicsDomain.ts';
import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  BRANT_CHARACTER_MECHANICS_PROFILE,
  BRANT_TUNE_BREAK_FACT,
  CHARACTER_MECHANIC_FACT_BY_ID,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  BRANT_ACTION_FACTS,
  BRANT_CHARACTER_MECHANIC_FACTS,
  BRANT_PASSIVE_FACTS,
  BRANT_RESOURCE_FACTS,
  BRANT_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/brantRawFacts.ts';
import { getCharacterPreflight } from '../src/data/characterPreflight.ts';

function actionFact(factId: string): CharacterActionFact {
  const fact = BRANT_ACTION_FACTS.find((entry) => entry.factId === factId);
  assert.ok(fact, factId);
  return fact;
}

function sourceMotionValueAt(fact: CharacterActionFact, levelIndex: number): number {
  if (fact.motionValueCurve) {
    assert.ok(fact.hitCount !== null);
    return fact.motionValueCurve[levelIndex] * fact.hitCount;
  }
  assert.ok(fact.motionValueComponents);
  return fact.motionValueComponents.reduce(
    (sum, component) => sum + component.curve[levelIndex] * component.hitCount,
    0,
  );
}

function assertNear(actual: number, expected: number, epsilon = 1e-10): void {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
}

test('Brant source profile covers all six required mechanics areas plus current Tune Break', () => {
  const profile = getCharacterMechanicsProfile('brant');
  assert.equal(profile, BRANT_CHARACTER_MECHANICS_PROFILE);
  assert.equal(profile?.verificationStatus, 'VERIFIED');
  assert.deepEqual(
    profile?.coverage.map((entry) => [entry.area, entry.status]),
    [
      ['ACTIONS', 'VERIFIED'],
      ['FORTE_RULES', 'VERIFIED'],
      ['INHERENT_PASSIVES', 'VERIFIED'],
      ['OUTRO_EFFECT', 'VERIFIED'],
      ['RESOURCE_RULES', 'VERIFIED'],
      ['SEQUENCES', 'VERIFIED'],
    ],
  );
  assert.equal(BRANT_ACTION_FACTS.length, 22);
  assert.equal(BRANT_RESOURCE_FACTS.length, 1);
  assert.equal(BRANT_PASSIVE_FACTS.length, 10);
  assert.equal(BRANT_SEQUENCE_FACTS.length, 6);
  assert.equal(BRANT_CHARACTER_MECHANIC_FACTS.length, 39);
  assert.equal(profile?.factIds.length, 40);
  assert.equal(BRANT_CHARACTER_MECHANIC_FACTS.every((fact) => fact.verificationStatus === 'VERIFIED'), true);
});

test('Brant action facts preserve exact move-scoped Lv1-Lv10 curves and damage buckets', () => {
  for (const fact of BRANT_ACTION_FACTS) {
    assert.equal(fact.actionRole, 'DAMAGE', fact.factId);
    assert.equal(fact.scalingStat, 'ATK', fact.factId);
    assert.equal(fact.motionValue, null, fact.factId);
    assert.ok(fact.motionValueCurve || fact.motionValueComponents, fact.factId);
    assert.match(fact.motionValueContext ?? '', /Lv1-Lv10/);
  }

  const basic3 = actionFact('brant-basic-captains-rhapsody-3');
  assert.deepEqual(basic3.motionValueComponents?.map((component) => component.hitCount), [3, 2]);
  assertNear(sourceMotionValueAt(basic3, 0), .6658);
  assertNear(sourceMotionValueAt(basic3, 9), 1.3234);

  const midAir4 = actionFact('brant-mid-air-captains-rhapsody-4');
  assert.deepEqual(midAir4.motionValueComponents?.map((component) => component.hitCount), [1, 3, 1]);
  assertNear(sourceMotionValueAt(midAir4, 9), 2.5385);

  const anchors = actionFact('brant-skill-anchors-aweigh');
  assert.equal(anchors.damageClass, 'SKILL');
  assertNear(sourceMotionValueAt(anchors, 0), 1.6795);
  assertNear(sourceMotionValueAt(anchors, 9), 3.3392);

  const plunging = actionFact('brant-skill-plunging-attack');
  assert.equal(plunging.section, 'RESONANCE_SKILL');
  assert.equal(plunging.actionKind, 'SKILL');
  assert.equal(plunging.damageClass, 'BASIC');
  assert.equal(plunging.motionValueCurve?.[9], 1.0478);

  const liberation = actionFact('brant-liberation-to-the-horizon');
  assert.equal(liberation.damageClass, 'LIBERATION');
  assert.deepEqual(liberation.motionValueComponents?.map((component) => component.hitCount), [4, 1]);
  assertNear(sourceMotionValueAt(liberation, 9), 6.8045);

  const intro = actionFact('brant-intro-applaud-for-me');
  assert.equal(intro.damageClass, 'INTRO');
  assertNear(sourceMotionValueAt(intro, 9), 2.5349);

  const returned = actionFact('brant-forte-returned-from-ashes');
  assert.equal(returned.section, 'FORTE_CIRCUIT');
  assert.equal(returned.actionKind, 'FORTE');
  assert.equal(returned.damageClass, 'BASIC');
  assert.deepEqual(returned.motionValueComponents?.map((component) => component.hitCount), [2, 1, 2, 1]);
  assertNear(sourceMotionValueAt(returned, 9), 18.8871);
});

test('Brant raw Forte and utility facts preserve Bravo, ER scaling, healing, shield and state boundaries', () => {
  const bravo = BRANT_RESOURCE_FACTS[0];
  assert.equal(bravo?.resourceName, 'Bravo');
  assert.equal(bravo?.maxValue, 100);
  assert.match(bravo?.ruleSummary ?? '', /25\/50\/75\/100/);
  assert.match(bravo?.ruleSummary ?? '', /consumes all Bravo/i);
  assert.match(bravo?.ruleSummary ?? '', /100%/);

  const aflame = BRANT_PASSIVE_FACTS.find((fact) => fact.factId === 'brant-liberation-aflame-my-moment');
  assert.ok(aflame);
  assert.equal(aflame.durationSeconds, 12);
  assert.equal(aflame.scope, 'SELF');
  assert.equal(aflame.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(aflame.effectSummary, /150%/);
  assert.match(aflame.effectSummary, /20 ATK.*2600/);

  const theatrical = BRANT_PASSIVE_FACTS.find((fact) => fact.factId === 'brant-forte-theatrical-moment');
  assert.ok(theatrical);
  assert.match(theatrical.effectSummary, /12 ATK.*1560/);

  const liberationHeal = BRANT_PASSIVE_FACTS.find((fact) => fact.factId === 'brant-liberation-to-the-horizon-healing');
  assert.ok(liberationHeal);
  assert.equal(liberationHeal.scope, 'TEAM');
  assert.match(liberationHeal.effectSummary, /500\+1\.75%/);
  assert.match(liberationHeal.effectSummary, /950\+3\.32%/);
  assert.match(liberationHeal.effectSummary, /Energy Regen/);

  const waves = BRANT_PASSIVE_FACTS.find((fact) => fact.factId === 'brant-forte-waves-of-acclaims');
  assert.ok(waves);
  assert.equal(waves.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(waves.effectSummary, /312\+1\.09%/);
  assert.match(waves.effectSummary, /593\+2\.07%/);
  assert.match(waves.notes?.join(' ') ?? '', /20%/);

  const shield = BRANT_PASSIVE_FACTS.find((fact) => fact.factId === 'brant-forte-returned-from-ashes-shield');
  assert.ok(shield);
  assert.equal(shield.durationSeconds, 30);
  assert.equal(shield.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(shield.effectSummary, /2500\+9\.00%/);
  assert.match(shield.effectSummary, /4750\+17\.10%/);
  assert.match(shield.effectSummary, /cannot be transferred/i);

  const introState = BRANT_PASSIVE_FACTS.find((fact) => fact.factId === 'brant-intro-interlude-applause');
  assert.ok(introState);
  assert.match(introState.effectSummary, /begins at Stage 2/);
  assert.match(introState.effectSummary, /lands early.*switched out/i);

  const grapple = BRANT_PASSIVE_FACTS.find((fact) => fact.factId === 'brant-basic-mid-air-grapple-loop');
  assert.ok(grapple);
  assert.equal(grapple.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(grapple.effectSummary, /resets Mid-air Dodge attempts/i);
});

test('Brant Inherents, Outro and S1-S6 remain source-verified without automatic uptime', () => {
  const blaze = BRANT_PASSIVE_FACTS.find((fact) => fact.factId === 'brant-inherent-voyagers-blaze');
  assert.ok(blaze);
  assert.match(blaze.effectSummary, /20%/);

  const trial = BRANT_PASSIVE_FACTS.find((fact) => fact.factId === 'brant-inherent-trial-by-fire-and-tide');
  assert.ok(trial);
  assert.match(trial.effectSummary, /15% Fusion DMG Bonus/);

  const outro = BRANT_PASSIVE_FACTS.find((fact) => fact.factId === 'brant-outro-the-course-is-set');
  assert.ok(outro);
  assert.equal(outro.scope, 'NEXT_CHARACTER');
  assert.equal(outro.durationSeconds, 14);
  assert.match(outro.effectSummary, /20%.*Fusion DMG/);
  assert.match(outro.effectSummary, /25%.*Resonance Skill DMG/);
  assert.match(outro.effectSummary, /switched out/);

  assert.deepEqual(BRANT_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
  assert.match(BRANT_SEQUENCE_FACTS[0]?.effectSummary ?? '', /20%.*5s.*3 times/i);
  assert.match(BRANT_SEQUENCE_FACTS[1]?.effectSummary ?? '', /30%/);
  assert.match(BRANT_SEQUENCE_FACTS[1]?.effectSummary ?? '', /440% ATK/);
  assert.match(BRANT_SEQUENCE_FACTS[1]?.effectSummary ?? '', /once per second.*2 explosions/i);
  assert.match(BRANT_SEQUENCE_FACTS[1]?.effectSummary ?? '', /remains active.*switched off/i);
  assert.match(BRANT_SEQUENCE_FACTS[1]?.notes?.join(' ') ?? '', /Wutheringlab.*ends early/i);
  assert.match(BRANT_SEQUENCE_FACTS[2]?.effectSummary ?? '', /42%/);
  assert.match(BRANT_SEQUENCE_FACTS[3]?.effectSummary ?? '', /20%.*6\.60 HP.*1% Energy Regen/i);
  assert.match(BRANT_SEQUENCE_FACTS[4]?.effectSummary ?? '', /15%.*10s/);
  assert.match(BRANT_SEQUENCE_FACTS[5]?.effectSummary ?? '', /30%.*secondary blast.*30%/i);
});

test('Brant Tune Break is explicit shared-system damage without Character motion values', () => {
  assert.equal(BRANT_TUNE_BREAK_FACT.section, 'TUNE_BREAK');
  assert.equal(BRANT_TUNE_BREAK_FACT.actionKind, 'TUNE_BREAK');
  assert.equal(BRANT_TUNE_BREAK_FACT.actionRole, 'SHARED_SYSTEM_DAMAGE');
  assert.equal(BRANT_TUNE_BREAK_FACT.damageClass, 'OTHER');
  assert.equal(BRANT_TUNE_BREAK_FACT.scalingStat, 'SHARED_SYSTEM');
  assert.equal(BRANT_TUNE_BREAK_FACT.motionValue, null);
  assert.equal(BRANT_TUNE_BREAK_FACT.motionValueCurve ?? null, null);
  assert.equal(BRANT_TUNE_BREAK_FACT.motionValueComponents ?? null, null);
  assert.equal(BRANT_TUNE_BREAK_FACT.hitCount, null);
});

test('Brant promotion advances canonical roster coverage without unlocking broad DPS', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 5);
  assert.deepEqual(audit.verifiedCharacterIds, ['aalto', 'aemeath', 'augusta', 'baizhi', 'brant']);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.equal(audit.unstartedCharacterIds.length, 52);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 180);
  assert.deepEqual(audit.structuralIssues, []);

  const raw = getCharacterPreflight('brant', 'RAW_FACTS');
  const dps = getCharacterPreflight('brant', 'DPS_MODEL');
  assert.ok(raw && dps);
  assert.equal(raw.checks.find((check) => check.area === 'CHARACTER_MECHANICS')?.status, 'PASS');
  assert.equal(raw.ready, true);
  assert.equal(dps.ready, false);
  assert.ok(dps.blockers.some((check) => check.area === 'ROTATION_PROFILE'));
  assert.ok(dps.blockers.some((check) => check.area === 'COMBAT_MODEL'));
});
