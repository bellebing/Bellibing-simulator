function addCost(a, b) {
    return {
        echoes: a.echoes + b.echoes,
        tuners: a.tuners + b.tuners,
        exp: a.exp + b.exp,
        shellCredits: (a.shellCredits ?? 0) + (b.shellCredits ?? 0),
    };
}
/**
 * Character-free orchestration for Echo experimentation.
 *
 * The lab intentionally does not know whether the resulting collection is a
 * legal character loadout. Equip/loadout validation belongs to a higher layer.
 */
export class EchoLab {
    runtime;
    constructor(runtime) {
        this.runtime = runtime;
    }
    createSession(echoes = []) {
        return {
            echoes: echoes.map((echo) => ({ ...echo, substats: [...echo.substats] })),
            spent: { echoes: 0, tuners: 0, exp: 0, shellCredits: 0 },
        };
    }
    acquire(session, template, count, rng) {
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
    /**
     * Acquire any mixture of Echo templates without imposing character-loadout
     * legality. This is intentionally useful for experiments such as four
     * 4-cost Echoes or large farming batches.
     */
    acquirePlan(session, requests, rng) {
        let next = this.createSession(session.echoes);
        next.spent = { ...session.spent };
        for (const request of requests) {
            next = this.acquire(next, request.template, request.count, rng);
        }
        return next;
    }
    rollEchoTo(session, echoIndex, targetLevel, rng) {
        const source = session.echoes[echoIndex];
        if (!source)
            throw new RangeError(`Echo index ${echoIndex} is outside the lab session.`);
        if (targetLevel < source.level) {
            throw new RangeError(`Cannot roll Echo backwards from +${source.level} to +${targetLevel}.`);
        }
        let echo = { ...source, substats: [...source.substats] };
        let spent = { ...session.spent };
        while (echo.level < targetLevel) {
            const step = this.runtime.rollNext(echo, rng);
            if (!step)
                throw new RangeError(`Echo cannot roll beyond +${echo.level}.`);
            echo = step.echo;
            spent = addCost(spent, step.cost);
        }
        const echoes = session.echoes.map((item, index) => index === echoIndex ? echo : { ...item, substats: [...item.substats] });
        return { echoes, spent };
    }
    /**
     * Tune a selected batch to at least one checkpoint. Echoes already above the
     * requested checkpoint are left unchanged. Duplicate indices are rejected so
     * one UI selection cannot accidentally spend twice on the same Echo.
     */
    rollEchoesTo(session, echoIndices, targetLevel, rng) {
        const unique = new Set();
        for (const index of echoIndices) {
            if (!Number.isInteger(index))
                throw new RangeError(`Echo index must be an integer, got ${index}.`);
            if (index < 0 || index >= session.echoes.length) {
                throw new RangeError(`Echo index ${index} is outside the lab session.`);
            }
            if (unique.has(index))
                throw new RangeError(`Echo index ${index} was selected more than once.`);
            unique.add(index);
        }
        let next = this.createSession(session.echoes);
        next.spent = { ...session.spent };
        for (const index of echoIndices) {
            const echo = next.echoes[index];
            if (echo.level >= targetLevel)
                continue;
            next = this.rollEchoTo(next, index, targetLevel, rng);
        }
        return next;
    }
    rollAllTo(session, targetLevel, rng) {
        return this.rollEchoesTo(session, session.echoes.map((_, index) => index), targetLevel, rng);
    }
    discard(session, echoIndex) {
        const echo = session.echoes[echoIndex];
        if (!echo)
            throw new RangeError(`Echo index ${echoIndex} is outside the lab session.`);
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
