import { ZHEZHI_PASSIVE_FACTS } from '../data/characterMechanics/zhezhiRawFacts.ts';
import { THE_SHOREKEEPER_PASSIVE_FACTS } from '../data/characterMechanics/theShorekeeperRawFacts.ts';

export interface LingyangZhezhiOutroSwitchEvent {
  readonly kind: 'OUTRO_SWITCH';
  readonly actorId: string;
  readonly incomingResonatorId: string;
  readonly atSeconds: number;
}

export interface LingyangShorekeeperOutroSkillEvent {
  readonly kind: 'OUTRO_SKILL_CAST';
  readonly actorId: string;
  readonly atSeconds: number;
  readonly sourceFactId: 'the-shorekeeper-outro-binary-butterfly';
}

export interface LingyangZhezhiIncomingState {
  readonly adapterId: 'lingyang-zhezhi-explicit-outro-incoming-state-v1';
  readonly sourceActorId: 'zhezhi';
  readonly incomingResonatorId: 'lingyang';
  readonly flourishFactId: 'zhezhi-inherent-flourish';
  readonly carveAndDrawFactId: 'zhezhi-outro-carve-and-draw';
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
  readonly resonanceEnergyRestoreAmount: 15;
  readonly glacioDamageAmplification: 0.20;
  readonly resonanceSkillDamageAmplification: 0.25;
  readonly endsOnIncomingSwitchOut: true;
}

export interface LingyangShorekeeperTeamState {
  readonly adapterId: 'lingyang-shorekeeper-explicit-outro-team-state-v1';
  readonly sourceActorId: 'the-shorekeeper';
  readonly beneficiaryId: 'lingyang';
  readonly sourceFactId: 'the-shorekeeper-outro-binary-butterfly';
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
  readonly damageAmplification: 0.15;
  readonly requiresNearbyPartyMember: true;
}

export const LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT = {
  sourceActorId: 'zhezhi',
  incomingResonatorId: 'lingyang',
  flourishFactId: 'zhezhi-inherent-flourish',
  carveAndDrawFactId: 'zhezhi-outro-carve-and-draw',
  durationSeconds: 14,
  resonanceEnergyRestoreAmount: 15,
  glacioDamageAmplification: 0.20,
  resonanceSkillDamageAmplification: 0.25,
  endsOnIncomingSwitchOut: true,
} as const;

export const LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT = {
  sourceActorId: 'the-shorekeeper',
  beneficiaryId: 'lingyang',
  sourceFactId: 'the-shorekeeper-outro-binary-butterfly',
  durationSeconds: 30,
  damageAmplification: 0.15,
  requiresNearbyPartyMember: true,
} as const;

export const LINGYANG_TEAM_INCOMING_STATE_SEMANTIC_REVIEW = {
  status: 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE',
  blockerId: 'BUG-017',
  reviewedAt: '2026-09-01',
  primitiveIds: [
    'lingyang-zhezhi-explicit-outro-incoming-state-v1',
    'lingyang-shorekeeper-explicit-outro-team-state-v1',
  ] as const,
  contributesToPendingExecutionIds: [
    'team:lingyang-standard:zhezhi-incoming-state-adapter',
    'team:lingyang-standard:shorekeeper-incoming-state-adapter',
    'rotation:lingyang-standard-rotation:engine-model',
  ] as const,
  closesPendingExecutionIds: [] as readonly string[],
  sourceEstablished: [
    'Zhezhi Outro restores 15 Resonance Energy to the incoming Resonator through Flourish.',
    'Zhezhi Carve and Draw gives the incoming Resonator 20% Glacio DMG Amplification and 25% Resonance Skill DMG Amplification for 14s, ending early if that Resonator is switched out.',
    'The Shorekeeper Binary Butterfly amplifies all nearby party members DMG by 15% for its source-declared 30s duration.',
  ],
  notes: [
    'The Zhezhi primitive activates only from an explicit Zhezhi Outro switch whose actual incoming Resonator is Lingyang. The 15 Resonance Energy restore is represented as one instant source amount, not a repeating timed effect.',
    'Zhezhi timed amplification requires caller proof that Lingyang has not switched out since the activation event; source-sequence order alone cannot establish that lifecycle.',
    'The Shorekeeper primitive activates only from an explicit Binary Butterfly Outro event and requires caller proof that Lingyang satisfies the source nearby-party-member applicability condition at the queried time.',
    'Neither teammate event timestamp is inferred from lingyang-standard-rotation. The primitives therefore close no canonical pendingExecutionId by themselves.',
  ],
} as const;

