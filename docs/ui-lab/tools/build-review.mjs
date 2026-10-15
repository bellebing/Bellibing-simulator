import { readFileSync, writeFileSync, mkdirSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, relative, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTER_CATALOG, WEAPON_CATALOG } from '../v1.1/modules/catalog.js';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const entry = resolve(root, 'docs/ui-lab/v1.1');
const args = process.argv.slice(2);
const option = name => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : undefined; };
const output = resolve(option('--out') ?? resolve(root, 'artifacts/ui-lab-review'));
mkdirSync(output, { recursive: true });
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const dirty = !!execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: root, encoding: 'utf8' }).trim();
if (args.includes('--require-clean') && dirty) throw new Error('Review packaging requires a clean source revision');

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const mime = path => ({ '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' })[extname(path)];
const sourceFiles = ['docs/ui-lab/v1.1/index.html', 'docs/ui-lab/v1.1/lab.css', 'docs/ui-lab/v1.1/typography.css', 'docs/ui-lab/v1.1/feedback.css', 'docs/ui-lab/v1.1/character-card.css', 'docs/ui-lab/v1/style.css'];
const assetPaths = [...new Set([
  ...readdirSync(resolve(root, 'docs/ui-lab/v1/assets')).map(name => `../v1/assets/${name}`),
  ...CHARACTER_CATALOG.flatMap(person => [person.face, person.art, ...(person.sequences ?? []).map(chain => chain.art), ...(person.forte?.nodes ?? []).map(node => node.art)]),
  ...WEAPON_CATALOG.map(weapon => weapon.art).filter(Boolean),
  ...["spectro", "havoc", "aero", "glacio", "fusion", "electro"].map(element => `../../ui-prototypes/assets/builder-icons/elements/${element}.webp`),
])];
const assets = {};
for (const path of assetPaths) {
  const local = resolve(entry, path);
  if (!local.startsWith(root + '/')) throw new Error('Asset outside repository');
  const data = readFileSync(local);
  if (!mime(path)) throw new Error(`Unsupported review asset ${path}`);
  assets[path] = `data:${mime(path)};base64,${data.toString('base64')}`;
  sourceFiles.push(relative(root, local));
}

// A small explicit module loader keeps maintainable source modules while emitting
// one classic script: file:// review needs neither ESM fetches nor a local server.
const moduleSources = new Map();
function bundleModule(id) {
  if (moduleSources.has(id)) return;
  const path = resolve(entry, id);
  if (!path.startsWith(entry + '/modules/')) throw new Error(`Unexpected review import ${id}`);
  let source = readFileSync(path, 'utf8');
  sourceFiles.push(relative(root, path));
  moduleSources.set(id, '');
  source = source.replace(/^import \{([^}]+)\} from ['"]([^'"]+)['"];$/gm, (_, bindings, dependency) => {
    const next = relative(entry, resolve(dirname(path), dependency)).replaceAll('\\', '/');
    bundleModule(next);
    return `const {${bindings}} = require(${JSON.stringify(next)});`;
  });
  if (/^import\s/m.test(source)) throw new Error(`Unsupported module import in ${id}`);
  const exported = [];
  source = source.replace(/^export (function|const|class) ([\w$]+)/gm, (_, kind, name) => { exported.push(name); return `${kind} ${name}`; });
  if (/^export\s/m.test(source)) throw new Error(`Unsupported module export in ${id}`);
  moduleSources.set(id, `function(exports,require){\n${source}\nObject.assign(exports,{${exported.join(',')}});\n}`);
}
bundleModule('modules/app.js');
const modules = [...moduleSources].map(([id, source]) => `${JSON.stringify(id)}:${source}`).join(',\n');
const script = `(()=>{const factories={${modules}},cache={};function require(id){if(cache[id])return cache[id];const exports={};cache[id]=exports;factories[id](exports,require);return exports}require('modules/app.js')})();`;

