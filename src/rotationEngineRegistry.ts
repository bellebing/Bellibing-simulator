import {
  CIACCONA_BASIC_ENGINE_MODEL_ID,
  CIACCONA_BASIC_MODELED_MECHANIC_FACT_IDS,
} from './characters/ciacconaStandard.ts';

export interface RotationEngineRegistration {
  readonly engineModelId: string;
  readonly characterId: string;
  /** Character mechanic facts this concrete engine executes even if raw ingestion remains MODEL_READY. */
  readonly modeledMechanicFactIds: readonly string[];
}

/**
 * Concrete engine registrations only. Raw-data modelingStatus is intentionally
 * not rewritten when a profile-specific engine starts executing a MODEL_READY
 * fact; this registry is the combat/DPS-layer proof of that coverage.
 */
export const ROTATION_ENGINE_REGISTRATIONS: readonly RotationEngineRegistration[] = [
  {
    engineModelId: 'AUGUSTA_STD_V1',
    characterId: 'augusta',
    modeledMechanicFactIds: [],
  },
  {
    engineModelId: CIACCONA_BASIC_ENGINE_MODEL_ID,
    characterId: 'ciaccona',
    modeledMechanicFactIds: CIACCONA_BASIC_MODELED_MECHANIC_FACT_IDS,
  },
] as const;

const BY_ID: ReadonlyMap<string, RotationEngineRegistration> = (() => {
  const map = new Map<string, RotationEngineRegistration>();
  for (const registration of ROTATION_ENGINE_REGISTRATIONS) {
    if (!registration.engineModelId.trim()) throw new Error('Rotation engine registration has blank engineModelId.');
    if (map.has(registration.engineModelId)) throw new Error(`Duplicate rotation engine registration ${registration.engineModelId}.`);
    if (new Set(registration.modeledMechanicFactIds).size !== registration.modeledMechanicFactIds.length) {
      throw new Error(`${registration.engineModelId}: duplicate modeled mechanic fact id.`);
    }
    map.set(registration.engineModelId, registration);
  }
  return map;
})();

export function getRotationEngineRegistration(
  engineModelId: string | null | undefined,
): RotationEngineRegistration | null {
  if (!engineModelId) return null;
  return BY_ID.get(engineModelId) ?? null;
}

export function hasRotationEngineModel(
  engineModelId: string | null | undefined,
  characterId?: string,
): boolean {
  const registration = getRotationEngineRegistration(engineModelId);
  return registration !== null && (characterId === undefined || registration.characterId === characterId);
}

export function engineModelsMechanicFact(
  engineModelId: string | null | undefined,
  factId: string,
): boolean {
  return getRotationEngineRegistration(engineModelId)?.modeledMechanicFactIds.includes(factId) ?? false;
}
