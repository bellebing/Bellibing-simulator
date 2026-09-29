import { CHARACTER_CATALOG } from './data/characters.ts';

export const CHARACTER_HERO_ART_MANIFEST_PATH = 'assets/characters/hero-art/manifest.json' as const;

const MANIFEST_ROLE = 'character.hero-art';
const MANIFEST_TARGET_PREFIX = 'docs/ui-prototypes/';
const HERO_ART_TARGET_PREFIX = 'docs/ui-prototypes/assets/characters/hero-art/';
const SOURCE_ASSET_PREFIX = 'public/assets/UIResources/Common/Image/IconRolePile/';
const SOURCE_BANNER_PREFIX = '/assets/UIResources/Common/Image/IconRolePile/';

export type CharacterHeroArtAvailability = 'READY' | 'PENDING' | 'UNAVAILABLE';
export type CharacterHeroArtSafeFraming = 'CONTAIN' | 'COVER' | 'CROP';
export type CharacterHeroArtReviewStatus =
  | 'BUILD_FRAME_PENDING'
  | 'SOURCE_ART_INSPECTED_BUILD_FRAME_PENDING'
  | 'REVIEWED';

export interface CharacterHeroArtFocalAnchor {
  x: number;
  y: number;
}

export interface CharacterHeroArtPresentation {
  safeFraming: CharacterHeroArtSafeFraming;
  reviewStatus: CharacterHeroArtReviewStatus;
  /** Unitless component-local scale. Null means Build-frame review is still required. */
  scale: number | null;
  /** Component-local offset; the integration layer owns the concrete unit. */
  offsetX: number | null;
  /** Component-local offset; the integration layer owns the concrete unit. */
  offsetY: number | null;
  /** Semantic focal anchor in normalized image coordinates [0, 1], when reviewed. */
  focalAnchor: CharacterHeroArtFocalAnchor | null;
  note: string;
}

export interface CharacterHeroArt {
  characterId: string;
  characterName: string;
  releaseStatus: 'RELEASED';
  assetPath: string;
  manifestTargetPath: string;
  sourceCharacterId: number;
  sourceName: string;
  sourceBannerPath: string;
  sourceAssetPath: string;
  sourceBlobSha: string;
  sourceBytes: number;
  presentation: CharacterHeroArtPresentation;
}

export interface PendingCharacterHeroArtCandidate {
  gender: 'M' | 'F';
  sourceCharacterId: number;
  sourceName: string;
  sourceBannerPath: string;
  sourceAssetPath: string;
  sourceBlobSha: string;
  sourceBytes: number;
}

export interface PendingCharacterHeroArt {
  characterId: string;
  characterName: string;
  releaseStatus: 'RELEASED';
  reasonCode: string;
  reason: string;
  candidates: readonly PendingCharacterHeroArtCandidate[];
}

export interface CharacterHeroArtResolver {
  /** Returns only source-verified runtime-ready art. Pending/unreleased/unknown IDs return null. */
  resolve(characterId: string): CharacterHeroArt | null;
  resolvePending(characterId: string): PendingCharacterHeroArt | null;
  status(characterId: string): CharacterHeroArtAvailability;
  listReadyCharacterIds(): readonly string[];
  listPendingCharacterIds(): readonly string[];
  listReleasedCharacterIds(): readonly string[];
}

interface ManifestCharacter {
  characterId: string;
  characterName: string;
  releaseStatus: string;
  sourceCharacterId: number;
  sourceName: string;
  sourceBannerPath: string;
  sourceAssetPath: string;
  sourceBlobSha: string;
  sourceBytes: number;
  targetPath: string;
  presentation: CharacterHeroArtPresentation;
}

interface ManifestPendingCandidate {
  gender: string;
  sourceCharacterId: number;
  sourceName: string;
  sourceBannerPath: string;
  sourceAssetPath: string;
  sourceBlobSha: string;
  sourceBytes: number;
}

interface ManifestPending {
  characterId: string;
  characterName: string;
  releaseStatus: string;
  reasonCode: string;
  reason: string;
  candidates: ManifestPendingCandidate[];
}

interface HeroArtManifest {
  schemaVersion: number;
  role: string;
  characters: ManifestCharacter[];
  pending: ManifestPending[];
}

