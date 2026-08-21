import type { EchoAnalysis, StatName } from './domain.ts';

export interface CandidateExplanation {
  headline: string;
  bullets: string[];
  hiddenValueStats: Array<{
    stat: StatName;
    dpsContributionPct: number;
  }>;
}

function pct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

/**
 * Turns exact evaluator deltas into user-facing reasons.
 * `publishedRecommendedStats` is presentation context only; it never changes the verdict.
 */
export function explainEchoAnalysis(
  analysis: EchoAnalysis,
  publishedRecommendedStats: ReadonlySet<StatName> = new Set(),
): CandidateExplanation {
  const known = analysis.statContributions
    .filter((x) => x.dpsLostIfRemovedPct !== null)
    .map((x) => ({
      stat: x.stat.name,
      dpsContributionPct: x.dpsLostIfRemovedPct!,
    }))
    .sort((a, b) => b.dpsContributionPct - a.dpsContributionPct);

  const hiddenValueStats = known.filter(
    (x) => x.dpsContributionPct > 0 && !publishedRecommendedStats.has(x.stat),
  );

  const bullets = [...analysis.reasons];
  if (analysis.dpsDeltaPct !== null) {
    bullets.push(`Whole-build Personal Rotation DPS change: ${pct(analysis.dpsDeltaPct)}.`);
  }

  for (const item of hiddenValueStats) {
    bullets.push(
      `${item.stat} is not in the supplied published-stat list, but removing this roll lowers candidate DPS by ${pct(item.dpsContributionPct)}.`,
    );
  }

  const headline =
    analysis.verdict === 'UPGRADE'
      ? 'UPGRADE'
      : analysis.verdict === 'INVALID_ER'
        ? 'STOP — ER GATE FAILS'
        : analysis.verdict === 'PENDING_MODEL'
          ? 'PENDING — MODEL INCOMPLETE'
          : 'NO UPGRADE';

  return { headline, bullets, hiddenValueStats };
}
