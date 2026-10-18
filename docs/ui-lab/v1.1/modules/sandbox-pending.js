// UI-only explanations of server-owned public Sandbox HTTP reason codes.
// The server may report generic configuration Pending; do not guess the failed field.
const messages=Object.freeze({
 INVALID_SANDBOX_CONFIGURATION:'The selected configuration did not pass server validation. Review active Echo slots and Settings.',
 CONFIGURATION_CAPABILITY_PENDING:'This Character, Weapon or Settings combination is not yet executable.',
 PRIVATE_CAPABILITY_PENDING:'This configuration cannot currently be executed by the local simulator.'
});
export function sandboxPendingCopy(reasons){
 const codes=Array.isArray(reasons)?reasons.filter(code=>typeof code==='string'&&/^[A-Z][A-Z0-9_]{0,127}$/.test(code)).slice(0,4):[];
 const labels=codes.map(code=>messages[code]??'The local simulator has not enabled this configuration yet.');
 const text=[...new Set(labels)].join(' · ')||'The local simulator reported Pending for this configuration. No simulation was performed.';
 return {text,codes};
}
