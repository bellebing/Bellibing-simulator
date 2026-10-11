import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { TEAM_AWARE_ROTATION_REFERENCES as references, CHARACTER_ROTATION_REFERENCE_COVERAGE as coverage, TEAM_AWARE_ROTATION_SOURCE_REVIEW as review } from '../src/data/teamAwareRotationReferences.ts';
import { findTeamAwareRotationReferences as find } from '../src/teamAwareRotationReferences.ts';

const byId = new Map(references.map(row => [row.id, row]));
const reference = (character: string, variant: string) => byId.get(`prydwen-${character}-${variant}`)!;
const instructions = (character: string, variant: string) => reference(character, variant).steps.map(step => step.instruction);

test('all released identities have basic source references; priorities never masquerade as rotations', () => {
  const released = CHARACTER_CATALOG.filter(row => row.releaseStatus === 'RELEASED').map(row => row.id).sort();
  assert.equal(released.length, 59);
  assert.equal(references.length, 96);
  assert.equal(byId.size, references.length);
  assert.deepEqual(coverage.map(row => row.characterId).sort(), released);
  assert.equal(coverage.filter(row => row.status === 'BASIC_SOURCE_SEQUENCE_AVAILABLE').length, 57);
  assert.deepEqual(coverage.filter(row => row.status === 'PRIORITY_GUIDANCE_ONLY').map(row => row.characterId), ['jianxin', 'yuanwu']);
  for (const row of coverage) {
    assert.deepEqual(row.referenceIds, references.filter(ref => ref.characterId === row.characterId).map(ref => ref.id));
    assert.ok(row.referenceIds.length);
  }
  for (const row of references) {
    assert.equal(row.source.provider, 'PRYDWEN');
    assert.equal(row.source.url, `https://www.prydwen.gg/wuthering-waves/characters/${row.characterId}`);
    assert.match(row.source.sectionSha256, /^[a-f0-9]{64}$/);
    assert.equal(row.sourceReviewStatus, 'REVIEWED_REFERENCE_ONLY');
    assert.equal(row.context.teamSemantics, 'EXPLICIT_SOURCE_CONTEXT_NOT_UNIVERSAL_TEAM_ELIGIBILITY');
    if (row.executionStatus === 'SOURCE_PRIORITY_ONLY') {
      assert.equal(row.steps.length, 0); assert.ok(row.priorityGuidance.length);
      assert.equal(row.sourceOrderBasis, 'PRIORITY_DISPLAY_ORDER_NOT_TIMELINE');
    } else {
      assert.equal(row.executionStatus, 'SOURCE_SEQUENCE_ONLY');
      assert.ok(row.steps.length); assert.equal(row.priorityGuidance.length, 0);
      assert.deepEqual(row.steps.map(step => step.order), row.steps.map((_, i) => i + 1));
    }
    for (const step of [...row.steps, ...row.priorityGuidance]) {
      assert.ok(step.instruction.trim()); assert.ok(step.sourceLine > 0);
    }
    for (const forbidden of ['rotationSeconds', 'engineModelId', 'uptime', 'dps', 'damage', 'modeledMechanicFactIds']) assert.equal(Object.hasOwn(row, forbidden), false);
    assert.equal(PROFILE_REGISTRY.rotations.has(row.id), false);
  }
});

test('team combinations retain OR/AND meaning and unknown parties stay explicit', () => {
  const cart = (team: string[]) => find('cartethyia', { phase: 'STANDARD', introAvailable: true, teamCharacterIds: team });
  assert.deepEqual(cart(['cartethyia', 'ciaccona', 'rover-aero']).map(row => row.reference.variantKey), ['standard']);
  assert.deepEqual(cart(['cartethyia', 'chisa', 'rover-aero']).map(row => row.reference.variantKey), ['standard']);
  assert.deepEqual(cart(['cartethyia', 'chisa', 'the-shorekeeper']).map(row => row.reference.variantKey), ['low-aero-erosion']);
  assert.deepEqual(cart(['cartethyia', 'youhu', 'the-shorekeeper']).map(row => row.reference.variantKey), ['low-aero-erosion']);
  assert.ok(find('cartethyia').every(row => row.needsReview.includes('TEAM')));
  assert.throws(() => cart(['cartethyia', 'not-a-character']), /unique released identities/);
  assert.throws(() => cart(['cartethyia', 'cartethyia']), /unique released identities/);
  assert.throws(() => cart(['ciaccona', 'rover-aero']), /must contain the Character/);
});

