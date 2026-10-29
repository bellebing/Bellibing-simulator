// Re-encode only the two original Electro proposals; never touch the earlier six-element art.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { HERO_VISTAS } from './hero-vistas.mjs';
const here = new URL('./vista-art/', import.meta.url);
await mkdir(new URL('masters/', here), { recursive: true });
const inputs = process.argv[2] ? JSON.parse(await readFile(process.argv[2], 'utf8')) : null;
const hash = async path => createHash('sha256').update(await readFile(path)).digest('hex');
const records = [];
for (const vista of HERO_VISTAS) for (const kind of ['art', 'depth']) {
    const name = vista.art + (kind === 'depth' ? '-depth' : '');
    const master = new URL(`masters/${name}.png`, here), web = new URL(`${name}.webp`, here);
    if (inputs) await copyFile(inputs[vista.id][kind], master);
    const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', fileURLToPath(master), '-c:v', 'libwebp', ...(kind === 'depth' ? ['-lossless', '1'] : ['-quality', '94']), '-compression_level', '6', fileURLToPath(web)], { encoding: 'utf8' });
    if (result.status !== 0) throw Error(result.stderr || 'Vista export failed');
    records.push({ variant: vista.id, role: kind, master: `masters/${name}.png`, masterSHA256: await hash(master), web: `${name}.webp`, webSHA256: await hash(web), webBytes: (await readFile(web)).length, encoding: kind === 'depth' ? 'WebP lossless; source dimensions' : 'WebP quality 94; source dimensions' });
}
await writeFile(new URL('manifest.json', here), JSON.stringify({ schemaVersion: 1, date: '2026-10-29', timezone: 'Europe/Stockholm', origin: 'Original image_gen coastal compositions, then stylized material refinements and matching approximate relative-depth maps. No reference pixels or Character artwork used as generation inputs.', depth: 'Artistic distance guides, not measured geometry. No image color or lighting is a game-mechanics claim.', records }, null, 2) + '\n');
console.log('Two Electro vistas exported; earlier six-element art untouched');
