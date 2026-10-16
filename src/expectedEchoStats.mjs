// Exact, character-free mean substats of a qualifying five-roll Rank-5 Echo.
// The caller supplies canonical type/roll tables and explicit Hard/Flex rules.
// All 5-substat type combinations have equal probability under rollNewSubstat;
// discrete values retain their source-owned non-uniform conditional weights.
// No RNG, farming, budget, private evaluator or gameplay decisions live here.
export function acceptedEchoDistribution({stats,hard,flex,flexCount}) {
  if (!Array.isArray(stats)||stats.length<5||stats.length>25) throw Error('Invalid canonical Echo stat pool');
  const catalog=new Map(stats.map(row=>[row.id,row]));
  if(catalog.size!==stats.length)throw Error('Duplicate Echo stat identity');
  for(const row of stats)if(!Array.isArray(row.tiers)||!Array.isArray(row.weights)||row.tiers.length!==row.weights.length||!row.tiers.length||row.weights.some(v=>!Number.isFinite(v)||v<0)||row.tiers.some(v=>!Number.isFinite(v)||v<0)||row.weights.reduce((a,b)=>a+b,0)<=0)throw Error('Invalid canonical Echo roll probabilities');
  if(!Array.isArray(hard)||!Array.isArray(flex)||!Number.isInteger(flexCount)||flexCount<0)throw Error('Invalid Echo requirements');
  const rules=[...hard,...flex], ruleIds=new Set(rules.map(row=>row.stat));
  if(ruleIds.size!==rules.length||rules.some(row=>!catalog.has(row.stat)||!Number.isFinite(row.minimum)||row.minimum<0)||hard.length+flexCount>5||flexCount>flex.length)throw Error('Invalid or infeasible Echo requirement configuration');
  const prepared=new Map(stats.map(row=>{
    const total=row.weights.reduce((a,b)=>a+b,0);
    const draws=row.tiers.map((value,i)=>({value,p:row.weights[i]/total}));
    return [row.id,{draws,mean:draws.reduce((s,d)=>s+d.value*d.p,0)}];
  }));
  const hardById=new Map(hard.map(r=>[r.stat,r.minimum]));
  const flexById=new Map(flex.map(r=>[r.stat,r.minimum]));
  const quality=new Map(rules.map(({stat,minimum})=>{
    const draws=prepared.get(stat).draws;
    const success=draws.filter(d=>d.value+1e-12>=minimum);
    const failure=draws.filter(d=>d.value+1e-12<minimum);
    return [stat,{p:success.reduce((s,d)=>s+d.p,0),
      yes:success.reduce((s,d)=>s+d.p*d.value,0),
      no:failure.reduce((s,d)=>s+d.p*d.value,0)}];
  }));
  const bins=new Map();
  const add=(er,p,moments)=>{
    const key=Math.round(er*10000);
    let bin=bins.get(key);
    if(!bin){bin={erUnits:key,p:0,moments:Object.fromEntries(catalog.keys().map(id=>[id,0]))};bins.set(key,bin);}
    bin.p+=p;for(const [stat,value] of Object.entries(moments))bin.moments[stat]+=value;
  };
  const probAtLeast=(flexIds,required)=>{
    if(required<=0)return 1;
    if(required>flexIds.length)return 0;
    let dp=[1];
    for(const id of flexIds){
      const chance=quality.get(id).p,next=Array(dp.length+1).fill(0);
      dp.forEach((v,i)=>{next[i]+=v*(1-chance);next[i+1]+=v*chance;});
      dp=next;
    }
    return dp.slice(required).reduce((s,v)=>s+v,0);
  };
  const ids=stats.map(row=>row.id);let combinations=0;
  const visit=(subset)=>{
    combinations++;
    if(hard.some(row=>!subset.includes(row.stat)))return;
    const subsetFlex=flex.filter(row=>subset.includes(row.stat)).map(row=>row.stat);
    const hasER=subset.includes('Energy Regen');
    const cases=hasER?prepared.get('Energy Regen').draws:[{value:0,p:1}];
    for(const er of cases){
      const fixedER=hasER&&ruleIds.has('Energy Regen');
      const erQualifies=fixedER&&er.value+1e-12>=qualityRequirement('Energy Regen');
      if(fixedER&&hardById.has('Energy Regen')&&!erQualifies)continue;
      const required=flexCount-(flexById.has('Energy Regen')&&erQualifies?1:0);
      const otherFlex=subsetFlex.filter(id=>id!=='Energy Regen');
      const otherHard=hard.filter(row=>row.stat!=='Energy Regen').map(row=>row.stat);
      const hardChance=otherHard.reduce((p,id)=>p*quality.get(id).p,1);
      const flexChance=probAtLeast(otherFlex,required);
      const mass=hardChance*flexChance*er.p;
      if(!(mass>0))continue;
      const moments={};
      for(const id of subset){
        if(id==='Energy Regen'){moments[id]=mass*er.value;continue;}
        if(hardById.has(id)){
          const q=quality.get(id);
          const otherChance=otherHard.filter(h=>h!==id).reduce((p,h)=>p*quality.get(h).p,1);
          moments[id]=er.p*otherChance*q.yes*flexChance;
        }else if(flexById.has(id)){
          const q=quality.get(id),remaining=otherFlex.filter(f=>f!==id);
          moments[id]=er.p*hardChance*(q.yes*probAtLeast(remaining,required-1)+q.no*probAtLeast(remaining,required));
        }else moments[id]=mass*prepared.get(id).mean;
      }
      add(er.value,mass,moments);
    }
    function qualityRequirement(id){return hardById.get(id)??flexById.get(id);}
  };
  const choose=(start,picked)=>{
    if(picked.length===5){visit(picked);return;}
    for(let i=start;i<=ids.length-(5-picked.length);i++)choose(i+1,[...picked,ids[i]]);
  };
  choose(0,[]);
  const total=[...bins.values()].reduce((s,bin)=>s+bin.p,0);
  if(total<=0)return {status:'IMPOSSIBLE',acceptanceProbability:0,bins:[],stats:ids};
  const ordered=[...bins.values()].sort((a,b)=>a.erUnits-b.erUnits).map(bin=>({
    erUnits:bin.erUnits,p:bin.p/total,
    moments:Object.fromEntries(ids.map(id=>[id,bin.moments[id]/total]))
  }));
  return {status:'READY',acceptanceProbability:total/combinations,bins:ordered,stats:ids};
}

