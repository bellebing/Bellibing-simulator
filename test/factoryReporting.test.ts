import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  buildFactoryEvidenceReport,
  buildFactoryEvidenceReportFromSnapshots,
  renderFactoryEvidenceReportJson,
  renderFactoryEvidenceReportMarkdown,
} from '../src/factory/reporting.ts';
import { reconcileFactoryEvidence } from '../src/factory/evidence.ts';
import type { FactoryWeaponAttributeDmgEvidenceSnapshot } from '../src/factory/providerMappings/weaponAttributeDmg.ts';

const SNAPSHOT_URL = new URL(
  '../data/factory/evidence/ages-of-harvest-r1-attribute-dmg-2026-09-05.json',
  import.meta.url,
);
const GENERATED_JSON_URL = new URL('../data/generated/factory-evidence-report.json', import.meta.url);
const GENERATED_MD_URL = new URL('../docs/generated/FACTORY_EVIDENCE_REPORT.md', import.meta.url);

function loadSnapshot(): FactoryWeaponAttributeDmgEvidenceSnapshot {
  return JSON.parse(readFileSync(SNAPSHOT_URL, 'utf8')) as FactoryWeaponAttributeDmgEvidenceSnapshot;
}

test('Factory evidence report is deterministic, provenance-rich, and keeps manual promotion boundary', () => {
  const report = buildFactoryEvidenceReportFromSnapshots([loadSnapshot()]);

  assert.deepEqual(report.summary, {
    totalReconciliations: 1,
    reviewCandidates: 1,
    exceptionQueue: 0,
    classifications: {
      CONSENSUS: 1,
      SINGLE_SOURCE: 0,
      CONFLICT: 0,
      MISSING: 0,
      UNKNOWN: 0,
    },
  });
  assert.deepEqual(report.reviewCandidateKeys, [
    'ages-of-harvest::r1.attribute-dmg-bonus.value',
  ]);
  assert.deepEqual(report.exceptionQueueKeys, []);
  assert.equal(report.canonicalPromotionPolicy, 'MANUAL_SOURCE_VALIDATION_REQUIRED');
  assert.deepEqual(report.reconciliations[0]?.candidates.map((candidate) => candidate.providerId), [
    'frequency-manager',
    'prydwen-profile-source',
  ]);
  assert.ok(report.reconciliations[0]?.candidates.every((candidate) => candidate.sourceRef));
  assert.ok(report.reconciliations[0]?.candidates.every((candidate) => candidate.sourceVersion));
});

test('checked-in Factory report artifacts exactly match deterministic renderers', () => {
  const report = buildFactoryEvidenceReportFromSnapshots([loadSnapshot()]);
  assert.equal(readFileSync(GENERATED_JSON_URL, 'utf8'), renderFactoryEvidenceReportJson(report));
  assert.equal(readFileSync(GENERATED_MD_URL, 'utf8'), renderFactoryEvidenceReportMarkdown(report));
});

test('Factory evidence report sorts reconciliations and rejects duplicate subject-field keys', () => {
  const later = reconcileFactoryEvidence({
    subjectId: 'z-subject',
    fieldId: 'field-b',
    candidates: [],
  });
  const earlier = reconcileFactoryEvidence({
    subjectId: 'a-subject',
    fieldId: 'field-a',
    candidates: [],
  });

  const report = buildFactoryEvidenceReport([later, earlier]);
  assert.deepEqual(report.reconciliations.map((row) => `${row.subjectId}/${row.fieldId}`), [
    'a-subject/field-a',
    'z-subject/field-b',
  ]);
  assert.deepEqual(report.exceptionQueueKeys, [
    'a-subject::field-a',
    'z-subject::field-b',
  ]);

  assert.throws(
    () => buildFactoryEvidenceReport([earlier, earlier]),
    /duplicate reconciliation key a-subject::field-a/,
  );
});

test('Factory evidence snapshot registry fails closed for an unreviewed family', () => {
  const snapshot = {
    ...loadSnapshot(),
    familyId: 'unreviewed-family-v1',
  };

  assert.throws(
    () => buildFactoryEvidenceReportFromSnapshots([snapshot]),
    /no reviewed mapper registered for family unreviewed-family-v1/,
  );
});

test('Factory markdown report exposes review routing and provenance without claiming canonical truth', () => {
  const markdown = renderFactoryEvidenceReportMarkdown(
    buildFactoryEvidenceReportFromSnapshots([loadSnapshot()]),
  );

  assert.match(markdown, /CONSENSUS/);
  assert.match(markdown, /REVIEW_CANDIDATE/);
  assert.match(markdown, /f585e47a868cb2b65845367b976a1781f130c758/);
  assert.match(markdown, /MANUAL_SOURCE_VALIDATION_REQUIRED/);
  assert.match(markdown, /never promotes provider evidence into canonical Bellibing runtime truth/);
});
