import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CHARACTER_CATALOG} from '../../../src/data/characters.ts';
import {CHARACTER_GUIDE_RECOMMENDATIONS,CHARACTER_EQUIPMENT_SOURCE_REVIEW} from '../../../src/data/characterEquipmentAssociations.ts';
import {ECHO_LOADOUT_PROFILES} from '../../../src/data/echoLoadoutProfiles.ts';
import {validateEchoLoadout} from '../../../src/loadoutValidator.ts';
import {validateEchoTemplateConfiguration} from '../../ui-prototypes/assets/echo-template-configuration.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const catalog=JSON.parse(read('../../ui-prototypes/assets/echoes/browser-data.json'));
const hash=s=>createHash('sha256').update(s).digest('hex');
// Explicit reviewed context classification, not keyword inference at runtime.
// These first options need a team/role/mode absent from the Lab. No next-option fallback.
const contextRequired={
  cantarella:'Havoc team',cartethyia:'Aero Main DPS / Aero Erosion application',
  chisa:'third-slot role / non-ATK team exclusion',ciaccona:'Aero Erosion support',
  denia:'Fusion Burst mode',jiyan:'Aero Erosion applier in team',qiuyuan:'Phrolova team or DPS Qiuyuan',
};
// Only these general profiles can be selected without assuming a team/mode.
// Others remain reviewed references; in particular Iuno and Aero Rover are NOT general defaults.
const generalProfiles=new Set(['augusta-standard-echoes','shorekeeper-rejuvenating-fallacy']);
function mainChoice(text,cost){
  if(!text)return {value:null,pending:'MAIN_STAT_SOURCE_MISSING'};
  const preferred=text.split(/>|≥/)[0].trim();
  if(/\/|=/.test(preferred))return {value:null,pending:'MAIN_STAT_ALTERNATIVES_REQUIRE_CHOICE'};
  const value=preferred.replace(/DMG%$/,'DMG');
  return catalog.statEditor.mainStatsByCostAndLevel[cost]?.['0']?.some(x=>x.name===value)?{value,pending:null}:{value:null,pending:'MAIN_STAT_CANONICAL_MAPPING_PENDING'};
}
const rows=CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED').map(character=>{
  const guide=CHARACTER_GUIDE_RECOMMENDATIONS.find(r=>r.characterId===character.id);
  if(!guide)throw Error('Missing reviewed guide: '+character.id);
  const primary=guide.echoSets.find(r=>r.usage==='PRIMARY'); // retained source display order, never numeric ranking
  const profiles=ECHO_LOADOUT_PROFILES.filter(p=>p.characterId===character.id&&p.verificationStatus==='VERIFIED');
  const profile=profiles.find(p=>generalProfiles.has(p.id));
  const pending=[];
  if(contextRequired[character.id])pending.push('MODE_OR_TEAM_CONTEXT_REQUIRED: '+contextRequired[character.id]);
  if(!primary)pending.push('PRIMARY_SET_MISSING');
  const setIds=profile?.sonataSetIds??(primary?[primary.setId]:[]);
  const mainEchoId=profile?.mainEchoId??(primary?.mainEchoes.length===1?primary.mainEchoes[0].echoId:null);
  // Profile Augusta explicitly retains 2P Void Thunder. Allocate its two filler
  // positions last; this is an example slot assignment, not a provider identity claim.
  const sets=profile?.id==='augusta-standard-echoes'?['sonata-20','sonata-20','sonata-20','sonata-3','sonata-3']:Array(5).fill(setIds[0]??null);
  if(!profile&&primary?.pieces===null)pending.push('SOURCE_PIECE_COUNT_NOT_CAPTURED: compatible same-set examples, no source 5P claim');
  const used=new Set();
  const slots=Array.from({length:5},(_,index)=>{
    const source=guide.mainStats.find(s=>s.slotOrder===index+1),rule=profile?.slots[index];
    const cost=rule?.cost??source?.cost;
    const top=rule?.primaryMainStats.filter(x=>x.priority===Math.min(...rule.primaryMainStats.map(r=>r.priority)));
    const choice=rule?(top.length===1?{value:top[0].stat,pending:null}:{value:null,pending:'MAIN_STAT_ALTERNATIVES_REQUIRE_CHOICE'}):mainChoice(source?.sourceText,cost);
    const issues=[];
    if(choice.pending)issues.push(choice.pending);
    if(contextRequired[character.id])issues.push('MODE_OR_TEAM_CONTEXT_REQUIRED');
    const setId=sets[index];
    const eligible=catalog.echoes.filter(e=>e.releaseStatus==='RELEASED'&&e.cost===cost&&e.sonataSetIds.includes(setId));
    let echo;
    if(index===0){echo=eligible.find(e=>e.id===mainEchoId);if(!echo)issues.push(mainEchoId?'SOURCE_MAIN_ECHO_COST_OR_SONATA_MISMATCH':'MAIN_ECHO_ALTERNATIVES_REQUIRE_CHOICE');}
    else echo=eligible.find(e=>!used.has(e.id))??eligible[0];
    if(!echo)issues.push('COMPATIBLE_CANONICAL_IDENTITY_UNAVAILABLE');
    if(echo)used.add(echo.id);
    let configuration=null;
    if(!issues.length){try{configuration=validateEchoTemplateConfiguration(catalog,{echoId:echo.id,cost,rank:catalog.statEditor.rank,mainStatName:choice.value,selectedSonataSetId:setId});}catch(error){issues.push('CANONICAL_VALIDATION: '+error.message);}}
    return {slot:index+1,cost,mainStat:choice.value,sourceMainStats:rule?.primaryMainStats??source,sonataSetId:setId,
      proposedEchoId:echo?.id??null,identityBasis:index===0?'SOURCE_MAIN_ECHO':'CANONICAL_COMPATIBLE_EXAMPLE',
      selectionRule:index===0?'Explicit source main Echo; unresolved alternatives stay Pending':'First unused released compatible identity in canonical catalog order; reuse only if pool exhausted; no provider species ranking',
      configuration,pending:issues};
  });
  const loadout=validateEchoLoadout(slots.flatMap(s=>s.configuration?[s.configuration]:[]));
  if(!loadout.valid)throw Error(character.id+': illegal generated loadout '+loadout.status);
  const complete=slots.every(s=>s.configuration);
  return {characterId:character.id,character:character.name,sourceId:profile?.id??'PRYDWEN:'+character.id,sourceKind:profile?'VERIFIED_GENERAL_PROFILE':'REVIEWED_GUIDE',
    sourceUrl:guide.sourceUrl,guideCapturedAt:guide.capturedAt,sourceLinesSha256:guide.sourceLinesSha256,
    context:{kind:contextRequired[character.id]?'REQUIRES_CONTEXT':'SOURCE_GENERAL_REFERENCE',required:contextRequired[character.id]??null,
      buildId:null,modeId:null,binding:'PENDING_VERIFIED_BUILD_MODE',conditions:profile?.provenance.notes??[primary?.conditionExcerpt],
      reviewedProfileReferences:profiles.map(p=>({id:p.id,selected:p.id===profile?.id,notes:p.provenance.notes}))},
    sourceSet:primary,sonataSetIds:setIds,sourceMainEchoId:mainEchoId,slots,
    complete,configurationValid:complete&&loadout.valid,configuredSlots:slots.filter(s=>s.configuration).length,
    pending:[...pending,...slots.flatMap(s=>s.pending.map(p=>`Slot ${s.slot}: ${p}`))],
    executionStatus:'PENDING',comparisonStatus:guide.comparisonStatus};
});
if(rows.length!==59)throw Error('Released identity count drift');
const output={schemaVersion:1,meaning:'SOURCE_BOUND_STARTING_TEMPLATES_NOT_DPS_OPTIMUM',
  sourceBindings:{guide:CHARACTER_EQUIPMENT_SOURCE_REVIEW.recommendationArtifactSha256,profiles:hash(read('../../../src/data/echoLoadoutProfiles.ts')),catalog:hash(JSON.stringify(catalog))},
  summary:{characters:rows.length,complete:rows.filter(r=>r.complete).length,partial:rows.filter(r=>r.configuredSlots>0&&!r.complete).length,empty:rows.filter(r=>!r.configuredSlots).length},characters:rows};
