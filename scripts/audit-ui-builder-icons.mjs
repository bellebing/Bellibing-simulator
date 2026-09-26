import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOT = 'docs/ui-prototypes/assets/builder-icons';
const MANIFEST = join(ROOT, 'manifest.json');
const WUWABUILD_COMMIT = '5fa70b11f1d84fb644e4dbed47873708da0fe66f';
const TOMY_COMMIT = '5b3d1d128ed3938cbb8e5260ba07b075b321a7c6';
const EXPECTED_FAMILIES = {
  element: 6,
  sonata: 34,
  chain: 348,
  skill: 411,
  stat: 17,
  'echo-cost': 3,
};
const SKILL_ROLES = [
  'normal-attack', 'skill', 'liberation', 'intro',
  'circuit', 'outro', 'inherent-1', 'inherent-2',
];
const EXPECTED_ELEMENTS = ['Aero', 'Electro', 'Fusion', 'Glacio', 'Havoc', 'Spectro'];
const EXPECTED_STATS = [
  'HP', 'HP%', 'ATK', 'ATK%', 'DEF', 'DEF%', 'Crit Rate', 'Crit DMG',
  'Energy Regen', 'Aero DMG', 'Glacio DMG', 'Fusion DMG', 'Electro DMG',
  'Havoc DMG', 'Spectro DMG', 'Healing Bonus', 'Basic Attack DMG Bonus',
  'Heavy Attack DMG Bonus', 'Resonance Skill DMG Bonus',
  'Resonance Liberation DMG Bonus',
];

function fail(message) {
  throw new Error('Builder icon audit failed: ' + message);
}

function gitBlobSha(buffer) {
  return createHash('sha1')
    .update('blob ' + buffer.length + '\0')
    .update(buffer)
    .digest('hex');
}

function listFiles(path) {
  const out = [];
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const full = join(path, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

function parseCharacters() {
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

function parseSonatas() {
  const text = readFileSync('src/data/sonatas.ts', 'utf8');
  const rows = [];
  const re = /"id": "sonata-(\d+)",\s*"name": "([^"]+)"/g;
  let match;
  while ((match = re.exec(text))) rows.push({ id: 'sonata-' + match[1], sourceId: Number(match[1]), name: match[2] });
  return rows;
}

function sameSet(a, b) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}

function assertImageMagic(path, buffer) {
  const ext = extname(path).toLowerCase();
  if (ext === '.png') {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    if (buffer.length < 8 || !buffer.subarray(0, 8).equals(png)) fail('invalid PNG bytes: ' + path);
    return;
  }
  if (ext === '.webp') {
    if (buffer.length < 12 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
      fail('invalid WebP bytes: ' + path);
    }
    return;
  }
  fail('unexpected asset extension: ' + path);
}

if (!existsSync(MANIFEST)) fail('missing manifest');
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
if (manifest.schemaVersion !== 1 || manifest.role !== 'builder.icon-foundation') fail('manifest identity drift');
if (manifest.sources?.wuwabuild?.commit !== WUWABUILD_COMMIT) fail('wuwabuild source pin drift');
if (manifest.sources?.tomy?.commit !== TOMY_COMMIT || manifest.sources?.tomy?.branch !== '3.6') fail('Tomy source pin drift');
if (manifest.policy?.transform !== 'NONE_BYTE_IDENTICAL_COPY') fail('asset transform policy drift');
if (manifest.policy?.materials?.startsWith('PENDING_SOURCE_MAPPING') !== true) fail('materials must remain pending until source-mapped');
if (JSON.stringify(manifest.policy?.excludedCharacters) !== JSON.stringify(['hsin', 'suoming'])) fail('pending Character exclusion drift');

const summaryExpected = {
  physicalAssets: 819,
  upstreamCharacterRows: 62,
  logicalCharacterKits: 58,
  upstreamSkillReferences: 496,
  skillReferences: 464,
  skills: 411,
  weaponTypeIconsWithinSkills: 5,
  upstreamChainReferences: 372,
  chainReferences: 348,
  chains: 348,
  elements: 6,
  sonataSets: 34,
  statLabels: 20,
  stats: 17,
  echoCosts: 3,
};
for (const [key, value] of Object.entries(summaryExpected)) {
  if (manifest.summary?.[key] !== value) fail('summary drift for ' + key + ': ' + manifest.summary?.[key]);
}

