import type { Echo, EchoLevel } from './echoCoreDomain.ts';

export type BuildTargetMode = 'RECOMMENDED' | 'STRONG' | 'HIGH_END' | 'CUSTOM';
export type RollAssistantPhase = 'BUILD' | 'UPGRADE' | 'DONE';
export type RollAssistantSlotStatus = 'EMPTY' | 'ROLLING' | 'TEMPORARY' | 'KEPT';
export type CheckpointDecision = 'ROLL' | 'DISCARD' | 'TEMPORARY' | 'KEEP';

export interface RollAssistantSlot {
  index: number;
  status: RollAssistantSlotStatus;
  echo?: Echo;
  attempts: number;
}

export interface RollAssistantSession {
  targetMode: BuildTargetMode;
  phase: RollAssistantPhase;
  slots: RollAssistantSlot[];
  activeSlotIndex: number | null;
  upgradeTargetIndex: number | null;
}

export interface CheckpointAssessment {
  decision: CheckpointDecision;
  /** Short explanation shown only when the user asks Why?. */
  reason?: string;
}

export type RollAssistantInstruction =
  | { action: 'START'; slotIndex: number; headline: 'START NEW ECHO' }
  | { action: 'ROLL'; slotIndex: number; toLevel: Exclude<EchoLevel, 0>; headline: string }
  | { action: 'DISCARD'; slotIndex: number; headline: 'DISCARD'; reason?: string }
  | { action: 'TEMPORARY'; slotIndex: number; headline: 'USE FOR NOW'; reason?: string }
  | { action: 'KEEP'; slotIndex: number; headline: 'KEEP'; reason?: string }
  | { action: 'UPGRADE'; slotIndex: number; headline: 'UPGRADE THIS ECHO' }
  | { action: 'DONE'; headline: 'BUILD DONE' };

const CHECKPOINTS: readonly EchoLevel[] = [5, 10, 15, 20, 25];

function cloneEcho(echo: Echo): Echo {
  return {
    ...echo,
    mainStat: { ...echo.mainStat },
    secondaryMainStat: echo.secondaryMainStat ? { ...echo.secondaryMainStat } : undefined,
    substats: echo.substats.map((stat) => ({ ...stat })),
  };
}

function cloneSession(session: RollAssistantSession): RollAssistantSession {
  return {
    ...session,
    slots: session.slots.map((slot) => ({
      ...slot,
      echo: slot.echo ? cloneEcho(slot.echo) : undefined,
    })),
  };
}

function assertSlotIndex(session: RollAssistantSession, slotIndex: number): RollAssistantSlot {
  const slot = session.slots[slotIndex];
  if (!slot) throw new RangeError(`Invalid Roll Assistant slot ${slotIndex + 1}.`);
  return slot;
}

function nextCheckpoint(level: EchoLevel): Exclude<EchoLevel, 0> | null {
  const next = CHECKPOINTS.find((checkpoint) => checkpoint > level);
  return (next as Exclude<EchoLevel, 0> | undefined) ?? null;
}

function firstEmptySlot(session: RollAssistantSession): RollAssistantSlot | undefined {
  return session.slots.find((slot) => slot.status === 'EMPTY');
}

/**
 * Orchestration only. This session deliberately contains no character names,
 * stat rankings, crit thresholds, ER rules or DPS math. Those decisions belong
 * to the evaluator supplied by the caller.
 */
export function createRollAssistantSession(
  targetMode: BuildTargetMode = 'RECOMMENDED',
): RollAssistantSession {
  return {
    targetMode,
    phase: 'BUILD',
    slots: Array.from({ length: 5 }, (_, index) => ({
      index,
      status: 'EMPTY' as const,
      attempts: 0,
    })),
    activeSlotIndex: null,
    upgradeTargetIndex: null,
  };
}

/** Attach the real in-game candidate currently being rolled to one empty slot. */
export function startCandidate(
  session: RollAssistantSession,
  slotIndex: number,
  echo: Echo,
): RollAssistantSession {
  if (session.phase !== 'BUILD') throw new Error('New build candidates can only start in BUILD phase.');
  if (echo.level !== 0) throw new RangeError('A new Roll Assistant candidate must start at +0.');

  const next = cloneSession(session);
  const slot = assertSlotIndex(next, slotIndex);
  if (slot.status !== 'EMPTY') throw new Error(`Slot ${slotIndex + 1} is already in use.`);
  if (next.activeSlotIndex !== null) throw new Error('Finish or discard the active Echo before starting another.');

  slot.status = 'ROLLING';
  slot.echo = cloneEcho(echo);
  slot.attempts += 1;
  next.activeSlotIndex = slotIndex;
  return next;
}

