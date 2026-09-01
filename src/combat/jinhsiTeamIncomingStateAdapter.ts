export const JINHSI_TEAM_INCOMING_STATE_PRIMITIVE_ID = 'jinhsi-team-incoming-state-v1';

export interface JinhsiTeamSwitchEvent {
  readonly kind: 'OUTRO_SWITCH';
  readonly outgoingActorId: string;
  readonly incomingActorId: string;
  readonly atSeconds: number;
}

export interface ZhezhiCarveAndDrawWindow {
  readonly primitiveId: typeof JINHSI_TEAM_INCOMING_STATE_PRIMITIVE_ID;
  readonly sourceActorId: 'zhezhi';
  readonly incomingActorId: string;
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
  readonly glacioDamageAmplification: 0.20;
  readonly resonanceSkillDamageAmplification: 0.25;
  readonly resonanceEnergyRestored: 15;
}

export type VerinaGiftTrigger =
  | 'HEAVY_STARFLOWER'
  | 'MID_AIR_STARFLOWER'
  | 'RESONANCE_LIBERATION'
  | 'OUTRO';

export interface VerinaGiftOfNatureWindow {
  readonly primitiveId: typeof JINHSI_TEAM_INCOMING_STATE_PRIMITIVE_ID;
  readonly sourceActorId: 'verina';
  readonly trigger: VerinaGiftTrigger;
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
  readonly teamAttackBonus: 0.20;
}

export interface VerinaBlossomWindow {
  readonly primitiveId: typeof JINHSI_TEAM_INCOMING_STATE_PRIMITIVE_ID;
  readonly sourceActorId: 'verina';
  readonly incomingActorId: string;
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
  readonly nearbyTeamDamageAmplification: 0.15;
  readonly incomingHealDurationSeconds: 6;
}

function finiteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a finite non-negative number: ${value}`);
}

function nonBlank(value: string, label: string): void {
  if (!value.trim()) throw new Error(`${label} must be non-blank`);
}

/**
 * Resolve only the source-explicit Zhezhi Outro transfer from a caller-supplied
 * switch event. No canonical predecessor rotation or automatic opener carry-in
 * is implied by this primitive.
 */
export function applyZhezhiOutroToIncoming(
  event: JinhsiTeamSwitchEvent,
): ZhezhiCarveAndDrawWindow | null {
  nonBlank(event.outgoingActorId, 'Zhezhi Outro outgoing actorId');
  nonBlank(event.incomingActorId, 'Zhezhi Outro incoming actorId');
  finiteNonNegative(event.atSeconds, 'Zhezhi Outro switch time');
  if (event.kind !== 'OUTRO_SWITCH') throw new Error(`unsupported team switch event kind: ${String(event.kind)}`);
  if (event.outgoingActorId !== 'zhezhi' || event.incomingActorId === event.outgoingActorId) return null;

  return {
    primitiveId: JINHSI_TEAM_INCOMING_STATE_PRIMITIVE_ID,
    sourceActorId: 'zhezhi',
    incomingActorId: event.incomingActorId,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + 14,
    glacioDamageAmplification: 0.20,
    resonanceSkillDamageAmplification: 0.25,
    resonanceEnergyRestored: 15,
  };
}

export function isZhezhiCarveAndDrawActive(
  window: ZhezhiCarveAndDrawWindow,
  actorId: string,
  atSeconds: number,
): boolean {
  nonBlank(actorId, 'Zhezhi Outro query actorId');
  finiteNonNegative(atSeconds, 'Zhezhi Outro query time');
  return actorId === window.incomingActorId
    && atSeconds >= window.startedAtSeconds
    && atSeconds < window.expiresAtSeconds;
}

/** Source says Carve and Draw ends early when the incoming Resonator switches out. */
export function endZhezhiCarveAndDrawOnSwitch(params: {
  readonly window: ZhezhiCarveAndDrawWindow;
  readonly outgoingActorId: string;
  readonly incomingActorId: string;
  readonly atSeconds: number;
}): ZhezhiCarveAndDrawWindow {
  const { window, outgoingActorId, incomingActorId, atSeconds } = params;
  nonBlank(outgoingActorId, 'Carve and Draw outgoing actorId');
  nonBlank(incomingActorId, 'Carve and Draw next incoming actorId');
  finiteNonNegative(atSeconds, 'Carve and Draw switch time');
  if (outgoingActorId !== window.incomingActorId || incomingActorId === outgoingActorId) return window;
  if (atSeconds < window.startedAtSeconds) throw new Error('Carve and Draw cannot end before it starts');
  return { ...window, expiresAtSeconds: Math.min(window.expiresAtSeconds, atSeconds) };
}

/**
 * Resolve Gift of Nature from one explicit Verina action. This function does
 * not decide whether the canonical Jinhsi predecessor performed such an action.
 */
export function applyVerinaGiftOfNature(params: {
  readonly actorId: string;
  readonly trigger: VerinaGiftTrigger;
  readonly atSeconds: number;
}): VerinaGiftOfNatureWindow | null {
  const { actorId, trigger, atSeconds } = params;
  nonBlank(actorId, 'Gift of Nature actorId');
  finiteNonNegative(atSeconds, 'Gift of Nature trigger time');
  if (actorId !== 'verina') return null;
  if (!['HEAVY_STARFLOWER', 'MID_AIR_STARFLOWER', 'RESONANCE_LIBERATION', 'OUTRO'].includes(trigger)) {
    throw new Error(`unsupported Gift of Nature trigger: ${String(trigger)}`);
  }
  return {
    primitiveId: JINHSI_TEAM_INCOMING_STATE_PRIMITIVE_ID,
    sourceActorId: 'verina',
    trigger,
    startedAtSeconds: atSeconds,
    expiresAtSeconds: atSeconds + 20,
    teamAttackBonus: 0.20,
  };
}

/**
 * Resolve only Verina Outro Blossom from an explicit Verina->incoming switch.
 * The 6s heal is represented as duration metadata; no healing amount is folded
 * into Jinhsi damage or Energy logic.
 */
export function applyVerinaOutroBlossom(
  event: JinhsiTeamSwitchEvent,
): VerinaBlossomWindow | null {
  nonBlank(event.outgoingActorId, 'Verina Outro outgoing actorId');
  nonBlank(event.incomingActorId, 'Verina Outro incoming actorId');
  finiteNonNegative(event.atSeconds, 'Verina Outro switch time');
  if (event.kind !== 'OUTRO_SWITCH') throw new Error(`unsupported team switch event kind: ${String(event.kind)}`);
  if (event.outgoingActorId !== 'verina' || event.incomingActorId === event.outgoingActorId) return null;
  return {
    primitiveId: JINHSI_TEAM_INCOMING_STATE_PRIMITIVE_ID,
    sourceActorId: 'verina',
    incomingActorId: event.incomingActorId,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + 30,
    nearbyTeamDamageAmplification: 0.15,
    incomingHealDurationSeconds: 6,
  };
}

export function isVerinaGiftOfNatureActive(window: VerinaGiftOfNatureWindow, atSeconds: number): boolean {
  finiteNonNegative(atSeconds, 'Gift of Nature query time');
  return atSeconds >= window.startedAtSeconds && atSeconds < window.expiresAtSeconds;
}

export function isVerinaBlossomAmplificationActive(window: VerinaBlossomWindow, atSeconds: number): boolean {
  finiteNonNegative(atSeconds, 'Blossom query time');
  return atSeconds >= window.startedAtSeconds && atSeconds < window.expiresAtSeconds;
}

export const JINHSI_TEAM_INCOMING_EXECUTION_SEMANTIC_REVIEW = {
  primitiveId: JINHSI_TEAM_INCOMING_STATE_PRIMITIVE_ID,
  reviewedAt: '2026-09-01',
  pendingExecutionId: 'team:jinhsi-zhezhi-verina:incoming-state-adapter',
  closesPendingExecutionIds: [] as readonly string[],
  requiresExplicitPredecessorEvents: true,
  notes: [
    'Zhezhi Outro transfer is executable from an explicit outgoing->incoming event: +15 Resonance Energy immediately, +20% Glacio DMG Amplification and +25% Resonance Skill DMG Amplification for 14s, ending early when the incoming Resonator switches out.',
    'Verina Gift of Nature is executable from an explicit source action as +20% team ATK for 20s. Verina Outro Blossom is executable from an explicit Verina->incoming event as +15% nearby-team DMG Amplification for 30s; its 6s incoming heal remains separate metadata.',
    'The canonical Jinhsi Standard Opener begins at Jinhsi Basic P1 and supplies no Zhezhi/Verina predecessor actions or timestamps, so no teammate window is automatically active and the profile dependency remains pending.',
  ],
} as const;
