import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';
import type { ActiveWeaponDamageWindow } from './weaponDamageWindowAdapter.ts';

export const LUX_UMBRA_DEFENSE_STATE_ID = 'lux-umbra-defense-overlap-v1';

const EFFECT_ID = 'LU-DEF' as const;
const WEAPON_ID = 'lux-and-umbra' as const;
const REQUIRED_WINDOWS = ['LU-HEAVY-AMP', 'LU-ECHO-AMP'] as const;

function sourceRow(catalog: readonly WeaponEffectData[]) {
  const rows = catalog.filter(row => row.effectId === EFFECT_ID);
  if (rows.length !== 1) throw new Error('LU-DEF requires exactly one canonical source row');
  return rows[0];
}

export function validateLuxUmbraDefenseStateContract(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
): readonly string[] {
  const issues: string[] = [];
  let effect: WeaponEffectData;
  try {
    effect = sourceRow(catalog);
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }
  if (effect.weaponId !== WEAPON_ID) issues.push('LU-DEF weapon id drift');
  if (effect.statOrEffect !== 'DEF Ignore') issues.push('LU-DEF stat contract drift');
  if (effect.effectType !== 'STATE_CONDITIONAL') issues.push('LU-DEF effect type drift');
  if (effect.trigger !== 'Deal damage while both Lux & Umbra amplification windows are active') {
    issues.push('LU-DEF trigger drift');
  }
  if (effect.durationSeconds !== null) issues.push('LU-DEF must not invent an independent duration');
  if (effect.appliesTo !== 'SELF') issues.push('LU-DEF scope drift');
  if (effect.maxStacks !== 1 || effect.stackIntervalSeconds !== 0 || effect.triggerCooldownSeconds !== null) {
    issues.push('LU-DEF stack/cooldown contract drift');
  }
  if (JSON.stringify(effect.conditions) !== JSON.stringify([
    'LU-HEAVY-AMP is active',
    'LU-ECHO-AMP is active',
  ])) issues.push('LU-DEF prerequisite-window contract drift');
  if (effect.valueUnit !== 'DECIMAL_MULTIPLIER') issues.push('LU-DEF unit drift');
  if (effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL') issues.push('LU-DEF modeling status drift');
  if (effect.rankValues.length !== 5
    || effect.rankValues.some(value => !Number.isFinite(value) || value <= 0 || value >= 1)) {
    issues.push('LU-DEF rank values must remain five bounded canonical fractions');
  }
  return issues;
}

/** Identity/state capability only. Numeric truth remains in canonical WeaponEffectData. */
export function listLuxUmbraDefenseStateSupport() {
  const issues = validateLuxUmbraDefenseStateContract();
  if (issues.length) throw new Error(issues.join('; '));
  const effect = sourceRow(WEAPON_EFFECT_CATALOG);
  return [{
    effectId: EFFECT_ID,
    weaponId: WEAPON_ID,
    statOrEffect: effect.statOrEffect,
    primitiveId: LUX_UMBRA_DEFENSE_STATE_ID,
    prerequisiteEffectIds: [...REQUIRED_WINDOWS],
    scope: 'BOTH_REVIEWED_LUX_WINDOWS_ACTIVE_AT_SELECTED_HIT' as const,
    rankRange: [1, 5] as const,
  }];
}

export interface QualifiedLuxWindowState {
  readonly active: boolean;
  readonly window: ActiveWeaponDamageWindow;
}

/**
 * No independent LU-DEF timer exists. The selected hit receives the canonical
 * rank value only while both already-qualified Lux windows are active.
 */
export function resolveLuxUmbraDefenseState(input: {
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly actorId: string;
  readonly heavyAmplification: QualifiedLuxWindowState;
  readonly echoAmplification: QualifiedLuxWindowState;
}) {
  const issues = validateLuxUmbraDefenseStateContract();
  if (issues.length) throw new Error(issues.join('; '));
  if (input.selectedWeapon?.id !== WEAPON_ID
    || !Number.isInteger(input.selectedWeapon.rank) || input.selectedWeapon.rank < 1 || input.selectedWeapon.rank > 5
    || typeof input.actorId !== 'string' || input.actorId.trim().length === 0) {
    throw new Error('LU-DEF requires exact Lux & Umbra R1-R5 equipment and explicit actor');
  }
  const pair = [
    ['LU-HEAVY-AMP', input.heavyAmplification] as const,
    ['LU-ECHO-AMP', input.echoAmplification] as const,
  ];
  for (const [effectId, state] of pair) {
    if (!state || typeof state.active !== 'boolean' || !state.window
      || state.window.effectId !== effectId || state.window.weaponId !== WEAPON_ID
      || state.window.actorId !== input.actorId) {
      throw new Error('LU-DEF requires the exact two reviewed Lux window states for the selected wielder');
    }
  }
  const effect = sourceRow(WEAPON_EFFECT_CATALOG);
  return Object.freeze({
    primitiveId: LUX_UMBRA_DEFENSE_STATE_ID,
    effectId: EFFECT_ID,
    weaponId: WEAPON_ID,
    actorId: input.actorId,
    statOrEffect: 'DEF Ignore' as const,
    value: effect.rankValues[input.selectedWeapon.rank - 1],
    active: input.heavyAmplification.active && input.echoAmplification.active,
    prerequisiteEffectIds: [...REQUIRED_WINDOWS],
    sourceState: 'EXACT_REVIEWED_WINDOW_OVERLAP' as const,
  });
}
