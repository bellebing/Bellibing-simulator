import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  FACTORY_FREQUENCY_MANAGER_PROVIDER_ID,
  FACTORY_FREQUENCY_MANAGER_REPOSITORY,
  FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH,
  buildFactoryFrequencyManagerProviderIntake,
  type FactoryFrequencyManagerSupportedSnapshot,
  type FrequencyManagerProviderSourceArtifact,
} from '../src/factory/providerIntake/frequencyManager.ts';
import {
  buildFactoryProviderRefreshFailureTriage,
  buildFactoryProviderRefreshTriage,
  renderFactoryProviderRefreshTriageJson,
  renderFactoryProviderRefreshTriageMarkdown,
} from '../src/factory/providerIntake/refreshTriage.ts';

const UPSTREAM_SHA = 'f585e47a868cb2b65845367b976a1781f130c758';
const NEW_UPSTREAM_SHA = '1111111111111111111111111111111111111111';
const PROVIDER_REF = 'master';
const FIXTURE_URL = new URL('../fixtures/factory/frequency-manager/weapons-pinned-f585e47.ts', import.meta.url);
const RARITY_BASELINE_URL = new URL('../data/factory/evidence/abyss-surges-rarity-2026-09-05.json', import.meta.url);
const ATTRIBUTE_BASELINE_URL = new URL('../data/factory/evidence/ages-of-harvest-r1-attribute-dmg-2026-09-05.json', import.meta.url);
const SCRIPT_URL = new URL('../scripts/generate-factory-provider-intake.ts', import.meta.url);
const REPO_ROOT_URL = new URL('../', import.meta.url);

function loadBaseline(url: URL): FactoryFrequencyManagerSupportedSnapshot {
  return JSON.parse(readFileSync(url, 'utf8')) as FactoryFrequencyManagerSupportedSnapshot;
}

function baselines(): readonly FactoryFrequencyManagerSupportedSnapshot[] {
  return [loadBaseline(RARITY_BASELINE_URL), loadBaseline(ATTRIBUTE_BASELINE_URL)];
}

function artifact(input?: {
  readonly sourceText?: string;
  readonly upstreamCommit?: string;
  readonly capturedAt?: string;
}): FrequencyManagerProviderSourceArtifact {
  return {
    schemaVersion: 1,
    providerId: FACTORY_FREQUENCY_MANAGER_PROVIDER_ID,
    upstreamRepository: FACTORY_FREQUENCY_MANAGER_REPOSITORY,
    upstreamCommit: input?.upstreamCommit ?? UPSTREAM_SHA,
    sourcePath: FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH,
    capturedAt: input?.capturedAt ?? '2026-09-06T07:00:00Z',
    sourceText: input?.sourceText ?? readFileSync(FIXTURE_URL, 'utf8'),
  };
}

function triage(input?: Parameters<typeof artifact>[0]) {
  const intake = buildFactoryFrequencyManagerProviderIntake(artifact(input), baselines()).report;
  return buildFactoryProviderRefreshTriage(intake, baselines(), PROVIDER_REF);
}

test('unchanged bounded refresh produces NO_REVIEW_REQUIRED without changing M04 evidence routing', () => {
  const intake = buildFactoryFrequencyManagerProviderIntake(artifact(), baselines()).report;
  const report = buildFactoryProviderRefreshTriage(intake, baselines(), PROVIDER_REF);

  assert.equal(report.disposition, 'NO_REVIEW_REQUIRED');
  assert.equal(report.attentionRequired, false);
  assert.equal(report.upstreamCommit, UPSTREAM_SHA);
  assert.equal(report.providerRef, 'master');
  assert.deepEqual(report.targets.map((target) => target.refreshStatus), ['UNCHANGED', 'UNCHANGED']);
  assert.ok(intake.targets.every((target) => target.effectiveRoute === 'REVIEW_CANDIDATE'));
  assert.ok(report.targets.every((target) => target.baseline.sourceVersion === UPSTREAM_SHA));
});

test('semantic triage is byte-stable across volatile capture timestamps', () => {
  const first = triage({ capturedAt: '2026-09-06T07:00:00Z' });
  const second = triage({ capturedAt: '2026-09-06T11:59:59Z' });

  assert.equal(renderFactoryProviderRefreshTriageJson(first), renderFactoryProviderRefreshTriageJson(second));
  assert.equal(renderFactoryProviderRefreshTriageMarkdown(first), renderFactoryProviderRefreshTriageMarkdown(second));
  assert.doesNotMatch(renderFactoryProviderRefreshTriageJson(first), /capturedAt/);
});

