import { IUNO_PASSIVE_FACTS } from '../data/characterMechanics/iunoRawFacts.ts';
import type { ResonatorSwitchOutEvent } from './incomingTransferState.ts';

const IUNO_WAN_LIGHT_FACT_ID = 'iuno-full-moon-domain-wan-light-recipient';
const IUNO_WAN_LIGHT_ADAPTER_ID = 'iuno-wan-light-recipient-state-v1';
const CADENCE_PATTERN = /at most once every ([0-9]+(?:\.[0-9]+)?)s/i;
const AMPLIFICATION_PATTERN = /Each stack grants ([0-9]+(?:\.[0-9]+)?)% all DMG Amplification/i;
const MAX_STACK_PATTERN = /up to ([0-9]+) stacks/i;
const DURATION_PATTERN = /buff lasts ([0-9]+(?:\.[0-9]+)?)s/i;

interface ParsedIunoWanLightText {
  readonly minStackGainIntervalSeconds: number;
  readonly amplificationPerStack: number;
  readonly maxStacks: number;
  readonly durationSeconds: number;
}

export interface IunoWanLightRecipientContract extends ParsedIunoWanLightText {
  readonly adapterId: typeof IUNO_WAN_LIGHT_ADAPTER_ID;
  readonly sourceFactId: typeof IUNO_WAN_LIGHT_FACT_ID;
  readonly sourceCharacterId: 'iuno';
  readonly requiresExplicitFullMoonDomainProof: true;
  readonly endsOnRecipientSwitchOut: true;
  readonly qualifyingTriggerAtCapSemantics: 'SOURCE_BOUNDARY_UNRESOLVED';
}

export interface IunoWanLightShieldGainEvent {
  readonly kind: 'SHIELD_GAIN';
  readonly actorId: string;
  readonly atSeconds: number;
  readonly insideIunoFullMoonDomain: boolean;
}

export interface IunoWanLightRecipientState {
  readonly coreId: 'iuno-wan-light-recipient-state-v1';
  readonly adapterId: typeof IUNO_WAN_LIGHT_ADAPTER_ID;
  readonly sourceFactId: typeof IUNO_WAN_LIGHT_FACT_ID;
  readonly recipientId: string;
  readonly stacks: number;
  readonly lastStackGainAtSeconds: number | null;
  readonly expiresAtSeconds: number | null;
  readonly lastProcessedAtSeconds: number | null;
}

export interface IunoWanLightRecipientSnapshot {
  readonly recipientId: string;
  readonly stacks: number;
  readonly amplification: number;
  readonly active: boolean;
  readonly expiresAtSeconds: number | null;
}

export const IUNO_WAN_LIGHT_RECIPIENT_RUNTIME_BOUNDARY = {
  adapterId: IUNO_WAN_LIGHT_ADAPTER_ID,
  sourceFactId: IUNO_WAN_LIGHT_FACT_ID,
  reviewedAt: '2026-09-04',
  closesPendingExecutionIds: [] as readonly string[],
  requiresProfileEventTimeline: true,
  resolvedSemantics: [
    'recipient-specific Shield gain only while explicit caller evidence says the recipient is inside Iuno Full Moon Domain',
    'source-declared 0.5s minimum stack-gain cadence below cap',
    'source-declared per-stack all-DMG Amplification',
    'source-declared duration refresh whenever a new stack is actually gained below cap',
    'recipient switch-out clears all stacks',
  ],
  unresolvedSemantics: [
    'Full Moon Domain duration/timeline',
    'actual Augusta Shield-gain event timestamps',
    'whether a qualifying Shield event at 10 stacks refreshes duration when no additional stack can be gained',
    'Augusta damage-window overlap',
  ],
  notes: [
    'The primitive accepts explicit event evidence only. It does not infer Full Moon Domain activity from Iuno source-sequence prose.',
    'A qualifying Shield event at max stacks fails closed instead of inventing at-cap refresh semantics.',
    'No Augusta DPS consumer is authorized by this primitive alone.',
  ],
} as const;

function finiteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite non-negative number: ${value}`);
  }
}

function nonBlank(value: string, label: string): void {
  if (!value.trim()) throw new Error(`${label} must not be blank`);
}

function positiveNumberFromMatch(match: RegExpMatchArray | null): number | null {
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function parseWanLightText(effectSummary: string): ParsedIunoWanLightText | null {
  const cadence = positiveNumberFromMatch(effectSummary.match(CADENCE_PATTERN));
  const amplificationPercent = positiveNumberFromMatch(effectSummary.match(AMPLIFICATION_PATTERN));
  const maxStacks = positiveNumberFromMatch(effectSummary.match(MAX_STACK_PATTERN));
  const durationSeconds = positiveNumberFromMatch(effectSummary.match(DURATION_PATTERN));
  if (cadence === null || amplificationPercent === null || maxStacks === null || durationSeconds === null) return null;
  if (!Number.isInteger(maxStacks)) return null;
  return {
    minStackGainIntervalSeconds: cadence,
    amplificationPerStack: amplificationPercent / 100,
    maxStacks,
    durationSeconds,
  };
}

export function validateIunoWanLightRecipientContract(
  facts: typeof IUNO_PASSIVE_FACTS = IUNO_PASSIVE_FACTS,
): readonly string[] {
  const issues: string[] = [];
  const fact = facts.find((row) => row.factId === IUNO_WAN_LIGHT_FACT_ID);
  if (!fact) return [`missing canonical Iuno Wan Light recipient fact ${IUNO_WAN_LIGHT_FACT_ID}`];

  if (fact.characterId !== 'iuno') issues.push(`${IUNO_WAN_LIGHT_FACT_ID} character drift`);
  if (fact.verificationStatus !== 'VERIFIED') issues.push(`${IUNO_WAN_LIGHT_FACT_ID} must remain VERIFIED`);
  if (fact.section !== 'FORTE_CIRCUIT') issues.push(`${IUNO_WAN_LIGHT_FACT_ID} section drift`);
  if (!fact.conditional) issues.push(`${IUNO_WAN_LIGHT_FACT_ID} must remain conditional`);
  if (fact.scope !== 'TEAM') issues.push(`${IUNO_WAN_LIGHT_FACT_ID} scope drift`);
  if (!/receiving Resonator/i.test(fact.triggerSummary)) issues.push(`${IUNO_WAN_LIGHT_FACT_ID} recipient target drift`);
  if (!/Full Moon Domain/i.test(fact.triggerSummary)) issues.push(`${IUNO_WAN_LIGHT_FACT_ID} Full Moon Domain prerequisite drift`);
  if (!/gains a Shield/i.test(fact.triggerSummary)) issues.push(`${IUNO_WAN_LIGHT_FACT_ID} Shield trigger drift`);
  if (!/gaining a new stack resets the buff duration/i.test(fact.effectSummary)) {
    issues.push(`${IUNO_WAN_LIGHT_FACT_ID} stack refresh semantics drift`);
  }
  if (!/Switching that Resonator off field removes all stacks/i.test(fact.effectSummary)) {
    issues.push(`${IUNO_WAN_LIGHT_FACT_ID} switch-out termination drift`);
  }

  const parsed = parseWanLightText(fact.effectSummary);
  if (!parsed) {
    issues.push(`${IUNO_WAN_LIGHT_FACT_ID} must contain parseable cadence/amplification/cap/duration semantics`);
  } else {
    if (fact.durationSeconds !== parsed.durationSeconds) {
      issues.push(`${IUNO_WAN_LIGHT_FACT_ID} duration field/text mismatch`);
    }
    if (fact.maxStacks !== parsed.maxStacks) {
      issues.push(`${IUNO_WAN_LIGHT_FACT_ID} max-stack field/text mismatch`);
    }
  }

  return issues;
}

export function resolveIunoWanLightRecipientContract(
  facts: typeof IUNO_PASSIVE_FACTS = IUNO_PASSIVE_FACTS,
): IunoWanLightRecipientContract {
  const issues = validateIunoWanLightRecipientContract(facts);
  if (issues.length > 0) throw new Error(`Invalid Iuno Wan Light recipient contract: ${issues.join('; ')}`);

  const fact = facts.find((row) => row.factId === IUNO_WAN_LIGHT_FACT_ID);
  if (!fact) throw new Error(`Missing canonical Iuno Wan Light recipient fact ${IUNO_WAN_LIGHT_FACT_ID}`);
  const parsed = parseWanLightText(fact.effectSummary);
  if (!parsed) throw new Error(`Missing parseable Wan Light lifecycle for ${IUNO_WAN_LIGHT_FACT_ID}`);

  return {
    adapterId: IUNO_WAN_LIGHT_ADAPTER_ID,
    sourceFactId: IUNO_WAN_LIGHT_FACT_ID,
    sourceCharacterId: 'iuno',
    ...parsed,
    requiresExplicitFullMoonDomainProof: true,
    endsOnRecipientSwitchOut: true,
    qualifyingTriggerAtCapSemantics: 'SOURCE_BOUNDARY_UNRESOLVED',
  };
}

const IUNO_WAN_LIGHT_CONTRACT_ISSUES = validateIunoWanLightRecipientContract();
if (IUNO_WAN_LIGHT_CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Iuno Wan Light recipient contract: ${IUNO_WAN_LIGHT_CONTRACT_ISSUES.join('; ')}`);
}

