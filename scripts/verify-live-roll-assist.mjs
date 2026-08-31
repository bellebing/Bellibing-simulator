import { spawn } from 'node:child_process';

const LIVE_URL = process.env.BELLIBING_LIVE_ROLL_ASSIST_URL
  ?? 'https://bellebing.github.io/Bellibing-simulator/roll-assistant.html';
const ALPHA_URL = new URL('.', LIVE_URL).href;
const PROFILED_ROLL_ASSIST_URL = new URL(
  'roll-assistant.html?character=augusta&preset=augusta-standard',
  ALPHA_URL,
).href;
const DEBUG_PORT = Number(process.env.CHROME_DEBUG_PORT ?? 9222);
const CHROME = process.env.CHROME_BIN ?? 'google-chrome';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForJsonVersion() {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (response.ok) return response.json();
    } catch {
      // Chrome is still starting.
    }
    await sleep(150);
  }
  throw new Error('Timed out waiting for Chrome DevTools endpoint.');
}

async function createPage() {
  const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?${encodeURIComponent('about:blank')}`, {
    method: 'PUT',
  });
  if (!response.ok) throw new Error(`Failed to create Chrome page: HTTP ${response.status}`);
  return response.json();
}

function cdp(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let serial = 0;
  const pending = new Map();

  const opened = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (!message.id) return;
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
  });

  async function send(method, params = {}) {
    await opened;
    serial += 1;
    const id = serial;
    const result = new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    socket.send(JSON.stringify({ id, method, params }));
    return result;
  }

  return { socket, send };
}

async function evaluate(send, expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    const detail = result.exceptionDetails.exception?.description
      ?? result.exceptionDetails.text
      ?? 'Unknown Runtime.evaluate exception';
    throw new Error(detail);
  }
  return result.result?.value;
}

async function waitForLocation(send, expectedPrefix) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const location = await evaluate(send, 'location.href');
      if (String(location).startsWith(expectedPrefix)) return;
    } catch {
      // Execution context can be transient while navigation commits.
    }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for navigation to ${expectedPrefix}.`);
}

