export type ReleaseStatus =
  | 'RELEASED'
  | 'CONFIRMED_UPCOMING'
  | 'UNRELEASED_WIP';

export type VerificationStatus =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'PENDING';

export type IntegrationStatus =
  | 'DATA_ONLY'
  | 'ENGINE_READY'
  | 'INTEGRATED';

export interface ContentProvenance {
  sourceLabels: readonly string[];
  /** Direct source URLs when the record was verified from web/raw data. */
  sourceUrls?: readonly string[];
  checkedAt: string;
  notes?: readonly string[];
}

export interface ContentRecordBase {
  id: string;
  name: string;
  releaseStatus: ReleaseStatus;
  verificationStatus: VerificationStatus;
  integrationStatus: IntegrationStatus;
  provenance: ContentProvenance;
}

/**
 * Raw Echo identity may exist before any character profile recommends it and
 * before its active Echo Skill is combat-modeled.
 */
export interface EchoContent extends ContentRecordBase {
  kind: 'ECHO';
}

/**
 * Echo-set data may exist before any character recommends or consumes it.
 * `effectModelId` is optional until the set effect is actually modeled.
 */
export interface EchoSetContent extends ContentRecordBase {
  kind: 'ECHO_SET';
  effectModelId?: string;
}

/**
 * Character data may exist before weapons, Echo defaults, rotations or advice
 * are connected. Those integrations live in higher layers.
 *
 * null means the field is intentionally unresolved in the raw data catalog;
 * undefined remains valid for older/lightweight registry records.
 */
export interface CharacterContent extends ContentRecordBase {
  kind: 'CHARACTER';
  element?: string | null;
  weaponType?: string | null;
}

/** Weapon raw data is independent of character recommendation/integration. */
export interface WeaponContent extends ContentRecordBase {
  kind: 'WEAPON';
  weaponType?: string | null;
  effectModelId?: string;
}

export type GameContent = EchoContent | EchoSetContent | CharacterContent | WeaponContent;
export type ContentKind = GameContent['kind'];

export interface ContentRegistry {
  echoes: ReadonlyMap<string, EchoContent>;
  echoSets: ReadonlyMap<string, EchoSetContent>;
  characters: ReadonlyMap<string, CharacterContent>;
  weapons: ReadonlyMap<string, WeaponContent>;
}

export function createContentRegistry(items: readonly GameContent[] = []): ContentRegistry {
  const echoes = new Map<string, EchoContent>();
  const echoSets = new Map<string, EchoSetContent>();
  const characters = new Map<string, CharacterContent>();
  const weapons = new Map<string, WeaponContent>();

  for (const item of items) {
    if (item.kind === 'ECHO') registerUnique(echoes, item);
    if (item.kind === 'ECHO_SET') registerUnique(echoSets, item);
    if (item.kind === 'CHARACTER') registerUnique(characters, item);
    if (item.kind === 'WEAPON') registerUnique(weapons, item);
  }

  return { echoes, echoSets, characters, weapons };
}

function registerUnique<T extends ContentRecordBase>(map: Map<string, T>, item: T): void {
  if (map.has(item.id)) throw new Error(`Duplicate content id: ${item.id}`);
  map.set(item.id, item);
}

export function addContent(registry: ContentRegistry, item: GameContent): ContentRegistry {
  return createContentRegistry([
    ...registry.echoes.values(),
    ...registry.echoSets.values(),
    ...registry.characters.values(),
    ...registry.weapons.values(),
    item,
  ]);
}

export function getContent(
  registry: ContentRegistry,
  kind: ContentKind,
  id: string,
): GameContent | null {
  if (kind === 'ECHO') return registry.echoes.get(id) ?? null;
  if (kind === 'ECHO_SET') return registry.echoSets.get(id) ?? null;
  if (kind === 'CHARACTER') return registry.characters.get(id) ?? null;
  return registry.weapons.get(id) ?? null;
}
