import { ECHO_LOADOUT_PROFILES } from './data/echoLoadoutProfiles.ts';
import { SONATA_CATALOG } from './data/sonatas.ts';
import type { EchoCost } from './echoCoreDomain.ts';

export interface EchoWorkspaceLoadoutRecommendation {
  readonly profileId: string;
  readonly characterId: string;
  readonly slotCosts: readonly EchoCost[];
  readonly sonataSetIds: readonly string[];
}

export function projectVerifiedEchoWorkspaceLoadoutProfiles(): readonly EchoWorkspaceLoadoutRecommendation[] {
  const canonicalReleasedSonataIds = new Set<string>(
    SONATA_CATALOG
      .filter((sonata) => sonata.releaseStatus === 'RELEASED')
      .map((sonata) => sonata.id),
  );
  const seenCharacters = new Set<string>();

  return ECHO_LOADOUT_PROFILES
    .filter((profile) => profile.verificationStatus === 'VERIFIED')
    .map((profile) => {
      if (seenCharacters.has(profile.characterId)) {
        throw new Error(`Multiple VERIFIED Echo loadout profiles exist for ${profile.characterId}; Workspace recommendation is ambiguous.`);
      }
      seenCharacters.add(profile.characterId);

      if (profile.slots.length !== 5) {
        throw new Error(`${profile.id}: Workspace recommendation requires exactly five Echo slots.`);
      }

      const slotCosts = profile.slots.map((slot) => slot.cost);
      if (slotCosts.some((cost) => cost !== 1 && cost !== 3 && cost !== 4)) {
        throw new Error(`${profile.id}: unsupported Echo COST in verified loadout profile.`);
      }

      for (const sonataSetId of profile.sonataSetIds) {
        if (!canonicalReleasedSonataIds.has(sonataSetId)) {
          throw new Error(`${profile.id}: unresolved or unreleased Sonata recommendation ${sonataSetId}.`);
        }
      }

      return {
        profileId: profile.id,
        characterId: profile.characterId,
        slotCosts: [...slotCosts],
        sonataSetIds: [...profile.sonataSetIds],
      };
    });
}

export function findVerifiedEchoWorkspaceLoadoutProfile(
  characterId: string | null | undefined,
): EchoWorkspaceLoadoutRecommendation | null {
  if (!characterId) return null;
  return projectVerifiedEchoWorkspaceLoadoutProfiles().find((profile) => profile.characterId === characterId) ?? null;
}
