import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COHORTS = [
  {
    label: '2026-08-30',
    sourceSubset: 'data/research/profile-horizontal-source-candidates-2026-08-30.json',
    semanticReview: 'data/research/profile-horizontal-semantic-review-2026-08-30.json',
    canonicalMappings: 'data/research/profile-horizontal-canonical-mappings-2026-08-30.json',
    canonicalModule: 'src/data/profileHorizontalGreenLane20260830.ts',
    approved: 13,
    parked: 11,
  },
  {
    label: '2026-08-31',
    sourceSubset: 'data/research/profile-horizontal-source-candidates-2026-08-31.json',
    semanticReview: 'data/research/profile-horizontal-semantic-review-2026-08-31.json',
    canonicalMappings: 'data/research/profile-horizontal-canonical-mappings-2026-08-31.json',
    canonicalSplitDir: 'src/data/profileHorizontalGreenLane20260831',
    approved: 6,
    parked: 6,
  },
];

async function assertEqualFile(committedPath, generatedPath) {
  const [committed, regenerated] = await Promise.all([
    fs.readFile(path.join(ROOT, committedPath)),
    fs.readFile(generatedPath),
  ]);
  if (!committed.equals(regenerated)) {
    throw new Error(`${committedPath} drifted from deterministic regeneration`);
  }
}

async function assertEqualJsonFile(committedPath, generatedPath) {
  const [committed, regenerated] = await Promise.all([
    fs.readFile(path.join(ROOT, committedPath), 'utf8'),
    fs.readFile(generatedPath, 'utf8'),
  ]);
  if (!isDeepStrictEqual(JSON.parse(committed), JSON.parse(regenerated))) {
    throw new Error(`${committedPath} semantic JSON drifted from deterministic regeneration`);
  }
}

async function assertEqualDirectory(committedDir, generatedDir) {
  const [committedNames, generatedNames] = await Promise.all([
    fs.readdir(path.join(ROOT, committedDir)),
    fs.readdir(generatedDir),
  ]);
  committedNames.sort();
  generatedNames.sort();
  if (JSON.stringify(committedNames) !== JSON.stringify(generatedNames)) {
    throw new Error(`${committedDir} file set drifted from deterministic regeneration`);
  }
  for (const name of committedNames) {
    await assertEqualFile(path.join(committedDir, name), path.join(generatedDir, name));
  }
}

const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'bellibing-profile-horizontal-'));

try {
  for (const cohort of COHORTS) {
    const cohortTemp = path.join(tempRoot, cohort.label);
    await fs.mkdir(cohortTemp, { recursive: true });
    const generatedSubset = path.join(cohortTemp, path.basename(cohort.sourceSubset));
    const args = [
      '--experimental-strip-types',
      path.join(ROOT, 'scripts/generate-profile-horizontal-green-lane.mjs'),
      '--snapshot', cohort.sourceSubset,
      '--review', cohort.semanticReview,
      '--canonical-mappings', cohort.canonicalMappings,
      '--candidate-snapshot-output', generatedSubset,
    ];

    let generatedCanonical;
    if (cohort.canonicalModule) {
      generatedCanonical = path.join(cohortTemp, path.basename(cohort.canonicalModule));
      args.push('--output', generatedCanonical);
    } else {
      generatedCanonical = path.join(cohortTemp, 'split');
      args.push('--split-output-dir', path.relative(ROOT, generatedCanonical));
    }

    execFileSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' });

    await assertEqualJsonFile(cohort.sourceSubset, generatedSubset);
    if (cohort.canonicalModule) {
      await assertEqualFile(cohort.canonicalModule, generatedCanonical);
    } else {
      await assertEqualDirectory(cohort.canonicalSplitDir, generatedCanonical);
    }

    const review = JSON.parse(await fs.readFile(path.join(ROOT, cohort.semanticReview), 'utf8'));
    const approved = review.entries.filter((entry) => entry.decision === 'APPROVED_FOR_CANONICAL_VERIFIED');
    const parked = review.entries.filter((entry) => entry.decision === 'PARKED_SEMANTIC_AMBIGUITY');
    if (approved.length !== cohort.approved || parked.length !== cohort.parked) {
      throw new Error(`${cohort.label} horizontal semantic review count drift: approved=${approved.length}, parked=${parked.length}`);
    }

    console.log(`Horizontal green-lane ${cohort.label} audit OK: approved=${approved.length}, parked=${parked.length}.`);
  }
  console.log('Committed horizontal source subsets are structurally identical to regeneration; canonical TypeScript is byte-identical.');
} finally {
  await fs.rm(tempRoot, { recursive: true, force: true });
}
