import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const UPSTREAM_REPO = 'DommyMM/wuwabuild';
const REQUIRED_CURRENT_ECHO = 'Calamity Effigy';
const SYNC_DATE = process.env.BELLIBING_SYNC_DATE ?? new Date().toISOString().slice(0, 10);

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Bellibing-simulator game-data sync',
      Accept: 'application/vnd.github+json, application/json',
    },
  });
  if (!response.ok) throw new Error(`Fetch failed ${response.status}: ${url}`);
  return response.json();
}

function requireArray(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  return value;
}

function englishName(record, label) {
  const value = record?.name?.en;
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} ${String(record?.id)} has no English name.`);
  }
  return value.trim();
}

function echoThreatClass(cost) {
  if (cost === 1) return 'COMMON';
  if (cost === 3) return 'ELITE';
  // COST 4 can be either Overlord or Calamity. Do not infer without a source field.
  return null;
}

function sourceProvenance(sourceSha, notes = []) {
  return {
    sourceLabels: [
      'wuwabuild normalized game-data snapshot',
      'Wuthery / Encore upstream raw game data',
    ],
    sourceUrls: [
      `https://github.com/${UPSTREAM_REPO}/tree/${sourceSha}/public/Data`,
      'https://api-v2.encore.moe/api',
      'https://files.wuthery.com',
    ],
    checkedAt: SYNC_DATE,
    notes: [
      'Bellibing imports only a compact raw identity snapshot; upstream combat/scoring code is not copied.',
      ...notes,
    ],
  };
}

function transformEchoes(rawEchoes, sourceSha) {
  const echoes = requireArray(rawEchoes, 'Echoes').map((raw) => {
    if (!Number.isInteger(raw.id)) throw new Error('Echo id must be an integer.');
    if (![1, 3, 4].includes(raw.cost)) throw new Error(`Unexpected Echo COST ${raw.cost} for ${raw.id}.`);
    if (!Array.isArray(raw.fetter) || raw.fetter.some((value) => !Number.isInteger(value))) {
      throw new Error(`Echo ${raw.id} has invalid Sonata/fetter ids.`);
    }
    const name = englishName(raw, 'Echo');
    return {
      kind: 'ECHO',
      id: `echo-${raw.id}`,
      name,
      releaseStatus: 'RELEASED',
      verificationStatus: 'PARTIALLY_VERIFIED',
      integrationStatus: 'DATA_ONLY',
      provenance: sourceProvenance(sourceSha, [
        'Release roster is sourced from the deployed normalized live-data snapshot; official patch notes are used as patch freshness gates.',
      ]),
      sourceId: raw.id,
      cost: raw.cost,
      threatClass: echoThreatClass(raw.cost),
      sonataSetIds: [...new Set(raw.fetter.map((id) => `sonata-${id}`))].sort(),
    };
  });

  echoes.sort((a, b) => a.name.localeCompare(b.name) || a.sourceId - b.sourceId);
  const ids = new Set();
  for (const echo of echoes) {
    if (ids.has(echo.id)) throw new Error(`Duplicate Echo id ${echo.id}.`);
    ids.add(echo.id);
  }
  if (!echoes.some((echo) => echo.name === REQUIRED_CURRENT_ECHO)) {
    throw new Error(`Upstream Echo snapshot is stale: missing ${REQUIRED_CURRENT_ECHO}.`);
  }
  return echoes;
}

