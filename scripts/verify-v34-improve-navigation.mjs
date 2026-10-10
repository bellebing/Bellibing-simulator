// Physical Chromium regression for presentation-only navigation. The second page
// must not recreate the original workspace or cross a persistence/session boundary.
export async function verifyImproveNavigation({send,evaluate,navigate,setViewport,waitForUi,pointerClick,capture,sleep}) {
  const read=expression=>evaluate(send,expression);
  const check=async(expression,message)=>{if(!await read(expression))throw new Error('Improve navigation: '+message+' '+JSON.stringify(await read(`({focus:document.activeElement.id,pages:[...document.querySelectorAll('.improve-card-page')].map(n=>({id:n.id,inert:n.inert,hidden:n.getAttribute('aria-hidden'),visibility:getComputedStyle(n).visibility}))})`)))};
  const click=selector=>pointerClick(send,selector);
  const ready=()=>waitForUi(send,'echoDataLoaded&&releasedCharacters.length===59&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"','Improve navigation data not ready',15000);
  await setViewport(send,1440,900);await navigate(send);await read('localStorage.clear()');await navigate(send);await ready();
  // Seed source-backed equipment through existing owners in this isolated profile.
  await read(`(()=>{
    addOwned('Augusta');addOwned('Chixia');
    const item=echoCatalog.find(row=>row.name==='Sigillum');
    commitEchoSlot('Augusta',2,makeEchoStatCard(item,item.sonataSetIds[0],{echoId:item.id}));
    autosave('Augusta',{weaponId:'thunderflare-dominion',sequenceLevel:3});
    show('improve');improvePicker.select('Augusta');
  })()`);await sleep(800);
  await read('document.fonts.ready');
  await check(`document.getElementById('improveCharacterPageTitle').textContent==='Improve your character'&&document.getElementById('improveSimulationPageTitle').textContent==='Simulate Echo Set'`,'exact titles');
  await check(`document.querySelector('#improveCharacterPage .improve-card-arrow').disabled&&!document.getElementById('improveCardNext').disabled&&!document.getElementById('improveCardPrevious').disabled&&document.querySelector('#improveSimulationPage .improve-card-arrow:last-child').disabled`,'native endpoint disabled states');
  await check(`(()=>{const host=document.getElementById('improveEmptyCard');return host.children.length===4&&host.children[0].classList.contains('improve-truth')&&host.children[1].classList.contains('improve-stats')&&host.querySelectorAll('.simulate-echo-slot').length===5&&host.querySelectorAll('.simulate-empty-echo').length===2&&host.querySelector('#simulateSelectedEchoLabel').textContent.trim()==='Echo 1'&&host.querySelector('.simulate-result-echo').textContent.includes('Select a slot')&&host.querySelectorAll('button').length===14&&host.querySelector('#simulateEchoPreview').tagName==='DIV'&&host.querySelector('#simulateEditEcho').textContent==='Edit Echo'&&host.querySelector('#simulateEchoPreview').textContent.includes('Empty Echo Slot')&&!host.querySelector('#simulateTemplatePicker')&&[...host.querySelectorAll('.simulate-slot-actions button')].every(n=>n.disabled)&&host.querySelector('.simulate-modes button:last-child').disabled&&!host.querySelector('.simulate-start').disabled&&!host.querySelector('.simulate-modes button:first-child').disabled&&!host.querySelector('.improve-workspace,.improve-echoes-row,.improve-settings,img:not(.improve-truth img,.improve-stats img)')})()`,'five selectable slots, active one-slot mode, Pending result and eleven disabled controls');
  const sameCharacter=async()=>{
    await check(`(()=>{const original=document.getElementById('improveBuildCard'),second=document.getElementById('improveEmptyCard');return ['.improve-truth','.improve-stats'].every(selector=>original.querySelector(selector).outerHTML===second.querySelector(selector).outerHTML.replaceAll('simulate-',''))})()`,'same rendered Character name/art, Sequence, Weapon, Forte and canonical stat values');
    await check(`(()=>{const second=document.getElementById('improveEmptyCard');return [...second.querySelectorAll('[id]')].every(n=>document.querySelectorAll('[id="'+n.id+'"]').length===1)&&[...second.querySelectorAll('*')].every(n=>[...n.attributes].every(a=>[...a.value.matchAll(/url\\((['"]?)#([^)'"\\s]+)\\1\\)/g)].every(match=>second.querySelector('[id="'+match[2]+'"]'))))})()`,'unique DOM/SVG IDs and valid local Forte gradient/filter references');
    await check(`(()=>{const a=document.getElementById('improveBuildCard'),b=document.getElementById('improveEmptyCard'),ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();if(document.getElementById('improveSimulationPage').getAttribute('aria-hidden')==='true')return true;return ['.improve-truth','.improve-stats'].every(selector=>{const original=[a.querySelector(selector),...a.querySelector(selector).querySelectorAll('*')],copies=[b.querySelector(selector),...b.querySelector(selector).querySelectorAll('*')];return original.every((n,i)=>{const r=n.getBoundingClientRect(),s=copies[i].getBoundingClientRect();return Math.abs(r.width-s.width)<.1&&Math.abs(r.height-s.height)<.1&&(!(r.width||r.height)||(Math.abs(r.x-ar.x-s.x+br.x)<.1&&Math.abs(r.y-ar.y-s.y+br.y)<.1))&&['fontFamily','fontSize','color','background','border','borderRadius'].every(k=>getComputedStyle(n)[k]===getComputedStyle(copies[i])[k])})})})()`,'Character and Stats retain original relative layout, dimensions and styling');
  };
  await sameCharacter();
  // A hidden mirror must never alter original Forte rasterization. Its backdrop
  // filter previously composited over the visible tree and blurred its icons.
  await read(`document.getElementById('improveSkillsTree').scrollIntoView({block:'center',behavior:'instant'})`);await sleep(250);
  const skillsClip=await read(`(()=>{const r=document.getElementById('improveSkillsTree').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,scale:1}})()`);
  const withMirror=await send('Page.captureScreenshot',{format:'png',clip:skillsClip});
  await read(`window.__skillsMirrorNodes=[...document.getElementById('improveEmptyCard').childNodes];document.getElementById('improveEmptyCard').replaceChildren()`);await sleep(250);
  const withoutMirror=await send('Page.captureScreenshot',{format:'png',clip:skillsClip});
  await read(`document.getElementById('improveEmptyCard').replaceChildren(...window.__skillsMirrorNodes);delete window.__skillsMirrorNodes`);await sleep(250);
  if(withMirror.data!==withoutMirror.data)throw new Error('Improve navigation: hidden Character mirror alters original Forte pixels');
  // Include a real edited policy and selected Echo slot, not just default state.
  await click('#improve-setting-gate');await sleep(750);
  await click('[data-setting=gate] [data-setting-value="10"]');await sleep(750);
  await read('improveUi.selectedEchoIndex=2;improveUi.render()');
  const snapshot=`JSON.stringify({account:state,storage:Object.entries(localStorage).sort(),settings:window.bellibingImproveSettings.getState(),character:improveUi.characterName,id:improveUi.characterId,selected:improvePicker.selected,slot:improveUi.selectedEchoIndex,candidate:improveUi.candidate,context:improveUi.contextVersion,simulator:improveUi.simulator})`;
  const before=await read(snapshot),originalAccount=await read('JSON.stringify(state)');
  await read(`window.__navigationCard=document.getElementById('improveBuildCard');window.__navigationSettings=document.getElementById('improveSettings');window.__navigationChild=document.getElementById('improveNewEcho')`);
  const geometry=`(()=>{const card=document.getElementById('improveBuildCard'),r=card.getBoundingClientRect(),settings=document.getElementById('improveSettings');return JSON.stringify({width:r.width,height:r.height,settings:settings.innerHTML,children:[...card.children].map(n=>{const a=n.getBoundingClientRect();return [a.x-r.x,a.y-r.y,a.width,a.height]})})})()`;
  const originalGeometry=await read(geometry);
  const active=async(index)=>{
    await check(`(()=>{const a=document.getElementById('improveCharacterPage'),b=document.getElementById('improveSimulationPage');return a.inert===${index===1}&&b.inert===${index===0}&&getComputedStyle(a).visibility==='${index===0?'visible':'hidden'}'&&getComputedStyle(b).visibility==='${index===1?'visible':'hidden'}'})()`,'only active card is visible and keyboard accessible');
    await check(`${snapshot}===${JSON.stringify(before)}`,'Character, Settings, equipment, resources, storage and session unchanged');
    await check(`window.__navigationCard===document.getElementById('improveBuildCard')&&window.__navigationSettings===document.getElementById('improveSettings')&&window.__navigationChild===document.getElementById('improveNewEcho')&&${geometry}===${JSON.stringify(originalGeometry)}`,'original workspace nodes, internal geometry and Settings survive navigation');
    await sameCharacter();
    await check(`document.documentElement.scrollWidth===1440&&document.getElementById('improveCardDeck').scrollWidth<=document.getElementById('improveCardDeck').clientWidth`,'no horizontal overflow');
  };
  await active(0);
  await read(`document.getElementById('improveCardDeck').scrollIntoView({block:'start',behavior:'instant'})`);
  await capture(send,'artifacts/ui-preview-improve-navigation-first-1440x900.png');
  for(let cycle=0;cycle<3;cycle++){
    await click('#improveCardNext');await active(1);
    await check(`(()=>{const a=document.getElementById('improveBuildCard'),b=document.getElementById('improveEmptyCard'),r=a.getBoundingClientRect(),s=b.getBoundingClientRect();return ['x','y','width'].every(k=>Math.abs(r[k]-s[k])<.1)&&s.height>=r.height&&['background','border','borderRadius','boxShadow'].every(k=>getComputedStyle(a)[k]===getComputedStyle(b)[k])})()`,'second surface retains width, position and styling with necessary additional vertical space');
    await read(`document.querySelector('#improveSimulationPage .improve-card-arrow:last-child').click()`);await active(1);
    if(cycle===0){await read(`document.getElementById('improveCardDeck').scrollIntoView({block:'start',behavior:'instant'})`);await capture(send,'artifacts/ui-preview-improve-navigation-second-1440x900.png')}
    await click('#improveCardPrevious');await active(0);
    await read(`document.querySelector('#improveCharacterPage .improve-card-arrow').click()`);await active(0);
  }
  // Slot selection and disabled controls preserve equipment, settings and resources.
  await click('#improveCardNext');
  const presentationSnapshot=await read(snapshot);
  const selectedPresentationSlot=()=>`(()=>{const slots=[...document.querySelectorAll('#improveEmptyCard .simulate-echo-slot')],chosen=slots.filter(slot=>slot.classList.contains('is-selected'));if(chosen.length!==1)return null;const index=slots.indexOf(chosen[0]);const gold=getComputedStyle(document.querySelector('.improve-equipped-echo.is-selected')),active=getComputedStyle(chosen[0]);return {index:index+1,label:document.getElementById('simulateSelectedEchoLabel').textContent,pressed:slots.map(slot=>slot.getAttribute('aria-pressed')),roles:slots.map(slot=>slot.getAttribute('role')),tab:slots.map(slot=>slot.tabIndex),gold:active.borderColor===gold.borderColor&&active.backgroundColor===gold.backgroundColor&&active.boxShadow===gold.boxShadow}})()`;
  const selectedCheck=async index=>{
    const result=await read(selectedPresentationSlot());
    if(!result||result.index!==index||result.label!=='Echo '+index||!result.gold||result.pressed.some((value,i)=>value!==String(i===index-1))||result.roles.some(value=>value!=='button')||result.tab.some(value=>value!==0))throw new Error('Simulate slot selection '+index+': '+JSON.stringify(result));
    await check(`${snapshot}===${JSON.stringify(presentationSnapshot)}`,'selecting a presentation slot changed existing Character, settings, simulator or storage');
  };
  await selectedCheck(1);
  const slotDimensions=await read(`[...document.querySelectorAll('.simulate-echo-slot,.simulate-empty-echo')].map(n=>{const r=n.getBoundingClientRect();return [r.width,r.height]})`);
  for(const index of [2,3,4,5,1]){
    await click(`.simulate-echo-slot:nth-child(${index})`);
    await selectedCheck(index);
  }
  for(const [index,key,code,virtual] of [[2,'Enter','Enter',13],[4,' ','Space',32]]){
    await read(`document.querySelector('.simulate-echo-slot:nth-child(${index})').focus()`);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:virtual,text:key==='Enter'?'\\r':' '});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:virtual});
    await selectedCheck(index);
  }
  await check(`JSON.stringify([...document.querySelectorAll('.simulate-echo-slot,.simulate-empty-echo')].map(n=>{const r=n.getBoundingClientRect();return [r.width,r.height]}))===${JSON.stringify(JSON.stringify(slotDimensions))}`,'slot selection changed card dimensions');
  for(const selector of ['.simulate-start','.simulate-modes button:first-child','.simulate-modes button:last-child',...Array.from({length:5},(_,i)=>`.simulate-echo-slot:nth-child(${i+1}) .simulate-slot-actions button:first-child`),...Array.from({length:5},(_,i)=>`.simulate-echo-slot:nth-child(${i+1}) .simulate-slot-actions button:last-child`)])await click(selector);
  await check(`${snapshot}===${JSON.stringify(presentationSnapshot)}`,'no-budget Simulate and disabled controls do not mutate account, Settings, resources, equipment or session');
  await check(`(()=>{const host=document.getElementById('improveEmptyCard');return JSON.stringify([...host.querySelectorAll('.simulate-controls .simulate-summary:first-of-type dt')].map(n=>n.textContent))===JSON.stringify(['ATK','CRIT Rate','CRIT DMG','Energy Regen','Heavy Attack DMG'])&&JSON.stringify([...host.querySelectorAll('.simulate-resources dt')].map(n=>n.textContent))===JSON.stringify(['Echoes','Tuners','EXP Tubes'])&&[...host.querySelectorAll('.simulate-summary dd')].every(n=>n.textContent==='—')})()`,'Simulated/Used labels and neutral values; no fabricated numbers');
  await read(`document.querySelector('.simulate-echo-slots').scrollIntoView({block:'end',behavior:'instant'})`);await sleep(100);
  await check(`(()=>{const host=document.getElementById('improveEmptyCard'),slots=[...host.querySelectorAll('.simulate-echo-slot')],rect=n=>n.getBoundingClientRect(),first=rect(slots[0]),stats=rect(host.querySelector('.improve-stats')),work=rect(host.querySelector('.simulate-workspace'));return first.width>=180&&first.height===280&&slots.every((n,i)=>{const r=rect(n);return Math.abs(r.width-first.width)<.1&&r.height===first.height&&r.top===first.top&&r.top>=0&&r.bottom<=900&&r.left>=0&&r.right<=1440&&(!i||rect(slots[i-1]).right<r.left)&&getComputedStyle(n.querySelector('.simulate-slot-actions')).borderTopWidth==='1px'&&getComputedStyle(n.querySelector('button+button')).borderLeftWidth==='1px'})&&first.top>=stats.bottom&&first.top>=work.bottom&&document.documentElement.scrollWidth===1440})()`,'five large equal visible slots, dividing lines, clear of Stats/workspace and no overflow');
  await click('.simulate-echo-slot:nth-child(3)');await selectedCheck(3);
  await capture(send,'artifacts/ui-preview-simulate-layout-slots-1440x900.png');
  await read(`document.querySelector('.simulate-workspace').scrollIntoView({block:'center',behavior:'instant'})`);await sleep(100);
  await check(`(()=>{const host=document.getElementById('improveEmptyCard'),a=host.querySelector('.simulate-setup-column > .simulate-empty-echo').getBoundingClientRect(),controls=host.querySelector('.simulate-controls').getBoundingClientRect(),modes=host.querySelector('.simulate-modes').getBoundingClientRect(),b=host.querySelector('.simulate-result .simulate-empty-echo').getBoundingClientRect(),stats=host.querySelector('.improve-stats').getBoundingClientRect();return a.top>=0&&b.top>=0&&a.bottom<=900&&b.bottom<=900&&a.height===330&&b.height===330&&Math.abs(a.width-b.width)<.1&&stats.right<a.left&&a.right<controls.left&&controls.right<b.left&&modes.bottom<=b.top&&Math.abs(a.top-b.top)<.1})()`,'large central/result cards visible with controls between and modes above result, no overlap');
  await capture(send,'artifacts/ui-preview-simulate-layout-workspace-1440x900.png');
  // Physical Echo Workshop workflow: full validated stat cards, no Build writes.
  const preparedSnapshot=await read(snapshot);
  const identities=await read('(()=>{const found={};for(const item of echoCatalog)if(!found[item.cost])found[item.cost]=item.id;return found})()');
  for(const cost of [1,3,4])if(!identities[cost])throw new Error('Missing released canonical Echo Cost '+cost);
  await check('!document.getElementById("simulateEchoPreview").matches("button,[role=button]")&&document.getElementById("simulateEchoPreview").querySelector(".simulate-preview-empty").textContent==="Empty Echo Slot"','neutral read-only preview');
  await click('#simulateEchoPreview');
  await check('!echoUi.open','clicking read-only preview must never launch a picker');
  const openEditor=async(index)=>{
    await click('.simulate-echo-slot:nth-child('+index+')');await selectedCheck(index);
    await click('#simulateEditEcho');
    await waitForUi(send,'echoUi.open&&echoUi.context.kind==="simulate-setup"','Complete Echo Workshop did not open');
    await check('document.getElementById("echoTitle").textContent.includes("Echo Workshop")&&document.getElementById("echoWorkspaceSlots").hidden&&!document.querySelector(".echo-editor-stats").hidden&&!document.querySelector(".echo-preview-sonata-assignment").hidden&&getComputedStyle(document.querySelector(".echo-editor-stats")).display!=="none"','must reuse full Echo Workshop with main/substats/Sonata');
  };
  const saveEditor=async()=>{
    await check('validateEchoStatCard(echoUi.editorDraft,echoById.get(echoUi.previewId))===""','prepared card must pass canonical validation');
    await check('!document.getElementById("echoEquip").disabled&&document.getElementById("echoEquip").textContent==="Save Echo"','prepared card save is enabled');
    await click('#echoEquip');
    await waitForUi(send,'!echoUi.open&&!document.getElementById("echoOverlay").classList.contains("mounted")','Workshop save did not close');
  };
  const verifyPrepared=async(index,card)=>{
    const actual=await read('(()=>{const slot=document.querySelector(".simulate-echo-slot:nth-child('+index+')"),preview=document.getElementById("simulateEchoPreview"),item=echoById.get('+JSON.stringify(card.echoId)+'),return {id:slot.dataset.preparedEchoId,centerId:preview.dataset.preparedEchoId,name:slot.querySelector(".simulate-template-name")?.textContent,cost:slot.querySelector(".simulate-template-cost")?.textContent,art:slot.querySelector(".simulate-template-art")?.getAttribute("src"),loaded:slot.querySelector(".simulate-template-art")?.naturalWidth>0,centerLoaded:preview.querySelector(".simulate-template-art")?.naturalWidth>0,stats:[...preview.querySelectorAll(".simulate-prepared-stats > div")].map(row=>row.textContent),level:preview.querySelector(".simulate-prepared-meta")?.textContent,sonata:echoSonataById.get('+JSON.stringify(card.selectedSonataSetId)+')?.name}})()');
    if(actual.id!==card.echoId||actual.centerId!==card.echoId||actual.name!==card.name||actual.cost!=='COST '+card.cost||!actual.loaded||!actual.centerLoaded||!actual.level.includes(actual.sonata)||!actual.level.includes('+'+card.level)||JSON.stringify(actual.stats)!==JSON.stringify(card.stats))throw new Error('Prepared card image/name/COST/Sonata/level/main+substats in slot '+index+': '+JSON.stringify(actual));
    await check(snapshot+'==='+JSON.stringify(preparedSnapshot),'prepared Echo mutated account, Settings, resources, equipment or session');
  };
  const statText=stat=>stat.name+(stat.name.startsWith('Flat ')?String(stat.value):Number((stat.value*100).toFixed(2))+'%');
  const createPrepared=async(index,id)=>{
    await openEditor(index);
    await click('#echoChoices .echo-choice[data-echo-id="'+id+'"]');
    await check('echoUi.editorDraft.echoId==='+JSON.stringify(id)+'&&echoUi.editorDraft.substats.length===0&&echoUi.editorDraft.level===0&&echoUi.editorDraft.rank===echoStatContract.rank','new Echo must start with canonical Main/secondary only and zero rolls');
    const card=await read('cloneEchoSlot(echoUi.editorDraft)');
    await saveEditor();
    await check('document.querySelector(".simulate-echo-slot:nth-child('+index+')").dataset.preparedEchoId==='+JSON.stringify(id),'prepared slot identity');
    await selectedCheck(index);
    return {echoId:id,name:(await read('echoById.get('+JSON.stringify(id)+').name')),cost:(await read('echoById.get('+JSON.stringify(id)+').cost')),level:card.level,selectedSonataSetId:card.selectedSonataSetId,stats:[card.mainStat,card.secondaryMainStat,...card.substats].map(statText)};
  };
  // Fill all five slots, with independently owned cards.
  const cards=[];
  for(const [index,id] of [[1,identities[1]],[2,identities[3]],[3,identities[4]],[4,identities[1]],[5,identities[3]]]){
    cards[index-1]=await createPrepared(index,id);
  }
  await check('new Set([...document.querySelectorAll(".simulate-echo-slot")].map(n=>n.dataset.preparedEchoId)).size===3','five prepared cards retain three distinct canonical identities');
  await click('.simulate-echo-slot:nth-child(3)');
  // Reopen prepared card. Change Main Stat, Sonata when available, and a real substat/value through the existing combobox controls.
  await openEditor(3);
  await check('document.getElementById("echoEquip").textContent==="Saved"&&document.getElementById("echoEquip").disabled','reopening saved slot restores complete validated card');
  const nextMain=await read('echoMainOptions(echoById.get(echoUi.previewId).cost,0).find(row=>row.name!==echoUi.editorDraft.mainStat.name)?.name||null');
  if(!nextMain)throw new Error('No alternate canonical Main Stat for Cost 4');
  await click('#echoMainStatName-trigger');
  await click('#echoMainStatName-listbox .bb-combobox-option[data-bb-value='+JSON.stringify(nextMain)+']');
  await check('echoUi.editorDraft.mainStat.name==='+JSON.stringify(nextMain),'Main Stat changed through real combobox');
  const sonataNext=await read('echoById.get(echoUi.previewId).sonataSetIds.find(id=>id!==echoUi.editorDraft.selectedSonataSetId)||null');
  if(sonataNext){
    await click('#echoPreviewSonataChoices button[data-sonata-id='+JSON.stringify(sonataNext)+']');
    await check('!!activeConfirmation&&activeConfirmation.kind==="sonata"','Sonata confirmation preserved');
    await click('#confirmSwitch');
    await check('echoUi.editorDraft.selectedSonataSetId==='+JSON.stringify(sonataNext),'confirmed Sonata assignment');
  }
  const roll=await read('({name:echoStatContract.substats[0].name,value:echoStatContract.substats[0].values[0]})');
  await click('#echoSubstat0Name-trigger');
  await click('#echoSubstat0Name-listbox .bb-combobox-option[data-bb-value='+JSON.stringify(roll.name)+']');
  await click('#echoSubstat0Value-trigger');
  await click('#echoSubstat0Value-listbox .bb-combobox-option[data-bb-value='+JSON.stringify(String(roll.value))+']');
  await check('echoUi.editorDraft.level===5&&echoUi.editorDraft.substats.length===1&&echoUi.editorDraft.substats[0].name==='+JSON.stringify(roll.name)+'&&echoExact(echoUi.editorDraft.substats[0].value,'+roll.value+')','one physically entered source-backed +5 roll, no generated value');
  const preparedDetailed=await read('cloneEchoSlot(echoUi.editorDraft)');
  await saveEditor();
  const detailedSummary={echoId:preparedDetailed.echoId,name:await read('echoById.get('+JSON.stringify(preparedDetailed.echoId)+').name'),cost:preparedDetailed.cost,level:preparedDetailed.level,selectedSonataSetId:preparedDetailed.selectedSonataSetId,stats:[preparedDetailed.mainStat,preparedDetailed.secondaryMainStat,...preparedDetailed.substats].map(statText)};
  await verifyPrepared(3,detailedSummary);
  await click('#simulateEchoPreview');
  await check('!echoUi.open','configured preview must remain non-interactive');
  // Cancelling a changed draft must not update its prepared card.
  await openEditor(3);
  await click('#echoChoices .echo-choice[data-echo-id="'+identities[1]+'"]');
  await click('#echoClose');
  await waitForUi(send,'!document.getElementById("echoOverlay").classList.contains("mounted")','cancel did not close');
  await check('document.getElementById("simulateEchoPreview").dataset.preparedEchoId==='+JSON.stringify(detailedSummary.echoId),'cancel does not write prepared card');
  for(const [index,card] of cards.entries()){
    await click('.simulate-echo-slot:nth-child('+(index+1)+')');
    await verifyPrepared(index+1,index===2?detailedSummary:card);
  }
  await check('document.querySelector(".simulate-echo-slot:nth-child(3) .simulate-prepared-stats").children.length===3','complete +5 stats visible in bottom slot');
  await click('.simulate-echo-slot:nth-child(3)');
  await capture(send,'artifacts/ui-preview-simulate-prepared-cards-1440x900.png');
  // Editing slot 3 must not overwrite 1, 2, 4 or 5.
  await openEditor(3);await click('#echoChoices .echo-choice[data-echo-id="'+identities[3]+'"]');await saveEditor();
  await check('document.querySelector(".simulate-echo-slot:nth-child(3)").dataset.preparedEchoId==='+JSON.stringify(identities[3])+'&&document.querySelector(".simulate-echo-slot:nth-child(1)").dataset.preparedEchoId==='+JSON.stringify(identities[1])+'&&document.querySelector(".simulate-echo-slot:nth-child(2)").dataset.preparedEchoId==='+JSON.stringify(identities[3])+'&&document.querySelector(".simulate-echo-slot:nth-child(4)").dataset.preparedEchoId==='+JSON.stringify(identities[1])+'&&document.querySelector(".simulate-echo-slot:nth-child(5)").dataset.preparedEchoId==='+JSON.stringify(identities[3]),'one slot edit did not alter other four');
  await check(snapshot+'==='+JSON.stringify(preparedSnapshot),'complete Echo Workshop did not write real Character, resources, saved storage or simulator');
  await click('#improveCardPrevious');
  // Native keyboard activation and focus transfer work in both directions.
  for(const [id,key,code,virtual,index] of [['improveCardNext','Enter','Enter',13,1],['improveCardPrevious',' ','Space',32,0]]){
    await read(`document.getElementById(${JSON.stringify(id)}).focus()`);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:virtual,text:key==='Enter'?'\r':' '});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:virtual});await sleep(100);await active(index);
    await check(`document.activeElement.id==='${index===1?'improveCardPrevious':'improveCardNext'}'`,'focus follows the active navigation button');
  }
  // The existing candidate workflow is usable after returning, without rebuilding it.
  await click('#improveNewEcho');await check('echoUi.open','original Echo chooser still opens');
  await click('#echoClose');await check('!echoUi.open','original Echo chooser still closes');
  await waitForUi(send,`!document.getElementById('echoOverlay').classList.contains('mounted')`,'Echo chooser closing transition did not finish');
  await check(`JSON.stringify(state)===${JSON.stringify(originalAccount)}`,'original Echo chooser does not alter account data');
  // Navigation must neither start a session nor stop one started by existing code.
  await read('improveUi.startSimulation()');
  const session=await read('JSON.stringify(improveUi.simulator)'),account=await read('JSON.stringify(state)'),storage=await read('JSON.stringify(Object.entries(localStorage).sort())');
  await check('!!improveUi.simulator','existing simulator test fixture active');
  await click('#improveCardNext');await click('#improveCardPrevious');
  await check(`JSON.stringify(improveUi.simulator)===${JSON.stringify(session)}&&JSON.stringify(state)===${JSON.stringify(account)}&&JSON.stringify(Object.entries(localStorage).sort())===${JSON.stringify(storage)}`,'existing active session and saved data remain unchanged');
  await read('improveUi.closeSimulation()');
  const saved=await read('JSON.stringify(Object.entries(localStorage).sort())');
  await navigate(send);await ready();await read("show('improve');improveUi.setCharacter('Augusta')");
  await check(`JSON.stringify(Object.entries(localStorage).sort())===${JSON.stringify(saved)}`,'saved choices survive reload');
  await read("improvePicker.select('Augusta')");await sleep(800);await sameCharacter();
  // Switch with Card 2 visible; it must follow the one existing Character owner.
  await click('#improveCardNext');
  for(const name of ['Chixia','Augusta']){
    await read(`improvePicker.select(${JSON.stringify(name)})`);await sleep(800);await sameCharacter();
    await check(`document.getElementById('simulate-improveCharacterName').textContent===${JSON.stringify(name)}&&improveUi.characterName===${JSON.stringify(name)}`,'Character switches update both cards while Card 2 is visible');
    await check('document.documentElement.scrollWidth===1440','no overflow after Character switch');
    await check('[...document.querySelectorAll(".simulate-echo-slot")].every(slot=>!slot.dataset.preparedEchoId)&&document.getElementById("simulateEchoPreview").textContent.includes("Empty Echo Slot")','Character isolation clears transient prepared Echo cards');
  }
  await read(`document.getElementById('improveCardDeck').scrollIntoView({block:'start',behavior:'instant'})`);
  await capture(send,'artifacts/ui-preview-simulate-character-1440x900.png');
  await click('#improveCardPrevious');await sameCharacter();
  // Physical 1440×900 blocker: +5 Shell Credits are canonically required,
  // but no public user Resource Inventory / transaction for that currency exists.
  await click('#improveCardNext');
  await check('!improveUi.simulator&&window.bellibingResourceInventory.getState().echoes.count===0','fresh finite-zero boundary');
  await click('.simulate-start');
  await check('!improveUi.simulator&&window.bellibingResourceInventory.getState().echoes.count===0&&document.querySelector(".simulate-result-echo").textContent.includes("No Echoes available")','physical zero-budget click must render reason without spending');
  await read(`(()=>{
    window.__realBeforeSingle=JSON.stringify(state.drafts.Augusta.build);
    const change=(id,value)=>{const input=document.querySelector('[data-resource="'+id+'"] input');input.value=value;input.dispatchEvent(new Event('change',{bubbles:true}));};
    change('echoes','2');change('tuners','20');change('premium','2');
  })()`);
  await waitForUi(send,'window.bellibingResourceInventory.getState().echoes.count===2&&window.bellibingResourceInventory.getState().tuners.count===20&&window.bellibingResourceInventory.getState().tubes.premium.count===2','persisted source budgets',6000);
  const budgetBefore=await read('JSON.stringify(window.bellibingResourceInventory.getState())');
  for(const index of [4,2]){
    await click('.simulate-echo-slot:nth-child('+index+')');
    await click('.simulate-start');
    await check(`!improveUi.simulator&&JSON.stringify(window.bellibingResourceInventory.getState())===${JSON.stringify(budgetBefore)}
      &&window.bellibingSingleEchoShellCredits===2440
      &&document.querySelector(".simulate-result-echo").textContent.includes("Shell Credits")
      &&document.getElementById('simulateSelectedEchoLabel').textContent==='Echo ${index}'
      &&JSON.stringify(state.drafts.Augusta.build)===window.__realBeforeSingle`,'untracked Shell Credits must prevent attempt for Echo '+index);
  }
  await read("document.querySelector('.simulate-result-echo').scrollIntoView({block:'center',behavior:'instant'})");
  await capture(send,'artifacts/ui-preview-single-slot-credit-blocker-1440x900.png');
  await read("improvePicker.select('Chixia')");
  await check('!improveUi.simulator&&document.querySelector(".simulate-result-echo").textContent.includes("Select a slot")&&JSON.stringify(state.drafts.Augusta.build)===window.__realBeforeSingle','Character switch clears ephemeral Pending without equipment writes');
  await read("improvePicker.select('Augusta')");
  await check(`JSON.stringify(window.bellibingResourceInventory.getState())===${JSON.stringify(budgetBefore)}&&!improveUi.simulator`,'shared budget stays unchanged across Characters');
  console.log('PASS: 1440×900 full existing Echo Workshop, five independent prepared cards, canonical stats and +5 substat, read-only preview, nonmutation and Character isolation, preserved single-slot blocker.');
}
