import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { buildProfileCandidateReview } from './lib/profile-candidate-review.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const args = { input: null, output: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--input') args.input = argv[++index] ?? null;
    else if (arg === '--output') args.output = argv[++index] ?? null;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!args.input) throw new Error('Usage: node scripts/generate-profile-candidate-review.mjs --input <json> [--output <json>]');
  return args;
}

const args = parseArgs(process.argv.slice(2));
const inputPath = path.resolve(ROOT, args.input);
const outputPath = path.resolve(ROOT, args.output ?? 'data/generated/profile-candidate-review.json');
const input = JSON.parse(await fs.readFile(inputPath, 'utf8'));
const review = buildProfileCandidateReview(input);
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(review, null, 2)}\n`, 'utf8');

console.log(`Profile candidate review: ${review.characters.length} characters`);
console.log(`Source dispositions: ${JSON.stringify(review.sourceDispositionCounts)}`);
console.log(`Execution dispositions: ${JSON.stringify(review.executionDispositionCounts)}`);
console.log(`Wrote ${path.relative(ROOT, outputPath)}`);
