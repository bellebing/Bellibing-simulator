import { CHARACTER_CATALOG } from './data/characters.ts';
import type { CharacterRecommendationMetric } from './characterRecommendationDomain.ts';
import type { DprExtraction, NativeCell } from './dprCharacterStatExtraction.ts';
import { DPR_SPREADSHEET_ID, DPR_SPREADSHEET_TITLE, dprSemanticBinding, mapDprCharacterTab, typeDprStatLabel } from './dprCharacterStatExtraction.ts';
import { improvePolicySourceBinding } from './improvePolicySources.ts';
import type { NativeDprGrid } from './dprNativeSourceCapture.ts';

export const DPR_LEGACY_NORMALIZATION_VERSION = 'DPR_NATIVE_SEMANTIC_V2';
export interface LegacyNativeSourceCell { readonly row: number; readonly column: number; readonly data: NativeCell }
export interface LegacyNativeSnapshot {
  readonly spreadsheetId: string; readonly spreadsheetTitle: string; readonly extractionDate: string;
  readonly scanMethod: 'NATIVE_SHEETS_FULL_GRID';
  readonly inventory: readonly { readonly sheetId: number; readonly sheetTitle: string; readonly hidden: boolean }[];
  readonly sheets: readonly { readonly sheetId: number; readonly sheetTitle: string; readonly hidden: boolean;
    readonly scanRange: string; readonly cells: readonly LegacyNativeSourceCell[] }[];
}
export type DprTabCoverageStatus = 'MODERN_EXPLICIT_STAT_REFERENCES' | 'LEGACY_EXPLICIT_STAT_REFERENCES'
  | 'NO_CHARACTER_STAT_REFERENCES' | 'AMBIGUOUS_REVIEW_REQUIRED' | 'EMPTY/WIP';
export interface DprCharacterTabCoverage {
  readonly sheetId: number; readonly sheetTitle: string; readonly characterId: string; readonly variantKey: string;
  readonly hidden: boolean;
  readonly modernGeneralAvailable: boolean; readonly modernCalcAvailable: boolean;
  readonly modernNumericRows: number; readonly modernPendingRows: number;
  readonly legacyAvailable: boolean; readonly legacyScenarios: number; readonly legacyNumericRows: number;
  readonly metrics: readonly CharacterRecommendationMetric[]; readonly status: DprTabCoverageStatus; readonly reason: string;
  readonly inspectedRange: string;
  readonly excludedTables: readonly { readonly headerCell: string; readonly sourceRange: string;
    readonly category: 'SUBSTAT_VALUE' | 'DAMAGE_OR_COMPARISON' | 'TEAM_OR_RDPR';
    readonly label: string; readonly formula: string | null }[];
}
export interface DprLegacyStatRow {
  readonly spreadsheetId: string; readonly spreadsheetTitle: string; readonly sheetId: number; readonly sheetTitle: string;
  readonly characterId: string; readonly variantKey: string; readonly scenarioKey: string;
  readonly sectionRole: 'CALC_SCENARIO_REFERENCE'; readonly scenarioLabel: string; readonly scenarioContext: string;
  readonly sectionCell: string; readonly contextCell: string; readonly setupCell: string; readonly valueCell: string;
  readonly sourceRange: string; readonly originalStatLabel: string; readonly metric: CharacterRecommendationMetric;
  readonly originalValueText: string | null; readonly tokenIndex: number; readonly sourceToken: string | null;
  readonly effectiveValue: NativeCell['effectiveValue'] | null; readonly rawValue: NativeCell['userEnteredValue'] | null;
  readonly formattedValue: string | null; readonly formula: string | null;
  readonly setupProvenance: NativeCell; readonly headerProvenance: NativeCell; readonly contextProvenance: NativeCell;
  readonly normalizedNumericValue: number | null; readonly unit: 'RATIO';
  readonly sourceNotes: readonly { readonly cell: string; readonly data: NativeCell }[];
  readonly sourceOrigins: readonly { readonly cell: string; readonly data: NativeCell }[];
  readonly contextMarkers: readonly string[]; readonly extractionStatus: 'MAPPED_NUMERIC' | 'UNAVAILABLE';
}
export interface DprLegacyExtraction {
  readonly spreadsheetId: string; readonly spreadsheetTitle: string; readonly extractionDate: string;
  readonly normalizationVersion: 'DPR_NATIVE_SEMANTIC_V2'; readonly sourceClass: 'USER_APPROVED_PROJECT_SOURCE';
  readonly modernSource: { readonly normalizationVersion: string; readonly semanticSha256: string; readonly artifact: string };
  readonly rows: readonly DprLegacyStatRow[]; readonly coverage: readonly DprCharacterTabCoverage[];
  readonly issues: readonly { readonly sheetId: number; readonly sheetTitle: string; readonly sourceRange: string;
    readonly reason: string; readonly evidence: readonly { readonly cell: string; readonly data: NativeCell }[] }[];
  readonly counts: { readonly characterTabCount: number; readonly modernProfileCount: number;
    readonly modernVerifiedRows: number; readonly modernPendingRows: number;
    readonly legacyProfileCount: number; readonly legacyScenarioCount: number; readonly legacyVerifiedRows: number;
    readonly legacyPendingRows: number; readonly ambiguousSheetCount: number; readonly ambiguousLayoutCount: number;
    readonly charactersWithUsableReferences: readonly string[]; readonly charactersWithoutUsableReferences: readonly string[] };
  readonly semanticSha256: string;
}
export function dprCellA1(row: number,column: number) {
  let letters=''; for(let n=column+1;n>0;n=Math.floor((n-1)/26)) letters=String.fromCharCode(65+(n-1)%26)+letters;
  return letters+(row+1);
}
/** Adapter for fresh full-grid CellData reads of the metadata-enumerated legacy
 * tabs. The extractor separately checks that every required tab was captured.
 */
