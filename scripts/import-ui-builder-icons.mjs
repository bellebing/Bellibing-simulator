import { createHash } from 'node:crypto';
import { basename, dirname, extname, join } from 'node:path';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';

const WUWABUILD_REPO = 'DommyMM/wuwabuild';
const WUWABUILD_COMMIT = '5fa70b11f1d84fb644e4dbed47873708da0fe66f';
const TOMY_REPO = 'TomyJan/WutheringWaves-UIResources';
const TOMY_BRANCH = '3.6';
const TOMY_COMMIT = '5b3d1d128ed3938cbb8e5260ba07b075b321a7c6';
const TARGET_ROOT = 'docs/ui-prototypes/assets/builder-icons';
const IMPORTED_AT = '2026-09-23';

const SKILL_ROLES = [
  'normal-attack', 'skill', 'liberation', 'intro',
  'circuit', 'outro', 'inherent-1', 'inherent-2',
];

const EXPECTED_STATS = [
  'HP', 'HP%', 'ATK', 'ATK%', 'DEF', 'DEF%', 'Crit Rate', 'Crit DMG',
  'Energy Regen', 'Aero DMG', 'Glacio DMG', 'Fusion DMG', 'Electro DMG',
  'Havoc DMG', 'Spectro DMG', 'Healing Bonus', 'Basic Attack DMG Bonus',
  'Heavy Attack DMG Bonus', 'Resonance Skill DMG Bonus',
  'Resonance Liberation DMG Bonus',
];

function fail(message) { throw new Error('Builder icon import failed: ' + message); }

function slug(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function gitBlobSha(buffer) {
  return createHash('sha1').update('blob ' + buffer.length + '\0').update(buffer).digest('hex');
}

function parseBellibingCharacters() {
  const text = readFileSync('src/data/characters.ts', 'utf8');
  const rows = [];
  for (const line of text.split('\n')) {
    const match = line.match(/row\(\{ id: '([^']+)', name: '([^']+)'/);
    if (!match) continue;
    const release = line.match(/releaseStatus: '([^']+)'/);
    rows.push({ id: match[1], name: match[2], releaseStatus: release?.[1] ?? 'RELEASED' });
  }
  return rows;
}

function parseBellibingSonatas() {
  const text = readFileSync('src/data/sonatas.ts', 'utf8');
  const rows = [];
  const re = /"id": "sonata-(\d+)",\s*"name": "([^"]+)"/g;
  let match;
  while ((match = re.exec(text))) rows.push({ id: 'sonata-' + match[1], sourceId: Number(match[1]), name: match[2] });
  return rows;
}

function sourceCharacterName(row) {
  if (row.id === 'the-shorekeeper') return 'Shorekeeper';
  if (row.id.startsWith('rover-')) {
    const element = row.id.slice('rover-'.length);
    return 'Rover: ' + element[0].toUpperCase() + element.slice(1);
  }
  return row.name;
}

function sameKit(a, b) {
  return JSON.stringify({ skills: a.skillIcons, chains: (a.chains ?? []).map((chain) => chain.icon) }) ===
    JSON.stringify({ skills: b.skillIcons, chains: (b.chains ?? []).map((chain) => chain.icon) });
}

function wuwabuildSourcePath(assetUrl) {
  if (typeof assetUrl !== 'string' || !assetUrl.startsWith('/assets/')) fail('unexpected wuwabuild asset path ' + JSON.stringify(assetUrl));
  return 'public' + assetUrl;
}

function rawUrl(sourceKey, sourcePath) {
  if (sourceKey === 'wuwabuild') return encodeURI('https://raw.githubusercontent.com/' + WUWABUILD_REPO + '/' + WUWABUILD_COMMIT + '/' + sourcePath);
  if (sourceKey === 'tomy') return encodeURI('https://raw.githubusercontent.com/' + TOMY_REPO + '/' + TOMY_COMMIT + '/' + sourcePath);
  fail('unknown source key ' + sourceKey);
}

async function fetchBuffer(url) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'bellibing-builder-icon-import/1' } });
      if (!response.ok) throw new Error(response.status + ' ' + response.statusText);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      lastError = error;
      if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
  throw lastError;
}

async function fetchJson(sourcePath) {
  const data = await fetchBuffer(rawUrl('wuwabuild', sourcePath));
  return JSON.parse(data.toString('utf8'));
}

