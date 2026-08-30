import type { WeaponEffectData } from '../effectDomain.ts';
import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';

export type WeaponSkillStackTriggerSemantic =
  | 'RESONANCE_SKILL_DAMAGE'
  | 'RESONANCE_SKILL_USE_WHILE_ON_FIELD';

export interface WeaponSkillStackSemanticContract {
  readonly pendingExecutionId: string;
  readonly actionKey: string;
  readonly weaponId: string;
  readonly effectId: string;
  readonly triggerSemantic: WeaponSkillStackTriggerSemantic;
  readonly durationSeconds: number;
  readonly maxStacks: number;
  readonly unresolvedSemantics: readonly string[];
}

/**
 * Manual semantic review of the highest actionable `weapon:skill-stack-timing-adapter`
 * family from the Profile Execution Work Queue.
 *
 * The two effects share a timed stacking shape, but their trigger semantics are
 * explicitly different. Current source text establishes duration/max stacks but
 * does not establish whether later stack gains refresh one shared duration or
 * whether stacks keep independent expiration timers. Bellibing therefore parks
 * runtime implementation instead of inventing a stack lifetime policy.
 */
export const WEAPON_SKILL_STACK_SEMANTIC_REVIEW = {
  status: 'BLOCKED_SOURCE_SEMANTICS',
  blockerId: 'BUG-009',
  reviewedAt: '2026-08-30',
  sourceEvidence: [
    {
      source: 'Pinned current DommyMM/wuwabuild Weapons.json',
      url: 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Weapons.json',
      notes: 'Stringmaster explicitly triggers on dealing Resonance Skill DMG; Rime-Draped Sprouts explicitly triggers on using Resonance Skill while the wielder is on field.',
    },
    {
      source: 'Current Wutheringlab weapon pages',
      url: 'https://wutheringlab.com/weapon/stringmaster/',
      notes: 'Independent current rendering confirms Stringmaster 2-stack / 5s source wording without defining per-stack versus shared refresh behavior.',
    },
    {
      source: 'Current Wutheringlab weapon pages',
      url: 'https://wutheringlab.com/weapon/rime-draped-sprouts/',
      notes: 'Independent current rendering confirms Rime-Draped Sprouts 3-stack / 6s source wording and its separate Outro consume/off-field branch without defining stack refresh behavior.',
    },
  ],
  contracts: [
    {
      pendingExecutionId: 'weapon:stringmaster:SM-ATK:skill-stack-timing-adapter',
      actionKey: 'weapon:stringmaster-skill-damage-stack-lifecycle',
      weaponId: 'stringmaster',
      effectId: 'SM-ATK',
      triggerSemantic: 'RESONANCE_SKILL_DAMAGE',
      durationSeconds: 5,
      maxStacks: 2,
      unresolvedSemantics: [
        'Does gaining a later stack refresh one shared 5s lifetime or leave stack expirations independent?',
        'Do not equate dealing Resonance Skill DMG with casting/using Resonance Skill.',
      ],
    },
    {
      pendingExecutionId: 'weapon:rime-draped-sprouts:RDS-BASIC-STACK:skill-stack-timing-adapter',
      actionKey: 'weapon:rime-on-field-skill-use-stack-lifecycle',
      weaponId: 'rime-draped-sprouts',
      effectId: 'RDS-BASIC-STACK',
      triggerSemantic: 'RESONANCE_SKILL_USE_WHILE_ON_FIELD',
      durationSeconds: 6,
      maxStacks: 3,
      unresolvedSemantics: [
        'Does gaining a later stack refresh one shared 6s lifetime or leave stack expirations independent?',
        'The 3-stack Outro consume/off-field branch remains a separate pending adapter family and must not be folded into this stack-timing edge.',
      ],
    },
  ] as readonly WeaponSkillStackSemanticContract[],
  closesPendingExecutionIds: [] as readonly string[],
  notes: [
    'The syntactic skill-stack-timing suffix does not prove one trigger event contract.',
    'Current sources are sufficient to split Stringmaster skill-damage events from Rime on-field skill-use events, but not sufficient to execute stack expiration/refresh timing.',
    'No generic timed-stack runtime should be implemented until stack lifetime semantics are independently resolved.',
  ],
} as const;

function effectById(catalog: readonly WeaponEffectData[], effectId: string): WeaponEffectData | null {
  const matches = catalog.filter((effect) => effect.effectId === effectId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate weapon effect id ${effectId}`);
  return matches[0];
}

export function validateWeaponSkillStackSemanticReview(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const contract of WEAPON_SKILL_STACK_SEMANTIC_REVIEW.contracts) {
    if (seen.has(contract.pendingExecutionId)) issues.push(`duplicate weapon skill-stack review ${contract.pendingExecutionId}`);
    seen.add(contract.pendingExecutionId);
    const effect = effectById(catalog, contract.effectId);
    if (!effect) {
      issues.push(`missing weapon skill-stack effect ${contract.effectId}`);
      continue;
    }
    if (effect.weaponId !== contract.weaponId) issues.push(`${contract.effectId} weapon id drift`);
    if (effect.effectType !== 'STACKING') issues.push(`${contract.effectId} must remain STACKING`);
    if (effect.appliesTo !== 'SELF') issues.push(`${contract.effectId} must remain SELF`);
    if (effect.durationSeconds !== contract.durationSeconds) issues.push(`${contract.effectId} duration drift`);
    if (effect.maxStacks !== contract.maxStacks) issues.push(`${contract.effectId} max-stack drift`);
    if (effect.rankValues.length !== 5 || effect.rankValues.some((value) => !Number.isFinite(value))) {
      issues.push(`${contract.effectId} requires five finite rank values`);
    }
    if (contract.unresolvedSemantics.length === 0) issues.push(`${contract.effectId} must retain an explicit unresolved semantic blocker`);
  }

  return issues;
}

const REVIEW_ISSUES = validateWeaponSkillStackSemanticReview();
if (REVIEW_ISSUES.length > 0) {
  throw new Error(`Invalid weapon skill-stack semantic review: ${REVIEW_ISSUES.join('; ')}`);
}
