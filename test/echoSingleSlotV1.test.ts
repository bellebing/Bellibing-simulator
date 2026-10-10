import assert from 'node:assert/strict';
import test from 'node:test';
import { createRank5EchoAtLevel0, withRank5MainStatsAtLevel } from '../src/echoMainStats.ts';
import { CHECKPOINT_CUMULATIVE_COST, assertExactRank5SubstatRoll, rollNewSubstat } from '../src/echoCoreRules.ts';
import { createSeededRng } from '../src/seededRng.ts';
import { emptyResourceInventory, readResourceInventory, updateResourceInventory } from '../src/resourceInventory.ts';
import { spendExactTubes as canonicalSpend, tuneEligibleCheckpoint as canonicalTune } from '../src/echoExactTubeSpending.ts';
import { spendExactTubes as browserSpend, tuneEligibleCheckpoint as browserTune } from '../docs/assets/echoExactTubeSpending.js';
import { generateSingleEchoCandidate, selectExactOneCheckpointTubes } from '../docs/ui-prototypes/assets/echo-single-attempt.mjs';

const zero=()=>emptyResourceInventory();
const put=(id: 'echoes' | 'tuners' | 'premium' | 'advanced' | 'medium' | 'basic',
  count: number, inventory = zero())=>updateResourceInventory(inventory,id,{kind:'FINITE',count});
const unlimited=(id: 'echoes'|'tuners'|'premium'|'advanced'|'medium'|'basic',inventory=zero())=>
  updateResourceInventory(inventory,id,{kind:'UNLIMITED'});
const template=()=>createRank5EchoAtLevel0({id:'source-backed-cost-4-identity',cost:4,primaryMainStat:'CRIT Rate'});
const grown=()=>withRank5MainStatsAtLevel(template(),5);
const attempt=(budget: ReturnType<typeof zero>, seed='source-v1')=>
  generateSingleEchoCandidate(budget,template(),grown(),createSeededRng(seed));

test('zero resources mean no attempt, no implicit infinity and no RNG',()=>{
  const inventory=zero(),saved=structuredClone(inventory);
  let calls=0;
  assert.throws(()=>generateSingleEchoCandidate(inventory,template(),grown(),
    {next(){calls++;return 0.1}}),/No Echoes available/);
  assert.equal(calls,0);
  assert.deepEqual(inventory,saved);
  assert.equal(selectExactOneCheckpointTubes(inventory),null);
});

test('exact boundary checks reject unfunded Echo, Tuner and all Tube cases',()=>{
  const noTuners=put('echoes',1);
  assert.throws(()=>attempt(noTuners),/Need 10 Tuners/);
  const noTubes=put('tuners',10,noTuners);
  assert.throws(()=>attempt(noTubes),/Not enough whole Tubes/);
  const shortTubes=put('basic',8,noTubes);
  assert.throws(()=>attempt(shortTubes),/Not enough whole Tubes/);
  const enoughTubes=put('basic',9,noTubes);
  assert.deepEqual(selectExactOneCheckpointTubes(enoughTubes),{premium:0,advanced:0,medium:0,basic:9});
});

test('one +5 candidate has exactly one canonical seeded tier and source main stat',()=>{
  const stock=put('premium',1,put('tuners',10,put('echoes',1)));
  const original=structuredClone(stock);
  const result=attempt(stock,'same-stat-seed');
  const expected=rollNewSubstat([],createSeededRng('same-stat-seed'));
  assert.equal(result.initial.level,0);
  assert.equal(result.initial.substats.length,0);
  assert.equal(result.candidate.level,5);
  assert.equal(result.candidate.substats.length,1);
  assert.deepEqual(result.candidate.substats[0],expected);
  assertExactRank5SubstatRoll(result.candidate.substats[0]!);
  assert.deepEqual(result.candidate.mainStat,grown().mainStat);
  assert.deepEqual(result.candidate.secondaryMainStat,grown().secondaryMainStat);
  assert.deepEqual(result.spent,{echoes:1,tuners:10,tubes:{premium:1,advanced:0,medium:0,basic:0}});
  assert.equal(result.ledger.expAfter,5000);
  assert.equal(result.ledger.eligibleThrough,5);
  assert.equal(result.after.echoes.kind,'FINITE');
  if(result.after.echoes.kind==='FINITE')assert.equal(result.after.echoes.count,0);
  assert.equal(result.after.tuners.kind,'FINITE');
  if(result.after.tuners.kind==='FINITE')assert.equal(result.after.tuners.count,0);
  assert.equal(result.after.tubes.premium.kind,'FINITE');
  if(result.after.tubes.premium.kind==='FINITE')assert.equal(result.after.tubes.premium.count,0);
  assert.deepEqual(stock,original);
});

test('unlimited is explicit and still produces a nonzero verified resource ledger',()=>{
  let budget=zero();
  for(const id of ['echoes','tuners','premium','advanced','medium','basic'] as const)
    budget=unlimited(id,budget);
  const result=attempt(budget);
  assert.equal(result.after.echoes.kind,'UNLIMITED');
  assert.equal(result.after.tuners.kind,'UNLIMITED');
  assert.ok(result.spent.echoes>0);
  assert.equal(result.spent.tuners,CHECKPOINT_CUMULATIVE_COST[5].tuners);
  assert.ok(Object.values(result.spent.tubes).reduce((a,b)=>a+b,0)>0);
  assert.deepEqual(result.candidate.substats.length,1);
});

test('browser subset exact +5 transaction matches pure canonical TS ledger/revision',()=>{
  const stocks=[
    put('premium',1,put('tuners',10,put('echoes',1))),
    put('basic',9,put('tuners',10,put('echoes',1))),
    put('advanced',3,put('basic',1,put('tuners',10,put('echoes',1)))),
    unlimited('premium',put('tuners',10,put('echoes',1)))
  ];
  for(const inventory of stocks){
    const selected=selectExactOneCheckpointTubes(inventory);
    assert.ok(selected);
    const state={revision:12,progress:{cumulativeEchoEXP:0,tunedThrough:0 as const},inventory:readResourceInventory(inventory)};
    const ts=canonicalSpend(state,selected,12),js=browserSpend(state,selected,12);
    assert.deepEqual(js,ts);
    assert.deepEqual(browserTune(js.state,13),canonicalTune(ts.state,13));
    assert.throws(()=>browserSpend(state,selected,11),/Stale resource revision/);
  }
});

test('wrong main template or incomplete checkpoint never creates a funded result',()=>{
  const budget=put('premium',1,put('tuners',10,put('echoes',1)));
  assert.throws(()=>generateSingleEchoCandidate(budget,{...template(),rank:4},grown(),createSeededRng(0)),/Rank-5/);
  assert.throws(()=>generateSingleEchoCandidate(budget,template(),{...grown(),mainStat:{name:'HP%',value:0.1}},createSeededRng(0)),/progression/);
  assert.equal(selectExactOneCheckpointTubes(budget)?.premium,1);
});