function requireExactlyOneFact<T extends { readonly factId: string }>(
  facts: readonly T[],
  factId: string,
  issues: string[],
): T | null {
  const matches = facts.filter((fact) => fact.factId === factId);
  if (matches.length !== 1) {
    issues.push(`expected exactly one ${factId} fact, got ${matches.length}`);
    return null;
  }
  return matches[0];
}

export function validateLingyangTeamIncomingStateContracts(): readonly string[] {
  const issues: string[] = [];
  const flourish = requireExactlyOneFact(ZHEZHI_PASSIVE_FACTS, LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.flourishFactId, issues);
  const carveAndDraw = requireExactlyOneFact(ZHEZHI_PASSIVE_FACTS, LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.carveAndDrawFactId, issues);
  const binaryButterfly = requireExactlyOneFact(THE_SHOREKEEPER_PASSIVE_FACTS, LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT.sourceFactId, issues);

  if (flourish) {
    if (flourish.scope !== 'NEXT_CHARACTER') issues.push(`Zhezhi Flourish scope drift: ${String(flourish.scope)}`);
    if (!flourish.conditional) issues.push('Zhezhi Flourish must remain conditional');
    if (flourish.durationSeconds !== null) issues.push(`Zhezhi Flourish duration drift: ${String(flourish.durationSeconds)}`);
    if (!flourish.triggerSummary.includes('Outro Skill')) issues.push('Zhezhi Flourish trigger drift');
    if (!flourish.effectSummary.includes('15 Resonance Energy') || !flourish.effectSummary.includes('incoming Resonator')) {
      issues.push('Zhezhi Flourish energy restore wording drift');
    }
  }

  if (carveAndDraw) {
    if (carveAndDraw.scope !== 'NEXT_CHARACTER') issues.push(`Zhezhi Carve and Draw scope drift: ${String(carveAndDraw.scope)}`);
    if (!carveAndDraw.conditional) issues.push('Zhezhi Carve and Draw must remain conditional');
    if (carveAndDraw.durationSeconds !== LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.durationSeconds) {
      issues.push(`Zhezhi Carve and Draw duration drift: ${String(carveAndDraw.durationSeconds)}`);
    }
    if (!carveAndDraw.triggerSummary.includes('Outro Skill')) issues.push('Zhezhi Carve and Draw trigger drift');
    if (!carveAndDraw.effectSummary.includes('Glacio DMG Amplified by 20%')) issues.push('Zhezhi Glacio amplification wording drift');
    if (!carveAndDraw.effectSummary.includes('Resonance Skill DMG Amplified by 25%')) issues.push('Zhezhi Skill amplification wording drift');
    if (!carveAndDraw.effectSummary.includes('ends early') || !carveAndDraw.effectSummary.includes('switched out')) {
      issues.push('Zhezhi switch-out termination wording drift');
    }
  }

  if (binaryButterfly) {
    if (binaryButterfly.scope !== 'TEAM') issues.push(`Shorekeeper Binary Butterfly scope drift: ${String(binaryButterfly.scope)}`);
    if (binaryButterfly.conditional) issues.push('Shorekeeper Binary Butterfly must remain unconditional after its explicit Outro trigger');
    if (binaryButterfly.durationSeconds !== LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT.durationSeconds) {
      issues.push(`Shorekeeper Binary Butterfly duration drift: ${String(binaryButterfly.durationSeconds)}`);
    }
    if (!binaryButterfly.triggerSummary.includes('Outro Skill Binary Butterfly')) issues.push('Shorekeeper Binary Butterfly trigger drift');
    if (!binaryButterfly.effectSummary.includes('nearby party members') || !binaryButterfly.effectSummary.includes('DMG is Amplified by 15%')) {
      issues.push('Shorekeeper Binary Butterfly team amplification wording drift');
    }
  }

  return issues;
}

