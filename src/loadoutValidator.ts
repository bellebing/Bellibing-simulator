import type { Echo } from './echoCoreDomain.ts';
import type { Provenance } from './provenance.ts';

export type LoadoutValidationCode =
  | 'VALID_LOADOUT'
  | 'TOO_HIGH_COST'
  | 'TOO_MANY_ECHOES'
  | 'INCOMPLETE_LOADOUT';

export interface LoadoutRules {
  maxEchoes: number;
  maxCost: number;
  /** Build-oriented callers may require all five slots; raw equip legality does not. */
  requireFullLoadout?: boolean;
}

export interface LoadoutValidationResult {
  valid: boolean;
  status: LoadoutValidationCode;
  violations: Exclude<LoadoutValidationCode, 'VALID_LOADOUT'>[];
  echoCount: number;
  totalCost: number;
  rules: LoadoutRules;
}

export const DEFAULT_ENDGAME_LOADOUT_RULES: Readonly<LoadoutRules> = {
  maxEchoes: 5,
  maxCost: 12,
  requireFullLoadout: false,
};

export const LOADOUT_RULES_PROVENANCE: Provenance<string> = {
  value: 'Resonators can equip up to five Echoes and can upgrade the shared COST limit to 12.',
  status: 'VERIFIED_EXTERNAL',
  sources: [
    {
      kind: 'GUIDE',
      label: 'Prydwen — Echoes Explained',
      locator: 'https://www.prydwen.gg/wuthering-waves/guides/echoes-explained',
      checkedAt: '2026-08-21',
    },
    {
      kind: 'OTHER',
      label: 'WutheringWaves.gg — Echo System Guide',
      locator: 'https://wutheringwaves.gg/echo-system-guide/',
      checkedAt: '2026-08-21',
    },
  ],
  notes: [
    'Prydwen states five total Echo slots and a COST limit that upgrades from 10 to 12 through Data Dock progression.',
    'Bellibing uses 12 as the default endgame validator cap; callers can provide another verified cap for progression-mode tooling later.',
    'No Sonata, species-duplication or other equip restriction is enforced here until separately verified and modeled.',
  ],
};

export function validateEchoLoadout(
  echoes: readonly Echo[],
  rules: LoadoutRules = DEFAULT_ENDGAME_LOADOUT_RULES,
): LoadoutValidationResult {
  if (!Number.isInteger(rules.maxEchoes) || rules.maxEchoes <= 0) {
    throw new RangeError(`maxEchoes must be a positive integer, got ${rules.maxEchoes}.`);
  }
  if (!Number.isFinite(rules.maxCost) || rules.maxCost <= 0) {
    throw new RangeError(`maxCost must be positive, got ${rules.maxCost}.`);
  }

  const echoCount = echoes.length;
  const totalCost = echoes.reduce((sum, echo) => sum + echo.cost, 0);
  const violations: Exclude<LoadoutValidationCode, 'VALID_LOADOUT'>[] = [];

  if (echoCount > rules.maxEchoes) violations.push('TOO_MANY_ECHOES');
  if (totalCost > rules.maxCost) violations.push('TOO_HIGH_COST');
  if (rules.requireFullLoadout && echoCount < rules.maxEchoes) violations.push('INCOMPLETE_LOADOUT');

  return {
    valid: violations.length === 0,
    status: violations[0] ?? 'VALID_LOADOUT',
    violations,
    echoCount,
    totalCost,
    rules: { ...rules },
  };
}
