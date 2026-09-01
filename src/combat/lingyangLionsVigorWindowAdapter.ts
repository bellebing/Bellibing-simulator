import { LINGYANG_PASSIVE_FACTS } from '../data/characterMechanics/lingyangRawFacts.ts';

export interface LingyangLiberationCastEvent {
  readonly kind: 'RESONANCE_LIBERATION_CAST';
  readonly actorId: string;
  readonly atSeconds: number;
  readonly actionFactId: 'lingyang-liberation-strive-lions-vigor';
}

export interface ActiveLingyangLionsVigorWindow {
  readonly adapterId: 'lingyang-lions-vigor-timed-self-window-v1';
  readonly actorId: string;
  readonly factId: 'lingyang-liberation-lions-vigor';
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
  readonly glacioDamageBonus: 0.5;
  readonly lionsSpiritConsumptionMultiplierDuringStridingLion: 0.5;
}

export const LINGYANG_LIONS_VIGOR_WINDOW_CONTRACT = {
  factId: 'lingyang-liberation-lions-vigor',
  triggerActionFactId: 'lingyang-liberation-strive-lions-vigor',
  durationSeconds: 14,
  glacioDamageBonus: 0.5,
  lionsSpiritConsumptionMultiplierDuringStridingLion: 0.5,
} as const;

export const LINGYANG_LIONS_VIGOR_WINDOW_SEMANTIC_REVIEW = {
  status: 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE',
  blockerId: 'BUG-017',
  reviewedAt: '2026-09-01',
  primitiveId: 'lingyang-lions-vigor-timed-self-window-v1',
  contributesToPendingExecutionIds: [
    'character:lingyang:striding-lion-resource-state-adapter',
    'rotation:lingyang-standard-rotation:engine-model',
  ] as const,
  closesPendingExecutionIds: [] as readonly string[],
  sourceEstablished: [
    "Casting Resonance Liberation Strive: Lion's Vigor grants Lion's Vigor.",
    'Lion’s Vigor grants 50% Glacio DMG Bonus for 14s.',
    "While Lion's Vigor is active, Lion's Spirit consumption during Striding Lion is reduced by 50%.",
  ],
  notes: [
    'The adapter activates only from an explicit owner Resonance Liberation cast event for the canonical Lingyang Liberation action.',
    'Window activity follows the existing Bellibing timed-window convention: start-inclusive and expiry-exclusive. This is an execution convention for an exact 14-second source duration, not a claim about hidden frame timing.',
    'The primitive does not infer the Liberation cast timestamp from source-sequence order and does not close the profile resource/timeline dependencies by itself.',
    'A caller may use the 0.5 Spirit-consumption multiplier only where it independently proves that the evaluated Striding Lion segment lies inside this active window.',
  ],
} as const;

export function validateLingyangLionsVigorWindowContract(): readonly string[] {
  const issues: string[] = [];
  const matches = LINGYANG_PASSIVE_FACTS.filter((fact) => fact.factId === LINGYANG_LIONS_VIGOR_WINDOW_CONTRACT.factId);
  if (matches.length !== 1) {
    issues.push(`expected exactly one ${LINGYANG_LIONS_VIGOR_WINDOW_CONTRACT.factId} fact, got ${matches.length}`);
    return issues;
  }

  const fact = matches[0];
  if (fact.scope !== 'SELF') issues.push(`Lion's Vigor scope drift: ${String(fact.scope)}`);
  if (!fact.conditional) issues.push("Lion's Vigor must remain conditional");
  if (fact.durationSeconds !== LINGYANG_LIONS_VIGOR_WINDOW_CONTRACT.durationSeconds) {
    issues.push(`Lion's Vigor duration drift: ${String(fact.durationSeconds)}`);
  }
  if (!fact.triggerSummary.includes("Resonance Liberation") || !fact.triggerSummary.includes("Lion's Vigor")) {
    issues.push("Lion's Vigor trigger summary drift");
  }
  if (!fact.effectSummary.includes('50% Glacio DMG Bonus')) issues.push("Lion's Vigor Glacio bonus wording drift");
  if (!fact.effectSummary.includes('reduced by 50%')) issues.push("Lion's Vigor consumption reduction wording drift");
  if (fact.modelingStatus !== 'PENDING_INTERPRETATION') {
    issues.push(`Lion's Vigor modeling status drift: ${fact.modelingStatus}`);
  }
  return issues;
}

const CONTRACT_ISSUES = validateLingyangLionsVigorWindowContract();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Lingyang Lion's Vigor window contract: ${CONTRACT_ISSUES.join('; ')}`);
}

export function activateLingyangLionsVigorWindow(params: {
  readonly ownerId: string;
  readonly event: LingyangLiberationCastEvent;
}): ActiveLingyangLionsVigorWindow | null {
  const { ownerId, event } = params;
  if (!ownerId.trim()) throw new Error("Lion's Vigor ownerId must be non-blank");
  if (!event.actorId.trim()) throw new Error("Lion's Vigor event actorId must be non-blank");
  if (!Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error(`Lion's Vigor cast time must be a finite non-negative number: ${event.atSeconds}`);
  }
  if (event.actorId !== ownerId) return null;
  if (event.actionFactId !== LINGYANG_LIONS_VIGOR_WINDOW_CONTRACT.triggerActionFactId) {
    throw new Error(`Lion's Vigor trigger action drift: ${event.actionFactId}`);
  }

  return {
    adapterId: 'lingyang-lions-vigor-timed-self-window-v1',
    actorId: ownerId,
    factId: LINGYANG_LIONS_VIGOR_WINDOW_CONTRACT.factId,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + LINGYANG_LIONS_VIGOR_WINDOW_CONTRACT.durationSeconds,
    glacioDamageBonus: LINGYANG_LIONS_VIGOR_WINDOW_CONTRACT.glacioDamageBonus,
    lionsSpiritConsumptionMultiplierDuringStridingLion: LINGYANG_LIONS_VIGOR_WINDOW_CONTRACT.lionsSpiritConsumptionMultiplierDuringStridingLion,
  };
}

export function isLingyangLionsVigorWindowActive(
  window: ActiveLingyangLionsVigorWindow,
  atSeconds: number,
): boolean {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`Lion's Vigor window query time must be a finite non-negative number: ${atSeconds}`);
  }
  return atSeconds >= window.startedAtSeconds && atSeconds < window.expiresAtSeconds;
}
