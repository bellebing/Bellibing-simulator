import { ECHO_ATTACK_PROFILES } from '../data/echoAttacks.ts';
import type { EchoAttackScalingStat } from '../echoAttackDomain.ts';
import type { Element } from '../gameDataDomain.ts';
import { expectedDamage } from './damageKernel.ts';
import { resolveExactEchoActiveDamage } from './echoActiveDamageAdapter.ts';
import { assertExplicitHitSnapshot, type ExplicitHitSnapshot } from './explicitHitSnapshot.ts';

export const ECHO_ACTIVE_HIT_PRIMITIVE_ID = 'echo-active-explicit-hit-v1';

export function listEchoActiveHitSupport() {
  return ECHO_ATTACK_PROFILES.flatMap((profile) => profile.attacks.filter((attack) => attack.trigger === 'ACTIVE_CAST')
    .map((attack) => ({
      echoId: profile.echoId, attackId: attack.attackId, rank: profile.rank,
      element: attack.element, scalingStat: attack.scalingStat,
      primitiveId: ECHO_ACTIVE_HIT_PRIMITIVE_ID, scope: 'EXPLICIT_HITS_ONLY' as const,
    }))).sort((a, b) => a.attackId < b.attackId ? -1 : a.attackId > b.attackId ? 1 : 0);
}

export interface EchoActiveHitSnapshot extends ExplicitHitSnapshot {
  readonly damageClass: 'ECHO';
  readonly element: Element;
  readonly scalingStat: EchoAttackScalingStat;
}

export interface EchoActiveHitInput {
  readonly echoId: string;
  readonly attackId: string;
  readonly rank: number;
  readonly componentIndex: number;
  readonly landedHitCount: number;
  readonly snapshot: EchoActiveHitSnapshot;
}

/**
 * Evaluate one selected source component with an explicit landed count. Exact
 * cast/variant occurrence and the action-specific snapshot belong to the caller.
 * No charge/cooldown lifecycle, full hit count, effects or rotation is inferred.
 */
export function evaluateEchoActiveHit(input: EchoActiveHitInput) {
  if (input.rank !== 5) throw new Error('Echo active hit supports exact Rank-5 source profiles only.');
  const source = resolveExactEchoActiveDamage(input.echoId, input.attackId);
  const profile = ECHO_ATTACK_PROFILES.find((row) => row.echoId === source.echoId)!;
  const attack = profile.attacks.find((row) => row.attackId === source.attackId)!;
  if (!Number.isInteger(input.componentIndex) || input.componentIndex < 0 || input.componentIndex >= attack.components.length) {
    throw new Error('Select an existing source Echo component.');
  }
  const component = attack.components[input.componentIndex];
  if (!Number.isInteger(input.landedHitCount) || input.landedHitCount < 0 || input.landedHitCount > component.hits) {
    throw new Error('Echo landed hit count must be explicit and within the selected source component.');
  }
  const s = input.snapshot;
  assertExplicitHitSnapshot(s, 'Echo active hit');
  if (s.damageClass !== 'ECHO' || s.scalingStat !== source.scalingStat || s.element !== source.element) {
    throw new Error('Echo snapshot must match the source element, scaling stat and Echo damage scope.');
  }
  const motionValue = component.motionValuePerHit * input.landedHitCount;
  const damage = expectedDamage({ ...s, scalingStat: s.totalScalingStat, motionValue });
  if (!Number.isFinite(damage)) throw new Error('Echo hit damage exceeded the supported numeric range.');
  return {
    primitiveId: ECHO_ACTIVE_HIT_PRIMITIVE_ID, scope: 'EXPLICIT_HITS_ONLY' as const,
    echoId: source.echoId, attackId: source.attackId, rank: 5 as const,
    element: source.element, scalingStat: source.scalingStat, damageClass: 'ECHO' as const,
    componentIndex: input.componentIndex, landedHitCount: input.landedHitCount,
    motionValue, expectedDamage: damage,
  };
}
