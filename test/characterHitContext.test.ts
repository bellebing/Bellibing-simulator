import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { ECHO_EFFECT_MODELS } from '../src/data/echoEffects.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import { createRank5EchoAtLevel0, withRank5MainStatsAtLevel, SUBSTAT_VALUE_TABLE, type PrimaryMainStatName } from '../src/echoCore.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { ciacconaInputsFromEchoes } from '../src/characters/ciacconaEchoEvaluator.ts';
import { assembleCharacterHitContext, compareCharacterHitWithAssembledContext,
  listStaticWeaponContextSupport, listStaticSonataContextSupport, listStaticEchoContextSupport,
  type CharacterHitContextSelection, type RemainingHitContext } from '../src/combat/characterHitContext.ts';

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

function withSet(setId: string, f = fixture()) {
  const species = ECHO_CATALOG.filter(e => e.sonataSetIds.some(id => id === setId)).sort((a, b) => a.cost - b.cost).slice(0, 5);
  assert.equal(species.length, 5, setId);
  f.current = species.map((s, i) => card(`synthetic-${i}`, s.cost, 'ATK%'));
  f.candidate = structuredClone(f.current);
  f.candidate[0] = card('synthetic-replacement', species[0].cost, 'HP%');
  f.selection.echoEquipment = { evidenceId: 'synthetic-distinct-species-assignment-not-owned-user-gear', mainSlotIndex: 0,
    slots: species.map(s => ({ echoId: s.id, sonataSetId: setId })) };
  return f;
}

function withMainEcho(echoId: string, f = fixture()) {
  const main = ECHO_CATALOG.find(e => e.id === echoId)!;
  const rest = ECHO_CATALOG.filter(e => e.cost === 1 && e.id !== echoId).slice(0, 4);
  const species = [main, ...rest];
  f.current = species.map((s, i) => card(`synthetic-${i}`, s.cost, 'ATK%'));
  f.candidate = structuredClone(f.current);
  f.candidate[0] = card('synthetic-replacement', main.cost, 'HP%');
  f.selection.echoEquipment = { evidenceId: 'synthetic-explicit-main-slot', mainSlotIndex: 0,
    slots: species.map(s => ({ echoId: s.id, sonataSetId: s.sonataSetIds[0] })) };
  return f;
}

test('all 50 VERIFIED_MODELED main-Echo stat facts reuse canonical values', () => {
  const support = listStaticEchoContextSupport();
  assert.equal(support.length, 50);
  for (const s of support) {
    const characterId = s.wielderCharacterIds?.[0] ?? 'ciaccona';
    const character = CHARACTER_CATALOG.find(c => c.id === characterId)!;
    const weapon = WEAPON_CATALOG.find(w => w.weaponType === character.weaponType && w.id !== 'abyss-surges')!;
    const f = withMainEcho(s.echoId, fixture(characterId, weapon.id));
    const a = assembleCharacterHitContext(f.selection, f.current);
    assert.equal(a.contributions.find(c => c.sourceId === `echo:${s.effectId}`)?.value,
      ECHO_EFFECT_MODELS.find(e => e.effectId === s.effectId)!.value);
    assert.ok(a.requirements.includes(`echo:${s.echoId}:unassembled-effects`));
    assert.equal(compareCharacterHitWithAssembledContext(comparison(f)).comparison.status, 'EVALUATED_HIT_COMPARISON');
  }
});

