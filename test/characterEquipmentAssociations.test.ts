import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_CATALOG } from '../src/data/sonatas.ts';
import { CHARACTER_SIGNATURE_ASSOCIATIONS, CHARACTER_SIGNATURE_BY_ID, CHARACTER_GUIDE_RECOMMENDATIONS, CHARACTER_GUIDE_RECOMMENDATIONS_BY_ID as guides, CHARACTER_EQUIPMENT_SOURCE_REVIEW } from '../src/data/characterEquipmentAssociations.ts';
import { SIGNATURE_RELEASE_WEAPON_EFFECTS } from '../src/data/weaponEffectsRelease37.ts';
import { WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V37 } from '../src/data/weaponEffectAudit.ts';
import { WEAPON_RECOMMENDATION_PROFILES } from '../src/data/weaponRecommendations.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { WEAPON_CAST_WINDOW_CONTRACTS } from '../src/combat/weaponCastWindowAdapter.ts';

const released = CHARACTER_CATALOG.filter(row => row.releaseStatus === 'RELEASED');
const weaponById = new Map(WEAPON_CATALOG.map(row => [row.id, row]));
const ids = (rows: readonly { characterId: string }[]) => rows.map(row => row.characterId).sort();
const consecutive = (rows: readonly { sourceOrder: number }[]) => assert.deepEqual(rows.map(row => row.sourceOrder), rows.map((_, i) => i + 1));

test('every released identity has exactly one reviewed signature decision and a compatible released weapon', () => {
  assert.equal(released.length, 59);
  assert.deepEqual(ids(CHARACTER_SIGNATURE_ASSOCIATIONS), released.map(row => row.id).sort());
  assert.equal(CHARACTER_SIGNATURE_BY_ID.size, 59);
  assert.equal(CHARACTER_SIGNATURE_ASSOCIATIONS.filter(row => row.status === 'VERIFIED_SIGNATURE').length, 39);
  assert.equal(CHARACTER_SIGNATURE_ASSOCIATIONS.filter(row => row.status === 'VERIFIED_NO_SIGNATURE').length, 20);
  for (const character of released) {
    const row = CHARACTER_SIGNATURE_BY_ID.get(character.id)!;
    assert.ok(row.evidence.length);
    assert.equal(row.meaning, 'IDENTIFIED_DEDICATED_SIGNATURE_NOT_EXCLUSIVE_OR_BIS');
    if (row.status === 'VERIFIED_SIGNATURE') {
      const weapon = weaponById.get(row.weaponId)!;
      assert.ok(weapon, row.weaponId);
      assert.equal(weapon.releaseStatus, 'RELEASED');
      assert.equal(weapon.weaponType, character.weaponType);
    } else assert.equal(row.weaponId, null);
    if (character.rarity === 4 || ['calcharo', 'encore', 'jianxin', 'lingyang', 'verina'].includes(character.id)) {
      assert.equal(row.status, 'VERIFIED_NO_SIGNATURE');
    }
  }
});

test('signature identity remains independent of guide rank; the free Aero Rover exception is explicit', () => {
  assert.equal(CHARACTER_SIGNATURE_BY_ID.get('xiangli-yao')?.weaponId, 'veritys-handle');
  assert.equal(guides.get('xiangli-yao')?.weapons[0].weaponId, 'moongazers-sigil');
  assert.equal(guides.get('xiangli-yao')?.weapons[1].weaponId, 'veritys-handle');
  assert.equal(guides.get('encore')?.weapons[0].weaponId, 'stringmaster');
  assert.equal(CHARACTER_SIGNATURE_BY_ID.get('encore')?.weaponId, null);
  assert.equal(CHARACTER_SIGNATURE_BY_ID.get('rover-aero')?.weaponId, 'bloodpacts-pledge');
  for (const id of ['rover-spectro', 'rover-havoc', 'rover-electro']) assert.equal(CHARACTER_SIGNATURE_BY_ID.get(id)?.status, 'VERIFIED_NO_SIGNATURE');
});

