import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CHARACTER_CATALOG} from '../../../src/data/characters.ts';
import {WEAPON_CATALOG} from '../../../src/data/weapons.ts';
import {CHARACTER_SIGNATURE_ASSOCIATIONS,CHARACTER_GUIDE_RECOMMENDATIONS,CHARACTER_EQUIPMENT_SOURCE_REVIEW} from '../../../src/data/characterEquipmentAssociations.ts';
import {ECHO_LOADOUT_PROFILES} from '../../../src/data/echoLoadoutProfiles.ts';
import {validateEchoLoadout} from '../../../src/loadoutValidator.ts';
import {inspectSandboxSonata,SANDBOX_SONATA_REVIEW} from '../../../src/sandboxSonata.mjs';
import {normalizeForteState} from '../../../src/characterForteUi.mjs';
import {CHARACTER_CATALOG as presentation} from '../v1.1/modules/catalog.js';
import {validateEchoTemplateConfiguration} from '../../ui-prototypes/assets/echo-template-configuration.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const catalog=JSON.parse(read('../../ui-prototypes/assets/echoes/browser-data.json'));
const releaseFacts=JSON.parse(read('../../../data/source/character-release-3.7.json'));
const hash=s=>createHash('sha256').update(s).digest('hex');
const policy={id:'SANDBOX_STANDARD_V1',
 mainStats:'Prefer source-ranked tier, then first written tied/slash alternative. Preserve all original alternatives. This is a Sandbox convention, not a guide ranking.',
 sets:'First source PRIMARY option with a complete compatible shell. Use canonical highest piece threshold; source COMPANION_OPTION rows supply remaining groups, in source order. Source-compatible filler species are first unused canonical identities, never a species recommendation.',
 mainEcho:'First compatible source main Echo. If it has Cost 3, move the first source Cost-3/Main pair to slot 1 and move the source Cost-4 pair to its vacated position. Preserve all five source Cost/Main pairs.',
 profiles:'Augusta and Cartethyia use their reviewed exact shells. Other Characters use their own first feasible guide shell with its original conditions explicitly retained.',
 baseline:'Lv90 Character / Lv90 Weapon / S0 / R1 / max canonical Forte nodes; templates have no rolls. No uptime, team or source-optimum claim.'};