test('mode filtering does not infer a mode from teammates or fall back on unknown modes', () => {
  assert.deepEqual(find('hsin', { modeKey: 'unison', teamCharacterIds: ['hsin', 'jinhsi', 'the-shorekeeper'] }).map(row => row.reference.variantKey), ['unison']);
  assert.deepEqual(find('hsin', { modeKey: 'unison', teamCharacterIds: ['hsin', 'rover-electro', 'buling'] }), []);
  assert.deepEqual(find('hsin', { modeKey: 'electro-flare' }).map(row => row.reference.variantKey), ['electro-flare']);
  assert.deepEqual(find('phoebe', { modeKey: 'confession', teamCharacterIds: ['phoebe', 'zani', 'the-shorekeeper'] }).map(row => row.reference.variantKey), ['confession']);
  assert.deepEqual(find('hsin', { modeKey: 'made-up-mode' }), []);
  assert.deepEqual(find('suoming'), []);
  assert.equal(find('hsin').length, 2);
  assert.ok(find('hsin').every(row => row.needsReview.includes('MODE')));
  assert.ok(find('aemeath', { modeKey: 'fusion-burst' }).some(row => row.reference.variantKey === 'standard'));
  assert.ok(find('aemeath', { modeKey: 'tune-rupture' }).some(row => row.reference.variantKey === 'standard'));
});

test('named examples provide context without turning into exclusive team requirements', () => {
  const matched = find('iuno', { modeKey: 'semi-dps', teamCharacterIds: ['iuno', 'augusta', 'the-shorekeeper'] });
  assert.equal(matched.length, 1); assert.equal(matched[0].teamAffinity, 'EXPLICIT_SOURCE_EXAMPLE');
  assert.equal(find('iuno', { modeKey: 'semi-dps', teamCharacterIds: ['iuno', 'calcharo', 'verina'] }).length, 1);
  assert.equal(reference('rover-electro', 'double-intro').context.requiredTeamCombinations.length, 0);
  assert.ok(find('rover-electro').find(row => row.reference.variantKey === 'double-intro')!.needsReview.includes('GUIDE_CONDITIONS'));
});

test('Hsin, Jinhsi and double-Intro references preserve actual partner turns', () => {
  const hsin = instructions('hsin', 'unison');
  assert.equal(hsin.filter(row => row.startsWith('Intro: Manifold Unison')).length, 2);
  const handoff = hsin.findIndex(row => row.includes('second Outro'));
  assert.ok(handoff > 0);
  assert.equal(hsin[handoff - 1], 'Outro (Unison)');
  assert.equal(hsin[handoff + 1], 'Intro: Manifold Unison');
  const jinhsi = instructions('jinhsi', 'standard');
  const partner = jinhsi.findIndex(row => row.startsWith('Complete another rotation'));
  assert.equal(jinhsi[partner - 1], 'Outro'); assert.equal(jinhsi[partner + 1], 'Intro');
  const electro = instructions('rover-electro', 'double-intro');
  assert.ok(electro.indexOf('Partner handoff: enable Electro Rover’s second Intro') < electro.lastIndexOf('Intro'));
});

test('Phrolova adaptations move Lucilla Skill and retain Cantarella damage before the outgoing switch', () => {
  const query = { modeKey: 'echo-skill', teamCharacterIds: ['lucilla', 'phrolova', 'qiuyuan'] };
  assert.deepEqual(find('lucilla', query).map(row => row.reference.variantKey), ['phrolova']);
  const lucilla = instructions('lucilla', 'phrolova');
  assert.equal(lucilla[0], 'Before entry: Hold Skill: Spotlight');
  assert.equal(lucilla[2], 'Ultimate');
  assert.ok(lucilla.indexOf('Hold Skill: Spotlight (after Letting It Go)') > lucilla.indexOf('Heavy: Letting It Go'));
  assert.equal(reference('lucilla', 'phrolova').source.reviewKind, 'SOURCE_DESCRIBED_ADAPTATION');
  assert.deepEqual(reference('lucilla', 'phrolova').source.adaptationEvidenceLines, [803]);
  assert.deepEqual(find('cantarella', { teamCharacterIds: ['cantarella', 'phrolova', 'qiuyuan'] }).map(row => row.reference.variantKey), ['phrolova']);
  assert.match(instructions('cantarella', 'phrolova').at(-2)!, /remain active until the attack hits/);
});

