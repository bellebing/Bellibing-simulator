// src/inventoryAccount.mjs
var ACCOUNT_SCHEMA = 1;
var ACCOUNT_DATA_KEYS = ["bellibing.improve.policy.v3", "bellibing.improve.simple-settings.v2"];
var LEGACY_BUILD_KEY = "bellibing-ui-checkpoint-v34";
var RECOVERY_KEYS = [LEGACY_BUILD_KEY, "bellibing.improve.policy.v3", "bellibing.improve.simple-settings.v2"];
var copy = structuredClone;
var object = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
var assert = (condition, message) => {
  if (!condition) throw Error(message);
};
function safeDocument(value) {
  let nodes = 0;
  function visit(v, depth = 0) {
    assert(++nodes < 15e4 && depth < 35, "Document is too complex.");
    if (typeof v === "number") assert(Number.isFinite(v), "Non-finite value.");
    if (v && typeof v === "object") for (const [key, item] of Object.entries(v)) {
      assert(!["__proto__", "prototype", "constructor"].includes(key), "Unsafe document field.");
      visit(item, depth + 1);
    }
  }
  visit(value);
  return value;
}
function readJson(text) {
  assert(typeof text === "string" && new TextEncoder().encode(text).length <= 5 * 1024 * 1024, "Backup must be at most 5 MiB.");
  return safeDocument(JSON.parse(text));
}
var id = () => crypto.randomUUID();
function emptyAccount() {
  return { schemaVersion: ACCOUNT_SCHEMA, id: id(), revision: 0, characters: {}, items: {}, unownedDrafts: {}, legacyRoot: {}, legacyRecovery: {}, userData: { version: 1, storage: {}, observations: {} } };
}
function withUserData(account, { storage = {} } = {}) {
  const next = copy(account);
  next.userData ??= { version: 1, storage: copy(storage), observations: {} };
  return next;
}
function validStat(row, allowed) {
  return object(row) && typeof row.name === "string" && Number.isFinite(row.value) && allowed.some((r) => r.name === row.name && Math.abs(r.value - row.value) < 1e-12);
}
function validateEcho(data, identity, catalog2) {
  assert(object(data) && identity, "Unknown Echo identity.");
  const rules = catalog2.statEditor;
  assert(data.cost == null || data.cost === identity.cost, "Echo cost does not match its identity.");
  assert(data.rank == null || data.rank === 5, "This editor supports Rank-5 observations only.");
  assert(data.level == null || rules.levels.includes(data.level), "Unsupported Echo level.");
  assert(data.selectedSonataSetId == null || identity.sonataSetIds.includes(data.selectedSonataSetId), "Illegal Sonata for Echo.");
  const levels = data.level == null ? rules.levels : [data.level];
  if (data.mainStat != null) assert(levels.some((level) => validStat(data.mainStat, rules.mainStatsByCostAndLevel[identity.cost][level])), "Illegal main stat/value.");
  if (data.secondaryMainStat != null) assert(levels.some((level) => validStat(data.secondaryMainStat, [rules.secondaryMainStatsByCostAndLevel[identity.cost][level]])), "Illegal secondary stat/value.");
  assert(Array.isArray(data.substats) && data.substats.length <= 5, "Invalid observed substats.");
  if (data.level != null) assert(data.substats.length <= data.level / 5, "Too many rolls for Echo level.");
  const names = /* @__PURE__ */ new Set();
  for (const roll of data.substats) {
    const source = rules.substats.find((s) => s.name === roll.name);
    assert(source && source.values.some((v) => Math.abs(v - roll.value) < 1e-12) && !names.has(roll.name), "Illegal or duplicate substat.");
    names.add(roll.name);
  }
}
function validateAccount(account, catalog2) {
  safeDocument(account);
  assert(account?.schemaVersion === ACCOUNT_SCHEMA && typeof account.id === "string" && Number.isSafeInteger(account.revision) && account.revision >= 0, "Unsupported account schema.");
  assert(object(account.characters) && object(account.items) && object(account.legacyRoot) && object(account.legacyRecovery), "Invalid account structure.");
  assert(account.unownedDrafts === void 0 || object(account.unownedDrafts), "Invalid unowned drafts.");
  if (account.userData !== void 0) {
    const data = account.userData;
    assert(data.version === 1 && object(data.storage) && object(data.observations), "Unsupported account data.");
    for (const [key, value] of Object.entries(data.storage)) {
      assert(ACCOUNT_DATA_KEYS.includes(key) && typeof value === "string", "Invalid saved account setting.");
      readJson(value);
    }
    if (data.workspaceSettings !== void 0) assert(object(data.workspaceSettings) && Object.keys(data.workspaceSettings).every((id2) => catalog2.characters.some((c) => c.id === id2)), "Invalid Character settings.");
    if (data.teams !== void 0) {
      assert(Array.isArray(data.teams) && data.teams.length <= 100, "Invalid saved teams.");
      const ids = /* @__PURE__ */ new Set();
      for (const team of data.teams) {
        assert(object(team) && typeof team.id === "string" && team.id.length > 0 && team.id.length <= 128 && !ids.has(team.id), "Invalid team identity.");
        ids.add(team.id);
        assert(typeof team.name === "string" && team.name.trim().length > 0 && team.name.length <= 80, "Invalid team name.");
        assert(Array.isArray(team.characterIds) && team.characterIds.length === 3 && new Set(team.characterIds).size === 3 && team.characterIds.every((id2) => account.characters[id2]?.owned), "A team needs three distinct saved Characters.");
      }
    }
  }
  for (const [key, draft2] of Object.entries(account.unownedDrafts ?? {})) assert(catalog2.characters.some((c) => c.id === key && c.name === draft2.name) && object(draft2.record?.build) && !account.characters[key], "Invalid or competing unowned draft.");
  const used = /* @__PURE__ */ new Set();
  for (const [key, item] of Object.entries(account.items)) {
    assert(item.id === key && ["echo", "weapon"].includes(item.kind) && object(item.data), "Invalid physical item.");
    if (item.kind === "echo") validateEcho(item.data, catalog2.echoes.find((e) => e.id === item.catalogId), catalog2);
    else {
      const source = catalog2.weapons.find((w) => w.id === item.catalogId);
      assert(source, "Unknown Weapon.");
      assert(item.data.level == null || Number.isInteger(item.data.level) && item.data.level >= 1 && item.data.level <= 90, "Invalid Weapon level.");
      assert(item.data.refinement == null || Number.isInteger(item.data.refinement) && item.data.refinement >= 1 && item.data.refinement <= 5, "Invalid refinement.");
    }
  }
  for (const [key, character] of Object.entries(account.characters)) {
    const source = catalog2.characters.find((c) => c.id === key);
    assert(source && character.id === key && character.name === source.name && character.record?.character === source.name && typeof character.owned === "boolean" && object(character.record?.build), "Unknown Character/build.");
    const build = character.record.build;
    assert(character.revision === void 0 || Number.isSafeInteger(character.revision) && character.revision > 0, "Invalid Character revision.");
    assert(build.characterLevel == null || Number.isInteger(build.characterLevel) && build.characterLevel >= 1 && build.characterLevel <= 90, "Invalid Character level.");
    assert(build.sequenceLevel == null || Number.isInteger(build.sequenceLevel) && build.sequenceLevel >= 0 && build.sequenceLevel <= 6, "Invalid Sequence.");
    const assign = (itemId, kind) => {
      if (itemId == null) return;
      const item = account.items[itemId];
      assert(item?.kind === kind, "Missing assigned item.");
      assert(!used.has(itemId), "A physical item cannot have multiple active owners.");
      used.add(itemId);
      return item;
    };
    const weapon = assign(build.weaponInstanceId, "weapon");
    if (weapon) assert(catalog2.weapons.find((w) => w.id === weapon.catalogId).weaponType === source.weaponType, "Weapon type does not match Character.");
    if (build.echoSets) {
      assert(object(build.echoSets.sets) && build.echoSets.sets[build.echoSets.activeSetId], "Invalid active Echo set.");
      for (const [setId, set] of Object.entries(build.echoSets.sets)) {
        assert(Array.isArray(set.slots) && set.slots.length === 5, "A build has five Echo slots.");
        let cost = 0;
        const species = /* @__PURE__ */ new Set();
        for (const itemId of set.slots) {
          if (itemId == null) continue;
          const item = account.items[itemId];
          assert(item?.kind === "echo", "Missing Echo instance.");
          cost += catalog2.echoes.find((e) => e.id === item.catalogId).cost;
          assert(!species.has(item.catalogId), "Duplicate Echo species in build.");
          species.add(item.catalogId);
          if (setId === build.echoSets.activeSetId) assign(itemId, "echo");
        }
        assert(cost <= 12, "Equipped Echo cost exceeds 12.");
      }
    }
  }
  return account;
}
function saveOwnedTeam(account, { id: teamId = null, name, characterIds }, catalog2) {
  const next = withUserData(account);
  next.userData.teams ??= [];
  const team = { id: teamId ?? id(), name: typeof name === "string" ? name.trim() : name, characterIds: copy(characterIds) };
  const index = next.userData.teams.findIndex((t) => t.id === team.id);
  assert(!teamId || index >= 0, "Saved team no longer exists.");
  if (index < 0) next.userData.teams.push(team);
  else next.userData.teams[index] = team;
  return validateAccount(next, catalog2);
}
function legacyProjection(account) {
  if (!account) return null;
  const value = { ...copy(account.legacyRoot), characters: [], drafts: Object.fromEntries(Object.values(account.unownedDrafts ?? {}).map((d) => [d.name, copy(d.record)])) };
  for (const c of Object.values(account.characters)) {
    if (c.owned) value.characters.push(c.name);
    const record = copy(c.record), build = record.build;
    if (build.weaponInstanceId) {
      const w = account.items[build.weaponInstanceId];
      build.weaponId = w.catalogId;
      build.weaponLevel = w.data.level;
      build.weaponRefinement = w.data.refinement;
    } else build.weaponId = null;
    delete build.weaponInstanceId;
    if (build.echoSets) for (const set of Object.values(build.echoSets.sets)) set.slots = set.slots.map((itemId) => {
      const e = account.items[itemId];
      return e ? { echoId: e.catalogId, ...copy(e.data), inventoryInstanceId: e.id } : null;
    });
    value.drafts[c.name] = record;
  }
  return value;
}
function accountFromLegacy(legacy, catalog2, { current = null, recovery = {} } = {}) {
  safeDocument(legacy);
  assert(object(legacy) && Array.isArray(legacy.characters) && object(legacy.drafts), "Unreadable legacy account; export/recovery required.");
  assert(legacy.characters.every((name) => typeof name === "string" && object(legacy.drafts[name])), "Owned legacy Character is missing its draft; original data retained for repair.");
  const next = current ? copy(current) : emptyAccount();
  next.legacyRecovery = { ...next.legacyRecovery, ...copy(recovery) };
  if (!current) next.userData.storage = Object.fromEntries(ACCOUNT_DATA_KEYS.filter((key) => typeof recovery[key] === "string").map((key) => [key, recovery[key]]));
  next.unownedDrafts ??= {};
  next.legacyRoot = Object.fromEntries(Object.entries(copy(legacy)).filter(([k]) => !["characters", "drafts"].includes(k)));
  const physical = (kind, catalogId, data, existing) => {
    const old = existing && next.items[existing];
    const physicalId = old?.kind === kind && old.catalogId === catalogId ? existing : id();
    next.items[physicalId] = { ...old ?? {}, id: physicalId, kind, catalogId, data: copy(data), provenance: old?.provenance ?? { kind: "LEGACY_BUILD_OBSERVATION" } };
    return physicalId;
  };
  for (const [name, raw] of Object.entries(legacy.drafts)) {
    const source = catalog2.characters.find((c) => c.name === name);
    assert(source, "Unknown legacy Character; original data retained: " + name);
    assert(object(raw) && object(raw.build), "Invalid legacy Character record.");
    const record = copy(raw), build = record.build;
    if (!legacy.characters.includes(name)) {
      assert(!next.characters[source.id]?.owned, "Removing owned membership requires a separate explicit action.");
      next.unownedDrafts[source.id] = { name, record };
      continue;
    }
    delete next.unownedDrafts[source.id];
    const old = next.characters[source.id]?.record?.build;
    if (build.weaponId) build.weaponInstanceId = physical("weapon", build.weaponId, { level: build.weaponLevel ?? null, refinement: build.weaponRefinement ?? null }, old?.weaponInstanceId);
    else build.weaponInstanceId = null;
    delete build.weaponId;
    delete build.weaponLevel;
    delete build.weaponRefinement;
    if (build.echoSets) for (const set of Object.values(build.echoSets.sets)) {
      set.slots = set.slots.map((card) => {
        if (card == null) return null;
        if (typeof card === "string") {
          const identity = catalog2.echoes.find((e) => e.id === card);
          assert(identity, "Unknown legacy Echo; original data retained.");
          return physical("echo", card, { rank: null, level: null, cost: identity.cost, selectedSonataSetId: null, mainStat: null, secondaryMainStat: null, substats: [] });
        }
        assert(object(card), "Invalid legacy Echo observation.");
        const { echoId, inventoryInstanceId, ...data } = card;
        return physical("echo", echoId, data, inventoryInstanceId);
      });
    }
    next.characters[source.id] = { id: source.id, name, owned: legacy.characters.includes(name), record };
  }
  return validateAccount(next, catalog2);
}

