import {sandboxStandard} from './sandbox-state.js';
import {captureLocalTeamBuilds} from '../../../../src/localTeamBuildCapture.mjs';
import {temporaryTeamScenario} from './temporary-team-review.js';
import {accountTeamBasis} from './improve-comparison-basis.js';
import {effectiveErTarget} from './character-er-guidance.js';

async function requestAvailable(fetchImpl,options){
 for(let attempt=0;attempt<8;attempt++){
  options.signal.throwIfAborted();
  const response=await fetchImpl('/local-review/improve-search',options);
  if(response.status!==429)return response;
  await new Promise(resolve=>setTimeout(resolve,Math.min(4000,500*2**attempt)));
 }
 throw Error('IMPROVE_REVIEW_BUSY');
}

// Presentation adapter. Sampling, damage evaluation and cost policy stay private.
export function createImproveSearchClient({readInput,onResult,fetchImpl=fetch}){
 let binding=null,generation=0,timer=null,controller=null,inflightBasis=null;
 async function refresh(){
  const raw=readInput();
  const identity=JSON.stringify(raw);
  if(identity===binding)return;
  // Focus and observed rolls are suffix queries on the same five-slot job.
  // Let that job finish, then request only the latest suffix against its cache.
  const basisIdentity=JSON.stringify({team:accountTeamBasis(raw.teamInput),useReference:raw.useReference,plan:raw.plan,gate:raw.gate,erTarget:raw.erTarget});
  if(inflightBasis===basisIdentity){binding=identity;onResult({status:'CALCULATING'});return;}
  binding=identity;const token=++generation;
  clearTimeout(timer);controller?.abort();controller=null;inflightBasis=null;
  if(!raw.plan?.dpsEnabled){onResult({status:'DISABLED'});return;}
  onResult({status:'CALCULATING'});
  timer=setTimeout(async()=>{
   try{
    let current,basis;
    if(!raw.useReference){
     const captured=await captureLocalTeamBuilds({...raw.teamInput,candidates:Array(5).fill(null),acceptReferenceInvestment:false});
     if(captured.status!=='CAPTURED')throw Error(captured.reason??'COMPLETE_ACCOUNT_TEAM_REQUIRED');current=captured.payload.current;basis='ACCOUNT_TEAM';
    }
    if(raw.useReference){current=temporaryTeamScenario(raw.teamInput);basis='TEMPORARY_REFERENCE_TEAM';}
    if(!current)throw Error('FIVE_COMPLETE_ACCOUNT_ECHOES_REQUIRED');
    const cards=current.cards??current.builds.find(b=>b.characterId===current.selectedCharacterId)?.echoes;
    if(!Array.isArray(cards)||cards.length!==5)throw Error('FIVE_COMPLETE_ACCOUNT_ECHOES_REQUIRED');
    const standard=sandboxStandard(current.selectedCharacterId);
    const templates=cards.map((card,index)=>card?structuredClone(card):(()=>{const c=standard?.slots[index]?.configuration;return c?{id:'new-slot-'+index,speciesId:c.echoId,cost:c.cost,selectedSonataSetId:c.selectedSonataSetId,mainStat:{name:c.mainStatName}}:null;})());
    const candidateTemplate=raw.template?{...templates[raw.slot],speciesId:raw.template.echoId??raw.template.speciesId,cost:raw.template.cost,selectedSonataSetId:raw.template.selectedSonataSetId,mainStat:{name:raw.template.mainStatName}}:templates[raw.slot];
    const referenceScenario=temporaryTeamScenario(raw.teamInput);
    if(token!==generation||JSON.stringify(readInput())!==identity)return;
    controller=new AbortController();
    inflightBasis=basisIdentity;
    const response=await requestAvailable(fetchImpl,{method:'POST',headers:{'Content-Type':'application/json','X-Bellibing-Review':'1'},credentials:'same-origin',signal:controller.signal,
     body:JSON.stringify({current,templates,candidateTemplate,slot:raw.slot,rolls:raw.rolls??[],referenceScenario,referenceMinimumPercent:raw.plan?.dpsEnabled?raw.plan.minimumDpsPercent:null,minimumDps:0,gate:raw.gate,erTarget:raw.erTarget?.enabled?effectiveErTarget(current.selectedCharacterId,raw.erTarget):null})});
    if(!response.ok)throw Error('IMPROVE_SEARCH_UNAVAILABLE');
    const reply=await response.json();
    if(reply.protocol!=='BELLIBING_IMPROVE_SEARCH_V1')throw Error('INVALID_SEARCH_RESPONSE');
    if(token===generation){inflightBasis=null;if(JSON.stringify(readInput())!==identity){binding=null;await refresh();return;}}
    if(token===generation&&JSON.stringify(readInput())===identity)onResult({...reply.result,basis,characterId:raw.teamInput.selectedCharacterId,accountBuildIdentity:JSON.stringify(raw.teamInput.records.find(r=>r.characterId===raw.teamInput.selectedCharacterId)?.buildState),selectedTemplate:candidateTemplate,teamIdentity:JSON.stringify(raw.teamInput.team),teamBuildIdentity:accountTeamBasis(raw.teamInput),useReference:raw.useReference});
   }catch(error){if(token===generation){inflightBasis=null;binding=null;onResult({status:'PENDING',reason:error.message});}}
  },350);
 }
 return {refresh};
}
