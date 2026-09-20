import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';

export const DAYBREAKERS_SPINE_TUNE_STRAIN_WINDOW_PRIMITIVE_ID =
  'daybreakers-spine-explicit-tune-strain-basic-windows-v1';

const CONTRACTS = [{
  effectId: 'DBS-BASIC-AMP',
  weaponId: 'daybreakers-spine',
  statOrEffect: 'Basic Attack DMG Amplification',
  trigger: 'Inflict Tune Strain - Shifting',
  durationSeconds: 6,
  conditions: [] as readonly string[],
}, {
  effectId: 'DBS-BASIC-DEF',
  weaponId: 'daybreakers-spine',
  statOrEffect: 'DEF Ignore',
  trigger: 'Inflict Tune Strain - Shifting',
  durationSeconds: 6,
  conditions: ['Damage is Basic Attack DMG'] as readonly string[],
}] as const;

type DaybreakersSpineEffectId = typeof CONTRACTS[number]['effectId'];

function resolveContract(effectId: DaybreakersSpineEffectId, catalog: readonly WeaponEffectData[]) {
  const contract = CONTRACTS.find(row => row.effectId === effectId);
  if (!contract) throw new Error(`No reviewed Daybreaker's Spine contract for ${effectId}`);
  const rows = catalog.filter(row => row.effectId === effectId);
  if (rows.length !== 1) throw new Error(`${effectId} requires exactly one canonical source row`);
  const effect = rows[0];
  if (effect.weaponId !== contract.weaponId || effect.statOrEffect !== contract.statOrEffect
    || effect.trigger !== contract.trigger || effect.effectType !== 'TRIGGERED'
    || effect.appliesTo !== 'SELF' || effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL'
    || effect.valueUnit !== 'DECIMAL_MULTIPLIER'
    || effect.durationSeconds !== contract.durationSeconds
    || effect.maxStacks !== 1 || effect.stackIntervalSeconds !== 0
    || effect.triggerCooldownSeconds !== null
    || JSON.stringify(effect.conditions) !== JSON.stringify(contract.conditions)
    || effect.rankValues.length !== 5
    || effect.rankValues.some(value => !Number.isFinite(value) || value <= 0 || value >= 1)) {
    throw new Error(`${effectId} reviewed Daybreaker's Spine source contract drift`);
  }
  return { contract, effect };
}

export function validateDaybreakersSpineTuneStrainContracts(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
) {
  const issues: string[] = [];
  for (const contract of CONTRACTS) {
    try { resolveContract(contract.effectId, catalog); }
    catch (error) { issues.push(error instanceof Error ? error.message : String(error)); }
  }
  return issues;
}

/** Identity/scope only. Rank values and duration stay in canonical WeaponEffectData. */
export function listDaybreakersSpineTuneStrainWindowSupport() {
  const issues = validateDaybreakersSpineTuneStrainContracts();
  if (issues.length) throw new Error(issues.join('; '));
  return CONTRACTS.map(contract => ({
    effectId: contract.effectId,
    weaponId: contract.weaponId,
    statOrEffect: contract.statOrEffect,
    primitiveId: DAYBREAKERS_SPINE_TUNE_STRAIN_WINDOW_PRIMITIVE_ID,
    selectedHitScope: 'BASIC_DIRECT_HIT_ONLY' as const,
    occurrencePolicy: 'CALLER_QUALIFIED_TIMESTAMP_ONLY' as const,
    triggerStatusKind: 'TUNE_STRAIN_SHIFTING_APPLIED' as const,
  }));
}

export interface QualifiedDaybreakersSpineTuneStrainApplicationEvent {
  readonly kind: 'TUNE_STRAIN_SHIFTING_APPLIED';
  readonly actorId: string;
  readonly targetId: string;
  readonly sourceFactId: string;
  readonly atSeconds: number;
  readonly sourceTriggerQualification:
    | 'VERIFIED_DAYBREAKERS_SPINE_TUNE_STRAIN_APPLICATION'
    | 'UNKNOWN';
}

