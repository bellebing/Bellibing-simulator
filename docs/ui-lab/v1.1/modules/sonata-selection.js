// Per-Character UI Lab Sonata selections only. Existing cards represent the
// verified identity snapshot; no recommendation, Echo filter or evaluator is run.
export function mountSonataSelection(section,{getState,onEdit=()=>{}}) {
  const chosen=section.querySelector('.sonata-selected');
  const available=section.querySelector('.sonata-browse');
  const more=section.querySelector('#sonataMore');
  const nodes=[...section.querySelectorAll('[data-sonata-id]')];
  const ids=nodes.map(node=>node.dataset.sonataId);
  const cards=new Map(nodes.map(node=>[node.dataset.sonataId,node]));
  if(cards.size!==ids.length) throw new Error('Duplicate Sonata ID in UI Lab identity snapshot');
  const message=document.createElement('span');
  message.className='sonata-selection-status';
  message.setAttribute('role','status');
  message.setAttribute('aria-live','polite');
  section.append(message);

  function pool() {
    const saved=getState().sonataPool;
    return Array.isArray(saved)?saved.filter((id,i)=>cards.has(id)&&saved.indexOf(id)===i):[];
  }
  function render(focus=null) {
    const active=pool(),set=new Set(active);
    const put=(id,selected)=>{
      const card=cards.get(id),name=card.querySelector('.sonata-name').textContent;
      card.classList.toggle('sonata-chosen',selected);
      card.classList.toggle('sonata-option',!selected);
      let check=card.querySelector('.sonata-check');
      if(selected&&!check){
        check=document.createElement('span');check.className='sonata-check';
        check.setAttribute('aria-hidden','true');check.textContent='✓';card.append(check);
      }else if(!selected)check?.remove();
      let button=card.querySelector('.sonata-handle');
      if(!button){
        button=document.createElement('button');button.type='button';button.className='sonata-handle';
        button.draggable=true;button.textContent='≡';card.prepend(button);
      }
      button.setAttribute('aria-label',`Move ${name} to ${selected?'More Sets':'chosen Sonata Sets'}`);
      button.title='Drag between lists or press Enter / Space';
      (selected?chosen:available).append(card);
    };
    active.forEach(id=>put(id,true));
    ids.filter(id=>!set.has(id)).forEach(id=>put(id,false));
    chosen.classList.toggle('sonata-pool-empty',active.length===0);
    if(focus)cards.get(focus)?.querySelector('button.sonata-handle')?.focus({preventScroll:true});
  }
  function move(id,dest,before=null) {
    if(!cards.has(id)||!['chosen','available'].includes(dest))return;
    const was=pool(),now=was.filter(item=>item!==id);
    if(dest==='chosen'){
      const at=before===id?-1:now.indexOf(before);
      now.splice(at<0?now.length:at,0,id);
    }
    if(now.join('|')===was.join('|'))return;
    getState().sonataPool=now;onEdit();
    if(dest==='available')more.open=true;
    render(id);
    const name=cards.get(id).querySelector('.sonata-name').textContent;
    message.textContent=`${name} ${dest==='chosen'?'added to':'removed from'} chosen Sonata Sets (UI Lab only)`;
  }
  const destination=element=>{
    const list=element?.closest('.sonata-selected,.sonata-browse');
    return list===chosen?'chosen':list===available?'available':null;
  };
  const before=(element,dest,y)=>{
    if(dest!=='chosen')return null;
    const card=element.closest('[data-sonata-id]');
    if(!card||card.parentElement!==chosen)return null;
    const rect=card.getBoundingClientRect();
    return y<rect.top+rect.height/2?card.dataset.sonataId:card.nextElementSibling?.dataset.sonataId??null;
  };
  let dragging=null,touch=null,suppressed=null;
  function highlight(dest){
    chosen.classList.toggle('sonata-drop-target',dest==='chosen');
    available.classList.toggle('sonata-drop-target',dest==='available');
  }
  function cleanup(){
    dragging=null;highlight(null);
    cards.forEach(card=>card.classList.remove('is-dragging'));
  }
  section.addEventListener('dragstart',event=>{
    const handle=event.target.closest('.sonata-handle');
    if(!handle||!event.dataTransfer)return;
    const id=handle.closest('[data-sonata-id]').dataset.sonataId;
    dragging={id,characterId:getState().id};
    event.dataTransfer.setData('text/plain',id);
    event.dataTransfer.effectAllowed='move';
    cards.get(id).classList.add('is-dragging');
  });
  // Native DnD requires the actual drop zone to cancel dragover, otherwise
  // Chromium never emits drop. Scope the acceptance to these two lists.
  for(const [list,dest] of [[chosen,'chosen'],[available,'available']]){
    list.addEventListener('dragover',event=>{
      event.preventDefault();
      if(event.dataTransfer)event.dataTransfer.dropEffect='move';
      highlight(dest);
    });
    list.addEventListener('drop',event=>{
      event.preventDefault();
      const id=event.dataTransfer?.getData('text/plain')||dragging?.id;
      const valid=dragging?.characterId===getState().id&&cards.has(id);
      const anchor=before(event.target,dest,event.clientY);
      cleanup();
      if(valid)move(id,dest,anchor);
    });
  }
  section.addEventListener('dragend',cleanup);

  // Browsers may not support native HTML drag on touch. The same handle also
  // supports finger movement; tapping the handle simply activates its button.
  section.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='touch')return;
    const handle=event.target.closest('.sonata-handle');
    if(!handle)return;
    touch={pointerId:event.pointerId,characterId:getState().id,
      id:handle.closest('[data-sonata-id]').dataset.sonataId,
      x:event.clientX,y:event.clientY,moved:false};
    handle.setPointerCapture?.(event.pointerId);
  });
  section.addEventListener('pointermove',event=>{
    if(!touch||event.pointerId!==touch.pointerId)return;
    if(Math.hypot(event.clientX-touch.x,event.clientY-touch.y)>9)touch.moved=true;
    if(touch.moved){
      cards.get(touch.id).classList.add('is-dragging');
      highlight(destination(document.elementFromPoint(event.clientX,event.clientY)));
    }
  });
  section.addEventListener('pointerup',event=>{
    if(!touch||event.pointerId!==touch.pointerId)return;
    const prior=touch;touch=null;cleanup();
    if(!prior.moved)return;
    suppressed=prior.id;
    setTimeout(()=>{if(suppressed===prior.id)suppressed=null;},500);
    const element=document.elementFromPoint(event.clientX,event.clientY);
    const dest=prior.characterId===getState().id?destination(element):null;
    if(dest)move(prior.id,dest,before(element,dest,event.clientY));
  });
  // Native HTML5 DnD can emit pointercancel for a mouse pointer after
  // dragstart. Only a cancelled TOUCH gesture may clear the touch drag.
  section.addEventListener('pointercancel',()=>{
    if(touch){touch=null;cleanup();}
  });
  section.addEventListener('click',event=>{
    const handle=event.target.closest('.sonata-handle');
    if(!handle)return;
    const id=handle.closest('[data-sonata-id]').dataset.sonataId;
    if(suppressed===id){suppressed=null;event.preventDefault();return;}
    move(id,pool().includes(id)?'available':'chosen');
  });
  return {render};
}
