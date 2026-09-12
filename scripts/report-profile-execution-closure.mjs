import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';

// A review report, not an execution/readiness input. Counts and canonical facts
// are joined at run time; the reviewed ranking is deliberately not edge-count order.
const review = JSON.parse(readFileSync(new URL('../data/research/profile-execution-closure-review-2026-09-12.json', import.meta.url), 'utf8'));
const db = buildCharacterDatabase();
const queue = buildProfileExecutionWorkQueue();
const pending = [...new Set(queue.edges.map(edge => edge.presetId))].sort();
assert.deepEqual(review.profiles.map(row => row.presetId).sort(), pending, 'Re-review the cohort when pending profile membership changes');
const classes = new Set(['CANONICAL_FACT_EXISTS', 'PRIMITIVE_EXISTS', 'SOURCE_REVIEW_REQUIRED', 'PROFILE_EVIDENCE_REQUIRED', 'SOURCE_CONFLICT', 'SOURCE_SEMANTICS_BLOCKED', 'UNKNOWN']);
const dimensions = ['rotationDuration', 'resourceState', 'eventOccurrence', 'variantHits', 'recipientState', 'targetState', 'buffOverlap', 'equipment'];
const rows = review.profiles.map((row, index) => {
  const preset = db.profiles.presets.find(p => p.id === row.presetId);
  assert.ok(preset);
  const rotation = db.profiles.rotations.find(r => r.id === preset.rotationProfileId);
  const team = db.profiles.teams.find(t => t.id === preset.teamProfileId);
  assert.ok(rotation && team);
  assert.equal(rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY', `${row.presetId}: re-review executable state`);
  assert.equal(rotation.rotationSeconds, undefined, `${row.presetId}: re-review denominator evidence`);
  assert.deepEqual(Object.keys(row.requirements).sort(), [...dimensions].sort());
  for (const requirement of Object.values(row.requirements)) {
    assert.ok(classes.has(requirement.classification));
    assert.ok(requirement.missingProof.trim());
  }
  const edges = queue.edges.filter(edge => edge.presetId === row.presetId);
  const count = status => edges.filter(edge => edge.semanticStatus === status).length;
  return {
    rank: index + 1, ...row, characterId: preset.characterId,
    counts: { total: edges.length, primitiveAvailable: count('PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE'),
      sourceConflict: count('BLOCKED_SOURCE_CONFLICT'), sourceSemantics: count('BLOCKED_SOURCE_SEMANTICS'),
      profileSpecific: count('PROFILE_SPECIFIC_EXECUTION'), unreviewed: count('UNREVIEWED') },
    rotation: { id: rotation.id, status: rotation.executionStatus, rotationSeconds: rotation.rotationSeconds ?? null,
      sourceSequence: rotation.sourceSequence, provenance: rotation.provenance },
    preset, team,
    nominalResourceGainSupport: db.resourceGainSupport.filter(binding => binding.characterId === preset.characterId),
    canonicalResources: db.mechanicsFacts.filter(f => f.characterId === preset.characterId && f.kind === 'RESOURCE').map(f => ({ factId: f.factId, verificationStatus: f.verificationStatus, modelingStatus: f.modelingStatus })),
    dependencies: edges.map(edge => ({ ...edge, requirementClass:
      edge.semanticStatus === 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE' ? 'PRIMITIVE_EXISTS' :
      edge.semanticStatus === 'BLOCKED_SOURCE_CONFLICT' ? 'SOURCE_CONFLICT' :
      edge.semanticStatus === 'BLOCKED_SOURCE_SEMANTICS' ? 'SOURCE_SEMANTICS_BLOCKED' :
      edge.semanticStatus === 'PROFILE_SPECIFIC_EXECUTION' ? 'PROFILE_EVIDENCE_REQUIRED' : 'SOURCE_REVIEW_REQUIRED' })),
  };
});
const readiness = {};
for (const character of db.characters) if (character.readiness) readiness[character.readiness.disposition] = (readiness[character.readiness.disposition] ?? 0) + 1;
const result = { reviewedAt: review.reviewedAt, authorizesExecution: false, rankingBasis: review.rankingBasis,
  summary: queue.summary, distinctDependencyIds: new Set(queue.edges.map(e => e.pendingExecutionId)).size,
  readiness, referenceTeamBlockers: db.referenceTeam01.unresolvedDependencies, profiles: rows };
const outputIndex = process.argv.indexOf('--output');
if (outputIndex >= 0) {
  assert.ok(process.argv[outputIndex + 1], '--output requires a path');
  writeFileSync(process.argv[outputIndex + 1], JSON.stringify(result, null, 2) + '\n');
}
console.log('| Rank | Profile | Total | Primitive | Conflict | Semantics | Profile | Unreviewed |');
console.log('| --- | --- | --- | --- | --- | --- | --- | --- |');
for (const row of rows) console.log(`| ${row.rank} | ${row.presetId} | ${Object.values(row.counts).join(' | ')} |`);
console.log(JSON.stringify({ summary: result.summary, readiness, referenceTeamBlockers: result.referenceTeamBlockers.length, completeRecipes: 0 }));
