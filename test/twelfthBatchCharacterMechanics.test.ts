import assert from 'node:assert/strict';
import test from 'node:test';

import type { CharacterMechanicFact } from '../src/characterMechanicsDomain.ts';
import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  CANTARELLA_ACTION_FACTS,
  CANTARELLA_CHARACTER_MECHANIC_FACTS,
} from '../src/data/characterMechanics/cantarellaRawFacts.ts';
import {
  CARTETHYIA_ACTION_FACTS,
  CARTETHYIA_CHARACTER_MECHANIC_FACTS,
} from '../src/data/characterMechanics/cartethyiaRawFacts.ts';
import {
  LUCILLA_ACTION_FACTS,
  LUCILLA_CHARACTER_MECHANIC_FACTS,
} from '../src/data/characterMechanics/lucillaRawFacts.ts';
import {
  GALBRENA_ACTION_FACTS,
  GALBRENA_CHARACTER_MECHANIC_FACTS,
} from '../src/data/characterMechanics/galbrenaRawFacts.ts';
import {
  LYNAE_ACTION_FACTS,
  LYNAE_CHARACTER_MECHANIC_FACTS,
} from '../src/data/characterMechanics/lynaeRawFacts.ts';
import {
  CANTARELLA_TUNE_BREAK_FACT,
  CARTETHYIA_TUNE_BREAK_FACT,
  GALBRENA_TUNE_BREAK_FACT,
  LUCILLA_TUNE_BREAK_FACT,
  LYNAE_TUNE_BREAK_FACT,
} from '../src/data/characterMechanics/tuneBreakFacts.ts';
import {
  CANTARELLA_CHARACTER_MECHANICS_PROFILE,
  CARTETHYIA_CHARACTER_MECHANICS_PROFILE,
  GALBRENA_CHARACTER_MECHANICS_PROFILE,
  LUCILLA_CHARACTER_MECHANICS_PROFILE,
  LYNAE_CHARACTER_MECHANICS_PROFILE,
  TWELFTH_BATCH_CHARACTER_MECHANICS_PROFILES,
} from '../src/data/characterMechanics/twelfthBatchProfiles.ts';
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

test('twelfth Character Mechanics batch promotes five source-reviewed profiles with exact fact inventories', () => {
  const rows = [
    ['cantarella', CANTARELLA_CHARACTER_MECHANICS_PROFILE, 35],
    ['cartethyia', CARTETHYIA_CHARACTER_MECHANICS_PROFILE, 43],
    ['lucilla', LUCILLA_CHARACTER_MECHANICS_PROFILE, 37],
    ['galbrena', GALBRENA_CHARACTER_MECHANICS_PROFILE, 43],
    ['lynae', LYNAE_CHARACTER_MECHANICS_PROFILE, 45],
  ] as const;

  assert.equal(TWELFTH_BATCH_CHARACTER_MECHANICS_PROFILES.length, 5);
  for (const [characterId, profile, profileFactCount] of rows) {
    assert.equal(getCharacterMechanicsProfile(characterId), profile);
    assert.equal(profile.verificationStatus, 'VERIFIED');
    assert.deepEqual(profile.coverage.map((entry) => [entry.area, entry.status]), EXPECTED_AREAS);
    assert.equal(profile.factIds.length, profileFactCount);
    assert.match(profile.provenance.notes?.join(' ') ?? '', /CANDIDATE_ONLY|NOT_VERIFIED|no generated candidate status was promoted automatically/i);
  }

  assert.equal(CANTARELLA_ACTION_FACTS.length, 20);
  assert.equal(CARTETHYIA_ACTION_FACTS.length, 28);
  assert.equal(LUCILLA_ACTION_FACTS.length, 22);
  assert.equal(GALBRENA_ACTION_FACTS.length, 28);
  assert.equal(LYNAE_ACTION_FACTS.length, 30);

  assert.equal(CANTARELLA_CHARACTER_MECHANIC_FACTS.length, 34);
  assert.equal(CARTETHYIA_CHARACTER_MECHANIC_FACTS.length, 42);
  assert.equal(LUCILLA_CHARACTER_MECHANIC_FACTS.length, 36);
  assert.equal(GALBRENA_CHARACTER_MECHANIC_FACTS.length, 42);
  assert.equal(LYNAE_CHARACTER_MECHANIC_FACTS.length, 44);
});

