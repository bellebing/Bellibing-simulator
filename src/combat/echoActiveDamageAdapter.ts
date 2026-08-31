import { ECHO_ATTACK_PROFILES } from '../data/echoAttacks.ts';
import type { EchoAttackFact, EchoAttackScalingStat } from '../echoAttackDomain.ts';
import { totalMotionValue } from '../echoAttackDomain.ts';
import {
  createEchoAttackRegistry,
  type EchoAttackRegistry,
} from '../echoAttackRegistry.ts';

export const ECHO_ACTIVE_DAMAGE_PRIMITIVE_ID = 'echo-active-damage-v1';

const DEFAULT_ECHO_ATTACK_REGISTRY = createEchoAttackRegistry(ECHO_ATTACK_PROFILES);

export interface ExactEchoActiveDamage {
  readonly primitiveId: typeof ECHO_ACTIVE_DAMAGE_PRIMITIVE_ID;
  readonly echoId: string;
  readonly attackId: string;
  readonly name: string;
  readonly element: EchoAttackFact['element'];
  readonly scalingStat: EchoAttackScalingStat;
  readonly sourceDamageClass?: EchoAttackFact['sourceDamageClass'];
  readonly motionValue: number;
}

/**
 * Resolve source-verified ACTIVE_CAST Echo damage into an engine-ready damage
 * fact without inventing cast timing, profile uptime, or variant selection.
 *
 * Rotation engines remain responsible for proving that the exact cast happens.
 */
export function resolveExactEchoActiveDamage(
  echoId: string,
  attackId: string,
  registry: EchoAttackRegistry = DEFAULT_ECHO_ATTACK_REGISTRY,
): ExactEchoActiveDamage {
  const profile = registry.byEchoId.get(echoId);
  if (!profile) throw new Error(`No exact Echo attack profile for ${echoId}.`);

  const attack = profile.attacks.find((row) => row.attackId === attackId);
  if (!attack) throw new Error(`${echoId} does not own exact Echo attack ${attackId}.`);
  if (attack.trigger !== 'ACTIVE_CAST') {
    throw new Error(`${echoId}/${attackId} is ${attack.trigger}, not an ACTIVE_CAST attack.`);
  }

  return {
    primitiveId: ECHO_ACTIVE_DAMAGE_PRIMITIVE_ID,
    echoId,
    attackId,
    name: attack.name,
    element: attack.element,
    scalingStat: attack.scalingStat,
    sourceDamageClass: attack.sourceDamageClass,
    motionValue: totalMotionValue(attack),
  };
}
