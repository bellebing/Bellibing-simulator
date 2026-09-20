import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';
import {
  activateForgedDwarfStarStatusWindow,
  isForgedDwarfStarStatusWindowActive,
  validateForgedDwarfStarStatusContract,
  type QualifiedForgedDwarfStarStatusApplicationEvent,
} from './forgedDwarfStarStatusWindowAdapter.ts';

export const FORGED_DWARF_STAR_TEAM_WINDOW_PRIMITIVE_ID =
  'forged-dwarf-star-chained-team-status-atk-window-v1';

export const FORGED_DWARF_STAR_TEAM_SOURCE_REVIEW = Object.freeze({
  reviewId: 'forged-dwarf-star-team-chain-review-20260918',
  checkedAt: '2026-09-18',
  sourceLabels: [
    'WutheringDB — Forged Dwarf Star',
    'Wuthering.gg — Forged Dwarf Star',
    'Wutheringlab — Forged Dwarf Star',
  ] as const,
  sourceUrls: [
    'https://wutheringdb.com/en/weapons/forged-dwarf-star',
    'https://wuthering.gg/weapons/forged-dwarf-star',
    'https://wutheringlab.com/weapon/forged-dwarf-star/',
  ] as const,
  chainMeaning:
    'ACTIVE_WIELDER_FDS_LIB_THEN_RECIPIENT_OWN_FUSION_BURST_OR_TUNE_STRAIN_SHIFTING' as const,
  recipientPolicy: 'ONLY_THE_RESONATOR_WHO_INFLICTED_THE_STATUS' as const,
  sameNameStacking: 'REJECT_DUPLICATE_ACTIVE_SOURCE' as const,
  occurrencePolicy: 'CALLER_QUALIFIED_TIMESTAMPS_ONLY' as const,
});

const TEAM_CONTRACT = {
  effectId: 'FDS-TEAM',
  weaponId: 'forged-dwarf-star',
  statOrEffect: 'ATK%',
  canonicalTrigger: 'Fusion Burst or Tune Strain condition',
} as const;

function resolveTeamContract(catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG) {
  const rows = catalog.filter(row => row.effectId === TEAM_CONTRACT.effectId);
  if (rows.length !== 1) throw new Error('FDS-TEAM requires exactly one canonical source row');
  const effect = rows[0];
  if (effect.weaponId !== TEAM_CONTRACT.weaponId || effect.statOrEffect !== TEAM_CONTRACT.statOrEffect
    || effect.trigger !== TEAM_CONTRACT.canonicalTrigger || effect.effectType !== 'TRIGGERED'
    || effect.appliesTo !== 'TEAM' || effect.mechanicsStatus !== 'VERIFIED_MODELED'
    || effect.valueUnit !== 'DECIMAL_MULTIPLIER' || effect.durationSeconds !== 15
    || effect.maxStacks !== 1 || effect.stackIntervalSeconds !== 0
    || effect.triggerCooldownSeconds !== null || effect.conditions.length !== 0
    || effect.rankValues.length !== 5
    || effect.rankValues.some(value => !Number.isFinite(value) || value <= 0 || value >= 1)) {
    throw new Error('FDS-TEAM reviewed source contract drift');
  }
  return effect;
}

export function validateForgedDwarfStarTeamContract(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
) {
  const issues = [...validateForgedDwarfStarStatusContract(catalog)];
  try {
    resolveTeamContract(catalog);
  } catch (error) {
    issues.push(error instanceof Error ? error.message : String(error));
  }
  return issues;
}

/** Identity/scope only. Rank values and durations remain canonical WeaponEffectData. */
export function listForgedDwarfStarTeamWindowSupport() {
  const issues = validateForgedDwarfStarTeamContract();
  if (issues.length) throw new Error(issues.join('; '));
  return [{
    ...TEAM_CONTRACT,
    primitiveId: FORGED_DWARF_STAR_TEAM_WINDOW_PRIMITIVE_ID,
    chainMeaning: FORGED_DWARF_STAR_TEAM_SOURCE_REVIEW.chainMeaning,
    recipientPolicy: FORGED_DWARF_STAR_TEAM_SOURCE_REVIEW.recipientPolicy,
    sameNameStacking: FORGED_DWARF_STAR_TEAM_SOURCE_REVIEW.sameNameStacking,
    occurrencePolicy: FORGED_DWARF_STAR_TEAM_SOURCE_REVIEW.occurrencePolicy,
  }];
}

