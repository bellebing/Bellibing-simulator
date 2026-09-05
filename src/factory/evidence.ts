export type FactoryEvidenceClassification =
  | 'CONSENSUS'
  | 'SINGLE_SOURCE'
  | 'CONFLICT'
  | 'MISSING'
  | 'UNKNOWN';

export type FactoryEvidenceState = 'PRESENT' | 'MISSING' | 'UNKNOWN';
export type FactoryEvidenceRoute = 'REVIEW_CANDIDATE' | 'EXCEPTION_QUEUE';
export type FactoryProviderLicenseStatus = 'VERIFIED' | 'REVIEW_REQUIRED' | 'UNLICENSED';
export type FactoryProviderDataUsePolicy = 'REVIEW_ONLY' | 'EVIDENCE_ONLY' | 'REFERENCE_ONLY_NO_REUSE';

export interface FactoryProviderDescriptor {
  readonly providerId: string;
  readonly displayName: string;
  readonly sourceType: 'WEB_EXTRACTION' | 'GITHUB_DATASET' | 'GITHUB_TOOL';
  readonly licenseStatus: FactoryProviderLicenseStatus;
  readonly licenseId: string | null;
  readonly licenseSourceRef: string | null;
  readonly dataUsePolicy: FactoryProviderDataUsePolicy;
  readonly canonicalAuthority: false;
  readonly enabledForFactoryEvidence: boolean;
  readonly notes: readonly string[];
}

export interface FactoryEvidenceCandidate {
  readonly candidateId: string;
  readonly providerId: string;
  readonly subjectId: string;
  readonly fieldId: string;
  readonly evidenceState: FactoryEvidenceState;
  /**
   * Provider-specific raw values are normalized outside this contract. A
   * semantic fingerprint may only be supplied when the provider evidence can
   * be interpreted without inventing missing Wuthering Waves semantics.
   */
  readonly semanticFingerprint: string | null;
  readonly sourceRef: string | null;
  readonly sourceVersion: string | null;
  readonly capturedAt: string;
  readonly notes?: readonly string[];
}

export interface FactoryEvidenceReconciliation {
  readonly subjectId: string;
  readonly fieldId: string;
  readonly classification: FactoryEvidenceClassification;
  readonly route: FactoryEvidenceRoute;
  readonly canonicalPromotion: 'MANUAL_SOURCE_VALIDATION_REQUIRED';
  readonly presentProviderIds: readonly string[];
  readonly semanticFingerprints: readonly string[];
  readonly candidates: readonly FactoryEvidenceCandidate[];
  readonly reason: string;
}

export const FACTORY_PROVIDER_REGISTRY: readonly FactoryProviderDescriptor[] = [
  {
    providerId: 'prydwen-profile-source',
    displayName: 'Bellibing Prydwen profile-source extraction lane',
    sourceType: 'WEB_EXTRACTION',
    licenseStatus: 'VERIFIED',
    licenseId: 'MIT (extractor code)',
    licenseSourceRef: 'theonuverse/ww_prydwen_api',
    dataUsePolicy: 'REVIEW_ONLY',
    canonicalAuthority: false,
    enabledForFactoryEvidence: true,
    notes: [
      'Existing Bellibing lane already produces review artifacts.',
      'Extractor code license does not make extracted page content canonical truth.',
    ],
  },
  {
    providerId: 'frequency-manager',
    displayName: 'Voruzhu/FrequencyManager',
    sourceType: 'GITHUB_DATASET',
    licenseStatus: 'VERIFIED',
    licenseId: 'MIT',
    licenseSourceRef: 'Voruzhu/FrequencyManager@master:LICENSE',
    dataUsePolicy: 'EVIDENCE_ONLY',
    canonicalAuthority: false,
    enabledForFactoryEvidence: false,
    notes: ['Approved for a small independent-evidence mapping prototype before broader ingestion.'],
  },
  {
    providerId: 'wuwa-afyg-tool',
    displayName: 'd4rkOfficial/wuwa-afyg-tool',
    sourceType: 'GITHUB_TOOL',
    licenseStatus: 'VERIFIED',
    licenseId: 'MIT',
    licenseSourceRef: 'd4rkOfficial/wuwa-afyg-tool@main:LICENSE',
    dataUsePolicy: 'EVIDENCE_ONLY',
    canonicalAuthority: false,
    enabledForFactoryEvidence: false,
    notes: [
      'Contract/provider architecture may be reused under MIT.',
      'Wuthering Waves data still requires provider mapping/provenance review before ingestion.',
    ],
  },
  {
    providerId: 'wuwabuild-reference',
    displayName: 'DommyMM/wuwabuild',
    sourceType: 'GITHUB_DATASET',
    licenseStatus: 'UNLICENSED',
    licenseId: null,
    licenseSourceRef: null,
    dataUsePolicy: 'REFERENCE_ONLY_NO_REUSE',
    canonicalAuthority: false,
    enabledForFactoryEvidence: false,
    notes: ['No LICENSE file/current GitHub license detected during 2026-09-05 cutover audit.'],
  },
] as const;

function assertNonEmpty(value: string, label: string): void {
  if (value.trim().length === 0) throw new Error(`Factory evidence: ${label} must be non-empty`);
}

