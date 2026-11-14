import { readFileSync } from 'node:fs';

interface SourceCharacter {
  characterId: string;
  moves: readonly { id: number; type: number; name: string }[];
}

/**
 * Original 3.7 Mechanics completion audits must use original 3.7 Hsin/Jingran
 * moves, even when Hsin later gained a different 3.8 UI source tree.
 * The raw/presentation 3.8 import is verified independently and stays intact.
 * This is a source-scoped read-only merge, never a hidden gameplay promotion.
 */
export function readReviewedCharacterKitSources(): { characters: readonly SourceCharacter[] } {
  const presentation = JSON.parse(readFileSync(new URL('../../data/source/character-forte-ui.json', import.meta.url), 'utf8')) as { characters: SourceCharacter[] };
  const original37 = JSON.parse(readFileSync(new URL('../../data/source/character-release-3.7.json', import.meta.url), 'utf8')) as {
    characters: { characterId: string; skills: { source: { Id: number; SkillType: number }; name: string }[] }[];
  };
  const currentIds = presentation.characters.map(row => row.characterId);
  if (new Set(currentIds).size !== currentIds.length) throw Error('Duplicate Character ID in presentation Skills/Forte source');
  // Character Mechanics profiles are still pinned to the 3.7 move identities.
  // Never compare a changed 3.8 UI move ID to the historical 3.7 source as if
  // they were one patch: the two evidence owners have separate contracts.
  const supplementalIds = new Set(['hsin', 'jingran']);
  const supplements = [...supplementalIds].map(characterId => {
    const rows = original37.characters.filter(row => row.characterId === characterId);
    if (rows.length !== 1 || !rows[0].skills.length) {
      throw Error('Original 3.7 Character kit source missing/duplicate: ' + characterId);
    }
    return { characterId, moves: rows[0].skills.map(skill => ({
      id: skill.source.Id, type: skill.source.SkillType, name: skill.name,
    })) };
  });
  // Hsin's current UI row is valid for Build but cannot replace 3.7 Mechanics
  // source review without a separate exact-patch migration and parity audit.
  const reviewed = presentation.characters.filter(row => !supplementalIds.has(row.characterId));
  return { characters: [...reviewed, ...supplements] };
}
