import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import ts from 'typescript';

export const PUBLIC_BROWSER_MODULES = Object.freeze([
  'echoCore', 'echoCoreRules', 'echoMainStats', 'echoCoreLab', 'echoCoreRuntime', 'seededRng',
  'data/echoTubeSource', 'resourceInventory', 'echoSimulatorSession', 'echoSimulatorBoundary', 'improvePolicyState', 'improvePolicyPresentation', 'publicDecisionContract', 'publicSettingsView',
  'web/alpha-entry', 'web/main', 'web/roll-assistant',
]);
export const FORBIDDEN_PUBLIC_FIELDS = Object.freeze([
  'checkpointReference', 'acceptanceConstraints', 'nonTargetRoles', 'maximumDeadStats',
  'requiredCoreHits', 'requiredUsefulHits', 'minimumHits', 'firstCheckLevel', 'effectivePolicy',
  'AUGUSTA_RECOMMENDED_V915', 'Strategy Cache',
]);

export function compilePublicBrowserModules(directory) {
  for (const name of PUBLIC_BROWSER_MODULES) {
    const path = `src/${name}.ts`;
    const compiled = ts.transpileModule(readFileSync(path, 'utf8'), {
      fileName: path, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022,
        verbatimModuleSyntax: true, rewriteRelativeImportExtensions: true, sourceMap: false },
    });
    const output = join(directory, name + '.js');
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, compiled.outputText);
  }
}
