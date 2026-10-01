import type { EchoGameData, SonataGameData } from '../gameDataDomain.ts';
import { ECHO_CATALOG_META } from './echoCatalogMeta.ts';
import { ECHO_CATALOG } from './echoes.ts';
import { SONATA_CATALOG } from './sonatas.ts';

export type EchoRawSourceScope = 'ECHO' | 'SONATA';

export interface EchoRawSourceConflict {
  scope: EchoRawSourceScope;
  recordId: string;
  fields: readonly string[];
  detail: string;
  sourceUrls: readonly string[];
}

export interface EchoRawSourceReviewContract {
  patch: string;
  checkedAt: string;
  expectedCatalogCount: number;
  expectedReleasedEchoCount: number;
  expectedSonataCount: number;
  expectedReleasedSonataCount: number;
  expectedUpcomingEchoIds: readonly string[];
  expectedUpcomingSonataIds: readonly string[];
  expectedWipEchoIds: readonly string[];
  expectedWipSonataIds: readonly string[];
  currentPatchReleasedEchoIds: readonly string[];
  expectedSnapshotSourceRepository: string;
  expectedSnapshotSourceCommit: string;
  reviewedCurrentSourceCommit: string;
  freshnessGate: string;
  sourceConflicts: readonly EchoRawSourceConflict[];
  sourceLabels: readonly string[];
  sourceUrls: readonly string[];
  notes: readonly string[];
}

/**
 * Frozen Version 3.7 source-review contract for the raw Echo/Sonata layer.
 *
 * The repository snapshot is pinned to the reviewed current 3.7 source commit.
 * Live audit still resolves upstream main independently and fails closed on any
 * missing, stale/wrong or extra raw projection.
 *
 * `sourceConflicts` is the explicit escape hatch for genuinely contradictory
 * current sources. A registered conflict is excluded from VERIFIED_CURRENT
 * counts, and a conflicted repository record may never be marked VERIFIED.
 */
export const ECHO_RAW_SOURCE_REVIEW_V37: EchoRawSourceReviewContract = {
  patch: '3.7',
  checkedAt: '2026-10-01',
  expectedCatalogCount: 187,
  expectedReleasedEchoCount: 187,
  expectedSonataCount: 37,
  expectedReleasedSonataCount: 37,
  expectedUpcomingEchoIds: [],
  expectedUpcomingSonataIds: [],
  expectedWipEchoIds: [],
  expectedWipSonataIds: [],
  currentPatchReleasedEchoIds: [
    'echo-60002195',
    'echo-60002205',
    'echo-60002225',
    'echo-60002235',
    'echo-60002245',
    'echo-60002255',
  ],
  expectedSnapshotSourceRepository: 'DommyMM/wuwabuild',
  expectedSnapshotSourceCommit: '49222fe53b2bb2060f235152ee78ad332ea44c37',
  reviewedCurrentSourceCommit: '49222fe53b2bb2060f235152ee78ad332ea44c37',
  freshnessGate: 'Formrender',
  sourceConflicts: [],
  sourceLabels: [
    'Kuro Games Version 3.7 release/maintenance announcement',
    'DommyMM/wuwabuild normalized live-data snapshot',
    'Wuthery / Encore upstream raw game data',
    'Current published Echo/Sonata references used as independent cross-checks',
  ],
  sourceUrls: [
    'https://wutheringwaves.kurogames.com/en/main/news/detail/3790',
    'https://github.com/DommyMM/wuwabuild/tree/49222fe53b2bb2060f235152ee78ad332ea44c37/public/Data',
    'https://api-v2.encore.moe/api',
    'https://files.wuthery.com',
  ],
  notes: [
    'Version 3.7 is live as of 2026-09-30; the reviewed live snapshot contains 187 released Echoes and 37 Sonata sets.',
    'The six newly covered 3.7 Echo identities are Reminiscence: Suhsin the Inevitable, Formrender, Skywatch Lancer, Soulfrayer, Bloomburst Puppet and Jade Nether Serpent.',
    'The three newly covered Sonata identities are Heart of Sworn Vigil, Flash of Electric Reflection and Flower of Tinged Yearning.',
    'Raw roster verification does not imply Sonata effect, Echo Skill, recommendation, rotation or DPS execution coverage.',
  ],
};

