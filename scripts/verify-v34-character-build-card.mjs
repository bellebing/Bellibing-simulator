import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const UI_URL=process.env.BELLIBING_V34_URL??'http://127.0.0.1:4173/ui-preview/';
const DEBUG_PORT=Number(process.env.BELLIBING_V34_CHROME_DEBUG_PORT??9686);
const CHROME=process.env.CHROME_BIN??'google-chrome';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const assert=(condition,message,detail)=>{if(!condition)throw new Error(message+(detail===undefined?'':': '+JSON.stringify(detail)))};

async function waitForChrome(){
  const deadline=Date.now()+15000;
  while(Date.now()<deadline){
    try{const response=await fetch('http://127.0.0.1:'+DEBUG_PORT+'/json/version');if(response.ok)return}catch{}
    await sleep(120);
  }
  throw new Error('Timed out waiting for Chrome DevTools.');
}

async function createPage(){
  const response=await fetch('http://127.0.0.1:'+DEBUG_PORT+'/json/new?'+encodeURIComponent('about:blank'),{method:'PUT'});
  if(!response.ok)throw new Error('Failed to create Chrome page: '+response.status);
  return response.json();
}

function cdp(wsUrl){
  const socket=new WebSocket(wsUrl);let serial=0;const pending=new Map();
  const opened=new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
  socket.addEventListener('message',event=>{
    const message=JSON.parse(String(event.data));if(!message.id)return;
    const waiter=pending.get(message.id);if(!waiter)return;pending.delete(message.id);
    if(message.error)waiter.reject(new Error(message.error.message));else waiter.resolve(message.result);
  });
  async function send(method,params={}){
    await opened;const id=++serial;
    const answer=new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));
    socket.send(JSON.stringify({id,method,params}));return answer;
  }
  return{socket,send};
}

async function evaluate(send,expression){
  const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text??'Runtime evaluation failed');
  return result.result?.value;
}

async function waitFor(send,expression,message,timeout=8000){
  const deadline=Date.now()+timeout;
  while(Date.now()<deadline){if(await evaluate(send,expression))return;await sleep(60)}
  throw new Error(message);
}

async function navigate(send){
  await send('Page.navigate',{url:UI_URL});
  const deadline=Date.now()+20000;let externalNoticeOpened=false;
  while(Date.now()<deadline){
    const state=await evaluate(send,"(() => ({ready:document.readyState==='complete'&&document.querySelectorAll('#homeStage .home-card').length===3,externalNotice:document.title==='External Content Notice | rawgit.hack'&&!!document.querySelector('.url-action-button')}))()");
    if(state.ready)return;
    if(state.externalNotice&&!externalNoticeOpened){
      const bounds=await evaluate(send,"document.querySelector('.url-action-button').getBoundingClientRect().toJSON()");
      const x=bounds.x+bounds.width/2,y=bounds.y+bounds.height/2;
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
      await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
      await sleep(35);
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
      externalNoticeOpened=true;await sleep(600);continue;
    }
    await sleep(100);
  }
  throw new Error('Build Stats UI preview did not become ready.');
}

async function centerOf(send,selector){
  const selectorJson=JSON.stringify(selector);
  const bounds=await evaluate(send,"(() => {const el=document.querySelector("+selectorJson+");if(!el)throw new Error('Missing pointer target');const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,innerWidth,innerHeight}})()");
  assert(bounds.width>0&&bounds.height>0&&bounds.x<bounds.innerWidth&&bounds.y<bounds.innerHeight&&bounds.x+bounds.width>0&&bounds.y+bounds.height>0,'Pointer target is not visible',{selector,bounds});
  return{x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2};
}

async function pointerClick(send,selector){
  const point=await centerOf(send,selector);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x,y:point.y});
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
  await sleep(30);
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});
  await sleep(90);
}

