import { MECH_ABOMINATION_ATTACK_PROFILE } from '../data/echoAttacksMechAbomination20260831.ts';
import { MECH_ABOMINATION_EFFECT_MODELS } from '../data/echoEffectsMechAbomination20260831.ts';

export interface MechAbominationCastEvent {
  readonly kind: 'ECHO_ACTIVE_CAST';
  readonly actorId: string;
  readonly echoId: 'echo-60000485';
  readonly atSeconds: number;
}

export interface ActiveMechAbominationCastState {
  readonly adapterId: 'mech-abomination-explicit-cast-state-v1';
  readonly actorId: string;
  readonly echoId: 'echo-60000485';
  readonly castAtSeconds: number;
  readonly attackWindowStartedAtSeconds: number;
  readonly wielderAtkBonus: 0.12;
  readonly atkWindowExpiresAtSeconds: number;
  readonly cooldownSeconds: 20;
  readonly nextCastReadyAtSeconds: number;
  readonly unscheduledExactAttackIds: readonly [
    'MECH_ABOMINATION_FRONT_STRIKE',
    'MECH_ABOMINATION_WASTE',
  ];
}

export const MECH_ABOMINATION_CAST_STATE_CONTRACT = {
  echoId: 'echo-60000485',
  effectId: 'MECH_ABOMINATION_WIELDER_ATK',
  atkBonus: 0.12,
  atkDurationSeconds: 15,
  cooldownSeconds: 20,
  attackIds: ['MECH_ABOMINATION_FRONT_STRIKE', 'MECH_ABOMINATION_WASTE'] as const,
} as const;

export const MECH_ABOMINATION_CAST_STATE_REVIEW = {
  status: 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE',
  blockerId: 'BUG-017',
  reviewedAt: '2026-09-01',
  primitiveId: 'mech-abomination-explicit-cast-state-v1',
  pendingExecutionId: 'echo:echo-60000485:mech-abomination-cast-timeline-adapter',
  closesPendingExecutionIds: [] as readonly string[],
  sourceEstablished: [
    'An explicit Mech Abomination active cast grants the current character 12% ATK for 15s.',
    'Mech Abomination has a source-exact 20s cooldown at Rank 5.',
    'The Rank-5 front strike and Mech Waste attack math is exact, with Mech Waste classified as Resonator Outro Skill DMG.',
  ],
  unresolvedSemantics: [
    'The source does not provide exact delay timestamps from cast to the front strike, Mech Waste hit, or Waste explosion.',
    'The canonical source sequence provides Echo order but no numeric cast timestamp or downstream action timestamps for overlap calculation.',
  ],
  notes: [
    'The primitive materializes only explicit cast state: a [cast, cast+15s) wielder ATK window and next cast readiness at cast+20s.',
    'Exact attack identities are exposed as unscheduled facts; this adapter deliberately does not assign them hit timestamps.',
    'One source-sequence Echo step does not become a timed profile event until an executable timeline supplies its timestamp.',
  ],
} as const;

