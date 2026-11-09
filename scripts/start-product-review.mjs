import {existsSync} from 'node:fs';
const args=process.argv.slice(2);
for(let i=0;i<args.length;i+=2){
 if(!args[i+1])throw Error('Use --port NUMBER and optionally --engine-directory PATH');
 if(args[i]==='--port')process.env.IMPORT_PORT=args[i+1];
 else if(args[i]==='--engine-directory')process.env.BELLIBING_LOCAL_ENGINE=args[i+1];
 else throw Error('Unknown preview option.');
}
if(!existsSync('dist/product-ui/build.js'))throw Error('Run npm run build first.');
if(!existsSync('artifacts/browser-scanner/client.mjs'))throw Error('Prepare the local browser OCR using scripts/prepare-browser-scanner.py first.');
process.env.IMPORT_SCANNER='browser';
await import('./start-character-import.mjs');
