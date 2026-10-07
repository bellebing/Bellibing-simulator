import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function auditResourceIcons(root = 'docs/ui-prototypes/assets/resource-icons') {
  const manifest = JSON.parse(readFileSync(root + '/manifest.json', 'utf8'));
  assert.equal(manifest.sources.art.repository, 'TomyJan/WutheringWaves-UIResources');
  assert.equal(manifest.sources.art.commit, '5b3d1d128ed3938cbb8e5260ba07b075b321a7c6');
  assert.equal(manifest.sources.identity.commit, '57aff645ea532ee587d62883db306e34881f4393');
  assert.equal(manifest.sources.crossCheck.commit, 'f0166b7cff965d3e0ac12a8aac55579713ecb076');
  assert.equal(manifest.policy.transform, 'NONE_BYTE_IDENTICAL_COPY');
  const expected = [
    ['tuners', 'Premium Tuner', 36000014, 5, 'Gold', 'txq_03'],
    ['premium', 'Premium Sealed Tube', 36000004, 5, 'Gold', '13'],
    ['advanced', 'Advanced Sealed Tube', 36000003, 4, 'Purple', '12'],
    ['medium', 'Medium Sealed Tube', 36000002, 3, 'Blue', '11'],
    ['basic', 'Basic Sealed Tube', 36000001, 2, 'Green', '10'],
  ];
  assert.deepEqual(manifest.assets.map(a => a.id), expected.map(a => a[0]));
  assert.deepEqual(readdirSync(root).sort(), ['manifest.json', ...expected.map(a => a[0] + '.png')].sort());
  for (const [index, [id, name, gameId, rarity, color, texture]] of expected.entries()) {
    const asset = manifest.assets[index];
    assert.deepEqual([asset.id, asset.name, asset.gameId, asset.rarity, asset.color], [id, name, gameId, rarity, color]);
    const stem = 'T_IconA_' + texture + '_UI';
    assert.equal(asset.sourcePath, 'UIResources/Common/Image/IconA/' + stem + '.png');
    assert.equal(asset.crossCheckTexturePath, '/Game/Aki/UI/UIResources/Common/Image/IconA/' + stem + '.' + stem);
    assert.equal(asset.localPath, id + '.png');
    const bytes = readFileSync(root + '/' + asset.localPath);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), 256); assert.equal(bytes.readUInt32BE(20), 256);
    assert.equal(asset.width, 256); assert.equal(asset.height, 256); assert.equal(bytes.length, asset.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
    assert.equal(createHash('sha1').update(Buffer.from('blob ' + bytes.length + '\0')).update(bytes).digest('hex'), asset.sourceBlobSha);
  }
  return manifest;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  auditResourceIcons(); console.log('Resource icons: five pinned, byte-identical item assets verified.');
}
