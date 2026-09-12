import { getCharacterMechanicFact } from '../data/characterMechanics.ts';
import { PROFILE_CATALOGS } from '../data/profileCatalogs.ts';
import { evaluateRoverWindstringsGain, evaluateRoverWindstringsSpend, readRoverWindstringsResource,
  listRoverWindstringsGainSupport, listRoverWindstringsSpendSupport,
  type RoverWindstringsGainInput, type RoverWindstringsSpendInput } from './roverWindstringsGainAdapter.ts';

export const ROVER_WINDSTRINGS_LEDGER_ID = 'rover-windstrings-ordered-fragment-v1';
const PROFILE_ID = 'rover-aero-cartethyia-ciaccona';
const RESOURCE_ID = 'rover-aero-resource-windstrings';

function reviewedProfileTeam() {
  const preset = PROFILE_CATALOGS.presets.find(p => p.id === PROFILE_ID);
  const team = PROFILE_CATALOGS.teams.find(t => t.id === preset?.teamProfileId);
  if (!preset || preset.characterId !== 'rover-aero' || preset.verificationStatus !== 'VERIFIED'
    || !team || team.verificationStatus !== 'VERIFIED') throw new Error('Missing reviewed Rover preset/team');
  return team;
}

/** Identity-only discovery for this existing preset; no second numeric fact table. */
export function listRoverWindstringsLedgerSupport() {
  reviewedProfileTeam();
  return [{ primitiveId: ROVER_WINDSTRINGS_LEDGER_ID, presetId: PROFILE_ID, characterId: 'rover-aero',
    resourceFactId: RESOURCE_ID, gainActionFactIds: listRoverWindstringsGainSupport().map(row => row.actionFactId),
    spendActionFactIds: listRoverWindstringsSpendSupport().map(row => row.actionFactId),
    scope: 'PARTIAL_PROFILE_RESOURCE_FRAGMENT' as const, sequence: 0 as const, skillLevel: 10 as const,
    initialState: 'EXPLICIT_PROVEN_OR_UNKNOWN' as const, overflow: 'UNSUPPORTED_PENDING' as const,
    offField: 'EXPLICIT_STAGE2_WITH_POST_SWAP_OBSERVATION' as const, authorizesProfileExecution: false as const }];
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
  /** Complete mutations since initial observation, including proven equal-time order.
   * The off-field form is only one actual Stage2, observed after a proved swap. */
  readonly boundary: { readonly completeWindstringsEvents: true;
    readonly eventOrderProven: true; readonly evidenceId: string } & (
      { readonly onFieldThroughout: true }
      | { readonly onFieldThroughout: false; readonly followupProof: {
          readonly stage1: Extract<OrderedEvent, { kind: 'SPEND' }>;
          readonly swap: { readonly eventId: string; readonly order: number; readonly atSeconds: number;
            readonly outgoingCharacterId: string; readonly incomingCharacterId: string; readonly sourceQualified: true };
        } }
    );
}

type PendingReason = 'INITIAL_WINDSTRINGS_UNKNOWN' | 'OVERFLOW_SEMANTICS_REQUIRED'
  | 'UNBOUND_FLOW_REQUIRES_MAXIMUM' | 'UNBOUND_FLOW_CONTINUATION_REQUIRED'
  | 'INSUFFICIENT_STORED_WINDSTRINGS';

/** A selected-profile resource fragment, never a full profile execution result.
 * Unknown overflow is a stop boundary, not Math.min(maximum, value).
 * No sourceSequence parsing, timestamp generation, inferred swap persistence, ER or DPS. */
export function evaluateRoverWindstringsLedger(input: RoverWindstringsLedgerInput) {
  const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
  const finiteTime = (value: number) => Number.isFinite(value) && value >= 0;
  if (input.presetId !== PROFILE_ID || !input.boundary
    || (input.boundary.onFieldThroughout !== true && input.boundary.onFieldThroughout !== false)
    || input.boundary.completeWindstringsEvents !== true || input.boundary.eventOrderProven !== true
    || !text(input.boundary.evidenceId) || !Array.isArray(input.events) || !input.events.length) {
    throw new Error('Require exact Rover profile and proven complete ordered resource fragment');
  }
  const source = readRoverWindstringsResource(getCharacterMechanicFact(RESOURCE_ID)!);
  const team = reviewedProfileTeam();
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
    if (event.kind === 'GAIN') {
      const result = evaluateRoverWindstringsGain(event.input);
      if (event.input.event.kind === 'OMEGA_STORM_CAST_WITH_CARTETHYIA') {
        const members = event.input.teamProof!.memberCharacterIds;
        if (members.length !== team.members.length || team.members.some(member => !members.includes(member.characterId))) {
          throw new Error('Actual Omega Storm team does not match this selected profile');
        }
      }
      return { event, result };
    }
    if (event.kind !== 'SPEND' || !text(event.chainId) || event.continuationQualified !== true) {
      throw new Error('Require source-qualified Unbound Flow chain');
    }
    return { event, result: evaluateRoverWindstringsSpend(event.input) };
  });
  let continuation: { chainId: string } | null = null;
  if (input.boundary.onFieldThroughout) {
    if (Object.hasOwn(input.boundary, 'followupProof')) throw new Error('Conflicting on-field/follow-up boundary');
  } else {
    const proof = input.boundary.followupProof;
    const stage1 = proof?.stage1, swap = proof?.swap, stage2 = events[0].event;
    if (!stage1 || stage1.kind !== 'SPEND' || stage1.input?.event?.stage !== 1
      || !text(stage1.eventId) || !text(stage1.chainId) || stage1.continuationQualified !== true
      || !Number.isSafeInteger(stage1.order) || stage1.order < 0
      || !swap || !text(swap.eventId) || swap.eventId === stage1.eventId
      || ids.has(stage1.eventId) || ids.has(swap.eventId)
      || !Number.isSafeInteger(swap.order) || swap.order <= stage1.order || swap.order >= stage2.order
      || !finiteTime(swap.atSeconds) || swap.atSeconds < stage1.input.event.atSeconds
      || swap.atSeconds > stage2.input.event.atSeconds || swap.sourceQualified !== true
      || swap.outgoingCharacterId !== 'rover-aero' || swap.incomingCharacterId === 'rover-aero'
      || !team.members.some(member => member.characterId === swap.incomingCharacterId)
      || events.length !== 1 || stage2.kind !== 'SPEND' || stage2.input.event.stage !== 2
      || stage2.chainId !== stage1.chainId
      || (initial.status === 'PROVEN' && initial.atSeconds < swap.atSeconds)) {
      throw new Error('Off-field Stage2 requires actual Stage1/swap/continuation and a post-swap observation');
    }
    evaluateRoverWindstringsSpend(stage1.input);
    // This seeds only the proved continuation, not a numeric pool from Stage1.
    // Stored Windstrings come independently from the post-swap observation.
    continuation = { chainId: stage1.chainId };
  }
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
