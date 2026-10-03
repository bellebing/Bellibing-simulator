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

test('Augusta review verifies all seven explicitly reviewed values', async () => {
  const result = await projectRecommendedCharacterStats('augusta');
  assert.equal(result.sourceReviewStatus, 'CURRENT');
  assert.deepEqual(result.rows.map(row => row.metric), ['TOTAL_HP', 'TOTAL_DEF', 'TOTAL_ATK', 'TOTAL_CRIT_RATE',
    'TOTAL_CRIT_DAMAGE', 'TOTAL_ENERGY_REGEN', 'ELECTRO_DMG_BONUS']);
  const expected = new Map<string, RecommendationValue>([
    ['TOTAL_HP', { kind: 'MINIMUM', minimum: 14500 }],
    ['TOTAL_DEF', { kind: 'MINIMUM', minimum: 1100 }],
    ['TOTAL_ATK', { kind: 'OPEN_ENDED_BAND', minimum: 2000, upperReference: 2800 }],
    ['TOTAL_CRIT_RATE', { kind: 'OPEN_ENDED_BAND', minimum: .65, upperReference: .80 }],
    ['TOTAL_CRIT_DAMAGE', { kind: 'OPEN_ENDED_BAND', minimum: 2.10, upperReference: 2.60 }],
    ['ELECTRO_DMG_BONUS', { kind: 'OPEN_ENDED_BAND', minimum: .40, upperReference: .70 }],
    ['TOTAL_ENERGY_REGEN', { kind: 'BOUNDED_RANGE', minimum: 1.16, upper: 1.25 }],
  ]);
  for (const row of result.rows) {
    assert.equal(row.status, 'VERIFIED');
    assert.deepEqual(row.value, expected.get(row.metric) ?? null);
    assert.equal(row.unit, CHARACTER_RECOMMENDATION_UNITS[row.metric]);
    assert.equal(row.comparisonStatus, 'PENDING');
    assert.equal(row.evidence.length, 1);
  }
});

test('Augusta primary provenance retains externally supplied current capture and ER endpoint conditions', async () => {
  const result = await projectRecommendedCharacterStats('augusta');
  for (const row of result.rows) {
    const evidence = row.evidence[0]!;
    assert.equal(evidence.checkedAt, '2026-10-03');
    assert.equal(evidence.evidenceClass, 'PRIMARY_SOURCE_CAPTURE');
    assert.equal(evidence.sourceIdentity, 'Prydwen Augusta build');
    assert.equal(evidence.sourceUrl, 'https://www.prydwen.gg/wuthering-waves/characters/augusta');
    assert.match(evidence.context.description, /Externally supplied.*2026-09-10.*Patch 3.6 Level 90/);
    assert.equal(evidence.context.sequence, 'S0');
    assert.equal(evidence.context.measurementBasis,
      'Total stats shown in the in-game stat screen while the Character is out of combat but active in the party.');
  }
  const er = result.rows.find(row => row.metric === 'TOTAL_ENERGY_REGEN')!;
  assert.equal(er.evidence[0]!.originalText, '116%-125%');
  assert.deepEqual(er.evidence[0]!.context.conditions, [
    'Lower endpoint 116% corresponds to Mortefi + Shorekeeper.',
    'Higher endpoint 125% corresponds to Iuno + Shorekeeper.',
  ]);
  assert.equal(er.evidence[0]!.context.team, null); // Neither endpoint is a universal team predicate.
  assert.equal(er.sourceBinding, CHARACTER_RECOMMENDATION_REVIEWS[0]!.sourceBinding);
  assert.equal(await improvePolicySourceBinding(CHARACTER_RECOMMENDATION_SOURCES[0]), er.sourceBinding);
});