/**
 * One explicit source-qualified Tune Strain - Shifting application activates
 * the paired Daybreaker's Spine windows. No status generation, refresh,
 * target persistence or profile occurrence is inferred here.
 */
export function activateDaybreakersSpineTuneStrainWindows(params: {
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly event: QualifiedDaybreakersSpineTuneStrainApplicationEvent;
  readonly catalog?: readonly WeaponEffectData[];
}) {
  const catalog = params.catalog ?? WEAPON_EFFECT_CATALOG;
  const amplification = resolveContract('DBS-BASIC-AMP', catalog).effect;
  const defense = resolveContract('DBS-BASIC-DEF', catalog).effect;
  const { selectedWeapon, wielderId, event } = params;
  if (selectedWeapon.id !== amplification.weaponId || selectedWeapon.id !== defense.weaponId) {
    throw new Error("Daybreaker's Spine windows require exact Daybreaker's Spine selection");
  }
  if (!Number.isInteger(selectedWeapon.rank) || selectedWeapon.rank < 1 || selectedWeapon.rank > 5) {
    throw new Error("Daybreaker's Spine rank must be explicit R1 through R5");
  }
  if (![wielderId, event.actorId, event.targetId, event.sourceFactId].every(id => id.trim())
    || !Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error('Exact Tune Strain source/target/fact and finite non-negative time are required');
  }
  if (event.kind !== 'TUNE_STRAIN_SHIFTING_APPLIED'
    || event.sourceTriggerQualification !== 'VERIFIED_DAYBREAKERS_SPINE_TUNE_STRAIN_APPLICATION') {
    throw new Error('Explicit source-qualified Tune Strain - Shifting application is required');
  }
  if (event.actorId !== wielderId) return null;

  const make = (effect: WeaponEffectData) => {
    const expiresAtSeconds = event.atSeconds + effect.durationSeconds!;
    if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds) {
      throw new Error("Daybreaker's Spine window expiration is not representable");
    }
    return Object.freeze({
      primitiveId: DAYBREAKERS_SPINE_TUNE_STRAIN_WINDOW_PRIMITIVE_ID,
      effectId: effect.effectId as DaybreakersSpineEffectId,
      weaponId: effect.weaponId,
      actorId: wielderId,
      triggerTargetId: event.targetId,
      sourceFactId: event.sourceFactId,
      triggerStatusKind: event.kind,
      statOrEffect: effect.statOrEffect,
      value: effect.rankValues[selectedWeapon.rank - 1],
      valueUnit: effect.valueUnit,
      selectedHitScope: 'BASIC_DIRECT_HIT_ONLY' as const,
      startedAtSeconds: event.atSeconds,
      expiresAtSeconds,
    });
  };
  return Object.freeze({
    basicAmplification: make(amplification),
    basicDefenseIgnore: make(defense),
  });
}

export type ActiveDaybreakersSpineTuneStrainWindow =
  NonNullable<ReturnType<typeof activateDaybreakersSpineTuneStrainWindows>>['basicAmplification'];

export function isDaybreakersSpineTuneStrainWindowActive(
  window: ActiveDaybreakersSpineTuneStrainWindow,
  query: {
    readonly actorId: string;
    readonly atSeconds: number;
    readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
  },
) {
  if (!query.actorId.trim() || !Number.isFinite(query.atSeconds) || query.atSeconds < 0
    || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(query.sameTimestampOrder)) {
    throw new Error("Daybreaker's Spine window query requires exact actor/time/order");
  }
  return query.actorId === window.actorId
    && query.atSeconds >= window.startedAtSeconds && query.atSeconds < window.expiresAtSeconds
    && !(query.atSeconds === window.startedAtSeconds && query.sameTimestampOrder === 'BEFORE_TRIGGER');
}
