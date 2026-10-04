import type { ResolvedImprovePolicy, PolicySection, CharacterStatTarget, CharacterStatPriority } from './improvePolicyDomain.ts';

/** Field allowlist for browser presentation and saved-input compatibility only. */
export function publicImproveSettingsSource(source: ResolvedImprovePolicy) {
  const context = source.applicability;
  const section = <T>(input: PolicySection<readonly T[]>, value: (row: T) => unknown) => ({
    status: input.status, origin: input.origin,
    ...(input.status === 'PENDING' ? { reason: input.reason, value: null } : {
      content: input.content, value: input.value.map(value),
      ...(input.status === 'VERIFIED' ? { source: {
        sourceId: input.source.sourceId, provenance: structuredClone(input.source.provenance),
      } } : {}),
    }),
  });
  return {
    characterId: source.characterId, presetId: source.presetId, mode: source.mode,
    sourceReviewStatus: source.sourceReviewStatus,
    applicability: context ? { characterId: context.characterId, presetId: context.presetId, contextBinding: context.contextBinding } : null,
    characterTarget: {
      numericTargets: section(source.characterTarget.numericTargets, (row: CharacterStatTarget) => ({
        metric: row.metric, unit: row.unit, minimum: row.minimum,
        ...(row.preferred === undefined ? {} : { preferred: row.preferred }),
        basis: { kind: row.basis.kind, description: row.basis.description, comparisonStatus: row.basis.comparisonStatus },
      })),
      priorities: section(source.characterTarget.priorities, (row: CharacterStatPriority) => ({
        stat: row.stat, priorityGroup: row.priorityGroup, sourceNotes: row.sourceNotes,
      })),
    },
    echoPolicy: {
      scope: 'FINISHED_CANDIDATE_ECHO',
      requirements: { status: 'PENDING', origin: 'PROFILE', value: null, reason: 'Runtime unavailable.' },
      preferences: { status: 'PENDING', origin: 'PROFILE', value: null, reason: 'Runtime unavailable.' },
    },
  };
}
