// Presentation of comparable, whole-build replacement estimates. No stat scorer.
import {escapeHtml} from './util.js';

export function improveSlotRanking(search){
 const empty=()=>Array.from({length:5},(_,slot)=>({slot,cost:null,rank:null,start:false}));
 if(search?.status!=='ESTIMATED'||search.scope?.goal!=='INCREASE_TEAM_DPS'||!Number.isFinite(search.targetDps)||!Array.isArray(search.slots)||search.slots.length!==5)return empty();
 const rows=empty();
 if(new Set(search.slots.map(r=>r?.slot)).size!==5)return rows;
 for(const row of search.slots){
  if(!Number.isInteger(row?.slot)||row.slot<0||row.slot>4)return empty();
  const cost=row.expectedCost?.tuners,p=row.probability;
  if(row.status==='ESTIMATED'&&Number.isFinite(cost)&&cost>0&&p?.successes>0&&p.samples>=p.successes&&p.estimate>0&&p.estimate<=1)rows[row.slot].cost=cost;
 }
 const known=rows.filter(r=>r.cost!==null);
 if(known.length===5)for(const row of known){
  // A five-slot rank needs five comparable costs. Equal costs share a rank.
  row.rank=5-known.filter(other=>other.cost<row.cost).length;
 }
 if(known.length){
  const cheapest=Math.min(...known.map(r=>r.cost)),tied=known.filter(row=>row.cost===cheapest);
  const first=tied.find(row=>row.slot===search.recommendedSlot)??tied[0];
  first.start=true;
 }
 return rows;
}

export function improveRankMarkup(row){
 const explanation='Estimated upgrade rank: 1 hardest, 5 easiest. Same next team DPS step; four other Echoes unchanged. Equal costs share a rank. Numeric ranks require five resolved costs. Start is one suggested choice among the resolved estimates.';
 return `<div class="improve-slot-heading${row.start?' is-upgrade-start':''}" title="${escapeHtml(explanation)}">${row.rank===null?'':`<span class="improve-rank-number" aria-label="Upgrade rank ${row.rank}">${row.rank}</span>`}${row.start?'<span class="improve-start-flag">Start</span>':''}</div>`;
}

export function improveUpgradeMarkup(row){
 const amount=row.cost===null?'Not estimated':'≈ '+new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(row.cost);
 return `<div class="improve-slot-upgrade" title="Estimated average gross Tuners for the same next team DPS improvement; includes restarts. An unresolved estimate is not zero."><span>Upgrade</span><span class="improve-upgrade-cost">Tuners <strong>${amount}</strong></span></div>`;
}
