import { existsSync, readFileSync } from 'node:fs';

const HTML_PATH = 'docs/ui-prototypes/v34-functional.html';
const PORTRAIT_MANIFEST_PATH = 'docs/ui-prototypes/assets/characters/portraits/manifest.json';
const BUILDER_MANIFEST_PATH = 'docs/ui-prototypes/assets/builder-icons/manifest.json';
const CHARACTER_CATALOG_PATH = 'src/data/characters.ts';

function fail(message) {
  throw new Error(`New UI Character wiring audit failed: ${message}`);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function parseLiteral(html, name, shape) {
  const match = html.match(new RegExp(`const ${name}=(${shape});`));
  if (!match) fail(`missing ${name} literal`);
  return JSON.parse(match[1]);
}

const html = readFileSync(HTML_PATH, 'utf8');
const portraitManifest = readJson(PORTRAIT_MANIFEST_PATH);
const builderManifest = readJson(BUILDER_MANIFEST_PATH);
const catalogText = readFileSync(CHARACTER_CATALOG_PATH, 'utf8');

const pickerIds = parseLiteral(html, 'PICKER_IDS', '\\[[^;]+\\]');
const elementById = parseLiteral(html, 'ELEMENT_BY_ID', '\\{[^;]+\\}');

const expectedPickerIds = [
  'aalto',
  'camellya',
  'jinhsi',
  'augusta',
  'iuno',
  'the-shorekeeper',
  'denia',
];
if (JSON.stringify(pickerIds) !== JSON.stringify(expectedPickerIds)) {
  fail(`picker baseline drifted: ${pickerIds.join(', ')}`);
}
if (pickerIds.includes('hsin') || pickerIds.includes('suoming')) {
  fail('unreleased WIP Character entered the functional picker');
}

const catalogById = new Map();
const rowPattern = /row\(\{ id: '([^']+)', name: '([^']+)', rarity: \d+, element: (null|'[^']+')/g;
let rowMatch;
while ((rowMatch = rowPattern.exec(catalogText))) {
  catalogById.set(rowMatch[1], {
    name: rowMatch[2],
    element: rowMatch[3] === 'null' ? null : rowMatch[3].slice(1, -1),
  });
}

const portraitsById = new Map(portraitManifest.portraits.map((entry) => [entry.characterId, entry]));
const builderById = new Map(builderManifest.characters.map((entry) => [entry.characterId, entry]));
const elementAssetsByName = new Map(builderManifest.elements.map((entry) => [entry.element, entry]));

for (const id of pickerIds) {
  const canonical = catalogById.get(id);
  if (!canonical) fail(`${id} missing from canonical Character catalog`);

  const portrait = portraitsById.get(id);
  if (!portrait || portrait.releaseStatus !== 'RELEASED' || portrait.uiEligible !== true) {
    fail(`${id} lacks a released UI-eligible portrait`);
  }
  if (portrait.characterName !== canonical.name) {
    fail(`${id} portrait name drift: ${portrait.characterName} vs ${canonical.name}`);
  }
  if (!existsSync(portrait.targetPath)) fail(`${id} portrait file is missing`);

  const builder = builderById.get(id);
  if (!builder || builder.releaseStatus !== 'RELEASED') {
    fail(`${id} lacks released builder identity`);
  }
  if (builder.characterName !== canonical.name) {
    fail(`${id} builder name drift: ${builder.characterName} vs ${canonical.name}`);
  }
  if (!Array.isArray(builder.chains) || builder.chains.length !== 6) {
    fail(`${id} must expose exactly six sequence icons`);
  }
  for (let sequence = 1; sequence <= 6; sequence += 1) {
    const chain = builder.chains.find((entry) => entry.sequence === sequence);
    if (!chain) fail(`${id} missing S${sequence}`);
    if (!existsSync(chain.targetPath)) fail(`${id} S${sequence} file is missing`);
  }

  const wiredElement = elementById[id];
  if (wiredElement !== canonical.element) {
    fail(`${id} element drift: UI=${wiredElement}, canonical=${canonical.element}`);
  }
  const elementAsset = elementAssetsByName.get(wiredElement);
  if (!elementAsset || !existsSync(elementAsset.targetPath)) {
    fail(`${id} element asset missing for ${wiredElement}`);
  }
}

const requiredRuntimeMarkers = [
  "fetch('assets/characters/portraits/manifest.json')",
  "fetch('assets/builder-icons/manifest.json')",
  'choice-art',
  'choice-element',
  'data-sequence="6"',
  'renderCharacterIdentity(name)',
  "document.body.dataset.uiReady='true'",
  'FOCAL ART PENDING',
];
for (const marker of requiredRuntimeMarkers) {
  if (!html.includes(marker)) fail(`runtime marker missing: ${marker}`);
}
if (html.includes('TEMP ART')) fail('legacy Character selector TEMP ART marker remains');

console.log(
  `New UI Character wiring audit passed: ${pickerIds.length} selector Characters, `
  + `${pickerIds.length * 6} sequence bindings, canonical element identity intact.`,
);
