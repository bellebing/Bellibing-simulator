/** Public availability contract. A future private runtime owns evaluation. */
export interface PublicDecisionAvailability {
  readonly status: 'PENDING';
  readonly reason: 'RUNTIME_UNAVAILABLE';
}
export const PUBLIC_DECISION_AVAILABILITY: PublicDecisionAvailability = Object.freeze({
  status: 'PENDING', reason: 'RUNTIME_UNAVAILABLE',
});
