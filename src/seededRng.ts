import type { RandomSource } from './echoCoreDomain.ts';

/** Stable 32-bit FNV-1a hash so human-readable simulation seeds are reproducible. */
export function seedFromString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function normalizeSeed(seed: number | string): number {
  if (typeof seed === 'string') return seedFromString(seed);
  if (!Number.isFinite(seed)) throw new RangeError(`Seed must be finite, got ${seed}.`);
  return Math.trunc(seed) >>> 0;
}

/**
 * Tiny deterministic PRNG for simulations/tests.
 *
 * This is not a cryptographic RNG and is not intended to predict game RNG.
 * Its only job is making Bellibing simulations exactly reproducible from a seed.
 */
export class SeededRng implements RandomSource {
  private state: number;

  constructor(seed: number | string) {
    this.state = normalizeSeed(seed);
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    this.state >>>= 0;
    return result;
  }
}

export function createSeededRng(seed: number | string): RandomSource {
  return new SeededRng(seed);
}
