import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { createHash } from 'node:crypto';

const SOURCE_REPO = 'ryanbenson/wuthering-waves-assets';
const SOURCE_COMMIT = 'd77801ecfb8c3abc950c1ffbc6ddec94f5129889';
const sourceRoot = process.argv[2];

if (!sourceRoot) throw new Error('Usage: node scripts/import-ui-static-assets.mjs <ryan-source-root>');
if (!existsSync(join(sourceRoot, 'images'))) throw new Error(`Missing source images directory: ${sourceRoot}`);

function norm(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function fileMeta(path) {
  return { bytes: statSync(path).size, sha256: sha256(path) };
}

function resetDir(path) {
  rmSync(path, { recursive: true, force: true });
  mkdirSync(path, { recursive: true });
}

function listFiles(path, extensions) {
  return readdirSync(path)
    .filter((name) => extensions.includes(extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
}

function parseEchoes() {
  const text = readFileSync('src/data/echoes.ts', 'utf8');
  const rows = [];
  const re = /"id": "echo-(\d+)"[\s\S]*?"name": "([^"]+)"[\s\S]*?"releaseStatus": "([^"]+)"/g;
  let match;
  while ((match = re.exec(text))) {
    rows.push({ id: `echo-${match[1]}`, sourceId: match[1], name: match[2], releaseStatus: match[3] });
  }
  return rows;
}

function parseWeapons() {
  const text = readFileSync('src/data/weapons.ts', 'utf8');
  const rows = [];
  const re = /w\(\{ id: '([^']+)', name: (?:'([^']+)'|"([^"]+)"), type: '([^']+)', rarity: (\d)/g;
  let match;
  while ((match = re.exec(text))) {
    rows.push({ id: match[1], name: match[2] ?? match[3], type: match[4], rarity: Number(match[5]) });
  }
  return rows;
}

function importEchoes() {
  const rows = parseEchoes().filter((row) => row.releaseStatus === 'RELEASED');
  const sourceDir = join(sourceRoot, 'images', 'echoes');
  const files = listFiles(sourceDir, ['.webp', '.png']);
  const targetDir = 'docs/ui-prototypes/assets/echoes/icons';
  resetDir(targetDir);

  const entries = rows.map((row) => {
    const wanted = norm(row.name);
    const sourceName = files.find((name) => {
      const base = norm(name.slice(0, -extname(name).length));
      return base === wanted || base === wanted + row.sourceId || (base.startsWith(wanted) && base.endsWith(row.sourceId));
    });
    if (!sourceName) throw new Error(`Missing Echo icon: ${row.id} / ${row.name}`);
    const sourcePath = join(sourceDir, sourceName);
    const extension = extname(sourceName).toLowerCase();
    const targetPath = join(targetDir, row.id + extension);
    cpSync(sourcePath, targetPath);
    return {
      echoId: row.id,
      sourceId: row.sourceId,
      name: row.name,
      releaseStatus: row.releaseStatus,
      sourcePath: `images/echoes/${sourceName}`,
      targetPath,
      ...fileMeta(targetPath),
    };
  });

  const manifest = {
    schemaVersion: 1,
    role: 'echo.icon',
    source: { repository: SOURCE_REPO, commit: SOURCE_COMMIT, path: 'images/echoes/' },
    importedAt: '2026-09-22',
    policy: {
      scope: 'Released canonical Bellibing Echoes only.',
      transform: 'NONE_BYTE_IDENTICAL_COPY',
      extras: 'Source variants not mapped to a canonical released Echo remain excluded.',
    },
    summary: { releasedCanonical: rows.length, imported: entries.length },
    icons: entries,
  };
  writeFileSync('docs/ui-prototypes/assets/echoes/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  return manifest.summary;
}

function importWeapons() {
  const rows = parseWeapons();
  const sourceDir = join(sourceRoot, 'images', 'weapons');
  const files = listFiles(sourceDir, ['.png', '.webp']);
  const targetDir = 'docs/ui-prototypes/assets/weapons/icons';
  resetDir(targetDir);

  const entries = rows.map((row) => {
    const wanted = norm(row.name);
    const sourceName = files.find((name) => norm(name.slice(0, -extname(name).length)) === wanted);
    if (!sourceName) throw new Error(`Missing Weapon icon: ${row.id} / ${row.name}`);
    const sourcePath = join(sourceDir, sourceName);
    const extension = extname(sourceName).toLowerCase();
    const targetPath = join(targetDir, row.id + extension);
    cpSync(sourcePath, targetPath);
    return {
      weaponId: row.id,
      name: row.name,
      weaponType: row.type,
      rarity: row.rarity,
      sourcePath: `images/weapons/${sourceName}`,
      targetPath,
      ...fileMeta(targetPath),
    };
  });

  const rarityCounts = {};
  for (const entry of entries) rarityCounts[entry.rarity] = (rarityCounts[entry.rarity] ?? 0) + 1;
  const manifest = {
    schemaVersion: 1,
    role: 'weapon.icon',
    source: { repository: SOURCE_REPO, commit: SOURCE_COMMIT, path: 'images/weapons/' },
    importedAt: '2026-09-22',
    policy: {
      scope: 'Current canonical Bellibing Weapon catalog.',
      transform: 'NONE_BYTE_IDENTICAL_COPY',
      extras: 'Unmatched source files remain excluded.',
    },
    summary: { canonical: rows.length, imported: entries.length, rarityCounts },
    icons: entries,
  };
  writeFileSync('docs/ui-prototypes/assets/weapons/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  return manifest.summary;
}

function lockRoverPortraits() {
  const manifestPath = 'docs/ui-prototypes/assets/characters/portraits/manifest.json';
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const candidates = [...manifest.roverCandidates].sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
  const elements = ['aero', 'electro', 'havoc', 'spectro'];
  const targetDir = 'docs/ui-prototypes/assets/characters/portraits';

  const selected = elements.map((element) => {
    const token = `rover${element}`;
    const candidate = candidates.find((item) => norm(basename(item.sourcePath, extname(item.sourcePath))).startsWith(token));
    if (!candidate) throw new Error(`Missing Rover candidate for ${element}`);
    const sourcePath = join(sourceRoot, candidate.sourcePath);
    const targetPath = join(targetDir, `rover-${element}.png`);
    cpSync(sourcePath, targetPath);
    return {
      characterId: `rover-${element}`,
      selectionPolicy: 'FIRST_SOURCE_MATCH',
      sourcePath: candidate.sourcePath,
      targetPath,
      ...fileMeta(targetPath),
    };
  });

  manifest.policy.rover = 'FIRST_SOURCE_MATCH: first lexicographically sorted matching sourcePath for each element; intentionally simple initial policy.';
  manifest.summary.canonicalRoverPortraits = selected.length;
  manifest.roverPortraits = selected;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  return selected;
}

const echoes = importEchoes();
const weapons = importWeapons();
const rover = lockRoverPortraits();

console.log(JSON.stringify({ echoes, weapons, rover }, null, 2));
