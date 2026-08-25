import type { WeaponGameData } from '../gameDataDomain.ts';
import { WEAPON_CATALOG } from './weapons.ts';

/**
 * Frozen current-patch contract for the weapon core catalog.
 *
 * This is deliberately separate from weapon effects and recommendations. A
 * weapon can be source-verified core data without its passive being modeled,
 * and an announced phase-2 weapon can exist without being counted as RELEASED.
 *
 * The 120 pre-3.6 records inherit the dedicated V9.15 core-stat audit. Version
 * 3.6 adds one live phase-1 weapon (Glint of Clouds) and one confirmed phase-2
 * weapon (Thousandfold Deliverance). Updating this snapshot is an explicit
 * patch-integration action, so adding a row cannot silently make the current
 * roster gate greener by relying on helper defaults alone.
 */
export const WEAPON_CORE_ROSTER_AUDIT_V36 = {
  patch: '3.6',
  checkedAt: '2026-08-25',
  expectedCatalogCount: 122,
  expectedReleasedCount: 121,
  expectedUpcomingIds: ['thousandfold-deliverance'],
  expectedWipIds: [],
  currentPatchReleasedIds: ['glint-of-clouds'],
  sourceLabels: [
    'V9.15 dedicated Weapon core-stat audit (120-record baseline)',
    'Kuro Games Version 3.6 release/Convene announcements',
    'Prydwen current weapon roster',
    'Wuwa Wiki / current weapon databases for 3.6 cross-checks',
  ],
  notes: [
    'Prydwen current roster shows 121 available weapons on 2026-08-25.',
    'Glint of Clouds is live in Version 3.6 phase 1; Thousandfold Deliverance is announced for phase 2 and must not count as RELEASED before its banner goes live.',
    'Weapon passive/effect completeness is a separate layer and is not implied by this core-stat gate.',
  ],
} as const;

export type WeaponCoreAuditIssueCode =
  | 'CATALOG_COUNT_MISMATCH'
  | 'RELEASED_COUNT_MISMATCH'
  | 'UPCOMING_SET_MISMATCH'
  | 'WIP_SET_MISMATCH'
  | 'RELEASED_NOT_VERIFIED'
  | 'RELEASED_BASE_ATK_MISSING'
  | 'RELEASED_SECONDARY_MISSING'
  | 'RELEASED_SECONDARY_INVALID'
  | 'RELEASED_PROVENANCE_MISSING';

export interface WeaponCoreAuditIssue {
  code: WeaponCoreAuditIssueCode;
  weaponId?: string;
  detail: string;
}

export interface WeaponCoreRosterAudit {
  catalogCount: number;
  releasedCount: number;
  upcomingIds: readonly string[];
  wipIds: readonly string[];
  issues: readonly WeaponCoreAuditIssue[];
}

function sortedIds(items: readonly WeaponGameData[]): string[] {
  return items.map((weapon) => weapon.id).sort();
}

function sameIds(actual: readonly string[], expected: readonly string[]): boolean {
  return actual.length === expected.length
    && actual.every((value, index) => value === expected[index]);
}

export function auditWeaponCoreRoster(
  catalog: readonly WeaponGameData[] = WEAPON_CATALOG,
): WeaponCoreRosterAudit {
  const released = catalog.filter((weapon) => weapon.releaseStatus === 'RELEASED');
  const upcoming = catalog.filter((weapon) => weapon.releaseStatus === 'CONFIRMED_UPCOMING');
  const wip = catalog.filter((weapon) => weapon.releaseStatus === 'UNRELEASED_WIP');
  const upcomingIds = sortedIds(upcoming);
  const wipIds = sortedIds(wip);
  const expectedUpcomingIds = [...WEAPON_CORE_ROSTER_AUDIT_V36.expectedUpcomingIds].sort();
  const expectedWipIds = [...WEAPON_CORE_ROSTER_AUDIT_V36.expectedWipIds].sort();
  const issues: WeaponCoreAuditIssue[] = [];

  if (catalog.length !== WEAPON_CORE_ROSTER_AUDIT_V36.expectedCatalogCount) {
    issues.push({
      code: 'CATALOG_COUNT_MISMATCH',
      detail: `Expected ${WEAPON_CORE_ROSTER_AUDIT_V36.expectedCatalogCount} catalog records for patch ${WEAPON_CORE_ROSTER_AUDIT_V36.patch}, found ${catalog.length}.`,
    });
  }

  if (released.length !== WEAPON_CORE_ROSTER_AUDIT_V36.expectedReleasedCount) {
    issues.push({
      code: 'RELEASED_COUNT_MISMATCH',
      detail: `Expected ${WEAPON_CORE_ROSTER_AUDIT_V36.expectedReleasedCount} released weapons, found ${released.length}.`,
    });
  }

  if (!sameIds(upcomingIds, expectedUpcomingIds)) {
    issues.push({
      code: 'UPCOMING_SET_MISMATCH',
      detail: `Expected upcoming IDs ${expectedUpcomingIds.join(', ') || '(none)'}, found ${upcomingIds.join(', ') || '(none)'}.`,
    });
  }

  if (!sameIds(wipIds, expectedWipIds)) {
    issues.push({
      code: 'WIP_SET_MISMATCH',
      detail: `Expected WIP IDs ${expectedWipIds.join(', ') || '(none)'}, found ${wipIds.join(', ') || '(none)'}.`,
    });
  }

  for (const weapon of released) {
    if (weapon.verificationStatus !== 'VERIFIED') {
      issues.push({
        code: 'RELEASED_NOT_VERIFIED',
        weaponId: weapon.id,
        detail: `Released weapon ${weapon.id} has verification status ${weapon.verificationStatus}.`,
      });
    }

    if (weapon.level90BaseAtk === null || weapon.level90BaseAtk <= 0) {
      issues.push({
        code: 'RELEASED_BASE_ATK_MISSING',
        weaponId: weapon.id,
        detail: `Released weapon ${weapon.id} is missing a positive Level-90 Base ATK.`,
      });
    }

    if (weapon.secondary === null) {
      issues.push({
        code: 'RELEASED_SECONDARY_MISSING',
        weaponId: weapon.id,
        detail: `Released weapon ${weapon.id} is missing its Level-90 secondary stat.`,
      });
    } else if (!Number.isFinite(weapon.secondary.value) || weapon.secondary.value <= 0) {
      issues.push({
        code: 'RELEASED_SECONDARY_INVALID',
        weaponId: weapon.id,
        detail: `Released weapon ${weapon.id} has an invalid secondary-stat value.`,
      });
    }

    if (
      weapon.provenance.sourceLabels.length < 2
      || weapon.provenance.checkedAt.trim().length === 0
    ) {
      issues.push({
        code: 'RELEASED_PROVENANCE_MISSING',
        weaponId: weapon.id,
        detail: `Released weapon ${weapon.id} lacks cross-check provenance.`,
      });
    }
  }

  return {
    catalogCount: catalog.length,
    releasedCount: released.length,
    upcomingIds,
    wipIds,
    issues,
  };
}
