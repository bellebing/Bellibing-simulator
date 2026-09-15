import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { assembleCharacterHitContext, compareCharacterHitWithAssembledContext,
  listStaticWeaponContextSupport, type CharacterHitContextSelection, type RemainingHitContext } from '../src/combat/characterHitContext.ts';

const card = (id: string, cost: 1 | 3 | 4, primaryMainStat: 'ATK%' | 'CRIT Rate' | 'HP%') =>
  createRank5EchoAtLevel0({ id, cost, primaryMainStat });

function fixture(characterId = 'ciaccona', weaponId = 'woodland-aria') {
  const fact = listCharacterDirectHitSupport().find(x => x.characterId === characterId)!;
  const selection: CharacterHitContextSelection = {
    hit: { characterId, factId: fact.factId, componentIndex: 0, landedHitCount: 1, sequence: 0, maxSkills: true },
    damageElement: 'Aero', eventContextId: 'synthetic-explicit-selected-hit', characterLevel: 90, maxMinorFortes: true,
    weapon: { id: weaponId, level: 90, rank: 1 },
  };
  const current = [4, 3, 3, 1, 1].map((cost, i) => card(`owned-${i}`, cost as 1 | 3 | 4, 'ATK%'));
  const candidate = structuredClone(current);
  candidate[0] = card('replacement', 4, 'CRIT Rate');
  return { selection, current, candidate };
}
// Synthetic explicit absence of residual effects is test evidence only, never a preset/owned gear claim.
function proof(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  return { status: 'QUALIFIED', assemblyKey: a.assemblyKey, evidenceId: 'synthetic-no-other-active-effect',
    requirements: a.requirements.map(id => ({ id, evidenceId: `synthetic-explicit-absence:${id}` })),
    buildDependentEffectsRecomputed: true, scalingPercent: 0, scalingFlat: 0, critRate: 0, critDamage: 0,
    damageBonus: 0, amplification: 0, defenseMultiplier: 0.5, resistanceMultiplier: 0.9, damageReduction: 0 };
}
function comparison(f = fixture()) {
  return { selection: f.selection, slotIndex: 0,
    current: { echoes: f.current, remaining: proof(assembleCharacterHitContext(f.selection, f.current)) },
    candidate: { echoes: f.candidate, remaining: proof(assembleCharacterHitContext(f.selection, f.candidate)) } };
}

test('canonical Character/weapon assembly reaches all 54 existing hit Characters without changing execution scope', () => {
  const ids = [...new Set(listCharacterDirectHitSupport().map(x => x.characterId))];
  assert.equal(ids.length, 54);
  for (const id of ids) {
    const c = CHARACTER_CATALOG.find(c => c.id === id)!;
    const w = WEAPON_CATALOG.find(w => w.weaponType === c.weaponType && w.id !== 'abyss-surges' && w.releaseStatus === 'RELEASED')!;
    const f = fixture(id, w.id), a = assembleCharacterHitContext(f.selection, f.current);
    const k = { ATK: 'atk', HP: 'hp', DEF: 'def' } as const;
    assert.equal(a.baseScalingStat, c.level90[k[a.scalingStat]]! + (a.scalingStat === 'ATK' ? w.level90BaseAtk! : 0));
    assert.equal(a.authorizesRotationDps, false);
    assert.ok(a.requirements.includes('event-resource-state-feasibility'));
    assert.equal(compareCharacterHitWithAssembledContext(comparison(f)).comparison.status, 'EVALUATED_HIT_COMPARISON');
  }
});

test('real Ciaccona equipment identity supplies base/intrinsic/core secondary; unassembled effects remain pending', () => {
  const f = fixture(), a = assembleCharacterHitContext(f.selection, f.current);
  assert.equal(a.baseScalingStat, 875);
  assert.equal(a.stats['ATK%'], 0.24);
  assert.equal(a.stats['CRIT Rate'], 0.36);
  assert.equal(a.stats['CRIT DMG'], 0.16);
  assert.ok(!a.requirements.includes('weapon:WA-ATK'));
  assert.ok(a.requirements.includes('weapon:WA-AERO'));
  const input = comparison(f);
  input.candidate.remaining = { status: 'PENDING', reason: 'Build-dependent incoming effect is unknown' };
  const result = compareCharacterHitWithAssembledContext(input).comparison;
  assert.equal(result.status, 'PENDING');
  assert.ok(!('expectedDamageDelta' in result));
});

test('permanent weapon stats consume canonical R1-R5 values across compatible real Character consumers', () => {
  const support = listStaticWeaponContextSupport();
  assert.equal(support.length, 60);
  for (const s of support) {
    const w = WEAPON_CATALOG.find(w => w.id === s.weaponId)!;
    if (w.id === 'abyss-surges') continue; // independent core conflict remains parked
    const id = CHARACTER_CATALOG.find(c => c.weaponType === w.weaponType
      && listCharacterDirectHitSupport().some(h => h.characterId === c.id))!.id;
    const fact = WEAPON_EFFECT_CATALOG.find(e => e.effectId === s.effectId)!;
    for (let rank = 1; rank <= 5; rank++) {
      const f = fixture(id, w.id);
      f.selection.weapon = { ...f.selection.weapon, rank };
      const a = assembleCharacterHitContext(f.selection, f.current);
      assert.equal(a.contributions.find(c => c.sourceId === `weapon:${s.effectId}`)?.value, fact.rankValues[rank - 1]);
      assert.ok(!a.requirements.includes(`weapon:${s.effectId}`));
    }
  }
});