async function verifyAlphaEntry(send) {
  await send('Page.navigate', { url: 'about:blank' });
  await waitForLocation(send, 'about:blank');
  await send('Page.navigate', { url: ALPHA_URL });
  await waitForLocation(send, ALPHA_URL);

  const result = await evaluate(send, `
    (async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const deadline = Date.now() + 15000;
      while (Date.now() < deadline) {
        if (document.readyState === 'complete'
          && document.querySelector('#alpha-character')
          && document.querySelector('[data-preset]')
          && document.querySelector('#alpha-analyze')) break;
        await wait(100);
      }

      const character = document.querySelector('#alpha-character');
      if (!character) throw new Error('Alpha character control did not become ready.');
      character.value = 'augusta';
      if (character.value !== 'augusta') throw new Error('Augusta is missing from Alpha registry choices.');
      character.dispatchEvent(new Event('change', { bubbles: true }));
      await wait(100);

      const rollAssist = document.querySelector('#alpha-roll-assist');
      const ownedToggle = document.querySelector('#alpha-owned-toggle');
      if (!document.querySelector('#alpha-analyze')) throw new Error('Alpha Analyze control disappeared after Augusta selection.');
      if (!rollAssist) throw new Error('Augusta profile-aware Roll Assist CTA is missing.');
      if (!ownedToggle) throw new Error('Augusta owned Echo analysis CTA is missing.');

      ownedToggle.click();
      await wait(50);
      let stat = document.querySelector('#alpha-owned-stat');
      if (!stat) throw new Error('Owned Echo stat input did not open.');
      stat.value = 'CRIT Rate';
      stat.dispatchEvent(new Event('change', { bubbles: true }));
      await wait(50);
      const value = document.querySelector('#alpha-owned-value');
      const add = document.querySelector('#alpha-owned-add');
      if (!value || !add) throw new Error('Owned Echo exact roll controls are missing.');
      value.value = '0.093';
      if (value.value !== '0.093') throw new Error('Owned Echo exact CRIT Rate 9.3% value is missing.');
      add.click();
      await wait(50);
      const ownedDecision = document.querySelector('.alpha-owned-verdict strong')?.textContent?.trim() ?? null;

      document.querySelector('#alpha-owned-reset')?.click();
      await wait(30);
      const level = document.querySelector('#alpha-owned-level');
      if (!level) throw new Error('Owned Echo level selector disappeared.');
      level.value = '25';
      level.dispatchEvent(new Event('change', { bubbles: true }));
      await wait(30);

      const fullRolls = [
        ['CRIT Rate', '0.093'],
        ['CRIT DMG', '0.21'],
        ['ATK%', '0.116'],
        ['Energy Regen', '0.124'],
        ['Heavy Attack DMG', '0.116'],
      ];

      async function addOwnedRoll(name, rollValue) {
        const statSelect = document.querySelector('#alpha-owned-stat');
        if (!statSelect) throw new Error('Owned Echo stat selector missing while entering full build.');
        statSelect.value = name;
        if (statSelect.value !== name) throw new Error('Requested full-build substat is not available.');
        statSelect.dispatchEvent(new Event('change', { bubbles: true }));
        await wait(20);
        const valueSelect = document.querySelector('#alpha-owned-value');
        const addButton = document.querySelector('#alpha-owned-add');
        if (!valueSelect || !addButton) throw new Error('Owned Echo roll controls disappeared while entering full build.');
        valueSelect.value = rollValue;
        if (valueSelect.value !== rollValue) throw new Error('Requested full-build roll magnitude is not available.');
        addButton.click();
        await wait(25);
      }

      for (let slotIndex = 0; slotIndex < 5; slotIndex += 1) {
        const slot = document.querySelector('#alpha-owned-slot');
        if (!slot) throw new Error('Owned Echo slot selector missing while entering full build.');
        slot.value = String(slotIndex);
        slot.dispatchEvent(new Event('change', { bubbles: true }));
        await wait(20);
        const currentLevel = document.querySelector('#alpha-owned-level');
        if (!currentLevel) throw new Error('Owned Echo level selector missing while entering full build.');
        if (currentLevel.value !== '25') {
          currentLevel.value = '25';
          currentLevel.dispatchEvent(new Event('change', { bubbles: true }));
          await wait(20);
        }
        for (const [name, rollValue] of fullRolls) await addOwnedRoll(name, rollValue);
        const save = document.querySelector('#alpha-owned-save');
        if (!save) throw new Error('Full +25 Echo did not expose SAVE +25 ECHO IN BUILD.');
        save.click();
        await wait(35);
      }

      const buildProgress = document.querySelector('.alpha-owned-build-progress')?.textContent?.replace(/\\s+/g, ' ').trim() ?? '';
      const analyze = document.querySelector('#alpha-analyze');
      if (!analyze) throw new Error('Alpha Analyze control disappeared after full build entry.');
      analyze.click();
      await wait(100);
      const ownedBuildResult = document.querySelector('.alpha-result')?.textContent?.replace(/\\s+/g, ' ').trim() ?? '';

      return {
        heading: document.querySelector('h1')?.textContent?.replace(/\\s+/g, ' ').trim() ?? '',
        characterCount: document.querySelector('#alpha-character')?.options.length ?? 0,
        modeCount: document.querySelectorAll('[data-preset]').length,
        echoSlotCount: document.querySelectorAll('.alpha-echo-grid article').length,
        savedEchoSlotCount: document.querySelectorAll('.alpha-echo-slot--saved').length,
        hasResult: Boolean(document.querySelector('.alpha-result')),
        echoLabHref: document.querySelector('a[href$="echo-lab.html"]')?.getAttribute('href') ?? null,
        rollAssistHref: document.querySelector('#alpha-roll-assist')?.getAttribute('href') ?? null,
        ownedDecision,
        buildProgress,
        ownedBuildResult,
      };
    })()
  `);

  if (!result?.heading.includes('Build the Echo.')) throw new Error(`Alpha heading missing: ${JSON.stringify(result?.heading)}.`);
  if (!(result.characterCount > 0)) throw new Error('Alpha character selector has no registry profiles.');
  if (!(result.modeCount > 0)) throw new Error('Alpha mode selector has no presets.');
  if (result.echoSlotCount !== 5) throw new Error(`Alpha expected 5 Echo slots, got ${result.echoSlotCount}.`);
  if (result.savedEchoSlotCount !== 5) throw new Error(`Alpha expected 5 saved owned Echo slots, got ${result.savedEchoSlotCount}.`);
  if (!result.hasResult) throw new Error('Alpha Analyze did not render a result state.');
  if (result.echoLabHref !== './echo-lab.html') throw new Error(`Alpha Echo Lab route mismatch: ${JSON.stringify(result.echoLabHref)}.`);
  if (result.rollAssistHref !== './roll-assistant.html?character=augusta&preset=augusta-standard') {
    throw new Error(`Alpha profile-aware Roll Assist route mismatch: ${JSON.stringify(result.rollAssistHref)}.`);
  }
  if (result.ownedDecision !== 'ROLL TO +10') {
    throw new Error(`Alpha owned Echo verdict mismatch: ${JSON.stringify(result.ownedDecision)}.`);
  }
  if (!result.buildProgress.includes('Five +25 Echoes ready.')) {
    throw new Error(`Alpha owned-build progress mismatch: ${JSON.stringify(result.buildProgress)}.`);
  }
  if (!result.ownedBuildResult.includes('PERSONAL ROTATION DPS') || !result.ownedBuildResult.includes('ER') || !result.ownedBuildResult.includes('PASS')) {
    throw new Error(`Alpha owned-build DPS result mismatch: ${JSON.stringify(result.ownedBuildResult)}.`);
  }
}