export function activateForgedDwarfStarTeamAtkWindow(params: {
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly sourceWielderId: string;
  readonly teamMemberIds: readonly string[];
  readonly sourceSelfEvent: QualifiedForgedDwarfStarStatusApplicationEvent;
  readonly recipientEvent: QualifiedForgedDwarfStarStatusApplicationEvent;
  /** At tied timestamps the source self effect must already exist before the teammate application. */
  readonly sourceSelfOrderAtRecipientEvent: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
  readonly catalog?: readonly WeaponEffectData[];
}) {
  const catalog = params.catalog ?? WEAPON_EFFECT_CATALOG;
  const issues = validateForgedDwarfStarTeamContract(catalog);
  if (issues.length) throw new Error(issues.join('; '));
  const team = resolveTeamContract(catalog);
  const { selectedWeapon, sourceWielderId, teamMemberIds, sourceSelfEvent, recipientEvent } = params;
  if (selectedWeapon.id !== team.weaponId) {
    throw new Error('Forged Dwarf Star team window requires exact selected source weapon');
  }
  if (!Number.isInteger(selectedWeapon.rank) || selectedWeapon.rank < 1 || selectedWeapon.rank > 5) {
    throw new Error('Forged Dwarf Star team-window rank must be explicit R1 through R5');
  }
  if (!sourceWielderId.trim() || teamMemberIds.length === 0
    || teamMemberIds.some(id => !id.trim()) || new Set(teamMemberIds).size !== teamMemberIds.length) {
    throw new Error('Explicit source wielder and unique selected team are required');
  }
  if (!teamMemberIds.includes(sourceWielderId) || !teamMemberIds.includes(recipientEvent.actorId)) {
    throw new Error('Selected team must include the Forged Dwarf Star wielder and triggering recipient');
  }
  if (recipientEvent.actorId === sourceWielderId) {
    throw new Error('This bounded chained-team adapter is cross-owner only; source self application remains separate');
  }
  const sourceSelfWindow = activateForgedDwarfStarStatusWindow({
    selectedWeapon,
    wielderId: sourceWielderId,
    event: sourceSelfEvent,
    catalog,
  });
  if (!sourceSelfWindow) return null;
  const sourceSelfActive = isForgedDwarfStarStatusWindowActive(sourceSelfWindow, {
    actorId: sourceWielderId,
    atSeconds: recipientEvent.atSeconds,
    sameTimestampOrder: params.sourceSelfOrderAtRecipientEvent,
  });
  if (!sourceSelfActive) return null;
  if (!['FUSION_BURST_APPLIED', 'TUNE_STRAIN_SHIFTING_APPLIED'].includes(recipientEvent.kind)
    || recipientEvent.sourceTriggerQualification !== 'VERIFIED_FORGED_DWARF_STAR_STATUS_APPLICATION') {
    throw new Error('Recipient must have an explicit source-qualified Fusion Burst or Tune Strain - Shifting application');
  }
  if (![recipientEvent.actorId, recipientEvent.targetId, recipientEvent.sourceFactId].every(id => id.trim())
    || !Number.isFinite(recipientEvent.atSeconds) || recipientEvent.atSeconds < 0) {
    throw new Error('Exact recipient status source/target/fact identity and finite time are required');
  }
  const expiresAtSeconds = recipientEvent.atSeconds + team.durationSeconds!;
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= recipientEvent.atSeconds) {
    throw new Error('Forged Dwarf Star team window expiration is not representable');
  }
  return Object.freeze({
    primitiveId: FORGED_DWARF_STAR_TEAM_WINDOW_PRIMITIVE_ID,
    effectId: team.effectId,
    weaponId: team.weaponId,
    sourceWielderId,
    recipientCharacterId: recipientEvent.actorId,
    teamMemberIds: Object.freeze([...teamMemberIds]),
    sourceSelfEffectId: sourceSelfWindow.effectId,
    sourceSelfStartedAtSeconds: sourceSelfWindow.startedAtSeconds,
    sourceSelfExpiresAtSeconds: sourceSelfWindow.expiresAtSeconds,
    sourceSelfStatusKind: sourceSelfWindow.triggerStatusKind,
    sourceSelfTargetId: sourceSelfWindow.triggerTargetId,
    sourceSelfFactId: sourceSelfWindow.sourceFactId,
    recipientTriggerStatusKind: recipientEvent.kind,
    recipientTriggerTargetId: recipientEvent.targetId,
    recipientSourceFactId: recipientEvent.sourceFactId,
    statOrEffect: team.statOrEffect,
    value: team.rankValues[selectedWeapon.rank - 1],
    valueUnit: team.valueUnit,
    startedAtSeconds: recipientEvent.atSeconds,
    expiresAtSeconds,
    sameNameStacking: FORGED_DWARF_STAR_TEAM_SOURCE_REVIEW.sameNameStacking,
  });
}

export type ActiveForgedDwarfStarTeamAtkWindow =
  NonNullable<ReturnType<typeof activateForgedDwarfStarTeamAtkWindow>>;

export function isForgedDwarfStarTeamAtkWindowActive(
  window: ActiveForgedDwarfStarTeamAtkWindow,
  query: {
    readonly actorId: string;
    readonly atSeconds: number;
    readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
  },
) {
  if (!query.actorId.trim() || !Number.isFinite(query.atSeconds) || query.atSeconds < 0
    || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(query.sameTimestampOrder)) {
    throw new Error('Exact recipient, finite query time and explicit trigger/query order are required');
  }
  if (query.actorId !== window.recipientCharacterId) return false;
  if (query.atSeconds < window.startedAtSeconds || query.atSeconds >= window.expiresAtSeconds) return false;
  if (query.atSeconds === window.startedAtSeconds && query.sameTimestampOrder === 'BEFORE_TRIGGER') return false;
  return true;
}
