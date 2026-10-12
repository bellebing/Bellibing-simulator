import {ALTERNATIVE_TEAM_CONTEXTS} from './data/alternativeTeamContexts.ts';
import {TEAM_ROTATION_COMPOSITION_MODELS,TEAM_ROTATION_COMPOSITION_SOURCE} from './data/teamRotationCompositionModels.ts';
import {coordinateTeamRotation} from './teamRotationCoordination.ts';
import {findTeamAwareRotationReferences} from './teamAwareRotationReferences.ts';
import {TEAM_AWARE_ROTATION_REFERENCES} from './data/teamAwareRotationReferences.ts';

const modeNames:Readonly<Record<string,string>>={'tune-rupture':'Resonance Mode - Tune Rupture','tune-strain':'Resonance Mode - Tune Strain','fusion-burst':'Resonance Mode - Fusion Burst','unison':'Resonance Mode - Unison','electro-flare':'Resonance Mode - Electro Flare','glacio-chafe':'Resonance Mode - Glacio Chafe','echo-skill':'Resonance Mode - Echo'};
const sameParty=(a:readonly string[],b:readonly string[])=>a.length===3&&b.length===3&&new Set(a).size===3&&a.every(id=>b.includes(id));

const classifiedMode=(id:string,mode:string|undefined)=>mode&&TEAM_AWARE_ROTATION_REFERENCES.some(r=>r.characterId===id&&r.context.modeKeys.includes(mode))?mode:undefined;
function memberReferences(characterId:string,party:readonly string[],mode:string|undefined){
 const key=classifiedMode(characterId,mode);
 return {characterId,requestedMode:mode??null,classifiedReferenceMode:key??null,modeStatus:mode&&!key?'UNCLASSIFIED_GUIDE_MODE_REQUIRES_REVIEW' as const:'REFERENCE_MODE_OR_MEMBER_GUIDANCE' as const,
  candidates:findTeamAwareRotationReferences(characterId,{modeKey:key,teamCharacterIds:party})};
}