test('opener, Intro and gear-dependent loops remain conditional source references', () => {
  assert.deepEqual(find('buling', { introAvailable: false }).map(row => row.reference.variantKey), ['no-intro']);
  assert.deepEqual(find('buling', { introAvailable: true }).map(row => row.reference.variantKey), ['intro']);
  assert.equal(reference('rebecca', 'opener').context.introAvailability, true);
  assert.ok(reference('the-shorekeeper', 'no-concerto-alternating-loop').notes.some(row => /alternat/i.test(row)));
  assert.ok(reference('the-shorekeeper', 'concerto-r1-loop').context.conditions.some(row => /R1/.test(row)));
  assert.ok(reference('youhu', 'standard').context.conditions.some(row => /Marcato/.test(row)));
  assert.match(reference('ciaccona', 'standard').echoTiming!, /active cast is omitted/);
  assert.equal(instructions('jiyan', 'standard').filter(row => row.includes('Lance of ')).length, 7);
  assert.ok(reference('mortefi', 'standard').steps.at(-1)!.instruction.startsWith('Echo'));
  const zhezhi = instructions('zhezhi', 'jinhsi-no-liberation');
  assert.equal(zhezhi.some(row => row === 'Ultimate'), false);
  assert.match(zhezhi.at(-2)!, /If Concerto is insufficient/);
  assert.equal(find('zhezhi', { teamCharacterIds: ['zhezhi', 'carlotta', 'the-shorekeeper'] }).some(row => row.reference.variantKey === 'jinhsi-no-liberation'), false);
});

test('source/review pins and deterministic generation reject an edited capture before promotion', () => {
  const packet = readFileSync(review.sourceArtifact);
  assert.equal(createHash('sha256').update(packet).digest('hex'), review.sourceArtifactSha256);
  assert.equal(createHash('sha256').update(readFileSync(review.reviewArtifact)).digest('hex'), review.reviewSha256);
  const generator = resolve('scripts/generate-team-aware-rotation-references.mjs');
  const check = spawnSync(process.execPath, ['--experimental-strip-types', generator, '--check'], { encoding: 'utf8' });
  assert.equal(check.status, 0, check.stderr || check.stdout);
  const directory = mkdtempSync(join(tmpdir(), 'rotation-review-'));
  try {
    for (const file of [review.sourceArtifact, review.reviewArtifact, review.publicationReviewArtifact]) {
      mkdirSync(join(directory, 'data/source'), { recursive: true });
      writeFileSync(join(directory, file), readFileSync(file));
    }
    const changed = JSON.parse(packet.toString()); changed.references[0].steps[0].instruction = 'fabricated rotation';
    writeFileSync(join(directory, review.sourceArtifact), JSON.stringify(changed));
    const invalid = spawnSync(process.execPath, ['--experimental-strip-types', generator, '--check'], { cwd: directory, encoding: 'utf8' });
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /explicit publication source review required/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('database joins are detached and source references never replace executable profiles or presets', () => {
  const db = buildCharacterDatabase();
  assert.equal(db.rotationReferences.references.length, 96);
  assert.deepEqual(db.profiles.rotations, [...PROFILE_CATALOGS.rotations].sort((a, b) => a.id.localeCompare(b.id, 'en')));
  assert.equal(db.profiles.presets.length, PROFILE_CATALOGS.presets.length);
  for (const row of db.characters) {
    assert.deepEqual(row.rotationReferenceIds, coverage.find(c => c.characterId === row.id)?.referenceIds ?? []);
    if (row.releaseStatus !== 'RELEASED') assert.deepEqual(row.rotationReferenceIds, []);
  }
  const copied = db.rotationReferences.references.find(row => row.id === 'prydwen-hsin-unison')!;
  (copied.steps[0] as { instruction: string }).instruction = 'client mutation';
  db.characters.find(row => row.id === 'hsin')!.rotationReferenceIds.length = 0;
  assert.equal(reference('hsin', 'unison').steps[0].instruction, 'Intro: Manifold Unison');
  assert.ok(buildCharacterDatabase().characters.find(row => row.id === 'hsin')!.rotationReferenceIds.length);
});