const fontUrl = 'https://db.onlinewebfonts.com/t/3c1a4128f95e2109303b045eda4bfe8a.woff2';
const scratch = mkdtempSync(resolve(tmpdir(), 'bellibing-ui-lab-font-'));
let font;
try {
  const cache = option('--font') ?? resolve(scratch, 'Etna-review.woff2');
  if (!option('--font')) execFileSync('curl', ['--fail', '--silent', '--show-error', '--location', '--max-time', '30', fontUrl, '-o', cache]);
  font = readFileSync(cache);
  if (font.toString('ascii', 0, 4) !== 'wOF2') throw new Error('Approved font response was not WOFF2');
} finally { rmSync(scratch, { recursive: true, force: true }); }

const metadata = {
  revision, workingTreeDirty: dirty, entrypoint: 'docs/ui-lab/v1.1/index.html',
  font: { source: fontUrl, sha256: hash(font), scope: 'temporary approved review oracle only; not a production-local font clearance' },
  files: Object.fromEntries([...new Set(sourceFiles)].sort().map(path => [path, hash(readFileSync(resolve(root, path)))])),
};
let html = readFileSync(resolve(entry, 'index.html'), 'utf8');
html = html.replace(/<link rel="stylesheet" href="https:\/\/db\.onlinewebfonts\.com[^>]+>/, `<style>@font-face{font-family:Etna;src:url(data:font/woff2;base64,${font.toString('base64')}) format('woff2');font-weight:normal;font-style:normal;font-display:swap}</style>`);
html = html.replace(/<link rel="stylesheet" href="([^"\n]+)">/g, (_, path) => `<style>${readFileSync(resolve(entry, path), 'utf8')}</style>`);
html = html.replace(/src="(\.\.\/v1\/assets\/[^"\n]+)"/g, (_, path) => `src="${assets[path]}"`);
html = html.replace('<script type="module" src="modules/app.js"></script>', `<script>globalThis.BELLIBING_LAB_ASSETS=${JSON.stringify(assets)};globalThis.BELLIBING_LAB_REVIEW=${JSON.stringify({ revision, workingTreeDirty: dirty })};\n${script.replaceAll('</script', '<\\/script')}</script>`);
html = html.replace('<body class="ui-lab">', `<body class="ui-lab"><!-- Review source: ${revision}; dirty=${dirty}. Approved temporary ETNA source: ${fontUrl}. Font credit: https://www.onlinewebfonts.com/fonts . Review artifact does not establish production font licensing. -->`);
if (/<script[^>]+src=|<link[^>]+rel="stylesheet"|\bfetch\s*\(/.test(html)) throw new Error('Portable preview still depends on external code/styles or fetch');
const filename = 'Bellibing-UI-Lab-V1.1.html';
writeFileSync(resolve(output, filename), html);
writeFileSync(resolve(output, 'review-manifest.json'), JSON.stringify({ ...metadata, artifact: { filename, sha256: hash(Buffer.from(html)), bytes: Buffer.byteLength(html) } }, null, 2) + '\n');
writeFileSync(resolve(output, 'OPEN-REVIEW.txt'), `Bellibing UI Lab V1.1\nSource revision: ${revision}\nWorking tree dirty: ${dirty}\n\nDownload/extract this artifact, then open ${filename} in Chrome, Edge or Firefox.\nNo server, installation, login or internet connection is needed. Artwork, scripts, styles and the approved temporary review font are embedded.\n\nThe Lab is an isolated demonstration. Drag/swipe the centered Character wheel; click a neighbor to center it, then click the settled center Character to select it. Account/All filtering, Left/Right/Home/End/Enter, side panels, Echo selection, stat sliders and discarded history inspection work. carousel-interaction.mp4 demonstrates real browser input. SIMULATE deliberately does not calculate results. Scope selection is demonstration-only. Current/navigation show their explicit demonstration boundary. Open Demonstration to switch feedback review scenarios.\nSettings and selected slots remain isolated per Character during this page session. Reload resets all demo state. No production account, persistence or evaluator is connected.\n\nCompare the source hash and artifact hash in review-manifest.json.\nFont credit: https://www.onlinewebfonts.com/fonts . The temporary approved ETNA review oracle is not a production-local font license clearance.\n`);
console.log(`Packaged ${filename}: ${Buffer.byteLength(html)} bytes; source ${revision}; dirty=${dirty}`);
