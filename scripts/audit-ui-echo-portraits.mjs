import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';

const MANIFEST_PATH = 'docs/ui-prototypes/assets/echoes/portraits/manifest.json';
const PORTRAIT_DIR = 'docs/ui-prototypes/assets/echoes/portraits';
const SOURCE_REPOSITORY = 'TomyJan/WutheringWaves-UIResources';
const SOURCE_BRANCH = '3.6';
const SOURCE_COMMIT = '5b3d1d128ed3938cbb8e5260ba07b075b321a7c6';
const SOURCE_PATH = 'UIResources/Common/Image/IconMonsterHead732/';
const EXPECTED_COUNT = 181;

function fail(message) {
  throw new Error(`Echo portrait audit failed: ${message}`);
}

function gitBlobSha(path) {
  const bytes = readFileSync(path);
  return createHash('sha1')
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest('hex');
}

function parseReleasedEchoes() {
  const text = readFileSync('src/data/echoes.ts', 'utf8');
  const rows = [];
  const re = /"id": "echo-(\d+)"[\s\S]*?"name": "([^"]+)"[\s\S]*?"releaseStatus": "([^"]+)"/g;
  let match;
  while ((match = re.exec(text))) {
    if (match[3] === 'RELEASED') {
      rows.push({
        echoId: `echo-${match[1]}`,
        sourceId: match[1],
        name: match[2],
        releaseStatus: match[3],
      });
    }
  }
  return rows;
}

if (!existsSync(MANIFEST_PATH)) fail('manifest is missing');
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const released = parseReleasedEchoes();

if (released.length !== EXPECTED_COUNT) fail(`canonical released count is ${released.length}, expected ${EXPECTED_COUNT}`);
if (manifest.schemaVersion !== 1) fail('schemaVersion must be 1');
if (manifest.role !== 'echo.portrait') fail(`unexpected role ${manifest.role}`);
if (manifest.source?.repository !== SOURCE_REPOSITORY) fail('source repository drift');
if (manifest.source?.branch !== SOURCE_BRANCH) fail('source branch drift');
if (manifest.source?.commit !== SOURCE_COMMIT) fail('source commit drift');
if (manifest.source?.path !== SOURCE_PATH) fail('source path drift');
if (manifest.policy?.transform !== 'NONE_BYTE_IDENTICAL_COPY') fail('transform policy drift');

const files = readdirSync(PORTRAIT_DIR).filter((name) => name.endsWith('.png')).sort();
if (files.length !== EXPECTED_COUNT) fail(`portrait file count is ${files.length}, expected ${EXPECTED_COUNT}`);
if (!Array.isArray(manifest.portraits) || manifest.portraits.length !== EXPECTED_COUNT) {
  fail(`manifest portrait count is ${manifest.portraits?.length ?? 'invalid'}, expected ${EXPECTED_COUNT}`);
}
if (manifest.summary?.releasedCanonical !== EXPECTED_COUNT ||
    manifest.summary?.imported !== EXPECTED_COUNT ||
    manifest.summary?.byteIdenticalSourceMatches !== EXPECTED_COUNT ||
    manifest.summary?.unmatched !== 0) {
  fail('summary counts do not match the locked 181/181 import');
}

const canonicalById = new Map(released.map((row) => [row.echoId, row]));
const entryById = new Map();
for (const entry of manifest.portraits) {
  if (entryById.has(entry.echoId)) fail(`duplicate manifest entry ${entry.echoId}`);
  entryById.set(entry.echoId, entry);
}

for (const row of released) {
  const entry = entryById.get(row.echoId);
  if (!entry) fail(`missing manifest entry ${row.echoId}`);
  if (entry.sourceId !== row.sourceId) fail(`${row.echoId} sourceId mismatch`);
  if (entry.name !== row.name) fail(`${row.echoId} name mismatch`);
  if (entry.releaseStatus !== 'RELEASED') fail(`${row.echoId} releaseStatus mismatch`);
  if (entry.mappingStatus !== 'BYTE_IDENTICAL_GIT_BLOB') fail(`${row.echoId} mappingStatus mismatch`);

  const expectedTarget = `${PORTRAIT_DIR}/${row.echoId}.png`;
  if (entry.targetPath !== expectedTarget) fail(`${row.echoId} targetPath mismatch`);
  if (!existsSync(expectedTarget)) fail(`${row.echoId} target file missing`);

  const expectedSourcePattern = /^UIResources\/Common\/Image\/IconMonsterHead732\/T_IconMonsterHead732_[A-Za-z0-9_]+_UI\.png$/;
  if (!expectedSourcePattern.test(entry.sourcePath)) fail(`${row.echoId} sourcePath is outside pinned portrait family`);

  const size = statSync(expectedTarget).size;
  if (entry.sourceBytes !== size) fail(`${row.echoId} byte-size mismatch`);
  const sha = gitBlobSha(expectedTarget);
  if (entry.sourceSha !== sha) fail(`${row.echoId} Git blob SHA mismatch`);
}

const canonicalFiles = released.map((row) => `${row.echoId}.png`).sort();
if (JSON.stringify(files) !== JSON.stringify(canonicalFiles)) fail('portrait directory contains missing or extra canonical PNGs');
if (entryById.size !== canonicalById.size) fail('manifest contains non-canonical Echo entries');

console.log(`Echo portrait audit passed: ${EXPECTED_COUNT}/${EXPECTED_COUNT} canonical portraits, pinned source provenance intact.`);
