import { getCharacterMechanicFact } from '../data/characterMechanics.ts';
import { evaluateRoverWindstringsGain, evaluateRoverWindstringsSpend, readRoverWindstringsResource,
  listRoverWindstringsGainSupport, listRoverWindstringsSpendSupport,
  type RoverWindstringsGainInput, type RoverWindstringsSpendInput } from './roverWindstringsGainAdapter.ts';

export const ROVER_WINDSTRINGS_LEDGER_ID = 'rover-windstrings-ordered-fragment-v1';
const PROFILE_ID = 'rover-aero-cartethyia-ciaccona';
const RESOURCE_ID = 'rover-aero-resource-windstrings';

/** Identity-only discovery for this existing preset; no second numeric fact table. */
export function listRoverWindstringsLedgerSupport() {
  return [{ primitiveId: ROVER_WINDSTRINGS_LEDGER_ID, presetId: PROFILE_ID, characterId: 'rover-aero',
    resourceFactId: RESOURCE_ID, gainActionFactIds: listRoverWindstringsGainSupport().map(row => row.actionFactId),
    spendActionFactIds: listRoverWindstringsSpendSupport().map(row => row.actionFactId),
    scope: 'PARTIAL_PROFILE_RESOURCE_FRAGMENT' as const, sequence: 0 as const, skillLevel: 10 as const,
    initialState: 'EXPLICIT_PROVEN_OR_UNKNOWN' as const, overflow: 'UNSUPPORTED_PENDING' as const,
    offField: 'UNSUPPORTED' as const, authorizesProfileExecution: false as const }];
}

type InitialState = { readonly status: 'UNKNOWN' } | {
  readonly status: 'PROVEN'; readonly value: number; readonly atSeconds: number;
  readonly sourceQualified: true; readonly evidenceId: string;
};

type OrderedEvent = { readonly eventId: string; readonly order: number } & (
  { readonly kind: 'GAIN'; readonly input: RoverWindstringsGainInput }
  | { readonly kind: 'SPEND'; readonly input: RoverWindstringsSpendInput;
      /** Distinguishes one actual Unbound Flow activation from a later one. */
      readonly chainId: string; readonly continuationQualified: true }
);

export interface RoverWindstringsLedgerInput {
  readonly presetId: typeof PROFILE_ID;
  readonly initial: InitialState;
  readonly events: readonly OrderedEvent[];
  /** Caller proves a continuous on-field fragment with every Windstrings mutation
   * present, and the supplied order at any equal timestamps. No reset or omitted spend. */
  readonly boundary: { readonly onFieldThroughout: true; readonly completeWindstringsEvents: true;
    readonly eventOrderProven: true; readonly evidenceId: string };
}

type PendingReason = 'INITIAL_WINDSTRINGS_UNKNOWN' | 'OVERFLOW_SEMANTICS_REQUIRED'
  | 'UNBOUND_FLOW_REQUIRES_MAXIMUM' | 'UNBOUND_FLOW_CONTINUATION_REQUIRED'
  | 'INSUFFICIENT_STORED_WINDSTRINGS';

/** A selected-profile resource fragment, never a full profile execution result.
 * Unknown overflow is a stop boundary, not Math.min(maximum, value).
 * No sourceSequence parsing, timestamp generation, off-field model, ER or DPS. */
