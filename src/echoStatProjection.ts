import { primaryMainStatValueAtLevel, secondaryMainStatValueAtLevel, type Echo, type StatRoll } from './echoCore.ts';
import { assertExactOwnedEchoRoll } from './ownedEchoCheckpointAnalysis.ts';

const CHECKPOINTS = [0, 5, 10, 15, 20, 25] as const;
const exact = (a: number, b: number) => Number.isFinite(a) && Math.abs(a - b) <= 1e-12;

/** Exact, fully tuned Rank5 cards only. No Echo active/passive, set or team effect. */
export function projectRank5EchoStats(echoes: readonly Echo[]) {
  if (!Array.isArray(echoes) || echoes.length !== 5) throw new Error('Require exactly five Echo stat cards');
  const ids = new Set<string>();
  const totals: Record<string, number> = {};
  const cards = echoes.map((echo: Echo) => {
    if (!echo || typeof echo.id !== 'string' || !echo.id.trim() || ids.has(echo.id)
      || echo.rank !== 5 || !CHECKPOINTS.includes(echo.level) || ![1, 3, 4].includes(echo.cost)) {
      throw new Error('Require unique Echo IDs, Rank5 and exact supported checkpoints');
    }
    ids.add(echo.id);
    const primary = primaryMainStatValueAtLevel(echo.cost, echo.mainStat?.name, echo.level);
    if (primary === null || !echo.mainStat || !exact(echo.mainStat.value, primary)) {
      throw new Error('Require exact canonical Echo primary main stat');
    }
    const secondary = { name: echo.cost === 1 ? 'Flat HP' : 'Flat ATK',
      value: secondaryMainStatValueAtLevel(echo.cost, echo.level) };
    if (echo.secondaryMainStat && (echo.secondaryMainStat.name !== secondary.name
      || !exact(echo.secondaryMainStat.value, secondary.value))) {
      throw new Error('Supplied secondary main stat must match the automatic canonical value');
    }
    if (!Array.isArray(echo.substats) || echo.substats.length !== echo.level / 5) {
      throw new Error('Require every known tuned substat at the selected checkpoint');
    }
    const names = new Set<string>();
    const substats = echo.substats.map((roll: StatRoll) => {
      if (!roll || names.has(roll.name)) throw new Error('Duplicate or missing Echo substat');
      assertExactOwnedEchoRoll(roll);
      names.add(roll.name);
      return { name: roll.name, value: roll.value };
    }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    const mainStat = { name: echo.mainStat.name, value: primary };
    for (const roll of [mainStat, secondary, ...substats]) totals[roll.name] = (totals[roll.name] ?? 0) + roll.value;
    return { id: echo.id, cost: echo.cost, rank: 5 as const, level: echo.level,
      mainStat, secondaryMainStat: secondary, substats };
  });
  // A deterministic equality token, not a signature or evidence in itself.
  // Slot/card identity and every numeric card input bind the supplied combat proof.
  return { scope: 'ECHO_STAT_CARDS_ONLY' as const, key: JSON.stringify(cards), cards, totals,
    includesEchoOrSonataEffects: false as const, authorizesDamage: false as const };
}
