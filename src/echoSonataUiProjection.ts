import { SONATA_CATALOG } from './data/sonatas.ts';
import { SONATA_EFFECT_MODELS } from './data/sonataEffects.ts';
import { SONATA_EFFECT_SOURCE_REVIEWS } from './data/sonataEffectSourceReview.ts';
import type { SonataEffectModel, SonataEffectSourceReviewStatus } from './sonataEffectDomain.ts';

export interface SonataUiSection {
  pieces: number;
  reviewStatus: SonataEffectSourceReviewStatus;
  description: string;
}

export interface SonataUiSet {
  id: string;
  name: string;
  iconIdentity: string;
  activationPieces: number[];
  sections: SonataUiSection[];
  fullDescription: string;
}

export interface CommittedSonataGroup {
  sonataSetId: string;
  count: number;
  thresholds: { pieces: number; count: number; reached: boolean }[];
}

const pendingText = 'Effect pending source verification.';

function percentage(value: number): string {
  return `${Number((value * 100).toFixed(3))}%`;
}

function describeEffect(effect: SonataEffectModel): string {
  const amount = effect.valueMode === 'PER_INPUT_POINT'
    ? `${percentage(effect.value)} per input percentage point`
    : `${percentage(effect.value)}${effect.valueMode === 'PER_STACK' ? ' per stack' : ''}`;
  const parts = [`${effect.statOrEffect} +${amount}`];
  if (effect.maxStacks !== undefined) parts.push(`up to ${effect.maxStacks} stacks`);
  if (effect.capValue !== undefined) parts.push(`capped at +${percentage(effect.capValue)}`);
  if (effect.effectType !== 'PERMANENT') parts.push(`Trigger: ${effect.trigger}`);
  if (effect.durationSeconds !== null) parts.push(`Duration: ${effect.durationSeconds}s`);
  if (effect.stackIntervalSeconds !== undefined) parts.push(`Trigger interval: ${effect.stackIntervalSeconds}s`);
  if (effect.appliesTo !== 'SELF') parts.push(`Applies to: ${effect.appliesTo.toLowerCase().replaceAll('_', ' ')}`);
  return `${parts.join('; ')}.`;
}

/** A display-only projection of reviewed facts; raw placeholder text never reaches the UI. */
export function projectSonataUiCatalog(): SonataUiSet[] {
  return SONATA_CATALOG.filter(set => set.releaseStatus === 'RELEASED').map(set => {
    const sections = [...set.activationPieces].sort((a, b) => a - b).map(pieces => {
      const review = SONATA_EFFECT_SOURCE_REVIEWS.find(row => row.sonataSetId === set.id && row.pieces === pieces);
      if (!review) throw new Error(`Missing Sonata source review: ${set.id}/${pieces}`);
      const effects = SONATA_EFFECT_MODELS.filter(row => row.sonataSetId === set.id && row.pieces === pieces);
      if (effects.length !== review.expectedModeledEffectCount) throw new Error(`Sonata model count mismatch: ${set.id}/${pieces}`);
      const description = review.status === 'SOURCE_CONFLICT'
        ? pendingText
        : [effects.map(describeEffect).join(' '), review.status === 'MODELED' ? '' : 'Additional effect pending combat adapter.'].filter(Boolean).join(' ');
      return { pieces, reviewStatus: review.status, description };
    });
    return {
      id: set.id,
      name: set.name,
      iconIdentity: set.id,
      activationPieces: [...set.activationPieces],
      sections,
      fullDescription: sections.map(section => `${section.pieces}-PC — ${section.description}`).join('\n'),
    };
  });
}

/** Only owned, equipped card assignments count. Identity compatibility is never consulted. */
export function projectCommittedSonataGroups(
  slots: readonly (null | { selectedSonataSetId?: string | null })[],
  catalog: readonly Pick<SonataUiSet, 'id' | 'name' | 'activationPieces'>[],
): CommittedSonataGroup[] {
  const counts = new Map<string, number>();
  for (const slot of slots) {
    if (slot?.selectedSonataSetId) counts.set(slot.selectedSonataSetId, (counts.get(slot.selectedSonataSetId) ?? 0) + 1);
  }
  return catalog.filter(set => counts.has(set.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'en') || a.id.localeCompare(b.id, 'en'))
    .map(set => {
      const count = counts.get(set.id)!;
      return {
        sonataSetId: set.id,
        count,
        thresholds: [...set.activationPieces].sort((a, b) => a - b).map(pieces => ({
          pieces, count: Math.min(count, pieces), reached: count >= pieces,
        })),
      };
    });
}
