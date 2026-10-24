// UI-only explanations of server-owned public Sandbox HTTP reason codes.
// The server may report generic configuration Pending; do not guess the failed field.
const messages=Object.freeze({
 BROWSER_RUNTIME_RELEASE_PENDING:'Online simulation is awaiting its approved release.',
 RUNTIME_UNAVAILABLE:'Simulation is unavailable while the service is offline.',
 RUNTIME_BETA_EXPIRED:'The online beta has ended. Simulation is unavailable.',
 BETA_BUDGET_EXHAUSTED:'The online beta has reached its request limit. Simulation is unavailable.',
 RUNTIME_SESSION_EXPIRED:'Your simulation session expired. Start a new simulation.',
 RATE_LIMITED:'The simulation request limit was reached. Try again shortly.',
 BROWSER_COMPUTATION_LIMIT_PENDING:'This goal exceeds the browser computation budget. Results remain Pending.',
 BROWSER_RUNTIME_HASH_MISMATCH:'The simulator files do not match the reviewed release. Reload or wait for the corrected release.',
 EXPLICIT_CUSTOM_ECHO_REQUIREMENTS_REQUIRED:'Choose Customize and set your own supported Echo requirements. Recommended numeric requirements are Pending.',
 FLEX_COUNT_NOT_CONFIGURED:'Choose Customize and set how many selected Flex Stats an Echo must have.',
 INVALID_SANDBOX_CONFIGURATION:'The selected configuration did not pass server validation. Review active Echo slots and Settings.',
 CONFIGURATION_CAPABILITY_PENDING:'This Character, Weapon or Settings combination is not yet executable.',
 TOTAL_ER_UNREACHABLE_WITH_CURRENT_SHELL_AND_REQUIREMENTS:'The requested total ER cannot be reached with this equipment and Echo requirements. No simulation was started.',
 INVALID_CUSTOM_TOTAL_ER:'Enter a valid whole-build ER percentage.',
 PRIVATE_CAPABILITY_PENDING:'This configuration cannot currently be executed by the local simulator.'
});
export function sandboxPendingCopy(reasons){
 const codes=Array.isArray(reasons)?reasons.filter(code=>typeof code==='string'&&/^[A-Z][A-Z0-9_]{0,127}$/.test(code)).slice(0,4):[];
 const labels=codes.map(code=>messages[code]??'The local simulator has not enabled this configuration yet.');
 const text=[...new Set(labels)].join(' · ')||'The local simulator reported Pending for this configuration. No simulation was performed.';
 return {text,codes};
}
