import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  getCharacterActionFact,
  getCharacterMechanicFact,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';

const RESOLVED = ['rover-electro', 'suisui'] as const;

test('final blocker resolution promotes only Rover Electro and Suisui', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.deepEqual(audit.structuralIssues, []);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1867);
  assert.equal(audit.verifiedCharacterIds.length, 54);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.deepEqual(audit.unstartedCharacterIds, [
    'buling',
    'danjin',
    'xiangli-yao',
  ]);

  for (const characterId of RESOLVED) {
    const profile = getCharacterMechanicsProfile(characterId);
    assert.ok(profile, characterId);
    assert.equal(profile.verificationStatus, 'VERIFIED', characterId);
    assert.ok(profile.coverage.every((area) => area.status === 'VERIFIED'), characterId);
    const tuneBreak = profile.factIds
      .map((factId) => CHARACTER_MECHANIC_FACT_BY_ID.get(factId))
      .filter((fact) => fact?.kind === 'ACTION' && fact.section === 'TUNE_BREAK');
    assert.equal(tuneBreak.length, 1, characterId);
  }
});

test('Rover Electro uses independently reconstructed current damage tables', () => {
  const thunderclap = getCharacterActionFact('rover-electro-skill-thunderclap');
  const liberation = getCharacterActionFact('rover-electro-liberation-ultimate-tactics');
  const thunderBane = getCharacterActionFact('rover-electro-forte-thunder-bane');
  const s6 = getCharacterMechanicFact('rover-electro-s6-minds-depths-in-a-casket');
  assert.ok(thunderclap && liberation && thunderBane);
  assert.deepEqual(thunderclap.motionValueCurve, [0.504,0.5453,0.5867,0.6445,0.6859,0.7334,0.7995,0.8656,0.9317,1.002]);
  assert.equal(thunderclap.hitCount, 2);
  assert.equal(liberation.motionValueCurve?.[0], 6);
  assert.equal(liberation.motionValueCurve?.[9], 11.9286);
  assert.equal(thunderBane.damageClass, 'SKILL');
  assert.equal(thunderBane.motionValueCurve?.[0], 0.2);
  assert.equal(thunderBane.motionValueCurve?.[9], 0.3977);
  assert.ok(s6 && s6.kind === 'SEQUENCE');
  assert.match(s6.effectSummary, /both Thrum of All Sounds and Thunder Bane/);
});

test('Rover Electro and Suisui expose current shared-system Tune Break variants', () => {
  const roverTuneBreak = getCharacterActionFact('rover-electro-tune-break-sword');
  const suisuiTuneBreak = getCharacterActionFact('suisui-tune-break-rectifier');
  assert.ok(roverTuneBreak && suisuiTuneBreak);
  assert.equal(roverTuneBreak.actionRole, 'SHARED_SYSTEM_DAMAGE');
  assert.equal(roverTuneBreak.name, 'Tune Break — Sword');
  assert.equal(suisuiTuneBreak.actionRole, 'SHARED_SYSTEM_DAMAGE');
  assert.equal(suisuiTuneBreak.name, 'Tune Break — Rectifier');
  assert.equal(roverTuneBreak.motionValueCurve ?? null, null);
  assert.equal(suisuiTuneBreak.motionValueCurve ?? null, null);
});

test('Suisui locks current post-update tables and source-explicit HP scaling', () => {
  const midAir = getCharacterActionFact('suisui-basic-zephyr-mid-air');
  const awakening = getCharacterActionFact('suisui-skill-awakening-spring');
  const intro = getCharacterActionFact('suisui-intro-tinkling-jade');
  assert.ok(midAir && awakening && intro);
  assert.equal(midAir.motionValueCurve?.[0], 0.3557);
  assert.equal(midAir.motionValueCurve?.[9], 0.7072);
  assert.equal(awakening.scalingStat, 'HP');
  assert.equal(awakening.motionValueCurve?.[0], 0.144);
  assert.equal(awakening.motionValueCurve?.[9], 0.2863);
  assert.equal(intro.scalingStat, 'HP');
});
