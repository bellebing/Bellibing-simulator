import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';

export const FREEZE_FRAME_GLACIO_CHAFE_WINDOW_PRIMITIVE_ID = 'freeze-frame-explicit-glacio-chafe-windows-v1';

const CONTRACTS = [
  { effectId: 'FF-GLACIO', statOrEffect: 'Glacio DMG', appliesTo: 'SELF', durationSeconds: 12 },
  { effectId: 'FF-TEAM-ATK', statOrEffect: 'ATK%', appliesTo: 'TEAM', durationSeconds: 30 },
] as const;

function uniqueEffect(effectId: string, catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG) {
  const rows = catalog.filter(row => row.effectId === effectId);
  if (rows.length !== 1) throw new Error(`${effectId}: expected exactly one canonical weapon effect`);
  return rows[0];
}

export function validateFreezeFrameGlacioChafeContracts(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
): readonly string[] {
  const issues: string[] = [];
  for (const contract of CONTRACTS) {
    let effect: WeaponEffectData;
    try { effect = uniqueEffect(contract.effectId, catalog); } catch (error) {
      issues.push(error instanceof Error ? error.message : String(error));
      continue;
    }
    if (effect.weaponId !== 'freeze-frame') issues.push(`${contract.effectId} weapon drift`);
    if (effect.statOrEffect !== contract.statOrEffect) issues.push(`${contract.effectId} stat drift`);
    if (effect.appliesTo !== contract.appliesTo) issues.push(`${contract.effectId} scope drift`);
    if (effect.trigger !== 'Inflict Glacio Chafe') issues.push(`${contract.effectId} trigger drift`);
    if (effect.effectType !== 'TRIGGERED') issues.push(`${contract.effectId} must remain TRIGGERED`);
    if (effect.mechanicsStatus !== 'VERIFIED_MODELED') issues.push(`${contract.effectId} modeling-status drift`);
    if (effect.valueUnit !== 'DECIMAL_MULTIPLIER') issues.push(`${contract.effectId} value-unit drift`);
    if (effect.durationSeconds !== contract.durationSeconds) issues.push(`${contract.effectId} duration drift`);
    if (effect.triggerCooldownSeconds !== null) issues.push(`${contract.effectId} cooldown drift`);
    if (effect.maxStacks !== 1 || effect.stackIntervalSeconds !== 0) issues.push(`${contract.effectId} stack contract drift`);
    if (effect.conditions.length !== 0) issues.push(`${contract.effectId} gained unsupported conditions`);
    if (effect.rankValues.length !== 5 || effect.rankValues.some(value => !Number.isFinite(value) || value <= 0 || value >= 1)) {
      issues.push(`${contract.effectId} requires five bounded rank values`);
    }
  }
  const team = catalog.find(row => row.effectId === 'FF-TEAM-ATK');
  if (team && !team.notes.toLowerCase().includes('does not stack')) {
    issues.push('FF-TEAM-ATK same-name non-stacking source note drift');
  }
  return issues;
}

const CONTRACT_ISSUES = validateFreezeFrameGlacioChafeContracts();
if (CONTRACT_ISSUES.length) throw new Error(`Invalid Freeze Frame contracts: ${CONTRACT_ISSUES.join('; ')}`);

export function listFreezeFrameGlacioChafeWindowSupport() {
  return CONTRACTS.map(contract => {
    const effect = uniqueEffect(contract.effectId);
    return {
      effectId: contract.effectId,
      weaponId: effect.weaponId,
      statOrEffect: effect.statOrEffect,
      appliesTo: contract.appliesTo,
      primitiveId: FREEZE_FRAME_GLACIO_CHAFE_WINDOW_PRIMITIVE_ID,
      scope: contract.appliesTo === 'SELF'
        ? 'EXPLICIT_GLACIO_CHAFE_SELF_WINDOW' as const
        : 'EXPLICIT_GLACIO_CHAFE_SELECTED_TEAM_WINDOW' as const,
      sameNameStacking: contract.appliesTo === 'TEAM' ? 'REJECT_DUPLICATE_ACTIVE_SOURCE' as const : null,
    };
  });
}

