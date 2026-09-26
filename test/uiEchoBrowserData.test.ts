import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_CATALOG } from '../src/data/sonatas.ts';

type BrowserEcho = {
  id: string;
  name: string;
  releaseStatus: string;
  cost: 1 | 3 | 4;
  sonataSetIds: string[];
};

const browserData = JSON.parse(
  readFileSync(new URL('../docs/ui-prototypes/assets/echoes/browser-data.json', import.meta.url), 'utf8'),
) as {
  schemaVersion: number;
  generatedFrom: string[];
  echoes: BrowserEcho[];
  sonataSets: { id: string; name: string; releaseStatus: string }[];
};

const manifest = JSON.parse(
  readFileSync(new URL('../docs/ui-prototypes/assets/echoes/manifest.json', import.meta.url), 'utf8'),
) as {
  icons: { echoId: string; name: string; releaseStatus: string; targetPath: string }[];
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
