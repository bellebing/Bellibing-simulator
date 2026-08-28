import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  AEMEATH_CHARACTER_MECHANICS_PROFILE,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  AEMEATH_ACTION_FACTS,
  AEMEATH_CHARACTER_MECHANIC_FACTS,
  AEMEATH_PASSIVE_FACTS,
  AEMEATH_RESOURCE_FACTS,
  AEMEATH_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/aemeathRawFacts.ts';
import { getCharacterPreflight } from '../src/data/characterPreflight.ts';

function actionFact(factId: string) {
  const fact = AEMEATH_ACTION_FACTS.find((entry) => entry.factId === factId);
  assert.ok(fact, factId);
  return fact;
}

test('Aemeath source profile covers every required mechanics area with linked verified facts plus explicit Tune Break', () => {
  const profile = getCharacterMechanicsProfile('aemeath');
  assert.equal(profile, AEMEATH_CHARACTER_MECHANICS_PROFILE);
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
  assert.equal(AEMEATH_ACTION_FACTS.length, 26);
  assert.equal(AEMEATH_RESOURCE_FACTS.length, 3);
  assert.equal(AEMEATH_PASSIVE_FACTS.length, 10);
  assert.equal(AEMEATH_SEQUENCE_FACTS.length, 6);
  assert.equal(AEMEATH_CHARACTER_MECHANIC_FACTS.length, 45);
  assert.equal(profile?.factIds.length, 46);
  assert.equal(AEMEATH_CHARACTER_MECHANIC_FACTS.every((fact) => fact.verificationStatus === 'VERIFIED'), true);
});

test('Aemeath mixed action expressions preserve source components instead of flattening their motion values', () => {
  const basic3 = actionFact('aemeath-basic-infinity-calibration-3');
  assert.equal(basic3.motionValue, null);
  assert.equal(basic3.motionValueCurve ?? null, null);
  assert.deepEqual(basic3.motionValueComponents?.map((component) => component.hitCount), [3, 1, 1]);
  assert.deepEqual(basic3.motionValueComponents?.[0]?.curve, [.0469, .0507, .0546, .0599, .0638, .0682, .0743, .0805, .0866, .0932]);
  assert.deepEqual(basic3.motionValueComponents?.[2]?.curve, [.2342, .2534, .2726, .2995, .3187, .3408, .3715, .4022, .4329, .4656]);

  const heavy2 = actionFact('aemeath-heavy-charged-ii');
  assert.equal(heavy2.damageClass, 'LIBERATION');
  assert.deepEqual(heavy2.motionValueComponents?.map((component) => component.hitCount), [4, 1]);
  assert.equal(heavy2.motionValueComponents?.[1]?.curve[9], 1.856);

  const mechDodge = actionFact('aemeath-mech-dodge-counter');
  assert.deepEqual(mechDodge.motionValueComponents?.map((component) => component.hitCount), [6, 1, 1]);
  assert.equal(mechDodge.motionValueComponents?.[1]?.curve[9], 1.9844);

  const overdrive = actionFact('aemeath-liberation-heavenfall-overdrive');
  assert.deepEqual(overdrive.motionValueComponents?.map((component) => component.hitCount), [1, 3]);
  assert.equal(overdrive.motionValueComponents?.[0]?.curve[0], 1.01);
  assert.equal(overdrive.motionValueComponents?.[1]?.curve[9], 2.6774);
});

test('Aemeath Forte keeps current Duet label consensus and Tune AMP scaling explicit', () => {
  const encore = actionFact('aemeath-forte-seraphic-duet-encore');
  const overture = actionFact('aemeath-forte-seraphic-duet-overture');
  assert.deepEqual(encore.motionValueComponents?.map((component) => component.hitCount), [4, 3, 1]);
  assert.deepEqual(overture.motionValueComponents?.map((component) => component.hitCount), [1, 6, 3, 3]);
  assert.equal(encore.motionValueComponents?.[2]?.curve[0], .9);
  assert.equal(overture.motionValueComponents?.[3]?.curve[9], .5965);
  assert.match(encore.notes?.join(' ') ?? '', /Wutheringlab\/WWPlus.*swap/i);

  const starburst = actionFact('aemeath-forte-starburst');
  assert.equal(starburst.scalingStat, 'TUNE_AMP');
  assert.equal(starburst.damageClass, 'OTHER');
  assert.equal(starburst.modelingStatus, 'PENDING_INTERPRETATION');
  assert.deepEqual(starburst.motionValueCurve, [3, 3.246, 3.492, 3.8364, 4.0824, 4.3653, 4.7589, 5.1525, 5.5461, 5.9643]);

  const bonus = actionFact('aemeath-forte-seraphic-duet-bonus-instance');
  assert.equal(bonus.scalingStat, 'TUNE_AMP');
  assert.deepEqual(bonus.motionValueCurve, [.55, .5951, .6402, .7034, .7485, .8004, .8725, .9447, 1.0168, 1.0935]);

  const provenance = starburst.provenance.notes?.join(' ') ?? '';
  assert.match(provenance, /WWPlus.*Lv3/i);
  assert.match(provenance, /malformed Starburst Lv6/i);
  assert.match(provenance, /Seraphic Duet labels conflict/i);
  assert.match(provenance, /S6 max-trail-limit.*in combat.*out of combat/i);
});

