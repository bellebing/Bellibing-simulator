/** Transport-neutral presentation only. No evaluator policy or HTTP ingress. */
export const SIMULATOR_EVALUATOR_PENDING = Object.freeze({
    status: 'PENDING',
    reason: 'RUNTIME_UNAVAILABLE',
    text: 'Evaluator Pending · private connection unavailable.',
});
export function matchesSimulatorReceipt(context, receipt) {
    return Object.entries(context).every(([key, value]) => receipt[key] === value)
        && (receipt.disposition === 'accepted' || receipt.disposition === 'rejected')
        && typeof receipt.reason === 'string' && receipt.reason.length > 0 && receipt.reason.length <= 160;
}
