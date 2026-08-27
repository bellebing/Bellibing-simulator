import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { buildCharacterMechanicsCandidateImport } from './lib/character-mechanics-import.mjs';

const UPSTREAM_REPO = 'DommyMM/wuwabuild';
const DEFAULT_OUT = 'data/generated/character-mechanics-candidates.json';
const DEFAULT_SUMMARY_OUT = 'data/generated/character-mechanics-candidates.summary.json';
const CHECKED_AT = process.env.BELLIBING_SYNC_DATE ?? new Date().toISOString().slice(0, 10);

function parseArgs(argv) {
  const args = {
    out: DEFAULT_OUT,
    summaryOut: DEFAULT_SUMMARY_OUT,
    input: null,
    characterId: null,
    allowUnmatched: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--allow-unmatched') {
      args.allowUnmatched = true;
      continue;
    }
    if (arg === '--out' || arg === '--summary-out' || arg === '--input' || arg === '--character') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value.`);
      index += 1;
      if (arg === '--out') args.out = value;
      if (arg === '--summary-out') args.summaryOut = value;
      if (arg === '--input') args.input = value;
      if (arg === '--character') args.characterId = value;
      continue;
    }
    if (arg === '--help') {
      console.log(`Usage: npm run sync:character-mechanics -- [options]\n\n` +
        `  --character <bellibing-id>  Import one RELEASED character only\n` +
        `  --input <file>              Use a local normalized Characters.json instead of fetching upstream\n` +
        `  --out <file>                Candidate JSON output path\n` +
        `  --summary-out <file>        Compact review summary path\n` +
        `  --allow-unmatched           Do not fail when released roster names are missing/ambiguous\n`);
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Bellibing-simulator character mechanics source sync',
      Accept: 'application/vnd.github+json, application/json',
    },
  });
  if (!response.ok) throw new Error(`Fetch failed ${response.status}: ${url}`);
  return response.json();
}

async function resolveSource(inputPath) {
  if (inputPath) {
    const sourcePayload = JSON.parse(await readFile(resolve(inputPath), 'utf8'));
    return {
      sourcePayload,
      sourceCommit: 'LOCAL_INPUT',
      sourceRepository: `${UPSTREAM_REPO} compatible local snapshot`,
    };
  }

  const commit = await fetchJson(`https://api.github.com/repos/${UPSTREAM_REPO}/commits/main`);
  const sourceCommit = commit?.sha;
  if (typeof sourceCommit !== 'string' || sourceCommit.length < 7) {
    throw new Error('Could not resolve upstream character source commit SHA.');
  }
  const sourceUrl = `https://raw.githubusercontent.com/${UPSTREAM_REPO}/${sourceCommit}/public/Data/Characters.json`;
  const sourcePayload = await fetchJson(sourceUrl);
  return { sourcePayload, sourceCommit, sourceRepository: UPSTREAM_REPO };
}

async function writeJson(path, value) {
  const absolute = resolve(path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function compactSummary(candidate) {
  return {
    kind: candidate.kind,
    importStatus: candidate.importStatus,
    verificationStatus: candidate.verificationStatus,
    source: candidate.source,
    summary: candidate.summary,
    unmatched: candidate.unmatched,
    ambiguous: candidate.ambiguous,
    characters: candidate.characters.map((character) => ({
      bellibingCharacterId: character.bellibingCharacterId,
      bellibingName: character.bellibingName,
      sourceCharacterId: character.sourceCharacterId,
      sourceName: character.sourceName,
      reviewStatus: character.reviewStatus,
      issues: character.issues,
      counts: character.counts,
      reviewRows: character.moves
        .filter((move) => move.reviewStatus === 'NEEDS_REVIEW')
        .map((move) => ({
          sourceMoveId: move.sourceMoveId,
          name: move.name,
          sectionCandidate: move.sectionCandidate,
          issues: move.issues,
          rawOnlyRows: move.values
            .filter((row) => row.parsedCoefficient === null && row.rawValues.some((value) => value.includes('%')))
            .map((row) => ({
              sourceValueId: row.sourceValueId,
              name: row.name,
              rawValues: row.rawValues,
            })),
        })),
    })),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { sourcePayload, sourceCommit, sourceRepository } = await resolveSource(args.input);
  const candidate = buildCharacterMechanicsCandidateImport({
    sourcePayload,
    roster: CHARACTER_CATALOG,
    sourceRepository,
    sourceCommit,
    checkedAt: CHECKED_AT,
    characterId: args.characterId,
  });
  const summary = compactSummary(candidate);

  await Promise.all([
    writeJson(args.out, candidate),
    writeJson(args.summaryOut, summary),
  ]);

  const counts = candidate.summary;
  console.log(
    `Character Mechanics candidate import: ${counts.matchedCharacters}/${counts.requestedReleasedCharacters} matched, ` +
    `${counts.parsedCoefficientRows} exact ten-level coefficient rows parsed, ` +
    `${counts.charactersNeedingReview} characters flagged for review.`,
  );
  console.log(`Source: ${sourceRepository}@${sourceCommit}`);
  console.log(`Candidate: ${args.out}`);
  console.log(`Review summary: ${args.summaryOut}`);

  if (!args.allowUnmatched && (counts.unmatchedCharacters > 0 || counts.ambiguousCharacters > 0)) {
    const missing = candidate.unmatched.map((entry) => entry.id).join(', ') || 'none';
    const ambiguous = candidate.ambiguous.map((entry) => entry.id).join(', ') || 'none';
    throw new Error(
      `Released roster source match is incomplete. Unmatched: ${missing}. Ambiguous: ${ambiguous}. ` +
      `Use --allow-unmatched only for exploratory review; canonical ingestion stays blocked.`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
