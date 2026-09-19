import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';

export const HACK_SHIFTING_WEAPON_WINDOW_PRIMITIVE_ID =
  'weapon-explicit-hack-shifting-windows-v1';

const SPECTRAL_CONTRACTS = [{
  effectId: 'SPT-HEAVY-AMP',
  weaponId: 'spectral-trigger',
  statOrEffect: 'Heavy Attack DMG Amplification',
  effectType: 'TRIGGERED',
  trigger: 'Inflict Hack - Shifting',
  durationSeconds: 14,
  appliesTo: 'SELF',
  conditions: [] as readonly string[],
}, {
  effectId: 'SPT-HEAVY-DEF',
  weaponId: 'spectral-trigger',
  statOrEffect: 'DEF Ignore',
  effectType: 'STATE_CONDITIONAL',
  trigger: 'Deal Heavy Attack DMG while Spectral Trigger Heavy amplification is active',
  durationSeconds: null,
  appliesTo: 'SELF',
  conditions: ['SPT-HEAVY-AMP is active', 'Damage is Heavy Attack DMG'] as readonly string[],
}] as const;

const SKULL_CONTRACTS = [{
  effectId: 'SKT-HACK-BASIC',
  weaponId: 'skull-thrasher',
  statOrEffect: 'Basic Attack DMG',
  durationSeconds: 14,
  appliesTo: 'SELF',
}, {
  effectId: 'SKT-HACK-TEAM',
  weaponId: 'skull-thrasher',
  statOrEffect: 'ATK%',
  durationSeconds: 30,
  appliesTo: 'TEAM',
}] as const;

type SpectralEffectId = typeof SPECTRAL_CONTRACTS[number]['effectId'];
type SkullEffectId = typeof SKULL_CONTRACTS[number]['effectId'];

function uniqueEffect(effectId: string, catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG) {
  const rows = catalog.filter(row => row.effectId === effectId);
  if (rows.length !== 1) throw new Error(`${effectId}: expected exactly one canonical weapon effect`);
  return rows[0];
}

