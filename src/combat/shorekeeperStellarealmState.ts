import type { CharacterPassiveFact, CharacterSequenceFact } from '../characterMechanicsDomain.ts';
import {
  THE_SHOREKEEPER_PASSIVE_FACTS,
  THE_SHOREKEEPER_SEQUENCE_FACTS,
} from '../data/characterMechanics/theShorekeeperRawFacts.ts';

const SHOREKEEPER_STELLAREALM_FACT_ID = 'the-shorekeeper-liberation-stellarealms';
const SHOREKEEPER_S1_FACT_ID = 'the-shorekeeper-s1-unspoken-conjecture';
const SHOREKEEPER_STELLAREALM_ADAPTER_ID = 'shorekeeper-stellarealm-state-v1';
const INNER_CRIT_PATTERN = /for every ([0-9]+(?:\.[0-9]+)?)% of Shorekeeper's Energy Regen, all party members gain ([0-9]+(?:\.[0-9]+)?)% bonus Crit\. Rate, up to ([0-9]+(?:\.[0-9]+)?)%/i;
const SUPERNAL_CRIT_PATTERN = /for every ([0-9]+(?:\.[0-9]+)?)% of Shorekeeper's Energy Regen, all party members gain ([0-9]+(?:\.[0-9]+)?)% bonus Crit\. DMG, up to ([0-9]+(?:\.[0-9]+)?)%/i;

interface ParsedCritConversion {
  readonly energyRegenStep: number;
  readonly bonusPerStep: number;
  readonly cap: number;
}

interface ParsedShorekeeperStellarealmText {
  readonly innerCritRate: ParsedCritConversion;
  readonly supernalCritDamage: ParsedCritConversion;
}

export interface ShorekeeperStellarealmContract extends ParsedShorekeeperStellarealmText {
  readonly adapterId: typeof SHOREKEEPER_STELLAREALM_ADAPTER_ID;
  readonly sourceFactId: typeof SHOREKEEPER_STELLAREALM_FACT_ID;
  readonly sourceCharacterId: 'the-shorekeeper';
  readonly durationSeconds: number;
  readonly selectedSequence: 0;
  readonly requiresExplicitIntroInRangeProof: true;
  readonly requiresExplicitEnergyRegenSample: true;
  readonly s0DiscernmentEndsCurrentRealm: true;
  readonly activeRealmRecastSemantics: 'SOURCE_BOUNDARY_UNRESOLVED';
}

export type ShorekeeperStellarealmStage = 'NONE' | 'OUTER' | 'INNER' | 'SUPERNAL';

export interface ShorekeeperStellarealmLiberationCastEvent {
  readonly kind: 'SHOREKEEPER_RESONANCE_LIBERATION_CAST';
  readonly actorId: string;
  readonly atSeconds: number;
}

export interface ShorekeeperStellarealmIntroSkillCastEvent {
  readonly kind: 'INTRO_SKILL_CAST';
  readonly actorId: string;
  readonly atSeconds: number;
  readonly insideStellarealm: boolean;
  readonly introVariant: 'STANDARD' | 'DISCERNMENT';
}

export type ShorekeeperStellarealmEvent =
  | ShorekeeperStellarealmLiberationCastEvent
  | ShorekeeperStellarealmIntroSkillCastEvent;

export interface ShorekeeperStellarealmState {
  readonly coreId: 'shorekeeper-stellarealm-state-v1';
  readonly adapterId: typeof SHOREKEEPER_STELLAREALM_ADAPTER_ID;
  readonly sourceFactId: typeof SHOREKEEPER_STELLAREALM_FACT_ID;
  readonly selectedSequence: 0;
  readonly teamMemberIds: readonly string[];
  readonly stage: ShorekeeperStellarealmStage;
  readonly startedAtSeconds: number | null;
  readonly expiresAtSeconds: number | null;
  readonly lastProcessedAtSeconds: number | null;
}

