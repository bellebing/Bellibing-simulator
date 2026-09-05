import type { CharacterPassiveFact } from '../characterMechanicsDomain.ts';
import { THE_SHOREKEEPER_PASSIVE_FACTS } from '../data/characterMechanics/theShorekeeperRawFacts.ts';

const SHOREKEEPER_OUTRO_FACT_ID = 'the-shorekeeper-outro-binary-butterfly';
const SHOREKEEPER_OUTRO_ADAPTER_ID = 'shorekeeper-outro-team-dmg-amplification-v1';
const SHOREKEEPER_OUTRO_TRIGGER = 'Shorekeeper casts Outro Skill Binary Butterfly.';
const SHOREKEEPER_OUTRO_AMPLIFICATION_PATTERN = /DMG is Amplified by ([0-9]+(?:\.[0-9]+)?)%/i;

export interface ShorekeeperOutroCastEvent {
  readonly kind: 'OUTRO_SKILL_CAST';
  readonly actorId: string;
  readonly atSeconds: number;
}

export interface ShorekeeperOutroTeamWindowContract {
  readonly adapterId: typeof SHOREKEEPER_OUTRO_ADAPTER_ID;
  readonly sourceFactId: typeof SHOREKEEPER_OUTRO_FACT_ID;
  readonly sourceCharacterId: 'the-shorekeeper';
  readonly scope: 'TEAM';
  readonly statOrEffect: 'DMG Amplification';
  readonly amplification: number;
  readonly durationSeconds: number;
}

export interface ActiveShorekeeperOutroTeamWindow {
  readonly adapterId: typeof SHOREKEEPER_OUTRO_ADAPTER_ID;
  readonly sourceLayer: 'CHARACTER';
  readonly sourceFactId: typeof SHOREKEEPER_OUTRO_FACT_ID;
  readonly sourceCharacterId: 'the-shorekeeper';
  readonly scope: 'TEAM';
  readonly statOrEffect: 'DMG Amplification';
  readonly value: number;
  readonly teamMemberIds: readonly string[];
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
}

export const SHOREKEEPER_OUTRO_TEAM_WINDOW_SEMANTIC_SPLIT = {
  adapterId: SHOREKEEPER_OUTRO_ADAPTER_ID,
  sourceFactId: SHOREKEEPER_OUTRO_FACT_ID,
  reviewedAt: '2026-09-04',
  closesPendingExecutionIds: [] as readonly string[],
  requiresProfileEventTimeline: true,
  resolvedSemantics: [
    'source-declared TEAM scope',
    'source-declared DMG Amplification value',
    'source-declared duration',
    'explicit Shorekeeper Outro cast activation event',
  ],
  notes: [
    'The canonical Binary Butterfly passive fact owns the team scope, amplification amount and duration.',
    'This adapter activates only from an explicit Shorekeeper OUTRO_SKILL_CAST event and an explicit selected-team membership list; it does not invent when the cast occurs in a profile rotation.',
    'Reference Team 01 still requires source-valid Shorekeeper Outro timing and Augusta damage-window overlap before this contribution may feed DPS.',
  ],
} as const;

function parseAmplification(effectSummary: string): number | null {
  const match = effectSummary.match(SHOREKEEPER_OUTRO_AMPLIFICATION_PATTERN);
  if (!match) return null;
  const percent = Number(match[1]);
  if (!Number.isFinite(percent) || percent <= 0) return null;
  return percent / 100;
}

