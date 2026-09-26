import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';

const defaultOutput = 'docs/ui-prototypes/assets/weapons/browser-data.json';
const check = process.argv.includes('--check');
const outputArg = process.argv.indexOf('--output');
const output = resolve(outputArg >= 0 ? process.argv[outputArg + 1] : defaultOutput);

const payload = {
  schemaVersion: 1,
  generatedFrom: [
    'src/data/weapons.ts#WEAPON_CATALOG',
    'src/data/characters.ts#CHARACTER_CATALOG',
  ],
  weapons: WEAPON_CATALOG
    .filter((weapon) => weapon.releaseStatus === 'RELEASED')
    .map((weapon) => ({
      id: weapon.id,
      name: weapon.name,
      releaseStatus: weapon.releaseStatus,
      weaponType: weapon.weaponType,
      rarity: weapon.rarity,
      level90BaseAtk: weapon.level90BaseAtk,
      secondary: weapon.secondary,
    })),
  characters: CHARACTER_CATALOG
    .filter((character) => character.releaseStatus === 'RELEASED' && character.weaponType)
    .map((character) => ({
      id: character.id,
      name: character.name,
      releaseStatus: character.releaseStatus,
      weaponType: character.weaponType,
    })),
};

const serialized = `${JSON.stringify(payload, null, 2)}\n`;

if (check) {
  const existing = readFileSync(output, 'utf8');
  if (existing !== serialized) {
    console.error(`Canonical Weapon browser data is stale: ${output}`);
    console.error('Run: node --experimental-strip-types scripts/export-ui-weapon-browser-data.ts');
    process.exit(1);
  }
  console.log(`Canonical Weapon browser data verified: ${payload.weapons.length} released Weapons / ${payload.characters.length} released Characters.`);
} else {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, serialized);
  console.log(`Exported canonical Weapon browser data: ${output}`);
}
