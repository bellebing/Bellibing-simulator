import type { StatTargetProfile } from '../profileDomain.ts';
import { PROFILE_HORIZONTAL_GREEN_LANE_STATS } from './profileHorizontalGreenLane20260830.ts';

const PENDING_EXECUTION_ID = 'stat-target:lingyang-standard-stats:exact-er-gate-adapter' as const;
const PROFILE_ID = 'lingyang-standard-stats' as const;
const SOURCE_RANGE = '120-125%+' as const;

export const LINGYANG_ENERGY_REGEN_GATE_REVIEW = {
  reviewId: 'LINGYANG-ER-GATE-REVIEW-2026-09-01-01',
  reviewedAt: '2026-09-01',
  blockerId: 'BUG-017',
  pendingExecutionId: PENDING_EXECUTION_ID,
  statTargetProfileId: PROFILE_ID,
  status: 'BLOCKED_SOURCE_SEMANTICS',
  sourceRange: SOURCE_RANGE,
  sourceContext: 'Estimated in a Zhezhi+Shorekeeper team.',
  sourceEstablished: [
    'Energy Regen is the highest-priority canonical Lingyang target stat.',
    'The reviewed source snapshot reports Energy Regen: 120-125%+ in the Zhezhi + The Shorekeeper context.',
    'The canonical stat-target profile deliberately materializes no numeric Energy Regen gate.',
  ],
  unresolvedSemantics: [
    'The 120-125%+ text is a source range/estimate, not an exact mandatory minimum selected by the canonical semantic review.',
    'No source-backed rule identifies whether 120%, 125%, or another point in the range is the exact hard gate for canonical execution.',
    'An exact ER hard gate must not be inferred from the lower bound of a recommended range or from the phrase Until Satisfied.',
  ],
  closesPendingExecutionIds: [] as readonly string[],
  notes: [
    'Canonical provenance explicitly states: Reviewed Stats/ER context: No exact numeric ER gate is claimed for this reviewed context.',
    'Canonical provenance explicitly states that no numeric ER gate is materialized and that the endgame/ER text remains source context unless a later exact-context review promotes a number.',
    'This review classifies the dependency only. It does not add a StatGate, change the generated profile, or authorize BuildContext/freeze/product execution.',
  ],
} as const;

export function validateLingyangEnergyRegenGateReview(): readonly string[] {
  const issues: string[] = [];
  const statTargets: readonly StatTargetProfile[] = PROFILE_HORIZONTAL_GREEN_LANE_STATS;
  const matches = statTargets.filter((profile) => profile.id === PROFILE_ID);
  if (matches.length !== 1) {
    issues.push(`expected exactly one ${PROFILE_ID} stat target, got ${matches.length}`);
    return issues;
  }

  const profile = matches[0];
  if (!profile) {
    issues.push(`expected ${PROFILE_ID} after cardinality validation`);
    return issues;
  }
  if (profile.characterId !== 'lingyang') issues.push(`Lingyang stat-target character drift: ${profile.characterId}`);
  if (profile.verificationStatus !== 'VERIFIED') issues.push(`Lingyang stat-target verification drift: ${profile.verificationStatus}`);
  if (profile.gates.length !== 0) issues.push(`Lingyang stat-target unexpectedly materializes ${profile.gates.length} gate(s)`);

  const energyRule = profile.targetRules.find((rule) => rule.stat === 'Energy Regen');
  if (!energyRule) issues.push('Lingyang stat-target is missing Energy Regen priority');
  else if (energyRule.priority !== 1) issues.push(`Lingyang Energy Regen priority drift: ${energyRule.priority}`);

  const notes = profile.provenance.notes;
  if (!notes.some((note) => note.includes('No exact numeric ER gate is claimed'))) {
    issues.push('Lingyang provenance lost the no-exact-ER-gate review boundary');
  }
  if (!notes.some((note) => note.includes('Energy Regen: 120-125%+'))) {
    issues.push('Lingyang provenance lost the 120-125%+ source range');
  }
  if (!notes.some((note) => note.includes('Estimated in a Zhezhi+Shorekeeper team'))) {
    issues.push('Lingyang provenance lost the Zhezhi+Shorekeeper ER context');
  }
  if (!notes.some((note) => note.includes('No numeric ER gate is materialized'))) {
    issues.push('Lingyang provenance lost the no-materialized-gate boundary');
  }

  return issues;
}

const REVIEW_ISSUES = validateLingyangEnergyRegenGateReview();
if (REVIEW_ISSUES.length > 0) {
  throw new Error(`Invalid Lingyang Energy Regen gate review: ${REVIEW_ISSUES.join('; ')}`);
}
