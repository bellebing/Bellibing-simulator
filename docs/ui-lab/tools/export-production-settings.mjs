import {readFileSync,writeFileSync} from 'node:fs';
import {CHARACTER_CATALOG} from '../../../src/data/characters.ts';
import {projectRecommendedImprovePolicy} from '../../../src/improvePolicySources.ts';
import {createImprovePolicyState,resolveImprovePolicyState} from '../../../src/improvePolicyState.ts';
const characters=[];
for(const character of CHARACTER_CATALOG.filter(row=>row.releaseStatus==='RELEASED')){
 const source=await projectRecommendedImprovePolicy({characterId:character.id});
 const saved=createImprovePolicyState(character.id,source),resolved=resolveImprovePolicyState(saved,source);
 characters.push({characterId:character.id,presetId:source.presetId,applicability:source.applicability,
  sourceReviewStatus:source.sourceReviewStatus,userApprovedEchoDefault:resolved.userApprovedEchoDefault,
  requirements:resolved.policy.echoPolicy.requirements,preferences:resolved.policy.echoPolicy.preferences});
}
const output=JSON.stringify({schemaVersion:1,owner:'CANONICAL_IMPROVE_SETTINGS_V3_PROJECTION',characters},null,2)+'\n';
const path=new URL('../v1.1/modules/production-settings.json',import.meta.url);
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==output)throw Error('Canonical Settings v3 projection stale');}else writeFileSync(path,output);
console.log('Canonical Settings v3 projection verified:',characters.length,'Characters; no persisted account state.');
