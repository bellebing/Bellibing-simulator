import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';

// Discovery only: no copied gameplay amounts, no prose-to-execution inference.
const db = buildCharacterDatabase(), queue = buildProfileExecutionWorkQueue();
const unique = xs => [...new Set(xs)].sort();
const row = (id, status, requirement) => ({ id, status, requirement });
const eventIds = new Set([
  ...db.gear.weaponCastWindows, ...db.gear.weaponDamageWindows, ...db.gear.weaponHealingWindows,
  ...db.gear.weaponResourceCasts, ...db.gear.sonataCastWindows, ...db.gear.sonataDamageWindows,
  ...db.gear.sonataTargetWindows,
].map(x => x.effectId));
const factState = f => f.verificationStatus !== 'VERIFIED' ? 'SOURCE_REVIEW_REQUIRED'
  : f.modelingStatus === 'PENDING_INTERPRETATION' ? 'SOURCE_SEMANTICS_BLOCKED'
  : f.modelingStatus === 'RAW_ONLY' ? 'SOURCE_REVIEW_REQUIRED' : 'CANONICAL_EVENT_EFFECT_AVAILABLE';
const effectState = e => eventIds.has(e.effectId) ? 'PRIMITIVE_AVAILABLE_REQUIRES_EVENT'
  : e.effectType === 'PERMANENT' && e.mechanicsStatus === 'VERIFIED_MODELED'
    ? 'CANONICAL_STATIC_AVAILABLE' : 'SOURCE_REVIEW_REQUIRED';
const queueState = { UNREVIEWED: 'SOURCE_REVIEW_REQUIRED',
  PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE: 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE',
  BLOCKED_SOURCE_CONFLICT: 'SOURCE_CONFLICT', BLOCKED_SOURCE_SEMANTICS: 'SOURCE_SEMANTICS_BLOCKED',
  PROFILE_SPECIFIC_EXECUTION: 'PROFILE_EVIDENCE_REQUIRED',
  SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING: 'CANONICAL_EVENT_EFFECT_AVAILABLE' };