test('Cantarella keeps Echo Skill cast identity separate from source-explicit damage buckets', () => {
  assert.equal(factById(CANTARELLA_ACTION_FACTS, 'cantarella-resonance-skill-dance-with-shadows-flickering-reverie-dmg').damageClass, 'SKILL');
  assert.equal(factById(CANTARELLA_ACTION_FACTS, 'cantarella-resonance-skill-dance-with-shadows-jolt-dmg').damageClass, 'BASIC');
  assert.equal(factById(CANTARELLA_ACTION_FACTS, 'cantarella-resonance-liberation-beneath-the-sea-flowing-suffocation-dmg').damageClass, 'BASIC');
  assert.equal(factById(CANTARELLA_ACTION_FACTS, 'cantarella-resonance-liberation-beneath-the-sea-diffusion-dmg').damageClass, 'BASIC');
  assert.equal(factById(CANTARELLA_ACTION_FACTS, 'cantarella-forte-circuit-between-illusion-and-reality-perception-drain-dmg').damageClass, 'BASIC');
  assert.equal(factById(CANTARELLA_ACTION_FACTS, 'cantarella-intro-skill-cruise-tidal-surge-dmg').damageClass, 'COORDINATED');
});

test('Cartethyia uses source-facing AERO_EROSION taxonomy only for her source-explicit Mid-air forms', () => {
  const midAirIds = [
    'cartethyia-basic-attack-sword-to-carve-my-forms-mid-air-attack',
    'cartethyia-basic-attack-sword-to-carve-my-forms-mid-air-attack-1-sword-shadow-recalled',
    'cartethyia-basic-attack-sword-to-carve-my-forms-mid-air-attack-2-sword-shadows-recalled',
    'cartethyia-basic-attack-sword-to-carve-my-forms-mid-air-attack-3-sword-shadows-recalled',
  ];
  for (const id of midAirIds) {
    const fact = factById(CARTETHYIA_ACTION_FACTS, id);
    assert.equal(fact.damageClass, 'AERO_EROSION', id);
    assert.equal(fact.scalingStat, 'HP', id);
  }
  assert.equal(factById(CARTETHYIA_ACTION_FACTS, 'cartethyia-basic-attack-sword-to-carve-my-forms-heavy-attack-dmg').damageClass, 'BASIC');
  assert.equal(factById(CARTETHYIA_ACTION_FACTS, 'cartethyia-resonance-skill-sword-to-bear-their-names-skill-dmg').damageClass, 'BASIC');
});

test('Lucilla represents each mode-dependent damage row as explicit BASIC and ECHO variants sharing one source curve', () => {
  for (const base of [
    'lucilla-resonance-liberation-clear-as-day-clear-as-day-dmg',
    'lucilla-resonance-liberation-clear-as-day-letting-it-go-dmg',
    'lucilla-forte-circuit-memory-palace-oblivion-dmg',
  ]) {
    const basic = factById(LUCILLA_ACTION_FACTS, `${base}-glacio-chafe-mode`);
    const echo = factById(LUCILLA_ACTION_FACTS, `${base}-echo-mode`);
    assert.equal(basic.damageClass, 'BASIC', base);
    assert.equal(echo.damageClass, 'ECHO', base);
    assert.deepEqual(basic.motionValueCurve ?? basic.motionValueComponents, echo.motionValueCurve ?? echo.motionValueComponents, base);
    assert.equal(basic.conditional, true, base);
    assert.equal(echo.conditional, true, base);
  }
});

