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
  sourceEstablished: [
    'Prydwen current Sigrika calculations pair the Sigrika / Qiuyuan / Ciaccona team with Impermanence Heron on Qiuyuan and Nightmare: Kelpie on Ciaccona.',
    'Those two named support Echoes are distinct identities.',
    'The existing canonical predecessor review already source-proves four valid distinct Qiuyuan Echo Skill trigger identities and one Ciaccona predecessor Echo Skill cast.',
    'Within this explicitly named Prydwen calculation context, the predecessor total is therefore exactly five distinct triggers, corresponding to 50 Soliskin Vitality and five Blessing of Runes stacks at Sigrika entry.',
  ] as const,
  boundaries: [
    'The canonical Bellibing TeamProfile currently binds only Sigrika, Qiuyuan and Ciaccona member identities/roles; it does not bind teammate Echo loadouts.',
    'Therefore this exact five-trigger point must not replace the canonical registry-bound 4–5 predecessor interval until support equipment is explicitly represented and verified in the profile architecture.',
    'No teammate action timestamp, Sigrika Nameless Explorer timestamp, second-Schemata state, timed-window overlap or DPS denominator is inferred.',
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

  if (context.supportEchoBindings.qiuyuan === context.supportEchoBindings.ciaccona) {
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