const [charactersSource, fettersSource, statsSource] = await Promise.all([
  fetchJson('public/Data/Characters.json'),
  fetchJson('public/Data/Fetters.json'),
  fetchJson('public/Data/Stats.json'),
]);

if (!Array.isArray(charactersSource) || charactersSource.length !== 62) fail('expected 62 pinned upstream Character rows');
if (!Array.isArray(fettersSource) || fettersSource.length !== 34) fail('expected 34 pinned upstream Sonata rows');
if (Object.keys(statsSource).length !== 20) fail('expected 20 pinned upstream stat labels');

const logicalSourceNames = new Set(charactersSource.map((row) => row.name?.en));
if (logicalSourceNames.size !== 58) fail('expected 58 logical upstream Character kits');

const sourceByName = new Map();
for (const row of charactersSource) {
  const name = row.name?.en;
  if (!name) fail('Character source row missing English name');
  const group = sourceByName.get(name) ?? [];
  group.push(row);
  sourceByName.set(name, group);
}
for (const [name, group] of sourceByName) {
  if (group.length > 1 && !group.every((row) => sameKit(group[0], row))) fail('duplicate Character source rows disagree on kit assets: ' + name);
}

const bellibingCharacters = parseBellibingCharacters();
if (bellibingCharacters.length !== 60) fail('expected 60 Bellibing Character catalog rows');
const excludedCharacters = bellibingCharacters.filter((row) => row.releaseStatus === 'UNRELEASED_WIP').map((row) => row.id).sort();
if (JSON.stringify(excludedCharacters) !== JSON.stringify(['hsin', 'suoming'])) fail('UNRELEASED_WIP exclusion drift: ' + JSON.stringify(excludedCharacters));
const resolvedCharacters = bellibingCharacters.filter((row) => !excludedCharacters.includes(row.id));
if (resolvedCharacters.length !== 58) fail('expected 58 source-resolved Bellibing Character kits');

const assets = [];
const assetByTarget = new Map();
const assetByFamilySource = new Map();

function registerAsset({ assetId, family, sourceKey, sourcePath, targetPath }) {
  if (assetByTarget.has(targetPath)) {
    const existing = assetByTarget.get(targetPath);
    if (existing.sourcePath !== sourcePath || existing.sourceKey !== sourceKey) fail('target collision at ' + targetPath);
    return existing;
  }
  const sourceMapKey = family + '\0' + sourceKey + '\0' + sourcePath;
  if (assetByFamilySource.has(sourceMapKey)) return assetByFamilySource.get(sourceMapKey);
  const asset = { assetId, family, sourceKey, sourcePath, targetPath };
  assets.push(asset);
  assetByTarget.set(targetPath, asset);
  assetByFamilySource.set(sourceMapKey, asset);
  return asset;
}

const characterEntries = resolvedCharacters.map((targetRow) => {
  const sourceName = sourceCharacterName(targetRow);
  const candidates = sourceByName.get(sourceName);
  if (!candidates?.length) fail('missing upstream Character kit for ' + targetRow.id + ' / ' + sourceName);
  const source = [...candidates].sort((a, b) => Number(a.id) - Number(b.id))[0];

  const keys = Object.keys(source.skillIcons ?? {}).sort();
  if (JSON.stringify(keys) !== JSON.stringify([...SKILL_ROLES].sort())) fail('skill role drift for ' + targetRow.id + ': ' + JSON.stringify(keys));
  if (!Array.isArray(source.chains) || source.chains.length !== 6) fail('chain count drift for ' + targetRow.id);

  const skills = {};
  for (const role of SKILL_ROLES) {
    const sourceUrl = source.skillIcons[role];
    const sourcePath = wuwabuildSourcePath(sourceUrl);
    const targetPath = join(TARGET_ROOT, 'skills', basename(sourceUrl));
    const asset = registerAsset({
      assetId: 'skill:' + basename(targetPath, extname(targetPath)),
      family: 'skill',
      sourceKey: 'wuwabuild',
      sourcePath,
      targetPath,
    });
    skills[role] = { assetId: asset.assetId, targetPath: asset.targetPath };
  }

  const chains = source.chains.map((chain, index) => {
    const sourcePath = wuwabuildSourcePath(chain.icon);
    const targetPath = join(TARGET_ROOT, 'chains', targetRow.id, 's' + (index + 1) + extname(chain.icon));
    const asset = registerAsset({
      assetId: 'chain:' + targetRow.id + ':s' + (index + 1),
      family: 'chain',
      sourceKey: 'wuwabuild',
      sourcePath,
      targetPath,
    });
    return {
      sequence: index + 1,
      sourceChainId: chain.id,
      name: chain.name?.en ?? '',
      assetId: asset.assetId,
      targetPath: asset.targetPath,
    };
  });

  return {
    characterId: targetRow.id,
    characterName: targetRow.name,
    releaseStatus: targetRow.releaseStatus,
    sourceId: source.id,
    sourceName,
    skills,
    chains,
  };
});

