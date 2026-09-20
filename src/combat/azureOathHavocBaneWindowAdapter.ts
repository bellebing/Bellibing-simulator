import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';

export const AZURE_OATH_HAVOC_BANE_WINDOW_PRIMITIVE_ID =
  'azure-oath-explicit-havoc-bane-heavy-windows-v1';

export const AZURE_OATH_HAVOC_BANE_SOURCE_REVIEW = Object.freeze({
  reviewId: 'azure-oath-havoc-bane-trigger-review-20260918',
  checkedAt: '2026-09-18',
  sourceLabels: [
    'Wuwa Wiki — Azure Oath, Data Version 3.6.15',
    'GameVika — Azure Oath current weapon effect',
    'Prydwen — current Yangyang: Xuanling kit/build',
  ] as const,
  sourceUrls: [
    'https://wuwa.wiki/en/codex/weapons/21020096',
    'https://gamevika.com/en/wuwa/weapon/azure-oath',
    'https://www.prydwen.gg/wuthering-waves/characters/yangyang-xuanling',
  ] as const,
  sourceTriggerMeaning: 'AFTER_INFLICTING_HAVOC_BANE' as const,
  occurrencePolicy: 'CALLER_QUALIFIED_TIMESTAMP_ONLY' as const,
  stackPolicy: 'NO_STACK_OR_UPTIME_INFERENCE' as const,
});

const CONTRACTS = [{
  effectId: 'AO-HEAVY-AMP',
  weaponId: 'azure-oath',
  statOrEffect: 'Heavy Attack DMG Amplification',
  trigger: 'Havoc Bane',
  selectedHitScope: 'HEAVY_DIRECT_HIT_ONLY',
}, {
  effectId: 'AO-DEF',
  weaponId: 'azure-oath',
  statOrEffect: 'DEF Ignore',
  trigger: 'Havoc Bane',
  selectedHitScope: 'HEAVY_DIRECT_HIT_ONLY',
}] as const;

type AzureOathEffectId = typeof CONTRACTS[number]['effectId'];

function resolveContract(effectId: AzureOathEffectId, catalog: readonly WeaponEffectData[]) {
  const contract = CONTRACTS.find(row => row.effectId === effectId);
  if (!contract) throw new Error(`No reviewed Azure Oath contract for ${effectId}`);
  const rows = catalog.filter(row => row.effectId === effectId);
  if (rows.length !== 1) throw new Error(`${effectId} requires exactly one canonical source row`);
  const effect = rows[0];
  if (effect.weaponId !== contract.weaponId || effect.statOrEffect !== contract.statOrEffect
    || effect.trigger !== contract.trigger || effect.effectType !== 'TRIGGERED'
    || effect.appliesTo !== 'SELF' || effect.mechanicsStatus !== 'VERIFIED_MODELED'
    || effect.valueUnit !== 'DECIMAL_MULTIPLIER' || effect.durationSeconds !== 8
    || effect.maxStacks !== 1 || effect.stackIntervalSeconds !== 0
    || effect.triggerCooldownSeconds !== null || effect.conditions.length !== 0
    || effect.rankValues.length !== 5
    || effect.rankValues.some(value => !Number.isFinite(value) || value <= 0 || value >= 1)) {
    throw new Error(`${effectId} reviewed Azure Oath source contract drift`);
  }
  return { contract, effect };
}

export function validateAzureOathHavocBaneContracts(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
) {
  const issues: string[] = [];
  for (const contract of CONTRACTS) {
    try { resolveContract(contract.effectId, catalog); }
    catch (error) { issues.push(error instanceof Error ? error.message : String(error)); }
  }
  return issues;
}

/** Identity/scope only. Values and duration remain canonical WeaponEffectData. */
export function listAzureOathHavocBaneWindowSupport() {
  const issues = validateAzureOathHavocBaneContracts();
  if (issues.length) throw new Error(issues.join('; '));
  return CONTRACTS.map(contract => ({
    ...contract,
    primitiveId: AZURE_OATH_HAVOC_BANE_WINDOW_PRIMITIVE_ID,
    triggerSemantics: AZURE_OATH_HAVOC_BANE_SOURCE_REVIEW.sourceTriggerMeaning,
    occurrencePolicy: AZURE_OATH_HAVOC_BANE_SOURCE_REVIEW.occurrencePolicy,
  }));
}

