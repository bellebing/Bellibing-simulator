import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FACTORY_PROVIDER_REGISTRY,
  buildFactoryExceptionQueue,
  reconcileFactoryEvidence,
  validateFactoryProviderRegistry,
  type FactoryEvidenceCandidate,
} from '../src/factory/evidence.ts';

function candidate(
  providerId: string,
  state: FactoryEvidenceCandidate['evidenceState'],
  fingerprint: string | null,
): FactoryEvidenceCandidate {
  return {
    candidateId: `${providerId}-${state}-${fingerprint ?? 'none'}`,
    providerId,
    subjectId: 'fixture-subject',
    fieldId: 'fixture-field',
    evidenceState: state,
    semanticFingerprint: fingerprint,
    sourceRef: state === 'PRESENT' ? `${providerId}:fixture` : null,
    sourceVersion: 'fixture-v1',
    capturedAt: '2026-09-05T00:00:00Z',
  };
}

test('Factory provider registry keeps external sources non-canonical and blocks unlicensed ingestion', () => {
  validateFactoryProviderRegistry();
  assert.equal(FACTORY_PROVIDER_REGISTRY.every((provider) => provider.canonicalAuthority === false), true);

  const wuwabuild = FACTORY_PROVIDER_REGISTRY.find((provider) => provider.providerId === 'wuwabuild-reference');
  assert.ok(wuwabuild);
  assert.equal(wuwabuild.licenseStatus, 'UNLICENSED');
  assert.equal(wuwabuild.enabledForFactoryEvidence, false);
  assert.equal(wuwabuild.dataUsePolicy, 'REFERENCE_ONLY_NO_REUSE');
});

test('Factory classifies independent matching evidence as CONSENSUS without auto-promoting canonical truth', () => {
  const result = reconcileFactoryEvidence({
    subjectId: 'fixture-subject',
    fieldId: 'fixture-field',
    candidates: [candidate('provider-a', 'PRESENT', 'same-semantics'), candidate('provider-b', 'PRESENT', 'same-semantics')],
  });

  assert.equal(result.classification, 'CONSENSUS');
  assert.equal(result.route, 'REVIEW_CANDIDATE');
  assert.equal(result.canonicalPromotion, 'MANUAL_SOURCE_VALIDATION_REQUIRED');
  assert.deepEqual(result.presentProviderIds, ['provider-a', 'provider-b']);
});

test('Factory classifies one present provider as SINGLE_SOURCE even when another provider reports missing', () => {
  const result = reconcileFactoryEvidence({
    subjectId: 'fixture-subject',
    fieldId: 'fixture-field',
    candidates: [candidate('provider-a', 'PRESENT', 'one-semantics'), candidate('provider-b', 'MISSING', null)],
  });

  assert.equal(result.classification, 'SINGLE_SOURCE');
  assert.equal(result.route, 'REVIEW_CANDIDATE');
});

test('Factory routes disagreement, missing and unknown evidence to the exception queue', () => {
  const conflict = reconcileFactoryEvidence({
    subjectId: 'fixture-subject',
    fieldId: 'fixture-field',
    candidates: [candidate('provider-a', 'PRESENT', 'a'), candidate('provider-b', 'PRESENT', 'b')],
  });
  const missing = reconcileFactoryEvidence({
    subjectId: 'fixture-subject',
    fieldId: 'fixture-field',
    candidates: [candidate('provider-a', 'MISSING', null), candidate('provider-b', 'MISSING', null)],
  });
  const unknown = reconcileFactoryEvidence({
    subjectId: 'fixture-subject',
    fieldId: 'fixture-field',
    candidates: [candidate('provider-a', 'UNKNOWN', null)],
  });

  assert.equal(conflict.classification, 'CONFLICT');
  assert.equal(missing.classification, 'MISSING');
  assert.equal(unknown.classification, 'UNKNOWN');
  assert.deepEqual(buildFactoryExceptionQueue([conflict, missing, unknown]).map((row) => row.classification), [
    'CONFLICT',
    'MISSING',
    'UNKNOWN',
  ]);
});

test('Factory fails closed when one provider contradicts itself', () => {
  const result = reconcileFactoryEvidence({
    subjectId: 'fixture-subject',
    fieldId: 'fixture-field',
    candidates: [candidate('provider-a', 'PRESENT', 'a'), candidate('provider-a', 'PRESENT', 'b')],
  });

  assert.equal(result.classification, 'CONFLICT');
  assert.equal(result.route, 'EXCEPTION_QUEUE');
});

test('Factory rejects malformed PRESENT and non-present candidate semantics', () => {
  assert.throws(
    () => reconcileFactoryEvidence({
      subjectId: 'fixture-subject',
      fieldId: 'fixture-field',
      candidates: [candidate('provider-a', 'PRESENT', null)],
    }),
    /requires semanticFingerprint/,
  );

  assert.throws(
    () => reconcileFactoryEvidence({
      subjectId: 'fixture-subject',
      fieldId: 'fixture-field',
      candidates: [candidate('provider-a', 'UNKNOWN', 'invented')],
    }),
    /must not carry semanticFingerprint/,
  );
});
