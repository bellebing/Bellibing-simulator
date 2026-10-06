import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { getCharacterMechanicFact, getCharacterMechanicsProfile, CHARACTER_MECHANIC_FACTS } from '../src/data/characterMechanics.ts';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { parseTenLevelCoefficientRow } from '../scripts/lib/character-mechanics-import.mjs';

const source = JSON.parse(readFileSync('data/source/character-forte-ui.json', 'utf8'));
const sourceUrl = 'https://github.com/DommyMM/wuwabuild/blob/2b57a127b26b062ab58d272cd6735338507de1cd/public/Data/Characters.json';
const cohort = ['camellya', 'ciaccona', 'iuno', 'jianxin', 'lumi', 'lupa', 'mortefi', 'phoebe', 'qiuyuan', 'zhezhi'];

function move(characterId: string, moveId: number): string {
  const row = source.characters.find((c: { characterId: string }) => c.characterId === characterId)
    .moves.find((m: { id: number }) => m.id === moveId);
  assert.ok(row);
  return row.description.replace(/\{(\d+)\}/g, (_: string, index: string) => row.descriptionParams[Number(index)])
    .replace(/<[^>]+>/g, '');
}

function promoted(factId: string) {
  const fact = getCharacterMechanicFact(factId);
  assert.ok(fact && fact.kind === 'PASSIVE');
  assert.equal(fact.verificationStatus, 'VERIFIED');
  assert.equal(fact.modelingStatus, 'RAW_ONLY');
  assert.equal(fact.durationSeconds, null);
  assert.equal(fact.maxStacks, null);
  assert.deepEqual(fact.provenance.sourceUrls, [sourceUrl]);
  assert.equal(fact.provenance.checkedAt, '2026-10-06');
  assert.ok(getCharacterMechanicsProfile(fact.characterId)?.factIds.includes(factId));
  assert.deepEqual(buildCharacterDatabase().mechanicsFacts.find((f) => f.factId === factId), fact);
  return fact;
}

test('Camellya Ephemeral replacement preserves full Concerto / cooldown gates and exact spend', () => {
  const raw = move('camellya', 1001307);
  assert.match(raw, /When Concerto Energy is fully recovered, and Ephemeral is not on Cooldown, Resonance Skill is replaced with Ephemeral/);
  assert.match(raw, /Casting Ephemeral consumes 70 Concerto Energy/);
  const fact = promoted('camellya-forte-ephemeral-replacement');
  assert.match(fact.triggerSummary, /fully recovered.*not on cooldown/);
  assert.match(fact.effectSummary, /replaced with Ephemeral.*70 Concerto Energy.*Basic Attack DMG/);
  assert.equal(getCharacterMechanicFact('camellya-forte-budding-mode')?.modelingStatus, 'PENDING_INTERPRETATION');
});

test('Lupa replacement keeps the two-Wolfaith gate and additional Burning Matchpoint condition', () => {
  const raw = move('lupa', 1003607);
  assert.match(raw, /When Wolfaith reaches 2 points, Resonance Skill is replaced with Dance With the Wolf/);
  assert.match(raw, /When Wolfaith reaches 2 points in the Burning Matchpoint state, Resonance Skill is replaced with Dance With the Wolf: Climax/);
  const fact = promoted('lupa-forte-dance-replacements');
  assert.match(fact.triggerSummary, /2 points.*Climax.*Burning Matchpoint/);
  assert.match(fact.effectSummary, /Both consume all Wolfaith.*Resonance Liberation DMG/);
});

test('Phoebe Starflash replacement requires Divine Voice and applies only to the next Heavy Attack', () => {
  const raw = move('phoebe', 1003007);
  assert.match(raw, /When Phoebe has Divine Voice, casting Basic Attack Stage 3 or Dodge Counter replaces the next Heavy Attack with Heavy Attack: Starflash/);
  assert.match(raw, /at the cost of 30 Divine Voice/);
  const fact = promoted('phoebe-forte-starflash-replacement');
  assert.match(fact.triggerSummary, /has Divine Voice.*Basic Attack Stage 3 or Dodge Counter/);
  assert.match(fact.effectSummary, /next Heavy Attack.*Starflash.*30 Divine Voice.*separately owned Absolution/);
});

