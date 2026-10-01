// Runs inside the existing Echo Workspace browser harness so both commit contexts
// exercise the same page, browser components and canonical data.
export async function verifyImproveCandidate({socket,send,evaluate,navigate,setViewport,waitForUi,pointerClick,chooseBellibingComboOption,capture,sleep}) {
  const check=async(expression,message)=>{if(!await evaluate(send,expression))throw new Error(message+' '+JSON.stringify(await evaluate(send,'({character:improveUi.characterName,candidate:improveUi.candidate,build:state.drafts.Augusta?.build})')))};
  const read=expression=>evaluate(send,expression);
  const wait=(expression,message)=>waitForUi(send,expression,message);
  const click=selector=>pointerClick(send,selector);
  const stored=()=>read('localStorage.getItem(KEY)');
  const unchanged=async(expected,message)=>{if(await stored()!==expected)throw new Error(message)};
  const settled=async()=>{await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:20,y:800});await sleep(700)};
  const closed=()=>wait('!echoUi.open&&!echoUi.closing&&!echoUi.overlay.classList.contains("mounted")','Workspace did not close');
  const open=async()=>{await settled();await click('#improveNewEcho');await wait('echoUi.open&&echoUi.context.kind==="candidate"','Physical New Echo click did not open Candidate Workspace');await sleep(550)};
  async function switchCharacter(id) {
    const selector='#improveWheel [data-character-id="'+id+'"]';
    await read('document.getElementById("improveShell").scrollTop=0');await settled();
    const r=await read(`document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().toJSON()`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x+r.width/2,y:r.y+r.height/2});await sleep(850);
    await click(selector);await sleep(650);
    if(!await read('!!activeConfirmation'))await click(selector);
    await wait('activeConfirmation?.kind==="character"','Character confirmation missing');
    await click('#confirmSwitch');await settled();
  }
  await setViewport(send,1440,900);await navigate(send);await read('localStorage.clear()');await navigate(send);
  await wait('echoDataLoaded&&weaponDataLoaded&&characterMechanicsDataLoaded&&sequenceRuntimeDataLoaded&&buildStatsRuntimeLoaded&&releasedCharacters.length===57','Improve canonical sources not ready');
  const pageUrl=await read('location.href');
  await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
  for(const resource of ['skills-runtime.json','forte-ui.mjs']){
    await read("addOwned('Augusta')");const held=[];
    const listener=event=>{const message=JSON.parse(String(event.data));if(message.method==='Fetch.requestPaused')held.push(message.params.requestId)};
    socket.addEventListener('message',listener);
    await send('Fetch.enable',{patterns:[{urlPattern:'*assets/'+resource,requestStage:'Request'}]});
    try{
      await read('window.__skillsNavigationMarker=true');
      await send('Page.navigate',{url:pageUrl});
      await wait('!window.__skillsNavigationMarker&&typeof improvePicker!=="undefined"&&releasedCharacters.length===57','Character picker not ready during delayed Skills loading');
      await read("show('improve');improvePicker.select('Augusta')");
      await check('document.getElementById("improveSkillsTree").textContent==="Loading Skills…"','Pending shown before source readiness was known');
      if(!held.length)throw new Error('No delayed '+resource+' request observed');
      for(const requestId of held)await send('Fetch.continueRequest',{requestId});
      await send('Fetch.disable');
      await wait('document.querySelectorAll("#improveSkillsTree .forte-node").length===16&&!document.getElementById("improveSkillsTree").textContent.includes("Pending")','Augusta remained falsely Pending after '+resource+' became ready');
    }finally{await send('Fetch.disable');socket.removeEventListener('message',listener)}
  }
  // Fixtures use canonical cards and the existing state paths in an isolated browser profile.
  await read(`(()=>{
    addOwned('Augusta');addOwned('Qingxiao');
    const names=['Sigillum','Twin Nova: Collapsar Blade','Glommoth','Iceglint Dancer','Shadow Stepper'];
    const rolls=[...echoStatContract.substats.filter(row=>['Heavy Attack DMG','Liberation DMG'].includes(row.name)),...echoStatContract.substats.slice(0,3)].map(row=>({name:row.name,value:row.values[0]}));
    names.forEach((name,index)=>{const item=echoCatalog.find(row=>row.name===name),card=makeEchoStatCard(item,item.sonataSetIds[0],{echoId:item.id,substats:rolls});const element=echoMainOptions(item.cost,card.level).find(row=>row.name==='Electro DMG');if(element)card.mainStat={...element};commitEchoSlot('Augusta',index,card)});
    const tree=skillsPreviewByCharacterId.get('augusta'),model=window.bellibingForte;
    const node=tree.nodes.find(n=>n.role==='normal-attack');
    autosave('Augusta',{weaponId:'thunderflare-dominion',sequenceLevel:3,forte:model.updateForteNode(tree,null,node.id,0)});
    autosave('Qingxiao',{sequenceLevel:1});show('improve');improvePicker.select('Augusta');return true;
  })()`);await settled();
  // The shared picker records visits and departures on Character switches.
  // Compare all build fields except those existing navigation timestamps.
  const buildSnapshot='JSON.stringify(Object.fromEntries(Object.entries(state.drafts.Augusta.build).filter(([key])=>!["lastImprovedAt","lastLeftAt"].includes(key))))';
  const equipment=await read(buildSnapshot);
  const snapshot=await stored();
  await check('echoUi.characterName===null','Fixture must exercise Candidate without a Build selection');
  await open();await unchanged(snapshot,'Opening Candidate changed persistent state');
  await check('document.querySelectorAll("#echoOverlay").length===1&&document.querySelectorAll("#echoWorkspaceSlots button").length===0&&getComputedStyle(document.getElementById("echoWorkspaceSlots")).display==="none"&&getComputedStyle(document.querySelector(".echo-editor-stats")).display==="none"&&!echoUi.editorDraft','Candidate exposed equipped dock or completed-Echo editor');
  await click('#echoClose');await closed();await unchanged(snapshot,'Closing empty Candidate changed equipment');
  await open();await click('#echoSonataToggle');await click('#echoSonataAll');await click('#echoSonataToggle');
  await click('[data-echo-filter="3"]');await check('echoUi.filter==="3"&&[...document.querySelectorAll("#echoChoices .echo-choice:not([hidden])")].every(n=>n.dataset.cost==="3")','Candidate Cost filter failed');
  await click('[data-echo-filter="all"]');
  await check('echoUi.selectedSonataIds.size===0&&echoUi.filter==="all"','Candidate Sonata/Cost filters failed');
  const id=await read('echoCatalog.find(item=>item.sonataSetIds.length>1).id');
  await click('#echoChoices [data-echo-id="'+id+'"]');
  await wait('echoUi.previewId==='+JSON.stringify(id),'Candidate browser pointer did not select');
  const alternate=await read('echoById.get(echoUi.previewId).sonataSetIds.find(id=>id!==echoUi.editorDraft.selectedSonataSetId)');
  await click('#echoPreviewSonataChoices [data-sonata-id="'+alternate+'"]');
  await check('document.getElementById("dialogCopy").textContent.includes("Choose Echo")','Sonata dialog has wrong commit semantics');
  await click('#confirmSwitch');
  await check('!validateEchoCandidate(echoUi.editorDraft,echoById.get(echoUi.previewId))&&document.getElementById("echoEquip").textContent==="Choose Echo"&&JSON.stringify(Object.keys(echoUi.editorDraft).sort())===JSON.stringify(["echoId","selectedSonataSetId"])&&document.querySelectorAll("#echoSubstats .bb-combobox").length===0','Candidate fabricated completed stats or exposed their editors');
  await unchanged(snapshot,'Browsing/Sonata changes wrote equipment');
  await capture(send,'artifacts/ui-preview-improve-candidate-workspace-1440x900.png');
  await click('#echoInfoToggle');await check('document.getElementById("echoInfoCard").classList.contains("is-expanded")&&document.getElementById("echoSkillCopy").textContent===echoById.get(echoUi.previewId).skill.skillDescription','Shared Echo Skill info failed');await click('#echoInfoToggle');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});await closed();
  await check('improveUi.candidate===null','Escape committed Candidate');await unchanged(snapshot,'Escape changed equipment');
  await open();await check('echoUi.previewId===null','Canceled Preview restored as Candidate');
  const visible=await read('document.querySelector("#echoChoices .echo-choice:not([hidden])").dataset.echoId');
  await click('#echoChoices [data-echo-id="'+visible+'"]');
  const assignment=await read('echoUi.editorDraft.selectedSonataSetId');
  await read('echoUi.editorDraft.selectedSonataSetId="unknown-set";echoUi.syncEquipAction()');
  await check('document.getElementById("echoEquip").disabled','Unknown Sonata enabled commit');await read('echoUi.equipPreview()');await check('improveUi.candidate===null','Unknown Sonata committed');
  await read('echoUi.editorDraft.selectedSonataSetId='+JSON.stringify(assignment)+';echoUi.syncEquipAction()');
  const preview=await read('JSON.stringify(echoUi.editorDraft)');await click('#echoEquip');await closed();
  await check('JSON.stringify(improveUi.candidate)==='+JSON.stringify(preview)+'&&document.querySelector("#improveCandidateEcho .improve-echo-large-name").textContent===echoById.get(improveUi.candidate.echoId).name','Choose Echo did not populate Candidate');
  await check('document.querySelector(".improve-candidate-sonata").textContent===echoSonataById.get(improveUi.candidate.selectedSonataSetId).name&&document.querySelector(".improve-candidate-unbuilt").textContent.includes("Level —")&&!document.querySelector("#improveCandidateEcho .improve-echo-substats")&&document.getElementById("improveHelperTitle").textContent==="Enter Main Stat"','Candidate is not presented as an unfinished Echo');
  await unchanged(snapshot,'Choose Echo mutated Current Build');
  await open();await check('JSON.stringify(echoUi.editorDraft)==='+JSON.stringify(preview)+'&&echoUi.editorDraft!==improveUi.candidate','Candidate Preview aliases committed state');
  const alternative=await read(`[...document.querySelectorAll('#echoChoices .echo-choice:not([hidden])')].find(node=>node.dataset.echoId!==${JSON.stringify(visible)}).dataset.echoId`);
  await click('#echoChoices [data-echo-id="'+alternative+'"]');
  await check('JSON.stringify(improveUi.candidate)==='+JSON.stringify(preview),'Browsing mutated Candidate');await click('#echoClose');await closed();
  await check('JSON.stringify(improveUi.candidate)==='+JSON.stringify(preview),'Close discarded existing Candidate');await unchanged(snapshot,'Cancel wrote equipment');
  await open();await click('#echoChoices [data-echo-id="'+alternative+'"]');const updated=await read('JSON.stringify(echoUi.editorDraft)');await click('#echoEquip');await closed();
  await check('JSON.stringify(improveUi.candidate)==='+JSON.stringify(updated)+'&&JSON.stringify(improveUi.candidate)!=='+JSON.stringify(preview),'Choose another Echo did not update Candidate');await unchanged(snapshot,'Candidate replacement wrote equipment');
  // Presentation uses saved state and shared renderer, including disabled Forte ancestors.
  await check(`(()=>{
    const nodes=[...document.querySelectorAll('#improveSkillsTree .forte-node')],tree=skillsPreviewByCharacterId.get('augusta'),investment=improveUi.skillState();
    return nodes.length===tree.nodes.length&&nodes.every(n=>n.tagName==='SPAN'&&n.classList.contains('is-active')===window.bellibingForte.forteNodeActive(tree,investment,n.dataset.nodeId))&&!document.querySelector('#improveSkillsTree button')&&document.querySelector('#improveSkillsTree [data-skill-level="normal-attack"]').textContent==='Lv.0';
  })()`,'Improve Forte differs from saved canonical tree/state');
  await check(`JSON.stringify([...document.querySelectorAll('#improveSequenceList .node')].map(n=>Number(n.dataset.sequence)))==='[6,5,4,3,2,1]'&&document.querySelectorAll('#improveSequenceList .is-active').length===3&&!document.querySelector('#improveSequenceList button')`,'Read-only Sequence order/state mismatch');
  await check(`(()=>{const w=improveUi.currentWeapon();return document.getElementById('improveWeaponAtk').textContent===String(w.level90BaseAtk)&&document.getElementById('improveWeaponSecondaryName').textContent===w.secondary.stat&&document.getElementById('improveWeaponSecondaryValue').textContent===formatWeaponSecondaryValue(w.secondary.value)})()`,'Weapon facts differ from canonical equipped weapon');
  await check(`(()=>{const p=projectImproveCurrentStats('Augusta'),rows=[...document.querySelectorAll('#improveStatList .improve-stat-row')],keys=rows.map(r=>r.dataset.statKey),extras=keys.slice(6);let zero=false;return JSON.stringify(keys.slice(0,6))===JSON.stringify(BUILD_STAT_PRIMARY_ROWS.map(r=>r.key))&&rows.every(r=>r.querySelector('.improve-stat-current').textContent===statsUi.format(p[r.dataset.statKey],improveUi.statSpecs(p).find(s=>s.key===r.dataset.statKey).percent))&&extras.every(key=>{if(!p[key])zero=true;return !zero||!p[key]})&&document.querySelector('[data-stat-key="elementDamageBonus"] .improve-stat-label').textContent.trim()==='Electro DMG Bonus'})()`,'Stats labels/order/values differ from source projection');
  for(const [width,height] of [[1440,900],[1920,1080],[2560,1440]]) {
    await setViewport(send,width,height);await settled();
    // Settings reserves the full hover envelope. The owning Improve document
    // scrolls to the unchanged workspace; no scale-to-fit or clipped controls.
    await read('document.getElementById("improveBuildCard").scrollIntoView({block:"start",behavior:"instant"})');
    await read('Promise.all([...document.querySelectorAll("#improveFocus img[src]")].map(img=>img.decode().catch(()=>{})))');
    await check(`(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect(),outer=rect('#improveBuildCard'),parts=['.improve-truth','.improve-stats','.improve-workspace','#improveEchoRow'],hero=rect('.improve-truth-art'),rail=rect('#improveSequenceList');return document.documentElement.scrollWidth===innerWidth&&outer.bottom<innerHeight&&outer.width<=1280&&parts.every(s=>{const r=rect(s);return r.left>=outer.left&&r.right<=outer.right&&r.bottom<=outer.bottom})&&rail.left>=hero.right&&document.querySelectorAll('#improveEchoRow button').length===5&&[...document.querySelectorAll('#improveFocus img[src]')].every(img=>img.naturalWidth>0)})()`,'Improve layout overflow/broken assets at '+width);
    await capture(send,'artifacts/ui-preview-improve-candidate-'+width+'x'+height+'.png');
    await check(`(()=>{
      const rect=n=>n.getBoundingClientRect(),cards=[...document.querySelectorAll('#improveCurrentEcho,#improveCandidateEcho,#improveEchoRow button')];
      const identities=cards.every(card=>{const name=rect(card.querySelector('.improve-echo-large-name,.improve-equipped-name')),art=rect(card.querySelector('.improve-echo-large-art,.improve-equipped-art')),meta=rect(card.querySelector('.improve-echo-large-meta,.improve-equipped-cost'));return name.bottom<=art.top+1&&art.bottom<=meta.top+1});
      const art=rect(document.querySelector('.improve-weapon-art')),image=rect(document.getElementById('improveWeaponArt')),facts=rect(document.querySelector('.improve-weapon-facts'));
      return identities&&image.bottom<=art.bottom+1&&image.top>=art.top-1&&facts.top>=art.bottom-1&&document.querySelector('.improve-weapon-facts>div:first-child #improveWeaponSecondaryName')&&document.querySelector('.improve-weapon-facts>div:last-child #improveWeaponAtk');
    })()`,'Identity hierarchy or Weapon art containment failed at '+width);
  }
  await setViewport(send,1440,900);await settled();await switchCharacter('qingxiao');
  await check('improveUi.characterName==="Qingxiao"&&improveUi.candidate===null&&document.querySelectorAll("#improveSequenceList .is-active").length===1&&document.getElementById("improveWeaponAtk").textContent==="Pending"','Character switch leaked Candidate or source context');
  const second=await stored();await open();await click('#echoClose');await closed();await unchanged(second,'Other Character Candidate open/close wrote equipment');
  await switchCharacter('augusta');await check(`${buildSnapshot}===${JSON.stringify(equipment)}&&improveUi.candidate===null`,'Character switch changed equipment or retained Candidate');
  // Stale async/context commits are rejected even if the Character changes while mounted.
  await open();await read(`echoUi.select(${JSON.stringify(visible)});improveUi.setCharacter('Qingxiao');echoUi.equipPreview()`);await closed();
  await check('improveUi.candidate===null','Stale Candidate committed to another Character');
  await navigate(send);await wait('echoDataLoaded&&characterMechanicsDataLoaded','Reload not ready');
  await check(`${buildSnapshot}===${JSON.stringify(equipment)}&&improveUi.candidate===null`,'Reload persisted Candidate into equipment');
  // A previously selected Build owner is independent from the Improve owner.
  await read(`show('build');buildPicker.select('Qingxiao');show('improve');improvePicker.select('Augusta')`);await settled();
  const bound=await stored();await open();await check('echoUi.characterName==="Qingxiao"&&echoUi.context.characterName==="Augusta"','Candidate overwrote equipped owner binding');
  await read(`echoUi.select(${JSON.stringify(visible)})`);await click('#echoEquip');await closed();await unchanged(bound,'Candidate wrote to previously selected Build owner');
  await read(`show('build');buildPicker.select('Qingxiao')`);await settled();await click('.echo[data-echo-slot="0"]');
  await wait('echoUi.open&&echoUi.context.kind==="equipped"','Build did not restore equipped mode');await sleep(550);
  await read(`echoUi.select(${JSON.stringify(visible)})`);await check('document.getElementById("echoEquip").textContent==="Equip Echo"','Equipped action retained Candidate semantics');await click('#echoEquip');
  await check(`echoSlotId(readEchoSets('Qingxiao').sets['set-1'].slots[0])===${JSON.stringify(visible)}&&${buildSnapshot}===${JSON.stringify(equipment)}`,'Equipped commit context regression');
  await click('#echoClose');await closed();
  console.log('- Improve Candidate: shared identity/Sonata selector; physical Choose Echo/cancel; delayed Forte module/runtime readiness; invalid/stale rejection; Current isolation; Character/reload isolation; canonical read-only Weapon/Sequence/Forte/stats; 1440/1920/2560 passed.');
}
