// Detached Custom Echo requirements are character-owned input, not gameplay
// recommendations. Missing target/team/rotation sections remain Pending.
import standards from '../docs/ui-lab/v1.1/modules/sandbox-defaults.json' with {type:'json'};
import {projectRecommendedImprovePolicy} from './improvePolicySources.ts';
export const SANDBOX_ECHO_CONTEXT='CANONICAL_CUSTOM_ECHO_ONLY_V1';
export async function projectSandboxEchoSettings(characterId){
 const base=await projectRecommendedImprovePolicy({characterId});
 if(base.applicability||base.presetId)return base;
 const standard=standards.characters.find(c=>c.characterId===characterId);
 if(!standard)return base;
 const presetId='sandbox-echo-only:'+characterId;
 return {...base,presetId,sourceReviewStatus:'CURRENT',sandboxEchoContext:SANDBOX_ECHO_CONTEXT,
  applicability:{characterId,presetId,modeKey:'default',sequence:standard.baseline.sequenceLevel,
   weaponRecommendationProfileId:null,echoLoadoutProfileId:null,teamProfileId:null,rotationProfileId:null,
   contextBinding:JSON.stringify({kind:SANDBOX_ECHO_CONTEXT,characterId,source:standard.sourceId,bindings:standards.sourceBindings})}};
}
