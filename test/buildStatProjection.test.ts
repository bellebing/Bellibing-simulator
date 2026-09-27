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

test('static Build projection combines Character, committed Weapon and exact partial Echo cards only',()=>{
  const weapon={level90BaseAtk:587,secondary:{stat:'CRIT Rate',value:.243},effectIds:['MUST_NOT_APPLY']};
  const echoSlots=[{
    echoId:'echo-a',cost:4,rank:5,level:5,
    mainStat:{name:'CRIT Rate',value:.0792},
    secondaryMainStat:{name:'Flat ATK',value:54},
    substats:[{name:'Energy Regen',value:.068}],
    selectedSonataSetId:'ignored'
  },null,null,null,null];
  const out=projectStaticBuildStats({character,weapon,echoSlots,echoStatContract:contract});
  assert.ok(Math.abs(out.atk-1230)<1e-12);
  assert.ok(Math.abs(out.critRate-.4522)<1e-12);
  assert.ok(Math.abs(out.energyRegen-1.068)<1e-12);
  assert.equal(out.hp,10300);
  assert.equal(out.def,1112);
  assert.equal(out.elementDamageLabel,'Electro DMG Bonus');
  assert.equal(out.echoCardCount,1);
  assert.equal(out.includesWeaponEffects,false);
  assert.equal(out.includesSonataEffects,false);
  assert.equal(out.includesEchoSkillEffects,false);
  assert.equal(out.includesSequenceEffects,false);
  assert.equal(out.includesTeamBuffs,false);
  assert.equal(out.includesCombatUptime,false);
});

test('projection supports unequipped and partially equipped builds with HP/DEF/element/healing rows',()=>{
  const richer={...character,intrinsicStats:[{stat:'HP%',value:.12},{stat:'Healing Bonus',value:.12},{stat:'Electro DMG',value:.12}]};
  const weapon={level90BaseAtk:0,secondary:{stat:'HP%',value:.228}};
  const echoSlots=[
    {echoId:'e1',cost:3,rank:5,level:0,mainStat:{name:'Electro DMG',value:.06},secondaryMainStat:{name:'Flat ATK',value:20},substats:[]},
    {echoId:'e2',cost:1,rank:5,level:0,mainStat:{name:'HP%',value:.0456},secondaryMainStat:{name:'Flat HP',value:456},substats:[]}
  ];
  const out=projectStaticBuildStats({character:richer,weapon,echoSlots,echoStatContract:contract});
  assert.ok(Math.abs(out.hp-(10300*(1+.12+.228+.0456)+456))<1e-9);
  assert.ok(Math.abs(out.elementDamageBonus-.18)<1e-12);
  assert.ok(Math.abs(out.healingBonus-.12)<1e-12);
  assert.equal(out.atk,463+20);
});

test('projection fails closed on corrupted committed Echo values and unsupported Weapon secondary stats',()=>{
  const badEcho={echoId:'bad',cost:4,rank:5,level:5,mainStat:{name:'CRIT Rate',value:.08},secondaryMainStat:{name:'Flat ATK',value:54},substats:[{name:'Energy Regen',value:.068}]};
  assert.throws(()=>projectStaticBuildStats({character,echoSlots:[badEcho],echoStatContract:contract}),/primary Main Stat/);
  assert.throws(()=>projectStaticBuildStats({character,weapon:{level90BaseAtk:500,secondary:{stat:'Mystery',value:.1}},echoSlots:[],echoStatContract:contract}),/Unsupported equipped Weapon secondary stat/);
});

test('preview-only/effect/sequence fields are outside the static projection contract',()=>{
  const base=projectStaticBuildStats({character,echoSlots:[],echoStatContract:contract});
  const noisy=projectStaticBuildStats({
    character:{...character,sequenceLevel:6,teamBuffs:[999]},
    weapon:{level90BaseAtk:0,secondary:null,effectIds:['fake'],previewId:'preview-only'},
    echoSlots:[],
    echoStatContract:contract,
    sequenceLevel:6,
    previewWeapon:{level90BaseAtk:9999},
    previewEcho:{mainStat:{name:'ATK%',value:99}}
  });
  assert.equal(noisy.atk,base.atk);
  assert.equal(noisy.critRate,base.critRate);
});
