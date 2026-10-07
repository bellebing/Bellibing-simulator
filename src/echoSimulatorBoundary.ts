/** Transport-neutral presentation only. No evaluator policy or HTTP ingress. */
export const SIMULATOR_EVALUATOR_PENDING = Object.freeze({
  status: 'PENDING' as const,
  reason: 'RUNTIME_UNAVAILABLE' as const,
  text: 'Evaluator Pending · private connection unavailable.',
});

export interface SimulatorContext {
  sessionId: string;
  characterId: string;
  buildRevision: number;
  slot: number;
  candidateId: string;
  candidateRevision: number;
}

/** Historical disposition supplied by a future trusted adapter, never inferred here. */
export interface SimulatorDispositionReceipt extends SimulatorContext {
  disposition: 'accepted' | 'rejected';
  reason: string;
}

export function matchesSimulatorReceipt(context: SimulatorContext, receipt: SimulatorDispositionReceipt): boolean {
  return Object.entries(context).every(([key, value]) => receipt[key as keyof SimulatorContext] === value)
    && (receipt.disposition === 'accepted' || receipt.disposition === 'rejected')
    && typeof receipt.reason === 'string' && receipt.reason.length > 0 && receipt.reason.length <= 160;
}