if (!Array.isArray(manifest.assets) || manifest.assets.length !== 819) fail('expected 819 manifest assets');
const targetPaths = new Set();
const familyCounts = {};
const assetByTarget = new Map();
for (const asset of manifest.assets) {
  if (targetPaths.has(asset.targetPath)) fail('duplicate targetPath ' + asset.targetPath);
  targetPaths.add(asset.targetPath);
  assetByTarget.set(asset.targetPath, asset);
  familyCounts[asset.family] = (familyCounts[asset.family] ?? 0) + 1;
  if (!Object.hasOwn(EXPECTED_FAMILIES, asset.family)) fail('unexpected asset family ' + asset.family);
  if (asset.family === 'materials' || asset.targetPath.includes('/materials/')) fail('materials imported before source mapping');

  if (!existsSync(asset.targetPath)) fail('missing asset ' + asset.targetPath);
  const buffer = readFileSync(asset.targetPath);
  if (buffer.length !== asset.sourceBytes) fail('byte-size drift ' + asset.targetPath);
  if (gitBlobSha(buffer) !== asset.sourceSha) fail('Git blob SHA drift ' + asset.targetPath);
  assertImageMagic(asset.targetPath, buffer);
}
for (const [family, expected] of Object.entries(EXPECTED_FAMILIES)) {
  if (familyCounts[family] !== expected) {
    fail('family count drift for ' + family + ': ' + familyCounts[family] + ' (expected ' + expected + ')');
  }
}
if (Object.keys(familyCounts).length !== Object.keys(EXPECTED_FAMILIES).length) {
  fail('unexpected asset family keys: ' + JSON.stringify(familyCounts));
}

const actualAssetFiles = listFiles(ROOT).filter((path) => path !== MANIFEST).sort();
const manifestAssetFiles = [...targetPaths].sort();
if (actualAssetFiles.length !== 819) fail('physical file count drift: ' + actualAssetFiles.length);
if (JSON.stringify(actualAssetFiles) !== JSON.stringify(manifestAssetFiles)) fail('asset directory contains unmanifested or missing files');

const canonicalCharacters = parseCharacters();
if (canonicalCharacters.length !== 60) fail('canonical Character count drift');
const canonicalExcluded = canonicalCharacters.filter((row) => row.releaseStatus === 'UNRELEASED_WIP').map((row) => row.id).sort();
if (JSON.stringify(canonicalExcluded) !== JSON.stringify(['hsin', 'suoming'])) fail('canonical pending Character set drift');
const expectedCharacterIds = new Set(canonicalCharacters.filter((row) => !canonicalExcluded.includes(row.id)).map((row) => row.id));
const canonicalCharacterById = new Map(canonicalCharacters.map((row) => [row.id, row]));
if (!Array.isArray(manifest.characters) || manifest.characters.length !== 58) fail('manifest Character kit count drift');
const manifestCharacterIdList = manifest.characters.map((row) => row.characterId);
const manifestCharacterIds = new Set(manifestCharacterIdList);
if (manifestCharacterIds.size !== manifestCharacterIdList.length) fail('duplicate Character ID in manifest');
if (!sameSet(expectedCharacterIds, manifestCharacterIds)) fail('Character kit coverage drift');

