import { STANDARD_TEAM_ROTATION_TIMING_REFERENCES, STANDARD_TEAM_ROTATION_TIMING_REVIEW } from './data/standardTeamRotationTiming.ts';

const round = (n: number) => Math.round(n * 100) / 100;

/** Returns candidates for the exact trio, never an automatically executable preset. */
export function findStandardTeamRotationTiming(characterIds: readonly string[], includeAlternatives = false) {
  if (characterIds.length !== 3 || new Set(characterIds).size !== 3) return [];
  return STANDARD_TEAM_ROTATION_TIMING_REFERENCES.filter(r =>
    r.builds.every(b => characterIds.includes(b.characterId)) &&
    (includeAlternatives || r.review.eligibleStandardRotationNumbers.length > 0));
}

/** Source numbers are budgets. Start/end values below are Bellibing arithmetic scenarios, not video timestamps. */
export function describeStandardTeamRotationTiming(sourceId: string, rotationNumber: number) {
  const reference = STANDARD_TEAM_ROTATION_TIMING_REFERENCES.find(r => r.id === sourceId);
  const phase = reference?.phases.find(p => p.rotationNumber === rotationNumber);
  if (!reference || !phase) return null;
  const aggregateWaitSeconds = round(phase.members.reduce((n,m) => n + m.waitSeconds, 0));
  const eligibleStandard = reference.review.eligibleStandardRotationNumbers.includes(rotationNumber);
  const canPlace = eligibleStandard && reference.review.actorOrder !== null && aggregateWaitSeconds === 0;
  let end = 0;
  const visits = canPlace ? reference.review.actorOrder!.map(characterId => {
    const member = phase.members.find(m => m.characterId === characterId)!;
    const startSeconds = end;
    end = round(end + member.fieldSeconds);
    return {characterId, startSeconds, endSeconds:end, durationSeconds:member.fieldSeconds,
      basis:'CUMULATIVE_PUBLISHED_FIELD_BUDGET' as const, sourceLine:member.sourceLine};
  }) : null;
  return {
    sourceId, sourceUrl:reference.url, rotationNumber,
    phase:rotationNumber === 1 ? 'OPENING' as const : 'LATER_ROTATION' as const,
    clock:STANDARD_TEAM_ROTATION_TIMING_REVIEW.methodology.clock,
    eligibleStandard,
    reportedCycleSeconds:phase.reportedCycleSeconds,
    reportedThreeRotationAverageSeconds:reference.reportedAverageCycleSeconds,
    memberBudgets:phase.members,
    aggregateWaitSeconds,
    visits,
    timelineStatus:visits ? 'DERIVED_REFERENCE_SCENARIO' as const : 'AGGREGATE_BUDGETS_ONLY' as const,
    visitTimingGap:canPlace ? null : !eligibleStandard ? 'PHASE_NOT_SELECTED_AS_STANDARD' as const :
      reference.review.actorOrder === null ? 'SPLIT_VISIT_DURATIONS_NOT_PUBLISHED' as const : 'WAIT_POSITION_NOT_PUBLISHED' as const,
    relatedReferenceIds:reference.review.relatedReferenceIds,
    referenceRelationship:reference.review.referenceRelationship,
    modeRequirements:reference.review.modeRequirements,
    sourceBuilds:reference.builds,
    infoSv:reference.review.infoSv,
    actionTimestamps:null,
    automaticBuffUptime:null,
    teamDpsReady:false as const,
    rotationDps:null,
    authorizesUpgradeVerdict:false as const,
  };
}
