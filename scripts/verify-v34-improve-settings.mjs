export async function verifyImproveSettings({ send, evaluate, navigate, setViewport, waitForUi, pointerClick, capture, sleep }) {
  const read = expression => evaluate(send, expression);
  const check = async (expression, message) => { if (!await read(expression)) throw new Error('Improve Settings: ' + message + ' ' + JSON.stringify(await read(`({state:window.bellibingImproveSettings.getState(),text:document.getElementById('improveSettings').innerText,settings:document.getElementById('improveSettings').getBoundingClientRect().toJSON(),card:document.getElementById('improveBuildCard').getBoundingClientRect().toJSON(),scroll:document.getElementById('improveShell').scrollTop})`))); };
  const wait = (expression, message) => waitForUi(send, expression, message);
  const click = async selector => { await pointerClick(send, selector); await sleep(90); };
  const key = async (name, code = name, virtual) => { await send('Input.dispatchKeyEvent', { type:'keyDown',key:name,code, ...(virtual ? {windowsVirtualKeyCode:virtual,text:'\r'} : {}) }); await send('Input.dispatchKeyEvent', { type:'keyUp',key:name,code, ...(virtual ? {windowsVirtualKeyCode:virtual} : {}) }); };
  const enter = async (selector, text) => {
    await click(selector); await send('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',modifiers:2,windowsVirtualKeyCode:65});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',modifiers:2,windowsVirtualKeyCode:65});
    await key('Backspace'); if(text) await send('Input.insertText',{text});
  };
  const focus = value => '#improveSettings [data-focus-key=' + JSON.stringify(value) + ']';
  const trigger = id => '#improve-setting-' + id;
  const state = 'window.bellibingImproveSettings.getState()';
  const effective = state + '.effectivePolicy';
  const summary = id => `document.querySelector('[data-setting="${id}"] .improve-setting-summary').textContent`;
  const settle = async () => { await send('Input.dispatchMouseEvent', { type:'mouseMoved',x:20,y:800 }); await sleep(750); };
  await setViewport(send,1440,900); await navigate(send); await read('localStorage.clear()'); await navigate(send);
  await wait('releasedCharacters.length===57&&echoDataLoaded&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"','Policy sources not ready');
  const sources = await read("fetch('assets/improve-settings/policies.json').then(r=>r.json())");
  const legacySources = await read("fetch('assets/improve-settings/sources.json').then(r=>r.json())");
  const augusta = legacySources.characters.find(row=>row.characterId==='augusta');
  const pendingId = sources.characters.find(row=>!row.applicability).characterId;
  await read("addOwned('Augusta');addOwned('Chixia');show('improve');improvePicker.select('Augusta')"); await settle();
  // Selection/reload legitimately updates navigation timestamps; compare build truth.
  const equipmentSnapshot = 'JSON.stringify(Object.fromEntries(Object.entries(state.drafts).map(([name,draft])=>{const build=structuredClone(draft.build);delete build.lastImprovedAt;return [name,build]})))';
  const equipment = await read(equipmentSnapshot), candidate = await read('JSON.stringify(improveUi.candidate)');
  const slider = (list, name) => focus('roll:' + list + ':' + name);
  const tiers = [['every','CRIT Rate','9.3%',5],['every','CRIT DMG','21%',7],['flex','ATK%','6.4%',0],['flex','Energy Regen','6.8%',0],['flex','Heavy Attack DMG','6.4%',0]];
  const positions = `JSON.stringify([...document.querySelectorAll('.improve-roll-slider')].map(n=>[n.dataset.focusKey,n.value,n.getAttribute('aria-valuetext')]))`;
  const gate = value => focus('gate:' + value);
  for (const [width,height] of [[1440,900],[1920,1080],[2560,1440]]) {
    await setViewport(send,width,height); await read('document.getElementById("improveShell").scrollTop=0'); await settle();
    await click(focus('mode:RECOMMENDED')); await key('Escape'); await settle();
    await check(`${state}.schemaVersion===3&&${state}.mode==='RECOMMENDED'&&Object.keys(${state}.overrides).length===0`, 'v3 Recommended default');
    await check(`JSON.stringify([...document.querySelectorAll('.improve-setting-label')].map(n=>n.textContent))==='["Character Target","Gate","Every Echo","Flex Stats"]'&&JSON.stringify([...document.querySelectorAll('.improve-settings-heading .improve-setting-choice')].map(n=>n.textContent))==='["Recommended","Customize"]'&&!/Valuable Stats|Roll Quality|All Rolls|Mid\\+|High\\+|At least 1 of/.test(document.getElementById('improveSettings').innerText)`, 'accepted labels/retired UI');
    const dimensions = await read(`({card:document.getElementById('improveBuildCard').getBoundingClientRect().toJSON(),echo:document.getElementById('improveEchoRow').getBoundingClientRect().toJSON(),fields:[...document.querySelectorAll('.improve-setting-trigger')].map(n=>n.getBoundingClientRect().toJSON())})`);
    await check(`(()=>{const s=document.getElementById('improveSettings').getBoundingClientRect(),c=document.getElementById('improveBuildCard').getBoundingClientRect();return s.top<c.top&&Math.abs(s.left-c.left)<1&&Math.abs(s.width-c.width)<1&&s.height<130&&s.width<=1280&&document.documentElement.scrollWidth===innerWidth})()`, 'compact row containment '+width);
    const wheel = await read('document.querySelector("#improveWheel .choice").getBoundingClientRect().toJSON()');
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:wheel.x+wheel.width/2,y:wheel.y+wheel.height/2}); await sleep(850);
    await check(`document.getElementById('improveShell').classList.contains('hover-expanded')&&[...document.querySelectorAll('#improveWheel .choice')].every(n=>n.getBoundingClientRect().bottom+8<=document.getElementById('improveSettings').getBoundingClientRect().top)`, 'physical selector hover clearance '+width);
    await capture(send,`artifacts/ui-preview-improve-settings-hover-${width}x${height}.png`); await settle();
    for (const id of ['target','gate','every','flex']) {
      await click(trigger(id)); await read('document.getElementById("improveShell").scrollTop=0'); await settle();
      await check(`(()=>{const owners=[...document.querySelectorAll('.improve-setting')],settings=document.getElementById('improveSettings').getBoundingClientRect(),card=document.getElementById('improveBuildCard').getBoundingClientRect(),baseline=${JSON.stringify(dimensions.fields)};return owners.length===4&&owners.every((n,i)=>{const r=n.getBoundingClientRect(),b=n.querySelector('.improve-setting-trigger').getBoundingClientRect(),p=n.querySelector('.improve-setting-expansion');return n.classList.contains('is-expanded')&&!p.inert&&getComputedStyle(p).visibility==='visible'&&r.left>=settings.left&&r.right<=settings.right&&Math.abs(b.left-baseline[i].left)<1&&Math.abs(b.top-baseline[i].top)<1&&Math.abs(b.width-baseline[i].width)<1&&(!i||owners[i-1].getBoundingClientRect().right<=r.left)&&[...n.querySelectorAll('.improve-setting-options *')].every(c=>{const x=c.getBoundingClientRect();return !x.width||(x.left>=r.left-1&&x.right<=r.right+1)})})&&card.top>=settings.bottom&&card.width===${dimensions.card.width}&&card.height===${dimensions.card.height}&&[...document.querySelectorAll('#improveWheel .choice')].every(n=>n.getBoundingClientRect().bottom+8<=settings.top)&&document.documentElement.scrollWidth===innerWidth})()`, 'shared expansion/owned columns/unchanged workspace '+id+' '+width);
      await click(trigger(id)); await settle();
      await check(`document.querySelectorAll('.improve-setting.is-expanded').length===0&&[...document.querySelectorAll('.improve-setting-expansion')].every(n=>n.inert)`, 'shared close '+id);
    }
    await click(trigger('every')); await settle();
    await check(`(()=>{const rows=[...document.querySelectorAll('.improve-recommended-stat')];return rows.length===5&&rows.every(n=>n.dataset.status==='READY'&&!n.querySelector('small')&&n.querySelector('dd').children.length===1)&&JSON.stringify(rows.map(n=>[n.querySelector('dt').textContent,n.querySelector('dd > span').textContent]))==='[["ATK","2,407"],["CRIT Rate","84.7%"],["CRIT DMG","225%"],["Energy Regen","120%"],["Heavy Attack DMG","29.2%"]]'&&!document.querySelector('[data-policy-section="priorities"]')&&!document.querySelector('[data-setting=target] input')})()`, 'single Calc-basis Character Target without cross-source rows or annotations');
    await check(`document.querySelector('.improve-build-need p').textContent==='Pending'&&${effective}.echoPolicy.preferences.status==='PENDING'&&${state}.overrides.echoPreferences===undefined`, 'Build Need and canonical preference order Pending');
    for (const [list,name,text,index] of tiers) {
      await check(`(()=>{const n=document.querySelector(${JSON.stringify(slider(list,name))}),s=getComputedStyle(n),r=n.getBoundingClientRect();return n.disabled&&n.value==='${index}'&&n.min==='0'&&n.max==='7'&&n.step==='1'&&n.getAttribute('aria-valuetext')===${JSON.stringify(text)}&&n.nextElementSibling.textContent===${JSON.stringify(text)}&&s.cursor==='default'&&s.outlineStyle==='none'&&s.backgroundImage.includes('146, 150, 157')&&s.getPropertyValue('--roll-position').trim()===String(${index}/7*100)+'%'&&r.width>=65&&r.top>=0&&r.bottom<=innerHeight&&n.parentElement.classList.contains('is-active')&&getComputedStyle(n.parentElement).backgroundColor==='rgba(216, 177, 82, 0.08)'})()`, 'Recommended grey exact '+name+' '+width);
    }
    await check(`!document.querySelector('#improveSettings input[type=checkbox],#improveSettings select')&&[...document.querySelectorAll('.improve-roll-value')].every(n=>getComputedStyle(n).color==='rgb(183, 190, 200)')`, 'no checkboxes, readable muted numbers');
    const original = await read(positions), recommended = await read(`JSON.stringify(${state})`);
    const bounds=await read(`document.querySelector(${JSON.stringify(slider('every','CRIT Rate'))}).getBoundingClientRect().toJSON()`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:bounds.left+5,y:bounds.y+2});
    await send('Input.dispatchMouseEvent',{type:'mousePressed',x:bounds.left+5,y:bounds.y+2,button:'left',clickCount:1});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:bounds.left+5,y:bounds.y+2,button:'left',clickCount:1});
    await check(`${positions}===${JSON.stringify(original)}&&JSON.stringify(${state})===${JSON.stringify(recommended)}&&getComputedStyle(document.querySelector('.improve-roll-slider')).backgroundImage.includes('146, 150, 157')`, 'disabled pointer/hover no mutation or gold affordance');
    await capture(send,`artifacts/ui-preview-improve-settings-recommended-${width}x${height}.png`);
    await click('.improve-other-stats summary');
    await check(`document.querySelector('.improve-other-stats').open&&[...document.querySelectorAll('.improve-other-stats [data-stat-name]')].map(n=>n.dataset.statName).includes('Flat ATK')&&[...document.querySelectorAll('.improve-other-stats button')].every(n=>n.disabled)`, 'Show other stats canonical/read-only');
    await click('.improve-other-stats summary');
    await check(`JSON.stringify([...document.querySelectorAll('[data-setting=gate] .improve-setting-choice')].map(n=>n.textContent))==='["+5","+10","+15","+20","+25"]'`, 'Gate options');
    for (const value of [5,10,15,20,25]) { await click(gate(value)); await check(`${state}.gate===${value}&&document.querySelector('[data-setting=gate] .improve-setting-summary').textContent==='+${value}'&&document.querySelectorAll('.improve-setting.is-expanded').length===4`, 'Gate '+value+' remains expanded'); }
    await click(gate(5));
    await click(focus('mode:MANUAL'));
    await check(`${state}.mode==='MANUAL'&&Object.keys(${state}.overrides).length===0&&${positions}===${JSON.stringify(original)}&&[...document.querySelectorAll('.improve-roll-slider')].every(n=>!n.disabled&&getComputedStyle(n).cursor==='pointer'&&getComputedStyle(n).backgroundImage.includes('201, 168, 95'))&&[...document.querySelectorAll('.improve-roll-value')].every(n=>getComputedStyle(n).color==='rgb(228, 213, 181)')`, 'Customize same layout/gold/tier positions/no invented overrides');
    await click(focus('every:Energy Regen'));
    await check(`${state}.overrides.echoRequirements.requiredOnEveryEcho.some(r=>r.stat==='Energy Regen')&&${state}.overrides.echoPreferences.every(r=>r.stat!=='Energy Regen')&&document.querySelector('[data-setting=flex] [data-stat-name="Energy Regen"] button').disabled&&!document.querySelector(${JSON.stringify(slider('flex','Energy Regen'))})`, 'Every Echo/Flex exclusivity');
    await click(focus('every:Energy Regen')); await click(focus('flex:Energy Regen'));
    await click(focus('flex:ATK%')); await check(`!document.querySelector(${JSON.stringify(slider('flex','ATK%'))})`, 'Flex toggle off'); await click(focus('flex:ATK%'));
    const order=await read(`${state}.overrides.echoPreferences.map(r=>r.stat)`);
    const rowSel=name=>'[data-setting=flex] .improve-echo-row[data-stat-name='+JSON.stringify(name)+']';
    await read(`document.querySelector(${JSON.stringify(rowSel(order[0]))}).scrollIntoView({block:'center',behavior:'instant'})`);await sleep(120);
    const rows=await read(`[${JSON.stringify(order[1])},${JSON.stringify(order[0])}].map(name=>document.querySelector('[data-setting=flex] .improve-echo-row[data-stat-name="'+name+'"]').getBoundingClientRect().toJSON())`);
    const from={x:rows[0].x+12,y:rows[0].y+rows[0].height/2},to={x:rows[1].x+12,y:rows[1].y+rows[1].height/2};
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...from});await send('Input.dispatchMouseEvent',{type:'mousePressed',...from,button:'left',buttons:1,clickCount:1});
    for(let i=1;i<=8;i++){await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:from.x+(to.x-from.x)*i/8,y:from.y+(to.y-from.y)*i/8,button:'left',buttons:1});await sleep(25);}
    await sleep(250);await send('Input.dispatchMouseEvent',{type:'mouseMoved',...to,button:'left',buttons:1});await sleep(100);await send('Input.dispatchMouseEvent',{type:'mouseReleased',...to,button:'left',clickCount:1});await sleep(150);
    const reordered=[order[1],order[0],...order.slice(2)];
    await check(`JSON.stringify(${state}.overrides.echoPreferences.map(r=>r.stat))===${JSON.stringify(JSON.stringify(reordered))}`, 'physical Flex drag reorder');
    await click(focus('flex:'+order[1])); await click(focus('flex:'+order[1])); // Re-add to ensure keyboard uses an active row.
    const keyboardBefore=await read(`${state}.overrides.echoPreferences.map(r=>r.stat)`),moving=keyboardBefore.at(-1);
    await read(`document.querySelector(${JSON.stringify(focus('flex:'+moving))}).focus()`);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowUp',code:'ArrowUp',modifiers:1,windowsVirtualKeyCode:38});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowUp',code:'ArrowUp',modifiers:1,windowsVirtualKeyCode:38});
    const expected=[...keyboardBefore];expected.splice(expected.length-2,0,expected.pop());
    await check(`JSON.stringify(${state}.overrides.echoPreferences.map(r=>r.stat))===${JSON.stringify(JSON.stringify(expected))}`, 'Alt Arrow Up Flex reorder');
    await click('[aria-label='+JSON.stringify('Move '+moving+' down')+']');
    await check(`JSON.stringify(${state}.overrides.echoPreferences.map(r=>r.stat))===${JSON.stringify(JSON.stringify(keyboardBefore))}`, 'Move down restores order');
    await click(slider('every','CRIT Rate')); await key('Home');await key('ArrowRight');
    await check(`${state}.overrides.echoRequirements.requiredOnEveryEcho.find(r=>r.stat==='CRIT Rate').minimum===.069&&document.querySelector(${JSON.stringify(slider('every','CRIT Rate'))}).getAttribute('aria-valuetext')==='6.9%'`, 'discrete canonical tier snapping');
    await click(slider('flex','ATK%'));await key('End');
    await check(`${state}.overrides.echoPreferences.find(r=>r.stat==='ATK%').minimum===.116`, 'Flex canonical endpoint');
    await read('document.getElementById("improveShell").scrollTop=0');await settle();await capture(send,`artifacts/ui-preview-improve-settings-customize-${width}x${height}.png`);
    const saved=await read(`JSON.stringify(${state})`);await navigate(send);await wait('releasedCharacters.length===57&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"','reload readiness');await read("show('improve');improvePicker.select('Augusta')");await settle();
    await check(`JSON.stringify(${state})===${JSON.stringify(saved)}`, 'selection/order/threshold persistence');await click(trigger('flex'));await settle();await click(focus('reset:echo'));
    await check(`${state}.overrides.echoRequirements===undefined&&${state}.overrides.echoPreferences===undefined&&${positions}===${JSON.stringify(original)}`, 'Reset to Recommended source selection/tiers/order');
    await click(focus('mode:RECOMMENDED'));await key('Escape');await settle();
    await read('document.getElementById("improveEchoRow").scrollIntoView({block:"end",behavior:"instant"})');
    await check(`document.getElementById('improveEchoRow').getBoundingClientRect().bottom<=innerHeight+1&&document.getElementById('improveEchoRow').getBoundingClientRect().width===${dimensions.echo.width}&&document.querySelectorAll('#improveEchoRow button').length===5&&${equipmentSnapshot}===${JSON.stringify(equipment)}&&JSON.stringify(improveUi.candidate)===${JSON.stringify(candidate)}`, 'five Echoes and Current/Candidate ownership unchanged');
    console.log('- Accepted Improve Settings '+width+'x'+height+': shared expansion, source-backed Character Target/Pending Build Need, Gate, Every Echo/Flex, grey Recommended, source minimums, other stats, gold Customize, toggles/exclusivity, physical/keyboard reorder, exact tiers, reload/reset, selector/workspace ownership PASS.');
  }
  await setViewport(send,1440,900); await click(focus('mode:MANUAL')); await click(trigger('target')); await sleep(380); await click('.improve-target-add summary'); await click(focus('metric:TOTAL_ENERGY_REGEN'));
  await enter('#improve-target-minimum-TOTAL_ENERGY_REGEN','117.5'); await enter('#improve-target-preferred-TOTAL_ENERGY_REGEN','116'); await click(focus('save-target:TOTAL_ENERGY_REGEN'));
  await check(`!document.getElementById('improve-target-error-TOTAL_ENERGY_REGEN').hidden&&${state}.overrides.numericTargets===undefined`, 'invalid preferred committed');
  await enter('#improve-target-minimum-TOTAL_ENERGY_REGEN','-1'); await enter('#improve-target-preferred-TOTAL_ENERGY_REGEN',''); await click(focus('save-target:TOTAL_ENERGY_REGEN'));
  await check(`${state}.overrides.numericTargets===undefined&&!document.getElementById('improve-target-error-TOTAL_ENERGY_REGEN').hidden`, 'negative target committed');
  await enter('#improve-target-minimum-TOTAL_ENERGY_REGEN','117.5'); await enter('#improve-target-preferred-TOTAL_ENERGY_REGEN','126.25'); await click(focus('save-target:TOTAL_ENERGY_REGEN'));
  await check(`${state}.overrides.numericTargets[0].minimum===1.175&&${state}.overrides.numericTargets[0].preferred===1.2625&&${state}.overrides.numericTargets[0].basis.kind==='USER_DEFINED'&&${effective}.characterTarget.numericTargets.status==='USER_DEFINED'&&document.querySelector('[data-editor-metric="TOTAL_ENERGY_REGEN"] input').value==='117.5'`, 'percentage save/canonical user basis');
  await click('.improve-target-add summary'); await click(focus('metric:TOTAL_ATK')); await enter('#improve-target-minimum-TOTAL_ATK','1800'); await enter('#improve-target-preferred-TOTAL_ATK','2000'); await click(focus('save-target:TOTAL_ATK'));
  await check(`${state}.overrides.numericTargets.find(r=>r.metric==='TOTAL_ATK').minimum===1800&&${state}.overrides.numericTargets.find(r=>r.metric==='TOTAL_ATK').unit==='POINTS'`, 'point target canonical round-trip');
  await capture(send,'artifacts/ui-preview-improve-target-custom-1440x900.png');
  await key('Escape'); await click(trigger('gate')); await key('Escape'); await check(`document.activeElement.id==='improve-setting-gate'&&document.querySelectorAll('.improve-setting.is-expanded').length===0`, 'Escape focus restoration');
  await key('Enter','Enter',13); await check(`document.getElementById('improve-setting-gate').getAttribute('aria-expanded')==='true'`, 'keyboard trigger activation');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]}); await click('[data-setting="gate"] [data-setting-value="10"]');
  await check(`getComputedStyle(document.getElementById('improve-setting-gate-choices')).transitionProperty==='opacity'`, 'reduced motion'); await send('Emulation.setEmulatedMedia',{features:[]});
  await check(equipmentSnapshot+'==='+JSON.stringify(equipment)+'&&JSON.stringify(improveUi.candidate)==='+JSON.stringify(candidate), 'settings mutated build/Candidate ownership');
  const saved = await read(`JSON.stringify(${state})`);
  await read("improveUi.setCharacter('Chixia')"); await check(`${state}.mode==='RECOMMENDED'&&Object.keys(${state}.overrides).length===0&&${effective}.echoPolicy.requirements.status==='PENDING'`, 'Character isolation/no priorities-to-requirements inference');
  await read(`improveUi.setCharacter(releasedCharacters.find(r=>r.id===${JSON.stringify(pendingId)}).name)`); await click(trigger('target'));
  await check(`${summary('target')}==='Recommended'&&document.querySelector('[data-policy-section="numericTargets"]').innerText.includes('Pending')`, 'Pending numeric targets rendered as successful empty');
  await read("improveUi.setCharacter('Augusta')"); await check(`JSON.stringify(${state})===${JSON.stringify(saved)}`, 'Character restore');
  await navigate(send); await wait('releasedCharacters.length===57&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"','reload source readiness');
  await read("show('improve');improvePicker.select('Augusta')"); await check(`JSON.stringify(${state})===${JSON.stringify(saved)}`, 'v3 reload persistence');
  await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true}); await send('Network.setBlockedURLs',{urls:['*improve-settings/policies.json']});
  try {
    await navigate(send); await wait('releasedCharacters.length===57&&document.getElementById("improveSettings").dataset.sourceStatus==="PENDING"','source outage Pending');
    await read("show('improve');improvePicker.select('Augusta')"); await settle();
    await check(`${state}.mode==='MANUAL'&&${state}.overrides.numericTargets.length===2&&${effective}.characterTarget.numericTargets.status==='PENDING'`, 'outage erased/mislabeled user intent');
    await click(trigger('gate')); await sleep(380); await click('[data-setting="gate"] [data-setting-value="20"]');
  } finally { await send('Network.setBlockedURLs',{urls:[]}); }
  await navigate(send); await wait('releasedCharacters.length===57&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"','source recovery');
  await read("show('improve');improvePicker.select('Augusta')"); await check(`${state}.gate===20&&${effective}.characterTarget.numericTargets.status==='USER_DEFINED'&&${state}.overrides.numericTargets[0].minimum===1.175`, 'source recovery intent/label preservation');
  // Exact v2 UI-path migration, recovery copy and explicit empty/Recommended cases.
  const binding=JSON.stringify(['augusta',augusta.presetId,augusta.profileId,augusta.provenance,augusta.stats]);
  for(const [orderingMode,activeStats] of [['MANUAL',['CRIT DMG','CRIT Rate']],['MANUAL',[]],['RECOMMENDED',[]]]) {
    const legacy={version:2,characters:{augusta:{schemaVersion:2,characterId:'augusta',gate:15,rollQuality:'Mid+',valuableStats:{schemaVersion:2,presetId:augusta.presetId,profileId:augusta.profileId,sourceBinding:binding,orderingMode,activeStats}}}};
    const raw=JSON.stringify(legacy);
    await read(`localStorage.removeItem('bellibing.improve.policy.v3');localStorage.setItem('bellibing.improve.simple-settings.v2',${JSON.stringify(raw)})`);
    await navigate(send); await wait('releasedCharacters.length===57&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"','v2 migration readiness');
    await read("show('improve');improvePicker.select('Augusta')");
    await check(`${state}.mode===${JSON.stringify(orderingMode)}&&${state}.gate===15&&${state}.rollQuality==='Mid+'&&localStorage.getItem('bellibing.improve.simple-settings.v2')===${JSON.stringify(raw)}&&${state}.overrides.echoRequirements===undefined&&${state}.overrides.numericTargets===undefined&&${state}.overrides.priorities===undefined`, 'v2 migration semantics/recovery copy');
    if(orderingMode==='MANUAL') await check(`JSON.stringify(${state}.overrides.echoPreferences.map(r=>r.stat))===${JSON.stringify(JSON.stringify(activeStats))}`, 'Manual Active order to preferences only');
    else await check(`Object.keys(${state}.overrides).length===0&&${effective}.echoPolicy.requirements.value.requiredOnEveryEcho.length===2`, 'Recommended migration cleared source policy');
  }
  await settle(); await click(focus('mode:MANUAL')); await check(`${state}.mode==='MANUAL'`, 'post-migration physical Manual selection'); await click(trigger('every')); await sleep(380); await check(`!!document.querySelector('[data-focus-key=\"flex:ATK%\"]')`, 'post-migration Manual assignment readiness'); await click(focus('flex:ATK%'));
  const originalBinding = await read(`${state}.contextBinding`);
  await read(`(()=>{const key='bellibing.improve.policy.v3',s=JSON.parse(localStorage.getItem(key));s.characters.augusta.contextBinding='changed-context';localStorage.setItem(key,JSON.stringify(s))})()`);
  await navigate(send); await wait('releasedCharacters.length===57&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"','drift source readiness');
  await read("show('improve');improvePicker.select('Augusta')"); await settle(); await click(trigger('every')); await sleep(380);
  await check(`${state}.compatibility.status==='REVIEW_REQUIRED'&&${state}.overrides.echoPreferences.length===2&&${state}.overrides.echoPreferences.every(r=>r.stat!=='ATK%')&&!document.querySelector('.improve-policy-review').hidden&&document.querySelector('.improve-policy-review').textContent.includes('Needs review')&&[...document.querySelectorAll('[data-setting=flex] .improve-echo-toggle')].every(n=>n.disabled)`, 'drift silently retargeted/erased intent');
  await capture(send,'artifacts/ui-preview-improve-policy-review-1440x900.png');
  await read(`(()=>{const key='bellibing.improve.policy.v3',s=JSON.parse(localStorage.getItem(key));s.characters.augusta.contextBinding=${JSON.stringify(originalBinding)};localStorage.setItem(key,JSON.stringify(s))})()`);
  await navigate(send); await wait('releasedCharacters.length===57&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"','restored context'); await read("show('improve');improvePicker.select('Augusta')");
  await check(`${effective}.echoPolicy.preferences.status==='USER_DEFINED'`, 'restored context remains suspended');
  const detached=await read(`(()=>{const s=${state};s.gate=5;s.overrides.echoPreferences.length=0;return ${state}.gate===15&&${state}.overrides.echoPreferences.length===2})()`); if(!detached)throw new Error('v3 inspection API leaked mutable state');
  console.log('- Improve v3 target validation/percent/point round-trip, USER_DEFINED, Pending, sparse inheritance/empties, Character/reload isolation, exact v2 migration/recovery copy, source outage/recovery and Needs review drift PASS.');
}
