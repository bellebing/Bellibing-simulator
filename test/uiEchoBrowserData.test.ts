import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_CATALOG } from '../src/data/sonatas.ts';
import { projectVerifiedEchoWorkspaceLoadoutProfiles } from '../src/echoWorkspaceRecommendationProjection.ts';
import {
  ECHO_STATS_EDITOR_LEVEL,
  ECHO_STATS_EDITOR_MAX_SUBSTATS,
  ECHO_STATS_EDITOR_RANK,
  getEchoStatsEditorSecondaryMainStat,
  listEchoStatsEditorMainStatOptions,
  listEchoStatsEditorSubstatOptions,
} from '../src/echoStatEditor.ts';

type BrowserEcho = {
  id: string;
  name: string;
  releaseStatus: string;
  cost: 1 | 3 | 4;
  sonataSetIds: string[];
};

const workspaceHtml = readFileSync(
  new URL('../docs/ui-prototypes/v34-functional.html', import.meta.url),
  'utf8',
);

const browserData = JSON.parse(
  readFileSync(new URL('../docs/ui-prototypes/assets/echoes/browser-data.json', import.meta.url), 'utf8'),
) as {
  schemaVersion: number;
  generatedFrom: string[];
  echoes: BrowserEcho[];
  loadoutProfiles: {
    profileId: string;
    characterId: string;
    slotCosts: (1 | 3 | 4)[];
    sonataSetIds: string[];
  }[];
  statEditor: {
    rank: number;
    level: number;
    maxSubstats: number;
    mainStatsByCost: Record<string, { name: string; value: number }[]>;
    secondaryMainStatsByCost: Record<string, { name: string; value: number }>;
    substats: { name: string; values: number[] }[];
  };
  sonataSets: { id: string; name: string; releaseStatus: string; artPath: string }[];
};

const manifest = JSON.parse(
  readFileSync(new URL('../docs/ui-prototypes/assets/echoes/manifest.json', import.meta.url), 'utf8'),
) as {
  icons: { echoId: string; name: string; releaseStatus: string; targetPath: string }[];
};

const builderIconManifest = JSON.parse(
  readFileSync(new URL('../docs/ui-prototypes/assets/builder-icons/manifest.json', import.meta.url), 'utf8'),
) as {
  sonataSets: { sonataId: string; sourceId: number; name: string; targetPath: string }[];
};

test('Echo browser export contains only canonical RELEASED Echoes', () => {
  const released = ECHO_CATALOG.filter((echo) => echo.releaseStatus === 'RELEASED');
  assert.equal(browserData.schemaVersion, 1);
  assert.deepEqual(
    browserData.echoes.map((echo) => echo.id),
    released.map((echo) => echo.id),
  );
  assert.ok(browserData.echoes.every((echo) => echo.releaseStatus === 'RELEASED'));
});

test('Echo browser canonical IDs match the artwork manifest and every card resolves art', () => {
  const browserIds = browserData.echoes.map((echo) => echo.id);
  const manifestIds = manifest.icons.map((icon) => icon.echoId);
  assert.deepEqual(manifestIds, browserIds);

  const artById = new Map(manifest.icons.map((icon) => [icon.echoId, icon]));
  for (const echo of browserData.echoes) {
    const art = artById.get(echo.id);
    assert.ok(art, `Missing Echo art for ${echo.id}`);
    assert.equal(art.name, echo.name, `${echo.id}: manifest name drift`);
    assert.equal(art.releaseStatus, 'RELEASED', `${echo.id}: non-released artwork leaked`);
    assert.match(art.targetPath, /^docs\/ui-prototypes\/assets\/echoes\/icons\/echo-[0-9]+\.(png|webp)$/);
  }
});

test('Echo browser Cost filters are driven by canonical ECHO_CATALOG costs', () => {
  const canonicalCostById = new Map(ECHO_CATALOG.map((echo) => [echo.id, echo.cost]));
  for (const echo of browserData.echoes) {
    assert.equal(echo.cost, canonicalCostById.get(echo.id), `${echo.id}: COST drift`);
  }

  for (const cost of [4, 3, 1] as const) {
    assert.deepEqual(
      browserData.echoes.filter((echo) => echo.cost === cost).map((echo) => echo.id),
      ECHO_CATALOG.filter((echo) => echo.releaseStatus === 'RELEASED' && echo.cost === cost).map((echo) => echo.id),
      `Cost ${cost} filter is not canonical`,
    );
  }
});

