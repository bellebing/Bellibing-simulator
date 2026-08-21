import type {
  Echo,
  EchoLevel,
  EchoRollRuntime,
  RandomSource,
  ResourceCost,
} from './echoCoreDomain.ts';

export interface EchoLabSession {
  echoes: Echo[];
  spent: ResourceCost;
}

function addCost(a: ResourceCost, b: ResourceCost): ResourceCost {
  return {
    echoes: a.echoes + b.echoes,
    tuners: a.tuners + b.tuners,
    exp: a.exp + b.exp,
  };
}

/**
 * Character-free orchestration for Echo experimentation.
 *
 * The lab intentionally does not know whether the resulting collection is a
 * legal character loadout. Equip/loadout validation belongs to a higher layer.
 */
export class EchoLab {
  private readonly runtime: EchoRollRuntime;

  constructor(runtime: EchoRollRuntime) {
    this.runtime = runtime;
  }

  createSession(echoes: readonly Echo[] = []): EchoLabSession {
    return {
      echoes: echoes.map((echo) => ({ ...echo, substats: [...echo.substats] })),
      spent: { echoes: 0, tuners: 0, exp: 0 },
    };
  }

  acquire(session: EchoLabSession, template: Echo, count: number, rng: RandomSource): EchoLabSession {
    if (!Number.isInteger(count) || count < 0) {
      throw new RangeError(`Echo acquire count must be a non-negative integer, got ${count}.`);
    }

    const next = this.createSession(session.echoes);
    next.spent = { ...session.spent };

    for (let i = 0; i < count; i += 1) {
      const step = this.runtime.acquireFresh(template, rng);
      next.echoes.push({ ...step.echo, id: `${step.echo.id}:${session.echoes.length + i}` });
      next.spent = addCost(next.spent, step.cost);
    }

    return next;
  }

  rollEchoTo(
    session: EchoLabSession,
    echoIndex: number,
    targetLevel: EchoLevel,
    rng: RandomSource,
  ): EchoLabSession {
    const source = session.echoes[echoIndex];
    if (!source) throw new RangeError(`Echo index ${echoIndex} is outside the lab session.`);
    if (targetLevel < source.level) {
      throw new RangeError(`Cannot roll Echo backwards from +${source.level} to +${targetLevel}.`);
    }

    let echo = { ...source, substats: [...source.substats] };
    let spent = { ...session.spent };

    while (echo.level < targetLevel) {
      const step = this.runtime.rollNext(echo, rng);
      if (!step) throw new RangeError(`Echo cannot roll beyond +${echo.level}.`);
      echo = step.echo;
      spent = addCost(spent, step.cost);
    }

    const echoes = session.echoes.map((item, index) =>
      index === echoIndex ? echo : { ...item, substats: [...item.substats] },
    );

    return { echoes, spent };
  }

  discard(session: EchoLabSession, echoIndex: number): {
    session: EchoLabSession;
    recovered: ResourceCost;
  } {
    const echo = session.echoes[echoIndex];
    if (!echo) throw new RangeError(`Echo index ${echoIndex} is outside the lab session.`);

    const recovered = this.runtime.refundOnDiscard(echo);
    return {
      session: {
        echoes: session.echoes
          .filter((_, index) => index !== echoIndex)
          .map((item) => ({ ...item, substats: [...item.substats] })),
        spent: { ...session.spent },
      },
      recovered,
    };
  }
}
