import { mkdir, rename, writeFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { serializeCharacterDatabase } from '../src/characterDatabase.ts';

const args = process.argv.slice(2);
if (args.length !== 0 && (args.length !== 2 || args[0] !== '--output' || !args[1] || args[1].startsWith('--'))) {
  throw new Error('Usage: npm run export:characters -- [--output path/to/character-database.json]');
}
const output = resolve(args[1] ?? 'data/generated/character-database.json');
// Validate and serialize before touching the last successful output.
const content = serializeCharacterDatabase();
await mkdir(dirname(output), { recursive: true });
const temporary = `${output}.${process.pid}.tmp`;
try {
  await writeFile(temporary, content, { encoding: 'utf8', flag: 'wx' });
  await rename(temporary, output);
} finally {
  await rm(temporary, { force: true });
}
console.log(`Exported canonical Character database: ${output}`);
