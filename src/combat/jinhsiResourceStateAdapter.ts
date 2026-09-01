export const JINHSI_RESOURCE_STATE_PRIMITIVE_ID = 'jinhsi-resource-state-v1';

export type JinhsiAttribute = 'Glacio' | 'Fusion' | 'Electro' | 'Aero' | 'Spectro' | 'Havoc';

type LastTriggerByAttribute = Readonly<Partial<Record<JinhsiAttribute, number | null>>>;

export interface JinhsiResourceState {
  readonly primitiveId: typeof JINHSI_RESOURCE_STATE_PRIMITIVE_ID;
  readonly incandescence: number;
  /**
   * Explicit predecessor state. Missing keys are unknown, never implicitly ready.
   * null means the caller has proved that this cadence has not triggered yet.
   */
  readonly lastAttributeDamageTriggerAtSeconds: LastTriggerByAttribute;
  readonly lastCoordinatedAttackTriggerAtSeconds: LastTriggerByAttribute;
  readonly temporalBenderExpiresAtSeconds: number | null;
  readonly unisonAvailable: boolean;
  /** Exact earliest timestamp at which Illuminous Epiphany may grant Unison again. */
  readonly unisonNextGrantReadyAtSeconds: number;
}

export interface JinhsiPartyDamageEvent {
  readonly kind: 'PARTY_ATTRIBUTE_DAMAGE';
  readonly attribute: JinhsiAttribute;
  readonly coordinatedAttack: boolean;
  readonly atSeconds: number;
}

export interface JinhsiIncandescenceGainResult {
  readonly state: JinhsiResourceState;
  readonly attributeDamageGain: 0 | 1;
  readonly coordinatedAttackGain: 0 | 2;
  readonly totalGainBeforeCap: number;
  readonly actualGain: number;
}

export interface JinhsiIlluminousConsumeResult {
  readonly state: JinhsiResourceState;
  readonly consumedIncandescence: number;
  readonly additionalStellaGlamorMotionValue: number;
  readonly perPointMotionValue: number;
}

export interface JinhsiUnisonGrantResult {
  readonly state: JinhsiResourceState;
  readonly granted: boolean;
}

export interface JinhsiUnisonSwitchResult {
  readonly state: JinhsiResourceState;
  readonly consumedUnison: boolean;
  readonly triggersJinhsiOutro: boolean;
  readonly triggersIncomingIntro: boolean;
  readonly concertoConsumptionAuthorizedByThisPrimitive: false;
}

const INCANDESCENCE_MAX = 50;
const BASE_ERAS_CADENCE_SECONDS = 3;
const TEMPORAL_BENDER_CADENCE_SECONDS = 1;
const TEMPORAL_BENDER_DURATION_SECONDS = 20;
const UNISON_TRIGGER_CADENCE_SECONDS = 25;

const INCANDESCENCE_PER_POINT_MOTION_VALUE = [
  0.2240,
  0.2424,
  0.2608,
  0.2865,
  0.3049,
  0.3260,
  0.3554,
  0.3848,
  0.4142,
  0.4454,
] as const;

function finiteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a finite non-negative number: ${value}`);
}

function integerInRange(value: number, minimum: number, maximum: number, label: string): void {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${label} must be an integer from ${minimum} through ${maximum}: ${value}`);
  }
}

function knownLastTrigger(
  map: LastTriggerByAttribute,
  attribute: JinhsiAttribute,
  label: string,
): number | null {
  if (!(attribute in map)) {
    throw new Error(`${label} predecessor cadence for ${attribute} is unresolved`);
  }
  const value = map[attribute];
  if (value === undefined) {
    throw new Error(`${label} predecessor cadence for ${attribute} is unresolved`);
  }
  if (value !== null) finiteNonNegative(value, `${label} last trigger time`);
  return value;
}

function cadenceReady(lastTriggerAtSeconds: number | null, atSeconds: number, cadenceSeconds: number): boolean {
  return lastTriggerAtSeconds === null || atSeconds - lastTriggerAtSeconds >= cadenceSeconds;
}

function withTrigger(
  map: LastTriggerByAttribute,
  attribute: JinhsiAttribute,
  atSeconds: number,
): LastTriggerByAttribute {
  return { ...map, [attribute]: atSeconds };
}

