// Development-only host. Reuses the integrated build and preview; no account writes.
import {createServer, request} from 'node:http';
import {spawn} from 'node:child_process';
import {watch} from 'node:fs';
import {mkdir, readFile, writeFile, readdir, stat, cp, rm} from 'node:fs/promises';
import {resolve, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes, createHash} from 'node:crypto';
import {startPreview} from './preview-simulator-v1.mjs';
import {findNpmCli} from './start-bellibing-local.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'artifacts/windows-local');
const base = 'http://127.0.0.1:8765';
const identity = 'bellibing-windows-local-v1';
const args = process.argv.slice(2);
if (args.some(arg => !['--stop', '--no-open'].includes(arg))) throw Error('Use --stop or --no-open.');
const token = randomBytes(32).toString('hex');
let ready = false, failure = null, revision = '', preview, building = false, pending = false;
let stopping = false, watcher, timer, buildChild;
const roots = new Set(['src', 'web', 'docs', 'data', 'scripts', 'art']);
function sourcePath(path) {
  const parts = path.replaceAll('\\', '/').split('/');
  if (parts.some(part => ['node_modules', '.git', '.venv', '__pycache__', 'artifacts', 'dist', 'tessdata'].includes(part))) return false;
  if (parts[0] === 'data' && parts[1] === 'generated') return false;
  return roots.has(parts[0]) || parts.length === 1 && /^(package(?:-lock)?\.json|tsconfig.*\.json)$/.test(parts[0]);
}
async function fingerprint() {
  const hash = createHash('sha256');
  async function visit(directory) {
    for (const entry of (await readdir(directory, {withFileTypes: true})).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(directory, entry.name), name = relative(root, path);
      if (!sourcePath(name) || entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) {
        const info = await stat(path);
        hash.update(JSON.stringify([name, info.size, info.mtimeMs]));
      }
    }
  }
  await visit(root);
  return hash.digest('hex');
}
async function status() {
  try {
    const response = await fetch(base + '/__bellibing_local/status', {signal: AbortSignal.timeout(1500)});
    return response.ok ? await response.json() : null;
  } catch { return null; }
}
async function openBrowser() {
  const child = spawn('rundll32.exe', ['url.dll,FileProtocolHandler', base + '/build/'], {windowsHide: true, detached: true, stdio: 'ignore'});
  await new Promise((ok, fail) => { child.once('spawn', ok); child.once('error', fail); });
  child.unref();
}
async function reuseExisting(existing) {
  if (existing?.identity !== identity || existing.root !== root) throw Error('Port 8765 is already used by another server. Stop that server first.');
  console.log('Bellibing is already running; reusing the existing server.');
  for (let attempt = 0; attempt < 600; attempt++) {
    const current = await status();
    if (!current || current.pid !== existing.pid) throw Error('The existing Bellibing startup stopped. See artifacts/windows-local/start-*.log.');
    if (current.failure && !current.ready) throw Error(current.failure);
    if (current.ready) { if (!args.includes('--no-open')) await openBrowser(); return; }
    await new Promise(ok => setTimeout(ok, 1000));
  }
  throw Error('Bellibing startup timed out. See artifacts/windows-local/start-*.log.');
}
const reloadScript = () => `<script>(()=>{const version=${JSON.stringify(revision)};setInterval(async()=>{try{const r=await fetch('/__bellibing_local/status',{cache:'no-store'});if(!r.ok)return;const s=await r.json();if(s.ready&&!s.building&&version!==s.revision)location.reload();}catch{}},1000)})();</script>`;
function json(res, code, value) {
  res.writeHead(code, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
  res.end(JSON.stringify(value));
}
async function stop() {
  if (stopping) return;
  stopping = true; clearTimeout(timer); watcher?.close();
  // Kill only the build tree started by this launcher, never other Node servers.
  if (buildChild?.pid) await new Promise(ok => {
    const kill = spawn('taskkill.exe', ['/PID', String(buildChild.pid), '/T', '/F'], {windowsHide: true, stdio: 'ignore'});
    kill.once('error', ok); kill.once('exit', ok);
  });
  preview?.closeAllConnections(); preview?.close();
  server.closeAllConnections(); server.close();
  await rm(join(output, 'server.json'), {force: true});
}
const server = createServer((req, res) => {
  if (!['127.0.0.1:8765', 'localhost:8765'].includes(req.headers.host)) { res.writeHead(403).end(); return; }
  if (req.url === '/__bellibing_local/status' && req.method === 'GET') {
    json(res, 200, {identity, root, pid: process.pid, ready, building, failure, revision}); return;
  }
  if (req.url === '/__bellibing_local/stop') {
    if (req.method !== 'POST' || req.headers['x-bellibing-token'] !== token || req.headers.origin) { res.writeHead(403).end(); return; }
    json(res, 200, {stopped: true}); void stop(); return;
  }
  if (!ready) { res.writeHead(503, {'Content-Type': 'text/plain; charset=utf-8'}).end(failure || 'Bellibing is building. Please wait.'); return; }
  // Keep the last successful site available while the existing build replaces dist.
  const upstream = request({host: '127.0.0.1', port: preview.address().port, path: req.url, method: req.method,
    headers: {...req.headers, host: `127.0.0.1:${preview.address().port}`}}, response => {
    const html = req.method === 'GET' && response.headers['content-type']?.includes('text/html');
    if (!html) { res.writeHead(response.statusCode, response.headers); response.pipe(res); return; }
    const chunks = [];
    response.on('data', chunk => chunks.push(chunk));
    response.on('end', () => {
      const headers = {...response.headers}; delete headers['content-length'];
      res.writeHead(response.statusCode, headers);
      res.end(Buffer.concat(chunks).toString('utf8').replace('</body>', reloadScript() + '</body>'));
    });
  });
  upstream.on('error', () => { if (!res.headersSent) res.writeHead(503); res.end('Local preview unavailable.'); });
  req.pipe(upstream);
});
async function build() {
  if (stopping) return;
  if (building) { pending = true; return; }
  building = true; failure = null;
  try {
    const before = await fingerprint();
    console.log('Building integrated Bellibing with npm run build...');
    const code = await new Promise((ok, fail) => {
      buildChild = spawn(process.execPath, [findNpmCli(), 'run', 'build'], {cwd: root, windowsHide: true, stdio: 'inherit'});
      buildChild.once('error', fail); buildChild.once('exit', ok);
    });
    buildChild = null;
    if (stopping) return;
    if (code !== 0) throw Error('Build failed. See artifacts/windows-local/start-*.log. Fix the source and save to retry.');
    const site = join(output, ready && preview.localSlot === 'a' ? 'b' : 'a');
    await rm(site, {recursive: true, force: true});
    await cp(join(root, 'dist'), site, {recursive: true});
    if (stopping) return;
    const next = await startPreview({directory: site, port: 0});
    if (stopping) { next.close(); return; }
    next.localSlot = site.endsWith('a') ? 'a' : 'b';
    const previous = preview; preview = next;
    previous?.closeAllConnections(); previous?.close();
    revision = randomBytes(12).toString('hex'); ready = true;
    await writeFile(join(output, 'build-inputs.json'), JSON.stringify({fingerprint: before, slot: next.localSlot}));
    console.log(`READY ${base}/build/ — watching source. Stop with STOP_BELLIBING_LOCAL.cmd.`);
    if (before !== await fingerprint()) pending = true;
  } catch (error) {
    failure = error.message;
    console.error(failure);
    if (!ready) throw error;
    console.error('The last successful build stays available. Waiting for the next source save.');
    // Visible Windows notification, outside the actual product UI.
    spawn('powershell.exe', ['-NoProfile', '-Command', "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Bellibing kunde inte byggas om. Senaste fungerande version behålls. Se artifacts/windows-local/start-*.log.','Bellibing Simulator – byggfel')"], {windowsHide: true, stdio: 'ignore'}).on('error', () => {});
  } finally {
    building = false;
    if (pending && !stopping) { pending = false; clearTimeout(timer); timer = setTimeout(() => void build().catch(fatal), 700); }
  }
}
async function fatal(error) {
  console.error('Bellibing startup failed: ' + error.message);
  await stop(); process.exitCode = 1;
}
async function main() {
  const existing = await status();
  if (args.includes('--stop')) {
    if (!existing) { console.log('Bellibing is already stopped.'); return; }
    if (existing.identity !== identity || existing.root !== root) throw Error('Port 8765 belongs to another server; it was not stopped.');
    const saved = JSON.parse(await readFile(join(output, 'server.json'), 'utf8'));
    if (saved.pid !== existing.pid) throw Error('Server identity changed; nothing was stopped.');
    const response = await fetch(base + '/__bellibing_local/stop', {method: 'POST', headers: {'X-Bellibing-Token': saved.token}, signal: AbortSignal.timeout(5000)});
    if (!response.ok) throw Error('The local server could not be stopped.');
    console.log('Bellibing stopped. Browser account data is unchanged.'); return;
  }
  if (existing) { await reuseExisting(existing); return; }
  // Reserve the public port before building. Simultaneous clicks cannot build twice.
  try { await new Promise((ok, fail) => { server.once('error', fail); server.listen(8765, '127.0.0.1', ok); }); }
  catch (error) {
    if (error.code === 'EADDRINUSE') { await reuseExisting(await status()); return; }
    throw error;
  }
  await mkdir(output, {recursive: true});
  await writeFile(join(output, 'server.json'), JSON.stringify({pid: process.pid, token}));
  process.once('SIGINT', () => void stop()); process.once('SIGTERM', () => void stop());
  watcher = watch(root, {recursive: true}, (_event, filename) => {
    if (!filename || !sourcePath(String(filename))) return;
    clearTimeout(timer); timer = setTimeout(() => void build().catch(fatal), 700);
  });
  watcher.on('error', error => void fatal(error));
  let cached;
  try { cached = JSON.parse(await readFile(join(output, 'build-inputs.json'), 'utf8')); } catch {}
  if (cached && ['a', 'b'].includes(cached.slot) && cached.fingerprint === await fingerprint()) {
    try {
      preview = await startPreview({directory: join(output, cached.slot), port: 0});
      preview.localSlot = cached.slot; ready = true; revision = randomBytes(12).toString('hex');
      console.log(`READY ${base}/build/ — reusing current build; watching source.`);
    } catch { /* Incomplete cached output is rebuilt below. */ }
  }
  if (!ready) await build();
  if (!args.includes('--no-open') && !stopping) await openBrowser();
}
main().catch(async error => {
  // A second invocation must never clean up or stop the first invocation.
  if (server.listening) await fatal(error);
  else { console.error('Bellibing startup failed: ' + error.message); process.exitCode = 1; }
});