function fail(message: string): never {
  throw new Error(`Character hero art manifest invalid: ${message}`);
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

function asNullableNumber(value: unknown, label: string): number | null {
  if (value === null) return null;
  return asNumber(value, label);
}

function asSha(value: unknown, label: string): string {
  const sha = asString(value, label);
  if (!/^[0-9a-f]{40}$/.test(sha)) fail(`${label} must be a lowercase Git blob SHA`);
  return sha;
}

function parseFocalAnchor(value: unknown, label: string): CharacterHeroArtFocalAnchor | null {
  if (value === null) return null;
  if (!isObject(value)) fail(`${label} must be an object or null`);
  const x = asNumber(value.x, `${label}.x`);
  const y = asNumber(value.y, `${label}.y`);
  if (x < 0 || x > 1 || y < 0 || y > 1) fail(`${label} must stay within normalized [0, 1] coordinates`);
  return { x, y };
}

function parsePresentation(value: unknown, label: string): CharacterHeroArtPresentation {
  if (!isObject(value)) fail(`${label} must be an object`);
  const safeFraming = asString(value.safeFraming, `${label}.safeFraming`) as CharacterHeroArtSafeFraming;
  if (!['CONTAIN', 'COVER', 'CROP'].includes(safeFraming)) fail(`${label}.safeFraming is unsupported`);
  const reviewStatus = asString(value.reviewStatus, `${label}.reviewStatus`) as CharacterHeroArtReviewStatus;
  if (!['BUILD_FRAME_PENDING', 'SOURCE_ART_INSPECTED_BUILD_FRAME_PENDING', 'REVIEWED'].includes(reviewStatus)) {
    fail(`${label}.reviewStatus is unsupported`);
  }

  const scale = asNullableNumber(value.scale, `${label}.scale`);
  const offsetX = asNullableNumber(value.offsetX, `${label}.offsetX`);
  const offsetY = asNullableNumber(value.offsetY, `${label}.offsetY`);
  const focalAnchor = parseFocalAnchor(value.focalAnchor, `${label}.focalAnchor`);
  const note = asString(value.note, `${label}.note`);

  if (scale !== null && scale <= 0) fail(`${label}.scale must be > 0`);
  if (reviewStatus === 'REVIEWED' && (scale === null || offsetX === null || offsetY === null || focalAnchor === null)) {
    fail(`${label} is REVIEWED but presentation values are incomplete`);
  }

  return { safeFraming, reviewStatus, scale, offsetX, offsetY, focalAnchor, note };
}

function validateSourceRef(
  sourceBannerPath: string,
  sourceAssetPath: string,
  sourceBlobSha: string,
  sourceBytes: number,
  owner: string,
): void {
  if (!sourceBannerPath.startsWith(SOURCE_BANNER_PREFIX) || !sourceBannerPath.endsWith('.webp')) {
    fail(`${owner} sourceBannerPath is not an IconRolePile WebP`);
  }
  if (!sourceAssetPath.startsWith(SOURCE_ASSET_PREFIX) || !sourceAssetPath.endsWith('.webp')) {
    fail(`${owner} sourceAssetPath is not an IconRolePile WebP`);
  }
  if (sourceBlobSha.length !== 40) fail(`${owner} sourceBlobSha is invalid`);
  if (!Number.isInteger(sourceBytes) || sourceBytes <= 0) fail(`${owner} sourceBytes must be a positive integer`);
}

function parseManifest(input: unknown): HeroArtManifest {
  if (!isObject(input)) fail('root must be an object');
  if (input.schemaVersion !== 1 || input.role !== MANIFEST_ROLE) fail('schemaVersion/role drift');
  if (!Array.isArray(input.characters)) fail('characters must be an array');
  if (!Array.isArray(input.pending)) fail('pending must be an array');

  const characters = input.characters.map((value, index): ManifestCharacter => {
    if (!isObject(value)) fail(`characters[${index}] must be an object`);
    const row: ManifestCharacter = {
      characterId: asString(value.characterId, `characters[${index}].characterId`),
      characterName: asString(value.characterName, `characters[${index}].characterName`),
      releaseStatus: asString(value.releaseStatus, `characters[${index}].releaseStatus`),
      sourceCharacterId: asNumber(value.sourceCharacterId, `characters[${index}].sourceCharacterId`),
      sourceName: asString(value.sourceName, `characters[${index}].sourceName`),
      sourceBannerPath: asString(value.sourceBannerPath, `characters[${index}].sourceBannerPath`),
      sourceAssetPath: asString(value.sourceAssetPath, `characters[${index}].sourceAssetPath`),
      sourceBlobSha: asSha(value.sourceBlobSha, `characters[${index}].sourceBlobSha`),
      sourceBytes: asNumber(value.sourceBytes, `characters[${index}].sourceBytes`),
      targetPath: asString(value.targetPath, `characters[${index}].targetPath`),
      presentation: parsePresentation(value.presentation, `characters[${index}].presentation`),
    };
    validateSourceRef(row.sourceBannerPath, row.sourceAssetPath, row.sourceBlobSha, row.sourceBytes, row.characterId);
    return row;
  });

  const pending = input.pending.map((value, index): ManifestPending => {
    if (!isObject(value)) fail(`pending[${index}] must be an object`);
    if (!Array.isArray(value.candidates)) fail(`pending[${index}].candidates must be an array`);
    const characterId = asString(value.characterId, `pending[${index}].characterId`);
    const candidates = value.candidates.map((candidate, candidateIndex): ManifestPendingCandidate => {
      if (!isObject(candidate)) fail(`pending[${index}].candidates[${candidateIndex}] must be an object`);
      const row: ManifestPendingCandidate = {
        gender: asString(candidate.gender, `pending[${index}].candidates[${candidateIndex}].gender`),
        sourceCharacterId: asNumber(candidate.sourceCharacterId, `pending[${index}].candidates[${candidateIndex}].sourceCharacterId`),
        sourceName: asString(candidate.sourceName, `pending[${index}].candidates[${candidateIndex}].sourceName`),
        sourceBannerPath: asString(candidate.sourceBannerPath, `pending[${index}].candidates[${candidateIndex}].sourceBannerPath`),
        sourceAssetPath: asString(candidate.sourceAssetPath, `pending[${index}].candidates[${candidateIndex}].sourceAssetPath`),
        sourceBlobSha: asSha(candidate.sourceBlobSha, `pending[${index}].candidates[${candidateIndex}].sourceBlobSha`),
        sourceBytes: asNumber(candidate.sourceBytes, `pending[${index}].candidates[${candidateIndex}].sourceBytes`),
      };
      if (row.gender !== 'M' && row.gender !== 'F') fail(`${characterId} pending candidate gender must be M or F`);
      validateSourceRef(row.sourceBannerPath, row.sourceAssetPath, row.sourceBlobSha, row.sourceBytes, `${characterId} ${row.gender}`);
      return row;
    });
    return {
      characterId,
      characterName: asString(value.characterName, `pending[${index}].characterName`),
      releaseStatus: asString(value.releaseStatus, `pending[${index}].releaseStatus`),
      reasonCode: asString(value.reasonCode, `pending[${index}].reasonCode`),
      reason: asString(value.reason, `pending[${index}].reason`),
      candidates,
    };
  });

  return { schemaVersion: 1, role: MANIFEST_ROLE, characters, pending };
}

export function toCharacterHeroArtRuntimeAssetPath(manifestTargetPath: string): string {
  if (!manifestTargetPath.startsWith(HERO_ART_TARGET_PREFIX)) {
    fail(`asset path escapes hero-art root: ${manifestTargetPath}`);
  }
  return manifestTargetPath.slice(MANIFEST_TARGET_PREFIX.length);
}

export function createCharacterHeroArtResolver(input: unknown): CharacterHeroArtResolver {
  const manifest = parseManifest(input);
  const canonicalById = new Map(CHARACTER_CATALOG.map((character) => [character.id, character]));
  const ready = new Map<string, CharacterHeroArt>();
  const pending = new Map<string, PendingCharacterHeroArt>();
  const seen = new Set<string>();

  for (const row of manifest.characters) {
    if (seen.has(row.characterId)) fail(`duplicate characterId ${row.characterId}`);
    seen.add(row.characterId);
    const canonical = canonicalById.get(row.characterId);
    if (!canonical) fail(`unknown canonical characterId ${row.characterId}`);
    if (canonical.releaseStatus !== 'RELEASED' || row.releaseStatus !== 'RELEASED') {
      fail(`non-released Character leaked into ready hero art: ${row.characterId}`);
    }
    if (row.characterName !== canonical.name) {
      fail(`${row.characterId} characterName mismatch: manifest=${row.characterName}, canonical=${canonical.name}`);
    }
    if (!Number.isInteger(row.sourceCharacterId) || row.sourceCharacterId <= 0) {
      fail(`${row.characterId} sourceCharacterId must be a positive integer`);
    }
    const expectedTargetPath = `${HERO_ART_TARGET_PREFIX}${row.characterId}.webp`;
    if (row.targetPath !== expectedTargetPath) {
      fail(`${row.characterId} targetPath mismatch: ${row.targetPath}`);
    }
    ready.set(row.characterId, {
      characterId: row.characterId,
      characterName: row.characterName,
      releaseStatus: 'RELEASED',
      assetPath: toCharacterHeroArtRuntimeAssetPath(row.targetPath),
      manifestTargetPath: row.targetPath,
      sourceCharacterId: row.sourceCharacterId,
      sourceName: row.sourceName,
      sourceBannerPath: row.sourceBannerPath,
      sourceAssetPath: row.sourceAssetPath,
      sourceBlobSha: row.sourceBlobSha,
      sourceBytes: row.sourceBytes,
      presentation: row.presentation,
    });
  }

  for (const row of manifest.pending) {
    if (seen.has(row.characterId)) fail(`duplicate characterId ${row.characterId}`);
    seen.add(row.characterId);
    const canonical = canonicalById.get(row.characterId);
    if (!canonical) fail(`unknown canonical characterId ${row.characterId}`);
    if (canonical.releaseStatus !== 'RELEASED' || row.releaseStatus !== 'RELEASED') {
      fail(`non-released Character leaked into pending hero art: ${row.characterId}`);
    }
    if (row.characterName !== canonical.name) {
      fail(`${row.characterId} characterName mismatch: manifest=${row.characterName}, canonical=${canonical.name}`);
    }
    if (row.candidates.length === 0) fail(`${row.characterId} pending entry must declare source candidates`);
    const sourceIds = new Set<number>();
    const genders = new Set<string>();
    const candidates = row.candidates.map((candidate): PendingCharacterHeroArtCandidate => {
      if (!Number.isInteger(candidate.sourceCharacterId) || candidate.sourceCharacterId <= 0) {
        fail(`${row.characterId} pending sourceCharacterId must be a positive integer`);
      }
      if (sourceIds.has(candidate.sourceCharacterId)) fail(`${row.characterId} has duplicate pending sourceCharacterId ${candidate.sourceCharacterId}`);
      if (genders.has(candidate.gender)) fail(`${row.characterId} has duplicate pending gender ${candidate.gender}`);
      sourceIds.add(candidate.sourceCharacterId);
      genders.add(candidate.gender);
      return {
        gender: candidate.gender as 'M' | 'F',
        sourceCharacterId: candidate.sourceCharacterId,
        sourceName: candidate.sourceName,
        sourceBannerPath: candidate.sourceBannerPath,
        sourceAssetPath: candidate.sourceAssetPath,
        sourceBlobSha: candidate.sourceBlobSha,
        sourceBytes: candidate.sourceBytes,
      };
    });
    pending.set(row.characterId, {
      characterId: row.characterId,
      characterName: row.characterName,
      releaseStatus: 'RELEASED',
      reasonCode: row.reasonCode,
      reason: row.reason,
      candidates,
    });
  }

  const expectedReleasedIds = CHARACTER_CATALOG
    .filter((character) => character.releaseStatus === 'RELEASED')
    .map((character) => character.id);

  for (const characterId of expectedReleasedIds) {
    if (!seen.has(characterId)) fail(`released Character missing hero-art coverage: ${characterId}`);
  }
  if (seen.size !== expectedReleasedIds.length) {
    fail(`released Character coverage mismatch: covered ${seen.size}, expected ${expectedReleasedIds.length}`);
  }

  const readyIds = Object.freeze(expectedReleasedIds.filter((characterId) => ready.has(characterId)));
  const pendingIds = Object.freeze(expectedReleasedIds.filter((characterId) => pending.has(characterId)));
  const releasedIds = Object.freeze([...expectedReleasedIds]);

  return Object.freeze({
    resolve(characterId: string): CharacterHeroArt | null {
      return ready.get(characterId) ?? null;
    },
    resolvePending(characterId: string): PendingCharacterHeroArt | null {
      return pending.get(characterId) ?? null;
    },
    status(characterId: string): CharacterHeroArtAvailability {
      if (ready.has(characterId)) return 'READY';
      if (pending.has(characterId)) return 'PENDING';
      return 'UNAVAILABLE';
    },
    listReadyCharacterIds(): readonly string[] {
      return readyIds;
    },
    listPendingCharacterIds(): readonly string[] {
      return pendingIds;
    },
    listReleasedCharacterIds(): readonly string[] {
      return releasedIds;
    },
  });
}
