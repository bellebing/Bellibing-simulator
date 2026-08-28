import type {
  CharacterMechanicFact,
  CharacterMechanicsProfile,
} from '../characterMechanicsDomain.ts';
import {
  CHARACTER_MECHANIC_FACTS as BASE_CHARACTER_MECHANIC_FACTS,
  CHARACTER_MECHANICS_PROFILES as BASE_CHARACTER_MECHANICS_PROFILES,
} from './characterMechanicsBase.ts';
import { CIACCONA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/ciacconaRawFacts.ts';
import { PHOEBE_CHARACTER_MECHANIC_FACTS } from './characterMechanics/phoebeRawFacts.ts';
import { THE_SHOREKEEPER_CHARACTER_MECHANIC_FACTS } from './characterMechanics/theShorekeeperRawFacts.ts';
import { JIANXIN_CHARACTER_MECHANIC_FACTS } from './characterMechanics/jianxinRawFacts.ts';
import { LUMI_CHARACTER_MECHANIC_FACTS } from './characterMechanics/lumiRawFacts.ts';
import { JINHSI_CHARACTER_MECHANIC_FACTS } from './characterMechanics/jinhsiRawFacts.ts';
import { EIGHTH_BATCH_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/eighthBatchProfiles.ts';

/**
 * Historical verified registry/profiles live in characterMechanicsBase.ts.
 * New roster batches compose here so existing source/provenance records stay
 * byte-identical while the canonical registry grows.
 */
export * from './characterMechanicsBase.ts';
export {
  CIACCONA_CHARACTER_MECHANICS_PROFILE,
  EIGHTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  JIANXIN_CHARACTER_MECHANICS_PROFILE,
  JINHSI_CHARACTER_MECHANICS_PROFILE,
  LUMI_CHARACTER_MECHANICS_PROFILE,
  PHOEBE_CHARACTER_MECHANICS_PROFILE,
  THE_SHOREKEEPER_CHARACTER_MECHANICS_PROFILE,
} from './characterMechanics/eighthBatchProfiles.ts';
export {
  CIACCONA_TUNE_BREAK_FACT,
  JIANXIN_TUNE_BREAK_FACT,
  JINHSI_TUNE_BREAK_FACT,
  LUMI_TUNE_BREAK_FACT,
  PHOEBE_TUNE_BREAK_FACT,
  THE_SHOREKEEPER_TUNE_BREAK_FACT,
} from './characterMechanics/tuneBreakFacts.ts';

export const CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...BASE_CHARACTER_MECHANIC_FACTS,
  ...CIACCONA_CHARACTER_MECHANIC_FACTS,
  ...PHOEBE_CHARACTER_MECHANIC_FACTS,
  ...THE_SHOREKEEPER_CHARACTER_MECHANIC_FACTS,
  ...JIANXIN_CHARACTER_MECHANIC_FACTS,
  ...LUMI_CHARACTER_MECHANIC_FACTS,
  ...JINHSI_CHARACTER_MECHANIC_FACTS,
] as const;

export const CHARACTER_MECHANIC_FACT_BY_ID: ReadonlyMap<string, CharacterMechanicFact> = (() => {
  const map = new Map<string, CharacterMechanicFact>();
  for (const fact of CHARACTER_MECHANIC_FACTS) {
    if (map.has(fact.factId)) throw new Error(`Duplicate character mechanic fact: ${fact.factId}`);
    map.set(fact.factId, fact);
  }
  return map;
})();

export function getCharacterMechanicFact(factId: string): CharacterMechanicFact | null {
  return CHARACTER_MECHANIC_FACT_BY_ID.get(factId) ?? null;
}

export function getCharacterActionFact(factId: string) {
  const fact = getCharacterMechanicFact(factId);
  return fact?.kind === 'ACTION' ? fact : null;
}

export const CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  ...BASE_CHARACTER_MECHANICS_PROFILES,
  ...EIGHTH_BATCH_CHARACTER_MECHANICS_PROFILES,
] as const;

export const CHARACTER_MECHANICS_PROFILE_BY_ID: ReadonlyMap<string, CharacterMechanicsProfile> = (() => {
  const map = new Map<string, CharacterMechanicsProfile>();
  for (const profile of CHARACTER_MECHANICS_PROFILES) {
    if (map.has(profile.characterId)) throw new Error(`Duplicate character mechanics profile: ${profile.characterId}`);
    for (const factId of profile.factIds) {
      const fact = CHARACTER_MECHANIC_FACT_BY_ID.get(factId);
      if (!fact) throw new Error(`${profile.characterId} references unknown mechanic fact ${factId}`);
      if (fact.characterId !== profile.characterId) throw new Error(`${profile.characterId} references mechanic fact owned by ${fact.characterId}: ${factId}`);
    }
    map.set(profile.characterId, profile);
  }
  return map;
})();

export function getCharacterMechanicsProfile(characterId: string): CharacterMechanicsProfile | null {
  return CHARACTER_MECHANICS_PROFILE_BY_ID.get(characterId) ?? null;
}
