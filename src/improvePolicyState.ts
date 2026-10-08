import { readResourceInventory, type ResourceInventory } from './resourceInventory.ts';
import { SUBSTAT_TYPES, SUBSTAT_VALUE_TABLE } from './echoCoreRules.ts';
import type { StatName } from './echoCoreDomain.ts';
import type {
  ImprovePolicyMode, ImprovePolicyOverrides, PolicySection, ResolvedImprovePolicy,
} from './improvePolicyDomain.ts';
import type { projectImproveSettingsSources } from './improveSettingsProjection.ts';

export const IMPROVE_POLICY_SCHEMA_VERSION = 3;
export const IMPROVE_POLICY_STORAGE_KEY = 'bellibing.improve.policy.v3';
export const IMPROVE_POLICY_V2_KEY = 'bellibing.improve.simple-settings.v2';
export type ImproveGate = 5 | 10 | 15 | 20 | 25;
export type ImproveRollQuality = 'All Rolls' | 'Mid+' | 'High+';
export type PolicyOverrideSections = Pick<ImprovePolicyOverrides,
  'numericTargets' | 'priorities' | 'echoRequirements' | 'echoPreferences'>;
export type PolicyOverrideSection = keyof PolicyOverrideSections;
const sections: readonly PolicyOverrideSection[] = ['numericTargets', 'priorities', 'echoRequirements', 'echoPreferences'];
type LegacySource = ReturnType<typeof projectImproveSettingsSources>[number];