export function evaluateRoverWindstringsLedger(input: RoverWindstringsLedgerInput) {
  const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
  const finiteTime = (value: number) => Number.isFinite(value) && value >= 0;
  if (input.presetId !== PROFILE_ID || input.boundary?.onFieldThroughout !== true
    || input.boundary.completeWindstringsEvents !== true || input.boundary.eventOrderProven !== true
    || !text(input.boundary.evidenceId) || !Array.isArray(input.events) || !input.events.length) {
    throw new Error('Require exact Rover profile and proven complete ordered on-field fragment');
  }
  const source = readRoverWindstringsResource(getCharacterMechanicFact(RESOURCE_ID)!);
  const initial = input.initial;
  if (!initial || (initial.status !== 'UNKNOWN' && initial.status !== 'PROVEN')) throw new Error('Explicit initial state required');
  if (initial.status === 'PROVEN' && (!Number.isSafeInteger(initial.value) || initial.value < 0
    || initial.value > source.maximum || !finiteTime(initial.atSeconds) || initial.sourceQualified !== true
    || !text(initial.evidenceId))) throw new Error('Invalid proven initial Windstrings');
  if (initial.status === 'UNKNOWN' && ['value', 'atSeconds', 'sourceQualified'].some(key => Object.hasOwn(initial, key))) {
    throw new Error('Unknown initial state must not contain an implied resource value');
  }

  const ids = new Set<string>();
  let previousOrder = -1;
  let previousTime = initial.status === 'PROVEN' ? initial.atSeconds : 0;
  // Validate the entire event contract, even if initial state or a later transition blocks execution.
  const events = input.events.map(event => {
    if (!text(event.eventId) || ids.has(event.eventId) || !Number.isSafeInteger(event.order)
      || event.order < 0 || event.order <= previousOrder || !event.input?.event
      || !finiteTime(event.input.event.atSeconds) || event.input.event.atSeconds < previousTime) {
      throw new Error('Require unique events in proven chronological/order sequence');
    }
    ids.add(event.eventId); previousOrder = event.order; previousTime = event.input.event.atSeconds;
    if (event.kind === 'GAIN') return { event, result: evaluateRoverWindstringsGain(event.input) };
    if (event.kind !== 'SPEND' || !text(event.chainId) || event.continuationQualified !== true) {
      throw new Error('Require source-qualified Unbound Flow chain');
    }
    return { event, result: evaluateRoverWindstringsSpend(event.input) };
  });
  const steps: { eventId: string; order: number; actionFactId: string; sourceFactId: string;
    atSeconds: number; kind: 'GAIN' | 'SPEND'; nominalAmount: number; storedBefore: number; storedAfter: number }[] = [];
  let stored: number | null = initial.status === 'PROVEN' ? initial.value : null;
  const pending = (reason: PendingReason, blockedEventId: string | null) => ({
    primitiveId: ROVER_WINDSTRINGS_LEDGER_ID, presetId: PROFILE_ID, resourceFactId: RESOURCE_ID,
    scope: 'PARTIAL_PROFILE_RESOURCE_FRAGMENT' as const, status: 'PENDING' as const,
    reason, blockedEventId, finalStored: null, lastProvenStored: stored, steps,
    authorizesProfileExecution: false as const,
  });
  if (stored === null) return pending('INITIAL_WINDSTRINGS_UNKNOWN', events[0].event.eventId);
  const usedChains = new Set<string>();
  let continuation: { chainId: string } | null = null;
  for (const { event, result } of events) {
    const before: number = stored;
    let amount: number;
    if ('nominalGain' in result) {
      // Source does not prove clipping or what an intervening action does to an Unbound Flow chain.
      if (continuation) return pending('UNBOUND_FLOW_CONTINUATION_REQUIRED', event.eventId);
      amount = result.nominalGain;
      if (before + amount > source.maximum) return pending('OVERFLOW_SEMANTICS_REQUIRED', event.eventId);
      stored = before + amount;
    } else {
      if (event.kind !== 'SPEND') throw new Error('Invalid spend binding');
      amount = result.nominalSpend;
      if (event.input.event.stage === 1) {
        if (continuation || usedChains.has(event.chainId)) return pending('UNBOUND_FLOW_CONTINUATION_REQUIRED', event.eventId);
        if (before !== source.maximum) return pending('UNBOUND_FLOW_REQUIRES_MAXIMUM', event.eventId);
        usedChains.add(event.chainId);
        continuation = { chainId: event.chainId };
      } else {
        if (continuation?.chainId !== event.chainId) return pending('UNBOUND_FLOW_CONTINUATION_REQUIRED', event.eventId);
        continuation = null;
      }
      if (before < amount) return pending('INSUFFICIENT_STORED_WINDSTRINGS', event.eventId);
      stored = before - amount;
    }
    steps.push({ eventId: event.eventId, order: event.order, actionFactId: result.actionFactId,
      sourceFactId: result.sourceFactId, atSeconds: result.atSeconds, kind: event.kind,
      nominalAmount: amount, storedBefore: before, storedAfter: stored });
  }
  return { primitiveId: ROVER_WINDSTRINGS_LEDGER_ID, presetId: PROFILE_ID, resourceFactId: RESOURCE_ID,
    scope: 'PARTIAL_PROFILE_RESOURCE_FRAGMENT' as const, status: 'EVALUATED_FRAGMENT' as const,
    finalStored: stored, steps, authorizesProfileExecution: false as const };
}
