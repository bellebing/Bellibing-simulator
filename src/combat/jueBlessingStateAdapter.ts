import { resolveExactEchoActiveDamage } from './echoActiveDamageAdapter.ts';
import { createEchoAttackRegistry } from '../echoAttackRegistry.ts';
import {
  JINHSI_JUE_RANK5_ATTACK_20260901,
  JINHSI_JUE_REPEATED_SKILL_DAMAGE_20260901,
  JINHSI_JUE_SKILL_BONUS_20260901,
} from '../data/jinhsiJueFacts20260901.ts';

export const JUE_BLESSING_STATE_PRIMITIVE_ID = 'jue-blessing-state-v1';

const JUE_ATTACK_REGISTRY = createEchoAttackRegistry([JINHSI_JUE_RANK5_ATTACK_20260901]);

export interface JueEchoCastEvent {
  readonly kind: 'ECHO_CAST';
  readonly actorId: string;
  readonly atSeconds: number;
}

export interface JueResonanceSkillHitEvent {
  readonly kind: 'RESONANCE_SKILL_HIT';
  readonly actorId: string;
  readonly atSeconds: number;
}

export interface JueBlessingState {
  readonly primitiveId: typeof JUE_BLESSING_STATE_PRIMITIVE_ID;
  readonly echoId: 'echo-60000595';
  readonly ownerId: string;
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
  readonly nextRepeatedDamageReadyAtSeconds: number;
}

export interface JueCastResolution {
  readonly state: JueBlessingState;
  readonly activeDamage: ReturnType<typeof resolveExactEchoActiveDamage>;
  readonly resonanceSkillDamageBonus: number;
}

export interface JueRepeatedSkillDamageProc {
  readonly echoId: 'echo-60000595';
  readonly element: 'Spectro';
  readonly scalingStat: 'ATK';
  readonly damageClass: 'SKILL';
  readonly motionValue: number;
  readonly atSeconds: number;
}

export interface JueRepeatedSkillDamageResult {
  readonly state: JueBlessingState;
  readonly proc: JueRepeatedSkillDamageProc | null;
}

function finiteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a finite non-negative number: ${value}`);
}

function nonBlank(value: string, label: string): void {
  if (!value.trim()) throw new Error(`${label} must be non-blank`);
}

/**
 * Explicit Jué cast only. Merely equipping Jué never calls this primitive and
 * therefore never creates active damage or Blessing of Time uptime.
 */
export function castJueForBlessing(event: JueEchoCastEvent): JueCastResolution {
  nonBlank(event.actorId, 'Jué cast actorId');
  finiteNonNegative(event.atSeconds, 'Jué cast time');

  const activeDamage = resolveExactEchoActiveDamage(
    'echo-60000595',
    'JUE_ACTIVE_SUMMON',
    JUE_ATTACK_REGISTRY,
  );
  const durationSeconds = JINHSI_JUE_SKILL_BONUS_20260901.durationSeconds;
  if (durationSeconds === null || durationSeconds <= 0) throw new Error('Jué Blessing requires a positive duration');

  return {
    activeDamage,
    resonanceSkillDamageBonus: JINHSI_JUE_SKILL_BONUS_20260901.value,
    state: {
      primitiveId: JUE_BLESSING_STATE_PRIMITIVE_ID,
      echoId: 'echo-60000595',
      ownerId: event.actorId,
      startedAtSeconds: event.atSeconds,
      expiresAtSeconds: event.atSeconds + durationSeconds,
      nextRepeatedDamageReadyAtSeconds: event.atSeconds,
    },
  };
}

export function isJueBlessingActive(
  state: JueBlessingState,
  actorId: string,
  atSeconds: number,
): boolean {
  nonBlank(actorId, 'Jué Blessing query actorId');
  finiteNonNegative(atSeconds, 'Jué Blessing query time');
  return actorId === state.ownerId
    && atSeconds >= state.startedAtSeconds
    && atSeconds < state.expiresAtSeconds;
}

export function getJueResonanceSkillDamageBonus(
  state: JueBlessingState,
  actorId: string,
  atSeconds: number,
): number {
  return isJueBlessingActive(state, actorId, atSeconds)
    ? JINHSI_JUE_SKILL_BONUS_20260901.value
    : 0;
}

/**
 * Resolve the source-defined once-per-second repeated Spectro damage only from
 * an explicit Resonance Skill hit while Blessing of Time is active.
 */
export function applyJueResonanceSkillHit(
  state: JueBlessingState,
  event: JueResonanceSkillHitEvent,
): JueRepeatedSkillDamageResult {
  nonBlank(event.actorId, 'Jué Skill-hit actorId');
  finiteNonNegative(event.atSeconds, 'Jué Skill-hit time');
  if (!isJueBlessingActive(state, event.actorId, event.atSeconds)) return { state, proc: null };
  if (event.atSeconds < state.nextRepeatedDamageReadyAtSeconds) return { state, proc: null };

  const nextState: JueBlessingState = {
    ...state,
    nextRepeatedDamageReadyAtSeconds: event.atSeconds + JINHSI_JUE_REPEATED_SKILL_DAMAGE_20260901.minimumProcIntervalSeconds,
  };
  return {
    state: nextState,
    proc: {
      echoId: 'echo-60000595',
      element: 'Spectro',
      scalingStat: 'ATK',
      damageClass: 'SKILL',
      motionValue: JINHSI_JUE_REPEATED_SKILL_DAMAGE_20260901.motionValuePerProc,
      atSeconds: event.atSeconds,
    },
  };
}

export const JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW = {
  primitiveId: JUE_BLESSING_STATE_PRIMITIVE_ID,
  reviewedAt: '2026-09-01',
  pendingExecutionId: 'echo:echo-60000595:jue-active-skill-and-blessing-adapter',
  blockerId: 'BUG-020',
  closesPendingExecutionIds: [] as readonly string[],
  sourcePlacementDisposition: 'FREE_FLOW_NO_CANONICAL_FIXED_CAST',
  canonicalFixedCastCheckpointPresent: false,
  canonicalCastPresence: null,
  recommendedPlacementIfUsed: 'BEFORE_FORTE_SKILL_NUKE',
  requiresExplicitEchoCast: true,
  requiresExplicitSkillHitTimeline: true,
  sourcePlacementBlocksCanonicalExecution: true,
  notes: [
    'The primitive resolves the exact Rank-5 ACTIVE_CAST attack through echo-active-damage-v1, starts the 15-second +16% Resonance Skill DMG Blessing, and enforces the 16% ATK Spectro Skill-classified proc at most once per second.',
    'Current Prydwen says Jué timing is very free-flow: Jinhsi may use it at any point, with the most recommended placement immediately before a Forte Skill nuke. The fixed Standard Opener list itself contains no Jué step, so source does not select one canonical cast checkpoint.',
    'Sequence omission is not proof that Jué is absent. Canonical execution must neither auto-insert nor auto-suppress the Echo; an explicit source-backed placement decision is still required before the profile dependency can close.',
  ],
} as const;