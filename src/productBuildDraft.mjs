import {resolveBuildInvestmentDefaults,resolveEchoInvestment} from './buildInvestmentDefaults.mjs';
import {normalizeForteState} from './characterForteUi.mjs';
import {validateAccount,safeDocument} from './inventoryAccount.mjs';

export function productDraftFromScan(scan,catalog,tree) {
 safeDocument(scan);
 if(!catalog.characters.some(c=>c.id===scan.character?.id)||!Array.isArray(scan.echoes)||scan.echoes.length!==5)throw Error('Recognition did not establish a supported Character and five Echo slots.');
 const levels={'normal-attack':scan.skills?.basic,skill:scan.skills?.skill,circuit:scan.skills?.circuit,intro:scan.skills?.intro,liberation:scan.skills?.liberation};
 const forte=normalizeForteState(tree??{nodes:[]},{schemaVersion:1,levels,enabled:{}});
 return {characterId:scan.character.id,characterLevel:scan.character.level??null,sequence:scan.sequence??null,
  weaponId:scan.weapon?.id??null,weaponLevel:scan.weapon?.level??null,weaponRank:scan.weapon?.refinement??null,weaponInstanceId:crypto.randomUUID(),
  forte:normalizeForteState(tree??{nodes:[]},{...forte,enabled:normalizeForteState(tree??{nodes:[]},null).enabled}),importForte:structuredClone(forte),
  assumedBuildFacts:[...(scan.weapon?.refinement==null?['Weapon rank defaults to R1']:[]),'Minor Forte defaults to unlocked'],
  importObservation:structuredClone(scan),
  echoes:scan.echoes.map(e=>!catalog.echoes.some(identity=>identity.id===e?.echoId)?null:({instanceId:crypto.randomUUID(),speciesId:e.echoId,cost:e.cost,rank:e.rank??(e.level===25||e.substats?.length===5?5:null),level:e.level??(e.substats?.length===5&&(e.rank==null||e.rank===5)?25:null),
   selectedSonataSetId:e.sonataId,mainStat:structuredClone(e.mainStat),secondaryMainStat:structuredClone(e.secondaryMainStat),substats:structuredClone(e.substats??[]),evidence:structuredClone(e.evidence??null)}))};
}

export function scanFromProductDraft(draft) {
 const original=structuredClone(draft.importObservation);
 const skill=(key,role)=>draft.forte.levels[role]===draft.importForte?.levels[role]?original.skills?.[key]??null:draft.forte.levels[role];
 return {...original,character:{...original.character,id:draft.characterId,level:draft.characterLevel},sequence:draft.sequence,
  weapon:{...original.weapon,id:draft.weaponId,level:draft.weaponLevel,refinement:draft.weaponRank},
  skills:{basic:skill('basic','normal-attack'),skill:skill('skill','skill'),circuit:skill('circuit','circuit'),intro:skill('intro','intro'),liberation:skill('liberation','liberation')},
  echoes:draft.echoes.map(e=>e?{echoId:e.speciesId,sonataId:e.selectedSonataSetId,cost:e.cost,rank:e.rank,level:e.level,mainStat:e.mainStat,secondaryMainStat:e.secondaryMainStat,substats:e.substats,evidence:e.evidence}:null)};
}

