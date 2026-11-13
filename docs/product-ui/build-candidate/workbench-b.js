import {installChoiceDismissal,installTransientChoiceDismissal} from '../../ui-lab/v1.1/modules/choice-dismissal.js';
import {recommendedMainStats,recommendedSetIds,recommendedWeaponIds,recommendationOrder,recommendedEchoSlot,recommendedEchoFilterSetIds} from '../../../src/characterRecommendations.mjs';
import {createUiPreferenceStore} from '../../../src/uiFilterPreferences.mjs';
import {accountCarouselPreview} from '../../ui-lab/v1.1/modules/account-carousel-preview.js';
import {substatEditorMarkup as sharedSubstatEditor} from '../../ui-lab/v1.1/modules/substat-editor.js';
import {productDraftBuildIdentity,productInvestmentPending} from '../../../src/productBuildDraft.mjs';
import {formatScannerIssues} from '../../../src/scannerImportReview.mjs';
import {productAsset} from '../assets.js';
import '../product-navigation.js';
import {createProductStore} from '../product-store.js';
import {CHARACTER_PREVIEW_INFO} from './character-preview-info.js';
import {sortCharactersByOriginalRelease} from '../../../src/characterOriginalRelease.mjs';
import {installPreviewScroll, clearPreviewScroll, installFixedScroll} from './edge-scroll.js';
import {statPreference, rollPresentation, rollSignalMarkup} from './stat-guidance.js';
import {previewStage, weaponEffectsOverview, sonataOverview, echoSkillOverview} from './workbench-b-presentation.js';
import {CHARACTER_CATALOG,WEAPON_CATALOG} from '../../ui-lab/v1.1/modules/catalog.js';
import {escapeHtml as esc} from '../../ui-lab/v1.1/modules/util.js';
import {mountCarousel} from './carousel.js';
import {forteMarkup} from '../skills-source.js';
import {normalizeForteState,updateForteNode,forteNodeActive,WEAPON_EFFECT_CATALOG,createAugustaPilotExampleBuilds,safeDocument} from './models-entry.js';
import {STORAGE_KEY,freshDraft,validateDraft,accountWithDraft,createReviewStore,projectDraftStats} from './state.js';

const $=s=>document.querySelector(s),clone=structuredClone;
const asset=productAsset;
let carousel=null;
const image=(p,alt='',cls='')=>`<img src="${esc(asset(p))}" alt="${esc(alt)}" class="${cls}" draggable="false">`;
const [facts,weapons,echoes,skills,sequences,echoManifest]=await Promise.all(['build-stats/runtime-data.json','weapons/browser-data.json','echoes/browser-data.json','skills-runtime.json','sequence-runtime.json','echoes/manifest.json'].map(p=>fetch('/docs/ui-prototypes/assets/'+p).then(r=>{if(!r.ok)throw Error('Required source asset unavailable: '+p);return r.json();})));
const catalog={characters:CHARACTER_CATALOG,echoes:echoes.echoes,weapons:weapons.weapons,statEditor:echoes.statEditor,sourceBinding:'BELLIBING_CANONICAL_LOCAL_REVIEW'};
const domain={facts,weapons,echoes,trees:skills.characters,sequences:sequences.characters};
const store=await createProductStore(catalog,skills.characters);
let root=store.snapshot(),person=CHARACTER_CATALOG.find(c=>c.id===root.selected);
const filterPrefs=createUiPreferenceStore(globalThis.localStorage,store.session.profile,root.account.id);
const ui={panel:null,slot:0,preview:null,weaponPreview:null,weaponRank:1,weaponQuery:'',echoQuery:'',cost:null,sets:[],sonataOpen:false,previewView:'art',rollEditor:null,rollMove:null,more:false,skillId:null,prompt:null};
const treeFor=id=>skills.characters.find(c=>c.characterId===id)??{nodes:[]};
const draft=()=>root.drafts[person.id];
const buildPref=section=>'build:'+person.id+':'+section;
const allowedEchoCost=cost=>cost===null||[1,3,4].includes(cost);
function restoreEchoFilters(index){
 const common=filterPrefs.read(buildPref('echo'));
 const sets=Array.isArray(common.sets)?common.sets:recommendedEchoFilterSetIds(person.id);
 ui.sets=[...new Set(sets.filter(id=>echoes.sonataSets.some(set=>set.id===id)))];
 ui.echoQuery=typeof common.query==='string'?common.query:'';
 ui.sonataOpen=common.sonataOpen===true;
 const saved=filterPrefs.read(buildPref('echo-slot:'+index));
 ui.cost=Object.hasOwn(saved,'cost')&&allowedEchoCost(saved.cost)?saved.cost:recommendedEchoSlot(person.id,index)?.cost??null;
}
function saveEchoFilters(){filterPrefs.write(buildPref('echo'),{sets:[...ui.sets],query:ui.echoQuery,sonataOpen:ui.sonataOpen});}
function saveCharacterBrowser(){filterPrefs.write('build:character-browser',{query:characterQuery,element:characterElement,rarity:characterRarityFilter,weapon:characterWeapon,preview:characterPreview});}
ui.more=filterPrefs.read(buildPref('summary')).more===true;
const species=id=>echoes.echoes.find(e=>e.id===id);
const weapon=id=>weapons.weapons.find(w=>w.id===id);
const illustratedEchoes = new Set(['echo-60001215', 'echo-60000975', 'echo-60001615', 'echo-60000235', 'echo-60000285']);
const sourceArtForEcho = id => asset(echoManifest.icons.find(echo => echo.echoId === id)?.targetPath);
const artForEcho = id => illustratedEchoes.has(id)
 ? '/artifacts/build-ui-prototype/build-candidate/echo-art/' + id + '-illustrated.png'
 : sourceArtForEcho(id);
const artForWeapon=id=>WEAPON_CATALOG.find(w=>w.id===id)?.art;
const pretty=n=>({'Flat ATK':'ATK','Flat HP':'HP','Flat DEF':'DEF','ATK%':'ATK','HP%':'HP','DEF%':'DEF','Skill DMG':'Resonance Skill DMG','Liberation DMG':'Resonance Liberation DMG'}[n]??n);
const pct=n=>typeof n==='string'&&!n.startsWith('Flat ')&&!['ATK','HP','DEF'].includes(n);
const num=(v,digits=2)=>Number.isFinite(v)?v.toLocaleString('en-US',{maximumFractionDigits:digits}):'Pending';
const statValue=(n,v)=>Number.isFinite(v)?pct(n)?num(v*100)+'%':num(v,0):'Pending';
function rollValueMarkup(roll){
 const value=rollPresentation(roll.name,roll.value,statMarkup(roll.name,roll.value));
 if(!roll.normalization?.requiresReview)return value;
 const original=roll.rawValue?.trim()??statValue(roll.name,roll.observedValue);
 return '<span title="'+esc('Original card: '+original+'. Canonical import: '+statValue(roll.name,roll.value)+'. Review in Echo Workshop.')+'">'+value+'<sup>&#8224;</sup></span>';
}
function numberMarkup(value, percent = false) {
 if (!Number.isFinite(value)) return 'Pending';
 const digits = num(percent ? value * 100 : value, percent ? 2 : 1).replaceAll(',', '\u202f');
 return '<span class="wb-number"><span class="wb-number-digits">' + digits + '</span><span class="wb-number-unit">' + (percent ? '%' : '') + '</span></span>';
}
const statMarkup = (name, value) => numberMarkup(value, pct(name));

function message(text=''){const host=$('#bcStatus');host.textContent=text;host.toggleAttribute('data-import-issues',/^Import needs|^Echo \d/.test(text));}
function fail(error){message(error.message??String(error));const host=$('#bcEditorError');if(host)host.textContent=error.message??String(error);}
function persist(next){
 root=store.commit(next);
 if(!root.account.characters[root.selected]?.owned)$('#bcSaved').textContent='Local draft · Add Character to save to Account';
}
const inAccountMode=id=>!!root.account.characters[id]?.owned;
let saveQueue=Promise.resolve(),saveFailed=null,saveNumber=0;
function queueAccountSave(snapshot){
 const number=++saveNumber;
 $('#bcSaved').textContent='Saving Current Build…';
 saveQueue=saveQueue.then(async()=>{
  if(saveFailed)throw saveFailed;
  return store.saveDraft(snapshot);
 }).then(saved=>{
  root=saved;
  if(number===saveNumber){$('#bcSaved').textContent='Current Build saved';message('');render();}
 }).catch(error=>{
  saveFailed=error;
  $('#bcSaved').textContent='NOT SAVED — reload and review';
  fail(error);renderAccount();
 });
}

