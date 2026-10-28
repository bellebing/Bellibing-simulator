// Local-only preview: expose exactly the concept files and its two public catalogs.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const files = new Map([
    ['/', [new URL('./index.html', import.meta.url), 'text/html']],
    ['/index.html', [new URL('./index.html', import.meta.url), 'text/html']],
    ['/concept.css', [new URL('./concept.css', import.meta.url), 'text/css']],
    ['/concept.js', [new URL('./concept.js', import.meta.url), 'text/javascript']],
    ['/hero-team.js', [new URL('./hero-team.js', import.meta.url), 'text/javascript']],
    ['/hero-team.css', [new URL('./hero-team.css', import.meta.url), 'text/css']],
    ['/ui-prototypes/assets/echoes/browser-data.json', [new URL('../../ui-prototypes/assets/echoes/browser-data.json', import.meta.url), 'application/json']],
    ['/ui-prototypes/assets/weapons/browser-data.json', [new URL('../../ui-prototypes/assets/weapons/browser-data.json', import.meta.url), 'application/json']]
]);
for (const id of ['augusta', 'jiyan', 'calcharo'])
    files.set('/ui-prototypes/assets/characters/hero-art/' + id + '.webp', [new URL('../../ui-prototypes/assets/characters/hero-art/' + id + '.webp', import.meta.url), 'image/webp']);
for (const id of ['augusta', 'jiyan', 'calcharo', 'iuno', 'the-shorekeeper', 'mortefi', 'verina', 'sanhua', 'baizhi'])
    files.set('/ui-prototypes/assets/characters/portraits/' + id + '.png', [new URL('../../ui-prototypes/assets/characters/portraits/' + id + '.png', import.meta.url), 'image/png']);
const server = createServer(async (req, res) => {
    const item = files.get(new URL(req.url, 'http://localhost').pathname);
    if (!item) {
        res.writeHead(404);
        res.end('Not found');
        return;
    }
    try {
        res.writeHead(200, { 'content-type': item[1] + '; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
        res.end(await readFile(item[0]));
    }
    catch {
        res.writeHead(500);
        res.end('Preview unavailable');
    }
});
server.listen(Number(process.env.CONCEPT_PORT ?? 4174), '127.0.0.1', () => console.log('Bellibing concept preview ready'));
