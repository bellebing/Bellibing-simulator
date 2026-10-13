export const DEFAULT_ENDGAME_LOADOUT_RULES = {
    maxEchoes: 5,
    maxCost: 12,
    requireFullLoadout: false,
};
export const LOADOUT_RULES_PROVENANCE = {
    value: 'Resonators can equip up to five Echoes and can upgrade the shared COST limit to 12.',
    status: 'VERIFIED_EXTERNAL',
    sources: [
        {
            kind: 'GUIDE',
            label: 'Prydwen — Echoes Explained',
            locator: 'https://www.prydwen.gg/wuthering-waves/guides/echoes-explained',
            checkedAt: '2026-08-21',
        },
        {
            kind: 'OTHER',
            label: 'WutheringWaves.gg — Echo System Guide',
            locator: 'https://wutheringwaves.gg/echo-system-guide/',
            checkedAt: '2026-08-21',
        },
    ],
    notes: [
        'Prydwen states five total Echo slots and a COST limit that upgrades from 10 to 12 through Data Dock progression.',
        'Bellibing uses 12 as the default endgame validator cap; callers can provide another verified cap for progression-mode tooling later.',
        'No Sonata, species-duplication or other equip restriction is enforced here until separately verified and modeled.',
    ],
};
export function validateEchoLoadout(echoes, rules = DEFAULT_ENDGAME_LOADOUT_RULES) {
    if (!Number.isInteger(rules.maxEchoes) || rules.maxEchoes <= 0) {
        throw new RangeError(`maxEchoes must be a positive integer, got ${rules.maxEchoes}.`);
    }
    if (!Number.isFinite(rules.maxCost) || rules.maxCost <= 0) {
        throw new RangeError(`maxCost must be positive, got ${rules.maxCost}.`);
    }
    const echoCount = echoes.length;
    const totalCost = echoes.reduce((sum, echo) => sum + echo.cost, 0);
    const violations = [];
    if (echoCount > rules.maxEchoes)
        violations.push('TOO_MANY_ECHOES');
    if (totalCost > rules.maxCost)
        violations.push('TOO_HIGH_COST');
    if (rules.requireFullLoadout && echoCount < rules.maxEchoes)
        violations.push('INCOMPLETE_LOADOUT');
    return {
        valid: violations.length === 0,
        status: violations[0] ?? 'VALID_LOADOUT',
        violations,
        echoCount,
        totalCost,
        rules: { ...rules },
    };
}
