export interface DefenseContext {
  attackerLevel: number;
  enemyDefense: number;
  defIgnore?: number;
  defReduction?: number;
}

export function expectedCritMultiplier(critRate: number, critDamage: number): number {
  return 1 + Math.min(Math.max(critRate, 0), 1) * (critDamage - 1);
}

export function defenseMultiplier({
  attackerLevel,
  enemyDefense,
  defIgnore = 0,
  defReduction = 0,
}: DefenseContext): number {
  const attackerDefenseTerm = 800 + 8 * attackerLevel;
  return (
    attackerDefenseTerm /
    (attackerDefenseTerm + enemyDefense * (1 - defIgnore) * (1 - defReduction))
  );
}

export function resistanceMultiplier(resistance: number, resistanceReduction = 0): number {
  const effective = resistance - resistanceReduction;
  if (effective < 0) return 1 - effective / 2;
  if (effective < 0.8) return 1 - effective;
  return 1 / (1 + 5 * effective);
}

export interface ExpectedDamageInput {
  scalingStat: number;
  motionValue: number;
  damageBonus: number;
  amplification: number;
  critRate: number;
  critDamage: number;
  defenseMultiplier: number;
  resistanceMultiplier: number;
  damageReduction?: number;
}

export function expectedDamage(input: ExpectedDamageInput): number {
  return (
    input.scalingStat *
    input.motionValue *
    (1 + input.damageBonus) *
    (1 + input.amplification) *
    expectedCritMultiplier(input.critRate, input.critDamage) *
    input.defenseMultiplier *
    input.resistanceMultiplier *
    (1 - (input.damageReduction ?? 0))
  );
}
