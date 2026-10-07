import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { auditResourceIcons } from '../scripts/audit-ui-resource-icons.mjs';
import { ECHO_TUBES } from '../src/resourceInventory.ts';

test('item artwork agrees with reviewed Tube denomination facts', () => {
  const manifest = auditResourceIcons();
  for (const tube of ECHO_TUBES) {
    const icon = manifest.assets.find(a => a.id === tube.id)!;
    assert.deepEqual([icon.name, icon.rarity, icon.color], [tube.name, tube.rarity, tube.color]);
  }
});

test('resource audit rejects mismatched identity and altered artwork', () => {
  const root = mkdtempSync(join(tmpdir(), 'resource-icons-'));
  try {
    cpSync('docs/ui-prototypes/assets/resource-icons', root, { recursive: true });
    const path = root + '/manifest.json', original = readFileSync(path, 'utf8');
    const manifest = JSON.parse(original); manifest.assets[1].name = 'Basic Sealed Tube';
    writeFileSync(path, JSON.stringify(manifest)); assert.throws(() => auditResourceIcons(root));
    writeFileSync(path, original);
    const bytes = readFileSync(root + '/premium.png'); bytes[bytes.length - 1] ^= 1;
    writeFileSync(root + '/premium.png', bytes); assert.throws(() => auditResourceIcons(root));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
