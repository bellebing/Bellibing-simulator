import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import type { WeaponEffectData } from '../effectDomain.ts';
import type { SonataEffectModel } from '../sonataEffectDomain.ts';
import { createIncomingTransferWindow, type OutgoingSwitchEvent } from './incomingTransferState.ts';

export const SHARED_SUPPORT_STAT_WINDOW_REVIEW = {
  reviewedAt: '2026-09-07',
  weaponAdapterId: 'weapon-outro-incoming-transfer-v1',
  healingAdapterId: 'heal-applied-team-atk-window-v1',
  weaponPendingId: 'weapon:static-mist:STM-NEXT-ATK:outro-next-resonator-adapter',
  healingPendingId: 'sonata:sonata-7:REJUV_ATK:healing-team-uptime-adapter',
  closesPendingExecutionIds: [] as readonly string[],
  requiresProfileEventTimeline: true,
} as const;

export function validateSharedSupportStatWindowContracts(
  weapons: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
  sonatas: readonly SonataEffectModel[] = SONATA_EFFECT_MODELS,
): readonly string[] {
  const issues: string[] = [];
  const weapon = weapons.filter((row) => row.effectId === 'STM-NEXT-ATK');
  const sonata = sonatas.filter((row) => row.effectId === 'REJUV_ATK');
  if (weapon.length !== 1) issues.push('STM-NEXT-ATK requires exactly one canonical row');
  else {
    const row = weapon[0];
    if (row.weaponId !== 'static-mist' || row.trigger !== 'Cast Outro Skill'
      || row.appliesTo !== 'NEXT_RESONATOR' || row.statOrEffect !== 'ATK%'
      || row.effectType !== 'TRIGGERED' || row.mechanicsStatus !== 'VERIFIED_CONDITIONAL'
      || row.valueUnit !== 'DECIMAL_MULTIPLIER' || row.durationSeconds !== 14 || row.maxStacks !== 1
      || row.triggerCooldownSeconds !== null || row.stackIntervalSeconds !== 0 || row.conditions.length !== 0
      || JSON.stringify(row.rankValues) !== JSON.stringify([.10, .125, .15, .175, .20])
      || row.sourceEffectText !== 'After the wielder casts Outro Skill, the incoming Resonator receives a 14-second ATK increase.') {
      issues.push('STM-NEXT-ATK reviewed transfer contract drift');
    }
  }
  if (sonata.length !== 1) issues.push('REJUV_ATK requires exactly one canonical row');
  else {
    const row = sonata[0];
    if (row.sonataSetId !== 'sonata-7' || row.pieces !== 5 || row.trigger !== 'Heal ally'
      || row.appliesTo !== 'TEAM' || row.statOrEffect !== 'ATK%' || row.effectType !== 'TRIGGERED'
      || row.mechanicsStatus !== 'VERIFIED_CONDITIONAL' || row.valueMode !== 'FLAT'
      || row.value !== .15 || row.durationSeconds !== 30 || row.maxStacks !== undefined
      || row.capValue !== undefined || row.stackIntervalSeconds !== undefined) {
      issues.push('REJUV_ATK reviewed heal/team contract drift');
    }
  }
  return issues;
}

export function activateStaticMistOutroTransfer(params: {
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly event: OutgoingSwitchEvent;
}) {
  const issues = validateSharedSupportStatWindowContracts();
  if (issues.length) throw new Error(issues.join('; '));
  if (params.selectedWeapon.id !== 'static-mist') return null;
  const { rank } = params.selectedWeapon;
  if (!Number.isInteger(rank) || rank < 1 || rank > 5) throw new Error('Static Mist rank must be 1 through 5');
  const effect = WEAPON_EFFECT_CATALOG.find((row) => row.effectId === 'STM-NEXT-ATK')!;
  if (!Number.isFinite(params.event.atSeconds + effect.durationSeconds!)
    || params.event.atSeconds + effect.durationSeconds! <= params.event.atSeconds) {
    throw new Error('Transfer expiration is not representable');
  }
  return createIncomingTransferWindow({
    adapterId: SHARED_SUPPORT_STAT_WINDOW_REVIEW.weaponAdapterId,
    sourceLayer: 'WEAPON', effectId: effect.effectId, sourceId: effect.weaponId,
    sourceActorId: params.wielderId, statOrEffect: effect.statOrEffect,
    value: effect.rankValues[rank - 1], durationSeconds: effect.durationSeconds!,
    requiresIncomingIntro: false,
    // Source declares 14 seconds; no additional early-removal clause is introduced.
    endsOnIncomingSwitchOut: false,
  }, params.event);
}

