import { readFileSync } from 'node:fs';

interface SourceCharacter {
  characterId: string;
  moves: readonly { id: number; type: number; name: string }[];
}

/** One source-backed move set per released Character. Preserve the pinned 3.7
 * supplement for Jingran while accepting Hsin's newly imported 3.8 source.
 * Duplicate or conflicting source identity must fail, never be silently dropped.
 */
export function readReviewedCharacterKitSources(): { characters: readonly SourceCharacter[] } {
  const legacy = JSON.parse(readFileSync(new URL('../../data/source/character-forte-ui.json', import.meta.url), 'utf8')) as { characters: SourceCharacter[] };
  const release = JSON.parse(readFileSync(new URL('../../data/source/character-release-3.7.json', import.meta.url), 'utf8')) as {
    characters: { characterId: string; skills: { source: { Id: number; SkillType: number }; name: string }[] }[];
  };
  const sourceIds = legacy.characters.map(row => row.characterId);
  if (new Set(sourceIds).size !== sourceIds.length) throw Error('Duplicate Character ID in reviewed Skills/Forte source');
  const supplements: SourceCharacter[] = [];
  for (const characterId of ['hsin', 'jingran']) {
    const sourceRows = release.characters.filter(row => row.characterId === characterId);
    if (sourceRows.length !== 1) throw Error('Original 3.7 Character kit supplement missing/duplicate: ' + characterId);
    const [source] = sourceRows;
    const originalMoves = source.skills.map(skill => ({
      id: skill.source.Id, type: skill.source.SkillType, name: skill.name,
    }));
    const existing = legacy.characters.find(row => row.characterId === characterId);
    if (existing) {
      const signature = (moves: readonly { id: number; type: number }[]) =>
        [...moves].map(row => row.id + ':' + row.type).sort();
      if (JSON.stringify(signature(existing.moves)) !== JSON.stringify(signature(originalMoves))) {
        throw Error('Imported Character kit differs from original 3.7 move identities: ' + characterId);
      }
      continue; // Already represented by the newer reviewed source; do not double count.
    }
    supplements.push({ characterId, moves: originalMoves });
  }
  return { characters: [...legacy.characters, ...supplements] };
}