const skillTargets = new Set();
const chainTargets = new Set();
const normalAttackTargets = new Set();
for (const row of manifest.characters) {
  const canonical = canonicalCharacterById.get(row.characterId);
  if (!canonical) fail('unknown canonical Character ' + row.characterId);
  if (row.characterName !== canonical.name) fail('Character name drift for ' + row.characterId);
  if (row.releaseStatus !== canonical.releaseStatus) fail('Character release status drift for ' + row.characterId);
  if (canonical.releaseStatus === 'UNRELEASED_WIP') fail('pending Character leaked into builder manifest: ' + row.characterId);

  const roles = Object.keys(row.skills ?? {}).sort();
  if (JSON.stringify(roles) !== JSON.stringify([...SKILL_ROLES].sort())) fail('skill role coverage drift for ' + row.characterId);
  for (const role of SKILL_ROLES) {
    const targetPath = row.skills[role]?.targetPath;
    const asset = assetByTarget.get(targetPath);
    if (!asset || asset.family !== 'skill') fail('invalid skill reference for ' + row.characterId + ' / ' + role);
    if (asset.assetId !== row.skills[role]?.assetId) fail('skill assetId mismatch for ' + row.characterId + ' / ' + role);
    skillTargets.add(targetPath);
    if (role === 'normal-attack') normalAttackTargets.add(targetPath);
  }
  if (!Array.isArray(row.chains) || row.chains.length !== 6) fail('chain coverage drift for ' + row.characterId);
  row.chains.forEach((chain, index) => {
    const sequence = index + 1;
    if (chain.sequence !== sequence) fail('chain sequence drift for ' + row.characterId);
    const expectedAssetId = 'chain:' + row.characterId + ':s' + sequence;
    const expectedTargetPath = ROOT + '/chains/' + row.characterId + '/s' + sequence + '.webp';
    if (chain.assetId !== expectedAssetId) fail('chain assetId identity drift for ' + row.characterId + ' S' + sequence);
    if (chain.targetPath !== expectedTargetPath) fail('chain folder identity drift for ' + row.characterId + ' S' + sequence);
    const asset = assetByTarget.get(chain.targetPath);
    if (!asset || asset.family !== 'chain') fail('invalid chain reference for ' + row.characterId + ' S' + sequence);
    if (asset.assetId !== chain.assetId) fail('chain manifest assetId mismatch for ' + row.characterId + ' S' + sequence);
    chainTargets.add(chain.targetPath);
  });
}
if (skillTargets.size !== 411) fail('unique skill reference count drift: ' + skillTargets.size);
if (chainTargets.size !== 348) fail('unique chain reference count drift: ' + chainTargets.size);
if (normalAttackTargets.size !== 5) fail('weapon-type icon count drift: ' + normalAttackTargets.size);

if (!Array.isArray(manifest.elements) || manifest.elements.length !== 6) fail('element manifest count drift');
if (JSON.stringify(manifest.elements.map((row) => row.element).sort()) !== JSON.stringify([...EXPECTED_ELEMENTS].sort())) fail('element vocabulary drift');
for (const row of manifest.elements) if (assetByTarget.get(row.targetPath)?.family !== 'element') fail('invalid element asset reference ' + row.element);

const canonicalSonatas = parseSonatas();
if (canonicalSonatas.length !== 34 || manifest.sonataSets?.length !== 34) fail('Sonata count drift');
const canonicalSonataMap = new Map(canonicalSonatas.map((row) => [row.sourceId, row]));
for (const row of manifest.sonataSets) {
  const canonical = canonicalSonataMap.get(row.sourceId);
  if (!canonical || canonical.id !== row.sonataId || canonical.name !== row.name) fail('Sonata identity drift for sourceId ' + row.sourceId);
  if (assetByTarget.get(row.targetPath)?.family !== 'sonata') fail('invalid Sonata asset reference ' + row.sonataId);
}

if (!Array.isArray(manifest.stats) || manifest.stats.length !== 20) fail('stat label count drift');
if (JSON.stringify(manifest.stats.map((row) => row.label).sort()) !== JSON.stringify([...EXPECTED_STATS].sort())) fail('stat vocabulary drift');
const statTargets = new Set();
for (const row of manifest.stats) {
  if (assetByTarget.get(row.targetPath)?.family !== 'stat') fail('invalid stat asset reference ' + row.label);
  statTargets.add(row.targetPath);
}
if (statTargets.size !== 17) fail('unique stat asset count drift: ' + statTargets.size);

if (!Array.isArray(manifest.echoCosts) || JSON.stringify(manifest.echoCosts.map((row) => row.cost)) !== JSON.stringify([1, 3, 4])) fail('Echo COST coverage drift');
for (const row of manifest.echoCosts) if (assetByTarget.get(row.targetPath)?.family !== 'echo-cost') fail('invalid COST asset reference ' + row.cost);

console.log('Builder icon foundation audit OK: 819 physical assets; 58 Character kits; 411 skills; 348 chains; 34 Sonata; 6 elements; 20 stat labels / 17 files; 3 COST.');
