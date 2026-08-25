import type { WeaponEffectData } from '../effectDomain.ts';
import { WEAPON_EFFECT_CATALOG as BASE_WEAPON_EFFECT_CATALOG } from './weaponEffects.ts';
import { BROADBLADE_WEAPON_EFFECT_CATALOG } from './weaponEffectsBroadblade.ts';

/**
 * Canonical executable/source-audited Weapon Effect catalog.
 *
 * weaponEffects.ts remains the migrated/base catalog while current source-audit
 * slices can be split into focused data modules as coverage grows. Consumers
 * must import this aggregate rather than interpreting any individual slice as
 * complete roster coverage.
 */
export const WEAPON_EFFECT_CATALOG: readonly WeaponEffectData[] = Object.freeze([
  ...BASE_WEAPON_EFFECT_CATALOG,
  ...BROADBLADE_WEAPON_EFFECT_CATALOG,
]);
