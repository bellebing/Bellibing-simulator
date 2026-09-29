// Runs inside the existing Echo Workspace browser harness so both commit contexts
// exercise the same page, editor controls and canonical data.
export async function verifyImproveCandidate({send,evaluate,navigate,setViewport,waitForUi,pointerClick,chooseBellibingComboOption,capture,sleep}) {
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
    const r=await read(`document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().toJSON()`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x+r.width/2,y:r.y+r.height/2});await sleep(850);
    await click(selector);await sleep(650);
    if(!await read('!!activeConfirmation'))await click(selector);
    await wait('activeConfirmation?.kind==="character"','Character confirmation missing');
    await click('#confirmSwitch');await settled();
  }
  await setViewport(send,1440,900);await navigate(send);await read('localStorage.clear()');await navigate(send);
  await wait('echoDataLoaded&&weaponDataLoaded&&characterMechanicsDataLoaded&&sequenceRuntimeDataLoaded&&buildStatsRuntimeLoaded&&releasedCharacters.length===57','Improve canonical sources not ready');
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
  await check('document.querySelectorAll("#echoOverlay").length===1&&document.querySelectorAll("#echoWorkspaceSlots button:disabled").length===5&&!echoUi.editorDraft','Candidate did not reuse empty Preview and read-only equipped dock');
  await click('#echoClose');await closed();await unchanged(snapshot,'Closing empty Candidate changed equipment');
  await open();
  await click('#echoSonataToggle');await click('#echoSonataAll');await click('#echoSonataToggle');
  await click('[data-echo-filter="all"]');
  await check('echoUi.selectedSonataIds.size===0&&echoUi.filter==="all"','Candidate Sonata/Cost filters failed');
  const id=await read('echoCatalog.find(item=>item.sonataSetIds.length>1).id');
  await click('#echoChoices [data-echo-id="'+id+'"]');
  await wait(`echoUi.previewId===${JSON.stringify(id)}`,'Candidate browser pointer did not select');
  await chooseBellibingComboOption(send,'echoMainStatName',1);
  await chooseBellibingComboOption(send,'echoSubstat0Name',1);
  await chooseBellibingComboOption(send,'echoSubstat0Value',1);
  const alternate=await read('echoById.get(echoUi.previewId).sonataSetIds.find(id=>id!==echoUi.editorDraft.selectedSonataSetId)');
  await click('#echoPreviewSonataChoices [data-sonata-id="'+alternate+'"]');
  await check('document.getElementById("dialogCopy").textContent.includes("Use as Candidate")','Sonata dialog has wrong commit semantics');
  await click('#confirmSwitch');
  await check('echoUi.editorDraft.level===5&&!validateEchoStatCard(echoUi.editorDraft,echoById.get(echoUi.previewId))&&document.getElementById("echoEquip").textContent==="Use as Candidate"','Candidate editor did not use canonical level/stat validation');
  await unchanged(snapshot,'Browsing/editor changes wrote equipment');
  await capture(send,'artifacts/ui-preview-improve-candidate-workspace-1440x900.png');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});await closed();
  await check('improveUi.candidate===null','Escape committed Candidate');await unchanged(snapshot,'Escape changed equipment');
  await open();await check('echoUi.previewId===null','Canceled Preview restored as Candidate');
  const visible=await read('document.querySelector("#echoChoices .echo-choice:not([hidden])").dataset.echoId');
  await click('#echoChoices [data-echo-id="'+visible+'"]');
  await chooseBellibingComboOption(send,'echoSubstat0Name',1);await chooseBellibingComboOption(send,'echoSubstat0Value',1);
  // An invalid draft must fail closed through the same validator as Equip.
  await read('echoUi.editorDraft.mainStat.value=-123;echoUi.syncEquipAction()');
  await check('document.getElementById("echoEquip").disabled','Invalid Candidate enabled commit');
  await read('echoUi.equipPreview()');await check('improveUi.candidate===null','Invalid Candidate committed');
  await read('echoUi.renderEditor()');
  const preview=await read('JSON.stringify(echoUi.editorDraft)');
  await click('#echoEquip');await closed();
  await check(`JSON.stringify(improveUi.candidate)===${JSON.stringify(preview)}&&document.querySelector('#improveCandidateEcho .improve-echo-large-name').textContent===echoById.get(improveUi.candidate.echoId).name`,'Candidate commit did not render exact card');
  await unchanged(snapshot,'Candidate commit mutated Current Build');
  // Reopening clones committed Candidate; edits and close must leave that object untouched.
  await open();await check(`JSON.stringify(echoUi.editorDraft)===${JSON.stringify(preview)}&&echoUi.editorDraft!==improveUi.candidate`,'Candidate editor aliases committed state');
  await chooseBellibingComboOption(send,'echoSubstat0Value',2);
  await check(`JSON.stringify(improveUi.candidate)===${JSON.stringify(preview)}`,'Editing Preview mutated committed Candidate');
  await click('#echoClose');await closed();
  await check(`JSON.stringify(improveUi.candidate)===${JSON.stringify(preview)}`,'Close discarded committed Candidate');await unchanged(snapshot,'Candidate cancel wrote equipment');
  await open();await chooseBellibingComboOption(send,'echoSubstat0Value',2);const updated=await read('JSON.stringify(echoUi.editorDraft)');await click('#echoEquip');await closed();
  await check(`JSON.stringify(improveUi.candidate)===${JSON.stringify(updated)}&&JSON.stringify(improveUi.candidate)!==${JSON.stringify(preview)}`,'Edit Candidate did not update transient card');await unchanged(snapshot,'Candidate update wrote equipment');
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
    await read('Promise.all([...document.querySelectorAll("#improveFocus img[src]")].map(img=>img.decode().catch(()=>{})))');
    await check(`(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect(),outer=rect('#improveBuildCard'),parts=['.improve-truth','.improve-stats','.improve-workspace','#improveEchoRow'],hero=rect('.improve-truth-art'),rail=rect('#improveSequenceList');return document.documentElement.scrollWidth===innerWidth&&outer.bottom<innerHeight&&outer.width<=1280&&parts.every(s=>{const r=rect(s);return r.left>=outer.left&&r.right<=outer.right&&r.bottom<=outer.bottom})&&rail.left>=hero.right&&document.querySelectorAll('#improveEchoRow button').length===5&&[...document.querySelectorAll('#improveFocus img[src]')].every(img=>img.naturalWidth>0)})()`,'Improve layout overflow/broken assets at '+width);
    await capture(send,'artifacts/ui-preview-improve-candidate-'+width+'x'+height+'.png');
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
  console.log('- Improve Candidate: physical New Echo/filter/editor/commit/cancel; invalid/stale rejection; Current isolation; Character/reload isolation; canonical read-only Weapon/Sequence/Forte/stats; 1440/1920/2560 passed.');
}
