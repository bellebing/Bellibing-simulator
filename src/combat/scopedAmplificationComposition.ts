import type { Element } from '../gameDataDomain.ts';
import type { DirectHitDamageClass } from './characterDirectHitAdapter.ts';

export const SCOPED_AMPLIFICATION_COMPOSITION_ID = 'character-hit-scoped-amplification-single-active-v1';

export type CharacterHitAmplificationScope =
  | { readonly kind: 'ALL_DAMAGE' }
  | { readonly kind: 'ELEMENT'; readonly element: Element }
  | { readonly kind: 'DAMAGE_CLASS'; readonly damageClass: DirectHitDamageClass };

export interface QualifiedScopedAmplificationTerm {
  readonly sourceId: string;
  readonly canonicalSourceId: string;
  readonly statOrEffect: string;
  readonly value: number;
  readonly active: boolean;
  readonly evidenceId: string;
  readonly scope: CharacterHitAmplificationScope;
}

/**
 * Exact reviewed labels only. This is classification, not gameplay-text parsing.
 * Echo Skill amplification intentionally stays outside Character direct-hit scope.
 */
export function classifyCharacterHitAmplificationScope(
  statOrEffect: string,
): CharacterHitAmplificationScope | null {
  const exact: Record<string, CharacterHitAmplificationScope> = {
    'DMG Amplification': { kind: 'ALL_DAMAGE' },
    'All DMG Amplification': { kind: 'ALL_DAMAGE' },
    'Aero DMG Amplification': { kind: 'ELEMENT', element: 'Aero' },
    'Electro DMG Amplification': { kind: 'ELEMENT', element: 'Electro' },
    'Fusion DMG Amplification': { kind: 'ELEMENT', element: 'Fusion' },
    'Glacio DMG Amplification': { kind: 'ELEMENT', element: 'Glacio' },
    'Havoc DMG Amplification': { kind: 'ELEMENT', element: 'Havoc' },
    'Spectro DMG Amplification': { kind: 'ELEMENT', element: 'Spectro' },
    'Basic Attack DMG Amplification': { kind: 'DAMAGE_CLASS', damageClass: 'BASIC' },
    'Heavy Attack DMG Amplification': { kind: 'DAMAGE_CLASS', damageClass: 'HEAVY' },
    'Resonance Skill DMG Amplification': { kind: 'DAMAGE_CLASS', damageClass: 'SKILL' },
    'Resonance Liberation DMG Amplification': { kind: 'DAMAGE_CLASS', damageClass: 'LIBERATION' },
  };
  return exact[statOrEffect] ?? null;
}

export function characterHitAmplificationScopeApplies(
  scope: CharacterHitAmplificationScope,
  hit: { readonly damageElement: Element; readonly damageClass: DirectHitDamageClass },
): boolean {
  if (scope.kind === 'ALL_DAMAGE') return true;
  if (scope.kind === 'ELEMENT') return scope.element === hit.damageElement;
  return scope.damageClass === hit.damageClass;
}

/**
 * Deliberately no multi-term arithmetic. The existing damage kernel owns one
 * scalar amplification slot; until cross-scope/source stacking is reviewed,
 * only one active applicable canonical term may populate it.
 */
export function resolveSingleActiveCharacterHitAmplification(input: {
  readonly damageElement: Element;
  readonly damageClass: DirectHitDamageClass;
  readonly terms: readonly QualifiedScopedAmplificationTerm[];
}) {
  if (!['Aero', 'Electro', 'Fusion', 'Glacio', 'Havoc', 'Spectro'].includes(input.damageElement)
    || !['BASIC', 'HEAVY', 'SKILL', 'LIBERATION', 'INTRO', 'OUTRO'].includes(input.damageClass)
    || !Array.isArray(input.terms)) {
    throw new Error('Scoped amplification requires an explicit supported Character hit');
  }
  if (new Set(input.terms.map(term => term.sourceId)).size !== input.terms.length) {
    throw new Error('Scoped amplification source ids must be unique; duplicate stacking is unreviewed');
  }
  for (const term of input.terms) {
    const classified = classifyCharacterHitAmplificationScope(term.statOrEffect);
    if (!term.sourceId.trim() || !term.canonicalSourceId.trim() || !term.evidenceId.trim()
      || !Number.isFinite(term.value) || term.value <= 0 || typeof term.active !== 'boolean'
      || !classified || JSON.stringify(classified) !== JSON.stringify(term.scope)) {
      throw new Error('Scoped amplification term is not bound to an exact supported canonical scope');
    }
  }
  const applicable = input.terms.filter(term => term.active
    && characterHitAmplificationScopeApplies(term.scope, input));
  if (applicable.length === 0) {
    return {
      status: 'RESOLVED_SINGLE_OR_NONE' as const,
      primitiveId: SCOPED_AMPLIFICATION_COMPOSITION_ID,
      amplification: 0,
      applicableTerms: [] as readonly QualifiedScopedAmplificationTerm[],
      stackingPolicy: 'NO_MULTI_TERM_ARITHMETIC' as const,
    };
  }
  if (applicable.length === 1) {
    return {
      status: 'RESOLVED_SINGLE_OR_NONE' as const,
      primitiveId: SCOPED_AMPLIFICATION_COMPOSITION_ID,
      amplification: applicable[0].value,
      applicableTerms: applicable,
      stackingPolicy: 'NO_MULTI_TERM_ARITHMETIC' as const,
    };
  }
  return {
    status: 'PENDING_STACKING' as const,
    primitiveId: SCOPED_AMPLIFICATION_COMPOSITION_ID,
    reason: 'Multiple active applicable amplification terms require reviewed cross-scope/source stacking semantics',
    applicableTerms: applicable,
    stackingPolicy: 'NO_MULTI_TERM_ARITHMETIC' as const,
  };
}
