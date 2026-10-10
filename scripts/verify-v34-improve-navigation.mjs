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
  await check(`(()=>{const empty=document.getElementById('improveEmptyCard'),page=document.getElementById('improveSimulationPage');return empty.children.length===0&&empty.textContent===''&&page.children.length===2&&page.querySelectorAll('button').length===2})()`,'second card is only its header and empty surface');
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
    await check(`document.documentElement.scrollWidth===1440&&document.getElementById('improveCardDeck').scrollWidth<=document.getElementById('improveCardDeck').clientWidth`,'no horizontal overflow');
  };
  await active(0);
  await read(`document.getElementById('improveCardDeck').scrollIntoView({block:'start',behavior:'instant'})`);
  await capture(send,'artifacts/ui-preview-improve-navigation-first-1440x900.png');
  for(let cycle=0;cycle<3;cycle++){
    await click('#improveCardNext');await active(1);
    await check(`(()=>{const a=document.getElementById('improveBuildCard'),b=document.getElementById('improveEmptyCard'),r=a.getBoundingClientRect(),s=b.getBoundingClientRect();return ['x','y','width','height'].every(k=>Math.abs(r[k]-s[k])<.1)&&['background','border','borderRadius','boxShadow'].every(k=>getComputedStyle(a)[k]===getComputedStyle(b)[k])})()`,'empty surface matches original dimensions, position and styling');
    await read(`document.querySelector('#improveSimulationPage .improve-card-arrow:last-child').click()`);await active(1);
    if(cycle===0){await read(`document.getElementById('improveCardDeck').scrollIntoView({block:'start',behavior:'instant'})`);await capture(send,'artifacts/ui-preview-improve-navigation-second-1440x900.png')}
    await click('#improveCardPrevious');await active(0);
    await read(`document.querySelector('#improveCharacterPage .improve-card-arrow').click()`);await active(0);
  }
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
  console.log('PASS: 1440×900 two-card pointer/keyboard navigation, empty matching surface, mounted workspace, unchanged Settings/data/session, reload and original Echo chooser.');
}
