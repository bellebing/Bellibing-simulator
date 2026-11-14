import {mountCarousel} from '../../ui-lab/v1.1/modules/carousel.js';
import {accountCarouselPreview} from '../../ui-lab/v1.1/modules/account-carousel-preview.js';
import {readCharacterFocus} from '../../ui-lab/v1.1/modules/character-focus.js';
import {productAsset} from '../assets.js';
import {productLink} from '../product-navigation.js';
import {createProductStore} from '../product-store.js';
import {createUiPreferenceStore} from '../../../src/uiFilterPreferences.mjs';
import {exportAccount,parseBackup} from '../../../src/inventoryAccount.mjs';
import {CHARACTER_CATALOG} from '../../ui-lab/v1.1/modules/catalog.js';
import {escapeHtml as escape} from '../../ui-lab/v1.1/modules/util.js';
import {createReviewStore, freshDraft, accountWithDraft} from '../build-candidate/state.js';
import {emptyAccount, createAugustaPilotExampleBuilds, WEAPON_EFFECT_CATALOG} from '../build-candidate/models-entry.js';
import {statPreference, rollPresentation, rollSignalMarkup} from '../build-candidate/stat-guidance.js';
import {previewStage, echoSkillOverview, sonataOverview, weaponEffectsOverview} from '../build-candidate/workbench-b-presentation.js';
import {installFixedScroll} from '../build-candidate/edge-scroll.js';

