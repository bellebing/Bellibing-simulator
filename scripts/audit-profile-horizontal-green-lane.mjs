import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_SUBSET = 'data/research/profile-horizontal-source-candidates-2026-08-30.json';
const SEMANTIC_REVIEW = 'data/research/profile-horizontal-semantic-review-2026-08-30.json';
const CANONICAL_MAPPINGS = 'data/research/profile-horizontal-canonical-mappings-2026-08-30.json';
const CANONICAL_MODULE = 'src/data/profileHorizontalGreenLane20260830.ts';

const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'bellibing-profile-horizontal-'));
const generatedSubset = path.join(tempRoot, 'profile-horizontal-source-candidates-2026-08-30.json');
const generatedModule = path.join(tempRoot, 'profileHorizontalGreenLane20260830.ts');

try {
  execFileSync(
    process.execPath,
    [
      '--experimental-strip-types',
      path.join(ROOT, 'scripts/generate-profile-horizontal-green-lane.mjs'),
      '--snapshot', SOURCE_SUBSET,
      '--review', SEMANTIC_REVIEW,
      '--canonical-mappings', CANONICAL_MAPPINGS,
      '--candidate-snapshot-output', generatedSubset,
      '--output', generatedModule,
    ],
    { cwd: ROOT, stdio: 'inherit' },
  );

  const [committedSubset, regeneratedSubset, committedModule, regeneratedModule] = await Promise.all([
    fs.readFile(path.join(ROOT, SOURCE_SUBSET)),
    fs.readFile(generatedSubset),
    fs.readFile(path.join(ROOT, CANONICAL_MODULE)),
    fs.readFile(generatedModule),
  ]);

  if (!committedSubset.equals(regeneratedSubset)) {
    throw new Error(`${SOURCE_SUBSET} drifted from deterministic regeneration`);
  }
  if (!committedModule.equals(regeneratedModule)) {
    throw new Error(`${CANONICAL_MODULE} drifted from deterministic regeneration`);
  }

  const review = JSON.parse(await fs.readFile(path.join(ROOT, SEMANTIC_REVIEW), 'utf8'));
  const approved = review.entries.filter((entry) => entry.decision === 'APPROVED_FOR_CANONICAL_VERIFIED');
  const parked = review.entries.filter((entry) => entry.decision === 'PARKED_SEMANTIC_AMBIGUITY');
  if (approved.length !== 13 || parked.length !== 11) {
    throw new Error(`horizontal semantic review count drift: approved=${approved.length}, parked=${parked.length}`);
  }

  console.log(`Horizontal green-lane audit OK: approved=${approved.length}, parked=${parked.length}.`);
  console.log('Committed approved source subset and canonical TypeScript are byte-identical to deterministic regeneration.');
} finally {
  await fs.rm(tempRoot, { recursive: true, force: true });
}
