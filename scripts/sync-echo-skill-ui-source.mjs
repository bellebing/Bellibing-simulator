import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';

import { ECHO_SKILL_SOURCE_REVIEW_V36 as review } from '../src/data/echoSkillSourceReview.ts';

const url = `https://raw.githubusercontent.com/${review.sourceRepository}/${review.sourceCommit}/${review.sourcePath}`;
const response = await fetch(url);
if (!response.ok) throw new Error(`Echo Skill source fetch failed: ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
const blob = createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
if (blob !== review.sourceBlobSha) throw new Error(`Echo Skill source blob drift: ${blob}`);
const raw = JSON.parse(bytes.toString('utf8'));
if (raw.length !== review.expectedReleasedEchoCount) throw new Error('Echo Skill source coverage drift.');
const rows = raw.map(echo => ({
  echoId: `echo-${echo.id}`,
  name: echo.name.en.trim(),
  descriptionTemplate: echo.skill.description.en.trim(),
  rank5Params: echo.skill.params[4].ArrayString,
}));
if (rows.some(row => !row.descriptionTemplate || !row.rank5Params?.length)) throw new Error('Incomplete Echo Skill source.');
const target = 'src/data/echoSkillRaw.ts';
writeFileSync(target, `// GENERATED from ${review.sourceRepository}/${review.sourcePath} at ${review.sourceCommit}.\n// Pinned Git blob: ${blob}. Raw Rank-5 text and parameters; no combat model.\nexport const ECHO_SKILL_RAW = ${JSON.stringify(rows, null, 2)} as const;\n`);
console.log(`Exported ${rows.length} source-backed Echo Skills to ${target}.`);
