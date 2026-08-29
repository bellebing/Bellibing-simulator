import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  CHANGLI_CHARACTER_MECHANICS_PROFILE,
  CHANGLI_TUNE_BREAK_FACT,
  JIYAN_CHARACTER_MECHANICS_PROFILE,
  JIYAN_TUNE_BREAK_FACT,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  CHANGLI_ACTION_FACTS,
  CHANGLI_CHARACTER_MECHANIC_FACTS,
  CHANGLI_PASSIVE_FACTS,
  CHANGLI_RESOURCE_FACTS,
  CHANGLI_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/changliRawFacts.ts';
import {
  JIYAN_ACTION_FACTS,
  JIYAN_CHARACTER_MECHANIC_FACTS,
  JIYAN_PASSIVE_FACTS,
  JIYAN_RESOURCE_FACTS,
  JIYAN_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/jiyanRawFacts.ts';
import { getCharacterPreflight } from '../src/data/characterPreflight.ts';

const EXPECTED_AREAS = [
  ['ACTIONS', 'VERIFIED'],
  ['FORTE_RULES', 'VERIFIED'],
  ['INHERENT_PASSIVES', 'VERIFIED'],
  ['OUTRO_EFFECT', 'VERIFIED'],
  ['RESOURCE_RULES', 'VERIFIED'],
  ['SEQUENCES', 'VERIFIED'],
] as const;

function factById<T extends { factId: string }>(facts: readonly T[], factId: string): T {
  const fact = facts.find((entry) => entry.factId === factId);
  assert.ok(fact, factId);
  return fact;
}

test('second Character Mechanics batch promotes Changli and Jiyan only after semantic review', () => {
  for (const [characterId, profile, expectedFactCount] of [
    ['changli', CHANGLI_CHARACTER_MECHANICS_PROFILE, 31],
    ['jiyan', JIYAN_CHARACTER_MECHANICS_PROFILE, 32],
  ] as const) {
    assert.equal(getCharacterMechanicsProfile(characterId), profile);
    assert.equal(profile.verificationStatus, 'VERIFIED');
    assert.deepEqual(profile.coverage.map((entry) => [entry.area, entry.status]), EXPECTED_AREAS);
    assert.equal(profile.factIds.length, expectedFactCount);
    assert.match(profile.provenance.notes?.join(' ') ?? '', /NOT_VERIFIED.*not.*automatically|no generated candidate status was promoted automatically/i);
  }

  assert.equal(CHANGLI_ACTION_FACTS.length, 17);
  assert.equal(CHANGLI_RESOURCE_FACTS.length, 2);
  assert.equal(CHANGLI_PASSIVE_FACTS.length, 5);
  assert.equal(CHANGLI_SEQUENCE_FACTS.length, 6);
  assert.equal(CHANGLI_CHARACTER_MECHANIC_FACTS.length, 30);
  assert.equal(JIYAN_ACTION_FACTS.length, 20);
  assert.equal(JIYAN_RESOURCE_FACTS.length, 1);
  assert.equal(JIYAN_PASSIVE_FACTS.length, 4);
  assert.equal(JIYAN_SEQUENCE_FACTS.length, 6);
  assert.equal(JIYAN_CHARACTER_MECHANIC_FACTS.length, 31);
});

test('Changli preserves explicit Resonance Skill buckets and source state/resource semantics', () => {
  for (const factId of ['changli-skill-true-sight-conquest', 'changli-skill-true-sight-charge', 'changli-forte-flaming-sacrifice']) {
    assert.equal(factById(CHANGLI_ACTION_FACTS, factId).damageClass, 'SKILL', factId);
  }

  const enflamement = CHANGLI_RESOURCE_FACTS.find((fact) => fact.resourceName === 'Enflamement');
  assert.ok(enflamement);
  assert.equal(enflamement.maxValue, 4);
  assert.match(enflamement.ruleSummary, /Conquest.*1/i);
  assert.match(enflamement.ruleSummary, /Charge.*1/i);
  assert.match(enflamement.ruleSummary, /Radiance of Fealty.*4/i);
  assert.match(enflamement.ruleSummary, /consumes all Enflamement/i);

  const charges = CHANGLI_RESOURCE_FACTS.find((fact) => fact.resourceName === 'Tripartite Flames charges');
  assert.ok(charges);
  assert.equal(charges.maxValue, 2);
  assert.match(charges.ruleSummary, /replenishes 1 charge every 12 seconds/i);

  const trueSight = CHANGLI_PASSIVE_FACTS.find((fact) => fact.factId === 'changli-state-true-sight');
  assert.ok(trueSight);
  assert.equal(trueSight.durationSeconds, 12);
  assert.equal(trueSight.modelingStatus, 'PENDING_INTERPRETATION');

  const feather = CHANGLI_PASSIVE_FACTS.find((fact) => fact.factId === 'changli-state-fiery-feather');
  assert.ok(feather);
  assert.equal(feather.durationSeconds, 10);
  assert.equal(feather.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(feather.effectSummary, /does not separately state a post-trigger ATK-buff duration/i);

  const outro = CHANGLI_PASSIVE_FACTS.find((fact) => fact.factId === 'changli-outro-strategy-of-duality');
  assert.ok(outro);
  assert.equal(outro.durationSeconds, 10);
  assert.match(outro.effectSummary, /Fusion DMG Amplified by 20%/i);
  assert.match(outro.effectSummary, /Resonance Liberation DMG Amplified by 25%/i);
  assert.match(outro.effectSummary, /until switched out/i);
  assert.deepEqual(CHANGLI_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('Jiyan keeps Prelude non-damaging while Finale and Lance use explicit Heavy Attack damage', () => {
  const prelude = factById(JIYAN_ACTION_FACTS, 'jiyan-liberation-emerald-storm-prelude');
  assert.equal(prelude.actionRole, 'NON_DAMAGE');
  assert.equal(prelude.actionKind, 'STATE_CHANGE');
  assert.equal(prelude.damageClass, null);
  assert.equal(prelude.motionValue, null);
  assert.equal(prelude.motionValueContext, null);
  assert.equal(prelude.hitCount, null);

  const finale = factById(JIYAN_ACTION_FACTS, 'jiyan-liberation-emerald-storm-finale');
  assert.equal(finale.actionKind, 'LIBERATION');
  assert.equal(finale.damageClass, 'HEAVY');
  assert.deepEqual(finale.motionValueComponents?.map((component) => component.hitCount), [2, 1]);

  for (const factId of ['jiyan-liberation-lance-of-qingloong-1', 'jiyan-liberation-lance-of-qingloong-2', 'jiyan-liberation-lance-of-qingloong-3']) {
    const fact = factById(JIYAN_ACTION_FACTS, factId);
    assert.equal(fact.actionKind, 'HEAVY', factId);
    assert.equal(fact.damageClass, 'HEAVY', factId);
  }

  const resolve = JIYAN_RESOURCE_FACTS[0];
  assert.equal(resolve?.resourceName, 'Resolve');
  assert.equal(resolve?.maxValue, 60);
  assert.match(resolve?.ruleSummary ?? '', /15 seconds/i);
  assert.match(resolve?.ruleSummary ?? '', /consume 30 Resolve/i);
  assert.match(resolve?.ruleSummary ?? '', /without consuming Resolve/i);

  const mode = JIYAN_PASSIVE_FACTS.find((fact) => fact.factId === 'jiyan-state-qingloong-mode');
  assert.ok(mode);
  assert.equal(mode.durationSeconds, 10);
  assert.match(mode.effectSummary, /Lance of Qingloong/i);
  assert.deepEqual(JIYAN_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('Jiyan Outro keeps fixed coordinated-damage trigger limits explicit', () => {
  const outro = factById(JIYAN_ACTION_FACTS, 'jiyan-outro-discipline');
  assert.equal(outro.actionKind, 'OUTRO');
  assert.equal(outro.actionRole, 'DAMAGE');
  assert.equal(outro.damageClass, 'COORDINATED');
  assert.equal(outro.scalingStat, 'ATK');
  assert.equal(outro.sourceFixedMotionValue, 3.134);
  assert.equal(outro.hitCount, 1);
  assert.equal(outro.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(outro.notes?.join(' ') ?? '', /lasts 8s/i);
  assert.match(outro.notes?.join(' ') ?? '', /once every 1s/i);
  assert.match(outro.notes?.join(' ') ?? '', /up to 2 times/i);
});

test('second-batch Tune Break facts stay at the shared-system boundary', () => {
  for (const fact of [CHANGLI_TUNE_BREAK_FACT, JIYAN_TUNE_BREAK_FACT]) {
    assert.equal(fact.section, 'TUNE_BREAK', fact.factId);
    assert.equal(fact.actionKind, 'TUNE_BREAK', fact.factId);
    assert.equal(fact.actionRole, 'SHARED_SYSTEM_DAMAGE', fact.factId);
    assert.equal(fact.damageClass, 'OTHER', fact.factId);
    assert.equal(fact.scalingStat, 'SHARED_SYSTEM', fact.factId);
    assert.equal(fact.motionValue, null, fact.factId);
    assert.equal(fact.motionValueCurve ?? null, null, fact.factId);
    assert.equal(fact.motionValueComponents ?? null, null, fact.factId);
    assert.equal(fact.sourceFixedMotionValue ?? null, null, fact.factId);
    assert.equal(fact.sourceFixedMotionValueComponents ?? null, null, fact.factId);
    assert.equal(fact.hitCount, null, fact.factId);
  }
});

test('second Character Mechanics batch remains valid inside the current roster registry', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 54);
  assert.equal(audit.verifiedCharacterIds.length, 54);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.equal(audit.unstartedCharacterIds.length, 3);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1866);
  assert.deepEqual(audit.structuralIssues, []);

  for (const characterId of ['changli', 'jiyan']) {
    const raw = getCharacterPreflight(characterId, 'RAW_FACTS');
    const dps = getCharacterPreflight(characterId, 'DPS_MODEL');
    assert.ok(raw && dps, characterId);
    assert.equal(raw.ready, true, characterId);
    assert.equal(raw.checks.find((check) => check.area === 'CHARACTER_MECHANICS')?.status, 'PASS', characterId);
    assert.equal(dps.ready, false, characterId);
    assert.ok(dps.blockers.some((check) => check.area === 'ROTATION_PROFILE'), characterId);
    assert.ok(dps.blockers.some((check) => check.area === 'COMBAT_MODEL'), characterId);
  }
});