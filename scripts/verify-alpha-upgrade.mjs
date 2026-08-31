import { spawn } from 'node:child_process';

const ALPHA_URL = process.env.BELLIBING_ALPHA_URL ?? 'http://127.0.0.1:4173/';
const DEBUG_PORT = Number(process.env.ALPHA_UPGRADE_CHROME_DEBUG_PORT ?? 9333);
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
      // Navigation can temporarily replace the execution context.
    }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for navigation to ${expectedPrefix}.`);
}

async function verifyUpgradeLoop(send) {
  await send('Page.navigate', { url: ALPHA_URL });
  await waitForLocation(send, ALPHA_URL);

  return evaluate(send, `
    (async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const deadline = Date.now() + 15000;
      while (Date.now() < deadline) {
        if (document.readyState === 'complete'
          && document.querySelector('#alpha-character')
          && document.querySelector('#alpha-owned-toggle')) break;
        await wait(100);
      }

      const character = document.querySelector('#alpha-character');
      if (!character) throw new Error('Alpha character control did not become ready.');
      character.value = 'augusta';
      character.dispatchEvent(new Event('change', { bubbles: true }));
      await wait(50);

      const ownedToggle = document.querySelector('#alpha-owned-toggle');
      if (!ownedToggle) throw new Error('Augusta owned Echo CTA is missing.');
      ownedToggle.click();
      await wait(30);

      const level = document.querySelector('#alpha-owned-level');
      if (!level) throw new Error('Owned Echo level control did not open.');
      level.value = '25';
      level.dispatchEvent(new Event('change', { bubbles: true }));
      await wait(30);

      const currentRolls = [
        ['CRIT Rate', '0.093'],
        ['CRIT DMG', '0.21'],
        ['ATK%', '0.116'],
        ['Energy Regen', '0.124'],
        ['Heavy Attack DMG', '0.116'],
      ];

      async function addRoll(name, rollValue) {
        const stat = document.querySelector('#alpha-owned-stat');
        if (!stat) throw new Error('Owned Echo stat selector is missing.');
        stat.value = name;
        if (stat.value !== name) throw new Error('Requested substat is unavailable.');
        stat.dispatchEvent(new Event('change', { bubbles: true }));
        await wait(10);
        const value = document.querySelector('#alpha-owned-value');
        const add = document.querySelector('#alpha-owned-add');
        if (!value || !add) throw new Error('Owned Echo value/add controls are missing.');
        value.value = rollValue;
        if (value.value !== rollValue) throw new Error('Requested exact roll value is unavailable.');
        add.click();
        await wait(25);
      }

      for (let slotIndex = 0; slotIndex < 5; slotIndex += 1) {
        const slot = document.querySelector('#alpha-owned-slot');
        if (!slot) throw new Error('Owned Echo slot selector is missing during build entry.');
        slot.value = String(slotIndex);
        slot.dispatchEvent(new Event('change', { bubbles: true }));
        await wait(15);
        const currentLevel = document.querySelector('#alpha-owned-level');
        if (!currentLevel) throw new Error('Owned Echo level selector disappeared.');
        currentLevel.value = '25';
        currentLevel.dispatchEvent(new Event('change', { bubbles: true }));
        await wait(15);
        for (const [name, rollValue] of currentRolls) await addRoll(name, rollValue);
        const save = document.querySelector('#alpha-owned-save');
        if (!save) throw new Error('Completed +25 Echo did not expose save action.');
        save.click();
        await wait(25);
      }

      const compareButton = document.querySelector('#alpha-owned-toggle');
      if (!compareButton || compareButton.textContent.trim() !== 'COMPARE AN ECHO') {
        throw new Error('Five-Echo current build did not unlock COMPARE AN ECHO.');
      }
      compareButton.click();
      await wait(30);
      if (document.querySelector('.alpha-owned-panel')?.dataset.ownedMode !== 'COMPARE') {
        throw new Error('Owned Echo panel did not enter whole-build comparison mode.');
      }

      const worseCandidate = [
        ['CRIT Rate', '0.063'],
        ['CRIT DMG', '0.15'],
        ['ATK%', '0.064'],
        ['Energy Regen', '0.092'],
        ['Flat DEF', '40'],
      ];
      for (const [name, rollValue] of worseCandidate) await addRoll(name, rollValue);
      await wait(80);

      const finished = document.querySelector('[data-upgrade-decision]');
      if (!finished) throw new Error('Finished candidate did not produce a whole-build decision.');
      const finishedText = finished.textContent.replace(/\\s+/g, ' ').trim();
      if (finished.dataset.upgradeDecision !== 'DO_NOT_REPLACE') {
        throw new Error('Known weaker +25 candidate was not rejected.');
      }
      if (!finishedText.includes('CURRENT') || !finishedText.includes('WITH THIS ECHO') || !finishedText.includes('DPS')) {
        throw new Error('Finished comparison omitted the current/candidate DPS decision surface.');
      }

      document.querySelector('#alpha-owned-reset')?.click();
      await wait(20);
      const partialLevel = document.querySelector('#alpha-owned-level');
      if (!partialLevel) throw new Error('Candidate level selector disappeared after reset.');
      partialLevel.value = '20';
      partialLevel.dispatchEvent(new Event('change', { bubbles: true }));
      await wait(20);

      const partialRolls = [
        ['CRIT Rate', '0.093'],
        ['CRIT DMG', '0.21'],
        ['ATK%', '0.116'],
        ['Energy Regen', '0.124'],
      ];
      for (const [name, rollValue] of partialRolls) await addRoll(name, rollValue);

      const forecastDeadline = Date.now() + 10000;
      while (Date.now() < forecastDeadline && !document.querySelector('[data-upgrade-action]')) await wait(50);
      const partial = document.querySelector('[data-upgrade-action]');
      if (!partial) throw new Error('Partial candidate did not produce a future-roll forecast.');
      const allowed = new Set(['ROLL', 'STOP_RECYCLE', 'TRADEOFF', 'PENDING']);
      if (!allowed.has(partial.dataset.upgradeAction)) throw new Error('Partial candidate returned an unknown action.');
      const partialText = partial.textContent.replace(/\\s+/g, ' ').trim();
      if (!partialText.includes('Chance to beat current Echo')
        || !partialText.includes('Tuners')
        || !partialText.includes('Shell Credits')) {
        throw new Error('Partial forecast omitted upgrade probability or tracked rolling resources.');
      }

      return {
        finishedDecision: finished.dataset.upgradeDecision,
        partialAction: partial.dataset.upgradeAction,
        partialText,
      };
    })()
  `);
}

const chrome = spawn(CHROME, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  `--remote-debugging-port=${DEBUG_PORT}`,
  '--remote-debugging-address=127.0.0.1',
  '--user-data-dir=/tmp/bellibing-alpha-upgrade-chrome',
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
    const result = await verifyUpgradeLoop(send);
    console.log(`Alpha upgrade loop verified in real Chrome: +25=${result.finishedDecision}, partial=${result.partialAction}.`);
  } finally {
    socket.close();
  }
} catch (error) {
  console.error(error);
  if (stderr.trim()) console.error(stderr.trim());
  process.exitCode = 1;
} finally {
  chrome.kill('SIGTERM');
}
