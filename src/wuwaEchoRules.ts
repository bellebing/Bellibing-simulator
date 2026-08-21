// Compatibility facade. New Echo-system code should import from `echoCore.ts`
// or `echoCoreRules.ts` so character/combat code can never leak downward.
export * from './echoCoreRules.ts';
