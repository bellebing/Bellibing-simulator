import { createHash } from 'node:crypto';

import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { auditEchoSkillCoverage } from '../src/echoSkillCoverageRegistry.ts';
import {
  ECHO_SKILL_SOURCE_REVIEW_V36,
  ECHO_SKILL_SOURCE_UNUSED_PARAM_RECORDS,
} from '../src/data/echoSkillSourceReview.ts';

const review = ECHO_SKILL_SOURCE_REVIEW_V36;
const sourceUrl = `https://raw.githubusercontent.com/${review.sourceRepository}/${review.sourceCommit}/${review.sourcePath}`;

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}.`);
}

function english(value) {
  return typeof value?.en === 'string' ? value.en.trim() : '';
}

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return createHash('sha1').update(header).update(buffer).digest('hex');
}

function rankValues(skill, rankIndex) {
  const values = skill?.params?.[rankIndex]?.ArrayString;
  return Array.isArray(values) ? values : [];
}

async function main() {
  const response = await fetch(sourceUrl, {
    headers: {
      'User-Agent': 'Bellibing-simulator Echo skill source audit',
      Accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`Fetch failed ${response.status}: ${sourceUrl}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  assertEqual(gitBlobSha(bytes), review.sourceBlobSha, 'Echoes.json Git blob SHA');

  const raw = JSON.parse(bytes.toString('utf8'));
  if (!Array.isArray(raw)) throw new Error('Echoes.json must be an array.');
  assertEqual(raw.length, review.expectedReleasedEchoCount, 'source Echo count');

  const catalogBySourceId = new Map(ECHO_CATALOG.map((row) => [row.sourceId, row]));
  assertEqual(catalogBySourceId.size, review.expectedReleasedEchoCount, 'Bellibing raw Echo source-id count');

  let englishDescriptionCount = 0;
  let fiveRankParamRecordCount = 0;
  let cooldownRecordCount = 0;
  let skillNameFieldCount = 0;
  let damageTextRecordCount = 0;
  let mainSlotTextRecordCount = 0;
  let structuredBonusEchoCount = 0;
  let structuredBonusRowCount = 0;
  let characterConditionBonusRowCount = 0;
  const unusedParamRecords = [];
  const cooldownDistribution = new Map();

  for (const echo of raw) {
    if (!Number.isInteger(echo?.id)) throw new Error('Source Echo id must be an integer.');
    const catalog = catalogBySourceId.get(echo.id);
    if (!catalog) throw new Error(`Source Echo ${echo.id} is not present in the Bellibing released catalog.`);
    const sourceName = english(echo.name);
    if (sourceName !== catalog.name) {
      throw new Error(`Echo name drift for ${echo.id}: source=${JSON.stringify(sourceName)} catalog=${JSON.stringify(catalog.name)}.`);
    }

    const description = english(echo?.skill?.description);
    if (description) englishDescriptionCount += 1;
    if (Object.hasOwn(echo?.skill ?? {}, 'name')) skillNameFieldCount += 1;
    if (/\bDMG\b/.test(description)) damageTextRecordCount += 1;
    if (/main slot/i.test(description)) mainSlotTextRecordCount += 1;

    if (Array.isArray(echo?.skill?.params) && echo.skill.params.length === 5 && echo.skill.params.every((rank) => Array.isArray(rank?.ArrayString))) {
      fiveRankParamRecordCount += 1;
    }

    const cooldownMatch = description.match(/\b(?:CD|Cooldown):?\s*\{(\d+)\}s/i);
    if (cooldownMatch) {
      const index = Number(cooldownMatch[1]);
      const rank5 = rankValues(echo.skill, 4);
      const rawCooldown = rank5[index];
      const cooldown = typeof rawCooldown === 'string' && !rawCooldown.includes('%') ? Number(rawCooldown) : Number.NaN;
      if (Number.isFinite(cooldown) && cooldown > 0) {
        cooldownRecordCount += 1;
        cooldownDistribution.set(cooldown, (cooldownDistribution.get(cooldown) ?? 0) + 1);
      }
    }

    const bonuses = Array.isArray(echo?.bonuses) ? echo.bonuses : [];
    if (bonuses.length > 0) structuredBonusEchoCount += 1;
    structuredBonusRowCount += bonuses.length;
    characterConditionBonusRowCount += bonuses.filter((bonus) => Array.isArray(bonus?.characterCondition)).length;

    const rank5 = rankValues(echo.skill, 4);
    const usedIndexes = new Set([...description.matchAll(/\{(\d+)\}/g)].map((match) => Number(match[1])));
    const unusedIndexes = rank5.map((_, index) => index).filter((index) => !usedIndexes.has(index));
    if (unusedIndexes.length > 0) unusedParamRecords.push({ echoId: `echo-${echo.id}`, unusedIndexes });
  }

  assertEqual(englishDescriptionCount, review.expectedEnglishDescriptionCount, 'English skill description count');
  assertEqual(fiveRankParamRecordCount, review.expectedFiveRankParamRecordCount, 'five-rank parameter record count');
  assertEqual(cooldownRecordCount, review.expectedCooldownRecordCount, 'source-explicit cooldown record count');
  assertEqual(skillNameFieldCount, review.expectedSkillNameFieldCount, 'dedicated source skill-name field count');
  assertEqual(damageTextRecordCount, review.expectedDamageTextRecordCount, 'damage-text record count');
  assertEqual(raw.length - damageTextRecordCount, review.expectedNoDamageTextRecordCount, 'no-damage-text record count');
  assertEqual(mainSlotTextRecordCount, review.expectedMainSlotTextRecordCount, 'main-slot text record count');
  assertEqual(structuredBonusEchoCount, review.expectedStructuredBonusEchoCount, 'structured-bonus Echo count');
  assertEqual(structuredBonusRowCount, review.expectedStructuredBonusRowCount, 'structured-bonus row count');
  assertEqual(characterConditionBonusRowCount, review.expectedCharacterConditionBonusRowCount, 'character-condition bonus row count');
  assertEqual(unusedParamRecords.length, review.expectedUnusedParamRecordCount, 'unused source-param record count');

  const expectedUnused = new Map(ECHO_SKILL_SOURCE_UNUSED_PARAM_RECORDS.map((row) => [row.echoId, [...row.unusedRankParamIndexes]]));
  for (const row of unusedParamRecords) {
    const expected = expectedUnused.get(row.echoId);
    if (!expected || JSON.stringify(row.unusedIndexes) !== JSON.stringify(expected)) {
      throw new Error(`Unexpected source parameter usage discrepancy for ${row.echoId}: ${JSON.stringify(row.unusedIndexes)}.`);
    }
  }

  const expectedCooldownDistribution = new Map([[8, 69], [12, 1], [15, 56], [20, 43], [25, 12]]);
  for (const [seconds, expectedCount] of expectedCooldownDistribution) {
    assertEqual(cooldownDistribution.get(seconds) ?? 0, expectedCount, `${seconds}s Echo cooldown count`);
  }
  assertEqual(cooldownDistribution.size, expectedCooldownDistribution.size, 'Echo cooldown distinct-value count');

  const coverage = auditEchoSkillCoverage();
  console.log(JSON.stringify({
    sourceCommit: review.sourceCommit,
    sourceBlobSha: review.sourceBlobSha,
    reviewedEchoes: raw.length,
    cooldownDistribution: Object.fromEntries([...cooldownDistribution.entries()].sort((a, b) => a[0] - b[0])),
    source: {
      englishDescriptionCount,
      fiveRankParamRecordCount,
      cooldownRecordCount,
      damageTextRecordCount,
      noDamageTextRecordCount: raw.length - damageTextRecordCount,
      mainSlotTextRecordCount,
      structuredBonusEchoCount,
      structuredBonusRowCount,
      characterConditionBonusRowCount,
      unusedParamRecordCount: unusedParamRecords.length,
      dedicatedSkillNameFieldCount: skillNameFieldCount,
    },
    coverage,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
