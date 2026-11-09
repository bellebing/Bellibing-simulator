import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sha=value=>createHash('sha256').update(value).digest('hex');
const ledger=JSON.parse(readFileSync('docs/recovery/source-files.json','utf8'));
let checked=0;
for(const row of ledger){
 const frozen=row.source==='361'||row.source==='360'&&row.path.startsWith('docs/ui-lab/scanner-poc/')||row.source==='main'&&['docs/ui-lab/v1.1/modules/dps-concept.js','docs/ui-lab/v1.1/sandbox.css'].includes(row.path);
 if(!frozen)continue;
 if(!existsSync(row.path)||sha(readFileSync(row.path))!==row.sha256)throw Error('Preservation drift: '+row.path);
 checked++;
}
const html=readFileSync('docs/ui-lab/v1.1/index.html','utf8');
// Retain the historical composition pin and the owner-accepted shared gallery
// extraction used by Product B. Arbitrary workspace changes still fail closed.
const approvedTemplates=new Set(['be31068e548fff1d3ae04e9463236ddbf5054e805d806cddb973d29b4f77b253','1459813d6623b108a358dd743a290317a229d0b1b980b706084704023defe838']);
if(!approvedTemplates.has(sha(html.replace('<link rel="stylesheet" href="observed-improve.css">',''))))throw Error('Shared workspace template differs from the preserved or accepted Product B baseline');
if(html.includes('inventory-concept/'))throw Error('Concept route in production workspace');
if(!html.includes('id="currentCard"')||!html.includes('id="newCard"')||!html.includes('id="slots"'))throw Error('Shared workspace composition missing');
if(readFileSync('docs/ui-lab/v1.1/modules/echo-advisor.js','utf8').includes("document.querySelector('.working-area').before(opportunities)"))throw Error('Rejected analysis section mounted');
if(readFileSync('docs/ui-lab/inventory/teams.js','utf8').includes('createHeroTeamConcept'))throw Error('Demo team store in production');
console.log(`Recovery preservation: ${checked} frozen source files byte-identical; shared Current/Candidate/slots retained; no concept team store or rejected analysis mount.`);