function forteBaseline(character,person){
 if(person?.forte?.nodes?.length)return normalizeForteState(person.forte,null);
 // Same five-skill roles as characterForteUi, checked against the original
 // released tree and MaxSkillLevel. Missing presentation art is not missing data.
 const raw=releaseFacts.characters.find(c=>c.characterId===character.id);
 const roles={1:['normal-attack',1],2:['skill',2],3:['liberation',3],6:['intro',5],7:['circuit',6]};
 if(!raw||raw.tree.length!==17)throw Error('SOURCE_FORTE_TREE_PENDING');
 const nodes=raw.tree.filter(n=>n.NodeIndex!==17).map(n=>{
  const role=roles[n.NodeIndex];
  if(role){const skill=raw.skills.find(s=>s.source.Id===n.SkillId)?.source;if(!skill||skill.SkillType!==role[1]||skill.MaxSkillLevel!==10)throw Error('SOURCE_FORTE_SKILL_PENDING');}
  return {id:String(n.NodeIndex),parents:n.ParentNodes.map(String),kind:role?'skill':n.NodeIndex===8?'outro':n.NodeType===4?'stat':'inherent',role:role?.[0]??null};
 });
 return normalizeForteState({nodes},null);
}
function mainStat(source,cost){
 const first=source?.split(/>|≥/)[0].trim().split(/\/|=/)[0].trim().replace(/DMG%$/,'DMG');
 if(!catalog.statEditor.mainStatsByCostAndLevel[cost]?.['0']?.some(r=>r.name===first))throw Error('SOURCE_MAIN_STAT_MAPPING_PENDING');
 return first;
}
function allocate(character,guide,primary,profile){
 const pairs=profile?profile.slots.map(s=>({cost:s.cost,mainStatName:[...s.primaryMainStats].sort((a,b)=>a.priority-b.priority)[0].stat,alternatives:s.primaryMainStats})):guide.mainStats.map(s=>({cost:s.cost,mainStatName:mainStat(s.sourceText,s.cost),alternatives:s}));
 if(pairs.length!==5)throw Error('FIVE_SOURCE_MAIN_PAIRS_REQUIRED');
 const sourceMain=profile?[{echoId:profile.mainEchoId}]:primary.mainEchoes;
 const mains=sourceMain.map(r=>catalog.echoes.find(e=>e.id===r.echoId&&e.releaseStatus==='RELEASED'&&e.sonataSetIds.includes(primary.setId))).filter(Boolean);
 if(!mains.length)throw Error('SOURCE_MAIN_ECHO_MEMBERSHIP_PENDING');
 const target=catalog.sonataSets.find(s=>s.id===primary.setId),count=Math.max(...target.activationPieces);
 const companions=guide.echoSets.filter(s=>s.usage==='COMPANION_OPTION'&&s.companionToOrder===primary.sourceOrder&&s.pieces&&s.setId!==primary.setId);
 let compositions;
 if(character.id==='augusta')compositions=[['sonata-20','sonata-20','sonata-20','sonata-3','sonata-3']];
 else if(count===5)compositions=[Array(5).fill(primary.setId)];
 else if(count===3)compositions=companions.filter(c=>c.pieces===2).map(c=>[primary.setId,primary.setId,primary.setId,c.setId,c.setId]);
 else if(count===1)compositions=companions.flatMap((a,i)=>companions.slice(i+1).filter(b=>a.pieces===2&&b.pieces===2&&a.setId!==b.setId).map(b=>[primary.setId,a.setId,a.setId,b.setId,b.setId]));
 else throw Error('SOURCE_COMPOSITION_NOT_SUPPORTED');
 if(!compositions.length)throw Error('SOURCE_COMPANION_COMPOSITION_MISSING');
 for(const main of mains){
  const layout=structuredClone(pairs),pos=layout.findIndex(p=>p.cost===main.cost);
  if(pos<0)continue;
  [layout[0],layout[pos]]=[layout[pos],layout[0]];
  for(const sets of compositions){
   const used=new Set(),slots=[];
   for(let i=0;i<5;i++){
    const pair=layout[i],eligible=catalog.echoes.filter(e=>e.releaseStatus==='RELEASED'&&e.cost===pair.cost&&e.sonataSetIds.includes(sets[i])&&!used.has(e.id));
    const echo=i===0?eligible.find(e=>e.id===main.id):eligible[0];if(!echo)break;used.add(echo.id);
    const configuration=validateEchoTemplateConfiguration(catalog,{echoId:echo.id,cost:echo.cost,rank:5,mainStatName:pair.mainStatName,selectedSonataSetId:sets[i]});
    slots.push({slot:i+1,configuration,identityBasis:i===0?'SOURCE_MAIN_ECHO':'SANDBOX_STANDARD_COMPATIBLE_SPECIES',originalMainChoices:pair.alternatives});
   }
   if(slots.length!==5)continue;
   const loadout=validateEchoLoadout(slots.map(s=>s.configuration));if(!loadout.valid)continue;
   const composition=inspectSandboxSonata(slots.map(s=>s.configuration),catalog);
   if(composition.some(c=>!c.eligiblePieceBonuses.length))continue;
   return {slots,composition,loadout};
  }
 }
 throw Error('COMPATIBLE_DISTINCT_SPECIES_SHELL_UNAVAILABLE');
}
const rows=CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED').map(character=>{
 const guide=CHARACTER_GUIDE_RECOMMENDATIONS.find(g=>g.characterId===character.id),signature=CHARACTER_SIGNATURE_ASSOCIATIONS.find(s=>s.characterId===character.id);
 if(!guide||!signature)throw Error('Reviewed source coverage missing: '+character.id);
 const weaponSource=signature.status==='VERIFIED_SIGNATURE'?null:guide.weapons.find(w=>WEAPON_CATALOG.some(c=>c.id===w.weaponId&&c.releaseStatus==='RELEASED'&&c.weaponType===character.weaponType));
 const weaponId=signature.status==='VERIFIED_SIGNATURE'?signature.weaponId:weaponSource?.weaponId;
 const weapon=WEAPON_CATALOG.find(w=>w.id===weaponId&&w.releaseStatus==='RELEASED'&&w.weaponType===character.weaponType);
 const unresolved=[],attempts=[];
 if(!weapon||!Number.isFinite(weapon.level90BaseAtk))unresolved.push('CANONICAL_WEAPON_BASELINE_PENDING');
 const profile=ECHO_LOADOUT_PROFILES.find(p=>p.characterId===character.id&&['augusta-standard-echoes','cartethyia-windward-fleurdelys'].includes(p.id)&&p.verificationStatus==='VERIFIED');
 let selected=null,selection=null;
 for(const primary of guide.echoSets.filter(s=>s.usage==='PRIMARY')){
  try{selected=allocate(character,guide,primary,profile);selection=primary;break;}catch(e){attempts.push({sourceOrder:primary.sourceOrder,setId:primary.setId,reason:e.message});}
 }
 if(!selected)unresolved.push('ECHO_SHELL_PENDING');
 const person=presentation.find(p=>p.id===character.id),forte=forteBaseline(character,person);
 if(!forte)unresolved.push('FORTE_PRESENTATION_BASELINE_PENDING');
 const level90=character.level90;
 if(!level90||!['hp','atk','def'].every(k=>Number.isFinite(level90[k])))unresolved.push('CHARACTER_LV90_SOURCE_PENDING');
 return {characterId:character.id,character:character.name,kind:'SANDBOX_BUILD',presetId:'sandbox-standard:'+character.id,
  configurationValidity:unresolved.length?'PENDING':'VALID',simulationReadiness:'PENDING_PRIVATE_EXECUTION',dprReadiness:'PENDING_MATCHED_PROVIDER_CONTEXT',dpsReadiness:'PENDING_VERIFIED_TEAM_EXECUTION',
  baseline:{characterLevel:90,weaponLevel:90,sequenceLevel:0,weaponRefinement:1,forte,fortePresentationStatus:person?.forte?.nodes?.length?'AVAILABLE':'PENDING_ART_AND_TREE_PRESENTATION',selectedContext:{kind:'EXPLICIT_SANDBOX_SOURCE_CONTEXT',sourceOrder:selection?.sourceOrder??null,conditions:profile?.provenance.notes??[selection?.conditionExcerpt].filter(Boolean),binding:'REFERENCE_CONTEXT_NOT_EXECUTED_TEAM'}},
  weapon:weapon?{weaponId:weapon.id,weaponType:weapon.weaponType,level:90,refinement:1,basis:signature.status==='VERIFIED_SIGNATURE'?'SIGNATURE':'REVIEWED_ALTERNATIVE',standard:'SANDBOX_STANDARD',signatureStatus:signature.status,source:weaponSource??signature,provenance:weapon.provenance}:null,
  sourceId:profile?.id??'PRYDWEN:'+character.id,sourceUrl:guide.sourceUrl,sourceLinesSha256:guide.sourceLinesSha256,capturedAt:guide.capturedAt,
  sourceRevision:CHARACTER_EQUIPMENT_SOURCE_REVIEW.recommendationArtifactSha256,characterSource:character.provenance,
  sonataSetIds:selected?[...new Set(selected.slots.map(s=>s.configuration.selectedSonataSetId))]:[],
  slots:selected?.slots??[],composition:selected?.composition??[],sourceAlternatives:guide.echoSets,sourceMainStats:guide.mainStats,weaponAlternatives:guide.weapons,
  verifiedActivationConditions:(selected?.composition??[]).map(c=>{const set=catalog.sonataSets.find(s=>s.id===c.setId);return {setId:set.id,canonicalThresholds:set.activationPieces,sourceReviewedSections:set.sections,contextExecution:'PENDING_TRIGGER_UPTIME_AND_COMBAT_ADAPTER'};}),
  pendingDimensions:['PRIVATE_EXECUTION_NOT_CONNECTED','DPR_MATCHED_CONTEXT_NOT_VERIFIED','DPS_TEAM_RUN_NOT_VERIFIED',...(character.id==='augusta'?[]:['REVIEWED_ECHO_SETTINGS_REQUIREMENTS_PENDING']),...(person?.forte?.nodes?.length?[]:['FORTE_ART_AND_TREE_PRESENTATION_PENDING'])],
  rejectedSourceShells:attempts,unresolved,settingsStatus:character.id==='augusta'?'USER_APPROVED_CANONICAL_DEFAULT':'PENDING_REVIEWED_ECHO_REQUIREMENTS',
  validEchoConfiguration:!!selected,validWeaponConfiguration:!!weapon};
});
const output={schemaVersion:1,kind:'SANDBOX_STANDARD_COVERAGE',policy,sonataReview:SANDBOX_SONATA_REVIEW,
 weapons:WEAPON_CATALOG.filter(w=>w.releaseStatus==='RELEASED').map(w=>({id:w.id,name:w.name,weaponType:w.weaponType,level90BaseAtk:w.level90BaseAtk})),
 sourceBindings:Object.fromEntries(['../../../src/data/characters.ts','../../../src/data/weapons.ts','../../../src/data/characterEquipmentAssociations.ts','../../../src/data/echoLoadoutProfiles.ts','../../../data/source/character-release-3.7.json','../../ui-prototypes/assets/echoes/browser-data.json'].map(p=>[p,hash(read(p))])),
 summary:{released:rows.length,valid:rows.filter(r=>r.configurationValidity==='VALID').length,echoComplete:rows.filter(r=>r.validEchoConfiguration).length,weaponComplete:rows.filter(r=>r.validWeaponConfiguration).length,pending:rows.filter(r=>r.unresolved.length).length},characters:rows};