// The accepted editor owns only these visible build fields. Other records,
// inactive sets, user settings, physical items and scan evidence remain owned
// by the existing account and are copied through unchanged.
export function productDraftFromAccount(account, characterId, tree) {
 const person=account.characters[characterId], record=person?.record??account.unownedDrafts?.[characterId]?.record;
 if(!record) return null;
 const raw=record.build, weapon=account.items[raw.weaponInstanceId];
 const b=resolveBuildInvestmentDefaults({...raw,weaponId:weapon?.catalogId,weaponLevel:weapon?.data&&Object.hasOwn(weapon.data,'level')?weapon.data.level:raw.weaponLevel,weaponRefinement:weapon?.data.refinement},tree);
 const slots=b.echoSets?.sets?.[b.echoSets.activeSetId]?.slots??Array(5).fill(null);
 return {characterId,characterLevel:b.characterLevel??null,weaponLevel:b.weaponLevel??null,sequence:b.sequenceLevel??null,weaponId:weapon?.catalogId??null,
  weaponRank:b.weaponRefinement??null,weaponInstanceId:weapon?.id??null,
  assumedBuildFacts:b.assumedBuildFacts,
  forte:normalizeForteState(tree??{nodes:[]},b.forte??{schemaVersion:1,levels:{},enabled:{}}),
  echoes:slots.map(id=>{if(!id)return null;const item=account.items[id];return {instanceId:item.id,speciesId:item.catalogId,...resolveEchoInvestment(item.data)};})};
}
export function applyProductDraft(account,draft,catalog) {
 const next=structuredClone(account), source=catalog.characters.find(c=>c.id===draft.characterId);
 if(!source)throw Error('Unknown Character.');
 const previous=next.characters[source.id], record=structuredClone(previous?.record??next.unownedDrafts?.[source.id]?.record??{character:source.name,build:{characterLevel:90}});
 const b=record.build;
 const put=(id,kind,catalogId,data)=>{
  if(!id)throw Error('Physical identity is required.');
  const old=next.items[id];
  if(old&&(old.kind!==kind||old.catalogId!==catalogId))throw Error('Physical identity cannot change species.');
  next.items[id]={...(old??{}),id,kind,catalogId,data:{...(old?.data??{}),...structuredClone(data)},provenance:old?.provenance??{kind:'MANUAL_BUILD'}};
  if(draft.importObservation&&!old)next.items[id].provenance={kind:'REVIEWED_DISCORD_CARD',evidence:kind==='weapon'?structuredClone(draft.importObservation.weapon?.evidence??null):{originalObservation:structuredClone(draft.importObservation.echoes[draft.echoes.findIndex(e=>e?.instanceId===id)])}};
  return id;
 };
 if((previous||next.unownedDrafts?.[source.id])&&b.forte?.schemaVersion!==1)b.minorForteUnknown=true;
 b.sequenceLevel=draft.sequence;b.forte=structuredClone(draft.forte);
 if(draft.importObservation){b.characterLevel=draft.characterLevel;b.minorForteUnknown=!draft.assumedBuildFacts?.includes('Minor Forte defaults to unlocked');b.importObservation=structuredClone(draft.importObservation);b.observedSkills=scanFromProductDraft(draft).skills;}
 if(draft.assumedBuildFacts){b.assumedBuildFacts=structuredClone(draft.assumedBuildFacts);if(draft.assumedBuildFacts.includes('Minor Forte defaults to unlocked'))b.minorForteUnknown=false;}
 b.weaponInstanceId=draft.weaponId?put(draft.weaponInstanceId,'weapon',draft.weaponId,{level:Object.hasOwn(draft,'weaponLevel')?draft.weaponLevel:next.items[draft.weaponInstanceId]?next.items[draft.weaponInstanceId].data.level:90,refinement:draft.weaponRank}):null;
 const slots=draft.echoes.map(e=>e?put(e.instanceId,'echo',e.speciesId,{cost:e.cost,rank:e.rank,level:e.level,selectedSonataSetId:e.selectedSonataSetId,mainStat:e.mainStat,secondaryMainStat:e.secondaryMainStat,substats:e.substats}):null);
 b.echoSets??={schemaVersion:1,activeSetId:'set-1',defaultSetId:'set-1',sets:{}};
 const active=b.echoSets.activeSetId;
 b.echoSets.sets[active]={...(b.echoSets.sets[active]??{id:active,name:'Build'}),slots};
 next.characters[source.id]={...(previous??{}),id:source.id,name:source.name,owned:true,record};
 if(next.unownedDrafts)delete next.unownedDrafts[source.id];
 return validateAccount(next,catalog);
}



