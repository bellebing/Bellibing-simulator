import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  ROCCIA_CHARACTER_MECHANICS_PROFILE,
  ROCCIA_TUNE_BREAK_FACT,
  ZHEZHI_CHARACTER_MECHANICS_PROFILE,
  ZHEZHI_TUNE_BREAK_FACT,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  ROCCIA_ACTION_FACTS,
  ROCCIA_CHARACTER_MECHANIC_FACTS,
  ROCCIA_PASSIVE_FACTS,
  ROCCIA_RESOURCE_FACTS,
  ROCCIA_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/rocciaRawFacts.ts';
import {
  ZHEZHI_ACTION_FACTS,
  ZHEZHI_CHARACTER_MECHANIC_FACTS,
  ZHEZHI_PASSIVE_FACTS,
  ZHEZHI_RESOURCE_FACTS,
  ZHEZHI_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/zhezhiRawFacts.ts';
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

test('sixth Character Mechanics batch promotes Roccia and Zhezhi only after semantic review', () => {
  for (const [characterId, profile, expectedFactCount] of [
    ['roccia', ROCCIA_CHARACTER_MECHANICS_PROFILE, 26],
    ['zhezhi', ZHEZHI_CHARACTER_MECHANICS_PROFILE, 30],
  ] as const) {
    assert.equal(getCharacterMechanicsProfile(characterId), profile);
    assert.equal(profile.verificationStatus, 'VERIFIED');
    assert.deepEqual(profile.coverage.map((entry) => [entry.area, entry.status]), EXPECTED_AREAS);
    assert.equal(profile.factIds.length, expectedFactCount);
    assert.match(profile.provenance.notes?.join(' ') ?? '', /CANDIDATE_ONLY|NOT_VERIFIED|no generated candidate status was promoted automatically/i);
  }

  assert.equal(ROCCIA_ACTION_FACTS.length, 13);
  assert.equal(ROCCIA_RESOURCE_FACTS.length, 1);
  assert.equal(ROCCIA_PASSIVE_FACTS.length, 5);
  assert.equal(ROCCIA_SEQUENCE_FACTS.length, 6);
  assert.equal(ROCCIA_CHARACTER_MECHANIC_FACTS.length, 25);

  assert.equal(ZHEZHI_ACTION_FACTS.length, 14);
  assert.equal(ZHEZHI_RESOURCE_FACTS.length, 2);
  assert.equal(ZHEZHI_PASSIVE_FACTS.length, 7);
  assert.equal(ZHEZHI_SEQUENCE_FACTS.length, 6);
  assert.equal(ZHEZHI_CHARACTER_MECHANIC_FACTS.length, 29);
});

test('Roccia preserves Liberation/Forte Heavy buckets, Imagination rules and external Magic Box boundary', () => {
  const liberation = factById(ROCCIA_ACTION_FACTS, 'roccia-resonance-liberation-commedia-improvviso-skill-dmg');
  assert.equal(liberation.actionKind, 'LIBERATION');
  assert.equal(liberation.damageClass, 'HEAVY');
  assert.equal(liberation.scalingStat, 'ATK');
  assert.equal(liberation.hitCount, 3);

  for (const factId of [
    'roccia-forte-circuit-a-prop-master-prepares-stage-1-dmg',
    'roccia-forte-circuit-a-prop-master-prepares-stage-2-dmg',
    'roccia-forte-circuit-a-prop-master-prepares-stage-3-dmg',
  ]) {
    const realFantasy = factById(ROCCIA_ACTION_FACTS, factId);
    assert.equal(realFantasy.actionKind, 'FORTE', factId);
    assert.equal(realFantasy.damageClass, 'HEAVY', factId);
  }

  assert.equal(ROCCIA_RESOURCE_FACTS[0]?.resourceName, 'Imagination');
  assert.equal(ROCCIA_RESOURCE_FACTS[0]?.maxValue, 300);
  assert.match(ROCCIA_RESOURCE_FACTS[0]?.ruleSummary ?? '', /consum(?:e|es) 100/i);

  const magicBox = factById(ROCCIA_PASSIVE_FACTS, 'roccia-inherent-super-attractive-magic-box');
  assert.equal(magicBox.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(magicBox.effectSummary, /Echo Skill/i);
  assert.match(magicBox.effectSummary, /Utility DMG/i);
  assert.match(magicBox.effectSummary, /100 fixed/i);
  assert.equal(ROCCIA_ACTION_FACTS.some((fact) => /magic-box/i.test(fact.factId)), false);

  const outro = factById(ROCCIA_PASSIVE_FACTS, 'roccia-outro-applause-please');
  assert.equal(outro.scope, 'NEXT_CHARACTER');
  assert.equal(outro.durationSeconds, 14);
  assert.match(outro.effectSummary, /20%.*Havoc/i);
  assert.match(outro.effectSummary, /25%.*Basic Attack/i);

  const s6 = factById(ROCCIA_SEQUENCE_FACTS, 'roccia-s6-when-the-golden-wings-fly');
  assert.match(s6.effectSummary, /100% of Real Fantasy Stage 3 damage/i);
  assert.match(s6.effectSummary, /Heavy Attack DMG/i);
  assert.deepEqual(ROCCIA_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('Zhezhi separates coordinated Inklit triggering from Basic damage and preserves imprint/resource state', () => {
  const inklit = factById(ZHEZHI_ACTION_FACTS, 'zhezhi-resonance-liberation-living-canvas-inklit-spirit-dmg');
  assert.equal(inklit.actionKind, 'LIBERATION');
  assert.equal(inklit.damageClass, 'BASIC');
  assert.equal(inklit.scalingStat, 'ATK');
  assert.match(inklit.notes?.join(' ') ?? '', /Coordinated/i);

  assert.equal(factById(ZHEZHI_ACTION_FACTS, 'zhezhi-forte-circuit-ink-and-wash-ha-conjuration-dmg').damageClass, 'HEAVY');
  assert.equal(factById(ZHEZHI_ACTION_FACTS, 'zhezhi-forte-circuit-ink-and-wash-stroke-of-genius-dmg').damageClass, 'BASIC');
  assert.equal(factById(ZHEZHI_ACTION_FACTS, 'zhezhi-forte-circuit-ink-and-wash-creation-s-zenith-dmg').damageClass, 'BASIC');

  assert.deepEqual(ZHEZHI_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [
    ['Afflatus', 90],
    ["Painter's Delight", 2],
  ]);

  const trigger = factById(ZHEZHI_PASSIVE_FACTS, 'zhezhi-liberation-inklit-trigger');
  assert.equal(trigger.durationSeconds, 30);
  assert.equal(trigger.maxStacks, 21);
  assert.match(trigger.effectSummary, /once per second/i);
  assert.match(trigger.effectSummary, /does not trigger itself/i);

  const outro = factById(ZHEZHI_PASSIVE_FACTS, 'zhezhi-outro-carve-and-draw');
  assert.equal(outro.scope, 'NEXT_CHARACTER');
  assert.equal(outro.durationSeconds, 14);
  assert.match(outro.effectSummary, /20%.*Glacio/i);
  assert.match(outro.effectSummary, /25%.*Resonance Skill/i);

  const s5 = factById(ZHEZHI_SEQUENCE_FACTS, 'zhezhi-s5-composition-s-clue');
  assert.match(s5.effectSummary, /140%/);
  assert.match(s5.effectSummary, /Basic Attack DMG/i);
  const s6 = factById(ZHEZHI_SEQUENCE_FACTS, 'zhezhi-s6-infinite-legacy');
  assert.match(s6.effectSummary, /120%/);
  assert.match(s6.effectSummary, /Basic Attack DMG/i);
  assert.deepEqual(ZHEZHI_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('sixth-batch Tune Break facts stay at the shared-system boundary', () => {
  for (const fact of [ROCCIA_TUNE_BREAK_FACT, ZHEZHI_TUNE_BREAK_FACT]) {
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
    assert.equal(fact.provenance.checkedAt, '2026-08-28', fact.factId);
  }
});

test('sixth Character Mechanics batch advances canonical coverage to 20 verified / 37 unstarted / 629 facts', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 20);
  assert.deepEqual(audit.verifiedCharacterIds, [
    'aalto',
    'aemeath',
    'augusta',
    'baizhi',
    'brant',
    'calcharo',
    'changli',
    'chixia',
    'encore',
    'jiyan',
    'lingyang',
    'mortefi',
    'roccia',
    'taoqi',
    'verina',
    'yangyang',
    'yinlin',
    'youhu',
    'yuanwu',
    'zhezhi',
  ]);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.equal(audit.unstartedCharacterIds.length, 37);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 629);
  assert.deepEqual(audit.structuralIssues, []);

  for (const characterId of ['roccia', 'zhezhi']) {
    const raw = getCharacterPreflight(characterId, 'RAW_FACTS');
    const dps = getCharacterPreflight(characterId, 'DPS_MODEL');
    assert.ok(raw && dps, characterId);
    assert.equal(raw.checks.find((check) => check.area === 'CHARACTER_MECHANICS')?.status, 'PASS', characterId);
    assert.equal(raw.ready, true, characterId);
    assert.equal(dps.ready, false, characterId);
    assert.ok(dps.blockers.some((check) => check.area === 'ROTATION_PROFILE'), characterId);
    assert.ok(dps.blockers.some((check) => check.area === 'COMBAT_MODEL'), characterId);
  }
});
