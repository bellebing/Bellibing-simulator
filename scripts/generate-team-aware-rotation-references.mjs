import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';

const input = 'data/source/prydwen-rotation-references-2026-10-11.json';
const packet = JSON.parse(readFileSync(input, 'utf8'));
const publicationPath = 'data/source/prydwen-rotation-publication-review-2026-10-11.json';
const publication = JSON.parse(readFileSync(publicationPath, 'utf8'));
if (publication.sourceArtifact !== input || createHash('sha256').update(readFileSync(input)).digest('hex') !== publication.sourceArtifactSha256) {
  throw new Error('Rotation capture changed: explicit publication source review required.');
}
if (JSON.stringify(publication.approvedReferenceIds) !== JSON.stringify(packet.references.map(row => row.id))) throw new Error('Approved rotation identity drift');
const reviewBytes = readFileSync(packet.reviewArtifact);
if (createHash('sha256').update(reviewBytes).digest('hex') !== packet.reviewSha256) {
  throw new Error('Rotation review changed: recapture explicitly reviewed source selections.');
}
const review = JSON.parse(reviewBytes);
const released = new Set(CHARACTER_CATALOG.filter(c => c.releaseStatus === 'RELEASED').map(c => c.id));
const coverageIds = new Set(packet.coverage.map(row => row.characterId));
if (coverageIds.size !== released.size || packet.coverage.length !== released.size || [...coverageIds].some(id => !released.has(id))) {
  throw new Error('Released Character rotation reference coverage drift.');
}
const ids = new Set();
for (const reference of packet.references) {
  if (ids.has(reference.id)) throw new Error(`Duplicate reference ${reference.id}`);
  ids.add(reference.id);
  if (!released.has(reference.characterId) || reference.source.provider !== 'PRYDWEN') throw new Error('Invalid reference source/identity');
  const selection = review.selections.find(row => row.characterId === reference.characterId && row.variantKey === reference.variantKey);
  if (!selection || reference.source.sectionSha256 !== review.sectionHashes[reference.characterId]) throw new Error('Unreviewed rotation reference');
  const priority = reference.executionStatus === 'SOURCE_PRIORITY_ONLY';
  if (priority ? reference.steps.length !== 0 || reference.priorityGuidance.length === 0 : reference.steps.length === 0 || reference.priorityGuidance.length !== 0) throw new Error('Rotation/priority semantics drift');
  for (const forbidden of ['engineModelId', 'rotationSeconds', 'uptime', 'modeledMechanicFactIds', 'damage', 'dps']) {
    if (Object.hasOwn(reference, forbidden)) throw new Error(`Execution claim ${forbidden} on source reference`);
  }
  for (const list of [...reference.context.requiredTeamCombinations, ...reference.context.excludedTeamCombinations, ...reference.context.exampleTeams]) {
    if (!list.length || list.some(id => !released.has(id)) || new Set(list).size !== list.length) throw new Error('Unresolved or duplicate source teammate identity');
  }
}
for (const row of packet.coverage) {
  const expected = packet.references.filter(ref => ref.characterId === row.characterId).map(ref => ref.id);
  if (!expected.length || JSON.stringify(expected) !== JSON.stringify(row.referenceIds)) throw new Error('Coverage/reference join drift');
}
const output = `// Generated from reviewed Prydwen reference evidence; never registered as an engine/profile preset.\nimport type { TeamAwareRotationReference, CharacterRotationReferenceCoverage } from '../teamAwareRotationDomain.ts';\nexport const TEAM_AWARE_ROTATION_SOURCE_REVIEW = ${JSON.stringify({ provider: 'PRYDWEN', reviewedAt: review.reviewedAt, reviewArtifact: packet.reviewArtifact, reviewSha256: packet.reviewSha256, publicationReviewArtifact: publicationPath, sourceArtifact: input, sourceArtifactSha256: createHash('sha256').update(readFileSync(input)).digest('hex') }, null, 2)} as const;\nexport const TEAM_AWARE_ROTATION_REFERENCES: readonly TeamAwareRotationReference[] = ${JSON.stringify(packet.references, null, 2)} as const;\nexport const CHARACTER_ROTATION_REFERENCE_COVERAGE: readonly CharacterRotationReferenceCoverage[] = ${JSON.stringify(packet.coverage, null, 2)} as const;\nexport const ROTATION_REFERENCES_BY_CHARACTER_ID = new Map(CHARACTER_ROTATION_REFERENCE_COVERAGE.map(row => [row.characterId, TEAM_AWARE_ROTATION_REFERENCES.filter(ref => ref.characterId === row.characterId)]));\n`;
const target = 'src/data/teamAwareRotationReferences.ts';
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== output) throw new Error('Team-aware rotation projection drift');
} else writeFileSync(target, output);
console.log(`Reviewed reference projection: ${packet.references.length} references / ${released.size} released Characters; no executable defaults.`);
