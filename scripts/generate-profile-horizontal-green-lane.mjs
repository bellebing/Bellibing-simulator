import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {CHARACTER_CATALOG} from '../src/data/characters.ts';
import {ECHO_CATALOG} from '../src/data/echoes.ts';
import {SONATA_CATALOG} from '../src/data/sonatas.ts';
import {WEAPON_CATALOG} from '../src/data/weapons.ts';
import {materializeApprovedProfileModes} from './lib/profile-cohort-promotion-materializer.mjs';
import {buildReviewedHorizontalProfileSourceInput} from './lib/profile-horizontal-source-materializer.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANONICAL_MAPPING_KIND = 'PROFILE_HORIZONTAL_CANONICAL_MAPPINGS';

function parseArgs(argv) {
  const args = {
    snapshot: null,
    review: 'data/research/profile-horizontal-semantic-review-2026-08-30.json',
    canonicalMappings: 'data/research/profile-horizontal-canonical-mappings-2026-08-30.json',
    output: null,
    splitOutputDir: null,
    candidateSnapshotOutput: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--snapshot') args.snapshot = argv[++index] ?? null;
    else if (arg === '--review') args.review = argv[++index] ?? args.review;
    else if (arg === '--canonical-mappings') args.canonicalMappings = argv[++index] ?? args.canonicalMappings;
    else if (arg === '--output') args.output = argv[++index] ?? null;
    else if (arg === '--split-output-dir') args.splitOutputDir = argv[++index] ?? null;
    else if (arg === '--candidate-snapshot-output') args.candidateSnapshotOutput = argv[++index] ?? null;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!args.snapshot) throw new Error('--snapshot is required');
  if (Boolean(args.output) === Boolean(args.splitOutputDir)) throw new Error('exactly one of --output or --split-output-dir is required');
  return args;
}

function nonEmpty(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) throw new Error(`${label} must be a non-empty string`);
  return value.trim();
}

function weaponRankNumber(value, label) {
  if (Number.isInteger(value) && value >= 1 && value <= 5) return value;
  const match = /^R([1-5])$/.exec(String(value ?? ''));
  if (!match) throw new Error(`${label} must be R1-R5`);
  return Number(match[1]);
}

function applyReviewedWeaponRanks(materialized, stagedInput) {
  const rankByCharacter = new Map(stagedInput.characters.map((character) => [
    character.characterId,
    weaponRankNumber(character.modes[0].weapon.rank, `${character.characterId}.weapon.rank`),
  ]));
  return {
    ...materialized,
    weaponRecommendations: materialized.weaponRecommendations.map((profile) => ({
      ...profile,
      options: profile.options.map((option, index) => index === 0 ? {...option, rank: rankByCharacter.get(profile.characterId)} : option),
    })),
  };
}

function approvedIds(review) {
  return new Set(review.entries.filter((entry) => entry.decision === 'APPROVED_FOR_CANONICAL_VERIFIED').map((entry) => entry.characterId));
}

function applyReviewedCanonicalMappings(stagedInput, mappings) {
  if (mappings?.kind !== CANONICAL_MAPPING_KIND) throw new Error(`canonical mapping kind must be ${CANONICAL_MAPPING_KIND}`);
  if (mappings?.automationMayInferMappings !== false) throw new Error('canonical mappings must explicitly forbid automation inference');
  if (!Array.isArray(mappings.sonataMappings)) throw new Error('sonataMappings must be an array');

  const byCharacter = new Map(stagedInput.characters.map((character) => [character.characterId, character]));
  const canonicalByName = new Map(SONATA_CATALOG.map((sonata) => [sonata.name, sonata]));
  const seen = new Set();

  for (const mapping of mappings.sonataMappings) {
    const characterId = nonEmpty(mapping.characterId, 'mapping.characterId');
    if (seen.has(characterId)) throw new Error(`duplicate Sonata mapping for ${characterId}`);
    seen.add(characterId);

    const character = byCharacter.get(characterId);
    if (!character) throw new Error(`Sonata mapping references non-approved Character ${characterId}`);
    const mode = character.modes?.[0];
    if (!mode?.echo) throw new Error(`${characterId} has no staged Echo data for Sonata mapping`);

    const candidateId = nonEmpty(mapping.candidateId, `${characterId}.candidateId`);
    const sourceName = nonEmpty(mapping.sourceName, `${characterId}.sourceName`);
    const canonicalName = nonEmpty(mapping.canonicalName, `${characterId}.canonicalName`);
    const canonicalId = nonEmpty(mapping.canonicalId, `${characterId}.canonicalId`);
    const evidence = Array.isArray(mapping.evidence) ? mapping.evidence.map((row, index) => nonEmpty(row, `${characterId}.evidence[${index}]`)) : [];
    if (evidence.length === 0) throw new Error(`${characterId} canonical mapping requires reviewer evidence`);

    if (!mode.echo.sourceCandidateIds?.includes(candidateId)) throw new Error(`${characterId} canonical mapping candidate ${candidateId} is not selected by the semantic review`);
    if (mode.echo.sonataSet !== sourceName) throw new Error(`${characterId} Sonata source-name drift: expected ${sourceName}, got ${mode.echo.sonataSet}`);

    const canonical = canonicalByName.get(canonicalName);
    if (!canonical || canonical.id !== canonicalId) throw new Error(`${characterId} canonical Sonata mapping ${canonicalName}/${canonicalId} does not resolve exactly`);

    mode.echo.sonataSet = canonicalName;
    mode.echo.context = `${mode.echo.context} Reviewer-confirmed source-name mapping ${sourceName} -> ${canonicalName} (${canonicalId}); ${evidence.join(' ')}`;
  }

  return stagedInput;
}

