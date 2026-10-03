import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { CHARACTER_RECOMMENDATION_UNITS } from '../src/characterRecommendationDomain.ts';
import type { CharacterRecommendationSource, CharacterRecommendationReview, RecommendationValue } from '../src/characterRecommendationDomain.ts';
import { CHARACTER_RECOMMENDATION_SOURCES, CHARACTER_RECOMMENDATION_REVIEWS } from '../src/data/characterRecommendationSourceReview.ts';
import { interpretRecommendationText, projectRecommendedCharacterStats } from '../src/characterRecommendationSources.ts';
import { improvePolicySourceBinding } from '../src/improvePolicySources.ts';

// Synthetic evidence only: these numbers assert contract semantics, not WW facts.
async function fixture(text = '116-125%', value: RecommendationValue = { kind: 'BOUNDED_RANGE', minimum: 1.16, upper: 1.25 }) {
  const source: CharacterRecommendationSource = {
    id: 'synthetic-source', characterId: 'synthetic', researchArtifact: 'test fixture', researchBinding: 'test-only',
    evidence: [{ id: 'synthetic-er', characterId: 'synthetic', metric: 'TOTAL_ENERGY_REGEN',
      sourceIdentity: 'Synthetic contract fixture', sourceUrl: 'https://example.com/synthetic', checkedAt: '2026-10-03',
      evidenceClass: 'PRIMARY_SOURCE_CAPTURE', artifact: 'test fixture', locator: 'ER row', originalText: text,
      excerpt: text, context: { description: 'Synthetic conditional ER recommendation.',
        conditions: ['Upper end in synthetic team/rotation only.'], team: 'Synthetic team', weapon: 'Synthetic weapon',
        sequence: 'Synthetic sequence', rotation: 'Synthetic rotation', measurementBasis: 'Before synthetic buff' } }],
  };
  const review: CharacterRecommendationReview = { id: 'synthetic-review', characterId: 'synthetic', sourceId: source.id,
    checkedAt: '2026-10-03', sourceBinding: await improvePolicySourceBinding(source),
    rows: [{ metric: 'TOTAL_ENERGY_REGEN', decision: 'APPROVED_FOR_CANONICAL_VERIFIED',
      evidenceIds: ['synthetic-er'], reason: 'Synthetic semantic approval.', interpretation: value }] };
  return { source, review };
}
async function project(f: Awaited<ReturnType<typeof fixture>>) {
  return projectRecommendedCharacterStats('synthetic', { sources: [f.source], reviews: [f.review] });
}

test('Augusta explicit pilot review keeps seven rows Pending with no guessed values', async () => {
  const result = await projectRecommendedCharacterStats('augusta');
  assert.equal(result.sourceReviewStatus, 'PENDING');
  assert.deepEqual(result.rows.map(row => row.metric), ['TOTAL_HP', 'TOTAL_DEF', 'TOTAL_ATK', 'TOTAL_CRIT_RATE',
    'TOTAL_CRIT_DAMAGE', 'TOTAL_ENERGY_REGEN', 'ELECTRO_DMG_BONUS']);
  for (const row of result.rows) {
    assert.equal(row.status, 'PENDING'); assert.equal(row.value, null);
    assert.equal(row.unit, CHARACTER_RECOMMENDATION_UNITS[row.metric]);
    assert.equal(row.comparisonStatus, 'PENDING');
  }
  assert.equal(result.rows.filter(row => row.evidence.length).length, 1);
});

test('Augusta provenance retains capture date, exact legacy paraphrase and conditional context', async () => {
  const result = await projectRecommendedCharacterStats('augusta');
  const er = result.rows.find(row => row.metric === 'TOTAL_ENERGY_REGEN')!;
  assert.equal(er.evidence[0]!.checkedAt, '2026-08-29');
  assert.equal(er.evidence[0]!.originalText, null);
  assert.equal(er.evidence[0]!.evidenceClass, 'LEGACY_PROFILE_REFERENCE');
  assert.equal(er.evidence[0]!.context.team, 'Iuno + Shorekeeper');
  assert.match(er.evidence[0]!.excerpt, /116%-125%/);
  assert.equal(er.sourceBinding, CHARACTER_RECOMMENDATION_REVIEWS[0]!.sourceBinding);
  assert.equal(await improvePolicySourceBinding(CHARACTER_RECOMMENDATION_SOURCES[0]), er.sourceBinding);
});

test('research artifact pin and candidate provenance are exact and remain NOT_VERIFIED', () => {
  const source = CHARACTER_RECOMMENDATION_SOURCES[0]!;
  const bytes = readFileSync(new URL('../' + source.researchArtifact, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), source.researchBinding);
  const research = JSON.parse(bytes.toString());
  const candidateBytes = readFileSync(new URL('../' + research.candidateResearch.artifact, import.meta.url));
  const candidate = JSON.parse(candidateBytes.toString());
  assert.equal(createHash('sha256').update(candidateBytes).digest('hex'), research.candidateResearch.sha256);
  assert.equal(candidate.importStatus, 'CANDIDATE_ONLY'); assert.equal(candidate.verificationStatus, 'NOT_VERIFIED');
  assert.equal(candidate.characters.some((row: { characterId: string }) => row.characterId === 'augusta'), false);
  assert.equal(research.verificationStatus, 'NOT_VERIFIED');
  assert.equal(research.automationMayApproveSemanticTruth, false);
});

