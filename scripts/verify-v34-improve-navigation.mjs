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
  await check(`(()=>{const host=document.getElementById('improveEmptyCard');return host.children.length===4&&host.children[0].classList.contains('improve-truth')&&host.children[1].classList.contains('improve-stats')&&host.querySelectorAll('.simulate-echo-slot').length===5&&host.querySelectorAll('.simulate-empty-echo').length===2&&host.querySelector('.simulate-workspace>.simulate-empty-echo').textContent.trim()==='Echo 1'&&host.querySelector('.simulate-result-echo').textContent.includes('Select a slot')&&host.querySelectorAll('button').length===13&&[...host.querySelectorAll('.simulate-slot-actions button')].every(n=>n.disabled)&&host.querySelector('.simulate-modes button:last-child').disabled&&!host.querySelector('.simulate-start').disabled&&!host.querySelector('.simulate-modes button:first-child').disabled&&!host.querySelector('.improve-workspace,.improve-echoes-row,.improve-settings,img:not(.improve-truth img,.improve-stats img)')})()`,'five selectable slots, active one-slot mode, Pending result and eleven disabled controls');
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
  await check(`(()=>{const host=document.getElementById('improveEmptyCard'),a=host.querySelector('.simulate-workspace > .simulate-empty-echo').getBoundingClientRect(),controls=host.querySelector('.simulate-controls').getBoundingClientRect(),modes=host.querySelector('.simulate-modes').getBoundingClientRect(),b=host.querySelector('.simulate-result .simulate-empty-echo').getBoundingClientRect(),stats=host.querySelector('.improve-stats').getBoundingClientRect();return a.top>=0&&b.top>=0&&a.bottom<=900&&b.bottom<=900&&a.height===330&&b.height===330&&Math.abs(a.width-b.width)<.1&&stats.right<a.left&&a.right<controls.left&&controls.right<b.left&&modes.bottom<=b.top&&Math.abs(a.top-b.top)<.1})()`,'large central/result cards visible with controls between and modes above result, no overlap');
  await capture(send,'artifacts/ui-preview-simulate-layout-workspace-1440x900.png');
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
  }
  await read(`document.getElementById('improveCardDeck').scrollIntoView({block:'start',behavior:'instant'})`);
  await capture(send,'artifacts/ui-preview-simulate-character-1440x900.png');
  await click('#improveCardPrevious');await sameCharacter();
  // V1: actual physical 1440×900 single-slot spend, +5 RNG and isolated card.
  await click('#improveCardNext');
  await check('!improveUi.simulator&&window.bellibingResourceInventory.getState().echoes.count===0','fresh finite-zero boundary');
  await click('.simulate-start');
  await check('!improveUi.simulator&&window.bellibingResourceInventory.getState().echoes.count===0&&document.querySelector(".simulate-result-echo").textContent.includes("No Echoes available")','zero inventory must not roll or spend');
  await read(`(()=>{
    window.__realBeforeSingle=JSON.stringify(state);
    const change=(id,value)=>{const input=document.querySelector('[data-resource="'+id+'"] input');input.value=value;input.dispatchEvent(new Event('change',{bubbles:true}));};
    change('echoes','2');change('tuners','20');change('premium','2');
  })()`);
  await check('window.bellibingResourceInventory.getState().echoes.count===2&&window.bellibingResourceInventory.getState().tuners.count===20&&window.bellibingResourceInventory.getState().tubes.premium.count===2','persisted source budgets');
  await click('.simulate-echo-slot:nth-child(4)');
  await click('.simulate-start');
  await check(`(()=>{
    const session=improveUi.simulator,slot=session?.slots[3],card=slot?.candidate?.card,
      item=card&&echoById.get(card.echoId),inventory=window.bellibingResourceInventory.getState();
    return !!session&&session.selectedSlot===4&&slot.candidate.history.length===2&&card.level===5
      &&card.substats.length===1&&!session.slots.some((other,index)=>index!==3&&other.candidate)
      &&validateEchoStatCard(card,item)===''&&item.cost===echoLoadoutByCharacterId.get(improveUi.characterId).slotCosts[3]
      &&document.querySelector('.simulate-result-echo').textContent.includes(item.name)
      &&document.querySelector('.simulate-result-echo').textContent.includes(card.substats[0].name)
      &&document.querySelector('.simulate-result-echo').textContent.includes(echoStatValueText(card.substats[0].name,card.substats[0].value))
      &&inventory.echoes.count===1&&inventory.tuners.count===10&&inventory.tubes.premium.count===1
      &&document.querySelector('.simulate-resources').textContent.includes('Gold ×1')
      &&JSON.stringify(state)===window.__realBeforeSingle;
  })()`,'real +5 candidate, verified stat values, exact slot 4, one Gold Tube, no Character writes');
  await read('window.__slot4=JSON.stringify(improveUi.simulator.slots[3].candidate.card)');
  await read("document.querySelector('.simulate-result-echo').scrollIntoView({block:'center',behavior:'instant'})");
  await capture(send,'artifacts/ui-preview-single-slot-result-1440x900.png');
  await click('.simulate-echo-slot:nth-child(2)');
  await click('.simulate-start');
  await check(`(()=>{
    const s=improveUi.simulator,i=window.bellibingResourceInventory.getState();
    return s.selectedSlot===2&&s.slots[1].candidate.card.level===5
     &&JSON.stringify(s.slots[3].candidate.card)===window.__slot4
     &&s.slots[1].candidate.id!==s.slots[3].candidate.id
     &&i.echoes.count===0&&i.tuners.count===0&&i.tubes.premium.count===0
     &&JSON.stringify(state)===window.__realBeforeSingle;
  })()`,'slot 2 second funded attempt is independent; resources exhausted exactly');
  await click('.simulate-echo-slot:nth-child(3)');
  const exhausted=await read('JSON.stringify(improveUi.simulator)');
  await click('.simulate-start');
  await check(`JSON.stringify(improveUi.simulator)===${JSON.stringify(exhausted)}
    &&window.bellibingResourceInventory.getState().echoes.count===0
    &&document.querySelector('.simulate-result-echo').textContent.includes('No Echoes available')`,'exhausted budget must not create free attempt');
  await read("improvePicker.select('Chixia')");
  await check('!improveUi.simulator&&document.querySelector(".simulate-result-echo").textContent.includes("Select a slot")&&JSON.stringify(state)===window.__realBeforeSingle','Character switch clears ephemeral candidates without equipment writes');
  await read("improvePicker.select('Augusta')");
  await check('window.bellibingResourceInventory.getState().echoes.count===0&&!improveUi.simulator','shared budget persists across Characters and sandbox exits');
  console.log('PASS: 1440×900 two-card navigation, five slots, 1 Slot active, zero/exhausted-budget boundaries, canonical +5 roll, slot-owned sessions and Character isolation, mirrored Character/Stats, isolated state, reload and original Echo chooser.');
}
