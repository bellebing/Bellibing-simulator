import type {
  CharacterMechanicFact,
  CharacterMechanicsProfile,
} from '../characterMechanicsDomain.ts';
import {
  CHARACTER_MECHANIC_FACTS as BASE_CHARACTER_MECHANIC_FACTS,
  CHARACTER_MECHANICS_PROFILES as BASE_CHARACTER_MECHANICS_PROFILES,
} from './characterMechanicsBase.ts';
import { ROVER_ELECTRO_CHARACTER_MECHANIC_FACTS } from './characterMechanics/roverElectroRawFacts.ts';
import { SUISUI_CHARACTER_MECHANIC_FACTS } from './characterMechanics/suisuiRawFacts.ts';
import { FINAL_BLOCKER_RESOLVED_TUNE_BREAK_FACTS } from './characterMechanics/finalBlockerResolvedTuneBreakFacts.ts';
import { FINAL_BLOCKER_RESOLVED_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/finalBlockerResolvedProfiles.ts';

export * from './characterMechanicsBase.ts';
export {
  ROVER_ELECTRO_ACTION_FACTS,
  ROVER_ELECTRO_CHARACTER_MECHANIC_FACTS,
  ROVER_ELECTRO_PASSIVE_FACTS,
  ROVER_ELECTRO_PROVENANCE,
  ROVER_ELECTRO_RESOURCE_FACTS,
  ROVER_ELECTRO_SEQUENCE_FACTS,
} from './characterMechanics/roverElectroRawFacts.ts';
export {
  SUISUI_ACTION_FACTS,
  SUISUI_CHARACTER_MECHANIC_FACTS,
  SUISUI_PASSIVE_FACTS,
  SUISUI_PROVENANCE,
  SUISUI_RESOURCE_FACTS,
  SUISUI_SEQUENCE_FACTS,
} from './characterMechanics/suisuiRawFacts.ts';
export {
  FINAL_BLOCKER_RESOLVED_TUNE_BREAK_FACTS,
  ROVER_ELECTRO_TUNE_BREAK_FACT,
  SUISUI_TUNE_BREAK_FACT,
} from './characterMechanics/finalBlockerResolvedTuneBreakFacts.ts';
export {
  FINAL_BLOCKER_RESOLVED_CHARACTER_MECHANICS_PROFILES,
  ROVER_ELECTRO_CHARACTER_MECHANICS_PROFILE,
  SUISUI_CHARACTER_MECHANICS_PROFILE,
} from './characterMechanics/finalBlockerResolvedProfiles.ts';

export const CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...BASE_CHARACTER_MECHANIC_FACTS,
  ...ROVER_ELECTRO_CHARACTER_MECHANIC_FACTS,
  ...SUISUI_CHARACTER_MECHANIC_FACTS,
  ...FINAL_BLOCKER_RESOLVED_TUNE_BREAK_FACTS,
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
  ...FINAL_BLOCKER_RESOLVED_CHARACTER_MECHANICS_PROFILES,
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
