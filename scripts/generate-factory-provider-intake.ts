import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
import {
  buildFactoryEvidenceReportFromSnapshots,
  renderFactoryEvidenceReportJson,
  renderFactoryEvidenceReportMarkdown,
} from '../src/factory/reporting.ts';

function readArg(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] ?? null : null;
}

function requireArg(name: string): string {
  const value = readArg(name);
  if (value === null || value.trim().length === 0) throw new Error(`Factory provider intake: ${name} is required`);
  return value;
}

function loadSnapshot(path: string): FactoryFrequencyManagerSupportedSnapshot {
  return JSON.parse(readFileSync(path, 'utf8')) as FactoryFrequencyManagerSupportedSnapshot;
}

const sourceFile = resolve(requireArg('--source-file'));
const upstreamCommit = requireArg('--upstream-commit');
const capturedAt = readArg('--captured-at') ?? new Date().toISOString();
const outputDir = resolve(readArg('--output-dir') ?? 'data/generated/factory-provider-intake');

const baselines = [
  loadSnapshot(resolve('data/factory/evidence/abyss-surges-rarity-2026-09-05.json')),
  loadSnapshot(resolve('data/factory/evidence/ages-of-harvest-r1-attribute-dmg-2026-09-05.json')),
] as const;

const artifact: FrequencyManagerProviderSourceArtifact = {
  schemaVersion: 1,
  providerId: FACTORY_FREQUENCY_MANAGER_PROVIDER_ID,
  upstreamRepository: FACTORY_FREQUENCY_MANAGER_REPOSITORY,
  upstreamCommit,
  sourcePath: FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH,
  capturedAt,
  sourceText: readFileSync(sourceFile, 'utf8'),
};

const bundle = buildFactoryFrequencyManagerProviderIntake(artifact, baselines);
const evidenceReport = buildFactoryEvidenceReportFromSnapshots(bundle.snapshots);
const evidenceDir = resolve(outputDir, 'evidence');
mkdirSync(evidenceDir, { recursive: true });

for (const snapshot of bundle.snapshots) {
  const filename = snapshot.familyId === 'weapon-rarity-v1'
    ? 'abyss-surges-rarity.json'
    : 'ages-of-harvest-r1-attribute-dmg.json';
  writeFileSync(resolve(evidenceDir, filename), `${JSON.stringify(snapshot, null, 2)}\n`);
}

writeFileSync(resolve(outputDir, 'frequency-manager-intake-report.json'), renderFactoryProviderIntakeJson(bundle.report));
writeFileSync(resolve(outputDir, 'frequency-manager-intake-report.md'), renderFactoryProviderIntakeMarkdown(bundle.report));
writeFileSync(resolve(outputDir, 'factory-evidence-report.json'), renderFactoryEvidenceReportJson(evidenceReport));
writeFileSync(resolve(outputDir, 'factory-evidence-report.md'), renderFactoryEvidenceReportMarkdown(evidenceReport));

console.log(`Factory provider intake: ${bundle.report.reviewCandidateKeys.length} review candidate(s), ${bundle.report.exceptionQueueKeys.length} exception(s).`);
console.log(`Factory provider intake: upstream ${bundle.report.upstreamRepository}@${bundle.report.upstreamCommit}.`);
console.log(`Factory provider intake: wrote review artifacts to ${outputDir}.`);
