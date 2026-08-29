import { mkdir, writeFile } from 'node:fs/promises';

const UPSTREAM_REPO = 'DommyMM/wuwabuild';
const SOURCE_COMMIT = '5fa70b11f1d84fb644e4dbed47873708da0fe66f';
const SOURCE_PATH = 'public/Data/Echoes.json';
const OUTPUT = '.artifacts/echo-skill-source-inventory.json';

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Bellibing-simulator Echo skill source inventory',
      Accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`Fetch failed ${response.status}: ${url}`);
  return response.json();
}

function englishText(value) {
  return typeof value?.en === 'string' ? value.en.trim() : '';
}

function rankParams(skill) {
  if (!Array.isArray(skill?.params)) return [];
  return skill.params.map((rank, index) => ({
    rank: index + 1,
    values: Array.isArray(rank?.ArrayString) ? [...rank.ArrayString] : [],
  }));
}

function countBy(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

async function main() {
  const sourceUrl = `https://raw.githubusercontent.com/${UPSTREAM_REPO}/${SOURCE_COMMIT}/${SOURCE_PATH}`;
  const raw = await fetchJson(sourceUrl);
  if (!Array.isArray(raw)) throw new Error('Echoes.json must be an array.');

  const records = raw.map((echo) => {
    const description = englishText(echo?.skill?.description);
    const params = rankParams(echo?.skill);
    return {
      echoId: Number.isInteger(echo?.id) ? `echo-${echo.id}` : null,
      sourceId: echo?.id ?? null,
      name: englishText(echo?.name),
      cost: echo?.cost ?? null,
      elementIds: Array.isArray(echo?.element) ? [...echo.element] : [],
      description,
      params,
      rank5Params: params.find((row) => row.rank === 5)?.values ?? [],
      bonuses: Array.isArray(echo?.bonuses) ? echo.bonuses : [],
      legacyId: echo?.legacyId ?? null,
    };
  });

  const missingDescription = records.filter((row) => row.description.length === 0).map((row) => row.echoId);
  const missingFiveRanks = records.filter((row) => row.params.length !== 5).map((row) => row.echoId);
  const missingRank5Params = records.filter((row) => row.rank5Params.length === 0).map((row) => row.echoId);
  const allElementIds = records.flatMap((row) => row.elementIds.map(String));
  const parameterCountDistribution = countBy(records.map((row) => String(row.rank5Params.length)));

  const inventory = {
    sourceRepository: UPSTREAM_REPO,
    sourceCommit: SOURCE_COMMIT,
    sourcePath: SOURCE_PATH,
    recordCount: records.length,
    summary: {
      missingDescription,
      missingFiveRanks,
      missingRank5Params,
      elementIdCounts: countBy(allElementIds),
      parameterCountDistribution,
      recordsWithBonuses: records.filter((row) => row.bonuses.length > 0).map((row) => row.echoId),
      recordsWithLegacyId: records.filter((row) => row.legacyId !== null).map((row) => row.echoId),
    },
    records,
  };

  await mkdir('.artifacts', { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    sourceCommit: SOURCE_COMMIT,
    recordCount: records.length,
    missingDescription: missingDescription.length,
    missingFiveRanks: missingFiveRanks.length,
    missingRank5Params: missingRank5Params.length,
    parameterCountDistribution,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
