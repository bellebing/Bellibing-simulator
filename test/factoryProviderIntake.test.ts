import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  FACTORY_FREQUENCY_MANAGER_PROVIDER_ID,
  FACTORY_FREQUENCY_MANAGER_REPOSITORY,
  FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH,
  buildFactoryFrequencyManagerProviderIntake,
  renderFactoryProviderIntakeJson,
  renderFactoryProviderIntakeMarkdown,
  type FactoryFrequencyManagerSupportedSnapshot,
  type FrequencyManagerProviderSourceArtifact,
} from '../src/factory/providerIntake/frequencyManager.ts';
import { buildFactoryEvidenceReportFromSnapshots } from '../src/factory/reporting.ts';

const UPSTREAM_SHA = 'f585e47a868cb2b65845367b976a1781f130c758';
const CAPTURED_AT = '2026-09-06T07:00:00Z';
const FIXTURE_URL = new URL('../fixtures/factory/frequency-manager/weapons-pinned-f585e47.ts', import.meta.url);
const RARITY_BASELINE_URL = new URL('../data/factory/evidence/abyss-surges-rarity-2026-09-05.json', import.meta.url);
const ATTRIBUTE_BASELINE_URL = new URL('../data/factory/evidence/ages-of-harvest-r1-attribute-dmg-2026-09-05.json', import.meta.url);

function loadBaseline(url: URL): FactoryFrequencyManagerSupportedSnapshot {
  return JSON.parse(readFileSync(url, 'utf8')) as FactoryFrequencyManagerSupportedSnapshot;
}

function baselines(): readonly FactoryFrequencyManagerSupportedSnapshot[] {
  return [loadBaseline(RARITY_BASELINE_URL), loadBaseline(ATTRIBUTE_BASELINE_URL)];
}

function artifact(sourceText = readFileSync(FIXTURE_URL, 'utf8')): FrequencyManagerProviderSourceArtifact {
  return {
    schemaVersion: 1,
    providerId: FACTORY_FREQUENCY_MANAGER_PROVIDER_ID,
    upstreamRepository: FACTORY_FREQUENCY_MANAGER_REPOSITORY,
    upstreamCommit: UPSTREAM_SHA,
    sourcePath: FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH,
    capturedAt: CAPTURED_AT,
    sourceText,
  };
}

test('Factory Provider Intake refreshes both existing reviewed families from a pinned FrequencyManager source artifact', () => {
  const bundle = buildFactoryFrequencyManagerProviderIntake(artifact(), baselines());
  const report = buildFactoryEvidenceReportFromSnapshots(bundle.snapshots);

  assert.deepEqual(bundle.report.reviewCandidateKeys, [
    'abyss-surges::rarity.stars',
    'ages-of-harvest::r1.attribute-dmg-bonus.value',
  ]);
  assert.deepEqual(bundle.report.exceptionQueueKeys, []);
  assert.equal(bundle.report.canonicalPromotionPolicy, 'MANUAL_SOURCE_VALIDATION_REQUIRED');
  assert.ok(bundle.report.targets.every((row) => row.refreshStatus === 'UNCHANGED'));
  assert.ok(bundle.report.targets.every((row) => row.reconciliation.classification === 'CONSENSUS'));
  assert.ok(bundle.report.targets.every((row) => row.effectiveRoute === 'REVIEW_CANDIDATE'));
  assert.equal(report.summary.totalReconciliations, 2);
  assert.equal(report.summary.reviewCandidates, 2);
  assert.equal(report.summary.exceptionQueue, 0);

  const frequencyManagerCandidates = report.reconciliations
    .flatMap((row) => row.candidates)
    .filter((candidate) => candidate.providerId === FACTORY_FREQUENCY_MANAGER_PROVIDER_ID);
  assert.equal(frequencyManagerCandidates.length, 2);
  assert.ok(frequencyManagerCandidates.every((candidate) => candidate.sourceVersion === UPSTREAM_SHA));
  assert.ok(frequencyManagerCandidates.every((candidate) => candidate.sourceRef?.includes(`/blob/${UPSTREAM_SHA}/`)));
});

