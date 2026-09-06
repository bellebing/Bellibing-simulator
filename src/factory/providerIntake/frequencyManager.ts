import type { FactoryEvidenceReconciliation } from '../evidence.ts';
import { reconcileFactoryEvidenceSnapshot } from '../providerMappings/index.ts';
import {
  FACTORY_WEAPON_R1_ATTRIBUTE_DMG_FAMILY_ID,
  type FactoryWeaponAttributeDmgEvidenceSnapshot,
  type FactoryWeaponAttributeDmgRawRow,
} from '../providerMappings/weaponAttributeDmg.ts';
import {
  FACTORY_WEAPON_RARITY_FAMILY_ID,
  type FactoryWeaponRarityEvidenceSnapshot,
  type FactoryWeaponRarityRawRow,
} from '../providerMappings/weaponRarity.ts';

export const FACTORY_FREQUENCY_MANAGER_PROVIDER_ID = 'frequency-manager' as const;
export const FACTORY_FREQUENCY_MANAGER_REPOSITORY = 'Voruzhu/FrequencyManager' as const;
export const FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH = 'adapters/game-definitions/wuthering-waves/weapons.ts' as const;
export const FACTORY_PROVIDER_INTAKE_GENERATOR = 'factory-provider-intake-refresh-v1' as const;

export type FactoryFrequencyManagerSupportedSnapshot =
  | FactoryWeaponRarityEvidenceSnapshot
  | FactoryWeaponAttributeDmgEvidenceSnapshot;

export type FactoryProviderRefreshStatus =
  | 'UNCHANGED'
  | 'SOURCE_CHANGED'
  | 'SOURCE_MISSING'
  | 'SOURCE_UNKNOWN';

export type FactoryProviderIntakeRoute = 'REVIEW_CANDIDATE' | 'EXCEPTION_QUEUE';

export interface FrequencyManagerProviderSourceArtifact {
  readonly schemaVersion: 1;
  readonly providerId: typeof FACTORY_FREQUENCY_MANAGER_PROVIDER_ID;
  readonly upstreamRepository: typeof FACTORY_FREQUENCY_MANAGER_REPOSITORY;
  readonly upstreamCommit: string;
  readonly sourcePath: typeof FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH;
  readonly capturedAt: string;
  readonly sourceText: string;
}

export interface FactoryProviderIntakeTargetResult {
  readonly key: string;
  readonly familyId: string;
  readonly subjectId: string;
  readonly fieldId: string;
  readonly refreshStatus: FactoryProviderRefreshStatus;
  readonly reconciliation: FactoryEvidenceReconciliation;
  readonly effectiveRoute: FactoryProviderIntakeRoute;
  readonly sourceRef: string;
  readonly sourceVersion: string;
  readonly extractionNote: string;
}

export interface FactoryProviderIntakeReport {
  readonly schemaVersion: 1;
  readonly generator: typeof FACTORY_PROVIDER_INTAKE_GENERATOR;
  readonly providerId: typeof FACTORY_FREQUENCY_MANAGER_PROVIDER_ID;
  readonly upstreamRepository: typeof FACTORY_FREQUENCY_MANAGER_REPOSITORY;
  readonly upstreamCommit: string;
  readonly sourcePath: typeof FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH;
  readonly sourceRef: string;
  readonly capturedAt: string;
  readonly canonicalPromotionPolicy: 'MANUAL_SOURCE_VALIDATION_REQUIRED';
  readonly targets: readonly FactoryProviderIntakeTargetResult[];
  readonly reviewCandidateKeys: readonly string[];
  readonly exceptionQueueKeys: readonly string[];
}

export interface FactoryFrequencyManagerProviderIntakeBundle {
  readonly snapshots: readonly FactoryFrequencyManagerSupportedSnapshot[];
  readonly report: FactoryProviderIntakeReport;
}

interface ExtractionOutcome {
  readonly evidenceState: 'PRESENT' | 'MISSING' | 'UNKNOWN';
  readonly raw: Readonly<Record<string, unknown>>;
  readonly note: string;
}

interface IntakeTarget {
  readonly familyId: string;
  readonly subjectId: string;
  readonly fieldId: string;
  readonly kind: 'RARITY' | 'R1_ATTRIBUTE_DMG';
}

const TARGETS: readonly IntakeTarget[] = [
  {
    familyId: FACTORY_WEAPON_RARITY_FAMILY_ID,
    subjectId: 'abyss-surges',
    fieldId: 'rarity.stars',
    kind: 'RARITY',
  },
  {
    familyId: FACTORY_WEAPON_R1_ATTRIBUTE_DMG_FAMILY_ID,
    subjectId: 'ages-of-harvest',
    fieldId: 'r1.attribute-dmg-bonus.value',
    kind: 'R1_ATTRIBUTE_DMG',
  },
] as const;

