import type { CharacterActionFact, CharacterMechanicFact } from '../../characterMechanicsDomain.ts';
import { REBECCA_ACTION_FACTS_A } from './rebeccaRawActionsA.ts';
import { REBECCA_ACTION_FACTS_B } from './rebeccaRawActionsB.ts';
import { REBECCA_PASSIVE_FACTS, REBECCA_RESOURCE_FACTS, REBECCA_SEQUENCE_FACTS } from './rebeccaRawSupport.ts';

export { REBECCA_PROVENANCE } from './rebeccaRawBase.ts';
export { REBECCA_PASSIVE_FACTS, REBECCA_RESOURCE_FACTS, REBECCA_SEQUENCE_FACTS } from './rebeccaRawSupport.ts';

export const REBECCA_ACTION_FACTS: readonly CharacterActionFact[] = [
  ...REBECCA_ACTION_FACTS_A,
  ...REBECCA_ACTION_FACTS_B,
] as const;

export const REBECCA_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...REBECCA_ACTION_FACTS,
  ...REBECCA_RESOURCE_FACTS,
  ...REBECCA_PASSIVE_FACTS,
  ...REBECCA_SEQUENCE_FACTS,
] as const;