function pinnedCandidateSnapshot(snapshot, review) {
  const ids = approvedIds(review);
  const characters = snapshot.characters.filter((row) => ids.has(row.characterId)).map((row) => ({
    characterId: row.characterId,
    sourceUrl: row.sourceUrl,
    checkedAt: row.checkedAt,
    fetchStatus: row.fetchStatus,
    displayName: row.displayName,
    roleLeads: row.roleLeads,
    weapons: row.weapons.map((weapon) => ({sourceRank: weapon.sourceRank, name: weapon.name})),
    echoRecommendations: row.echoRecommendations.map((echo) => ({sourceRank: echo.sourceRank, name: echo.name, nameSource: echo.nameSource})),
    mainEchoLeads: row.mainEchoLeads,
    mainStats: row.mainStats,
    substatPriorityText: row.substatPriorityText,
    endgameStatLines: row.endgameStatLines,
    energyRegenText: row.energyRegenText,
    warnings: row.warnings,
  }));
  if (characters.length !== ids.size) throw new Error(`Pinned candidate snapshot resolved ${characters.length}/${ids.size} approved Characters`);
  return {
    kind: snapshot.kind,
    importStatus: snapshot.importStatus,
    verificationStatus: snapshot.verificationStatus,
    checkedAt: snapshot.checkedAt,
    sourceCheckpoint: {
      ...snapshot.sourceCheckpoint,
      exactWorkflowRunId: review.sourceSnapshot.workflowRunId,
      exactWorkflowHeadSha: review.sourceSnapshot.workflowHeadSha,
      exactArtifactId: review.sourceSnapshot.artifactId,
      exactArtifactDigest: review.sourceSnapshot.artifactDigest,
      subsetPolicy: 'APPROVED_CHARACTER_ROWS_VERBATIM_REQUIRED_FIELDS_ONLY',
    },
    characters,
    notes: [
      'Generated deterministically from the exact green Profile Source Extract artifact pinned by the semantic review.',
      'Weapon/Echo/Stats source values are copied from that snapshot; no source page is re-fetched and no build field is manually transcribed.',
      'This file remains CANDIDATE_ONLY / NOT_VERIFIED. Semantic approval lives only in the separate horizontal review.',
    ],
  };
}

