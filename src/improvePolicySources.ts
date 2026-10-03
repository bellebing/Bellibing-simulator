import { CHARACTER_CATALOG } from './data/characters.ts';
import { PROFILE_REGISTRY } from './data/profileCatalogs.ts';
import { IMPROVE_POLICY_SOURCE_REVIEW } from './data/improvePolicySourceReview.ts';
import { SUBSTAT_TYPES, SUBSTAT_VALUE_TABLE } from './echoCore.ts';
import { getDefaultBuildPreset, resolveBuildPreset } from './profileRegistry.ts';
import type { ProfileRegistry } from './profileRegistry.ts';
import type { ResolvedBuildPreset } from './profileDomain.ts';
import { resolveRollAssistProfileBinding } from './rollAssistProfileRegistry.ts';
import type { RollAssistProfileBinding } from './rollAssistProfileRegistry.ts';
import type {
  CharacterStatPriority, CharacterStatTarget, EchoRequirements, EchoStatRequirement,
  ImprovePolicyApplicability, PolicySection, PolicySourceEvidence, ResolvedImprovePolicy,
} from './improvePolicyDomain.ts';

/** Stable exact-source serialization. Object key order has no semantic meaning. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return '{' + Object.keys(record).sort().filter(key => record[key] !== undefined)
      .map(key => JSON.stringify(key) + ':' + canonical(record[key])).join(',') + '}';
  }
  return JSON.stringify(value);
}

export async function improvePolicySourceBinding(value: unknown): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(value)));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

/** Only composition evidence, never a snapshot of a user's current equipment. */
export function improvePolicyContextSource(resolved: ResolvedBuildPreset) {
  return { preset: resolved.preset, team: resolved.team, echoLoadout: resolved.echoLoadout,
    rotation: resolved.rotation };
}

function pending<T>(reason: string): PolicySection<T> {
  return { status: 'PENDING', origin: 'PROFILE', value: null, reason };
}

function verified<T>(value: T, source: PolicySourceEvidence): PolicySection<T> {
  // Current registrations all establish content. Missing arrays never use this.
  return { status: 'VERIFIED', content: 'PRESENT', origin: 'PROFILE', value, source };
}

function pendingPolicy(characterId: string, presetId: string | null, reason: string): ResolvedImprovePolicy {
  return { characterId, presetId, mode: 'RECOMMENDED',
    characterTarget: { numericTargets: pending(reason), priorities: pending(reason) },
    echoPolicy: { scope: 'FINISHED_CANDIDATE_ECHO', requirements: pending(reason),
      preferences: pending(reason), checkpointReference: null } };
}

export interface ImprovePolicySourceDependencies {
  readonly registry?: ProfileRegistry;
  readonly rollBinding?: (presetId: string) => RollAssistProfileBinding | null;
}

/**
 * Source contract only. No UI/state migration, build reads, ER satisfaction,
 * ranking or evaluator calls. Pins require an explicit new source review on drift.
 */
