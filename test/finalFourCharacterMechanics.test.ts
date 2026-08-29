import assert from 'node:assert/strict';
import test from 'node:test';

import { requireSingleCharacterDamageClass } from '../src/characterMechanicsDomain.ts';
import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  getCharacterActionFact,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';

const FINAL_FOUR = ['lucy', 'luuk-herssen', 'rebecca', 'zani'] as const;

test('final four source-reviewed profiles remain clean while three real blockers stay unstarted', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.deepEqual(audit.structuralIssues, []);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1866);
  assert.equal(audit.verifiedCharacterIds.length, 54);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.deepEqual(audit.unstartedCharacterIds, [
    'buling',
    'danjin',
    'xiangli-yao',
  ]);
  for (const characterId of FINAL_FOUR) {
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

test('Lucy and Rebecca retain source-facing Hack damage instead of coercing an old bucket', () => {
  const lucy = getCharacterActionFact('lucy-forte-circuit-depths-of-blackwall-hack-response-data-crash-dmg');
  const rebecca = getCharacterActionFact('rebecca-forte-circuit-gloves-are-comin-off-hack-response-meltdown-dmg');
  assert.ok(lucy && rebecca);
  assert.equal(lucy.damageClass, 'HACK');
  assert.equal(rebecca.damageClass, 'HACK');
  assert.equal(requireSingleCharacterDamageClass(lucy), 'HACK');
  assert.equal(requireSingleCharacterDamageClass(rebecca), 'HACK');
});

test('Rebecca preserves the reviewed Huntress bucket distinction and fixed Outro coefficient', () => {
  const huntress = getCharacterActionFact('rebecca-basic-attack-mix-n-match-heavy-attack-huntress-dmg');
  const eatLead = getCharacterActionFact('rebecca-basic-attack-mix-n-match-heavy-attack-eat-lead-huntress-dmg');
  const outro = getCharacterActionFact('rebecca-outro-preem-choom-turret-hit');
  assert.ok(huntress && eatLead && outro);
  assert.equal(huntress.actionKind, 'HEAVY');
  assert.equal(huntress.damageClass, 'BASIC');
  assert.equal(eatLead.actionKind, 'HEAVY');
  assert.equal(eatLead.damageClass, 'HEAVY');
  assert.equal(outro.sourceFixedMotionValue, 0.025);
});

test('Zani simultaneous Heavy Attack plus Spectro Frazzle taxonomy fails closed for single-class consumers', () => {
  const daybreak = getCharacterActionFact('zani-forte-circuit-there-will-be-a-light-heavy-slash-daybreak-dmg');
  const outro = getCharacterActionFact('zani-outro-beacon-for-the-future');
  assert.ok(daybreak && outro);
  assert.equal(daybreak.damageClass, null);
  assert.deepEqual(daybreak.damageClasses, ['HEAVY', 'SPECTRO_FRAZZLE']);
  assert.throws(
    () => requireSingleCharacterDamageClass(daybreak),
    /simultaneous source damage classes: HEAVY, SPECTRO_FRAZZLE/,
  );
  assert.equal(outro.damageClass, 'SPECTRO_FRAZZLE');
  assert.equal(outro.sourceFixedMotionValue, 1.5);
});

test('Luuk Herssen preserves literal Ichor Blade damage and fixed Outro without fabricated curves', () => {
  const ichor = getCharacterActionFact('luuk-herssen-forte-ichor-blade-fixed-damage');
  const outro = getCharacterActionFact('luuk-herssen-outro-bow-to-the-last-light');
  assert.ok(ichor && outro);
  assert.equal(ichor.sourceFixedFlatDamage, 10);
  assert.equal(ichor.scalingStat, 'FIXED');
  assert.equal(ichor.motionValueCurve ?? null, null);
  assert.equal(ichor.sourceFixedMotionValue ?? null, null);
  assert.equal(outro.sourceFixedMotionValue, 5);
});