export interface QualifiedGlacioChafeApplicationEvent {
  readonly kind: 'GLACIO_CHAFE_APPLIED';
  readonly actorId: string;
  readonly targetId: string;
  readonly sourceFactId: string;
  readonly stacksApplied: number;
  readonly atSeconds: number;
  readonly sourceTriggerQualification: 'VERIFIED_GLACIO_CHAFE_APPLICATION' | 'UNKNOWN';
}

function validText(value: string) { return value.trim().length > 0; }

/**
 * One explicit Glacio Chafe application activates the two reviewed Freeze Frame
 * windows. It does not infer who can apply Chafe or parse gameplay prose.
 */
export function activateFreezeFrameGlacioChafeWindows(params: {
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly teamMemberIds: readonly string[];
  readonly event: QualifiedGlacioChafeApplicationEvent;
}) {
  const { selectedWeapon, wielderId, teamMemberIds, event } = params;
  if (selectedWeapon.id !== 'freeze-frame') throw new Error('Freeze Frame windows require exact selected Freeze Frame');
  if (!Number.isInteger(selectedWeapon.rank) || selectedWeapon.rank < 1 || selectedWeapon.rank > 5) {
    throw new Error('Freeze Frame windows require explicit R1 through R5');
  }
  if (!validText(wielderId) || !Array.isArray(teamMemberIds) || teamMemberIds.length === 0
    || new Set(teamMemberIds).size !== teamMemberIds.length || teamMemberIds.some(id => !validText(id))
    || !teamMemberIds.includes(wielderId)) {
    throw new Error('Freeze Frame team window requires an explicit unique selected team including the wielder');
  }
  if (!event || event.kind !== 'GLACIO_CHAFE_APPLIED'
    || event.sourceTriggerQualification !== 'VERIFIED_GLACIO_CHAFE_APPLICATION'
    || ![event.actorId, event.targetId, event.sourceFactId].every(validText)
    || !Number.isInteger(event.stacksApplied) || event.stacksApplied <= 0
    || !Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error('Freeze Frame requires explicit source-qualified Glacio Chafe application evidence');
  }
  if (event.actorId !== wielderId) return null;
  const make = (effectId: 'FF-GLACIO' | 'FF-TEAM-ATK') => {
    const effect = uniqueEffect(effectId);
    const expiresAtSeconds = event.atSeconds + effect.durationSeconds!;
    if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds) {
      throw new Error('Freeze Frame window expiration is not representable');
    }
    return Object.freeze({
      primitiveId: FREEZE_FRAME_GLACIO_CHAFE_WINDOW_PRIMITIVE_ID,
      effectId,
      weaponId: effect.weaponId,
      actorId: wielderId,
      triggerTargetId: event.targetId,
      sourceFactId: event.sourceFactId,
      statOrEffect: effect.statOrEffect,
      appliesTo: effect.appliesTo,
      value: effect.rankValues[selectedWeapon.rank - 1],
      startedAtSeconds: event.atSeconds,
      expiresAtSeconds,
      teamMemberIds: effect.appliesTo === 'TEAM' ? [...teamMemberIds] : null,
    });
  };
  return Object.freeze({ selfGlacio: make('FF-GLACIO'), teamAtk: make('FF-TEAM-ATK') });
}

export type FreezeFrameGlacioChafeWindows =
  NonNullable<ReturnType<typeof activateFreezeFrameGlacioChafeWindows>>;

export function isFreezeFrameGlacioChafeWindowActive(
  window: FreezeFrameGlacioChafeWindows['selfGlacio'] | FreezeFrameGlacioChafeWindows['teamAtk'],
  query: {
    readonly actorId: string;
    readonly atSeconds: number;
    readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
  },
) {
  if (!validText(query.actorId) || !Number.isFinite(query.atSeconds) || query.atSeconds < 0
    || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(query.sameTimestampOrder)) {
    throw new Error('Freeze Frame query requires exact actor/time/order');
  }
  const recipientQualified = window.appliesTo === 'SELF'
    ? query.actorId === window.actorId
    : (window.teamMemberIds ?? []).includes(query.actorId);
  return recipientQualified
    && query.atSeconds >= window.startedAtSeconds && query.atSeconds < window.expiresAtSeconds
    && !(query.atSeconds === window.startedAtSeconds && query.sameTimestampOrder === 'BEFORE_TRIGGER');
}
