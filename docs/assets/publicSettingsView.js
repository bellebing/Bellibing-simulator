/** Detached browser inspection contains only presentation and user-owned inputs. */
export function publicSettingsView(state, resolved) {
    const rows = (value, keys) => value?.map(row => Object.fromEntries(keys.filter(key => row[key] !== undefined).map(key => [key, structuredClone(row[key])])));
    const requirements = (value) => value == null ? value : ({
        requiredOnEveryEcho: rows(value.requiredOnEveryEcho, ['stat', 'minimum']),
        groups: value.groups?.map((group) => ({ id: group.id, ...(group.minimumCount === undefined ? {} : { minimumCount: group.minimumCount }), members: rows(group.members, ['stat', 'minimum']) })),
    });
    const targets = (value) => value?.map((row) => ({
        ...rows([row], ['metric', 'unit', 'minimum', 'preferred'])[0],
        basis: { kind: row.basis.kind, description: row.basis.description, comparisonStatus: row.basis.comparisonStatus },
    }));
    const section = (value, project) => ({
        status: value.status, origin: value.origin, value: value.value === null ? null : project(value.value),
    });
    const overrides = {
        ...(state.overrides.numericTargets === undefined ? {} : { numericTargets: targets(state.overrides.numericTargets) }),
        ...(state.overrides.priorities === undefined ? {} : { priorities: rows(state.overrides.priorities, ['stat', 'priorityGroup', 'sourceNotes']) }),
        ...(state.overrides.echoRequirements === undefined ? {} : { echoRequirements: requirements(state.overrides.echoRequirements) }),
        ...(state.overrides.echoPreferences === undefined ? {} : { echoPreferences: rows(state.overrides.echoPreferences, ['stat', 'priorityGroup', 'minimum']) }),
    };
    return { ...(state.selectedSonataSetIds === undefined ? {} : { selectedSonataSetIds: [...state.selectedSonataSetIds] }),
        schemaVersion: state.schemaVersion, characterId: state.characterId, presetId: state.presetId,
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
