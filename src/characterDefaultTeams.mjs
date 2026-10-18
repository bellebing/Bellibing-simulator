import review from '../data/source/prydwen-sandbox-default-bindings-2026-10-18.json' with {type:'json'};
import {ALTERNATIVE_TEAM_CONTEXTS} from './data/alternativeTeamContexts.ts';

export const CHARACTER_DEFAULT_TEAM_REVIEW=review;
// Two source-explicit missing trios extend the same canonical context registry.
// Existing trios remain ID references; no duplicate team roster is maintained.
export const CHARACTER_SOURCE_TEAM_CONTEXTS=[...ALTERNATIVE_TEAM_CONTEXTS,...review.additionalCompositions];

// Decisions bind existing catalog IDs, not an independently maintained party
// database. Member defaults retain the catalog's carry/roles and source modes.
export function resolveCharacterDefaultTeam(characterId,{contexts=CHARACTER_SOURCE_TEAM_CONTEXTS,bindings=review.records}={}){
 const rows=bindings.filter(r=>r.characterId===characterId);
 if(rows.length!==1)return {status:'PENDING_SOURCE_DEFAULT_BINDING',context:null,basis:null,reason:'A single explicitly reviewed default binding is required.'};
 const binding=rows[0];
 if(binding.status!=='REVIEWED_SOURCE_DEFAULT')return {status:binding.status,context:null,basis:binding,reason:binding.reason};
 const matches=contexts.filter(c=>c.id===binding.contextId);
 const context=matches.length===1?matches[0]:null;
 if(!context?.characterIds.includes(characterId)||!binding.sourceLines?.length||!binding.sourceUrl||!binding.sourceLinesSha256||
    context.evidenceBasis==='PUBLISHED_MODEL_ROSTER_ONLY'&&binding.compositionReview!=='APPROVED_GUIDE_PROSE_MATCH_TO_EXISTING_CATALOG_TRIO'){
  return {status:'PENDING_SOURCE_DEFAULT_BINDING',context:null,basis:binding,reason:'Missing catalog membership or explicit source-composition review.'};
 }
 return {status:'SOURCE_REVIEWED_DEFAULT',context,basis:binding,reason:null};
}

export function sandboxSourceTeamContexts({contexts=CHARACTER_SOURCE_TEAM_CONTEXTS,bindings=review.records}={}){
 const defaults=bindings.filter(r=>r.status==='REVIEWED_SOURCE_DEFAULT');
 return contexts.filter(c=>c.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY'||defaults.some(b=>b.contextId===c.id&&b.compositionReview==='APPROVED_GUIDE_PROSE_MATCH_TO_EXISTING_CATALOG_TRIO')).map(c=>{
  const bound=defaults.filter(b=>b.contextId===c.id);
  if(!bound.length)return c;
  const modes=bound[0].modeRequirements;
  if(bound.some(b=>JSON.stringify(b.modeRequirements)!==JSON.stringify(modes)))throw Error('Conflicting default source modes: '+c.id);
  return {...c,modeRequirements:modes,defaultSourceBindings:bound,
   // Original model identity/role and evidence classification remain intact.
   conditionsSv:[...c.conditionsSv,...new Set(bound.flatMap(b=>b.conditions))],
   sourceRefs:[...c.sourceRefs,...bound.map(b=>({provider:'PRYDWEN',url:b.sourceUrl,locator:'Default composition review; source lines '+b.sourceLines.join(', ')}))]};
 });
}