export function createKnownJinhsiResourceState(params: {
  readonly incandescence: number;
  readonly lastAttributeDamageTriggerAtSeconds: LastTriggerByAttribute;
  readonly lastCoordinatedAttackTriggerAtSeconds: LastTriggerByAttribute;
  readonly temporalBenderExpiresAtSeconds: number | null;
  readonly unisonAvailable: boolean;
  readonly unisonNextGrantReadyAtSeconds: number;
}): JinhsiResourceState {
  integerInRange(params.incandescence, 0, INCANDESCENCE_MAX, 'Jinhsi Incandescence');
  if (params.temporalBenderExpiresAtSeconds !== null) finiteNonNegative(params.temporalBenderExpiresAtSeconds, 'Temporal Bender expiry');
  finiteNonNegative(params.unisonNextGrantReadyAtSeconds, 'Unison next-grant time');
  if (typeof params.unisonAvailable !== 'boolean') throw new Error('Unison availability must be boolean');

  return {
    primitiveId: JINHSI_RESOURCE_STATE_PRIMITIVE_ID,
    ...params,
  };
}

/**
 * Apply one explicit party damage event to Eras in Unity.
 *
 * The two source effects are independent: Attribute DMG may grant 1 and a
 * Coordinated Attack of that Attribute may independently grant 2. Temporal
 * Bender changes the same-Attribute cadence from 3s to 1s for its 20s window.
 * Missing predecessor cadence for the event Attribute fails closed.
 */
export function applyJinhsiPartyDamageEvent(
  state: JinhsiResourceState,
  event: JinhsiPartyDamageEvent,
): JinhsiIncandescenceGainResult {
  finiteNonNegative(event.atSeconds, 'party damage event time');
  if (typeof event.coordinatedAttack !== 'boolean') throw new Error('coordinatedAttack must be boolean');

  const temporalBenderActive = state.temporalBenderExpiresAtSeconds !== null
    && event.atSeconds < state.temporalBenderExpiresAtSeconds;
  const cadenceSeconds = temporalBenderActive
    ? TEMPORAL_BENDER_CADENCE_SECONDS
    : BASE_ERAS_CADENCE_SECONDS;

  const lastAttribute = knownLastTrigger(
    state.lastAttributeDamageTriggerAtSeconds,
    event.attribute,
    'Attribute-DMG Incandescence',
  );
  const attributeDamageGain: 0 | 1 = cadenceReady(lastAttribute, event.atSeconds, cadenceSeconds) ? 1 : 0;

  let coordinatedAttackGain: 0 | 2 = 0;
  let lastCoordinatedAttackTriggerAtSeconds = state.lastCoordinatedAttackTriggerAtSeconds;
  if (event.coordinatedAttack) {
    const lastCoordinated = knownLastTrigger(
      state.lastCoordinatedAttackTriggerAtSeconds,
      event.attribute,
      'Coordinated-Attack Incandescence',
    );
    coordinatedAttackGain = cadenceReady(lastCoordinated, event.atSeconds, cadenceSeconds) ? 2 : 0;
    if (coordinatedAttackGain > 0) {
      lastCoordinatedAttackTriggerAtSeconds = withTrigger(
        lastCoordinatedAttackTriggerAtSeconds,
        event.attribute,
        event.atSeconds,
      );
    }
  }

  const totalGainBeforeCap = attributeDamageGain + coordinatedAttackGain;
  const nextIncandescence = Math.min(INCANDESCENCE_MAX, state.incandescence + totalGainBeforeCap);
  const actualGain = nextIncandescence - state.incandescence;

  return {
    state: {
      ...state,
      incandescence: nextIncandescence,
      lastAttributeDamageTriggerAtSeconds: attributeDamageGain > 0
        ? withTrigger(state.lastAttributeDamageTriggerAtSeconds, event.attribute, event.atSeconds)
        : state.lastAttributeDamageTriggerAtSeconds,
      lastCoordinatedAttackTriggerAtSeconds,
    },
    attributeDamageGain,
    coordinatedAttackGain,
    totalGainBeforeCap,
    actualGain,
  };
}

