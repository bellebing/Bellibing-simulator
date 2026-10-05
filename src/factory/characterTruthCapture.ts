import type { FactoryEvidenceReconciliation } from './evidence.ts';
import { reconcileFactoryEvidence } from './evidence.ts';

export type CharacterTruthEvidenceState =
  | 'CAPTURED_ONE_PROVIDER'
  | 'CONSENSUS_TWO_PROVIDERS'
  | 'PROVIDER_CONFLICT'
  | 'UNAVAILABLE'
  | 'UNMAPPED_IDENTITY';

export type CharacterTruthFamily =
  | 'IDENTITY'
  | 'PROGRESSION'
  | 'SKILL_ACTION'
  | 'MECHANIC'
  | 'SEQUENCE'
  | 'SKILL_TREE';

export type CharacterTruthDeltaState =
  | 'EXACT_AGREEMENT'
  | 'PROVIDER_ONLY'
  | 'BELLIBING_ONLY'
  | 'CONFLICT'
  | 'NOT_COMPARABLE';

export interface CharacterTruthProviderFact {
  readonly providerId: string;
  readonly providerCharacterId: string;
  readonly bellibingCharacterId: string | null;
  readonly family: CharacterTruthFamily;
  readonly factId: string;
  readonly value: unknown;
  readonly sourceRef: string;
  readonly sourceVersion: string | null;
  readonly capturedAt: string;
  readonly freshnessSensitive: boolean;
  readonly notes?: readonly string[];
}

export interface CharacterTruthReconciliation {
  readonly bellibingCharacterId: string | null;
  readonly family: CharacterTruthFamily;
  readonly factId: string;
  readonly evidenceState: CharacterTruthEvidenceState;
  readonly factoryEvidence: FactoryEvidenceReconciliation | null;
  readonly providerFacts: readonly CharacterTruthProviderFact[];
}

export interface CharacterTruthCanonicalDelta {
  readonly characterId: string;
  readonly factId: string;
  readonly state: CharacterTruthDeltaState;
  readonly canonicalValue: unknown;
  readonly providerValues: readonly unknown[];
}

function stable(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${stable(object[key])}`).join(',')}}`;
}

function keyOf(fact: Pick<CharacterTruthProviderFact, 'bellibingCharacterId' | 'family' | 'factId'>): string {
  return `${fact.bellibingCharacterId ?? 'UNMAPPED'}::${fact.family}::${fact.factId}`;
}

export function reconcileCharacterTruthFacts(
  facts: readonly CharacterTruthProviderFact[],
): readonly CharacterTruthReconciliation[] {
  const groups = new Map<string, CharacterTruthProviderFact[]>();
  for (const fact of facts) {
    if (!fact.providerId.trim() || !fact.providerCharacterId.trim() || !fact.factId.trim() || !fact.sourceRef.trim()) {
      throw new Error('Character truth capture: provider identity, fact identity and sourceRef must be non-empty');
    }
    const bucket = groups.get(keyOf(fact)) ?? [];
    bucket.push(fact);
    groups.set(keyOf(fact), bucket);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, group]) => {
    const first = group[0]!;
    if (first.bellibingCharacterId === null) {
      return {
        bellibingCharacterId: null,
        family: first.family,
        factId: first.factId,
        evidenceState: 'UNMAPPED_IDENTITY' as const,
        factoryEvidence: null,
        providerFacts: [...group],
      };
    }

    const factoryEvidence = reconcileFactoryEvidence({
      subjectId: first.bellibingCharacterId,
      fieldId: `${first.family}:${first.factId}`,
      candidates: group.map((fact, index) => ({
        candidateId: `${fact.providerId}:${fact.providerCharacterId}:${fact.family}:${fact.factId}:${index}`,
        providerId: fact.providerId,
        subjectId: first.bellibingCharacterId as string,
        fieldId: `${first.family}:${first.factId}`,
        evidenceState: 'PRESENT' as const,
        semanticFingerprint: stable(fact.value),
        sourceRef: fact.sourceRef,
        sourceVersion: fact.sourceVersion,
        capturedAt: fact.capturedAt,
        notes: fact.notes,
      })),
    });

    const evidenceState: CharacterTruthEvidenceState =
      factoryEvidence.classification === 'CONSENSUS' ? 'CONSENSUS_TWO_PROVIDERS'
      : factoryEvidence.classification === 'SINGLE_SOURCE' ? 'CAPTURED_ONE_PROVIDER'
      : factoryEvidence.classification === 'CONFLICT' ? 'PROVIDER_CONFLICT'
      : 'UNAVAILABLE';

    return {
      bellibingCharacterId: first.bellibingCharacterId,
      family: first.family,
      factId: first.factId,
      evidenceState,
      factoryEvidence,
      providerFacts: [...group],
    };
  });
}

export function compareCharacterTruthToCanonical(input: {
  readonly characterId: string;
  readonly factId: string;
  readonly canonicalValue: unknown;
  readonly providerFacts: readonly CharacterTruthProviderFact[];
}): CharacterTruthCanonicalDelta {
  const providerValues = input.providerFacts.map((fact) => fact.value);
  if (providerValues.length === 0) {
    return { ...input, providerValues, state: 'BELLIBING_ONLY' };
  }
  if (input.canonicalValue === undefined) {
    return { ...input, providerValues, state: 'PROVIDER_ONLY' };
  }
  const canonical = stable(input.canonicalValue);
  const fingerprints = new Set(providerValues.map(stable));
  if (fingerprints.size > 1) return { ...input, providerValues, state: 'CONFLICT' };
  return { ...input, providerValues, state: fingerprints.has(canonical) ? 'EXACT_AGREEMENT' : 'CONFLICT' };
}
