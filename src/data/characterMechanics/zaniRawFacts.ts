import type { CharacterActionFact, CharacterMechanicFact } from '../../characterMechanicsDomain.ts';
import { ZANI_ACTION_FACTS_A } from './zaniRawActionsA.ts';
import { ZANI_ACTION_FACTS_B } from './zaniRawActionsB.ts';
import { ZANI_PASSIVE_FACTS, ZANI_RESOURCE_FACTS, ZANI_SEQUENCE_FACTS } from './zaniRawSupport.ts';

export { ZANI_PROVENANCE } from './zaniRawBase.ts';
export { ZANI_PASSIVE_FACTS, ZANI_RESOURCE_FACTS, ZANI_SEQUENCE_FACTS } from './zaniRawSupport.ts';

export const ZANI_ACTION_FACTS: readonly CharacterActionFact[] = [
  ...ZANI_ACTION_FACTS_A,
  ...ZANI_ACTION_FACTS_B,
] as const;

export const ZANI_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...ZANI_ACTION_FACTS,
  ...ZANI_RESOURCE_FACTS,
  ...ZANI_PASSIVE_FACTS,
  ...ZANI_SEQUENCE_FACTS,
] as const;
