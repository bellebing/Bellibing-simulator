// Re-encode original generated masters for web delivery, without cropping/resizing or retouching.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ELEMENTAL_DESIGNS } from './elemental-designs.mjs';
const here = new URL('./elemental-art/', import.meta.url);
await mkdir(new URL('masters/', here), { recursive: true });
const inputs = process.argv[2] ? JSON.parse(await readFile(process.argv[2], 'utf8')) : null;
const sha = async (path) => createHash('sha256').update(await readFile(path)).digest('hex');
const records = [];
for (const e of ELEMENTAL_DESIGNS) {
    for (const kind of ['art', 'depth']) {
        const name = e.id + (kind === 'depth' ? '-depth' : '');
        const master = new URL('masters/' + name + '.png', here), web = new URL(name + '.webp', here);
        if (inputs)
            await copyFile(inputs[kind][e.id], master);
        const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', fileURLToPath(master), '-c:v', 'libwebp', ...(kind === 'depth' ? ['-lossless', '1'] : ['-quality', '94']), '-compression_level', '6', fileURLToPath(web)], { encoding: 'utf8' });
        if (result.status !== 0)
            throw Error(result.stderr || 'WebP export failed');
        records.push({ element: e.id, role: kind === 'art' ? 'Original painted background' : 'Artist-authored relative-depth control map', master: 'masters/' + name + '.png', masterSHA256: await sha(master), web: name + '.webp', webSHA256: await sha(web), webBytes: (await readFile(web)).length, encoding: kind === 'art' ? 'WebP quality 94; original dimensions' : 'WebP lossless; original dimensions' });
    }
}
await writeFile(new URL('manifest.json', here), JSON.stringify({ schemaVersion: 1, date: '2026-10-29', timezone: 'Europe/Stockholm', origin: 'Original AI-generated environment artwork via image_gen; Electro proof then five independently generated motifs. No Character generation or owner-reference pixel reuse.', relativeDepth: 'Artist-authored/generated approximation, not measured or reconstructed 3D geometry.', characterArt: 'Existing reviewed cutouts unchanged; no fabricated anatomy.', records }, null, 2) + '\n');
console.log('Six elemental art/depth pairs exported; original masters preserved');