// src/inventoryAccountStore.mjs
async function openAccountStore({ catalog: catalog2, profile: profile2 = "default", indexedDB = globalThis.indexedDB, BroadcastChannel = globalThis.BroadcastChannel, initialStorage = () => ({}) } = {}) {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(profile2)) throw Error("Invalid local profile.");
  const db = await new Promise((resolve, reject) => {
    let blocked = false;
    const r = indexedDB.open("bellibing-owned-inventory", 3);
    r.onupgradeneeded = () => {
      for (const name of ["accounts", "outbox", "sync"]) if (!r.result.objectStoreNames.contains(name)) r.result.createObjectStore(name);
      if (!r.result.objectStoreNames.contains("recovery")) r.result.createObjectStore("recovery", { autoIncrement: true });
    };
    r.onsuccess = () => {
      if (blocked) {
        r.result.close();
        return;
      }
      resolve(r.result);
    };
    r.onerror = () => reject(r.error);
    r.onblocked = () => {
      blocked = true;
      reject(Error("Close other account tabs before upgrading."));
    };
  });
  db.onversionchange = () => {
    db.close();
  };
  const channel = typeof BroadcastChannel === "function" ? new BroadcastChannel("bellibing-owned-inventory") : null;
  const listeners = /* @__PURE__ */ new Set();
  let snapshot = null, readFailure = null, rawRecord = null;
  const notify = () => {
    for (const fn of listeners) {
      try {
        fn(api.snapshot());
      } catch {
        console.warn("Inventory view could not refresh; saved data is intact.");
      }
    }
  };
  const api = {
    profile: profile2,
    snapshot: () => structuredClone(snapshot),
    status: () => ({ writable: !readFailure, error: readFailure?.message ?? null }),
    rawRecovery: () => ({ format: "bellibing-raw-recovery", version: 1, profile: profile2, account: structuredClone(rawRecord) }),
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    async refresh() {
      const value = await new Promise((resolve, reject) => {
        const tx = db.transaction("accounts", "readonly"), r = tx.objectStore("accounts").get(profile2);
        r.onsuccess = () => {
          try {
            rawRecord = structuredClone(r.result ?? null);
            readFailure = null;
            resolve(r.result ? validateAccount(r.result, catalog2) : null);
          } catch (error2) {
            readFailure = error2;
            reject(error2);
          }
        };
        r.onerror = () => reject(r.error);
      });
      snapshot = value;
      return api.snapshot();
    },
    async commit(next, { expectedRevision: expectedRevision2 = snapshot?.revision ?? null, expectedAccountId = snapshot?.id ?? null, reason = "EXPLICIT_SAVE", cloud = null } = {}) {
      if (readFailure) throw readFailure;
      validateAccount(next, catalog2);
      const candidate = /ROLLBACK|RESTORE/.test(reason) ? structuredClone(next) : withUserData(next, { storage: initialStorage() });
      validateAccount(candidate, catalog2);
      await new Promise((resolve, reject) => {
        const tx = db.transaction(["accounts", "recovery", "outbox", "sync"], "readwrite"), accounts = tx.objectStore("accounts");
        let issue = null;
        if (cloud) {
          if (typeof cloud.uid !== "string" || !cloud.uid || !Number.isSafeInteger(cloud.remoteRevision) || cloud.remoteRevision < 1) {
            tx.abort();
            reject(Error("Invalid cloud account binding."));
            return;
          }
          const binding = tx.objectStore("sync").get(profile2), pending = tx.objectStore("outbox").get(profile2);
          binding.onsuccess = () => {
            const old = binding.result;
            if (old && old.uid !== cloud.uid || !cloud.approved && (!old || old.accountId !== candidate.id || cloud.remoteRevision <= old.remoteRevision)) {
              issue = Error("Cloud account identity changed.");
              tx.abort();
            }
          };
          pending.onsuccess = () => {
            if (pending.result && !cloud.approved) {
              issue = Error("Local changes must be resolved before downloading.");
              tx.abort();
            }
          };
        }
        const r = accounts.get(profile2);
        r.onsuccess = () => {
          try {
            const old = r.result ?? null;
            if ((old?.revision ?? null) !== expectedRevision2 || (old?.id ?? null) !== expectedAccountId) throw Error("Account changed in another tab. Reload and review again.");
            if (old && candidate.id !== old.id && !["EXPLICIT_JSON_RESTORE", "EXPLICIT_ROLLBACK", "EXPLICIT_CLOUD_RESTORE"].includes(reason)) throw Error("Account replacement requires explicit restore.");
            const previousBuilds = old ? legacyProjection(old).drafts : {}, nextBuilds = legacyProjection(candidate).drafts;
            for (const c of Object.values(candidate.characters)) {
              const previous = old?.characters[c.id];
              const unchanged = previous && previous.owned === c.owned && JSON.stringify(previousBuilds[c.name]?.build) === JSON.stringify(nextBuilds[c.name]?.build);
              c.revision = previous ? (previous.revision ?? 1) + (unchanged ? 0 : 1) : c.revision ?? 1;
            }
            candidate.revision = (old?.revision ?? 0) + 1;
            const protectedPoint = !!old && !old.userData || /MIGRAT|CONFLICT|ROLLBACK|RESTORE/.test(reason);
            tx.objectStore("recovery").add({ profile: profile2, reason, protected: protectedPoint, previous: old, nextRevision: candidate.revision, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
            const ordinary = [], cursor = tx.objectStore("recovery").openCursor();
            cursor.onsuccess = () => {
              const row = cursor.result;
              if (!row) {
                for (const key of ordinary.slice(0, -10)) tx.objectStore("recovery").delete(key);
                return;
              }
              if (row.value.profile === profile2 && !row.value.protected) ordinary.push(row.key);
              row.continue();
            };
            accounts.put(candidate, profile2);
            if (cloud) {
              tx.objectStore("outbox").delete(profile2);
              tx.objectStore("sync").put({ uid: cloud.uid, accountId: candidate.id, remoteRevision: cloud.remoteRevision }, profile2);
            } else tx.objectStore("outbox").put({ profile: profile2, accountId: candidate.id, revision: candidate.revision, operationId: crypto.randomUUID(), account: structuredClone(candidate) }, profile2);
          } catch (e) {
            issue = e;
            tx.abort();
          }
        };
        tx.oncomplete = resolve;
        tx.onabort = () => reject(issue ?? tx.error ?? Error("Save aborted; account unchanged."));
        tx.onerror = () => {
        };
      });
      snapshot = candidate;
      rawRecord = structuredClone(candidate);
      channel?.postMessage({ profile: profile2, revision: candidate.revision });
      notify();
      return api.snapshot();
    },
    async recovery() {
      return new Promise((resolve, reject) => {
        const tx = db.transaction("recovery", "readonly"), rows = tx.objectStore("recovery").getAll(), keys = tx.objectStore("recovery").getAllKeys();
        tx.oncomplete = () => resolve(rows.result.map((x, i) => ({ ...x, key: keys.result[i] })).filter((x) => x.profile === profile2));
        const r = rows;
        r.onerror = () => reject(r.error);
      });
    },
    async rollback(entry, { expectedRevision: expectedRevision2 = snapshot?.revision ?? null, expectedAccountId = snapshot?.id ?? null } = {}) {
      if (entry.profile !== profile2) throw Error("Wrong recovery profile.");
      const saved = (await api.recovery()).find((x) => x.key === entry.key);
      if (!saved) throw Error("Recovery point no longer exists.");
      entry = saved;
      if (entry.previous) return api.commit(entry.previous, { expectedRevision: expectedRevision2, expectedAccountId, reason: "EXPLICIT_ROLLBACK" });
      await new Promise((resolve, reject) => {
        const tx = db.transaction(["accounts", "recovery", "outbox"], "readwrite"), accounts = tx.objectStore("accounts");
        let issue = null;
        const r = accounts.get(profile2);
        r.onsuccess = () => {
          if ((r.result?.revision ?? null) !== expectedRevision2 || (r.result?.id ?? null) !== expectedAccountId) {
            issue = Error("Account changed; review recovery again.");
            tx.abort();
            return;
          }
          tx.objectStore("recovery").add({ profile: profile2, reason: "EXPLICIT_RETURN_TO_LEGACY_OR_EMPTY", protected: true, previous: r.result ?? null, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
          accounts.delete(profile2);
          tx.objectStore("outbox").delete(profile2);
        };
        tx.oncomplete = resolve;
        tx.onabort = () => reject(issue ?? tx.error ?? Error("Recovery aborted."));
        tx.onerror = () => {
        };
      });
      snapshot = null;
      rawRecord = null;
      channel?.postMessage({ profile: profile2, revision: null });
      notify();
      return null;
    },
    async pendingSync() {
      return new Promise((resolve, reject) => {
        const tx = db.transaction("outbox", "readonly"), r = tx.objectStore("outbox").get(profile2);
        tx.oncomplete = () => resolve(r.result ?? null);
        tx.onabort = () => reject(tx.error);
      });
    },
    async syncBinding() {
      return new Promise((resolve, reject) => {
        const tx = db.transaction("sync", "readonly"), r = tx.objectStore("sync").get(profile2);
        tx.oncomplete = () => resolve(r.result ?? null);
        tx.onabort = () => reject(tx.error);
      });
    },
    async applyCloud({ uid, account, remoteRevision, approved = false, expectedRevision: expectedRevision2 = snapshot?.revision ?? null, expectedAccountId = snapshot?.id ?? null }) {
      return api.commit(account, { expectedRevision: expectedRevision2, expectedAccountId, reason: approved ? "EXPLICIT_CLOUD_RESTORE" : "REMOTE_SYNC_APPLY", cloud: { uid, remoteRevision, approved } });
    },
    async bindSync(uid, { approved = false } = {}) {
      if (readFailure) throw readFailure;
      if (!approved || typeof uid !== "string" || !uid || uid.length > 128 || !snapshot) throw Error("Explicit account linking required.");
      await new Promise((resolve, reject) => {
        const tx = db.transaction(["accounts", "sync", "outbox"], "readwrite"), r = tx.objectStore("sync").get(profile2), account = tx.objectStore("accounts").get(profile2);
        let issue;
        tx.oncomplete = resolve;
        tx.onabort = () => reject(issue ?? tx.error);
        account.onsuccess = () => {
          if (account.result?.id !== snapshot.id || account.result?.revision !== snapshot.revision) {
            issue = Error("Account changed; review linking again.");
            tx.abort();
          }
        };
        r.onsuccess = () => {
          if (r.result && r.result.uid !== uid) {
            issue = Error("This local profile belongs to another Google account.");
            tx.abort();
            return;
          }
          if (!r.result) {
            tx.objectStore("sync").put({ uid, accountId: snapshot.id, remoteRevision: 0 }, profile2);
            tx.objectStore("outbox").put({ profile: profile2, accountId: snapshot.id, revision: snapshot.revision, operationId: crypto.randomUUID(), account: structuredClone(snapshot) }, profile2);
          }
        };
      });
      return api.syncBinding();
    },
    async acknowledgeSync({ uid, accountId, operationId, remoteRevision }) {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(["sync", "outbox"], "readwrite"), binding = tx.objectStore("sync").get(profile2), pending = tx.objectStore("outbox").get(profile2);
        let issue;
        tx.oncomplete = resolve;
        tx.onabort = () => reject(issue ?? tx.error);
        binding.onsuccess = () => {
          const old = binding.result;
          if (!old || old.uid !== uid || old.accountId !== accountId || !Number.isSafeInteger(remoteRevision) || remoteRevision < old.remoteRevision) {
            issue = Error("Stale sync identity.");
            tx.abort();
            return;
          }
          tx.objectStore("sync").put({ ...old, remoteRevision }, profile2);
        };
        pending.onsuccess = () => {
          if (pending.result?.operationId === operationId) tx.objectStore("outbox").delete(profile2);
        };
      });
    },
    async saveUserData(key, value, { initialStorage: initialStorage2 = {} } = {}) {
      if (!snapshot) throw Error("Save the reviewed account before editing account settings.");
      if (!ACCOUNT_DATA_KEYS.includes(key)) throw Error("Unsupported account setting.");
      const next = withUserData(snapshot, { storage: initialStorage2 });
      if (value === null) delete next.userData.storage[key];
      else next.userData.storage[key] = value;
      return api.commit(next, { reason: "EXPLICIT_ACCOUNT_SETTINGS_SAVE" });
    },
    async saveWorkspaceSettings(characterId, value) {
      if (!snapshot?.characters[characterId]?.owned) throw Error("Save the owned Character before its settings.");
      const next = withUserData(snapshot, { storage: initialStorage() });
      next.userData.workspaceSettings ??= {};
      next.userData.workspaceSettings[characterId] = structuredClone(value);
      return api.commit(next, { reason: "EXPLICIT_WORKSPACE_SETTINGS_SAVE" });
    },
    async saveObservations(characterId, value) {
      if (!snapshot?.characters[characterId]?.owned) throw Error("Owned Character required for observed rolls.");
      if (value?.characterId !== characterId || value?.kind !== "OBSERVED_IMPROVE_CHECKPOINT" || value.version !== 1) throw Error("Invalid observed session.");
      const next = withUserData(snapshot, { storage: initialStorage() });
      next.userData.observations[characterId] = structuredClone(value);
      return api.commit(next, { reason: "EXPLICIT_OBSERVATION_SAVE" });
    },
    storage(legacyStorage) {
      return { getItem(key) {
        if (readFailure) throw readFailure;
        if (key === LEGACY_BUILD_KEY && snapshot) return JSON.stringify(legacyProjection(snapshot));
        if (snapshot?.userData && ACCOUNT_DATA_KEYS.includes(key)) return snapshot.userData.storage[key] ?? null;
        return legacyStorage.getItem(key);
      } };
    },
    close() {
      channel?.close();
      db.close();
    }
  };
  if (channel) channel.onmessage = async (e) => {
    if (e.data?.profile === profile2) {
      try {
        await api.refresh();
        notify();
      } catch {
        notify();
      }
    }
  };
  try {
    await api.refresh();
    return api;
  } catch (error2) {
    if (readFailure) return api;
    channel?.close();
    db.close();
    throw error2;
  }
}

// docs/ui-lab/inventory/account-session.js
async function accountSession() {
  if (globalThis.bellibingAccountSessionPromise) return globalThis.bellibingAccountSessionPromise;
  globalThis.bellibingAccountSessionPromise = (async () => {
    const profile2 = new URL(location.href).searchParams.get("profile") ?? "default";
    const catalogUrl = import.meta.url.includes("/docs/ui-lab/inventory/") ? new URL("../../../dist/inventory/catalog.json", import.meta.url) : new URL("../inventory/catalog.json", location.href);
    const catalog2 = await fetch(catalogUrl).then((r) => {
      if (!r.ok) throw Error("Canonical catalog unavailable; run npm run build first.");
      return r.json();
    });
    const originalStorage = globalThis.localStorage;
    const legacyBytes = () => profile2 === "default" ? originalStorage.getItem(LEGACY_BUILD_KEY) : null;
    const recovery = () => Object.fromEntries(RECOVERY_KEYS.flatMap((k) => {
      const text = profile2 === "default" ? originalStorage.getItem(k) : null;
      return text === null ? [] : [[k, text]];
    }));
    const store2 = await openAccountStore({ catalog: catalog2, profile: profile2, initialStorage: () => Object.fromEntries(Object.entries(recovery()).filter(([key]) => key !== LEGACY_BUILD_KEY)) });
    let staged = null, stagedBytes = null;
    const stage = () => {
      if (!store2.status().writable) throw Error(store2.status().error);
      const current = store2.snapshot();
      if (current) return withUserData(current, { storage: Object.fromEntries(Object.entries(recovery()).filter(([key]) => key !== LEGACY_BUILD_KEY)) });
      const text = legacyBytes();
      if (!staged || text !== stagedBytes) {
        staged = text ? accountFromLegacy(JSON.parse(text), catalog2, { recovery: recovery() }) : emptyAccount();
        stagedBytes = text;
      }
      return structuredClone(staged);
    };
    const storage = store2.storage({ getItem: (key) => profile2 === "default" ? originalStorage.getItem(key) : key === LEGACY_BUILD_KEY ? JSON.stringify({ characters: [], drafts: {} }) : null });
    const session2 = { catalog: catalog2, store: store2, storage, profile: profile2, stage, legacyBytes, recovery };
    globalThis.bellibingAccountSession = session2;
    store2.subscribe(() => {
      dispatchEvent(new Event("bellibing-build-state-changed"));
      dispatchEvent(new Event("bellibing-inventory-changed"));
    });
    return session2;
  })();
  return globalThis.bellibingAccountSessionPromise;
}

// docs/ui-lab/v1.1/modules/util.js
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function assetURL(path) {
  return globalThis.BELLIBING_LAB_ASSETS?.[path] ?? path;
}

// docs/ui-lab/v1.1/modules/selection-dialog.js
function openSelectionDialog({ title, choices, selectedId: selectedId2, onChoose, trigger, details = [] }) {
  const dialog = document.createElement("dialog");
  dialog.className = "item-selector";
  dialog.setAttribute("aria-label", title);
  dialog.innerHTML = `<header><h2>${escapeHtml(title)}</h2><button type="button" data-close aria-label="Close ${escapeHtml(title)}">\u2715</button></header><div class="item-selector-grid">${choices.map((c) => `<button type="button" class="item-choice${c.id === selectedId2 ? " selected" : ""}" data-choice="${escapeHtml(c.id)}" aria-pressed="${c.id === selectedId2}">${c.art ? `<img src="${escapeHtml(assetURL(c.art))}" alt="">` : ""}<strong>${escapeHtml(c.name)}</strong>${c.note ? `<small>${escapeHtml(c.note)}</small>` : ""}</button>`).join("")}</div>${details.length ? `<details class="selector-help"><summary>Details</summary>${details.map((d) => `<p><strong>${escapeHtml(d.name)}</strong></p><ul>${d.lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`).join("")}</details>` : ""}`;
  const close = () => dialog.close();
  dialog.querySelector("[data-close]").onclick = close;
  dialog.onclick = (e) => {
    if (e.target === dialog) close();
    const button = e.target.closest("[data-choice]");
    if (button) {
      onChoose(button.dataset.choice);
      close();
    }
  };
  dialog.addEventListener("close", () => {
    dialog.remove();
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  }, { once: true });
  document.body.append(dialog);
  dialog.showModal();
  (dialog.querySelector(".selected") ?? dialog.querySelector("[data-close]")).focus();
  return dialog;
}

// docs/ui-lab/inventory/teams.js
var esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var session = await accountSession();
var { store, catalog, profile } = session;
var host = document.querySelector("[data-owned-teams]");
var link = (id2) => {
  const u = new URL("../build/index.html", location.href);
  u.searchParams.set("character", id2);
  if (profile !== "default") u.searchParams.set("profile", profile);
  return u.href;
};
var portrait = (id2) => "../ui-preview/assets/characters/portraits/" + encodeURIComponent(id2) + ".png";
var selectedId = null;
var draft = null;
var expectedRevision = null;
var error = "";
var face = (id2) => `<img class="team-face small" src="${portrait(id2)}" alt="">`;
function edit(team = null) {
  const account = store.snapshot();
  expectedRevision = account?.revision ?? null;
  draft = team ? structuredClone(team) : { id: null, name: "New team", characterIds: [null, null, null] };
  error = "";
  render();
}
function render() {
  const account = store.snapshot(), teams = account?.userData?.teams ?? [], owned = Object.values(account?.characters ?? {}).filter((c) => c.owned);
  const team = draft ?? teams.find((t) => t.id === selectedId) ?? teams[0];
  if (team && !draft) selectedId = team.id;
  const names = (id2) => account?.characters[id2]?.name ?? "Choose Character";
  host.innerHTML = `<div class="team-page-heading"><div><span class="eyebrow">YOUR ROSTER, TOGETHER</span><h1>Build a Team</h1></div><button type="button" data-new-team ${owned.length < 3 || !store.status().writable ? "disabled" : ""}>New team +</button></div>
 <div class="team-layout"><aside class="saved-teams"><div class="saved-heading"><h3>My Teams</h3></div>${teams.map((t) => `<button type="button" class="saved-team ${selectedId === t.id && !draft ? "selected" : ""}" data-team="${esc(t.id)}"><span class="saved-team-top"><strong>${esc(t.name)}</strong><span>Pending</span></span><span class="saved-portraits">${t.characterIds.map(face).join("")}</span></button>`).join("")}${!teams.length ? "<p>No saved teams.</p>" : ""}</aside>
 <section class="team-workspace"><div class="team-workspace-heading"><div><span class="eyebrow">${draft ? "EDIT TEAM" : "SAVED TEAM"}</span>${draft ? `<label>Team name<input data-team-name maxlength="80" value="${esc(draft.name)}"></label>` : `<h2>${esc(team?.name ?? "My Teams")}</h2>`}</div><div class="team-dps"><span>Team DPS</span><strong>Pending</strong></div></div>
 ${team ? `<div class="team-members">${team.characterIds.map((id2, index) => {
    const c = account.characters[id2], b = c?.record.build, weapon = account.items[b?.weaponInstanceId], slots = b?.echoSets?.sets?.[b.echoSets.activeSetId]?.slots ?? [];
    return `<article class="team-member"><div class="member-art">${id2 ? `<img class="team-face" src="${portrait(id2)}" alt="${esc(names(id2))}">` : ""}<span class="member-number">0${index + 1}</span></div><h3>${esc(names(id2))}</h3><div class="member-damage"><strong>Pending</strong><span>Character DPS</span></div><div class="member-equipment"><strong>${esc(catalog.weapons.find((w) => w.id === weapon?.catalogId)?.name ?? "Weapon not entered")}</strong><span>${slots.filter(Boolean).length} / 5 Echoes</span><details><summary>Owned equipment</summary>${slots.map((itemId, i) => `<p>${i + 1} \xB7 ${esc(catalog.echoes.find((e) => e.id === account.items[itemId]?.catalogId)?.name ?? "Empty")}</p>`).join("")}</details></div>${draft ? `<button type="button" data-choose-member="${index}">Choose Character</button>` : `<a class="owned-button" href="${link(id2)}">Open Build \u2192</a>`}</article>`;
  }).join("")}</div><div class="team-bottom">${draft ? '<button type="button" data-save-team>Save team</button><button type="button" data-cancel-team>Cancel</button>' : '<button type="button" data-edit-team>Edit team</button>'}</div>` : `<p>${owned.length < 3 ? "Save three Characters in Build to create a team." : "Choose New team to use your saved Characters."}</p>`}
 <p role="status" data-team-status>${esc(error)}</p></section></div>`;
  host.querySelector("[data-new-team]").onclick = () => edit();
  host.querySelectorAll("[data-team]").forEach((button) => button.onclick = () => {
    selectedId = button.dataset.team;
    draft = null;
    error = "";
    render();
  });
  host.querySelector("[data-edit-team]")?.addEventListener("click", () => edit(team));
  host.querySelector("[data-cancel-team]")?.addEventListener("click", () => {
    draft = null;
    error = "";
    render();
  });
  host.querySelector("[data-team-name]")?.addEventListener("input", (e) => {
    draft.name = e.target.value;
  });
  host.querySelectorAll("[data-choose-member]").forEach((button) => button.onclick = () => {
    const index = Number(button.dataset.chooseMember);
    openSelectionDialog({ title: "Choose saved Character", trigger: button, selectedId: draft.characterIds[index], choices: owned.filter((c) => !draft.characterIds.includes(c.id) || draft.characterIds[index] === c.id).map((c) => ({ id: c.id, name: c.name, art: portrait(c.id) })), onChoose: (id2) => {
      draft.characterIds[index] = id2;
      render();
    } });
  });
  host.querySelector("[data-save-team]")?.addEventListener("click", async () => {
    try {
      const before = store.snapshot();
      if (before?.revision !== expectedRevision) throw Error("Inventory changed. Reopen the team before saving.");
      const next = saveOwnedTeam(before, draft, catalog), savedId = next.userData.teams.find((t) => t.id === draft.id)?.id ?? next.userData.teams.at(-1).id;
      await store.commit(next, { expectedRevision, expectedAccountId: before.id, reason: "EXPLICIT_TEAM_SAVE" });
      selectedId = savedId;
      draft = null;
      error = "";
      render();
    } catch (e) {
      error = e.message;
      render();
    }
  });
}
store.subscribe(() => {
  if (draft) {
    error = "Inventory changed. Reopen the team before saving.";
  }
  render();
});
render();