// The Character Builder owns one Current Build per saved Character. Internally
// its equipped items still have stable IDs: same species/slot corrections keep
// their IDs; changing species may allocate a new ID while old items remain.
// Moving an existing physical ID releases its former active owner safely.
export function applyOwnedProductDraft(account,draft,catalog) {
 const ids=[...(draft.weaponId?[draft.weaponInstanceId]:[]),...draft.echoes.filter(Boolean).map(e=>e.instanceId)];
 if(ids.some(id=>typeof id!=='string'||!id)||new Set(ids).size!==ids.length)throw Error('Physical item ID is missing or duplicated.');
 const adjusted=structuredClone(account);
 for(const [characterId,character] of Object.entries(adjusted.characters)){
  if(characterId===draft.characterId)continue;
  const build=character.record.build;
  if(ids.includes(build.weaponInstanceId))build.weaponInstanceId=null;
  if(build.echoSets){
   const active=build.echoSets.sets[build.echoSets.activeSetId];
   if(active)active.slots=active.slots.map(id=>ids.includes(id)?null:id);
  }
 }
 return applyProductDraft(adjusted,draft,catalog);
}

// Display calculations only when the saved observation establishes the actual
// investments supported by the current static projector. Missing is not zero.
export function productInvestmentPending(account, characterId, tree) {
 const raw=account.characters[characterId]?.record?.build;
 if(!raw)return false;
 const weapon=account.items[raw.weaponInstanceId];
 const b=resolveBuildInvestmentDefaults({...raw,weaponId:weapon?.catalogId,weaponLevel:weapon?.data&&Object.hasOwn(weapon.data,'level')?weapon.data.level:raw.weaponLevel,weaponRefinement:weapon?.data.refinement},tree);
 return b.characterLevel!==90||b.forte?.schemaVersion!==1||b.minorForteUnknown===true||b.sequenceLevel==null||
  (!!b.weaponInstanceId&&(weapon?.data.level!==90||b.weaponRefinement==null));
}


// Material saved-build intent only. Recovery evidence and property order do not
// constitute an equipment or investment change. Physical identity is retained.
export function productDraftBuildIdentity(draft){
 if(!draft)return null;
 const row=r=>r?{name:r.name,value:r.value}:null;
 const clean={characterId:draft.characterId,characterLevel:Object.hasOwn(draft,'characterLevel')?draft.characterLevel:90,sequence:draft.sequence,
  weaponId:draft.weaponId??null,weaponInstanceId:draft.weaponId?draft.weaponInstanceId:null,weaponLevel:draft.weaponId?(Object.hasOwn(draft,'weaponLevel')?draft.weaponLevel:90):null,weaponRank:draft.weaponId?draft.weaponRank:null,
  forte:draft.forte,echoes:draft.echoes.map(e=>e?{instanceId:e.instanceId,speciesId:e.speciesId,cost:e.cost,rank:e.rank,level:e.level,selectedSonataSetId:e.selectedSonataSetId,mainStat:row(e.mainStat),secondaryMainStat:row(e.secondaryMainStat),substats:e.substats.map(row)}:null)};
 const stable=value=>Array.isArray(value)?'['+value.map(stable).join(',')+']':value&&typeof value==='object'?'{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+stable(value[key])).join(',')+'}':JSON.stringify(value);
 return stable(clean);
}


// Recover the legacy adapter's missing level only from the same physical weapon.
// An imported unknown remains unknown; no level is inferred from its catalog ID.
export function restoreKnownDraftWeaponLevel(draft,account){
 if(!draft||draft.weaponLevel!=null||draft.importObservation)return draft;
 const item=account.items?.[draft.weaponInstanceId];
 if(item?.kind!=='weapon'||item.catalogId!==draft.weaponId||!Number.isInteger(item.data?.level)||item.data.level<1||item.data.level>90)return draft;
 return {...draft,weaponLevel:item.data.level};
}
