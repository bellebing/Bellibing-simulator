import type { Element } from './gameDataDomain.ts';
import { CHARACTER_CATALOG } from './data/characters.ts';

export const CHARACTER_BUILDER_ASSET_MANIFEST_PATH = 'assets/builder-icons/manifest.json' as const;

const MANIFEST_ROLE = 'builder.icon-foundation';
const MANIFEST_TARGET_PREFIX = 'docs/ui-prototypes/';
const BUILDER_ASSET_TARGET_PREFIX = 'docs/ui-prototypes/assets/builder-icons/';

export type CharacterBuilderSkillRole =
  | 'normal-attack'
  | 'skill'
  | 'liberation'
  | 'intro'
  | 'circuit'
  | 'outro'
  | 'inherent-1'
  | 'inherent-2';

export type CharacterBuilderCoreSkillRole =
  | 'normal-attack'
  | 'skill'
  | 'liberation'
  | 'intro'
  | 'circuit'
  | 'outro';

export type CharacterBuilderSequenceNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface CharacterBuilderAssetRef {
  assetId: string;
  /** Path relative to the published /ui-preview/ root. */
  assetPath: string;
  /** Canonical repository path declared by the builder manifest. */
  manifestTargetPath: string;
}

export interface CharacterBuilderSkillAsset extends CharacterBuilderAssetRef {
  role: CharacterBuilderSkillRole;
}

export interface CharacterBuilderSequenceAsset extends CharacterBuilderAssetRef {
  sequence: CharacterBuilderSequenceNumber;
  sourceChainId: number;
  name: string;
}

export interface CharacterBuilderElementAsset extends CharacterBuilderAssetRef {
  element: Element;
}

export interface CharacterBuilderSkillAssets {
  'normal-attack': CharacterBuilderSkillAsset;
  skill: CharacterBuilderSkillAsset;
  liberation: CharacterBuilderSkillAsset;
  intro: CharacterBuilderSkillAsset;
  circuit: CharacterBuilderSkillAsset;
  outro: CharacterBuilderSkillAsset;
  'inherent-1'?: CharacterBuilderSkillAsset;
  'inherent-2'?: CharacterBuilderSkillAsset;
}

export interface CharacterBuilderAssets {
  characterId: string;
  characterName: string;
  releaseStatus: 'RELEASED';
  chains: readonly CharacterBuilderSequenceAsset[];
  skills: CharacterBuilderSkillAssets;
  element: CharacterBuilderElementAsset;
}

export interface CharacterBuilderAssetResolver {
  /** Released-only UI/runtime contract. Unknown, upcoming and WIP IDs return null. */
  resolve(characterId: string): CharacterBuilderAssets | null;
  has(characterId: string): boolean;
  listCharacterIds(): readonly string[];
}

interface ManifestAsset {
  assetId: string;
  family: string;
  targetPath: string;
}

interface ManifestSkillRef {
  assetId: string;
  targetPath: string;
}

interface ManifestChainRef extends ManifestSkillRef {
  sequence: number;
  sourceChainId: number;
  name: string;
}

interface ManifestCharacter {
  characterId: string;
  characterName: string;
  releaseStatus: string;
  skills: Record<string, ManifestSkillRef>;
  chains: ManifestChainRef[];
}

interface ManifestElement extends ManifestSkillRef {
  element: string;
}

interface BuilderManifest {
  schemaVersion: number;
  role: string;
  elements: ManifestElement[];
  characters: ManifestCharacter[];
  assets: ManifestAsset[];
}

const CORE_SKILL_ROLES: readonly CharacterBuilderCoreSkillRole[] = [
  'normal-attack',
  'skill',
  'liberation',
  'intro',
  'circuit',
  'outro',
];

const INHERENT_SKILL_ROLES = ['inherent-1', 'inherent-2'] as const;
const ALLOWED_SKILL_ROLES = new Set<CharacterBuilderSkillRole>([
  ...CORE_SKILL_ROLES,
  ...INHERENT_SKILL_ROLES,
]);

function fail(message: string): never {
  throw new Error(`Character builder asset manifest invalid: ${message}`);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) fail(`${label} must be a non-empty string`);
  return value;
}

function asNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) fail(`${label} must be a finite number`);
  return value;
}

function parseAssetRef(value: unknown, label: string): ManifestSkillRef {
  if (!isObject(value)) fail(`${label} must be an object`);
  return {
    assetId: asString(value.assetId, `${label}.assetId`),
    targetPath: asString(value.targetPath, `${label}.targetPath`),
  };
}

