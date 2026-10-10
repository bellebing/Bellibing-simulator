import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

// Checkpoint matrix. Source and built previews share the same data.
const base = process.env.BELLIBING_CHARACTER_TARGET_BASE ?? 'http://127.0.0.1:4173';
const debugPort = 9679;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const profile = mkdtempSync(join(tmpdir(), 'bellibing-character-target-'));
const chrome = spawn(process.env.CHROME_BIN ?? 'google-chrome', [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4',
  '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=' + debugPort,
  '--user-data-dir=' + profile, 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
let stderr = '', socket, send, verificationFailed = false;
chrome.stderr.on('data', data => stderr += data);
// Listen before shutdown (or an early startup exit), so exit cannot be missed.
const chromeExit = new Promise(resolve => {
  chrome.once('exit', resolve);
  chrome.on('error', error => { stderr += error.message; if (!chrome.pid) resolve(); });
});
const chromeClosed = new Promise(resolve => chrome.once('close', resolve));
const bounded = (operation, message) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(message)), 5000);
  Promise.resolve().then(operation).then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
});
try {
  const expected = (await import('../docs/ui-prototypes/assets/improve-settings/character-targets.mjs')).CHARACTER_TARGET_PRESENTATIONS;
  let browser;
  for (let i = 0; i < 150; i++) {
    if (!chrome.pid || chrome.exitCode !== null || chrome.signalCode !== null) break;
    try { browser = await (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).json(); break; } catch { await sleep(100); }
  }
  assert.ok(browser, 'Chrome did not start: ' + stderr);
  console.log('Browser: ' + browser.Browser);
  const page = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })).json();
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let serial = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(String(event.data)), waiter = pending.get(message.id);
    if (waiter) { pending.delete(message.id); message.error ? waiter.reject(new Error(message.error.message)) : waiter.resolve(message.result); }
  });
  send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++serial; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result?.value;
  };
  const wait = async expression => {
    for (let i = 0; i < 250; i++) { if (await evaluate(expression)) return; await sleep(80); }
    throw new Error('UI did not become ready: ' + expression);
  };
  const click = async selector => {
    const rect = await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)throw new Error('Missing target '+${JSON.stringify(selector)});n.scrollIntoView({block:'center',behavior:'instant'});return n.getBoundingClientRect().toJSON()})()`);
    const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 10, y: 850 }); await sleep(400);
  };
  const input = async (selector, text) => {
    await click(selector);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',modifiers:2,windowsVirtualKeyCode:65});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',modifiers:2,windowsVirtualKeyCode:65});
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Backspace',code:'Backspace'});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Backspace',code:'Backspace'});
    await send('Input.insertText', { text });
  };
  const shot = async path => {
    const result = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    mkdirSync('artifacts', { recursive: true }); writeFileSync(path, Buffer.from(result.data, 'base64'));
  };
  await send('Page.enable'); await send('Runtime.enable');
  for (const [width, height] of [[1440, 900], [1920, 1080], [2560, 1440]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    for (const [kind, path] of [['source', '/docs/ui-prototypes/v34-functional.html'], ['built', '/dist/ui-preview/']]) {
      await send('Page.navigate', { url: base + path });
      await wait("typeof releasedCharacters!=='undefined'&&releasedCharacters.length===59&&echoDataLoaded&&window.bellibingImproveSettings&&document.getElementById('improveSettings').dataset.sourceStatus!=='LOADING'");
      await evaluate('localStorage.clear()');
      await send('Page.navigate', { url: base + path });
      await wait("typeof releasedCharacters!=='undefined'&&releasedCharacters.length===59&&echoDataLoaded&&window.bellibingImproveSettings&&document.getElementById('improveSettings').dataset.sourceStatus!=='LOADING'");
      assert.deepEqual(await evaluate("releasedCharacters.filter(c=>['hsin','jingran','suoming'].includes(c.id)).map(c=>c.id).sort()"), ['hsin', 'jingran']);
      assert.deepEqual(await evaluate("['hsin','jingran'].map(id=>({id,stats:buildStatsCharacterById.has(id),skills:skillsPreviewByCharacterId.has(id),sequence:sequenceAssetsByCharacter.has(id)}))"), ['hsin','jingran'].map(id=>({id,stats:false,skills:false,sequence:false})));
      const data = await evaluate("import('./assets/improve-settings/character-targets.mjs').then(m=>m.CHARACTER_TARGET_PRESENTATIONS)");
      assert.deepEqual(data, expected, kind + ' browser data parity');
      await evaluate("addOwned('Augusta');addOwned('Galbrena');addOwned('Chixia');addOwned('Aemeath');addOwned('Hsin');addOwned('Jingran');show('improve');improvePicker.select('Augusta')");
      await sleep(800);
      const snapshot = "JSON.stringify({builds:Object.fromEntries(Object.entries(state.drafts).map(([name,draft])=>{const build=structuredClone(draft.build);delete build.lastImprovedAt;return[name,build]})),candidate:improveUi.candidate})";
      const originalEquipment = await evaluate(snapshot);
      await click('#improve-setting-target');
      for (const [name, id] of [['Augusta', 'augusta'], ['Galbrena', 'galbrena'], ['Chixia', 'chixia'], ['Aemeath', 'aemeath'], ['Hsin', 'hsin'], ['Jingran', 'jingran'], ['Suoming', 'suoming']]) {
        await evaluate(id === 'suoming' ? "window.bellibingImproveSettings.setCharacter('suoming')" : `improvePicker.select(${JSON.stringify(name)})`); await sleep(800);
        if (id !== 'suoming') await click('#improveWheel .choice[data-character-id="' + id + '"]');
        if (['hsin', 'jingran'].includes(id)) assert.equal(await evaluate(`projectImproveCurrentStats(${JSON.stringify(name)})`), null, name + ' unresolved Current Stats stay Pending');
        if (await evaluate("document.querySelector('#improve-setting-target').getAttribute('aria-expanded')") !== 'true') await click('#improve-setting-target');
        const rows = await evaluate("[...document.querySelectorAll('.improve-recommended-stat')].map(n=>({metric:n.dataset.metric,status:n.dataset.status,label:n.querySelector('dt').textContent,value:n.querySelector('dd > span').textContent}))");
        const projected = expected.find(item => item.characterId === id);
        assert.deepEqual(rows, projected.rows.map(row => ({ metric: row.metric, status: row.status, label: row.label, value: row.displayValue })), kind + ' ' + name);
        assert.ok(await evaluate("[...document.querySelectorAll('.improve-recommended-stat')].every(n=>n.children.length===2&&n.querySelector('dd').children.length===1&&!n.querySelector('small')&&!/Prydwen|DPR|Calc|[+·]/.test(n.textContent))"), kind + ' one value per row, no source subline');
        if (id === 'augusta') assert.deepEqual(rows.map(row => [row.label, row.value]), [
          ['ATK', '2,407'], ['CRIT Rate', '84.7%'], ['CRIT DMG', '225%'], ['Energy Regen', '120%'], ['Heavy Attack DMG', '29.2%'],
        ]);
        assert.equal(await evaluate("document.querySelector('.improve-build-need')"), null, 'approved V1 has no visible Build Need block');
        if (!rows.length) assert.equal(await evaluate("document.querySelector('[data-policy-section=numericTargets] p').textContent"), 'Pending');
        assert.ok(await evaluate(`(()=>{const col=document.querySelector('[data-setting=target]'),r=col.getBoundingClientRect();return document.documentElement.scrollWidth===innerWidth&&[...col.querySelectorAll('.improve-setting-options *')].every(n=>{const b=n.getBoundingClientRect();return !b.width||(b.left>=r.left-1&&b.right<=r.right+1&&n.scrollWidth<=n.clientWidth+1)})})()`), kind + ' ' + name + ' target overflow');
        assert.ok(await evaluate("document.getElementById('improveBuildCard').getBoundingClientRect().top>=document.getElementById('improveSettings').getBoundingClientRect().bottom"), 'workspace below Settings');
        await evaluate("document.getElementById('improveShell').scrollTop=0");
        await shot(`artifacts/character-target-${kind}-${id}-${width}x${height}.png`);
        console.log(kind + ' ' + width + 'x' + height + ' ' + name + ': ' + rows.length + ' rows, no visible Build Need, compact containment PASS');
      }
      await evaluate("improvePicker.select('Augusta')"); await sleep(700);
      if (await evaluate("document.querySelector('#improve-setting-target').getAttribute('aria-expanded')") !== 'true') await click('#improve-setting-target');
      const before = await evaluate('JSON.stringify(window.bellibingImproveSettings.getState().overrides)');
      assert.equal(await evaluate('JSON.stringify(window.bellibingImproveSettings.getState().overrides)'), before, 'opening Settings creates no overrides');
      assert.equal(await evaluate("document.querySelectorAll('.improve-target-editor').length"), 0, 'opening Settings creates no custom editors');
      assert.equal(await evaluate("!!document.querySelector('.improve-target-add')"), false, 'Add stat absent');
      await evaluate("import(new URL('../assets/improvePolicyPresentation.js',location.href)).then(m=>{const key='bellibing.improve.policy.v3',s=JSON.parse(localStorage.getItem(key));s.characters.augusta.mode='MANUAL';s.characters.augusta.overrides.numericTargets=[m.parseImproveTarget('TOTAL_ATK','2200','2400')];localStorage.setItem(key,JSON.stringify(s))})");
      await send('Page.reload');
      await wait("typeof releasedCharacters!=='undefined'&&releasedCharacters.length===59&&window.bellibingImproveSettings&&document.getElementById('improveSettings').dataset.sourceStatus!=='LOADING'");
      await evaluate("show('improve');improvePicker.select('Augusta')"); await sleep(700);
      assert.equal(await evaluate('window.bellibingImproveSettings.getState().overrides.numericTargets[0].minimum'),2200,'saved custom target preserved');
      await click('#improve-setting-target');
      await input('#improve-target-minimum-TOTAL_ATK', '2345'); await input('#improve-target-preferred-TOTAL_ATK', '2500');
      await click('[data-focus-key="save-target:TOTAL_ATK"]');
      const custom = await evaluate('window.bellibingImproveSettings.getState().overrides.numericTargets');
      const atk = custom.find(row => row.metric === 'TOTAL_ATK');
      assert.equal(atk.minimum, 2345); assert.equal(atk.preferred, 2500);
      await shot(`artifacts/character-target-${kind}-customize-${width}x${height}.png`);
      await send('Page.reload');
      await wait("typeof releasedCharacters!=='undefined'&&releasedCharacters.length===59&&window.bellibingImproveSettings&&document.getElementById('improveSettings').dataset.sourceStatus!=='LOADING'");
      await evaluate("show('improve');improvePicker.select('Augusta')"); await sleep(700);
      assert.deepEqual(await evaluate('window.bellibingImproveSettings.getState().overrides.numericTargets'), custom, 'manual target reload persistence');
      await click('#improve-setting-target'); await click('[data-focus-key="clear:numericTargets"]');
      assert.equal(await evaluate('window.bellibingImproveSettings.getState().overrides.numericTargets'), undefined, 'Use Recommended clears custom targets');
      assert.equal(await evaluate("document.querySelectorAll('.improve-recommended-stat[data-status=READY]').length"), 5, 'Recommended rows return');
      assert.equal(await evaluate(snapshot), originalEquipment, 'equipment and Candidate unchanged');
      console.log(kind + ': saved target editing/minimum/preferred/Use Recommended, persistence and return to source rows PASS');
    }
  }
  console.log('Character Target checkpoint matrix PASS (source + built; 1440x900, 1920x1080, 2560x1440).');
} catch (error) {
  verificationFailed = true;
  throw error;
} finally {
  let cleanupError;
  try {
    if (chrome.pid && chrome.exitCode === null && chrome.signalCode === null) {
      try {
        if (!send || socket?.readyState !== WebSocket.OPEN) throw new Error('Chrome CDP unavailable');
        await bounded(() => Promise.all([send('Browser.close'), chromeExit]), 'Chrome CDP shutdown timed out');
      } catch {
        await bounded(() => { chrome.kill('SIGTERM'); return chromeExit; }, 'Chrome did not exit after SIGTERM');
      }
    }
    // Subprocesses can retain stderr and finish profile writes after exit.
    await bounded(() => chromeClosed, 'Chrome stdio did not close after exit');
  } catch (error) {
    cleanupError = error;
  }
  socket?.close();
  try {
    // Async retries traverse again if subprocesses created late profile files.
    await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  } catch (error) {
    cleanupError = cleanupError ? new AggregateError([cleanupError, error], 'Chrome shutdown and profile cleanup failed') : error;
  }
  if (cleanupError) {
    if (verificationFailed) console.error('Chrome cleanup also failed:', cleanupError);
    else throw cleanupError;
  } else console.log('Character Target Chrome shutdown and profile cleanup PASS.');
}