test('non-main Echoes and wrong wielders do not inherit static bonuses or restricted variants', () => {
  const f = withMainEcho('echo-60001065'); // Ciaccona is not Rover Aero or Cartethyia.
  const a = assembleCharacterHitContext(f.selection, f.current);
  assert.ok(a.contributions.some(c => c.sourceId === 'echo:ECHO_60001065_AERO_DMG'));
  assert.ok(!a.contributions.some(c => c.sourceId === 'echo:ECHO_60001065_AERO_DMG_ROVER_CARTETHYIA'));
  const shifted = { ...f.selection, echoEquipment: { ...f.selection.echoEquipment!, mainSlotIndex: 1 } };
  assert.ok(!assembleCharacterHitContext(shifted, f.current).contributions.some(c => c.sourceId.startsWith('echo:ECHO_60001065')));
  for (const echoId of ['echo-60002015', 'echo-60001915']) {
    const wrong = withMainEcho(echoId), wa = assembleCharacterHitContext(wrong.selection, wrong.current);
    const restricted = ECHO_EFFECT_MODELS.filter(s => s.echoId === echoId && s.wielderCharacterIds);
    assert.ok(restricted.length > 0);
    for (const s of restricted) assert.ok(!wa.contributions.some(c => c.sourceId === `echo:${s.effectId}`));
    for (const s of restricted) {
      const owner = CHARACTER_CATALOG.find(c => c.id === s.wielderCharacterIds![0])!;
      const weapon = WEAPON_CATALOG.find(w => w.weaponType === owner.weaponType && w.id !== 'abyss-surges')!;
      const right = withMainEcho(echoId, fixture(owner.id, weapon.id));
      const ra = assembleCharacterHitContext(right.selection, right.current);
      assert.ok(ra.requirements.includes(`echo:${s.effectId}`), 'Conditional owner restriction still needs proof');
      assert.ok(!ra.contributions.some(c => c.sourceId === `echo:${s.effectId}`));
    }
  }
  for (const mainSlotIndex of [-1, 5, 1.5, NaN]) assert.throws(() => assembleCharacterHitContext({ ...f.selection,
    echoEquipment: { ...f.selection.echoEquipment!, mainSlotIndex } }, f.current), /complete explicit/);
});

test('main-Echo pending state and source activation drift stay out of automatic static context', () => {
  const f = withMainEcho('echo-60001809'), a = assembleCharacterHitContext(f.selection, f.current);
  assert.ok(a.requirements.includes('echo:echo-60001809:LOADOUT_STATE_REPLACEMENT'));
  const kelpie = withMainEcho('echo-60001135'), original = comparison(kelpie);
  const effect = ECHO_EFFECT_MODELS.find(e => e.effectId === 'ECHO_60001135_AERO_DMG')!;
  const old = effect.activation;
  try {
    effect.activation = 'ON_ECHO_CAST';
    const changed = assembleCharacterHitContext(kelpie.selection, kelpie.current);
    assert.ok(changed.requirements.includes(`echo:${effect.effectId}`));
    assert.ok(!changed.contributions.some(c => c.sourceId === `echo:${effect.effectId}`));
    assert.throws(() => compareCharacterHitWithAssembledContext(original), /fresh per-build/);
  } finally { effect.activation = old; }
});

test('actual Ciaccona preset equipment reproduces existing owned-build static arithmetic for a qualified Basic hit', () => {
  const f = fixture(), preset = PROFILE_CATALOGS.presets.find(p => p.id === 'ciaccona-cartethyia-aero')!;
  const shell = PROFILE_CATALOGS.echoLoadouts.find(p => p.id === preset.echoLoadoutProfileId)!;
  const species = [shell.mainEchoId!, 'echo-60001045', 'echo-60000975', 'echo-60001015', 'echo-60001105'];
  // The preset supplies configuration identity; exact rolls here are regression
  // fixtures derived from the existing source table, not a claim about user gear.
  f.current = shell.slots.map((slot, i) => ({ ...withRank5MainStatsAtLevel(createRank5EchoAtLevel0({
    id: `ciaccona-regression-${i}`, cost: slot.cost, primaryMainStat: slot.primaryMainStats[0].stat as PrimaryMainStatName }), 25),
    substats: ['Flat HP', 'Flat DEF', 'HP%', 'DEF%', 'Basic Attack DMG'].map(name => ({ name, value: SUBSTAT_VALUE_TABLE[name][0] })) }));
  f.candidate = structuredClone(f.current);
  f.candidate[0].substats[0] = { name: 'CRIT DMG', value: SUBSTAT_VALUE_TABLE['CRIT DMG'][0] };
  f.selection.hit = { ...f.selection.hit, factId: listCharacterDirectHitSupport()
    .find(h => h.characterId === 'ciaccona' && h.sourceDamageClass === 'BASIC')!.factId };
  f.selection.echoEquipment = { evidenceId: `canonical-configuration:${preset.id};synthetic-rolls`, mainSlotIndex: 0,
    slots: species.map(echoId => ({ echoId, sonataSetId: shell.sonataSetIds[0] })) };
  const zero = { enemyDefense: 0, enemyAeroResistance: 0.2, attackPercent: 0, flatAttack: 0, critRate: 0, critDamage: 0,
    aeroDamageBonus: 0, basicAttackDamageBonus: 0, heavyAttackDamageBonus: 0, resonanceSkillDamageBonus: 0,
    resonanceLiberationDamageBonus: 0, introSkillDamageBonus: 0, allDamageAmplification: 0, energyRegen: 0 };
  const result = compareCharacterHitWithAssembledContext(comparison(f)).comparison;
  assert.equal(result.status, 'EVALUATED_HIT_COMPARISON');
  if (result.status !== 'EVALUATED_HIT_COMPARISON') return;
  for (const [cards, actual] of [[f.current, result.current], [f.candidate, result.candidate]] as const) {
    const expected = ciacconaInputsFromEchoes(cards, zero).inputs;
    for (const [x, y] of [[actual.snapshot.totalScalingStat, expected.totalAttack],
      [actual.snapshot.critRate, expected.critRate], [actual.snapshot.critDamage, expected.critDamage],
      [actual.snapshot.damageBonus, expected.aeroDamageBonus + expected.basicAttackDamageBonus]]) {
      assert.ok(Math.abs(x - y) < 1e-10, `${x} != ${y}`);
    }
  }
});

