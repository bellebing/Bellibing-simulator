// Presentation of private whole-build estimates. No browser ranking or damage model.
import {escapeHtml} from './util.js';
export function improveSlotRanking(search){
 const empty=()=>Array.from({length:5},(_,slot)=>({slot,cost:null,bounds:null,rank:null,start:false,precision:'UNAVAILABLE',samples:null}));
 if(search?.status!=='ESTIMATED'||search.scope?.goal!=='INCREASE_TEAM_DPS'||!Number.isFinite(search.targetDps)||!Array.isArray(search.slots)||search.slots.length!==5)return empty();
 const rows=empty();if(new Set(search.slots.map(r=>r?.slot)).size!==5)return rows;
 for(const row of search.slots){
  if(!Number.isInteger(row?.slot)||row.slot<0||row.slot>4)return empty();
  const cost=row.expectedCost?.tuners,p=row.probability,result=rows[row.slot];
  result.precision=row.estimation?.status??'UNAVAILABLE';result.samples=row.estimation?.samples??null;
  result.goalDps=search.targetDps;
  result.conditionalSamples=row.estimation?.method==='EXACT_POLICY_ECONOMICS_CONDITIONAL_CANONICAL_KL_FIXED_LOOKS';
  const b=row.costBounds?.tuners;
  if(Number.isFinite(b?.lower)&&b.lower>=0&&(b.upper===null||Number.isFinite(b.upper)&&b.upper>=b.lower))result.bounds=b;
  if(row.status==='ESTIMATED'&&Number.isFinite(cost)&&cost>0&&p?.successes>0&&p.samples>=p.successes&&p.estimate>0&&p.estimate<=1)result.cost=cost;
  const rank=search.ranking?.slots?.find(r=>r.slot===row.slot)?.rank;
  if(['RESOLVED','UNCERTAIN'].includes(result.precision)&&result.cost!==null&&Number.isInteger(rank)&&rank>=1&&rank<=5)result.rank=rank;
 }
 const first=rows.find(r=>r.rank===1);
 if(first&&search.ranking?.status==='START_RESOLVED'&&search.recommendedSlot===first.slot)first.start=true;
 return rows;
}
export function improveRankMarkup(row){
 const explanation='Estimated upgrade rank: 1 best place to start, 5 least cost-effective. Same next team DPS step; four other Echoes unchanged. Overlapping or unresolved estimates remain unranked.';
 return `<div class="improve-slot-heading${row.start?' is-upgrade-start':''}" title="${escapeHtml(explanation)}">${row.rank===null?'':`<span class="improve-rank-number" aria-label="Upgrade rank ${row.rank}">${row.rank}</span>`}${row.start?'<span class="improve-start-flag">Start</span>':''}</div>`;
}
export function improveUpgradeMarkup(row){
 const format=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(n);
 const amount=row.cost!==null?'≈ '+format(row.cost):row.bounds?'≥ '+format(row.bounds.lower):'Unavailable';
 const uncertain=row.precision!=='RESOLVED'||row.rank===null;
 const detail=row.bounds?` Cost bounds ${format(row.bounds.lower)}–${row.bounds.upper===null?'unresolved':format(row.bounds.upper)} Tuners.`:'';
 const target=Number.isFinite(row.goalDps)?` Team DPS target: above Current, at least ${new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(row.goalDps)}.`:'';
 const title=`Estimated average gross Tuners; includes restarts.${target} ${row.samples??0} ${row.conditionalSamples?'evaluated surviving completions; exact checkpoint economics':'attempts'}.${detail} ${uncertain?'Ordering or cost remains uncertain.':''}`;
 return `<div class="improve-slot-upgrade" title="${escapeHtml(title)}"><span>Upgrade${uncertain?' · Uncertain':''}</span><span class="improve-upgrade-cost">Tuners <strong>${amount}</strong></span></div>`;
}