/** Backward-compatible import alias for older call sites; payload is the current 3.7 contract. */
export const ECHO_RAW_SOURCE_REVIEW_V36 = ECHO_RAW_SOURCE_REVIEW_V37;

export type EchoRawAuditIssueCode =
  | 'CATALOG_COUNT_MISMATCH'
  | 'RELEASED_COUNT_MISMATCH'
  | 'LIFECYCLE_SET_MISMATCH'
  | 'DUPLICATE_ID'
  | 'DUPLICATE_SOURCE_ID'
  | 'DUPLICATE_NAME'
  | 'REQUIRED_FIELD_MISSING'
  | 'INVALID_COST'
  | 'INVALID_THREAT_CLASS'
  | 'MEMBERSHIP_MISSING'
  | 'MEMBERSHIP_DUPLICATE'
  | 'MEMBERSHIP_REFERENCE_MISSING'
  | 'SONATA_UNREFERENCED'
  | 'SONATA_ACTIVATION_INVALID'
  | 'SONATA_EFFECT_TEXT_MISSING'
  | 'RAW_LAYER_STATUS_MISMATCH'
  | 'PROVENANCE_MISSING'
  | 'SNAPSHOT_META_MISMATCH'
  | 'FRESHNESS_GATE_MISSING'
  | 'CURRENT_PATCH_RECORD_MISSING'
  | 'SOURCE_CONFLICT_UNKNOWN_RECORD'
  | 'SOURCE_CONFLICT_MARKED_VERIFIED';

export interface EchoRawAuditIssue {
  code: EchoRawAuditIssueCode;
  scope?: EchoRawSourceScope;
  recordId?: string;
  detail: string;
}

export interface EchoRawRosterAudit {
  echoCatalogCount: number;
  releasedEchoCount: number;
  sonataCatalogCount: number;
  releasedSonataCount: number;
  verifiedCurrentEchoCount: number;
  verifiedCurrentSonataCount: number;
  sourceConflictCount: number;
  issues: readonly EchoRawAuditIssue[];
}

interface EchoCatalogMetaLike {
  sourceRepository: string;
  sourceCommit: string;
  syncedAt: string;
  echoCount: number;
  sonataCount: number;
  freshnessGate: string;
}

function sortedIds(items: readonly { id: string }[]): string[] {
  return items.map((item) => item.id).sort();
}

function sameStrings(actual: readonly string[], expected: readonly string[]): boolean {
  return actual.length === expected.length
    && actual.every((value, index) => value === expected[index]);
}

function sameNumbers(actual: readonly number[], expected: readonly number[]): boolean {
  return actual.length === expected.length
    && actual.every((value, index) => value === expected[index]);
}

function addDuplicateIssues<T extends { id: string; name: string; sourceId: number }>(
  items: readonly T[],
  scope: EchoRawSourceScope,
  issues: EchoRawAuditIssue[],
): void {
  const seenIds = new Set<string>();
  const seenSourceIds = new Set<number>();
  const seenNames = new Set<string>();

  for (const item of items) {
    if (seenIds.has(item.id)) {
      issues.push({ code: 'DUPLICATE_ID', scope, recordId: item.id, detail: `Duplicate ${scope} id ${item.id}.` });
    }
    if (seenSourceIds.has(item.sourceId)) {
      issues.push({ code: 'DUPLICATE_SOURCE_ID', scope, recordId: item.id, detail: `Duplicate ${scope} sourceId ${item.sourceId}.` });
    }
    if (seenNames.has(item.name)) {
      issues.push({ code: 'DUPLICATE_NAME', scope, recordId: item.id, detail: `Duplicate ${scope} name ${item.name}.` });
    }
    seenIds.add(item.id);
    seenSourceIds.add(item.sourceId);
    seenNames.add(item.name);
  }
}

