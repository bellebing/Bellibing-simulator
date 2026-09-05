import { IUNO_ACTION_FACTS } from '../data/characterMechanics/iunoRawFacts.ts';
import {
  createIncomingTransferWindow,
  isIncomingTransferWindowActive,
  type IncomingTransferWindow,
  type OutgoingSwitchEvent,
  type ResonatorSwitchOutEvent,
} from './incomingTransferState.ts';

const IUNO_OUTRO_FACT_ID = 'iuno-outro-from-gloom-to-gleam';
const IUNO_OUTRO_ADAPTER_ID = 'iuno-outro-incoming-heavy-amplification-v1';
const IUNO_OUTRO_TRANSFER_PATTERN = /incoming Resonator gains ([0-9]+(?:\.[0-9]+)?)% Heavy Attack DMG Amplification for ([0-9]+(?:\.[0-9]+)?)s or until switched out/i;

interface ParsedIunoOutroTransferText {
  readonly amplification: number;
  readonly durationSeconds: number;
}

export interface IunoOutroTransferContract extends ParsedIunoOutroTransferText {
  readonly adapterId: typeof IUNO_OUTRO_ADAPTER_ID;
  readonly sourceFactId: typeof IUNO_OUTRO_FACT_ID;
  readonly sourceCharacterId: 'iuno';
  readonly statOrEffect: 'Heavy Attack DMG Amplification';
  readonly endsOnIncomingSwitchOut: true;
}

export const IUNO_OUTRO_TRANSFER_SEMANTIC_SPLIT = {
  adapterId: IUNO_OUTRO_ADAPTER_ID,
  sourceFactId: IUNO_OUTRO_FACT_ID,
  reviewedAt: '2026-09-03',
  closesPendingExecutionIds: [] as readonly string[],
  requiresProfileEventTimeline: true,
  resolvedSemantics: [
    'actual incoming Resonator target',
    'source-declared Heavy Attack DMG Amplification value',
    'source-declared duration',
    'termination when the affected incoming Resonator switches out',
  ],
  notes: [
    'The canonical Iuno Outro fact owns the transfer amount, duration and switch-out termination semantics.',
    'This adapter activates only from an explicit Iuno OUTRO_SWITCH event and binds the actual incoming Resonator; it does not invent when that event occurs in a profile rotation.',
    'Iuno-specific activity queries require explicit switch-out event history rather than defaulting to an assumed no-switch lifecycle.',
    'No canonical profile pendingExecutionId closes from primitive availability alone. Reference Team 01 still requires a source-valid Iuno Outro -> Augusta event and overlap timeline before the contribution can feed DPS.',
  ],
} as const;

function parseTransferText(note: string): ParsedIunoOutroTransferText | null {
  const match = note.match(IUNO_OUTRO_TRANSFER_PATTERN);
  if (!match) return null;
  const amplificationPercent = Number(match[1]);
  const durationSeconds = Number(match[2]);
  if (!Number.isFinite(amplificationPercent) || amplificationPercent <= 0) return null;
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return null;
  return {
    amplification: amplificationPercent / 100,
    durationSeconds,
  };
}

export function validateIunoOutroTransferContract(
  facts: typeof IUNO_ACTION_FACTS = IUNO_ACTION_FACTS,
): readonly string[] {
  const issues: string[] = [];
  const fact = facts.find((row) => row.factId === IUNO_OUTRO_FACT_ID);
  if (!fact) return [`missing canonical Iuno Outro fact ${IUNO_OUTRO_FACT_ID}`];

  if (fact.characterId !== 'iuno') issues.push(`${IUNO_OUTRO_FACT_ID} character drift`);
  if (fact.verificationStatus !== 'VERIFIED') issues.push(`${IUNO_OUTRO_FACT_ID} must remain VERIFIED`);
  if (fact.section !== 'OUTRO_SKILL') issues.push(`${IUNO_OUTRO_FACT_ID} section drift`);
  if (fact.actionKind !== 'OUTRO') issues.push(`${IUNO_OUTRO_FACT_ID} action kind drift`);
  if (fact.conditional) issues.push(`${IUNO_OUTRO_FACT_ID} unexpectedly became conditional`);

  const parsedNotes = (fact.notes ?? [])
    .map(parseTransferText)
    .filter((parsed): parsed is ParsedIunoOutroTransferText => parsed !== null);
  if (parsedNotes.length !== 1) {
    issues.push(`${IUNO_OUTRO_FACT_ID} must contain exactly one parseable incoming Heavy Attack transfer lifecycle statement`);
  }

  return issues;
}

export function resolveIunoOutroTransferContract(
  facts: typeof IUNO_ACTION_FACTS = IUNO_ACTION_FACTS,
): IunoOutroTransferContract {
  const issues = validateIunoOutroTransferContract(facts);
  if (issues.length > 0) throw new Error(`Invalid Iuno Outro transfer contract: ${issues.join('; ')}`);

  const fact = facts.find((row) => row.factId === IUNO_OUTRO_FACT_ID);
  if (!fact) throw new Error(`Missing canonical Iuno Outro fact ${IUNO_OUTRO_FACT_ID}`);
  const parsed = (fact.notes ?? []).map(parseTransferText).find((row) => row !== null);
  if (!parsed) throw new Error(`Missing parseable transfer lifecycle for ${IUNO_OUTRO_FACT_ID}`);

  return {
    adapterId: IUNO_OUTRO_ADAPTER_ID,
    sourceFactId: IUNO_OUTRO_FACT_ID,
    sourceCharacterId: 'iuno',
    statOrEffect: 'Heavy Attack DMG Amplification',
    amplification: parsed.amplification,
    durationSeconds: parsed.durationSeconds,
    endsOnIncomingSwitchOut: true,
  };
}

const IUNO_OUTRO_CONTRACT_ISSUES = validateIunoOutroTransferContract();
if (IUNO_OUTRO_CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Iuno Outro transfer contract: ${IUNO_OUTRO_CONTRACT_ISSUES.join('; ')}`);
}

export function activateIunoOutroTransfer(params: {
  readonly event: OutgoingSwitchEvent;
  readonly facts?: typeof IUNO_ACTION_FACTS;
}): IncomingTransferWindow | null {
  const { event, facts = IUNO_ACTION_FACTS } = params;
  const contract = resolveIunoOutroTransferContract(facts);

  return createIncomingTransferWindow({
    adapterId: contract.adapterId,
    sourceLayer: 'CHARACTER',
    effectId: contract.sourceFactId,
    sourceId: contract.sourceFactId,
    sourceActorId: contract.sourceCharacterId,
    statOrEffect: contract.statOrEffect,
    value: contract.amplification,
    durationSeconds: contract.durationSeconds,
    requiresIncomingIntro: false,
    endsOnIncomingSwitchOut: contract.endsOnIncomingSwitchOut,
  }, event);
}

export function isIunoOutroTransferActive(
  window: IncomingTransferWindow,
  actorId: string,
  atSeconds: number,
  switchOutEvents: readonly ResonatorSwitchOutEvent[],
): boolean {
  if (
    window.adapterId !== IUNO_OUTRO_ADAPTER_ID
    || window.sourceLayer !== 'CHARACTER'
    || window.sourceId !== IUNO_OUTRO_FACT_ID
  ) {
    throw new Error('Iuno Outro activity query requires an Iuno Outro transfer window');
  }
  return isIncomingTransferWindowActive(window, actorId, atSeconds, switchOutEvents);
}
