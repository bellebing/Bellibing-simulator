import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';
import { listOwnedBuildDpsBindings } from '../src/ownedBuildAnalysis.ts';

const db = buildCharacterDatabase();
const queue = buildProfileExecutionWorkQueue();
const released = db.characters.filter(c => c.releaseStatus === 'RELEASED');
const releasedIds = new Set(released.map(c => c.id));
const values = new Map(db.actionValuesAtMaxSkill.map(r => [r.factId, r.values]));
const usableHits = db.hitPrimitives.directHits.filter(r =>
  values.get(r.factId)?.status === 'SOURCE_VALUES' && values.get(r.factId)?.kind === 'COEFFICIENTS');
const unique = (rows, key) => [...new Set(rows.map(r => r[key]))].sort();
const count = (rows, key) => Object.fromEntries([...new Set(rows.map(r => r[key]))].sort()
  .map(value => [value, rows.filter(r => r[key] === value).length]));
const rotations = db.profiles.rotations.filter(r => r.executionStatus === 'ENGINE_MODELED');
const owned = listOwnedBuildDpsBindings().map(({ presetId, characterId, engineModelId }) => ({ presetId, characterId, engineModelId }));
const result = {
  sourceAuthority: db.sourceAuthority,
  scope: 'PRODUCT_CAPABILITY_AUDIT_NOT_GAMEPLAY_OR_READINESS_APPROVAL',
  characters: {
    canonicalIdentities: db.characters.length, released: released.length,
    verifiedMechanics: released.filter(c => c.mechanics?.verificationStatus === 'VERIFIED').length,
    isolatedHitCharacters: unique(usableHits.filter(r => releasedIds.has(r.characterId)), 'characterId'),
    isolatedHitFacts: usableHits.length,
    dpsReadyCharacters: released.filter(c => c.readiness?.disposition === 'DPS_READY').map(c => c.id),
    readiness: count(released.map(c => c.readiness), 'disposition'),
  },
  profiles: {
    presets: db.profiles.presets.length, rotationStatuses: count(db.profiles.rotations, 'executionStatus'),
    engineModeled: rotations.map(r => ({ id: r.id, seconds: r.rotationSeconds, engineModelId: r.engineModelId })),
    ownedBuildDpsAndFinishedEchoComparison: owned,
    reviewedPendingCohort: unique(queue.edges, 'presetId').length,
    pendingEdges: queue.summary, distinctDependencyIds: unique(queue.edges, 'pendingExecutionId').length,
  },
  gear: {
    weaponIdentities: db.gear.weapons.length, weaponReleaseStatuses: count(db.gear.weapons, 'releaseStatus'),
    weaponEffectRows: db.gear.weaponEffects.length, weaponEffectCoverage: count(db.gear.weaponEffectCoverage, 'status'),
    echoIdentities: db.gear.echoes.length, echoEffectRows: db.gear.echoEffects.length,
    echoesWithEffects: unique(db.gear.echoEffects, 'echoId').length,
    echoAttackProfiles: db.gear.echoAttacks.length, isolatedEchoAttackFacts: db.hitPrimitives.echoActiveHits.length,
    sonataSets: db.gear.sonatas.length, sonataEffectRows: db.gear.sonataEffects.length,
    setIdsWithEffects: unique(db.gear.sonataEffects, 'sonataSetId').length,
    note: 'Identity/source availability does not prove activation, timing, full stat validity or executable effects.',
  },
  arbitraryTeamDps: { status: 'PENDING', referenceTeamOpenDependencies: db.referenceTeam01.unresolvedDependencies.length,
    missing: ['Complete event/state/energy/denominator proof', 'Selected teammate/equipment effect composition without hidden old-team buffs',
      'Feasible non-quickswap rotations and global remaining-roster allocation'] },
  improveCharacter: { fullRotationDpsPresetIds: owned.map(r => r.presetId),
    isolatedHitEchoComparison: {
      characterIds: unique(db.hitPrimitives.echoComparisons, 'characterId'),
      facts: db.hitPrimitives.echoComparisons.length,
      requiresPerBuildContext: true, authorizesRotationDps: false, authorizesUpgradeVerdict: false,
      scope: 'One same-COST Rank5 card replacement, same exact S0/max-skill hit; all other effects caller-qualified separately per build',
    },
    missing: ['Source-valid complete engines beyond the two bindings', 'Build-dependent effect recomputation and complete team/gear context',
      'No isolated-hit delta may be labeled rotation/team DPS or a universal upgrade'] },
};
assert.equal(result.characters.isolatedHitFacts, db.hitPrimitives.directHits.length, 'Capability advertises unreadable direct-hit values');
const output = process.argv.indexOf('--output');
if (output >= 0) { assert.ok(process.argv[output + 1]); writeFileSync(process.argv[output + 1], JSON.stringify(result, null, 2) + '\n'); }
console.log(JSON.stringify(result, null, 2));