for (const [text, unit, value] of [
  ['14500+', 'POINTS', { kind: 'MINIMUM', minimum: 14500 }],
  ['116-125%', 'RATIO', { kind: 'BOUNDED_RANGE', minimum: 1.16, upper: 1.25 }],
  ['100%', 'RATIO', { kind: 'EXACT', target: 1 }],
  ['2000-2800', 'POINTS', { kind: 'BOUNDED_RANGE', minimum: 2000, upper: 2800 }],
] as const) {
  test(`source text semantics: ${text}`, () => {
    assert.deepEqual(interpretRecommendationText(text, unit), { status: 'NORMALIZED', value });
  });
}
for (const [text, unit] of [['2000-2800+', 'POINTS'], ['65-80%+', 'RATIO'], ['40-70%+', 'RATIO']] as const) {
  test(`trailing plus range ${text} has no fabricated minimum/preferred/maximum`, () => {
    const parsed = interpretRecommendationText(text, unit);
    assert.equal(parsed.status, 'UNRESOLVED');
    assert.ok('sourceEndpoints' in parsed);
    assert.ok(!('value' in parsed));
  });
}
test('unsupported text, unit mismatches, reversed endpoints and nonfinite values fail closed', () => {
  for (const text of ['65-80%+ (before S6)', '1900-2200b+', '-1%', '125-116%', 'Infinity%', '100', 'NaN%']) {
    assert.equal(interpretRecommendationText(text, 'RATIO').status, 'UNRESOLVED');
  }
  assert.equal(interpretRecommendationText('100%', 'POINTS').status, 'UNRESOLVED');
  assert.equal(interpretRecommendationText('9'.repeat(400) + '+', 'POINTS').status, 'UNRESOLVED');
});

test('explicit primary approval preserves bounded range and source conditions without preferred inference', async () => {
  const f = await fixture(); const result = await project(f);
  assert.equal(result.sourceReviewStatus, 'CURRENT');
  assert.equal(result.rows[0]!.status, 'VERIFIED');
  assert.deepEqual(result.rows[0]!.value, f.review.rows[0]!.interpretation);
  assert.deepEqual(result.rows[0]!.evidence[0]!.context, f.source.evidence[0]!.context);
  assert.equal(result.rows[0]!.comparisonStatus, 'PENDING');
  assert.ok(!('preferred' in result.rows[0]!.value!));
});

test('minimum-only and exact approvals retain different domain identities', async () => {
  for (const [text, value] of [['116%+', { kind: 'MINIMUM', minimum: 1.16 }],
    ['100%', { kind: 'EXACT', target: 1 }]] as const) {
    const result = await project(await fixture(text, value));
    assert.equal(result.rows[0]!.status, 'VERIFIED'); assert.deepEqual(result.rows[0]!.value, value);
  }
});

test('Electro bonus is a distinct whole-build ratio metric, never an Echo roll or ATK alias', async () => {
  const f = await fixture('40-70%', { kind: 'BOUNDED_RANGE', minimum: .4, upper: .7 });
  f.source = { ...f.source, evidence: f.source.evidence.map(item => ({ ...item, metric: 'ELECTRO_DMG_BONUS' })) };
  f.review = { ...f.review, sourceBinding: await improvePolicySourceBinding(f.source),
    rows: f.review.rows.map(row => ({ ...row, metric: 'ELECTRO_DMG_BONUS' })) };
  const result = await project(f);
  assert.equal(result.rows[0]!.metric, 'ELECTRO_DMG_BONUS');
  assert.equal(result.rows[0]!.unit, 'RATIO'); assert.equal(result.rows[0]!.status, 'VERIFIED');
});

for (const evidenceClass of ['CANDIDATE_ONLY', 'LEGACY_PROFILE_REFERENCE'] as const) {
  test(`${evidenceClass} cannot become VERIFIED even with matching pin and approval`, async () => {
    const f = await fixture();
    f.source = { ...f.source, evidence: f.source.evidence.map(item => ({ ...item, evidenceClass })) };
    f.review = { ...f.review, sourceBinding: await improvePolicySourceBinding(f.source) };
    const result = await project(f);
    assert.equal(result.rows[0]!.status, 'REVIEW_REQUIRED'); assert.equal(result.rows[0]!.value, null);
  });
}