export async function projectRecommendedImprovePolicy(
  input: { readonly characterId: string; readonly presetId?: string },
  dependencies: ImprovePolicySourceDependencies = {},
): Promise<ResolvedImprovePolicy> {
  const registry = dependencies.registry ?? PROFILE_REGISTRY;
  const resolveRoll = dependencies.rollBinding ?? resolveRollAssistProfileBinding;
  const { characterId } = input;
  if (!CHARACTER_CATALOG.some(character => character.id === characterId && character.releaseStatus === 'RELEASED')) {
    return pendingPolicy(characterId, input.presetId ?? null, 'Character is not in the RELEASED roster.');
  }
  let resolved: ResolvedBuildPreset | null;
  try {
    resolved = input.presetId ? resolveBuildPreset(registry, input.presetId)
      : getDefaultBuildPreset(registry, characterId);
  } catch {
    return pendingPolicy(characterId, input.presetId ?? null, 'Preset sources are unavailable.');
  }
  if (!resolved) return pendingPolicy(characterId, null, 'No verified default preset.');
  // Detach before awaiting fingerprints so results describe one source snapshot.
  resolved = structuredClone(resolved);
  const { preset, statTarget } = resolved;
  const review = IMPROVE_POLICY_SOURCE_REVIEW.find(row => row.presetId === preset.id);
  if (!review || preset.characterId !== characterId || preset.verificationStatus !== 'VERIFIED') {
    return pendingPolicy(characterId, preset.id, 'No reviewed verified preset for this Character.');
  }
  const contextBinding = await improvePolicySourceBinding(improvePolicyContextSource(resolved));
  if (contextBinding !== review.contextBinding) {
    return pendingPolicy(characterId, preset.id, 'Reviewed context/provenance drift; source review required.');
  }
  const applicability: ImprovePolicyApplicability = {
    characterId, presetId: preset.id, modeKey: preset.modeKey, sequence: preset.sequence,
    weaponRecommendationProfileId: preset.weaponRecommendationProfileId,
    echoLoadoutProfileId: preset.echoLoadoutProfileId, teamProfileId: preset.teamProfileId,
    rotationProfileId: preset.rotationProfileId, contextBinding,
  };
  const result = pendingPolicy(characterId, preset.id, 'No reviewed Echo policy.');
  const targetBinding = await improvePolicySourceBinding(statTarget);
  const targetValid = statTarget.verificationStatus === 'VERIFIED'
    && statTarget.characterId === characterId && targetBinding === review.statTargetBinding;
  const targetSource: PolicySourceEvidence = { reviewId: review.reviewId, sourceId: statTarget.id,
    sourceBinding: targetBinding, applicability, provenance: statTarget.provenance };
  let numericTargets: PolicySection<readonly CharacterStatTarget[]>;
  let priorities: PolicySection<readonly CharacterStatPriority[]>;
  if (!targetValid) {
    numericTargets = pending('StatTargetProfile identity/source/provenance drift; source review required.');
    priorities = pending('StatTargetProfile identity/source/provenance drift; source review required.');
  } else {
    // Only explicitly materialized ER-total gates have a reviewed metric mapping.
    // Neither endgame prose nor substat aliases are parsed into whole-build targets.
    const gatesValid = statTarget.gates.length > 0 && statTarget.gates.every(gate =>
      gate.stat === 'Energy Regen Total' && Number.isFinite(gate.minimum) && gate.minimum >= 0
      && (gate.preferred === undefined || Number.isFinite(gate.preferred) && gate.preferred >= gate.minimum));
    numericTargets = gatesValid ? verified(statTarget.gates.map(gate => ({
      metric: 'TOTAL_ENERGY_REGEN', unit: 'RATIO', minimum: gate.minimum,
      ...(gate.preferred === undefined ? {} : { preferred: gate.preferred }),
      basis: { kind: 'SOURCE_DESCRIBED', description: gate.notes ?? null, comparisonStatus: 'PENDING' },
    })), targetSource) : pending('No reviewed numeric total-stat gate/metric mapping; absence is not verified-empty.');
    const rulesValid = statTarget.targetRules.length > 0 && statTarget.targetRules.every(rule =>
      SUBSTAT_TYPES.includes(rule.stat) && Number.isInteger(rule.priority) && rule.priority > 0)
      && new Set(statTarget.targetRules.map(rule => rule.stat)).size === statTarget.targetRules.length;
    priorities = rulesValid ? verified(statTarget.targetRules.map(rule => ({
      stat: rule.stat, priorityGroup: rule.priority,
      condition: rule.notes ? { kind: 'SOURCE_DESCRIBED', text: rule.notes } : null,
    })), targetSource) : pending('Build priorities have unsupported names or no reviewed content.');
  }
  let echoPolicy = result.echoPolicy;
  if (review.rollPolicyBinding !== null) {
    let binding: RollAssistProfileBinding | null;
    try { binding = resolveRoll(preset.id); } catch { binding = null; }
    binding = binding ? structuredClone(binding) : null;
    const rollValid = binding !== null && binding.presetId === preset.id
      && binding.characterId === characterId && binding.policy.characterId === binding.characterName
      && binding.policy.targetMode === 'RECOMMENDED'
      && await improvePolicySourceBinding(binding) === review.rollPolicyBinding;
    if (!rollValid || !binding) {
      echoPolicy = { ...echoPolicy, requirements: pending('Registered Echo policy source/provenance drift; source review required.') };
    } else {
      const policy = binding.policy;
      const core = policy.targets.filter(row => row.role === 'CORE');
      const useful = policy.targets.filter(row => row.role === 'USEFUL');
      const validThresholds = policy.targets.every(row => SUBSTAT_TYPES.includes(row.name)
        && SUBSTAT_VALUE_TABLE[row.name].includes(row.minimum));
      // This registration approves the existing Augusta full-Core/any-Useful
      // mapping, not a generic inference about other CharacterRollProfiles.
      if (!validThresholds || core.length !== policy.requiredCoreHits || core.length === 0
        || policy.requiredUsefulHits < 1 || policy.requiredUsefulHits > useful.length) {
        echoPolicy = { ...echoPolicy, requirements: pending('Registered Echo requirements cannot be mapped exactly.') };
      } else {
        const requirement = (row: typeof core[number]): EchoStatRequirement => ({ stat: row.name, minimum: row.minimum });
        const requirements: EchoRequirements = {
          requiredOnEveryEcho: core.map(requirement),
          groups: [{ id: policy.id + ':USEFUL', minimumHits: policy.requiredUsefulHits, members: useful.map(requirement) }],
          // Existing +25 KEEP requires deadCount < 2. Keep this additional
          // policy fact; this projection does not execute KEEP/TEMP/DISCARD.
          acceptanceConstraints: { nonTargetRoles: policy.nonTargetRoles, maximumDeadStats: 1 },
        };
        echoPolicy = { ...echoPolicy, requirements: verified(requirements, {
          reviewId: review.reviewId, sourceId: policy.id, sourceBinding: review.rollPolicyBinding,
          applicability, provenance: policy.provenance,
        }), preferences: pending('Core/Useful roles do not establish preference ordering or ties.'),
        checkpointReference: policy };
      }
    }
  }
  return { ...result, characterTarget: { numericTargets, priorities }, echoPolicy };
}

export async function projectReleasedImprovePolicies(): Promise<readonly ResolvedImprovePolicy[]> {
  return Promise.all(CHARACTER_CATALOG.filter(character => character.releaseStatus === 'RELEASED')
    .map(character => projectRecommendedImprovePolicy({ characterId: character.id })));
}