test('conditional/source-drifted weapon effects never become permanent uptime', () => {
  const f = fixture(), original = comparison(f);
  const effect = WEAPON_EFFECT_CATALOG.find(e => e.effectId === 'WA-ATK')!;
  const old = effect.conditions;
  try {
    effect.conditions = ['requires an independently observed state'];
    const a = assembleCharacterHitContext(f.selection, f.current);
    assert.ok(a.requirements.includes('weapon:WA-ATK'));
    assert.ok(!a.contributions.some(c => c.sourceId === 'weapon:WA-ATK'));
    assert.throws(() => compareCharacterHitWithAssembledContext(original), /fresh per-build/);
  } finally { effect.conditions = old; }
  const a = assembleCharacterHitContext(f.selection, f.current);
  for (const e of WEAPON_EFFECT_CATALOG.filter(e => e.weaponId === f.selection.weapon.id && e.effectType !== 'PERMANENT')) {
    assert.ok(a.requirements.includes(`weapon:${e.effectId}`));
    assert.ok(!a.contributions.some(c => c.sourceId === `weapon:${e.effectId}`));
  }
});

test('each Echo substitution independently recomputes residual stat dependence and rejects stale evidence', () => {
  const input = comparison();
  const before = compareCharacterHitWithAssembledContext(input).comparison;
  assert.equal(before.status, 'EVALUATED_HIT_COMPARISON');
  const stale = structuredClone(input);
  stale.candidate.remaining = stale.current.remaining;
  assert.throws(() => compareCharacterHitWithAssembledContext(stale), /fresh per-build/);
  assert.equal(input.candidate.remaining.status, 'QUALIFIED');
  if (input.candidate.remaining.status === 'QUALIFIED') input.candidate.remaining = { ...input.candidate.remaining, scalingFlat: 100 };
  const after = compareCharacterHitWithAssembledContext(input).comparison;
  assert.equal(after.status, 'EVALUATED_HIT_COMPARISON');
  if (before.status === 'EVALUATED_HIT_COMPARISON' && after.status === 'EVALUATED_HIT_COMPARISON') {
    assert.equal(after.current.expectedDamage, before.current.expectedDamage);
    assert.ok(after.candidate.expectedDamage > before.candidate.expectedDamage);
    assert.equal(after.authorizesUpgradeVerdict, false);
  }
});

test('missing scope proof, duplicates and omitted numeric residual cannot be converted to zero', () => {
  const input = comparison();
  assert.equal(input.current.remaining.status, 'QUALIFIED');
  if (input.current.remaining.status !== 'QUALIFIED') return;
  for (const patch of [{ requirements: [] }, { requirements: [...input.current.remaining.requirements, input.current.remaining.requirements[0]] },
    { scalingPercent: undefined }, { buildDependentEffectsRecomputed: false }, { evidenceId: '' }]) {
    const bad = structuredClone(input);
    Object.assign(bad.current.remaining, patch);
    assert.throws(() => compareCharacterHitWithAssembledContext(bad), /fresh per-build/);
  }
});

test('wrong identity/sequence/equipment and parked core source conflict fail closed', () => {
  const f = fixture();
  for (const patch of [{ hit: { ...f.selection.hit, characterId: 'jiyan' } },
    { hit: { ...f.selection.hit, factId: 'unknown' } }, { hit: { ...f.selection.hit, sequence: 1 } },
    { characterLevel: 80 }, { maxMinorFortes: false }, { damageElement: 'unknown' },
    { weapon: { id: 'verdant-summit', rank: 1, level: 90 } },
    { weapon: { id: 'woodland-aria', rank: 0, level: 90 } }]) {
    assert.throws(() => assembleCharacterHitContext({ ...f.selection, ...patch } as CharacterHitContextSelection, f.current));
  }
  const bad = fixture('lingyang', 'abyss-surges');
  assert.throws(() => assembleCharacterHitContext(bad.selection, bad.current), /SOURCE_CONFLICT/);
});

test('canonical stat drift, detached results, COST and one-slot rules retain fail-closed boundaries', () => {
  const f = fixture(), first = assembleCharacterHitContext(f.selection, f.current), pristine = structuredClone(first);
  first.contributions[0].value = 999;
  first.selection.weapon.id = 'mutated';
  first.stats['ATK%'] = 999;
  assert.deepEqual(assembleCharacterHitContext(f.selection, f.current), pristine);
  const weapon = WEAPON_CATALOG.find(w => w.id === 'woodland-aria')!;
  const value = weapon.secondary!.value;
  const old = comparison();
  try {
    weapon.secondary!.value += 0.01;
    assert.throws(() => compareCharacterHitWithAssembledContext(old), /fresh per-build/);
  } finally { weapon.secondary!.value = value; }
  const over = structuredClone(f.current);
  over[3] = card('extra-cost', 3, 'ATK%');
  assert.throws(() => assembleCharacterHitContext(f.selection, over), /loadout/);
  const legal = comparison();
  legal.candidate.echoes[1] = card('other-slot', 3, 'HP%');
  legal.candidate.remaining = proof(assembleCharacterHitContext(legal.selection, legal.candidate.echoes));
  assert.throws(() => compareCharacterHitWithAssembledContext(legal), /Only the selected/);
});
