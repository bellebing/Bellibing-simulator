import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';

export const FORGED_DWARF_STAR_STATUS_WINDOW_PRIMITIVE_ID =
  'forged-dwarf-star-explicit-negative-status-self-window-v1';

export const FORGED_DWARF_STAR_SOURCE_REVIEW = Object.freeze({
  reviewId: 'forged-dwarf-star-status-trigger-review-20260918',
  checkedAt: '2026-09-18',
  sourceLabels: [
    'Wutheringlab — Forged Dwarf Star',
    'Wuthering.gg — Forged Dwarf Star',
    'WutheringDB — Forged Dwarf Star',
    'Prydwen — current Denia build',
  ] as const,
  sourceUrls: [
    'https://wutheringlab.com/weapon/forged-dwarf-star/',
    'https://wuthering.gg/weapons/forged-dwarf-star',
    'https://wutheringdb.com/en/weapons/forged-dwarf-star',
    'https://www.prydwen.gg/wuthering-waves/characters/denia',
  ] as const,
  sourceTriggerMeaning: 'AFTER_WIELDER_INFLICTS_FUSION_BURST_OR_TUNE_STRAIN_SHIFTING' as const,
  occurrencePolicy: 'CALLER_QUALIFIED_TIMESTAMP_ONLY' as const,
  teamEffectPolicy: 'FDS_TEAM_NOT_MODELED_BY_THIS_PRIMITIVE' as const,
});

const CONTRACT = {
  effectId: 'FDS-LIB',
  weaponId: 'forged-dwarf-star',
  statOrEffect: 'Resonance Liberation DMG',
  canonicalTrigger: 'Fusion Burst or Tune Strain condition',
} as const;

function resolveContract(catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG) {
  const rows = catalog.filter(row => row.effectId === CONTRACT.effectId);
  if (rows.length !== 1) throw new Error('FDS-LIB requires exactly one canonical source row');
  const effect = rows[0];
  if (effect.weaponId !== CONTRACT.weaponId || effect.statOrEffect !== CONTRACT.statOrEffect
    || effect.trigger !== CONTRACT.canonicalTrigger || effect.effectType !== 'TRIGGERED'
    || effect.appliesTo !== 'SELF' || effect.mechanicsStatus !== 'VERIFIED_MODELED'
    || effect.valueUnit !== 'DECIMAL_MULTIPLIER' || effect.durationSeconds !== 5
    || effect.maxStacks !== 1 || effect.stackIntervalSeconds !== 0
    || effect.triggerCooldownSeconds !== null || effect.conditions.length !== 0
    || effect.rankValues.length !== 5
    || effect.rankValues.some(value => !Number.isFinite(value) || value <= 0 || value >= 1)) {
    throw new Error('FDS-LIB reviewed source contract drift');
  }
  return effect;
}

export function validateForgedDwarfStarStatusContract(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
) {
  try {
    resolveContract(catalog);
    return [] as string[];
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }
}

/** Identity/scope only. Numeric truth remains in canonical WeaponEffectData. */
export function listForgedDwarfStarStatusWindowSupport() {
  resolveContract();
  return [{
    ...CONTRACT,
    primitiveId: FORGED_DWARF_STAR_STATUS_WINDOW_PRIMITIVE_ID,
    sourceTriggerMeaning: FORGED_DWARF_STAR_SOURCE_REVIEW.sourceTriggerMeaning,
    occurrencePolicy: FORGED_DWARF_STAR_SOURCE_REVIEW.occurrencePolicy,
    selectedHitScope: 'LIBERATION_DIRECT_HIT_ONLY' as const,
  }];
}

interface QualifiedForgedDwarfStarApplicationBase {
  readonly actorId: string;
  readonly targetId: string;
  readonly sourceFactId: string;
  readonly atSeconds: number;
  readonly sourceTriggerQualification: 'VERIFIED_FORGED_DWARF_STAR_STATUS_APPLICATION' | 'UNKNOWN';
}
export type QualifiedForgedDwarfStarStatusApplicationEvent =
  | (QualifiedForgedDwarfStarApplicationBase & { readonly kind: 'FUSION_BURST_APPLIED' })
  | (QualifiedForgedDwarfStarApplicationBase & { readonly kind: 'TUNE_STRAIN_SHIFTING_APPLIED' });

/**
 * The caller proves one exact source status occurrence. This primitive does not
 * infer Resonance Mode, which attacks apply the status, stack count, refresh or
 * profile uptime.
 */
export function activateForgedDwarfStarStatusWindow(params: {
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly event: QualifiedForgedDwarfStarStatusApplicationEvent;
  readonly catalog?: readonly WeaponEffectData[];
}) {
  const effect = resolveContract(params.catalog ?? WEAPON_EFFECT_CATALOG);
  const { selectedWeapon, wielderId, event } = params;
  if (selectedWeapon.id !== effect.weaponId) {
    throw new Error('Forged Dwarf Star status window requires exact selected weapon');
  }
  if (!Number.isInteger(selectedWeapon.rank) || selectedWeapon.rank < 1 || selectedWeapon.rank > 5) {
    throw new Error('Forged Dwarf Star rank must be explicit R1 through R5');
  }
  if (![wielderId, event.actorId, event.targetId, event.sourceFactId].every(id => id.trim())
    || !Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error('Exact status source/target/fact identity and finite time are required');
  }
  if (!['FUSION_BURST_APPLIED', 'TUNE_STRAIN_SHIFTING_APPLIED'].includes(event.kind)
    || event.sourceTriggerQualification !== 'VERIFIED_FORGED_DWARF_STAR_STATUS_APPLICATION') {
    throw new Error('Explicit source-qualified Fusion Burst or Tune Strain - Shifting application is required');
  }
  if (event.actorId !== wielderId) return null;
  const expiresAtSeconds = event.atSeconds + effect.durationSeconds!;
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds) {
    throw new Error('Forged Dwarf Star window expiration is not representable');
  }
  return Object.freeze({
    primitiveId: FORGED_DWARF_STAR_STATUS_WINDOW_PRIMITIVE_ID,
    effectId: effect.effectId,
    weaponId: effect.weaponId,
    actorId: wielderId,
    triggerTargetId: event.targetId,
    sourceFactId: event.sourceFactId,
    triggerStatusKind: event.kind,
    statOrEffect: effect.statOrEffect,
    value: effect.rankValues[selectedWeapon.rank - 1],
    valueUnit: effect.valueUnit,
    selectedHitScope: 'LIBERATION_DIRECT_HIT_ONLY' as const,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds,
  });
}

export type ActiveForgedDwarfStarStatusWindow =
  NonNullable<ReturnType<typeof activateForgedDwarfStarStatusWindow>>;

export function isForgedDwarfStarStatusWindowActive(
  window: ActiveForgedDwarfStarStatusWindow,
  query: {
    readonly actorId: string;
    readonly atSeconds: number;
    readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
  },
) {
  if (!query.actorId.trim() || !Number.isFinite(query.atSeconds) || query.atSeconds < 0
    || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(query.sameTimestampOrder)) {
    throw new Error('Forged Dwarf Star query requires exact actor/time/order');
  }
  return query.actorId === window.actorId
    && query.atSeconds >= window.startedAtSeconds && query.atSeconds < window.expiresAtSeconds
    && !(query.atSeconds === window.startedAtSeconds && query.sameTimestampOrder === 'BEFORE_TRIGGER');
}
