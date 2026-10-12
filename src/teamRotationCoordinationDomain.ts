import type { TeamMemberProfile } from './profileDomain.ts';

export type TeamRotationPatternId = 'SINGLE_CARRY' | 'CARRY_REENTRY' | 'SHARED_FIELD_TIME' | 'OFF_FIELD_ANCHOR' | 'BUFF_CHAIN' | 'MEMBER_GUIDANCE_ONLY';
export type TeamRotationRole = TeamMemberProfile['role'];
export interface TeamRotationPattern {
  readonly id: TeamRotationPatternId; readonly labelSv: string; readonly summarySv: string;
}
export interface RotationParticipation {
  readonly referenceId: string;
  readonly participation: 'PRIORITIES' | 'SETUP' | 'REENTRY' | 'SHARED_WINDOW' | 'FIELD_WINDOW';
  readonly basis: 'EXPLICIT_PHASE_OR_HANDOFF' | 'BROAD_DESCRIPTION_OF_ORDERED_MEMBER_REFERENCE';
}
export interface TeamRotationProof {
  readonly id: string; readonly characterId: string; readonly sourceUrl: string;
  readonly sourceLines: readonly number[]; readonly sectionSha256: string; readonly checkedAt: string;
  readonly claimSv: string;
}
export interface TeamRotationCase {
  readonly id: string; readonly patternId: TeamRotationPatternId;
  readonly requiredCharacters: readonly string[];
  readonly excludedCombinations: readonly (readonly string[])[];
  readonly modeRequirements: Readonly<Record<string, readonly string[]>>;
  readonly requiresExplicitModes: readonly string[];
  readonly partyEvidence: 'NAMED_TRIO' | 'PARTNER_CONTEXT';
  readonly flowBasis: 'REVIEWED_MEMBER_GUIDANCE_SYNTHESIS';
  readonly summarySv: string; readonly broadFlowSv: readonly string[];
  readonly members: readonly {
    readonly characterId: string; readonly roleHint: TeamRotationRole;
    readonly referenceHints: readonly string[]; readonly modeHint: string | null;
  }[];
  readonly proofIds: readonly string[]; readonly infoSv: readonly string[];
}
export interface RotationHitBinding {
  readonly id: string; readonly characterId: string; readonly referenceId: string;
  readonly stepOrder: number; readonly sourceLine: number; readonly sourceInstruction: string;
  readonly factId: string; readonly factName: string; readonly reviewedAt: string;
  readonly scope: 'EXPLICIT_HIT_ONLY_NOT_ROTATION_DPS';
}
export interface TeamRotationMemberInput {
  readonly characterId: string; readonly modeKey?: string; readonly role?: TeamRotationRole;
  readonly referenceId?: string; readonly introAvailable?: boolean;
}
export interface TeamRotationCoordinationInput { readonly members: readonly TeamRotationMemberInput[] }
