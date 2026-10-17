// Observed receipt aggregation only. No rolling, pricing, Expected model or
// inventory writer. Canonical quantities/denominations stay in resourceInventory.
import {readResourceInventory,ECHO_TUBES} from './resourceInventory.ts';
const clone=v=>structuredClone(v),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const keys=(v,names)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).sort().join('|')!==[...names].sort().join('|'))throw Error('INVALID_RESOURCE_RECEIPT_SHAPE');};
const count=n=>{if(!Number.isSafeInteger(n)||n<0)throw Error('INVALID_RESOURCE_RECEIPT_COUNT');return n;};
const add=(a,b)=>count(a+b);
const tubeIds=ECHO_TUBES.map(t=>t.id);
const zero=()=>({echoes:0,tuners:0,tubes:Object.fromEntries(tubeIds.map(id=>[id,0]))});
const tubes=v=>{keys(v,tubeIds);return Object.fromEntries(tubeIds.map(id=>[id,count(v[id]) ]));};
const sameInventory=(a,b)=>same(readResourceInventory(a),readResourceInventory(b));
const identity=v=>{if(typeof v!=='string'||!v.length||v.length>256)throw Error('INVALID_RESOURCE_SESSION_ID');return v;};
function follows(before,after,spent,returned=0){
 if(before.kind!==after.kind)throw Error('RESOURCE_QUANTITY_KIND_CHANGED');
 if(before.kind==='FINITE'&&after.count!==before.count-spent+returned)throw Error('RESOURCE_RECEIPT_BALANCE_MISMATCH');
}
export function aggregateSimulatedResources({sessionId,initialInventory,events,status,selectedSlots}){
 identity(sessionId);if(!['RUNNING','GOAL_SUCCESS','ABORTED','CENSORED','RESOURCE_BLOCKED','PENDING_RESOURCE_SEARCH','PENDING'].includes(status))throw Error('INVALID_RUN_STATUS');
 if(!Array.isArray(selectedSlots)||!selectedSlots.length||selectedSlots.length>5||new Set(selectedSlots).size!==selectedSlots.length||!selectedSlots.every(s=>Number.isInteger(s)&&s>=1&&s<=5))throw Error('INVALID_COST_SLOT_SCOPE');
 if(!Array.isArray(events)||!events.length||events.length>100000)throw Error('COMPLETE_OBSERVED_RESOURCE_TRACE_REQUIRED');
 const initial=readResourceInventory(initialInventory),gross=zero(),returned=zero();let remaining=initial,sequence=0,receipts=0;
 for(const event of events){
  keys(event,['sequence','resources']);if(event.sequence!==sequence+1)throw Error('DUPLICATE_OR_GAPPED_RESOURCE_EVENT');sequence=event.sequence;
  const r=event.resources;keys(r,['before','after','ledger']);const before=readResourceInventory(r.before),after=readResourceInventory(r.after);
  if(!sameInventory(remaining,before))throw Error('RESOURCE_EVENT_CHAIN_MISMATCH');
  if(r.ledger===null){if(!sameInventory(before,after))throw Error('RESOURCE_CHANGE_WITHOUT_RECEIPT');}
  else{
   const l=r.ledger;keys(l,['echoes','tuners','tubes','recovery']);if(l.recovery!=='NONE')throw Error('UNSUPPORTED_RECOVERY_RECEIPT');
   const echoes=count(l.echoes),tuners=count(l.tuners);follows(before.echoes,after.echoes,echoes);follows(before.tuners,after.tuners,tuners);
   gross.echoes=add(gross.echoes,echoes);gross.tuners=add(gross.tuners,tuners);
   let spent=Object.fromEntries(tubeIds.map(id=>[id,0])),refund={...spent};
   if(l.tubes!==null){
    const t=l.tubes;keys(t,['before','after','spent','returned','expBefore','suppliedEXP','expAfter','overflowEXP','unrepresentableEXP','crossed','eligibleThrough']);
    const tb=readResourceInventory(t.before),ta=readResourceInventory(t.after);spent=tubes(t.spent);refund=tubes(t.returned);
    for(const key of ['expBefore','suppliedEXP','expAfter','overflowEXP','unrepresentableEXP','eligibleThrough'])count(t[key]);
    if(!Array.isArray(t.crossed)||!t.crossed.every(n=>[5,10,15,20,25].includes(n)))throw Error('INVALID_TUBE_RECEIPT_CHECKPOINTS');
    for(const id of tubeIds){if(!same(tb.tubes[id],before.tubes[id])||!same(ta.tubes[id],after.tubes[id]))throw Error('TUBE_LEDGER_INVENTORY_MISMATCH');follows(tb.tubes[id],ta.tubes[id],spent[id],refund[id]);}
   }
   for(const id of tubeIds){follows(before.tubes[id],after.tubes[id],spent[id],refund[id]);gross.tubes[id]=add(gross.tubes[id],spent[id]);returned.tubes[id]=add(returned.tubes[id],refund[id]);}
   if(echoes||tuners||tubeIds.some(id=>spent[id]||refund[id]))receipts++;
  }
  remaining=after;
 }
 const net={echoes:gross.echoes,tuners:gross.tuners,tubes:Object.fromEntries(tubeIds.map(id=>[id,gross.tubes[id]-returned.tubes[id]]))};
 const gold=t=>ECHO_TUBES.reduce((n,row)=>n+t[row.id]*row.echoExp,0)/ECHO_TUBES.find(t=>t.id==='premium').echoExp;
 return {schemaVersion:1,kind:'BELLIBING_SIMULATED_RESOURCE_COST_V1',sessionId,status,scope:selectedSlots.length===1?'SINGLE_SLOT':'ACTIVE_SET',selectedSlots:clone(selectedSlots),
  basis:'OBSERVED_GROSS_RECEIPTS_NOT_EXPECTED',eventCount:sequence,paidReceiptCount:receipts,gross,returned,net,remaining:clone(remaining),
  goldEquivalent:{gross:gold(gross.tubes),returned:gold(returned.tubes),net:gold(net.tubes)},recovery:'NONE',expected:null};
}
export function simulatedCostPresentation(cost){
 if(cost?.kind!=='BELLIBING_SIMULATED_RESOURCE_COST_V1')throw Error('OBSERVED_COST_REQUIRED');
 return {status:'VERIFIED',echoes:count(cost.gross.echoes),tuners:count(cost.gross.tuners),tubes:tubes(cost.gross.tubes)};
}
