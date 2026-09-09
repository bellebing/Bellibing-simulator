import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildCharacterDatabase, serializeCharacterDatabase } from '../src/characterDatabase.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { CHARACTER_MECHANIC_FACTS } from '../src/data/characterMechanics.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { ECHO_SKILL_PENDING_ADAPTER_FACTS } from '../src/data/echoSkillSourceReview.ts';
import { SONATA_EFFECT_SOURCE_REVIEWS } from '../src/data/sonataEffectSourceReview.ts';
import { activateWeaponCastWindow, WEAPON_CAST_WINDOW_CONTRACTS } from '../src/combat/weaponCastWindowAdapter.ts';
import { activateSonataCastWindow, SONATA_CAST_WINDOW_CONTRACTS } from '../src/combat/sonataCastWindowAdapter.ts';

test('exported cast capabilities resolve existing runtime contracts without duplicating numeric facts', () => {
  const { gear, profiles } = buildCharacterDatabase();
  assert.equal(gear.weaponCastWindows.length, 34);
  assert.equal(gear.sonataCastWindows.length, 6);
  const weaponIds = new Set(gear.weaponCastWindows.map((row) => row.weaponId));
  assert.equal(profiles.weaponRecommendations.filter((profile) => profile.options.some((option) => weaponIds.has(option.weaponId))).length, 12);
  for (const support of gear.weaponCastWindows) {
    const source = gear.weaponEffects.find((effect) => effect.effectId === support.effectId)!;
    assert.equal(source.weaponId, support.weaponId);
    assert.equal(Object.hasOwn(support, 'rankValues'), false);
    assert.equal(Object.hasOwn(support, 'durationSeconds'), false);
    for (const kind of support.triggerEvents) {
      const window = activateWeaponCastWindow({ effectId: support.effectId, rank: 1, wielderId: 'fixture-owner', event: { kind, actorId: 'fixture-owner', atSeconds: 3 } })!;
      assert.equal(window.value, source.rankValues[0]);
      assert.equal(window.expiresAtSeconds, 3 + source.durationSeconds!);
    }
  }
  for (const support of gear.sonataCastWindows) {
    const source = gear.sonataEffects.find((effect) => effect.effectId === support.effectId)!;
    assert.equal(source.sonataSetId, support.sonataSetId);
    assert.equal(source.pieces, support.pieces);
    assert.equal(Object.hasOwn(support, 'value'), false);
    for (const kind of support.triggerEvents) {
      const window = activateSonataCastWindow({ effectId: support.effectId, ownerId: 'fixture-owner', event: { kind, actorId: 'fixture-owner', atSeconds: 3 } })!;
      assert.equal(window.value, source.value);
    }
  }
  // Clients cannot mutate execution bindings through exported nested event lists.
  const originalWeapon = [...WEAPON_CAST_WINDOW_CONTRACTS[0].triggerEvents];
  const originalSonata = [...SONATA_CAST_WINDOW_CONTRACTS[0].triggerEvents];
  gear.weaponCastWindows.find((row) => row.effectId === WEAPON_CAST_WINDOW_CONTRACTS[0].effectId)!.triggerEvents.length = 0;
  gear.sonataCastWindows.find((row) => row.effectId === SONATA_CAST_WINDOW_CONTRACTS[0].effectId)!.triggerEvents.length = 0;
  assert.deepEqual(WEAPON_CAST_WINDOW_CONTRACTS[0].triggerEvents, originalWeapon);
  assert.deepEqual(SONATA_CAST_WINDOW_CONTRACTS[0].triggerEvents, originalSonata);
});

