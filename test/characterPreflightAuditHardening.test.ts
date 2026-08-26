import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import { getCharacterMechanicsPreflightCheck } from '../src/data/characterPreflight.ts';

test('RAW Character Mechanics preflight cannot PASS when the canonical structural audit rejects the character', () => {
  const cleanAudit = auditCharacterMechanicsCoverage();
  const invalidAudit = {
    ...cleanAudit,
    structuralIssues: [
      ...cleanAudit.structuralIssues,
      { characterId: 'aalto', issue: 'synthetic malformed VERIFIED fact' },
    ],
  };

  const check = getCharacterMechanicsPreflightCheck('aalto', invalidAudit);
  assert.equal(check.status, 'PENDING');
  assert.match(check.details.join(' '), /Structural audit: synthetic malformed VERIFIED fact/);
});
