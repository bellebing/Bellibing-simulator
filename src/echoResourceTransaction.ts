import { CHECKPOINT_CUMULATIVE_COST } from './echoCoreRules.ts';
import { spendExactTubes, tuneEligibleCheckpoint } from './echoExactTubeSpending.ts';
import type { ExactEchoProgress, TubeCounts, TubeLedger } from './echoExactTubeSpending.ts';
import { emptyResourceInventory, readResourceInventory } from './resourceInventory.ts';
import type { InventoryQuantity, ResourceInventory } from './resourceInventory.ts';
import { selectExactOneCheckpointTubes } from './echoCheckpointTubeSelection.ts';
import {
  IMPROVE_POLICY_STORAGE_KEY, IMPROVE_POLICY_V2_KEY, loadImprovePolicyStorage,
} from './improvePolicyState.ts';
import type { ImprovePolicyStorage, ImprovePolicyStorageAccess } from './improvePolicyState.ts';

export interface Rank5Plus5Snapshot {
  readonly storageBytes: string | null;
  readonly legacyBytes: string | null;
  readonly revision: number;
  readonly inventory: ResourceInventory;
}
export interface Rank5Plus5Receipt {
  readonly transactionId: string;
  readonly checkpoint: 5;
  readonly before: ResourceInventory;
  readonly after: ResourceInventory;
  readonly consumed: {
    readonly echoes: number;
    readonly tuners: number;
    readonly shellCredits: number;
    readonly tubes: TubeCounts;
  };
  readonly tubeLedger: TubeLedger;
  readonly progress: ExactEchoProgress;
}
export interface CommittedRank5Plus5 {
  readonly store: ImprovePolicyStorage;
  readonly receipt: Rank5Plus5Receipt;
}
/** Read both current and legacy storage once; do not rewrite recovery bytes on snapshot. */
function readSnapshotStorage(storage: ImprovePolicyStorageAccess) {
  const storageBytes = storage.getItem(IMPROVE_POLICY_STORAGE_KEY);
  const legacyBytes = storageBytes === null ? storage.getItem(IMPROVE_POLICY_V2_KEY) : null;
  const store = loadImprovePolicyStorage({
    getItem(key) {
      if (key === IMPROVE_POLICY_STORAGE_KEY) return storageBytes;
      if (key === IMPROVE_POLICY_V2_KEY) return legacyBytes;
      return storage.getItem(key);
    },
    setItem() { throw new Error('Read-only snapshot'); },
  });
  const revision = store.resourceTransactions?.revision ?? 0;
  return { storageBytes, legacyBytes, store, revision };
}
/** The snapshot's exact bytes are an optimistic freshness token, not a resource owner. */
export function readRank5Plus5Snapshot(storage: ImprovePolicyStorageAccess): Rank5Plus5Snapshot {
  const current = readSnapshotStorage(storage);
  return { storageBytes: current.storageBytes, legacyBytes: current.legacyBytes,
    revision: current.revision,
    inventory: readResourceInventory(current.store.resourceInventory ?? emptyResourceInventory()) };
}
function requireFunds(quantity: InventoryQuantity, amount: number, name: string): void {
  if (quantity.kind === 'FINITE' && quantity.count < amount) throw new RangeError('Insufficient ' + name);
}
function debit(quantity: InventoryQuantity, amount: number): InventoryQuantity {
  return quantity.kind === 'UNLIMITED' ? { kind: 'UNLIMITED' } : { kind: 'FINITE', count: quantity.count - amount };
}
function nextRevision(value: number): number {
  if (!Number.isSafeInteger(value) || value >= Number.MAX_SAFE_INTEGER) throw new RangeError('Resource revision exhausted');
  return value + 1;
}
function prepareRank5Plus5(inventoryInput: ResourceInventory, revision: number, transactionId: string): Rank5Plus5Receipt {
  const inventory = readResourceInventory(inventoryInput);
  const cost = CHECKPOINT_CUMULATIVE_COST[5];
  if (cost.shellCredits === undefined) throw new Error('Verified +5 Shell Credit cost unavailable');
  // Check ALL budgets before computing any Tube or Tuner state transition.
  requireFunds(inventory.echoes, 1, 'Echoes');
  requireFunds(inventory.tuners, cost.tuners, 'Tuners');
  requireFunds(inventory.shellCredits, cost.shellCredits, 'Shell Credits');
  const selected = selectExactOneCheckpointTubes(inventory);
  if (selected === null) throw new RangeError('Insufficient whole Tubes');
  const initial = { revision, progress: { cumulativeEchoEXP: 0, tunedThrough: 0 as const }, inventory };
  const spent = spendExactTubes(initial, selected, revision);
  const tuned = tuneEligibleCheckpoint(spent.state, spent.state.revision);
  if (tuned.progress.tunedThrough !== 5) throw new Error('Verified +5 tuning did not complete');
  const after = readResourceInventory({ ...tuned.inventory,
    echoes: debit(inventory.echoes, 1),
    shellCredits: debit(inventory.shellCredits, cost.shellCredits) });
  return { transactionId, checkpoint: 5, before: inventory, after,
    consumed: { echoes: 1, tuners: cost.tuners, shellCredits: cost.shellCredits,
      tubes: { ...spent.ledger.spent } },
    tubeLedger: spent.ledger, progress: tuned.progress };
}
/**
 * One storage-envelope write: Echo, Tuners, actual whole Tubes, Shell Credits
 * and the replay guard commit together. No RNG, Echo card or Character mutation.
 *
 * Caller must provide a fresh snapshot and unique attempt ID. A stale/replayed
 * attempt and any quota/serialization error leave the existing bytes untouched.
 * A single synchronous storage owner serializes this check/write; an eventual
 * multi-tab caller must arrange exclusive locking across ALL envelope writers.
 */
export function commitRank5Plus5Resources(
  storage: ImprovePolicyStorageAccess, snapshot: Rank5Plus5Snapshot, transactionId: string,
): CommittedRank5Plus5 {
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(transactionId)) throw new RangeError('Invalid resource transaction ID');
  const live = readSnapshotStorage(storage);
  if (snapshot.storageBytes !== live.storageBytes || snapshot.legacyBytes !== live.legacyBytes
    || snapshot.revision !== live.revision) throw new Error('Stale resource transaction snapshot');
  const prior = live.store.resourceTransactions?.consumedIds ?? [];
  if (prior.includes(transactionId)) throw new Error('Repeated resource transaction ID');
  const receipt = prepareRank5Plus5(live.store.resourceInventory ?? emptyResourceInventory(), live.revision, transactionId);
  const next: ImprovePolicyStorage = { ...live.store, resourceInventory: receipt.after,
    resourceTransactions: { revision: nextRevision(live.revision), consumedIds: [...prior, transactionId] } };
  // Web Storage setItem is one atomic key replacement. No partial resource saves.
  storage.setItem(IMPROVE_POLICY_STORAGE_KEY, JSON.stringify(next));
  return { store: next, receipt };
}
