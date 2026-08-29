import { readFile } from 'node:fs/promises';
import { buildProfileCandidateReview } from './lib/profile-candidate-review.mjs';

const INPUT = new URL('../data/research/profile-source-roster-2026-08-29.json', import.meta.url);
const input = JSON.parse(await readFile(INPUT, 'utf8'));
const review = buildProfileCandidateReview(input);

if (review.canonicalWriteAllowed !== false || review.verificationStatus !== 'NOT_VERIFIED') {
  throw new Error('Profile candidate audit must remain fail-closed and review-only.');
}
if (review.characters.length !== 48) {
  throw new Error(`Expected 48 pending profile candidates, found ${review.characters.length}.`);
}

const classified = Object.values(review.sourceDispositionCounts).reduce((sum, value) => sum + value, 0);
if (classified !== review.characters.length) {
  throw new Error(`Disposition coverage mismatch: ${classified}/${review.characters.length}.`);
}

console.log(`Profile candidate inventory: ${review.characters.length}/48 classified.`);
console.log(`Source dispositions: ${Object.entries(review.sourceDispositionCounts).map(([key, value]) => `${key}=${value}`).join(', ')}`);
console.log(`Execution dispositions: ${Object.entries(review.executionDispositionCounts).map(([key, value]) => `${key}=${value}`).join(', ')}`);