const uniqueSkillAssets = assets.filter((asset) => asset.family === 'skill');
const uniqueChainAssets = assets.filter((asset) => asset.family === 'chain');
if (uniqueSkillAssets.length !== 411) fail('expected 411 unique skill assets, got ' + uniqueSkillAssets.length);
if (uniqueChainAssets.length !== 348) fail('expected 348 unique chain assets, got ' + uniqueChainAssets.length);
const normalAttackTargets = new Set(characterEntries.map((row) => row.skills['normal-attack'].targetPath));
if (normalAttackTargets.size !== 5) fail('expected five shared weapon-type Normal Attack icons');

const elementSources = new Map();
for (const source of charactersSource) {
  const name = source.element?.name?.en;
  const icon = source.element?.icon?.['7'];
  if (!name || !icon) continue;
  const prior = elementSources.get(name);
  if (prior && prior !== icon) fail('element icon drift for ' + name);
  elementSources.set(name, icon);
}
const expectedElements = ['Aero', 'Electro', 'Fusion', 'Glacio', 'Havoc', 'Spectro'];
if (JSON.stringify([...elementSources.keys()].sort()) !== JSON.stringify([...expectedElements].sort())) fail('element vocabulary drift');
const elements = expectedElements.map((element) => {
  const sourceUrl = elementSources.get(element);
  const asset = registerAsset({
    assetId: 'element:' + slug(element),
    family: 'element',
    sourceKey: 'wuwabuild',
    sourcePath: wuwabuildSourcePath(sourceUrl),
    targetPath: join(TARGET_ROOT, 'elements', slug(element) + extname(sourceUrl)),
  });
  return { element, assetId: asset.assetId, targetPath: asset.targetPath };
});

const bellibingSonatas = parseBellibingSonatas();
if (bellibingSonatas.length !== 34) fail('expected 34 Bellibing Sonata rows');
const bellibingSonataBySource = new Map(bellibingSonatas.map((row) => [row.sourceId, row]));
const sonataSets = [...fettersSource].sort((a, b) => a.id - b.id).map((source) => {
  const target = bellibingSonataBySource.get(source.id);
  if (!target || target.name !== source.name?.en) fail('Sonata identity mismatch for sourceId ' + source.id);
  const asset = registerAsset({
    assetId: 'sonata:' + source.id,
    family: 'sonata',
    sourceKey: 'wuwabuild',
    sourcePath: wuwabuildSourcePath(source.icon),
    targetPath: join(TARGET_ROOT, 'sonata', String(source.id).padStart(2, '0') + '-' + slug(source.name.en) + extname(source.icon)),
  });
  return { sonataId: target.id, sourceId: source.id, name: source.name.en, assetId: asset.assetId, targetPath: asset.targetPath };
});
if (sonataSets.length !== 34) fail('Sonata mapping incomplete');

const statLabels = Object.keys(statsSource);
if (JSON.stringify([...statLabels].sort()) !== JSON.stringify([...EXPECTED_STATS].sort())) fail('stat vocabulary drift: ' + JSON.stringify(statLabels));
const stats = statLabels.map((label) => {
  const sourceUrl = statsSource[label].icon;
  const sourcePath = wuwabuildSourcePath(sourceUrl);
  const targetPath = join(TARGET_ROOT, 'stats', basename(sourceUrl));
  const asset = registerAsset({
    assetId: 'stat:' + basename(targetPath, extname(targetPath)),
    family: 'stat',
    sourceKey: 'wuwabuild',
    sourcePath,
    targetPath,
  });
  return { label, assetId: asset.assetId, targetPath: asset.targetPath };
});
if (assets.filter((asset) => asset.family === 'stat').length !== 17) fail('expected 17 unique stat assets');

