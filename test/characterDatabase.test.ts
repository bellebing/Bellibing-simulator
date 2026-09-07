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

test('batch export preserves canonical identities, source provenance and relational references', () => {
  const db = buildCharacterDatabase();
  assert.equal(db.characters.length, CHARACTER_CATALOG.length);
  assert.equal(db.mechanicsFacts.length, CHARACTER_MECHANIC_FACTS.length);
  assert.equal(db.profiles.presets.length, PROFILE_CATALOGS.presets.length);
  const facts = new Map(db.mechanicsFacts.map((fact) => [fact.factId, fact]));
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
