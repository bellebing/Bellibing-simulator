import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const LAB_URL = process.env.BELLIBING_CAROUSEL_LAB_URL
  ?? 'http://127.0.0.1:4173/ui-preview/carousel-motion-lab.html';
const DEBUG_PORT = Number(process.env.CAROUSEL_LAB_CHROME_DEBUG_PORT ?? 9555);
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
      // Navigation can replace the execution context.
    }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for navigation to ${expectedPrefix}.`);
}

async function openCharacterLab(send) {
  await send('Page.navigate', { url: LAB_URL });
  await waitForLocation(send, LAB_URL);
  const state = await evaluate(send, `
    (async () => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const deadline = Date.now() + 15000;
      while (Date.now() < deadline) {
        const tab = document.querySelector('[data-tab="characterLab"]');
        if (document.readyState === 'complete' && tab) {
          tab.click();
          if (document.querySelectorAll('#characterViewport .character-card').length === 57) break;
        }
        await wait(100);
      }
      const cards = [...document.querySelectorAll('#characterViewport .character-card')];
      const names = cards.map((card) => card.getAttribute('aria-label'));
      const images = cards.map((card) => card.querySelector('img'));
      const placements = cards.map((card) => {
        const name = card.querySelector('.character-name').getBoundingClientRect();
        const portrait = card.querySelector('.character-portrait').getBoundingClientRect();
        return { nameBottom: name.bottom, portraitTop: portrait.top };
      });
      return {
        count: cards.length,
        loaded: images.filter((image) => image?.complete && image.naturalWidth > 0).length,
        names,
        namesAbovePortrait: placements.every((entry) => entry.nameBottom <= entry.portraitTop + 0.5),
        noHeaderWrap: cards.every((card) => {
          const name = card.querySelector('.character-name');
          return name.scrollWidth <= name.clientWidth + 1;
        }),
        objectPosition: images[0] ? getComputedStyle(images[0]).objectPosition : null,
        status: document.querySelector('#characterLab [data-status]')?.textContent?.trim() ?? '',
        bounds: document.querySelector('#characterViewport')?.getBoundingClientRect()?.toJSON?.() ?? null,
      };
    })()
  `);

  if (state.count !== 57) throw new Error(`Expected 57 released Character cards, got ${state.count}.`);
  if (state.loaded !== 57) throw new Error(`Expected 57 loaded Character portraits, got ${state.loaded}.`);
  if (!state.namesAbovePortrait) throw new Error('At least one Character name is not header-first above its portrait area.');
  if (!state.noHeaderWrap) throw new Error('At least one Character name wraps/overflows the one-line header contract.');
  if (state.objectPosition !== '50% 43%') throw new Error(`Portrait focal baseline drifted: ${JSON.stringify(state.objectPosition)}.`);
  for (const forbidden of ['Jingran', 'Hsin', 'Suoming']) {
    if (state.names.includes(forbidden)) throw new Error(`${forbidden} must not appear in the released Build selector.`);
  }
  for (const rover of ['Rover (Aero)', 'Rover (Electro)', 'Rover (Havoc)', 'Rover (Spectro)']) {
    if (!state.names.includes(rover)) throw new Error(`Missing released Rover selector card: ${rover}.`);
  }
  return state;
}

function focusNumber(status) {
  const match = String(status).match(/fokus\s+(\d+)\/(\d+)/);
  if (!match) throw new Error(`Unexpected carousel status: ${JSON.stringify(status)}.`);
  return { index: Number(match[1]), total: Number(match[2]) };
}

async function dragMultipleCards(send, bounds, initialStatus) {
  const y = bounds.y + bounds.height * 0.5;
  const startX = bounds.x + bounds.width * 0.76;
  const endX = bounds.x + bounds.width * 0.10;
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: startX, y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: startX, y, button: 'left', clickCount: 1 });
  for (let step = 1; step <= 12; step += 1) {
    const x = startX + (endX - startX) * (step / 12);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'left', buttons: 1 });
    await sleep(12);
  }
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: endX, y, button: 'left', clickCount: 1 });
  await sleep(850);

  const finalStatus = await evaluate(send, `document.querySelector('#characterLab [data-status]')?.textContent?.trim() ?? ''`);
  const before = focusNumber(initialStatus);
  const after = focusNumber(finalStatus);
  if (before.total !== 57 || after.total !== 57) throw new Error('Carousel total changed during drag.');
  if (after.index - before.index < 2) {
    throw new Error(`Expected multi-card drag to advance at least 2 cards, got ${before.index} -> ${after.index}.`);
  }
  return finalStatus;
}

async function activateFocused(send) {
  const result = await evaluate(send, `
    (() => {
      const status = document.querySelector('#characterLab [data-status]')?.textContent?.trim() ?? '';
      const match = status.match(/fokus\\s+(\\d+)\\/(\\d+)/);
      if (!match) throw new Error('Cannot parse current focus.');
      const index = Number(match[1]) - 1;
      const card = document.querySelectorAll('#characterViewport .character-card')[index];
      if (!card) throw new Error('Focused card is missing.');
      card.click();
      return card.getAttribute('aria-label');
    })()
  `);
  await sleep(100);
  const selected = await evaluate(send, `({
    count: document.querySelectorAll('#characterViewport .character-card.selected').length,
    label: document.querySelector('#characterViewport .character-card.selected')?.getAttribute('aria-label') ?? null
  })`);
  if (selected.count !== 1 || selected.label !== result) {
    throw new Error(`Centered-card activation failed: ${JSON.stringify(selected)}.`);
  }
  return result;
}

async function screenshot(send, path) {
  mkdirSync('artifacts', { recursive: true });
  const capture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync(path, Buffer.from(capture.data, 'base64'));
}

async function verifyViewport(send, width, height, screenshotPath) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 768,
  });
  const state = await openCharacterLab(send);
  const afterDrag = await dragMultipleCards(send, state.bounds, state.status);
  const selected = await activateFocused(send);
  await screenshot(send, screenshotPath);
  return { width, height, before: state.status, afterDrag, selected };
}

const chrome = spawn(CHROME, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  `--remote-debugging-port=${DEBUG_PORT}`,
  '--remote-debugging-address=127.0.0.1',
  '--user-data-dir=/tmp/bellibing-carousel-lab-chrome',
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
    await send('Emulation.enable');

    const desktop = await verifyViewport(send, 1440, 900, 'artifacts/carousel-motion-lab-1440x900.png');
    const mobile = await verifyViewport(send, 390, 844, 'artifacts/carousel-motion-lab-390x844.png');

    console.log('Carousel Motion Lab verified in real Chrome:');
    console.log('- 57 released Character cards / 57 loaded portraits');
    console.log('- names remain one-line header-first above portrait area');
    console.log('- portrait focal baseline = 50% 43%');
    console.log('- Jingran/Hsin/Suoming excluded; four released Rover cards included');
    console.log(`- desktop multi-card drag: ${desktop.before} -> ${desktop.afterDrag}; selected ${desktop.selected}`);
    console.log(`- mobile multi-card drag: ${mobile.before} -> ${mobile.afterDrag}; selected ${mobile.selected}`);
  } finally {
    socket.close();
  }
} catch (error) {
  console.error(error);
  if (stderr.trim()) console.error(stderr.slice(-4000));
  process.exitCode = 1;
} finally {
  chrome.kill('SIGTERM');
}