const echoCosts = [1, 3, 4].map((cost) => {
  const sourcePath = 'UIResources/UiInventory/Image/T_SortCost' + cost + '.png';
  const asset = registerAsset({
    assetId: 'echo-cost:' + cost,
    family: 'echo-cost',
    sourceKey: 'tomy',
    sourcePath,
    targetPath: join(TARGET_ROOT, 'echo-cost', 'cost-' + cost + '.png'),
  });
  return { cost, assetId: asset.assetId, targetPath: asset.targetPath };
});

const counts = Object.fromEntries(['element', 'sonata', 'chain', 'skill', 'stat', 'echo-cost'].map((family) => [family, assets.filter((asset) => asset.family === family).length]));
const expectedCounts = { element: 6, sonata: 34, chain: 348, skill: 411, stat: 17, 'echo-cost': 3 };
if (JSON.stringify(counts) !== JSON.stringify(expectedCounts)) fail('physical family counts drift: ' + JSON.stringify(counts));
if (assets.length !== 819) fail('expected 819 physical assets, got ' + assets.length);

rmSync(TARGET_ROOT, { recursive: true, force: true });
mkdirSync(TARGET_ROOT, { recursive: true });

let nextIndex = 0;
async function worker() {
  while (true) {
    const index = nextIndex++;
    if (index >= assets.length) return;
    const asset = assets[index];
    const buffer = await fetchBuffer(rawUrl(asset.sourceKey, asset.sourcePath));
    mkdirSync(dirname(asset.targetPath), { recursive: true });
    writeFileSync(asset.targetPath, buffer);
    asset.sourceBytes = buffer.length;
    asset.sourceSha = gitBlobSha(buffer);
  }
}
await Promise.all(Array.from({ length: 12 }, () => worker()));

for (const asset of assets) {
  if (!existsSync(asset.targetPath)) fail('missing downloaded target ' + asset.targetPath);
  if (statSync(asset.targetPath).size !== asset.sourceBytes) fail('byte-size drift after write ' + asset.targetPath);
}
assets.sort((a, b) => a.targetPath.localeCompare(b.targetPath));

const manifest = {
  schemaVersion: 1,
  role: 'builder.icon-foundation',
  sources: {
    wuwabuild: {
      repository: WUWABUILD_REPO,
      commit: WUWABUILD_COMMIT,
      dataPaths: ['public/Data/Characters.json', 'public/Data/Fetters.json', 'public/Data/Stats.json'],
      assetRoot: 'public/assets/',
    },
    tomy: {
      repository: TOMY_REPO,
      branch: TOMY_BRANCH,
      commit: TOMY_COMMIT,
      path: 'UIResources/UiInventory/Image/',
    },
  },
  importedAt: IMPORTED_AT,
  policy: {
    transform: 'NONE_BYTE_IDENTICAL_COPY',
    scope: 'Selective builder-visible icons only; no bulk game UI dump.',
    characterCoverage: '58 source-resolved logical kits. Rover gender rows collapse only after identical kit-asset verification.',
    excludedCharacters,
    materials: 'PENDING_SOURCE_MAPPING. No EXP, Tuner or material icons are imported until item-ID -> name -> asset-path is source-resolved.',
    genericUi: 'Rarity stars, locks, plus/minus and generic buttons remain CSS/SVG/UI rather than imported game assets.',
  },
  summary: {
    physicalAssets: assets.length,
    upstreamCharacterRows: charactersSource.length,
    logicalCharacterKits: characterEntries.length,
    upstreamSkillReferences: charactersSource.length * 8,
    skillReferences: characterEntries.length * 8,
    skills: counts.skill,
    weaponTypeIconsWithinSkills: normalAttackTargets.size,
    upstreamChainReferences: charactersSource.length * 6,
    chainReferences: characterEntries.length * 6,
    chains: counts.chain,
    elements: counts.element,
    sonataSets: counts.sonata,
    statLabels: stats.length,
    stats: counts.stat,
    echoCosts: counts['echo-cost'],
  },
  elements,
  sonataSets,
  stats,
  echoCosts,
  characters: characterEntries,
  assets,
};

writeFileSync(join(TARGET_ROOT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest.summary, null, 2));