function transformSonatas(rawFetters, sourceSha) {
  const sonatas = requireArray(rawFetters, 'Fetters').map((raw) => {
    if (!Number.isInteger(raw.id)) throw new Error('Sonata id must be an integer.');
    const name = englishName(raw, 'Sonata');
    const rawPieceEffects = Object.values(raw.pieceEffects ?? {})
      .map((effect) => ({
        pieces: Number(effect?.pieceCount),
        description: typeof effect?.effectDescription?.en === 'string'
          ? effect.effectDescription.en.trim()
          : '',
      }))
      .filter((effect) => Number.isInteger(effect.pieces) && effect.pieces > 0)
      .sort((a, b) => a.pieces - b.pieces);

    if (rawPieceEffects.length === 0) {
      throw new Error(`Sonata ${raw.id} ${name} has no usable piece-effect metadata.`);
    }

    return {
      kind: 'ECHO_SET',
      id: `sonata-${raw.id}`,
      name,
      releaseStatus: 'RELEASED',
      verificationStatus: 'PARTIALLY_VERIFIED',
      integrationStatus: 'DATA_ONLY',
      provenance: sourceProvenance(sourceSha, [
        'Raw effect text is stored for audit only; it is not a modeled trigger/uptime/stacks implementation.',
      ]),
      sourceId: raw.id,
      activationPieces: rawPieceEffects.map((effect) => effect.pieces),
      rawPieceEffects,
    };
  });

  sonatas.sort((a, b) => a.name.localeCompare(b.name) || a.sourceId - b.sourceId);
  const ids = new Set();
  for (const sonata of sonatas) {
    if (ids.has(sonata.id)) throw new Error(`Duplicate Sonata id ${sonata.id}.`);
    ids.add(sonata.id);
  }
  return sonatas;
}

function assertReferences(echoes, sonatas) {
  const sonataIds = new Set(sonatas.map((set) => set.id));
  for (const echo of echoes) {
    for (const setId of echo.sonataSetIds) {
      if (!sonataIds.has(setId)) {
        throw new Error(`${echo.name} references missing Sonata ${setId}.`);
      }
    }
  }
}

function tsLiteral(value) {
  return JSON.stringify(value, null, 2)
    .replaceAll('"kind": "ECHO"', 'kind: \'ECHO\'')
    .replaceAll('"kind": "ECHO_SET"', 'kind: \'ECHO_SET\'');
}

async function writeText(path, content) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, 'utf8');
}

async function main() {
  const commit = await fetchJson(`https://api.github.com/repos/${UPSTREAM_REPO}/commits/main`);
  const sourceSha = commit.sha;
  if (typeof sourceSha !== 'string' || sourceSha.length < 7) throw new Error('Could not resolve upstream commit SHA.');

  const base = `https://raw.githubusercontent.com/${UPSTREAM_REPO}/${sourceSha}/public/Data`;
  const [rawEchoes, rawFetters] = await Promise.all([
    fetchJson(`${base}/Echoes.json`),
    fetchJson(`${base}/Fetters.json`),
  ]);

  const echoes = transformEchoes(rawEchoes, sourceSha);
  const sonatas = transformSonatas(rawFetters, sourceSha);
  assertReferences(echoes, sonatas);

  const echoSource = `// AUTO-GENERATED by scripts/sync-echo-game-data.mjs. Do not hand-edit.\n` +
    `import type { EchoGameData } from '../gameDataDomain.ts';\n\n` +
    `export const ECHO_CATALOG = ${tsLiteral(echoes)} as const satisfies readonly EchoGameData[];\n`;

  const sonataSource = `// AUTO-GENERATED by scripts/sync-echo-game-data.mjs. Do not hand-edit.\n` +
    `import type { SonataGameData } from '../gameDataDomain.ts';\n\n` +
    `export const SONATA_CATALOG = ${tsLiteral(sonatas)} as const satisfies readonly SonataGameData[];\n`;

  const metaSource = `// AUTO-GENERATED by scripts/sync-echo-game-data.mjs. Do not hand-edit.\n` +
    `export const ECHO_CATALOG_META = ${JSON.stringify({
      sourceRepository: UPSTREAM_REPO,
      sourceCommit: sourceSha,
      syncedAt: SYNC_DATE,
      echoCount: echoes.length,
      sonataCount: sonatas.length,
      freshnessGate: REQUIRED_CURRENT_ECHO,
    }, null, 2)} as const;\n`;

  await Promise.all([
    writeText('src/data/echoes.ts', echoSource),
    writeText('src/data/sonatas.ts', sonataSource),
    writeText('src/data/echoCatalogMeta.ts', metaSource),
  ]);

  console.log(`Generated ${echoes.length} Echoes and ${sonatas.length} Sonata sets from ${sourceSha.slice(0, 7)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
