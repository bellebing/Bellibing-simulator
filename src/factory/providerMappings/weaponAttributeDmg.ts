import {
  FACTORY_PROVIDER_REGISTRY,
  buildFactoryExceptionQueue,
  reconcileFactoryEvidence,
  type FactoryEvidenceCandidate,
  type FactoryEvidenceReconciliation,
  type FactoryEvidenceState,
} from '../evidence.ts';

export const FACTORY_WEAPON_R1_ATTRIBUTE_DMG_FAMILY_ID = 'weapon-r1-attribute-dmg-bonus-v1' as const;

export interface FactoryWeaponAttributeDmgRawRow {
  readonly providerId: string;
  readonly evidenceState: FactoryEvidenceState;
  readonly sourceRef: string | null;
  readonly sourceVersion: string | null;
  readonly raw: Readonly<Record<string, unknown>>;
  readonly notes?: readonly string[];
}

export interface FactoryWeaponAttributeDmgEvidenceSnapshot {
  readonly schemaVersion: 1;
  readonly familyId: typeof FACTORY_WEAPON_R1_ATTRIBUTE_DMG_FAMILY_ID;
  readonly subjectId: string;
  readonly fieldId: string;
  readonly capturedAt: string;
  readonly providers: readonly FactoryWeaponAttributeDmgRawRow[];
}

export interface FactoryWeaponAttributeDmgEvidenceReport {
  readonly familyId: typeof FACTORY_WEAPON_R1_ATTRIBUTE_DMG_FAMILY_ID;
  readonly reconciliation: FactoryEvidenceReconciliation;
  readonly exceptionQueue: readonly FactoryEvidenceReconciliation[];
}

function providerEnabledForEvidence(providerId: string): boolean {
  const provider = FACTORY_PROVIDER_REGISTRY.find((row) => row.providerId === providerId);
  return provider?.enabledForFactoryEvidence === true
    && provider.canonicalAuthority === false
    && provider.dataUsePolicy !== 'REFERENCE_ONLY_NO_REUSE';
}

function finitePositivePercent(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function normalizedPercentFingerprint(valuePercent: number): string {
  const decimal = valuePercent / 100;
  return `${FACTORY_WEAPON_R1_ATTRIBUTE_DMG_FAMILY_ID}:decimal=${decimal.toFixed(6)}`;
}

function normalizePresentRow(
  row: FactoryWeaponAttributeDmgRawRow,
): { readonly semanticFingerprint: string | null; readonly reason: string } {
  const valuePercent = finitePositivePercent(row.raw.valuePercent);
  if (valuePercent === null) {
    return { semanticFingerprint: null, reason: 'Provider valuePercent is absent, non-finite, or non-positive.' };
  }

  if (row.providerId === 'prydwen-profile-source') {
    if (row.raw.rank !== 1 || row.raw.bonusKind !== 'GENERAL_DMG_BONUS') {
      return { semanticFingerprint: null, reason: 'Prydwen row is not an exact R1 general damage-bonus value.' };
    }
    return {
      semanticFingerprint: normalizedPercentFingerprint(valuePercent),
      reason: 'Prydwen R1 general DMG Bonus value normalized without trigger/lifetime inference.',
    };
  }

  if (row.providerId === 'frequency-manager') {
    if (row.raw.rank !== 1 || row.raw.stat !== 'elemDmg' || row.raw.conditional !== false) {
      return { semanticFingerprint: null, reason: 'FrequencyManager row is not an exact unconditional R1 elemDmg value.' };
    }
    return {
      semanticFingerprint: normalizedPercentFingerprint(valuePercent),
      reason: 'FrequencyManager unconditional R1 elemDmg value normalized to the shared attribute-DMG family.',
    };
  }

  return { semanticFingerprint: null, reason: `No reviewed mapping exists for provider ${row.providerId}.` };
}

export function normalizeWeaponR1AttributeDmgEvidence(
  snapshot: FactoryWeaponAttributeDmgEvidenceSnapshot,
): readonly FactoryEvidenceCandidate[] {
  if (snapshot.schemaVersion !== 1) throw new Error(`Factory weapon attribute DMG: unsupported schema ${snapshot.schemaVersion}`);
  if (snapshot.familyId !== FACTORY_WEAPON_R1_ATTRIBUTE_DMG_FAMILY_ID) {
    throw new Error(`Factory weapon attribute DMG: unsupported family ${snapshot.familyId}`);
  }
  if (!snapshot.subjectId.trim() || !snapshot.fieldId.trim() || !snapshot.capturedAt.trim()) {
    throw new Error('Factory weapon attribute DMG: subjectId, fieldId and capturedAt must be non-empty');
  }

  return snapshot.providers.map((row, index) => {
    const candidateId = `${snapshot.familyId}:${snapshot.subjectId}:${row.providerId}:${index + 1}`;

    if (!providerEnabledForEvidence(row.providerId)) {
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
        notes: [...(row.notes ?? []), 'Provider is not enabled for Factory evidence mapping.'],
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

export function buildWeaponR1AttributeDmgEvidenceReport(
  snapshot: FactoryWeaponAttributeDmgEvidenceSnapshot,
): FactoryWeaponAttributeDmgEvidenceReport {
  const candidates = normalizeWeaponR1AttributeDmgEvidence(snapshot);
  const reconciliation = reconcileFactoryEvidence({
    subjectId: snapshot.subjectId,
    fieldId: snapshot.fieldId,
    candidates,
  });

  return {
    familyId: FACTORY_WEAPON_R1_ATTRIBUTE_DMG_FAMILY_ID,
    reconciliation,
    exceptionQueue: buildFactoryExceptionQueue([reconciliation]),
  };
}
