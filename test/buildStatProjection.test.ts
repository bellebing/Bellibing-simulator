import assert from 'node:assert/strict';
import test from 'node:test';
import { projectStaticBuildStats } from '../src/buildStatProjection.mjs';

const contract={
  rank:5,levels:[0,5,10,15,20,25],maxSubstats:5,
  mainStatsByCostAndLevel:{
    '4':{'5':[{name:'CRIT Rate',value:.0792}]},
    '3':{'0':[{name:'Electro DMG',value:.06}]},
    '1':{'0':[{name:'HP%',value:.0456}]}
  },
  secondaryMainStatsByCostAndLevel:{
    '4':{'5':{name:'Flat ATK',value:54}},
    '3':{'0':{name:'Flat ATK',value:20}},
    '1':{'0':{name:'Flat HP',value:456}}
  },
  substats:[
    {name:'Energy Regen',values:[.068]},
    {name:'Heavy Attack DMG',values:[.064]},
    {name:'CRIT Rate',values:[.063]}
  ]
};

const character={
  element:'Electro',
  level90:{hp:10300,atk:463,def:1112},
  baseCombat:{critRate:.05,critDamage:1.5,energyRegen:1},
  intrinsicStats:[{stat:'CRIT Rate',value:.08},{stat:'ATK%',value:.12}]
};
const fullForte=character.intrinsicStats;

test('static Build projection combines Character, active Minor Forte, committed Weapon and exact partial Echo cards only',()=>{
  const weapon={level90BaseAtk:587,secondary:{stat:'CRIT Rate',value:.243},effectIds:['MUST_NOT_APPLY']};
  const echoSlots=[{
    echoId:'echo-a',cost:4,rank:5,level:5,
    mainStat:{name:'CRIT Rate',value:.0792},
    secondaryMainStat:{name:'Flat ATK',value:54},
    substats:[{name:'Energy Regen',value:.068}],
    selectedSonataSetId:'ignored'
  },null,null,null,null];
  const out=projectStaticBuildStats({character,weapon,echoSlots,echoStatContract:contract,activeForteStats:fullForte});
  assert.ok(Math.abs(out.atk-1230)<1e-12);
  assert.ok(Math.abs(out.critRate-.4522)<1e-12);
  assert.ok(Math.abs(out.energyRegen-1.068)<1e-12);
  assert.equal(out.hp,10300);
  assert.equal(out.def,1112);
  assert.equal(out.elementDamageLabel,'Electro DMG Bonus');
  assert.equal(out.echoCardCount,1);
  assert.equal(out.includesActiveMinorForteStats,true);
  assert.equal(out.includesLegacyIntrinsicTotals,false);
  assert.equal(out.includesWeaponEffects,true);
  assert.equal(out.includesReviewedStaticWeaponStats,true);
  assert.equal(out.includesConditionalWeaponEffects,false);
  assert.equal(out.includesSonataEffects,false);
  assert.equal(out.includesEchoSkillEffects,false);
  assert.equal(out.includesSequenceEffects,true);
  assert.equal(out.includesReviewedStaticSequenceStats,true);
  assert.equal(out.includesConditionalSequenceEffects,false);
  assert.equal(out.includesTeamBuffs,false);
  assert.equal(out.includesCombatUptime,false);
});

test('projection supports unequipped and partially equipped builds with HP/DEF/element/healing Forte rows',()=>{
  const activeForteStats=[{stat:'HP%',value:.12},{stat:'Healing Bonus',value:.12},{stat:'Electro DMG',value:.12}];
  const richer={...character,intrinsicStats:[{stat:'HP%',value:99},{stat:'Healing Bonus',value:99},{stat:'Electro DMG',value:99}]};
  const weapon={level90BaseAtk:0,secondary:{stat:'HP%',value:.228}};
  const echoSlots=[
    {echoId:'e1',cost:3,rank:5,level:0,mainStat:{name:'Electro DMG',value:.06},secondaryMainStat:{name:'Flat ATK',value:20},substats:[]},
    {echoId:'e2',cost:1,rank:5,level:0,mainStat:{name:'HP%',value:.0456},secondaryMainStat:{name:'Flat HP',value:456},substats:[]}
  ];
  const out=projectStaticBuildStats({character:richer,weapon,echoSlots,echoStatContract:contract,activeForteStats});
  assert.ok(Math.abs(out.hp-(10300*(1+.12+.228+.0456)+456))<1e-9);
  assert.ok(Math.abs(out.elementDamageBonus-.18)<1e-12);
  assert.ok(Math.abs(out.healingBonus-.12)<1e-12);
  assert.equal(out.atk,463+20);
});