function checkProvenance(
  item: EchoGameData | SonataGameData,
  scope: EchoRawSourceScope,
  issues: EchoRawAuditIssue[],
): void {
  if (
    item.provenance.sourceLabels.length < 2
    || (item.provenance.sourceUrls?.length ?? 0) === 0
    || item.provenance.checkedAt.trim().length === 0
  ) {
    issues.push({
      code: 'PROVENANCE_MISSING',
      scope,
      recordId: item.id,
      detail: `${item.id} lacks source-facing provenance.`,
    });
  }
}

function lifecycleIds<T extends { id: string; releaseStatus: EchoGameData['releaseStatus'] }>(
  items: readonly T[],
  status: EchoGameData['releaseStatus'],
): string[] {
  return sortedIds(items.filter((item) => item.releaseStatus === status));
}

export function auditEchoRawRoster(
  echoes: readonly EchoGameData[] = ECHO_CATALOG,
  sonatas: readonly SonataGameData[] = SONATA_CATALOG,
  meta: EchoCatalogMetaLike = ECHO_CATALOG_META,
  review: EchoRawSourceReviewContract = ECHO_RAW_SOURCE_REVIEW_V36,
): EchoRawRosterAudit {
  const issues: EchoRawAuditIssue[] = [];
  const releasedEchoes = echoes.filter((echo) => echo.releaseStatus === 'RELEASED');
  const releasedSonatas = sonatas.filter((set) => set.releaseStatus === 'RELEASED');

  if (echoes.length !== review.expectedCatalogCount) {
    issues.push({ code: 'CATALOG_COUNT_MISMATCH', scope: 'ECHO', detail: `Expected ${review.expectedCatalogCount} Echo records for patch ${review.patch}, found ${echoes.length}.` });
  }
  if (sonatas.length !== review.expectedSonataCount) {
    issues.push({ code: 'CATALOG_COUNT_MISMATCH', scope: 'SONATA', detail: `Expected ${review.expectedSonataCount} Sonata records for patch ${review.patch}, found ${sonatas.length}.` });
  }
  if (releasedEchoes.length !== review.expectedReleasedEchoCount) {
    issues.push({ code: 'RELEASED_COUNT_MISMATCH', scope: 'ECHO', detail: `Expected ${review.expectedReleasedEchoCount} released Echoes, found ${releasedEchoes.length}.` });
  }
  if (releasedSonatas.length !== review.expectedReleasedSonataCount) {
    issues.push({ code: 'RELEASED_COUNT_MISMATCH', scope: 'SONATA', detail: `Expected ${review.expectedReleasedSonataCount} released Sonata sets, found ${releasedSonatas.length}.` });
  }

  const lifecycleChecks: readonly [EchoRawSourceScope, string, readonly string[], readonly string[]][] = [
    ['ECHO', 'CONFIRMED_UPCOMING', lifecycleIds(echoes, 'CONFIRMED_UPCOMING'), [...review.expectedUpcomingEchoIds].sort()],
    ['SONATA', 'CONFIRMED_UPCOMING', lifecycleIds(sonatas, 'CONFIRMED_UPCOMING'), [...review.expectedUpcomingSonataIds].sort()],
    ['ECHO', 'UNRELEASED_WIP', lifecycleIds(echoes, 'UNRELEASED_WIP'), [...review.expectedWipEchoIds].sort()],
    ['SONATA', 'UNRELEASED_WIP', lifecycleIds(sonatas, 'UNRELEASED_WIP'), [...review.expectedWipSonataIds].sort()],
  ];
  for (const [scope, status, actual, expected] of lifecycleChecks) {
    if (!sameStrings(actual, expected)) {
      issues.push({ code: 'LIFECYCLE_SET_MISMATCH', scope, detail: `${scope} ${status} IDs expected ${expected.join(', ') || '(none)'}, found ${actual.join(', ') || '(none)'}.` });
    }
  }

  addDuplicateIssues(echoes, 'ECHO', issues);
  addDuplicateIssues(sonatas, 'SONATA', issues);

  const sonataIds = new Set(sonatas.map((set) => set.id));
  const referencedSonataIds = new Set<string>();

  for (const echo of echoes) {
    if (!Number.isInteger(echo.sourceId) || echo.sourceId <= 0 || echo.name.trim().length === 0 || echo.id.trim().length === 0) {
      issues.push({ code: 'REQUIRED_FIELD_MISSING', scope: 'ECHO', recordId: echo.id, detail: `${echo.id || '(blank id)'} is missing stable raw identity fields.` });
    }
    if (echo.cost !== 1 && echo.cost !== 3 && echo.cost !== 4) {
      issues.push({ code: 'INVALID_COST', scope: 'ECHO', recordId: echo.id, detail: `${echo.id} has unsupported COST ${String(echo.cost)}.` });
    }
    if (
      (echo.cost === 1 && echo.threatClass !== 'COMMON')
      || (echo.cost === 3 && echo.threatClass !== 'ELITE')
      || (echo.cost === 4 && echo.threatClass !== null)
    ) {
      issues.push({ code: 'INVALID_THREAT_CLASS', scope: 'ECHO', recordId: echo.id, detail: `${echo.id} has a threatClass not supported by the current raw source contract.` });
    }
    if (echo.sonataSetIds.length === 0) {
      issues.push({ code: 'MEMBERSHIP_MISSING', scope: 'ECHO', recordId: echo.id, detail: `${echo.id} has no Sonata membership.` });
    }
    if (new Set(echo.sonataSetIds).size !== echo.sonataSetIds.length) {
      issues.push({ code: 'MEMBERSHIP_DUPLICATE', scope: 'ECHO', recordId: echo.id, detail: `${echo.id} repeats a Sonata membership.` });
    }
    for (const setId of echo.sonataSetIds) {
      referencedSonataIds.add(setId);
      if (!sonataIds.has(setId)) {
        issues.push({ code: 'MEMBERSHIP_REFERENCE_MISSING', scope: 'ECHO', recordId: echo.id, detail: `${echo.id} references missing Sonata ${setId}.` });
      }
    }
    if (echo.integrationStatus !== 'DATA_ONLY') {
      issues.push({ code: 'RAW_LAYER_STATUS_MISMATCH', scope: 'ECHO', recordId: echo.id, detail: `${echo.id} raw catalog status is ${echo.integrationStatus}, expected DATA_ONLY for this reviewed snapshot.` });
    }
    checkProvenance(echo, 'ECHO', issues);
  }

  for (const set of sonatas) {
    if (!Number.isInteger(set.sourceId) || set.sourceId <= 0 || set.name.trim().length === 0 || set.id.trim().length === 0) {
      issues.push({ code: 'REQUIRED_FIELD_MISSING', scope: 'SONATA', recordId: set.id, detail: `${set.id || '(blank id)'} is missing stable raw identity fields.` });
    }
    if (set.activationPieces.length === 0 || new Set(set.activationPieces).size !== set.activationPieces.length || set.activationPieces.some((pieces) => !Number.isInteger(pieces) || pieces <= 0)) {
      issues.push({ code: 'SONATA_ACTIVATION_INVALID', scope: 'SONATA', recordId: set.id, detail: `${set.id} has invalid activation thresholds.` });
    }
    const rawPieces = set.rawPieceEffects.map((effect) => effect.pieces).sort((a, b) => a - b);
    const activationPieces = [...set.activationPieces].sort((a, b) => a - b);
    if (!sameNumbers(rawPieces, activationPieces)) {
      issues.push({ code: 'SONATA_ACTIVATION_INVALID', scope: 'SONATA', recordId: set.id, detail: `${set.id} activation thresholds do not match raw piece-effect rows.` });
    }
    if (set.rawPieceEffects.some((effect) => effect.description.trim().length === 0)) {
      issues.push({ code: 'SONATA_EFFECT_TEXT_MISSING', scope: 'SONATA', recordId: set.id, detail: `${set.id} has an empty raw piece-effect description.` });
    }
    if (!referencedSonataIds.has(set.id)) {
      issues.push({ code: 'SONATA_UNREFERENCED', scope: 'SONATA', recordId: set.id, detail: `${set.id} is not referenced by any Echo.` });
    }
    if (set.integrationStatus !== 'DATA_ONLY') {
      issues.push({ code: 'RAW_LAYER_STATUS_MISMATCH', scope: 'SONATA', recordId: set.id, detail: `${set.id} raw catalog status is ${set.integrationStatus}, expected DATA_ONLY for this reviewed snapshot.` });
    }
    checkProvenance(set, 'SONATA', issues);
  }

  if (
    meta.sourceRepository !== review.expectedSnapshotSourceRepository
    || meta.sourceCommit !== review.expectedSnapshotSourceCommit
    || meta.echoCount !== echoes.length
    || meta.sonataCount !== sonatas.length
  ) {
    issues.push({ code: 'SNAPSHOT_META_MISMATCH', detail: `Echo snapshot metadata no longer matches the reviewed patch ${review.patch} contract.` });
  }

  if (meta.freshnessGate !== review.freshnessGate || !echoes.some((echo) => echo.name === review.freshnessGate && echo.releaseStatus === 'RELEASED')) {
    issues.push({ code: 'FRESHNESS_GATE_MISSING', scope: 'ECHO', detail: `Current-patch freshness gate ${review.freshnessGate} is missing or not released.` });
  }

  const echoById = new Map(echoes.map((echo) => [echo.id, echo]));
  const sonataById = new Map(sonatas.map((set) => [set.id, set]));
  for (const id of review.currentPatchReleasedEchoIds) {
    if (echoById.get(id)?.releaseStatus !== 'RELEASED') {
      issues.push({ code: 'CURRENT_PATCH_RECORD_MISSING', scope: 'ECHO', recordId: id, detail: `Current-patch Echo ${id} is missing or not RELEASED.` });
    }
  }

  const uniqueConflicts = new Set<string>();
  for (const conflict of review.sourceConflicts) {
    const key = `${conflict.scope}:${conflict.recordId}`;
    uniqueConflicts.add(key);
    const record = conflict.scope === 'ECHO' ? echoById.get(conflict.recordId) : sonataById.get(conflict.recordId);
    if (!record) {
      issues.push({ code: 'SOURCE_CONFLICT_UNKNOWN_RECORD', scope: conflict.scope, recordId: conflict.recordId, detail: `Registered source conflict points to unknown record ${conflict.recordId}.` });
      continue;
    }
    if (record.verificationStatus === 'VERIFIED') {
      issues.push({ code: 'SOURCE_CONFLICT_MARKED_VERIFIED', scope: conflict.scope, recordId: conflict.recordId, detail: `${conflict.recordId} is source-conflicted but marked VERIFIED.` });
    }
  }

  const echoConflictCount = [...uniqueConflicts].filter((key) => key.startsWith('ECHO:')).length;
  const sonataConflictCount = [...uniqueConflicts].filter((key) => key.startsWith('SONATA:')).length;

  return {
    echoCatalogCount: echoes.length,
    releasedEchoCount: releasedEchoes.length,
    sonataCatalogCount: sonatas.length,
    releasedSonataCount: releasedSonatas.length,
    verifiedCurrentEchoCount: Math.max(0, releasedEchoes.length - echoConflictCount),
    verifiedCurrentSonataCount: Math.max(0, releasedSonatas.length - sonataConflictCount),
    sourceConflictCount: uniqueConflicts.size,
    issues,
  };
}