async function navigate(send, url) {
  await send('Page.navigate', { url: 'about:blank' });
  await waitForLocation(send, 'about:blank');
  await send('Page.navigate', { url });
  await waitForLocation(send, url);

  const result = await evaluate(send, `
    (async () => {
      const deadline = Date.now() + 15000;
      while (Date.now() < deadline) {
        if (document.readyState === 'complete'
          && document.querySelector('#assist-stat')
          && document.querySelector('#assist-enter')) return true;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new Error('Roll Assist controls did not become ready.');
    })()
  `);
  if (result !== true) throw new Error('Roll Assist controls did not become ready.');
}

async function verifyProfileContext(send) {
  const result = await evaluate(send, `({
    heading: document.querySelector('.assist-title h1')?.textContent?.trim() ?? '',
    footer: document.querySelector('.assist-footer')?.textContent?.trim() ?? '',
    back: document.querySelector('.assist-back')?.textContent?.trim() ?? '',
  })`);
  if (result?.heading !== 'Augusta') throw new Error(`Profile-aware Roll Assist heading mismatch: ${JSON.stringify(result?.heading)}.`);
  if (!result?.footer.includes('AUGUSTA_RECOMMENDED_V915') || !result.footer.includes('augusta-standard')) {
    throw new Error(`Profile-aware Roll Assist policy context missing: ${JSON.stringify(result?.footer)}.`);
  }
  if (result?.back !== '← Alpha') throw new Error(`Roll Assist back label mismatch: ${JSON.stringify(result?.back)}.`);
}

