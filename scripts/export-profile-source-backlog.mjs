import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { assertProfileReadinessAudit } from '../src/profileReadinessRegistry.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEGACY_RESEARCH_PATH = path.join(ROOT, 'data/research/profile-source-roster-2026-08-29.json');

function parseArgs(argv) {
  const args = { output: 'data/generated/profile-source-backlog.json' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--output') args.output = argv[++index] ?? args.output;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function sourceUrlByCharacter(legacyInput) {
  return new Map((legacyInput.characters ?? []).flatMap((character) => {
    const url = character?.sources?.[0]?.url;
    return typeof character?.characterId === 'string' && typeof url === 'string'
      ? [[character.characterId, url]]
      : [];
  }));
}

const args = parseArgs(process.argv.slice(2));
const readiness = assertProfileReadinessAudit();
const legacyInput = JSON.parse(await fs.readFile(LEGACY_RESEARCH_PATH, 'utf8'));
const sourceUrls = sourceUrlByCharacter(legacyInput);
const rowsByCharacter = new Map(readiness.characters.map((row) => [row.characterId, row]));

const characters = readiness.profileSourcePendingIds.map((characterId) => {
  const readinessRow = rowsByCharacter.get(characterId);
  const sourceUrl = sourceUrls.get(characterId) ?? `https://www.prydwen.gg/wuthering-waves/characters/${characterId}`;
  return {
    characterId,
    disposition: 'PROFILE_SOURCE_PENDING',
    sourceUrl,
    rawDpsBlockers: [...(readinessRow?.rawDpsBlockers ?? [])],
    intrinsicDpsBlocked: readinessRow?.intrinsicDpsBlocked === true,
    mechanicsSourceBlocked: readinessRow?.mechanicsSourceBlocked === true,
  };
});

const output = {
  kind: 'PROFILE_SOURCE_BACKLOG',
  generatedAt: new Date().toISOString(),
  registrySource: 'src/profileReadinessRegistry.ts',
  readinessSummary: {
    releasedCharacterCount: readiness.releasedCharacterCount,
    profileSourcePendingCount: readiness.profileSourcePendingCount,
    profileCompletePendingFreezeCount: readiness.profileCompletePendingFreezeCount,
    characterMechanicsSourceBlockedCount: readiness.characterMechanicsSourceBlockedCount,
    dpsReadyCount: readiness.dpsReadyCount,
  },
  characters,
};

if (characters.length !== readiness.profileSourcePendingCount) {
  throw new Error(`Backlog coverage mismatch: ${characters.length}/${readiness.profileSourcePendingCount}`);
}

const outputPath = path.resolve(ROOT, args.output);
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Profile source backlog: ${characters.length} registry-derived PROFILE_SOURCE_PENDING characters.`);
console.log(`Wrote ${path.relative(ROOT, outputPath)}`);
