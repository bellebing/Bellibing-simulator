import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';

export interface BlazingBrillianceStackContract {
  readonly pendingExecutionId: string;
  readonly effectId: 'BBR-SKILL' | 'BBR-SKILL-CAST-STACKS';
  readonly actionKey: 'weapon:blazing-brilliance-searing-feather-state';
  readonly triggerSemantic: 'DAMAGE_EVENT' | 'RESONANCE_SKILL_CAST';
  readonly unresolvedSemantics: readonly string[];
}

/**
 * Manual semantic review of the two canonical Searing Feather dependencies.
 *
 * Current sources agree on stack generation, cap and the 12-second removal
 * clause after reaching max stacks. They do not explicitly establish whether
 * another qualifying +1/+5 grant while already at 14 stacks restarts, preserves
 * or otherwise mutates that removal timer. Bellibing therefore does not create
 * an executable shared stack lifecycle from the tooltip alone.
 */
export const BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW = {
  blockerId: 'BUG-013',
  reviewedAt: '2026-08-30',
  sourceLabels: [
    'PlayAware — current Wuthering Waves Weapons',
    'Wuwa Wiki — Blazing Brilliance',
    'Wuthering.gg — Changli build/weapon text',
  ],
  sourceUrls: [
    'https://playaware.gg/games/wuthering-waves/wiki/weapons',
    'https://wuwa.wiki/en/codex/weapons/21020016',
    'https://wuthering.gg/characters/changli',
  ],
  contracts: [
    {
      pendingExecutionId: 'weapon:blazing-brilliance:BBR-SKILL:stack-lifecycle-adapter',
      effectId: 'BBR-SKILL',
      actionKey: 'weapon:blazing-brilliance-searing-feather-state',
      triggerSemantic: 'DAMAGE_EVENT',
      unresolvedSemantics: [
        'Current sources say all Searing Feather stacks are removed 12 seconds after reaching 14 stacks, but do not explicitly define the expiry-timer behavior of later qualifying damage events while the stack count is already capped.',
        'An executable state machine must not assume that at-cap damage refreshes the timer, leaves it untouched, or creates a second timer without independent evidence.',
      ],
    },
    {
      pendingExecutionId: 'weapon:blazing-brilliance:BBR-SKILL-CAST-STACKS:cross-effect-stack-mutation-adapter',
      effectId: 'BBR-SKILL-CAST-STACKS',
      actionKey: 'weapon:blazing-brilliance-searing-feather-state',
      triggerSemantic: 'RESONANCE_SKILL_CAST',
      unresolvedSemantics: [
        'Casting Resonance Skill is source-explicit as a +5 mutation of the same Searing Feather stack state.',
        'Current sources do not explicitly define whether a +5 mutation while already at 14 stacks restarts or otherwise changes the max-stack removal timer, so the cross-effect mutation cannot be executed safely in isolation.',
      ],
    },
  ] as const satisfies readonly BlazingBrillianceStackContract[],
  closesPendingExecutionIds: [] as readonly string[],
  notes: [
    'Source agreement is sufficient to preserve 14 max stacks, +1 damage grants at most once every 0.5 seconds, +5 Skill-cast grants and a 12-second removal clause after max.',
    'The remaining question is lifecycle semantics at the cap, not the raw values. BUG-013 parks only executable Searing Feather state behavior; permanent BBR-ATK remains executable source truth.',
  ],
} as const;

function uniqueEffect(catalog: readonly WeaponEffectData[], effectId: string): WeaponEffectData | null {
  const matches = catalog.filter((effect) => effect.effectId === effectId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate weapon effect id ${effectId}`);
  return matches[0];
}

export function validateBlazingBrillianceStackSemanticReview(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
): readonly string[] {
  const issues: string[] = [];
  const review = BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW;
  const pendingIds = new Set<string>();

  for (const contract of review.contracts) {
    if (pendingIds.has(contract.pendingExecutionId)) issues.push(`duplicate Blazing Brilliance pending id ${contract.pendingExecutionId}`);
    pendingIds.add(contract.pendingExecutionId);
    const unresolvedSemantics: readonly string[] = contract.unresolvedSemantics;
    if (unresolvedSemantics.length === 0) issues.push(`${contract.effectId} must preserve unresolved lifecycle semantics`);
  }

  const stacking = uniqueEffect(catalog, 'BBR-SKILL');
  if (!stacking) {
    issues.push('missing weapon effect BBR-SKILL');
  } else {
    if (stacking.weaponId !== 'blazing-brilliance') issues.push('BBR-SKILL weapon identity drift');
    if (stacking.effectType !== 'STACKING') issues.push('BBR-SKILL must remain STACKING');
    if (stacking.trigger !== 'Deal damage') issues.push(`BBR-SKILL trigger drift: ${stacking.trigger}`);
    if (stacking.durationSeconds !== 12) issues.push(`BBR-SKILL duration drift: ${String(stacking.durationSeconds)}`);
    if (stacking.triggerCooldownSeconds !== 0.5) issues.push(`BBR-SKILL trigger cooldown drift: ${String(stacking.triggerCooldownSeconds)}`);
    if (stacking.maxStacks !== 14) issues.push(`BBR-SKILL maxStacks drift: ${stacking.maxStacks}`);
    if (stacking.appliesTo !== 'SELF') issues.push('BBR-SKILL must remain SELF');
    if (stacking.mechanicsStatus !== 'VERIFIED_RAW_PENDING_MODEL') issues.push('BBR-SKILL must remain VERIFIED_RAW_PENDING_MODEL');
  }

  const skillCast = uniqueEffect(catalog, 'BBR-SKILL-CAST-STACKS');
  if (!skillCast) {
    issues.push('missing weapon effect BBR-SKILL-CAST-STACKS');
  } else {
    if (skillCast.weaponId !== 'blazing-brilliance') issues.push('BBR-SKILL-CAST-STACKS weapon identity drift');
    if (skillCast.effectType !== 'INSTANT') issues.push('BBR-SKILL-CAST-STACKS must remain INSTANT');
    if (skillCast.trigger !== 'Cast Resonance Skill') issues.push(`BBR-SKILL-CAST-STACKS trigger drift: ${skillCast.trigger}`);
    if (skillCast.maxStacks !== 1) issues.push(`BBR-SKILL-CAST-STACKS maxStacks drift: ${skillCast.maxStacks}`);
    if (skillCast.appliesTo !== 'SELF') issues.push('BBR-SKILL-CAST-STACKS must remain SELF');
    if (skillCast.mechanicsStatus !== 'VERIFIED_RAW_PENDING_MODEL') issues.push('BBR-SKILL-CAST-STACKS must remain VERIFIED_RAW_PENDING_MODEL');
    if (!skillCast.rankValues.every((value) => value === 5)) issues.push('BBR-SKILL-CAST-STACKS must remain +5 at every rank');
    if (!skillCast.conditions.includes('Mutates BBR-SKILL stack state')) issues.push('BBR-SKILL-CAST-STACKS must remain tied to BBR-SKILL state');
  }

  return issues;
}

const REVIEW_ISSUES = validateBlazingBrillianceStackSemanticReview();
if (REVIEW_ISSUES.length > 0) {
  throw new Error(`Invalid Blazing Brilliance semantic review: ${REVIEW_ISSUES.join('; ')}`);
}