export function validateMechAbominationCastStateContract(): readonly string[] {
  const issues: string[] = [];
  const effects = MECH_ABOMINATION_EFFECT_MODELS.filter((row) => row.effectId === MECH_ABOMINATION_CAST_STATE_CONTRACT.effectId);
  if (effects.length !== 1) {
    issues.push(`expected one Mech Abomination ATK effect, got ${effects.length}`);
  } else {
    const effect = effects[0];
    if (effect.echoId !== MECH_ABOMINATION_CAST_STATE_CONTRACT.echoId) issues.push(`Mech ATK effect Echo id drift: ${effect.echoId}`);
    if (effect.activation !== 'ON_ECHO_CAST') issues.push(`Mech ATK activation drift: ${effect.activation}`);
    if (effect.appliesTo !== 'WIELDER') issues.push(`Mech ATK appliesTo drift: ${effect.appliesTo}`);
    if (effect.statOrEffect !== 'ATK%') issues.push(`Mech ATK stat drift: ${effect.statOrEffect}`);
    if (effect.value !== MECH_ABOMINATION_CAST_STATE_CONTRACT.atkBonus) issues.push(`Mech ATK value drift: ${effect.value}`);
    if (effect.durationSeconds !== MECH_ABOMINATION_CAST_STATE_CONTRACT.atkDurationSeconds) {
      issues.push(`Mech ATK duration drift: ${String(effect.durationSeconds)}`);
    }
  }

  if (MECH_ABOMINATION_ATTACK_PROFILE.echoId !== MECH_ABOMINATION_CAST_STATE_CONTRACT.echoId) {
    issues.push(`Mech attack profile Echo id drift: ${MECH_ABOMINATION_ATTACK_PROFILE.echoId}`);
  }
  if (MECH_ABOMINATION_ATTACK_PROFILE.rank !== 5) issues.push(`Mech attack profile rank drift: ${MECH_ABOMINATION_ATTACK_PROFILE.rank}`);
  if (MECH_ABOMINATION_ATTACK_PROFILE.cooldownSeconds !== MECH_ABOMINATION_CAST_STATE_CONTRACT.cooldownSeconds) {
    issues.push(`Mech cooldown drift: ${MECH_ABOMINATION_ATTACK_PROFILE.cooldownSeconds}`);
  }
  const attackIds = MECH_ABOMINATION_ATTACK_PROFILE.attacks.map((attack) => attack.attackId);
  if (attackIds.length !== MECH_ABOMINATION_CAST_STATE_CONTRACT.attackIds.length
      || attackIds.some((id, index) => id !== MECH_ABOMINATION_CAST_STATE_CONTRACT.attackIds[index])) {
    issues.push(`Mech exact attack-id drift: ${attackIds.join(',')}`);
  }
  if (MECH_ABOMINATION_ATTACK_PROFILE.attacks.some((attack) => attack.trigger !== 'ACTIVE_CAST')) {
    issues.push('Mech attack trigger drift: all reviewed attacks must remain ACTIVE_CAST');
  }

  return issues;
}

const CONTRACT_ISSUES = validateMechAbominationCastStateContract();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Mech Abomination cast-state contract: ${CONTRACT_ISSUES.join('; ')}`);
}

export function activateMechAbominationCastState(params: {
  readonly wielderId: string;
  readonly event: MechAbominationCastEvent;
}): ActiveMechAbominationCastState | null {
  const { wielderId, event } = params;
  if (!wielderId.trim()) throw new Error('Mech Abomination wielderId must be non-blank');
  if (!event.actorId.trim()) throw new Error('Mech Abomination cast actorId must be non-blank');
  if (!Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error(`Mech Abomination cast time must be a finite non-negative number: ${event.atSeconds}`);
  }
  if (event.actorId !== wielderId || event.echoId !== MECH_ABOMINATION_CAST_STATE_CONTRACT.echoId) return null;

  return {
    adapterId: 'mech-abomination-explicit-cast-state-v1',
    actorId: wielderId,
    echoId: MECH_ABOMINATION_CAST_STATE_CONTRACT.echoId,
    castAtSeconds: event.atSeconds,
    attackWindowStartedAtSeconds: event.atSeconds,
    wielderAtkBonus: MECH_ABOMINATION_CAST_STATE_CONTRACT.atkBonus,
    atkWindowExpiresAtSeconds: event.atSeconds + MECH_ABOMINATION_CAST_STATE_CONTRACT.atkDurationSeconds,
    cooldownSeconds: MECH_ABOMINATION_CAST_STATE_CONTRACT.cooldownSeconds,
    nextCastReadyAtSeconds: event.atSeconds + MECH_ABOMINATION_CAST_STATE_CONTRACT.cooldownSeconds,
    unscheduledExactAttackIds: MECH_ABOMINATION_CAST_STATE_CONTRACT.attackIds,
  };
}

export function isMechAbominationAtkWindowActive(
  state: ActiveMechAbominationCastState,
  atSeconds: number,
): boolean {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`Mech Abomination ATK-window query time must be a finite non-negative number: ${atSeconds}`);
  }
  return atSeconds >= state.attackWindowStartedAtSeconds && atSeconds < state.atkWindowExpiresAtSeconds;
}

export function isMechAbominationCastReady(
  state: ActiveMechAbominationCastState,
  atSeconds: number,
): boolean {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`Mech Abomination cooldown query time must be a finite non-negative number: ${atSeconds}`);
  }
  return atSeconds >= state.nextCastReadyAtSeconds;
}
