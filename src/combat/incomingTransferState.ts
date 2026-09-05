export type IncomingEntryKind = 'INTRO_SKILL' | 'DIRECT_SWITCH';

export interface OutgoingSwitchEvent {
  readonly kind: 'OUTRO_SWITCH';
  readonly actorId: string;
  readonly incomingResonatorId: string;
  readonly incomingEntry: IncomingEntryKind;
  readonly atSeconds: number;
}

export interface ResonatorSwitchOutEvent {
  readonly kind: 'RESONATOR_SWITCH_OUT';
  readonly actorId: string;
  readonly atSeconds: number;
}

export interface IncomingTransferSpec {
  readonly adapterId: string;
  readonly sourceLayer: 'CHARACTER' | 'ECHO' | 'SONATA' | 'WEAPON';
  readonly effectId: string;
  readonly sourceId: string;
  readonly sourceActorId: string;
  readonly statOrEffect: string;
  readonly value: number;
  readonly durationSeconds: number;
  readonly requiresIncomingIntro: boolean;
  readonly endsOnIncomingSwitchOut?: boolean;
  readonly armedAtSeconds?: number;
  readonly activationWindowSeconds?: number;
}

export interface IncomingTransferWindow {
  readonly coreId: 'incoming-transfer-state-v1';
  readonly adapterId: string;
  readonly sourceLayer: IncomingTransferSpec['sourceLayer'];
  readonly effectId: string;
  readonly sourceId: string;
  readonly sourceActorId: string;
  readonly incomingResonatorId: string;
  readonly statOrEffect: string;
  readonly value: number;
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
  readonly endsOnIncomingSwitchOut: boolean;
}

function finiteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite non-negative number: ${value}`);
  }
}

function nonBlank(value: string, label: string): void {
  if (!value.trim()) throw new Error(`${label} must not be blank`);
}

function validateSwitchOutEvent(event: ResonatorSwitchOutEvent): void {
  if (event.kind !== 'RESONATOR_SWITCH_OUT') {
    throw new Error(`unsupported Resonator switch-out event kind: ${String(event.kind)}`);
  }
  nonBlank(event.actorId, 'switch-out actor id');
  finiteNonNegative(event.atSeconds, 'switch-out time');
}

/**
 * Shared low-level state primitive for effects that transfer from an outgoing
 * actor to the actual incoming Resonator.
 *
 * This function deliberately knows nothing about Character/Echo/Sonata/Weapon
 * source prose. Layer adapters must prove their own trigger/prerequisite and
 * termination semantics and pass explicit, already-resolved events here.
 */
export function createIncomingTransferWindow(
  spec: IncomingTransferSpec,
  event: OutgoingSwitchEvent,
): IncomingTransferWindow | null {
  nonBlank(spec.adapterId, 'transfer adapter id');
  nonBlank(spec.effectId, 'transfer effect id');
  nonBlank(spec.sourceId, 'transfer source id');
  nonBlank(spec.sourceActorId, 'transfer source actor id');
  nonBlank(spec.statOrEffect, 'transfer stat/effect');
  nonBlank(event.actorId, 'outgoing actor id');
  nonBlank(event.incomingResonatorId, 'incoming Resonator id');
  finiteNonNegative(event.atSeconds, 'outgoing switch time');

  if (event.kind !== 'OUTRO_SWITCH') throw new Error(`unsupported outgoing transfer event kind: ${String(event.kind)}`);
  if (event.incomingEntry !== 'INTRO_SKILL' && event.incomingEntry !== 'DIRECT_SWITCH') {
    throw new Error(`unsupported incoming entry kind: ${String(event.incomingEntry)}`);
  }
  if (
    spec.sourceLayer !== 'CHARACTER'
    && spec.sourceLayer !== 'ECHO'
    && spec.sourceLayer !== 'SONATA'
    && spec.sourceLayer !== 'WEAPON'
  ) {
    throw new Error(`unsupported transfer source layer: ${String(spec.sourceLayer)}`);
  }
  if (typeof spec.requiresIncomingIntro !== 'boolean') {
    throw new Error('requiresIncomingIntro must be boolean');
  }
  if (spec.endsOnIncomingSwitchOut !== undefined && typeof spec.endsOnIncomingSwitchOut !== 'boolean') {
    throw new Error('endsOnIncomingSwitchOut must be boolean when provided');
  }
  if (!Number.isFinite(spec.value)) throw new Error(`transfer value must be finite: ${spec.value}`);
  if (!Number.isFinite(spec.durationSeconds) || spec.durationSeconds <= 0) {
    throw new Error(`transfer duration must be a positive finite number: ${spec.durationSeconds}`);
  }
  if ((spec.armedAtSeconds === undefined) !== (spec.activationWindowSeconds === undefined)) {
    throw new Error('transfer arming time and activation window must be provided together');
  }
  if (spec.armedAtSeconds !== undefined && spec.activationWindowSeconds !== undefined) {
    finiteNonNegative(spec.armedAtSeconds, 'transfer arming time');
    if (!Number.isFinite(spec.activationWindowSeconds) || spec.activationWindowSeconds <= 0) {
      throw new Error(`transfer activation window must be a positive finite number: ${spec.activationWindowSeconds}`);
    }
    if (event.atSeconds < spec.armedAtSeconds) return null;
    if (event.atSeconds > spec.armedAtSeconds + spec.activationWindowSeconds) return null;
  }

  if (event.actorId !== spec.sourceActorId) return null;
  if (event.incomingResonatorId === event.actorId) return null;
  if (spec.requiresIncomingIntro && event.incomingEntry !== 'INTRO_SKILL') return null;

  return {
    coreId: 'incoming-transfer-state-v1',
    adapterId: spec.adapterId,
    sourceLayer: spec.sourceLayer,
    effectId: spec.effectId,
    sourceId: spec.sourceId,
    sourceActorId: spec.sourceActorId,
    incomingResonatorId: event.incomingResonatorId,
    statOrEffect: spec.statOrEffect,
    value: spec.value,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + spec.durationSeconds,
    endsOnIncomingSwitchOut: spec.endsOnIncomingSwitchOut ?? false,
  };
}

export function incomingTransferEffectiveEndSeconds(
  window: IncomingTransferWindow,
  switchOutEvents: readonly ResonatorSwitchOutEvent[] = [],
): number {
  if (!window.endsOnIncomingSwitchOut) return window.expiresAtSeconds;

  let effectiveEndSeconds = window.expiresAtSeconds;
  for (const event of switchOutEvents) {
    validateSwitchOutEvent(event);
    if (
      event.actorId === window.incomingResonatorId
      && event.atSeconds >= window.startedAtSeconds
      && event.atSeconds < effectiveEndSeconds
    ) {
      effectiveEndSeconds = event.atSeconds;
    }
  }
  return effectiveEndSeconds;
}

export function isIncomingTransferWindowActive(
  window: IncomingTransferWindow,
  actorId: string,
  atSeconds: number,
  switchOutEvents: readonly ResonatorSwitchOutEvent[] = [],
): boolean {
  nonBlank(actorId, 'transfer query actor id');
  finiteNonNegative(atSeconds, 'transfer query time');
  const effectiveEndSeconds = incomingTransferEffectiveEndSeconds(window, switchOutEvents);
  return actorId === window.incomingResonatorId
    && atSeconds >= window.startedAtSeconds
    && atSeconds < effectiveEndSeconds;
}