test('every Character profile gear reference resolves in the same exported database', () => {
  const { profiles, gear } = buildCharacterDatabase();
  const weapons = new Set(gear.weapons.map((row) => row.id));
  const echoes = new Set<string>(gear.echoes.map((row) => row.id));
  const sonatas = new Set<string>(gear.sonatas.map((row) => row.id));
  for (const profile of profiles.weaponRecommendations) {
    assert.ok(weapons.has(profile.defaultWeaponId), profile.id);
    for (const option of profile.options) assert.ok(weapons.has(option.weaponId), profile.id);
  }
  for (const profile of profiles.echoLoadouts) {
    if (profile.mainEchoId) assert.ok(echoes.has(profile.mainEchoId), profile.id);
    for (const id of profile.sonataSetIds) assert.ok(sonatas.has(id), profile.id);
  }
  for (const effect of gear.weaponEffects) assert.ok(weapons.has(effect.weaponId), effect.effectId);
  for (const support of gear.weaponResourceCasts) {
    assert.ok(gear.weaponEffects.some((row) => row.weaponId === support.weaponId && row.effectId === support.effectId));
    assert.equal(support.primitiveId, 'weapon-cast-flat-resource-v1');
  }
  for (const support of gear.weaponDamageWindows) {
    assert.ok(gear.weaponEffects.some((row) => row.weaponId === support.weaponId && row.effectId === support.effectId));
    assert.equal(support.scope, 'EXPLICIT_DAMAGE_EVENT_ONLY');
  }
  for (const effect of gear.echoEffects) assert.ok(echoes.has(effect.echoId), effect.effectId);
  for (const attack of gear.echoAttacks) assert.ok(echoes.has(attack.echoId), attack.echoId);
  for (const effect of gear.sonataEffects) assert.ok(sonatas.has(effect.sonataSetId), effect.effectId);
  for (const support of gear.sonataDamageWindows) {
    assert.ok(gear.sonataEffects.some((row) => row.effectId === support.effectId && row.sonataSetId === support.sonataSetId && row.pieces === support.pieces));
    assert.equal(support.scope, 'EXPLICIT_DAMAGE_EVENT_ONLY');
  }
  for (const echo of gear.echoes) {
    for (const id of echo.sonataSetIds) assert.ok(sonatas.has(id), echo.id);
  }
});

test('gear export preserves raw pending/conflict facts and never treats missing effects as zero', () => {
  const { gear } = buildCharacterDatabase();
  assert.deepEqual(new Map(gear.weaponEffects.map((row) => [row.effectId, row])),
    new Map(WEAPON_EFFECT_CATALOG.map((row) => [row.effectId, row])));
  assert.ok(gear.weaponEffects.some((row) => row.mechanicsStatus === 'VERIFIED_RAW_PENDING_MODEL'));
  assert.deepEqual(gear.echoSkillPendingAdapterFacts, ECHO_SKILL_PENDING_ADAPTER_FACTS);
  assert.deepEqual(gear.sonataSourceReviews, SONATA_EFFECT_SOURCE_REVIEWS);
  assert.ok(gear.sonataSourceReviews.some((row) => row.status === 'SOURCE_CONFLICT'));
  assert.equal(gear.weaponEffectCoverage.find((row) => row.weaponId === 'thousandfold-deliverance')?.status,
    'NOT_RELEASED');
  assert.equal(gear.weapons.find((row) => row.id === 'thousandfold-deliverance')?.verificationStatus,
    'PARTIALLY_VERIFIED');
  assert.ok(gear.echoes.some((echo) => !gear.echoAttacks.some((row) => row.echoId === echo.id)));
});

test('batch export preserves canonical identities, source provenance and relational references', () => {
  const db = buildCharacterDatabase();
  assert.equal(db.characters.length, CHARACTER_CATALOG.length);
  assert.equal(db.mechanicsFacts.length, CHARACTER_MECHANIC_FACTS.length);
  assert.equal(db.profiles.presets.length, PROFILE_CATALOGS.presets.length);
  const facts = new Map(db.mechanicsFacts.map((fact) => [fact.factId, fact]));
  for (const support of db.outroTransferSupport) {
    assert.equal(facts.get(support.factId)?.characterId, support.characterId);
    assert.equal(support.scope, 'EXPLICIT_OUTRO_TRANSFER_ONLY');
  }
  for (const support of db.hitPrimitives.echoActiveHits) {
    assert.ok(db.gear.echoAttacks.some((row) => row.echoId === support.echoId
      && row.attacks.some((attack) => attack.attackId === support.attackId && attack.trigger === 'ACTIVE_CAST')));
  }
  for (const character of db.characters) {
    for (const id of character.mechanics?.factIds ?? []) assert.equal(facts.get(id)?.characterId, character.id);
    const source = CHARACTER_CATALOG.find((row) => row.id === character.id)!;
    assert.deepEqual(character.level90, source.level90);
    assert.deepEqual(character.provenance, source.provenance);
  }
  assert.deepEqual(new Set(db.actionValuesAtMaxSkill.map((row) => row.factId)),
    new Set(db.mechanicsFacts.filter((fact) => fact.kind === 'ACTION').map((fact) => fact.factId)));
  const serialized = serializeCharacterDatabase();
  assert.equal(serialized, serializeCharacterDatabase());
  assert.deepEqual(JSON.parse(serialized), JSON.parse(JSON.stringify(db)));
});

