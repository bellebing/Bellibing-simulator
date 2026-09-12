import type { CharacterMechanicFact } from '../characterMechanicsDomain.ts';
import { readCharacterActionValues } from '../characterActionValues.ts';
import { getCharacterMechanicFact, getCharacterMechanicsProfile } from '../data/characterMechanics.ts';

export const ROVER_WINDSTRINGS_GAIN_ID = 'rover-windstrings-explicit-gain-v1';
const RESOURCE_ID = 'rover-aero-resource-windstrings';
const OWNER = 'rover-aero';
const SOURCE = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const ACTIONS = [
  { factId: 'rover-aero-intro-skill-relentless-squall-skill-dmg', eventKind: 'INTRO_CAST' },
  { factId: 'rover-aero-forte-circuit-cycle-of-wind-cloudburst-dance-stage-1-dmg', eventKind: 'CLOUDBURST_STAGE_HIT' },
  { factId: 'rover-aero-forte-circuit-cycle-of-wind-cloudburst-dance-stage-2-dmg', eventKind: 'CLOUDBURST_STAGE_HIT' },
] as const;

function reviewed(fact: CharacterMechanicFact): boolean {
  const profile = getCharacterMechanicsProfile(OWNER);
  return fact.characterId === OWNER && fact.verificationStatus === 'VERIFIED'
    && fact.provenance.checkedAt === '2026-08-29' && fact.provenance.sourceUrls?.includes(SOURCE) === true
    && profile?.verificationStatus === 'VERIFIED' && profile.factIds.includes(fact.factId);
}

/** Read nominal gains from the existing canonical rule; never a pool/cap/ER model. */
export function readRoverWindstringsGains(fact: CharacterMechanicFact) {
  if (fact.factId !== RESOURCE_ID || fact.kind !== 'RESOURCE' || !reviewed(fact)
    || fact.modelingStatus !== 'RAW_ONLY' || fact.resourceName !== 'Windstrings'
    || fact.section !== 'FORTE_CIRCUIT' || fact.conditional !== false) throw new Error('Unsupported Windstrings source fact');
  const match = fact.ruleSummary.match(/^Rover holds up to ([0-9]+) Windstrings\. Each Cloudburst Dance stage restores ([0-9]+) on hit; Intro restores ([0-9]+); Basic Stage 3\/4 and Dodge Counter hits restore ([0-9]+)\. Each Unbound Flow stage consumes ([0-9]+)\.$/);
  if (!match) throw new Error('Windstrings rule requires renewed semantic review');
  const values = match.slice(1).map(Number);
  if (!values.every(n => Number.isSafeInteger(n) && n > 0 && n <= values[0]) || values[0] !== fact.maxValue) {
    throw new Error('Invalid canonical Windstrings values');
  }
  return { cloudburstNominalGain: values[1], introNominalGain: values[2] };
}

export function listRoverWindstringsGainSupport() {
  const resource = getCharacterMechanicFact(RESOURCE_ID);
  if (!resource) throw new Error('Missing canonical Windstrings');
  readRoverWindstringsGains(resource);
  return ACTIONS.map(({ factId, eventKind }) => {
    const action = getCharacterMechanicFact(factId);
    if (!action || action.kind !== 'ACTION' || !reviewed(action) || action.modelingStatus !== 'MODEL_READY'
      || action.actionRole !== 'DAMAGE' || (eventKind === 'INTRO_CAST'
        ? action.section !== 'INTRO_SKILL' || action.actionKind !== 'INTRO' || action.conditional !== false
        : action.section !== 'FORTE_CIRCUIT' || action.actionKind !== 'BASIC' || action.conditional !== true)) {
      throw new Error('Unreviewed Windstrings action identity');
    }
    if (eventKind === 'CLOUDBURST_STAGE_HIT') {
      const values = readCharacterActionValues(action, 10);
      if (values.status !== 'SOURCE_VALUES' || values.kind !== 'COEFFICIENTS'
        || values.components.length !== 1 || values.components[0].hitCount !== 1) {
        throw new Error('Cloudburst multi-hit resource semantics require separate review');
      }
    }
    return { characterId: OWNER, resourceFactId: RESOURCE_ID, actionFactId: factId, eventKind,
      primitiveId: ROVER_WINDSTRINGS_GAIN_ID, scope: 'NOMINAL_GAIN_ONLY' as const, sequence: 0 as const, skillLevel: 10 as const };
  });
}

export interface RoverWindstringsGainInput {
  readonly characterId: string;
  readonly resourceFactId: string;
  readonly actionFactId: string;
  readonly sequence: number;
  readonly maxSkills: boolean;
  readonly event: {
    readonly kind: 'INTRO_CAST' | 'CLOUDBURST_STAGE_HIT';
    readonly actorId: string;
    readonly atSeconds: number;
    /** Caller proves action availability and occurrence, including airborne access. */
    readonly sourceQualified: true;
    /** Required for Cloudburst: the one source component may land zero or one time. */
    readonly landedHitCount?: number;
    readonly targetId?: string;
  };
}

/** One explicit source event only. No implicit casts, deduplication, cooldown,
 * resource spending, team bonuses, initial state, cap clipping or DPS timeline. */
export function evaluateRoverWindstringsGain(input: RoverWindstringsGainInput) {
  const binding = listRoverWindstringsGainSupport().find(row => row.actionFactId === input.actionFactId);
  if (!binding || input.characterId !== OWNER || input.resourceFactId !== RESOURCE_ID
    || input.sequence !== 0 || input.maxSkills !== true) throw new Error('Unsupported Windstrings gain context');
  const event = input.event;
  if (!event || event.actorId !== OWNER || event.kind !== binding.eventKind || event.sourceQualified !== true
    || !Number.isFinite(event.atSeconds) || event.atSeconds < 0) throw new Error('Require exact source-qualified Windstrings event');
  const values = readRoverWindstringsGains(getCharacterMechanicFact(RESOURCE_ID)!);
  let nominalGain: number;
  if (event.kind === 'INTRO_CAST') {
    if (event.landedHitCount !== undefined || event.targetId !== undefined) throw new Error('Intro gain is per cast, not per damage component/hit');
    nominalGain = values.introNominalGain;
  } else {
    if ((event.landedHitCount !== 0 && event.landedHitCount !== 1)
      || (event.landedHitCount === 1 && (typeof event.targetId !== 'string' || !event.targetId.trim()))) {
      throw new Error('Cloudburst requires explicit zero/one landed hit and a target for an actual hit');
    }
    nominalGain = values.cloudburstNominalGain * event.landedHitCount;
  }
  return { resourceFactId: RESOURCE_ID, actionFactId: input.actionFactId, recipientId: OWNER,
    unit: 'Windstrings' as const, atSeconds: event.atSeconds, nominalGain, scope: 'NOMINAL_GAIN_ONLY' as const };
}