test('Aemeath resource facts lock current 40 Intro / 30 Overdrive consensus and exact caps', () => {
  const sync = AEMEATH_RESOURCE_FACTS.find((fact) => fact.factId === 'aemeath-resource-synchronization-rate');
  const resonance = AEMEATH_RESOURCE_FACTS.find((fact) => fact.factId === 'aemeath-resource-resonance-rate');
  const starflux = AEMEATH_RESOURCE_FACTS.find((fact) => fact.factId === 'aemeath-resource-starflux');
  assert.ok(sync && resonance && starflux);

  assert.equal(sync.maxValue, 200);
  assert.match(sync.ruleSummary, /restores 40/);
  assert.match(sync.ruleSummary, /Overdrive restores 30/);
  assert.match(sync.ruleSummary, /restores 200/);
  assert.match(sync.notes?.join(' ') ?? '', /stale tooltip.*revers/i);

  assert.equal(resonance.maxValue, 4);
  assert.match(resonance.ruleSummary, /Seraphic Duet restores 1/);
  assert.match(resonance.ruleSummary, /Starlume Acceleration/);

  assert.equal(starflux.maxValue, 600);
  assert.match(starflux.ruleSummary, /slower while in combat/i);
});

test('Aemeath state, inherent, Outro and S1-S6 facts remain source-verified without automatic uptime', () => {
  const trails = AEMEATH_PASSIVE_FACTS.find((fact) => fact.factId === 'aemeath-forte-resonance-mode-trails');
  assert.ok(trails);
  assert.equal(trails.scope, 'TARGET');
  assert.equal(trails.durationSeconds, 30);
  assert.equal(trails.maxStacks, 30);
  assert.equal(trails.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(trails.effectSummary, /once every 3 seconds/);

  const beforeAllSounds = AEMEATH_PASSIVE_FACTS.find((fact) => fact.factId === 'aemeath-inherent-before-all-sounds');
  assert.ok(beforeAllSounds);
  assert.match(beforeAllSounds.effectSummary, /200% DMG Amplification/);

  const betweenStars = AEMEATH_PASSIVE_FACTS.find((fact) => fact.factId === 'aemeath-inherent-between-the-stars');
  assert.ok(betweenStars);
  assert.match(betweenStars.effectSummary, /20% Crit DMG.*3 stacks/i);
  assert.match(betweenStars.effectSummary, /30% Crit DMG.*2 stacks/i);
  assert.match(betweenStars.effectSummary, /25%/);

  const outro = AEMEATH_PASSIVE_FACTS.find((fact) => fact.factId === 'aemeath-outro-silent-protection');
  assert.ok(outro);
  assert.equal(outro.scope, 'TEAM');
  assert.equal(outro.durationSeconds, 20);
  assert.match(outro.effectSummary, /10% All-DMG Amplification/);
  assert.match(outro.effectSummary, /20% instead/);

  assert.deepEqual(AEMEATH_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);

  const s1 = AEMEATH_SEQUENCE_FACTS[0];
  assert.match(s1?.effectSummary ?? '', /300% Crit DMG/);
  assert.match(s1?.effectSummary ?? '', /100 Synchronization Rate/);
  assert.match(s1?.effectSummary ?? '', /highest defeated-target trail stack count/i);
  assert.match(s1?.effectSummary ?? '', /cannot re-enter Sealed Trail for 1 second/i);

  const s2 = AEMEATH_SEQUENCE_FACTS[1];
  assert.match(s2?.effectSummary ?? '', /additional Tune Rupture instances.*same target.*20% for 1 second.*5 times/i);
  assert.doesNotMatch(s2?.effectSummary ?? '', /removed Rupturous Trail stack adds 20%/i);
  assert.match(s2?.effectSummary ?? '', /400%/);
  assert.match(s2?.effectSummary ?? '', /15%/);

  const s4 = AEMEATH_SEQUENCE_FACTS[3];
  assert.match(s4?.effectSummary ?? '', /20% All-Attribute DMG Bonus.*30 seconds/);

  const s6 = AEMEATH_SEQUENCE_FACTS[5];
  assert.match(s6?.effectSummary ?? '', /40% more Resonance Liberation DMG/);
  assert.match(s6?.effectSummary ?? '', /80% Crit Rate.*275% Crit DMG/);
  assert.match(s6?.effectSummary ?? '', /while in combat.*trail max increases to 60/i);
  assert.match(s6?.notes?.join(' ') ?? '', /WutheringDB.*in combat.*Wutheringlab.*out of combat/i);
});

test('fact-backed roster audit reports sixteen source-complete characters with 41 unstarted', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 16);
  assert.deepEqual(audit.verifiedCharacterIds, ['aalto', 'aemeath', 'augusta', 'baizhi', 'brant', 'calcharo', 'changli', 'chixia', 'encore', 'jiyan', 'lingyang', 'mortefi', 'taoqi', 'verina', 'yangyang', 'yinlin']);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.equal(audit.unstartedCharacterIds.length, 41);
  assert.deepEqual(audit.structuralIssues, []);
});

test('Aemeath RAW_FACTS preflight passes without claiming build or DPS readiness', () => {
  const raw = getCharacterPreflight('aemeath', 'RAW_FACTS');
  const build = getCharacterPreflight('aemeath', 'BUILD_PROFILE');
  const dps = getCharacterPreflight('aemeath', 'DPS_MODEL');
  assert.ok(raw && build && dps);

  assert.equal(raw.ready, true);
  assert.deepEqual(raw.blockers, []);
  assert.equal(raw.checks.find((check) => check.area === 'CHARACTER_MECHANICS')?.status, 'PASS');

  assert.equal(build.ready, false);
  assert.ok(build.blockers.some((check) => check.area === 'WEAPON_PROFILE'));
  assert.equal(dps.ready, false);
  assert.ok(dps.blockers.some((check) => check.area === 'ROTATION_PROFILE'));
  assert.ok(dps.blockers.some((check) => check.area === 'COMBAT_MODEL'));
});