test('Echo browser Sonata names resolve from canonical released Sonata data', () => {
  const canonicalSonataById = new Map(
    SONATA_CATALOG.filter((sonata) => sonata.releaseStatus === 'RELEASED').map((sonata) => [sonata.id, sonata.name]),
  );
  const browserSonataById = new Map(browserData.sonataSets.map((sonata) => [sonata.id, sonata.name]));

  for (const echo of browserData.echoes) {
    for (const sonataId of echo.sonataSetIds) {
      assert.equal(browserSonataById.get(sonataId), canonicalSonataById.get(sonataId), `${echo.id}: unresolved ${sonataId}`);
    }
  }
});


test('Echo browser exports VERIFIED loadout recommendations without UI hardcoding', () => {
  assert.deepEqual(browserData.loadoutProfiles, projectVerifiedEchoWorkspaceLoadoutProfiles());

  const augusta = browserData.loadoutProfiles.find((profile) => profile.characterId === 'augusta');
  assert.ok(augusta);
  assert.deepEqual(augusta.slotCosts, [4, 3, 3, 1, 1]);
  assert.deepEqual(augusta.sonataSetIds, ['sonata-20', 'sonata-3']);

  assert.equal(browserData.loadoutProfiles.some((profile) => profile.characterId === 'aalto'), false);
});

test('Echo browser Sonata selector identities and art resolve from canonical catalogs/manifests', () => {
  const canonicalSonataById = new Map(
    SONATA_CATALOG.filter((sonata) => sonata.releaseStatus === 'RELEASED').map((sonata) => [sonata.id, sonata]),
  );
  const artById = new Map(builderIconManifest.sonataSets.map((sonata) => [sonata.sonataId, sonata]));

  for (const sonata of browserData.sonataSets) {
    const canonical = canonicalSonataById.get(sonata.id);
    const art = artById.get(sonata.id);
    assert.ok(canonical, `${sonata.id}: missing canonical Sonata`);
    assert.ok(art, `${sonata.id}: missing source-backed Sonata art`);
    assert.equal(sonata.name, canonical.name);
    assert.equal(art.name, canonical.name);
    assert.equal(art.sourceId, canonical.sourceId);
    assert.equal(sonata.artPath, art.targetPath);
    assert.match(sonata.artPath, /^docs\/ui-prototypes\/assets\/builder-icons\/sonata\/.*\.webp$/);
  }
});


test('Echo Workspace UI contains no hardcoded Augusta recommendation mapping', () => {
  assert.equal(workspaceHtml.includes('augusta-standard-echoes'), false);
  assert.equal(workspaceHtml.includes("['sonata-20','sonata-3']"), false);
  assert.equal(workspaceHtml.includes('[4,3,3,1,1]'), false);
});


test('Echo browser exports the source-backed Echo Stats Editor contract', () => {
  assert.equal(browserData.statEditor.rank, ECHO_STATS_EDITOR_RANK);
  assert.equal(browserData.statEditor.level, ECHO_STATS_EDITOR_LEVEL);
  assert.equal(browserData.statEditor.maxSubstats, ECHO_STATS_EDITOR_MAX_SUBSTATS);
  for (const cost of [1, 3, 4] as const) {
    assert.deepEqual(browserData.statEditor.mainStatsByCost[String(cost)], listEchoStatsEditorMainStatOptions(cost));
    assert.deepEqual(browserData.statEditor.secondaryMainStatsByCost[String(cost)], getEchoStatsEditorSecondaryMainStat(cost));
  }
  assert.deepEqual(browserData.statEditor.substats, listEchoStatsEditorSubstatOptions());
  assert.ok(browserData.generatedFrom.includes('src/echoStatEditor.ts'));
});
