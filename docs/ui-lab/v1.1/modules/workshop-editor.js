import {assetURL} from './util.js';
import {configurationContext,configureSlot,selectConfigurationSlot} from './simulation-configuration.js';

// Reuse the existing Workshop in an opt-in memory-storage host. No account owner
// or Current-commit entrypoint is exposed to this parent controller.
export function createWorkshopEditor({getState,onCommit,onPreview=()=>{},readAccountBinding=()=>null}) {
  let pending=null;
  function close(){if(!pending)return;const old=pending;pending=null;old.rollback?.();old.dialog.close();old.dialog.remove();const trigger=old.trigger?.isConnected?old.trigger:document.querySelector(`[data-edit-echo="${old.trigger?.dataset.editEcho}"]`);trigger?.focus({preventScroll:true});}
  async function open(slot,trigger) {
    close();
    const state=getState();if(!state.configurationSession||state.configurationSession.mode!=='simulate')return;
    selectConfigurationSlot(state,slot);
    const binding=configurationContext(state);
    const dialog=document.createElement('dialog');dialog.className='workshop-editor-host';dialog.setAttribute('aria-label',`Edit Echo ${slot+1}`);
    const frame=document.createElement('iframe');frame.title=`Echo Workshop · Slot ${slot+1}`;
    frame.setAttribute('sandbox','allow-scripts allow-same-origin');
    frame.src=assetURL('../../ui-prototypes/v34-functional.html')+'?workshopOwner=ui-lab';
    frame.style.visibility='hidden';dialog.append(frame);document.body.append(dialog);
    const owner={dialog,frame,trigger};pending=owner;
    const isCurrent=()=>pending===owner&&getState()===state&&configurationContext(state)===binding;
    dialog.addEventListener('cancel',()=>close());
    frame.onload=async()=>{
      try{
        if(!isCurrent()){close();return;}
        const port=frame.contentWindow.bellibingConfigurationWorkshop;
        if(!port)throw Error('Existing Echo Workshop is unavailable.');
        const sourceSetIds=state.configurationSession.defaultRecommendation?.sonataSetIds??[];
        const filterSetIds=[...new Set([...sourceSetIds,state.configurationSession.configurations[slot]?.selectedSonataSetId].filter(Boolean))];
        await port.open({characterId:state.id,slot,sourceSetIds,filterSetIds,configuration:state.configurationSession.configurations[slot],isCurrent,
          onChoose:template=>{if(!isCurrent())throw Error('Stale Character/Settings/slot context.');configureSlot(state.configurationSession,slot,template);onCommit();},
          onClose:()=>{if(pending===owner)close();}});
        frame.style.visibility='visible';frame.contentWindow.document.querySelector('#echoClose').focus();
      }catch(error){close();onCommit(error);}
    };
    dialog.showModal();
  }
  async function openObserved(slot,trigger){
    close();const state=getState();if(!state.onAccount)return;const binding=readAccountBinding(),before=structuredClone(state.accountCandidates?.[slot]??null);let committed=false;
    const dialog=document.createElement('dialog');dialog.className='workshop-editor-host';dialog.setAttribute('aria-label',`Candidate Echo ${slot+1}`);
    const frame=document.createElement('iframe');frame.title=`Observed Candidate · Slot ${slot+1}`;frame.setAttribute('sandbox','allow-scripts allow-same-origin');frame.src=assetURL('../../ui-prototypes/v34-functional.html')+'?workshopOwner=ui-lab';dialog.append(frame);document.body.append(dialog);
    const owner={dialog,frame,trigger};pending=owner;
    const isCurrent=()=>pending===owner&&getState()===state&&state.selectedSlot===slot&&binding===readAccountBinding();
    const update=card=>{if(!isCurrent()||committed)return;state.accountCandidates[slot]=structuredClone(card);onPreview();};
    owner.rollback=()=>{if(!committed&&getState()===state){state.accountCandidates[slot]=before;onPreview();}};
    dialog.addEventListener('cancel',()=>close());
    frame.onload=async()=>{try{if(!isCurrent()){close();return;}await frame.contentWindow.bellibingConfigurationWorkshop.openObservedCandidate({characterId:state.id,slot,card:before,isCurrent,onPreview:update,onChoose:card=>{if(!isCurrent())throw Error('Stale account build');update(card);committed=true;onCommit();},onClose:()=>{if(pending===owner)close();}});}catch(error){close();onCommit(error);}};
    dialog.showModal();
  }
  return {open,openObserved,close};
}