function renderModule(materialized) {
  const json = (value) => JSON.stringify(value, null, 2);
  return `import type {\n  CharacterBuildPreset,\n  EchoLoadoutProfile,\n  RotationProfile,\n  StatTargetProfile,\n  TeamProfile,\n  WeaponRecommendationProfile,\n} from '../profileDomain.ts';\n\n// GENERATED by scripts/generate-profile-horizontal-green-lane.mjs from the pinned\n// Profile Source Extract snapshot + explicit horizontal semantic review.\n// Do not hand-edit build rows; change the review/candidate source and regenerate.\nexport const PROFILE_HORIZONTAL_GREEN_LANE_WEAPONS: readonly WeaponRecommendationProfile[] = ${json(materialized.weaponRecommendations)};\n\nexport const PROFILE_HORIZONTAL_GREEN_LANE_ECHOES: readonly EchoLoadoutProfile[] = ${json(materialized.echoLoadouts)};\n\nexport const PROFILE_HORIZONTAL_GREEN_LANE_STATS: readonly StatTargetProfile[] = ${json(materialized.statTargets)};\n\nexport const PROFILE_HORIZONTAL_GREEN_LANE_TEAMS: readonly TeamProfile[] = ${json(materialized.teams)};\n\nexport const PROFILE_HORIZONTAL_GREEN_LANE_ROTATIONS: readonly RotationProfile[] = ${json(materialized.rotations)};\n\nexport const PROFILE_HORIZONTAL_GREEN_LANE_PRESETS: readonly CharacterBuildPreset[] = ${json(materialized.presets)};\n\nexport const PROFILE_HORIZONTAL_GREEN_LANE_META = ${json(materialized.meta)} as const;\n`;
}

function renderSharedProvenanceRows(rows, characterIds, provenanceByCharacter) {
  if (rows.length !== characterIds.length) throw new Error('split renderer row count drift');
  return rows.map((row, index) => {
    const characterId = characterIds[index];
    if (JSON.stringify(row.provenance) !== JSON.stringify(provenanceByCharacter[characterId])) {
      throw new Error(`split renderer provenance drift for ${characterId}`);
    }
    const {provenance: _provenance, ...rest} = row;
    const body = JSON.stringify(rest);
    return `${body.slice(0, -1)},"provenance":PROFILE_HORIZONTAL_GREEN_LANE_PROVENANCE}`;
  });
}

function renderSplitCharacterModule(materialized, index) {
  const characterId = materialized.presets[index].characterId;
  const provenance = materialized.weaponRecommendations[index].provenance;
  const provenanceByCharacter = {[characterId]: provenance};
  const renderOne = (rows) => renderSharedProvenanceRows([rows[index]], [characterId], provenanceByCharacter)[0];
  return `import type {\n  CharacterBuildPreset,\n  EchoLoadoutProfile,\n  RotationProfile,\n  StatTargetProfile,\n  TeamProfile,\n  WeaponRecommendationProfile,\n} from '../../profileDomain.ts';\n\n// GENERATED by scripts/generate-profile-horizontal-green-lane.mjs. Do not hand-edit.\nconst PROFILE_HORIZONTAL_GREEN_LANE_PROVENANCE = ${JSON.stringify(provenance)};\n\nexport const WEAPONS: readonly WeaponRecommendationProfile[] = [${renderOne(materialized.weaponRecommendations)}];\nexport const ECHOES: readonly EchoLoadoutProfile[] = [${renderOne(materialized.echoLoadouts)}];\nexport const STATS: readonly StatTargetProfile[] = [${renderOne(materialized.statTargets)}];\nexport const TEAMS: readonly TeamProfile[] = [${renderOne(materialized.teams)}];\nexport const ROTATIONS: readonly RotationProfile[] = [${renderOne(materialized.rotations)}];\nexport const PRESETS: readonly CharacterBuildPreset[] = [${renderOne(materialized.presets)}];\n`;
}

function splitAlias(characterId) {
  return characterId.replace(/[^a-z0-9]+/gi, '_').toUpperCase();
}

function renderSplitIndex(materialized) {
  const characterIds = materialized.presets.map((preset) => preset.characterId);
  const imports = characterIds.map((characterId) => {
    const alias = splitAlias(characterId);
    return `import * as ${alias} from './${characterId}.ts';`;
  }).join('\n');
  const aliases = characterIds.map(splitAlias);
  const spread = (key) => aliases.map((alias) => `...${alias}.${key}`).join(', ');
  return `import type {\n  CharacterBuildPreset,\n  EchoLoadoutProfile,\n  RotationProfile,\n  StatTargetProfile,\n  TeamProfile,\n  WeaponRecommendationProfile,\n} from '../../profileDomain.ts';\n${imports}\n\n// GENERATED by scripts/generate-profile-horizontal-green-lane.mjs. Do not hand-edit.\nexport const PROFILE_HORIZONTAL_GREEN_LANE_WEAPONS: readonly WeaponRecommendationProfile[] = [${spread('WEAPONS')}];\nexport const PROFILE_HORIZONTAL_GREEN_LANE_ECHOES: readonly EchoLoadoutProfile[] = [${spread('ECHOES')}];\nexport const PROFILE_HORIZONTAL_GREEN_LANE_STATS: readonly StatTargetProfile[] = [${spread('STATS')}];\nexport const PROFILE_HORIZONTAL_GREEN_LANE_TEAMS: readonly TeamProfile[] = [${spread('TEAMS')}];\nexport const PROFILE_HORIZONTAL_GREEN_LANE_ROTATIONS: readonly RotationProfile[] = [${spread('ROTATIONS')}];\nexport const PROFILE_HORIZONTAL_GREEN_LANE_PRESETS: readonly CharacterBuildPreset[] = [${spread('PRESETS')}];\nexport const PROFILE_HORIZONTAL_GREEN_LANE_META = ${JSON.stringify(materialized.meta)} as const;\n`;
}

