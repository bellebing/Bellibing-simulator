import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import {
  WEAPON_CAST_WINDOW_CONTRACTS,
  activateWeaponCastWindow,
  type ActiveWeaponSelfWindow,
  type WeaponCastEvent,
  type WeaponCastEventKind,
} from '../combat/weaponCastWindowAdapter.ts';

export const FACTORY_STANDARD_EFFECT_FAMILY_ID = 'weapon-cast-timed-self-window-v1' as const;
export const FACTORY_STANDARD_EFFECT_SOURCE_AUTHORITY = 'BELLIBING_CANONICAL_WEAPON_EFFECT_CATALOG' as const;

export interface FactoryWeaponCastTimedSelfSpec {
  readonly specId: string;
  readonly familyId: typeof FACTORY_STANDARD_EFFECT_FAMILY_ID;
  readonly sourceAuthority: typeof FACTORY_STANDARD_EFFECT_SOURCE_AUTHORITY;
  readonly effectId: string;
}

export interface CompiledFactoryWeaponCastTimedSelfEffect {
  readonly generatorId: 'factory-standard-effect-generator-v1';
  readonly specId: string;
  readonly familyId: typeof FACTORY_STANDARD_EFFECT_FAMILY_ID;
  readonly sourceAuthority: typeof FACTORY_STANDARD_EFFECT_SOURCE_AUTHORITY;
  readonly effectId: string;
  readonly weaponId: string;
  readonly triggerEvents: readonly WeaponCastEventKind[];
  readonly runtimeAdapterId: 'weapon-cast-timed-self-window-v1';
}

/**
 * First intentionally narrow Factory standard-effect proof.
 *
 * These specs contain identities only. Numeric values, durations, trigger text,
 * scope and runtime semantics remain owned by Bellibing's canonical Weapon
 * Effect catalog plus the already-reviewed cast-window primitive.
 */
export const FACTORY_STANDARD_EFFECT_SPECS: readonly FactoryWeaponCastTimedSelfSpec[] = [
  {
    specId: 'ages-of-harvest-ageless-marking-v1',
    familyId: FACTORY_STANDARD_EFFECT_FAMILY_ID,
    sourceAuthority: FACTORY_STANDARD_EFFECT_SOURCE_AUTHORITY,
    effectId: 'AH-INTRO',
  },
  {
    specId: 'ages-of-harvest-ethereal-endowment-v1',
    familyId: FACTORY_STANDARD_EFFECT_FAMILY_ID,
    sourceAuthority: FACTORY_STANDARD_EFFECT_SOURCE_AUTHORITY,
    effectId: 'AH-SKILL',
  },
] as const;

function compileSpec(spec: FactoryWeaponCastTimedSelfSpec): CompiledFactoryWeaponCastTimedSelfEffect {
  if (!spec.specId.trim()) throw new Error('Factory standard effect: specId must be non-empty');
  if (spec.familyId !== FACTORY_STANDARD_EFFECT_FAMILY_ID) {
    throw new Error(`Factory standard effect: unsupported family ${spec.familyId}`);
  }
  if (spec.sourceAuthority !== FACTORY_STANDARD_EFFECT_SOURCE_AUTHORITY) {
    throw new Error('Factory standard effect: external/provider evidence cannot be runtime source authority');
  }

  const contract = WEAPON_CAST_WINDOW_CONTRACTS.find((row) => row.effectId === spec.effectId);
  if (!contract) throw new Error(`Factory standard effect: no reviewed cast-window contract for ${spec.effectId}`);

  const matches = WEAPON_EFFECT_CATALOG.filter((effect) => effect.effectId === spec.effectId);
  if (matches.length !== 1) {
    throw new Error(`Factory standard effect: expected exactly one canonical Weapon Effect row for ${spec.effectId}`);
  }
  const effect = matches[0];

  if (effect.effectType !== 'TRIGGERED' || effect.appliesTo !== 'SELF' || effect.maxStacks !== 1) {
    throw new Error(`Factory standard effect: ${spec.effectId} drifted outside timed SELF-window family`);
  }
  if (effect.durationSeconds === null || !Number.isFinite(effect.durationSeconds) || effect.durationSeconds <= 0) {
    throw new Error(`Factory standard effect: ${spec.effectId} requires canonical positive duration`);
  }
  if (effect.trigger !== contract.expectedSourceTrigger) {
    throw new Error(`Factory standard effect: ${spec.effectId} trigger no longer matches reviewed runtime contract`);
  }

  return {
    generatorId: 'factory-standard-effect-generator-v1',
    specId: spec.specId,
    familyId: FACTORY_STANDARD_EFFECT_FAMILY_ID,
    sourceAuthority: FACTORY_STANDARD_EFFECT_SOURCE_AUTHORITY,
    effectId: spec.effectId,
    weaponId: effect.weaponId,
    triggerEvents: [...contract.triggerEvents],
    runtimeAdapterId: 'weapon-cast-timed-self-window-v1',
  };
}

export function compileFactoryStandardEffects(
  specs: readonly FactoryWeaponCastTimedSelfSpec[] = FACTORY_STANDARD_EFFECT_SPECS,
): readonly CompiledFactoryWeaponCastTimedSelfEffect[] {
  const seenSpecIds = new Set<string>();
  const seenEffectIds = new Set<string>();

  return specs.map((spec) => {
    if (seenSpecIds.has(spec.specId)) throw new Error(`Factory standard effect: duplicate specId ${spec.specId}`);
    if (seenEffectIds.has(spec.effectId)) throw new Error(`Factory standard effect: duplicate effectId ${spec.effectId}`);
    seenSpecIds.add(spec.specId);
    seenEffectIds.add(spec.effectId);
    return compileSpec(spec);
  });
}

export function activateFactoryGeneratedWeaponCastTimedSelfEffect(params: {
  readonly specId: string;
  readonly rank: 1 | 2 | 3 | 4 | 5;
  readonly wielderId: string;
  readonly event: WeaponCastEvent;
}): ActiveWeaponSelfWindow | null {
  const spec = FACTORY_STANDARD_EFFECT_SPECS.find((row) => row.specId === params.specId);
  if (!spec) throw new Error(`Factory standard effect: unknown specId ${params.specId}`);

  // Recompile on activation so canonical/runtime contract drift fails closed.
  const compiled = compileSpec(spec);
  return activateWeaponCastWindow({
    effectId: compiled.effectId,
    rank: params.rank,
    wielderId: params.wielderId,
    event: params.event,
  });
}
