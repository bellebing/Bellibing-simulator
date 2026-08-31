import assert from 'node:assert/strict';
import test from 'node:test';

import { AUGUSTA_LIVE_CURRENT_ECHOES_2026_08_21 } from '../src/characters/augustaEchoEvaluator.ts';
import {
  VerifiedWuwaEchoRuntime,
  createSeededRng,
  withRank5MainStatsAtLevel,
  type Echo,
} from '../src/echoCore.ts';
import { buildOwnedBuildEchoFromCanonicalInput } from '../src/ownedBuildEchoInput.ts';
import {
  analyzeFinishedOwnedBuildCandidate,
  forecastPartialOwnedBuildCandidate,
} from '../src/ownedBuildUpgradeAnalysis.ts';
import { buildOwnedEchoFromCheckpointInput } from '../src/ownedEchoCheckpointAnalysis.ts';

function cloneEcho(echo: Echo): Echo {
  return {
    ...echo,
    mainStat: { ...echo.mainStat },
    secondaryMainStat: echo.secondaryMainStat ? { ...echo.secondaryMainStat } : undefined,
    substats: echo.substats.map((roll) => ({ ...roll })),
  };
}

function currentBuild(): Echo[] {
  return AUGUSTA_LIVE_CURRENT_ECHOES_2026_08_21.map((echo, slotIndex) => buildOwnedEchoFromCheckpointInput({
    presetId: 'augusta-standard',
    slotIndex,
    level: 25,
    substats: echo.substats.map((roll) => ({ ...roll })),
  }));
}

function ciacconaCurrentBuild(): Echo[] {
  const mainStats = ['CRIT Rate', 'Aero DMG', 'Aero DMG', 'ATK%', 'ATK%'] as const;
  const substats = [
    { name: 'CRIT Rate', value: 0.093 },
    { name: 'CRIT DMG', value: 0.21 },
    { name: 'ATK%', value: 0.116 },
    { name: 'Energy Regen', value: 0.124 },
    { name: 'Basic Attack DMG', value: 0.116 },
  ] as const;

  return mainStats.map((primaryMainStat, slotIndex) => buildOwnedBuildEchoFromCanonicalInput({
    presetId: 'ciaccona-cartethyia-aero',
    slotIndex,
    level: 25,
    primaryMainStat,
    substats: substats.map((roll) => ({ ...roll })),
  }));
}

class NoExplicitCurrentRecycleCreditRuntime extends VerifiedWuwaEchoRuntime {
  private level20StartingRefundReads = 0;

  override refundOnDiscard(current: Echo) {
    if (current.id === 'augusta-candidate-plus20-refund-check' && current.level === 20) {
      this.level20StartingRefundReads += 1;
      // The first read is forecastPath's legitimate continuation baseline.
      // Suppress only the later explicit recycle-now credit used by restart economics.
      if (this.level20StartingRefundReads === 2) {
        return { echoes: 0, tuners: 0, exp: 0, shellCredits: 0 };
      }
    }
    return super.refundOnDiscard(current);
  }
}

