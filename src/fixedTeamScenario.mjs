// Public transport boundary only. No rotation execution or damage mathematics.
import contexts from '../docs/ui-lab/v1.1/modules/character-contexts.json' with {type:'json'};
export const FIXED_TEAM_SCENARIO_VERSION='BELLIBING_FIXED_TEAM_SCENARIO_V1';
const modes={SANDBOX:'SANDBOX_BUILD',IMPROVE:'ACCOUNT_BUILD'};
const text=v=>typeof v==='string'&&v.trim().length>0&&v.length<=256;
const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);

/** Capture complete selected context and builds, never synthetic teammates.
 * Ownership is a local comparison binding, NOT an authentication certificate.
 * The private consumer independently verifies equipment/source/rotation legality.
 */
export function createFixedTeamScenarioRequest({mode,selectedCharacterId,teamContextId,ownership,builds,cycleNumber,enemy,acceptReferenceStateSchedule=false}={}){
 const fail=reason=>({status:'PENDING',reason,request:null});
 if(!modes[mode]||!text(ownership?.id)||!text(ownership?.revision)||ownership.kind!==modes[mode])return fail('BUILD_OWNERSHIP_PENDING');
 const team=contexts.teams.find(t=>t.id===teamContextId);
 if(!team||!team.characterIds.includes(selectedCharacterId)||!team.sourceRefs?.length)return fail('SOURCE_TEAM_CONTEXT_PENDING');
 if(!Array.isArray(builds)||builds.length!==3||new Set(builds.map(b=>b?.characterId)).size!==3||!team.characterIds.every(id=>builds.some(b=>b?.characterId===id)))return fail('COMPLETE_SELECTED_TEAM_BUILDS_REQUIRED');
 if(builds.some(b=>b.kind!==modes[mode]||b.ownerId!==ownership.id||b.ownerRevision!==ownership.revision))return fail('BUILD_OWNER_CONTEXT_MISMATCH');
 if(builds.some(b=>b.modeId!==(team.modeRequirements?.[b.characterId]??'default')))return fail('SOURCE_TEAM_MODE_MISMATCH');
 if(![1,2,3,4].includes(cycleNumber)||acceptReferenceStateSchedule!==true)return fail('FIXED_REFERENCE_SCENARIO_NOT_SELECTED');
 return {status:'CAPTURED',reason:null,request:structuredClone({version:FIXED_TEAM_SCENARIO_VERSION,mode,selectedCharacterId,teamContextId,
  ownership,builds:team.characterIds.map(id=>builds.find(b=>b.characterId===id)),cycleNumber,enemy,acceptReferenceStateSchedule})};
}

/** Prevent accidental reuse after team, owner, investment or scenario changes.
 * Echo cards are intentionally excluded: they are the compared variable.
 */
export function fixedTeamComparisonContext(request){
 if(request?.version!==FIXED_TEAM_SCENARIO_VERSION||!Array.isArray(request.builds)||request.builds.length!==3||request.builds.some(b=>!b||typeof b!=='object'))return null;
 const {version,mode,selectedCharacterId,teamContextId,ownership,cycleNumber,enemy,acceptReferenceStateSchedule}=request;
 return {version,mode,selectedCharacterId,teamContextId,ownership:structuredClone(ownership),cycleNumber,enemy:structuredClone(enemy),acceptReferenceStateSchedule,
  members:request.builds.map(({echoes,...build})=>structuredClone(build))};
}
export function sameFixedTeamComparisonContext(a,b){
 const left=fixedTeamComparisonContext(a),right=fixedTeamComparisonContext(b);
 return left!==null&&right!==null&&stable(left)===stable(right);
}
