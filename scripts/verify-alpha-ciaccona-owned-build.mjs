import { spawn } from 'node:child_process';

const ALPHA_URL = process.env.BELLIBING_ALPHA_URL ?? 'http://127.0.0.1:4173/';
const DEBUG_PORT = Number(process.env.ALPHA_CIACCONA_CHROME_DEBUG_PORT ?? 9444);
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

async function verifyCiacconaOwnedBuild(send) {
  await send('Page.navigate', { url: ALPHA_URL });
  await waitForLocation(send, ALPHA_URL);

  return evaluate(send, `
    (async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const deadline = Date.now() + 15000;
      while (Date.now() < deadline) {
        if (document.readyState === 'complete' && document.querySelector('#alpha-character')) break;
        await wait(100);
      }

      const character = document.querySelector('#alpha-character');
      if (!character) throw new Error('Alpha character control did not become ready.');
      character.value = 'ciaccona';
      if (character.value !== 'ciaccona') throw new Error('Ciaccona is not selectable in Alpha.');
      character.dispatchEvent(new Event('change', { bubbles: true }));
      await wait(80);

      const pageText = document.body.textContent.replace(/\\s+/g, ' ').trim();
      if (!pageText.includes('Tactical Hologram: Lorelei VI')) {
        throw new Error('Ciaccona owned-build benchmark context is not visible in Alpha.');
      }
      if (document.querySelector('#alpha-roll-assist')) {
        throw new Error('Ciaccona must not expose a Roll Assist route without a verified checkpoint policy.');
      }
      const policyPending = [...document.querySelectorAll('.alpha-roll-assist-disabled')]
        .some((node) => node.textContent.trim() === 'POLICY PENDING');
      if (!policyPending) throw new Error('Ciaccona Roll Assist policy-pending boundary is not visible.');

      const ownedToggle = document.querySelector('#alpha-owned-toggle');
      if (!ownedToggle || ownedToggle.textContent.trim() !== 'ENTER MY +25 ECHOES') {
        throw new Error('Ciaccona policy-independent +25 owned-build CTA is missing.');
      }
      ownedToggle.click();
      await wait(40);

      const panel = document.querySelector('.alpha-owned-panel');
      if (!panel || panel.dataset.ownedMode !== 'BUILD') {
        throw new Error('Ciaccona owned Echo panel did not enter BUILD mode.');
      }
      const level = document.querySelector('#alpha-owned-level');
      if (!level || level.value !== '25' || !level.disabled) {
        throw new Error('Ciaccona initial owned-build entry must be locked to complete +25 Echoes.');
      }

      const exactRolls = [
        ['CRIT Rate', '0.093'],
        ['CRIT DMG', '0.21'],
        ['ATK%', '0.116'],
        ['Energy Regen', '0.124'],
        ['Basic Attack DMG', '0.116'],
      ];
      const expectedMains = ['CRIT Rate', 'Aero DMG', 'Aero DMG', 'ATK%', 'ATK%'];

      async function addRoll(name, rollValue) {
        const stat = document.querySelector('#alpha-owned-stat');
        if (!stat) throw new Error('Owned Echo stat selector is missing.');
        stat.value = name;
        if (stat.value !== name) throw new Error('Requested exact substat is unavailable.');
        stat.dispatchEvent(new Event('change', { bubbles: true }));
        await wait(10);
        const value = document.querySelector('#alpha-owned-value');
        const add = document.querySelector('#alpha-owned-add');
        if (!value || !add) throw new Error('Owned Echo value/add controls are missing.');
        value.value = rollValue;
        if (value.value !== rollValue) throw new Error('Requested exact roll magnitude is unavailable.');
        add.click();
        await wait(25);
      }

      for (let slotIndex = 0; slotIndex < 5; slotIndex += 1) {
        const slot = document.querySelector('#alpha-owned-slot');
        if (!slot) throw new Error('Owned Echo slot selector disappeared.');
        slot.value = String(slotIndex);
        slot.dispatchEvent(new Event('change', { bubbles: true }));
        await wait(20);

        const primary = document.querySelector('#alpha-owned-primary');
        if (!primary) throw new Error('Canonical primary-main selector is missing.');
        primary.value = expectedMains[slotIndex];
        if (primary.value !== expectedMains[slotIndex]) {
          throw new Error('Expected canonical Ciaccona primary main stat is unavailable.');
        }
        primary.dispatchEvent(new Event('change', { bubbles: true }));
        await wait(20);

        for (const [name, rollValue] of exactRolls) await addRoll(name, rollValue);
        if (!document.querySelector('[data-owned-build-card="ready"]')) {
          throw new Error('Exact +25 Ciaccona card did not reach canonical ready state.');
        }
        const save = document.querySelector('#alpha-owned-save');
        if (!save) throw new Error('Exact +25 Ciaccona card did not expose save action.');
        save.click();
        await wait(30);
      }

      const analyze = document.querySelector('#alpha-analyze');
      if (!analyze) throw new Error('Analyze control is missing after Ciaccona build entry.');
      analyze.click();
      await wait(120);

      const result = document.querySelector('.alpha-result');
      if (!result) throw new Error('Ciaccona owned build did not produce an Alpha analysis result.');
      const resultText = result.textContent.replace(/\\s+/g, ' ').trim();
      if (!resultText.includes('PERSONAL ROTATION DPS') || !resultText.includes('ER') || !resultText.includes('PASS')) {
        throw new Error('Ciaccona owned-build result omitted finite Personal Rotation DPS or ER PASS.');
      }
      if (!resultText.includes('CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1')
        || !resultText.includes('Tactical Hologram: Lorelei VI')) {
        throw new Error('Ciaccona result omitted exact engine or reviewed combat-context identity.');
      }
      if (document.querySelector('#alpha-roll-assist')) {
        throw new Error('Ciaccona Roll Assist route became available after owned-build analysis.');
      }

      const compare = document.querySelector('#alpha-owned-toggle');
      if (!compare || compare.textContent.trim() !== 'COMPARE AN ECHO') {
        throw new Error('Five-Echo Ciaccona build did not unlock exact whole-build comparison.');
      }
      compare.click();
      await wait(40);
      if (document.querySelector('.alpha-owned-panel')?.dataset.ownedMode !== 'COMPARE') {
        throw new Error('Ciaccona owned-build panel did not enter COMPARE mode.');
      }

      for (const [name, rollValue] of exactRolls) await addRoll(name, rollValue);
      const comparison = document.querySelector('[data-upgrade-decision]');
      if (!comparison) throw new Error('Ciaccona +25 candidate did not produce a whole-build decision.');
      if (comparison.dataset.upgradeDecision !== 'DO_NOT_REPLACE') {
        throw new Error('Identical Ciaccona +25 candidate should not replace the incumbent.');
      }

      return {
        resultText,
        decision: comparison.dataset.upgradeDecision,
        policyPending,
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
  '--user-data-dir=/tmp/bellibing-alpha-ciaccona-chrome',
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
    const result = await verifyCiacconaOwnedBuild(send);
    console.log(`Ciaccona Alpha owned-build verified in real Chrome: ER/PERSONAL DPS live, +25=${result.decision}, Roll Assist policy pending.`);
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
