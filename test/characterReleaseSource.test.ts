import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { CHARACTER_INTRINSIC_PROFILES } from '../src/data/characterIntrinsicStats.ts';
import { auditReleasedCharacterRawCompleteness } from '../src/data/characterRawAudit.ts';
import { CHARACTER_MECHANIC_FACT_BY_ID, CHARACTER_MECHANICS_PROFILE_BY_ID } from '../src/data/characterMechanics.ts';
import { RELEASE_CHARACTER_KIT_FACTS, RELEASE_CHARACTER_MECHANIC_COMPLETION_FACTS } from '../src/data/characterMechanics/releaseCharacterKitFacts.ts';
import { readCharacterActionValues, sumCharacterActionCoefficients } from '../src/characterActionValues.ts';

const source = JSON.parse(readFileSync('data/source/character-release-3.7.json', 'utf8'));
const byId = new Map<string, any>(source.characters.map((c: any) => [c.characterId, c]));

test('59 released records join original role/property identities and use the dedicated EnergyMax field', () => {
  const released = CHARACTER_CATALOG.filter(c => c.releaseStatus === 'RELEASED');
  assert.equal(released.length, 59);
  assert.equal(byId.size, 59);
  assert.equal(source.canonicalAuthority, false);
  assert.equal(source.promotionPolicy, 'EXPLICIT_FIELD_REVIEW_REQUIRED');
  const elements = ['OTHER', 'Glacio', 'Fusion', 'Electro', 'Aero', 'Spectro', 'Havoc'];
  const weapons = ['OTHER', 'Broadblade', 'Sword', 'Pistols', 'Gauntlets', 'Rectifier'];
  for (const c of released) {
    const raw = byId.get(c.id);
    assert.ok(raw, c.id);
    assert.equal(raw.sourceId, raw.role.Id, c.id);
    assert.equal(c.rarity, raw.role.QualityId, c.id);
    assert.equal(raw.role.PropertyId, raw.baseProperty.Id, c.id);
    assert.equal(c.element?.toLowerCase(), elements[raw.role.ElementId].toLowerCase(), c.id);
    assert.equal(c.weaponType?.toLowerCase(), weapons[raw.role.WeaponType].toLowerCase(), c.id);
    assert.equal(c.level90.maxEnergy, raw.baseProperty.EnergyMax / 100, c.id);
    assert.equal(c.baseCombat.critRate, raw.baseProperty.Crit / 10000, c.id);
    assert.equal(c.baseCombat.critDamage, raw.baseProperty.CritDamage / 10000, c.id);
    assert.equal(c.baseCombat.energyRegen, raw.baseProperty.EnergyEfficiency / 10000, c.id);
    for (const [field, property, ratio] of [['hp','LifeMax','LifeMaxRatio'],['atk','Atk','AtkRatio'],['def','Def','DefRatio']] as const) {
      const original = raw.baseProperty[property] * source.level90Growth[ratio] / 10000;
      assert.ok(Math.abs(c.level90[field]! - original) <= 1, `${c.id} ${field}: preserve published integer convention`);
    }
    assert.equal(c.verificationStatus, 'VERIFIED', c.id);
  }
  for (const id of ['lucilla','phrolova']) assert.equal(CHARACTER_CATALOG.find(c => c.id === id)?.level90.maxEnergy, 0);
  assert.equal(CHARACTER_CATALOG.find(c => c.id === 'jingran')?.level90.def, 0);
  assert.equal(byId.has('suoming'), false);
});