export interface QualifiedAllyHealEvent {
  readonly kind: 'HEAL_APPLIED';
  readonly healerId: string;
  readonly targetId: string;
  readonly atSeconds: number;
  /** Caller has proved the source trigger, including actual healing qualification. */
  readonly sourceTriggerQualification: 'VERIFIED_HEAL_ALLY' | 'UNKNOWN';
}

/** One applied heal. Does not infer healing from a cast, damage, shield or full-HP target. */
export function activateSharedRejuvenatingGlowWindow(params: {
  readonly ownerId: string;
  readonly event: QualifiedAllyHealEvent;
  readonly selectedSet: { readonly id: string; readonly pieces: number };
  readonly teamMemberIds: readonly string[];
  readonly sonataCatalog?: readonly SonataEffectModel[];
}) {
  const { ownerId, event, selectedSet, teamMemberIds, sonataCatalog = SONATA_EFFECT_MODELS } = params;
  const issues = validateSharedSupportStatWindowContracts(WEAPON_EFFECT_CATALOG, sonataCatalog);
  if (issues.length) throw new Error(issues.join('; '));
  if (event.kind !== 'HEAL_APPLIED') throw new Error('An applied-heal event is required');
  if (event.sourceTriggerQualification !== 'VERIFIED_HEAL_ALLY') throw new Error('Heal-ally qualification is unresolved');
  if (![ownerId, event.healerId, event.targetId].every((id) => id.trim())) throw new Error('Actor IDs must be non-blank');
  if (!Number.isFinite(event.atSeconds) || event.atSeconds < 0) throw new Error('Heal time must be finite and non-negative');
  if (!Number.isInteger(selectedSet.pieces) || selectedSet.pieces < 0 || selectedSet.pieces > 5) throw new Error('Invalid selected set piece count');
  if (teamMemberIds.length === 0 || teamMemberIds.some((id) => !id.trim())
    || new Set(teamMemberIds).size !== teamMemberIds.length) throw new Error('Explicit unique team members are required');
  if (!teamMemberIds.includes(ownerId)) throw new Error('Team must include the set owner');
  if (event.healerId !== ownerId || !teamMemberIds.includes(event.targetId)
    || selectedSet.id !== 'sonata-7' || selectedSet.pieces !== 5) return null;
  const effect = sonataCatalog.find((row) => row.effectId === 'REJUV_ATK')!;
  const expiresAtSeconds = event.atSeconds + effect.durationSeconds!;
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds) throw new Error('Heal window expiration is not representable');
  return Object.freeze({
    adapterId: SHARED_SUPPORT_STAT_WINDOW_REVIEW.healingAdapterId,
    sourceLayer: 'SONATA' as const, effectId: effect.effectId, sourceId: effect.sonataSetId,
    sourceCharacterId: ownerId, statOrEffect: effect.statOrEffect, value: effect.value,
    teamMemberIds: Object.freeze([...teamMemberIds]), startedAtSeconds: event.atSeconds, expiresAtSeconds,
  });
}

export function isSharedHealingTeamWindowActive(
  window: NonNullable<ReturnType<typeof activateSharedRejuvenatingGlowWindow>>,
  actorId: string, atSeconds: number,
): boolean {
  if (!actorId.trim() || !Number.isFinite(atSeconds) || atSeconds < 0) throw new Error('Explicit actor and finite non-negative query time are required');
  return window.teamMemberIds.includes(actorId) && atSeconds >= window.startedAtSeconds && atSeconds < window.expiresAtSeconds;
}
