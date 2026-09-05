import {
  FACTORY_PROVIDER_REGISTRY,
  buildFactoryExceptionQueue,
  reconcileFactoryEvidence,
  type FactoryEvidenceCandidate,
  type FactoryEvidenceReconciliation,
  type FactoryEvidenceState,
} from '../evidence.ts';

export const FACTORY_WEAPON_RARITY_FAMILY_ID = 'weapon-rarity-v1' as const;
export const FACTORY_WEAPON_RARITY_PROTOTYPE_PROVIDER_IDS = [
  'prydwen-profile-source',
  'frequency-manager',
] as const;

export interface FactoryWeaponRarityRawRow {
  readonly providerId: string;
  readonly evidenceState: FactoryEvidenceState;
  readonly sourceRef: string | null;
  readonly sourceVersion: string | null;
  readonly raw: Readonly<Record<string, unknown>>;
  readonly notes?: readonly string[];
}

export interface FactoryWeaponRarityEvidenceSnapshot {
  readonly schemaVersion: 1;
  readonly familyId: typeof FACTORY_WEAPON_RARITY_FAMILY_ID;
  readonly subjectId: string;
  readonly fieldId: string;
  readonly capturedAt: string;
  readonly providers: readonly FactoryWeaponRarityRawRow[];
}

export interface FactoryWeaponRarityEvidenceReport {
  readonly familyId: typeof FACTORY_WEAPON_RARITY_FAMILY_ID;
  readonly reconciliation: FactoryEvidenceReconciliation;
  readonly exceptionQueue: readonly FactoryEvidenceReconciliation[];
}

function providerApprovedForThisPrototype(providerId: string): boolean {
  const provider = FACTORY_PROVIDER_REGISTRY.find((row) => row.providerId === providerId);
  const prototypeApproved = FACTORY_WEAPON_RARITY_PROTOTYPE_PROVIDER_IDS.some((id) => id === providerId);
  return provider !== undefined
    && prototypeApproved
    && provider.licenseStatus === 'VERIFIED'
    && provider.canonicalAuthority === false
    && provider.dataUsePolicy !== 'REFERENCE_ONLY_NO_REUSE';
}

function rarityFingerprint(stars: number): string {
  return `${FACTORY_WEAPON_RARITY_FAMILY_ID}:stars=${stars}`;
}

function normalizePresentRow(
  row: FactoryWeaponRarityRawRow,
): { readonly semanticFingerprint: string | null; readonly reason: string } {
  if (row.providerId === 'prydwen-profile-source') {
    if (typeof row.raw.rarityLabel !== 'string') {
      return { semanticFingerprint: null, reason: 'Prydwen rarityLabel is absent or non-string.' };
    }
    const match = /^([1-5])★$/.exec(row.raw.rarityLabel.trim());
    if (match === null) {
      return { semanticFingerprint: null, reason: 'Prydwen rarityLabel is not an exact reviewed 1★-5★ label.' };
    }
    return {
      semanticFingerprint: rarityFingerprint(Number(match[1])),
      reason: 'Prydwen star label normalized to discrete weapon rarity without effect/runtime inference.',
    };
  }

  if (row.providerId === 'frequency-manager') {
    if (typeof row.raw.rarity !== 'number' || !Number.isInteger(row.raw.rarity) || row.raw.rarity < 1 || row.raw.rarity > 5) {
      return { semanticFingerprint: null, reason: 'FrequencyManager rarity is not an integer from 1 through 5.' };
    }
    return {
      semanticFingerprint: rarityFingerprint(row.raw.rarity),
      reason: 'FrequencyManager integer weapon rarity normalized to the shared star-count family.',
    };
  }

  return { semanticFingerprint: null, reason: `No reviewed mapping exists for provider ${row.providerId}.` };
}

export function normalizeWeaponRarityEvidence(
  snapshot: FactoryWeaponRarityEvidenceSnapshot,
): readonly FactoryEvidenceCandidate[] {
  if (snapshot.schemaVersion !== 1) throw new Error(`Factory weapon rarity: unsupported schema ${snapshot.schemaVersion}`);
  if (snapshot.familyId !== FACTORY_WEAPON_RARITY_FAMILY_ID) {
    throw new Error(`Factory weapon rarity: unsupported family ${snapshot.familyId}`);
  }
  if (!snapshot.subjectId.trim() || !snapshot.fieldId.trim() || !snapshot.capturedAt.trim()) {
    throw new Error('Factory weapon rarity: subjectId, fieldId and capturedAt must be non-empty');
  }

  return snapshot.providers.map((row, index) => {
    const candidateId = `${snapshot.familyId}:${snapshot.subjectId}:${row.providerId}:${index + 1}`;

    if (!providerApprovedForThisPrototype(row.providerId)) {
      return {
        candidateId,
        providerId: row.providerId,
        subjectId: snapshot.subjectId,
        fieldId: snapshot.fieldId,
        evidenceState: 'UNKNOWN',
        semanticFingerprint: null,
        sourceRef: row.sourceRef,
        sourceVersion: row.sourceVersion,
        capturedAt: snapshot.capturedAt,
        notes: [...(row.notes ?? []), 'Provider is not approved for this bounded Factory mapping prototype.'],
      } satisfies FactoryEvidenceCandidate;
    }

    if (row.evidenceState !== 'PRESENT') {
      return {
        candidateId,
        providerId: row.providerId,
        subjectId: snapshot.subjectId,
        fieldId: snapshot.fieldId,
        evidenceState: row.evidenceState,
        semanticFingerprint: null,
        sourceRef: row.sourceRef,
        sourceVersion: row.sourceVersion,
        capturedAt: snapshot.capturedAt,
        notes: row.notes,
      } satisfies FactoryEvidenceCandidate;
    }

    const normalized = normalizePresentRow(row);
    if (normalized.semanticFingerprint === null) {
      return {
        candidateId,
        providerId: row.providerId,
        subjectId: snapshot.subjectId,
        fieldId: snapshot.fieldId,
        evidenceState: 'UNKNOWN',
        semanticFingerprint: null,
        sourceRef: row.sourceRef,
        sourceVersion: row.sourceVersion,
        capturedAt: snapshot.capturedAt,
        notes: [...(row.notes ?? []), normalized.reason],
      } satisfies FactoryEvidenceCandidate;
    }

    return {
      candidateId,
      providerId: row.providerId,
      subjectId: snapshot.subjectId,
      fieldId: snapshot.fieldId,
      evidenceState: 'PRESENT',
      semanticFingerprint: normalized.semanticFingerprint,
      sourceRef: row.sourceRef,
      sourceVersion: row.sourceVersion,
      capturedAt: snapshot.capturedAt,
      notes: [...(row.notes ?? []), normalized.reason],
    } satisfies FactoryEvidenceCandidate;
  });
}

export function buildWeaponRarityEvidenceReport(
  snapshot: FactoryWeaponRarityEvidenceSnapshot,
): FactoryWeaponRarityEvidenceReport {
  const candidates = normalizeWeaponRarityEvidence(snapshot);
  const reconciliation = reconcileFactoryEvidence({
    subjectId: snapshot.subjectId,
    fieldId: snapshot.fieldId,
    candidates,
  });

  return {
    familyId: FACTORY_WEAPON_RARITY_FAMILY_ID,
    reconciliation,
    exceptionQueue: buildFactoryExceptionQueue([reconciliation]),
  };
}
