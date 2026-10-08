import type { ImprovePolicyState, ImprovePolicyCompatibility } from './improvePolicyState.ts';
import type { ResolvedImprovePolicy, PolicySection } from './improvePolicyDomain.ts';

/** Detached browser inspection contains only presentation and user-owned inputs. */
export function publicSettingsView(state: ImprovePolicyState, resolved: {
  readonly policy: ResolvedImprovePolicy; readonly compatibility: ImprovePolicyCompatibility;
}) {
  const rows = (value: readonly any[] | undefined, keys: readonly string[]) => value?.map(row =>
    Object.fromEntries(keys.filter(key => row[key] !== undefined).map(key => [key, structuredClone(row[key])])));
  const requirements = (value: any) => value == null ? value : ({
    requiredOnEveryEcho: rows(value.requiredOnEveryEcho, ['stat', 'minimum']),
    groups: value.groups?.map((group: any) => ({ id: group.id, members: rows(group.members, ['stat', 'minimum']) })),
  });
  const targets = (value: any) => value?.map((row: any) => ({
    ...rows([row], ['metric', 'unit', 'minimum', 'preferred'])![0],
    basis: { kind: row.basis.kind, description: row.basis.description, comparisonStatus: row.basis.comparisonStatus },
  }));
  const section = (value: PolicySection<any>, project: (value: any) => any) => ({
    status: value.status, origin: value.origin, value: value.value === null ? null : project(value.value),
  });
  const overrides = {
    ...(state.overrides.numericTargets === undefined ? {} : { numericTargets: targets(state.overrides.numericTargets) }),
    ...(state.overrides.priorities === undefined ? {} : { priorities: rows(state.overrides.priorities, ['stat', 'priorityGroup', 'sourceNotes']) }),
    ...(state.overrides.echoRequirements === undefined ? {} : { echoRequirements: requirements(state.overrides.echoRequirements) }),
    ...(state.overrides.echoPreferences === undefined ? {} : { echoPreferences: rows(state.overrides.echoPreferences, ['stat', 'priorityGroup', 'minimum']) }),
  };
  return { schemaVersion: state.schemaVersion, characterId: state.characterId, presetId: state.presetId,
    contextBinding: state.contextBinding, ...(state.echoLayout === undefined ? {} : { echoLayout: structuredClone(state.echoLayout) }), mode: state.mode, gate: state.gate, rollQuality: state.rollQuality,
    migration: state.migration ? { status: state.migration.status, reason: state.migration.reason } : null,
    overrides, compatibility: structuredClone(resolved.compatibility),
    presentation: {
      characterTarget: {
        numericTargets: section(resolved.policy.characterTarget.numericTargets, targets),
        priorities: section(resolved.policy.characterTarget.priorities, value => rows(value, ['stat', 'priorityGroup', 'sourceNotes'])),
      },
      echoPolicy: {
        requirements: section(resolved.policy.echoPolicy.requirements, requirements),
        preferences: section(resolved.policy.echoPolicy.preferences, value => rows(value, ['stat', 'priorityGroup', 'minimum'])),
      },
    },
  };
}
