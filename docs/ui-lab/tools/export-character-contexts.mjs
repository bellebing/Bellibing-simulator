import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CHARACTER_CATALOG} from '../../../src/data/characters.ts';
import {ALTERNATIVE_TEAM_CONTEXT_REVIEW} from '../../../src/data/alternativeTeamContexts.ts';
import {CHARACTER_DEFAULT_TEAM_REVIEW,resolveCharacterDefaultTeam,sandboxSourceTeamContexts} from '../../../src/characterDefaultTeams.mjs';
import {findTeamAwareRotationReferences} from '../../../src/teamAwareRotationReferences.ts';
import {describeTeamCompositionContext} from '../../../src/teamRotationComposition.ts';
import {CHARACTER_GUIDE_RECOMMENDATIONS} from '../../../src/data/characterEquipmentAssociations.ts';
import {CHARACTER_TARGETS} from '../v1.1/modules/targets.js';

// Detached projection of canonical evidence. No team ranking, target inference,
// timing invention or DPS capability is added by this browser export.
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
if(hash(readFileSync(CHARACTER_DEFAULT_TEAM_REVIEW.guideArtifact))!==CHARACTER_DEFAULT_TEAM_REVIEW.guideSha256)throw Error('Default-team guide evidence drift');
const releasedIds=CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED').map(c=>c.id);
if(CHARACTER_DEFAULT_TEAM_REVIEW.records.length!==releasedIds.length||new Set(CHARACTER_DEFAULT_TEAM_REVIEW.records.map(r=>r.characterId)).size!==releasedIds.length)throw Error('Default-team binding coverage drift');
for(const binding of CHARACTER_DEFAULT_TEAM_REVIEW.records){
 const guide=CHARACTER_GUIDE_RECOMMENDATIONS.find(g=>g.characterId===binding.sourceOwnerId);
 if(!releasedIds.includes(binding.characterId)||!guide||binding.sourceUrl!==guide.sourceUrl||binding.sourceLinesSha256!==guide.sourceLinesSha256||!binding.sourceLines.every(n=>Number.isSafeInteger(n)&&n>0))throw Error('Default-team source binding drift: '+binding.characterId);
 const resolved=resolveCharacterDefaultTeam(binding.characterId);
 if(binding.status==='REVIEWED_SOURCE_DEFAULT'&&!resolved.context)throw Error('Default-team context drift: '+binding.characterId);
 if(resolved.context&&Object.keys(binding.modeRequirements).some(id=>!resolved.context.characterIds.includes(id)))throw Error('Default-team mode ownership drift: '+binding.characterId);
}
const sourceTeams=sandboxSourceTeamContexts();
const teams=sourceTeams.map(c=>{
 const supplemental=c.evidenceBasis==='PUBLISHED_MODEL_ROSTER_ONLY';
 const d=describeTeamCompositionContext(c.id,supplemental);
 return {id:c.id,anchorCharacterId:c.anchorCharacterId,characterIds:c.characterIds,relationship:c.relationship,
  roleAssignment:c.roleAssignment,modeRequirements:c.modeRequirements,conditions:c.conditionsSv,sourceRefs:c.sourceRefs,
  catalogEvidenceBasis:c.evidenceBasis,defaultSourceBindings:c.defaultSourceBindings??[],
  rotation:{status:supplemental?'PENDING_DEFAULT_MODE_TIMING_BINDING':d?.status??'TIMING_MODULES_MISSING',references:c.characterIds.map(characterId=>({characterId,ids:findTeamAwareRotationReferences(characterId,{modeKey:c.modeRequirements[characterId],teamCharacterIds:c.characterIds}).map(r=>r.id)})),
   variants:(d?.timingOptions??[]).map(o=>({id:o.modelId,status:o.status,modeReview:o.modeReview,resourceRequirements:o.resourceRequirements}))},
  dpsStatus:'PENDING_VERIFIED_TEAM_EXECUTION'};
});
const defaults=JSON.parse(readFileSync(new URL('../v1.1/modules/sandbox-defaults.json',import.meta.url),'utf8'));
const settings=JSON.parse(readFileSync(new URL('../v1.1/modules/production-settings.json',import.meta.url),'utf8'));
const characters=CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED').map(c=>{
 const guide=CHARACTER_GUIDE_RECOMMENDATIONS.find(g=>g.characterId===c.id);
 const anchored=teams.filter(t=>t.anchorCharacterId===c.id);
 const candidates=[...anchored,...teams.filter(t=>t.anchorCharacterId!==c.id&&t.characterIds.includes(c.id))];
 const resolved=resolveCharacterDefaultTeam(c.id);
 const selected=teams.find(t=>t.id===resolved.context?.id)??null;
 const requirements=settings.characters.find(r=>r.characterId===c.id)?.requirements;
 return {characterId:c.id,defaultContextId:selected?.id??null,defaultBasis:resolved.basis,defaultPendingReason:resolved.reason,
  defaultStatus:resolved.status,contextIds:candidates.map(t=>t.id),
  coverage:{standardBuild:defaults.characters.find(s=>s.characterId===c.id)?.configurationValidity??'PENDING',sourceRankedStats:guide.substatPriorities.length?'AVAILABLE':'PENDING',
   exactCalcTargets:CHARACTER_TARGETS.find(t=>t.characterId===c.id)?.rows.filter(r=>r.status==='READY').map(r=>r.metric)??[],
   recommendedUI:requirements&&['VERIFIED','USER_DEFINED'].includes(requirements.status)?'CANONICAL_SETTINGS_RESET':'SOURCE_GUIDANCE_ONLY',
   hardFlex:requirements?.status??'PENDING',er:guide.endgameStats.some(s=>/energy|regen/i.test(s.sourceStatName))?'SOURCE_GUIDANCE_ONLY_NO_AUTOMATIC_THRESHOLD':'PENDING_NO_NUMERIC_ER_SOURCE',dps:'PENDING_VERIFIED_TEAM_EXECUTION'},
  recommendations:{sourceUrl:guide.sourceUrl,sourceLinesSha256:guide.sourceLinesSha256,substatPriorities:guide.substatPriorities,endgameStats:guide.endgameStats,context:guide.endgameContext,
   hardFlexStatus:requirements&&['VERIFIED','USER_DEFINED'].includes(requirements.status)?requirements.status:'PENDING_REVIEWED_ECHO_REQUIREMENTS',
   numericTargetStatus:'SOURCE_STRINGS_ONLY_NOT_EXECUTABLE_THRESHOLDS'}};
});
const output=`{\n"schemaVersion":1,\n"owner":"CANONICAL_CHARACTER_CONTEXT_PROJECTION",\n"teamSource":${JSON.stringify(ALTERNATIVE_TEAM_CONTEXT_REVIEW)},\n"defaultSource":{"artifact":"data/source/prydwen-sandbox-default-bindings-2026-10-18.json","sha256":"${hash(readFileSync('data/source/prydwen-sandbox-default-bindings-2026-10-18.json'))}"},\n"characters":[\n${characters.map(c=>JSON.stringify(c)).join(',\n')}\n],\n"teams":[\n${teams.map(t=>JSON.stringify(t)).join(',\n')}\n]\n}\n`;
const path=new URL('../v1.1/modules/character-contexts.json',import.meta.url);
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==output)throw Error('Character context projection stale');}else writeFileSync(path,output);
console.log(`Character contexts: ${characters.length} Characters, ${teams.length} source-bound contexts; no DPS promotion.`);
