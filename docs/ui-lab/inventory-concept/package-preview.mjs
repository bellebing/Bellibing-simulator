// Produce a portable, offline concept for owner review; never a production build.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const here = new URL('./', import.meta.url);
const [html, css, js, echoes, weapons] = await Promise.all([
    'index.html', 'concept.css', 'concept.js', '../../ui-prototypes/assets/echoes/browser-data.json', '../../ui-prototypes/assets/weapons/browser-data.json'
].map(path => readFile(new URL(path, here), 'utf8')));
const start = js.search(/const \[echoCatalog,\s*weaponCatalog\]/), end = js.indexOf('const app', start);
if (start < 0 || end < 0)
    throw Error('Concept catalog boundary changed');
// Script-safe JSON, with no account/private information or external asset dependency.
const safe = value => JSON.stringify(JSON.parse(value)).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const script = js.slice(0, start) + `const echoCatalog=${safe(echoes)};\nconst weaponCatalog=${safe(weapons)};\n` + js.slice(end);
const output = html.replace('<link rel="stylesheet" href="concept.css">', `<style>${css}</style>`)
    .replace('<script type="module" src="concept.js"></script>', `<script type="module">${script.replace(/<\/script/gi, '<\\/script')}</script>`);
const destination = resolve(process.argv[2] ?? '/tmp/bellibing-inventory-concept.html');
await writeFile(destination, output);
console.log(`Portable concept saved: ${destination}`);