test('new exact upstream SHA with identical bounded semantic facts remains NO_REVIEW_REQUIRED', () => {
  const report = triage({ upstreamCommit: NEW_UPSTREAM_SHA });

  assert.equal(report.disposition, 'NO_REVIEW_REQUIRED');
  assert.equal(report.attentionRequired, false);
  assert.equal(report.upstreamCommit, NEW_UPSTREAM_SHA);
  assert.ok(report.targets.every((target) => target.refreshStatus === 'UNCHANGED'));
  assert.ok(report.targets.every((target) => target.current.sourceVersion === NEW_UPSTREAM_SHA));
  assert.ok(report.targets.every((target) => target.baseline.sourceVersion === UPSTREAM_SHA));
});

test('changed bounded value produces REVIEW_REQUIRED', () => {
  const sourceText = readFileSync(FIXTURE_URL, 'utf8').replace(
    'id: "abyss-surges", name: "Abyss Surges", weaponType: "Gauntlets", rarity: 5',
    'id: "abyss-surges", name: "Abyss Surges", weaponType: "Gauntlets", rarity: 4',
  );
  const report = triage({ sourceText });

  assert.equal(report.disposition, 'REVIEW_REQUIRED');
  assert.equal(report.attentionRequired, true);
  assert.equal(report.targets.find((target) => target.subjectId === 'abyss-surges')?.refreshStatus, 'SOURCE_CHANGED');
});

test('missing bounded value produces REVIEW_REQUIRED', () => {
  const sourceText = readFileSync(FIXTURE_URL, 'utf8').replace(/^.*id: "abyss-surges".*\n/m, '');
  const report = triage({ sourceText });

  assert.equal(report.disposition, 'REVIEW_REQUIRED');
  assert.equal(report.attentionRequired, true);
  assert.equal(report.targets.find((target) => target.subjectId === 'abyss-surges')?.refreshStatus, 'SOURCE_MISSING');
});

test('unknown bounded value produces REVIEW_REQUIRED', () => {
  const sourceText = readFileSync(FIXTURE_URL, 'utf8').replace(
    'id: "abyss-surges", name: "Abyss Surges", weaponType: "Gauntlets", rarity: 5',
    'id: "abyss-surges", name: "Abyss Surges", weaponType: "Gauntlets", rarity: "five"',
  );
  const report = triage({ sourceText });

  assert.equal(report.disposition, 'REVIEW_REQUIRED');
  assert.equal(report.attentionRequired, true);
  assert.equal(report.targets.find((target) => target.subjectId === 'abyss-surges')?.refreshStatus, 'SOURCE_UNKNOWN');
});

test('pre-intake failure is REFRESH_FAILURE and fabricates no target reconciliation data', () => {
  const report = buildFactoryProviderRefreshFailureTriage({
    stage: 'PROVENANCE_RESOLUTION',
    code: 'PROVENANCE_RESOLUTION_FAILED',
    providerRef: PROVIDER_REF,
  });
  const json = renderFactoryProviderRefreshTriageJson(report);

  assert.equal(report.disposition, 'REFRESH_FAILURE');
  assert.equal(report.attentionRequired, true);
  assert.equal(report.upstreamCommit, null);
  assert.deepEqual(report.targets, []);
  assert.doesNotMatch(json, /reconciliation/);
  assert.match(renderFactoryProviderRefreshTriageMarkdown(report), /No Factory evidence classification or reconciliation was fabricated/);
});

test('global intake execution failure writes REFRESH_FAILURE triage and no fabricated reconciliation', () => {
  const outputDir = mkdtempSync(join(tmpdir(), 'bellibing-factory-triage-'));
  try {
    const result = spawnSync(process.execPath, [
      '--experimental-strip-types',
      fileURLToPath(SCRIPT_URL),
      '--source-file', fileURLToPath(FIXTURE_URL),
      '--upstream-commit', 'main',
      '--provider-ref', PROVIDER_REF,
      '--output-dir', outputDir,
    ], {
      cwd: fileURLToPath(REPO_ROOT_URL),
      encoding: 'utf8',
    });

    assert.equal(result.status, 1);
    const report = JSON.parse(readFileSync(join(outputDir, 'frequency-manager-refresh-triage.json'), 'utf8')) as {
      readonly disposition: string;
      readonly attentionRequired: boolean;
      readonly targets: readonly unknown[];
      readonly failure?: { readonly stage?: string };
    };
    const json = JSON.stringify(report);

    assert.equal(report.disposition, 'REFRESH_FAILURE');
    assert.equal(report.attentionRequired, true);
    assert.equal(report.failure?.stage, 'INTAKE_EXECUTION');
    assert.deepEqual(report.targets, []);
    assert.doesNotMatch(json, /reconciliation/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});
