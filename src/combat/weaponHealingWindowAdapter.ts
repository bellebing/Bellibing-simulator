import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';
import type { QualifiedAllyHealEvent } from './sharedSupportStatWindows.ts';
import type { ExplicitDamageWindowQuery } from './qualifiedDamageEvent.ts';

export const WEAPON_HEALING_WINDOW_PRIMITIVE_ID = 'weapon-heal-applied-stat-window-v1';
const CONTRACTS = [
  { effectId: 'SC-TEAM-CD', weaponId: 'starfield-calibrator', trigger: 'Wielder heals Resonators', statOrEffect: 'CRIT DMG', appliesTo: 'TEAM' },
  { effectId: 'BPP-SKILL', weaponId: 'bloodpacts-pledge', trigger: 'Provide Healing', statOrEffect: 'Resonance Skill DMG', appliesTo: 'SELF' },
] as const;

/** Read a verified source fact, not an active buff. Used also by the existing Mornye event adapter. */
export function readWeaponHealingWindowFact(effectId: string, rank: number, catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG) {
  const contract = CONTRACTS.find((row) => row.effectId === effectId);
  if (!contract) throw new Error(`No reviewed applied-heal weapon contract for ${effectId}.`);
  if (!Number.isInteger(rank) || rank < 1 || rank > 5) throw new Error('Explicit weapon rank R1 through R5 is required.');
  const matches = catalog.filter((row) => row.effectId === effectId);
  if (matches.length !== 1) throw new Error(`${effectId} requires exactly one canonical source row.`);
  const effect = matches[0];
  if (effect.weaponId !== contract.weaponId || effect.trigger !== contract.trigger || effect.statOrEffect !== contract.statOrEffect
    || effect.appliesTo !== contract.appliesTo || effect.effectType !== 'TRIGGERED'
    || effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL' || effect.valueUnit !== 'DECIMAL_MULTIPLIER'
    || effect.maxStacks !== 1 || effect.stackIntervalSeconds !== 0 || effect.triggerCooldownSeconds !== null
    || effect.conditions.length !== 0 || effect.durationSeconds === null || !Number.isFinite(effect.durationSeconds) || effect.durationSeconds <= 0
    || effect.rankValues.length !== 5 || effect.rankValues.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error(`${effectId} reviewed applied-heal source contract drift.`);
  }
  return Object.freeze({ effectId, weaponId: effect.weaponId, statOrEffect: effect.statOrEffect,
    appliesTo: contract.appliesTo, value: effect.rankValues[rank - 1], durationSeconds: effect.durationSeconds });
}

export function listWeaponHealingWindowSupport() {
  return CONTRACTS.map(({ effectId }) => {
    const fact = readWeaponHealingWindowFact(effectId, 1);
    return { effectId, weaponId: fact.weaponId, appliesTo: fact.appliesTo,
      primitiveId: WEAPON_HEALING_WINDOW_PRIMITIVE_ID, scope: 'EXPLICIT_APPLIED_HEAL_ONLY' as const };
  }).sort((a, b) => a.effectId < b.effectId ? -1 : a.effectId > b.effectId ? 1 : 0);
}

/** A source-qualified applied ally heal is supported; arbitrary self-heal/full-HP/cast qualification is not inferred. */
export function activateWeaponHealingWindow(params: {
  readonly effectId: string;
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly teamMemberIds: readonly string[];
  readonly event: QualifiedAllyHealEvent;
  readonly catalog?: readonly WeaponEffectData[];
}) {
  const { selectedWeapon, wielderId, event, teamMemberIds } = params;
  const fact = readWeaponHealingWindowFact(params.effectId, selectedWeapon.rank, params.catalog);
  if (selectedWeapon.id !== fact.weaponId) throw new Error('Applied-heal window requires the exact selected weapon.');
  if (![wielderId, event.healerId, event.targetId].every((id) => id.trim())) throw new Error('Explicit owner healer and recipient are required.');
  if (!Number.isFinite(event.atSeconds) || event.atSeconds < 0) throw new Error('Heal time must be finite and non-negative.');
  if (event.kind !== 'HEAL_APPLIED' || event.sourceTriggerQualification !== 'VERIFIED_HEAL_ALLY') {
    throw new Error('Actual source-qualified applied healing is required.');
  }
  if (teamMemberIds.length === 0 || teamMemberIds.some((id) => !id.trim())
    || new Set(teamMemberIds).size !== teamMemberIds.length || !teamMemberIds.includes(wielderId)) {
    throw new Error('Explicit unique selected team including the wielder is required.');
  }
  if (event.healerId !== wielderId || !teamMemberIds.includes(event.targetId)) return null;
  const expiresAtSeconds = event.atSeconds + fact.durationSeconds;
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds) throw new Error('Healing window expiration is not representable.');
  return Object.freeze({
    primitiveId: WEAPON_HEALING_WINDOW_PRIMITIVE_ID, ...fact, actorId: wielderId,
    recipientIds: Object.freeze(fact.appliesTo === 'TEAM' ? [...teamMemberIds] : [wielderId]),
    startedAtSeconds: event.atSeconds, expiresAtSeconds,
  });
}

export type ActiveWeaponHealingWindow = NonNullable<ReturnType<typeof activateWeaponHealingWindow>>;

export function isWeaponHealingWindowActive(window: ActiveWeaponHealingWindow, query: ExplicitDamageWindowQuery): boolean {
  if (!query.actorId.trim() || !Number.isFinite(query.atSeconds) || query.atSeconds < 0) {
    throw new Error('Explicit actor and finite non-negative query time are required.');
  }
  if (query.atSeconds === window.startedAtSeconds) {
    if (query.sameTimestampOrder !== 'BEFORE_TRIGGER' && query.sameTimestampOrder !== 'AFTER_TRIGGER') {
      throw new Error('Same-timestamp heal/query ordering is unresolved.');
    }
    if (query.sameTimestampOrder === 'BEFORE_TRIGGER') return false;
  }
  return window.recipientIds.includes(query.actorId) && query.atSeconds >= window.startedAtSeconds && query.atSeconds < window.expiresAtSeconds;
}