export function validateHackShiftingWeaponContracts(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
): readonly string[] {
  const issues: string[] = [];
  for (const contract of SPECTRAL_CONTRACTS) {
    let effect: WeaponEffectData;
    try { effect = uniqueEffect(contract.effectId, catalog); }
    catch (error) { issues.push(error instanceof Error ? error.message : String(error)); continue; }
    if (effect.weaponId !== contract.weaponId) issues.push(`${contract.effectId} weapon drift`);
    if (effect.statOrEffect !== contract.statOrEffect) issues.push(`${contract.effectId} stat drift`);
    if (effect.effectType !== contract.effectType) issues.push(`${contract.effectId} type drift`);
    if (effect.trigger !== contract.trigger) issues.push(`${contract.effectId} trigger drift`);
    if (effect.durationSeconds !== contract.durationSeconds) issues.push(`${contract.effectId} duration drift`);
    if (effect.appliesTo !== contract.appliesTo) issues.push(`${contract.effectId} scope drift`);
    if (effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL') issues.push(`${contract.effectId} status drift`);
    if (effect.valueUnit !== 'DECIMAL_MULTIPLIER') issues.push(`${contract.effectId} value-unit drift`);
    if (effect.maxStacks !== 1 || effect.stackIntervalSeconds !== 0) issues.push(`${contract.effectId} stack contract drift`);
    if (effect.triggerCooldownSeconds !== null) issues.push(`${contract.effectId} cooldown drift`);
    if (JSON.stringify(effect.conditions) !== JSON.stringify(contract.conditions)) issues.push(`${contract.effectId} condition drift`);
    if (effect.rankValues.length !== 5 || effect.rankValues.some(value => !Number.isFinite(value) || value <= 0 || value >= 1)) {
      issues.push(`${contract.effectId} rank curve drift`);
    }
  }
  for (const contract of SKULL_CONTRACTS) {
    let effect: WeaponEffectData;
    try { effect = uniqueEffect(contract.effectId, catalog); }
    catch (error) { issues.push(error instanceof Error ? error.message : String(error)); continue; }
    if (effect.weaponId !== contract.weaponId) issues.push(`${contract.effectId} weapon drift`);
    if (effect.statOrEffect !== contract.statOrEffect) issues.push(`${contract.effectId} stat drift`);
    if (effect.effectType !== 'TRIGGERED') issues.push(`${contract.effectId} type drift`);
    if (effect.trigger !== 'Inflict Hack - Shifting') issues.push(`${contract.effectId} trigger drift`);
    if (effect.durationSeconds !== contract.durationSeconds) issues.push(`${contract.effectId} duration drift`);
    if (effect.appliesTo !== contract.appliesTo) issues.push(`${contract.effectId} scope drift`);
    if (effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL') issues.push(`${contract.effectId} status drift`);
    if (effect.valueUnit !== 'DECIMAL_MULTIPLIER') issues.push(`${contract.effectId} value-unit drift`);
    if (effect.maxStacks !== 1 || effect.stackIntervalSeconds !== 0) issues.push(`${contract.effectId} stack contract drift`);
    if (effect.triggerCooldownSeconds !== null || effect.conditions.length !== 0) issues.push(`${contract.effectId} gained unsupported state`);
    if (effect.rankValues.length !== 5 || effect.rankValues.some(value => !Number.isFinite(value) || value <= 0 || value >= 1)) {
      issues.push(`${contract.effectId} rank curve drift`);
    }
  }
  const team = catalog.find(row => row.effectId === 'SKT-HACK-TEAM');
  const teamText = (team?.sourceEffectText ?? '').toLowerCase();
  if (team && (!teamText.includes('same-name') || !teamText.includes('not stack'))) {
    issues.push('SKT-HACK-TEAM same-name non-stacking source text drift');
  }
  const def = catalog.find(row => row.effectId === 'SPT-HEAVY-DEF');
  if (def && !(def.notes ?? '').toLowerCase().includes('inherits the heavy-amplification state')) {
    issues.push('SPT-HEAVY-DEF inherited-state source note drift');
  }
  return issues;
}

const CONTRACT_ISSUES = validateHackShiftingWeaponContracts();
if (CONTRACT_ISSUES.length) throw new Error(`Invalid Hack - Shifting contracts: ${CONTRACT_ISSUES.join('; ')}`);

export function listHackShiftingWeaponWindowSupport() {
  return [
    {
      effectId: 'SPT-HEAVY-AMP' as const,
      weaponId: 'spectral-trigger' as const,
      statOrEffect: 'Heavy Attack DMG Amplification' as const,
      appliesTo: 'SELF' as const,
      primitiveId: HACK_SHIFTING_WEAPON_WINDOW_PRIMITIVE_ID,
      selectedHitScope: 'HEAVY_DIRECT_HIT_ONLY' as const,
      occurrencePolicy: 'CALLER_QUALIFIED_HACK_SHIFTING_APPLICATION_ONLY' as const,
      lifecyclePolicy: 'ISOLATED_APPLICATION_NO_REFRESH' as const,
    },
    {
      effectId: 'SPT-HEAVY-DEF' as const,
      weaponId: 'spectral-trigger' as const,
      statOrEffect: 'DEF Ignore' as const,
      appliesTo: 'SELF' as const,
      primitiveId: HACK_SHIFTING_WEAPON_WINDOW_PRIMITIVE_ID,
      selectedHitScope: 'HEAVY_DIRECT_HIT_ONLY' as const,
      occurrencePolicy: 'INHERITS_SPT_HEAVY_AMP_ACTIVE_STATE' as const,
      lifecyclePolicy: 'NO_INDEPENDENT_TIMER' as const,
    },
    {
      effectId: 'SKT-HACK-BASIC' as const,
      weaponId: 'skull-thrasher' as const,
      statOrEffect: 'Basic Attack DMG' as const,
      appliesTo: 'SELF' as const,
      primitiveId: HACK_SHIFTING_WEAPON_WINDOW_PRIMITIVE_ID,
      selectedHitScope: 'BASIC_DIRECT_HIT_ONLY' as const,
      occurrencePolicy: 'CALLER_QUALIFIED_HACK_SHIFTING_APPLICATION_ONLY' as const,
      lifecyclePolicy: 'ISOLATED_APPLICATION_NO_REFRESH' as const,
    },
    {
      effectId: 'SKT-HACK-TEAM' as const,
      weaponId: 'skull-thrasher' as const,
      statOrEffect: 'ATK%' as const,
      appliesTo: 'TEAM' as const,
      primitiveId: HACK_SHIFTING_WEAPON_WINDOW_PRIMITIVE_ID,
      selectedHitScope: 'SELECTED_TEAM_MEMBER' as const,
      occurrencePolicy: 'CALLER_QUALIFIED_HACK_SHIFTING_APPLICATION_ONLY' as const,
      lifecyclePolicy: 'ISOLATED_APPLICATION_NO_REFRESH' as const,
      sameNameStacking: 'REJECT_DUPLICATE_ACTIVE_SOURCE' as const,
    },
  ];
}

export interface QualifiedHackShiftingApplicationEvent {
  readonly kind: 'HACK_SHIFTING_APPLIED';
  readonly actorId: string;
  readonly targetId: string;
  readonly sourceFactId: string;
  readonly atSeconds: number;
  readonly sourceTriggerQualification: 'VERIFIED_HACK_SHIFTING_APPLICATION' | 'UNKNOWN';
}

function validEvent(event: QualifiedHackShiftingApplicationEvent) {
  return event
    && event.kind === 'HACK_SHIFTING_APPLIED'
    && event.sourceTriggerQualification === 'VERIFIED_HACK_SHIFTING_APPLICATION'
    && [event.actorId, event.targetId, event.sourceFactId].every(value => value.trim().length > 0)
    && Number.isFinite(event.atSeconds) && event.atSeconds >= 0;
}

function exactRank(selectedWeapon: { readonly id: string; readonly rank: number }, weaponId: string) {
  if (selectedWeapon.id !== weaponId) throw new Error(`Hack - Shifting window requires exact ${weaponId} selection`);
  if (!Number.isInteger(selectedWeapon.rank) || selectedWeapon.rank < 1 || selectedWeapon.rank > 5) {
    throw new Error('Hack - Shifting window requires explicit R1 through R5');
  }
}

function timedWindow(effectId: SpectralEffectId | SkullEffectId, rank: number, actorId: string,
  event: QualifiedHackShiftingApplicationEvent) {
  const effect = uniqueEffect(effectId);
  if (effect.durationSeconds === null) throw new Error(`${effectId} has no independent timer`);
  const expiresAtSeconds = event.atSeconds + effect.durationSeconds;
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds) {
    throw new Error(`${effectId} expiration is not representable`);
  }
  return Object.freeze({
    primitiveId: HACK_SHIFTING_WEAPON_WINDOW_PRIMITIVE_ID,
    effectId,
    weaponId: effect.weaponId,
    actorId,
    triggerTargetId: event.targetId,
    sourceFactId: event.sourceFactId,
    statOrEffect: effect.statOrEffect,
    appliesTo: effect.appliesTo,
    value: effect.rankValues[rank - 1],
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds,
  });
}

export function activateSpectralTriggerHackShiftingWindows(params: {
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly event: QualifiedHackShiftingApplicationEvent;
}) {
  const { selectedWeapon, wielderId, event } = params;
  exactRank(selectedWeapon, 'spectral-trigger');
  if (!wielderId.trim() || !validEvent(event)) {
    throw new Error('Spectral Trigger requires exact source-qualified Hack - Shifting application evidence');
  }
  if (event.actorId !== wielderId) return null;
  const heavyAmplification = timedWindow('SPT-HEAVY-AMP', selectedWeapon.rank, wielderId, event);
  const def = uniqueEffect('SPT-HEAVY-DEF');
  const heavyDefenseIgnore = Object.freeze({
    primitiveId: HACK_SHIFTING_WEAPON_WINDOW_PRIMITIVE_ID,
    effectId: 'SPT-HEAVY-DEF' as const,
    weaponId: def.weaponId,
    actorId: wielderId,
    triggerTargetId: event.targetId,
    sourceFactId: event.sourceFactId,
    statOrEffect: def.statOrEffect,
    appliesTo: def.appliesTo,
    value: def.rankValues[selectedWeapon.rank - 1],
    inheritedFromEffectId: 'SPT-HEAVY-AMP' as const,
    startedAtSeconds: heavyAmplification.startedAtSeconds,
    expiresAtSeconds: heavyAmplification.expiresAtSeconds,
  });
  return Object.freeze({ heavyAmplification, heavyDefenseIgnore });
}

export function activateSkullThrasherHackShiftingWindows(params: {
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly teamMemberIds: readonly string[];
  readonly event: QualifiedHackShiftingApplicationEvent;
}) {
  const { selectedWeapon, wielderId, teamMemberIds, event } = params;
  exactRank(selectedWeapon, 'skull-thrasher');
  if (!wielderId.trim() || !validEvent(event) || !Array.isArray(teamMemberIds) || teamMemberIds.length === 0
    || new Set(teamMemberIds).size !== teamMemberIds.length
    || teamMemberIds.some(id => !id.trim()) || !teamMemberIds.includes(wielderId)) {
    throw new Error('Skull Thrasher requires exact Hack - Shifting evidence and a unique selected team including the wielder');
  }
  if (event.actorId !== wielderId) return null;
  const selfBasic = timedWindow('SKT-HACK-BASIC', selectedWeapon.rank, wielderId, event);
  const teamAtkBase = timedWindow('SKT-HACK-TEAM', selectedWeapon.rank, wielderId, event);
  const teamAtk = Object.freeze({ ...teamAtkBase, teamMemberIds: [...teamMemberIds] });
  return Object.freeze({ selfBasic, teamAtk });
}

type SpectralWindow = NonNullable<ReturnType<typeof activateSpectralTriggerHackShiftingWindows>>;
type SkullWindow = NonNullable<ReturnType<typeof activateSkullThrasherHackShiftingWindows>>;

function baseActive(window: { readonly actorId: string; readonly startedAtSeconds: number; readonly expiresAtSeconds: number },
  query: { readonly atSeconds: number; readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER' }) {
  if (!Number.isFinite(query.atSeconds) || query.atSeconds < 0
    || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(query.sameTimestampOrder)) {
    throw new Error('Hack - Shifting window query requires exact time/order');
  }
  return query.atSeconds >= window.startedAtSeconds && query.atSeconds < window.expiresAtSeconds
    && !(query.atSeconds === window.startedAtSeconds && query.sameTimestampOrder === 'BEFORE_TRIGGER');
}

export function isSpectralTriggerHackShiftingWindowActive(
  window: SpectralWindow['heavyAmplification'] | SpectralWindow['heavyDefenseIgnore'],
  query: { readonly actorId: string; readonly atSeconds: number; readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER' },
) {
  if (!query.actorId.trim()) throw new Error('Spectral Trigger query requires exact actor');
  return query.actorId === window.actorId && baseActive(window, query);
}

export function isSkullThrasherHackShiftingWindowActive(
  window: SkullWindow['selfBasic'] | SkullWindow['teamAtk'],
  query: { readonly actorId: string; readonly atSeconds: number; readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER' },
) {
  if (!query.actorId.trim()) throw new Error('Skull Thrasher query requires exact actor');
  const recipientQualified = window.appliesTo === 'SELF'
    ? query.actorId === window.actorId
    : ('teamMemberIds' in window && window.teamMemberIds.includes(query.actorId));
  return recipientQualified && baseActive(window, query);
}