export function captureDprLegacyNativeSource(grid:NativeDprGrid,metadata:NativeDprGrid,extractionDate:string):LegacyNativeSnapshot {
  if(grid.spreadsheetId!==metadata.spreadsheetId || grid.properties.title!==metadata.properties.title)
    throw new Error('Native metadata/CellData identity mismatch.');
  return {spreadsheetId:metadata.spreadsheetId,spreadsheetTitle:metadata.properties.title,extractionDate,
    scanMethod:'NATIVE_SHEETS_FULL_GRID',
    inventory:metadata.sheets.map(s=>({sheetId:s.properties.sheetId,sheetTitle:s.properties.title,hidden:s.properties.hidden??false})),
    sheets:grid.sheets.map(s=>{
      const cells:LegacyNativeSourceCell[]=[];
      for(const block of s.data??[])for(const [ri,row] of (block.rowData??[]).entries())
        for(const [ci,data] of (row.values??[]).entries())if(Object.keys(data).length)
          cells.push({row:ri+(block.startRow??0),column:ci+(block.startColumn??0),data});
      const p=s.properties;
      return {sheetId:p.sheetId,sheetTitle:p.title,hidden:p.hidden??false,
        scanRange:'A1:'+dprCellA1(p.gridProperties.rowCount-1,p.gridProperties.columnCount-1),cells};
    })};
}
function text(c: NativeCell | undefined) { return c?.effectiveValue?.stringValue ?? c?.formattedValue ?? ''; }
/** Preserve original token, including the source's trailing decimal point. */
export function parseLegacyRatioToken(token: string): number | null {
  const match=/^\s*(\d+(?:\.\d*)?)\s*%\s*$/.exec(token);
  const value=match ? Number(match[1])/100 : NaN;
  return Number.isFinite(value) ? value : null;
}
export async function dprLegacySemanticBinding(extraction: Omit<DprLegacyExtraction,'semanticSha256'> | DprLegacyExtraction) {
  const { extractionDate:_date,semanticSha256:_digest,...semantic }=extraction as DprLegacyExtraction;
  return improvePolicySourceBinding(semantic);
}

/** Discovers source layouts, never stats inferred from damage or sensitivity.
 * V1 modern extraction is pinned transitively and is neither regenerated nor reinterpreted.
 */
