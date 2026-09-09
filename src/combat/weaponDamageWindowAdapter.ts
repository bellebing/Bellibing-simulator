import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';

export const WEAPON_DAMAGE_WINDOW_PRIMITIVE_ID = 'weapon-damage-timed-self-window-v1';
export type WeaponDamageTriggerClass = 'BASIC' | 'HEAVY' | 'ECHO';

// Reviewed event bindings only. Amounts and durations remain in canonical rows.
const CONTRACTS = [
  { effectId: 'LE-SKILL', weaponId: 'lethean-elegy', statOrEffect: 'Resonance Skill DMG', damageClass: 'ECHO' },
  { effectId: 'LE-ECHO', weaponId: 'lethean-elegy', statOrEffect: 'Echo Skill DMG Amplification', damageClass: 'ECHO' },
  { effectId: 'LE-DEF', weaponId: 'lethean-elegy', statOrEffect: 'DEF Ignore', damageClass: 'ECHO' },
  { effectId: 'LU-HEAVY-AMP', weaponId: 'lux-and-umbra', statOrEffect: 'Heavy Attack DMG Amplification', damageClass: 'ECHO' },
  { effectId: 'LU-ECHO-AMP', weaponId: 'lux-and-umbra', statOrEffect: 'Echo Skill DMG Amplification', damageClass: 'HEAVY' },
  { effectId: 'DBS-SPECTRO', weaponId: 'daybreakers-spine', statOrEffect: 'Spectro DMG', damageClass: 'BASIC' },
  { effectId: 'UV-BASIC-BASIC', weaponId: 'unflickering-valor', statOrEffect: 'Basic Attack DMG', damageClass: 'BASIC' },
] as const;

const SOURCE_TRIGGERS: Record<WeaponDamageTriggerClass, string> = {
  BASIC: 'Deal Basic Attack DMG', HEAVY: 'Deal Heavy Attack DMG', ECHO: 'Deal Echo Skill DMG',
};

function resolveContract(effectId: string, catalog: readonly WeaponEffectData[]) {
  const contract = CONTRACTS.find((row) => row.effectId === effectId);
  if (!contract) throw new Error(`No reviewed damage-window contract for ${effectId}.`);
  const rows = catalog.filter((row) => row.effectId === effectId);
  if (rows.length !== 1) throw new Error(`${effectId} requires exactly one source row.`);
  const row = rows[0];
  if (row.weaponId !== contract.weaponId || row.statOrEffect !== contract.statOrEffect
    || row.trigger !== SOURCE_TRIGGERS[contract.damageClass] || row.effectType !== 'TRIGGERED'
    || row.appliesTo !== 'SELF' || row.maxStacks !== 1 || row.stackIntervalSeconds !== 0
    || row.triggerCooldownSeconds !== null || row.conditions.length !== 0
    || row.valueUnit !== 'DECIMAL_MULTIPLIER'
    || !['VERIFIED_MODELED', 'VERIFIED_CONDITIONAL'].includes(row.mechanicsStatus)
    || row.durationSeconds === null || !Number.isFinite(row.durationSeconds) || row.durationSeconds <= 0
    || row.rankValues.length !== 5 || row.rankValues.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error(`${effectId} reviewed damage-window source contract drift.`);
  }
  return { contract, effect: row };
}

export function listWeaponDamageWindowSupport() {
  return CONTRACTS.map(({ effectId }) => {
    const { contract } = resolveContract(effectId, WEAPON_EFFECT_CATALOG);
    return { ...contract, primitiveId: WEAPON_DAMAGE_WINDOW_PRIMITIVE_ID, scope: 'EXPLICIT_DAMAGE_EVENT_ONLY' as const };
  }).sort((a, b) => a.effectId < b.effectId ? -1 : a.effectId > b.effectId ? 1 : 0);
}

export interface QualifiedWeaponDamageEvent {
  readonly kind: 'DAMAGE_DEALT';
  readonly actorId: string;
  readonly damageClass: WeaponDamageTriggerClass;
  readonly atSeconds: number;
  /** The caller proved actual source-qualified damage, not a cast or expected hit. */
  readonly sourceTriggerQualification: 'VERIFIED_DAMAGE_DEALT' | 'UNKNOWN';
}

/** One independent window; no same-hit effect, repeated-window policy or uptime is inferred. */
export function activateWeaponDamageWindow(params: {
  readonly effectId: string;
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly event: QualifiedWeaponDamageEvent;
  readonly catalog?: readonly WeaponEffectData[];
}) {
  const { effectId, selectedWeapon, wielderId, event, catalog = WEAPON_EFFECT_CATALOG } = params;
  const { contract, effect } = resolveContract(effectId, catalog);
  if (selectedWeapon.id !== effect.weaponId) throw new Error('Damage window requires the exact selected weapon.');
  if (!Number.isInteger(selectedWeapon.rank) || selectedWeapon.rank < 1 || selectedWeapon.rank > 5) {
    throw new Error('Weapon rank must be explicit R1 through R5.');
  }
  if (!wielderId.trim() || !event.actorId.trim()) throw new Error('Explicit weapon owner and damage actor are required.');
  if (!Number.isFinite(event.atSeconds) || event.atSeconds < 0) throw new Error('Damage time must be finite and non-negative.');
  if (event.kind !== 'DAMAGE_DEALT' || event.sourceTriggerQualification !== 'VERIFIED_DAMAGE_DEALT') {
    throw new Error('Actual source-qualified damage is required; a cast does not establish it.');
  }
  if (!Object.hasOwn(SOURCE_TRIGGERS, event.damageClass)) throw new Error('Unsupported damage trigger class.');
  if (event.actorId !== wielderId || event.damageClass !== contract.damageClass) return null;
  const expiresAtSeconds = event.atSeconds + effect.durationSeconds!;
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds) throw new Error('Damage window expiration is not representable.');
  return Object.freeze({
    primitiveId: WEAPON_DAMAGE_WINDOW_PRIMITIVE_ID, effectId, weaponId: effect.weaponId,
    actorId: wielderId, statOrEffect: effect.statOrEffect, value: effect.rankValues[selectedWeapon.rank - 1],
    valueUnit: effect.valueUnit, startedAtSeconds: event.atSeconds, expiresAtSeconds,
  });
}

export type ActiveWeaponDamageWindow = NonNullable<ReturnType<typeof activateWeaponDamageWindow>>;

/** Activation time alone cannot decide whether a same-timestamp hit precedes its trigger. */
export function isWeaponDamageWindowActive(window: ActiveWeaponDamageWindow, query: {
  readonly actorId: string;
  readonly atSeconds: number;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER' | 'UNKNOWN';
}): boolean {
  if (!query.actorId.trim() || !Number.isFinite(query.atSeconds) || query.atSeconds < 0) {
    throw new Error('Explicit actor and finite non-negative query time are required.');
  }
  if (query.atSeconds === window.startedAtSeconds) {
    if (query.sameTimestampOrder !== 'BEFORE_TRIGGER' && query.sameTimestampOrder !== 'AFTER_TRIGGER') {
      throw new Error('Same-timestamp damage/trigger ordering is unresolved.');
    }
    if (query.sameTimestampOrder === 'BEFORE_TRIGGER') return false;
  }
  return query.actorId === window.actorId && query.atSeconds >= window.startedAtSeconds && query.atSeconds < window.expiresAtSeconds;
}