test('source text, provenance, context and research binding drift fail closed', async () => {
  const f = await fixture();
  const changed = [
    { ...f.source, researchBinding: 'changed' },
    ...['originalText', 'checkedAt', 'sourceUrl', 'context'].map(key => ({ ...f.source,
      evidence: f.source.evidence.map(item => ({ ...item, [key]: key === 'context'
        ? { ...item.context, team: 'Changed team' } : 'changed' })) })),
  ];
  for (const source of changed) {
    const result = await project({ source, review: f.review });
    assert.equal(result.rows[0]!.status, 'REVIEW_REQUIRED'); assert.equal(result.rows[0]!.value, null);
  }
});

test('disagreement is recorded as review required, without choosing or averaging', async () => {
  const f = await fixture();
  f.source = { ...f.source, evidence: [...f.source.evidence, { ...f.source.evidence[0]!,
    id: 'synthetic-other-source', sourceIdentity: 'Synthetic independent source', originalText: '120-130%', excerpt: '120-130%' }] };
  f.review = { ...f.review, sourceBinding: await improvePolicySourceBinding(f.source),
    rows: f.review.rows.map(row => ({ ...row, evidenceIds: ['synthetic-er', 'synthetic-other-source'] })) };
  const result = await project(f);
  assert.equal(result.rows[0]!.status, 'REVIEW_REQUIRED'); assert.equal(result.rows[0]!.evidence.length, 2);
  assert.equal(result.rows[0]!.value, null);
});

test('ambiguous or unsupported wording cannot approve a fabricated interpretation', async () => {
  for (const text of ['116-125%+', '116-125% with synthetic team']) {
    const result = await project(await fixture(text));
    assert.equal(result.rows[0]!.status, 'REVIEW_REQUIRED'); assert.equal(result.rows[0]!.value, null);
  }
});

test('missing metric evidence, duplicate evidence/reviews and mismatched identities fail closed', async () => {
  const f = await fixture();
  const reviews = [
    { ...f.review, sourceId: 'wrong' },
    { ...f.review, rows: f.review.rows.map(row => ({ ...row, evidenceIds: [] })) },
    { ...f.review, rows: [...f.review.rows, ...f.review.rows] },
    { ...f.review, rows: f.review.rows.map(row => ({ ...row, metric: 'TOTAL_ATK' as const })) },
  ];
  for (const review of reviews) {
    const result = await project({ ...f, review });
    assert.equal(result.rows[0]!.status, 'REVIEW_REQUIRED'); assert.equal(result.rows[0]!.value, null);
  }
  const duplicate = await projectRecommendedCharacterStats('synthetic', { sources: [f.source], reviews: [f.review, f.review] });
  assert.equal(duplicate.sourceReviewStatus, 'REVIEW_REQUIRED');
});

test('unreviewed roster remains Pending without universal rows or legacy inference', async () => {
  for (const characterId of ['cartethyia', 'not-a-character']) {
    assert.deepEqual(await projectRecommendedCharacterStats(characterId), { characterId, sourceReviewStatus: 'PENDING', rows: [] });
  }
  const implementation = readFileSync(new URL('../src/characterRecommendationSources.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(implementation, /statTarget\.gates|targetRules|projectRecommendedImprovePolicy|SUBSTAT_VALUE_TABLE/);
  const ui = await import('../docs/ui-prototypes/assets/character-target-presentation.js');
  assert.ok(ui.recommendedCharacterStatsPresentation('augusta').every((row: { status: string }) => row.status === 'PENDING'));
});

test('projection outputs are detached and cannot mutate later source resolution', async () => {
  const result = await projectRecommendedCharacterStats('augusta');
  (result.rows[5]!.evidence[0]!.context.conditions as string[]).push('mutation');
  const next = await projectRecommendedCharacterStats('augusta');
  assert.equal(next.rows[5]!.evidence[0]!.context.conditions.length, 1);
});

test('parseable primary evidence stays Pending until explicit semantic approval', async () => {
  const f = await fixture();
  f.review = { ...f.review, rows: f.review.rows.map(row => ({ ...row, decision: 'PENDING', interpretation: null })) };
  const result = await project(f);
  assert.equal(result.rows[0]!.status, 'PENDING'); assert.equal(result.rows[0]!.value, null);
});

test('duplicate source/evidence and unknown runtime metrics cannot report CURRENT', async () => {
  const f = await fixture();
  const duplicateSource = await projectRecommendedCharacterStats('synthetic', { sources: [f.source, f.source], reviews: [f.review] });
  assert.equal(duplicateSource.sourceReviewStatus, 'REVIEW_REQUIRED');
  f.source = { ...f.source, evidence: [...f.source.evidence, ...f.source.evidence] };
  f.review = { ...f.review, sourceBinding: await improvePolicySourceBinding(f.source) };
  assert.equal((await project(f)).sourceReviewStatus, 'REVIEW_REQUIRED');
  const unknownReview = { ...f.review, rows: [{ ...f.review.rows[0]!, metric: 'Flat ATK' }] } as unknown as CharacterRecommendationReview;
  assert.equal((await project({ ...f, review: unknownReview })).sourceReviewStatus, 'REVIEW_REQUIRED');
});