async function writeSplitOutput(materialized, relativeDir) {
  const outputDir = path.resolve(ROOT, relativeDir);
  await fs.mkdir(outputDir, {recursive: true});
  for (let index = 0; index < materialized.presets.length; index += 1) {
    const characterId = materialized.presets[index].characterId;
    await fs.writeFile(path.join(outputDir, `${characterId}.ts`), renderSplitCharacterModule(materialized, index), 'utf8');
  }
  await fs.writeFile(path.join(outputDir, 'index.ts'), renderSplitIndex(materialized), 'utf8');
}

const args = parseArgs(process.argv.slice(2));
const snapshot = JSON.parse(await fs.readFile(path.resolve(ROOT, args.snapshot), 'utf8'));
const review = JSON.parse(await fs.readFile(path.resolve(ROOT, args.review), 'utf8'));
const canonicalMappings = JSON.parse(await fs.readFile(path.resolve(ROOT, args.canonicalMappings), 'utf8'));
const approvedSourceIds = approvedIds(review);
const approvedSnapshot = {...snapshot, characters: snapshot.characters.filter((row) => approvedSourceIds.has(row.characterId))};
const staged = buildReviewedHorizontalProfileSourceInput(approvedSnapshot, review);
applyReviewedCanonicalMappings(staged.input, canonicalMappings);
const rawMaterialized = materializeApprovedProfileModes(staged.input, staged.semanticReview, {
  characters: CHARACTER_CATALOG,
  weapons: WEAPON_CATALOG,
  echoes: ECHO_CATALOG,
  sonatas: SONATA_CATALOG,
});
const materialized = applyReviewedWeaponRanks(rawMaterialized, staged.input);

if (materialized.meta.approvedCharacterCount !== review.summary.approvedCharacterCount) {
  throw new Error(`Materialized ${materialized.meta.approvedCharacterCount}/${review.summary.approvedCharacterCount} approved Characters`);
}
if (materialized.rotations.some((rotation) => rotation.executionStatus !== 'SOURCE_SEQUENCE_ONLY' || rotation.rotationSeconds != null || rotation.engineModelId != null)) {
  throw new Error('Horizontal materialization attempted to promote executable rotation timing');
}

if (args.output) {
  const outputPath = path.resolve(ROOT, args.output);
  await fs.mkdir(path.dirname(outputPath), {recursive: true});
  await fs.writeFile(outputPath, renderModule(materialized), 'utf8');
  console.log(`Wrote ${path.relative(ROOT, outputPath)}`);
} else {
  await writeSplitOutput(materialized, args.splitOutputDir);
  console.log(`Wrote split module directory ${args.splitOutputDir}`);
}

if (args.candidateSnapshotOutput) {
  const candidatePath = path.resolve(ROOT, args.candidateSnapshotOutput);
  await fs.mkdir(path.dirname(candidatePath), {recursive: true});
  await fs.writeFile(candidatePath, `${JSON.stringify(pinnedCandidateSnapshot(snapshot, review), null, 2)}\n`, 'utf8');
}

console.log(`Horizontal profile materialization: approved=${staged.approvedCharacterIds.length} parked=${staged.parkedCharacterIds.length}.`);
console.log(`Canonical source-name mappings: ${canonicalMappings.sonataMappings.length}.`);
console.log(`Weapon ranks: ${materialized.weaponRecommendations.map((row) => `${row.characterId}=R${row.options[0].rank}`).join(', ')}.`);
console.log('All materialized rotations remain SOURCE_SEQUENCE_ONLY; numeric ER gates remain absent in this tranche.');
if (args.candidateSnapshotOutput) console.log(`Wrote ${args.candidateSnapshotOutput}`);
