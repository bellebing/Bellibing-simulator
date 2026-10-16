import test from 'node:test';
import assert from 'node:assert/strict';
import { startManualWorkshop, createWorkshopCandidate, rollWorkshopCheckpoint, workshopToken } from '../src/echoManualWorkshop.ts';
import { selectSimulatorSlot } from '../src/echoSimulatorSession.ts';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { emptyResourceInventory, updateResourceInventory, ECHO_TUBES } from '../src/resourceInventory.ts';
import { VerifiedWuwaEchoRuntime } from '../src/echoCoreRuntime.ts';
import { SeededRng } from '../src/seededRng.ts';
import type { ManualWorkshopSession } from '../src/echoManualWorkshop.ts';
import type { Echo } from '../src/echoCoreDomain.ts';
const real = { weaponId: 'thunderflare-dominion', echoSets: { activeSetId: 'owned', sets: { owned: { slots: Array(5).fill({ echoId: 'real' }) }, alternate: { slots: ['real'] } } } };
const species = ECHO_CATALOG.find(row => row.releaseStatus === 'RELEASED' && row.cost === 4)!;
const template = { echoId: species.id, selectedSonataSetId: species.sonataSetIds[0], primaryMainStat: 'CRIT Rate' as const };
function budget() { let b = emptyResourceInventory(); for (const [id,count] of [['echoes',5],['tuners',250],['premium',150]] as const) b = updateResourceInventory(b,id,{kind:'FINITE',count}); return b; }
const start = (b = budget()) => startManualWorkshop('augusta',real,'test',b);
const create = (s: ManualWorkshopSession) => createWorkshopCandidate(s,template,ECHO_CATALOG,workshopToken(s));
const roll = (s: ManualWorkshopSession, rng = new SeededRng(1)) => rollWorkshopCheckpoint(s,rng,workshopToken(s));