for (const [metric, wording] of [
  ['TOTAL_ATK', '2000-2800+'], ['TOTAL_CRIT_RATE', '65-80%+'],
  ['TOTAL_CRIT_DAMAGE', '210-260%+'], ['ELECTRO_DMG_BONUS', '40-70%+'],
] as const) {
  test(`Augusta ${wording} preserves its open band and rejects lossy or mismatched interpretations`, async () => {
    const source = CHARACTER_RECOMMENDATION_SOURCES[0]!;
    const review = CHARACTER_RECOMMENDATION_REVIEWS[0]!;
    const result = await projectRecommendedCharacterStats('augusta');
    const row = result.rows.find(item => item.metric === metric)!;
    assert.equal(row.evidence[0]!.originalText, wording);
    assert.equal(row.status, 'VERIFIED');
    const parsed = interpretRecommendationText(wording, row.unit);
    assert.equal(parsed.status, 'NORMALIZED');
    if (parsed.status !== 'NORMALIZED' || parsed.value.kind !== 'OPEN_ENDED_BAND') assert.fail('Expected open-ended band');
    assert.deepEqual(row.value, parsed.value);
    const { minimum, upperReference: upper } = parsed.value;
    const invalidInterpretations: RecommendationValue[] = [
      { kind: 'BOUNDED_RANGE', minimum, upper },
      { kind: 'MINIMUM', minimum },
      { kind: 'EXACT', target: upper },
      { kind: 'OPEN_ENDED_BAND', minimum, upperReference: upper + 1 },
    ];
    for (const interpretation of invalidInterpretations) {
      const forced = await projectRecommendedCharacterStats('augusta', { sources: [source], reviews: [{ ...review,
        rows: review.rows.map(item => item.metric === metric ? { ...item,
          decision: 'APPROVED_FOR_CANONICAL_VERIFIED', interpretation } : item),
      }] });
      assert.equal(forced.rows.find(item => item.metric === metric)!.status, 'REVIEW_REQUIRED');
      assert.equal(forced.rows.find(item => item.metric === metric)!.value, null);
    }
  });
}

test('Augusta direct-fetch failures remain separate from external capture and older WWPlus context', async () => {
  const research = JSON.parse(readFileSync(new URL('../data/research/augusta-character-recommendations-2026-10-03.json', import.meta.url), 'utf8'));
  assert.equal(research.sourceAccess.length, 3);
  for (const attempt of research.sourceAccess.slice(0, 2)) {
    assert.equal(attempt.result, 'BLOCKED_NETWORK_POLICY'); assert.match(attempt.observation, /403/);
    assert.equal(attempt.originalStatLine, undefined);
  }
  const capture = research.sourceAccess[2];
  assert.equal(capture.result, 'CAPTURED');
  assert.equal(capture.retrievalMethod, 'EXTERNALLY_SUPPLIED_SOURCE_CAPTURE');
  assert.equal(capture.captureDate, '2026-10-03'); assert.equal(capture.reviewDate, '2026-10-03');
  assert.equal(capture.pageUpdatedAt, '2026-09-10'); assert.equal(capture.patch, '3.6');
  assert.equal(capture.level, 90); assert.equal(capture.sequence, 'S0');
  assert.equal(capture.originalStatLine, 'HP: 14500+; DEF: 1100+; ATK: 2000-2800+; CRIT Rate: 65-80%+; CRIT DMG: 210-260%+; Energy Regen: 116%-125%; Electro DMG Bonus: 40-70%+');
  const source = CHARACTER_RECOMMENDATION_SOURCES[0]!;
  for (const evidence of source.evidence.filter(item => item.evidenceClass === 'PRIMARY_SOURCE_CAPTURE')) {
    assert.equal(evidence.originalText, capture.statLines[evidence.metric]);
    assert.equal(evidence.sourceUrl, capture.url); assert.equal(evidence.checkedAt, capture.captureDate);
  }
  assert.equal(research.historicalComparison.evidenceClass, 'HISTORICAL_NON_CURRENT');
  assert.equal(research.historicalComparison.patch, '2.8');
  assert.deepEqual(research.historicalComparison.recommendations, {
    TOTAL_ATK: '>=2200', TOTAL_CRIT_RATE: '>=70%', TOTAL_CRIT_DAMAGE: '>=270%',
    TOTAL_ENERGY_REGEN: '>=110%', ELECTRO_DMG_BONUS: '40%-70%',
  });
  assert.ok((await projectRecommendedCharacterStats('augusta')).rows.every(row =>
    row.evidence.every(item => !item.sourceUrl.includes('wwplus'))));
});

test('Augusta canonical evidence drift fails closed including current context and endpoint teams', async () => {
  const source = CHARACTER_RECOMMENDATION_SOURCES[0]!;
  for (const metric of ['TOTAL_ENERGY_REGEN', 'TOTAL_ATK'] as const) {
    for (const key of ['originalText', 'sourceIdentity', 'sourceUrl', 'checkedAt', 'context'] as const) {
      const changed = { ...source, evidence: source.evidence.map(item => item.metric === metric
        && item.evidenceClass === 'PRIMARY_SOURCE_CAPTURE' ? { ...item, [key]: key === 'context'
          ? { ...item.context, description: 'Changed patch context', conditions: ['Changed endpoint team'] } : 'changed' } : item) };
      const result = await projectRecommendedCharacterStats('augusta', { sources: [changed] });
      assert.ok(result.rows.every(row => row.status === 'REVIEW_REQUIRED' && row.value === null));
    }
  }
});

