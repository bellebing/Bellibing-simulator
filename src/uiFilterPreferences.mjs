// UI-only preferences. These bytes are deliberately outside AccountStore,
// Build drafts, equipped items and portable Account backups.
export const UI_PREFERENCES_PREFIX = 'bellibing.ui-preferences.v1:';

export function createUiPreferenceStore(storage, profile, accountId) {
  if (!profile || !accountId) throw Error('UI preferences require an account scope.');
  const key = UI_PREFERENCES_PREFIX + encodeURIComponent(profile) + ':' + encodeURIComponent(accountId);
  let groups = {};
  try {
    const saved = JSON.parse(storage.getItem(key) ?? 'null');
    if (saved?.version === 1 && saved.groups && !Array.isArray(saved.groups) && typeof saved.groups === 'object') {
      groups = structuredClone(saved.groups);
    }
  } catch { // Broken optional UI preferences never block the owner's account.
    groups = {};
  }
  const validGroup = group => typeof group === 'string' && group.length > 0 && group.length <= 180 && !['__proto__', 'constructor', 'prototype'].includes(group);
  return {
    key,
    read(group) {
      if (!validGroup(group)) throw Error('Invalid UI preference group');
      const value = Object.hasOwn(groups, group) ? groups[group] : null;
      return value && typeof value === 'object' && !Array.isArray(value) ? structuredClone(value) : {};
    },
    write(group, value) {
      if (!validGroup(group) || !value || typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid UI preference');
      // Commit the in-memory state only after the separate storage write succeeds.
      const updated = {...groups, [group]: structuredClone(value)};
      storage.setItem(key, JSON.stringify({version: 1, groups: updated}));
      groups = updated;
    }
  };
}
