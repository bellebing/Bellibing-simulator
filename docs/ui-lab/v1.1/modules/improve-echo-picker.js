import {recommendedMainStats,recommendedSetIds,recommendationOrder,recommendedEchoSlot,recommendedEchoFilterSetIds} from '../../../../src/characterRecommendations.mjs';
import {installFixedScroll} from '../../../product-ui/build-candidate/edge-scroll.js';
import catalog from '../../../ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};
import manifest from '../../../ui-prototypes/assets/echoes/manifest.json' with {type:'json'};
import {validateEchoTemplateConfiguration} from '../../../ui-prototypes/assets/echo-template-configuration.mjs';
import {configuredCard} from './configured-card.js';
import {echoCard} from './echo-card.js';
import {assetURL,escapeHtml as esc,notify} from './util.js';

// The browser previews a future Rank-5 input. Only Use Echo changes the
// observed workspace configuration; the equipped account item is read-only.
export function mountImproveEchoPicker({getContext,onUse,preferences}){
 const area=document.querySelector('.working-area'),candidate=document.querySelector('#newCard');
 const host=document.createElement('section');host.className='improve-echo-browser';host.hidden=true;
 host.setAttribute('aria-label','Choose a candidate Echo');area.insertBefore(host,candidate.parentElement);
 const images=new Map(manifest.icons.map(row=>[row.echoId,row.targetPath]));
 const path=value=>assetURL('../../'+value.replace(/^docs\//,''));
 let disposeScroll=()=>{};
 let opened=false,binding=null,preview=null,query='',cost=null,sets=[],mainOpen=false,setOpen=false,sonataOpen=false;
 const sharedKey=characterId=>'improve:'+characterId+':echo';
 const slotKey=(characterId,slot)=>'improve:'+characterId+':echo-slot:'+slot;
 function saveShared(){
  if(preferences)preferences.write(sharedKey(getContext().characterId),{query,sets:[...sets],sonataOpen});
 }
 function restoreFilters(c){
  const saved=preferences?.read(sharedKey(c.characterId))??{};
  const chosen=Array.isArray(saved.sets)?saved.sets:recommendedEchoFilterSetIds(c.characterId);
  sets=[...new Set(chosen.filter(id=>catalog.sonataSets.some(set=>set.id===id)))];
  query=typeof saved.query==='string'?saved.query:'';
  sonataOpen=saved.sonataOpen===true;
  const stored=preferences?.read(slotKey(c.characterId,c.slot))??{};
  const fallback=recommendedEchoSlot(c.characterId,c.slot)?.cost??null;
  cost=Object.hasOwn(stored,'cost')&&(stored.cost===null||[1,3,4].includes(stored.cost))?stored.cost:fallback;
  const menus=preferences?.read(slotKey(c.characterId,c.slot)+':menus')??{};
  mainOpen=menus.main===true;setOpen=menus.assignment===true;
 }
 const key=()=>{const c=getContext();return c.characterId+':'+c.slot;};
 function close(){disposeScroll();opened=false;host.hidden=true;area.classList.remove('choosing-echo');document.querySelector('[data-change-echo]')?.focus({preventScroll:true});}
 function mains(cost){return recommendedMainStats(getContext().characterId,cost,catalog.statEditor.mainStatsByCostAndLevel[cost][0].map(row=>row.name));}
 function render(){
  if(!opened)return;
  if(key()!==binding){close();return;}
  const c=getContext(),scroll=host.querySelector('.improve-echo-grid')?.scrollTop??0;
  const recommended=recommendedSetIds(c.characterId);
  const ordered=recommendationOrder([...catalog.sonataSets].sort((a,b)=>b.sourceId-a.sourceId),recommended);
  const setButton=set=>`<button type="button" data-picker-set="${esc(set.id)}" aria-pressed="${sets.includes(set.id)}"><img src="${path(set.artPath)}" alt=""><span>${esc(set.name)}</span>${recommended.includes(set.id)?'<span aria-label="Recommended">★</span>':''}</button>`;
  const group=(name,rows)=>rows.length?`<div class="picker-set-group"><small>${name}</small>${rows.map(setButton).join('')}</div>`:'';
  const rows=catalog.echoes.filter(row=>row.releaseStatus==='RELEASED'&&(cost===null||row.cost===cost)&&(!sets.length||sets.some(id=>row.sonataSetIds.includes(id)))&&row.name.toLowerCase().includes(query.toLowerCase()));
  if(sets.length)rows.sort((a,b)=>sets.findIndex(id=>a.sonataSetIds.includes(id))-sets.findIndex(id=>b.sonataSetIds.includes(id)));
  if(!sets.length)rows.sort((a,b)=>{const rank=item=>Math.min(...item.sonataSetIds.map(id=>recommended.includes(id)?recommended.indexOf(id):Infinity));return rank(a)-rank(b);});
  const selectedIcons=sets.map(id=>catalog.sonataSets.find(s=>s.id===id)).filter(Boolean).map(s=>`<img src="${path(s.artPath)}" alt="${esc(s.name)}">`).join('');
  disposeScroll();
  host.innerHTML=`<header><strong>Choose Echo</strong><input type="search" data-picker-search aria-label="Search Echoes" placeholder="Search Echoes" value="${esc(query)}"><button type="button" data-picker-cancel aria-label="Close Echo selection">×</button></header>
   <div class="picker-filters"><details class="picker-sets" ${sonataOpen?'open':''}><summary>Sonata Sets <span>${selectedIcons||'All'}</span></summary><div class="picker-set-options"><button type="button" data-picker-set="all" aria-pressed="${!sets.length}">All Sonata Sets</button>${group('Recommended',ordered.filter(s=>recommended.includes(s.id)))}${group('Other',ordered.filter(s=>!recommended.includes(s.id)))}</div></details>
   <div class="picker-costs" role="group" aria-label="Filter by Cost">${[null,4,3,1].map(value=>`<button type="button" data-picker-cost="${value??'all'}" aria-pressed="${cost===value}">${value===null?'All Costs':'Cost '+value}</button>`).join('')}</div></div>
   <div class="improve-echo-grid">${rows.map(row=>{const rail=(sets.length?sets:row.sonataSetIds).filter(id=>row.sonataSetIds.includes(id)).map(id=>catalog.sonataSets.find(s=>s.id===id)).filter(Boolean);return `<div class="picker-echo-item"><button type="button" class="picker-echo" data-picker-echo="${esc(row.id)}" aria-pressed="${preview?.echoId===row.id}"><strong>${esc(row.name)}</strong><span class="picker-art"><span class="picker-set-rail">${rail.map(s=>`<img src="${path(s.artPath)}" alt="${esc(s.name)}">`).join('')}</span><img src="${path(images.get(row.id))}" alt=""></span><small>COST ${row.cost}</small></button><div class="picker-quick-mains">${mains(row.cost).map(name=>`<button type="button" data-picker-quick="${esc(row.id)}" data-main="${esc(name)}">${esc(name)}</button>`).join('')}</div></div>`;}).join('')||'<p>No Echoes match</p>'}</div>
   <footer><button type="button" data-picker-cancel>Cancel</button><button type="button" data-picker-use ${preview?.mainStatName?'':'disabled'}>Use Echo</button></footer>`;
  const grid=host.querySelector('.improve-echo-grid');
  grid.scrollTop=scroll;
  disposeScroll=installFixedScroll(grid,'improve-picker-frame','Scroll Echoes');
  const identity=catalog.echoes.find(row=>row.id===preview?.echoId);
  if(!identity)return;
  // The candidate card itself is the only preview, including configuration.
  const complete=preview.mainStatName?preview:{...preview,mainStatName:catalog.statEditor.mainStatsByCostAndLevel[identity.cost][0][0].name};
  candidate.dataset.adviceTone='neutral';
  candidate.innerHTML=echoCard({...configuredCard(complete),configured:false,level:0},{candidate:true,characterId:c.characterId,compactFooter:true,editorMarkup:''});
  const options=catalog.statEditor.mainStatsByCostAndLevel[identity.cost][0];
  const configuration=document.createElement('div');configuration.className='picker-preview-choices';
  configuration.innerHTML=`<details ${mainOpen?'open':''} data-picker-main-menu><summary>${preview.mainStatName?esc(preview.mainStatName):'Choose Main Stat'}</summary>${options.map(row=>`<button type="button" data-picker-main="${esc(row.name)}" aria-pressed="${preview.mainStatName===row.name}">${esc(row.name)}</button>`).join('')}</details><details ${setOpen?'open':''} data-picker-assignment><summary>${esc(catalog.sonataSets.find(s=>s.id===preview.selectedSonataSetId)?.name??'Sonata')}</summary>${identity.sonataSetIds.map(id=>{const s=catalog.sonataSets.find(s=>s.id===id);return `<button type="button" data-picker-assignment-id="${esc(id)}" aria-pressed="${id===preview.selectedSonataSetId}"><img src="${path(s.artPath)}" alt="">${esc(s.name)}</button>`;}).join('')}</details>`;
  candidate.querySelector('.echo-values').replaceChildren(configuration);
 }
 function click(event){
  if(!opened)return;const button=event.target.closest('button');if(!button)return;const d=button.dataset;
  if(d.pickerCancel!==undefined){close();document.dispatchEvent(new CustomEvent('improve-echo-picker-closed'));return;}
  if(d.pickerEcho||d.pickerQuick){const row=catalog.echoes.find(e=>e.id===(d.pickerEcho??d.pickerQuick)),allowed=catalog.statEditor.mainStatsByCostAndLevel[row.cost][0];preview={echoId:row.id,cost:row.cost,rank:5,mainStatName:d.main??(allowed.some(s=>s.name===preview?.mainStatName)?preview.mainStatName:mains(row.cost)[0]??allowed[0].name),selectedSonataSetId:sets.find(id=>row.sonataSetIds.includes(id))??(row.sonataSetIds.includes(preview?.selectedSonataSetId)?preview.selectedSonataSetId:row.sonataSetIds[0])};mainOpen=!preview.mainStatName;}
  else if(d.pickerCost!==undefined){cost=d.pickerCost==='all'?null:Number(d.pickerCost);preferences?.write(slotKey(getContext().characterId,getContext().slot),{cost});}
  else if(d.pickerSet){sets=d.pickerSet==='all'?[]:sets.includes(d.pickerSet)?sets.filter(id=>id!==d.pickerSet):[...sets,d.pickerSet];saveShared();}
  else if(d.pickerMain){preview.mainStatName=d.pickerMain;mainOpen=false;}
  else if(d.pickerAssignmentId){preview.selectedSonataSetId=d.pickerAssignmentId;setOpen=false;}
  else if(d.pickerUse!==undefined){try{const chosen=validateEchoTemplateConfiguration(catalog,preview);if(JSON.stringify(chosen)!==JSON.stringify(getContext().template))onUse(chosen);close();document.dispatchEvent(new CustomEvent('improve-echo-picker-closed'));}catch(error){notify(error.message);}return;}
  else return;
  sonataOpen=host.querySelector('.picker-sets')?.open??sonataOpen;render();
 }
 host.addEventListener('click',click);candidate.addEventListener('click',click);
 const onToggle=event=>{
  if(!opened)return;
  if(event.target.matches('.picker-sets')){sonataOpen=event.target.open;saveShared();}
  else if(event.target.matches('[data-picker-main-menu], [data-picker-assignment]')){
   if(event.target.matches('[data-picker-main-menu]'))mainOpen=event.target.open;
   else setOpen=event.target.open;
   preferences?.write(slotKey(getContext().characterId,getContext().slot)+':menus',{main:mainOpen,assignment:setOpen});
  }
 };
 host.addEventListener('toggle',onToggle,true);
 candidate.addEventListener('toggle',onToggle,true);
 host.addEventListener('input',event=>{if(!event.target.matches('[data-picker-search]'))return;query=event.target.value;saveShared();render();const search=host.querySelector('[data-picker-search]');search.focus();});
 host.addEventListener('keydown',event=>{if(event.key==='Escape'){close();document.dispatchEvent(new CustomEvent('improve-echo-picker-closed'));}});
 return {render,async open(){if(opened)return;const c=getContext();if(!c.template){notify('Choose an equipped Echo first');return;}binding=key();preview=structuredClone(c.template);restoreFilters(c);opened=true;
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   const outgoing=[document.querySelector('#currentCard').parentElement,area.querySelector('.interaction')];
   await Promise.all(outgoing.map(el=>el.animate([{transform:'translateX(0)',opacity:1},{transform:'translateX(-28px)',opacity:0}],{duration:160,easing:'ease-in'}).finished.catch(()=>{})));
  }
  if(!opened||key()!==binding){close();return;}
  host.hidden=false;area.classList.add('choosing-echo');render();host.querySelector('[data-picker-search]').focus();}};
}