/** Only legacy intent/bindings survive migration; never Active's derived Available pool. */
interface V2Intent {
  readonly schemaVersion: unknown;
  readonly valuableStatsSchemaVersion: unknown;
  readonly characterId: unknown;
  readonly presetId: unknown;
  readonly profileId: unknown;
  readonly sourceBinding: unknown;
  readonly activeStats: unknown;
}
export interface ImprovePolicyMigration {
  readonly fromVersion: 2;
  readonly status: 'PENDING' | 'REVIEW_REQUIRED' | 'MIGRATED';
  readonly intent: V2Intent;
  readonly reason: string | null;
}
/** Presentation only: placement and dormant roll values, never acceptance criteria. */
export interface ImproveEchoLayout {
  readonly every: readonly StatName[];
  readonly flex: readonly StatName[];
  readonly other: readonly StatName[];
  readonly minimums: Readonly<Partial<Record<StatName, number>>>;
}
export interface ImprovePolicyState {
  readonly echoLayout?: ImproveEchoLayout;
  readonly schemaVersion: 3;
  readonly characterId: string;
  readonly presetId: string | null;
  readonly contextBinding: string | null;
  readonly mode: ImprovePolicyMode;
  readonly overrides: PolicyOverrideSections;
  readonly gate: ImproveGate;
  readonly rollQuality: ImproveRollQuality;
  /** Suspended original intent is durable; effective compatibility is computed on read. */
  readonly migration: ImprovePolicyMigration | null;
}
export interface ImprovePolicyCompatibility {
  readonly status: 'COMPATIBLE' | 'PENDING' | 'REVIEW_REQUIRED';
  readonly context: 'MATCH' | 'UNAVAILABLE' | 'MISMATCH';
  readonly suspendedSections: readonly PolicyOverrideSection[];
  readonly reasons: readonly string[];
}
export interface ImprovePolicyStorage {
  /** Shared user budget, independent of Character policy and simulator sessions. */
  readonly resourceInventory?: ResourceInventory;
  readonly version: 3;
  readonly characters: Readonly<Record<string, ImprovePolicyState>>;
  readonly pendingV2Characters: Readonly<Record<string, unknown>>;
}
export interface ImprovePolicyStorageAccess {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
const record = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object'
  && !Array.isArray(value) ? value as Record<string, unknown> : {};
const own = (value: object, key: string): boolean => Object.hasOwn(value, key);
const gate = (value: unknown): ImproveGate => [5, 10, 15, 20, 25].includes(value as number) ? value as ImproveGate : 5;
const quality = (value: unknown): ImproveRollQuality => ['All Rolls', 'Mid+', 'High+'].includes(value as string)
  ? value as ImproveRollQuality : 'All Rolls';
const stat = (value: unknown): value is StatName => SUBSTAT_TYPES.includes(value as StatName);
const nonnegative = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const positiveInteger = (value: unknown): boolean => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const unique = (rows: readonly unknown[], key: string): boolean => new Set(rows.map(row => record(row)[key])).size === rows.length;
const list = (value: unknown, valid: (row: Record<string, unknown>) => boolean, key: string): boolean =>
  Array.isArray(value) && unique(value, key) && value.every(row => valid(record(row)));

function validEchoLayout(value: unknown): value is ImproveEchoLayout {
  const layout = record(value);
  if (Object.keys(layout).some(key => !['every', 'flex', 'other', 'minimums'].includes(key))) return false;
  const names: unknown[] = [];
  for (const key of ['every', 'flex', 'other']) {
    if (!Array.isArray(layout[key]) || !(layout[key] as unknown[]).every(stat)) return false;
    names.push(...layout[key] as unknown[]);
  }
  return names.length === SUBSTAT_TYPES.length && new Set(names).size === SUBSTAT_TYPES.length
    && layout.minimums !== null && typeof layout.minimums === 'object' && !Array.isArray(layout.minimums)
    && Object.entries(record(layout.minimums)).every(([name, minimum]) => stat(name) && nonnegative(minimum));
}

/** Structural/identity validation only. These checks do not execute requirements. */
function validOverride(section: PolicyOverrideSection, value: unknown): boolean {
  if (section === 'echoPreferences' || section === 'priorities') {
    return list(value, row => stat(row.stat) && positiveInteger(row.priorityGroup)
      && (section !== 'echoPreferences' || row.minimum === undefined || nonnegative(row.minimum))
      && (section !== 'priorities' || row.sourceNotes === null || typeof row.sourceNotes === 'string'), 'stat');
  }
  if (section === 'numericTargets') {
    return list(value, row => {
      const ratio = ['TOTAL_ENERGY_REGEN', 'TOTAL_CRIT_RATE', 'TOTAL_CRIT_DAMAGE'].includes(row.metric as string);
      const points = ['TOTAL_ATK', 'TOTAL_HP', 'TOTAL_DEF'].includes(row.metric as string);
      const basis = record(row.basis);
      return (ratio && row.unit === 'RATIO' || points && row.unit === 'POINTS') && nonnegative(row.minimum)
        && (row.preferred === undefined || nonnegative(row.preferred) && row.preferred >= row.minimum)
        && basis.kind === 'USER_DEFINED' && basis.comparisonStatus === 'PENDING'
        && (basis.description === null || typeof basis.description === 'string');
    }, 'metric');
  }
  const requirements = record(value);
  if (Object.keys(requirements).some(key => !['requiredOnEveryEcho', 'groups'].includes(key))) return false;
  const validRequirement = (row: Record<string, unknown>): boolean => stat(row.stat)
    && (row.minimum === undefined || nonnegative(row.minimum));
  return list(requirements.requiredOnEveryEcho, validRequirement, 'stat')
    && list(requirements.groups, row => typeof row.id === 'string' && row.id.length > 0
      && Object.keys(row).every(key => ['id', 'members', 'minimumCount'].includes(key))
      && (row.minimumCount === undefined || positiveInteger(row.minimumCount))
      && list(row.members, validRequirement, 'stat'), 'id');
}

export function createImprovePolicyState(characterId: string, recommended: ResolvedImprovePolicy): ImprovePolicyState {
  if (recommended.characterId !== characterId) throw new Error('Policy Character mismatch.');
  return { schemaVersion: 3, characterId, presetId: recommended.presetId,
    contextBinding: recommended.applicability?.contextBinding ?? null,
    mode: 'RECOMMENDED', overrides: {}, gate: 5, rollQuality: 'All Rolls', migration: null };
}

/** Exact v2 serialization is validated independently of the new reviewed context. */
export function migrateV2ImprovePolicy(characterId: string, saved: unknown, recommended: ResolvedImprovePolicy,
  legacySource?: LegacySource): ImprovePolicyState {
  const old = record(saved), valuable = record(old.valuableStats);
  const initial = { ...createImprovePolicyState(characterId, recommended), gate: gate(old.gate), rollQuality: quality(old.rollQuality) };
  if (valuable.orderingMode !== 'MANUAL') return initial;
  const intent: V2Intent = { schemaVersion: old.schemaVersion, characterId: old.characterId,
    valuableStatsSchemaVersion: valuable.schemaVersion,
    presetId: valuable.presetId, profileId: valuable.profileId, sourceBinding: valuable.sourceBinding,
    activeStats: structuredClone(valuable.activeStats ?? null) };
  return resumeMigration({ ...initial, mode: 'MANUAL', presetId: typeof intent.presetId === 'string' ? intent.presetId : null,
    contextBinding: null, migration: { fromVersion: 2, status: 'PENDING', intent, reason: 'Legacy binding not yet validated.' } },
  recommended, legacySource);
}
function resumeMigration(state: ImprovePolicyState, recommended: ResolvedImprovePolicy, source?: LegacySource): ImprovePolicyState {
  const migration = state.migration;
  if (!migration || migration.status === 'MIGRATED' || state.mode !== 'MANUAL') return state;
  const intent = migration.intent;
  const priorities = recommended.characterTarget.priorities;
  const ready = source?.status === 'READY' && source.characterId === state.characterId
    && recommended.characterId === state.characterId && recommended.applicability !== null
    && priorities.status === 'VERIFIED' && priorities.source.sourceId === source.profileId
    && JSON.stringify(priorities.source.provenance) === JSON.stringify(source.provenance)
    && JSON.stringify(priorities.value.map(row => ({ name: row.stat, note: row.sourceNotes }))) === JSON.stringify(source.stats);
  if (!ready || !source) return { ...state, migration: { ...migration, status: 'PENDING', reason: 'Source/context unavailable; original v2 intent retained.' } };
  const binding = JSON.stringify([state.characterId, source.presetId, source.profileId, source.provenance, source.stats]);
  const same = intent.schemaVersion === 2 && intent.valuableStatsSchemaVersion === 2 && intent.characterId === state.characterId
    && intent.presetId === source.presetId && intent.profileId === source.profileId
    && source.presetId === recommended.presetId && intent.sourceBinding === binding;
  if (!same || !Array.isArray(intent.activeStats)) return { ...state,
    migration: { ...migration, status: 'REVIEW_REQUIRED', reason: 'Legacy identity/binding/order incompatible; preferences suspended.' } };
  const active = [...new Set(intent.activeStats.filter((name): name is StatName => stat(name)
    && source.stats.some(row => row.name === name)))];
  if (intent.activeStats.length > 0 && active.length === 0) return { ...state,
    migration: { ...migration, status: 'REVIEW_REQUIRED', reason: 'No valid legacy preference names; original intent suspended, not an explicit empty policy.' } };
  const removed = active.length !== intent.activeStats.length;
  return { ...state, presetId: recommended.presetId, contextBinding: recommended.applicability!.contextBinding,
    overrides: { echoPreferences: active.map((name, index) => ({ stat: name, priorityGroup: index + 1 })) },
    migration: { ...migration, status: 'MIGRATED', reason: removed ? 'Invalid/duplicate legacy stats excluded; original order retained for review.' : null } };
}

export type ImprovePolicyAction =
  | { readonly type: 'mode'; readonly value: ImprovePolicyMode }
  | { readonly type: 'reset' }
  | { readonly type: 'layout'; readonly value: ImproveEchoLayout }
  | { readonly type: 'gate'; readonly value: ImproveGate }
  | { readonly type: 'quality'; readonly value: ImproveRollQuality }
  | { readonly type: 'clear'; readonly section: PolicyOverrideSection }
  | { readonly type: 'set'; readonly section: 'numericTargets'; readonly value: NonNullable<PolicyOverrideSections['numericTargets']> }
  | { readonly type: 'set'; readonly section: 'priorities'; readonly value: NonNullable<PolicyOverrideSections['priorities']> }
  | { readonly type: 'set'; readonly section: 'echoRequirements'; readonly value: NonNullable<PolicyOverrideSections['echoRequirements']> }
  | { readonly type: 'set'; readonly section: 'echoPreferences'; readonly value: NonNullable<PolicyOverrideSections['echoPreferences']> };

export function updateImprovePolicyState(state: ImprovePolicyState, action: ImprovePolicyAction,
  recommended: ResolvedImprovePolicy): ImprovePolicyState {
  if (recommended.characterId !== state.characterId) throw new Error('Policy Character mismatch.');
  if (action.type === 'gate') return gate(action.value) === action.value ? { ...state, gate: action.value } : state;
  if (action.type === 'quality') return quality(action.value) === action.value ? { ...state, rollQuality: action.value } : state;
  if (action.type === 'reset' || action.type === 'mode' && action.value === 'RECOMMENDED') {
    const { echoLayout: _layout, ...base } = state;
    return { ...base, mode: 'RECOMMENDED', overrides: {}, migration: null,
      presetId: recommended.presetId, contextBinding: recommended.applicability?.contextBinding ?? state.contextBinding };
  }
  if (action.type === 'mode') {
    if (action.value !== 'MANUAL') throw new Error('Invalid Improve policy mode.');
    return { ...state, mode: 'MANUAL' };
  }
  if (action.type === 'layout') {
    if (!validEchoLayout(action.value)) throw new Error('Invalid Echo row layout.');
    if (!recommended.applicability || state.contextBinding === null && Object.keys(state.overrides).length > 0
      || state.contextBinding !== null
      && (state.contextBinding !== recommended.applicability.contextBinding || state.presetId !== recommended.presetId)
      || state.migration && state.migration.status !== 'MIGRATED') throw new Error('Matching reviewed context required for Echo layout.');
    return { ...state, mode: 'MANUAL', presetId: recommended.presetId, contextBinding: recommended.applicability.contextBinding,
      echoLayout: structuredClone(action.value) };
  }
  if (!sections.includes(action.section)) throw new Error('Unknown policy override section.');
  if (action.type === 'clear') {
    const overrides = { ...state.overrides }; delete overrides[action.section];
    return { ...state, overrides, migration: action.section === 'echoPreferences' ? null : state.migration };
  }
  if (!validOverride(action.section, action.value)) throw new Error('Invalid policy override: ' + action.section);
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
export function resolveImprovePolicyState(state: ImprovePolicyState, recommended: ResolvedImprovePolicy): {
  readonly policy: ResolvedImprovePolicy; readonly compatibility: ImprovePolicyCompatibility; readonly userApprovedEchoDefault: boolean;
} {
  const context = recommended.characterId !== state.characterId ? 'MISMATCH'
    : recommended.applicability === null ? 'UNAVAILABLE'
    : state.contextBinding === null || state.contextBinding === recommended.applicability.contextBinding && state.presetId === recommended.presetId
      ? 'MATCH' : 'MISMATCH';
  const suspended: PolicyOverrideSection[] = [], reasons: string[] = [];
  if (context !== 'MATCH') reasons.push(context === 'MISMATCH' ? 'Character/preset/context mismatch; saved intent is not retargeted.' : 'Reviewed context unavailable.');
  if (recommended.sourceReviewStatus === 'REVIEW_REQUIRED') reasons.push('Recommended source drift requires review; inherited sections remain fail-closed.');
  if (state.migration?.reason) reasons.push(state.migration.reason);
  // Explicit user-approved Augusta/default configuration, never reviewed provider evidence.
  // Saved Echo intent (including explicit empty sections/layout and deferred migration) wins as a whole.
  const hasEchoIntent = own(state.overrides, 'echoRequirements') || own(state.overrides, 'echoPreferences')
    || state.echoLayout !== undefined || state.migration !== null;
  const userApprovedEchoDefault = !hasEchoIntent && context === 'MATCH' && recommended.applicability !== null
    && recommended.sourceReviewStatus === 'CURRENT' && state.characterId === 'augusta'
    && state.presetId === 'augusta-standard' && recommended.presetId === 'augusta-standard'
    && !(state.contextBinding === null && Object.keys(state.overrides).length > 0);
  const hard: readonly StatName[] = ['CRIT Rate', 'CRIT DMG'];
  const flex: readonly StatName[] = ['ATK%', 'Heavy Attack DMG', 'Energy Regen', 'Flat ATK'];
  const approvedRequirements = { requiredOnEveryEcho: hard.map(stat => ({ stat, minimum: SUBSTAT_VALUE_TABLE[stat]![0]! })),
    groups: [{ id: 'selected-flex', minimumCount: 1, members: flex.map(stat => ({ stat, minimum: SUBSTAT_VALUE_TABLE[stat]![0]! })) }] };
  const approvedPreferences = flex.map((stat, index) => ({ stat, priorityGroup: index + 1, minimum: SUBSTAT_VALUE_TABLE[stat]![0]! }));
  function section<K extends PolicyOverrideSection, T>(key: K, inherited: PolicySection<T>): PolicySection<T> {
    const hasOverride = state.mode === 'MANUAL' && own(state.overrides, key);
    const deferred = state.mode === 'MANUAL' && key === 'echoPreferences' && state.migration !== null && state.migration.status !== 'MIGRATED';
    if (hasOverride && context === 'MATCH' && state.contextBinding !== null && validOverride(key, state.overrides[key])) {
      const value = structuredClone(state.overrides[key]) as T;
      // User settings are content, never an evaluation result.
      return { status: 'USER_DEFINED', origin: 'USER', content: Array.isArray(value) && value.length === 0 ? 'EXPLICITLY_EMPTY' : 'PRESENT', value };
    }
    if (hasOverride || deferred) {
      suspended.push(key);
      reasons.push(key + ': original override suspended pending compatible identity/content.');
      return { status: 'PENDING', origin: 'USER', value: null, reason: reasons.at(-1)! };
    }
    if (userApprovedEchoDefault && (key === 'echoRequirements' || key === 'echoPreferences')) {
      return { status: 'USER_DEFINED', origin: 'USER', content: 'PRESENT',
        value: structuredClone(key === 'echoRequirements' ? approvedRequirements : approvedPreferences) as T };
    }
    if (recommended.characterId !== state.characterId) return { status: 'PENDING', origin: 'PROFILE', value: null, reason: 'Policy Character mismatch.' };
    return structuredClone(inherited);
  }
  const policy: ResolvedImprovePolicy = { ...structuredClone(recommended), characterId: state.characterId, mode: state.mode,
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
function savedIntent(state: ImprovePolicyState): ImprovePolicyState {
  const overrides: Record<string, unknown> = {};
  if (state.mode === 'MANUAL') for (const key of sections) if (own(state.overrides, key)) overrides[key] = structuredClone(state.overrides[key]);
  return { schemaVersion: 3, characterId: state.characterId, presetId: state.presetId, contextBinding: state.contextBinding,
    ...(state.mode === 'MANUAL' && state.echoLayout !== undefined ? { echoLayout: structuredClone(state.echoLayout) } : {}),
    mode: state.mode, overrides: overrides as PolicyOverrideSections, gate: gate(state.gate), rollQuality: quality(state.rollQuality),
    migration: state.mode === 'MANUAL' ? structuredClone(state.migration) : null };
}
export function loadImprovePolicyStorage(storage: ImprovePolicyStorageAccess): ImprovePolicyStorage {
  const raw = storage.getItem(IMPROVE_POLICY_STORAGE_KEY);
  if (raw !== null) {
    const saved = record(JSON.parse(raw));
    // Never replace an unknown/corrupt new envelope with v2 or fabricated defaults.
    if (saved.version !== 3) throw new Error('Unsupported Improve policy storage version.');
    return { version: 3,
      ...(own(saved, 'resourceInventory') ? { resourceInventory: readResourceInventory(saved.resourceInventory) } : {}),
      characters: structuredClone(record(saved.characters)) as Record<string, ImprovePolicyState>,
      pendingV2Characters: structuredClone(record(saved.pendingV2Characters)) };
  }
  let old: Record<string, unknown> = {};
  const v2 = storage.getItem(IMPROVE_POLICY_V2_KEY);
  if (v2 !== null) old = record(JSON.parse(v2));
  // v1 pending records are not v2 Manual intent and are never reinterpreted.
  const pendingV2Characters: Record<string, unknown> = {};
  if (old.version === 2) for (const [id, rawState] of Object.entries(record(old.characters))) {
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
  if (old.version === 2) for (const [id, rawState] of Object.entries(record(old.pendingV1Characters))) {
    if (own(pendingV2Characters, id)) continue;
    const state = record(rawState);
    pendingV2Characters[id] = { gate: state.gate, rollQuality: state.rollQuality };
  }
  return { version: 3, characters: {}, pendingV2Characters };
}
export function readImprovePolicyState(store: ImprovePolicyStorage, characterId: string,
  recommended: ResolvedImprovePolicy, legacySource?: LegacySource): ImprovePolicyState {
  if (recommended.characterId !== characterId) throw new Error('Policy Character mismatch.');
  const saved = store.characters[characterId];
  if (saved) {
    // The rejected card model is not legacy Flex intent. Never reinterpret or overwrite it.
    if (own(record(saved.overrides), 'echoCards')) throw new Error('Retired Echo card settings need review; recovery data retained.');
    if (saved.echoLayout !== undefined && !validEchoLayout(saved.echoLayout)) throw new Error('Invalid saved Echo row layout.');
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
export function persistImprovePolicyState(store: ImprovePolicyStorage, state: ImprovePolicyState,
  storage: ImprovePolicyStorageAccess): ImprovePolicyStorage {
  const pendingV2Characters = { ...store.pendingV2Characters }; delete pendingV2Characters[state.characterId];
  const next: ImprovePolicyStorage = { ...store, version: 3,
    characters: { ...store.characters, [state.characterId]: savedIntent(state) }, pendingV2Characters };
  // Write before returning the new immutable store; failure cannot mark a save committed.
  storage.setItem(IMPROVE_POLICY_STORAGE_KEY, JSON.stringify(next));
  return next;
}

/** Same user-owned envelope and write-before-commit recovery discipline as settings. */
export function persistResourceInventory(store: ImprovePolicyStorage, inventory: ResourceInventory,
  storage: ImprovePolicyStorageAccess): ImprovePolicyStorage {
  const next = { ...store, resourceInventory: readResourceInventory(inventory) };
  storage.setItem(IMPROVE_POLICY_STORAGE_KEY, JSON.stringify(next));
  return next;
}
