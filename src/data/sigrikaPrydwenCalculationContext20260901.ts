import { PROFILE_REGISTRY } from './profileCatalogs.ts';
import { SIGRIKA_CANONICAL_PREDECESSOR_ECHO_TRIGGER_REVIEW_20260901 } from './sigrikaCanonicalPredecessorEchoTriggerReview20260901.ts';

/**
 * Source-proven Prydwen calculation context for Sigrika.
 *
 * This is deliberately NOT promoted into the canonical TeamProfile because the
 * current profile registry binds team member identities/roles, not teammate
 * equipment. It may narrow source reasoning only when a caller explicitly opts
 * into this calculation context.
 */
export const SIGRIKA_PRYDWEN_CALCULATION_CONTEXT_20260901 = Object.freeze({
  contextId: 'sigrika-prydwen-calculation-context-2026-09-01-01',
  reviewedAt: '2026-09-01',
  presetId: 'sigrika-standard',
  teamProfileId: 'sigrika-qiuyuan-ciaccona',
  sourceLabel: 'Prydwen — current Sigrika calculations',
  sourceUrl: 'https://www.prydwen.gg/wuthering-waves/characters/sigrika',
  registryBindingStatus: 'SOURCE_PROVEN_CALCULATION_CONTEXT_NOT_PROFILE_REGISTRY_BOUND' as const,
  supportEchoBindings: {
    qiuyuan: 'Impermanence Heron',
    ciaccona: 'Nightmare: Kelpie',
  } as const,
  predecessorTriggerAccounting: {
    qiuyuanDistinctTriggerCount: 4,
    ciacconaDistinctTriggerCount: 1,
    exactDistinctTriggerCount: 5,
    exactEntrySoliskinVitality: 50,
    exactEntryBlessingOfRunesStacks: 5,
  } as const,
  timingEvidence: {
    currentPrydwen: {
      majorBuildCalcsPatch: '3.5',
      fixedStandardRotationActionOrderMatchesCanonical: true,
      echoTiming: 'FLEXIBLE_SUMMON_ANY_POINT_IN_ROTATION' as const,
      exposedRotationSeconds: null,
      status: 'CURRENT_SEQUENCE_EXPOSED_CURRENT_ROTATION_SECONDS_NOT_EXPOSED' as const,
    },
    historicalPrydwenSnapshot: {
      sourceLabel: 'Prydwen static Sigrika snapshot',
      sourceUrl: 'https://d2ankz0m1a0dsp.cloudfront.net/wuthering-waves/characters/sigrika/',
      lastProfileUpdate: '2026-04-29',
      majorBuildCalcsPatch: '3.2',
      fixedStandardRotationActionOrderMatchesCanonical: true,
      rotationSeconds: 12.8,
      supportEchoBindingsMatchCurrentCalculationContext: true,
      canonicalEquipmentMatches: true,
      status: 'HISTORICAL_EXACT_FIXED_ACTION_ORDER_MATCH_STALE_MAJOR_CALCS_NOT_CURRENT_DENOMINATOR' as const,
    },
    denominatorConclusion: 'BLOCKED_CURRENT_ROTATION_SECONDS_AND_ACTION_TIMESTAMPS' as const,
  } as const,
  sourceEstablished: [
    'Prydwen current Sigrika calculations pair the Sigrika / Qiuyuan / Ciaccona team with Impermanence Heron on Qiuyuan and Nightmare: Kelpie on Ciaccona.',
    'Those two named support Echoes are distinct identities.',
    'The existing canonical predecessor review already source-proves four valid distinct Qiuyuan Echo Skill trigger identities and one Ciaccona predecessor Echo Skill cast.',
    'Within this explicitly named Prydwen calculation context, the predecessor total is therefore exactly five distinct triggers, corresponding to 50 Soliskin Vitality and five Blessing of Runes stacks at Sigrika entry.',
    'A historical Prydwen Patch 3.2 calculation snapshot publishes 12.8 seconds for the same fixed 14-action Standard Rotation order and the same Solsworn Ciphers R1 / Sound of True Name / Nameless Explorer calculation package.',
    'Current Prydwen still exposes the same fixed Standard Rotation order and the same Qiuyuan/Ciaccona calculation bindings, but its update tracker marks a later Patch 3.5 major build/calcs revision and the currently exposed page text does not publish a rotation-time value.',
  ] as const,
  boundaries: [
    'The canonical Bellibing TeamProfile currently binds only Sigrika, Qiuyuan and Ciaccona member identities/roles; it does not bind teammate Echo loadouts.',
    'Therefore this exact five-trigger point must not replace the canonical registry-bound 4–5 predecessor interval until support equipment is explicitly represented and verified in the profile architecture.',
    'The historical 12.8-second Prydwen figure is exact fixed-action-order evidence for an older Patch 3.2 calculation revision, not current denominator truth after Prydwen moved major build/calcs to Patch 3.5.',
    'A total rotation duration alone would not provide the per-action timestamps required to resolve 5s/6s/14s/15s timed-window coverage.',
    'No teammate action timestamp, Sigrika Nameless Explorer timestamp, second-Schemata state, timed-window overlap or current DPS denominator is inferred.',
    'This source context closes no pendingExecutionId and does not authorize ENGINE_MODELED, BuildContext, freeze, DPS_READY or product support.',
  ] as const,
  closesPendingExecutionIds: [] as const,
} as const);