test('Phoebe Liberation stance facts preserve multiplier increase versus status application', () => {
  const raw = move('phoebe', 1003003);
  assert.match(raw, /Absolution Enhancement: Increase DMG Multiplier by 255%/);
  assert.match(raw, /Confession Enhancement: Apply 8 stacks of Spectro Frazzle to targets hit/);
  const fact = promoted('phoebe-liberation-stance-enhancements');
  assert.match(fact.effectSummary, /Absolution increases the DMG Multiplier by 255%/);
  assert.match(fact.effectSummary, /Confession applies 8 stacks.*targets hit/);
  const s1 = getCharacterMechanicFact('phoebe-s1-warm-light-and-bedside-wishes');
  assert.ok(s1 && s1.kind === 'SEQUENCE');
  assert.match(s1.effectSummary, /480% instead of 255%/);
});

test('Qiuyuan replacement preserves Basic performed identity and Heavy damage classification', () => {
  const raw = move('qiuyuan', 1004107);
  assert.match(raw, /When Qiuyuan reaches 200 points.*Basic Attack is replaced with Basic Attack Thus Spoke the Blade: Inkwash/);
  assert.match(raw, /up to 4 consecutive strikes.*considered as Heavy Attack DMG/);
  const fact = promoted('qiuyuan-forte-inkwash-replacement');
  assert.match(fact.triggerSummary, /200 points/);
  assert.match(fact.effectSummary, /up to 4.*performed action identity is Basic Attack.*damage classification is Heavy Attack DMG/);
  for (let stage = 1; stage <= 4; stage++) {
    const action = getCharacterMechanicFact(`qiuyuan-forte-circuit-verdant-edge-thus-spoke-the-blade-inkwash-stage-${stage}-dmg`);
    assert.ok(action && action.kind === 'ACTION');
    assert.equal(action.actionKind, 'BASIC');
    assert.equal(action.damageClass, 'HEAVY');
  }
  const inksplash = getCharacterMechanicFact('qiuyuan-forte-inksplash-of-mind');
  assert.ok(inksplash && inksplash.kind === 'PASSIVE');
  assert.match(inksplash.effectSummary, /Heavy Attack DMG.*considered performing Echo Skill/);
});

test('reviewed cohort damage curves retain every source component and hit count at all ten levels', () => {
  const shapeKey = (components: readonly { curve: readonly number[]; hitCount: number }[]) =>
    JSON.stringify(components.map((c) => [c.hitCount, ...c.curve.map((n) => Math.round(n * 1e8))]));
  let count = 0;
  for (const characterId of cohort) {
    const rows = source.characters.find((c: { characterId: string }) => c.characterId === characterId).moves
      .flatMap((m: { values: { values: string[] }[] }) => m.values.map((v) => parseTenLevelCoefficientRow(v.values)))
      .filter(Boolean);
    for (const fact of CHARACTER_MECHANIC_FACTS.filter((f) => f.characterId === characterId)) {
      if (fact.kind !== 'ACTION' || (!fact.motionValueCurve && !fact.motionValueComponents)) continue;
      const components = fact.motionValueComponents ?? [{ curve: fact.motionValueCurve!, hitCount: fact.hitCount! }];
      assert.ok(rows.some((row: { components?: { curve: number[]; hitCount: number }[]; curve: number[]; hitCount: number }) =>
        shapeKey(row.components ?? [{ curve: row.curve, hitCount: row.hitCount }]) === shapeKey(components)), fact.factId);
      assert.equal(fact.scalingStat, 'ATK', fact.factId);
      count++;
    }
  }
  assert.equal(count, 182);
});