/** Replace the active candidate with exactly the next checkpoint entered from the game. */
export function recordCheckpoint(
  session: RollAssistantSession,
  echo: Echo,
): RollAssistantSession {
  const activeSlotIndex = session.activeSlotIndex;
  if (activeSlotIndex === null) throw new Error('No active Echo is waiting for a checkpoint result.');
  if (echo.level === 0) throw new RangeError('A checkpoint result must be +5 or higher.');

  const next = cloneSession(session);
  const slot = assertSlotIndex(next, activeSlotIndex);
  if (!slot.echo) throw new Error('Active slot has no Echo candidate.');
  if (echo.id !== slot.echo.id) throw new Error('Checkpoint Echo id does not match the active candidate.');

  const expected = nextCheckpoint(slot.echo.level);
  if (expected === null) throw new RangeError('A +25 Echo has no later checkpoint.');
  if (echo.level !== expected) {
    throw new RangeError(`Expected checkpoint +${expected}, got +${echo.level}.`);
  }

  slot.echo = cloneEcho(echo);
  return next;
}

/**
 * Apply an evaluator decision. DISCARD retries the same slot. TEMPORARY/KEEP
 * advances to the next empty slot. When all five slots are usable, BUILD ends.
 */
export function applyCheckpointAssessment(
  session: RollAssistantSession,
  assessment: CheckpointAssessment,
): { session: RollAssistantSession; instruction: RollAssistantInstruction } {
  const activeSlotIndex = session.activeSlotIndex;
  if (activeSlotIndex === null) throw new Error('No active Echo to assess.');
  const next = cloneSession(session);
  const slot = assertSlotIndex(next, activeSlotIndex);
  if (!slot.echo || slot.echo.level === 0) throw new Error('Enter a checkpoint result before assessing the Echo.');

  if (assessment.decision === 'ROLL') {
    const toLevel = nextCheckpoint(slot.echo.level);
    if (toLevel === null) throw new Error('A +25 Echo cannot be rolled further.');
    return {
      session: next,
      instruction: {
        action: 'ROLL',
        slotIndex: slot.index,
        toLevel,
        headline: `ROLL TO +${toLevel}`,
      },
    };
  }

  if (assessment.decision === 'DISCARD') {
    const slotIndex = slot.index;
    const attempts = slot.attempts;
    next.slots[slotIndex] = { index: slotIndex, status: 'EMPTY', attempts };
    next.activeSlotIndex = null;
    return {
      session: next,
      instruction: { action: 'DISCARD', slotIndex, headline: 'DISCARD', reason: assessment.reason },
    };
  }

  slot.status = assessment.decision === 'KEEP' ? 'KEPT' : 'TEMPORARY';
  next.activeSlotIndex = null;
  if (!firstEmptySlot(next)) next.phase = 'UPGRADE';

  const instruction: RollAssistantInstruction = assessment.decision === 'KEEP'
    ? { action: 'KEEP', slotIndex: slot.index, headline: 'KEEP', reason: assessment.reason }
    : { action: 'TEMPORARY', slotIndex: slot.index, headline: 'USE FOR NOW', reason: assessment.reason };

  return { session: next, instruction };
}

/** The next visible instruction when no checkpoint verdict is currently on screen. */
export function getNextInstruction(session: RollAssistantSession): RollAssistantInstruction {
  const activeSlotIndex = session.activeSlotIndex;
  if (activeSlotIndex !== null) {
    const slot = assertSlotIndex(session, activeSlotIndex);
    if (!slot.echo) throw new Error('Active slot has no Echo candidate.');
    const toLevel = nextCheckpoint(slot.echo.level);
    if (toLevel === null) throw new Error('Active +25 Echo needs a KEEP/TEMPORARY/DISCARD assessment.');
    return { action: 'ROLL', slotIndex: slot.index, toLevel, headline: `ROLL TO +${toLevel}` };
  }

  if (session.phase === 'BUILD') {
    const empty = firstEmptySlot(session);
    if (!empty) throw new Error('BUILD phase has no empty slot.');
    return { action: 'START', slotIndex: empty.index, headline: 'START NEW ECHO' };
  }

  if (session.phase === 'UPGRADE') {
    if (session.upgradeTargetIndex === null) {
      throw new Error('Upgrade phase needs an externally evaluated upgrade target.');
    }
    return {
      action: 'UPGRADE',
      slotIndex: session.upgradeTargetIndex,
      headline: 'UPGRADE THIS ECHO',
    };
  }

  return { action: 'DONE', headline: 'BUILD DONE' };
}

/**
 * Upgrade targeting is injected from the whole-build evaluator. The session
 * never assumes that the visually weakest Echo is the cheapest to improve.
 */
export function setUpgradeTarget(
  session: RollAssistantSession,
  slotIndex: number | null,
): RollAssistantSession {
  if (session.phase !== 'UPGRADE') throw new Error('Upgrade target is only valid in UPGRADE phase.');
  const next = cloneSession(session);
  if (slotIndex === null) {
    next.phase = 'DONE';
    next.upgradeTargetIndex = null;
    return next;
  }
  const slot = assertSlotIndex(next, slotIndex);
  if (slot.status !== 'TEMPORARY' && slot.status !== 'KEPT') {
    throw new Error('Upgrade target must be an equipped usable Echo.');
  }
  next.upgradeTargetIndex = slotIndex;
  return next;
}
