import { spawn } from 'node:child_process';

const LIVE_URL = process.env.BELLIBING_LIVE_ROLL_ASSIST_URL
  ?? 'https://bellebing.github.io/Bellibing-simulator/roll-assistant.html';
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

async function navigate(send) {
  await send('Page.navigate', { url: LIVE_URL });
  const result = await evaluate(send, `
    (async () => {
      const deadline = Date.now() + 15000;
      while (Date.now() < deadline) {
        if (document.querySelector('#assist-stat') && document.querySelector('#assist-enter')) return true;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new Error('Roll Assist controls did not become ready.');
    })()
  `);
  if (result !== true) throw new Error('Roll Assist controls did not become ready.');
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
        body: document.body.textContent,
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

    await navigate(send);
    const lowCrit = await enterRoll(send, 'CRIT Rate', 0.063);
    assertCommand(lowCrit, 'DISCARD', '+5 CRIT Rate 6.3%');

    await navigate(send);
    const highCrit = await enterRoll(send, 'CRIT Rate', 0.093);
    assertCommand(highCrit, 'ROLL TO +10', '+5 CRIT Rate 9.3%');

    const highCritPlusDef = await enterRoll(send, 'Flat DEF', 40);
    assertCommand(highCritPlusDef, 'ROLL TO +15', '+10 CRIT Rate 9.3% + Flat DEF');

    console.log('Live Roll Assist verdict paths verified:');
    console.log('- +5 CRIT Rate 6.3% => DISCARD');
    console.log('- +5 CRIT Rate 9.3% => ROLL TO +10');
    console.log('- +10 CRIT Rate 9.3% + Flat DEF => ROLL TO +15');
  } finally {
    socket.close();
  }
} catch (error) {
  if (stderr) console.error(stderr.slice(-4000));
  throw error;
} finally {
  chrome.kill('SIGTERM');
}