const json=JSON.stringify(output,null,2)+'\n';
const markdown='# Character starting-template coverage\n\nGenerated by `node docs/ui-lab/tools/export-loadouts.mjs`; source-owned order is preserved. “Valid” means five legal template choices, never execution/DPS readiness. Unresolved Main Stat alternatives are not silently selected. The Lab has no verified live Build/mode/team binding. Source conditions, original Main Stat alternatives and exact provenance are retained in [machine-readable coverage](v1.1/modules/default-loadouts.json). Filler identities are canonical compatible examples, not provider recommendations.\n\n'+
`59 released Characters: **${output.summary.complete} complete / ${output.summary.partial} partial / ${output.summary.empty} context-blocked or empty**.\n\n`+
'| Character | Source / context | Sonata / source Main Echo | Five Cost/Main positions → exact identity (S=source, E=example) | Valid five slots | Pending |\n| --- | --- | --- | --- | --- | --- |\n'+rows.map(r=>`| ${r.character} | ${r.sourceId} / ${r.context.required??r.context.kind} | ${r.sonataSetIds.join(', ')} / ${r.sourceMainEchoId??'Pending'} | ${r.slots.map(s=>`${s.cost}/${s.mainStat??'Pending'} → ${s.configuration?.echoId??'Pending'} (${s.identityBasis==='SOURCE_MAIN_ECHO'?'S':'E'})`).join('<br>')} | ${r.configurationValid?'Yes':'No'} | ${r.pending.join('; ')||'Build/mode/execution binding Pending'} |`).join('\n')+'\n';
for(const [path,content] of [['../v1.1/modules/default-loadouts.json',json],['../DEFAULT_LOADOUT_COVERAGE.md',markdown]]){
 const url=new URL(path,import.meta.url);
 if(process.argv.includes('--check')){if(readFileSync(url,'utf8')!==content)throw Error('Default loadout projection stale: '+path);}else writeFileSync(url,content);
}
console.log('Source-bound default coverage',output.summary);
