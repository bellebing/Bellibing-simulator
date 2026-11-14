import { readResourceInventory } from "./resourceInventory.js";
import { SUBSTAT_TYPES, SUBSTAT_VALUE_TABLE } from "./echoCoreRules.js";
export const IMPROVE_POLICY_SCHEMA_VERSION = 3;
export const IMPROVE_POLICY_STORAGE_KEY = 'bellibing.improve.policy.v3';
export const IMPROVE_POLICY_V2_KEY = 'bellibing.improve.simple-settings.v2';
const sections = ['numericTargets', 'priorities', 'echoRequirements', 'echoPreferences'];
const record = (value) => value !== null && typeof value === 'object'
    && !Array.isArray(value) ? value : {};
const own = (value, key) => Object.hasOwn(value, key);
const gate = (value) => [5, 10, 15, 20, 25].includes(value) ? value : 5;
const quality = (value) => ['All Rolls', 'Mid+', 'High+'].includes(value)
    ? value : 'All Rolls';
const stat = (value) => SUBSTAT_TYPES.includes(value);
const nonnegative = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const positiveInteger = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const unique = (rows, key) => new Set(rows.map(row => record(row)[key])).size === rows.length;
const list = (value, valid, key) => Array.isArray(value) && unique(value, key) && value.every(row => valid(record(row)));
function validEchoLayout(value) {
    const layout = record(value);
    if (Object.keys(layout).some(key => !['every', 'flex', 'other', 'minimums'].includes(key)))
        return false;
    const names = [];
    for (const key of ['every', 'flex', 'other']) {
        if (!Array.isArray(layout[key]) || !layout[key].every(stat))
            return false;
        names.push(...layout[key]);
    }
    return names.length === SUBSTAT_TYPES.length && new Set(names).size === SUBSTAT_TYPES.length
        && layout.minimums !== null && typeof layout.minimums === 'object' && !Array.isArray(layout.minimums)
        && Object.entries(record(layout.minimums)).every(([name, minimum]) => stat(name) && nonnegative(minimum));
}
/** Structural/identity validation only. These checks do not execute requirements. */
function validOverride(section, value) {
    if (section === 'echoPreferences' || section === 'priorities') {
        return list(value, row => stat(row.stat) && positiveInteger(row.priorityGroup)
            && (section !== 'echoPreferences' || row.minimum === undefined || nonnegative(row.minimum))
            && (section !== 'priorities' || row.sourceNotes === null || typeof row.sourceNotes === 'string'), 'stat');
    }
    if (section === 'numericTargets') {
        return list(value, row => {
            const ratio = ['TOTAL_ENERGY_REGEN', 'TOTAL_CRIT_RATE', 'TOTAL_CRIT_DAMAGE'].includes(row.metric);
            const points = ['TOTAL_ATK', 'TOTAL_HP', 'TOTAL_DEF'].includes(row.metric);
            const basis = record(row.basis);
            return (ratio && row.unit === 'RATIO' || points && row.unit === 'POINTS') && nonnegative(row.minimum)
                && (row.preferred === undefined || nonnegative(row.preferred) && row.preferred >= row.minimum)
                && basis.kind === 'USER_DEFINED' && basis.comparisonStatus === 'PENDING'
                && (basis.description === null || typeof basis.description === 'string');
        }, 'metric');
    }
    const requirements = record(value);
    if (Object.keys(requirements).some(key => !['requiredOnEveryEcho', 'groups'].includes(key)))
        return false;
    const validRequirement = (row) => stat(row.stat)
        && (row.minimum === undefined || nonnegative(row.minimum));
    return list(requirements.requiredOnEveryEcho, validRequirement, 'stat')
        && list(requirements.groups, row => typeof row.id === 'string' && row.id.length > 0
            && Object.keys(row).every(key => ['id', 'members', 'minimumCount'].includes(key))
            && (row.minimumCount === undefined || positiveInteger(row.minimumCount))
            && list(row.members, validRequirement, 'stat'), 'id');
}
export function createImprovePolicyState(characterId, recommended) {
    if (recommended.characterId !== characterId)
        throw new Error('Policy Character mismatch.');
    return { schemaVersion: 3, characterId, presetId: recommended.presetId,
        contextBinding: recommended.applicability?.contextBinding ?? null,
        mode: 'RECOMMENDED', overrides: {}, gate: 5, rollQuality: 'All Rolls', migration: null };
}
/** Exact v2 serialization is validated independently of the new reviewed context. */
export function migrateV2ImprovePolicy(characterId, saved, recommended, legacySource) {
    const old = record(saved), valuable = record(old.valuableStats);
    const initial = { ...createImprovePolicyState(characterId, recommended), gate: gate(old.gate), rollQuality: quality(old.rollQuality) };
    if (valuable.orderingMode !== 'MANUAL')
        return initial;
    const intent = { schemaVersion: old.schemaVersion, characterId: old.characterId,
        valuableStatsSchemaVersion: valuable.schemaVersion,
        presetId: valuable.presetId, profileId: valuable.profileId, sourceBinding: valuable.sourceBinding,
        activeStats: structuredClone(valuable.activeStats ?? null) };
    return resumeMigration({ ...initial, mode: 'MANUAL', presetId: typeof intent.presetId === 'string' ? intent.presetId : null,
        contextBinding: null, migration: { fromVersion: 2, status: 'PENDING', intent, reason: 'Legacy binding not yet validated.' } }, recommended, legacySource);
}
function resumeMigration(state, recommended, source) {
    const migration = state.migration;
    if (!migration || migration.status === 'MIGRATED' || state.mode !== 'MANUAL')
        return state;
    const intent = migration.intent;
    const priorities = recommended.characterTarget.priorities;
    const ready = source?.status === 'READY' && source.characterId === state.characterId
        && recommended.characterId === state.characterId && recommended.applicability !== null
        && priorities.status === 'VERIFIED' && priorities.source.sourceId === source.profileId
        && JSON.stringify(priorities.source.provenance) === JSON.stringify(source.provenance)
        && JSON.stringify(priorities.value.map(row => ({ name: row.stat, note: row.sourceNotes }))) === JSON.stringify(source.stats);
    if (!ready || !source)
        return { ...state, migration: { ...migration, status: 'PENDING', reason: 'Source/context unavailable; original v2 intent retained.' } };
    const binding = JSON.stringify([state.characterId, source.presetId, source.profileId, source.provenance, source.stats]);
    const same = intent.schemaVersion === 2 && intent.valuableStatsSchemaVersion === 2 && intent.characterId === state.characterId
        && intent.presetId === source.presetId && intent.profileId === source.profileId
        && source.presetId === recommended.presetId && intent.sourceBinding === binding;
    if (!same || !Array.isArray(intent.activeStats))
        return { ...state,
            migration: { ...migration, status: 'REVIEW_REQUIRED', reason: 'Legacy identity/binding/order incompatible; preferences suspended.' } };
    const active = [...new Set(intent.activeStats.filter((name) => stat(name)
            && source.stats.some(row => row.name === name)))];
    if (intent.activeStats.length > 0 && active.length === 0)
        return { ...state,
            migration: { ...migration, status: 'REVIEW_REQUIRED', reason: 'No valid legacy preference names; original intent suspended, not an explicit empty policy.' } };
    const removed = active.length !== intent.activeStats.length;
    return { ...state, presetId: recommended.presetId, contextBinding: recommended.applicability.contextBinding,
        overrides: { echoPreferences: active.map((name, index) => ({ stat: name, priorityGroup: index + 1 })) },
        migration: { ...migration, status: 'MIGRATED', reason: removed ? 'Invalid/duplicate legacy stats excluded; original order retained for review.' : null } };
}
export function updateImprovePolicyState(state, action, recommended) {
    if (recommended.characterId !== state.characterId)
        throw new Error('Policy Character mismatch.');
    if (action.type === 'gate')
        return gate(action.value) === action.value ? { ...state, gate: action.value } : state;
    if (action.type === 'quality')
        return quality(action.value) === action.value ? { ...state, rollQuality: action.value } : state;
    if (action.type === 'reset' || action.type === 'mode' && action.value === 'RECOMMENDED') {
        const { echoLayout: _layout, ...base } = state;
        return { ...base, mode: 'RECOMMENDED', overrides: {}, migration: null,
            presetId: recommended.presetId, contextBinding: recommended.applicability?.contextBinding ?? state.contextBinding };
    }
    if (action.type === 'mode') {
        if (action.value !== 'MANUAL')
            throw new Error('Invalid Improve policy mode.');
        return { ...state, mode: 'MANUAL' };
    }
    if (action.type === 'layout') {
        if (!validEchoLayout(action.value))
            throw new Error('Invalid Echo row layout.');
        if (!recommended.applicability || state.contextBinding === null && Object.keys(state.overrides).length > 0
            || state.contextBinding !== null
                && (state.contextBinding !== recommended.applicability.contextBinding || state.presetId !== recommended.presetId)
            || state.migration && state.migration.status !== 'MIGRATED')
            throw new Error('Matching reviewed context required for Echo layout.');
        return { ...state, mode: 'MANUAL', presetId: recommended.presetId, contextBinding: recommended.applicability.contextBinding,
            echoLayout: structuredClone(action.value) };
    }
    if (!sections.includes(action.section))
        throw new Error('Unknown policy override section.');
    if (action.type === 'clear') {
        const overrides = { ...state.overrides };
        delete overrides[action.section];
        return { ...state, overrides, migration: action.section === 'echoPreferences' ? null : state.migration };
    }
    if (!validOverride(action.section, action.value))
        throw new Error('Invalid policy override: ' + action.section);
    const context = recommended.applicability;
    if (!context || state.contextBinding === null && Object.keys(state.overrides).length > 0
        || (state.contextBinding !== null && (context.contextBinding !== state.contextBinding || context.presetId !== state.presetId))
        || state.migration && state.migration.status !== 'MIGRATED') {
        throw new Error('Reviewed matching context required; reset suspended policy before replacing its intent.');
    }
    return { ...state, mode: 'MANUAL', presetId: context.presetId, contextBinding: context.contextBinding,
        overrides: { ...state.overrides, [action.section]: structuredClone(action.value) },
        migration: action.section === 'echoPreferences' ? null : state.migration };
}
/** Effective content is disposable. Never pass it to persistence in place of saved intent. */
export function resolveImprovePolicyState(state, recommended) {
    const context = recommended.characterId !== state.characterId ? 'MISMATCH'
        : recommended.applicability === null ? 'UNAVAILABLE'
            : state.contextBinding === null || state.contextBinding === recommended.applicability.contextBinding && state.presetId === recommended.presetId
                ? 'MATCH' : 'MISMATCH';
    const suspended = [], reasons = [];
    if (context !== 'MATCH')
        reasons.push(context === 'MISMATCH' ? 'Character/preset/context mismatch; saved intent is not retargeted.' : 'Reviewed context unavailable.');
    if (recommended.sourceReviewStatus === 'REVIEW_REQUIRED')
        reasons.push('Recommended source drift requires review; inherited sections remain fail-closed.');
    if (state.migration?.reason)
        reasons.push(state.migration.reason);
    // Explicit user-approved Augusta/default configuration, never reviewed provider evidence.
    // Saved Echo intent (including explicit empty sections/layout and deferred migration) wins as a whole.
    const hasEchoIntent = own(state.overrides, 'echoRequirements') || own(state.overrides, 'echoPreferences')
        || state.echoLayout !== undefined || state.migration !== null;
    const userApprovedEchoDefault = !hasEchoIntent && context === 'MATCH' && recommended.applicability !== null
        && recommended.sourceReviewStatus === 'CURRENT' && state.characterId === 'augusta'
        && state.presetId === 'augusta-standard' && recommended.presetId === 'augusta-standard'
        && !(state.contextBinding === null && Object.keys(state.overrides).length > 0);
    const hard = ['CRIT Rate', 'CRIT DMG'];
    const flex = ['ATK%', 'Heavy Attack DMG', 'Energy Regen', 'Flat ATK'];
    const approvedRequirements = { requiredOnEveryEcho: hard.map(stat => ({ stat, minimum: SUBSTAT_VALUE_TABLE[stat][0] })),
        groups: [{ id: 'selected-flex', minimumCount: 1, members: flex.map(stat => ({ stat, minimum: SUBSTAT_VALUE_TABLE[stat][0] })) }] };
    const approvedPreferences = flex.map((stat, index) => ({ stat, priorityGroup: index + 1, minimum: SUBSTAT_VALUE_TABLE[stat][0] }));
    function section(key, inherited) {
        const hasOverride = state.mode === 'MANUAL' && own(state.overrides, key);
        const deferred = state.mode === 'MANUAL' && key === 'echoPreferences' && state.migration !== null && state.migration.status !== 'MIGRATED';
        if (hasOverride && context === 'MATCH' && state.contextBinding !== null && validOverride(key, state.overrides[key])) {
            const value = structuredClone(state.overrides[key]);
            // User settings are content, never an evaluation result.
            return { status: 'USER_DEFINED', origin: 'USER', content: Array.isArray(value) && value.length === 0 ? 'EXPLICITLY_EMPTY' : 'PRESENT', value };
        }
        if (hasOverride || deferred) {
            suspended.push(key);
            reasons.push(key + ': original override suspended pending compatible identity/content.');
            return { status: 'PENDING', origin: 'USER', value: null, reason: reasons.at(-1) };
        }
        if (userApprovedEchoDefault && (key === 'echoRequirements' || key === 'echoPreferences')) {
            return { status: 'USER_DEFINED', origin: 'USER', content: 'PRESENT',
                value: structuredClone(key === 'echoRequirements' ? approvedRequirements : approvedPreferences) };
        }
        if (recommended.characterId !== state.characterId)
            return { status: 'PENDING', origin: 'PROFILE', value: null, reason: 'Policy Character mismatch.' };
        return structuredClone(inherited);
    }
    const policy = { ...structuredClone(recommended), characterId: state.characterId, mode: state.mode,
        ...(recommended.characterId !== state.characterId ? { presetId: state.presetId, applicability: null } : {}),
        characterTarget: { numericTargets: section('numericTargets', recommended.characterTarget.numericTargets),
            priorities: section('priorities', recommended.characterTarget.priorities) },
        echoPolicy: { ...structuredClone(recommended.echoPolicy),
            requirements: section('echoRequirements', recommended.echoPolicy.requirements),
            preferences: section('echoPreferences', recommended.echoPolicy.preferences) } };
    const review = recommended.sourceReviewStatus === 'REVIEW_REQUIRED' || context === 'MISMATCH' || suspended.length > 0 && context !== 'UNAVAILABLE'
        || state.migration?.status === 'REVIEW_REQUIRED' || state.migration?.status === 'MIGRATED' && state.migration.reason !== null;
    return { policy, userApprovedEchoDefault, compatibility: { status: review ? 'REVIEW_REQUIRED' : context === 'UNAVAILABLE' || state.migration?.status === 'PENDING'
                ? 'PENDING' : 'COMPATIBLE', context, suspendedSections: suspended, reasons } };
}
/** Serialization allowlist: no source projections, builds, totals or evaluations. */
function savedIntent(state) {
    const overrides = {};
    if (state.mode === 'MANUAL')
        for (const key of sections)
            if (own(state.overrides, key))
                overrides[key] = structuredClone(state.overrides[key]);
    return { schemaVersion: 3, characterId: state.characterId, presetId: state.presetId, contextBinding: state.contextBinding,
        ...(state.mode === 'MANUAL' && state.echoLayout !== undefined ? { echoLayout: structuredClone(state.echoLayout) } : {}),
        mode: state.mode, overrides: overrides, gate: gate(state.gate), rollQuality: quality(state.rollQuality),
        migration: state.mode === 'MANUAL' ? structuredClone(state.migration) : null };
}
export function loadImprovePolicyStorage(storage) {
    const raw = storage.getItem(IMPROVE_POLICY_STORAGE_KEY);
    if (raw !== null) {
        const saved = record(JSON.parse(raw));
        // Never replace an unknown/corrupt new envelope with v2 or fabricated defaults.
        if (saved.version !== 3)
            throw new Error('Unsupported Improve policy storage version.');
        return { version: 3,
            ...(own(saved, 'resourceInventory') ? { resourceInventory: readResourceInventory(saved.resourceInventory) } : {}),
            characters: structuredClone(record(saved.characters)),
            pendingV2Characters: structuredClone(record(saved.pendingV2Characters)) };
    }
    let old = {};
    const v2 = storage.getItem(IMPROVE_POLICY_V2_KEY);
    if (v2 !== null)
        old = record(JSON.parse(v2));
    // v1 pending records are not v2 Manual intent and are never reinterpreted.
    const pendingV2Characters = {};
    if (old.version === 2)
        for (const [id, rawState] of Object.entries(record(old.characters))) {
            const state = record(rawState), valuable = record(state.valuableStats);
            pendingV2Characters[id] = { schemaVersion: state.schemaVersion, characterId: state.characterId,
                gate: state.gate, rollQuality: state.rollQuality, valuableStats: {
                    schemaVersion: valuable.schemaVersion,
                    presetId: valuable.presetId, profileId: valuable.profileId, sourceBinding: valuable.sourceBinding,
                    orderingMode: valuable.orderingMode, activeStats: structuredClone(valuable.activeStats ?? null),
                } };
        }
    // A v2 envelope may still carry deferred v1 records. Only their independent
    // labels are compatible; selected pools/counts are never v2 Active intent.
    if (old.version === 2)
        for (const [id, rawState] of Object.entries(record(old.pendingV1Characters))) {
            if (own(pendingV2Characters, id))
                continue;
            const state = record(rawState);
            pendingV2Characters[id] = { gate: state.gate, rollQuality: state.rollQuality };
        }
    return { version: 3, characters: {}, pendingV2Characters };
}
export function readImprovePolicyState(store, characterId, recommended, legacySource) {
    if (recommended.characterId !== characterId)
        throw new Error('Policy Character mismatch.');
    const saved = store.characters[characterId];
    if (saved) {
        // The rejected card model is not legacy Flex intent. Never reinterpret or overwrite it.
        if (own(record(saved.overrides), 'echoCards'))
            throw new Error('Retired Echo card settings need review; recovery data retained.');
        if (saved.echoLayout !== undefined && !validEchoLayout(saved.echoLayout))
            throw new Error('Invalid saved Echo row layout.');
        if (saved.schemaVersion !== 3 || saved.characterId !== characterId
            || !['RECOMMENDED', 'MANUAL'].includes(saved.mode) || saved.overrides === null || typeof saved.overrides !== 'object'
            || Array.isArray(saved.overrides) || !(saved.presetId === null || typeof saved.presetId === 'string')
            || !(saved.contextBinding === null || typeof saved.contextBinding === 'string')
            || !(saved.migration === null || saved.migration?.fromVersion === 2
                && ['PENDING', 'REVIEW_REQUIRED', 'MIGRATED'].includes(saved.migration.status)
                && saved.migration.intent !== null && typeof saved.migration.intent === 'object'
                && (saved.migration.reason === null || typeof saved.migration.reason === 'string')))
            throw new Error('Invalid saved Improve policy identity/schema.');
        return resumeMigration(savedIntent(saved), recommended, legacySource);
    }
    return own(store.pendingV2Characters, characterId)
        ? migrateV2ImprovePolicy(characterId, store.pendingV2Characters[characterId], recommended, legacySource)
        : createImprovePolicyState(characterId, recommended);
}
export function persistImprovePolicyState(store, state, storage) {
    const pendingV2Characters = { ...store.pendingV2Characters };
    delete pendingV2Characters[state.characterId];
    const next = { ...store, version: 3,
        characters: { ...store.characters, [state.characterId]: savedIntent(state) }, pendingV2Characters };
    // Write before returning the new immutable store; failure cannot mark a save committed.
    storage.setItem(IMPROVE_POLICY_STORAGE_KEY, JSON.stringify(next));
    return next;
}
/** Same user-owned envelope and write-before-commit recovery discipline as settings. */
export function persistResourceInventory(store, inventory, storage) {
    const next = { ...store, resourceInventory: readResourceInventory(inventory) };
    storage.setItem(IMPROVE_POLICY_STORAGE_KEY, JSON.stringify(next));
    return next;
}