function assertClose(actual: number, expected: number): void {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} !== ${expected}`);
}

test('finished Augusta candidate changes only one slot and reports real whole-build DPS delta', () => {
  const currentEchoes = currentBuild();
  const incumbent = currentEchoes[0]!;
  const candidate: Echo = {
    ...cloneEcho(incumbent),
    id: 'augusta-candidate-better',
    substats: incumbent.substats.map((roll) => (
      roll.name === 'Flat DEF' ? { name: 'CRIT Rate', value: 0.105 } : { ...roll }
    )),
  };

  const result = analyzeFinishedOwnedBuildCandidate({
    presetId: 'augusta-standard',
    currentEchoes,
    slotIndex: 0,
    candidate,
  });

  assert.equal(result.currentErGate, 'PASS');
  assert.equal(result.candidateErGate, 'PASS');
  assert.equal(result.decision, 'BETTER');
  assert.equal(result.headline, 'BETTER');
  assert.ok(result.candidateDps > result.currentDps);
  assert.ok(result.absoluteDpsDelta > 0);
  assert.ok((result.percentageDpsDelta ?? 0) > 0);
});

test('finished Ciaccona candidate keeps a valid whole-build decision when optional stat-contribution probes are rejected', () => {
  const currentEchoes = ciacconaCurrentBuild();
  const candidate = cloneEcho(currentEchoes[0]!);

  const result = analyzeFinishedOwnedBuildCandidate({
    presetId: 'ciaccona-cartethyia-aero',
    currentEchoes,
    slotIndex: 0,
    candidate,
  });

  assert.equal(result.currentErGate, 'PASS');
  assert.equal(result.candidateErGate, 'PASS');
  assert.equal(result.decision, 'DO_NOT_REPLACE');
  assert.equal(result.absoluteDpsDelta, 0);
  assert.equal(result.analysis.statContributions.length, 5);
  assert.ok(result.analysis.statContributions.every((row) => row.dpsLostIfRemoved === null));
});

test('finished Augusta candidate never replaces the incumbent when the ER gate fails', () => {
  const currentEchoes = currentBuild();
  const incumbent = currentEchoes[0]!;
  const candidate: Echo = {
    ...cloneEcho(incumbent),
    id: 'augusta-candidate-er-fail',
    substats: incumbent.substats.map((roll) => (
      roll.name === 'Energy Regen' ? { name: 'Heavy Attack DMG', value: 0.116 } : { ...roll }
    )),
  };

  const result = analyzeFinishedOwnedBuildCandidate({
    presetId: 'augusta-standard',
    currentEchoes,
    slotIndex: 0,
    candidate,
  });

  assert.equal(result.currentErGate, 'PASS');
  assert.equal(result.candidateErGate, 'FAIL');
  assert.equal(result.decision, 'DO_NOT_REPLACE');
  assert.equal(result.headline, 'DO NOT REPLACE');
});

test('partial Augusta candidate forecasts legal future rolls through whole-build DPS and tracked economics', () => {
  const currentEchoes = currentBuild();
  const incumbent = currentEchoes[0]!;
  const partial = withRank5MainStatsAtLevel(
    {
      ...cloneEcho(incumbent),
      id: 'augusta-candidate-plus20',
      substats: incumbent.substats
        .filter((roll) => roll.name !== 'Flat DEF')
        .map((roll) => ({ ...roll })),
    },
    20,
  );

  const result = forecastPartialOwnedBuildCandidate({
    presetId: 'augusta-standard',
    currentEchoes,
    slotIndex: 0,
    candidate: partial,
    trials: 2000,
    runtime: new VerifiedWuwaEchoRuntime(),
    continueRng: createSeededRng('augusta-partial-continue-v1'),
    restartRng: createSeededRng('augusta-partial-restart-v1'),
  });

  assert.equal(result.candidateLevel, 20);
  assert.equal(result.nextCheckpoint, 25);
  assert.equal(result.trials, 2000);
  assert.equal(result.probabilityMandatoryGatesPass, 1);
  assert.ok(result.probabilityBeatsIncumbent > 0);
  assert.ok(result.probabilityBeatsIncumbent < 1);
  assert.ok((result.expectedDpsGainOnSuccessfulUpgrade ?? 0) > 0);
  assert.ok((result.expectedAbsoluteDpsGainOnSuccessfulUpgrade ?? 0) > 0);
  assert.deepEqual(result.expectedRemainingCost, {
    echoes: 0,
    tuners: 10,
    exp: 63500,
    shellCredits: 8350,
  });
  assert.deepEqual(result.recycleNowRefund, {
    echoes: 0,
    tuners: 12,
    exp: 59325,
    shellCredits: 0,
  });
  assert.deepEqual(result.expectedAdditionalRefundOnRejectedBranch, {
    echoes: 0,
    tuners: 3,
    exp: 47625,
    shellCredits: 0,
  });
  assert.equal(result.continueEconomics.successProbability, result.probabilityBeatsIncumbent);
  assert.ok(result.restartEconomics.successProbability > 0);
  assert.notEqual(result.pathComparison.decision, 'INSUFFICIENT_DATA');
});

test('restart economics credits the current partial Echo recycle refund exactly once', () => {
  const currentEchoes = currentBuild();
  const incumbent = currentEchoes[0]!;
  const partial = withRank5MainStatsAtLevel(
    {
      ...cloneEcho(incumbent),
      id: 'augusta-candidate-plus20-refund-check',
      substats: incumbent.substats
        .filter((roll) => roll.name !== 'Flat DEF')
        .map((roll) => ({ ...roll })),
    },
    20,
  );
  const shared = {
    presetId: 'augusta-standard',
    currentEchoes,
    slotIndex: 0,
    candidate: partial,
    trials: 1500,
  } as const;

  const withRefund = forecastPartialOwnedBuildCandidate({
    ...shared,
    runtime: new VerifiedWuwaEchoRuntime(),
    continueRng: createSeededRng('augusta-refund-continue-v1'),
    restartRng: createSeededRng('augusta-refund-restart-v1'),
  });
  const withoutCurrentRefund = forecastPartialOwnedBuildCandidate({
    ...shared,
    runtime: new NoExplicitCurrentRecycleCreditRuntime(),
    continueRng: createSeededRng('augusta-refund-continue-v1'),
    restartRng: createSeededRng('augusta-refund-restart-v1'),
  });

  const net = withRefund.restartEconomics.expectedCostToSuccess;
  const gross = withoutCurrentRefund.restartEconomics.expectedCostToSuccess;
  assert.ok(net);
  assert.ok(gross);
  assertClose(gross.echoes - net.echoes, withRefund.recycleNowRefund.echoes);
  assertClose(gross.tuners - net.tuners, withRefund.recycleNowRefund.tuners);
  assertClose(gross.exp - net.exp, withRefund.recycleNowRefund.exp);
  assertClose((gross.shellCredits ?? 0) - (net.shellCredits ?? 0), withRefund.recycleNowRefund.shellCredits);
});

test('partial candidate gate probability comes from final whole-build branches, not a universal ER rule', () => {
  const currentEchoes = currentBuild();
  const incumbent = currentEchoes[0]!;
  const partial = withRank5MainStatsAtLevel(
    {
      ...cloneEcho(incumbent),
      id: 'augusta-candidate-plus20-needs-er',
      substats: incumbent.substats
        .filter((roll) => roll.name !== 'Energy Regen')
        .map((roll) => ({ ...roll })),
    },
    20,
  );

  const result = forecastPartialOwnedBuildCandidate({
    presetId: 'augusta-standard',
    currentEchoes,
    slotIndex: 0,
    candidate: partial,
    trials: 3000,
    runtime: new VerifiedWuwaEchoRuntime(),
    continueRng: createSeededRng('augusta-partial-er-continue-v1'),
    restartRng: createSeededRng('augusta-partial-er-restart-v1'),
  });

  assert.ok(result.probabilityMandatoryGatesPass > 0);
  assert.ok(result.probabilityMandatoryGatesPass < 0.5);
  assert.ok(result.probabilityBeatsIncumbent <= result.probabilityMandatoryGatesPass);
});
