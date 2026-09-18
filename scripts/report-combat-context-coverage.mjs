import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';

// Discovery only: no copied gameplay amounts, no prose-to-execution inference.
const db = buildCharacterDatabase(), queue = buildProfileExecutionWorkQueue();
const unique = xs => [...new Set(xs)].sort();
const row = (id, status, requirement) => ({ id, status, requirement });
const supportedIds = rows => new Set(rows.map(x => x.effectId));
const weaponStaticIds = supportedIds(db.gear.weaponStaticContext);
const castContextIds = supportedIds(db.gear.weaponCastHitContext);
const sonataCastContextIds = supportedIds(db.gear.sonataCastHitContext);
const damageContextIds = supportedIds(db.gear.weaponDamageHitContext);
const sonataDamageContextIds = supportedIds(db.gear.sonataDamageHitContext);
const sonataTargetContextIds = supportedIds(db.gear.sonataTargetHitContext);
const sonataIncomingTransferContextIds = supportedIds(db.gear.sonataIncomingTransferHitContext);
const weaponIncomingTransferContextIds = supportedIds(db.gear.weaponIncomingTransferHitContext);
const sonataTeamHealContextIds = supportedIds(db.gear.sonataTeamHealHitContext);
const weaponTeamStatContextIds = supportedIds(db.gear.weaponTeamStatHitContext);
const echoTeamStatContextIds = supportedIds(db.gear.echoTeamStatHitContext);
const echoIncomingTransferContextIds = supportedIds(db.gear.echoIncomingTransferHitContext);
const characterTeamAmplificationFactIds = new Set(db.hitPrimitives.shorekeeperTeamAmplification.map(x => x.sourceFactId));
const eventIds = new Set([
  ...db.gear.weaponCastWindows, ...db.gear.weaponDamageWindows, ...db.gear.weaponHealingWindows,
  ...db.gear.weaponResourceCasts, ...db.gear.sonataCastWindows, ...db.gear.sonataDamageWindows,
  ...db.gear.sonataTargetWindows, ...db.gear.sonataOutroTransfers, ...db.gear.sonataTeamHealHitContext,
  ...db.gear.weaponTeamStatHitContext, ...db.gear.echoTeamStatHitContext, ...db.gear.echoTransferWindows,
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
    const selectedWeaponEffects = db.gear.weaponEffects.filter(e => weaponIds.includes(e.weaponId));
    return {
      presetId: p.id, sequence: p.sequence,
      contextFamilies: {
        counting: 'Recommendation configuration reach, not proof of equipped gear or complete static context',
        staticWeaponEffectIds: selectedWeaponEffects.filter(e => weaponStaticIds.has(e.effectId)).map(e => e.effectId),
        staticSonataEffectIds: db.gear.sonataStaticContext.filter(e => shell.sonataSetIds.includes(e.sonataSetId)).map(e => e.effectId),
        staticMainEchoEffectIds: db.gear.echoStaticContext.filter(e => e.echoId === shell.mainEchoId
          && (!e.wielderCharacterIds || e.wielderCharacterIds.includes(characterId))).map(e => e.effectId),
        weaponCastEffectIds: selectedWeaponEffects.filter(e => castContextIds.has(e.effectId)).map(e => e.effectId),
        weaponDamageEffectIds: selectedWeaponEffects.filter(e => damageContextIds.has(e.effectId)).map(e => e.effectId),
        sonataCastEffectIds: db.gear.sonataCastHitContext.filter(e => shell.sonataSetIds.includes(e.sonataSetId)).map(e => e.effectId),
        sonataDamageEffectIds: db.gear.sonataDamageHitContext.filter(e => shell.sonataSetIds.includes(e.sonataSetId)).map(e => e.effectId),
        sonataTargetEffectIds: db.gear.sonataTargetHitContext.filter(e => shell.sonataSetIds.includes(e.sonataSetId)).map(e => e.effectId),
      },
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
  const compatibleWeapons = db.gear.weapons.filter(w => w.weaponType === c.weaponType);
  const compatibleEffects = db.gear.weaponEffects.filter(e => compatibleWeapons.some(w => w.id === e.weaponId));
  return { characterId,
    staticContextCoverage: {
      scope: 'S0_MAX_SKILL_LV90_AVAILABLE_FAMILIES_NOT_EXACT_EQUIPPED_BUILD',
      fullySupportedStaticFamilies: ['CHARACTER_CORE_MAX_MINOR_FORTES'],
      supportedStaticSubsets: {
        permanentWeaponEffectIds: compatibleEffects.filter(e => weaponStaticIds.has(e.effectId)).map(e => e.effectId),
        presetSonataEffectIds: unique(presets.flatMap(p => p.contextFamilies.staticSonataEffectIds)),
        presetMainEchoEffectIds: unique(presets.flatMap(p => p.contextFamilies.staticMainEchoEffectIds)),
      },
      missingStaticFamilies: ['CHARACTER_SELF_EFFECT_APPLICATION'],
      exactBuildStaticCompleteness: 'PENDING_EXACT_EQUIPMENT_AND_SELF_CONTEXT',
      conditionalOnlyRemainingContext: 'NOT_ESTABLISHED',
      sourceBlockedContext: facts.filter(f => f.verificationStatus !== 'VERIFIED' || f.modelingStatus === 'PENDING_INTERPRETATION')
        .map(f => f.factId),
      unassembledSelfFactIds: facts.filter(f => f.kind === 'PASSIVE').map(f => f.factId),
      unsupportedPermanentWeaponEffectIds: compatibleEffects.filter(e => e.effectType === 'PERMANENT' && !weaponStaticIds.has(e.effectId)).map(e => e.effectId),
    },
    hitFactIds: db.hitPrimitives.directHits.filter(x => x.characterId === characterId).map(x => x.factId),
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
  implementedPartialContext: { characterIds: unique(db.hitPrimitives.contextAssembly.map(x => x.characterId)),
    factCount: db.hitPrimitives.contextAssembly.length, families: db.hitPrimitives.contextAssembly[0]?.assembles ?? [],
    permanentWeaponEffectIds: db.gear.weaponStaticContext.map(x => x.effectId),
    staticSonataEffectIds: db.gear.sonataStaticContext.map(x => x.effectId),
    staticMainEchoEffectIds: db.gear.echoStaticContext.map(x => x.effectId),
    weaponCastEffectIds: db.gear.weaponCastHitContext.map(x => x.effectId),
    sonataCastEffectIds: [...sonataCastContextIds],
    weaponDamageEffectIds: [...damageContextIds],
    sonataDamageEffectIds: [...sonataDamageContextIds],
    sonataTargetEffectIds: [...sonataTargetContextIds],
    sonataIncomingTransferEffectIds: [...sonataIncomingTransferContextIds],
    weaponIncomingTransferEffectIds: [...weaponIncomingTransferContextIds],
    sonataTeamHealEffectIds: [...sonataTeamHealContextIds],
    weaponTeamStatEffectIds: [...weaponTeamStatContextIds],
    echoTeamStatEffectIds: [...echoTeamStatContextIds],
    echoIncomingTransferEffectIds: [...echoIncomingTransferContextIds],
    characterTeamAmplificationFactIds: [...characterTeamAmplificationFactIds],
    stillRequiresRemainingContextProof: true, fullyAssembledNewCharacters: 0 },
  crossOwnerContextCapabilities: {
    sonataIncomingTransfers: {
      effectIds: [...sonataIncomingTransferContextIds],
      exactPresetReach: [],
      counting: 'Capability only: source teammate equipment is not owned by the incoming Character preset and is never inferred from team membership',
      requires: ['EXACT_SOURCE_WIELDER', 'SOURCE_5PC_EQUIPMENT_PROOF', 'OUTRO_TO_ACTUAL_INCOMING_EVENT', 'PER_BUILD_QUERY_PROOF'],
    },
    weaponIncomingTransfers: {
      effectIds: [...weaponIncomingTransferContextIds],
      exactPresetReach: [],
      counting: 'Capability only: source teammate weapon/rank and Outro recipient are not inferred from the incoming Character preset or team membership',
      requires: ['EXACT_SOURCE_WIELDER', 'SOURCE_WEAPON_RANK_EQUIPMENT_PROOF', 'OUTRO_TO_ACTUAL_INCOMING_EVENT', 'PER_BUILD_QUERY_PROOF'],
    },
    sonataTeamHealWindows: {
      effectIds: [...sonataTeamHealContextIds],
      exactPresetReach: [],
      counting: 'Capability only: source teammate Sonata equipment, selected team and applied heal are not inferred from the incoming Character preset or team membership',
      requires: ['EXACT_SOURCE_WIELDER', 'SOURCE_5PC_EQUIPMENT_PROOF', 'EXPLICIT_SELECTED_TEAM', 'VERIFIED_HEAL_APPLIED_EVENT', 'PER_BUILD_QUERY_PROOF'],
    },
    weaponTeamStatWindows: {
      effectIds: [...weaponTeamStatContextIds],
      exactPresetReach: [],
      counting: 'Capability only: Shorekeeper Stellar Symphony equipment/rank, selected team and healing Skill cast are not inferred from recipient presets or team membership',
      requires: ['SHOREKEEPER_SOURCE_OWNER', 'STELLAR_SYMPHONY_RANK_EQUIPMENT_PROOF', 'EXPLICIT_SELECTED_TEAM', 'EXACT_HEALING_SKILL_CAST_EVENT', 'PER_BUILD_QUERY_PROOF'],
    },
    echoTeamStatWindows: {
      effectIds: [...echoTeamStatContextIds],
      exactPresetReach: [],
      counting: 'Capability only: source teammate Fallacy main-Echo equipment, selected team and exact Echo cast are not inferred from recipient presets or team membership',
      requires: ['EXACT_SOURCE_WIELDER', 'SOURCE_FALLACY_MAIN_ECHO_PROOF', 'EXPLICIT_SELECTED_TEAM', 'EXACT_ECHO_SKILL_CAST_EVENT', 'PER_BUILD_QUERY_PROOF'],
    },
    characterTeamAmplificationWindows: {
      factIds: [...characterTeamAmplificationFactIds],
      exactPresetReach: [],
      counting: 'Single-active capability only: Shorekeeper Outro/team/timing proof is explicit and never infers profile overlap or cross-source amplification stacking',
      stackingPolicy: 'SINGLE_ACTIVE_APPLICABLE_TERM_ONLY',
      requires: ['SHOREKEEPER_SOURCE_OWNER', 'EXPLICIT_SELECTED_TEAM', 'EXACT_OUTRO_CAST_EVENT', 'ZERO_RESIDUAL_AMPLIFICATION_WHEN_ACTIVE', 'PER_BUILD_QUERY_PROOF'],
    },
    echoIncomingTransfers: {
      effectIds: [...echoIncomingTransferContextIds],
      exactPresetReach: [],
      counting: 'Capability only: source teammate main Echo/rank and transfer events are not inferred from incoming Character presets or team membership',
      requires: ['EXACT_SOURCE_WIELDER', 'SOURCE_MAIN_ECHO_EQUIPMENT_PROOF', 'SOURCE_REQUIRED_RANK', 'EXACT_ECHO_ARM_EVENT', 'OUTRO_TO_ACTUAL_INCOMING_EVENT', 'PER_BUILD_QUERY_PROOF'],
    },
  },
  counts: { hitCharacters: characters.length, hitFacts: db.hitPrimitives.directHits.length,
    presets: characters.flatMap(c => c.presets).length, pendingEdges: queue.summary,
    distinctDependencyIds: unique(queue.edges.map(e => e.pendingExecutionId)).length },
  eventConsumerCohorts: [family('Weapon cast context', p => p.contextFamilies.weaponCastEffectIds.length > 0),
    family('Sonata cast context', p => p.contextFamilies.sonataCastEffectIds.length > 0),
    family('Weapon damage context', p => p.contextFamilies.weaponDamageEffectIds.length > 0),
    family('Sonata damage context', p => p.contextFamilies.sonataDamageEffectIds.length > 0),
    family('Sonata target context', p => p.contextFamilies.sonataTargetEffectIds.length > 0)],
  rankedCandidates: [
    { rank: 1, name: 'Character base/intrinsic plus compatible weapon core', characterIds: characters.map(c => c.characterId),
      reason: 'All current hit consumers; removes source-stat arithmetic without lifecycle assumptions' },
    { rank: 2, ...family('Permanent weapon effects', p => p.weaponEffects.some(e => e.status === 'CANONICAL_STATIC_AVAILABLE')) },
    { rank: 3, ...family('Static Sonata effects', p => p.sonatas.some(s => s.effects.some(e => e.status === 'CANONICAL_STATIC_AVAILABLE'))) },
    { rank: 4, ...family('Main-slot static Echo effects', p => p.mainEcho.effects?.some(e => e.status === 'CANONICAL_STATIC_AVAILABLE')) },
    { rank: 5, ...family('Existing cast/damage/heal event effects', p => p.weaponEffects.some(e => e.status === 'PRIMITIVE_AVAILABLE_REQUIRES_EVENT')
      || p.contextFamilies.sonataCastEffectIds.length > 0 || p.contextFamilies.sonataDamageEffectIds.length > 0
      || p.contextFamilies.sonataTargetEffectIds.length > 0) },
  ],
  ladder: { counting: 'Character identities with an existing path; partial contributions do not establish complete L3 context',
    L0: db.characters.length, L1: characters.length, L2: characters.length,
    PARTIAL_L3: characters.length,
    PARTIAL_L4: family('Event context', p => p.contextFamilies.weaponCastEffectIds.length
      + p.contextFamilies.sonataCastEffectIds.length + p.contextFamilies.weaponDamageEffectIds.length
      + p.contextFamilies.sonataDamageEffectIds.length + p.contextFamilies.sonataTargetEffectIds.length > 0).characterIds.length,
    partialL4Counting: 'Characters with an existing preset equipment recommendation supported by a composition bridge; still requires explicit per-build events',
    L3: db.characters.filter(c => c.readiness?.disposition === 'DPS_READY').length,
    L4: db.characters.filter(c => c.readiness?.disposition === 'DPS_READY').length,
    L5: unique(db.profiles.rotations.filter(r => r.executionStatus === 'ENGINE_MODELED').map(r => r.characterId)).length,
    L6: unique(db.profiles.rotations.filter(r => r.executionStatus === 'ENGINE_MODELED' && Number.isFinite(r.rotationSeconds)).map(r => r.characterId)).length,
    L7: db.characters.filter(c => c.readiness?.disposition === 'DPS_READY').length }, characters };
const output = process.argv.indexOf('--output');
if (output >= 0) { assert.ok(process.argv[output + 1]); writeFileSync(process.argv[output + 1], JSON.stringify(result, null, 2) + '\n'); }
console.log(JSON.stringify({ counts: result.counts, ladder: result.ladder,
  ranking: result.rankedCandidates.map(r => ({ rank: r.rank, name: r.name, characters: r.characterIds.length, presets: r.presetIds?.length })) }, null, 2));
