// Runs first in a fresh Chrome profile. Account/build state is created only by
// physical UI actions; the request pause is deliberate network fault injection.
export async function verifyAccountReview({socket,send,evaluate,navigate,setViewport,waitForUi,pointerClick,capture,sleep}) {
  const read=expression=>evaluate(send,expression);
  const wait=(expression,message)=>waitForUi(send,expression,'Account review: '+message,15000);
  const check=async(expression,message)=>{if(!await read(expression))throw new Error('Account review: '+message)};
  const click=selector=>pointerClick(send,selector);
  const home=async()=>{await click('.page.active [data-home]');await wait('document.getElementById("home").classList.contains("active")','Home unavailable')};
  const open=async target=>{
    const selector=`#homeStage [data-target="${target}"]`;
    await click(selector);await sleep(800);
    if(await read('document.getElementById("home").classList.contains("active")'))await click(selector);
    await wait(`document.getElementById(${JSON.stringify(target)}).classList.contains('active')&&!majorBusy`,'Home navigation to '+target);
  };
  await setViewport(send,1440,900);
  await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
  let paused;
  const onPause=event=>{const message=JSON.parse(String(event.data));if(message.method==='Fetch.requestPaused')paused=message.params.requestId};
  socket.addEventListener('message',onPause);
  await send('Fetch.enable',{patterns:[{urlPattern:'*characters/portraits/manifest.json',requestStage:'Request'}]});
  try{
    await navigate(send);
    await check('localStorage.length===0&&state.characters.length===0','profile must begin empty');
    await open('improve');
    await check('document.querySelector("#improveShell .question").textContent==="No Characters yet"&&document.querySelectorAll("#improveWheel .choice").length===0','empty Improve account');
    await home();await open('build');
    await check('document.documentElement.dataset.characterManifestStatus==="PENDING"&&document.querySelector("#buildShell .question").textContent==="Loading Characters…"','pending request state');
    if(!paused)throw new Error('Character manifest request was not intercepted');
    await send('Fetch.continueRequest',{requestId:paused});
  }finally{await send('Fetch.disable');socket.removeEventListener('message',onPause)}
  await wait('releasedCharacters.length===57&&document.documentElement.dataset.characterManifestStatus==="READY"&&document.querySelectorAll("#buildWheel .choice").length===57','57 released Characters');
  await wait('weaponDataLoaded&&echoDataLoaded&&characterMechanicsDataLoaded&&sequenceRuntimeDataLoaded','Build source readiness');
  await click('#buildWheel [data-character-id="augusta"]');
  await wait('buildPicker.selected==="Augusta"&&echoUi.characterName==="Augusta"','physical Augusta selection');
  await sleep(850);
  await click('#sequenceLine [data-sequence="1"]');
  await wait('document.getElementById("sequenceAction").textContent.includes("Set S1")','Sequence configuration');
  await click('#sequenceAction');
  await check('state.drafts.Augusta.build.sequenceLevel===1','physical Build configuration did not persist');
  await click('#accountBtn');
  await check('owned("Augusta")&&state.characters.length===1&&document.getElementById("accountBtn").disabled','Add to Account');
  await click('#buildCardClose');await home();await open('improve');
  await check('document.querySelectorAll("#improveWheel .choice").length===1&&document.querySelector("#improveWheel .choice").dataset.characterId==="augusta"','Improve owned Augusta');
  let equipment=await read('JSON.stringify(state.drafts.Augusta.build)');
  // Observe every rendered frame, including the entrance, not only settled hover.
  await read(`window.reviewCollisions=[];window.reviewSampling=true;window.reviewSample=()=>{if(!window.reviewSampling)return;const shell=document.getElementById('improveShell'),settings=document.getElementById('improveSettings').getBoundingClientRect();if(shell.classList.contains('has-selection')&&settings.height){const bottom=Math.max(...[...document.querySelectorAll('#improveWheel .choice')].map(n=>n.getBoundingClientRect().bottom));if(bottom+8>settings.top)window.reviewCollisions.push({bottom,settingsTop:settings.top})}requestAnimationFrame(window.reviewSample)};requestAnimationFrame(window.reviewSample)`);
  await click('#improveWheel [data-character-id="augusta"]');
  await wait('improveUi.characterId==="augusta"&&document.getElementById("improveSettings").dataset.sourceStatus==="READY"','Augusta Simple Settings');
  const selectedBuild=await read('JSON.stringify(state.drafts.Augusta.build)');
  const withoutVisit=JSON.parse(selectedBuild);delete withoutVisit.lastImprovedAt;
  if(JSON.stringify(withoutVisit)!==equipment)throw new Error('Account review: Improve selection changed the equipped build');
  equipment=selectedBuild;
  await sleep(1000);
  for(const [width,height] of [[1440,900],[1920,1080],[2560,1440]]){
    await setViewport(send,width,height);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:20,y:height-40});await sleep(850);
    const box=await read('document.querySelector("#improveWheel [data-character-id=augusta]").getBoundingClientRect().toJSON()');
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:box.x+box.width/2,y:box.y+box.height/2});
    await wait('document.getElementById("improveShell").classList.contains("hover-expanded")','physical hover expansion');
    await sleep(850);
    await check('getComputedStyle(document.querySelector("#improveWheel .choice")).width==="160px"&&getComputedStyle(document.querySelector("#improveWheel .choice")).height==="210px"','accepted hover card dimensions');
    await capture(send,`artifacts/ui-preview-account-review-${width}x${height}.png`);
  }
  await read('window.reviewSampling=false');
  const collisions=await read('window.reviewCollisions');
  if(collisions.length)throw new Error('Account review: animated selector collision '+JSON.stringify(collisions.slice(0,5)));
  await click('#improve-setting-gate');await sleep(380);await click('[data-setting="gate"] [data-setting-value="25"]');
  await check('window.bellibingImproveSettings.getState().gate===25','interactive Simple Settings');
  const after=await read('({build:JSON.stringify(state.drafts.Augusta.build),candidate:improveUi.candidate})');
  if(after.build!==equipment||after.candidate!==null)throw new Error('Account review: ownership changed '+JSON.stringify({equipment,after}));
  // A failed request is settled ERROR, never an indefinite loading placeholder.
  await send('Network.setBlockedURLs',{urls:['*characters/portraits/manifest.json']});
  try{
    await navigate(send);await wait('document.documentElement.dataset.characterManifestStatus==="ERROR"','failed source must settle ERROR');
    await open('build');
    await check('document.querySelector("#buildShell .question").textContent==="Character catalog unavailable. Reload to retry."&&releasedCharacters.length===0','explicit source failure');
  }finally{await send('Network.setBlockedURLs',{urls:[]})}
  await navigate(send);await wait('document.documentElement.dataset.characterManifestStatus==="READY"&&releasedCharacters.length===57','reload recovery');
  await check('owned("Augusta")&&JSON.stringify(state.drafts.Augusta.build)==='+JSON.stringify(equipment),'source recovery changed account build');
  console.log('- Clean-profile physical Home → empty Improve → Build (57) → Augusta → configure S1 → Add to Account → Improve → Augusta → Simple Settings passed; PENDING/ERROR/reload recovery, every-frame entrance/hover clearance at three desktop sizes, unchanged Candidate/equipped ownership.');
}