if(rows.length!==59)throw Error('Released catalog drift: review Sandbox coverage gate');
const md='# Sandbox standard-build coverage\n\nGenerated from canonical sources by `node docs/ui-lab/tools/export-sandbox.mjs`. See [full machine-readable matrix](v1.1/modules/sandbox-defaults.json) for exact five templates, original alternatives, source hashes/URLs, context conditions, baseline, signature/alternative evidence and independent readiness.\n\n'+
 `**${output.summary.valid}/59 valid standard builds; ${output.summary.echoComplete}/59 complete Echo shells; ${output.summary.weaponComplete}/59 canonical Weapons.** This is configuration coverage, not private simulation, DPR or DPS readiness. These generated source-only rows do not qualify a runtime provider; their Pending fields are separate from the connected host's versioned capabilities. See the [current roadmap](../SANDBOX_SIMULATOR_ROADMAP.md). Missing reviewed non-Augusta Echo requirements remain Pending separately from template validity (BUG-042).\n\n`+
 Object.entries(policy).map(([k,v])=>`- **${k}:** ${v}`).join('\n')+'\n\nSet counts mean distinct species eligible for canonical piece thresholds, not verified trigger/uptime or combat execution. No duplicate species fillers are used. No substats/rolls or team results are invented.\n\n| Character / selected context | Weapon / basis | Five Echo templates (Cost · Main · Sonata) | Set pieces (distinct) | Valid / unresolved | Simulation / DPR / DPS |\n| --- | --- | --- | --- | --- | --- |\n'+rows.map(r=>`| ${r.character} / ${r.presetId} | ${r.weapon?.weaponId??'Pending'} / ${r.weapon?.basis??'PENDING'} | ${r.slots.map(s=>`${s.configuration.echoId}: ${s.configuration.cost} · ${s.configuration.mainStatName} · ${s.configuration.selectedSonataSetId}`).join('<br>')} | ${r.composition.map(s=>`${s.setId}: ${s.distinctCount} (${s.eligiblePieceBonuses.join('/')})`).join('; ')} | ${r.configurationValidity}: ${r.unresolved.join('; ')||'—'} | Pending / Pending / Pending |`).join('\n')+'\n';
for(const [path,value]of[['../v1.1/modules/sandbox-defaults.json',JSON.stringify(output,null,2)+'\n'],['../SANDBOX_COVERAGE.md',md]]){const url=new URL(path,import.meta.url);if(process.argv.includes('--check')){if(readFileSync(url,'utf8')!==value)throw Error('Sandbox parity stale: '+path);}else writeFileSync(url,value);}
console.log('Sandbox coverage',output.summary);for(const r of rows.filter(r=>r.unresolved.length))console.log(r.characterId,r.unresolved,r.rejectedSourceShells);