export function createIunoWanLightRecipientState(recipientId: string): IunoWanLightRecipientState {
  nonBlank(recipientId, 'Wan Light recipient id');
  return {
    coreId: 'iuno-wan-light-recipient-state-v1',
    adapterId: IUNO_WAN_LIGHT_ADAPTER_ID,
    sourceFactId: IUNO_WAN_LIGHT_FACT_ID,
    recipientId,
    stacks: 0,
    lastStackGainAtSeconds: null,
    expiresAtSeconds: null,
    lastProcessedAtSeconds: null,
  };
}

function requireChronological(state: IunoWanLightRecipientState, atSeconds: number): void {
  finiteNonNegative(atSeconds, 'Wan Light event time');
  if (state.lastProcessedAtSeconds !== null && atSeconds < state.lastProcessedAtSeconds) {
    throw new Error(`Wan Light events must be processed in non-decreasing time order: ${atSeconds} < ${state.lastProcessedAtSeconds}`);
  }
}

function normalizedAt(state: IunoWanLightRecipientState, atSeconds: number): IunoWanLightRecipientState {
  if (state.expiresAtSeconds === null || atSeconds < state.expiresAtSeconds) return state;
  return {
    ...state,
    stacks: 0,
    lastStackGainAtSeconds: null,
    expiresAtSeconds: null,
  };
}

export function applyIunoWanLightShieldGain(
  state: IunoWanLightRecipientState,
  event: IunoWanLightShieldGainEvent,
): IunoWanLightRecipientState {
  if (event.kind !== 'SHIELD_GAIN') throw new Error(`unsupported Wan Light event kind: ${String(event.kind)}`);
  nonBlank(event.actorId, 'Wan Light Shield recipient id');
  if (typeof event.insideIunoFullMoonDomain !== 'boolean') {
    throw new Error('insideIunoFullMoonDomain must be boolean');
  }
  requireChronological(state, event.atSeconds);
  if (event.actorId !== state.recipientId) return state;

  const contract = resolveIunoWanLightRecipientContract();
  const current = normalizedAt(state, event.atSeconds);
  const observed = { ...current, lastProcessedAtSeconds: event.atSeconds };
  if (!event.insideIunoFullMoonDomain) return observed;
  if (
    current.lastStackGainAtSeconds !== null
    && event.atSeconds - current.lastStackGainAtSeconds < contract.minStackGainIntervalSeconds
  ) {
    return observed;
  }
  if (current.stacks >= contract.maxStacks) {
    throw new Error('Iuno Wan Light qualifying Shield event at max stacks is source-boundary unresolved');
  }

  return {
    ...observed,
    stacks: current.stacks + 1,
    lastStackGainAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + contract.durationSeconds,
  };
}

export function applyIunoWanLightSwitchOut(
  state: IunoWanLightRecipientState,
  event: ResonatorSwitchOutEvent,
): IunoWanLightRecipientState {
  if (event.kind !== 'RESONATOR_SWITCH_OUT') {
    throw new Error(`unsupported Wan Light switch-out event kind: ${String(event.kind)}`);
  }
  nonBlank(event.actorId, 'Wan Light switch-out actor id');
  requireChronological(state, event.atSeconds);
  if (event.actorId !== state.recipientId) return state;
  const current = normalizedAt(state, event.atSeconds);
  return {
    ...current,
    stacks: 0,
    lastStackGainAtSeconds: null,
    expiresAtSeconds: null,
    lastProcessedAtSeconds: event.atSeconds,
  };
}

export function readIunoWanLightRecipientState(
  state: IunoWanLightRecipientState,
  atSeconds: number,
): IunoWanLightRecipientSnapshot {
  finiteNonNegative(atSeconds, 'Wan Light query time');
  if (state.lastProcessedAtSeconds !== null && atSeconds < state.lastProcessedAtSeconds) {
    throw new Error(`Wan Light query time ${atSeconds} precedes processed event history ${state.lastProcessedAtSeconds}`);
  }
  const current = normalizedAt(state, atSeconds);
  const contract = resolveIunoWanLightRecipientContract();
  return {
    recipientId: current.recipientId,
    stacks: current.stacks,
    amplification: current.stacks * contract.amplificationPerStack,
    active: current.stacks > 0,
    expiresAtSeconds: current.expiresAtSeconds,
  };
}
