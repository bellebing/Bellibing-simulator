import { ECHO_SETTING_STATS } from './settings-catalog.js';
import { STAT_SECTIONS, moveSettingStat, flexCountPresentation, editFlexCount, erTargetPresentation } from './settings-state.js';
import { SETTING_METRICS } from './simulation-model.js';
import { CHARACTER_TARGETS } from './targets.js';
import { erTotalFixture } from './result-fixtures.js';
import { escapeHtml } from './util.js';

const statById = new Map(ECHO_SETTING_STATS.map(stat=>[stat.id,stat]));
const labels={hard:'Hard Requirements',flex:'Flex Stats',other:'Other Stats'};
export function mountImproveSettings(host,{getState,onEdit,onSettle}) {
  host.innerHTML = `<span class="carousel-announcement" id="settingsKeys">Drag to reorder or move between sections. Alt Left or Right changes section. Alt Up or Down reorders.</span>
    <section class="er-target" id="erTarget"><div class="er-target-heading"><label><input id="erEnabled" type="checkbox" aria-label="Enable ER Target">ER Target</label><button id="editERTarget" aria-controls="erTargetEditor" aria-expanded="false"><span id="erTargetValue"></span><span id="erTargetBadge"></span><span class="er-edit-symbol" aria-hidden="true">⌄</span></button></div><div id="erTargetEditor" hidden><label class="er-target-field">Total ER <span><input id="erTargetInput" type="number" min="0" step="0.1" inputmode="decimal" aria-label="ER Target percent">%</span></label><output id="erTotalStatus"></output></div></section>
    <section><h3>Hard Requirements</h3><div id="hardRows" class="stat-list" data-stat-section="hard" aria-label="Hard Requirements"></div></section>
    <section><h3>Flex Stats</h3><label class="flex-count"><output id="flexCountLabel"></output><input id="flexCount" type="range" aria-label="Required distinct Flex Stats" aria-describedby="flexCountLabel flexCountError"></label><p id="flexCountError" class="settings-validation" role="alert" hidden></p><div id="flexRows" class="stat-list" data-stat-section="flex" aria-label="Flex Stats"></div></section>
    <details id="otherStats"><summary>Other Stats</summary><div id="otherRows" class="stat-list" data-stat-section="other" aria-label="Other Stats"></div></details>`;
  const find=selector=>host.querySelector(selector);
  let current=null, targetOwner=null, drag=null, sliderRow=null, erOpen=false, priorER=null, verifiedTotal=null;
  function mode() {
    document.querySelectorAll('.setting-mode button').forEach(button=>{
      const selected=button.textContent===getState().settingsMode;
      button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',selected);
    });
  }
  function edited(action,source=null) {getState().settingsMode='Customize';mode();onEdit(action,source);}
  function row(id,section) {
    const stat=statById.get(id), tier=getState().minima[id], active=section!=='other';
    return `<div class="setting-row ${active?'':'neutral'}" draggable="true" data-minimum="${escapeHtml(id)}" data-stat-id="${escapeHtml(id)}" data-section="${section}" tabindex="-1"><button class="handle" draggable="true" aria-label="Move ${escapeHtml(stat.label)}" aria-describedby="settingsKeys" title="Drag or use Alt + Arrow keys">≡</button><span class="stat-label">${escapeHtml(stat.label)}</span>${active?`<input aria-label="${escapeHtml(stat.label)} minimum" type="range" min="0" max="${stat.tiers.length-1}" value="${tier}" aria-valuetext="${stat.labels[tier]}"><output>${stat.labels[tier]}</output>`:'<span class="inactive-state">Inactive</span>'}</div>`;
  }
  function count() {
    const state=getState(), view=flexCountPresentation(state), slider=find('#flexCount');
    find('#flexCountLabel').textContent=state.flexCount===null?view.message:`At least ${state.flexCount} of ${state.statSections.flex.length}`;
    slider.min=state.flexCount===null?'0':'1';slider.max=String(Math.max(1,view.maximum));
    slider.value=String(Math.min(state.flexCount??0,Math.max(1,view.maximum)));slider.disabled=view.maximum===0;
    slider.setAttribute('aria-invalid',String(!view.valid));slider.setAttribute('aria-valuetext',view.message);
    const error=find('#flexCountError');error.hidden=view.valid;error.textContent=view.valid?'':view.message;
  }
  function lists(focusId=null) {
    const state=getState();
    STAT_SECTIONS.forEach(section=>{find(`[data-stat-section="${section}"]`).innerHTML=state.statSections[section].map(id=>row(id,section)).join('');});
    find('#otherStats').open=state.otherExpanded;count();mode();
    if(focusId) [...host.querySelectorAll('[data-minimum]')].find(row=>row.dataset.minimum===focusId)?.querySelector('.handle').focus({preventScroll:false});
  }
  function move(id,section,beforeId=null) {
    moveSettingStat(getState(),id,section,beforeId);lists(id);onEdit({kind:'stat-placement',statId:id,destination:section});
  }
  find('#otherStats').addEventListener('toggle',()=>{getState().otherExpanded=find('#otherStats').open;});
  host.addEventListener('dragstart',event=>{
    const row=event.target.closest('[data-minimum]');
    if(!row||event.target.closest('input')||sliderRow){event.preventDefault();return;}
    drag={characterId:getState().id,id:row.dataset.minimum};event.dataTransfer.setData('text/plain',drag.id);event.dataTransfer.effectAllowed='move';row.classList.add('is-dragging');
  });
  host.addEventListener('dragover',event=>{if(drag?.characterId===getState().id&&event.target.closest('[data-stat-section]')){event.preventDefault();event.dataTransfer.dropEffect='move';}});
  host.addEventListener('drop',event=>{
    const list=event.target.closest('[data-stat-section]');if(!list||drag?.characterId!==getState().id)return;
    event.preventDefault();const row=event.target.closest('[data-minimum]');let beforeId=null;
    if(row){const box=row.getBoundingClientRect();beforeId=event.clientY<box.y+box.height/2?row.dataset.minimum:row.nextElementSibling?.dataset.minimum??null;}
    const id=drag.id;drag=null;move(id,list.dataset.statSection,beforeId);
  });
  host.addEventListener('dragend',()=>{drag=null;host.querySelectorAll('.is-dragging').forEach(node=>node.classList.remove('is-dragging'));});
  host.addEventListener('keydown',event=>{
    if(!event.target.closest('.handle')||!event.altKey||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();const row=event.target.closest('[data-minimum]'),id=row.dataset.minimum,section=row.dataset.section,list=getState().statSections[section],index=list.indexOf(id);
    if(['ArrowLeft','ArrowRight'].includes(event.key))move(id,STAT_SECTIONS[(STAT_SECTIONS.indexOf(section)+(event.key==='ArrowLeft'?2:1))%3]);
    else if(event.key==='ArrowUp'&&index>0)move(id,section,list[index-1]);
    else if(event.key==='ArrowDown'&&index<list.length-1)move(id,section,list[index+2]??null);
  });
  host.addEventListener('input',event=>{
    const row=event.target.closest('[data-minimum]');if(event.target.type!=='range'||!row)return;
    const id=row.dataset.minimum,tier=Number(event.target.value),stat=statById.get(id);
    if(!Number.isInteger(tier)||!stat.labels[tier])return;
    getState().minima[id]=tier;row.querySelector('output').textContent=stat.labels[tier];event.target.setAttribute('aria-valuetext',stat.labels[tier]);
    edited({kind:'minimum',statId:id,metric:SETTING_METRICS[id],tier},row);
  });
  host.addEventListener('pointerdown',event=>{if(event.target.type==='range'){sliderRow=event.target.closest('[data-minimum]');if(sliderRow)sliderRow.draggable=false;}});
  function finishSlider(){if(sliderRow){sliderRow.draggable=true;sliderRow=null;}onSettle();}
  window.addEventListener('pointerup',finishSlider);window.addEventListener('pointercancel',finishSlider);
  host.addEventListener('focusout',()=>{if(!sliderRow)onSettle();});host.addEventListener('change',()=>onSettle());
  function setCount(){const value=Number(find('#flexCount').value);if(value<1)return;editFlexCount(getState(),value);count();edited({kind:'flex-count'});}
  find('#flexCount').addEventListener('input',setCount);
  function repair(){if(!flexCountPresentation(getState()).valid&&!find('#flexCount').disabled)setCount();}
  find('#flexCount').addEventListener('pointerup',repair);find('#flexCount').addEventListener('keyup',event=>{if(['Home','End','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))repair();});
  function er({editing=false,finish=false}={}) {
    const state=getState(), fixture=erTotalFixture(state.id,document.querySelector('#erReview').value);
    const view=erTargetPresentation({characterId:state.id,target:state.erTarget,total:fixture??verifiedTotal,allowIllustrative:!!fixture});
    if(editing)erOpen=true;
    else if(view.status==='REACHED'&&(priorER!=='REACHED'||finish))erOpen=false;
    else if(view.status==='OUTSTANDING'&&priorER==='REACHED')erOpen=true;
    priorER=view.status;
    const reference=CHARACTER_TARGETS.find(row=>row.characterId===state.id)?.rows.find(row=>row.metric==='TOTAL_ENERGY_REGEN'&&row.status==='READY');
    const suggested=reference?.sourceValue?.reference;
    find('#erEnabled').checked=state.erTarget.enabled;
    find('#erTarget').dataset.status=view.status;find('#erTarget').dataset.demo=String(view.isDemo);
    find('#erTargetValue').textContent=state.erTarget.valuePercent!==null?`${state.erTarget.valuePercent}%`:reference?`${reference.displayValue} suggested`:'Set target';
    find('#erTargetBadge').textContent=(view.isDemo?'Demo · ':'')+({DISABLED:'Off',UNCONFIGURED:'Set value',UNAVAILABLE:'—',OUTSTANDING:'Outstanding',REACHED:'✓'}[view.status]);
    find('#erTargetEditor').hidden=!erOpen;find('#editERTarget').setAttribute('aria-expanded',String(erOpen));
    const input=find('#erTargetInput');if(document.activeElement!==input)input.value=state.erTarget.valuePercent??'';
    input.placeholder=Number.isFinite(suggested)?String(Number((suggested*100).toFixed(6))):'—';
    input.setAttribute('aria-invalid',String(state.erTarget.enabled&&view.status==='UNCONFIGURED'));
    find('#erTotalStatus').textContent=view.totalPercent===null?'Simulated total unavailable':`${view.isDemo?'Illustrative':'Verified'} total · ${view.totalPercent}%`;
    document.querySelector('#erReview').disabled=state.id!=='augusta';
    return reference;
  }
  find('#editERTarget').onclick=()=>{erOpen=!erOpen;er();};
  find('#erEnabled').onchange=event=>{
    const state=getState(),enabled=event.target.checked,reference=er();state.erTarget.enabled=enabled;
    if(state.erTarget.enabled&&state.erTarget.valuePercent===null&&reference)state.erTarget.valuePercent=Number((reference.sourceValue.reference*100).toFixed(6));
    erOpen=state.erTarget.enabled;er();edited({kind:'er-target',metric:'TOTAL_ENERGY_REGEN'});
  };
  find('#erTargetInput').oninput=event=>{
    const value=event.target.value.trim();getState().erTarget.valuePercent=value!==''&&event.target.validity.valid?Number(value):null;
    er({editing:true});edited({kind:'er-target',metric:'TOTAL_ENERGY_REGEN'});
  };
  find('#erTargetInput').onchange=()=>er({finish:true});
  document.querySelector('#erReview').onchange=()=>er();
  return {
    render(){const state=getState();if(current!==state){current=state;verifiedTotal=null;}if(targetOwner!==state.erTarget){targetOwner=state.erTarget;erOpen=state.erTarget.enabled;priorER=null;}lists();er();},
    presentER(total){verifiedTotal=total;er();},
  };
}