test('projection fails closed on corrupted committed Echo values and unsupported Weapon/Forte rows',()=>{
  const badEcho={echoId:'bad',cost:4,rank:5,level:5,mainStat:{name:'CRIT Rate',value:.08},secondaryMainStat:{name:'Flat ATK',value:54},substats:[{name:'Energy Regen',value:.068}]};
  assert.throws(()=>projectStaticBuildStats({character,echoSlots:[badEcho],echoStatContract:contract,activeForteStats:fullForte}),/primary Main Stat/);
  assert.throws(()=>projectStaticBuildStats({character,weapon:{level90BaseAtk:500,secondary:{stat:'Mystery',value:.1}},echoSlots:[],echoStatContract:contract,activeForteStats:fullForte}),/Unsupported equipped Weapon secondary stat/);
  assert.throws(()=>projectStaticBuildStats({character,echoSlots:[],echoStatContract:contract,activeForteStats:[{stat:'ATK%',value:NaN}]}),/Active Minor Forte/);
});

test('preview-only/effect/sequence fields and legacy intrinsic totals are outside the interactive projection contract',()=>{
  const base=projectStaticBuildStats({character,echoSlots:[],echoStatContract:contract,activeForteStats:fullForte});
  const noisy=projectStaticBuildStats({
    character:{...character,intrinsicStats:[{stat:'ATK%',value:99},{stat:'CRIT Rate',value:99}],sequenceLevel:6,teamBuffs:[999]},
    weapon:{level90BaseAtk:0,secondary:null,effectIds:['fake'],previewId:'preview-only'},
    echoSlots:[],
    echoStatContract:contract,
    activeForteStats:fullForte,
    sequenceLevel:6,
    previewWeapon:{level90BaseAtk:9999},
    previewEcho:{mainStat:{name:'ATK%',value:99}}
  });
  assert.equal(noisy.atk,base.atk);
  assert.equal(noisy.critRate,base.critRate);
  const none=projectStaticBuildStats({character,echoSlots:[],echoStatContract:contract,activeForteStats:[]});
  assert.equal(none.atk,character.level90.atk);
  assert.equal(none.critRate,character.baseCombat.critRate);
});

test('active Minor Forte input projects CRIT/ATK/HP/DEF/Element/Healing families without intrinsic double counting',()=>{
  const families=[
    {stat:'CRIT Rate',value:.08,key:'critRate',expected:.13},
    {stat:'ATK%',value:.12,key:'atk',expected:518.56},
    {stat:'HP%',value:.12,key:'hp',expected:11536},
    {stat:'DEF%',value:.152,key:'def',expected:1281.024},
    {stat:'Electro DMG',value:.12,key:'elementDamageBonus',expected:.12},
    {stat:'Healing Bonus',value:.12,key:'healingBonus',expected:.12}
  ];
  for(const row of families){
    const out=projectStaticBuildStats({
      character:{...character,intrinsicStats:[{stat:row.stat,value:99}]},
      echoSlots:[],
      echoStatContract:contract,
      activeForteStats:[{stat:row.stat,value:row.value}]
    });
    assert.ok(Math.abs(out[row.key]-row.expected)<1e-10,row.stat);
  }
});


test('reviewed static Sequence stats are additive, cumulative-ready inputs and remove exactly when the input disappears',()=>{
  const qingxiao={...character,element:'Aero',level90:{hp:10300,atk:462,def:1112},baseCombat:{critRate:.05,critDamage:1.5,energyRegen:1}};
  const s0=projectStaticBuildStats({character:qingxiao,echoSlots:[],echoStatContract:contract,activeForteStats:[],activeSequenceStats:[]});
  const s1=projectStaticBuildStats({character:qingxiao,echoSlots:[],echoStatContract:contract,activeForteStats:[],activeSequenceStats:[{stat:'CRIT Rate',value:.16,sourceSequence:{characterId:'qingxiao',sequence:1,sourceChainId:331}}]});
  const s3=projectStaticBuildStats({character:qingxiao,echoSlots:[],echoStatContract:contract,activeForteStats:[],activeSequenceStats:[{stat:'CRIT Rate',value:.16,sourceSequence:{characterId:'qingxiao',sequence:1,sourceChainId:331}}]});
  assert.equal(s0.critRate,.05);
  assert.ok(Math.abs(s1.critRate-.21)<1e-12);
  assert.ok(Math.abs(s3.critRate-.21)<1e-12);
  assert.equal(s1.sequenceStaticStatCount,1);
  assert.equal(s0.sequenceStaticStatCount,0);
  assert.equal(s0.critRate,.05);
});

