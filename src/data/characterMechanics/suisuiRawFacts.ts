import type { CharacterActionFact, CharacterMechanicFact } from '../../characterMechanicsDomain.ts';
import { SUISUI_ACTION_FACTS_A } from './suisuiRawActionsA.ts';
import { SUISUI_ACTION_FACTS_B } from './suisuiRawActionsB.ts';
import { SUISUI_RESOURCE_FACTS, SUISUI_PASSIVE_FACTS, SUISUI_SEQUENCE_FACTS } from './suisuiRawSupport.ts';

export { SUISUI_PROVENANCE } from './suisuiRawBase.ts';
export { SUISUI_RESOURCE_FACTS, SUISUI_PASSIVE_FACTS, SUISUI_SEQUENCE_FACTS } from './suisuiRawSupport.ts';

export const SUISUI_ACTION_FACTS: readonly CharacterActionFact[] = [
  ...SUISUI_ACTION_FACTS_A,
  ...SUISUI_ACTION_FACTS_B,
] as const;

export const SUISUI_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...SUISUI_ACTION_FACTS,
  ...SUISUI_RESOURCE_FACTS,
  ...SUISUI_PASSIVE_FACTS,
  ...SUISUI_SEQUENCE_FACTS,
] as const;
