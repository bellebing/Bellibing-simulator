import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ECHO_RAW_SOURCE_REVIEW_V36,
  auditEchoRawRoster,
} from '../src/data/echoRawAudit.ts';
import { ECHO_CATALOG_META } from '../src/data/echoCatalogMeta.ts';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_CATALOG } from '../src/data/sonatas.ts';

test('Version 3.6 Echo/Sonata raw roster is fully current with no source conflicts', () => {
  const audit = auditEchoRawRoster();

  assert.equal(audit.echoCatalogCount, 181);
  assert.equal(audit.releasedEchoCount, 181);
  assert.equal(audit.sonataCatalogCount, 34);
  assert.equal(audit.releasedSonataCount, 34);
  assert.equal(audit.verifiedCurrentEchoCount, 181);
  assert.equal(audit.verifiedCurrentSonataCount, 34);
  assert.equal(audit.sourceConflictCount, 0);
  assert.deepEqual(audit.issues, []);
});

test('raw roster gate fails closed when an Echo disappears', () => {
  const audit = auditEchoRawRoster(ECHO_CATALOG.slice(1), SONATA_CATALOG);
  assert.ok(audit.issues.some((issue) => issue.code === 'CATALOG_COUNT_MISMATCH'));
  assert.ok(audit.issues.some((issue) => issue.code === 'RELEASED_COUNT_MISMATCH'));
  assert.ok(audit.issues.some((issue) => issue.code === 'SNAPSHOT_META_MISMATCH'));
});

test('raw roster gate rejects stale or missing Sonata membership references', () => {
  const broken = ECHO_CATALOG.map((echo) => echo.id === 'echo-60002215'
    ? { ...echo, sonataSetIds: ['sonata-999999'] as const }
    : echo);
  const audit = auditEchoRawRoster(broken, SONATA_CATALOG);

  assert.ok(audit.issues.some((issue) => issue.code === 'MEMBERSHIP_REFERENCE_MISSING' && issue.recordId === 'echo-60002215'));
});

test('raw roster gate catches duplicate stable source identities', () => {
  const duplicateSourceId = ECHO_CATALOG.map((echo, index) => index === 1
    ? { ...echo, sourceId: ECHO_CATALOG[0].sourceId }
    : echo);
  const audit = auditEchoRawRoster(duplicateSourceId, SONATA_CATALOG);

  assert.ok(audit.issues.some((issue) => issue.code === 'DUPLICATE_SOURCE_ID'));
});

test('raw roster gate rejects an unreviewed snapshot-meta advance', () => {
  const audit = auditEchoRawRoster(ECHO_CATALOG, SONATA_CATALOG, {
    ...ECHO_CATALOG_META,
    sourceCommit: '1111111111111111111111111111111111111111',
  });

  assert.ok(audit.issues.some((issue) => issue.code === 'SNAPSHOT_META_MISMATCH'));
});

test('registered source conflicts are explicit and cannot count as VERIFIED_CURRENT', () => {
  const conflict = {
    scope: 'ECHO' as const,
    recordId: 'echo-60002215',
    fields: ['sonataSetIds'] as const,
    detail: 'Synthetic regression fixture for conflict handling.',
    sourceUrls: ['https://example.invalid/source-a', 'https://example.invalid/source-b'] as const,
  };
  const review = {
    ...ECHO_RAW_SOURCE_REVIEW_V36,
    sourceConflicts: [conflict],
  };
  const audit = auditEchoRawRoster(ECHO_CATALOG, SONATA_CATALOG, ECHO_CATALOG_META, review);

  assert.equal(audit.sourceConflictCount, 1);
  assert.equal(audit.verifiedCurrentEchoCount, 180);
  assert.equal(audit.issues.some((issue) => issue.code === 'SOURCE_CONFLICT_MARKED_VERIFIED'), false);

  const falselyVerified = ECHO_CATALOG.map((echo) => echo.id === conflict.recordId
    ? { ...echo, verificationStatus: 'VERIFIED' as const }
    : echo);
  const falseAudit = auditEchoRawRoster(falselyVerified, SONATA_CATALOG, ECHO_CATALOG_META, review);
  assert.ok(falseAudit.issues.some((issue) => issue.code === 'SOURCE_CONFLICT_MARKED_VERIFIED'));
});