test('Sequence static stats add with Minor Forte, Weapon secondary and Echo stats without double counting',()=>{
  const weapon={level90BaseAtk:587,secondary:{stat:'CRIT Rate',value:.243}};
  const echoSlots=[{
    echoId:'echo-a',cost:4,rank:5,level:5,
    mainStat:{name:'CRIT Rate',value:.0792},
    secondaryMainStat:{name:'Flat ATK',value:54},
    substats:[{name:'Energy Regen',value:.068}]
  }];
  const out=projectStaticBuildStats({
    character,weapon,echoSlots,echoStatContract:contract,
    activeForteStats:[{stat:'CRIT Rate',value:.08}],
    activeSequenceStats:[{stat:'CRIT Rate',value:.16}]
  });
  assert.ok(Math.abs(out.critRate-(.05+.08+.243+.0792+.16))<1e-12);
  assert.equal(out.sequenceStaticStatCount,1);
});

test('conditional/mechanic prose cannot enter Build Stats and unsupported Sequence stat rows fail closed',()=>{
  const base=projectStaticBuildStats({character,echoSlots:[],echoStatContract:contract,activeForteStats:[],activeSequenceStats:[]});
  const noisy=projectStaticBuildStats({
    character,echoSlots:[],echoStatContract:contract,activeForteStats:[],activeSequenceStats:[],
    sequenceDescription:'After casting Intro Skill, ATK is increased by 999% for 30s.',
    conditionalSequenceEffects:[{stat:'ATK%',value:9.99}]
  });
  assert.deepEqual(noisy,base);
  assert.throws(()=>projectStaticBuildStats({character,echoSlots:[],echoStatContract:contract,activeSequenceStats:[{stat:'Target DMG Taken',value:.4}]}),/Reviewed static Sequence/);
});

test('reviewed static Weapon effects add once with Weapon secondary, Sequence, Forte and Echo stats',()=>{
  const weapon={level90BaseAtk:587,secondary:{stat:'CRIT Rate',value:.243}};
  const echoSlots=[{echoId:'echo-a',cost:4,rank:5,level:5,mainStat:{name:'CRIT Rate',value:.0792},secondaryMainStat:{name:'Flat ATK',value:54},substats:[{name:'Energy Regen',value:.068}]}];
  const out=projectStaticBuildStats({character,weapon,echoSlots,echoStatContract:contract,activeForteStats:[{stat:'CRIT Rate',value:.08}],activeSequenceStats:[{stat:'CRIT Rate',value:.16}],activeWeaponStats:[{stat:'CRIT Rate',value:.08,sourceWeaponEffect:{weaponId:'unflickering-valor',effectId:'UV-CR',rank:1}}]});
  assert.ok(Math.abs(out.critRate-(.05+.08+.243+.0792+.16+.08))<1e-12);assert.equal(out.sequenceStaticStatCount,1);assert.equal(out.weaponStaticStatCount,1);
});
test('unconditional Weapon attribute/ATK effects project while arbitrary conditional fields remain ignored',()=>{
  const weapon={level90BaseAtk:587,secondary:{stat:'CRIT Rate',value:.243}};
  const staticOut=projectStaticBuildStats({character,weapon,echoSlots:[],echoStatContract:contract,activeForteStats:[],activeWeaponStats:[{stat:'ATK%',value:.12},{stat:'All Attribute DMG',value:.12}]});
  assert.ok(Math.abs(staticOut.atk-(463+587)*1.12)<1e-12);assert.ok(Math.abs(staticOut.elementDamageBonus-.12)<1e-12);assert.equal(staticOut.weaponStaticStatCount,2);
  const base=projectStaticBuildStats({character,weapon,echoSlots:[],echoStatContract:contract,activeForteStats:[]});
  const noisy=projectStaticBuildStats({character,weapon,echoSlots:[],echoStatContract:contract,activeForteStats:[],conditionalWeaponEffects:[{stat:'ATK%',value:9.99}],weaponEffectDescription:'After casting Resonance Skill, ATK increases by 999%.'});
  assert.deepEqual(noisy,base);
  assert.throws(()=>projectStaticBuildStats({character,weapon,echoSlots:[],echoStatContract:contract,activeForteStats:[],activeWeaponStats:[{stat:'Target DMG Taken',value:.4}]}),/Reviewed static Weapon/);
});
