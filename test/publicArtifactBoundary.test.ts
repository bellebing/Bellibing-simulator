import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { PUBLIC_BROWSER_MODULES, FORBIDDEN_PUBLIC_FIELDS, compilePublicBrowserModules } from '../scripts/public-web-boundary.mjs';
import { verifyPublicArtifact } from '../scripts/verify-public-artifact.mjs';
import { projectReleasedImprovePolicies } from '../src/improvePolicySources.ts';
import { PUBLIC_DECISION_AVAILABILITY } from '../src/publicDecisionContract.ts';

const approved = JSON.parse(readFileSync('scripts/public-web-assets.json', 'utf8'));
function artifact(check: (directory: string) => void) {
  const directory = mkdtempSync(join(tmpdir(), 'bellibing-public-boundary-'));
  try {
    for (const path of approved) {
      const target = join(directory, path); mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, path.endsWith('.json') ? '{}' : '');
    }
    compilePublicBrowserModules(join(directory, 'assets'));
    check(directory);
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

test('public build has explicit entrypoints, typechecks without whole-src emission, and a closed import graph', () => {
  const config = JSON.parse(readFileSync('tsconfig.web.json', 'utf8'));
  assert.equal(config.include, undefined);
  assert.equal(config.compilerOptions.noEmit, true);
  assert.equal(config.compilerOptions.sourceMap, false);
  assert.deepEqual(config.files, ['src/web/alpha-entry.ts', 'src/web/main.ts', 'src/web/roll-assistant.ts',
    'src/improvePolicyState.ts', 'src/improvePolicyPresentation.ts', 'src/publicSettingsView.ts']);
  artifact(directory => assert.equal(verifyPublicArtifact(directory).length, approved.length + PUBLIC_BROWSER_MODULES.length));
});

test('artifact verifier rejects accidental whole-src compilation and generated source/maps', () => {
  for (const path of ['assets/unapproved.js', 'assets/unapproved.js.map', 'assets/source.ts', 'data/extra.json']) {
    artifact(directory => {
      const target = join(directory, path); mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, '{}');
      assert.throws(() => verifyPublicArtifact(directory), /Unapproved public asset/);
    });
  }
});

test('approved JS/JSON paths cannot carry forbidden internal fields or source-map references', () => {
  for (const field of FORBIDDEN_PUBLIC_FIELDS) artifact(directory => {
    writeFileSync(join(directory, 'ui-preview/assets/improve-settings/policies.json'), JSON.stringify({ [field]: {} }));
    assert.throws(() => verifyPublicArtifact(directory), /Forbidden public field/);
  });
  artifact(directory => {
    writeFileSync(join(directory, 'assets/web/alpha-entry.js'), '//# sourceMappingURL=private.map');
    assert.throws(() => verifyPublicArtifact(directory), /source.map/i);
  });
});

test('unapproved imports, nonliteral imports, missing assets and symlinks fail closed', () => {
  for (const code of ["import '../../private.js';", "import('https://example.invalid/engine.js');", "import(location.hash);"]) {
    artifact(directory => {
      writeFileSync(join(directory, 'assets/web/alpha-entry.js'), code);
      assert.throws(() => verifyPublicArtifact(directory), /module (?:dependency|import)/);
    });
  }
  for (const src of ['https://example.invalid/runtime.js', './private.js']) artifact(directory => {
    writeFileSync(join(directory, 'index.html'), '<script src="' + src + '"></script>');
    assert.throws(() => verifyPublicArtifact(directory), /script dependency/);
  });
  artifact(directory => {
    rmSync(join(directory, 'assets/echoCoreRules.js'));
    assert.throws(() => verifyPublicArtifact(directory), /missing|Missing/);
  });
  artifact(directory => {
    const path = join(directory, 'assets/web/alpha-entry.js'); rmSync(path); symlinkSync('/etc/passwd', path);
    assert.throws(() => verifyPublicArtifact(directory), /symbolic link/i);
  });
});

test('retired decision implementation and golden fixture are absent from the current public tree', () => {
  for (const path of ['src/analysis.ts', 'src/targetCheckpointPolicy.ts', 'src/ownedBuildAnalysis.ts',
    'src/ownedBuildUpgradeAnalysis.ts', 'src/candidateViability.ts', 'src/pathComparison.ts', 'src/upgradeEconomics.ts',
    'src/characters/augustaRecommended.ts', 'src/characters/augustaEchoEvaluator.ts',
    'src/characters/ciacconaEchoEvaluator.ts', 'fixtures/v9_15/augusta-live-2026-08-21.json']) {
    assert.equal(existsSync(path), false, path);
  }
  assert.deepEqual(PUBLIC_DECISION_AVAILABILITY, { status: 'PENDING', reason: 'RUNTIME_UNAVAILABLE' });
});

test('public recommended guidance contains no executable Echo policy while source-backed targets stay available', async () => {
  const rows = await projectReleasedImprovePolicies();
  assert.equal(rows.length, 59);
  assert.equal(rows.filter(row => row.characterTarget.numericTargets.status === 'VERIFIED').length, 24);
  assert.equal(rows.filter(row => row.characterTarget.priorities.status === 'VERIFIED').length, 44);
  for (const row of rows) {
    assert.equal(row.echoPolicy.requirements.status, 'PENDING');
    assert.equal(row.echoPolicy.requirements.value, null);
    assert.equal(row.echoPolicy.preferences.status, 'PENDING');
    for (const field of FORBIDDEN_PUBLIC_FIELDS) assert.equal(JSON.stringify(row).includes(field), false, field);
  }
});

test('public settings source projection drops unapproved future fields and complete internal source objects', async () => {
  const { publicImproveSettingsSource } = await import('../src/publicImproveSettingsSource.ts');
  const source = (await projectReleasedImprovePolicies()).find(row => row.characterId === 'augusta')!;
  const input = { ...source, unapprovedFutureField: 'do-not-export' };
  const projected = publicImproveSettingsSource(input);
  assert.equal(JSON.stringify(projected).includes('unapprovedFutureField'), false);
  assert.deepEqual(Object.keys(projected.applicability!).sort(), ['characterId', 'contextBinding', 'presetId']);
  const targets = projected.characterTarget.numericTargets;
  assert.deepEqual(Object.keys(targets.source!).sort(), ['provenance', 'sourceId']);
  assert.equal(projected.echoPolicy.requirements.status, 'PENDING');
  assert.deepEqual(targets.value, source.characterTarget.numericTargets.value);
});