test('static Sonata family reads canonical values only after complete species/set assignment', () => {
  const support = listStaticSonataContextSupport();
  assert.equal(support.length, 30); // Coordinated damage is deliberately outside this selected-hit taxonomy.
  for (const s of support) {
    const f = withSet(s.sonataSetId), a = assembleCharacterHitContext(f.selection, f.current);
    const fact = SONATA_EFFECT_MODELS.find(e => e.effectId === s.effectId)!;
    assert.equal(a.contributions.find(c => c.sourceId === `sonata:${s.effectId}`)?.value, fact.value);
    assert.equal(compareCharacterHitWithAssembledContext(comparison(f)).comparison.status, 'EVALUATED_HIT_COMPARISON');
  }
  const gusts = withSet('sonata-16'), a = assembleCharacterHitContext(gusts.selection, gusts.current);
  assert.ok(a.contributions.some(c => c.sourceId === 'sonata:S16_2PC_AERO'));
  assert.ok(a.requirements.some(id => id.startsWith('sonata:S16_5PC')));
  assert.ok(!a.contributions.some(c => c.sourceId.startsWith('sonata:S16_5PC')));
});

test('Sonata membership, species duplication, incomplete equipment, source conflicts and below-threshold sets stay explicit', () => {
  const f = withSet('sonata-16');
  const equipment = f.selection.echoEquipment!;
  for (const slots of [equipment.slots.slice(1), equipment.slots.map((s, i) => i === 0 ? equipment.slots[1] : s),
    equipment.slots.map((s, i) => i === 0 ? { ...s, sonataSetId: 'sonata-1' } : s)]) {
    assert.throws(() => assembleCharacterHitContext({ ...f.selection, echoEquipment: { ...equipment, slots } }, f.current));
  }
  const frost = withSet('sonata-1'), a = assembleCharacterHitContext(frost.selection, frost.current);
  assert.ok(a.requirements.includes('sonata:sonata-1:5:source-or-specialized-state'));
  const mixed = structuredClone(f);
  const other = ECHO_CATALOG.filter(e => e.cost === 1 && e.sonataSetIds.some(id => id === 'sonata-1')).slice(0, 3);
  mixed.selection.echoEquipment = { ...equipment, slots: [...equipment.slots.slice(0, 2),
    ...other.map(e => ({ echoId: e.id, sonataSetId: 'sonata-1' }))] };
  const mixedAssembly = assembleCharacterHitContext(mixed.selection, mixed.current);
  assert.ok(mixedAssembly.contributions.some(c => c.sourceId === 'sonata:S16_2PC_AERO'));
  assert.ok(!mixedAssembly.requirements.some(id => id.startsWith('sonata:S16_5PC')));
  assert.ok(!mixedAssembly.requirements.includes('sonata:sonata-1:5:source-or-specialized-state'));
  const baseline = comparison(f);
  const fact = SONATA_EFFECT_MODELS.find(e => e.effectId === 'S16_2PC_AERO')!, old = fact.value;
  try { fact.value += 0.01; assert.throws(() => compareCharacterHitWithAssembledContext(baseline), /fresh per-build/); }
  finally { fact.value = old; }
});

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