test('fresh session has five empty slots, isolated source and detached shared budget',()=>{
 const b=budget(),s=start(b);
 assert.ok(s.simulatedBuild.echoSets!.sets.owned.slots.every(row=>row===null));
 assert.deepEqual(Object.keys(s.simulatedBuild.echoSets!.sets),['owned']);
 assert.ok(s.slots.every(row=>row.candidate===null&&row.accepted.length===0&&row.trash.length===0));
 s.manual.inventory.tubes.premium={kind:'FINITE',count:0};
 assert.deepEqual(b,budget());assert.deepEqual(s.manual.basis,b);
 assert.notEqual(s.source.build,real);
});
test('actual runtime parity at every checkpoint, exact receipt conservation, no decisions or equipment writes',()=>{
 for(let seed=0;seed<20;seed++){
  const b=budget(),original=JSON.stringify(real),s0=start(b);let s=create(s0);
  const rng=new SeededRng(seed),oracleRng=new SeededRng(seed),runtime=new VerifiedWuwaEchoRuntime();
  let oracle=structuredClone(s.slots[0].candidate!.card) as unknown as Echo;
  assert.equal(s.manual.receipts[0].echoes,1);assert.equal(s.manual.inventory.echoes.kind==='FINITE'&&s.manual.inventory.echoes.count,4);
  for(const level of [5,10,15,20,25]){
   const before=JSON.stringify(s);const next=roll(s,rng);assert.equal(JSON.stringify(s),before);s=next;
   oracle=runtime.rollNext(oracle,oracleRng)!.echo;
   const candidate=s.slots[0].candidate!;
   assert.equal(candidate.card.level,level);assert.deepEqual(candidate.card.substats,oracle.substats);
   assert.deepEqual(candidate.card.mainStat,oracle.mainStat);assert.deepEqual(candidate.card.secondaryMainStat,oracle.secondaryMainStat);
   assert.equal(new Set(candidate.card.substats!.map(stat=>stat.name)).size,level/5);
   const receipt=s.manual.receipts.at(-1)!;assert.equal(receipt.tuners,10);
   if(receipt.tubes){const l=receipt.tubes;assert.equal(l.expBefore+l.suppliedEXP,l.expAfter+ECHO_TUBES.reduce((n,t)=>n+l.returned[t.id]*t.echoExp,0)+l.unrepresentableEXP);}
  }
  assert.deepEqual(s.slots[0].candidate!.history.map(card=>card.level),[0,5,10,15,20,25]);
  assert.equal(s.manual.progress[s.slots[0].candidate!.id].cumulativeEchoEXP,142600);
  assert.equal(s.manual.inventory.tuners.kind==='FINITE'&&s.manual.inventory.tuners.count,200);
  for(const tube of ECHO_TUBES){
   const quantity=s.manual.inventory.tubes[tube.id];const initial=b.tubes[tube.id];
   assert.equal(quantity.kind==='FINITE'&&quantity.count,(initial.kind==='FINITE'?initial.count:0)-s.manual.receipts.reduce((n,r)=>n+(r.tubes?.spent[tube.id]??0)-(r.tubes?.returned[tube.id]??0),0));
  }
  assert.equal(s.evaluator.status,'PENDING');assert.ok(s.slots.every(row=>!row.accepted.length&&!row.trash.length));
  assert.deepEqual(s.simulatedBuild,s0.simulatedBuild);assert.equal(JSON.stringify(real),original);assert.deepEqual(b,budget());
  assert.throws(()=>roll(s),/already/);
 }
});
test('creation and insufficient/invalid checkpoint transactions are atomic',()=>{
 const s=start(),bytes=JSON.stringify(s);
 for(const t of [{...template,echoId:'absent'},{...template,selectedSonataSetId:'absent'},{...template,primaryMainStat:'Electro DMG' as any}])assert.throws(()=>createWorkshopCandidate(s,t,ECHO_CATALOG,workshopToken(s)));
 assert.equal(JSON.stringify(s),bytes);
 assert.throws(()=>create(start(emptyResourceInventory())),/No Echoes/);
 for(const b of [updateResourceInventory(budget(),'tuners',{kind:'FINITE',count:9}),updateResourceInventory(budget(),'premium',{kind:'FINITE',count:0})]){
  const candidate=create(start(b)),before=JSON.stringify(candidate);assert.throws(()=>roll(candidate),/Not enough/);assert.equal(JSON.stringify(candidate),before);
 }
 const candidate=create(start()),before=JSON.stringify(candidate);
 assert.throws(()=>roll(candidate,{next:()=>NaN}),/RNG|random|finite|range/i);assert.equal(JSON.stringify(candidate),before);
 assert.throws(()=>create(candidate),/already/);
});
test('slot and candidate revisions prevent replay; interleaved slots retain their own EXP carry',()=>{
 let s=create(start());const token=workshopToken(s);s=rollWorkshopCheckpoint(s,new SeededRng(1),token);
 assert.throws(()=>rollWorkshopCheckpoint(s,new SeededRng(1),token),/stale/);
 const first=structuredClone(s.slots[0].candidate),progress=structuredClone(s.manual.progress);
 s=selectSimulatorSlot(s,5) as ManualWorkshopSession;
 assert.throws(()=>rollWorkshopCheckpoint(s,new SeededRng(1),workshopToken({...s,selectedSlot:1})),/stale/);
 s=roll(create(s));assert.deepEqual(s.slots[0].candidate,first);assert.deepEqual(s.manual.progress[first!.id],progress[first!.id]);
 s=selectSimulatorSlot(s,1) as ManualWorkshopSession;s=roll(s);
 assert.equal(s.slots[0].candidate!.card.level,10);assert.equal(s.slots[4].candidate!.card.level,5);
 assert.throws(()=>rollWorkshopCheckpoint({...s,id:'other'},new SeededRng(1),workshopToken(s)),/stale/);
 assert.deepEqual(start().slots,startManualWorkshop('cartethyia',real,'other',budget()).slots);
});
test('finite partial budget preserves actual checkpoint; unlimited retains nonzero costs',()=>{
 let s=create(start(updateResourceInventory(budget(),'tuners',{kind:'FINITE',count:10})));
 s=roll(s);const bytes=JSON.stringify(s);assert.throws(()=>roll(s),/Tuners/);assert.equal(JSON.stringify(s),bytes);assert.equal(s.slots[0].candidate!.card.level,5);
 let b=emptyResourceInventory();for(const id of ['echoes','tuners','premium','advanced','medium','basic'] as const)b=updateResourceInventory(b,id,{kind:'UNLIMITED'});
 let u=create(start(b));for(let i=0;i<5;i++)u=roll(u);
 assert.deepEqual(u.manual.inventory,b);assert.equal(u.manual.receipts.reduce((n,r)=>n+r.tuners,0),50);
 assert.ok(u.manual.receipts.some(r=>r.tubes&&r.tubes.suppliedEXP>0));
});