const characters = unique(db.hitPrimitives.directHits.map(x => x.characterId)).map(characterId => {
  const c = db.characters.find(x => x.id === characterId);
  const facts = db.mechanicsFacts.filter(x => x.characterId === characterId);
  const presets = db.profiles.presets.filter(x => x.characterId === characterId).map(p => {
    const weapons = db.profiles.weaponRecommendations.find(x => x.id === p.weaponRecommendationProfileId);
    const shell = db.profiles.echoLoadouts.find(x => x.id === p.echoLoadoutProfileId);
    const rotation = db.profiles.rotations.find(x => x.id === p.rotationProfileId);
    const team = db.profiles.teams.find(x => x.id === p.teamProfileId);
    const weaponIds = unique(weapons.options.map(x => x.weaponId));
    return {
      presetId: p.id, sequence: p.sequence,
      selectedHitScope: p.sequence === 0 ? 'S0_HIT_SUPPORTED' : 'PRESET_SEQUENCE_NOT_AUTHORIZED_BY_S0_HIT_PRIMITIVE',
      weaponStats: weaponIds.map(id => row(id, id === 'abyss-surges' ? 'SOURCE_CONFLICT' : 'CANONICAL_STATIC_AVAILABLE',
        'Explicit compatible level-90 weapon/rank; core stats are separate from passive coverage')),
      weaponEffects: db.gear.weaponEffects.filter(e => weaponIds.includes(e.weaponId))
        .map(e => row(e.effectId, effectState(e), e.effectType === 'PERMANENT' ? 'Selected weapon/rank and exact static contract' : 'Exact source-qualified event/state; no assumed uptime')),
      mainEcho: shell.mainEchoId ? {
        echoId: shell.mainEchoId,
        effects: db.gear.echoEffects.filter(e => e.echoId === shell.mainEchoId).map(e => row(e.effectId,
          e.activation === 'MAIN_SLOT_PASSIVE' && e.mechanicsStatus === 'VERIFIED_MODELED'
            ? 'CANONICAL_STATIC_AVAILABLE' : 'SOURCE_REVIEW_REQUIRED',
          'Explicit equipped species/main slot/wielder; pending specialized branches remain separate')),
        specializedPending: db.gear.echoSkillPendingAdapterFacts.filter(e => e.echoId === shell.mainEchoId)
          .map(e => row(e.kind, 'SOURCE_SEMANTICS_BLOCKED', e.reason)),
        completeness: 'SOURCE_REVIEW_REQUIRED',
      } : row('main-echo', 'UNKNOWN', 'No canonical main Echo selection'),
      sonatas: shell.sonataSetIds.map(id => ({ sonataSetId: id,
        effects: db.gear.sonataEffects.filter(e => e.sonataSetId === id).map(e => row(e.effectId, effectState(e),
          'Explicit actual piece membership/count; conditional events and state are not equipment')),
        sourceReviews: db.gear.sonataSourceReviews.filter(e => e.sonataSetId === id).map(e => ({
          pieces: e.pieces, disposition: e.status,
        })),
      })),
      incoming: team.members.filter(m => m.characterId !== characterId).map(m => ({ characterId: m.characterId,
        transfers: db.outroTransferSupport.filter(x => x.characterId === m.characterId),
        status: 'PROFILE_EVIDENCE_REQUIRED', requirement: 'Selected teammate equipment, occurrence, recipient and overlap',
      })),
      rotation: row(rotation.id, rotation.executionStatus === 'ENGINE_MODELED' ? 'PROFILE_CONTEXT_AVAILABLE' : 'PROFILE_EVIDENCE_REQUIRED',
        'Exact engine/profile scope only; source sequence does not supply execution or denominator'),
      dependencies: queue.edges.filter(e => e.presetId === p.id).map(e => row(e.pendingExecutionId,
        queueState[e.semanticStatus], e.actionKey)),
    };
  });
  return { characterId, hitFactIds: db.hitPrimitives.directHits.filter(x => x.characterId === characterId).map(x => x.factId),
    scalingStats: unique(db.hitPrimitives.directHits.filter(x => x.characterId === characterId).map(x => x.scalingStat)),
    base: row(characterId, Object.values(c.level90).slice(0, 3).every(Number.isFinite) && c.intrinsic?.verificationStatus === 'VERIFIED'
      ? 'CANONICAL_STATIC_AVAILABLE' : 'SOURCE_REVIEW_REQUIRED', 'Explicit Lv90/max Minor Fortes; do not reinterpret Max Energy'),
    self: facts.filter(f => f.kind === 'PASSIVE').map(f => row(f.factId, factState(f), 'Selected hit applicability and active state need proof')),
    sequences: facts.filter(f => f.kind === 'SEQUENCE' && f.sequence <= 2).map(f => ({
      ...row(f.factId, factState(f), 'S1/S2 require a separately qualified execution path; S0 does not inherit them'), sequence: f.sequence })),
    resources: facts.filter(f => f.kind === 'RESOURCE').map(f => row(f.factId, factState(f), 'Actual initial state, gain/spend ordering and feasibility')),
    enemy: row('enemy-defense-resistance', 'PROFILE_EVIDENCE_REQUIRED', 'Caller-proven enemy and target state for the exact selected hit'),
    occurrence: row('landed-hit', 'PROFILE_EVIDENCE_REQUIRED', 'Explicit fact/component/count, event identity and damage element'),
    denominator: row('rotation-duration', 'NOT_REQUIRED_FOR_SELECTED_HIT', 'Still required for rotation DPS; never derived from buff duration'), presets };
});
assert.equal(characters.flatMap(x => x.hitFactIds).length, db.hitPrimitives.directHits.length);
const family = (name, predicate) => {
  const consumers = characters.filter(c => c.presets.some(predicate));
  return { name, characterIds: consumers.map(c => c.characterId),
    presetIds: unique(consumers.flatMap(c => c.presets.filter(predicate).map(p => p.presetId))) };
};
const result = { scope: 'CONTEXT_DISCOVERY_NOT_EXECUTION_OR_READINESS', canonicalNumbersDuplicated: false,
  counts: { hitCharacters: characters.length, hitFacts: db.hitPrimitives.directHits.length,
    presets: characters.flatMap(c => c.presets).length, pendingEdges: queue.summary,
    distinctDependencyIds: unique(queue.edges.map(e => e.pendingExecutionId)).length },
  rankedCandidates: [
    { rank: 1, name: 'Character base/intrinsic plus compatible weapon core', characterIds: characters.map(c => c.characterId),
      reason: 'All current hit consumers; removes source-stat arithmetic without lifecycle assumptions' },
    { rank: 2, ...family('Permanent weapon effects', p => p.weaponEffects.some(e => e.status === 'CANONICAL_STATIC_AVAILABLE')) },
    { rank: 3, ...family('Static Sonata effects', p => p.sonatas.some(s => s.effects.some(e => e.status === 'CANONICAL_STATIC_AVAILABLE'))) },
    { rank: 4, ...family('Main-slot static Echo effects', p => p.mainEcho.effects?.some(e => e.status === 'CANONICAL_STATIC_AVAILABLE')) },
    { rank: 5, ...family('Existing cast/damage/heal event effects', p => p.weaponEffects.some(e => e.status === 'PRIMITIVE_AVAILABLE_REQUIRES_EVENT')) },
  ],
  ladder: { counting: 'Character identities with an existing path; partial contributions do not establish complete L3 context',
    L0: db.characters.length, L1: characters.length, L2: characters.length,
    L3: db.characters.filter(c => c.readiness?.disposition === 'DPS_READY').length,
    L4: db.characters.filter(c => c.readiness?.disposition === 'DPS_READY').length,
    L5: unique(db.profiles.rotations.filter(r => r.executionStatus === 'ENGINE_MODELED').map(r => r.characterId)).length,
    L6: unique(db.profiles.rotations.filter(r => r.executionStatus === 'ENGINE_MODELED' && Number.isFinite(r.rotationSeconds)).map(r => r.characterId)).length,
    L7: db.characters.filter(c => c.readiness?.disposition === 'DPS_READY').length }, characters };
const output = process.argv.indexOf('--output');
if (output >= 0) { assert.ok(process.argv[output + 1]); writeFileSync(process.argv[output + 1], JSON.stringify(result, null, 2) + '\n'); }
console.log(JSON.stringify({ counts: result.counts, ladder: result.ladder,
  ranking: result.rankedCandidates.map(r => ({ rank: r.rank, name: r.name, characters: r.characterIds.length, presets: r.presetIds?.length })) }, null, 2));
