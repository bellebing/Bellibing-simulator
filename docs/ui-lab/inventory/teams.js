import {accountSession} from './account-session.js';
import {saveOwnedTeam} from '../../../src/inventoryAccount.mjs';
import {openSelectionDialog} from '../v1.1/modules/selection-dialog.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const session=await accountSession(),{store,catalog,profile}=session;
const host=document.querySelector('[data-owned-teams]');
const link=id=>{const u=new URL('../build/',location.href);u.searchParams.set('character',id);if(profile!=='default')u.searchParams.set('profile',profile);return u.href;};
const portrait=id=>'../ui-preview/assets/characters/portraits/'+encodeURIComponent(id)+'.png';
let selectedId=null,draft=null,expectedRevision=null,error='';
const face=id=>`<img class="team-face small" src="${portrait(id)}" alt="">`;
function edit(team=null){
 const account=store.snapshot();expectedRevision=account?.revision??null;
 draft=team?structuredClone(team):{id:null,name:'New team',characterIds:[null,null,null]};error='';render();
}
function render(){
 const account=store.snapshot(),teams=account?.userData?.teams??[],owned=Object.values(account?.characters??{}).filter(c=>c.owned);
 const team=draft??teams.find(t=>t.id===selectedId)??teams[0];if(team&&!draft)selectedId=team.id;
 const names=id=>account?.characters[id]?.name??'Choose Character';
 host.innerHTML=`<div class="team-page-heading"><div><span class="eyebrow">YOUR ROSTER, TOGETHER</span><h1>Build a Team</h1></div><button type="button" data-new-team ${owned.length<3||!store.status().writable?'disabled':''}>New team +</button></div>
 <div class="team-layout"><aside class="saved-teams"><div class="saved-heading"><h3>My Teams</h3></div>${teams.map(t=>`<button type="button" class="saved-team ${selectedId===t.id&&!draft?'selected':''}" data-team="${esc(t.id)}"><span class="saved-team-top"><strong>${esc(t.name)}</strong><span>Pending</span></span><span class="saved-portraits">${t.characterIds.map(face).join('')}</span></button>`).join('')}${!teams.length?'<p>No saved teams.</p>':''}</aside>
 <section class="team-workspace"><div class="team-workspace-heading"><div><span class="eyebrow">${draft?'EDIT TEAM':'SAVED TEAM'}</span>${draft?`<label>Team name<input data-team-name maxlength="80" value="${esc(draft.name)}"></label>`:`<h2>${esc(team?.name??'My Teams')}</h2>`}</div><div class="team-dps"><span>Team DPS</span><strong>Pending</strong></div></div>
 ${team?`<div class="team-members">${team.characterIds.map((id,index)=>{
  const c=account.characters[id],b=c?.record.build,weapon=account.items[b?.weaponInstanceId],slots=b?.echoSets?.sets?.[b.echoSets.activeSetId]?.slots??[];
  return `<article class="team-member"><div class="member-art">${id?`<img class="team-face" src="${portrait(id)}" alt="${esc(names(id))}">`:''}<span class="member-number">0${index+1}</span></div><h3>${esc(names(id))}</h3><div class="member-damage"><strong>Pending</strong><span>Character DPS</span></div><div class="member-equipment"><strong>${esc(catalog.weapons.find(w=>w.id===weapon?.catalogId)?.name??'Weapon not entered')}</strong><span>${slots.filter(Boolean).length} / 5 Echoes</span><details><summary>Owned equipment</summary>${slots.map((itemId,i)=>`<p>${i+1} · ${esc(catalog.echoes.find(e=>e.id===account.items[itemId]?.catalogId)?.name??'Empty')}</p>`).join('')}</details></div>${draft?`<button type="button" data-choose-member="${index}">Choose Character</button>`:`<a class="owned-button" href="${link(id)}">Open Build →</a>`}</article>`;
 }).join('')}</div><div class="team-bottom">${draft?'<button type="button" data-save-team>Save team</button><button type="button" data-cancel-team>Cancel</button>':'<button type="button" data-edit-team>Edit team</button>'}</div>`:`<p>${owned.length<3?'Save three Characters in Build to create a team.':'Choose New team to use your saved Characters.'}</p>`}
 <p role="status" data-team-status>${esc(error)}</p></section></div>`;
 host.querySelector('[data-new-team]').onclick=()=>edit();
 host.querySelectorAll('[data-team]').forEach(button=>button.onclick=()=>{selectedId=button.dataset.team;draft=null;error='';render();});
 host.querySelector('[data-edit-team]')?.addEventListener('click',()=>edit(team));
 host.querySelector('[data-cancel-team]')?.addEventListener('click',()=>{draft=null;error='';render();});
 host.querySelector('[data-team-name]')?.addEventListener('input',e=>{draft.name=e.target.value;});
 host.querySelectorAll('[data-choose-member]').forEach(button=>button.onclick=()=>{
  const index=Number(button.dataset.chooseMember);
  openSelectionDialog({title:'Choose saved Character',trigger:button,selectedId:draft.characterIds[index],choices:owned.filter(c=>!draft.characterIds.includes(c.id)||draft.characterIds[index]===c.id).map(c=>({id:c.id,name:c.name,art:portrait(c.id)})),onChoose:id=>{draft.characterIds[index]=id;render();}});
 });
 host.querySelector('[data-save-team]')?.addEventListener('click',async()=>{try{
  const before=store.snapshot();if(before?.revision!==expectedRevision)throw Error('Inventory changed. Reopen the team before saving.');
  const next=saveOwnedTeam(before,draft,catalog),savedId=next.userData.teams.find(t=>t.id===draft.id)?.id??next.userData.teams.at(-1).id;
  await store.commit(next,{expectedRevision,expectedAccountId:before.id,reason:'EXPLICIT_TEAM_SAVE'});selectedId=savedId;draft=null;error='';render();
 }catch(e){error=e.message;render();}});
}
store.subscribe(()=>{if(draft){error='Inventory changed. Reopen the team before saving.';}render();});render();