test('each permanent Minor Forte total re-derives all eight original property nodes', () => {
  const propertyNames: Record<number, string> = { 1:'HP%', 7:'ATK%', 8:'CRIT Rate', 9:'CRIT DMG', 10:'DEF%', 35:'Healing Bonus', 10002:'HP%', 10001:'HP%', 10007:'ATK%', 10010:'DEF%', 19:'CRIT Rate', 20:'CRIT DMG', 21:'Healing Bonus', 22:'Glacio DMG', 23:'Fusion DMG', 24:'Electro DMG', 25:'Aero DMG', 26:'Spectro DMG', 27:'Havoc DMG' };
  for (const profile of CHARACTER_INTRINSIC_PROFILES) {
    const nodes = byId.get(profile.characterId).tree.filter((n: any) => n.NodeType === 4);
    assert.equal(nodes.length, 8, profile.characterId);
    const totals = new Map<string, number>();
    for (const n of nodes) {
      assert.equal(n.Property.length, 1, profile.characterId);
      const name = propertyNames[n.Property[0].Id];
      assert.ok(name, `${profile.characterId}: unknown property ${n.Property[0].Id}`);
      const amount = Number(n.PropertyNodeParam[0].replace('%', '')) / 100;
      totals.set(name, (totals.get(name) ?? 0) + amount);
    }
    assert.equal(profile.stats.length, totals.size, profile.characterId);
    for (const stat of profile.stats) assert.ok(Math.abs(stat.value - totals.get(stat.stat)!) < 1e-10, `${profile.characterId} ${stat.stat}`);
  }
});

test('all 1,903 legacy value rows match release 3.7 at every level 1–10 without interpolation', () => {
  const legacy = JSON.parse(readFileSync('data/source/character-forte-ui.json','utf8'));
  const normalize = (value: string) => value.replace(/\d+(?:\.\d+)?/g, n => String(Number(n)));
  let rows = 0;
  for (const character of legacy.characters) {
    const raw = byId.get(character.characterId);
    for (const move of character.moves) {
      const original = raw.skills.find((s: any) => s.source.Id === move.id);
      assert.ok(original, `${character.characterId} move ${move.id}`);
      for (const value of move.values) {
        const originalRow = original.values.find((v: any) => v.source.Id === value.id);
        assert.ok(originalRow, `${character.characterId} row ${value.id}`);
        assert.deepEqual(value.values.map(normalize), originalRow.source.SkillDetailNum[0].ArrayString.slice(0,10).map(normalize), `${character.characterId} row ${value.id}`);
        rows++;
      }
    }
  }
  assert.equal(rows, 1903);
});

test('Hsin and Jingran expose exact ten-level components and all six original sequences', () => {
  const expectedRows = { hsin:37, jingran:22 };
  for (const characterId of ['hsin','jingran'] as const) {
    const raw = byId.get(characterId);
    const facts = RELEASE_CHARACTER_KIT_FACTS.filter(f => f.characterId === characterId);
    const actions = facts.filter(f => f.kind === 'ACTION' && f.factId.startsWith(`${characterId}-damage-`));
    assert.equal(actions.length, expectedRows[characterId]);
    for (const action of actions) {
      assert.equal(action.kind, 'ACTION');
      if (action.kind !== 'ACTION') continue;
      const rowId = Number(action.factId.split('-').at(-1));
      const row = raw.skills.flatMap((s: any) => s.values).find((v: any) => v.source.Id === rowId);
      for (let level=1;level<=10;level++) {
        const expression = row.source.SkillDetailNum[0].ArrayString[level-1];
        const components = expression.split('+').map((term: string) => {
          const [percentage, count='1'] = term.split('*');
          return { coefficient:Number(percentage.replace('%','')) / 100, hitCount:Number(count) };
        });
        assert.deepEqual(readCharacterActionValues(action, level), { status:'SOURCE_VALUES', kind:'COEFFICIENTS', components }, `${action.factId} Lv${level}`);
      }
      assert.equal(action.modelingStatus, 'RAW_ONLY');
      if (action.scalingStat === 'MIXED') assert.throws(() => sumCharacterActionCoefficients(action), /supported scaling stat/);
    }
    assert.equal(facts.filter(f => f.section === 'RESONANCE_CHAIN').length, 6);
    assert.equal(raw.chains.length, 6);
    assert.equal(facts.filter(f => f.section === 'INHERENT_SKILL').length, 2);
    assert.ok(CHARACTER_MECHANICS_PROFILE_BY_ID.get(characterId)?.coverage.every(c => c.status === 'VERIFIED'));
    const tune = facts.find(f => f.section === 'TUNE_BREAK');
    assert.ok(tune?.kind === 'ACTION');
    assert.deepEqual(readCharacterActionValues(tune), {status:'UNAVAILABLE',reason:'NOT_CHARACTER_DAMAGE'});
  }
  for (const [index,damage] of [30,25].entries()) {
    const flat = CHARACTER_MECHANIC_FACT_BY_ID.get(`jingran-shadow-step-flat-${index+1}`);
    assert.ok(flat?.kind === 'ACTION');
    assert.deepEqual(readCharacterActionValues(flat), {status:'SOURCE_VALUES',kind:'FLAT_DAMAGE',damagePerHit:damage,hitCount:1});
    assert.match(flat.motionValueContext, /unaffected by all DMG Bonus/);
  }
});

