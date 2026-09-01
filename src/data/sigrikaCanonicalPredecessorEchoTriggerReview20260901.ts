import { PROFILE_REGISTRY } from './profileCatalogs.ts';
import { QIUYUAN_PASSIVE_FACTS } from './characterMechanics/qiuyuanRawFacts.ts';
import { SIGRIKA_PASSIVE_FACTS, SIGRIKA_RESOURCE_FACTS } from './characterMechanics/sigrikaRawFacts.ts';

export const SIGRIKA_CANONICAL_PREDECESSOR_ECHO_TRIGGER_REVIEW_20260901 = Object.freeze({
  reviewId: 'SIGRIKA-CANONICAL-PREDECESSOR-ECHO-TRIGGERS-2026-09-01-01',
  reviewedAt: '2026-09-01',
  presetId: 'sigrika-standard',
  teamProfileId: 'sigrika-qiuyuan-ciaccona',
  sourceLabels: [
    'Bellibing verified Qiuyuan raw Character Mechanics',
    'Bellibing verified Sigrika raw Character Mechanics',
    'Game8 — current Sigrika / Qiuyuan / Ciaccona general rotation',
    'Arab Wuwa — current Qiuyuan / Sigrika Echo Skill trigger accounting',
    'Prydwen — current Sigrika Echo timing',
  ] as const,
  sourceUrls: [
    'https://github.com/bellebing/Bellibing-simulator/blob/main/src/data/characterMechanics/qiuyuanRawFacts.ts',
    'https://github.com/bellebing/Bellibing-simulator/blob/main/src/data/characterMechanics/sigrikaRawFacts.ts',
    'https://game8.co/games/Wuthering-Waves/archives/507924',
    'https://arabwuwa.com/characters/qiuyuan/',
    'https://www.prydwen.gg/wuthering-waves/characters/sigrika',
  ] as const,
  sourceEstablished: [
    'The exact Sigrika / Qiuyuan / Ciaccona general rotation published by Game8 places Ciaccona before Qiuyuan, then has Qiuyuan cast Echo Skill and his three-step Forte Heavy string before switching to Sigrika via Outro.',
    'Bellibing verified Qiuyuan raw mechanics state that To Teach, To Save and To Sacrifice deal Heavy Attack DMG and are also considered performing Echo Skill.',
    'Current Arab Wuwa explicitly counts Qiuyuan as four Sigrika gauge triggers per rotation — his equipped Echo plus the three Forte Heavies — yielding 40 Soliskin Vitality and four Blessing of Runes stacks by himself. This resolves the same-name once-only concern for those four Qiuyuan triggers without Bellibing inventing Echo identities.',
    'Game8 also instructs Ciaccona to cast Echo Skill during her predecessor combo, but Bellibing does not have a canonical support-Echo identity binding proving that Ciaccona\'s equipped Echo name is distinct from every already-recorded trigger name.',
    'Prydwen keeps Sigrika\'s own Nameless Explorer Summon timing flexible rather than assigning a fixed canonical checkpoint.',
  ] as const,
  preSigrikaEntryBounds: {
    guaranteedDistinctTriggerCount: 4,
    maximumSourceDescribedTriggerCount: 5,
    soliskinVitalityMin: 40,
    soliskinVitalityMax: 50,
    blessingOfRunesStacksMin: 4,
    blessingOfRunesStacksMax: 5,
    firstSchemataHighVitalityPathGuaranteed: true,
    exactEntryGaugeStateKnown: false,
  } as const,
  downstreamImplications: {
    firstSchemataConsumesAtLeast30Vitality: true,
    firstSchemataGainsInnateGiftStack: true,
    secondSchemataHighVitalityPathGuaranteed: false,
    exactInnateGiftStacksBeforeLearnKnown: false,
    exactBlessingStacksDuringSigrikaSequenceKnown: false,
  } as const,
  boundaries: [
    'This is a source-bound review only. It closes no pendingExecutionId and does not authorize ENGINE_MODELED, BuildContext, freeze, DPS_READY or product support.',
    'The 40–50 Vitality / 4–5 Blessing entry interval must not be collapsed to a point estimate until canonical support Echo identities are explicitly bound or another source proves the exact unique-trigger count.',
    'Sigrika\'s flexible own Echo cast can change later Vitality/Blessing state depending on where it is placed; no timestamp, sixth trigger or second-Schemata high-Vitality path is inferred.',
    'The exact denominator, Qiuyuan 14-second overlap, Solsworn/Sonata window overlap and generic Rune timing remain separate unresolved execution work.',
  ] as const,
  closesPendingExecutionIds: [] as const,
} as const);