/** Activates only the source-defined 20s Eras in Unity cadence acceleration. */
export function activateJinhsiTemporalBender(
  state: JinhsiResourceState,
  atSeconds: number,
): JinhsiResourceState {
  finiteNonNegative(atSeconds, 'Temporal Bender activation time');
  return {
    ...state,
    temporalBenderExpiresAtSeconds: atSeconds + TEMPORAL_BENDER_DURATION_SECONDS,
  };
}

/**
 * Consume the actually known Incandescence amount for Illuminous Epiphany and
 * resolve only the source-defined additional Stella Glamor motion value.
 */
export function consumeJinhsiIncandescenceForIlluminous(
  state: JinhsiResourceState,
  skillLevel: number,
): JinhsiIlluminousConsumeResult {
  integerInRange(skillLevel, 1, 10, 'Jinhsi Forte skill level');
  const perPointMotionValue = INCANDESCENCE_PER_POINT_MOTION_VALUE[skillLevel - 1]!;
  const consumedIncandescence = Math.min(INCANDESCENCE_MAX, state.incandescence);
  return {
    state: { ...state, incandescence: 0 },
    consumedIncandescence,
    perPointMotionValue,
    additionalStellaGlamorMotionValue: consumedIncandescence * perPointMotionValue,
  };
}

/**
 * Illuminous Epiphany may grant one Unison only when the caller-provided
 * predecessor cadence proves the 25s trigger is ready.
 */
export function applyJinhsiIlluminousEpiphanyForUnison(
  state: JinhsiResourceState,
  atSeconds: number,
): JinhsiUnisonGrantResult {
  finiteNonNegative(atSeconds, 'Illuminous Epiphany time');
  if (atSeconds < state.unisonNextGrantReadyAtSeconds) return { state, granted: false };
  return {
    state: {
      ...state,
      unisonAvailable: true,
      unisonNextGrantReadyAtSeconds: atSeconds + UNISON_TRIGGER_CADENCE_SECONDS,
    },
    granted: true,
  };
}

/**
 * Models only the source-explicit Unison switch path. Normal full-Concerto
 * Outro behavior stays outside this primitive and is never inferred here.
 */
export function consumeJinhsiUnisonOnSwitch(params: {
  readonly state: JinhsiResourceState;
  readonly outgoingActorId: string;
  readonly incomingActorId: string;
  readonly atSeconds: number;
}): JinhsiUnisonSwitchResult {
  const { state, outgoingActorId, incomingActorId, atSeconds } = params;
  finiteNonNegative(atSeconds, 'Unison switch time');
  if (!outgoingActorId.trim() || !incomingActorId.trim()) throw new Error('Unison switch actor ids must be non-blank');
  if (outgoingActorId !== 'jinhsi' || incomingActorId === outgoingActorId || !state.unisonAvailable) {
    return {
      state,
      consumedUnison: false,
      triggersJinhsiOutro: false,
      triggersIncomingIntro: false,
      concertoConsumptionAuthorizedByThisPrimitive: false,
    };
  }
  return {
    state: { ...state, unisonAvailable: false },
    consumedUnison: true,
    triggersJinhsiOutro: true,
    triggersIncomingIntro: true,
    concertoConsumptionAuthorizedByThisPrimitive: false,
  };
}

export const JINHSI_RESOURCE_EXECUTION_SEMANTIC_REVIEW = {
  primitiveId: JINHSI_RESOURCE_STATE_PRIMITIVE_ID,
  reviewedAt: '2026-09-01',
  pendingExecutionIds: [
    'character:jinhsi:jinhsi-forte-incandescence-damage-multiplier:resource-timeline-adapter',
    'character:jinhsi:jinhsi-resource-unison:availability-adapter',
  ],
  closesPendingExecutionIds: [] as readonly string[],
  requiresKnownPredecessorState: true,
  notes: [
    'Incandescence generation/consume and the exact per-point Stella Glamor multiplier are executable from explicit party-damage events plus known predecessor cadence state.',
    'Unison gain/consume is executable from explicit Illuminous Epiphany and switch events plus a known 25-second predecessor cooldown state.',
    'The canonical Standard Opener still does not provide starting Incandescence, per-Attribute cadence history, or Unison cooldown history, so neither profile dependency closes.',
  ],
} as const;