/** Discovery never equates a provider's module with an exact Prydwen action sequence. */
export function describeTeamCompositionContext(contextId:string,includeModelCandidates=false){
 const context=ALTERNATIVE_TEAM_CONTEXTS.find(c=>c.id===contextId);
 if(!context||(context.evidenceBasis==='PUBLISHED_MODEL_ROSTER_ONLY'&&!includeModelCandidates))return null;
 const references=context.characterIds.map(characterId=>memberReferences(characterId,context.characterIds,context.modeRequirements[characterId]));
 const models=TEAM_ROTATION_COMPOSITION_MODELS.filter(m=>sameParty(m.characterIds,context.characterIds)&&(!m.compositionContextId||m.compositionContextId===context.id)&&
   (context.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY'||context.publisherRowIds.includes(m.publisherRow??-1)));
 const timingOptions=models.map(model=>({modelId:model.id,origin:model.publisherRow===null?'MODULE_COMPOSITION' as const:'PUBLISHED_TEAM' as const,
  status:model.failure?'MODEL_BLOCKED' as const:'DECLARED_MODEL_VARIANT_AVAILABLE' as const,failure:model.failure,
  modules:model.modules,builds:model.builds??[],resourceRequirements:model.resources??[],sourceMainstatFallbacks:model.sourceMainstatFallbacks??[],
  modeReview:Object.entries(context.modeRequirements).map(([characterId,mode])=>({characterId,requestedMode:mode,providerMode:model.modules.find(m=>m.characterId===characterId)?.mode??null,
   status:['dps','main-dps'].includes(mode)?(model.modules.find(m=>m.characterId===characterId)?.isMainDamage?'NAMED_MODE_MATCH':'NAMED_MODE_MISMATCH'):['confession','absolution','aero-erosion','spectro-frazzle','single-carry'].includes(mode)?(model.modules.find(m=>m.characterId===characterId)?.semanticMode===mode?'NAMED_MODE_MATCH':'NAMED_MODE_MISMATCH'):modeNames[mode]?(model.modules.find(m=>m.characterId===characterId)?.mode===modeNames[mode]?'NAMED_MODE_MATCH':'NAMED_MODE_MISMATCH'):'GUIDE_ROLE_OR_MODE_REQUIRES_REVIEW'})),
  relationship:'RELATED_MODULES_NOT_EXACT_PRYDWEN_ACTION_TIMING' as const}));
 return {context,references,timingOptions,status:timingOptions.some(o=>o.status==='DECLARED_MODEL_VARIANT_AVAILABLE'&&!o.modeReview.some(m=>m.status==='NAMED_MODE_MISMATCH'))?'TIMING_VARIANT_AVAILABLE' as const:models.length?'MODEL_BLOCKED' as const:'TIMING_MODULES_MISSING' as const,
  limitationsSv:[...context.conditionsSv,'Modellens utrustning, sekvenser och handlingar är scenarioförutsättningar; spelarens build kan ändra energi, Concerto och därmed timing.','Godkänn en konkret modellvariant efter granskning av mode, roll och källans handlingar. Prydwen-referenserna är separat vägledning.']};
}

/** Rebuild for the new exact trio: no inherited member, timing or buff recipients. */
export function composeTeamRotation(input:{contextId:string;characterIds:readonly string[];modelId:string;rotationNumber:number;acceptModelVariant?:boolean;includeModelCandidates?:boolean;modeKeys?:Readonly<Record<string,string>>}){
 const description=describeTeamCompositionContext(input.contextId,input.includeModelCandidates);
 if(!description||!sameParty(description.context.characterIds,input.characterIds))throw Error('Select an existing context for the exact new trio');
 if(input.modeKeys&&Object.entries(input.modeKeys).some(([id,mode])=>!input.characterIds.includes(id)||description.context.modeRequirements[id]!==mode))return {status:'MODE_MISMATCH' as const,requiredModes:description.context.modeRequirements};
 const option=description.timingOptions.find(o=>o.modelId===input.modelId);
 if(!option)throw Error('Timing module does not belong to this team/context');
 if(option.failure)return {status:'MODEL_BLOCKED' as const,failure:option.failure};
 if(option.modeReview.some(m=>m.status==='NAMED_MODE_MISMATCH'))return {status:'MODE_MISMATCH' as const,modeReview:option.modeReview};
 if(!input.acceptModelVariant)return {status:'MODEL_VARIANT_REVIEW_REQUIRED' as const,option,limitationsSv:description.limitationsSv};
 const model=TEAM_ROTATION_COMPOSITION_MODELS.find(m=>m.id===option.modelId)!;
 const phase=model.phases.find(p=>p.rotationNumber===input.rotationNumber);
 if(!phase)throw Error('Select opener 1 or a replayed later cycle 2–4');
 const referenceModes=Object.fromEntries(model.modules.map(m=>[m.characterId,m.semanticMode??description.context.modeRequirements[m.characterId]]));
 const modelReferences=model.modules.map(m=>memberReferences(m.characterId,input.characterIds,referenceModes[m.characterId]));
 const contextDifferences=model.modules.filter(m=>m.semanticMode&&description.context.modeRequirements[m.characterId]&&m.semanticMode!==description.context.modeRequirements[m.characterId]).map(m=>({characterId:m.characterId,guideMode:description.context.modeRequirements[m.characterId],moduleMode:m.semanticMode}));
 const coordination=coordinateTeamRotation({members:description.context.characterIds.map(characterId=>({characterId,modeKey:classifiedMode(characterId,referenceModes[characterId]),role:model.modules.find(m=>m.characterId===characterId)?.isMainDamage?'DPS':characterId===description.context.roleAssignment.support?'SUPPORT':'SUB_DPS'}))});
 const visits=phase.visits.map(v=>({...v,startSeconds:v.startFrame/60,endSeconds:v.endFrame/60,fieldSeconds:(v.endFrame-v.startFrame)/60,waitSeconds:v.actions.reduce((n,a)=>n+a.waitFrames,0)/60}));
 return {status:'COMPOSED_REFERENCE_SCENARIO' as const,contextId:description.context.id,characterIds:[...input.characterIds],anchorCharacterId:description.context.anchorCharacterId,modelId:model.id,
  source:TEAM_ROTATION_COMPOSITION_SOURCE,clock:TEAM_ROTATION_COMPOSITION_SOURCE.clock,rotationNumber:phase.rotationNumber,cycleSeconds:phase.cycleFrames/60,visits,
  events:phase.events.map(e=>({...e,atSeconds:e.atFrame/60})),modules:model.modules,sourceBuilds:model.builds!,sourceResourceRequirements:model.resources??[],coordination,references:modelReferences,contextDifferences,guideReferences:description.references,
  limitationsSv:[...description.limitationsSv,...contextDifferences.map(d=>`${d.characterId}: modellvarianten använder ${d.moduleMode}, medan kompositionsguiden anger ${d.guideMode}. Rotationsreferenser hämtas för modellvarianten.`),...(model.modules.find(m=>m.characterId===description.context.anchorCharacterId)?.isMainDamage?[]:['Katalogens fokuskaraktär har en hybrid-/stödfunktion i denna modell; source-modulernas roller och återbesök styr lagflödet.'])],combatPreparation:{status:'EVENT_BINDINGS_REQUIRED' as const,unboundActions:visits.flatMap(v=>v.actions.map(a=>({characterId:v.characterId,name:a.name,atSeconds:a.atFrame/60}))),teamDpsReady:false as const,rotationDps:null,authorizesUpgradeVerdict:false as const}};
}

export function getTeamRotationCompositionCoverage(includeModelCandidates=false){
 return ALTERNATIVE_TEAM_CONTEXTS.filter(c=>includeModelCandidates||c.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY').map(c=>{const d=describeTeamCompositionContext(c.id,includeModelCandidates)!;return {contextId:c.id,characterIds:c.characterIds,status:d.status,modelIds:d.timingOptions.filter(o=>o.status==='DECLARED_MODEL_VARIANT_AVAILABLE'&&!o.modeReview.some(m=>m.status==='NAMED_MODE_MISMATCH')).map(o=>o.modelId)};});
}

/** Exact party lookup preserves conflicting mode contexts for explicit selection. */
export function findTeamCompositionContexts(input:{characterIds:readonly string[];anchorCharacterId?:string;includeModelCandidates?:boolean}){
 if(input.characterIds.length!==3||new Set(input.characterIds).size!==3)throw Error('Three unique members required');
 return ALTERNATIVE_TEAM_CONTEXTS.filter(c=>sameParty(c.characterIds,input.characterIds)&&(!input.anchorCharacterId||c.anchorCharacterId===input.anchorCharacterId)&&(input.includeModelCandidates||c.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY')).map(c=>describeTeamCompositionContext(c.id,input.includeModelCandidates)!);
}

/** One-slot substitutions retain source relationship/accessibility instead of an inferred DPS rank. */
export function findTeamRotationReplacements(contextId:string,outgoingCharacterId:string){
 const original=describeTeamCompositionContext(contextId);
 if(!original||!original.context.characterIds.includes(outgoingCharacterId)||outgoingCharacterId===original.context.anchorCharacterId)return [];
 const retained=original.context.characterIds.filter(id=>id!==outgoingCharacterId);
 return ALTERNATIVE_TEAM_CONTEXTS.filter(c=>c.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY'&&c.anchorCharacterId===original.context.anchorCharacterId&&!c.characterIds.includes(outgoingCharacterId)&&retained.every(id=>c.characterIds.includes(id))).map(c=>({incomingCharacterId:c.characterIds.find(id=>!retained.includes(id))!,...describeTeamCompositionContext(c.id)!}));
}
