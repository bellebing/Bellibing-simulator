import {assetURL,escapeHtml} from './util.js';

// Shared glass selector. A choice is scoped by the owning caller, never a catalog-wide commit.
export function openSelectionDialog({title,choices,selectedId,onChoose,trigger,details=[]}){
 const dialog=document.createElement('dialog');dialog.className='item-selector';dialog.setAttribute('aria-label',title);
 dialog.innerHTML=`<header><h2>${escapeHtml(title)}</h2><button type="button" data-close aria-label="Close ${escapeHtml(title)}">✕</button></header><div class="item-selector-grid">${choices.map(c=>`<button type="button" class="item-choice${c.id===selectedId?' selected':''}" data-choice="${escapeHtml(c.id)}" aria-pressed="${c.id===selectedId}">${c.art?`<img src="${escapeHtml(assetURL(c.art))}" alt="">`:''}<strong>${escapeHtml(c.name)}</strong>${c.note?`<small>${escapeHtml(c.note)}</small>`:''}</button>`).join('')}</div>${details.length?`<details class="selector-help"><summary>Details</summary>${details.map(d=>`<p><strong>${escapeHtml(d.name)}</strong></p><ul>${d.lines.map(line=>`<li>${escapeHtml(line)}</li>`).join('')}</ul>`).join('')}</details>`:''}`;
 const close=()=>dialog.close();dialog.querySelector('[data-close]').onclick=close;
 dialog.onclick=e=>{if(e.target===dialog)close();const button=e.target.closest('[data-choice]');if(button){onChoose(button.dataset.choice);close();}};
 dialog.addEventListener('close',()=>{dialog.remove();if(trigger?.isConnected)trigger.focus({preventScroll:true});},{once:true});
 document.body.append(dialog);dialog.showModal();(dialog.querySelector('.selected')??dialog.querySelector('[data-close]')).focus();return dialog;
}
