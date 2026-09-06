import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  FACTORY_FREQUENCY_MANAGER_PROVIDER_ID,
  FACTORY_FREQUENCY_MANAGER_REPOSITORY,
  FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH,
  buildFactoryFrequencyManagerProviderIntake,
  type FactoryFrequencyManagerSupportedSnapshot,
  type FrequencyManagerProviderSourceArtifact,
} from '../src/factory/providerIntake/frequencyManager.ts';
import { buildFactoryEvidenceReportFromSnapshots } from '../src/factory/reporting.ts';

const UPSTREAM_SHA = 'f585e47a868cb2b65845367b976a1781f130c758';
const REFRESH_CAPTURED_AT = '2026-09-06T07:00:00Z';
const FIXTURE_URL = new URL('../fixtures/factory/frequency-manager/weapons-pinned-f585e47.ts', import.meta.url);
const BASELINE_URLS = [
  new URL('../data/factory/evidence/abyss-surges-rarity-2026-09-05.json', import.meta.url),
  new URL('../data/factory/evidence/ages-of-harvest-r1-attribute-dmg-2026-09-05.json', import.meta.url),
] as const;

function loadBaselines(): readonly FactoryFrequencyManagerSupportedSnapshot[] {
  return BASELINE_URLS.map((url) => JSON.parse(readFileSync(url, 'utf8')) as FactoryFrequencyManagerSupportedSnapshot);
}

function artifact(): FrequencyManagerProviderSourceArtifact {
  return {
    schemaVersion: 1,
    providerId: FACTORY_FREQUENCY_MANAGER_PROVIDER_ID,
    upstreamRepository: FACTORY_FREQUENCY_MANAGER_REPOSITORY,
    upstreamCommit: UPSTREAM_SHA,
    sourcePath: FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH,
    capturedAt: REFRESH_CAPTURED_AT,
    sourceText: readFileSync(FIXTURE_URL, 'utf8'),
  };
}

test('provider refresh keeps reviewed-anchor capture time and records the fresh provider capture time separately', () => {
  const baselines = loadBaselines();
  const bundle = buildFactoryFrequencyManagerProviderIntake(artifact(), baselines);
  const evidenceReport = buildFactoryEvidenceReportFromSnapshots(bundle.snapshots);

  for (const reconciliation of evidenceReport.reconciliations) {
    const baseline = baselines.find((snapshot) => (
      snapshot.subjectId === reconciliation.subjectId && snapshot.fieldId === reconciliation.fieldId
    ));
    assert.ok(baseline);

    const prydwen = reconciliation.candidates.find((candidate) => candidate.providerId === 'prydwen-profile-source');
    const frequencyManager = reconciliation.candidates.find((candidate) => candidate.providerId === FACTORY_FREQUENCY_MANAGER_PROVIDER_ID);
    assert.ok(prydwen);
    assert.ok(frequencyManager);
    assert.equal(prydwen.capturedAt, baseline.capturedAt);
    assert.equal(frequencyManager.capturedAt, REFRESH_CAPTURED_AT);
  }
});
