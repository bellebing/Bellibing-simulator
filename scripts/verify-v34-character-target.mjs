import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

// Focused iteration review only. Source and built previews share the same data.
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
let stderr = '', socket;
chrome.stderr.on('data', data => stderr += data);
const expected = (await import('../docs/ui-prototypes/assets/improve-settings/character-targets.mjs')).CHARACTER_TARGET_PRESENTATIONS;
try {
  let browser;
  for (let i = 0; i < 150; i++) {
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
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++serial; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
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
    await send('Input.insertText', { text });
  };
  const shot = async path => {
    const result = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    mkdirSync('artifacts', { recursive: true }); writeFileSync(path, Buffer.from(result.data, 'base64'));
  };
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.enable'); await send('Runtime.enable');
  for (const [kind, path] of [['source', '/docs/ui-prototypes/v34-functional.html'], ['built', '/dist/ui-preview/']]) {
    await send('Page.navigate', { url: base + path });
    await wait("typeof releasedCharacters!=='undefined'&&releasedCharacters.length===57&&echoDataLoaded&&window.bellibingImproveSettings&&document.getElementById('improveSettings').dataset.sourceStatus!=='LOADING'");
    await evaluate('localStorage.clear()');
    await send('Page.navigate', { url: base + path });
    await wait("typeof releasedCharacters!=='undefined'&&releasedCharacters.length===57&&echoDataLoaded&&window.bellibingImproveSettings&&document.getElementById('improveSettings').dataset.sourceStatus!=='LOADING'");
    const data = await evaluate("import('./assets/improve-settings/character-targets.mjs').then(m=>m.CHARACTER_TARGET_PRESENTATIONS)");
    assert.deepEqual(data, expected, kind + ' browser data parity');
    await evaluate("addOwned('Augusta');addOwned('Galbrena');addOwned('Chixia');addOwned('Aemeath');show('improve');improvePicker.select('Augusta')");
    await sleep(800);
    const snapshot = "JSON.stringify({builds:Object.fromEntries(Object.entries(state.drafts).map(([name,draft])=>{const build=structuredClone(draft.build);delete build.lastImprovedAt;return[name,build]})),candidate:improveUi.candidate})";
    const originalEquipment = await evaluate(snapshot);
    await click('#improve-setting-target');
    for (const [name, id] of [['Augusta', 'augusta'], ['Galbrena', 'galbrena'], ['Chixia', 'chixia'], ['Aemeath', 'aemeath']]) {
      await evaluate(`improvePicker.select(${JSON.stringify(name)})`); await sleep(800);
      if (await evaluate("document.querySelector('#improve-setting-target').getAttribute('aria-expanded')") !== 'true') await click('#improve-setting-target');
      const rows = await evaluate("[...document.querySelectorAll('.improve-recommended-stat')].map(n=>({metric:n.dataset.metric,status:n.dataset.status,label:n.querySelector('dt').textContent,value:n.querySelector('dd > span').textContent,secondary:n.querySelector('small')?.textContent??null}))");
      const projected = expected.find(item => item.characterId === id);
      assert.deepEqual(rows, projected.rows.map(row => ({ metric: row.metric, status: row.status, label: row.label, value: row.displayValue, secondary: row.secondaryDisplay })), kind + ' ' + name);
      assert.equal(await evaluate("document.querySelector('.improve-build-need p').textContent"), 'Pending');
      if (!rows.length) assert.equal(await evaluate("document.querySelector('[data-policy-section=numericTargets] p').textContent"), 'Pending');
      assert.ok(await evaluate(`(()=>{const col=document.querySelector('[data-setting=target]'),r=col.getBoundingClientRect();return document.documentElement.scrollWidth===innerWidth&&[...col.querySelectorAll('.improve-setting-options *')].every(n=>{const b=n.getBoundingClientRect();return !b.width||(b.left>=r.left-1&&b.right<=r.right+1&&n.scrollWidth<=n.clientWidth+1)})})()`), kind + ' ' + name + ' target overflow');
      assert.ok(await evaluate("document.getElementById('improveBuildCard').getBoundingClientRect().top>=document.getElementById('improveSettings').getBoundingClientRect().bottom"), 'workspace below Settings');
      await evaluate("document.getElementById('improveShell').scrollTop=0");
      await shot(`artifacts/character-target-${kind}-${id}-1440x900.png`);
      console.log(kind + ' ' + name + ': ' + rows.length + ' rows, Pending Build Need, compact containment PASS');
    }
    await evaluate("improvePicker.select('Augusta')"); await sleep(700);
    if (await evaluate("document.querySelector('#improve-setting-target').getAttribute('aria-expanded')") !== 'true') await click('#improve-setting-target');
    const before = await evaluate('JSON.stringify(window.bellibingImproveSettings.getState().overrides)');
    await click('[data-focus-key="mode:MANUAL"]');
    assert.equal(await evaluate('JSON.stringify(window.bellibingImproveSettings.getState().overrides)'), before, 'Customize alone creates no overrides');
    assert.equal(await evaluate("document.querySelectorAll('.improve-recommended-stat,.improve-target-editor').length"), 0, 'Customize is not seeded');
    await click('.improve-target-add summary'); await click('[data-focus-key="metric:TOTAL_ATK"]');
    await input('#improve-target-minimum-TOTAL_ATK', '2345'); await input('#improve-target-preferred-TOTAL_ATK', '2500');
    await click('[data-focus-key="save-target:TOTAL_ATK"]');
    const custom = await evaluate('window.bellibingImproveSettings.getState().overrides.numericTargets');
    const atk = custom.find(row => row.metric === 'TOTAL_ATK');
    assert.equal(atk.minimum, 2345); assert.equal(atk.preferred, 2500);
    await shot(`artifacts/character-target-${kind}-customize-1440x900.png`);
    await send('Page.reload');
    await wait("typeof releasedCharacters!=='undefined'&&releasedCharacters.length===57&&window.bellibingImproveSettings&&document.getElementById('improveSettings').dataset.sourceStatus!=='LOADING'");
    await evaluate("show('improve');improvePicker.select('Augusta')"); await sleep(700);
    assert.deepEqual(await evaluate('window.bellibingImproveSettings.getState().overrides.numericTargets'), custom, 'manual target reload persistence');
    await click('#improve-setting-target'); await click('[data-focus-key="clear:numericTargets"]');
    assert.equal(await evaluate('window.bellibingImproveSettings.getState().overrides.numericTargets'), undefined, 'Use Recommended clears custom targets');
    await click('[data-focus-key="mode:RECOMMENDED"]');
    assert.equal(await evaluate("document.querySelectorAll('.improve-recommended-stat[data-status=READY]').length"), 8, 'Recommended rows return');
    assert.equal(await evaluate(snapshot), originalEquipment, 'equipment and Candidate unchanged');
    console.log(kind + ': Customize add/minimum/preferred/Use Recommended, persistence and return to source rows PASS');
  }
  console.log('Focused 1440x900 Character Target review PASS (source + built).');
} finally {
  socket?.close(); chrome.kill('SIGTERM');
  await new Promise(resolve => chrome.once('exit', resolve));
  rmSync(profile, { recursive: true, force: true });
}