function validateEditableDraft(value){if(value.importObservation)safeDocument(value);else validateDraft(value,catalog,skills.characters,{account:root.account});}
function change(mutator){
 if(saveFailed)throw Error('Previous change was NOT SAVED. Reload and review the saved Build before editing.');
 const next=clone(root),id=person.id;
 try{mutator(next.drafts[id]);validateEditableDraft(next.drafts[id]);}
 catch(error){$('#bcSaved').textContent='NOT SAVED — invalid Build change';throw error;}
 const savedCharacter=inAccountMode(id);
 try{persist(next);}catch(error){$('#bcSaved').textContent='NOT SAVED — reload and review';throw error;}
 message();render();
 if(savedCharacter)queueAccountSave(clone(next.drafts[id]));
}
function ensureDraft(id){if(root.drafts[id])return;const next=clone(root);next.drafts[id]=freshDraft(id,treeFor(id));persist(next);}
ensureDraft(person.id);
if(root.example)document.querySelector('.bc-review>span').textContent='LOCAL CANDIDATE / isolated review account / example draft';

function allStats(){if(draft().importObservation||productInvestmentPending(root.account,person.id,person.forte))return {pending:'Actual investment needs source-supported projection'};try{return projectDraftStats(draft(),domain);}catch(error){return {pending:error.message};}}
function renderStats(){
 const s=allStats(),base=[['HP','hp',false],['ATK','atk',false],['DEF','def',false],['Energy Regen','energyRegen',true],['CRIT Rate','critRate',true],['CRIT DMG','critDamage',true]],extra=[[person.element+' DMG Bonus','elementDamageBonus',true],['Basic Attack DMG Bonus','basicAttackDamageBonus',true],['Heavy Attack DMG Bonus','heavyAttackDamageBonus',true],['Resonance Skill DMG Bonus','resonanceSkillDamageBonus',true],['Resonance Liberation DMG Bonus','resonanceLiberationDamageBonus',true],['Healing Bonus','healingBonus',true]];
 $('#bcStats').innerHTML=[...base,...(ui.more?extra:[])].map(([label,key,percent])=>{const icon=facts.statIcons[label]??facts.statIcons[label.replace('CRIT','Crit')]??facts.statIcons[label.replace(' Bonus','')];return `<div class="bc-stat">${icon?image(icon):'<span></span>'}<span>${esc(label)}</span><b>${s.pending?'Pending':numberMarkup(s[key],percent)}</b></div>`;}).join('');
 $('#bcMore').textContent=ui.more?'Less stats \u2303':'More stats \u2304';$('#bcMore').setAttribute('aria-expanded',String(ui.more));$('#bcStatsScope').hidden=!ui.more;
}
function renderWeapon(){
 const preview=null,w=weapon(draft().weaponId);
 const level=Object.hasOwn(draft(),'weaponLevel')?draft().weaponLevel:root.account.items[draft().weaponInstanceId]?.data.level??(root.account.characters[person.id]?'Pending':90);
 $('#bcWeapon').innerHTML=w?`${preview?'<span class="bc-preview-label">PREVIEW</span>':''}<button class="bc-weapon" data-bc-open="weapon" aria-label="Choose Weapon: ${esc(w.name)}"><strong>${esc(w.name)}</strong><span class="bc-weapon-body">${image(artForWeapon(w.id))}<span><span class="bc-weapon-meta"><span>Lv. ${level??'Pending'}</span><span>R${preview?ui.weaponRank:(draft().weaponRank??'?')}</span></span><span class="bc-weapon-stat"><span>ATK</span><b>${numberMarkup(level!==90?null:w.level90BaseAtk)}</b></span><span class="bc-weapon-stat"><span>${esc(w.secondary?.stat??'Secondary stat')}</span><b>${statMarkup(w.secondary?.stat??'',(level!==90?null:w.secondary?.value))}</b></span></span></span></button>`:'<button class="bc-empty-weapon" data-bc-open="weapon"><span>+</span>Choose Weapon</button>';
}
function renderSkills(){
 if(!treeFor(person.id).nodes.length){$('#bcSkills').innerHTML='<p class="bc-inspector-meta">Pending source verification</p>';return;}
 const investment=clone(draft().forte);
 if(draft().importObservation){for(const [key,role] of Object.entries({basic:'normal-attack',skill:'skill',circuit:'circuit',intro:'intro',liberation:'liberation'}))if(draft().importObservation.skills?.[key]==null&&investment.levels[role]===draft().importForte?.levels[role])investment.levels[role]=null;}
 $('#bcSkills').innerHTML=forteMarkup(person,investment);
 $('#bcSkills').querySelectorAll('.card-forte-node').forEach((el,i)=>{const node=person.forte?.nodes[i];if(!node)return;el.tabIndex=-1;el.setAttribute('role','img');el.setAttribute('aria-label',node.name);el.dataset.bcSkill=node.id;el.title=node.name;if(node.kind==='skill'||node.kind==='outro'){const label=document.createElement('span');label.className='bc-skill-label';label.textContent=node.kind==='outro'?'Outro Skill':node.name;el.append(label);}});
}
function renderSequences() {
 const current = draft().sequence;
 $('#bcSequenceReset').textContent = 'S' + (current??'?');
 $('#bcSequenceReset').setAttribute('aria-label', 'Current Sequence ' + current + '. Reset to S0');
 $('#bcSequences').innerHTML = [...(person.sequences ?? [])]
  .sort((a, b) => a.sequence - b.sequence)
  .map(sequence => `
   <button class="bc-sequence ${sequence.sequence <= current ? 'active' : ''}"
    data-bc-sequence="${sequence.sequence}" aria-label="S${sequence.sequence}: ${esc(sequence.name)}"
    aria-pressed="${sequence.sequence <= current}">
    <span class="bc-sequence-art" style="--sequence-size:${33 + sequence.sequence * 2}px">${image(sequence.art)}</span>
    <small>S${sequence.sequence}</small>
   </button>`).join('');
}
function renderEchoes(){
 $('#bcEchoes').innerHTML=draft().echoes.map((e,i)=>{if(!e)return `<button class="bc-echo bc-echo-empty" data-bc-echo="${i}" aria-label="Choose Echo slot ${i+1}"><span>+</span><strong>Echo ${i+1}</strong></button>`;const identity=species(e.speciesId),set=echoes.sonataSets.find(s=>s.id===e.selectedSonataSetId);return `<button class="bc-echo ${ui.panel==='echo'&&ui.slot===i?'active':''}" data-bc-echo="${i}" aria-label="Edit Echo slot ${i+1}: ${esc(identity.name)}"><strong class="bc-echo-name">${esc(identity.name)}</strong><span class="bc-echo-set-rail">${set?image(set.artPath,set.name,'bc-set-icon'):''}</span><span class="bc-echo-art" title="${illustratedEchoes.has(identity.id)?'AI-generated concept illustration based on the source Echo icon':'Original source Echo artwork'}">${image(artForEcho(identity.id),identity.name)}<span class="bc-echo-meta"><span>COST ${identity.cost} \u00b7 +${e.level??'?'}</span></span></span><span class="bc-echo-copy"><span class="bc-echo-main"><span>${esc(pretty((e.mainStat?.name??'Pending')))}</span><b>${statMarkup(e.mainStat?.name??'Pending',e.mainStat?.value)}</b></span><span class="bc-echo-secondary" ${e.evidence?.secondaryRecovery?.requiresReview?'title="'+esc('OCR missed secondary: fixed cost/+25 stat recovered from five exact canonical substats. Compare with your original card.')+'"':''}><span>${esc(pretty((e.secondaryMainStat?.name??'Pending')))}${e.evidence?.secondaryRecovery?.requiresReview?' †':''}</span><b>${statMarkup(e.secondaryMainStat?.name??'Pending',e.secondaryMainStat?.value)}</b></span><span class="bc-echo-rolls">${Array.from({length:5},(_,n)=>{const roll=e.substats[n];return `<span class="bc-echo-roll"><span>${roll?esc(roll.name)+statPreference(person.id,roll.name):'+'+(n+1)*5}</span>${rollSignalMarkup()}<b>${roll?rollValueMarkup(roll):'Not rolled'}</b></span>`;}).join('')}</span></span></button>`;}).join('');
 $('#bcCost').textContent=draft().echoes.filter(Boolean).length+'/5 \u00b7 '+draft().echoes.reduce((sum,e)=>sum+(e?.cost??0),0)+'/12 Cost';
}
function renderAccount(){
 const owned=!!root.account.characters[person.id]?.owned;
 $('#bcAccount').hidden=owned;
 $('#bcAccount').style.display=owned?'none':'';
 $('#bcAccount').textContent='Add Character';
 $('#bcAccount').disabled=owned;
}
function render(){
 carousel?.setSelected(person.id);
 $('#bcName').textContent=person.name;$('#bcCharacterMeta').innerHTML=image('/docs/ui-prototypes/assets/builder-icons/elements/'+person.element.toLowerCase()+'.webp')+'<span>'+esc(person.element)+' \u00b7 '+esc(person.weaponType)+'</span>';
 $('#bcHero').src=asset(person.art);$('.bc-environment').style.backgroundImage=`linear-gradient(90deg,#0b152070,transparent 35%,transparent 65%,#0b152070),url('/docs/ui-lab/inventory/art/${person.element.toLowerCase()}.webp')`;
 $('.bc-summary section h2 span').textContent='Lv. '+(Object.hasOwn(draft(),'characterLevel')?(draft().characterLevel??'Pending'):root.account.characters[person.id]?(root.account.characters[person.id].record.build.characterLevel??'Pending'):90);renderStats();renderWeapon();renderSkills();renderSequences();renderEchoes();renderAccount();
}
function rememberWorkshopPreview(){
 if(ui.panel==='weapon'){
  const key=person.id+':weapon',value={base:JSON.stringify([draft().weaponId,draft().weaponRank,draft().weaponLevel]),preview:{id:ui.weaponPreview,rank:ui.weaponRank}};safeDocument(value);
  if(JSON.stringify(root.workshopPreviews?.[key])!==JSON.stringify(value)){const next=clone(root);next.workshopPreviews??={};next.workshopPreviews[key]=value;persist(next);}return;
 }
 if(ui.panel!=='echo')return;
 const key=person.id+':'+ui.slot,value={base:JSON.stringify(draft().echoes[ui.slot]),preview:clone(ui.preview)};
 safeDocument(value);
 if(JSON.stringify(root.workshopPreviews?.[key])===JSON.stringify(value))return;
 const next=clone(root);next.workshopPreviews??={};next.workshopPreviews[key]=value;persist(next);
}
function restoredEchoPreview(index){const saved=root.workshopPreviews?.[person.id+':'+index];return saved&&saved.base===JSON.stringify(draft().echoes[index])?clone(saved.preview):clone(draft().echoes[index]);}
function closeEditor(returnFocus=true){rememberWorkshopPreview();clearPreviewScroll();const focus=ui.returnSelector;ui.panel=null;ui.preview=null;ui.weaponPreview=null;$('#bcEditor').hidden=true;$('#bcEditor').replaceChildren();$('.bc-center').classList.remove('editing');renderWeapon();renderEchoes();if(returnFocus&&focus)document.querySelector(focus)?.focus({preventScroll:true});}
function editor(kind,title,body,footer='',headerTools=''){
 const oldScroll=$('.bc-inspector')?.scrollTop??0,listScroll=$('.bc-echo-browser .bc-catalog-grid')?.scrollTop??0;
 clearPreviewScroll();
 $('#bcEditor').hidden=false;$('#bcEditor').dataset.kind=kind;$('.bc-center').classList.add('editing');
 $('#bcEditor').innerHTML=`<div class="bc-editor-header"><h2>${esc(title)}</h2>${headerTools}<button class="bc-close" data-bc-close aria-label="Collapse ${esc(title)}">\u203a</button></div>${body}<div id="bcEditorError" class="bc-error" role="status"></div>${footer?`<div class="bc-editor-footer">${footer}</div>`:''}`;
 installPreviewScroll($('.wc-preview'));
 if($('.bc-inspector'))$('.bc-inspector').scrollTop=oldScroll;if($('.bc-echo-browser .bc-catalog-grid'))$('.bc-echo-browser .bc-catalog-grid').scrollTop=listScroll;if(ui.focusEditor){ui.focusEditor=false;$('.bc-editor-header .bc-close').focus({preventScroll:true});}
}
function showPanel(kind){rememberWorkshopPreview();carousel.close();ui.panel=kind;ui.focusEditor=true;}
const orderedCharacters=sortCharactersByOriginalRelease(CHARACTER_CATALOG);
const characterElements=['Spectro','Havoc','Aero','Glacio','Fusion','Electro'];
const characterWeaponIcons={Sword:'SP_IconNorKnife.webp',Broadblade:'SP_IconNorSword.webp',Pistols:'SP_IconNorGun.webp',Gauntlets:'SP_IconNorFist.webp',Rectifier:'SP_IconNorMagic.webp'};
const characterWeaponIcon=(type,cls='')=>characterWeaponIcons[type]?image('/docs/ui-prototypes/assets/builder-icons/skills/'+characterWeaponIcons[type],type,cls):'';
const characterElementIcon=c=>c.element?image('/docs/ui-prototypes/assets/builder-icons/elements/'+c.element.toLowerCase()+'.webp',c.element,'wb-character-element'):'';
const characterIdentity=c=>characterElementIcon(c)+'<strong>'+esc(c.name)+'</strong>'+characterWeaponIcon(c.weaponType,'wb-character-weapon');
const characterRarity=c=>[4,5].includes(c.rarity)?'<span class="wb-character-rarity" aria-label="'+c.rarity+'-star">'+c.rarity+'&#9733;</span>':'';
const characterTagTone=t=>({'Main Damage Dealer':'role','Resonance Skill DMG':'damage','Heavy Attack DMG':'damage','Unison':'unison','Electro Flare':'electro','Coordinated Attack':'coordinated','Aero DMG':'aero','Aero DMG Amplification':'aero','Electro DMG':'electro'}[t]??'neutral');
let characterQuery='',characterElement=null,characterRarityFilter=null,characterWeapon=null,characterPreview=null,characterSkill=null;
function openCharacterBrowser(){
 ui.returnSelector='[data-bc-open="character"]';showPanel('character');
 const saved=filterPrefs.read('build:character-browser');
 characterQuery=typeof saved.query==='string'?saved.query:'';
 characterElement=characterElements.includes(saved.element)?saved.element:null;
 characterRarityFilter=[4,5].includes(saved.rarity)?saved.rarity:null;
 characterWeapon=Object.hasOwn(characterWeaponIcons,saved.weapon)?saved.weapon:null;
 characterSkill=null;
 characterPreview=CHARACTER_CATALOG.some(c=>c.id===saved.preview&&!root.account.characters[c.id]?.owned)?saved.preview:orderedCharacters.find(c=>!root.account.characters[c.id]?.owned)?.id??null;
 renderCharacterBrowser();
}
function renderCharacterBrowser(){
 const scroll=$('.wb-character-catalog')?.scrollTop??0;
 const rows=orderedCharacters.filter(c=>!root.account.characters[c.id]?.owned&&(!characterRarityFilter||c.rarity===characterRarityFilter)&&(!characterElement||c.element===characterElement)&&(!characterWeapon||c.weaponType===characterWeapon)&&c.name.toLowerCase().includes(characterQuery.toLowerCase()));
 const selected=CHARACTER_CATALOG.find(c=>c.id===characterPreview);
 const filters=characterElements.map(e=>'<button data-wb-character-element="'+e+'" aria-label="'+e+'" title="'+e+'" aria-pressed="'+(characterElement===e)+'">'+image('/docs/ui-prototypes/assets/builder-icons/elements/'+e.toLowerCase()+'.webp')+'</button>').join('');
 const rarityFilters=[5,4].map(rarity=>'<button data-wb-character-rarity="'+rarity+'" aria-label="'+rarity+'-star Characters" aria-pressed="'+(characterRarityFilter===rarity)+'">'+rarity+'&#9733;</button>').join('');
 const weaponFilters=Object.keys(characterWeaponIcons).map(type=>'<button data-wb-character-weapon="'+type+'" aria-label="'+type+'" title="'+type+'" aria-pressed="'+(characterWeapon===type)+'">'+characterWeaponIcon(type)+'</button>').join('');
 const cards=rows.map(c=>'<button class="wb-character-card '+(c.id===characterPreview?'selected':'')+'" data-rarity="'+esc(c.rarity)+'" data-wb-character-preview="'+c.id+'" aria-label="'+esc(c.name+', '+(c.rarity?c.rarity+'-star, ':'')+(c.element??'Element pending')+', '+(c.weaponType??'Weapon type pending'))+'" aria-pressed="'+(c.id===characterPreview)+'"><span class="wb-character-card-identity">'+characterIdentity(c)+'</span><span class="wb-character-card-art">'+image(c.art,c.name)+characterRarity(c)+'</span></button>').join('');
 const profile=CHARACTER_PREVIEW_INFO[selected?.id];
 const nodes=selected?[...treeFor(selected.id).nodes.filter(n=>['skill','inherent','outro'].includes(n.kind)),...(profile?.skills??[])]:[];
 const activeSkill=nodes.find(n=>n.id===characterSkill);
 const skillRoles={'resonance-mode':'Resonance Mode','normal-attack':'Normal Attack',skill:'Resonance Skill',liberation:'Resonance Liberation',circuit:'Forte Circuit',intro:'Intro Skill',outro:'Outro Skill','inherent-1':'Inherent Skill','inherent-2':'Inherent Skill'};
 const skillButtons=nodes.map(n=>'<button data-wb-character-skill="'+n.id+'" title="'+esc(n.name)+'" aria-label="'+esc((skillRoles[n.role]??'Skill')+': '+n.name)+'" aria-pressed="'+(n.id===characterSkill)+'">'+(n.assetPath?image(n.assetPath,n.name):'<span>Modes</span>')+'</button>').join('');
 const skillInfo=activeSkill?'<section class="wb-character-skill-info"><small>'+esc(skillRoles[activeSkill.role]??'Skill')+'</small><h4>'+esc(activeSkill.name)+'</h4><details open><summary>Description</summary><p>'+esc(activeSkill.description||'Details pending source verification.')+'</p></details></section>':'';
 const preview=selected?'<div class="wb-character-preview-identity">'+characterIdentity(selected)+'</div><div class="wb-character-portrait" data-rarity="'+esc(selected.rarity)+'">'+image(selected.art,selected.name)+characterRarity(selected)+'</div>'+(profile?.tags?.length?'<div class="wb-character-tags">'+profile.tags.map(t=>'<span data-tone="'+characterTagTone(t)+'">'+esc(t)+'</span>').join('')+'</div>':'')+(profile?.summary?'<p class="wb-character-summary">'+esc(profile.summary)+'</p>':'')+(nodes.length?'<section class="wb-character-skill-section"><h4>Skills</h4><div class="wb-character-skill-picker" role="group" aria-label="Character skills">'+skillButtons+'</div>'+skillInfo+'</section>':'<p class="wb-character-pending">Skill details pending source verification.</p>'):'<p>No Character selected</p>';
 editor('character','Add Character','<div class="wc-workbench wb-character-workbench"><div class="wc-browser"><div class="wb-character-filterbar"><div class="wb-character-elements" role="group" aria-label="Filter Characters by element">'+filters+'</div><div class="wb-character-rarities" role="group" aria-label="Filter Characters by rarity">'+rarityFilters+'</div><div class="wb-character-weapons" role="group" aria-label="Filter Characters by weapon type">'+weaponFilters+'</div></div><div class="wc-catalog wb-character-catalog">'+(cards||'<p class="wb-character-empty">No Characters match</p>')+'</div></div><div class="bc-inspector wc-preview wb-character-preview">'+preview+'</div></div>',selected?'<button class="bc-primary" '+(!selected.element||!selected.weaponType?'disabled ':'')+'data-wb-character-build="'+selected.id+'">'+(!selected.element||!selected.weaponType?'Details pending':root.drafts[selected.id]?'Continue Build':'Build Character')+'</button>':'','<input id="wbCharacterSearch" class="wb-header-search" type="search" placeholder="Search Characters" aria-label="Search Characters" value="'+esc(characterQuery)+'">');
 $('.wb-character-catalog').scrollTop=scroll;
}
async function buildNewCharacter(id){
 const identity=CHARACTER_CATALOG.find(c=>c.id===id);
 if(!identity?.element||!identity.weaponType||root.account.characters[id]?.owned)return;
 rememberWorkshopPreview();
 const next=clone(root);next.selected=id;if(!next.drafts[id])next.drafts[id]=freshDraft(id,treeFor(id));persist(next);
 closeEditor(false);person=CHARACTER_CATALOG.find(c=>c.id===id);ui.more=filterPrefs.read(buildPref('summary')).more===true;message();render();carousel.setSelected(id);
}
function openWeapon(){ui.returnSelector='[data-bc-open="weapon"]';showPanel('weapon');const saved=root.workshopPreviews?.[person.id+':weapon'],restore=saved?.base===JSON.stringify([draft().weaponId,draft().weaponRank,draft().weaponLevel]);ui.weaponPreview=restore?saved.preview.id:draft().weaponId;ui.weaponRank=restore?saved.preview.rank:draft().weaponRank;ui.weaponQuery=filterPrefs.read(buildPref('weapon')).query??'';renderWeaponEditor();renderWeapon();}
function renderWeaponEditor() {
 const rows = recommendationOrder(weapons.weapons.filter(item => item.weaponType === person.weaponType && artForWeapon(item.id) && item.name.toLowerCase().includes(ui.weaponQuery.toLowerCase())),recommendedWeaponIds(person.id));
 const item = weapon(ui.weaponPreview);
 const same = item?.id === draft().weaponId && ui.weaponRank === draft().weaponRank;
 const browser = `<div class="wc-browser"><div class="bc-toolbar"><input class="bc-search" id="bcWeaponSearch" placeholder="Search Weapons" aria-label="Search Weapons" value="${esc(ui.weaponQuery)}"></div><div class="wc-catalog bc-catalog-grid">${rows.map(row => `<button class="bc-browse ${row.id === item?.id ? 'selected' : ''}" data-bc-weapon-id="${row.id}">${image(artForWeapon(row.id))}<span>${esc(row.name)}</span></button>`).join('')}</div></div>`;
 const effectRows = WEAPON_EFFECT_CATALOG.filter(effect => effect.weaponId === item?.id);
 const preview = item ? `<div class="bc-inspector wc-preview wb-weapon-preview"><h3>${esc(item.name)}</h3><div class="wb-meta"><span>Lv. 90</span>${choice('R' + (ui.weaponRank??'?'), [1,2,3,4,5].map(rank => selectButton('data-bc-weapon-rank', rank, 'R' + rank, false, rank === ui.weaponRank)).join(''))}<span>${same ? 'Equipped' : 'Preview'}</span></div><div class="wb-hero"><div class="wb-hero-stats"><div class="wb-feature-stat"><span>${esc(item.secondary?.stat ?? 'Secondary stat')}</span><strong>${statMarkup(item.secondary?.stat ?? '', item.secondary?.value)}</strong></div><div class="wb-support-stat"><span>ATK</span><b>${numberMarkup(item.level90BaseAtk)}</b></div></div>${previewStage(artForWeapon(item.id), 'weapon', ui.previewView)}</div>${Number.isInteger(ui.weaponRank)?weaponEffectsOverview(effectRows, ui.weaponRank):'<section class="wb-weapon-effects"><h4>Weapon effect</h4><p>Choose weapon rank to show its effect.</p></section>'}</div>` : '<div class="bc-inspector wc-preview"><p>Choose a Weapon to preview</p></div>';
 editor('weapon', 'Weapon', `<div class="wc-workbench">${browser}${preview}</div>`, `<button class="bc-quiet bc-danger" data-bc-unequip="weapon" ${!draft().weaponId ? 'disabled' : ''}>Unequip</button><button class="bc-primary" data-bc-equip="weapon" ${!item || same || !Number.isInteger(ui.weaponRank) ? 'disabled' : ''}>${same ? 'Equipped' : 'Choose Weapon'}</button>`);
}
function choice(label,options){return `<details class="bc-choice"><summary>${esc(label)}</summary><div class="bc-options">${options}</div></details>`;}
function selectButton(attr,value,label,disabled=false,selected=false){return `<button ${attr}="${esc(value)}" ${disabled?'disabled':''} aria-pressed="${selected}" class="${selected?'selected':''}">${esc(label)}</button>`;}
function previewFrom(identity, previous = null) {
 if (previous?.speciesId === identity.id) return clone(previous);
 const level = 0;
 return {instanceId:crypto.randomUUID(), speciesId:identity.id, cost:identity.cost, rank:5, level,
  selectedSonataSetId:ui.sets.find(id=>identity.sonataSetIds.includes(id))??(identity.sonataSetIds.includes(previous?.selectedSonataSetId) ? previous.selectedSonataSetId : identity.sonataSetIds[0]),
  mainStat:clone(echoes.statEditor.mainStatsByCostAndLevel[identity.cost][level].find(row=>row.name===recommendedMains(identity.cost)[0])??echoes.statEditor.mainStatsByCostAndLevel[identity.cost][level][0]), secondaryMainStat:clone(echoes.statEditor.secondaryMainStatsByCostAndLevel[identity.cost][level]), substats:[]};
}
function mainStatOptions(item) {
 const recommended = recommendedMains(item.cost);
 const allowed = echoes.statEditor.mainStatsByCostAndLevel[item.cost][item.level??25];
 const group = (title, stats) => stats.length ? `<section class="wb-main-group"><h4>${title}</h4>${stats.map(stat => selectButton('data-bc-main',stat.name,pretty(stat.name)+' '+statValue(stat.name,stat.value),false,item.mainStat?.name===stat.name)).join('')}</section>` : '';
 const preferred = allowed.filter(stat => recommended.includes(stat.name)).sort((a,b) => recommended.indexOf(a.name)-recommended.indexOf(b.name));
 return group('Recommended',preferred) + group('Other',allowed.filter(stat => !recommended.includes(stat.name)));
}
function substatEditorMarkup(item) {
 return sharedSubstatEditor({...item,substats:Array.from({length:5},(_,i)=>item.substats[i]??null)},{activeRow:ui.rollEditor,pendingMove:ui.rollMove,characterId:person.id,substats:echoes.statEditor.substats,statValue,statMarkup});
}
function nextIncompleteRoll(after) {
 const indexes = Array.from({length:5},(_,index)=>index);
 return [...indexes.slice(after + 1), ...indexes.slice(0, after + 1)].find(index => !ui.preview.substats[index]?.name || !Number.isFinite(ui.preview.substats[index]?.value)) ?? null;
}