async function enterRoll(send, statName, value) {
  return evaluate(send, `
    (async () => {
      const stat = document.querySelector('#assist-stat');
      const valueSelect = document.querySelector('#assist-value');
      const enter = document.querySelector('#assist-enter');
      if (!stat || !valueSelect || !enter) throw new Error('Roll Assist entry controls are missing.');

      stat.value = ${JSON.stringify(statName)};
      stat.dispatchEvent(new Event('change', { bubbles: true }));
      const refreshedValue = document.querySelector('#assist-value');
      refreshedValue.value = ${JSON.stringify(String(value))};
      if (refreshedValue.value !== ${JSON.stringify(String(value))}) {
        throw new Error('Requested roll value is not available in the live selector.');
      }
      enter.click();

      await new Promise((resolve) => setTimeout(resolve, 700));
      return {
        command: document.querySelector('.assist-command')?.textContent?.trim() ?? null,
        error: document.body.textContent.includes('ROLL ASSIST ERROR'),
      };
    })()
  `);
}

function assertCommand(result, expected, label) {
  if (result?.error) throw new Error(`${label}: live UI surfaced ROLL ASSIST ERROR.`);
  if (result?.command !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(result?.command)}.`);
  }
}

const chrome = spawn(CHROME, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  `--remote-debugging-port=${DEBUG_PORT}`,
  '--remote-debugging-address=127.0.0.1',
  '--user-data-dir=/tmp/bellibing-live-chrome',
  'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });

let stderr = '';
chrome.stderr.on('data', (chunk) => { stderr += String(chunk); });

try {
  await waitForJsonVersion();
  const page = await createPage();
  if (!page.webSocketDebuggerUrl) throw new Error('Chrome page has no DevTools WebSocket URL.');
  const { socket, send } = cdp(page.webSocketDebuggerUrl);
  try {
    await send('Page.enable');
    await send('Runtime.enable');

    await verifyAlphaEntry(send);
    console.log('Alpha root verified in real Chrome: registry character/mode, 5 Echo slots, owned checkpoint verdict, five saved +25 Augusta Echoes, Personal Rotation DPS + ER gate, and profile-aware Roll Assist route.');

    await navigate(send, PROFILED_ROLL_ASSIST_URL);
    await verifyProfileContext(send);
    const lowCrit = await enterRoll(send, 'CRIT Rate', 0.063);
    assertCommand(lowCrit, 'DISCARD', '+5 CRIT Rate 6.3%');

    await navigate(send, PROFILED_ROLL_ASSIST_URL);
    const highCrit = await enterRoll(send, 'CRIT Rate', 0.093);
    assertCommand(highCrit, 'ROLL TO +10', '+5 CRIT Rate 9.3%');

    const highCritPlusDef = await enterRoll(send, 'Flat DEF', 40);
    assertCommand(highCritPlusDef, 'ROLL TO +15', '+10 CRIT Rate 9.3% + Flat DEF');

    await navigate(send, LIVE_URL);
    const directHeading = await evaluate(send, `document.querySelector('.assist-title h1')?.textContent?.trim() ?? ''`);
    if (directHeading !== 'Augusta') throw new Error(`Direct Roll Assist backward compatibility failed: ${JSON.stringify(directHeading)}.`);

    console.log('Live profile-aware Alpha + Roll Assist paths verified:');
    console.log('- Alpha owned +5 CRIT Rate 9.3% => ROLL TO +10');
    console.log('- Alpha five exact +25 Augusta Echoes => Personal Rotation DPS with ER PASS');
    console.log('- Augusta canonical route -> AUGUSTA_RECOMMENDED_V915');
    console.log('- +5 CRIT Rate 6.3% => DISCARD');
    console.log('- +5 CRIT Rate 9.3% => ROLL TO +10');
    console.log('- +10 CRIT Rate 9.3% + Flat DEF => ROLL TO +15');
    console.log('- direct /roll-assistant.html remains Augusta-compatible');
  } finally {
    socket.close();
  }
} catch (error) {
  if (stderr) console.error(stderr.slice(-4000));
  throw error;
} finally {
  chrome.kill('SIGTERM');
}
