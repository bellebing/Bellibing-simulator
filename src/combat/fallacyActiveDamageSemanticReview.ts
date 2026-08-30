import { ECHO_ATTACK_PROFILES } from '../data/echoAttacks.ts';
import { totalMotionValue } from '../echoAttackDomain.ts';

export const FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW = {
  status: 'BLOCKED_SOURCE_SEMANTICS',
  blockerId: 'BUG-010',
  reviewedAt: '2026-08-30',
  echoId: 'echo-60000605',
  pendingExecutionId: 'echo:echo-60000605:fallacy-active-skill-damage-adapter',
  implementedAttackId: 'FALLACY_INITIAL_BLAST',
  profileContexts: [
    'shorekeeper-augusta-support',
    'chisa-standard',
  ],
  sourceEvidence: [
    {
      source: 'Pinned current DommyMM/wuwabuild Echoes.json',
      url: 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Echoes.json',
      notes: 'Normal activation and Hold Echo Skill are separate source variants. Rank 5 resolves the normal blast to 15.86% max HP and the hold/release branch to 1.58% each plus a 19.82% release finisher.',
    },
    {
      source: 'Current Prydwen Chisa guide',
      url: 'https://www.prydwen.gg/wuthering-waves/characters/chisa',
      notes: 'Calls Fallacy a simple summon Echo and recommends using it before Outro, but the canonical source sequence still does not encode a typed tap/default-cast event.',
    },
    {
      source: 'Current Prydwen Shorekeeper guide',
      url: 'https://www.prydwen.gg/wuthering-waves/characters/the-shorekeeper',
      notes: 'Describes Fallacy damage as max-HP based and the canonical source sequence uses the Echo before Liberation, without specifying a typed normal-vs-hold execution event.',
    },
  ],
  closesPendingExecutionIds: [] as readonly string[],
  unresolvedSemantics: [
    'The exact Rank-5 normal activation blast is source-safe and modeled as FALLACY_INITIAL_BLAST.',
    'The Hold Echo Skill flurry has source-explicit per-hit damage but no fixed hit count for arbitrary hold duration, so it is not executable in the exact attack catalog.',
    'The hold-release finisher has a source-explicit value but requires a distinct hold/release variant event that the supported profile source sequences do not currently encode.',
    'Do not treat a generic source-sequence entry named Echo: Fallacy of No Return as proof that the normal tap/default variant was used for DPS execution.',
  ],
  notes: [
    'Attack-data coverage is intentionally separated from profile execution closure.',
    'The existing non-damage Fallacy cast effects remain modeled independently in EchoEffectModel.',
    'No canonical profile pendingExecutionId closes in this review.',
  ],
} as const;

export function validateFallacyActiveDamageSemanticReview(): readonly string[] {
  const issues: string[] = [];
  const profile = ECHO_ATTACK_PROFILES.find((row) => row.echoId === FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.echoId);
  if (!profile) return ['missing Fallacy Echo attack profile'];
  if (profile.rank !== 5) issues.push('Fallacy attack profile must remain Rank 5');
  if (profile.cooldownSeconds !== 20) issues.push('Fallacy attack profile cooldown drift');
  if (profile.attacks.length !== 1) issues.push('Fallacy exact attack profile must contain only the normal activation blast');
  const attack = profile.attacks.find((row) => row.attackId === FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.implementedAttackId);
  if (!attack) return [...issues, 'missing Fallacy initial blast attack'];
  if (attack.trigger !== 'ACTIVE_CAST') issues.push('Fallacy initial blast trigger drift');
  if (attack.element !== 'Spectro') issues.push('Fallacy initial blast element drift');
  if (attack.scalingStat !== 'HP') issues.push('Fallacy initial blast scaling drift');
  if (attack.components.length !== 1 || attack.components[0]?.hits !== 1) issues.push('Fallacy initial blast must remain one exact hit');
  if (Math.abs(totalMotionValue(attack) - 0.1586) > 1e-12) issues.push('Fallacy initial blast motion value drift');
  const unresolvedSemantics: readonly string[] = FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.unresolvedSemantics;
  if (unresolvedSemantics.length === 0) issues.push('Fallacy variant blocker must remain explicit');
  return issues;
}

const REVIEW_ISSUES = validateFallacyActiveDamageSemanticReview();
if (REVIEW_ISSUES.length > 0) {
  throw new Error(`Invalid Fallacy active-damage semantic review: ${REVIEW_ISSUES.join('; ')}`);
}
