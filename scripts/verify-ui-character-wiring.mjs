import { mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

const UI_URL = process.env.BELLIBING_UI_PREVIEW_URL ?? 'http://127.0.0.1:4173/ui-preview/';
const DEBUG_PORT = Number(process.env.BELLIBING_UI_CHROME_DEBUG_PORT ?? 9336);
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
  const response = await fetch(
    `http://127.0.0.1:${DEBUG_PORT}/json/new?${encodeURIComponent('about:blank')}`,
    { method: 'PUT' },
  );
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
      // Navigation can replace the execution context briefly.
    }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for navigation to ${expectedPrefix}.`);
}

async function verifyCharacterWiring(send) {
  await send('Page.navigate', { url: UI_URL });
  await waitForLocation(send, UI_URL);

  return evaluate(send, `
    (async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const deadline = Date.now() + 15000;
      while (Date.now() < deadline && document.body?.dataset.uiReady !== 'true') {
        if (document.body?.dataset.uiReady === 'error') {
          throw new Error('New UI reported manifest initialization failure.');
        }
        await wait(100);
      }
      if (document.body?.dataset.uiReady !== 'true') {
        throw new Error('New UI did not become ready.');
      }

      const buildCard = document.querySelector('.home-card.card-build');
      if (!buildCard) throw new Error('Build a Character Home card is missing.');
      buildCard.click();
      await wait(80);
      buildCard.click();
      await wait(700);

      if (!document.querySelector('#build.page.active')) {
        throw new Error('Build page did not become active.');
      }

      const choices = [...document.querySelectorAll('#buildWheel .choice')];
      if (choices.length !== 7) throw new Error('Expected 7 Character choices, found ' + choices.length + '.');
      if (choices.some((choice) => choice.textContent.includes('TEMP'))) {
        throw new Error('Legacy TEMP selector copy is still visible.');
      }

      const augusta = document.querySelector('#buildWheel .choice[data-character-id="augusta"]');
      if (!augusta) throw new Error('Augusta selector card is missing.');
      const portrait = augusta.querySelector('.choice-art');
      const selectorElement = augusta.querySelector('.choice-element');
      if (!portrait?.complete || portrait.naturalWidth <= 0) throw new Error('Augusta selector portrait did not load.');
      if (!selectorElement?.complete || selectorElement.naturalWidth <= 0) throw new Error('Augusta selector element icon did not load.');
      if (!selectorElement.src.endsWith('/assets/builder-icons/elements/electro.webp')) {
        throw new Error('Augusta selector element is not Electro: ' + selectorElement.src);
      }

      augusta.click();
      await wait(1050);

      const shell = document.querySelector('#buildShell');
      if (!shell?.classList.contains('has-selection')) throw new Error('Augusta selection did not enter build state.');
      if (document.querySelector('#buildName')?.textContent.trim() !== 'Augusta') {
        throw new Error('Selected Character name did not become Augusta.');
      }

      const focusElement = document.querySelector('#buildElement');
      if (!focusElement?.classList.contains('visible') || !focusElement.src.endsWith('/assets/builder-icons/elements/electro.webp')) {
        throw new Error('Build focus element identity is not wired to Electro.');
      }
      if (!focusElement.complete || focusElement.naturalWidth <= 0) throw new Error('Build focus element icon did not load.');

      const nodes = [...document.querySelectorAll('.seq-line .node')];
      if (nodes.length !== 6) throw new Error('Expected six Sequence nodes, found ' + nodes.length + '.');
      for (const node of nodes) {
        if (!node.classList.contains('has-art')) throw new Error(node.textContent + ' lacks Sequence artwork.');
        const sequence = Number(node.dataset.sequence);
        const background = getComputedStyle(node).backgroundImage;
        if (!background.includes('/assets/builder-icons/chains/augusta/s' + sequence + '.webp')) {
          throw new Error('S' + sequence + ' points at unexpected background: ' + background);
        }
        const match = background.match(/url\\(["']?(.*?)["']?\\)/);
        if (!match?.[1]) throw new Error('S' + sequence + ' background URL could not be parsed.');
        const probe = new Image();
        probe.src = match[1];
        await new Promise((resolve, reject) => {
          probe.onload = resolve;
          probe.onerror = () => reject(new Error('S' + sequence + ' image failed to load.'));
        });
      }

      return {
        choices: choices.length,
        selected: document.querySelector('#buildName')?.textContent.trim(),
        element: focusElement.alt,
        sequences: nodes.length,
        compactWidth: Math.round(augusta.getBoundingClientRect().width),
      };
    })()
  `);
}

const chrome = spawn(CHROME, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--hide-scrollbars',
  '--window-size=1440,900',
  `--remote-debugging-port=${DEBUG_PORT}`,
  '--remote-debugging-address=127.0.0.1',
  '--user-data-dir=/tmp/bellibing-ui-character-chrome',
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
    const result = await verifyCharacterWiring(send);
    const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    mkdirSync('artifacts', { recursive: true });
    writeFileSync('artifacts/ui-preview-character-identity-1440x900.png', Buffer.from(shot.data, 'base64'));
    console.log(
      `New UI Character identity verified in real Chrome: ${result.choices} choices, `
      + `${result.selected} / ${result.element}, ${result.sequences} Sequence nodes, `
      + `compact width ${result.compactWidth}px.`,
    );
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
