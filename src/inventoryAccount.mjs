// Public ownership/validation only. No RNG, DPS or private recommendation policy.
export const ACCOUNT_SCHEMA=1;
export const LEGACY_BUILD_KEY='bellibing-ui-checkpoint-v34';
export const BACKUP_FORMAT='bellibing-inventory';
export const RECOVERY_KEYS=[LEGACY_BUILD_KEY,'bellibing.improve.policy.v3','bellibing.improve.simple-settings.v2'];
const copy=structuredClone;
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const assert=(condition,message)=>{if(!condition)throw Error(message);};
export function safeDocument(value){
 let nodes=0;
 function visit(v,depth=0){
  assert(++nodes<150000&&depth<35,'Document is too complex.');
  if(typeof v==='number')assert(Number.isFinite(v),'Non-finite value.');
  if(v&&typeof v==='object')for(const [key,item]of Object.entries(v)){
   assert(!['__proto__','prototype','constructor'].includes(key),'Unsafe document field.');visit(item,depth+1);
  }
 }
 visit(value);return value;
}
export function readJson(text){assert(typeof text==='string'&&new TextEncoder().encode(text).length<=5*1024*1024,'Backup must be at most 5 MiB.');return safeDocument(JSON.parse(text));}
const id=()=>crypto.randomUUID();
export function emptyAccount(){return {schemaVersion:ACCOUNT_SCHEMA,id:id(),revision:0,characters:{},items:{},unownedDrafts:{},legacyRoot:{},legacyRecovery:{}};}
function validStat(row,allowed){return object(row)&&typeof row.name==='string'&&Number.isFinite(row.value)&&allowed.some(r=>r.name===row.name&&Math.abs(r.value-row.value)<1e-12);}
export function validateEcho(data,identity,catalog){
 assert(object(data)&&identity,'Unknown Echo identity.');
 const rules=catalog.statEditor;
 assert(data.cost==null||data.cost===identity.cost,'Echo cost does not match its identity.');
 assert(data.rank==null||data.rank===5,'This editor supports Rank-5 observations only.');
 assert(data.level==null||rules.levels.includes(data.level),'Unsupported Echo level.');
 assert(data.selectedSonataSetId==null||identity.sonataSetIds.includes(data.selectedSonataSetId),'Illegal Sonata for Echo.');
 const levels=data.level==null?rules.levels:[data.level];
 if(data.mainStat!=null)assert(levels.some(level=>validStat(data.mainStat,rules.mainStatsByCostAndLevel[identity.cost][level])),'Illegal main stat/value.');
 if(data.secondaryMainStat!=null)assert(levels.some(level=>validStat(data.secondaryMainStat,[rules.secondaryMainStatsByCostAndLevel[identity.cost][level]])),'Illegal secondary stat/value.');
 assert(Array.isArray(data.substats)&&data.substats.length<=5,'Invalid observed substats.');
 if(data.level!=null)assert(data.substats.length<=data.level/5,'Too many rolls for Echo level.');
 const names=new Set();
 for(const roll of data.substats){const source=rules.substats.find(s=>s.name===roll.name);assert(source&&source.values.some(v=>Math.abs(v-roll.value)<1e-12)&&!names.has(roll.name),'Illegal or duplicate substat.');names.add(roll.name);}
}
export function validateAccount(account,catalog){
 safeDocument(account);assert(account?.schemaVersion===ACCOUNT_SCHEMA&&typeof account.id==='string'&&Number.isSafeInteger(account.revision)&&account.revision>=0,'Unsupported account schema.');
 assert(object(account.characters)&&object(account.items)&&object(account.legacyRoot)&&object(account.legacyRecovery),'Invalid account structure.');
 assert(account.unownedDrafts===undefined||object(account.unownedDrafts),'Invalid unowned drafts.');
 for(const [key,draft]of Object.entries(account.unownedDrafts??{}))assert(catalog.characters.some(c=>c.id===key&&c.name===draft.name)&&object(draft.record?.build)&&!account.characters[key],'Invalid or competing unowned draft.');
 const used=new Set();
 for(const [key,item]of Object.entries(account.items)){
  assert(item.id===key&&['echo','weapon'].includes(item.kind)&&object(item.data),'Invalid physical item.');
  if(item.kind==='echo')validateEcho(item.data,catalog.echoes.find(e=>e.id===item.catalogId),catalog);
  else{const source=catalog.weapons.find(w=>w.id===item.catalogId);assert(source,'Unknown Weapon.');assert(item.data.level==null||Number.isInteger(item.data.level)&&item.data.level>=1&&item.data.level<=90,'Invalid Weapon level.');assert(item.data.refinement==null||Number.isInteger(item.data.refinement)&&item.data.refinement>=1&&item.data.refinement<=5,'Invalid refinement.');}
 }
 for(const [key,character]of Object.entries(account.characters)){
  const source=catalog.characters.find(c=>c.id===key);assert(source&&character.id===key&&character.name===source.name&&character.record?.character===source.name&&typeof character.owned==='boolean'&&object(character.record?.build),'Unknown Character/build.');
  const build=character.record.build;
  assert(character.revision===undefined||Number.isSafeInteger(character.revision)&&character.revision>0,'Invalid Character revision.');
  assert(build.characterLevel==null||Number.isInteger(build.characterLevel)&&build.characterLevel>=1&&build.characterLevel<=90,'Invalid Character level.');
  assert(build.sequenceLevel==null||Number.isInteger(build.sequenceLevel)&&build.sequenceLevel>=0&&build.sequenceLevel<=6,'Invalid Sequence.');
  const assign=(itemId,kind)=>{if(itemId==null)return;const item=account.items[itemId];assert(item?.kind===kind,'Missing assigned item.');assert(!used.has(itemId),'A physical item cannot have multiple active owners.');used.add(itemId);return item;};
  const weapon=assign(build.weaponInstanceId,'weapon');
  if(weapon)assert(catalog.weapons.find(w=>w.id===weapon.catalogId).weaponType===source.weaponType,'Weapon type does not match Character.');
  if(build.echoSets){assert(object(build.echoSets.sets)&&build.echoSets.sets[build.echoSets.activeSetId],'Invalid active Echo set.');
   for(const [setId,set] of Object.entries(build.echoSets.sets)){
    assert(Array.isArray(set.slots)&&set.slots.length===5,'A build has five Echo slots.');let cost=0;const species=new Set();
    for(const itemId of set.slots){if(itemId==null)continue;const item=account.items[itemId];assert(item?.kind==='echo','Missing Echo instance.');cost+=catalog.echoes.find(e=>e.id===item.catalogId).cost;assert(!species.has(item.catalogId),'Duplicate Echo species in build.');species.add(item.catalogId);if(setId===build.echoSets.activeSetId)assign(itemId,'echo');}
    assert(cost<=12,'Equipped Echo cost exceeds 12.');
   }
  }
 }
 return account;
}
export function legacyProjection(account){
 if(!account)return null;
 const value={...copy(account.legacyRoot),characters:[],drafts:Object.fromEntries(Object.values(account.unownedDrafts??{}).map(d=>[d.name,copy(d.record)]))};
 for(const c of Object.values(account.characters)){
  if(c.owned)value.characters.push(c.name);
  const record=copy(c.record),build=record.build;
  if(build.weaponInstanceId){const w=account.items[build.weaponInstanceId];build.weaponId=w.catalogId;build.weaponLevel=w.data.level;build.weaponRefinement=w.data.refinement;}else build.weaponId=null;
  delete build.weaponInstanceId;
  if(build.echoSets)for(const set of Object.values(build.echoSets.sets))set.slots=set.slots.map(itemId=>{const e=account.items[itemId];return e?{echoId:e.catalogId,...copy(e.data),inventoryInstanceId:e.id}:null;});
  value.drafts[c.name]=record;
 }
 return value;
}
// Convert existing CharacterBuildState, preserving its other fields. Matching
// catalog identities never prove two cards are the same physical item.
export function accountFromLegacy(legacy,catalog,{current=null,recovery={}}={}){
 safeDocument(legacy);assert(object(legacy)&&Array.isArray(legacy.characters)&&object(legacy.drafts),'Unreadable legacy account; export/recovery required.');
 assert(legacy.characters.every(name=>typeof name==='string'&&object(legacy.drafts[name])),'Owned legacy Character is missing its draft; original data retained for repair.');
 const next=current?copy(current):emptyAccount();next.legacyRecovery={...next.legacyRecovery,...copy(recovery)};
 next.unownedDrafts??={};
 next.legacyRoot=Object.fromEntries(Object.entries(copy(legacy)).filter(([k])=>!['characters','drafts'].includes(k)));
 const physical=(kind,catalogId,data,existing)=>{
  const old=existing&&next.items[existing];const physicalId=old?.kind===kind&&old.catalogId===catalogId?existing:id();
  next.items[physicalId]={...(old??{}),id:physicalId,kind,catalogId,data:copy(data),provenance:old?.provenance??{kind:'LEGACY_BUILD_OBSERVATION'}};return physicalId;
 };
 for(const [name,raw]of Object.entries(legacy.drafts)){
  const source=catalog.characters.find(c=>c.name===name);assert(source,'Unknown legacy Character; original data retained: '+name);
  assert(object(raw)&&object(raw.build),'Invalid legacy Character record.');const record=copy(raw),build=record.build;
  if(!legacy.characters.includes(name)){assert(!next.characters[source.id]?.owned,'Removing owned membership requires a separate explicit action.');next.unownedDrafts[source.id]={name,record};continue;}
  delete next.unownedDrafts[source.id];
  const old=next.characters[source.id]?.record?.build;
  if(build.weaponId)build.weaponInstanceId=physical('weapon',build.weaponId,{level:build.weaponLevel??null,refinement:build.weaponRefinement??null},old?.weaponInstanceId);else build.weaponInstanceId=null;
  delete build.weaponId;delete build.weaponLevel;delete build.weaponRefinement;
  if(build.echoSets)for(const set of Object.values(build.echoSets.sets)){
   set.slots=set.slots.map(card=>{if(card==null)return null;if(typeof card==='string'){const identity=catalog.echoes.find(e=>e.id===card);assert(identity,'Unknown legacy Echo; original data retained.');return physical('echo',card,{rank:null,level:null,cost:identity.cost,selectedSonataSetId:null,mainStat:null,secondaryMainStat:null,substats:[]});}assert(object(card),'Invalid legacy Echo observation.');const {echoId,inventoryInstanceId,...data}=card;return physical('echo',echoId,data,inventoryInstanceId);});
  }
  next.characters[source.id]={id:source.id,name,owned:legacy.characters.includes(name),record};
 }
 return validateAccount(next,catalog);
}
export function saveReviewedScan(account,draft,catalog,{reviewed=false,replace=false,assign=false}={}){
 assert(reviewed,'Review confirmation required.');safeDocument(draft);
 const source=catalog.characters.find(c=>c.id===draft.character?.id);assert(source,'Unknown scanned Character.');
 assert((!account.characters[source.id]&&!account.unownedDrafts?.[source.id])||replace,'Existing Character or draft requires explicit replacement approval.');
 assert(Number.isInteger(draft.character.level)&&draft.character.level>=1&&draft.character.level<=90,'Character level required.');
 assert(Array.isArray(draft.echoes)&&draft.echoes.length===5,'Five reviewed Echo panels required.');
 const next=copy(account),previous=next.characters[source.id],now=new Date().toISOString();
 if(next.unownedDrafts)delete next.unownedDrafts[source.id];
 const put=(kind,catalogId,data,evidence)=>{const key=id();next.items[key]={id:key,kind,catalogId,data:copy(data),provenance:{kind:'REVIEWED_DISCORD_CARD',evidence:copy(evidence??null)}};return key;};
 const weaponInstanceId=put('weapon',draft.weapon?.id,{level:draft.weapon?.level??null,refinement:draft.weapon?.refinement??null},draft.weapon?.evidence);
 const slots=draft.echoes.map(e=>put('echo',e.echoId,{rank:e.rank??null,level:e.level??null,cost:e.cost,selectedSonataSetId:e.sonataId,mainStat:e.mainStat,secondaryMainStat:e.secondaryMainStat,substats:e.substats},e.evidence));
 const build={...(previous?.record.build??{}),characterLevel:draft.character.level,sequenceLevel:draft.sequence,
  observedSkills:copy(draft.skills),weaponInstanceId:assign?weaponInstanceId:previous?.record.build.weaponInstanceId??null,
  ...(assign?{echoSets:{schemaVersion:1,activeSetId:'set-1',defaultSetId:'set-1',sets:{'set-1':{id:'set-1',name:'Imported build',slots}}}}:{})};
 // Minor Forte activations are not printed by these cards; never invent them.
 if(!previous){build.forte={schemaVersion:1,levels:{'normal-attack':draft.skills.basic,skill:draft.skills.skill,circuit:draft.skills.circuit,intro:draft.skills.intro,liberation:draft.skills.liberation},enabled:{}};build.minorForteUnknown=true;}
 next.characters[source.id]={id:source.id,name:source.name,owned:true,record:{...(previous?.record??{}),character:source.name,build,createdAt:previous?.record.createdAt??now,updatedAt:now}};
 return validateAccount(next,catalog);
}
export function exportAccount(account,catalog){validateAccount(account,catalog);assert(typeof catalog.sourceBinding==='string','Canonical source identity required.');return {format:BACKUP_FORMAT,schemaVersion:ACCOUNT_SCHEMA,catalogBinding:catalog.sourceBinding,exportedAt:new Date().toISOString(),account:copy(account)};}
export function parseBackup(text,catalog){const value=readJson(text);assert(value.format===BACKUP_FORMAT&&value.schemaVersion===ACCOUNT_SCHEMA,'Unsupported backup format/version.');assert(value.catalogBinding===catalog.sourceBinding,'Canonical source changed; reviewed migration required.');return validateAccount(copy(value.account),catalog);}
export function moveItem(account,itemId,characterId,slot,catalog){
 const next=copy(account),item=next.items[itemId],target=next.characters[characterId];assert(item&&target,'Unknown item/Character.');
 for(const c of Object.values(next.characters)){
  const b=c.record.build;if(b.weaponInstanceId===itemId)b.weaponInstanceId=null;
  if(b.echoSets){const s=b.echoSets.sets[b.echoSets.activeSetId];s.slots=s.slots.map(value=>value===itemId?null:value);}
 }
 const b=target.record.build;
 if(item.kind==='weapon')b.weaponInstanceId=itemId;
 else{assert(Number.isInteger(slot)&&slot>=0&&slot<5,'Choose an Echo slot.');if(!b.echoSets)b.echoSets={schemaVersion:1,activeSetId:'set-1',defaultSetId:'set-1',sets:{'set-1':{id:'set-1',name:'Set 1',slots:Array(5).fill(null)}}};b.echoSets.sets[b.echoSets.activeSetId].slots[slot]=itemId;}
 return validateAccount(next,catalog);
}