function targetKey(target: Pick<IntakeTarget, 'subjectId' | 'fieldId'>): string {
  return `${target.subjectId}::${target.fieldId}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateArtifact(artifact: FrequencyManagerProviderSourceArtifact): void {
  if (artifact.schemaVersion !== 1) throw new Error(`Factory provider intake: unsupported artifact schema ${artifact.schemaVersion}`);
  if (artifact.providerId !== FACTORY_FREQUENCY_MANAGER_PROVIDER_ID) {
    throw new Error(`Factory provider intake: unsupported provider ${artifact.providerId}`);
  }
  if (artifact.upstreamRepository !== FACTORY_FREQUENCY_MANAGER_REPOSITORY) {
    throw new Error(`Factory provider intake: unexpected upstream repository ${artifact.upstreamRepository}`);
  }
  if (artifact.sourcePath !== FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH) {
    throw new Error(`Factory provider intake: unexpected source path ${artifact.sourcePath}`);
  }
  if (!/^[0-9a-f]{40}$/i.test(artifact.upstreamCommit)) {
    throw new Error('Factory provider intake: upstreamCommit must be an exact 40-character Git SHA');
  }
  if (!artifact.capturedAt.trim()) throw new Error('Factory provider intake: capturedAt must be non-empty');
  if (!artifact.sourceText.trim()) throw new Error('Factory provider intake: sourceText must be non-empty');
}

function sourceRef(artifact: FrequencyManagerProviderSourceArtifact): string {
  return `https://github.com/${artifact.upstreamRepository}/blob/${artifact.upstreamCommit}/${artifact.sourcePath}`;
}

function findWeaponObject(sourceText: string, weaponId: string): string | null {
  const marker = new RegExp(`\\bid\\s*:\\s*["']${escapeRegExp(weaponId)}["']`).exec(sourceText);
  if (marker === null) return null;

  let start = marker.index;
  while (start >= 0 && sourceText[start] !== '{') start -= 1;
  if (start < 0) return null;

  let depth = 0;
  let quote: '"' | "'" | '`' | null = null;
  let escaped = false;

  for (let index = start; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    if (quote !== null) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return sourceText.slice(start, index + 1);
    }
  }

  return null;
}

function extractRarity(sourceText: string, weaponId: string): ExtractionOutcome {
  const record = findWeaponObject(sourceText, weaponId);
  if (record === null) {
    return { evidenceState: 'MISSING', raw: {}, note: `Weapon ${weaponId} is absent from the pinned provider source artifact.` };
  }

  const match = /\brarity\s*:\s*([^,\n}]+)/.exec(record);
  if (match === null) {
    return { evidenceState: 'MISSING', raw: {}, note: `Weapon ${weaponId} exists but rarity is absent.` };
  }

  const token = match[1].trim();
  const value = Number(token);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return {
      evidenceState: 'UNKNOWN',
      raw: { rarityToken: token },
      note: `Weapon ${weaponId} rarity is present but cannot be interpreted as an integer from 1 through 5.`,
    };
  }

  return { evidenceState: 'PRESENT', raw: { rarity: value }, note: `Extracted discrete rarity for ${weaponId}.` };
}

function extractR1AttributeDmg(sourceText: string, weaponId: string): ExtractionOutcome {
  const record = findWeaponObject(sourceText, weaponId);
  if (record === null) {
    return { evidenceState: 'MISSING', raw: {}, note: `Weapon ${weaponId} is absent from the pinned provider source artifact.` };
  }

  const elemDmgObjects = [...record.matchAll(/\{[^{}]*"stat"\s*:\s*"elemDmg"[^{}]*\}/g)].map((match) => match[0]);
  if (elemDmgObjects.length === 0) {
    return {
      evidenceState: 'MISSING',
      raw: {},
      note: `Weapon ${weaponId} exists but no explicit elemDmg selfBuff row is present.`,
    };
  }

  const validRows = elemDmgObjects.flatMap((row) => {
    const valueMatch = /"value"\s*:\s*(-?\d+(?:\.\d+)?)/.exec(row);
    const conditionalMatch = /"conditional"\s*:\s*(true|false)/.exec(row);
    if (valueMatch === null || conditionalMatch === null || conditionalMatch[1] !== 'false') return [];
    const valuePercent = Number(valueMatch[1]);
    if (!Number.isFinite(valuePercent) || valuePercent <= 0) return [];
    return [{ rank: 1, stat: 'elemDmg', valuePercent, conditional: false } as const];
  });

  if (validRows.length !== 1) {
    return {
      evidenceState: 'UNKNOWN',
      raw: { elemDmgRowCount: elemDmgObjects.length, validUnconditionalElemDmgRows: validRows.length },
      note: `Weapon ${weaponId} elemDmg source shape is ambiguous or no longer matches the reviewed unconditional R1 contract.`,
    };
  }

  return {
    evidenceState: 'PRESENT',
    raw: validRows[0],
    note: `Extracted the explicit unconditional R1 elemDmg selfBuff for ${weaponId}.`,
  };
}

