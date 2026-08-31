import { CHARACTER_CATALOG } from './data/characters.ts';
import { ECHO_CATALOG } from './data/echoes.ts';
import { PROFILE_REGISTRY } from './data/profileCatalogs.ts';
import { SONATA_CATALOG } from './data/sonatas.ts';
import { WEAPON_CATALOG } from './data/weapons.ts';
import {
  assertProfileReadinessAudit,
  type CharacterProfileReadinessDisposition,
} from './profileReadinessRegistry.ts';
import { listCharacterPresets, resolveBuildPreset } from './profileRegistry.ts';
import { buildRollAssistHref, resolveRollAssistProfileBinding } from './rollAssistProfileRegistry.ts';

export interface AlphaPresetOption {
  readonly id: string;
  readonly label: string;
  readonly modeKey: string;
  readonly isDefault: boolean;
}

export interface AlphaCharacterOption {
  readonly characterId: string;
  readonly name: string;
  readonly element: (typeof CHARACTER_CATALOG)[number]['element'];
  readonly weaponType: (typeof CHARACTER_CATALOG)[number]['weaponType'];
  readonly rarity: (typeof CHARACTER_CATALOG)[number]['rarity'];
  readonly readinessDisposition: CharacterProfileReadinessDisposition;
  readonly presets: readonly AlphaPresetOption[];
}

export interface AlphaResolvedSelection {
  readonly character: AlphaCharacterOption;
  readonly preset: AlphaPresetOption;
  readonly weapon: {
    readonly id: string;
    readonly name: string;
    readonly alternatives: readonly string[];
  };
  readonly echoes: {
    readonly sonatas: readonly string[];
    readonly mainEcho: string | null;
    readonly slots: readonly {
      readonly cost: number;
      readonly mainStats: readonly string[];
    }[];
  };
  readonly statPriorities: readonly string[];
  readonly statGates: readonly string[];
  readonly team: readonly string[];
  readonly rotation: {
    readonly executionStatus: 'SOURCE_SEQUENCE_ONLY' | 'ENGINE_MODELED';
    readonly engineModelId: string | null;
    readonly rotationSeconds: number | null;
    readonly sourceSequence: readonly string[];
  };
  readonly rollAssist: {
    readonly supported: boolean;
    readonly policyId: string | null;
    readonly href: string | null;
    readonly reason: string;
  };
  readonly analysisReady: boolean;
}

const readiness = assertProfileReadinessAudit();
const readinessByCharacter = new Map(readiness.characters.map((row) => [row.characterId, row]));
const characterById = new Map(CHARACTER_CATALOG.map((row) => [row.id, row]));
const weaponNameById = new Map<string, string>(WEAPON_CATALOG.map((row) => [row.id, row.name]));
const echoNameById = new Map<string, string>(ECHO_CATALOG.map((row) => [row.id, row.name]));
const sonataNameById = new Map<string, string>(SONATA_CATALOG.map((row) => [row.id, row.name]));

function characterName(id: string): string {
  return characterById.get(id)?.name ?? id;
}

export function listAlphaCharacterOptions(): readonly AlphaCharacterOption[] {
  const characterIds = new Set(
    [...PROFILE_REGISTRY.presets.values()]
      .filter((preset) => preset.uiSelectable)
      .map((preset) => preset.characterId),
  );
  const rows: AlphaCharacterOption[] = [];

  for (const characterId of characterIds) {
    const character = characterById.get(characterId);
    const readinessRow = readinessByCharacter.get(characterId);
    if (!character || character.releaseStatus !== 'RELEASED' || !readinessRow) continue;

    const presets = listCharacterPresets(PROFILE_REGISTRY, characterId).map((preset) => ({
      id: preset.id,
      label: preset.displayLabel,
      modeKey: preset.modeKey,
      isDefault: preset.isDefault,
    }));
    if (presets.length === 0) continue;

    rows.push({
      characterId,
      name: character.name,
      element: character.element,
      weaponType: character.weaponType,
      rarity: character.rarity,
      readinessDisposition: readinessRow.disposition,
      presets,
    });
  }

  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export function resolveAlphaSelection(characterId: string, presetId?: string): AlphaResolvedSelection {
  const character = listAlphaCharacterOptions().find((row) => row.characterId === characterId);
  if (!character) throw new Error(`Unsupported Alpha character: ${characterId}`);

  const preset = presetId
    ? character.presets.find((row) => row.id === presetId)
    : character.presets.find((row) => row.isDefault) ?? character.presets[0];
  if (!preset) throw new Error(`${characterId}: no selectable Alpha preset.`);

  const resolved = resolveBuildPreset(PROFILE_REGISTRY, preset.id);
  const readinessRow = readinessByCharacter.get(characterId)!;
  const analysisReady = readinessRow.disposition === 'DPS_READY'
    && resolved.rotation.executionStatus === 'ENGINE_MODELED'
    && Boolean(resolved.rotation.engineModelId);
  const rollAssistBinding = resolveRollAssistProfileBinding(preset.id);

  return {
    character,
    preset,
    weapon: {
      id: resolved.weaponRecommendation.defaultWeaponId,
      name: weaponNameById.get(resolved.weaponRecommendation.defaultWeaponId) ?? resolved.weaponRecommendation.defaultWeaponId,
      alternatives: resolved.weaponRecommendation.options
        .filter((option) => option.weaponId !== resolved.weaponRecommendation.defaultWeaponId)
        .map((option) => weaponNameById.get(option.weaponId) ?? option.weaponId),
    },
    echoes: {
      sonatas: resolved.echoLoadout.sonataSetIds.map((id) => sonataNameById.get(id) ?? id),
      mainEcho: resolved.echoLoadout.mainEchoId
        ? echoNameById.get(resolved.echoLoadout.mainEchoId) ?? resolved.echoLoadout.mainEchoId
        : null,
      slots: resolved.echoLoadout.slots.map((slot) => ({
        cost: slot.cost,
        mainStats: slot.primaryMainStats.map((row) => row.stat),
      })),
    },
    statPriorities: resolved.statTarget.targetRules.map((row) => row.stat),
    statGates: resolved.statTarget.gates.map((gate) => {
      const preferred = gate.preferred === undefined ? '' : ` (preferred ${gate.preferred})`;
      return `${gate.stat} ≥ ${gate.minimum}${preferred}`;
    }),
    team: resolved.team.members.map((member) => `${characterName(member.characterId)} · ${member.role}`),
    rotation: {
      executionStatus: resolved.rotation.executionStatus,
      engineModelId: resolved.rotation.engineModelId ?? null,
      rotationSeconds: resolved.rotation.rotationSeconds ?? null,
      sourceSequence: resolved.rotation.sourceSequence,
    },
    rollAssist: rollAssistBinding
      ? {
        supported: true,
        policyId: rollAssistBinding.policy.id,
        href: buildRollAssistHref(rollAssistBinding),
        reason: 'Verified Roll Assist policy matches this canonical Echo slot layout.',
      }
      : {
        supported: false,
        policyId: null,
        href: null,
        reason: 'No verified Roll Assist checkpoint policy is bound to this canonical profile.',
      },
    analysisReady,
  };
}
