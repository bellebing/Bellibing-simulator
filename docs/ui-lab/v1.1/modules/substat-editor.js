import {escapeHtml as esc} from './util.js';
import {statPreference,rollPresentation,rollSignalMarkup} from './stat-guidance.js';
const substatChoiceGroups = [
 ['CRIT Rate', 'CRIT DMG'],
 ['ATK%', 'Flat ATK'],
 ['Skill DMG', 'Basic Attack DMG', 'Liberation DMG', 'Heavy Attack DMG'],
 ['Energy Regen'],
 ['HP%', 'DEF%', 'Flat HP', 'Flat DEF']
];
export function substatEditorMarkup(item,{activeRow=null,characterId=null,substats,statValue,statMarkup,editableCount=5,pendingMove=null}={}) {
 const rowMarkup = item.substats.map((roll, index) => {
  const active = activeRow === index;
  return `<div class="wb-roll-row ${active ? 'wb-roll-active' : ''}"><button class="wb-roll-toggle" data-wb-roll="${index}" ${index>=editableCount?'disabled':''} aria-expanded="${active}" aria-label="Edit +${(index+1)*5} substat"><small>+${(index+1)*5}</small><span>${esc(roll?.name ?? 'Choose stat')}${roll ? statPreference(characterId,roll.name) : ''}</span>${rollSignalMarkup()}<b>${Number.isFinite(roll?.value) ? rollPresentation(roll.name,roll.value,statValue(roll.name,roll.value)) : '—'}</b></button></div>`;
 });
 let options='';
 if(activeRow!==null&&activeRow<editableCount){
  const index=activeRow,roll=item.substats[index];
  const usedElsewhere=stat=>item.substats.some((other,at)=>at!==index&&other?.name===stat.name);
  const known=new Set(substatChoiceGroups.flat());
  const choices=[...substatChoiceGroups.flat().map(name=>substats.find(stat=>stat.name===name)).filter(Boolean),...substats.filter(stat=>!known.has(stat.name))];
  const source=choices.find(stat=>stat.name===roll?.name)??choices.find(stat=>!usedElsewhere(stat));
  const names=choices.map(stat=>`<button type="button" data-bc-roll-name="${index}" data-value="${esc(stat.name)}" class="${usedElsewhere(stat)?'wb-stat-used ':''}${source?.name===stat.name?'selected':''}" aria-label="${esc(stat.name)}${usedElsewhere(stat)?', already on another row':''}"><span>${esc(stat.name)}</span>${statPreference(characterId,stat.name)}</button>`).join('');
  const values=source?.values.map(value=>`<button type="button" data-bc-roll-value="${index}" data-stat-name="${esc(source.name)}" data-value="${value}" class="${value===roll?.value?'selected':''}">${rollPresentation(source.name,value,statValue(source.name,value))}</button>`).join('')??'';
  const confirm=pendingMove?`<div class="wb-move-confirm" role="group" aria-label="Confirm stat move"><p>${esc(pendingMove.name)} is already at +${(pendingMove.from+1)*5}. Move to +${(pendingMove.index+1)*5}?</p><button type="button" data-bc-move-cancel>Cancel</button><button type="button" data-bc-move-confirm>Move stat</button></div>`:'';
  options=`<div class="wb-roll-picker" data-active-checkpoint="${(index+1)*5}"><div class="wb-roll-choices"><div class="wb-roll-names">${names}</div><div class="wb-roll-values">${values}</div></div>${confirm}</div>`;
 }
 if(options)rowMarkup[activeRow]=rowMarkup[activeRow].replace(/<\/div>$/,options+'</div>');
 const adjusted=item.substats.filter(roll=>roll?.normalization?.requiresReview);
 const notes=adjusted.length?'<details class="wc-reading"><summary>Import adjustments ('+adjusted.length+')</summary>'+adjusted.map(roll=>'<p>'+esc(roll.name+': card '+roll.rawValue.trim()+'; canonical '+statValue(roll.name,roll.value))+'. Original card value retained.</p>').join('')+'</details>':'';
 return `<section class="wb-substats"><h4>Substats</h4>${rowMarkup.join('')}${notes}</section>`;
}
