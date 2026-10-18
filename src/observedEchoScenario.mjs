// Validate aggregate presentation against fresh observed ownership and the pinned
// public scenario. No gameplay math, provider promotion or account state writes.
const actors=['augusta','iuno','the-shorekeeper'];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const near=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=1e-6*Math.max(1,Math.abs(a),Math.abs(b));
const positive=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
const identity=s=>typeof s==='string'&&s.length>0&&s.length<=512;
function values(row){return positive(row?.teamTotal)&&Array.isArray(row.characterContributions)&&row.characterContributions.length===3&&actors.every(id=>row.characterContributions.filter(m=>m.characterId===id&&positive(m.dps)).length===1)&&near(row.teamTotal,row.characterContributions.reduce((n,m)=>n+m.dps,0));}
const difference=(a,b)=>({absolute:b-a,relative:a===0?null:(b-a)/a});
function delta(before,after){return {teamTotal:difference(before.teamTotal,after.teamTotal),characterContributions:actors.map(characterId=>({characterId,...difference(before.characterContributions.find(m=>m.characterId===characterId).dps,after.characterContributions.find(m=>m.characterId===characterId).dps)}))};}
const deltaValid=(a,b)=>near(a?.absolute,b.absolute)&&(b.relative===null?a?.relative===null:near(a?.relative,b.relative));
const clean=r=>({teamTotal:r.teamTotal,characterContributions:actors.map(characterId=>({characterId,dps:r.characterContributions.find(m=>m.characterId===characterId).dps}))});
export function observedEchoScenario({dps,view,scenario,characterId='augusta'}={}){
 const c=dps?.beforeAfter,m=c?.measurement,p=dps?.provider;
 if(!actors.includes(characterId)||dps?.characterId!==characterId||m?.selectedCharacterId!==characterId)return null;
 if(!scenario||dps?.status!=='EXPERIMENTAL'||dps.verification!=='EXPERIMENTAL'||p?.kind!=='DPS'||p.version!==scenario.providerVersion||p.profileId!==scenario.scenarioId||p.sourceRevision!==scenario.publicSourceRevision||!identity(p.sourceBinding)||c?.version!==scenario.version||c.status!=='EXPERIMENTAL'||c.teamDpsReady!==false||c.authorizesCharacterUpgrade!==false)return null;
 if(dps.context?.id!==scenario.scenarioId||dps.context?.kind!=='SYNTHETIC_REFERENCE_TEAM'||dps.context?.version!==1||m?.scenarioId!==scenario.scenarioId||m.sourceBinding!==p.sourceBinding||m.sourceRevision!==p.sourceRevision||!same(m.actorIds,actors)||m.scheduleSourceCommit!==scenario.sourceCommit||m.hitEvidenceSha256!==scenario.hitEvidenceSha256||m.clock!==scenario.clock||m.cycle!==scenario.cycle||m.durationSeconds!==scenario.durationSeconds)return null;
 const slots=view?.slots,observation=c.observation;
 if(!identity(view?.sessionId)||!Number.isSafeInteger(view.revision)||observation?.sessionId!==view.sessionId||observation.revision!==view.revision||!Array.isArray(slots)||slots.length!==5||new Set(slots.map(s=>s.slot)).size!==5)return null;
 const ordered=[1,2,3,4,5].map(n=>slots.find(s=>s.slot===n));
 if(ordered.some(s=>!s?.complete||s.current?.level!==25||!identity(s.current.id))||new Set(ordered.map(s=>s.current.id)).size!==5||!same(observation.currentCardIds,ordered.map(s=>s.current.id)))return null;
 if(c.baseline?.status!=='EXPERIMENTAL'||!identity(c.baseline.loadoutIdentity)||!values(c.baseline)||!values(dps)||!near(c.baseline.teamTotal,dps.teamTotal)||!actors.every(id=>near(c.baseline.characterContributions.find(m=>m.characterId===id).dps,dps.characterContributions.find(m=>m.characterId===id).dps)))return null;
 if(!Array.isArray(c.alternatives)||c.alternatives.length!==5||new Set(c.alternatives.map(a=>a.slot)).size!==5)return null;
 const alternatives=ordered.map(slot=>{
  const a=c.alternatives.find(a=>a.slot===slot.slot),current=slot.current;
  const pending=reason=>({slot:slot.slot,status:'PENDING',reason,fromCardId:current.id,toCardId:null,teamTotal:null,characterContributions:null,delta:null});
  if(!a||a.fromCardId!==current.id)return pending('OBSERVED_ALTERNATIVE_BINDING_MISMATCH');
  if(a.status==='PENDING')return pending(a.reason);
  const owned=[...(slot.trash??[]).map(t=>t.card),slot.candidate].find(card=>card?.id===a.toCardId);
  if(a.status!=='EXPERIMENTAL'||!identity(a.toCardId)||!owned||owned.level!==25||ordered.some(s=>s.current.id===owned.id)||!['speciesId','selectedSonataSetId','cost','rank'].every(k=>owned[k]===current[k])||owned.mainStat?.name!==current.mainStat?.name||!identity(a.loadoutIdentity)||a.loadoutIdentity===c.baseline.loadoutIdentity||!values(a))return pending('OBSERVED_ALTERNATIVE_BINDING_MISMATCH');
  const expected=delta(c.baseline,a),provided=a.delta;
  if(!deltaValid(provided?.teamTotal,expected.teamTotal)||!Array.isArray(provided?.characterContributions)||provided.characterContributions.length!==3||!actors.every(id=>provided.characterContributions.filter(m=>m.characterId===id&&deltaValid(m,expected.characterContributions.find(e=>e.characterId===id))).length===1))return pending('OBSERVED_ALTERNATIVE_DELTA_MISMATCH');
  return {slot:slot.slot,status:'EXPERIMENTAL',reason:null,fromCardId:a.fromCardId,toCardId:a.toCardId,...clean(a),delta:expected};
 });
 return {status:'EXPERIMENTAL',measurement:structuredClone(m),baseline:clean(c.baseline),alternatives};
}