test('Provider intake renderers are deterministic for the same pinned artifact and expose no canonical promotion', () => {
  const first = buildFactoryFrequencyManagerProviderIntake(artifact(), baselines()).report;
  const second = buildFactoryFrequencyManagerProviderIntake(artifact(), baselines()).report;
  assert.equal(renderFactoryProviderIntakeJson(first), renderFactoryProviderIntakeJson(second));
  assert.equal(renderFactoryProviderIntakeMarkdown(first), renderFactoryProviderIntakeMarkdown(second));
  assert.match(renderFactoryProviderIntakeMarkdown(first), /MANUAL_SOURCE_VALIDATION_REQUIRED/);
  assert.match(renderFactoryProviderIntakeMarkdown(first), /never promotes or mutates canonical Bellibing runtime truth/);
});

test('a valid upstream rarity value change becomes explicit SOURCE_CHANGED and CONFLICT exception review', () => {
  const source = readFileSync(FIXTURE_URL, 'utf8').replace(
    'id: "abyss-surges", name: "Abyss Surges", weaponType: "Gauntlets", rarity: 5',
    'id: "abyss-surges", name: "Abyss Surges", weaponType: "Gauntlets", rarity: 4',
  );
  const bundle = buildFactoryFrequencyManagerProviderIntake(artifact(source), baselines());
  const rarity = bundle.report.targets.find((row) => row.subjectId === 'abyss-surges');
  assert.ok(rarity);
  assert.equal(rarity.refreshStatus, 'SOURCE_CHANGED');
  assert.equal(rarity.reconciliation.classification, 'CONFLICT');
  assert.equal(rarity.reconciliation.route, 'EXCEPTION_QUEUE');
  assert.equal(rarity.effectiveRoute, 'EXCEPTION_QUEUE');
  assert.deepEqual(bundle.report.exceptionQueueKeys, ['abyss-surges::rarity.stars']);
});

test('a missing refreshed provider row is forced into intake exception review even when generic reconciliation is SINGLE_SOURCE', () => {
  const source = readFileSync(FIXTURE_URL, 'utf8').replace(/^.*id: "abyss-surges".*\n/m, '');
  const bundle = buildFactoryFrequencyManagerProviderIntake(artifact(source), baselines());
  const rarity = bundle.report.targets.find((row) => row.subjectId === 'abyss-surges');
  assert.ok(rarity);
  assert.equal(rarity.refreshStatus, 'SOURCE_MISSING');
  assert.equal(rarity.reconciliation.classification, 'SINGLE_SOURCE');
  assert.equal(rarity.reconciliation.route, 'REVIEW_CANDIDATE');
  assert.equal(rarity.effectiveRoute, 'EXCEPTION_QUEUE');
  assert.deepEqual(bundle.report.exceptionQueueKeys, ['abyss-surges::rarity.stars']);
});

test('an unparseable refreshed provider value becomes SOURCE_UNKNOWN and intake exception review', () => {
  const source = readFileSync(FIXTURE_URL, 'utf8').replace(
    'id: "abyss-surges", name: "Abyss Surges", weaponType: "Gauntlets", rarity: 5',
    'id: "abyss-surges", name: "Abyss Surges", weaponType: "Gauntlets", rarity: "five"',
  );
  const bundle = buildFactoryFrequencyManagerProviderIntake(artifact(source), baselines());
  const rarity = bundle.report.targets.find((row) => row.subjectId === 'abyss-surges');
  assert.ok(rarity);
  assert.equal(rarity.refreshStatus, 'SOURCE_UNKNOWN');
  assert.equal(rarity.effectiveRoute, 'EXCEPTION_QUEUE');
  assert.deepEqual(bundle.report.exceptionQueueKeys, ['abyss-surges::rarity.stars']);
});

test('provider intake rejects non-exact upstream SHAs before evidence generation', () => {
  const invalid = { ...artifact(), upstreamCommit: 'main' };
  assert.throws(
    () => buildFactoryFrequencyManagerProviderIntake(invalid, baselines()),
    /upstreamCommit must be an exact 40-character Git SHA/,
  );
});
