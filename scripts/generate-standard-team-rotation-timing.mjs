import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { TEAM_AWARE_ROTATION_REFERENCES } from '../src/data/teamAwareRotationReferences.ts';
import { TEAM_ROTATION_CASES } from '../src/data/teamRotationCoordination.ts';
const reviewPath = 'data/source/standard-team-rotation-timing-review-2026-10-12.json';
const bytes = readFileSync(reviewPath), review = JSON.parse(bytes);
const hash = value => createHash('sha256').update(value).digest('hex');
for (const name of ['evidence', 'coordination', 'reference']) {
  if (hash(readFileSync(review[`${name}Artifact`])) !== review[`${name}Sha256`]) throw Error(`${name} changed: timing review required`);
}
const evidence = JSON.parse(readFileSync(review.evidenceArtifact));
const characters = new Set(CHARACTER_CATALOG.filter(c => c.releaseStatus === 'RELEASED').map(c => c.id));
const refs = new Set(TEAM_AWARE_ROTATION_REFERENCES.map(r => r.id));
const cases = new Set(TEAM_ROTATION_CASES.map(c => c.id));
const sourceIds = new Set(evidence.sources.map(s => s.id));
if (sourceIds.size !== evidence.sources.length || new Set(review.reviews.map(r => r.sourceId)).size !== sourceIds.size || review.reviews.length !== sourceIds.size) throw Error('Duplicate/incomplete timing review');
const records = evidence.sources.map(source => {
  const item = review.reviews.find(r => r.sourceId === source.id);
  if (!item || item.relatedReferenceIds.some(id => !refs.has(id)) || (item.coordinationCaseId && !cases.has(item.coordinationCaseId))) throw Error('Dangling timing relation');
  const party = new Set(source.builds.map(b => b.characterId));
  if (party.size !== 3 || source.builds.length !== 3 || [...party].some(id => !characters.has(id))) throw Error('Invalid timing party');
  for (const [id] of Object.entries(item.modeRequirements)) if (!party.has(id)) throw Error('Mode owner outside party');
  if (item.actorOrder && (item.actorOrder.length !== 3 || new Set(item.actorOrder).size !== 3 || item.actorOrder.some(id => !party.has(id)))) throw Error('Invalid contiguous order');
  if (source.phases.length !== 3 || source.phases.some((p,i) => p.rotationNumber !== i+1)) throw Error('Missing opening/later phase');
  for (const p of source.phases) {
    if (p.members.length !== 3 || new Set(p.members.map(m => m.characterId)).size !== 3 || p.members.some(m => !party.has(m.characterId))) throw Error('Incomplete field budgets');
    for (const m of p.members) if (!Number.isFinite(m.fieldSeconds) || m.fieldSeconds <= 0 || !Number.isFinite(m.waitSeconds) || m.waitSeconds < 0 || !Number.isInteger(m.sourceLine)) throw Error('Invalid timing value');
    const sum = p.members.reduce((n,m) => n+m.fieldSeconds+m.waitSeconds,0);
    if (!Number.isFinite(p.reportedCycleSeconds) || Math.abs(sum-p.reportedCycleSeconds) > 0.011) throw Error('Published cycle does not reconcile with fields and waits');
  }
  const avg = source.phases.reduce((n,p) => n+p.reportedCycleSeconds,0)/3;
  if (Math.abs(avg-source.reportedAverageCycleSeconds) > 0.011) throw Error('Published average drift');
  if (item.eligibleStandardRotationNumbers.some(n => !source.phases.some(p => p.rotationNumber === n))) throw Error('Unknown selected phase');
  if (item.coordinationCaseId) {
    const c = TEAM_ROTATION_CASES.find(c => c.id === item.coordinationCaseId);
    if (c.requiredCharacters.some(id => !party.has(id))) throw Error('Timing relation has wrong party');
  }
  return {...source, review:item};
});
if (review.caseCoverage.length !== cases.size || new Set(review.caseCoverage.map(c => c.coordinationCaseId)).size !== cases.size) throw Error('Incomplete case research inventory');
for (const c of review.caseCoverage) {
  if (!cases.has(c.coordinationCaseId) || c.sourceIds.some(id => !sourceIds.has(id))) throw Error('Dangling timing coverage');
  const expected = records.filter(r => r.review.coordinationCaseId === c.coordinationCaseId).map(r => r.id);
  if (JSON.stringify(c.sourceIds) !== JSON.stringify(expected)) throw Error('Coverage relation drift');
}
const meta = {reviewedAt:review.reviewedAt, reviewArtifact:reviewPath, reviewSha256:hash(bytes), evidenceArtifact:review.evidenceArtifact, evidenceSha256:review.evidenceSha256, methodology:evidence.methodology, scope:'PUBLISHED_FIELD_BUDGETS_AND_DERIVED_BOUNDARIES_NOT_ACTION_TIMING_OR_DPS'};
const output = `// Generated from separately reviewed published timing evidence. No engine registration.\nimport type { StandardTeamRotationTimingReference, TeamTimingCaseCoverage } from '../standardTeamRotationTimingDomain.ts';\nexport const STANDARD_TEAM_ROTATION_TIMING_REVIEW = ${JSON.stringify(meta,null,2)} as const;\nexport const STANDARD_TEAM_ROTATION_TIMING_REFERENCES: readonly StandardTeamRotationTimingReference[] = ${JSON.stringify(records,null,2)} as const;\nexport const STANDARD_TEAM_ROTATION_TIMING_CASE_COVERAGE: readonly TeamTimingCaseCoverage[] = ${JSON.stringify(review.caseCoverage,null,2)} as const;\n`;
const target = 'src/data/standardTeamRotationTiming.ts';
if (process.argv.includes('--check')) { if (readFileSync(target,'utf8') !== output) throw Error('Timing projection drift'); }
else writeFileSync(target,output);
console.log(`Timing research: ${records.length} teams / ${records.reduce((n,r) => n+r.phases.length,0)} phases / ${cases.size} case coverage rows.`);
