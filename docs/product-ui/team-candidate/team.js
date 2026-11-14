import {mountCarousel} from '../../ui-lab/v1.1/modules/carousel.js';
import {accountCarouselPreview} from '../../ui-lab/v1.1/modules/account-carousel-preview.js';
import {readCharacterFocus,setCharacterFocus} from '../../ui-lab/v1.1/modules/character-focus.js';
import {productInvestmentPending} from '../../../src/productBuildDraft.mjs';
import {productAsset} from '../assets.js';
import {productLink} from '../product-navigation.js';
import {createProductStore} from '../product-store.js';
import {createUiPreferenceStore} from '../../../src/uiFilterPreferences.mjs';
import {saveOwnedTeam} from '../../../src/inventoryAccount.mjs';
import {ALTERNATIVE_TEAM_CONTEXTS} from '../../../src/data/alternativeTeamContexts.ts';
import {suggestAccountTeams} from './team-suggestions.js';
import {CHARACTER_CATALOG, WEAPON_CATALOG} from '../../ui-lab/v1.1/modules/catalog.js';
import {escapeHtml as escape} from '../../ui-lab/v1.1/modules/util.js';
import {createReviewStore, projectDraftStats} from '../build-candidate/state.js';

const $ = selector => document.querySelector(selector);
const people = new Map(CHARACTER_CATALOG.map(person => [person.id, person]));
const asset = productAsset;
const image = (path, className = '') => path?`<img class="${className}" src="${escape(asset(path))}" alt="" draggable="false">`:'<span class="tc-art-unavailable" aria-label="Artwork unavailable"></span>';
const resources = ['build-stats/runtime-data.json', 'weapons/browser-data.json', 'echoes/browser-data.json', 'skills-runtime.json', 'sequence-runtime.json','echoes/manifest.json','weapons/manifest.json'];
const [facts, weapons, echoes, skills, sequences,echoArt,weaponArt] = await Promise.all(resources.map(async path => {
  const response = await fetch('/docs/ui-prototypes/assets/' + path);
  if (!response.ok) throw new Error('Team source unavailable');
  return response.json();
}));
const catalog = {characters: CHARACTER_CATALOG, echoes: echoes.echoes, weapons: weapons.weapons, statEditor: echoes.statEditor, sourceBinding: 'BELLIBING_CANONICAL_LOCAL_REVIEW'};
const domain = {facts, weapons, echoes, trees: skills.characters, sequences: sequences.characters};
const echoImage=id=>echoArt.icons.find(item=>item.echoId===id)?.targetPath;
const weaponImage=id=>weaponArt.icons.find(item=>item.weaponId===id)?.targetPath;
const reviewStore = await createProductStore(catalog, skills.characters);
const account = reviewStore.snapshot();
const filterPrefs=createUiPreferenceStore(globalThis.localStorage,reviewStore.session.profile,reviewStore.session.store.snapshot()?.id??'empty-profile');
let inspectedCharacterId=null;
const examples = ['augusta', 'iuno', 'the-shorekeeper', 'jiyan', 'mortefi', 'verina'];
const modes = new Map([
  ['general', 'General play'], ['open-world', 'Open world'],
  ['matrix', 'Endstate Matrix'], ['tower', 'Tower of Adversity'], ['wastes', 'Whimpering Wastes']
]);
const state = {
  example: false,
  mode: 'general', selectedTeam: 0, selectedMember: 0,
  teams: [],
};
const currentTeam = () => state.teams[state.selectedTeam];
const ownedIds = () => state.example ? examples : Object.keys(account.account.characters).filter(id => account.account.characters[id].owned);
const assignedElsewhere = id => state.teams.some((team, index) => index !== state.selectedTeam && team.includes(id));
const available = id => ownedIds().includes(id) && !assignedElsewhere(id)
  && !currentTeam().some((member, index) => index !== state.selectedMember && member === id);
let selector=null;
function focusTeamCharacter(id){
 const index=state.teams.findIndex(team=>team.includes(id));
 if(index>=0){state.selectedTeam=index;state.selectedMember=state.teams[index].indexOf(id);}
 setCharacterFocus(id);
}