function findBaseline(
  baselines: readonly FactoryFrequencyManagerSupportedSnapshot[],
  target: IntakeTarget,
): FactoryFrequencyManagerSupportedSnapshot {
  const matches = baselines.filter((snapshot) => (
    snapshot.familyId === target.familyId
    && snapshot.subjectId === target.subjectId
    && snapshot.fieldId === target.fieldId
  ));
  if (matches.length !== 1) {
    throw new Error(`Factory provider intake: expected exactly one reviewed baseline for ${targetKey(target)}, found ${matches.length}`);
  }
  return matches[0];
}

function findFrequencyManagerBaselineRow(
  snapshot: FactoryFrequencyManagerSupportedSnapshot,
): FactoryWeaponRarityRawRow | FactoryWeaponAttributeDmgRawRow {
  const rows = snapshot.providers.filter((row) => row.providerId === FACTORY_FREQUENCY_MANAGER_PROVIDER_ID);
  if (rows.length !== 1) {
    throw new Error(`Factory provider intake: expected exactly one FrequencyManager baseline row for ${snapshot.subjectId}::${snapshot.fieldId}`);
  }
  return rows[0];
}

function sameRelevantRaw(target: IntakeTarget, baselineRaw: Readonly<Record<string, unknown>>, nextRaw: Readonly<Record<string, unknown>>): boolean {
  if (target.kind === 'RARITY') return baselineRaw.rarity === nextRaw.rarity;
  return baselineRaw.rank === nextRaw.rank
    && baselineRaw.stat === nextRaw.stat
    && baselineRaw.valuePercent === nextRaw.valuePercent
    && baselineRaw.conditional === nextRaw.conditional;
}

function refreshStatus(target: IntakeTarget, baselineRaw: Readonly<Record<string, unknown>>, extraction: ExtractionOutcome): FactoryProviderRefreshStatus {
  if (extraction.evidenceState === 'MISSING') return 'SOURCE_MISSING';
  if (extraction.evidenceState === 'UNKNOWN') return 'SOURCE_UNKNOWN';
  return sameRelevantRaw(target, baselineRaw, extraction.raw) ? 'UNCHANGED' : 'SOURCE_CHANGED';
}

function refreshedSnapshot(
  baseline: FactoryFrequencyManagerSupportedSnapshot,
  target: IntakeTarget,
  extraction: ExtractionOutcome,
  status: FactoryProviderRefreshStatus,
  artifact: FrequencyManagerProviderSourceArtifact,
): FactoryFrequencyManagerSupportedSnapshot {
  const ref = sourceRef(artifact);
  const providerRow = {
    providerId: FACTORY_FREQUENCY_MANAGER_PROVIDER_ID,
    evidenceState: extraction.evidenceState,
    sourceRef: ref,
    sourceVersion: artifact.upstreamCommit,
    raw: extraction.raw,
    notes: [
      extraction.note,
      `Automated by ${FACTORY_PROVIDER_INTAKE_GENERATOR}; refresh status ${status}.`,
      'External provider evidence only. This row cannot promote or mutate canonical/runtime truth.',
    ],
  } as const;

  const providers = baseline.providers.map((row) => (
    row.providerId === FACTORY_FREQUENCY_MANAGER_PROVIDER_ID ? providerRow : row
  ));

  if (target.kind === 'RARITY') {
    return {
      ...(baseline as FactoryWeaponRarityEvidenceSnapshot),
      capturedAt: artifact.capturedAt,
      providers: providers as readonly FactoryWeaponRarityRawRow[],
    };
  }

  return {
    ...(baseline as FactoryWeaponAttributeDmgEvidenceSnapshot),
    capturedAt: artifact.capturedAt,
    providers: providers as readonly FactoryWeaponAttributeDmgRawRow[],
  };
}

