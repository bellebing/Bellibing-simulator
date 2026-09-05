import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  buildWeaponRarityEvidenceReport,
  normalizeWeaponRarityEvidence,
  type FactoryWeaponRarityEvidenceSnapshot,
} from '../src/factory/providerMappings/weaponRarity.ts';

const SNAPSHOT_URL = new URL(
  '../data/factory/evidence/abyss-surges-rarity-2026-09-05.json',
  import.meta.url,
);

function loadSnapshot(): FactoryWeaponRarityEvidenceSnapshot {
  return JSON.parse(readFileSync(SNAPSHOT_URL, 'utf8')) as FactoryWeaponRarityEvidenceSnapshot;
}

function cloneSnapshot(): FactoryWeaponRarityEvidenceSnapshot {
  return structuredClone(loadSnapshot());
}

test('second Factory family reconciles categorical weapon rarity across reviewed providers', () => {
  const report = buildWeaponRarityEvidenceReport(loadSnapshot());

  assert.equal(report.reconciliation.classification, 'CONSENSUS');
  assert.equal(report.reconciliation.route, 'REVIEW_CANDIDATE');
  assert.equal(report.reconciliation.canonicalPromotion, 'MANUAL_SOURCE_VALIDATION_REQUIRED');
  assert.deepEqual(report.reconciliation.semanticFingerprints, ['weapon-rarity-v1:stars=5']);
  assert.deepEqual(report.exceptionQueue, []);
  assert.deepEqual(report.reconciliation.presentProviderIds, [
    'frequency-manager',
    'prydwen-profile-source',
  ]);
});

test('weapon rarity family routes provider disagreement to CONFLICT without choosing a winner', () => {
  const snapshot = cloneSnapshot();
  const frequencyManager = snapshot.providers.find((row) => row.providerId === 'frequency-manager');
  assert.ok(frequencyManager);
  (frequencyManager.raw as { rarity: number }).rarity = 4;

  const report = buildWeaponRarityEvidenceReport(snapshot);
  assert.equal(report.reconciliation.classification, 'CONFLICT');
  assert.equal(report.reconciliation.route, 'EXCEPTION_QUEUE');
  assert.equal(report.reconciliation.canonicalPromotion, 'MANUAL_SOURCE_VALIDATION_REQUIRED');
  assert.equal(report.exceptionQueue.length, 1);
});

test('weapon rarity family makes unparseable reviewed evidence UNKNOWN and keeps it fail-closed', () => {
  const snapshot = cloneSnapshot();
  const prydwen = snapshot.providers.find((row) => row.providerId === 'prydwen-profile-source');
  const frequencyManager = snapshot.providers.find((row) => row.providerId === 'frequency-manager');
  assert.ok(prydwen);
  assert.ok(frequencyManager);
  (prydwen.raw as { rarityLabel: string }).rarityLabel = 'five-star';
  (frequencyManager.raw as { rarity: number }).rarity = 0;

  const candidates = normalizeWeaponRarityEvidence(snapshot);
  assert.ok(candidates.every((candidate) => candidate.evidenceState === 'UNKNOWN'));

  const report = buildWeaponRarityEvidenceReport(snapshot);
  assert.equal(report.reconciliation.classification, 'UNKNOWN');
  assert.equal(report.reconciliation.route, 'EXCEPTION_QUEUE');
  assert.equal(report.reconciliation.canonicalPromotion, 'MANUAL_SOURCE_VALIDATION_REQUIRED');
});