function binaryButterflyFact(
  facts: readonly CharacterPassiveFact[],
): CharacterPassiveFact | null {
  const matches = facts.filter((fact) => fact.factId === SHOREKEEPER_OUTRO_FACT_ID);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate Shorekeeper Outro fact ${SHOREKEEPER_OUTRO_FACT_ID}`);
  return matches[0];
}

export function validateShorekeeperOutroTeamWindowContract(
  facts: readonly CharacterPassiveFact[] = THE_SHOREKEEPER_PASSIVE_FACTS,
): readonly string[] {
  const issues: string[] = [];
  let fact: CharacterPassiveFact | null = null;
  try {
    fact = binaryButterflyFact(facts);
  } catch (error) {
    issues.push(error instanceof Error ? error.message : String(error));
    return issues;
  }
  if (!fact) return [`missing canonical Shorekeeper Outro fact ${SHOREKEEPER_OUTRO_FACT_ID}`];

  if (fact.characterId !== 'the-shorekeeper') issues.push(`${SHOREKEEPER_OUTRO_FACT_ID} character drift`);
  if (fact.verificationStatus !== 'VERIFIED') issues.push(`${SHOREKEEPER_OUTRO_FACT_ID} must remain VERIFIED`);
  if (fact.section !== 'OUTRO_SKILL') issues.push(`${SHOREKEEPER_OUTRO_FACT_ID} section drift`);
  if (fact.scope !== 'TEAM') issues.push(`${SHOREKEEPER_OUTRO_FACT_ID} must remain TEAM scope`);
  if (fact.conditional) issues.push(`${SHOREKEEPER_OUTRO_FACT_ID} unexpectedly became conditional`);
  if (fact.triggerSummary !== SHOREKEEPER_OUTRO_TRIGGER) issues.push(`${SHOREKEEPER_OUTRO_FACT_ID} trigger drift`);
  if (fact.durationSeconds === null || !Number.isFinite(fact.durationSeconds) || fact.durationSeconds <= 0) {
    issues.push(`${SHOREKEEPER_OUTRO_FACT_ID} must retain a positive finite duration`);
  }
  if (parseAmplification(fact.effectSummary) === null) {
    issues.push(`${SHOREKEEPER_OUTRO_FACT_ID} must retain one parseable team DMG Amplification value`);
  }

  return issues;
}

export function resolveShorekeeperOutroTeamWindowContract(
  facts: readonly CharacterPassiveFact[] = THE_SHOREKEEPER_PASSIVE_FACTS,
): ShorekeeperOutroTeamWindowContract {
  const issues = validateShorekeeperOutroTeamWindowContract(facts);
  if (issues.length > 0) throw new Error(`Invalid Shorekeeper Outro team-window contract: ${issues.join('; ')}`);

  const fact = binaryButterflyFact(facts);
  if (!fact) throw new Error(`Missing canonical Shorekeeper Outro fact ${SHOREKEEPER_OUTRO_FACT_ID}`);
  const amplification = parseAmplification(fact.effectSummary);
  if (amplification === null || fact.durationSeconds === null) {
    throw new Error(`Missing executable Shorekeeper Outro team-window values for ${SHOREKEEPER_OUTRO_FACT_ID}`);
  }

  return {
    adapterId: SHOREKEEPER_OUTRO_ADAPTER_ID,
    sourceFactId: SHOREKEEPER_OUTRO_FACT_ID,
    sourceCharacterId: 'the-shorekeeper',
    scope: 'TEAM',
    statOrEffect: 'DMG Amplification',
    amplification,
    durationSeconds: fact.durationSeconds,
  };
}

const CONTRACT_ISSUES = validateShorekeeperOutroTeamWindowContract();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Shorekeeper Outro team-window contract: ${CONTRACT_ISSUES.join('; ')}`);
}

function validateTeamMemberIds(teamMemberIds: readonly string[], sourceCharacterId: string): readonly string[] {
  if (teamMemberIds.length === 0) throw new Error('Shorekeeper Outro selected team must not be empty');
  for (const characterId of teamMemberIds) {
    if (!characterId.trim()) throw new Error('Shorekeeper Outro team member id must not be blank');
  }
  if (new Set(teamMemberIds).size !== teamMemberIds.length) {
    throw new Error('Shorekeeper Outro selected team contains duplicate Character ids');
  }
  if (!teamMemberIds.includes(sourceCharacterId)) {
    throw new Error(`Shorekeeper Outro selected team must include ${sourceCharacterId}`);
  }
  return Object.freeze([...teamMemberIds]);
}

export function activateShorekeeperOutroTeamWindow(params: {
  readonly event: ShorekeeperOutroCastEvent;
  readonly teamMemberIds: readonly string[];
  readonly facts?: readonly CharacterPassiveFact[];
}): ActiveShorekeeperOutroTeamWindow | null {
  const { event, teamMemberIds, facts = THE_SHOREKEEPER_PASSIVE_FACTS } = params;
  const contract = resolveShorekeeperOutroTeamWindowContract(facts);

  if (event.kind !== 'OUTRO_SKILL_CAST') {
    throw new Error(`unsupported Shorekeeper Outro event kind: ${String(event.kind)}`);
  }
  if (!event.actorId.trim()) throw new Error('Shorekeeper Outro event actorId must not be blank');
  if (!Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error(`Shorekeeper Outro event time must be a finite non-negative number: ${event.atSeconds}`);
  }
  if (event.actorId !== contract.sourceCharacterId) return null;

  const selectedTeamMemberIds = validateTeamMemberIds(teamMemberIds, contract.sourceCharacterId);
  return {
    adapterId: contract.adapterId,
    sourceLayer: 'CHARACTER',
    sourceFactId: contract.sourceFactId,
    sourceCharacterId: contract.sourceCharacterId,
    scope: contract.scope,
    statOrEffect: contract.statOrEffect,
    value: contract.amplification,
    teamMemberIds: selectedTeamMemberIds,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + contract.durationSeconds,
  };
}

export function isShorekeeperOutroTeamWindowActive(
  window: ActiveShorekeeperOutroTeamWindow,
  actorId: string,
  atSeconds: number,
): boolean {
  if (!actorId.trim()) throw new Error('Shorekeeper Outro query actorId must not be blank');
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`Shorekeeper Outro query time must be a finite non-negative number: ${atSeconds}`);
  }
  return window.teamMemberIds.includes(actorId)
    && atSeconds >= window.startedAtSeconds
    && atSeconds < window.expiresAtSeconds;
}
