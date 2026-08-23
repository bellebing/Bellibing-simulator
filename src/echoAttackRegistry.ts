import { ECHO_CATALOG } from './data/echoes.ts';
import type { EchoAttackProfile } from './echoAttackDomain.ts';
import type { EchoGameData } from './gameDataDomain.ts';

export interface EchoAttackRegistry {
  byEchoId: ReadonlyMap<string, EchoAttackProfile>;
  attackIds: ReadonlySet<string>;
}

export function createEchoAttackRegistry(
  profiles: readonly EchoAttackProfile[],
): EchoAttackRegistry {
  const echoById: ReadonlyMap<string, EchoGameData> = new Map<string, EchoGameData>(
    ECHO_CATALOG.map((row) => [row.id, row] as [string, EchoGameData]),
  );
  const byEchoId = new Map<string, EchoAttackProfile>();
  const attackIds = new Set<string>();

  for (const profile of profiles) {
    if (!echoById.has(profile.echoId)) throw new Error(`Unknown Echo attack profile id: ${profile.echoId}`);
    if (byEchoId.has(profile.echoId)) throw new Error(`Duplicate Echo attack profile: ${profile.echoId}`);
    if (profile.cooldownSeconds <= 0) throw new Error(`${profile.echoId} has invalid cooldown`);

    if (profile.startingCharges !== undefined || profile.maxCharges !== undefined || profile.rechargeSeconds !== undefined) {
      if (!profile.startingCharges || !profile.maxCharges || !profile.rechargeSeconds) {
        throw new Error(`${profile.echoId} charge mechanics must be complete`);
      }
      if (profile.startingCharges > profile.maxCharges || profile.rechargeSeconds <= 0) {
        throw new Error(`${profile.echoId} has invalid charge mechanics`);
      }
    }

    for (const attack of profile.attacks) {
      if (attackIds.has(attack.attackId)) throw new Error(`Duplicate Echo attack id: ${attack.attackId}`);
      if (attack.components.length === 0) throw new Error(`${attack.attackId} has no damage components`);
      for (const component of attack.components) {
        if (!Number.isFinite(component.motionValuePerHit) || component.motionValuePerHit <= 0) {
          throw new Error(`${attack.attackId} has invalid motion value`);
        }
        if (!Number.isInteger(component.hits) || component.hits < 1) {
          throw new Error(`${attack.attackId} has invalid hit count`);
        }
      }
      attackIds.add(attack.attackId);
    }

    byEchoId.set(profile.echoId, profile);
  }

  return { byEchoId, attackIds };
}
