import type { CharacterActionFact, CharacterMechanicFact } from '../../characterMechanicsDomain.ts';
import { LUCY_ACTION_FACTS_A } from './lucyRawActionsA.ts';
import { LUCY_ACTION_FACTS_B } from './lucyRawActionsB.ts';
import { LUCY_PASSIVE_FACTS, LUCY_RESOURCE_FACTS, LUCY_SEQUENCE_FACTS } from './lucyRawSupport.ts';

export { LUCY_PROVENANCE } from './lucyRawBase.ts';
export { LUCY_PASSIVE_FACTS, LUCY_RESOURCE_FACTS, LUCY_SEQUENCE_FACTS } from './lucyRawSupport.ts';

export const LUCY_ACTION_FACTS: readonly CharacterActionFact[] = [
  ...LUCY_ACTION_FACTS_A,
  ...LUCY_ACTION_FACTS_B,
] as const;

export const LUCY_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...LUCY_ACTION_FACTS,
  ...LUCY_RESOURCE_FACTS,
  ...LUCY_PASSIVE_FACTS,
  ...LUCY_SEQUENCE_FACTS,
] as const;