const $ = selector => document.querySelector(selector);
const clone = structuredClone;
const buildURL = productLink('build');
const sources = ['echoes/browser-data.json', 'weapons/browser-data.json', 'skills-runtime.json', 'echoes/manifest.json', 'weapons/manifest.json'];
const [echoes, weapons, skills, echoArt, weaponArt] = await Promise.all(sources.map(async path => {
  const response = await fetch('/docs/ui-prototypes/assets/' + path);
  if (!response.ok) throw Error('Inventory source unavailable');
  return response.json();
}));
const catalog = {
  characters: CHARACTER_CATALOG,
  echoes: echoes.echoes,
  weapons: weapons.weapons,
  statEditor: echoes.statEditor,
  sourceBinding: 'BELLIBING_CANONICAL_LOCAL_REVIEW'
};
let store = await createProductStore(catalog, skills.characters);
let snapshot = store.snapshot();
const filterPrefs=createUiPreferenceStore(globalThis.localStorage,store.session.profile,store.session.store.snapshot()?.id??'empty-profile');
const initialBrowser=filterPrefs.read('inventory:browser');
let mode = 'account';
let kind = ['character','weapon','echo'].includes(initialBrowser.kind)?initialBrowser.kind:'echo';
let query = typeof initialBrowser.query==='string'?initialBrowser.query:'';
let selected = typeof initialBrowser.selected==='string'?initialBrowser.selected:null;
let artworkView = ['art','icon'].includes(initialBrowser.artworkView)?initialBrowser.artworkView:'art';
const saveBrowser=()=>filterPrefs.write('inventory:browser',{kind,query,selected,artworkView});
$('#ivSearch').value=query;
// The product Inventory uses the same canonical account store and portable
// backup format as the retained Account tools. No second account database.
const canonical=store.session;
const persisted=canonical.store;
const accountActions=document.createElement('section');
accountActions.className='iv-account-actions';
accountActions.setAttribute('aria-label','Account JSON backup and restore');
accountActions.innerHTML='<div class="iv-account-buttons"><button type="button" data-backup>Export Account JSON</button><button type="button" data-import-account>Import Account JSON</button><input type="file" data-restore accept="application/json,.json" aria-label="Select Account JSON backup" hidden></div><p data-account-status role="status" aria-live="polite"></p><div data-account-restore-preview></div>';
$('.iv-page > h1').after(accountActions);
const accountStatus=(text,error=false)=>{const node=accountActions.querySelector('[data-account-status]');node.textContent=text;node.classList.toggle('error',error);};
function downloadJson(value,name){
 const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportCurrentAccount(){
 const value=exportAccount(persisted.snapshot()??canonical.stage(),canonical.catalog);
 downloadJson(value,'Bellibing_Account_'+canonical.profile+'_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json');
 accountStatus('Account JSON downloaded. Keep a safe copy.');return value;
}
accountActions.querySelector('[data-backup]').onclick=()=>{try{exportCurrentAccount();}catch(error){accountStatus(error.message,true);}};
accountActions.querySelector('[data-import-account]').onclick=()=>accountActions.querySelector('[data-restore]').click();
accountActions.querySelector('[data-restore]').onchange=async event=>{
 const file=event.target.files?.[0];event.target.value='';if(!file)return;
 const preview=accountActions.querySelector('[data-account-restore-preview]');preview.replaceChildren();accountStatus('');
 try{
  if(!persisted.status().writable)throw Error('This account needs read-only recovery; import is blocked.');
  if(file.size>5*1024*1024)throw Error('Backup must be at most 5 MiB.');
  const imported=parseBackup(await file.text(),canonical.catalog),before=persisted.snapshot(),legacyBefore=canonical.legacyBytes();
  const occupied=!!before||!!legacyBefore;
  const weapons=Object.values(imported.items).filter(i=>i.kind==='weapon').length;
  const echoes=Object.values(imported.items).filter(i=>i.kind==='echo').length;
  const characters=Object.values(imported.characters).filter(c=>c.owned).length;
  const summary=document.createElement('p');summary.dataset.restoreSummary='';
  summary.textContent=`Import ${characters} owned Characters, ${weapons} Weapons, ${echoes} Echoes (${weapons+echoes} unique physical items) and ${imported.userData?.teams?.length??0} Teams. Their saved builds, Forte, settings, equipment assignments and item IDs will be preserved. ${occupied?'This REPLACES the current local account.':'This local profile is empty.'}`;
  const safeguard=document.createElement('button');safeguard.type='button';safeguard.dataset.backupBeforeRestore='';
  safeguard.textContent='1. Download backup of current account';
  const approval=document.createElement('label');approval.className='iv-restore-approval';
  approval.innerHTML='<input type="checkbox" data-approve-restore> I have saved my backup (if applicable) and explicitly approve this restore.';
  const confirm=document.createElement('button');confirm.type='button';confirm.dataset.confirmRestore='';
  confirm.textContent='Confirm account restore';confirm.disabled=true;
  const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancel';
  cancel.onclick=()=>preview.replaceChildren();
  let protectedCopy=!occupied;
  const unchanged=()=>{const now=persisted.snapshot();return (now?.id??null)===(before?.id??null)&&(now?.revision??null)===(before?.revision??null)&&canonical.legacyBytes()===legacyBefore;};
  safeguard.onclick=()=>{try{
   if(!unchanged())throw Error('Account changed. Review the JSON again.');
   exportCurrentAccount();protectedCopy=true;safeguard.disabled=true;safeguard.textContent='Current account backup downloaded';
   confirm.disabled=!approval.querySelector('input').checked;
  }catch(error){accountStatus(error.message,true);}};
  approval.querySelector('input').onchange=()=>{confirm.disabled=!(protectedCopy&&approval.querySelector('input').checked);};
  const note=document.createElement('p');
  note.textContent=occupied?'Save the current backup before replacement. Unsubmitted local Build drafts are separate and will be archived locally if the account identity changes.':'This only changes the selected local profile.';
  preview.append(summary,note);if(occupied)preview.append(safeguard);
  preview.append(approval,confirm,cancel);
  confirm.onclick=async()=>{try{
   if(!protectedCopy||!approval.querySelector('input').checked||!unchanged())throw Error('Approval, safety backup or account revision is missing. Re-select the JSON.');
   confirm.disabled=true;
   const draftKey='bellibing.product.build-drafts.v1:'+canonical.profile;
   const changeIdentity=imported.id!==(before?.id??canonical.stage().id);
   const rawDraft=changeIdentity?localStorage.getItem(draftKey):null;
   if(rawDraft)localStorage.setItem(draftKey+':before-account-restore:'+crypto.randomUUID(),rawDraft);
   await persisted.commit(imported,{expectedRevision:before?.revision??null,expectedAccountId:before?.id??null,reason:'EXPLICIT_JSON_RESTORE'});
   if(changeIdentity)localStorage.removeItem(draftKey);
   location.reload();
  }catch(error){confirm.disabled=false;accountStatus(error.message,true);}};
 }catch(error){accountStatus('Import rejected; saved account unchanged. '+error.message,true);}
};

const character = id => CHARACTER_CATALOG.find(person => person.id === id);
const setById = id => echoes.sonataSets.find(set => set.id === id);
const illustratedEchoIds = new Set(['echo-60001215', 'echo-60000975', 'echo-60001615', 'echo-60000235', 'echo-60000285']);

const asset = productAsset;
function image(path, label = '', className = '') {
  if (!path) return '';
  return `<img src="${escape(asset(path))}" alt="${escape(label)}" class="${className}" draggable="false">`;
}
function artwork(itemKind, id) {
  if (itemKind === 'character') return character(id)?.art;
  if (itemKind === 'echo' && illustratedEchoIds.has(id)) {
    return '/artifacts/build-ui-prototype/build-candidate/echo-art/' + id + '-illustrated.png';
  }
  const manifest = itemKind === 'echo' ? echoArt : weaponArt;
  return manifest.icons.find(icon => icon[itemKind + 'Id'] === id)?.targetPath;
}
function exampleAccount() {
  const example = createAugustaPilotExampleBuilds().find(build => build.characterId === 'augusta');
  const draft = freshDraft('augusta', skills.characters.find(person => person.characterId === 'augusta'));
  draft.weaponId = example.weapon.id;
  draft.weaponRank = example.weapon.rank;
  draft.weaponInstanceId = 'example-weapon';
  const names = ['The False Sovereign', 'Hurriclaw', 'Nightmare: Violet-Feathered Heron', 'Aero Predator', 'Baby Viridblaze Saurian'];
  draft.echoes = example.echoes.map((card, index) => {
    const identity = echoes.echoes.find(echo => echo.name === names[index]);
    const setName = index < 3 ? 'Crown of Valor' : 'Void Thunder';
    const set = echoes.sonataSets.find(candidate => candidate.name === setName);
    if (!identity.sonataSetIds.includes(set.id)) throw Error('Example Sonata assignment is incompatible');
    return {...clone(card), instanceId: 'example-echo-' + index, speciesId: identity.id, selectedSonataSetId: set.id};
  });
  return accountWithDraft(emptyAccount(), draft, catalog);
}
const demo = null;
const account = () => snapshot.account;
function equipment(person) {
  const build = person.record.build;
  const activeSet = build.echoSets.sets[build.echoSets.activeSetId];
  return [build.weaponInstanceId, ...activeSet.slots].filter(Boolean);
}
function ownerOf(itemId) {
  return Object.values(account().characters).find(person => equipment(person).includes(itemId));
}
function identity(item) {
  if (kind === 'character') return character(item.id);
  return (kind === 'echo' ? echoes.echoes : weapons.weapons).find(source => source.id === item.catalogId);
}
function number(value, percent = false) {
  if (!Number.isFinite(value)) return 'Pending';
  return new Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(percent ? value * 100 : value) + (percent ? '%' : '');
}
const statName = name => ({'Flat ATK': 'ATK', 'Flat HP': 'HP', 'Flat DEF': 'DEF'}[name] ?? name);
const statValue = stat => number(stat?.value, !!stat && !stat.name.startsWith('Flat '));
function ownerPortrait(person) {
  if (!person) return '';
  return `<span class="iv-owner-portrait" title="${escape(person.name)}" aria-label="Equipped by ${escape(person.name)}">${image(character(person.id)?.face, person.name)}</span>`;
}
function statPair(stat, primary = false) {
  return `<div class="iv-stat-pair ${primary ? 'primary' : ''}"><span>${escape(statName(stat?.name ?? 'Pending'))}</span><b>${statValue(stat)}</b></div>`;
}
function rollRows(card, personId) {
  return `<div class="iv-roll-list">${Array.from({length: 5}, (_, index) => {
    const roll = card.substats[index];
    return `<div class="bc-echo-roll iv-roll"><span>${roll ? escape(roll.name) + statPreference(personId, roll.name) : '+' + (index + 1) * 5}</span>${rollSignalMarkup()}<b>${roll ? rollPresentation(roll.name, roll.value, statValue(roll)) : 'Not rolled'}</b></div>`;
  }).join('')}</div>`;
}
function rows() {
  const items = kind === 'character'
    ? Object.values(account().characters).filter(person => person.owned)
    : Object.values(account().items).filter(item => item.kind === kind);
  return items.filter(item => identity(item)?.name.toLowerCase().includes(query.toLowerCase()));
}
function itemCard(item) {
  const source = identity(item);
  const owner = kind === 'character' ? null : ownerOf(item.id);
  let icon = '';
  let corner = '';
  let information = '';
  if (kind === 'character') {
    icon = image('/docs/ui-prototypes/assets/builder-icons/elements/' + source.element?.toLowerCase() + '.webp', source.element, 'iv-element');
    corner = 'S' + item.record.build.sequenceLevel;
  } else if (kind === 'echo') {
    const set = setById(item.data.selectedSonataSetId);
    icon = image(set?.artPath, set?.name, 'iv-element');
    corner = 'COST ' + source.cost;
    information = `<div class="iv-card-mains">${statPair(item.data.mainStat, true)}${statPair(item.data.secondaryMainStat)}</div>`;
  } else {
    information = `<div class="iv-card-mains">${weaponStats(item, source)}</div>`;
  }
  const art = `<div class="iv-card-art">${image(artwork(kind, source.id), source.name)}${kind === 'echo' ? '' : ownerPortrait(owner)}</div>`;
  if (kind === 'echo') return `<button class="iv-card iv-echo-card ${selected === item.id ? 'selected' : ''}" data-iv-item="${item.id}" data-rarity="${source.rarity ?? item.data?.rank ?? ''}">
    <div class="iv-echo-name"><strong>${escape(source.name)}</strong></div>
    <div class="iv-echo-art-stage">${icon}<span class="iv-cost">${corner}</span>${art}</div>
    ${information}${rollRows(item.data, owner?.id)}
    <div class="iv-card-owner">${ownerPortrait(owner)}</div>
  </button>`;
  return `<button class="iv-card ${selected === item.id ? 'selected' : ''}" data-iv-item="${item.id}" data-rarity="${source.rarity ?? item.data?.rank ?? ''}">
    <div class="iv-card-heading">${icon}<strong>${escape(source.name)}</strong><span class="iv-cost">${corner}</span></div>
    <div class="iv-card-body">${art}${information}</div>
    ${kind === 'echo' ? rollRows(item.data, owner?.id) : ''}
  </button>`;
}
function weaponStats(item, source) {
  const complete = item.data.level === 90;
  return `<div class="iv-stat-pair primary"><span>ATK</span><b>${number(complete ? source.level90BaseAtk : null)}</b></div>
    <div class="iv-stat-pair"><span>${escape(source.secondary?.stat ?? 'Pending')}</span><b>${number(complete ? source.secondary?.value : null, true)}</b></div>`;
}
function render() {
  $('#ivOrigin').textContent = 'Inventory';
  $('#ivExample').setAttribute('aria-pressed', mode === 'example');
  $('#ivAccount').setAttribute('aria-pressed', mode === 'account');
  $('.iv-tabs').innerHTML = [['character', 'Characters'], ['weapon', 'Weapons'], ['echo', 'Echoes']].map(([category, label]) => {
    const count = category === 'character' ? Object.values(account().characters).filter(person => person.owned).length : Object.values(account().items).filter(item => item.kind === category).length;
    return `<button data-iv-kind="${category}" aria-pressed="${kind === category}"><span>${label}</span><b>${count}</b></button>`;
  }).join('');
  const items = rows();
  if (!items.some(item => item.id === selected)) selected = items[0]?.id ?? null;
  $('#ivKind').textContent = {character: 'Characters', weapon: 'Weapons', echo: 'Echoes'}[kind];
  $('#ivCount').textContent = items.length + ' items';
  $('#ivGrid').classList.toggle('iv-echo-grid', kind === 'echo');
  $('#ivGrid').innerHTML = items.length ? items.map(itemCard).join('') : `<div class="iv-empty">No matching owned items.<a class="iv-action" href="${buildURL}">Open Build</a></div>`;
  renderInspector(items.find(item => item.id === selected));
}
function echoInspector(item, source, owner) {
  const set = setById(item.data.selectedSonataSetId);
  const equippedIds = owner ? equipment(owner) : [];
  const equipped = equippedIds.map(id => account().items[id]).filter(entry => entry?.kind === 'echo').map(entry => ({...entry.data, speciesId: entry.catalogId}));
  const slot = equipped.findIndex(entry => entry.speciesId === source.id);
  const stage = previewStage(artwork('echo', source.id), 'echo', artworkView);
  return `<div class="iv-preview-heading"><h2>${escape(source.name)}</h2><span>COST ${source.cost}</span></div>
    <div class="iv-preview-stage"><div class="iv-preview-set">${image(set?.artPath, set?.name)}<span>${escape(set?.name ?? 'Sonata pending')}</span></div>${stage}${ownerPortrait(owner)}</div>
    <div class="iv-preview-mains">${statPair(item.data.mainStat, true)}${statPair(item.data.secondaryMainStat)}</div>
    <div class="iv-preview-info"><section><h3>Substats</h3>${rollRows(item.data, owner?.id)}</section>${echoSkillOverview(source.skill)}</div>
    ${sonataOverview(set, equipped, slot, {...item.data, speciesId: source.id})}`;
}
let inspectedId=null;
function restoreInspectorDetails(item) {
 const host=$('#ivInspector');inspectedId=item?.id??null;
 const saved=inspectedId?filterPrefs.read('inventory:inspector:'+inspectedId):{};
 if(Array.isArray(saved.expanded))host.querySelectorAll('details').forEach((node,index)=>{node.open=saved.expanded.includes(index);});
}
function renderInspector(item) {
  const host = $('#ivInspector');
  if (!item) {
    host.innerHTML = '<div class="iv-empty">Select an item</div>';
    restoreInspectorDetails(null);
    return;
  }
  const source = identity(item);
  const owner = kind === 'character' ? null : ownerOf(item.id);
  if (kind === 'echo') {
    host.innerHTML = echoInspector(item, source, owner);
    restoreInspectorDetails(item);
    return;
  }
  if (kind === 'character') {
    const references = equipment(item).map(id => account().items[id]).filter(Boolean);
    host.innerHTML = `<h2>${escape(source.name)}</h2>${image(artwork(kind, source.id), source.name, 'iv-hero')}
      <div class="iv-meta"><span>${escape(source.element)}</span><span>${escape(source.weaponType)}</span><span>S${item.record.build.sequenceLevel}</span></div>
      <section class="iv-section"><h3>Equipped</h3>${references.map(entry => {
        const equipmentSource = (entry.kind === 'echo' ? echoes.echoes : weapons.weapons).find(candidate => candidate.id === entry.catalogId);
        return `<div class="iv-mini">${image(artwork(entry.kind, entry.catalogId), equipmentSource?.name)}<span>${escape(equipmentSource?.name ?? 'Pending')}</span></div>`;
      }).join('')}</section><button class="iv-action" data-iv-build="${item.id}">Open Build</button>`;
    restoreInspectorDetails(item);
    return;
  }
  host.innerHTML = `<h2>${escape(source.name)}</h2><div class="iv-preview-stage">${previewStage(artwork(kind, source.id), 'weapon', artworkView)}${ownerPortrait(owner)}</div>
    <div class="iv-meta"><span>Lv. ${item.data.level}</span><span>R${item.data.refinement}</span></div>
    <div class="iv-preview-mains">${weaponStats(item, source)}</div>
    ${weaponEffectsOverview(WEAPON_EFFECT_CATALOG.filter(effect => effect.weaponId === source.id), item.data.refinement)}`;
  restoreInspectorDetails(item);
}
$('#ivSearch').addEventListener('input', event => {
  query = event.target.value;
  saveBrowser();
  render();
});
function useAccount(nextMode) {
  store = store;
  snapshot = {...store.snapshot(),account:persisted.snapshot()??store.snapshot().account};
  mode = nextMode;
  selected = null;
  render();
}
$('#ivExample').onclick = () => useAccount('example');
$('#ivAccount').onclick = () => useAccount('account');
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.ivKind) {
    kind = button.dataset.ivKind;
    selected = null;
    saveBrowser();
    render();
  }
  if (button.dataset.ivItem) {
    selected = button.dataset.ivItem;
    if(kind==='character')inventoryCarousel.setSelected(selected);
    artworkView = 'art';
    saveBrowser();
    render();
  }
  if (button.dataset.wbView) {
    artworkView = button.dataset.wbView;
    saveBrowser();
    renderInspector(rows().find(item => item.id === selected));
  }
  if (button.dataset.ivBuild) {
    if (mode === 'account') {
      const next = clone(snapshot);
      if (!next.drafts[button.dataset.ivBuild]) return;
      next.selected = button.dataset.ivBuild;
      store.commit(next);
    }
    location.href = productLink('build',{character:button.dataset.ivBuild});
  }
});
$('#ivInspector').addEventListener('toggle',event=>{
 if(!event.target.matches('details')||!inspectedId)return;
 const expanded=[...$('#ivInspector').querySelectorAll('details')].flatMap((node,index)=>node.open?[index]:[]);
 filterPrefs.write('inventory:inspector:'+inspectedId,{expanded});
},true);
addEventListener('storage', event => {
  if (event.key === 'bellibing.build-candidate.review.v1' && mode === 'account') useAccount('account');
});
render();
// AccountStore is the live authority even while Inventory stays open in another tab.
// Never refresh this view from the local Build draft (which may be Preview).
persisted.subscribe(value=>{
 if(!value)return;
 snapshot={...snapshot,account:value};
 render();
});
installFixedScroll($('#ivGrid'), 'iv-grid-frame', 'Scroll Inventory', {anchor: $('.iv-browser'), edge: 'right'});
installFixedScroll($('#ivInspector'), 'iv-inspector-frame', 'Scroll item details', {anchor: $('#ivInspector'), edge: 'right'});


const heading=document.createElement('div');heading.className='heading-carousel';
heading.innerHTML='<div class="ribbon-rest"><div class="portraits" id="portraits"></div><button id="openGallery" class="expand-gallery" aria-expanded="false" aria-controls="characterGallery" aria-label="Browse account Characters">⌄</button></div>';
document.querySelector('#productNavigation').append(heading);
const gallery=document.createElement('div');gallery.className='carousel-anchor global-carousel-anchor';gallery.innerHTML='<section id="characterCarousel" class="character-ribbon" aria-label="Character selector"></section>';document.body.append(gallery);
const inventoryCarousel=mountCarousel({selectedId:readCharacterFocus(snapshot.selected),compactPresentation:true,accountOnly:true,preview:id=>accountCarouselPreview(character(id),store.session.storage),onSelect:id=>{kind='character';selected=id;render();}});