export function validateSigrikaCanonicalPredecessorEchoTriggerReview(): readonly string[] {
  const issues: string[] = [];
  const review = SIGRIKA_CANONICAL_PREDECESSOR_ECHO_TRIGGER_REVIEW_20260901;

  const preset = PROFILE_REGISTRY.presets.get(review.presetId);
  if (!preset) issues.push('missing canonical sigrika-standard preset');
  else if (preset.teamProfileId !== review.teamProfileId) {
    issues.push(`canonical Sigrika team drifted to ${preset.teamProfileId}`);
  }

  const team = PROFILE_REGISTRY.teams.get(review.teamProfileId);
  const teamIds = team?.members.map((row) => row.characterId) ?? [];
  if (teamIds.join('|') !== 'sigrika|qiuyuan|ciaccona') {
    issues.push(`canonical Sigrika team members drifted: ${teamIds.join(',')}`);
  }

  const qiuyuanInksplash = QIUYUAN_PASSIVE_FACTS.find((fact) => fact.factId === 'qiuyuan-forte-inksplash-of-mind');
  if (!qiuyuanInksplash?.effectSummary.includes('also considered performing Echo Skill')) {
    issues.push('Qiuyuan raw facts no longer prove the Forte Heavy chain as Echo Skill performances');
  }

  const soliskin = SIGRIKA_RESOURCE_FACTS.find((fact) => fact.factId === 'sigrika-resource-soliskin-vitality');
  if (soliskin?.maxValue !== 60 || !soliskin.ruleSummary.includes('same-name Echoes can trigger once')) {
    issues.push('Sigrika Soliskin Vitality source contract drifted');
  }

  const blessing = SIGRIKA_PASSIVE_FACTS.find((fact) => fact.factId === 'sigrika-inherent-true-names-aligned');
  if (blessing?.maxStacks !== 6 || blessing.triggerSummary !== 'Nearby team Resonators cast Echo Skill.') {
    issues.push('Sigrika Blessing of Runes source contract drifted');
  }

  const bounds = review.preSigrikaEntryBounds;
  if (bounds.guaranteedDistinctTriggerCount !== 4 || bounds.maximumSourceDescribedTriggerCount !== 5) {
    issues.push('canonical predecessor trigger bounds must remain 4–5 until support Echo identity is bound');
  }
  if (bounds.soliskinVitalityMin !== 40 || bounds.soliskinVitalityMax !== 50) {
    issues.push('canonical predecessor Soliskin Vitality bounds must remain 40–50');
  }
  if (bounds.blessingOfRunesStacksMin !== 4 || bounds.blessingOfRunesStacksMax !== 5) {
    issues.push('canonical predecessor Blessing bounds must remain 4–5');
  }
  if (!bounds.firstSchemataHighVitalityPathGuaranteed || bounds.exactEntryGaugeStateKnown) {
    issues.push('predecessor review must prove first high-Vitality Schemata while keeping exact entry state unresolved');
  }
  if (review.closesPendingExecutionIds.length !== 0) {
    issues.push('predecessor trigger review must not close execution dependencies');
  }

  return Object.freeze(issues);
}

const REVIEW_ISSUES = validateSigrikaCanonicalPredecessorEchoTriggerReview();
if (REVIEW_ISSUES.length > 0) {
  throw new Error(`Invalid Sigrika canonical predecessor Echo trigger review: ${REVIEW_ISSUES.join('; ')}`);
}
