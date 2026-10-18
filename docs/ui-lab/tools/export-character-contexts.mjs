import {readFileSync,writeFileSync} from 'node:fs';
import {CHARACTER_CATALOG} from '../../../src/data/characters.ts';
import {ALTERNATIVE_TEAM_CONTEXTS,ALTERNATIVE_TEAM_CONTEXT_REVIEW} from '../../../src/data/alternativeTeamContexts.ts';
import {TEAM_PROFILES} from '../../../src/data/teamProfiles.ts';
import {describeTeamCompositionContext} from '../../../src/teamRotationComposition.ts';
import {CHARACTER_GUIDE_RECOMMENDATIONS} from '../../../src/data/characterEquipmentAssociations.ts';
import {CHARACTER_TARGETS} from '../v1.1/modules/targets.js';

// Detached projection of canonical evidence. No team ranking, target inference,
// timing invention or DPS capability is added by this browser export.
const teams=ALTERNATIVE_TEAM_CONTEXTS.filter(c=>c.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY').map(c=>{
 const d=describeTeamCompositionContext(c.id);
 return {id:c.id,anchorCharacterId:c.anchorCharacterId,characterIds:c.characterIds,relationship:c.relationship,
  modeRequirements:c.modeRequirements,conditions:c.conditionsSv,sourceRefs:c.sourceRefs,
  rotation:{status:d.status,references:d.references.map(r=>({characterId:r.characterId,ids:r.candidates.map(c=>c.id)})),
   variants:d.timingOptions.map(o=>({id:o.modelId,status:o.status,modeReview:o.modeReview,resourceRequirements:o.resourceRequirements}))},
  dpsStatus:'PENDING_VERIFIED_TEAM_EXECUTION'};
});
const defaults=JSON.parse(readFileSync(new URL('../v1.1/modules/sandbox-defaults.json',import.meta.url),'utf8'));
const settings=JSON.parse(readFileSync(new URL('../v1.1/modules/production-settings.json',import.meta.url),'utf8'));
const characters=CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED').map(c=>{
 const guide=CHARACTER_GUIDE_RECOMMENDATIONS.find(g=>g.characterId===c.id);
 const anchored=teams.filter(t=>t.anchorCharacterId===c.id);
 const candidates=anchored.length?anchored:teams.filter(t=>t.characterIds.includes(c.id));
 // Existing reviewed default profiles have explicit primary-Character ownership.
 // A member's presence in somebody else's profile is not their default mode.
 const profile=TEAM_PROFILES.find(p=>p.verificationStatus==='VERIFIED'&&p.members[0]?.characterId===c.id);
 const profileMatches=profile?anchored.filter(t=>t.characterIds.every(id=>profile.members.some(m=>m.characterId===id))):[];
 const bis=anchored.filter(t=>t.relationship==='SOURCE_BIS_REFERENCE');
 const core=anchored.filter(t=>t.relationship==='SOURCE_RECOMMENDED_CORE_VARIANT');
 const unique=rows=>rows.length===1?rows[0]:null;
 const selected=unique(profileMatches)??unique(bis)??unique(core);
 const requirements=settings.characters.find(r=>r.characterId===c.id)?.requirements;
 return {characterId:c.id,defaultContextId:selected?.id??null,defaultBasis:unique(profileMatches)?{kind:'CANONICAL_TEAM_PROFILE',id:profile.id,provenance:profile.provenance}:selected?{kind:'UNIQUE_REVIEWED_GUIDE_CONTEXT'}:null,
  defaultStatus:selected?'SOURCE_REVIEWED_DEFAULT':candidates.length?'PENDING_AMBIGUOUS_TEAM':'PENDING_NO_SOURCE',contextIds:candidates.map(t=>t.id),
  coverage:{standardBuild:defaults.characters.find(s=>s.characterId===c.id)?.configurationValidity??'PENDING',sourceRankedStats:guide.substatPriorities.length?'AVAILABLE':'PENDING',
   exactCalcTargets:CHARACTER_TARGETS.find(t=>t.characterId===c.id)?.rows.filter(r=>r.status==='READY').map(r=>r.metric)??[],
   recommendedUI:requirements&&['VERIFIED','USER_DEFINED'].includes(requirements.status)?'CANONICAL_SETTINGS_RESET':'SOURCE_GUIDANCE_ONLY',
   hardFlex:requirements?.status??'PENDING',er:guide.endgameStats.some(s=>/energy|regen/i.test(s.sourceStatName))?'SOURCE_GUIDANCE_ONLY_NO_AUTOMATIC_THRESHOLD':'PENDING_NO_NUMERIC_ER_SOURCE',dps:'PENDING_VERIFIED_TEAM_EXECUTION'},
  recommendations:{sourceUrl:guide.sourceUrl,sourceLinesSha256:guide.sourceLinesSha256,substatPriorities:guide.substatPriorities,endgameStats:guide.endgameStats,context:guide.endgameContext,
   hardFlexStatus:requirements&&['VERIFIED','USER_DEFINED'].includes(requirements.status)?requirements.status:'PENDING_REVIEWED_ECHO_REQUIREMENTS',
   numericTargetStatus:'SOURCE_STRINGS_ONLY_NOT_EXECUTABLE_THRESHOLDS'}};
});
const output=`{\n"schemaVersion":1,\n"owner":"CANONICAL_CHARACTER_CONTEXT_PROJECTION",\n"teamSource":${JSON.stringify(ALTERNATIVE_TEAM_CONTEXT_REVIEW)},\n"characters":[\n${characters.map(c=>JSON.stringify(c)).join(',\n')}\n],\n"teams":[\n${teams.map(t=>JSON.stringify(t)).join(',\n')}\n]\n}\n`;
const path=new URL('../v1.1/modules/character-contexts.json',import.meta.url);
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==output)throw Error('Character context projection stale');}else writeFileSync(path,output);
console.log(`Character contexts: ${characters.length} Characters, ${teams.length} reviewed contexts; no DPS promotion.`);
