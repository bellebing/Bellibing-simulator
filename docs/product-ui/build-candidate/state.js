import {normalizeForteState,assertEchoStatsEditorSelection,emptyAccount,validateAccount,safeDocument,projectStaticBuildStats,forteStats,activeSequenceBuildStats,WEAPON_EFFECT_CATALOG} from './models-entry.js';
export const STORAGE_KEY='bellibing.build-candidate.review.v1';
const clone=structuredClone;
const assert=(yes,message)=>{if(!yes)throw Error(message);};
export function freshDraft(id,tree){return {characterId:id,sequence:0,weaponId:null,weaponRank:1,weaponInstanceId:null,forte:normalizeForteState(tree??{nodes:[]},null),echoes:Array(5).fill(null)};}
export function accountWithDraft(account,draft,catalog){
 const next=clone(account),character=catalog.characters.find(c=>c.id===draft.characterId);
 assert(character,'Unknown Character.');
 let weaponId=null;
 if(draft.weaponId){weaponId=draft.weaponInstanceId;assert(weaponId,'Weapon identity is missing.');next.items[weaponId]={id:weaponId,kind:'weapon',catalogId:draft.weaponId,data:{level:90,refinement:draft.weaponRank},provenance:{kind:'MANUAL_BUILD_CANDIDATE'}};}
 const slots=draft.echoes.map(e=>{if(!e)return null;const key=e.instanceId;assert(typeof key==='string','Echo instance identity is missing.');next.items[key]={id:key,kind:'echo',catalogId:e.speciesId,data:{cost:e.cost,rank:e.rank,level:e.level,selectedSonataSetId:e.selectedSonataSetId,mainStat:clone(e.mainStat),secondaryMainStat:clone(e.secondaryMainStat),substats:clone(e.substats)},provenance:{kind:'MANUAL_BUILD_CANDIDATE'}};return key;});
 const previous=next.characters[character.id];
 next.characters[character.id]={id:character.id,name:character.name,owned:true,revision:(previous?.revision??0)+1,record:{character:character.name,build:{characterLevel:90,sequenceLevel:draft.sequence,forte:clone(draft.forte),weaponInstanceId:weaponId,echoSets:{schemaVersion:1,activeSetId:'set-1',defaultSetId:'set-1',sets:{'set-1':{id:'set-1',name:'Build',slots}}}}}};
 next.revision++;return validateAccount(next,catalog);
}
export function validateDraft(draft,catalog,trees){
 assert(draft&&catalog.characters.some(c=>c.id===draft.characterId),'Unknown draft Character.');
 // Imported Characters can have an unknown (null) Sequence; preserve that
 // observation until the user explicitly selects S0–S6. Never infer S0.
 assert(draft.sequence==null||(Number.isInteger(draft.sequence)&&draft.sequence>=0&&draft.sequence<=6),'Invalid Sequence.');
 // No equipped Weapon has no refinement: never invent an owned Weapon rank.
 assert((!draft.weaponId&&draft.weaponRank==null)||(Number.isInteger(draft.weaponRank)&&draft.weaponRank>=1&&draft.weaponRank<=5),'Invalid Weapon rank.');
 assert(Array.isArray(draft.echoes)&&draft.echoes.length===5,'Five Echo slots are required.');
 const tree=trees.find(t=>t.characterId===draft.characterId)??{nodes:[]};
 const normalized=normalizeForteState(tree,draft.forte);
 assert(JSON.stringify(normalized)===JSON.stringify(draft.forte),'Invalid Skills state or prerequisites.');
 for(const e of draft.echoes){if(!e)continue;const source=catalog.echoes.find(row=>row.id===e.speciesId);assert(source&&source.cost===e.cost,'Echo identity mismatch.');assertEchoStatsEditorSelection(e);assert(source.sonataSetIds.includes(e.selectedSonataSetId),'Incompatible Sonata assignment.');}
 // Reuse the account's ownership, duplicate-species, weapon-type and cost rules.
 accountWithDraft(emptyAccount(),draft,catalog);return draft;
}
export function createReviewStore(storage,catalog,trees){
 let serialized=storage.getItem(STORAGE_KEY),state;
 if(serialized!==null){state=safeDocument(JSON.parse(serialized));check(state);}
 else state={schemaVersion:1,revision:0,selected:'augusta',drafts:{},savedDrafts:{},account:emptyAccount()};
 function check(value){assert(value?.schemaVersion===1&&Number.isSafeInteger(value.revision)&&value.revision>=0&&value.drafts&&value.savedDrafts,'Unsupported review data.');assert(catalog.characters.some(c=>c.id===value.selected),'Unknown selected Character.');validateAccount(value.account,catalog);for(const [id,draft]of Object.entries(value.drafts)){assert(id===draft.characterId,'Character draft isolation mismatch.');validateDraft(draft,catalog,trees);}for(const [id,draft]of Object.entries(value.savedDrafts)){assert(id===draft.characterId,'Saved Character mismatch.');validateDraft(draft,catalog,trees);}}
 return {snapshot:()=>clone(state),commit(next){check(next);assert(storage.getItem(STORAGE_KEY)===serialized,'This review draft changed in another tab. Reload before editing.');const candidate={...clone(next),revision:state.revision+1},bytes=JSON.stringify(candidate);storage.setItem(STORAGE_KEY,bytes);serialized=bytes;state=candidate;return clone(state);},restore(value){check(value);return this.commit(value);},raw:()=>serialized};
}
export function projectDraftStats(draft,{facts,weapons,echoes,trees,sequences}){
 const character=facts.characters.find(c=>c.id===draft.characterId),weapon=weapons.weapons.find(w=>w.id===draft.weaponId)??null;
 const tree=trees.find(t=>t.characterId===draft.characterId)??{nodes:[]};
 const sequence=sequences.find(s=>s.characterId===draft.characterId);
 if(draft.sequence>0&&(!sequence||sequence.chains.some(c=>c.sequence<=draft.sequence&&c.buildStatClassification==='PENDING')))throw Error('Sequence stats pending source verification.');
 const activeWeaponStats=(weapon?.staticBuildStats??[]).map(s=>{const effect=WEAPON_EFFECT_CATALOG.find(e=>e.effectId===s.sourceWeaponEffect.effectId&&e.weaponId===weapon.id);assert(effect&&Number.isFinite(effect.rankValues[draft.weaponRank-1]),'Weapon effect rank pending.');return {stat:s.stat,value:effect.rankValues[draft.weaponRank-1]};});
 return projectStaticBuildStats({character,weapon,echoSlots:draft.echoes,echoStatContract:echoes.statEditor,activeForteStats:forteStats(tree,draft.forte),activeSequenceStats:sequence?activeSequenceBuildStats(sequence,draft.sequence):[],activeWeaponStats});
}