function openEcho(index){ui.returnSelector='[data-bc-echo="'+index+'"]';showPanel('echo');ui.slot=index;ui.preview=restoredEchoPreview(index);ui.rollEditor=null;ui.rollMove=null;restoreEchoFilters(index);renderEchoEditor();renderEchoes();}
function committedPreview(){
 const item=clone(ui.preview);if(!item)throw Error('Choose an Echo.');if(!item.mainStat)throw Error('Choose a Main Stat.');
 const last=item.substats.findLastIndex(row=>row!=null),rolls=Array.from({length:last+1},(_,i)=>item.substats[i]??null);
 if(rolls.some(row=>!row?.name||!Number.isFinite(row.value)))throw Error('Complete the revealed substats.');
 item.substats=rolls;item.level=rolls.length*5;
 item.mainStat=clone(echoes.statEditor.mainStatsByCostAndLevel[item.cost][item.level].find(row=>row.name===item.mainStat.name));
 item.secondaryMainStat=clone(echoes.statEditor.secondaryMainStatsByCostAndLevel[item.cost][item.level]);return item;
}
function validatePreview(){try{const next=clone(draft());next.echoes[ui.slot]=committedPreview();validateEditableDraft(next);return null;}catch(error){return error.message;}}

function committedSonatas(){const counts=new Map();for(const e of draft().echoes)if(e)counts.set(e.selectedSonataSetId,(counts.get(e.selectedSonataSetId)??0)+1);return echoes.sonataSets.flatMap(s=>s.sections.filter(section=>section.pieces<=(counts.get(s.id)??0)).map(section=>`<p><strong>${esc(s.name)} (${section.pieces}/${section.pieces})</strong><br>${esc(section.description)}</p>`)).join('')||'<p>No reached Sonata threshold.</p>';}
function sonataFilterMarkup(setOrder, recommendedIds, open) {
 const option = set => `<button data-bc-set-filter="${set.id}" class="${ui.sets.includes(set.id) ? 'selected' : ''}" aria-pressed="${ui.sets.includes(set.id)}">${image(set.artPath)}<span>${esc(set.name)}</span>${recommendedIds.includes(set.id) ? '<span class="wb-recommendation" aria-label="Recommended">★</span>' : ''}</button>`;
 const group = (label, sets) => sets.length ? `<section><h4>${label}</h4>${sets.map(option).join('')}</section>` : '';
 const selected = ui.sets.map(id => echoes.sonataSets.find(set => set.id === id)).filter(Boolean);
 const icons = selected.map(set => `<span title="${esc(set.name)}">${image(set.artPath, set.name)}</span>`).join('');
 return `<details class="bc-choice wb-sonata-filter" ${open ? 'open' : ''}><summary aria-label="Sonata Sets${selected.length ? ': ' + esc(selected.map(set => set.name).join(', ')) : ': All'}"><span>Sonata Sets</span><span class="wb-selected-sets">${icons || '<span class="wb-all-sets">All</span>'}</span></summary><div class="bc-options"><button class="wb-all-option ${!ui.sets.length ? 'selected' : ''}" data-bc-set-filter="all" aria-pressed="${!ui.sets.length}">All Sonata Sets</button>${group('Recommended', setOrder.filter(set => recommendedIds.includes(set.id)))}${group('Other', setOrder.filter(set => !recommendedIds.includes(set.id)))}</div></details>`;
}
function recommendedMains(cost){
 const allowed=echoes.statEditor.mainStatsByCostAndLevel[cost][0].map(row=>row.name);
 const slot=recommendedEchoSlot(person.id,ui.slot);
 return slot?.cost===cost?slot.mainStats.filter(name=>allowed.includes(name)):recommendedMainStats(person.id,cost,allowed);
}
function echoBrowseCard(row, selectedId) {
 const matchingSets = ui.sets.length ? ui.sets.filter(id => row.sonataSetIds.includes(id)) : row.sonataSetIds;
 const rail = matchingSets.map(id => echoes.sonataSets.find(set => set.id === id)).filter(Boolean).map(set => `<span title="${esc(set.name)}">${image(set.artPath, set.name)}</span>`).join('');
 return `<div class="wb-browse-item"><button class="bc-browse ${row.id === selectedId ? 'selected' : ''}" data-bc-species="${row.id}"><span class="wb-browse-name">${esc(row.name)}</span><span class="wb-browse-art"><span class="wb-browse-rail">${rail}</span>${image(artForEcho(row.id))}</span><small>COST ${row.cost}</small></button><div class="wb-quick-mains">${recommendedMains(row.cost).map(name=>`<button data-bc-quick-species="${row.id}" data-main="${esc(name)}" aria-label="Preview ${esc(row.name)} with ${esc(name)}">${esc(name)}</button>`).join('')}</div></div>`;
}
function renderEchoEditor() {
 const matching = echoes.echoes.filter(item => (ui.cost === null || item.cost === ui.cost) && (!ui.sets.length || item.sonataSetIds.some(set => ui.sets.includes(set))) && item.name.toLowerCase().includes(ui.echoQuery.toLowerCase()));
 if (ui.sets.length) matching.sort((a, b) => ui.sets.findIndex(id => a.sonataSetIds.includes(id)) - ui.sets.findIndex(id => b.sonataSetIds.includes(id)));
 if(!ui.sets.length)matching.sort((a,b)=>{const ids=recommendedSetIds(person.id),rank=item=>Math.min(...item.sonataSetIds.map(id=>ids.includes(id)?ids.indexOf(id):Infinity));return rank(a)-rank(b);});
 const setOrder = recommendationOrder([...echoes.sonataSets].sort((a, b) => b.sourceId - a.sourceId),recommendedSetIds(person.id));
 const item = ui.preview;
 const unchanged = item && JSON.stringify(item) === JSON.stringify(draft().echoes[ui.slot]);
 const identity = item ? species(item.speciesId) : null;
 const error = validatePreview();
 const recommendedIds = recommendedSetIds(person.id);
 const filterOpen = ui.sonataOpen;
 const setFilter = sonataFilterMarkup(setOrder, recommendedIds, filterOpen);
 const costFilter = '<div class="wb-cost-buttons" role="group" aria-label="Filter by Cost">'+[null,4,3,1].map(cost => selectButton('data-bc-cost',cost ?? 'all',cost === null ? 'All' : 'Cost '+cost,false,ui.cost === cost)).join('')+'</div>';
 const slotAdvice=recommendedEchoSlot(person.id,ui.slot);
 const guide=slotAdvice?'<p class="wb-slot-guidance">Guide slot '+(ui.slot+1)+': <strong>Cost '+slotAdvice.cost+'</strong> · '+esc(slotAdvice.sourceText)+'</p>':'<p class="wb-slot-guidance">Slot recommendation Pending</p>';
 const browser = `<div class="wc-browser bc-echo-browser"><div class="wb-echo-filters"><div class="wc-filter">${setFilter}</div><div class="wb-cost-filter">${costFilter}</div></div>${guide}<div class="wc-catalog bc-catalog-grid">${matching.map(row => echoBrowseCard(row, identity?.id)).join('') || '<p>No matching Echoes</p>'}</div></div>`;

 let preview = '<div class="bc-inspector wc-preview"><p>Choose an Echo to preview</p></div>';
 if (item) {
  if(item.mainStat&&item.substats.every(row=>row?.name&&Number.isFinite(row.value))){item.level=item.substats.length*5;item.mainStat=clone(echoes.statEditor.mainStatsByCostAndLevel[item.cost][item.level].find(row=>row.name===item.mainStat.name));item.secondaryMainStat=clone(echoes.statEditor.secondaryMainStatsByCostAndLevel[item.cost][item.level]);}
  const main = choice(item.mainStat ? pretty(item.mainStat.name) + ' ' + statValue(item.mainStat.name,item.mainStat.value) : 'Choose Main Stat', mainStatOptions(item));
  const selectedSet = echoes.sonataSets.find(set => set.id === item.selectedSonataSetId);
  const setChoice = choice(selectedSet?.name ?? 'Sonata', identity.sonataSetIds.map(id => {
   const set = echoes.sonataSets.find(entry => entry.id === id);
   return `<button data-bc-sonata="${id}" class="${item.selectedSonataSetId === id ? 'selected' : ''}" aria-pressed="${item.selectedSonataSetId === id}">${set ? image(set.artPath, '', 'wb-set-icon') : ''}<span>${esc(set?.name ?? id)}</span></button>`;
  }).join(''));
  const alternatives = identity.sonataSetIds.filter(id => id !== item.selectedSonataSetId).map(id => echoes.sonataSets.find(set => set.id === id)).filter(Boolean);
  const alternativeIcons = alternatives.length ? `<span class="wb-alternate-sets" aria-label="Other available Sonata Sets">${alternatives.map(set => `<span title="${esc(set.name)}">${image(set.artPath, set.name, 'wb-set-icon')}</span>`).join('')}</span>` : '';
  const setWithIcon = selectedSet ? setChoice.replace('<summary>', '<summary>' + image(selectedSet.artPath, '', 'wb-set-icon') + '<span class="wb-current-set-name">').replace('</summary>', '</span>' + alternativeIcons + '</summary>') : setChoice;
  const mainDisplay = item.mainStat ? `<span>${esc(pretty(item.mainStat.name))}</span><strong>${statMarkup(item.mainStat.name,item.mainStat.value)}</strong>` : '<span>Choose Main Stat</span>';
  const mainChoice = main.replace('<details class="bc-choice">', '<details class="bc-choice"' + (!item.mainStat ? ' open' : '') + '>').replace(/<summary>.*?<\/summary>/, '<summary>' + mainDisplay + '</summary>');
  const art = previewStage(artForEcho(identity.id),'echo',ui.previewView).replace('</div>', '<div class="wb-sonata-choice wb-art-sonata">' + setWithIcon + '</div></div>');
  preview = `<div class="bc-inspector wc-preview wc-echo-preview"><div class="wb-echo-title"><h3>${esc(identity.name)}</h3><span class="wb-preview-cost">COST ${identity.cost}</span></div><div class="wb-hero">${art}<div class="wb-hero-stats"><div class="wb-feature-stat">${mainChoice}</div><div class="wb-support-stat"><span>${esc(pretty(item.secondaryMainStat?.name??'Pending'))}</span><b>${statMarkup(item.secondaryMainStat?.name??'Pending',item.secondaryMainStat?.value)}</b></div></div></div><div class="wb-echo-information">${substatEditorMarkup(item)}${echoSkillOverview(identity.skill)}</div>${sonataOverview(selectedSet,draft().echoes,ui.slot,item)}</div>`;

 }
 const actionLabel=unchanged?'Equipped':'Equip Echo';
  editor('echo', 'Echo Workshop · Slot ' + (ui.slot + 1), `<div class="wc-workbench">${browser}${preview}</div>`, `<button class="bc-quiet bc-danger" data-bc-unequip="echo" ${!draft().echoes[ui.slot] ? 'disabled' : ''}>Unequip</button><button class="bc-primary" data-bc-equip="echo" ${error || unchanged ? 'disabled' : ''}>${actionLabel}</button>`, `<input id="bcEchoSearch" class="bc-search wb-header-search" placeholder="Search Echoes" aria-label="Search Echoes" value="${esc(ui.echoQuery)}">`);
 if (item && error) $('#bcEditorError').textContent = error;
 rememberWorkshopPreview();
}
function openSkill(id) {
 if (!treeFor(person.id).nodes.some(node => node.id === id)) return;
 ui.returnSelector = '[data-bc-open="skills"]';
 showPanel('skill');
 ui.skillId = id;
 renderSkillEditor();
}
function renderSkillEditor() {
 const node = treeFor(person.id).nodes.find(item => item.id === ui.skillId);
 const level = draft().forte.levels[node.role];
 const active = forteNodeActive(treeFor(person.id), draft().forte, node.id);
 const tree = `<div class="wc-browser wc-skills-tree">${forteMarkup(person, draft().forte)}</div>`;
 const controls = node.kind === 'skill' ? `<div class="bc-stepper"><button data-bc-skill-step="-1" aria-label="Decrease Skill level" ${level === 0 ? 'disabled' : ''}>−</button><span>Lv. ${level}</span><button data-bc-skill-step="1" aria-label="Increase Skill level" ${level === 10 ? 'disabled' : ''}>+</button></div>` : node.kind === 'outro' ? '' : `<button class="bc-primary" data-wc-forte-toggle="true">${active ? 'Disable' : 'Unlock'}</button>`;
 const values = node.values?.length ? `<details class="wc-reading"><summary>Level values</summary><div class="bc-skill-values">${node.values.map(value => `<div><span>${esc(value.name)}</span><b>${esc(level > 0 ? value.levels?.[level - 1] ?? 'Pending' : '—')}</b></div>`).join('')}</div></details>` : '';
 const preview = `<div class="bc-inspector wc-preview"><div class="wc-art wc-skill-art">${image(node.assetPath)}</div><h3>${esc(node.name ?? 'Skill')}</h3><div class="wc-skill-controls">${controls}</div><details class="wc-reading"><summary>Description</summary><p>${esc(node.description ?? 'Pending source verification')}</p></details>${values}</div>`;
 editor('skill', 'Skills', `<div class="wc-workbench">${tree}${preview}</div>`);
 document.querySelectorAll('.wc-skills-tree .card-forte-node').forEach((element, index) => {
  const source = person.forte.nodes[index];
  element.dataset.bcSkill = source.id;
  element.tabIndex = 0;
  element.setAttribute('role', 'button');
  element.classList.toggle('wc-selected', source.id === ui.skillId);
  if (source.kind === 'skill' || source.kind === 'outro') {
   const label = document.createElement('span');
   label.className = 'bc-skill-label';
   label.textContent = source.kind === 'outro' ? 'Outro Skill' : source.name;
   element.append(label);
  }
 });
}
function openSequence(number) {
 ui.returnSelector = number ? '[data-bc-sequence="' + number + '"]' : '[data-bc-sequence-zero]';
 showPanel('sequence');
 const chains = sequences.characters.find(character => character.characterId === person.id)?.chains ?? [];
 const selected = chains.find(chain => chain.sequence === number);
 const browser = `<div class="wc-browser wc-sequence-list">${[0,1,2,3,4,5,6].map(level => {
  const chain = chains.find(item => item.sequence === level);
  return `<button class="wc-sequence-choice ${level === number ? 'selected' : ''}" data-bc-sequence="${level}">${chain ? image(chain.assetPath) : '<span class="wc-zero">S0</span>'}<span><small>S${level}</small><strong>${esc(chain?.name ?? (level === 0 ? 'No Sequence' : 'Pending'))}</strong></span></button>`;
 }).join('')}</div>`;
 const preview = `<div class="bc-inspector wc-preview">${selected ? `<div class="wc-art wc-sequence-art">${image(selected.assetPath)}</div>` : ''}<h3>${esc(selected?.name ?? 'S0')}</h3><div class="wc-meta"><span>Sequence ${number}</span><span>${draft().sequence === number ? 'Selected' : 'Preview'}</span></div>${selected ? `<details class="wc-reading"><summary>Effect</summary><p>${esc(selected.description)}</p></details>` : ''}</div>`;
 editor('sequence', 'Sequences', `<div class="wc-workbench">${browser}${preview}</div>`, `<button class="bc-primary" data-wc-sequence-commit="${number}" ${draft().sequence === number ? 'disabled' : ''}>${draft().sequence === number ? 'Selected' : 'Choose S' + number}</button>`);
}
function confirmInline(title,copy,action){return new Promise(resolve=>{if(ui.prompt)ui.prompt(false);ui.prompt=result=>{ui.prompt=null;$('#bcConfirm').hidden=true;$('#bcConfirm').replaceChildren();resolve(result);};$('#bcConfirm').hidden=false;$('#bcConfirm').innerHTML=`<h3>${esc(title)}</h3><p>${esc(copy)}</p><div><button class="bc-quiet" data-bc-confirm="no">Cancel</button><button class="bc-primary" data-bc-confirm="yes">${esc(action)}</button></div>`;$('#bcConfirm [data-bc-confirm="yes"]').focus();});}
render();
carousel=mountCarousel({selectedId:person.id,compactPresentation:true,accountOnly:true,accountLabel:'review account',ownsInteraction:node=>$('#bcConfirm').contains(node),beforeSelect:async()=>{rememberWorkshopPreview();return true;},onSelect:id=>{closeEditor(false);const next=clone(root);next.selected=id;if(!next.drafts[id])next.drafts[id]=freshDraft(id,treeFor(id));persist(next);person=CHARACTER_CATALOG.find(c=>c.id===id);ui.more=filterPrefs.read(buildPref('summary')).more===true;message();render();},preview:id=>accountCarouselPreview(CHARACTER_CATALOG.find(p=>p.id===id),store.session.storage)
});
$('#openGallery').addEventListener('click',()=>{if(ui.panel)closeEditor(false);});
$('#bcMore').onclick=()=>{ui.more=!ui.more;filterPrefs.write(buildPref('summary'),{more:ui.more});renderStats();};
renderAccount();
$('#bcSaved').textContent=inAccountMode(person.id)?'Current Build · saved':'Local draft · not yet on Account';
$('#bcAccount').onclick=async()=>{
 if(inAccountMode(person.id))return;
 const button=$('#bcAccount');button.disabled=true;
 try{
  if(saveFailed)throw saveFailed;
  root=await store.saveDraft(clone(draft()));
  $('#bcSaved').textContent='Current Build · saved';
  render();carousel.refresh();message('Character added. Future changes save automatically.');
 }catch(error){$('#bcSaved').textContent='NOT SAVED — Add Character failed';fail(error);button.disabled=false;}
};
$('#bcExport').onclick=()=>{const blob=new Blob([JSON.stringify({format:'bellibing-build-candidate',state:root},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='bellibing-build-review.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#bcImport').disabled=true;$('#bcImport').onchange=async event=>{try{const file=event.target.files?.[0];if(!file)return;if(file.size>5*1024*1024)throw Error('Review backup is too large.');const backup=safeDocument(JSON.parse(await file.text()));if(backup.format!=='bellibing-build-candidate')throw Error('This is not a Build candidate backup.');if(!await confirmInline('Import review backup?','This replaces only the isolated review drafts and review account.','Import'))return;root=store.restore(backup.state);location.reload();}catch(error){fail(error);}finally{event.target.value='';}};
document.addEventListener('input',event=>{if(event.target.id!=='wbCharacterSearch')return;const pos=event.target.selectionStart;characterQuery=event.target.value;saveCharacterBrowser();renderCharacterBrowser();const input=$('#wbCharacterSearch');input.focus();input.setSelectionRange(pos,pos);});
document.addEventListener('input',event=>{const id=event.target.id;if(id!=='bcWeaponSearch'&&id!=='bcEchoSearch')return;const pos=event.target.selectionStart;if(id==='bcWeaponSearch'){ui.weaponQuery=event.target.value;filterPrefs.write(buildPref('weapon'),{query:ui.weaponQuery});renderWeaponEditor();}else{ui.echoQuery=event.target.value;saveEchoFilters();renderEchoEditor();}const input=$('#'+id);input.focus();input.setSelectionRange(pos,pos);});
document.addEventListener('click',async event=>{
 const b=event.target.closest('button');if(!b)return;const a=b.dataset;
 try{
  if(a.bcConfirm){ui.prompt?.(a.bcConfirm==='yes');return;}
  if(b.hasAttribute('data-bc-close')){closeEditor();return;}
  if(a.wbView){ui.previewView=a.wbView;if(ui.panel==='weapon')renderWeaponEditor();else if(ui.panel==='echo')renderEchoEditor();}
  if(a.bcOpen==='character')openCharacterBrowser();
  if(a.wbCharacterPreview){characterPreview=a.wbCharacterPreview;characterSkill=null;saveCharacterBrowser();renderCharacterBrowser();}
  if(a.wbCharacterSkill){characterSkill=a.wbCharacterSkill;renderCharacterBrowser();}
  if(a.wbCharacterRarity){const rarity=Number(a.wbCharacterRarity);characterRarityFilter=characterRarityFilter===rarity?null:rarity;saveCharacterBrowser();renderCharacterBrowser();}
  if(a.wbCharacterWeapon){characterWeapon=characterWeapon===a.wbCharacterWeapon?null:a.wbCharacterWeapon;saveCharacterBrowser();renderCharacterBrowser();}
  if(a.wbCharacterElement){characterElement=characterElement===a.wbCharacterElement?null:a.wbCharacterElement;saveCharacterBrowser();renderCharacterBrowser();}
  if(a.wbCharacterBuild)await buildNewCharacter(a.wbCharacterBuild);
  if(a.bcOpen==='weapon')openWeapon();
  if(a.bcOpen==='skills')openSkill(treeFor(person.id).nodes.find(node=>node.kind==='skill')?.id);
  if(a.bcEcho!==undefined)openEcho(Number(a.bcEcho));
  if(a.bcWeaponId){ui.weaponPreview=a.bcWeaponId;rememberWorkshopPreview();renderWeaponEditor();renderWeapon();}
  if(a.bcWeaponRank){ui.weaponRank=Number(a.bcWeaponRank);rememberWorkshopPreview();renderWeaponEditor();renderWeapon();}
  if(a.bcEquip==='weapon'){
   const old=draft(),sameType=old.weaponId===ui.weaponPreview;
   const itemId=sameType&&old.weaponInstanceId?old.weaponInstanceId:crypto.randomUUID();
   change(d=>{d.weaponInstanceId=itemId;d.weaponId=ui.weaponPreview;d.weaponLevel=sameType?d.weaponLevel:90;d.weaponRank=ui.weaponRank;});
   renderWeaponEditor();
  }
  if(a.bcEquip==='echo'){
   const problem=validatePreview();if(problem)throw Error(problem);
   const card=committedPreview();
   change(d=>{d.echoes[ui.slot]=card;});
   renderEchoEditor();
  }
  if(a.bcUnequip){change(d=>{if(a.bcUnequip==='weapon'){d.weaponId=null;d.weaponInstanceId=null;}else d.echoes[ui.slot]=null;});closeEditor();}
   if(a.bcQuickSpecies){ui.preview=previewFrom(species(a.bcQuickSpecies),ui.preview);ui.preview.mainStat=clone(echoes.statEditor.mainStatsByCostAndLevel[ui.preview.cost][ui.preview.level].find(r=>r.name===a.main));ui.rollEditor=null;ui.rollMove=null;renderEchoEditor();}
  if(a.bcSpecies){ui.preview=previewFrom(species(a.bcSpecies),ui.preview);ui.rollEditor=null;ui.rollMove=null;renderEchoEditor();}
  if(a.bcCost){ui.cost=a.bcCost==='all'?null:Number(a.bcCost);filterPrefs.write(buildPref('echo-slot:'+ui.slot),{cost:ui.cost});renderEchoEditor();}
  if(a.bcSetFilter){if(a.bcSetFilter==='all')ui.sets=[];else if(ui.sets.includes(a.bcSetFilter))ui.sets=ui.sets.filter(s=>s!==a.bcSetFilter);else ui.sets.push(a.bcSetFilter);saveEchoFilters();renderEchoEditor();}
  if(a.bcLevel!==undefined){ui.rollEditor=null;ui.rollMove=null;const e=ui.preview;e.level=Number(a.bcLevel);e.substats=Array.from({length:e.level/5},(_,i)=>e.substats[i]??null);e.mainStat=clone(echoes.statEditor.mainStatsByCostAndLevel[e.cost][e.level].find(s=>s.name===e.mainStat?.name)??null);e.secondaryMainStat=clone(echoes.statEditor.secondaryMainStatsByCostAndLevel[e.cost][e.level]);renderEchoEditor();}
  if(a.bcMain){ui.preview.mainStat=clone(echoes.statEditor.mainStatsByCostAndLevel[ui.preview.cost][ui.preview.level??25].find(s=>s.name===a.bcMain));ui.rollEditor=null;renderEchoEditor();}
  if(a.bcSonata&&a.bcSonata!==ui.preview.selectedSonataSetId){ui.preview.selectedSonataSetId=a.bcSonata;renderEchoEditor();}
  if(a.wbRoll!==undefined){const index=Number(a.wbRoll);ui.rollMove=null;ui.rollEditor=ui.rollEditor===index?null:index;renderEchoEditor();}
  if(a.bcMoveCancel!==undefined){ui.rollMove=null;renderEchoEditor();}
  if(a.bcMoveConfirm!==undefined&&ui.rollMove){
   const {index,from,name}=ui.rollMove;
   if(ui.preview.substats[from]?.name===name){ui.preview.substats[index]=ui.preview.substats[from];ui.preview.substats[from]=null;}
   ui.rollMove=null;ui.rollEditor=index;renderEchoEditor();
  }
  if(a.bcRollName!==undefined){
   const index=Number(a.bcRollName);
   const previousIndex=ui.preview.substats.findIndex((roll,at)=>at!==index&&roll?.name===a.value);
   const previous=previousIndex>=0 ? ui.preview.substats[previousIndex] : ui.preview.substats[index]?.name===a.value ? ui.preview.substats[index] : null;
   if(previousIndex>=0){ui.rollMove={index,from:previousIndex,name:a.value};renderEchoEditor();}
   else{ui.rollMove=null;ui.preview.substats[index]={name:a.value,value:previous?.value??null};ui.rollEditor=index;renderEchoEditor();}
  }
  if(a.bcRollValue!==undefined&&!ui.rollMove){const index=Number(a.bcRollValue);ui.preview.substats[index]??={name:a.statName,value:null};ui.preview.substats[index].value=Number(a.value);ui.rollEditor=null;renderEchoEditor();}
  if(a.bcSequence!==undefined)openSequence(Number(a.bcSequence));
  if(b.hasAttribute('data-bc-sequence-zero'))openSequence(0);
  if(a.wcForteToggle){const node=treeFor(person.id).nodes.find(node=>node.id===ui.skillId);change(d=>{d.forte=updateForteNode(treeFor(person.id),d.forte,node.id,!forteNodeActive(treeFor(person.id),d.forte,node.id));});renderSkillEditor();}
  if(a.wcSequenceCommit!==undefined){change(d=>{d.sequence=Number(a.wcSequenceCommit);});openSequence(Number(a.wcSequenceCommit));}
  if(a.bcSkillStep){const node=treeFor(person.id).nodes.find(n=>n.id===ui.skillId);change(d=>{d.forte=updateForteNode(treeFor(person.id),d.forte,node.id,d.forte.levels[node.role]+Number(a.bcSkillStep));});renderSkillEditor();}
 }catch(error){fail(error);}
});
document.addEventListener('click',event=>{const n=event.target.closest('[data-bc-skill]');if(n)try{openSkill(n.dataset.bcSkill);}catch(error){fail(error);}});
document.addEventListener('toggle',event=>{
 if(event.target.matches?.('.wb-sonata-filter')&&ui.panel==='echo'){
  ui.sonataOpen=event.target.open;saveEchoFilters();
 }
},true);
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(ui.prompt){ui.prompt(false);return;}const open=$('#bcEditor details[open]');if(open){open.open=false;return;}closeEditor();}if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-bc-skill]')){event.preventDefault();openSkill(event.target.dataset.bcSkill);}});
globalThis.buildCandidateReview={snapshot:()=>clone(root),stats:allStats,storageKey:STORAGE_KEY,openEcho,openWeapon,selectCharacter:async id=>{if(!CHARACTER_CATALOG.some(c=>c.id===id))throw Error('Unknown Character');rememberWorkshopPreview();const next=clone(root);next.selected=id;if(!next.drafts[id])next.drafts[id]=freshDraft(id,treeFor(id));persist(next);carousel.setSelected(id);location.reload();},get panel(){return ui.panel;},get preview(){return clone(ui.preview);}};

document.querySelector('.bc-review>span').textContent='CONCEPT B / compact information / isolated review account';

installFixedScroll(document.querySelector(".bc-summary"), "wb-summary-frame", "Scroll Character details");
installFixedScroll(document.querySelector(".bc-right"), "wb-equipped-frame", "Scroll equipped Echoes");


globalThis.bellibingProductImport={stage:async (scan,issues=[])=>{
 closeEditor(false);
 try{root=store.stageImport(scan);}catch(error){renderAccount();throw error;}
 person=CHARACTER_CATALOG.find(c=>c.id===root.selected);
 const url=new URL(location.href);url.searchParams.set('character',person.id);url.searchParams.delete('import');history.replaceState(null,'',url);
 carousel.close();render();
 const pending=Array.isArray(issues)?issues:[];
 if(pending.length){
  $('#bcSaved').textContent='Import review · '+pending.length+' field(s) need correction';
  message('Import needs '+pending.length+' correction(s) before Add Character: '+formatScannerIssues(pending));
 }else message('Imported draft. Review Echo values († = source-derived secondary), then Add Character.');
}};
import('../../ui-lab/inventory/integration.js').catch(error=>message('Import/account tools unavailable: '+error.message));

// Outside interactions close the workbench after its local preview is preserved.
document.addEventListener('pointerdown',event=>{if(ui.panel&&!ui.prompt&&!$('#bcEditor').contains(event.target)&&!$('#bcConfirm').contains(event.target))try{closeEditor(false);}catch(error){fail(error);}},true);
window.addEventListener('pagehide',()=>{try{rememberWorkshopPreview();}catch{ /* Existing bytes remain available for recovery. */ }});

installChoiceDismissal(document);
installTransientChoiceDismissal(document,{selector:'#bcEditor .wb-substats',isOpen:()=>ui.rollEditor!==null,onClose:()=>{ui.rollEditor=null;ui.rollMove=null;renderEchoEditor();}});
