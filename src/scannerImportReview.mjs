// Scanner review is data-only; keep literal source observations and all issues.
export function scannerIssueLabel(path){
 const match=/^echoes\.(\d+)\.(.+)$/.exec(path??'');
 if(!match)return path||'Unknown field';
 const field=match[2].replace(/^substats\.(\d+)$/,(_,n)=>'Substat '+(Number(n)+1));
 const named={mainStat:'Main Stat',secondaryMainStat:'Secondary Main Stat',echoId:'Echo identity',sonataId:'Sonata'};
 return 'Echo '+(Number(match[1])+1)+' · '+(named[field]??field);
}
export function formatScannerIssues(issues){
 if(!Array.isArray(issues))return 'Scanner validation did not return issues. Nothing has been saved.';
 return issues.map(issue=>scannerIssueLabel(issue.path)+': '+(issue.message??'Review required.')).join('; ');
}
