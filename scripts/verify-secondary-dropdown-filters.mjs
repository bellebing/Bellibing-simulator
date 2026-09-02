import { spawn } from 'node:child_process';

const BASE_URL = process.env.BELLIBING_SECONDARY_UI_BASE_URL
  ?? 'https://bellebing.github.io/Bellibing-simulator/';
const ECHO_LAB_URL = new URL('echo-lab.html', BASE_URL).href;
const ROLL_ASSIST_URL = new URL(
  'roll-assistant.html?character=augusta&preset=augusta-standard',
  BASE_URL,
).href;
const DEBUG_PORT = Number(process.env.CHROME_DEBUG_PORT ?? 9224);
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

async function navigate(send, url, readySelector) {
  await send('Page.navigate', { url });
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const ready = await evaluate(send, `document.readyState === 'complete' && Boolean(document.querySelector(${JSON.stringify(readySelector)}))`);
      if (ready) return;
    } catch {
      // Navigation can briefly invalidate the execution context.
    }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${url}.`);
}

function assertDropdownStyle(style, label) {
  if (!style) throw new Error(`${label}: missing computed style result.`);
  if (style.appearance !== 'none') {
    throw new Error(`${label}: expected appearance none, got ${JSON.stringify(style.appearance)}.`);
  }
  if (!String(style.backgroundImage).includes('linear-gradient')) {
    throw new Error(`${label}: shared chevron background is missing: ${JSON.stringify(style.backgroundImage)}.`);
  }
  if (style.cursor !== 'pointer') {
    throw new Error(`${label}: expected pointer cursor, got ${JSON.stringify(style.cursor)}.`);
  }
}

async function dropdownStyle(send, selector) {
  return evaluate(send, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    const style = getComputedStyle(element);
    return {
      appearance: style.appearance,
      backgroundImage: style.backgroundImage,
      cursor: style.cursor,
      colorScheme: style.colorScheme,
    };
  })()`);
}

async function verifyEchoLab(send) {
  await navigate(send, ECHO_LAB_URL, '#lab-main-stat');
  assertDropdownStyle(await dropdownStyle(send, '#lab-cost'), 'Echo Lab COST');
  assertDropdownStyle(await dropdownStyle(send, '#lab-main-stat'), 'Echo Lab Primary main');

  const dependency = await evaluate(send, `(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const cost = document.querySelector('#lab-cost');
    const main = document.querySelector('#lab-main-stat');
    if (!cost || !main) throw new Error('Echo Lab filter controls are missing.');

    const before = [...main.options].map((option) => option.value);
    cost.value = '1';
    cost.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(80);

    const nextCost = document.querySelector('#lab-cost');
    const nextMain = document.querySelector('#lab-main-stat');
    if (!nextCost || !nextMain) throw new Error('Echo Lab controls disappeared after COST change.');
    const after = [...nextMain.options].map((option) => option.value);
    return {
      cost: nextCost.value,
      selectedMain: nextMain.value,
      before,
      after,
      selectedIsAllowed: after.includes(nextMain.value),
    };
  })()`);

  if (dependency?.cost !== '1') throw new Error(`Echo Lab COST change did not persist: ${JSON.stringify(dependency?.cost)}.`);
  if (!dependency?.selectedIsAllowed) throw new Error('Echo Lab selected Primary main is not valid for the changed COST filter.');
  if (JSON.stringify(dependency.before) === JSON.stringify(dependency.after)) {
    throw new Error('Echo Lab COST filter did not change the Primary main option set.');
  }
}

async function verifyRollAssist(send) {
  await navigate(send, ROLL_ASSIST_URL, '#assist-stat');
  assertDropdownStyle(await dropdownStyle(send, '#assist-stat'), 'Roll Assist substat');
  assertDropdownStyle(await dropdownStyle(send, '#assist-value'), 'Roll Assist value');

  const dependency = await evaluate(send, `(() => {
    const stat = document.querySelector('#assist-stat');
    if (!stat) throw new Error('Roll Assist stat selector is missing.');

    function choose(name) {
      stat.value = name;
      if (stat.value !== name) throw new Error('Expected Roll Assist substat option is missing: ' + name);
      stat.dispatchEvent(new Event('change', { bubbles: true }));
      const value = document.querySelector('#assist-value');
      if (!value) throw new Error('Roll Assist value selector is missing.');
      return [...value.options].map((option) => option.value);
    }

    const critValues = choose('CRIT Rate');
    const flatDefValues = choose('Flat DEF');
    return { critValues, flatDefValues };
  })()`);

  if (!(dependency?.critValues?.length > 0) || !(dependency?.flatDefValues?.length > 0)) {
    throw new Error('Roll Assist dependent value dropdown has no options.');
  }
  if (JSON.stringify(dependency.critValues) === JSON.stringify(dependency.flatDefValues)) {
    throw new Error('Roll Assist substat change did not refresh the dependent roll-value options.');
  }
}

const chrome = spawn(CHROME, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  `--remote-debugging-port=${DEBUG_PORT}`,
  '--remote-debugging-address=127.0.0.1',
  '--user-data-dir=/tmp/bellibing-secondary-dropdown-chrome',
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
    await verifyEchoLab(send);
    await verifyRollAssist(send);
    console.log('Secondary template dropdown filters verified in real Chrome:');
    console.log('- Echo Lab COST + Primary main share the dropdown treatment and COST still filters valid main-stat options.');
    console.log('- Roll Assist substat + value share the dropdown treatment and substat still refreshes exact roll values.');
  } finally {
    socket.close();
  }
} catch (error) {
  if (stderr) console.error(stderr.slice(-4000));
  throw error;
} finally {
  chrome.kill('SIGTERM');
}