export function validateFactoryProviderRegistry(
  providers: readonly FactoryProviderDescriptor[] = FACTORY_PROVIDER_REGISTRY,
): void {
  const ids = new Set<string>();
  for (const provider of providers) {
    assertNonEmpty(provider.providerId, 'providerId');
    assertNonEmpty(provider.displayName, `displayName for ${provider.providerId}`);
    if (ids.has(provider.providerId)) throw new Error(`Factory evidence: duplicate providerId ${provider.providerId}`);
    ids.add(provider.providerId);

    if (provider.canonicalAuthority !== false) {
      throw new Error(`Factory evidence: provider ${provider.providerId} must never be canonical authority`);
    }
    if (provider.licenseStatus === 'UNLICENSED' && provider.enabledForFactoryEvidence) {
      throw new Error(`Factory evidence: unlicensed provider ${provider.providerId} cannot be enabled for ingestion`);
    }
    if (provider.dataUsePolicy === 'REFERENCE_ONLY_NO_REUSE' && provider.enabledForFactoryEvidence) {
      throw new Error(`Factory evidence: reference-only provider ${provider.providerId} cannot be enabled for ingestion`);
    }
  }
}

function validateCandidate(candidate: FactoryEvidenceCandidate, subjectId: string, fieldId: string): void {
  assertNonEmpty(candidate.candidateId, 'candidateId');
  assertNonEmpty(candidate.providerId, `providerId for ${candidate.candidateId}`);
  if (candidate.subjectId !== subjectId || candidate.fieldId !== fieldId) {
    throw new Error(
      `Factory evidence: candidate ${candidate.candidateId} belongs to ${candidate.subjectId}/${candidate.fieldId}, expected ${subjectId}/${fieldId}`,
    );
  }

  if (candidate.evidenceState === 'PRESENT') {
    if (candidate.semanticFingerprint === null || candidate.semanticFingerprint.trim().length === 0) {
      throw new Error(`Factory evidence: PRESENT candidate ${candidate.candidateId} requires semanticFingerprint`);
    }
    if (candidate.sourceRef === null || candidate.sourceRef.trim().length === 0) {
      throw new Error(`Factory evidence: PRESENT candidate ${candidate.candidateId} requires sourceRef`);
    }
  } else if (candidate.semanticFingerprint !== null) {
    throw new Error(
      `Factory evidence: ${candidate.evidenceState} candidate ${candidate.candidateId} must not carry semanticFingerprint`,
    );
  }
}

export function reconcileFactoryEvidence(input: {
  readonly subjectId: string;
  readonly fieldId: string;
  readonly candidates: readonly FactoryEvidenceCandidate[];
}): FactoryEvidenceReconciliation {
  assertNonEmpty(input.subjectId, 'subjectId');
  assertNonEmpty(input.fieldId, 'fieldId');
  input.candidates.forEach((candidate) => validateCandidate(candidate, input.subjectId, input.fieldId));

  const present = input.candidates.filter((candidate) => candidate.evidenceState === 'PRESENT');
  const unknown = input.candidates.filter((candidate) => candidate.evidenceState === 'UNKNOWN');

  let classification: FactoryEvidenceClassification;
  let reason: string;

  if (present.length === 0) {
    if (unknown.length > 0) {
      classification = 'UNKNOWN';
      reason = 'Provider evidence exists but cannot be normalized safely.';
    } else {
      classification = 'MISSING';
      reason = 'No provider supplies a present source-valid candidate.';
    }
  } else {
    const fingerprintsByProvider = new Map<string, Set<string>>();
    for (const candidate of present) {
      const fingerprint = candidate.semanticFingerprint as string;
      const providerFingerprints = fingerprintsByProvider.get(candidate.providerId) ?? new Set<string>();
      providerFingerprints.add(fingerprint);
      fingerprintsByProvider.set(candidate.providerId, providerFingerprints);
    }

    const providerInternalConflict = [...fingerprintsByProvider.values()].some((fingerprints) => fingerprints.size > 1);
    const allFingerprints = new Set(present.map((candidate) => candidate.semanticFingerprint as string));

    if (providerInternalConflict || allFingerprints.size > 1) {
      classification = 'CONFLICT';
      reason = providerInternalConflict
        ? 'At least one provider supplies contradictory present candidates.'
        : 'Independent provider candidates disagree after normalization.';
    } else if (fingerprintsByProvider.size === 1) {
      classification = 'SINGLE_SOURCE';
      reason = 'Exactly one provider supplies a present normalized candidate.';
    } else {
      classification = 'CONSENSUS';
      reason = 'Two or more independent providers normalize to the same semantic fingerprint.';
    }
  }

  const route: FactoryEvidenceRoute =
    classification === 'CONFLICT' || classification === 'MISSING' || classification === 'UNKNOWN'
      ? 'EXCEPTION_QUEUE'
      : 'REVIEW_CANDIDATE';

  return {
    subjectId: input.subjectId,
    fieldId: input.fieldId,
    classification,
    route,
    canonicalPromotion: 'MANUAL_SOURCE_VALIDATION_REQUIRED',
    presentProviderIds: [...new Set(present.map((candidate) => candidate.providerId))].sort(),
    semanticFingerprints: [...new Set(present.map((candidate) => candidate.semanticFingerprint as string))].sort(),
    candidates: [...input.candidates],
    reason,
  };
}

export function buildFactoryExceptionQueue(
  reconciliations: readonly FactoryEvidenceReconciliation[],
): readonly FactoryEvidenceReconciliation[] {
  return reconciliations.filter((row) => row.route === 'EXCEPTION_QUEUE');
}
