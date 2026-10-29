// Re-encode selected original Electro art; never modify the earlier six-element assets.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { HERO_VISTAS } from './hero-vistas.mjs';
const here = new URL('./vista-art/', import.meta.url);
await mkdir(new URL('masters/', here), { recursive: true });
const inputs = process.argv[2] ? JSON.parse(await readFile(process.argv[2], 'utf8')) : null;
const hash = async path => createHash('sha256').update(await readFile(path)).digest('hex');
const only = process.argv.find(arg => arg.startsWith('--only='))?.slice(7);
const selected = HERO_VISTAS.filter(v => !only || v.id === only);
if (!selected.length) throw Error('Unknown vista export selection');
let records = [];
if (only) { const previous = JSON.parse(await readFile(new URL('manifest.json', here), 'utf8')); records = previous.records.filter(r => r.variant !== only); }
for (const vista of selected) for (const kind of ['art', 'depth']) {
    const name = vista.art + (kind === 'depth' ? '-depth' : '');
    const master = new URL(`masters/${name}.png`, here), web = new URL(`${name}.webp`, here);
    if (inputs) await copyFile(inputs[vista.id][kind], master);
    const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', fileURLToPath(master), '-c:v', 'libwebp', ...(kind === 'depth' ? ['-lossless', '1'] : ['-quality', '94']), '-compression_level', '6', fileURLToPath(web)], { encoding: 'utf8' });
    if (result.status !== 0) throw Error(result.stderr || 'Vista export failed');
    records.push({ variant: vista.id, role: kind, master: `masters/${name}.png`, masterSHA256: await hash(master), web: `${name}.webp`, webSHA256: await hash(web), webBytes: (await readFile(web)).length, encoding: kind === 'depth' ? 'WebP lossless; source dimensions' : 'WebP quality 94; source dimensions' });
}
await writeFile(new URL('manifest.json', here), JSON.stringify({ schemaVersion: 1, date: '2026-10-29', timezone: 'Europe/Stockholm', origin: 'Original image_gen login-informed Electro composition and matching approximate depth; rejected coastal experiments retained for comparison. No game-reference pixels or Character artwork used as generation inputs; earlier original Bellibing Electro art supplied identity.', depth: 'Artistic distance guides, not measured geometry. No image color or lighting is a game-mechanics claim.', records }, null, 2) + '\n');
console.log('Selected Electro artwork exported; earlier comparison art retained');
