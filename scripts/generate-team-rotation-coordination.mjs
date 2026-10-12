import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { TEAM_AWARE_ROTATION_REFERENCES } from '../src/data/teamAwareRotationReferences.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { getCharacterActionFact } from '../src/data/characterMechanics.ts';
const path = 'data/source/team-rotation-coordination-review-2026-10-12.json';
const bytes = readFileSync(path);
const review = JSON.parse(bytes);
if (createHash('sha256').update(readFileSync(review.referenceArtifact)).digest('hex') !== review.referenceArtifactSha256) throw new Error('Coordination requires review after rotation-reference drift');
const references = new Map(TEAM_AWARE_ROTATION_REFERENCES.map(row => [row.id, row]));
const released = new Set(CHARACTER_CATALOG.filter(row => row.releaseStatus === 'RELEASED').map(row => row.id));
const patterns = new Set(review.patterns.map(row => row.id));
const proofs = new Map(review.proofs.map(row => [row.id, row]));
if (new Set(review.participation.map(row => row.referenceId)).size !== references.size || review.participation.length !== references.size || review.participation.some(row => !references.has(row.referenceId))) throw new Error('Incomplete reference participation classification');
if (new Set(review.cases.map(row => row.id)).size !== review.cases.length) throw new Error('Duplicate team case');
for (const proof of review.proofs) {
  const reference = TEAM_AWARE_ROTATION_REFERENCES.find(row => row.characterId === proof.characterId);
  if (!reference || proof.sectionSha256 !== reference.source.sectionSha256 || proof.sourceUrl !== reference.source.url) throw new Error('Unpinned case proof');
}
for (const item of review.cases) {
  if (!patterns.has(item.patternId) || !item.proofIds.length || item.proofIds.some(id => !proofs.has(id))) throw new Error('Missing team-pattern proof');
  if (!item.requiredCharacters.length || item.requiredCharacters.length > 3 || new Set(item.requiredCharacters).size !== item.requiredCharacters.length || item.requiredCharacters.some(id => !released.has(id))) throw new Error('Invalid case party');
  for (const member of item.members) {
    if (!item.requiredCharacters.includes(member.characterId) || !member.referenceHints.length || member.referenceHints.some(id => references.get(id)?.characterId !== member.characterId)) throw new Error('Dangling case reference');
  }
}
for (const binding of review.hitBindings) {
  const reference = references.get(binding.referenceId), step = reference?.steps.find(row => row.order === binding.stepOrder);
  const fact = getCharacterActionFact(binding.factId);
  if (!step || step.instruction !== binding.sourceInstruction || step.sourceLine !== binding.sourceLine || reference.characterId !== binding.characterId || fact?.characterId !== binding.characterId || fact.name !== binding.factName || fact.verificationStatus !== 'VERIFIED') throw new Error('Unreviewed reference-to-hit binding');
}
const meta = {reviewedAt: review.reviewedAt, sourceArtifact: path, sourceArtifactSha256: createHash('sha256').update(bytes).digest('hex'), referenceArtifact: review.referenceArtifact, referenceArtifactSha256: review.referenceArtifactSha256, scope: 'BROAD_TEAM_DESCRIPTION_AND_EXPLICIT_HIT_BRIDGE_NOT_TEAM_DPS'};
const output = `// Generated from explicit coordination source review. No attack values or timelines are copied.\nimport type { TeamRotationPattern, RotationParticipation, TeamRotationProof, TeamRotationCase, RotationHitBinding } from '../teamRotationCoordinationDomain.ts';\nexport const TEAM_ROTATION_COORDINATION_REVIEW = ${JSON.stringify(meta,null,2)} as const;\nexport const TEAM_ROTATION_PATTERNS: readonly TeamRotationPattern[] = ${JSON.stringify(review.patterns,null,2)} as const;\nexport const ROTATION_PARTICIPATION_DESCRIPTIONS: Readonly<Record<RotationParticipation['participation'], {readonly labelSv:string; readonly summarySv:string}>> = ${JSON.stringify(review.participationDescriptions,null,2)} as const;\nexport const ROTATION_PARTICIPATION: readonly RotationParticipation[] = ${JSON.stringify(review.participation,null,2)} as const;\nexport const TEAM_ROTATION_PROOFS: readonly TeamRotationProof[] = ${JSON.stringify(review.proofs,null,2)} as const;\nexport const TEAM_ROTATION_CASES: readonly TeamRotationCase[] = ${JSON.stringify(review.cases,null,2)} as const;\nexport const ROTATION_HIT_BINDINGS: readonly RotationHitBinding[] = ${JSON.stringify(review.hitBindings,null,2)} as const;\n`;
const target = 'src/data/teamRotationCoordination.ts';
if (process.argv.includes('--check')) { if (readFileSync(target,'utf8') !== output) throw new Error('Coordination projection drift'); }
else writeFileSync(target,output);
console.log(`Coordination: ${review.cases.length} reviewed cases / ${review.participation.length} references / ${review.hitBindings.length} explicit hit binding.`);