async function capture(send,path){
  mkdirSync('artifacts',{recursive:true});
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  writeFileSync(path,Buffer.from(shot.data,'base64'));
}
const chrome=spawn(CHROME,['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port='+DEBUG_PORT,'--user-data-dir='+join(tmpdir(),'bellibing-build-card-'+process.pid),'about:blank'],{stdio:'ignore',windowsHide:true});
let socket;
try{
  await waitForChrome();const page=await createPage();const connection=cdp(page.webSocketDebuggerUrl);socket=connection.socket;const {send}=connection;
  const read=expression=>evaluate(send,expression),check=async(expression,message)=>assert(await read(expression),message);
  const ready=()=>waitFor(send,'weaponDataLoaded&&echoDataLoaded&&buildStatsRuntimeLoaded&&characterMechanicsDataLoaded&&sequenceRuntimeDataLoaded&&characterHeroArtRuntimeLoaded&&window.bellibingForte&&window.bellibingProjectStaticBuildStats&&releasedCharacters.length===59','Canonical sources not ready',20000);
  const click=selector=>pointerClick(send,selector);
  const settled=async()=>{await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:18,y:800});await sleep(750)};
  const images=async()=>{await read('document.fonts.ready');await waitFor(send,'[...document.querySelectorAll("#characterBuildCard img")].every(img=>img.complete&&img.naturalWidth>0)','Card image missing',15000)};
  const stateText=()=>read('localStorage.getItem(KEY)');
  const verify=async(name)=>{
    await images();
    const result=await read(`(()=>{
      const name=${JSON.stringify(name)},card=document.getElementById('characterBuildCard'),character=characterByName.get(name),build=draft(name).build;
      const projection=statsUi.project(name),weapon=weaponItemById(build.weaponId),slots=statsUi.committedEchoSlots(name),tree=skillsPreviewByCharacterId.get(character.id),forte=window.bellibingForte.normalizeForteState(tree,build.forte);
      const rows=[...card.querySelectorAll('.cbc-stat-row')];
      const echoLabels={'CRIT Rate':'CR','CRIT DMG':'CD','Flat ATK':'ATK','ATK%':'ATK %','Flat HP':'HP','HP%':'HP %','Flat DEF':'DEF','DEF%':'DEF %','Energy Regen':'ER','Basic Attack DMG':'BA DMG','Heavy Attack DMG':'HA DMG','Skill DMG':'Skill DMG','Liberation DMG':'Lib DMG','Healing Bonus':'Healing'};
      const summaryLabels={...echoLabels,'Basic Attack DMG Bonus':'BA DMG Bonus','Heavy Attack DMG Bonus':'HA DMG Bonus','Resonance Skill DMG Bonus':'Skill DMG Bonus','Resonance Liberation DMG Bonus':'Lib DMG Bonus'};
      return {
        identity:card.dataset.characterId===character.id&&card.querySelector('.cbc-name').textContent===name&&card.querySelector('.cbc-hero-image')?.getAttribute('src')===characterHeroArtById.get(character.id).assetPath,
        weapon:card.querySelector('.cbc-weapon-name').textContent===weapon?.name&&card.querySelector('.cbc-weapon-art img')?.getAttribute('src')===weapon.artSrc&&card.querySelectorAll('.cbc-weapon-fact')[0].textContent===weapon.secondary.stat+formatWeaponSecondaryValue(weapon.secondary.value)&&card.querySelectorAll('.cbc-weapon-fact')[1].textContent==='Base ATK'+weapon.level90BaseAtk,
        sequence:[...card.querySelectorAll('.cbc-sequence .node')].map(el=>Number(el.dataset.sequence)).join(',')==='6,5,4,3,2,1'&&card.querySelectorAll('.cbc-sequence .is-active').length===sequenceUi.normalizeLevel(build.sequenceLevel),
        forte:tree.nodes.every(node=>{const el=card.querySelector('[data-node-id="'+node.id+'"]');return el&&el.classList.contains('is-active')===window.bellibingForte.forteNodeActive(tree,forte,node.id)})&&[...card.querySelectorAll('[data-skill-level]')].every(el=>el.textContent==='Lv.'+forte.levels[el.dataset.skillLevel]),
        stats:rows.slice(0,6).map(el=>el.dataset.statKey).join(',')==='hp,atk,def,energyRegen,critRate,critDamage'&&rows.every(el=>Number(el.querySelector('strong').dataset.raw)===projection[el.dataset.statKey])&&rows.length===6+BUILD_STAT_EXTRA_ROWS.filter(spec=>Number.isFinite(projection[spec.key])&&projection[spec.key]!==0).length,
        statLabels:rows.every(el=>{const spec=[...BUILD_STAT_PRIMARY_ROWS,...BUILD_STAT_EXTRA_ROWS].find(spec=>spec.key===el.dataset.statKey),name=spec.labelFrom?projection[spec.labelFrom]:spec.label,label=el.querySelector('.cbc-stat-label');return label.textContent===(summaryLabels[name]||name)&&label.getAttribute('aria-label')===name}),
        echoes:slots.length===5&&[...card.querySelectorAll('.cbc-echo')].every((el,index)=>{const slot=slots[index],item=echoById.get(slot.echoId),set=echoSonataById.get(slot.selectedSonataSetId),expected=[slot.mainStat,slot.secondaryMainStat,...slot.substats];return el.dataset.echoId===item.id&&el.querySelector('.cbc-echo-name').textContent===item.name&&el.querySelector('.cbc-echo-art img').getAttribute('src')===item.artSrc&&el.querySelector('.cbc-echo-meta').textContent==='COST '+item.cost+'+'+slot.level&&el.querySelector('.cbc-sonata').textContent===set.name&&[...el.querySelectorAll('.cbc-echo-stat')].every((row,i)=>{const label=row.querySelector('span');return label.dataset.statName===expected[i].name&&label.getAttribute('aria-label')===expected[i].name&&label.textContent===(echoLabels[expected[i].name]||expected[i].name)&&row.querySelector('strong').textContent===echoStatValueText(expected[i].name,expected[i].value)})&&el.querySelectorAll('.cbc-echo-stat').length===expected.length}),
        readOnly:!card.querySelector('button,input,select,textarea,[contenteditable="true"]'),
        stateKeys:Object.keys(state).sort().join(',')==='characters,drafts'
      };
    })()`);
    assert(Object.values(result).every(Boolean),'Saved build/card mismatch',result);
  };
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await navigate(send);await read('localStorage.clear()');await navigate(send);await ready();
  // Populate real canonical Echo cards through the same owning save path as Build.
  await read(`(()=>{
    const names=['Sigillum','Twin Nova: Collapsar Blade','Glommoth','Iceglint Dancer','Shadow Stepper'];
    const rollNames=[
      ['Flat ATK','CRIT DMG','CRIT Rate','Flat DEF','Basic Attack DMG'],
      ['Heavy Attack DMG','Liberation DMG','ATK%','Energy Regen','Flat HP'],
      ['Skill DMG','HP%','DEF%','CRIT Rate','CRIT DMG'],
      ['Heavy Attack DMG','Liberation DMG','Flat ATK','Flat DEF','Energy Regen'],
      ['Skill DMG','Basic Attack DMG','Flat HP','CRIT Rate','CRIT DMG']
    ];
    names.forEach((name,index)=>{const item=echoCatalog.find(row=>row.name===name),rolls=rollNames[index].map(name=>{const row=echoSubstatOption(name);return{name:row.name,value:row.values[0]}}),card=makeEchoStatCard(item,item.sonataSetIds[0],{echoId:item.id,substats:rolls});const main=echoMainOptions(item.cost,card.level).find(row=>row.name===['CRIT DMG','Electro DMG','Electro DMG','ATK%','HP%'][index]);card.mainStat={...main};commitEchoSlot('Augusta',index,card)});
    const tree=skillsPreviewByCharacterId.get('augusta'),node=tree.nodes.find(row=>row.role==='normal-attack');
    autosave('Augusta',{weaponId:'thunderflare-dominion',sequenceLevel:3,forte:window.bellibingForte.updateForteNode(tree,null,node.id,6)});
    show('build');return true;
  })()`);
  await settled();await click('#buildWheel [data-character-id="augusta"]');await settled();
  await check('buildPicker.selected==="Augusta"&&!owned("Augusta")&&document.getElementById("viewBuildCard").hidden','Draft was incorrectly promoted');
  const beforeAdd=await read('JSON.stringify(draft("Augusta").build)');
  await click('#accountBtn');await waitFor(send,'characterBuildCardUi.open','Add to Account did not reveal Character card');await settled();
  await check('owned("Augusta")&&state.characters.filter(name=>name==="Augusta").length===1&&!!draft("Augusta").addedToAccountAt&&document.getElementById("accountBtn").disabled','Add to Account semantics changed');
  assert(await read('JSON.stringify(draft("Augusta").build)')===beforeAdd,'Add to Account copied or changed the saved build');
  await verify('Augusta');
  const original=await stateText();
  await read('characterBuildCardUi.card.refresh()');await click('.cbc-name');
  assert(await stateText()===original,'Read-only rendering changed persistent state');
  for(const [width,height] of [[1440,900],[1920,1080],[2560,1440]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await settled();await images();
    const geometry=await read(`(()=>{
      const card=document.getElementById('characterBuildCard'),dialog=document.querySelector('.build-card-dialog');
      const rect=selector=>card.querySelector(selector).getBoundingClientRect().toJSON();
      const echoes=[...card.querySelectorAll('.cbc-echo')].map(el=>el.getBoundingClientRect().toJSON());
      const labels=[...card.querySelectorAll('.cbc-stat-row,.cbc-stat-label,.cbc-echo-stat,.cbc-echo-stat span,.cbc-echo-name,.cbc-sonata,.cbc-weapon-name,.cbc-weapon-fact,.cbc-name')];
      return{card:card.getBoundingClientRect().toJSON(),dialog:dialog.getBoundingClientRect().toJSON(),width:innerWidth,height:innerHeight,
        scrollWidth:document.documentElement.scrollWidth,dialogFits:dialog.scrollHeight<=dialog.clientHeight+1&&dialog.scrollWidth<=dialog.clientWidth+1,
        dialogScroll:[dialog.scrollWidth,dialog.clientWidth,dialog.scrollHeight,dialog.clientHeight],
        overflow:[...dialog.querySelectorAll('*')].filter(el=>el.getBoundingClientRect().right>dialog.getBoundingClientRect().right+1).map(el=>el.className),
        identity:rect('.cbc-identity'),hero:rect('.cbc-hero'),sequence:rect('.cbc-sequence'),stats:rect('.cbc-stats'),weapon:rect('.cbc-weapon'),skills:rect('.cbc-skills'),echoes,
        statRows:[...card.querySelectorAll('.cbc-stat-row')].map(el=>({width:el.getBoundingClientRect().width,font:parseFloat(getComputedStyle(el).fontSize),gap:el.querySelector('strong').getBoundingClientRect().left-el.querySelector('.cbc-stat-label').getBoundingClientRect().right})),
        echoFontSize:Math.min(...[...card.querySelectorAll('.cbc-echo-stat')].map(el=>parseFloat(getComputedStyle(el).fontSize))),
        missing:[...card.querySelectorAll('img')].filter(img=>!img.naturalWidth).length,
        clipped:labels.filter(el=>el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1).map(el=>el.textContent)};
    })()`);
    await capture(send,'artifacts/ui-preview-character-build-card-'+width+'x'+height+'.png');
    assert(geometry.card.left>=0&&geometry.card.right<=width&&geometry.dialog.top>=0&&geometry.dialog.bottom<=height&&geometry.dialogFits&&geometry.scrollWidth<=width&&geometry.echoes.length===5&&geometry.echoes.every(r=>r.bottom<=geometry.card.bottom)&&geometry.missing===0&&geometry.clipped.length===0,'Card layout failed',geometry);
    const {hero,sequence,stats,weapon,skills,echoes}=geometry;
    assert(sequence.right<=hero.left&&hero.left-sequence.right<=12&&stats.left>=hero.right&&weapon.top>=hero.bottom&&weapon.left<=hero.left&&weapon.right>=hero.right&&skills.top>=stats.bottom&&Math.abs(skills.left-stats.left)<=1,'Locked upper layout changed',geometry);
    assert(echoes.every((r,index)=>Math.abs(r.top-echoes[0].top)<=1&&(!index||r.left>=echoes[index-1].right)&&r.top>=Math.max(weapon.bottom,skills.bottom))&&geometry.echoFontSize>=12,'Five readable Echo cards must stay in one row',geometry);
    assert(geometry.card.width>=880&&geometry.card.width<=920&&echoes.every(r=>r.width>=160&&r.width<=170),'Card or Echo slots stretched beyond compact desktop sizes',geometry);
    assert(geometry.identity.width>=280&&geometry.identity.width<=300&&stats.width>=280&&stats.width<=310&&weapon.width<=300&&Math.abs(weapon.left-geometry.identity.left)<=1&&skills.width===stats.width&&stats.left-geometry.identity.right>=20&&stats.left-geometry.identity.right<=28&&geometry.statRows.every(row=>row.width<=280&&row.font>=12&&row.gap>=7&&row.gap<=9),'Upper card did not size around its content',geometry);
    console.log('PASS: compact '+geometry.card.width+'px card, five '+echoes[0].width+'px Echoes in one row, no clipping at '+width+'x'+height);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  // A second consumer can coexist without owning a second build or duplicate SVG ids.
  await read('window.testCardHost=document.createElement("article");document.body.append(testCardHost);window.testCard=new CharacterBuildCard(testCardHost,{source:characterBuildCardSource});testCard.setCharacter("Augusta")');
  await check('new Set([...document.querySelectorAll("linearGradient[id]")].map(n=>n.id)).size===document.querySelectorAll("linearGradient[id]").length','Forte SVG identifiers collided across card instances');
  await check('[...testCardHost.querySelectorAll(".cbc-echo")].every(el=>el.getBoundingClientRect().width===166)','Echo slots stretched in a wider component host');
  const beforeUnsaved=await stateText();
  await read('testCard.setCharacter("Aalto")');
  assert(await stateText()===beforeUnsaved,'Card created an unsaved Character draft');
  await read('testCard.destroy();testCardHost.remove()');
  await read('window.savedFirstEcho=JSON.parse(JSON.stringify(statsUi.committedEchoSlots("Augusta")[0]));const slot=JSON.parse(JSON.stringify(savedFirstEcho));slot.mainStat={...echoMainOptions(4,slot.level).find(row=>row.name==="Healing Bonus")};commitEchoSlot("Augusta",0,slot)');
  await verify('Augusta');
  await check(`document.querySelector('.cbc-echo-stat [data-stat-name="Healing Bonus"]').textContent==="Healing"`,'Healing label was not compacted');
  await read('commitEchoSlot("Augusta",0,savedFirstEcho)');
  await read('window.savedForte=draft("Augusta").build.forte;const tree=skillsPreviewByCharacterId.get("augusta");autosave("Augusta",{forte:window.bellibingForte.updateForteNode(tree,savedForte,tree.nodes.find(n=>n.role==="normal-attack").id,0)})');
  await check('document.querySelector("#characterBuildCard [data-skill-level=normal-attack]").textContent==="Lv.0"','Saved Forte change did not update the live card');
  await read('autosave("Augusta",{forte:savedForte})');
  await read('window.savedCardBuild=JSON.parse(JSON.stringify(draft("Augusta").build));autosave("Augusta",{weaponId:null,echoSets:{schemaVersion:1,activeSetId:"set-1",defaultSetId:"set-1",sets:{"set-1":emptyEchoSet()}}})');
  await check('!document.querySelector("#characterBuildCard [data-stat-key=heavyAttackDamageBonus]")&&!document.querySelector("#characterBuildCard [data-stat-key=resonanceLiberationDamageBonus]")&&document.querySelectorAll("#characterBuildCard .cbc-stat-row").length===6','Zero bonuses did not disappear live');
  await read('autosave("Augusta",{weaponId:"ages-of-harvest",sequenceLevel:1})');
  await check('document.querySelector("#characterBuildCard [data-stat-key=elementDamageBonus] strong").dataset.raw==="0.12"&&document.querySelector(".cbc-weapon-name").textContent==="Ages of Harvest"&&document.querySelectorAll(".cbc-sequence .is-active").length===1','Saved Weapon/Sequence change did not update card');
  await read('autosave("Augusta",savedCardBuild)');await verify('Augusta');
  await click('#buildCardEdit');await check('!characterBuildCardUi.open&&document.activeElement.id==="viewBuildCard"&&!document.getElementById("build").inert','Back to Build did not restore focus/editing');
  // Existing editing surface changes the saved Sequence; reopening reads it afresh.
  await read('sequenceUi.setCharacter("Augusta")');
  const sequencePoint=await centerOf(send,'#sequenceLine [data-sequence="4"]');
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',...sequencePoint});await sleep(850);
  await click('#sequenceAction');await settled();await click('#viewBuildCard');await settled();
  await check('draft("Augusta").build.sequenceLevel===4&&document.querySelectorAll(".cbc-sequence .is-active").length===4','Build edit not reflected on reopening');
  await verify('Augusta');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});
  await check('!characterBuildCardUi.open','Escape did not close the card');
  await read('autosave("Qingxiao",{weaponId:"guardian-sword",sequenceLevel:1});buildPicker.requestSwitch("Qingxiao")');await click('#confirmSwitch');await settled();
  await check('buildPicker.selected==="Qingxiao"&&document.getElementById("viewBuildCard").hidden&&!owned("Qingxiao")','Switch leaked Augusta ownership');
  await click('#accountBtn');await settled();await images();
  await check('document.querySelector(".cbc-name").textContent==="Qingxiao"&&document.querySelector(".cbc-weapon-name").textContent==="Guardian Sword"&&[...document.querySelectorAll(".cbc-echo")].filter(el=>el.dataset.echoId===String()).length===5&&document.querySelectorAll(".cbc-sequence .is-active").length===1','Character card leaked previous build');
  await check('[...document.querySelectorAll("#characterBuildCard .cbc-echo")].every(el=>el.getBoundingClientRect().width===166)','Empty Echo slots changed physical width');
  await click('#buildCardClose');
  const persisted=await stateText();await navigate(send);await ready();
  assert(await stateText()===persisted,'Reload modified saved Character state');
  await read('show("build");buildPicker.select("Augusta")');await settled();await click('#viewBuildCard');await settled();await verify('Augusta');
  await check('state.characters.length===2&&owned("Qingxiao")&&document.getElementById("accountBtn").disabled','Reload lost account ownership');
  await click('#buildCardClose');await read('buildPicker.select("Qingxiao")');await settled();await click('#viewBuildCard');await settled();
  await check('document.querySelector(".cbc-name").textContent==="Qingxiao"&&document.querySelector(".cbc-weapon-name").textContent==="Guardian Sword"&&[...document.querySelectorAll(".cbc-echo")].filter(el=>el.dataset.echoId===String()).length===5','Reload leaked another Character build');
  console.log('CharacterBuildCard Chrome PASS: physical Add to Account/reopen/close, saved state unchanged by read-only card, canonical art/Weapon/Forte/Sequence/Stats, dynamic zero/nonzero rows, all five Echo stat cards, live updates, multiple consumers, Build edit, Character isolation and reload; 1440/1920/2560 fit.');
}finally{socket?.close();chrome.kill('SIGTERM')}