export interface QualifiedHavocBaneApplicationEvent {
  readonly kind: 'HAVOC_BANE_APPLIED';
  readonly actorId: string;
  readonly targetId: string;
  readonly sourceFactId: string;
  readonly stacksApplied: number;
  readonly atSeconds: number;
  readonly sourceTriggerQualification: 'VERIFIED_AZURE_OATH_HAVOC_BANE_APPLICATION' | 'UNKNOWN';
}

/**
 * One explicit source-qualified Havoc Bane application activates the paired
 * Azure Oath windows. No Character prose, stack history or rotation uptime is
 * interpreted here.
 */
export function activateAzureOathHavocBaneWindows(params: {
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly event: QualifiedHavocBaneApplicationEvent;
  readonly catalog?: readonly WeaponEffectData[];
}) {
  const catalog = params.catalog ?? WEAPON_EFFECT_CATALOG;
  const heavy = resolveContract('AO-HEAVY-AMP', catalog).effect;
  const defense = resolveContract('AO-DEF', catalog).effect;
  const { selectedWeapon, wielderId, event } = params;
  if (selectedWeapon.id !== heavy.weaponId || selectedWeapon.id !== defense.weaponId) {
    throw new Error('Azure Oath Havoc Bane windows require exact Azure Oath selection');
  }
  if (!Number.isInteger(selectedWeapon.rank) || selectedWeapon.rank < 1 || selectedWeapon.rank > 5) {
    throw new Error('Azure Oath rank must be explicit R1 through R5');
  }
  if (![wielderId, event.actorId, event.targetId, event.sourceFactId].every(id => id.trim())
    || !Number.isInteger(event.stacksApplied) || event.stacksApplied <= 0
    || !Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error('Exact Havoc Bane source/target/fact, positive applied stacks and finite time are required');
  }
  if (event.kind !== 'HAVOC_BANE_APPLIED'
    || event.sourceTriggerQualification !== 'VERIFIED_AZURE_OATH_HAVOC_BANE_APPLICATION') {
    throw new Error('Explicit source-qualified Havoc Bane application is required');
  }
  if (event.actorId !== wielderId) return null;

  const make = (effect: WeaponEffectData) => {
    const expiresAtSeconds = event.atSeconds + effect.durationSeconds!;
    if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds) {
      throw new Error('Azure Oath window expiration is not representable');
    }
    return Object.freeze({
      primitiveId: AZURE_OATH_HAVOC_BANE_WINDOW_PRIMITIVE_ID,
      effectId: effect.effectId as AzureOathEffectId,
      weaponId: effect.weaponId,
      actorId: wielderId,
      triggerTargetId: event.targetId,
      sourceFactId: event.sourceFactId,
      appliedStacks: event.stacksApplied,
      statOrEffect: effect.statOrEffect,
      value: effect.rankValues[selectedWeapon.rank - 1],
      valueUnit: effect.valueUnit,
      selectedHitScope: 'HEAVY_DIRECT_HIT_ONLY' as const,
      startedAtSeconds: event.atSeconds,
      expiresAtSeconds,
    });
  };
  return Object.freeze({ heavyAmplification: make(heavy), heavyDefenseIgnore: make(defense) });
}

export type ActiveAzureOathHavocBaneWindow =
  NonNullable<ReturnType<typeof activateAzureOathHavocBaneWindows>>['heavyAmplification'];

export function isAzureOathHavocBaneWindowActive(
  window: ActiveAzureOathHavocBaneWindow,
  query: {
    readonly actorId: string;
    readonly atSeconds: number;
    readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
  },
) {
  if (!query.actorId.trim() || !Number.isFinite(query.atSeconds) || query.atSeconds < 0
    || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(query.sameTimestampOrder)) {
    throw new Error('Azure Oath window query requires exact actor/time/order');
  }
  return query.actorId === window.actorId
    && query.atSeconds >= window.startedAtSeconds && query.atSeconds < window.expiresAtSeconds
    && !(query.atSeconds === window.startedAtSeconds && query.sameTimestampOrder === 'BEFORE_TRIGGER');
}
