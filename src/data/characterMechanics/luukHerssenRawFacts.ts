import type { CharacterActionFact, CharacterMechanicFact } from '../../characterMechanicsDomain.ts';
import { LUUK_HERSSEN_ACTION_FACTS_A } from './luukHerssenRawActionsA.ts';
import { LUUK_HERSSEN_ACTION_FACTS_B } from './luukHerssenRawActionsB.ts';
import { LUUK_HERSSEN_PASSIVE_FACTS, LUUK_HERSSEN_RESOURCE_FACTS, LUUK_HERSSEN_SEQUENCE_FACTS } from './luukHerssenRawSupport.ts';

export { LUUK_HERSSEN_PROVENANCE } from './luukHerssenRawBase.ts';
export { LUUK_HERSSEN_PASSIVE_FACTS, LUUK_HERSSEN_RESOURCE_FACTS, LUUK_HERSSEN_SEQUENCE_FACTS } from './luukHerssenRawSupport.ts';

export const LUUK_HERSSEN_ACTION_FACTS: readonly CharacterActionFact[] = [
  ...LUUK_HERSSEN_ACTION_FACTS_A,
  ...LUUK_HERSSEN_ACTION_FACTS_B,
] as const;

export const LUUK_HERSSEN_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...LUUK_HERSSEN_ACTION_FACTS,
  ...LUUK_HERSSEN_RESOURCE_FACTS,
  ...LUUK_HERSSEN_PASSIVE_FACTS,
  ...LUUK_HERSSEN_SEQUENCE_FACTS,
] as const;