test('Galbrena preserves Hellstride as literal flat 666 damage instead of a fabricated coefficient', () => {
  const hellstride = factById(GALBRENA_ACTION_FACTS, 'galbrena-forte-circuit-beyond-threshold-hellstride-dmg');
  assert.equal(hellstride.damageClass, 'BASIC');
  assert.equal(hellstride.scalingStat, 'FIXED');
  assert.equal(hellstride.sourceFixedFlatDamage, 666);
  assert.equal(hellstride.sourceFixedMotionValue ?? null, null);
  assert.equal(hellstride.motionValueCurve ?? null, null);
  assert.equal(hellstride.motionValueComponents ?? null, null);
  assert.equal(hellstride.hitCount, 1);
  assert.equal(hellstride.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(hellstride.notes?.join(' ') ?? '', /not affected by DMG buffs|flat damage/i);

  const outro = factById(GALBRENA_ACTION_FACTS, 'galbrena-outro-skill-ashen-pursuit-outro-skill-dmg');
  assert.ok(outro.motionValueCurve || outro.motionValueComponents);
  assert.equal(outro.sourceFixedMotionValue ?? null, null);
});

test('Lynae keeps one Character-owned Spectral Analysis coefficient and a separate shared Tune Break action', () => {
  const spectral = factById(LYNAE_ACTION_FACTS, 'lynae-forte-circuit-chromaticity-modeling-tune-rupture-response-spectral-analysis-dmg');
  assert.equal(spectral.damageClass, 'TUNE_RUPTURE');
  assert.equal(spectral.scalingStat, 'TUNE_AMP');
  assert.deepEqual(spectral.motionValueCurve, [9.46,10.2358,11.0115,12.0975,12.8732,13.7653,15.0064,16.2476,17.4888,18.8075]);
  assert.equal(LYNAE_ACTION_FACTS.some((fact) => fact.factId === 'lynae-tune-break-spectral-analysis-spectral-analysis-discorded-tune-dmg'), false);

  const outro = factById(LYNAE_ACTION_FACTS, 'lynae-outro-lets-hit-the-road-dmg');
  assert.equal(outro.sourceFixedMotionValue, 1);
  assert.equal(outro.damageClass, 'OUTRO');
});

test('source-fixed flat damage is one exact representation and cannot be mixed with coefficient curves', () => {
  const profile = GALBRENA_CHARACTER_MECHANICS_PROFILE;
  const map = new Map<string, CharacterMechanicFact>(CHARACTER_MECHANIC_FACT_BY_ID);
  const original = map.get('galbrena-forte-circuit-beyond-threshold-hellstride-dmg');
  assert.ok(original && original.kind === 'ACTION');
  map.set(original.factId, { ...original, motionValueCurve: [1,1,1,1,1,1,1,1,1,1] });
  const issues = auditCharacterMechanicsCoverage([profile], map).structuralIssues
    .filter((issue) => issue.characterId === 'galbrena')
    .map((issue) => issue.issue);
  assert.ok(issues.includes('verified ACTIONS fact galbrena-forte-circuit-beyond-threshold-hellstride-dmg mixes multiple source damage representations'));
});

test('twelfth-batch Tune Break facts remain shared-system damage without Character coefficients', () => {
  for (const fact of [
    CANTARELLA_TUNE_BREAK_FACT,
    CARTETHYIA_TUNE_BREAK_FACT,
    LUCILLA_TUNE_BREAK_FACT,
    GALBRENA_TUNE_BREAK_FACT,
    LYNAE_TUNE_BREAK_FACT,
  ]) {
    assert.equal(fact.section, 'TUNE_BREAK', fact.factId);
    assert.equal(fact.actionRole, 'SHARED_SYSTEM_DAMAGE', fact.factId);
    assert.equal(fact.damageClass, 'OTHER', fact.factId);
    assert.equal(fact.scalingStat, 'SHARED_SYSTEM', fact.factId);
    assert.equal(fact.motionValue, null, fact.factId);
    assert.equal(fact.motionValueCurve ?? null, null, fact.factId);
    assert.equal(fact.motionValueComponents ?? null, null, fact.factId);
    assert.equal(fact.sourceFixedMotionValue ?? null, null, fact.factId);
    assert.equal(fact.sourceFixedFlatDamage ?? null, null, fact.factId);
    assert.equal(fact.hitCount, null, fact.factId);
  }
});

test('twelfth batch advances canonical Character Mechanics coverage to 48 verified / 9 unstarted / 1623 facts', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 48);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.equal(audit.unstartedCharacterIds.length, 9);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1623);
  assert.deepEqual(audit.structuralIssues, []);

  for (const characterId of ['cantarella', 'cartethyia', 'lucilla', 'galbrena', 'lynae']) {
    assert.ok(audit.verifiedCharacterIds.includes(characterId), characterId);
    const raw = getCharacterPreflight(characterId, 'RAW_FACTS');
    const dps = getCharacterPreflight(characterId, 'DPS_MODEL');
    assert.ok(raw && dps, characterId);
    assert.equal(raw.checks.find((check) => check.area === 'CHARACTER_MECHANICS')?.status, 'PASS', characterId);
    assert.equal(dps.ready, false, characterId);
  }
});
