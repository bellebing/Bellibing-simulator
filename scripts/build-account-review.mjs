import {build} from 'esbuild';
import {mkdirSync} from 'node:fs';
mkdirSync('artifacts/account-review',{recursive:true});
await build({entryPoints:['docs/ui-lab/inventory/account-review.js'],bundle:true,platform:'browser',format:'esm',target:'es2022',minify:true,sourcemap:false,outfile:'artifacts/account-review/account-review.js'});
console.log('Local emulator-only account review built; no production activation.');