function resetTeams() {
  const saved=account.account.userData?.teams??[];
  const suggestions=suggestAccountTeams(ownedIds(),ALTERNATIVE_TEAM_CONTEXTS,saved.flatMap(team=>team.characterIds));
  state.teams=[...saved.map(team=>[...team.characterIds]),...suggestions.map(team=>team.characterIds)];
  if(!state.teams.length)state.teams=[[null,null,null]];
  state.teamRecords=[...saved.map(team=>({...team})),...suggestions.map(()=>null)];
  state.contexts=[...saved.map(()=>null),...suggestions.map(team=>team.context)];
  state.teamNames=state.teams.map((team,index)=>saved[index]?.name??(team.find(Boolean)?people.get(team.find(Boolean)).name+' Core':'Your teams'));
  state.selectedTeam = 0;
  state.selectedMember = Math.max(0,state.teams[0].findIndex(Boolean));
  const focus=readCharacterFocus(ownedIds()[0]??'augusta');
  focusTeamCharacter(focus);
  selector?.setSelected(focus);
}
function render() {
  const roster = ownedIds();
  const used = new Set(state.teams.flat().filter(Boolean));
  $('#tcOrigin').textContent = state.example ? 'LOCAL TEAM CONCEPT / example roster / memory-only plan' : 'LOCAL TEAM CONCEPT / Build review account / memory-only plan';
  $('#tcRosterCount').textContent = roster.length + ' account Characters';
  $('.tc-plan-state').textContent='Temporary · DPS ranking pending';
  $('#tcModes').innerHTML = [...modes].map(([id, label]) => `<button class="tc-mode ${state.mode === id ? 'selected' : ''}" data-mode="${id}" aria-pressed="${state.mode === id}" ${id!=='general'?'disabled title="Mode-specific planning is not connected yet"':''}>${label}</button>`).join('');
  $('#tcTeams').innerHTML = state.teams.map((team, index) => `<button class="tc-team ${index === state.selectedTeam ? 'selected' : ''}" data-team="${index}" aria-pressed="${index === state.selectedTeam}"><strong>${escape(state.teamNames[index])}</strong><span>${team.filter(Boolean).map(id => image(people.get(id).face)).join('')}<small>${team.filter(Boolean).length}/3</small></span><span class="tc-team-state">${state.teamRecords[index]?'Saved team':team.filter(Boolean).length===3?'Source-based suggestion':'Incomplete team'}</span></button>`).join('');
  $('#tcAvailable').innerHTML = roster.filter(id => !used.has(id)).map(id => `<div class="tc-available-person">${image(people.get(id).face)}<span>${escape(people.get(id).name)}</span><small>Available</small></div>`).join('') || '<p class="tc-inspector-meta">' + (roster.length ? 'All Characters assigned' : 'Add Characters in Build to start your roster') + '</p>';
  $('#tcPurpose').textContent = state.teamRecords[state.selectedTeam]?'Saved team':'Account team suggestion';
  $('#tcTeamName').textContent = state.teamNames[state.selectedTeam];
  const nameInput=$('#tcNameInput');if(nameInput)nameInput.value=$('#tcTeamName').textContent;
  $('#tcMembers').innerHTML = currentTeam().map((id, slot) => {
    const person = people.get(id);
    if (!person) return `<article class="tc-member tc-member-empty tc-member-missing"><span class="tc-member-slot">0${slot+1}</span><span class="tc-missing-mark" aria-hidden="true">◇</span><h3>Not filled</h3><small>More account Characters needed</small></article>`;
    const invested=account.account.characters[id]?.record?.build;
    const draft=account.savedDrafts[id];
    const equipped=account.account.items[invested?.weaponInstanceId];
    const equippedWeapon=WEAPON_CATALOG.find(item=>item.id===equipped?.catalogId);
    const elementArt='/docs/ui-prototypes/assets/builder-icons/elements/'+person.element.toLowerCase()+'.webp';
    const slots=draft?.echoes??[];
    return `<article class="tc-member ${slot === state.selectedMember ? 'selected' : ''}" data-inspect="${slot}" tabindex="0" role="button" aria-label="Inspect ${escape(person.name)}">
     <div class="tc-member-visual"><span class="tc-member-slot">0${slot+1}</span>${image(elementArt,'tc-member-element')}${image(person.art,'tc-member-art')}<span class="tc-member-level">Lv. ${invested?.characterLevel??'?'}</span></div>
     <div class="tc-member-copy"><div class="tc-member-identity"><h3>${escape(person.name)}</h3><span>S${invested?.sequenceLevel??'?'}</span></div>
     <div class="tc-member-dps"><span>DPS contribution</span><b>Pending</b></div>
     <div class="tc-member-equipment">${equippedWeapon?image(weaponImage(equippedWeapon.id)):''}<div><strong>${escape(equippedWeapon?.name??'No weapon equipped')}</strong>${equippedWeapon?`<small>Lv. ${equipped?.data.level??'?'} · R${equipped?.data.refinement??'?'}</small>`:''}</div></div>
     <div class="tc-member-echoes"><span>Echoes</span><b>${slots.filter(Boolean).length}/5</b><div>${Array.from({length:5},(_,index)=>slots[index]?image(echoImage(slots[index].speciesId)):'<i aria-label="Empty Echo slot"></i>').join('')}</div></div>
     <a class="tc-open-build" href="${productLink('build',{character:id})}">Open Build <span aria-hidden="true">↗</span></a></div></article>`;
  }).join('');
  $('#tcRotation').innerHTML = currentTeam().map(id => `<span>${id ? escape(people.get(id).name) : 'Choose Character'}</span>`).join('<i>→</i>');
  $('#tcExecution').textContent = 'Team order shown. Executable rotation and DPS pending verified team evaluation.';
  $('#tcAllocation').textContent = ['matrix', 'tower', 'wastes'].includes(state.mode)
    ? 'Each Character is assigned once in this draft plan. Cycle-specific uses, encounters and scoring are pending source integration.'
    : 'Every assigned Character belongs to one team in this plan. Available Characters can fill the remaining slots.';
  renderDetails();
  const save=$('#tcSave');if(save)save.disabled=currentTeam().filter(Boolean).length!==3;
  selector?.refresh();
}
function renderDetails() {
  const id = currentTeam()[state.selectedMember];
  inspectedCharacterId=id??null;
  const person = people.get(id);
  if (!person) {
    $('#tcDetails').innerHTML = '<h2>Character details</h2><p class="bc-inspector-meta">Choose a team member</p>';
    return;
  }
  const draft = state.example ? null : account.savedDrafts[id];
  const build=account.account.characters[id]?.record?.build;
  const equipment=account.account.items[build?.weaponInstanceId];
  const weapon = WEAPON_CATALOG.find(weapon => weapon.id === draft?.weaponId);
  let stats = null;
  if (draft && !productInvestmentPending(account.account,id,person.forte)) {
    try { stats = projectDraftStats(draft, domain); }
    catch { stats = null; }
  }
  const values = [['HP', stats?.hp], ['ATK', stats?.atk], ['DEF', stats?.def]];
  const otherMembers=currentTeam().filter((member,index)=>member&&index!==state.selectedMember);
  const alternatives=ownedIds().filter(candidate=>candidate!==id&&available(candidate)).map(candidate=>({candidate,
   reviewed:otherMembers.length===2&&ALTERNATIVE_TEAM_CONTEXTS.some(row=>row.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY'&&row.characterIds.includes(candidate)&&otherMembers.every(member=>row.characterIds.includes(member)))}))
   .sort((a,b)=>Number(b.reviewed)-Number(a.reviewed));
  const context=state.contexts[state.selectedTeam];
  $('#tcDetails').innerHTML = `<h2>${escape(person.name)}</h2>${image(person.art, 'tc-detail-art')}
    <section class="tc-detail-section"><h3>Equipped build</h3>${weapon ? `<div class="tc-weapon">${image(weaponImage(weapon.id))}<div><strong>${escape(weapon.name)}</strong><small>Lv. ${equipment?.data.level??'?'} · R${equipment?.data.refinement??'?'}</small></div></div>` : '<p>Weapon not equipped</p>'}
    <div class="tc-detail-row"><span>Echoes</span><b>${draft ? draft.echoes.filter(Boolean).length + '/5' : '—'}</b></div>${values.map(([name, value]) => `<div class="tc-detail-row"><span>${name}</span><b>${Number.isFinite(value) ? value.toLocaleString('en-US', {maximumFractionDigits: 1}) : draft ? 'Pending' : '—'}</b></div>`).join('')}</section>
    ${context?`<details class="tc-team-conditions" ${filterPrefs.read('teams:conditions:'+id).open?'open':''}><summary>Team conditions</summary><p>${escape(context.whySv)}</p>${context.conditionsSv.map(condition=>'<p>'+escape(condition)+'</p>').join('')}</details>`:''}
    <section class="tc-detail-section"><h3>Alternatives</h3>${alternatives.length?alternatives.map(({candidate,reviewed})=>`<button class="tc-alternative" data-replace-with="${candidate}">${image(people.get(candidate).face)}<span>${escape(people.get(candidate).name)}</span>${reviewed?'<small>Source option</small>':''}</button>`).join(''):'<p>No unassigned alternatives on this account</p>'}</section>`;
}
function choose(slot) {
  state.selectedMember = slot;
  const id = currentTeam()[slot] ?? ownedIds().find(available);
  if (!id) {
    $('#tcMessage').textContent = 'No unassigned account Characters available';
    return;
  }
  renderDetails();
  selector.setSelected(id);
  selector.open();
}
$('#tcDetails').addEventListener('toggle',event=>{
 if(event.target.matches('.tc-team-conditions')&&inspectedCharacterId){
  filterPrefs.write('teams:conditions:'+inspectedCharacterId,{open:event.target.open});
 }
},true);
resetTeams();
render();
selector=mountCarousel({selectedId:readCharacterFocus(ownedIds()[0]??'augusta'),compactPresentation:true,accountOnly:true,preview:id=>accountCarouselPreview(people.get(id),reviewStore.session.storage),onSelect:id=>{focusTeamCharacter(id);render();}});
document.addEventListener('click', event => {
  const inspected=event.target.closest('[data-inspect]');
  if(inspected&&!event.target.closest('a')){state.selectedMember=Number(inspected.dataset.inspect);const id=currentTeam()[state.selectedMember];if(id)selector.setSelected(id);render();return;}
  const button = event.target.closest('button');
  if (!button) return;
  if(button.dataset.replaceWith&&available(button.dataset.replaceWith)){
    currentTeam()[state.selectedMember]=button.dataset.replaceWith;
    state.contexts[state.selectedTeam]=ALTERNATIVE_TEAM_CONTEXTS.find(row=>row.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY'&&row.characterIds.every(id=>currentTeam().includes(id)))??null;
    render();return;
  }
  if (button.dataset.mode) { state.mode = button.dataset.mode; render(); }
  if (button.dataset.team !== undefined) {
    selector.close(); state.selectedTeam = Number(button.dataset.team); state.selectedMember = Math.max(0,currentTeam().findIndex(Boolean));
    const member = currentTeam()[0] ?? ownedIds().find(available);
    if (member) selector.setSelected(member);
    render();
  }
  if (button.dataset.inspect !== undefined) { state.selectedMember = Number(button.dataset.inspect); render(); }
  if (button.dataset.choose !== undefined) choose(Number(button.dataset.choose));
  if (button.id === 'tcRemove') { currentTeam()[state.selectedMember] = null; render(); }
});
$('#tcAdd').onclick = () => {
  state.teams.push([null, null, null]); state.selectedTeam = state.teams.length - 1; state.selectedMember = 0; render();
};
$('#tcExample').onclick = () => { selector.close(); state.example = true; resetTeams(); render(); };
$('#tcAccount').onclick = () => { selector.close(); state.example = false; resetTeams(); render(); };
globalThis.teamCandidateReview = {snapshot: () => structuredClone(state), available: () => ownedIds().filter(available)};
document.addEventListener('input',event=>{if(event.target.id==='tcNameInput')state.teamNames[state.selectedTeam]=event.target.value;});
document.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)&&event.target.matches('.tc-member[data-inspect]')){event.preventDefault();state.selectedMember=Number(event.target.dataset.inspect);const id=currentTeam()[state.selectedMember];if(id)selector.setSelected(id);render();}});


const saveTeamButton=document.createElement('button');saveTeamButton.className='bc-account';saveTeamButton.textContent='Save team';saveTeamButton.id='tcSave';document.querySelector('.tc-workbench').append(saveTeamButton);
saveTeamButton.onclick=async()=>{try{const owner=reviewStore.session, before=owner.store.snapshot();if(!before)throw Error('Add Characters to your account in Build first.');if(before.revision!==account.account.revision)throw Error('Account changed. Reload before saving.');const previous=state.teamRecords[state.selectedTeam];const next=saveOwnedTeam(before,{id:previous?.id??null,name:$('#tcNameInput').value,characterIds:currentTeam()},owner.catalog);const saved=await owner.store.commit(next,{expectedRevision:before.revision,expectedAccountId:before.id,reason:'EXPLICIT_TEAM_SAVE'});account.account=saved;state.teamRecords[state.selectedTeam]=saved.userData.teams.find(team=>team.id===previous?.id)??saved.userData.teams.at(-1);render();$('#tcMessage').textContent='Team saved.';}catch(error){$('#tcMessage').textContent=error.message;}};

const teamActions=document.createElement('div');teamActions.className='tc-team-actions';teamActions.innerHTML='<label>Team name<input id="tcNameInput" maxlength="80" aria-label="Team name"></label><button type="button" id="tcCancelChanges">Cancel changes</button>';document.querySelector('.tc-workbench').append(teamActions);teamActions.append(saveTeamButton);$('#tcNameInput').value=$('#tcTeamName').textContent;$('#tcCancelChanges').onclick=()=>{selector.close();resetTeams();render();$('#tcMessage').textContent='';};
saveTeamButton.disabled=currentTeam().filter(Boolean).length!==3;
