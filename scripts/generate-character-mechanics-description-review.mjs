import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { buildCharacterMechanicsDescriptionReview } from './lib/character-mechanics-description-review.mjs';

const DEFAULT_INPUT = 'data/generated/character-mechanics-candidates.json';
const DEFAULT_OUT = 'data/generated/character-mechanics-description-review.json';

function parseArgs(argv) {
  const args = {
    input: DEFAULT_INPUT,
    out: DEFAULT_OUT,
    characterId: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--input' || arg === '--out' || arg === '--character') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value.`);
      index += 1;
      if (arg === '--input') args.input = value;
      if (arg === '--out') args.out = value;
      if (arg === '--character') args.characterId = value;
      continue;
    }
    if (arg === '--help') {
      console.log(`Usage: npm run review:character-mechanics-descriptions -- [options]\n\n` +
        `  --input <file>               Candidate import JSON from sync:character-mechanics\n` +
        `  --out <file>                 Description review JSON output path\n` +
        `  --character <bellibing-id>   Emit one imported character only\n`);
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

async function writeJson(path, value) {
  const absolute = resolve(path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const candidate = JSON.parse(await readFile(resolve(args.input), 'utf8'));
  const review = buildCharacterMechanicsDescriptionReview(candidate, { characterId: args.characterId });
  await writeJson(args.out, review);

  const counts = review.summary;
  console.log(
    `Character Mechanics description review: ${counts.characters} characters, ` +
    `${counts.movesWithParameters} moves with source parameters, ` +
    `${counts.parsedParameters} structured parameters, ` +
    `${counts.rawParameters} raw parameters left.`,
  );
  console.log(
    `Ready for semantic review: ${counts.readyForSemanticReview}; ` +
    `source review required: ${counts.sourceReviewRequired}.`,
  );
  console.log(`Description review artifact: ${args.out}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