function parseManifest(input: unknown): BuilderManifest {
  if (!isObject(input)) fail('root must be an object');
  if (input.schemaVersion !== 1 || input.role !== MANIFEST_ROLE) fail('schemaVersion/role drift');
  if (!Array.isArray(input.assets)) fail('assets must be an array');
  if (!Array.isArray(input.elements)) fail('elements must be an array');
  if (!Array.isArray(input.characters)) fail('characters must be an array');

  const assets = input.assets.map((value, index): ManifestAsset => {
    if (!isObject(value)) fail(`assets[${index}] must be an object`);
    return {
      assetId: asString(value.assetId, `assets[${index}].assetId`),
      family: asString(value.family, `assets[${index}].family`),
      targetPath: asString(value.targetPath, `assets[${index}].targetPath`),
    };
  });

  const elements = input.elements.map((value, index): ManifestElement => {
    const ref = parseAssetRef(value, `elements[${index}]`);
    if (!isObject(value)) fail(`elements[${index}] must be an object`);
    return {
      ...ref,
      element: asString(value.element, `elements[${index}].element`),
    };
  });

  const characters = input.characters.map((value, index): ManifestCharacter => {
    if (!isObject(value)) fail(`characters[${index}] must be an object`);
    if (!isObject(value.skills)) fail(`characters[${index}].skills must be an object`);
    if (!Array.isArray(value.chains)) fail(`characters[${index}].chains must be an array`);

    const skills: Record<string, ManifestSkillRef> = {};
    for (const [role, ref] of Object.entries(value.skills)) {
      skills[role] = parseAssetRef(ref, `characters[${index}].skills.${role}`);
    }

    const chains = value.chains.map((chain, chainIndex): ManifestChainRef => {
      const ref = parseAssetRef(chain, `characters[${index}].chains[${chainIndex}]`);
      if (!isObject(chain)) fail(`characters[${index}].chains[${chainIndex}] must be an object`);
      return {
        ...ref,
        sequence: asNumber(chain.sequence, `characters[${index}].chains[${chainIndex}].sequence`),
        sourceChainId: asNumber(chain.sourceChainId, `characters[${index}].chains[${chainIndex}].sourceChainId`),
        name: asString(chain.name, `characters[${index}].chains[${chainIndex}].name`),
      };
    });

    return {
      characterId: asString(value.characterId, `characters[${index}].characterId`),
      characterName: asString(value.characterName, `characters[${index}].characterName`),
      releaseStatus: asString(value.releaseStatus, `characters[${index}].releaseStatus`),
      skills,
      chains,
    };
  });

  return { schemaVersion: 1, role: MANIFEST_ROLE, assets, elements, characters };
}

export function toCharacterBuilderRuntimeAssetPath(manifestTargetPath: string): string {
  if (!manifestTargetPath.startsWith(BUILDER_ASSET_TARGET_PREFIX)) {
    fail(`asset path escapes builder root: ${manifestTargetPath}`);
  }
  return manifestTargetPath.slice(MANIFEST_TARGET_PREFIX.length);
}

function sequenceNumber(value: number, characterId: string): CharacterBuilderSequenceNumber {
  if (!Number.isInteger(value) || value < 1 || value > 6) {
    fail(`${characterId} has invalid sequence number ${value}`);
  }
  return value as CharacterBuilderSequenceNumber;
}

function buildAssetRef(
  ref: ManifestSkillRef,
  family: string,
  owner: string,
  assetByTargetPath: ReadonlyMap<string, ManifestAsset>,
): CharacterBuilderAssetRef {
  const asset = assetByTargetPath.get(ref.targetPath);
  if (!asset) fail(`${owner} points at an undeclared asset: ${ref.targetPath}`);
  if (asset.family !== family) fail(`${owner} expected ${family} asset, got ${asset.family}`);
  if (asset.assetId !== ref.assetId) fail(`${owner} assetId mismatch for ${ref.targetPath}`);

  return {
    assetId: ref.assetId,
    assetPath: toCharacterBuilderRuntimeAssetPath(ref.targetPath),
    manifestTargetPath: ref.targetPath,
  };
}

