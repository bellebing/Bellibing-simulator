export const TEAM_COMPARISON_VERSION='BELLIBING_TEAM_DPS_COMPARISON_V1';
const scenarios={SANDBOX:['RECOMMENDED','EXPECTED','SIMULATED'],IMPROVE:['CURRENT','CANDIDATE']};
const interpretations={RECOMMENDED:'REFERENCE_BUILD',EXPECTED:'EXPECTATION_OF_TEAM_RUNS',SIMULATED:'OBSERVED_LOADOUT',CURRENT:'EQUIPPED_BUILD',CANDIDATE:'CANDIDATE_BUILD'};
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
const boundString=s=>typeof s==='string'&&s.length>0&&s.length<=256;
const providerKey=p=>p&&[p.id,p.version,p.sourceBinding].every(boundString)?stable(p):null;
const admitted=new WeakMap();
const pending=(scenario,members,reason)=>({scenario,interpretation:interpretations[scenario],status:'PENDING',reason,characterContributions:members.map(characterId=>({characterId,dps:null})),teamTotal:null,loadoutIdentity:null});
function measurementValid(c){
 return c?.version===TEAM_COMPARISON_VERSION&&boundString(c.teamContextId)&&Array.isArray(c.characterIds)&&c.characterIds.length===3&&new Set(c.characterIds).size===3&&c.characterIds.every(boundString)&&c.characterIds.includes(c.selectedCharacterId)&&
  boundString(c.sourceRevision)&&boundString(c.enemyIdentity)&&boundString(c.rotationIdentity)&&Number.isSafeInteger(c.cycles)&&c.cycles>0&&finite(c.durationSeconds)&&c.durationSeconds>0&&boundString(c.fixedEquipmentIdentity)&&providerKey(c.provider);
}

/** A presentation contract, not a DPS engine or a qualification heuristic.
 * Qualified providers are supplied by the trusted host's reviewed registry,
 * never inferred from the row's self-reported verification flag. The current
 * public UI has an empty registry and cannot promote experimental/reference DTOs.
 * fixedEquipmentIdentity binds all unchanged gear and non-Echo focus investment;
 * row loadoutIdentity carries only the explicitly intended scenario difference.
 */
export function teamDpsComparison({mode='SANDBOX',context,results=[],qualifiedProviders=[]}={}){
 if(!scenarios[mode])throw Error('UNKNOWN_COMPARISON_MODE');
 const members=Array.isArray(context?.characterIds)?context.characterIds:[];
 const rows=scenarios[mode].map(scenario=>{
  const empty=reason=>pending(scenario,members,reason);
  if(!measurementValid(context))return empty('QUALIFIED_MEASUREMENT_CONTEXT_PENDING');
  const provider=qualifiedProviders.find(p=>providerKey(p.identity)===providerKey(context.provider)&&p.scenarios?.includes(scenario));
  if(!provider)return empty('QUALIFIED_PROVIDER_PENDING');
  const matching=results.filter(r=>r.scenario===scenario);
  if(matching.length!==1)return empty('SCENARIO_RESULT_PENDING');
  const r=matching[0];
  if(r.version!==TEAM_COMPARISON_VERSION||r.status!=='VERIFIED'||r.verification!=='SOURCE_QUALIFIED_TEAM_RUN'||stable(r.measurementContext)!==stable(context))return empty('SCENARIO_CONTEXT_OR_VERIFICATION_MISMATCH');
  if(r.interpretation!==interpretations[scenario]||!boundString(r.loadoutIdentity)||!boundString(r.runIdentity)||r.rotationLegal!==true||r.coverage?.complete!==true)return empty('SCENARIO_BUILD_OR_ROTATION_PENDING');
  if(scenario==='EXPECTED'&&(!provider.expectationModelIds?.includes(r.expectation?.modelId)||!['EXACT_DISTRIBUTION','MONTE_CARLO_TEAM_RUNS'].includes(r.expectation?.method)))return empty('STATISTICAL_TEAM_EXPECTATION_PENDING');
  const contributions=r.characterContributions;
  if(!Array.isArray(contributions)||contributions.length!==3||!members.every(id=>contributions.filter(c=>c.characterId===id&&finite(c.dps)&&c.dps>=0).length===1)||!finite(r.teamTotal)||r.teamTotal<0)return empty('SAME_RUN_ATTRIBUTION_PENDING');
  const sum=contributions.reduce((n,c)=>n+c.dps,0);
  if(Math.abs(sum-r.teamTotal)>1e-6*Math.max(1,r.teamTotal))return empty('SAME_RUN_TOTAL_MISMATCH');
  return {scenario,interpretation:r.interpretation,status:'VERIFIED',reason:null,characterContributions:members.map(id=>({characterId:id,dps:contributions.find(c=>c.characterId===id).dps})),teamTotal:r.teamTotal,loadoutIdentity:r.loadoutIdentity,runIdentity:r.runIdentity};
 });
 const comparison={version:TEAM_COMPARISON_VERSION,mode,context:structuredClone(context??null),rows};
 admitted.set(comparison,stable(comparison));return comparison;
}
export function teamDpsDelta(comparison,fromScenario,toScenario){
 if(!comparison||admitted.get(comparison)!==stable(comparison))return {status:'PENDING',reason:'VALIDATED_UNCHANGED_COMPARISON_REQUIRED',teamTotal:null,characterContributions:[]};
 const from=comparison.rows.find(r=>r.scenario===fromScenario),to=comparison.rows.find(r=>r.scenario===toScenario);
 if(from?.status!=='VERIFIED'||to?.status!=='VERIFIED')return {status:'PENDING',reason:'COMPARABLE_QUALIFIED_SCENARIOS_REQUIRED',teamTotal:null,characterContributions:[]};
 const delta=(a,b)=>({absolute:b-a,relative:a===0?null:(b-a)/a});
 return {status:'VERIFIED',teamTotal:delta(from.teamTotal,to.teamTotal),characterContributions:from.characterContributions.map(a=>({characterId:a.characterId,...delta(a.dps,to.characterContributions.find(b=>b.characterId===a.characterId).dps)}))};
}