test('all guide identities and source-order alternatives resolve without selecting equipment', () => {
  assert.deepEqual(ids(CHARACTER_GUIDE_RECOMMENDATIONS), released.map(row => row.id).sort());
  const characters = new Map(CHARACTER_CATALOG.map(row => [row.id, row]));
  const echoes = new Set<string>(ECHO_CATALOG.map(row => row.id));
  const sets = new Set<string>(SONATA_CATALOG.map(row => row.id));
  for (const row of CHARACTER_GUIDE_RECOMMENDATIONS) {
    assert.equal(row.orderingPolicy, 'SOURCE_DISPLAY_ORDER_NOT_RECALCULATED');
    assert.equal(row.comparisonStatus, 'NOT_INDEPENDENTLY_VALIDATED');
    assert.deepEqual(row.unresolvedIdentities, []);
    assert.ok(row.weapons.length > 0);
    consecutive(row.weapons); consecutive(row.echoSets);
    for (const option of row.weapons) {
      assert.ok(option.weaponId && weaponById.has(option.weaponId));
      assert.equal(weaponById.get(option.weaponId!)?.weaponType, characters.get(row.characterId)?.weaponType);
      assert.ok(option.refinement >= 1 && option.refinement <= 5);
      for (const value of option.performance) {
        if (value.sourceText.endsWith('%')) assert.equal(value.relativePerformance, Number(value.sourceText.slice(0, -1)) / 100);
        else assert.equal(value.relativePerformance, null);
      }
    }
    assert.ok(row.echoSets.length);
    for (const option of row.echoSets) {
      assert.ok(sets.has(option.setId)); consecutive(option.mainEchoes);
      for (const echo of option.mainEchoes) assert.ok(echoes.has(echo.echoId));
      if (option.usage === 'COMPANION_OPTION') {
        assert.ok(option.companionToOrder && option.companionToOrder < option.sourceOrder);
        assert.equal(row.echoSets[option.companionToOrder! - 1].usage, 'PRIMARY');
      } else assert.ok(option.mainEchoes.length, `${row.characterId}/${option.setId}`);
    }
    assert.equal(row.mainStats.length, 5);
    assert.ok(row.mainStats.every(slot => slot.sourceText && slot.cost >= 1 && slot.cost <= 4));
    assert.ok(row.substatPriorities.length && row.endgameStats.length && row.skillPriorities.length);
    for (const group of row.skillPriorities) { assert.ok(group.skills.length); consecutive(group.skills); }
    assert.ok(row.teammateGroups.length || row.generalTeamGuidance.some(item => item.sourceText));
    assert.equal(row.teammateOrderingPolicy, 'DISPLAY_ORDER_ONLY_NOT_AN_INFERRED_POWER_RANK');
    assert.equal(row.exampleTeamMembersStatus, 'NOT_EXPOSED_BY_TEXT_CAPTURE');
    for (const group of row.teammateGroups) {
      assert.ok(group.characterIds.length);
      assert.ok(group.characterIds.every(id => id && characters.has(id)));
    }
    for (const context of row.calculationContexts) for (const teammate of context.teammates) {
      assert.ok(teammate.characterId && characters.has(teammate.characterId));
      assert.ok(teammate.weaponId && weaponById.has(teammate.weaponId));
    }
  }
});

test('mode percentages, missing columns, stat prerequisites and support guidance retain source meaning', () => {
  const blank = guides.get('aemeath')!.weapons.find(row => row.weaponId === 'endless-collapse')!;
  assert.deepEqual(blank.performance.map(row => [row.sourceText, row.relativePerformance, row.contextLabel]), [
    ['75.70%', .757, 'Tune Rupture'], ['-', null, 'Fusion Burst'],
  ]);
  assert.deepEqual(guides.get('hsin')!.skillPriorities.map(row => row.contextLabel), ['Flare', 'Unison']);
  assert.equal(guides.get('hsin')!.skillPriorities[1].skills[2].sourceName, 'Intro Skill');
  const jingran = guides.get('jingran')!;
  assert.equal(jingran.endgameStats.find(row => row.sourceStatName === 'ATK')?.sourceText, '3200+ (Post-conversion from HP)');
  assert.equal(jingran.endgameStats.find(row => row.sourceStatName === 'CRIT Rate')?.sourceText, '50%+ (Before Echo set & Signature weapon)');
  for (const id of ['baizhi', 'the-shorekeeper', 'verina']) {
    assert.equal(guides.get(id)!.teammateGroups.length, 0);
    assert.ok(guides.get(id)!.generalTeamGuidance.length);
  }
  assert.match(guides.get('baizhi')!.generalTeamGuidance[0].sourceText!, /incompatible with Coordinated Attack Hybrids/);
});