export function createCharacterBuilderAssetResolver(input: unknown): CharacterBuilderAssetResolver {
  const manifest = parseManifest(input);

  const assetByTargetPath = new Map<string, ManifestAsset>();
  const assetIds = new Set<string>();
  for (const asset of manifest.assets) {
    if (assetByTargetPath.has(asset.targetPath)) fail(`duplicate asset targetPath ${asset.targetPath}`);
    if (assetIds.has(asset.assetId)) fail(`duplicate assetId ${asset.assetId}`);
    assetByTargetPath.set(asset.targetPath, asset);
    assetIds.add(asset.assetId);
    toCharacterBuilderRuntimeAssetPath(asset.targetPath);
  }

  const elementByName = new Map<Element, CharacterBuilderElementAsset>();
  for (const row of manifest.elements) {
    const canonicalElement = row.element as Element;
    if (elementByName.has(canonicalElement)) fail(`duplicate element mapping ${row.element}`);
    const ref = buildAssetRef(row, 'element', `element ${row.element}`, assetByTargetPath);
    elementByName.set(canonicalElement, { ...ref, element: canonicalElement });
  }

  const canonicalById = new Map(CHARACTER_CATALOG.map((character) => [character.id, character]));
  const seenCharacterIds = new Set<string>();
  const released = new Map<string, CharacterBuilderAssets>();

  for (const row of manifest.characters) {
    if (seenCharacterIds.has(row.characterId)) fail(`duplicate characterId ${row.characterId}`);
    seenCharacterIds.add(row.characterId);

    const canonical = canonicalById.get(row.characterId);
    if (!canonical) fail(`unknown canonical characterId ${row.characterId}`);
    if (row.characterName !== canonical.name) {
      fail(`${row.characterId} characterName mismatch: manifest=${row.characterName}, canonical=${canonical.name}`);
    }
    if (row.releaseStatus !== canonical.releaseStatus) {
      fail(`${row.characterId} releaseStatus mismatch: manifest=${row.releaseStatus}, canonical=${canonical.releaseStatus}`);
    }
    if (canonical.releaseStatus === 'UNRELEASED_WIP') {
      fail(`pending Character leaked into builder manifest: ${row.characterId}`);
    }

    for (const role of Object.keys(row.skills)) {
      if (!ALLOWED_SKILL_ROLES.has(role as CharacterBuilderSkillRole)) {
        fail(`${row.characterId} has unsupported skill role ${role}`);
      }
    }
    for (const role of CORE_SKILL_ROLES) {
      if (!row.skills[role]) fail(`${row.characterId} missing required skill role ${role}`);
    }

    const skills = {} as CharacterBuilderSkillAssets;
    for (const role of [...CORE_SKILL_ROLES, ...INHERENT_SKILL_ROLES]) {
      const manifestRef = row.skills[role];
      if (!manifestRef) continue;
      const ref = buildAssetRef(manifestRef, 'skill', `${row.characterId} skill ${role}`, assetByTargetPath);
      skills[role] = { ...ref, role };
    }

    if (row.chains.length !== 6) fail(`${row.characterId} must declare exactly six chains`);
    const chains = row.chains.map((chain, index): CharacterBuilderSequenceAsset => {
      const expected = index + 1;
      if (chain.sequence !== expected) {
        fail(`${row.characterId} chain order mismatch at index ${index}: expected S${expected}, got S${chain.sequence}`);
      }
      const sequence = sequenceNumber(chain.sequence, row.characterId);
      const expectedAssetId = `chain:${row.characterId}:s${sequence}`;
      const expectedTargetPath = `${BUILDER_ASSET_TARGET_PREFIX}chains/${row.characterId}/s${sequence}.webp`;
      if (chain.assetId !== expectedAssetId) {
        fail(`${row.characterId} S${sequence} assetId mismatch: ${chain.assetId}`);
      }
      if (chain.targetPath !== expectedTargetPath) {
        fail(`${row.characterId} S${sequence} asset folder/path mismatch: ${chain.targetPath}`);
      }
      const ref = buildAssetRef(chain, 'chain', `${row.characterId} S${sequence}`, assetByTargetPath);
      return {
        ...ref,
        sequence,
        sourceChainId: chain.sourceChainId,
        name: chain.name,
      };
    });

    if (canonical.element === null) fail(`${row.characterId} has no canonical element`);
    const element = elementByName.get(canonical.element);
    if (!element) fail(`${row.characterId} missing element asset for ${canonical.element}`);

    if (canonical.releaseStatus === 'RELEASED') {
      released.set(row.characterId, {
        characterId: row.characterId,
        characterName: canonical.name,
        releaseStatus: 'RELEASED',
        chains,
        skills,
        element,
      });
    }
  }

  const expectedReleasedIds = CHARACTER_CATALOG
    .filter((character) => character.releaseStatus === 'RELEASED')
    .map((character) => character.id);

  for (const characterId of expectedReleasedIds) {
    if (!released.has(characterId)) fail(`released Character missing from manifest: ${characterId}`);
  }
  if (released.size !== expectedReleasedIds.length) {
    fail(`released Character coverage mismatch: resolved ${released.size}, expected ${expectedReleasedIds.length}`);
  }

  const ids = Object.freeze([...expectedReleasedIds]);
  return Object.freeze({
    resolve(characterId: string): CharacterBuilderAssets | null {
      return released.get(characterId) ?? null;
    },
    has(characterId: string): boolean {
      return released.has(characterId);
    },
    listCharacterIds(): readonly string[] {
      return ids;
    },
  });
}