// Condition the sum of five independent *accepted* Echoes on a total Character
// ER target. This is a joint conditional expectation, not a clamp or forced ER roll.
export function expectedFiveEchoSubstats(distribution,{erEnabled=false,erTargetPercent=null,baseER=1}={}) {
  if(distribution.status!=='READY')return {status:distribution.status,totals:null};
  const bins=distribution.bins;
  let dp=new Map([[0,1]]),four=null;
  for(let count=1;count<=5;count++){
    const next=new Map();
    for(const [sum,p] of dp)for(const b of bins)next.set(sum+b.erUnits,(next.get(sum+b.erUnits)??0)+p*b.p);
    dp=next;if(count===4)four=dp;
  }
  const minimum=erEnabled?Math.ceil((erTargetPercent/100-baseER)*10000-1e-9):Number.NEGATIVE_INFINITY;
  if(erEnabled&&(!Number.isFinite(erTargetPercent)||erTargetPercent<0||!Number.isFinite(baseER)))return {status:'PENDING',totals:null};
  const chance=[...dp].reduce((s,[sum,p])=>s+(sum>=minimum?p:0),0);
  if(chance<1e-14)return {status:'IMPOSSIBLE_ER_TARGET',totals:null,erConditionProbability:chance};
  const totals=Object.fromEntries(distribution.stats.map(id=>{
    const value=bins.reduce((sum,b)=>{
      const remaining=[...four].reduce((s,[er,p])=>s+(er+b.erUnits>=minimum?p:0),0);
      return sum+b.moments[id]*remaining;
    },0);
    return [id,5*value/chance];
  }));
  return {status:'READY',totals,erConditionProbability:chance,acceptanceProbability:distribution.acceptanceProbability};
}
