/** Reviewed Worker M facts supplied with Worker 13; no consumption semantics. */
export const ECHO_TUBE_SOURCE = [
    { id: 'premium', name: 'Premium Sealed Tube', rarity: 5, color: 'Gold', echoExp: 5000 },
    { id: 'advanced', name: 'Advanced Sealed Tube', rarity: 4, color: 'Purple', echoExp: 2000 },
    { id: 'medium', name: 'Medium Sealed Tube', rarity: 3, color: 'Blue', echoExp: 1000 },
    { id: 'basic', name: 'Basic Sealed Tube', rarity: 2, color: 'Green', echoExp: 500 },
];
export const ECHO_TUBE_PROVENANCE = {
    value: 'Four reviewed current Sealed Tube identities, rarities, colors and Echo EXP values',
    status: 'VERIFIED_EXTERNAL',
    sources: [
        { kind: 'GUIDE', label: 'Game8 — How to Get Echo EXP (four-item value table)',
            locator: 'https://game8.co/games/Wuthering-Waves/archives/458113', checkedAt: '2026-10-07' },
        { kind: 'OTHER', label: 'Wuthering Waves Wiki — item rarity registry',
            locator: 'https://wutheringwaves.fandom.com/wiki/Module:Card/items', checkedAt: '2026-10-07' },
    ],
    notes: [
        'Promotion basis: reviewed Research Worker M facts explicitly supplied in the Worker 13 authorization; independently corroborated against indexed public value/rarity tables. Wiki direct-page retrieval was unavailable; not represented as a direct scrape.',
        'Whole item counts only. Exact mixed-inventory selection/depletion, overfill/carry, +25 excess and Data Recovery denomination decomposition remain Pending.',
        'This does not equate direct feed with Data Recovery or alter canonical 75% EXP / 30% Tuner recovery primitives.',
    ],
};
