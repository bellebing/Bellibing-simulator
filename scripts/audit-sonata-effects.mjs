import { auditSonataEffectCoverage } from '../src/sonataEffectCoverageRegistry.ts';

const summary = auditSonataEffectCoverage();

console.log(
  [
    `Sonata effect source coverage: ${summary.releasedSonataCount} released sets`,
    `${summary.reviewedActivationCount} reviewed activations`,
    `${summary.modeledEffectCount} modeled effect rows`,
    `${summary.statusCounts.MODELED} MODELED`,
    `${summary.statusCounts.SOURCE_CONFLICT} SOURCE_CONFLICT`,
    `${summary.statusCounts.MODELED_WITH_PENDING_DAMAGE_ADAPTER} PENDING_DAMAGE_ADAPTER`,
    `${summary.statusCounts.MODELED_WITH_PENDING_STATE_ADAPTER} PENDING_STATE_ADAPTER`,
  ].join(' / '),
);