export interface ShorekeeperStellarealmQuery {
  readonly actorId: string;
  readonly atSeconds: number;
  readonly insideStellarealm: boolean;
  /** Total current Shorekeeper Energy Regen as a ratio: 2.5 = 250%. */
  readonly shorekeeperEnergyRegen: number;
}

export interface ShorekeeperStellarealmSnapshot {
  readonly actorId: string;
  readonly stage: ShorekeeperStellarealmStage;
  readonly realmActive: boolean;
  readonly appliesToActor: boolean;
  readonly critRateBonus: number;
  readonly critDamageBonus: number;
  readonly startedAtSeconds: number | null;
  readonly expiresAtSeconds: number | null;
}

export const SHOREKEEPER_STELLAREALM_RUNTIME_BOUNDARY = {
  adapterId: SHOREKEEPER_STELLAREALM_ADAPTER_ID,
  sourceFactId: SHOREKEEPER_STELLAREALM_FACT_ID,
  reviewedAt: '2026-09-05',
  closesPendingExecutionIds: [] as readonly string[],
  requiresProfileEventTimeline: true,
  resolvedSemantics: [
    'S0 End Loop creates a 30s Outer Stellarealm from an explicit Shorekeeper Liberation event',
    'an explicit party Intro inside Outer evolves it to Inner; an explicit party Intro inside Inner evolves it to Supernal',
    'Inner and Supernal party crit conversions are parsed from canonical Shorekeeper Energy Regen formulas and caps',
    'S0 Shorekeeper Intro Skill Discernment ends the current Supernal Stellarealm',
    'realm expiry is evaluated as a half-open interval',
  ],
  unresolvedSemantics: [
    'Reference Team Intro/Discernment timestamps',
    'whether End Loop recast while a prior Stellarealm remains active refreshes or replaces that realm',
    'timed composition of Shorekeeper Energy Regen from Self Gravitation, Fallacy and build state',
    'actual Augusta in-range action overlap',
  ],
  notes: [
    'The runtime consumes explicit event and in-range evidence only; SOURCE_SEQUENCE_ONLY prose is never converted into seconds.',
    'Energy Regen is a query-time input so the state core does not silently assume Fallacy or Self Gravitation uptime.',
    'Only S0 is executable in this bounded core because Reference Team 01 selects Shorekeeper sequence 0.',
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

function parseConversion(match: RegExpMatchArray | null): ParsedCritConversion | null {
  if (!match) return null;
  const stepPercent = Number(match[1]);
  const bonusPercent = Number(match[2]);
  const capPercent = Number(match[3]);
  if (
    !Number.isFinite(stepPercent)
    || !Number.isFinite(bonusPercent)
    || !Number.isFinite(capPercent)
    || stepPercent <= 0
    || bonusPercent <= 0
    || capPercent <= 0
  ) {
    return null;
  }
  return {
    energyRegenStep: stepPercent / 100,
    bonusPerStep: bonusPercent / 100,
    cap: capPercent / 100,
  };
}

function parseStellarealmText(effectSummary: string): ParsedShorekeeperStellarealmText | null {
  const innerCritRate = parseConversion(effectSummary.match(INNER_CRIT_PATTERN));
  const supernalCritDamage = parseConversion(effectSummary.match(SUPERNAL_CRIT_PATTERN));
  if (!innerCritRate || !supernalCritDamage) return null;
  return { innerCritRate, supernalCritDamage };
}

export function validateShorekeeperStellarealmContract(
  passiveFacts: readonly CharacterPassiveFact[] = THE_SHOREKEEPER_PASSIVE_FACTS,
  sequenceFacts: readonly CharacterSequenceFact[] = THE_SHOREKEEPER_SEQUENCE_FACTS,
): readonly string[] {
  const issues: string[] = [];
  const fact = passiveFacts.find((row) => row.factId === SHOREKEEPER_STELLAREALM_FACT_ID);
  if (!fact) return [`missing canonical Shorekeeper Stellarealm fact ${SHOREKEEPER_STELLAREALM_FACT_ID}`];

  if (fact.characterId !== 'the-shorekeeper') issues.push(`${SHOREKEEPER_STELLAREALM_FACT_ID} character drift`);
  if (fact.verificationStatus !== 'VERIFIED') issues.push(`${SHOREKEEPER_STELLAREALM_FACT_ID} must remain VERIFIED`);
  if (fact.section !== 'RESONANCE_LIBERATION') issues.push(`${SHOREKEEPER_STELLAREALM_FACT_ID} section drift`);
  if (!fact.conditional) issues.push(`${SHOREKEEPER_STELLAREALM_FACT_ID} must remain conditional`);
  if (fact.scope !== 'TEAM') issues.push(`${SHOREKEEPER_STELLAREALM_FACT_ID} scope drift`);
  if (!Number.isFinite(fact.durationSeconds) || (fact.durationSeconds ?? 0) <= 0) {
    issues.push(`${SHOREKEEPER_STELLAREALM_FACT_ID} duration must remain explicit and positive`);
  }
  if (!/first party Intro Skill used within Outer Stellarealm evolves it into Inner Stellarealm/i.test(fact.effectSummary)) {
    issues.push(`${SHOREKEEPER_STELLAREALM_FACT_ID} Outer-to-Inner evolution drift`);
  }
  if (!/second party Intro Skill used within Inner Stellarealm evolves it into Supernal Stellarealm/i.test(fact.effectSummary)) {
    issues.push(`${SHOREKEEPER_STELLAREALM_FACT_ID} Inner-to-Supernal evolution drift`);
  }
  if (!/At S0, casting Shorekeeper's Intro Skill Discernment ends the current Stellarealm/i.test(fact.effectSummary)) {
    issues.push(`${SHOREKEEPER_STELLAREALM_FACT_ID} S0 Discernment termination drift`);
  }
  if (!parseStellarealmText(fact.effectSummary)) {
    issues.push(`${SHOREKEEPER_STELLAREALM_FACT_ID} must contain parseable ER-to-party-crit formulas and caps`);
  }

  const s1 = sequenceFacts.find((row) => row.factId === SHOREKEEPER_S1_FACT_ID);
  if (!s1 || s1.characterId !== 'the-shorekeeper' || s1.sequence !== 1 || s1.verificationStatus !== 'VERIFIED') {
    issues.push(`missing verified Shorekeeper S1 boundary fact ${SHOREKEEPER_S1_FACT_ID}`);
  } else if (!/Casting Intro Skill Discernment no longer ends the existing Stellarealm/i.test(s1.effectSummary)) {
    issues.push(`${SHOREKEEPER_S1_FACT_ID} Discernment termination override drift`);
  }

  return issues;
}

export function resolveShorekeeperStellarealmContract(
  passiveFacts: readonly CharacterPassiveFact[] = THE_SHOREKEEPER_PASSIVE_FACTS,
  sequenceFacts: readonly CharacterSequenceFact[] = THE_SHOREKEEPER_SEQUENCE_FACTS,
): ShorekeeperStellarealmContract {
  const issues = validateShorekeeperStellarealmContract(passiveFacts, sequenceFacts);
  if (issues.length > 0) throw new Error(`Invalid Shorekeeper Stellarealm contract: ${issues.join('; ')}`);

  const fact = passiveFacts.find((row) => row.factId === SHOREKEEPER_STELLAREALM_FACT_ID);
  if (!fact || fact.durationSeconds === null) {
    throw new Error(`Missing canonical Shorekeeper Stellarealm fact ${SHOREKEEPER_STELLAREALM_FACT_ID}`);
  }
  const parsed = parseStellarealmText(fact.effectSummary);
  if (!parsed) throw new Error(`Missing parseable Stellarealm crit conversion for ${SHOREKEEPER_STELLAREALM_FACT_ID}`);

  return {
    adapterId: SHOREKEEPER_STELLAREALM_ADAPTER_ID,
    sourceFactId: SHOREKEEPER_STELLAREALM_FACT_ID,
    sourceCharacterId: 'the-shorekeeper',
    durationSeconds: fact.durationSeconds,
    selectedSequence: 0,
    ...parsed,
    requiresExplicitIntroInRangeProof: true,
    requiresExplicitEnergyRegenSample: true,
    s0DiscernmentEndsCurrentRealm: true,
    activeRealmRecastSemantics: 'SOURCE_BOUNDARY_UNRESOLVED',
  };
}

const SHOREKEEPER_STELLAREALM_CONTRACT_ISSUES = validateShorekeeperStellarealmContract();
if (SHOREKEEPER_STELLAREALM_CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Shorekeeper Stellarealm contract: ${SHOREKEEPER_STELLAREALM_CONTRACT_ISSUES.join('; ')}`);
}

export function createShorekeeperStellarealmState(
  teamMemberIds: readonly string[],
  selectedSequence = 0,
): ShorekeeperStellarealmState {
  if (selectedSequence !== 0) {
    throw new Error(`Shorekeeper Stellarealm runtime currently supports selected sequence 0 only, got ${selectedSequence}`);
  }
  if (teamMemberIds.length === 0) throw new Error('Shorekeeper Stellarealm team must not be empty');
  const normalizedMembers = teamMemberIds.map((id) => {
    nonBlank(id, 'Stellarealm team member id');
    return id;
  });
  if (new Set(normalizedMembers).size !== normalizedMembers.length) {
    throw new Error('Shorekeeper Stellarealm team contains duplicate member ids');
  }
  if (!normalizedMembers.includes('the-shorekeeper')) {
    throw new Error('Shorekeeper Stellarealm team must include the-shorekeeper');
  }
  return {
    coreId: 'shorekeeper-stellarealm-state-v1',
    adapterId: SHOREKEEPER_STELLAREALM_ADAPTER_ID,
    sourceFactId: SHOREKEEPER_STELLAREALM_FACT_ID,
    selectedSequence: 0,
    teamMemberIds: [...normalizedMembers],
    stage: 'NONE',
    startedAtSeconds: null,
    expiresAtSeconds: null,
    lastProcessedAtSeconds: null,
  };
}

function requireChronological(state: ShorekeeperStellarealmState, atSeconds: number): void {
  finiteNonNegative(atSeconds, 'Shorekeeper Stellarealm event time');
  if (state.lastProcessedAtSeconds !== null && atSeconds < state.lastProcessedAtSeconds) {
    throw new Error(
      `Shorekeeper Stellarealm events must be processed in non-decreasing time order: ${atSeconds} < ${state.lastProcessedAtSeconds}`,
    );
  }
}

function normalizedAt(state: ShorekeeperStellarealmState, atSeconds: number): ShorekeeperStellarealmState {
  if (state.expiresAtSeconds === null || atSeconds < state.expiresAtSeconds) return state;
  return {
    ...state,
    stage: 'NONE',
    startedAtSeconds: null,
    expiresAtSeconds: null,
  };
}

function clearRealm(state: ShorekeeperStellarealmState, atSeconds: number): ShorekeeperStellarealmState {
  return {
    ...state,
    stage: 'NONE',
    startedAtSeconds: null,
    expiresAtSeconds: null,
    lastProcessedAtSeconds: atSeconds,
  };
}

export function applyShorekeeperStellarealmEvent(
  state: ShorekeeperStellarealmState,
  event: ShorekeeperStellarealmEvent,
): ShorekeeperStellarealmState {
  nonBlank(event.actorId, 'Shorekeeper Stellarealm event actor id');
  requireChronological(state, event.atSeconds);
  const current = normalizedAt(state, event.atSeconds);

  if (event.kind === 'SHOREKEEPER_RESONANCE_LIBERATION_CAST') {
    if (event.actorId !== 'the-shorekeeper') {
      throw new Error(`Shorekeeper Stellarealm End Loop actor must be the-shorekeeper, got ${event.actorId}`);
    }
    if (current.stage !== 'NONE') {
      throw new Error('Shorekeeper End Loop recast while a Stellarealm is active is source-boundary unresolved');
    }
    const contract = resolveShorekeeperStellarealmContract();
    return {
      ...current,
      stage: 'OUTER',
      startedAtSeconds: event.atSeconds,
      expiresAtSeconds: event.atSeconds + contract.durationSeconds,
      lastProcessedAtSeconds: event.atSeconds,
    };
  }

  if (event.kind !== 'INTRO_SKILL_CAST') {
    throw new Error(`unsupported Shorekeeper Stellarealm event kind: ${String(event.kind)}`);
  }
  if (typeof event.insideStellarealm !== 'boolean') {
    throw new Error('insideStellarealm must be boolean');
  }
  if (event.introVariant !== 'STANDARD' && event.introVariant !== 'DISCERNMENT') {
    throw new Error(`unsupported Shorekeeper Intro variant: ${String(event.introVariant)}`);
  }

  const observed = { ...current, lastProcessedAtSeconds: event.atSeconds };
  if (!current.teamMemberIds.includes(event.actorId)) return observed;

  if (event.introVariant === 'DISCERNMENT') {
    if (event.actorId !== 'the-shorekeeper') {
      throw new Error(`Shorekeeper Discernment actor must be the-shorekeeper, got ${event.actorId}`);
    }
    if (current.stage !== 'SUPERNAL') {
      throw new Error('Shorekeeper Discernment requires an active Supernal Stellarealm');
    }
    return clearRealm(current, event.atSeconds);
  }

  if (current.stage === 'SUPERNAL' && event.actorId === 'the-shorekeeper') {
    throw new Error('Shorekeeper Intro during Supernal must be explicit Discernment at S0');
  }
  if (!event.insideStellarealm || current.stage === 'NONE' || current.stage === 'SUPERNAL') return observed;
  if (current.stage === 'OUTER') return { ...observed, stage: 'INNER' };
  return { ...observed, stage: 'SUPERNAL' };
}

function conversionBonus(energyRegen: number, conversion: ParsedCritConversion): number {
  return Math.min((energyRegen / conversion.energyRegenStep) * conversion.bonusPerStep, conversion.cap);
}

export function readShorekeeperStellarealmState(
  state: ShorekeeperStellarealmState,
  query: ShorekeeperStellarealmQuery,
): ShorekeeperStellarealmSnapshot {
  nonBlank(query.actorId, 'Shorekeeper Stellarealm query actor id');
  finiteNonNegative(query.atSeconds, 'Shorekeeper Stellarealm query time');
  finiteNonNegative(query.shorekeeperEnergyRegen, 'Shorekeeper Energy Regen ratio');
  if (typeof query.insideStellarealm !== 'boolean') throw new Error('insideStellarealm must be boolean');
  if (state.lastProcessedAtSeconds !== null && query.atSeconds < state.lastProcessedAtSeconds) {
    throw new Error(
      `Shorekeeper Stellarealm query time ${query.atSeconds} precedes processed event history ${state.lastProcessedAtSeconds}`,
    );
  }

  const current = normalizedAt(state, query.atSeconds);
  const realmActive = current.stage !== 'NONE';
  const appliesToActor = realmActive
    && current.teamMemberIds.includes(query.actorId)
    && query.insideStellarealm;
  const contract = resolveShorekeeperStellarealmContract();
  const critRateBonus = appliesToActor && (current.stage === 'INNER' || current.stage === 'SUPERNAL')
    ? conversionBonus(query.shorekeeperEnergyRegen, contract.innerCritRate)
    : 0;
  const critDamageBonus = appliesToActor && current.stage === 'SUPERNAL'
    ? conversionBonus(query.shorekeeperEnergyRegen, contract.supernalCritDamage)
    : 0;

  return {
    actorId: query.actorId,
    stage: current.stage,
    realmActive,
    appliesToActor,
    critRateBonus,
    critDamageBonus,
    startedAtSeconds: current.startedAtSeconds,
    expiresAtSeconds: current.expiresAtSeconds,
  };
}