test('original runtime damage types resolve Buling and Xiangli independently from their skill panels', () => {
  const buling = byId.get('buling');
  for (const [skillId, type] of [[1004301,0],[1004301,1],[1004302,4],[1004303,2]]) {
    const skill = buling.skills.find((s: any) => s.source.Id === skillId);
    assert.ok(skill);
    assert.ok(skill.source.DamageList.some((id: number) => buling.damage.some((d: any) => d.Id === id && d.Type === type)), `control skill ${skillId}`);
  }
  const cases = [
    ['buling','buling-forte-five-thunders-spell-array',[1307019002],2,'LIBERATION'],
    ['xiangli-yao','xiangli-yao-pivot-impale-stage-1',[1305011001],0,'BASIC'],
    ['xiangli-yao','xiangli-yao-pivot-impale-stage-2',[1305012001,1305012002,1305012003,1305012004],0,'BASIC'],
    ['xiangli-yao','xiangli-yao-pivot-impale-stage-3',[1305013001,1305013002],0,'BASIC'],
  ] as const;
  for (const [id,factId,damageIds,type,classification] of cases) {
    const fact = CHARACTER_MECHANIC_FACT_BY_ID.get(factId);
    assert.ok(fact?.kind === 'ACTION');
    assert.equal(fact.damageClass, classification);
    for (const damageId of damageIds) {
      const row = byId.get(id).damage.find((d: any) => d.Id === damageId);
      assert.ok(row, `${id}: damage ${damageId}`);
      assert.equal(row.Type,type);
    }
    assert.equal(fact.modelingStatus,'PENDING_INTERPRETATION');
  }
});

test('empty pending manifest still rejects missing fields and does not mistake explicit zero for null', () => {
  const original = CHARACTER_CATALOG.find(c => c.id === 'jingran')!;
  assert.deepEqual(auditReleasedCharacterRawCompleteness([original]).unexpectedMissing,[]);
  const broken = {...original,level90:{...original.level90,maxEnergy:null}};
  assert.deepEqual(auditReleasedCharacterRawCompleteness([broken]).unexpectedMissing,[{characterId:'jingran',field:'maxEnergy'}]);
});


test('all 30 new Sequence effects preserve the original six row identities, parameters and conditions', () => {
  const facts = [...RELEASE_CHARACTER_KIT_FACTS,...RELEASE_CHARACTER_MECHANIC_COMPLETION_FACTS];
  for (const id of ['hsin','jingran','buling','danjin','xiangli-yao']) {
    const chains = facts.filter(f => f.characterId === id && f.kind === 'SEQUENCE');
    assert.deepEqual(chains.map(f => f.kind === 'SEQUENCE' ? f.sequence : 0), [1,2,3,4,5,6]);
    for (const chain of byId.get(id).chains) {
      const fact = chains.find(f => f.kind === 'SEQUENCE' && f.sequence === chain.source.GroupIndex);
      assert.ok(fact?.kind === 'SEQUENCE');
      const text = chain.descriptionTemplate.replace(/\{(\d+)\}/g, (_: string,n: string) => chain.source.AttributesDescriptionParams[Number(n)]).replace(/<[^>]+>/g, '').replace(/\{Cus:Sap,[^}]*P=([^ }]+)[^}]*\}/g, '$1');
      assert.equal(fact.name,chain.name);
      assert.equal(fact.effectSummary,text, `${id} S${chain.source.GroupIndex}`);
      assert.equal(fact.modelingStatus,'RAW_ONLY');
    }
  }
});