export async function extractDprLegacyStatReferences(snapshot: LegacyNativeSnapshot, modern: DprExtraction): Promise<DprLegacyExtraction> {
  if(snapshot.spreadsheetId!==DPR_SPREADSHEET_ID || snapshot.spreadsheetTitle!==DPR_SPREADSHEET_TITLE
    || snapshot.scanMethod!=='NATIVE_SHEETS_FULL_GRID' || await dprSemanticBinding(modern)!==modern.semanticSha256
    || new Set(snapshot.inventory.map(s=>s.sheetId)).size!==snapshot.inventory.length
    || new Set(snapshot.sheets.map(s=>s.sheetId)).size!==snapshot.sheets.length)
    throw new Error('Invalid native inventory, source identity or modern semantic pin.');
  const modernInventory=modern.sheetInventory.map(s=>[s.sheetId,s.sheetTitle]).sort((a,b)=>Number(a[0])-Number(b[0]));
  const inventory=snapshot.inventory.map(s=>[s.sheetId,s.sheetTitle]).sort((a,b)=>Number(a[0])-Number(b[0]));
  if(JSON.stringify(inventory)!==JSON.stringify(modernInventory)) throw new Error('Native inventory drift; refresh full discovery.');
  const rows: DprLegacyStatRow[]=[];
  const coverage: DprCharacterTabCoverage[]=[];
  const issues: DprLegacyExtraction['issues'][number][]=[];
  const expectedLegacy=new Set(snapshot.inventory.filter(s=>mapDprCharacterTab(s.sheetTitle)
    && !modern.sheetInventory.find(m=>m.sheetId===s.sheetId)!.sectionHeaders.length).map(s=>s.sheetId));
  if(snapshot.sheets.length!==expectedLegacy.size || snapshot.sheets.some(s=>!expectedLegacy.has(s.sheetId)))
    throw new Error('Missing or unexpected full-grid Character tab capture.');
  for(const tab of [...snapshot.inventory].sort((a,b)=>a.sheetId-b.sheetId)) {
    const identity=mapDprCharacterTab(tab.sheetTitle); if(!identity) continue;
    const modernRows=modern.rows.filter(r=>r.sheetId===tab.sheetId);
    const modernHeaders=modern.sheetInventory.find(s=>s.sheetId===tab.sheetId)!.sectionHeaders;
    if(modernHeaders.length) {
      coverage.push({...tab,...identity,modernGeneralAvailable:modernRows.some(r=>r.sectionRole==='GENERAL_RECOMMENDATION'),
        modernCalcAvailable:modernRows.some(r=>r.sectionRole==='CALC_BENCHMARK'),
        modernNumericRows:modernRows.filter(r=>r.extractionStatus==='MAPPED_NUMERIC').length,
        modernPendingRows:modernRows.filter(r=>r.extractionStatus==='UNAVAILABLE').length,
        legacyAvailable:false,legacyScenarios:0,legacyNumericRows:0,metrics:[...new Set(modernRows.map(r=>r.metric))].sort(),
        status:'MODERN_EXPLICIT_STAT_REFERENCES',reason:modernRows.some(r=>r.extractionStatus==='MAPPED_NUMERIC')
          ? 'Accepted V1 modern General/Calc references; legacy pass not required.'
          : 'Modern stat labels available, but all numeric source values are blank/PENDING.',
        inspectedRange:'ACCEPTED_V1_FULL_GRID',excludedTables:[]});
      continue;
    }
    const captured=snapshot.sheets.find(s=>s.sheetId===tab.sheetId)!;
    const source={...captured,cells:[...captured.cells].sort((a,b)=>a.row-b.row||a.column-b.column)};
    if(source.sheetTitle!==tab.sheetTitle || !/^A1:[A-Z]+\d+$/.test(source.scanRange))
      throw new Error('Native full-grid source mismatch.');
    const cells=new Map(source.cells.map(c=>[c.row+','+c.column,c.data]));
    const get=(r:number,c:number)=>cells.get(r+','+c);
    const here=(r:number,c:number)=>({cell:dprCellA1(r,c),data:get(r,c)??{}});
    const excludedTables: DprCharacterTabCoverage['excludedTables'][number][]=[];
    const excludedCells=new Set<string>();
    // Reject these complete labelled table columns before any stat discovery.
    for(const c of source.cells) if(text(c.data).trim()==='Substat' && text(get(c.row,c.column+1)).trim()==='Substat Value') {
      let end=c.row+1;
      while(get(end,c.column) && text(get(end,c.column)).trim()) {excludedCells.add(end+','+c.column);excludedCells.add(end+','+(c.column+1));end++;}
      excludedCells.add(c.row+','+c.column);excludedCells.add(c.row+','+(c.column+1));
      excludedTables.push({headerCell:dprCellA1(c.row,c.column),sourceRange:dprCellA1(c.row,c.column)+':'+dprCellA1(end-1,c.column+1),
        category:'SUBSTAT_VALUE',label:'Substat / Substat Value',formula:c.data.userEnteredValue?.formulaValue??null});
    }
    for(const c of source.cells) {
      const label=text(c.data);
      if(/Team damage|rDPR|Team damage contribution/i.test(label)) excludedTables.push({headerCell:dprCellA1(c.row,c.column),
        sourceRange:dprCellA1(c.row,c.column),category:'TEAM_OR_RDPR',label,formula:c.data.userEnteredValue?.formulaValue??null});
      else if(/Comparison|Personal damage|^Total Damage$|^DMG$/i.test(label)) excludedTables.push({headerCell:dprCellA1(c.row,c.column),
        sourceRange:dprCellA1(c.row,c.column),category:'DAMAGE_OR_COMPARISON',label,formula:c.data.userEnteredValue?.formulaValue??null});
    }
    const sourceOrigins=source.cells.filter(c=>c.data.userEnteredValue?.formulaValue).map(c=>here(c.row,c.column));
    const sourceNotes=source.cells.filter(c=>c.column===0 && /^(\*|\d+x Forte assumes)/.test(text(c.data))).map(c=>here(c.row,c.column));
    const localRows: DprLegacyStatRow[]=[];
    const localIssues: DprLegacyExtraction['issues'][number][]=[];
    const handledCells=new Set<string>();
    const labelAliases=[tab.sheetTitle.replace(/\s*\(.*\)\s*$/,'').trim().toLowerCase(),
      CHARACTER_CATALOG.find(c=>c.id===identity.characterId)!.name.toLowerCase()];
    for(const header of source.cells.filter(c=>/^ER\s*\/\s*CR\s*\/\s*CD$/.test(text(c.data).trim()))) {
      if(excludedCells.has(header.row+','+header.column)) continue;
      const c=header.column,r=header.row;
      const context=text(get(r-1,c-1)), headerCell=dprCellA1(r,c);
      if(text(get(r,c-1)).trim()!=='Name' || !labelAliases.some(n=>context.toLowerCase().includes(n))) {
        localIssues.push({sheetId:tab.sheetId,sheetTitle:tab.sheetTitle,sourceRange:headerCell,
          reason:'Explicit stat tuple lacks a deterministic named Character/setup table context.',evidence:[here(r,c),here(r-1,c-1)]});
        continue;
      }
      handledCells.add(r+','+c);
      for(let row=r+1;text(get(row,c-1)).trim();row++) {
        const setup=text(get(row,c-1)),cell=get(row,c)??{}, valueText=text(cell)||null;
        if(/^(\*|\d+x Forte assumes)/.test(setup) || setup.trim()==='Name') break;
        handledCells.add(row+','+c);
        const tokens=valueText?.split('|')??[null,null,null];
        const metrics=['TOTAL_ENERGY_REGEN','TOTAL_CRIT_RATE','TOTAL_CRIT_DAMAGE'] as const;
        const parsed=tokens.map(t=>t===null||!t.trim()?null:parseLegacyRatioToken(t));
        if(tokens.length!==3 || tokens.some((t,i)=>t!==null && !!t.trim() && parsed[i]===null)) {
          localIssues.push({sheetId:tab.sheetId,sheetTitle:tab.sheetTitle,sourceRange:dprCellA1(row,c-1)+':'+dprCellA1(row,c),
            reason:'Unsupported or ambiguous ER / CR / CD source tuple; no numeric inference.',evidence:[here(row,c-1),here(row,c)]});
          continue;
        }
        const scenarioKey=identity.characterId+':'+identity.variantKey+':'+headerCell+':'+dprCellA1(row,c-1);
        for(const [index,metric] of metrics.entries()) localRows.push({spreadsheetId:snapshot.spreadsheetId,
          spreadsheetTitle:snapshot.spreadsheetTitle,sheetId:tab.sheetId,sheetTitle:tab.sheetTitle,...identity,
          scenarioKey,sectionRole:'CALC_SCENARIO_REFERENCE',scenarioLabel:setup,scenarioContext:context,sectionCell:headerCell,
          contextCell:dprCellA1(r-1,c-1),setupCell:dprCellA1(row,c-1),valueCell:dprCellA1(row,c),
          sourceRange:dprCellA1(row,c-1)+':'+dprCellA1(row,c),originalStatLabel:['ER','CR','CD'][index]!,
          metric,originalValueText:valueText,tokenIndex:index,sourceToken:tokens[index]??null,
          effectiveValue:cell.effectiveValue??null,rawValue:cell.userEnteredValue??null,formattedValue:cell.formattedValue??null,
          formula:cell.userEnteredValue?.formulaValue??null,setupProvenance:get(row,c-1)??{},headerProvenance:header.data,
          contextProvenance:get(r-1,c-1)??{},normalizedNumericValue:parsed[index]??null,unit:'RATIO',sourceNotes,sourceOrigins,
          contextMarkers:tab.sheetTitle.includes('WIP')?['WIP',...(tab.sheetTitle.includes('EN TL')?['EN_TL']:[])]:[],
          extractionStatus:parsed[index]===null?'UNAVAILABLE':'MAPPED_NUMERIC'});
      }
    }
    // Clear labels outside accepted/rejected structures are candidates, not facts.
    // ATK%/Flat ATK/DMG% are not total ATK or a typed damage-bonus class.
    const candidates=source.cells.filter(c=>!excludedCells.has(c.row+','+c.column)
      && !handledCells.has(c.row+','+c.column) && (typeDprStatLabel(text(c.data)).metric
        || /^(CR|CD|ATK%|Flat ATK|DMG%)$/.test(text(c.data).trim())));
    if(candidates.length) localIssues.push({sheetId:tab.sheetId,sheetTitle:tab.sheetTitle,
      sourceRange:candidates.map(c=>dprCellA1(c.row,c.column)).join(','),
      reason:'Labelled stat components/inputs lack a reviewed Character build/scenario association or typed total-stat meaning; no promotion.',
      evidence:candidates.flatMap(c=>[here(c.row,c.column),here(c.row-1,c.column),here(c.row+1,c.column)])});
    // A sheet-local ambiguity blocks that sheet, while independent profiles survive.
    const status: DprTabCoverageStatus=localIssues.length?'AMBIGUOUS_REVIEW_REQUIRED'
      :localRows.length?'LEGACY_EXPLICIT_STAT_REFERENCES':source.cells.length?'NO_CHARACTER_STAT_REFERENCES':'EMPTY/WIP';
    if(!localIssues.length) rows.push(...localRows);
    issues.push(...localIssues);
    const retained=localIssues.length?[]:localRows;
    coverage.push({...tab,...identity,modernGeneralAvailable:false,modernCalcAvailable:false,modernNumericRows:0,modernPendingRows:0,
      legacyAvailable:retained.length>0,legacyScenarios:new Set(retained.map(r=>r.scenarioKey)).size,
      legacyNumericRows:retained.filter(r=>r.extractionStatus==='MAPPED_NUMERIC').length,
      metrics:[...new Set(retained.map(r=>r.metric))].sort(),status,inspectedRange:source.scanRange,excludedTables,
      reason:localIssues.length?localIssues.map(i=>i.reason).join(' '):localRows.length
        ? 'Explicit ER / CR / CD setup assumptions, isolated by table context and source row; partial reference coverage only.'
        :source.cells.length?'No usable explicit Character stat assumptions in the full grid; damage/comparison/team/rotation and marginal Substat Value data are excluded.'
        :'Empty native Character source grid; no inferred values.'});
  }
  const usable=[...new Set([...modern.rows.filter(r=>r.extractionStatus==='MAPPED_NUMERIC'),...rows.filter(r=>r.extractionStatus==='MAPPED_NUMERIC')].map(r=>r.characterId))].sort();
  const payload: Omit<DprLegacyExtraction,'semanticSha256'>={spreadsheetId:snapshot.spreadsheetId,spreadsheetTitle:snapshot.spreadsheetTitle,
    extractionDate:snapshot.extractionDate,normalizationVersion:DPR_LEGACY_NORMALIZATION_VERSION,sourceClass:'USER_APPROVED_PROJECT_SOURCE',
    modernSource:{normalizationVersion:modern.normalizationVersion,semanticSha256:modern.semanticSha256,
      artifact:'data/research/dpr-calc-character-stat-references-2026-10-03.json'},rows,coverage,issues,
    counts:{characterTabCount:coverage.length,modernProfileCount:modern.counts.characterVariantCount,
      modernVerifiedRows:modern.counts.mappedNumericRows,modernPendingRows:modern.counts.unavailableRows,
      legacyProfileCount:new Set(rows.map(r=>r.characterId+':'+r.variantKey)).size,legacyScenarioCount:new Set(rows.map(r=>r.scenarioKey)).size,
      legacyVerifiedRows:rows.filter(r=>r.extractionStatus==='MAPPED_NUMERIC').length,legacyPendingRows:rows.filter(r=>r.extractionStatus==='UNAVAILABLE').length,
      ambiguousSheetCount:new Set(issues.map(i=>i.sheetId)).size,ambiguousLayoutCount:issues.length,
      charactersWithUsableReferences:usable,charactersWithoutUsableReferences:[...new Set(coverage.map(s=>s.characterId))].filter(c=>!usable.includes(c)).sort()}};
  return {...payload,semanticSha256:await dprLegacySemanticBinding(payload)};
}
