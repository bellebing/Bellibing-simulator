// Canonical domain code. Build with esbuild; this file does not own gameplay math.
export {projectStaticBuildStats} from '../../../src/buildStatProjection.mjs';
export {normalizeForteState,updateForteNode,forteStats,forteNodeActive} from '../../../src/characterForteUi.mjs';
export {activeSequenceBuildStats} from '../../../src/characterSequenceBuildStats.mjs';
export {assertEchoStatsEditorSelection} from '../../../src/echoStatEditor.ts';
export {emptyAccount,validateAccount,exportAccount,safeDocument} from '../../../src/inventoryAccount.mjs';
export {WEAPON_EFFECT_CATALOG} from '../../../src/data/weaponEffectCatalog.ts';
export {createAugustaPilotExampleBuilds} from '../../../src/data/augustaPilotExampleBuilds.ts';

export {SUBSTAT_VALUE_TABLE, SUBSTAT_VALUE_PROBABILITIES} from '../../../src/echoCoreRules.ts';
export {CHARACTER_SIGNATURE_ASSOCIATIONS} from '../../../src/data/characterEquipmentAssociations.ts';

