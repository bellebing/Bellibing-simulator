import { readFileSync } from 'node:fs';

interface SourceCharacter {
  characterId: string;
  moves: readonly { id: number; type: number; name: string }[];
}

/** Existing reviewed source names plus the two original released-kit supplements. */
export function readReviewedCharacterKitSources(): { characters: readonly SourceCharacter[] } {
  const legacy = JSON.parse(readFileSync(new URL('../../data/source/character-forte-ui.json', import.meta.url), 'utf8')) as { characters: SourceCharacter[] };
  const release = JSON.parse(readFileSync(new URL('../../data/source/character-release-3.7.json', import.meta.url), 'utf8')) as {
    characters: { characterId: string; skills: { source: { Id: number; SkillType: number }; name: string }[] }[];
  };
  const supplements = release.characters.filter(c => ['hsin', 'jingran'].includes(c.characterId));
  if (supplements.length !== 2 || legacy.characters.some(c => supplements.some(s => s.characterId === c.characterId))) {
    throw Error('Released kit source supplements missing or overlapping legacy source');
  }
  return { characters: [...legacy.characters, ...supplements.map(c => ({
    characterId: c.characterId,
    moves: c.skills.map(skill => ({ id: skill.source.Id, type: skill.source.SkillType, name: skill.name })),
  }))] };
}