const CONTRACT_ISSUES = validateLingyangTeamIncomingStateContracts();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Lingyang teammate incoming-state contracts: ${CONTRACT_ISSUES.join('; ')}`);
}

function validateRuntimeTime(label: string, atSeconds: number): void {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`${label} must be a finite non-negative number: ${atSeconds}`);
  }
}

export function activateLingyangZhezhiIncomingState(
  event: LingyangZhezhiOutroSwitchEvent,
): LingyangZhezhiIncomingState | null {
  if (event.kind !== 'OUTRO_SWITCH') throw new Error(`unsupported Zhezhi incoming-state event kind: ${String(event.kind)}`);
  if (!event.actorId.trim()) throw new Error('Zhezhi incoming-state actorId must be non-blank');
  if (!event.incomingResonatorId.trim()) throw new Error('Zhezhi incoming-state incomingResonatorId must be non-blank');
  validateRuntimeTime('Zhezhi Outro switch time', event.atSeconds);

  if (event.actorId !== LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.sourceActorId) return null;
  if (event.incomingResonatorId !== LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.incomingResonatorId) return null;

  return {
    adapterId: 'lingyang-zhezhi-explicit-outro-incoming-state-v1',
    sourceActorId: LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.sourceActorId,
    incomingResonatorId: LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.incomingResonatorId,
    flourishFactId: LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.flourishFactId,
    carveAndDrawFactId: LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.carveAndDrawFactId,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.durationSeconds,
    resonanceEnergyRestoreAmount: LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.resonanceEnergyRestoreAmount,
    glacioDamageAmplification: LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.glacioDamageAmplification,
    resonanceSkillDamageAmplification: LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.resonanceSkillDamageAmplification,
    endsOnIncomingSwitchOut: LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.endsOnIncomingSwitchOut,
  };
}

export function isLingyangZhezhiIncomingAmplificationActive(
  state: LingyangZhezhiIncomingState,
  params: {
    readonly atSeconds: number;
    readonly incomingHasNotSwitchedOut: boolean;
  },
): boolean {
  validateRuntimeTime('Zhezhi incoming-state query time', params.atSeconds);
  if (!params.incomingHasNotSwitchedOut) return false;
  return params.atSeconds >= state.startedAtSeconds && params.atSeconds < state.expiresAtSeconds;
}

export function activateLingyangShorekeeperTeamState(
  event: LingyangShorekeeperOutroSkillEvent,
): LingyangShorekeeperTeamState | null {
  if (event.kind !== 'OUTRO_SKILL_CAST') throw new Error(`unsupported Shorekeeper team-state event kind: ${String(event.kind)}`);
  if (!event.actorId.trim()) throw new Error('Shorekeeper team-state actorId must be non-blank');
  validateRuntimeTime('Shorekeeper Outro time', event.atSeconds);

  if (event.actorId !== LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT.sourceActorId) return null;
  if (event.sourceFactId !== LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT.sourceFactId) {
    throw new Error(`Shorekeeper Binary Butterfly source fact drift: ${String(event.sourceFactId)}`);
  }

  return {
    adapterId: 'lingyang-shorekeeper-explicit-outro-team-state-v1',
    sourceActorId: LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT.sourceActorId,
    beneficiaryId: LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT.beneficiaryId,
    sourceFactId: LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT.sourceFactId,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT.durationSeconds,
    damageAmplification: LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT.damageAmplification,
    requiresNearbyPartyMember: LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT.requiresNearbyPartyMember,
  };
}

export function isLingyangShorekeeperTeamAmplificationActive(
  state: LingyangShorekeeperTeamState,
  params: {
    readonly atSeconds: number;
    readonly lingyangIsNearbyPartyMember: boolean;
  },
): boolean {
  validateRuntimeTime('Shorekeeper team-state query time', params.atSeconds);
  if (!params.lingyangIsNearbyPartyMember) return false;
  return params.atSeconds >= state.startedAtSeconds && params.atSeconds < state.expiresAtSeconds;
}
