import type {
  FactoryEvidenceClassification,
  FactoryEvidenceReconciliation,
} from './evidence.ts';
import { reconcileFactoryEvidenceSnapshot } from './providerMappings/index.ts';

export const FACTORY_EVIDENCE_REPORT_SCHEMA_VERSION = 1 as const;
export const FACTORY_EVIDENCE_REPORT_GENERATOR_ID = 'factory-evidence-report-v1' as const;

export interface FactoryEvidenceReportSummary {
  readonly totalReconciliations: number;
  readonly reviewCandidates: number;
  readonly exceptionQueue: number;
  readonly classifications: Readonly<Record<FactoryEvidenceClassification, number>>;
}

export interface FactoryEvidenceReportBundle {
  readonly schemaVersion: typeof FACTORY_EVIDENCE_REPORT_SCHEMA_VERSION;
  readonly generatorId: typeof FACTORY_EVIDENCE_REPORT_GENERATOR_ID;
  readonly canonicalPromotionPolicy: 'MANUAL_SOURCE_VALIDATION_REQUIRED';
  readonly summary: FactoryEvidenceReportSummary;
  readonly reviewCandidateKeys: readonly string[];
  readonly exceptionQueueKeys: readonly string[];
  readonly reconciliations: readonly FactoryEvidenceReconciliation[];
}

function reconciliationKey(row: Pick<FactoryEvidenceReconciliation, 'subjectId' | 'fieldId'>): string {
  return `${row.subjectId}::${row.fieldId}`;
}

function stableReconciliation(row: FactoryEvidenceReconciliation): FactoryEvidenceReconciliation {
  return {
    ...row,
    presentProviderIds: [...row.presentProviderIds].sort(),
    semanticFingerprints: [...row.semanticFingerprints].sort(),
    candidates: [...row.candidates].sort((a, b) => {
      const provider = a.providerId.localeCompare(b.providerId);
      if (provider !== 0) return provider;
      return a.candidateId.localeCompare(b.candidateId);
    }),
  };
}

function emptyClassificationCounts(): Record<FactoryEvidenceClassification, number> {
  return {
    CONSENSUS: 0,
    SINGLE_SOURCE: 0,
    CONFLICT: 0,
    MISSING: 0,
    UNKNOWN: 0,
  };
}

export function buildFactoryEvidenceReport(
  reconciliations: readonly FactoryEvidenceReconciliation[],
): FactoryEvidenceReportBundle {
  const stableRows = reconciliations.map(stableReconciliation).sort((a, b) => {
    const subject = a.subjectId.localeCompare(b.subjectId);
    if (subject !== 0) return subject;
    return a.fieldId.localeCompare(b.fieldId);
  });

  const seen = new Set<string>();
  for (const row of stableRows) {
    const key = reconciliationKey(row);
    if (seen.has(key)) throw new Error(`Factory evidence report: duplicate reconciliation key ${key}`);
    seen.add(key);
    if (row.canonicalPromotion !== 'MANUAL_SOURCE_VALIDATION_REQUIRED') {
      throw new Error(`Factory evidence report: ${key} must retain manual canonical-promotion review`);
    }
  }

  const classifications = emptyClassificationCounts();
  for (const row of stableRows) classifications[row.classification] += 1;

  const reviewCandidateKeys = stableRows
    .filter((row) => row.route === 'REVIEW_CANDIDATE')
    .map(reconciliationKey);
  const exceptionQueueKeys = stableRows
    .filter((row) => row.route === 'EXCEPTION_QUEUE')
    .map(reconciliationKey);

  return {
    schemaVersion: FACTORY_EVIDENCE_REPORT_SCHEMA_VERSION,
    generatorId: FACTORY_EVIDENCE_REPORT_GENERATOR_ID,
    canonicalPromotionPolicy: 'MANUAL_SOURCE_VALIDATION_REQUIRED',
    summary: {
      totalReconciliations: stableRows.length,
      reviewCandidates: reviewCandidateKeys.length,
      exceptionQueue: exceptionQueueKeys.length,
      classifications,
    },
    reviewCandidateKeys,
    exceptionQueueKeys,
    reconciliations: stableRows,
  };
}

export function buildFactoryEvidenceReportFromSnapshots(
  snapshots: readonly unknown[],
): FactoryEvidenceReportBundle {
  return buildFactoryEvidenceReport(snapshots.map(reconcileFactoryEvidenceSnapshot));
}

export function renderFactoryEvidenceReportJson(report: FactoryEvidenceReportBundle): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

function markdownCell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function joined(values: readonly string[]): string {
  return values.length === 0 ? '—' : values.map(markdownCell).join('<br>');
}

export function renderFactoryEvidenceReportMarkdown(report: FactoryEvidenceReportBundle): string {
  const lines: string[] = [
    '# Bellibing Factory Evidence Report',
    '',
    `Generator: \`${report.generatorId}\`  `,
    `Schema: \`${report.schemaVersion}\`  `,
    `Canonical promotion: \`${report.canonicalPromotionPolicy}\``,
    '',
    '## Summary',
    '',
    `- Reconciliations: **${report.summary.totalReconciliations}**`,
    `- Review candidates: **${report.summary.reviewCandidates}**`,
    `- Exception queue: **${report.summary.exceptionQueue}**`,
    `- Classifications: CONSENSUS ${report.summary.classifications.CONSENSUS}, SINGLE_SOURCE ${report.summary.classifications.SINGLE_SOURCE}, CONFLICT ${report.summary.classifications.CONFLICT}, MISSING ${report.summary.classifications.MISSING}, UNKNOWN ${report.summary.classifications.UNKNOWN}`,
    '',
    '## Reconciliations',
    '',
    '| Subject | Field | Classification | Route | Providers | Semantic fingerprints |',
    '| --- | --- | --- | --- | --- | --- |',
  ];

  for (const row of report.reconciliations) {
    lines.push(`| ${markdownCell(row.subjectId)} | ${markdownCell(row.fieldId)} | ${row.classification} | ${row.route} | ${joined(row.presentProviderIds)} | ${joined(row.semanticFingerprints)} |`);
  }

  if (report.reconciliations.length === 0) {
    lines.push('| — | — | — | — | — | — |');
  }

  lines.push('', '## Review candidates', '');
  if (report.reviewCandidateKeys.length === 0) lines.push('- None.');
  else report.reviewCandidateKeys.forEach((key) => lines.push(`- \`${key}\``));

  lines.push('', '## Exception queue', '');
  if (report.exceptionQueueKeys.length === 0) lines.push('- None.');
  else report.exceptionQueueKeys.forEach((key) => lines.push(`- \`${key}\``));

  lines.push(
    '',
    '## Provenance',
    '',
    '| Candidate | Provider | State | Source version | Captured at | Source reference |',
    '| --- | --- | --- | --- | --- | --- |',
  );

  const candidates = report.reconciliations.flatMap((row) => row.candidates);
  if (candidates.length === 0) {
    lines.push('| — | — | — | — | — | — |');
  } else {
    for (const candidate of candidates) {
      lines.push(`| ${markdownCell(candidate.candidateId)} | ${markdownCell(candidate.providerId)} | ${candidate.evidenceState} | ${markdownCell(candidate.sourceVersion ?? '—')} | ${markdownCell(candidate.capturedAt)} | ${markdownCell(candidate.sourceRef ?? '—')} |`);
    }
  }

  lines.push('', '> Factory evidence is review input only. This report never promotes provider evidence into canonical Bellibing runtime truth.', '');
  return lines.join('\n');
}
