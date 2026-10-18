import assert from 'node:assert/strict';
import test from 'node:test';
import { acceptedEchoDistribution, expectedFiveEchoSubstats } from '../src/expectedEchoStats.mjs';
import { SUBSTAT_TYPES, SUBSTAT_VALUE_TABLE, SUBSTAT_VALUE_PROBABILITIES } from '../src/echoCoreRules.ts';

const canonical=SUBSTAT_TYPES.map(id=>({id,tiers:SUBSTAT_VALUE_TABLE[id],weights:SUBSTAT_VALUE_PROBABILITIES[id]}));
const base={stats:canonical,hard:[{stat:'CRIT Rate',minimum:.063},{stat:'CRIT DMG',minimum:.126}],
  flex:[{stat:'ATK%',minimum:.064},{stat:'Heavy Attack DMG',minimum:.064}],flexCount:1};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);

test('exact 5-substat distribution matches independent exhaustive weighted roll enumeration',()=>{
  const tiny=[
    {id:'CRIT Rate',tiers:[1,2],weights:[1,2]},
    {id:'CRIT DMG',tiers:[1,2],weights:[1,2]},
    {id:'ATK%',tiers:[1,2],weights:[1,2]},
    {id:'Heavy Attack DMG',tiers:[1,2],weights:[1,2]},
    {id:'Energy Regen',tiers:[1,2],weights:[1,2]},
    {id:'Flat HP',tiers:[1,2],weights:[1,2]},
  ];
  const conditions={stats:tiny,hard:[{stat:'CRIT Rate',minimum:2},{stat:'CRIT DMG',minimum:2}],
    flex:[{stat:'ATK%',minimum:2},{stat:'Heavy Attack DMG',minimum:2}],flexCount:1};
  let pass=0;
  const moments=Object.fromEntries(tiny.map(s=>[s.id,0]));
  for(let omit=0;omit<6;omit++){
    const chosen=tiny.filter((_,i)=>i!==omit);
    for(let pattern=0;pattern<32;pattern++){
      const values=new Map(chosen.map((row,i)=>[row.id,(pattern&(1<<i))?2:1]));
      const probability=chosen.reduce((p,_,i)=>p*((pattern&(1<<i))?2/3:1/3),1)/6;
      if(values.get('CRIT Rate')!==2||values.get('CRIT DMG')!==2||
        !(values.get('ATK%')===2||values.get('Heavy Attack DMG')===2))continue;
      pass+=probability;
      for(const [id,v] of values)moments[id]+=v*probability;
    }
  }
  const exact=acceptedEchoDistribution(conditions);
  close(exact.acceptanceProbability,pass);
  const expected=expectedFiveEchoSubstats(exact);
  assert.equal(expected.status,'READY');
  for(const [id,moment] of Object.entries(moments))close(expected.totals[id],5*moment/pass);
});

test('Augusta Hard AND Flex acceptance includes weighted quality and remaining filler substats',()=>{
  const one=acceptedEchoDistribution(base),both=acceptedEchoDistribution({...base,flexCount:2});
  assert.equal(one.status,'READY');assert.equal(both.status,'READY');
  assert.ok(one.acceptanceProbability>both.acceptanceProbability&&both.acceptanceProbability>0);
  const e1=expectedFiveEchoSubstats(one),e2=expectedFiveEchoSubstats(both);
  assert.ok(e1.totals['CRIT Rate']>=5*.063);
  assert.ok(e1.totals['CRIT DMG']>=5*.126);
  assert.ok(e1.totals['Flat HP']>0,'Non-target HP rolls still have a conditional mean');
  assert.ok(e1.totals['Flat DEF']>0,'Non-target DEF rolls still have a conditional mean');
  assert.ok(e2.totals['ATK%']>e1.totals['ATK%'],'Requiring BOTH Flex stats changes accepted outcomes');
  assert.ok(e2.totals['Heavy Attack DMG']>e1.totals['Heavy Attack DMG']);
});

test('tightening an actual CRIT roll tier raises conditional CRIT mean, not a fabricated midpoint',()=>{
  const loose=expectedFiveEchoSubstats(acceptedEchoDistribution(base));
  const strict=expectedFiveEchoSubstats(acceptedEchoDistribution({...base,hard:[
    {stat:'CRIT Rate',minimum:.099},{stat:'CRIT DMG',minimum:.126}
  ]}));
  assert.ok(strict.totals['CRIT Rate']>loose.totals['CRIT Rate']);
  assert.ok(strict.totals['CRIT Rate']>=5*.099);
  assert.notEqual(loose.totals['CRIT Rate'],5*.063,'Minimum is not the expected rolled quality');
});

test('ER Target conditions five-echo joint distribution, not every Echo or each roll',()=>{
  const p=acceptedEchoDistribution(base);
  const unconditional=expectedFiveEchoSubstats(p);
  const disabled=expectedFiveEchoSubstats(p,{erEnabled:false,erTargetPercent:400,baseER:1});
  close(unconditional.totals['Energy Regen'],disabled.totals['Energy Regen']);
  const target=expectedFiveEchoSubstats(p,{erEnabled:true,erTargetPercent:120,baseER:1});
  assert.equal(target.status,'READY');
  assert.ok(target.erConditionProbability>0&&target.erConditionProbability<1);
  assert.ok(1+target.totals['Energy Regen']>=1.2-1e-10);
  assert.ok(target.totals['Energy Regen']>unconditional.totals['Energy Regen']);
  assert.equal(expectedFiveEchoSubstats(p,{erEnabled:true,erTargetPercent:null}).status,'PENDING');
  assert.equal(expectedFiveEchoSubstats(p,{erEnabled:true,erTargetPercent:900}).status,'IMPOSSIBLE_ER_TARGET');
});

test('joint ER conditioning conserves unrelated independent expected stat',()=>{
  const p={status:'READY',acceptanceProbability:.2,stats:['Energy Regen','ATK%'],bins:[
    {erUnits:0,p:.5,moments:{'Energy Regen':0,'ATK%':.5}},
    {erUnits:1000,p:.5,moments:{'Energy Regen':.05,'ATK%':.5}}
  ]};
  const result=expectedFiveEchoSubstats(p,{erEnabled:true,erTargetPercent:130,baseER:1});
  close(result.erConditionProbability,.5);close(result.totals['ATK%'],5);
  assert.ok(result.totals['Energy Regen']>=.3);
});

test('missing counts, duplicate stats and impossible requirements fail closed',()=>{
  assert.throws(()=>acceptedEchoDistribution({...base,flexCount:3}),/Invalid or infeasible/);
  assert.throws(()=>acceptedEchoDistribution({...base,hard:[...base.hard,base.hard[0]]}),/Invalid or infeasible/);
  assert.equal(acceptedEchoDistribution({...base,hard:[{stat:'CRIT Rate',minimum:99},base.hard[1]]}).status,'IMPOSSIBLE');
});
