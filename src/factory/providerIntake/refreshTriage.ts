import {
  FACTORY_FREQUENCY_MANAGER_PROVIDER_ID,
  FACTORY_FREQUENCY_MANAGER_REPOSITORY,
  FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH,
  type FactoryFrequencyManagerSupportedSnapshot,
  type FactoryProviderIntakeReport,
  type FactoryProviderRefreshStatus,
} from './frequencyManager.ts';

export const FACTORY_PROVIDER_REFRESH_TRIAGE_GENERATOR = 'factory-provider-refresh-change-detection-triage-v1' as const;

export type FactoryProviderRefreshTriageDisposition =
  | 'NO_REVIEW_REQUIRED'
  | 'REVIEW_REQUIRED'
  | 'REFRESH_FAILURE';

export type FactoryProviderRefreshFailureStage =
  | 'PROVIDER_CHECKOUT'
  | 'PROVENANCE_RESOLUTION'
  | 'INTAKE_EXECUTION';

export interface FactoryProviderRefreshComparisonProvenance {
  readonly sourceRef: string | null;
  readonly sourceVersion: string | null;
}

export interface FactoryProviderRefreshTriageTarget {
  readonly key: string;
  readonly familyId: string;
  readonly subjectId: string;
  readonly fieldId: string;
  readonly refreshStatus: FactoryProviderRefreshStatus;
  readonly baseline: FactoryProviderRefreshComparisonProvenance;
  readonly current: FactoryProviderRefreshComparisonProvenance;
}

interface FactoryProviderRefreshTriageBase {
  readonly schemaVersion: 1;
  readonly generator: typeof FACTORY_PROVIDER_REFRESH_TRIAGE_GENERATOR;
  readonly providerId: typeof FACTORY_FREQUENCY_MANAGER_PROVIDER_ID;
  readonly upstreamRepository: typeof FACTORY_FREQUENCY_MANAGER_REPOSITORY;
  readonly providerRef: string;
  readonly sourcePath: typeof FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH;
  readonly canonicalPromotionPolicy: 'MANUAL_SOURCE_VALIDATION_REQUIRED';
  readonly attentionRequired: boolean;
}

export interface FactoryProviderRefreshSuccessTriageReport extends FactoryProviderRefreshTriageBase {
  readonly disposition: 'NO_REVIEW_REQUIRED' | 'REVIEW_REQUIRED';
  readonly upstreamCommit: string;
  readonly sourceRef: string;
  readonly targets: readonly FactoryProviderRefreshTriageTarget[];
}

export interface FactoryProviderRefreshFailureTriageReport extends FactoryProviderRefreshTriageBase {
  readonly disposition: 'REFRESH_FAILURE';
  readonly upstreamCommit: string | null;
  readonly sourceRef: string | null;
  readonly targets: readonly [];
  readonly failure: {
    readonly stage: FactoryProviderRefreshFailureStage;
    readonly code: string;
  };
}

export type FactoryProviderRefreshTriageReport =
  | FactoryProviderRefreshSuccessTriageReport
  | FactoryProviderRefreshFailureTriageReport;

function baselineProvenance(
  baselines: readonly FactoryFrequencyManagerSupportedSnapshot[],
  target: Pick<FactoryProviderRefreshTriageTarget, 'familyId' | 'subjectId' | 'fieldId' | 'key'>,
): FactoryProviderRefreshComparisonProvenance {
  const snapshots = baselines.filter((snapshot) => (
    snapshot.familyId === target.familyId
    && snapshot.subjectId === target.subjectId
    && snapshot.fieldId === target.fieldId
  ));
  if (snapshots.length !== 1) {
    throw new Error(`Factory provider refresh triage: expected exactly one baseline for ${target.key}, found ${snapshots.length}`);
  }

  const rows = snapshots[0].providers.filter((row) => row.providerId === FACTORY_FREQUENCY_MANAGER_PROVIDER_ID);
  if (rows.length !== 1) {
    throw new Error(`Factory provider refresh triage: expected exactly one FrequencyManager baseline row for ${target.key}, found ${rows.length}`);
  }

  return {
    sourceRef: rows[0].sourceRef,
    sourceVersion: rows[0].sourceVersion,
  };
}

