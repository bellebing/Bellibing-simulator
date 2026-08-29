import type { CharacterActionFact, CharacterMechanicFact } from '../../characterMechanicsDomain.ts';
import { ROVER_ELECTRO_ACTION_FACTS_A } from './roverElectroRawActionsA.ts';
import { ROVER_ELECTRO_ACTION_FACTS_B } from './roverElectroRawActionsB.ts';
import { ROVER_ELECTRO_RESOURCE_FACTS, ROVER_ELECTRO_PASSIVE_FACTS, ROVER_ELECTRO_SEQUENCE_FACTS } from './roverElectroRawSupport.ts';

export { ROVER_ELECTRO_PROVENANCE } from './roverElectroRawBase.ts';
export { ROVER_ELECTRO_RESOURCE_FACTS, ROVER_ELECTRO_PASSIVE_FACTS, ROVER_ELECTRO_SEQUENCE_FACTS } from './roverElectroRawSupport.ts';

export const ROVER_ELECTRO_ACTION_FACTS: readonly CharacterActionFact[] = [
  ...ROVER_ELECTRO_ACTION_FACTS_A,
  ...ROVER_ELECTRO_ACTION_FACTS_B,
] as const;

export const ROVER_ELECTRO_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...ROVER_ELECTRO_ACTION_FACTS,
  ...ROVER_ELECTRO_RESOURCE_FACTS,
  ...ROVER_ELECTRO_PASSIVE_FACTS,
  ...ROVER_ELECTRO_SEQUENCE_FACTS,
] as const;