function extractTarget(artifact: FrequencyManagerProviderSourceArtifact, target: IntakeTarget): ExtractionOutcome {
  if (target.kind === 'RARITY') return extractRarity(artifact.sourceText, target.subjectId);
  return extractR1AttributeDmg(artifact.sourceText, target.subjectId);
}

export function buildFactoryFrequencyManagerProviderIntake(
  artifact: FrequencyManagerProviderSourceArtifact,
  baselines: readonly FactoryFrequencyManagerSupportedSnapshot[],
): FactoryFrequencyManagerProviderIntakeBundle {
  validateArtifact(artifact);
  const ref = sourceRef(artifact);
  const snapshots: FactoryFrequencyManagerSupportedSnapshot[] = [];
  const targets: FactoryProviderIntakeTargetResult[] = [];

  for (const target of TARGETS) {
    const baseline = findBaseline(baselines, target);
    const baselineProvider = findFrequencyManagerBaselineRow(baseline);
    if (baselineProvider.evidenceState !== 'PRESENT') {
      throw new Error(`Factory provider intake: reviewed FrequencyManager baseline for ${targetKey(target)} must be PRESENT`);
    }

    const extraction = extractTarget(artifact, target);
    const status = refreshStatus(target, baselineProvider.raw, extraction);
    const snapshot = refreshedSnapshot(baseline, target, extraction, status, artifact);
    const reconciliation = reconcileFactoryEvidenceSnapshot(snapshot);
    const effectiveRoute: FactoryProviderIntakeRoute = status === 'UNCHANGED'
      ? reconciliation.route
      : 'EXCEPTION_QUEUE';

    snapshots.push(snapshot);
    targets.push({
      key: targetKey(target),
      familyId: target.familyId,
      subjectId: target.subjectId,
      fieldId: target.fieldId,
      refreshStatus: status,
      reconciliation,
      effectiveRoute,
      sourceRef: ref,
      sourceVersion: artifact.upstreamCommit,
      extractionNote: extraction.note,
    });
  }

  const reviewCandidateKeys = targets.filter((row) => row.effectiveRoute === 'REVIEW_CANDIDATE').map((row) => row.key).sort();
  const exceptionQueueKeys = targets.filter((row) => row.effectiveRoute === 'EXCEPTION_QUEUE').map((row) => row.key).sort();

  return {
    snapshots,
    report: {
      schemaVersion: 1,
      generator: FACTORY_PROVIDER_INTAKE_GENERATOR,
      providerId: FACTORY_FREQUENCY_MANAGER_PROVIDER_ID,
      upstreamRepository: FACTORY_FREQUENCY_MANAGER_REPOSITORY,
      upstreamCommit: artifact.upstreamCommit,
      sourcePath: FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH,
      sourceRef: ref,
      capturedAt: artifact.capturedAt,
      canonicalPromotionPolicy: 'MANUAL_SOURCE_VALIDATION_REQUIRED',
      targets,
      reviewCandidateKeys,
      exceptionQueueKeys,
    },
  };
}

export function renderFactoryProviderIntakeJson(report: FactoryProviderIntakeReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function renderFactoryProviderIntakeMarkdown(report: FactoryProviderIntakeReport): string {
  const lines = [
    '# Factory Provider Intake / Refresh v1',
    '',
    `- Provider: \`${report.providerId}\``,
    `- Upstream: \`${report.upstreamRepository}@${report.upstreamCommit}\``,
    `- Source: \`${report.sourcePath}\``,
    `- Source ref: ${report.sourceRef}`,
    `- Captured at: \`${report.capturedAt}\``,
    `- Canonical promotion: \`${report.canonicalPromotionPolicy}\``,
    '',
    '> This is provider evidence/review output only. It never promotes or mutates canonical Bellibing runtime truth.',
    '',
    '## Targets',
    '',
    '| Target | Refresh status | Reconciliation | Reconciliation route | Effective intake route |',
    '|---|---|---|---|---|',
    ...report.targets.map((row) => `| \`${row.key}\` | ${row.refreshStatus} | ${row.reconciliation.classification} | ${row.reconciliation.route} | ${row.effectiveRoute} |`),
    '',
    '## Review candidates',
    '',
    ...(report.reviewCandidateKeys.length === 0 ? ['- None.'] : report.reviewCandidateKeys.map((key) => `- \`${key}\``)),
    '',
    '## Exception queue',
    '',
    ...(report.exceptionQueueKeys.length === 0 ? ['- None.'] : report.exceptionQueueKeys.map((key) => `- \`${key}\``)),
    '',
  ];
  return `${lines.join('\n')}\n`;
}
