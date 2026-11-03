import { CHARACTER_TARGET_PRESENTATIONS } from './improve-settings/character-targets.mjs';

/** Read generated source-owned presentation only; never writes settings or evaluates a build. */
export function recommendedCharacterStatsPresentation(characterId) {
  return structuredClone(CHARACTER_TARGET_PRESENTATIONS.find(item => item.characterId === characterId)?.rows ?? []);
}