export function buildFactoryProviderRefreshTriage(
  intake: FactoryProviderIntakeReport,
  baselines: readonly FactoryFrequencyManagerSupportedSnapshot[],
  providerRef: string,
): FactoryProviderRefreshSuccessTriageReport {
  if (!providerRef.trim()) throw new Error('Factory provider refresh triage: providerRef must be non-empty');
  if (intake.providerId !== FACTORY_FREQUENCY_MANAGER_PROVIDER_ID) {
    throw new Error(`Factory provider refresh triage: unsupported provider ${intake.providerId}`);
  }
  if (intake.upstreamRepository !== FACTORY_FREQUENCY_MANAGER_REPOSITORY) {
    throw new Error(`Factory provider refresh triage: unexpected upstream repository ${intake.upstreamRepository}`);
  }
  if (intake.sourcePath !== FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH) {
    throw new Error(`Factory provider refresh triage: unexpected source path ${intake.sourcePath}`);
  }
  if (!/^[0-9a-f]{40}$/i.test(intake.upstreamCommit)) {
    throw new Error('Factory provider refresh triage: upstreamCommit must be an exact 40-character Git SHA');
  }
  if (intake.targets.length === 0) {
    throw new Error('Factory provider refresh triage: a successful intake report must contain bounded targets');
  }

  const targets = intake.targets
    .map((target) => ({
      key: target.key,
      familyId: target.familyId,
      subjectId: target.subjectId,
      fieldId: target.fieldId,
      refreshStatus: target.refreshStatus,
      baseline: baselineProvenance(baselines, target),
      current: {
        sourceRef: target.sourceRef,
        sourceVersion: target.sourceVersion,
      },
    }))
    .sort((left, right) => left.key.localeCompare(right.key));

  const attentionRequired = targets.some((target) => target.refreshStatus !== 'UNCHANGED');
  const disposition = attentionRequired ? 'REVIEW_REQUIRED' : 'NO_REVIEW_REQUIRED';

  return {
    schemaVersion: 1,
    generator: FACTORY_PROVIDER_REFRESH_TRIAGE_GENERATOR,
    providerId: FACTORY_FREQUENCY_MANAGER_PROVIDER_ID,
    upstreamRepository: FACTORY_FREQUENCY_MANAGER_REPOSITORY,
    providerRef,
    upstreamCommit: intake.upstreamCommit,
    sourcePath: FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH,
    sourceRef: intake.sourceRef,
    canonicalPromotionPolicy: 'MANUAL_SOURCE_VALIDATION_REQUIRED',
    disposition,
    attentionRequired,
    targets,
  };
}

export function buildFactoryProviderRefreshFailureTriage(input: {
  readonly stage: FactoryProviderRefreshFailureStage;
  readonly code: string;
  readonly providerRef: string;
  readonly upstreamCommit?: string | null;
}): FactoryProviderRefreshFailureTriageReport {
  if (!input.code.trim()) throw new Error('Factory provider refresh triage: failure code must be non-empty');
  if (!input.providerRef.trim()) throw new Error('Factory provider refresh triage: providerRef must be non-empty');

  const upstreamCommit = input.upstreamCommit?.trim() || null;
  const sourceRef = upstreamCommit !== null && /^[0-9a-f]{40}$/i.test(upstreamCommit)
    ? `https://github.com/${FACTORY_FREQUENCY_MANAGER_REPOSITORY}/blob/${upstreamCommit}/${FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH}`
    : null;

  return {
    schemaVersion: 1,
    generator: FACTORY_PROVIDER_REFRESH_TRIAGE_GENERATOR,
    providerId: FACTORY_FREQUENCY_MANAGER_PROVIDER_ID,
    upstreamRepository: FACTORY_FREQUENCY_MANAGER_REPOSITORY,
    providerRef: input.providerRef,
    upstreamCommit,
    sourcePath: FACTORY_FREQUENCY_MANAGER_WEAPON_SOURCE_PATH,
    sourceRef,
    canonicalPromotionPolicy: 'MANUAL_SOURCE_VALIDATION_REQUIRED',
    disposition: 'REFRESH_FAILURE',
    attentionRequired: true,
    targets: [],
    failure: {
      stage: input.stage,
      code: input.code,
    },
  };
}

export function renderFactoryProviderRefreshTriageJson(report: FactoryProviderRefreshTriageReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function renderFactoryProviderRefreshTriageMarkdown(report: FactoryProviderRefreshTriageReport): string {
  const lines = [
    '# Factory Provider Refresh Change Detection / Triage v1',
    '',
    `- Provider: \`${report.providerId}\``,
    `- Requested provider ref: \`${report.providerRef}\``,
    `- Upstream SHA: \`${report.upstreamCommit ?? 'UNRESOLVED'}\``,
    `- Source: \`${report.sourcePath}\``,
    `- Disposition: **${report.disposition}**`,
    `- attentionRequired: \`${report.attentionRequired}\``,
    `- Canonical promotion: \`${report.canonicalPromotionPolicy}\``,
    '',
  ];

  if (report.disposition === 'REFRESH_FAILURE') {
    lines.push(
      '## Operational failure',
      '',
      `- Stage: \`${report.failure.stage}\``,
      `- Code: \`${report.failure.code}\``,
      '',
      'No Factory evidence classification or reconciliation was fabricated for this failed refresh.',
    );
    return `${lines.join('\n')}\n`;
  }

  lines.push(
    '## Bounded targets',
    '',
    '| Target | Refresh status | Baseline provenance | Current provenance |',
    '| --- | --- | --- | --- |',
  );
  for (const target of report.targets) {
    lines.push(
      `| \`${target.key}\` | \`${target.refreshStatus}\` | \`${target.baseline.sourceVersion ?? 'UNKNOWN'}\` | \`${target.current.sourceVersion ?? 'UNKNOWN'}\` |`,
    );
  }

  lines.push(
    '',
    report.disposition === 'NO_REVIEW_REQUIRED'
      ? 'Refresh completed successfully and created no new human review work for the bounded targets.'
      : 'Refresh completed successfully and at least one bounded target requires human review.',
    '',
    'This operational triage does not alter Factory evidence classifications, reconciliation routes, provider trust, or canonical/runtime truth.',
  );

  return `${lines.join('\n')}\n`;
}