export function validateSigrikaPrydwenCalculationContext(): readonly string[] {
  const issues: string[] = [];
  const context = SIGRIKA_PRYDWEN_CALCULATION_CONTEXT_20260901;

  const preset = PROFILE_REGISTRY.presets.get(context.presetId);
  if (!preset) issues.push('missing canonical sigrika-standard preset');
  else if (preset.teamProfileId !== context.teamProfileId) {
    issues.push(`Sigrika calculation context team drifted to ${preset.teamProfileId}`);
  }

  const team = PROFILE_REGISTRY.teams.get(context.teamProfileId);
  const teamIds = team?.members.map((row) => row.characterId) ?? [];
  if (teamIds.join('|') !== 'sigrika|qiuyuan|ciaccona') {
    issues.push(`Sigrika calculation context members drifted: ${teamIds.join(',')}`);
  }

  const supportEchoNames: readonly string[] = [
    context.supportEchoBindings.qiuyuan,
    context.supportEchoBindings.ciaccona,
  ];
  if (new Set(supportEchoNames).size !== supportEchoNames.length) {
    issues.push('Sigrika calculation context support Echo identities must remain distinct');
  }

  const accounting = context.predecessorTriggerAccounting;
  if (accounting.qiuyuanDistinctTriggerCount + accounting.ciacconaDistinctTriggerCount !== accounting.exactDistinctTriggerCount) {
    issues.push('Sigrika calculation context predecessor trigger accounting drifted');
  }
  if (accounting.exactDistinctTriggerCount !== 5
    || accounting.exactEntrySoliskinVitality !== 50
    || accounting.exactEntryBlessingOfRunesStacks !== 5) {
    issues.push('Sigrika Prydwen calculation context must remain exact 5 / 50 / 5');
  }

  const timing = context.timingEvidence;
  if (timing.currentPrydwen.majorBuildCalcsPatch !== '3.5'
    || !timing.currentPrydwen.fixedStandardRotationActionOrderMatchesCanonical
    || timing.currentPrydwen.exposedRotationSeconds !== null) {
    issues.push('Current Prydwen timing boundary must remain Patch 3.5 / canonical fixed order / no exposed rotation seconds');
  }
  if (timing.historicalPrydwenSnapshot.majorBuildCalcsPatch !== '3.2'
    || timing.historicalPrydwenSnapshot.rotationSeconds !== 12.8
    || !timing.historicalPrydwenSnapshot.fixedStandardRotationActionOrderMatchesCanonical
    || timing.historicalPrydwenSnapshot.status !== 'HISTORICAL_EXACT_FIXED_ACTION_ORDER_MATCH_STALE_MAJOR_CALCS_NOT_CURRENT_DENOMINATOR') {
    issues.push('Historical Prydwen timing evidence must remain exact-order 12.8s Patch 3.2 and explicitly stale for current denominator use');
  }
  if (timing.denominatorConclusion !== 'BLOCKED_CURRENT_ROTATION_SECONDS_AND_ACTION_TIMESTAMPS') {
    issues.push('Sigrika Prydwen timing evidence must not close current denominator/timeline semantics');
  }

  const canonical = SIGRIKA_CANONICAL_PREDECESSOR_ECHO_TRIGGER_REVIEW_20260901.preSigrikaEntryBounds;
  if (canonical.guaranteedDistinctTriggerCount !== 4
    || canonical.maximumSourceDescribedTriggerCount !== 5
    || canonical.exactEntryGaugeStateKnown) {
    issues.push('Sigrika calculation context must not silently collapse the canonical registry-bound 4–5 interval');
  }
  if (accounting.exactDistinctTriggerCount < canonical.guaranteedDistinctTriggerCount
    || accounting.exactDistinctTriggerCount > canonical.maximumSourceDescribedTriggerCount) {
    issues.push('Sigrika calculation-context point must remain inside canonical source bounds');
  }

  if (context.registryBindingStatus !== 'SOURCE_PROVEN_CALCULATION_CONTEXT_NOT_PROFILE_REGISTRY_BOUND') {
    issues.push('Sigrika calculation context must remain explicitly non-registry-bound');
  }
  if (context.closesPendingExecutionIds.length !== 0) {
    issues.push('Sigrika calculation context must not close execution dependencies');
  }

  return Object.freeze(issues);
}

const CONTEXT_ISSUES = validateSigrikaPrydwenCalculationContext();
if (CONTEXT_ISSUES.length > 0) {
  throw new Error(`Invalid Sigrika Prydwen calculation context: ${CONTEXT_ISSUES.join('; ')}`);
}