test('source completeness never grants a new DPS engine or closes Reference Team pending', () => {
  const db = buildCharacterDatabase();
  assert.deepEqual(db.characters.filter((row) => row.readiness?.disposition === 'DPS_READY').map((row) => row.id),
    ['augusta', 'ciaccona']);
  for (const id of ['buling', 'danjin', 'xiangli-yao']) {
    const character = db.characters.find((row) => row.id === id)!;
    assert.equal(character.mechanics, null);
    assert.ok(character.sourceBlocker?.reason);
    assert.equal(character.readiness?.disposition, 'CHARACTER_MECHANICS_SOURCE_BLOCKED');
  }
  for (const id of ['qingxiao', 'rover-electro', 'suisui']) {
    assert.equal(db.characters.find((row) => row.id === id)?.level90.maxEnergy, null);
  }
  for (const character of db.characters.filter((row) => row.releaseStatus !== 'RELEASED')) {
    assert.equal(character.readiness, null);
  }
  assert.equal(db.referenceTeam01.dependencyCoverageStatus, 'PARTIAL');
  assert.equal(db.referenceTeam01.dpsReady, false);
  assert.deepEqual(db.referenceTeam01.unresolvedDependencies.map((row) => row.id), [
    'iuno-wan-light-at-cap-trigger-semantics',
    'iuno-wan-light-augusta-event-overlap',
    'shorekeeper-stellar-symphony-augusta-window-overlap',
    'shorekeeper-rejuvenating-augusta-window-overlap',
    'shorekeeper-fallacy-team-atk-augusta-window-overlap',
    'shorekeeper-fallacy-wielder-er-stellarealm-state',
  ]);
  assert.equal(db.profiles.rotations.find((row) => row.id === 'changli-standard-rotation')?.executionStatus,
    'SOURCE_SEQUENCE_ONLY');
});

test('a client editing its database copy cannot mutate canonical data or the next export', () => {
  const before = serializeCharacterDatabase();
  const db = buildCharacterDatabase();
  db.characters[0].level90.hp = -123;
  db.mechanicsFacts[0].name = 'client edit';
  db.profiles.presets[0].name = 'client preset edit';
  db.gear.weapons[0].level90BaseAtk = -123;
  db.gear.weaponEffects[0].statOrEffect = 'client effect edit';
  (db.gear.echoEffects[0].provenance.sourceLabels as string[]).push('client provenance edit');
  (db.gear.echoSkillPendingAdapterFacts[0] as { reason: string }).reason = 'client pending edit';
  assert.equal(serializeCharacterDatabase(), before);
});

test('CLI writes usable JSON and an invalid invocation preserves the last successful export', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bellibing-character-export-'));
  const output = join(directory, 'database with spaces.json');
  const run = (...args: string[]) => spawnSync(process.execPath,
    ['--experimental-strip-types', 'scripts/export-character-database.ts', ...args], { encoding: 'utf8' });
  try {
    writeFileSync(output, 'last successful export');
    assert.notEqual(run('--output', output, '--unknown').status, 0);
    assert.equal(readFileSync(output, 'utf8'), 'last successful export');
    const result = run('--output', output);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(output, 'utf8'), serializeCharacterDatabase());
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
