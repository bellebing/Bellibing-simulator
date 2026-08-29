import {
  ECHO_RAW_SOURCE_REVIEW_V36,
  auditEchoRawRoster,
} from '../src/data/echoRawAudit.ts';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_CATALOG } from '../src/data/sonatas.ts';

const UPSTREAM_REPO = 'DommyMM/wuwabuild';

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Bellibing-simulator Echo raw audit',
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

function upstreamEchoProjection(rawEchoes) {
  return requireArray(rawEchoes, 'Echoes').map((raw) => {
    if (!Number.isInteger(raw.id)) throw new Error('Echo id must be an integer.');
    if (![1, 3, 4].includes(raw.cost)) throw new Error(`Unexpected Echo COST ${raw.cost} for ${raw.id}.`);
    if (!Array.isArray(raw.fetter) || raw.fetter.some((value) => !Number.isInteger(value))) {
      throw new Error(`Echo ${raw.id} has invalid Sonata/fetter ids.`);
    }
    return {
      id: `echo-${raw.id}`,
      sourceId: raw.id,
      name: englishName(raw, 'Echo'),
      cost: raw.cost,
      sonataSetIds: [...new Set(raw.fetter.map((id) => `sonata-${id}`))].sort(),
    };
  });
}

function upstreamSonataProjection(rawFetters) {
  return requireArray(rawFetters, 'Fetters').map((raw) => {
    if (!Number.isInteger(raw.id)) throw new Error('Sonata id must be an integer.');
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
      throw new Error(`Sonata ${raw.id} ${englishName(raw, 'Sonata')} has no usable piece-effect metadata.`);
    }
    return {
      id: `sonata-${raw.id}`,
      sourceId: raw.id,
      name: englishName(raw, 'Sonata'),
      activationPieces: rawPieceEffects.map((effect) => effect.pieces),
      rawPieceEffects,
    };
  });
}

function repoEchoProjection() {
  return ECHO_CATALOG.map((echo) => ({
    id: echo.id,
    sourceId: echo.sourceId,
    name: echo.name,
    cost: echo.cost,
    sonataSetIds: [...echo.sonataSetIds].sort(),
  }));
}

function repoSonataProjection() {
  return SONATA_CATALOG.map((set) => ({
    id: set.id,
    sourceId: set.sourceId,
    name: set.name,
    activationPieces: [...set.activationPieces],
    rawPieceEffects: set.rawPieceEffects.map((effect) => ({ ...effect })),
  }));
}

function mismatchFields(repoRecord, sourceRecord, fields) {
  return fields.filter((field) => JSON.stringify(repoRecord[field]) !== JSON.stringify(sourceRecord[field]));
}

function conflictFor(scope, id) {
  return ECHO_RAW_SOURCE_REVIEW_V36.sourceConflicts.find(
    (conflict) => conflict.scope === scope && conflict.recordId === id,
  );
}

function compareProjection(scope, repoRecords, sourceRecords, fields) {
  const issues = [];
  const documentedConflicts = [];
  const staleWrong = [];
  const missing = [];
  const extraObsolete = [];
  const repoById = new Map(repoRecords.map((record) => [record.id, record]));
  const sourceById = new Map(sourceRecords.map((record) => [record.id, record]));

  for (const sourceRecord of sourceRecords) {
    const repoRecord = repoById.get(sourceRecord.id);
    if (!repoRecord) {
      missing.push(sourceRecord.id);
      issues.push(`${scope} MISSING ${sourceRecord.id} (${sourceRecord.name}) from Bellibing raw catalog.`);
      continue;
    }
    const mismatches = mismatchFields(repoRecord, sourceRecord, fields);
    if (mismatches.length === 0) continue;

    const conflict = conflictFor(scope, sourceRecord.id);
    if (conflict && mismatches.every((field) => conflict.fields.includes(field))) {
      documentedConflicts.push(`${sourceRecord.id}: ${mismatches.join(', ')}`);
      continue;
    }

    staleWrong.push(`${sourceRecord.id}: ${mismatches.join(', ')}`);
    issues.push(`${scope} STALE/WRONG ${sourceRecord.id}: ${mismatches.join(', ')} differ from current upstream raw projection.`);
  }

  for (const repoRecord of repoRecords) {
    if (!sourceById.has(repoRecord.id)) {
      extraObsolete.push(repoRecord.id);
      issues.push(`${scope} EXTRA/OBSOLETE ${repoRecord.id} (${repoRecord.name}) is absent from current upstream raw projection.`);
    }
  }

  return {
    issues,
    documentedConflicts,
    staleWrong,
    missing,
    extraObsolete,
  };
}

