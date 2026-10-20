// Local orchestration only. Never writes private bytes into the public build.
import {existsSync, readFileSync, realpathSync, mkdirSync, writeFileSync, rmSync, cpSync, openSync, closeSync} from 'node:fs';
import {resolve, dirname, join, delimiter} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {execFileSync, spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {isInside} from './local-paths.mjs';
import {startPreview} from './preview-simulator-v1.mjs';

export const publicRoot = fileURLToPath(new URL('../', import.meta.url));
export function parseOptions(args) {
  const options = {engineDirectory: resolve(publicRoot, '../Bellibing-engine-private'), port: 8767, open: true};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (key === '--no-open') options.open = false;
    else if (key === '--engine-directory' && args[i + 1]) options.engineDirectory = resolve(args[++i]);
    else if (key === '--port' && args[i + 1]) options.port = Number(args[++i]);
    else throw Error('Använd --engine-directory SÖKVÄG, --port NUMMER eller --no-open.');
  }
  if (!Number.isInteger(options.port) || options.port < 1024 || options.port > 65535) throw Error('Porten måste vara 1024–65535.');
  return options;
}

// Run npm's JS entry with Node: no cmd.exe command-string quoting or .cmd spawn.
export function findNpmCli(env = process.env) {
  const candidates = [join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js')];
  for (const directory of (env.PATH ?? env.Path ?? '').split(delimiter)) {
    for (const name of ['npm.cmd', 'npm']) {
      const executable = join(directory.replace(/^"|"$/g, ''), name);
      if (!existsSync(executable)) continue;
      const actual = realpathSync(executable);
      candidates.push(actual, join(dirname(actual), 'node_modules/npm/bin/npm-cli.js'));
    }
  }
  for (const candidate of candidates) {
    if (!candidate.endsWith('npm-cli.js') || !existsSync(candidate)) continue;
    const manifest = resolve(candidate, '../../package.json');
    if (existsSync(manifest) && JSON.parse(readFileSync(manifest)).name === 'npm') return candidate;
  }
  throw Error('npm saknas. Installera Node.js LTS med npm och starta igen.');
}

function requireProgram(program, help) {
  try { execFileSync(program, ['--version'], {stdio: 'pipe'}); }
  catch { throw Error(`${program} saknas. ${help}`); }
}
export function localGitEnvironment(env = process.env) {
  const count = Number(env.GIT_CONFIG_COUNT ?? 0);
  if (!Number.isInteger(count) || count < 0) throw Error('Ogiltig Git-konfiguration.');
  return {...env, GIT_CONFIG_COUNT: String(count + 1), [`GIT_CONFIG_KEY_${count}`]: 'core.autocrlf', [`GIT_CONFIG_VALUE_${count}`]: 'false'};
}
export function ensureCanonicalRevision(repository, sourceRepository, pin, env = localGitEnvironment()) {
  if (!/^[a-f0-9]{40}$/.test(pin)) throw Error('Ogiltig kanonisk källrevision.');
  try { execFileSync('git', ['cat-file', '-e', pin + '^{commit}'], {cwd: repository, env, stdio: 'pipe'}); }
  catch {
    // Shallow clones lack old objects. Reuse the already verified PUBLIC source
    // cache; fetch adds Git objects only, never changes the checkout or its pin.
    run('Hämtar det låsta revisionsobjektet', 'git', ['fetch', '--no-tags', '--depth=1', sourceRepository, pin], repository, env);
  }
}
function run(step, executable, args, cwd, env) {
  console.log(`\n${step}…`);
  try { execFileSync(executable, args, {cwd, env, stdio: 'inherit'}); }
  catch { throw Error(`${step} misslyckades. Läs felet ovan, rätta det och starta igen. Inget publicerades.`); }
}
function assertIgnored(repository, file, env) {
  try { execFileSync('git', ['check-ignore', '--', file], {cwd: repository, env, stdio: 'pipe'}); }
  catch { throw Error('Lokal utdata måste vara ignorerad av Git. Staging avbröts.'); }
}
function acquireLock(file) {
  if (existsSync(file)) {
    const pid = Number(readFileSync(file, 'utf8'));
    if (!Number.isInteger(pid) || pid < 1) throw Error('Ogiltig lokal låsfil. Kontrollera att ingen körning pågår innan låsfilen tas bort.');
    try { process.kill(pid, 0); throw Error('Bellibing körs redan. Stoppa det gamla startfönstret först.'); }
    catch (error) { if (error.code !== 'ESRCH') throw error; }
    rmSync(file);
  }
  const fd = openSync(file, 'wx');
  try { writeFileSync(fd, String(process.pid)); } finally { closeSync(fd); }
  return () => rmSync(file, {force: true});
}
async function openBrowser(url) {
  const program = process.platform === 'win32' ? 'rundll32.exe' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['url.dll,FileProtocolHandler', url] : [url];
  const child = spawn(program, args, {stdio: 'ignore', detached: true});
  await new Promise((ok, bad) => { child.once('spawn', ok); child.once('error', bad); });
  child.unref();
}

export async function startLocal(options) {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 16)) throw Error('Node.js 22.16 eller senare krävs. Installera aktuell LTS från nodejs.org.');
  requireProgram('git', 'Installera Git for Windows från git-scm.com.');
  const npm = findNpmCli(), env = {...localGitEnvironment(), BELLIBING_BROWSER_BUILD: '.simulator-output/browser-beta'};
  let engine;
  try { engine = realpathSync(options.engineDirectory); }
  catch { throw Error('Bellibing-engine-private saknas bredvid Bellibing-simulator. Klona den privata repositoryn eller ange --engine-directory SÖKVÄG.'); }
  if (!existsSync(join(engine, 'scripts/browser-beta/stage-review.mjs')) || !existsSync(join(engine, 'scripts/browser-beta/build.mjs'))) throw Error('Den privata repositoryn saknar lokal Worker-staging. Använd den tillhörande lokala startpaketsgrenen.');
  for (const repository of [publicRoot, engine]) {
    try { execFileSync('git', ['rev-parse', '--show-toplevel'], {cwd: repository, env, stdio: 'pipe'}); }
    catch { throw Error('Båda projekten måste vara Git-kloner; använd inte GitHubs källkods-ZIP.'); }
  }
  const output = join(engine, '.simulator-output/browser-beta'), site = join(output, 'local-site');
  for (const file of ['sandbox-engine.worker.js', 'disclosure.json', 'local-run.lock', 'local-site/sandbox/sandbox-engine.worker.js', 'local-site/sandbox/engine-release.json']) assertIgnored(engine, '.simulator-output/browser-beta/' + file, env);
  mkdirSync(output, {recursive: true});
  if (!isInside(engine, realpathSync(output))) throw Error('Privat utdata får inte peka utanför den privata repositoryn.');
  const releaseLock = acquireLock(join(output, 'local-run.lock'));
  try {
    for (const repository of [publicRoot, engine]) {
      let installed = true;
      try { execFileSync(process.execPath, [npm, 'ls', '--depth=0', '--offline'], {cwd: repository, env, stdio: 'pipe'}); }
      catch { installed = false; }
      if (!installed) run('Installerar projektets låsta npm-paket', process.execPath, [npm, 'ci', '--no-audit', '--no-fund'], repository, env);
    }
    if (!existsSync(join(engine, '.cache/public-source-identity.json'))) {
      requireProgram('gh', 'Installera GitHub CLI och kör gh auth login.');
      requireProgram('tar', 'Windows 11 inkluderar tar.exe. Kontrollera PATH.');
      try { execFileSync('gh', ['auth', 'status'], {cwd: engine, env, stdio: 'pipe'}); }
      catch { throw Error('GitHub CLI behöver inloggning för första källhämtningen. Kör gh auth login och starta igen.'); }
      run('Hämtar låsta offentliga källor', process.execPath, [npm, 'run', 'pin:fetch'], engine, env);
    }
    for (const script of ['pin:verify', 'phase3:source', 'sandbox:source']) run('Kontrollerar låsta källor', process.execPath, [npm, 'run', script], engine, env);
    const canonical = execFileSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', "import {CANONICAL_CONFIGURATION_SOURCE} from './src/simulationConfigurationBridge.mjs';console.log(CANONICAL_CONFIGURATION_SOURCE)"], {cwd: publicRoot, env, encoding: 'utf8'}).trim();
    ensureCanonicalRevision(publicRoot, join(engine, '.cache/phase3-dps-source'), canonical, env);
    run('Kontrollerar kanonisk källintegritet', process.execPath, ['docs/ui-lab/tools/verify-configuration-source.mjs'], publicRoot, env);
    run('Bygger den motorfria publika webbplatsen', process.execPath, [npm, 'run', 'build'], publicRoot, env);
    run('Bygger den privata lokala Workern', process.execPath, ['--experimental-strip-types', 'scripts/browser-beta/build.mjs'], engine, env);
    // Fresh public build is verified before copying; private bytes go only below private ignored output.
    rmSync(site, {recursive: true, force: true});
    cpSync(join(publicRoot, 'dist'), site, {recursive: true});
    run('Förbereder endast lokal motor', process.execPath, ['scripts/browser-beta/stage-review.mjs', join(site, 'sandbox')], engine, env);
    run('Kontrollerar att publik dist fortfarande är motorfri', process.execPath, ['scripts/verify-public-artifact.mjs'], publicRoot, env);
    const manifest = JSON.parse(readFileSync(join(site, 'sandbox/engine-release.json')));
    if (manifest.status !== 'LOCAL_REVIEW_ONLY' || manifest.files.length !== 1) throw Error('Lokal Worker kunde inte kvalificeras.');
    const server = await startPreview({directory: site, port: options.port});
    const base = `http://127.0.0.1:${server.address().port}`;
    console.log(`\nBellibing Local är klar.\nBuild: ${base}/build/\nImprove: ${base}/improve/\nEcho Sandbox: ${base}/sandbox/\n\nStoppa med Enter eller Ctrl+C i detta fönster. Stängd flik stoppar inte servern.`);
    if (options.open) await openBrowser(base + '/build/').catch(() => console.log(`Webbläsaren kunde inte öppnas automatiskt. Öppna ${base}/build/`));
    await new Promise(ok => {
      const terminal = createInterface({input: process.stdin, output: process.stdout});
      let stopping = false;
      const stop = () => { if (stopping) return; stopping = true; terminal.close(); server.closeAllConnections(); server.close(ok); };
      terminal.once('line', stop); terminal.once('SIGINT', stop);
      const signal = () => stop();
      process.once('SIGINT', signal); process.once('SIGTERM', signal);
      server.once('close', () => { process.removeListener('SIGINT', signal); process.removeListener('SIGTERM', signal); });
    });
  } finally { releaseLock(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { await startLocal(parseOptions(process.argv.slice(2))); }
  catch (error) { console.error('\nStarten avbröts: ' + (error.code === 'EADDRINUSE' ? 'Porten används redan. Välj --port NUMMER eller stoppa den gamla servern.' : error.message)); process.exitCode = 1; }
}
