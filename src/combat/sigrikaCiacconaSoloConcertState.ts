import { CIACCONA_PASSIVE_FACTS } from '../data/characterMechanics/ciacconaRawFacts.ts';

const SOURCE_FACT_ID = 'ciaccona-basic-solo-concert';
const TARGET_CHARACTER_ID = 'sigrika';

export interface CiacconaSoloConcertExternalSnapshot {
  readonly kind: 'CIACCONA_SOLO_CONCERT_EXTERNAL_STATE';
  readonly sourceCharacterId: string;
  readonly active: boolean;
  readonly observedAtSeconds: number;
}

export interface SigrikaCiacconaSoloConcertProjection {
  readonly adapterId: 'ciaccona-solo-concert-external-team-state-v1';
  readonly sourceFactId: typeof SOURCE_FACT_ID;
  readonly sourceCharacterId: 'ciaccona';
  readonly targetCharacterId: typeof TARGET_CHARACTER_ID;
  readonly statOrEffect: 'Aero DMG Bonus';
  readonly value: 0.24;
  readonly observedAtSeconds: number;
  readonly extrapolatesBeyondSnapshot: false;
}

export const CIACCONA_SOLO_CONCERT_EXTERNAL_STATE_CONTRACT = Object.freeze({
  adapterId: 'ciaccona-solo-concert-external-team-state-v1',
  sourceFactId: SOURCE_FACT_ID,
  sourceCharacterId: 'ciaccona',
  targetCharacterId: TARGET_CHARACTER_ID,
  statOrEffect: 'Aero DMG Bonus',
  value: 0.24,
  durationSeconds: null,
  stateOwner: 'EXTERNAL_CIACCONA_EXECUTION',
  requiresSameTimestampSnapshot: true,
} as const);

function finiteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite non-negative number: ${value}`);
  }
}

/**
 * Point-in-time projection of Ciaccona-owned Solo Concert state into Sigrika.
 *
 * The adapter never creates, persists, refreshes or expires Solo Concert. The
 * caller must supply an explicit Ciaccona-owned state snapshot for the exact
 * event/query time being evaluated. This preserves Ciaccona as the state owner
 * and deliberately prevents duration inference from the raw `durationSeconds`
 * null contract.
 */
export function projectCiacconaSoloConcertForSigrika(
  snapshot: CiacconaSoloConcertExternalSnapshot,
): SigrikaCiacconaSoloConcertProjection | null {
  finiteNonNegative(snapshot.observedAtSeconds, 'Ciaccona Solo Concert snapshot time');
  if (snapshot.kind !== 'CIACCONA_SOLO_CONCERT_EXTERNAL_STATE') {
    throw new Error(`unsupported Ciaccona external state snapshot: ${String(snapshot.kind)}`);
  }
  if (snapshot.sourceCharacterId !== 'ciaccona') return null;
  if (!snapshot.active) return null;

  return Object.freeze({
    adapterId: CIACCONA_SOLO_CONCERT_EXTERNAL_STATE_CONTRACT.adapterId,
    sourceFactId: SOURCE_FACT_ID,
    sourceCharacterId: 'ciaccona',
    targetCharacterId: TARGET_CHARACTER_ID,
    statOrEffect: 'Aero DMG Bonus',
    value: 0.24,
    observedAtSeconds: snapshot.observedAtSeconds,
    extrapolatesBeyondSnapshot: false,
  });
}

export function validateCiacconaSoloConcertExternalStateContract(): readonly string[] {
  const issues: string[] = [];
  const fact = CIACCONA_PASSIVE_FACTS.find((row) => row.factId === SOURCE_FACT_ID);
  if (!fact) return Object.freeze([`missing Ciaccona source fact ${SOURCE_FACT_ID}`]);
  if (fact.scope !== 'TEAM') issues.push(`${SOURCE_FACT_ID}: expected TEAM scope, got ${String(fact.scope)}`);
  if (fact.durationSeconds !== null) issues.push(`${SOURCE_FACT_ID}: expected source durationSeconds=null`);
  if (fact.maxStacks !== 1) issues.push(`${SOURCE_FACT_ID}: expected maxStacks=1`);
  if (!fact.effectSummary.includes('24% Aero DMG Bonus')) {
    issues.push(`${SOURCE_FACT_ID}: expected 24% Aero DMG Bonus source text`);
  }
  if (!fact.effectSummary.includes('not stackable')) {
    issues.push(`${SOURCE_FACT_ID}: expected explicit non-stackable source text`);
  }
  return Object.freeze(issues);
}

const CONTRACT_ISSUES = validateCiacconaSoloConcertExternalStateContract();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Ciaccona Solo Concert external-state contract: ${CONTRACT_ISSUES.join('; ')}`);
}