test('publication is pinned to a reviewed artifact and deterministic generators', () => {
  const bytes = readFileSync(CHARACTER_EQUIPMENT_SOURCE_REVIEW.recommendationArtifact);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), CHARACTER_EQUIPMENT_SOURCE_REVIEW.recommendationArtifactSha256);
  for (const script of ['scripts/generate-character-equipment-relations.mjs', 'scripts/generate-signature-release-effects.mjs']) {
    const run = spawnSync(process.execPath, [script, '--check'], { encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr || run.stdout);
  }
});

test('new original passive families retain rank curves, scope and unresolved execution', () => {
  assert.equal(SIGNATURE_RELEASE_WEAPON_EFFECTS.length, 8);
  const byId = new Map(SIGNATURE_RELEASE_WEAPON_EFFECTS.map(row => [row.effectId, row]));
  assert.deepEqual(byId.get('thousandfold-deliverance-cradle-heavy-def-ignore')?.rankValues, [.15, .175, .20, .225, .25]);
  assert.equal(byId.get('thousandfold-deliverance-cradle-heavy-def-ignore')?.maxStacks, 2);
  assert.equal(byId.get('thousandfold-deliverance-cradle-heavy-def-ignore')?.durationSeconds, 2);
  assert.match(byId.get('thousandfold-deliverance-nature-crit-damage')!.notes, /Shield-trigger cadence is 0.5s/);
  assert.deepEqual(byId.get('blooming-jadehaven-electro-res-ignore')?.rankValues, [.10, .135, .17, .205, .24]);
  assert.equal(byId.get('blooming-jadehaven-skill-amplification')?.durationSeconds, null);
  const flare = byId.get('blooming-jadehaven-flare-amplification')!;
  assert.equal(flare.appliesTo, 'TARGET'); assert.equal(flare.durationSeconds, 30); assert.equal(flare.triggerCooldownSeconds, .1);
  for (const row of SIGNATURE_RELEASE_WEAPON_EFFECTS) {
    if (row.effectType === 'PERMANENT') {
      assert.equal(row.simulatorMode, 'ALWAYS'); assert.equal(row.trigger, 'Passive');
      assert.deepEqual(row.rankValues, [.12, .15, .18, .21, .24]);
    } else {
      assert.equal(row.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL'); assert.equal(row.simulatorMode, 'MANUAL');
      assert.equal(WEAPON_CAST_WINDOW_CONTRACTS.some(contract => contract.effectId === row.effectId), false);
    }
  }
  const bloom = weaponById.get('blooming-jadehaven')!;
  assert.equal(bloom.level90BaseAtk, 587); assert.deepEqual(bloom.secondary, { stat: 'CRIT Rate', value: .243 });
});

test('bounded 3.7 backward-impact review covers current compatible users and preserves existing profiles', () => {
  assert.equal(WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V37.length, 2);
  for (const review of WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V37) {
    assert.deepEqual([...review.reviewedReleasedCharacterIds], released.filter(row => row.weaponType === review.weaponType).map(row => row.id).sort());
    assert.deepEqual([...review.existingWeaponRecommendationProfileIds], WEAPON_RECOMMENDATION_PROFILES.filter(profile => CHARACTER_CATALOG.find(row => row.id === profile.characterId)?.weaponType === review.weaponType).map(row => row.id).sort());
    assert.equal(review.result, 'REVIEWED_NO_EXISTING_PROFILE_CHANGE');
  }
});

test('detached database exports associations and references without granting defaults or readiness', () => {
  const database = buildCharacterDatabase();
  const hsin = database.characters.find(row => row.id === 'hsin')!;
  assert.equal(hsin.signatureWeapon?.weaponId, 'blooming-jadehaven');
  assert.deepEqual(hsin.guideRecommendations, guides.get('hsin'));
  assert.equal(database.characters.find(row => row.id === 'suoming')?.guideRecommendations, null);
  assert.equal(database.characters.find(row => row.id === 'suoming')?.signatureWeapon, null);
  assert.equal(database.profiles.weaponRecommendations.length, PROFILE_CATALOGS.weaponRecommendations.length);
  const originalId = guides.get('hsin')!.weapons[0].weaponId;
  (hsin.guideRecommendations!.weapons[0] as { weaponId: string | null }).weaponId = null;
  assert.equal(guides.get('hsin')!.weapons[0].weaponId, originalId);
  assert.equal(buildCharacterDatabase().characters.find(row => row.id === 'hsin')?.guideRecommendations?.weapons[0].weaponId, originalId);
});
