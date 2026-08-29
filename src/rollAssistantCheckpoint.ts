import type { Echo } from './echoCore.ts';
import type { CharacterRollProfile, CheckpointPolicyResult } from './targetCheckpointPolicy.ts';
import { evaluateTargetCheckpoint } from './targetCheckpointPolicy.ts';
import {
  applyCheckpointAssessment,
  recordCheckpoint,
  type RollAssistantInstruction,
  type RollAssistantSession,
} from './rollAssistantSession.ts';

export interface RollAssistantCheckpointResult {
  readonly session: RollAssistantSession;
  readonly instruction: RollAssistantInstruction;
  readonly evaluation: CheckpointPolicyResult;
}

/**
 * One deterministic Roll Assist checkpoint transaction.
 *
 * This is the integration boundary used by the UI: record the exact checkpoint,
 * evaluate the selected character policy, then apply that policy decision to the
 * session. Runtime/integration errors are deliberately allowed to throw so the
 * UI cannot mislabel an exception as a normal DISCARD verdict.
 */
export function evaluateRollAssistantCheckpoint(
  session: RollAssistantSession,
  profile: CharacterRollProfile,
  checkpointEcho: Echo,
): RollAssistantCheckpointResult {
  const recorded = recordCheckpoint(session, checkpointEcho);
  const evaluation = evaluateTargetCheckpoint(profile, checkpointEcho);
  const applied = applyCheckpointAssessment(recorded, evaluation.assessment);

  return {
    session: applied.session,
    instruction: applied.instruction,
    evaluation,
  };
}