test('Augusta legacy ER gate remains historical discovery and cannot replace the primary capture', async () => {
  const source = CHARACTER_RECOMMENDATION_SOURCES[0]!;
  const legacy = source.evidence.find(item => item.id === 'augusta-legacy-er-reference')!;
  assert.equal(legacy.checkedAt, '2026-08-29');
  assert.equal(legacy.originalText, null);
  assert.equal(legacy.evidenceClass, 'LEGACY_PROFILE_REFERENCE');
  const review = CHARACTER_RECOMMENDATION_REVIEWS[0]!;
  const result = await projectRecommendedCharacterStats('augusta', { reviews: [{ ...review,
    rows: review.rows.map(row => row.metric === 'TOTAL_ENERGY_REGEN'
      ? { ...row, evidenceIds: [legacy.id] } : row),
  }] });
  const er = result.rows.find(row => row.metric === 'TOTAL_ENERGY_REGEN')!;
  assert.equal(er.status, 'REVIEW_REQUIRED'); assert.equal(er.value, null);
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
  ['116%-125%', 'RATIO', { kind: 'BOUNDED_RANGE', minimum: 1.16, upper: 1.25 }],
  ['116-125%', 'RATIO', { kind: 'BOUNDED_RANGE', minimum: 1.16, upper: 1.25 }],
  ['100%', 'RATIO', { kind: 'EXACT', target: 1 }],
  ['2000-2800', 'POINTS', { kind: 'BOUNDED_RANGE', minimum: 2000, upper: 2800 }],
] as const) {
  test(`source text semantics: ${text}`, () => {
    assert.deepEqual(interpretRecommendationText(text, unit), { status: 'NORMALIZED', value });
  });
}
for (const [text, unit, minimum, upperReference] of [
  ['2000-2800+', 'POINTS', 2000, 2800], ['65-80%+', 'RATIO', .65, .80],
  ['210-260%+', 'RATIO', 2.10, 2.60], ['40-70%+', 'RATIO', .40, .70],
  ['116%-125%+', 'RATIO', 1.16, 1.25],
] as const) {
  test(`trailing plus range ${text} preserves open-ended guidance without maximum/preferred/target`, () => {
    const parsed = interpretRecommendationText(text, unit);
    assert.deepEqual(parsed, { status: 'NORMALIZED', value: { kind: 'OPEN_ENDED_BAND', minimum, upperReference } });
    if (parsed.status !== 'NORMALIZED') assert.fail('Expected normalization');
    for (const key of ['upper', 'maximum', 'preferred', 'target', 'cap']) assert.ok(!(key in parsed.value));
  });
}
test('unsupported text, unit mismatches, reversed endpoints and nonfinite values fail closed', () => {
  for (const text of ['65-80%+ (before S6)', '1900-2200b+', '-1%', '125-116%', 'Infinity%', '100', 'NaN%', '116%-125', '116%%-125%', '116%-125%%']) {
    assert.equal(interpretRecommendationText(text, 'RATIO').status, 'UNRESOLVED');
  }
  assert.equal(interpretRecommendationText('100%', 'POINTS').status, 'UNRESOLVED');
  assert.equal(interpretRecommendationText('116%-125%', 'POINTS').status, 'UNRESOLVED');
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
    const f = await fixture('65-80%+', { kind: 'OPEN_ENDED_BAND', minimum: .65, upperReference: .8 });
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

test('current open-band source disagreement requires review without choosing or averaging', async () => {
  const f = await fixture('65-80%+', { kind: 'OPEN_ENDED_BAND', minimum: .65, upperReference: .8 });
  f.source = { ...f.source, evidence: [...f.source.evidence, { ...f.source.evidence[0]!,
    id: 'synthetic-other-source', sourceIdentity: 'Synthetic independent current source', originalText: '65-85%+', excerpt: '65-85%+' }] };
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
  assert.equal(next.rows[5]!.evidence[0]!.context.conditions.length, 2);
});

test('parseable open-ended primary evidence stays Pending until explicit semantic approval', async () => {
  const f = await fixture('65-80%+', { kind: 'OPEN_ENDED_BAND', minimum: .65, upperReference: .8 });
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