async function main() {
  const localAudit = auditEchoRawRoster();
  const commit = await fetchJson(`https://api.github.com/repos/${UPSTREAM_REPO}/commits/main`);
  const sourceSha = commit.sha;
  if (typeof sourceSha !== 'string' || !/^[0-9a-f]{40}$/.test(sourceSha)) {
    throw new Error('Could not resolve current upstream commit SHA.');
  }

  const base = `https://raw.githubusercontent.com/${UPSTREAM_REPO}/${sourceSha}/public/Data`;
  const [rawEchoes, rawFetters] = await Promise.all([
    fetchJson(`${base}/Echoes.json`),
    fetchJson(`${base}/Fetters.json`),
  ]);

  const echoSource = upstreamEchoProjection(rawEchoes);
  const sonataSource = upstreamSonataProjection(rawFetters);
  const echoDiff = compareProjection(
    'ECHO',
    repoEchoProjection(),
    echoSource,
    ['sourceId', 'name', 'cost', 'sonataSetIds'],
  );
  const sonataDiff = compareProjection(
    'SONATA',
    repoSonataProjection(),
    sonataSource,
    ['sourceId', 'name', 'activationPieces', 'rawPieceEffects'],
  );

  const sourceIssues = [...echoDiff.issues, ...sonataDiff.issues];
  const issues = [
    ...localAudit.issues.map((issue) => `${issue.code}: ${issue.detail}`),
    ...sourceIssues,
  ];

  console.log(`Echo/Sonata raw audit — Version ${ECHO_RAW_SOURCE_REVIEW_V36.patch}`);
  console.log(`Reviewed contract: ${ECHO_RAW_SOURCE_REVIEW_V36.checkedAt}`);
  console.log(`Current upstream: ${sourceSha}`);
  if (sourceSha !== ECHO_RAW_SOURCE_REVIEW_V36.reviewedCurrentSourceCommit) {
    console.log(`Upstream head advanced from reviewed checkpoint ${ECHO_RAW_SOURCE_REVIEW_V36.reviewedCurrentSourceCommit}; raw projection is compared live below.`);
  }
  console.log(`A. VERIFIED CURRENT: ${localAudit.verifiedCurrentEchoCount} Echoes / ${localAudit.verifiedCurrentSonataCount} Sonata sets`);
  console.log(`B. STALE / WRONG: ${echoDiff.staleWrong.length + sonataDiff.staleWrong.length}`);
  console.log(`C. MISSING: ${echoDiff.missing.length + sonataDiff.missing.length}`);
  console.log(`D. SOURCE_CONFLICT: ${localAudit.sourceConflictCount}`);
  console.log(`E. EXTRA / OBSOLETE: ${echoDiff.extraObsolete.length + sonataDiff.extraObsolete.length}`);

  for (const conflict of [...echoDiff.documentedConflicts, ...sonataDiff.documentedConflicts]) {
    console.log(`SOURCE_CONFLICT: ${conflict}`);
  }

  if (issues.length > 0) {
    console.error(`Echo/Sonata raw coverage gate failed with ${issues.length} issue(s):`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
    return;
  }

  console.log('Echo/Sonata raw coverage gate passed. Current upstream projection matches the reviewed Bellibing raw catalog.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
