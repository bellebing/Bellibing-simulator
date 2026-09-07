import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';
import type { Element } from '../gameDataDomain.ts';

export const WEAPON_TEAM_AMPLIFY_WINDOW_REVIEW = {
  adapterId: 'weapon-cast-team-amplify-window-v1',
  reviewedAt: '2026-09-07',
  sourceReviewId: 'ROTATION-EXECUTION-ROVER-AERO-2026-08-30-01',
  pendingExecutionId: 'weapon:bloodpacts-pledge:BPP-TEAM-AERO:unbound-flow-team-amplify-adapter',
  closesPendingExecutionIds: [] as readonly string[],
  requiresProfileEventTimeline: true,
} as const;

/** Explicit semantic binding to the already-reviewed source row, not trigger-text parsing. */
export function validateWeaponTeamAmplifyWindowContract(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
): readonly string[] {
  const rows = catalog.filter((row) => row.effectId === 'BPP-TEAM-AERO');
  if (rows.length !== 1) return ['BPP-TEAM-AERO requires exactly one canonical source row'];
  const effect = rows[0];
  const issues: string[] = [];
  const expected = {
    weaponId: 'bloodpacts-pledge', statOrEffect: 'Aero DMG Amplification',
    trigger: 'Rover (Aero) casts Resonance Skill Unbound Flow',
    effectType: 'TRIGGERED', appliesTo: 'TEAM', valueUnit: 'DECIMAL_MULTIPLIER',
    mechanicsStatus: 'VERIFIED_CONDITIONAL', durationSeconds: 30,
    maxStacks: 1, triggerCooldownSeconds: null, stackIntervalSeconds: 0,
    sourceEffectText: 'When Rover (Aero) casts Unbound Flow, Aero DMG dealt by nearby Resonators on field is Amplified for 30 seconds.',
  } as const;
  for (const key of Object.keys(expected) as (keyof typeof expected)[]) {
    if (effect[key] !== expected[key]) issues.push(`BPP-TEAM-AERO ${key} source drift`);
  }
  if (JSON.stringify(effect.conditions) !== JSON.stringify(['Wielder is Rover (Aero)', 'Triggering skill is Unbound Flow'])) {
    issues.push('BPP-TEAM-AERO conditions source drift');
  }
  if (JSON.stringify(effect.rankValues) !== JSON.stringify([.10, .14, .18, .22, .26])) {
    issues.push('BPP-TEAM-AERO rank values source drift');
  }
  return issues;
}

export interface WeaponTeamCastEvent {
  readonly kind: 'ROVER_AERO_UNBOUND_FLOW_CAST';
  readonly actorId: string;
  readonly atSeconds: number;
}

export interface ActiveWeaponTeamAmplifyWindow {
  readonly adapterId: typeof WEAPON_TEAM_AMPLIFY_WINDOW_REVIEW.adapterId;
  readonly effectId: 'BPP-TEAM-AERO';
  readonly weaponId: string;
  readonly actorId: string;
  readonly value: number;
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
}

function requireTime(atSeconds: number): void {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) throw new Error('Time must be finite and non-negative');
}

/** One resolved cast only. No recast, stacking, recipient allocation or rotation policy. */
export function activateWeaponTeamAmplifyWindow(params: {
  readonly weaponId: string;
  readonly rank: 1 | 2 | 3 | 4 | 5;
  readonly wielderId: string;
  readonly wielderCharacterId: string;
  readonly event: WeaponTeamCastEvent;
}): ActiveWeaponTeamAmplifyWindow | null {
  const issues = validateWeaponTeamAmplifyWindowContract();
  if (issues.length) throw new Error(issues.join('; '));
  const { weaponId, rank, wielderId, wielderCharacterId, event } = params;
  if (!Number.isInteger(rank) || rank < 1 || rank > 5) throw new Error('Weapon rank must be 1 through 5');
  if (!wielderId.trim() || !event.actorId.trim()) throw new Error('Actor IDs must be non-blank');
  requireTime(event.atSeconds);
  if (weaponId !== 'bloodpacts-pledge' || wielderCharacterId !== 'rover-aero'
    || event.actorId !== wielderId || event.kind !== 'ROVER_AERO_UNBOUND_FLOW_CAST') return null;
  const effect = WEAPON_EFFECT_CATALOG.find((row) => row.effectId === 'BPP-TEAM-AERO')!;
  const expiresAtSeconds = event.atSeconds + effect.durationSeconds!;
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds) {
    throw new Error('Window expiration is not representable');
  }
  return Object.freeze({
    adapterId: WEAPON_TEAM_AMPLIFY_WINDOW_REVIEW.adapterId,
    effectId: 'BPP-TEAM-AERO', weaponId, actorId: wielderId,
    value: effect.rankValues[rank - 1], startedAtSeconds: event.atSeconds, expiresAtSeconds,
  });
}

/**
 * Eligibility is evidence supplied for this recipient/hit, not inferred from
 * roster membership. This does not choose aura/snapshot/allocation semantics.
 * AFTER_TRIGGER explicitly orders a same-timestamp hit after cast resolution.
 */
export function weaponTeamAeroAmplificationAt(
  window: ActiveWeaponTeamAmplifyWindow,
  query: {
    readonly atSeconds: number;
    readonly triggerOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
    readonly nearbyOnFieldEligibility: 'VERIFIED_ELIGIBLE' | 'VERIFIED_INELIGIBLE' | 'UNKNOWN';
    readonly damageElement: Element;
  },
): number {
  requireTime(query.atSeconds);
  if (query.triggerOrder !== 'BEFORE_TRIGGER' && query.triggerOrder !== 'AFTER_TRIGGER') {
    throw new Error('Explicit trigger order is required');
  }
  if (query.nearbyOnFieldEligibility !== 'VERIFIED_ELIGIBLE'
    && query.nearbyOnFieldEligibility !== 'VERIFIED_INELIGIBLE') {
    throw new Error('Nearby on-field recipient eligibility is unresolved');
  }
  if (!['Aero', 'Fusion', 'Glacio', 'Electro', 'Spectro', 'Havoc'].includes(query.damageElement)) {
    throw new Error('Damage element must be explicit and known');
  }
  if (query.triggerOrder === 'BEFORE_TRIGGER' || query.nearbyOnFieldEligibility === 'VERIFIED_INELIGIBLE'
    || query.damageElement !== 'Aero' || query.atSeconds < window.startedAtSeconds
    || query.atSeconds >= window.expiresAtSeconds) return 0;
  return window.value;
}
